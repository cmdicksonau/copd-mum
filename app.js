import {
  decryptJsonWithPassphrase,
  decryptStringWithPassphrase,
  encryptJsonWithPassphrase,
  encryptStringWithPassphrase,
} from "./crypto.js";
import { GistSyncProvider } from "./sync.js";

const STORAGE_KEY = "copdTrackerState";
const STORE_NAME = "app";
const DB_NAME = "copdSymptomTracker";
const DB_VERSION = 1;
const STATE_ID = "state";
const TOKEN_STORAGE_KEY = "copdTrackerTokenEnvelope";
const CONFLICT_WINDOW_MS = 5 * 60 * 1000;
const SCHEMA_VERSION = 1;

let chart;
let unlockedPassphrase = null;
const syncProvider = new GistSyncProvider();
let state = createInitialState();

const refs = {
  form: document.getElementById("entry-form"),
  date: document.getElementById("entry-date"),
  cough: document.getElementById("symptom-cough"),
  wheezing: document.getElementById("symptom-wheezing"),
  dyspnea: document.getElementById("symptom-dyspnea"),
  infection: document.getElementById("symptom-infection"),
  relieverUses: document.getElementById("reliever-uses"),
  notes: document.getElementById("entry-notes"),
  tableBody: document.getElementById("history-table-body"),
  filter14: document.getElementById("filter-14"),
  filterAll: document.getElementById("filter-all"),
  exportCsv: document.getElementById("export-csv"),
  printPdf: document.getElementById("print-pdf"),
  printDateRange: document.getElementById("print-date-range"),
  passphrase: document.getElementById("passphrase"),
  unlockBtn: document.getElementById("unlock-btn"),
  lockBtn: document.getElementById("lock-btn"),
  gistToken: document.getElementById("gist-token"),
  rememberToken: document.getElementById("remember-token"),
  gistId: document.getElementById("gist-id"),
  gistFilename: document.getElementById("gist-filename"),
  autosync: document.getElementById("autosync"),
  pullBtn: document.getElementById("pull-btn"),
  pushBtn: document.getElementById("push-btn"),
  syncStatus: document.getElementById("sync-status"),
  conflictsPanel: document.getElementById("conflicts-panel"),
  conflictsList: document.getElementById("conflicts-list"),
  toast: document.getElementById("toast"),
  chartCanvas: document.getElementById("reliever-chart"),
};

const storage = createStorage();

init().catch(() => {
  showStatus("Failed to initialize app state.", true);
});

async function init() {
  const loaded = await storage.load();
  if (loaded) {
    state = normalizeState(loaded);
  }

  refs.date.value = toDateInputValue(new Date());
  refs.gistId.value = state.sync.gistId || "";
  refs.gistFilename.value = state.sync.filename || "copd-symptom-tracker.json.enc";
  refs.autosync.checked = Boolean(state.sync.autosync);
  refs.rememberToken.checked = Boolean(state.sync.rememberToken);

  bindEvents();
  updateSyncProviderConfig();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      showToast("Offline support could not be enabled.");
    });
  }
}

function bindEvents() {
  refs.form.addEventListener("submit", onSaveEntry);
  refs.filter14.addEventListener("click", () => setFilter("14"));
  refs.filterAll.addEventListener("click", () => setFilter("all"));
  refs.exportCsv.addEventListener("click", onExportCsv);
  refs.printPdf.addEventListener("click", () => window.print());
  refs.unlockBtn.addEventListener("click", onUnlock);
  refs.lockBtn.addEventListener("click", onLock);
  refs.pushBtn.addEventListener("click", () => doSyncPush(true));
  refs.pullBtn.addEventListener("click", doSyncPull);
  refs.autosync.addEventListener("change", async (event) => {
    state.sync.autosync = event.target.checked;
    await persistState();
  });
  refs.rememberToken.addEventListener("change", async (event) => {
    state.sync.rememberToken = event.target.checked;
    await persistState();
  });
  refs.gistId.addEventListener("change", async () => {
    state.sync.gistId = refs.gistId.value.trim();
    await persistState();
    updateSyncProviderConfig();
  });
  refs.gistFilename.addEventListener("change", async () => {
    state.sync.filename = refs.gistFilename.value.trim() || "copd-symptom-tracker.json.enc";
    refs.gistFilename.value = state.sync.filename;
    await persistState();
    updateSyncProviderConfig();
  });

  refs.conflictsList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-conflict-date]");
    if (!button) {
      return;
    }
    const date = button.dataset.conflictDate;
    const choice = button.dataset.choice;
    await resolveConflict(date, choice);
  });
}

async function onSaveEntry(event) {
  event.preventDefault();
  const date = refs.date.value;

  if (!date) {
    showStatus("Date is required.", true);
    return;
  }

  const relieverUses = Number.parseInt(refs.relieverUses.value, 10);
  if (Number.isNaN(relieverUses) || relieverUses < 0) {
    showStatus("Reliever inhaler uses must be a non-negative whole number.", true);
    return;
  }

  const existing = state.entries[date];
  if (existing && !window.confirm(`An entry for ${date} already exists. Overwrite it?`)) {
    showStatus("Entry not overwritten.", false);
    return;
  }

  const now = new Date().toISOString();
  const nextEntry = {
    date,
    symptoms: {
      cough: refs.cough.checked,
      wheezing: refs.wheezing.checked,
      dyspnea: refs.dyspnea.checked,
      infection: refs.infection.checked,
    },
    relieverUses,
    notes: refs.notes.value.trim(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  state.entries[date] = nextEntry;
  await persistState();
  render();
  showStatus(`Saved entry for ${date}.`);

  if (state.sync.autosync) {
    await doSyncPush(false);
  }
}

function setFilter(filter) {
  state.ui.filter = filter;
  void persistState();
  render();
}

function filteredEntries() {
  const entries = Object.values(state.entries).sort((a, b) => b.date.localeCompare(a.date));
  if (state.ui.filter === "all") {
    return entries;
  }

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 13);
  const minValue = toDateInputValue(minDate);

  return entries.filter((entry) => entry.date >= minValue);
}

function render() {
  const entries = filteredEntries();
  renderHistoryTable(entries);
  renderChart(entries);
  renderFilterButtons();
  renderDateRange(entries);
  renderConflicts();
  renderSyncStatus();
}

function renderFilterButtons() {
  const isAll = state.ui.filter === "all";
  refs.filter14.disabled = !isAll;
  refs.filterAll.disabled = isAll;
}

function renderDateRange(entries) {
  if (!entries.length) {
    refs.printDateRange.textContent = "Date range: No entries";
    return;
  }

  const dates = entries.map((entry) => entry.date).sort();
  refs.printDateRange.textContent = `Date range: ${dates[0]} to ${dates[dates.length - 1]}`;
}

function renderHistoryTable(entries) {
  refs.tableBody.textContent = "";
  if (!entries.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No entries available for selected range.";
    row.appendChild(cell);
    refs.tableBody.appendChild(row);
    return;
  }

  for (const entry of entries) {
    const row = document.createElement("tr");
    row.appendChild(td(entry.date));
    row.appendChild(td(entry.symptoms.cough ? "Yes" : "No"));
    row.appendChild(td(entry.symptoms.wheezing ? "Yes" : "No"));
    row.appendChild(td(entry.symptoms.dyspnea ? "Yes" : "No"));
    row.appendChild(td(entry.symptoms.infection ? "Yes" : "No"));
    row.appendChild(td(String(entry.relieverUses)));
    row.appendChild(noteCell(entry.notes));
    refs.tableBody.appendChild(row);
  }
}

function renderChart(entries) {
  if (typeof Chart === "undefined") {
    return;
  }

  const chartEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const labels = chartEntries.map((entry) => entry.date);
  const values = chartEntries.map((entry) => entry.relieverUses);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(refs.chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Reliever inhaler uses",
          data: values,
          borderColor: "#0f62fe",
          backgroundColor: "rgba(15,98,254,0.2)",
          fill: true,
          tension: 0.25,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

function onExportCsv() {
  const rows = filteredEntries();
  const header = [
    "Date",
    "Persistent cough",
    "Wheezing",
    "Difficulty breathing",
    "Respiratory infection",
    "Reliever inhaler uses",
    "Notes",
  ];

  const csvRows = [
    header,
    ...rows.map((entry) => [
      entry.date,
      entry.symptoms.cough ? "Yes" : "No",
      entry.symptoms.wheezing ? "Yes" : "No",
      entry.symptoms.dyspnea ? "Yes" : "No",
      entry.symptoms.infection ? "Yes" : "No",
      entry.relieverUses,
      entry.notes,
    ]),
  ];

  const csv = csvRows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `copd-symptom-tracker-${state.ui.filter === "all" ? "all-time" : "last-14-days"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showStatus("CSV exported.");
}

async function onUnlock() {
  const passphrase = refs.passphrase.value;
  if (!passphrase) {
    showStatus("Passphrase is required to unlock sync.", true);
    return;
  }

  unlockedPassphrase = passphrase;

  if (!refs.gistToken.value && state.sync.rememberToken) {
    const tokenEnvelope = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (tokenEnvelope) {
      try {
        refs.gistToken.value = await decryptStringWithPassphrase(tokenEnvelope, unlockedPassphrase);
      } catch {
        showStatus("Saved token could not be decrypted. Check your passphrase.", true);
      }
    }
  }

  showStatus("Unlocked. Sync actions are available.");
  renderSyncStatus();
}

function onLock() {
  unlockedPassphrase = null;
  refs.passphrase.value = "";
  refs.gistToken.value = "";
  showStatus("Locked. Sync disabled.");
  renderSyncStatus();
}

function updateSyncProviderConfig() {
  syncProvider.configure({
    token: refs.gistToken.value.trim(),
    gistId: refs.gistId.value.trim(),
    filename: refs.gistFilename.value.trim() || "copd-symptom-tracker.json.enc",
  });
}

async function doSyncPush(manual) {
  if (!unlockedPassphrase) {
    if (manual) {
      showStatus("Unlock first to push encrypted data.", true);
    }
    return;
  }

  updateSyncProviderConfig();

  if (!syncProvider.config.token) {
    if (manual) {
      showStatus("GitHub token is required.", true);
    }
    return;
  }

  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      entries: state.entries,
      metadata: {
        schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        deviceId: state.metadata.deviceId,
      },
    };

    const envelope = await encryptJsonWithPassphrase(payload, unlockedPassphrase, {
      updatedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    });

    const result = await syncProvider.push(JSON.stringify(envelope));
    state.sync.gistId = result.gistId;
    state.metadata.lastSyncAt = new Date().toISOString();
    state.metadata.lastPulledRevision = result.revision;
    refs.gistId.value = result.gistId;

    if (state.sync.rememberToken) {
      const tokenEnvelope = await encryptStringWithPassphrase(syncProvider.config.token, unlockedPassphrase, {
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenEnvelope));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    await persistState();
    renderSyncStatus();
    showStatus("Encrypted sync push completed.");
  } catch (error) {
    showStatus(`Push failed: ${error.message}`, true);
  }
}

async function doSyncPull() {
  if (!unlockedPassphrase) {
    showStatus("Unlock first to pull encrypted data.", true);
    return;
  }

  updateSyncProviderConfig();

  try {
    const pulled = await syncProvider.pull();
    const remotePayload = await decryptJsonWithPassphrase(pulled.encryptedEnvelopeString, unlockedPassphrase);
    const mergeResult = mergeEntries(state.entries, remotePayload.entries || {});

    state.entries = mergeResult.entries;
    state.conflicts = [...state.conflicts, ...mergeResult.conflicts];
    state.metadata.lastPulledRevision = pulled.revision;
    state.metadata.lastSyncAt = new Date().toISOString();

    await persistState();
    render();
    showStatus("Encrypted sync pull and merge completed.");
  } catch (error) {
    showStatus(`Pull failed: ${error.message}`, true);
  }
}

function mergeEntries(localEntries, remoteEntries) {
  const merged = { ...localEntries };
  const conflicts = [];

  for (const [date, remote] of Object.entries(remoteEntries)) {
    const local = merged[date];
    if (!local) {
      merged[date] = remote;
      continue;
    }

    const localTime = Date.parse(local.updatedAt || local.createdAt || "");
    const remoteTime = Date.parse(remote.updatedAt || remote.createdAt || "");
    const bothValid = Number.isFinite(localTime) && Number.isFinite(remoteTime);
    const differ = JSON.stringify(stripMeta(local)) !== JSON.stringify(stripMeta(remote));

    let resolvedTo = "remote";
    if (!bothValid || localTime > remoteTime) {
      resolvedTo = "local";
    }

    const winner = resolvedTo === "local" ? local : remote;
    merged[date] = winner;

    if (bothValid && Math.abs(localTime - remoteTime) <= CONFLICT_WINDOW_MS && differ) {
      conflicts.push({
        date,
        localVersion: local,
        remoteVersion: remote,
        resolvedTo,
        resolvedAt: new Date().toISOString(),
      });
    }
  }

  return { entries: merged, conflicts };
}

async function resolveConflict(date, choice) {
  const index = state.conflicts.findIndex((conflict) => conflict.date === date);
  if (index < 0) {
    return;
  }

  const conflict = state.conflicts[index];
  if (choice === "local") {
    state.entries[date] = conflict.localVersion;
  } else {
    state.entries[date] = conflict.remoteVersion;
  }

  state.conflicts[index] = {
    ...conflict,
    resolvedTo: choice,
    resolvedAt: new Date().toISOString(),
  };

  await persistState();
  render();
  showStatus(`Conflict for ${date} resolved to ${choice}.`);
}

function renderConflicts() {
  refs.conflictsList.textContent = "";
  if (!state.conflicts.length) {
    refs.conflictsPanel.hidden = true;
    return;
  }

  refs.conflictsPanel.hidden = false;

  for (const conflict of state.conflicts) {
    const item = document.createElement("li");
    item.className = "conflict-item";
    item.textContent = `${conflict.date} resolved to ${conflict.resolvedTo} (${new Date(conflict.resolvedAt).toLocaleString()}) `;

    const localBtn = document.createElement("button");
    localBtn.type = "button";
    localBtn.className = "btn secondary";
    localBtn.dataset.conflictDate = conflict.date;
    localBtn.dataset.choice = "local";
    localBtn.textContent = "Use local";

    const remoteBtn = document.createElement("button");
    remoteBtn.type = "button";
    remoteBtn.className = "btn secondary";
    remoteBtn.dataset.conflictDate = conflict.date;
    remoteBtn.dataset.choice = "remote";
    remoteBtn.textContent = "Use remote";

    item.append(" ", localBtn, " ", remoteBtn);
    refs.conflictsList.appendChild(item);
  }
}

function renderSyncStatus() {
  const lockStatus = unlockedPassphrase ? "Unlocked" : "Locked";
  const gistId = state.sync.gistId || refs.gistId.value.trim() || "(not set)";
  const lastSync = state.metadata.lastSyncAt ? new Date(state.metadata.lastSyncAt).toLocaleString() : "never";

  refs.syncStatus.textContent = `${lockStatus}. Gist: ${gistId}. Last sync: ${lastSync}.`;
  refs.pullBtn.disabled = !unlockedPassphrase;
  refs.pushBtn.disabled = !unlockedPassphrase;
}

async function persistState() {
  state.sync.gistId = refs.gistId.value.trim() || state.sync.gistId;
  state.sync.filename = refs.gistFilename.value.trim() || "copd-symptom-tracker.json.enc";
  await storage.save(state);
}

function createStorage() {
  if (!window.indexedDB) {
    return localStorageAdapter();
  }

  return {
    async load() {
      try {
        const db = await openDb();
        return await withStore(db, "readonly", (store) => requestToPromise(store.get(STATE_ID)));
      } catch {
        return localStorageAdapter().load();
      }
    },
    async save(value) {
      try {
        const db = await openDb();
        await withStore(db, "readwrite", (store) => requestToPromise(store.put({ id: STATE_ID, ...value })));
      } catch {
        await localStorageAdapter().save(value);
      }
    },
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(db, mode, task) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const resultPromise = Promise.resolve(task(store));
    tx.oncomplete = async () => {
      try {
        resolve(await resultPromise);
      } catch (error) {
        reject(error);
      }
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function localStorageAdapter() {
  return {
    async load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    async save(value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
  };
}

function createInitialState() {
  return {
    id: STATE_ID,
    schemaVersion: SCHEMA_VERSION,
    metadata: {
      schemaVersion: SCHEMA_VERSION,
      lastSyncAt: null,
      lastPulledRevision: null,
      deviceId: crypto.randomUUID(),
    },
    entries: {},
    conflicts: [],
    sync: {
      gistId: "",
      filename: "copd-symptom-tracker.json.enc",
      autosync: false,
      rememberToken: false,
    },
    ui: {
      filter: "14",
    },
  };
}

function normalizeState(loaded) {
  const baseline = createInitialState();
  const merged = {
    ...baseline,
    ...loaded,
    metadata: {
      ...baseline.metadata,
      ...(loaded.metadata || {}),
    },
    sync: {
      ...baseline.sync,
      ...(loaded.sync || {}),
    },
    ui: {
      ...baseline.ui,
      ...(loaded.ui || {}),
    },
    entries: loaded.entries || {},
    conflicts: loaded.conflicts || [],
  };

  if (!merged.metadata.deviceId) {
    merged.metadata.deviceId = crypto.randomUUID();
  }

  return merged;
}

function td(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function noteCell(note) {
  const cell = document.createElement("td");
  cell.className = "details-note";
  if (!note) {
    cell.textContent = "-";
    return cell;
  }

  if (note.length <= 80) {
    cell.textContent = note;
    return cell;
  }

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `${note.slice(0, 80)}… View complete note`;
  summary.setAttribute("aria-label", "View complete note (truncated)");
  const full = document.createElement("div");
  full.textContent = note;

  details.append(summary, full);
  cell.appendChild(details);
  return cell;
}

function stripMeta(entry) {
  return {
    date: entry.date,
    symptoms: entry.symptoms,
    relieverUses: entry.relieverUses,
    notes: entry.notes,
  };
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showStatus(message, isError = false) {
  refs.syncStatus.textContent = message;
  showToast(message, isError);
}

let toastTimer;
function showToast(message, isError = false) {
  refs.toast.textContent = message;
  refs.toast.style.background = isError ? "#7b1f19" : "#132235";
  refs.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    refs.toast.classList.remove("show");
  }, 2600);
}
