export class GistSyncProvider {
  constructor() {
    this.config = {
      token: "",
      gistId: "",
      filename: "copd-symptom-tracker.json.enc",
    };
    this.lastError = "";
    this.lastRevision = null;
  }

  configure({ token, gistId, filename }) {
    this.config.token = token || "";
    this.config.gistId = gistId || "";
    this.config.filename = filename || "copd-symptom-tracker.json.enc";
  }

  status() {
    return {
      lastError: this.lastError,
      gistId: this.config.gistId,
      lastRevision: this.lastRevision,
    };
  }

  async push(encryptedEnvelopeString) {
    this.lastError = "";
    if (!this.config.token) {
      throw new Error("A GitHub token is required.");
    }

    const payload = {
      files: {
        [this.config.filename]: {
          content: encryptedEnvelopeString,
        },
      },
    };

    const response = await fetch(
      this.config.gistId ? `https://api.github.com/gists/${this.config.gistId}` : "https://api.github.com/gists",
      {
        method: this.config.gistId ? "PATCH" : "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.config.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          this.config.gistId
            ? payload
            : {
                ...payload,
                public: false,
                description: "Encrypted COPD Symptom Tracker Sync",
              }
        ),
      }
    );

    if (!response.ok) {
      this.lastError = await safeApiError(response);
      throw new Error(this.lastError);
    }

    const gist = await response.json();
    this.config.gistId = gist.id;
    this.lastRevision = gist.history?.[0]?.version || null;

    return {
      gistId: gist.id,
      revision: this.lastRevision,
    };
  }

  async pull() {
    this.lastError = "";
    if (!this.config.token) {
      throw new Error("A GitHub token is required.");
    }
    if (!this.config.gistId) {
      throw new Error("A Gist ID is required to pull data.");
    }

    const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      this.lastError = await safeApiError(response);
      throw new Error(this.lastError);
    }

    const gist = await response.json();
    const file = gist.files?.[this.config.filename];

    if (!file) {
      throw new Error(`File not found in gist: ${this.config.filename}`);
    }

    this.lastRevision = gist.history?.[0]?.version || null;

    if (file.truncated && file.raw_url) {
      const rawResponse = await fetch(file.raw_url, {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
      });

      if (!rawResponse.ok) {
        this.lastError = `Failed to read raw gist file (${rawResponse.status})`;
        throw new Error(this.lastError);
      }

      return {
        encryptedEnvelopeString: await rawResponse.text(),
        revision: this.lastRevision,
      };
    }

    return {
      encryptedEnvelopeString: file.content,
      revision: this.lastRevision,
    };
  }
}

async function safeApiError(response) {
  try {
    const data = await response.json();
    return data.message || `GitHub API error (${response.status})`;
  } catch {
    return `GitHub API error (${response.status})`;
  }
}
