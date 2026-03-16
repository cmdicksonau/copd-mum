# COPD Symptom Tracker

A static, local-first COPD Symptom Tracker for GitHub Pages with encrypted cross-device sync through GitHub Gists.

## Features

- Daily symptom tracking for a 2-week healthcare appointment workflow
- Required symptom checkboxes:
  1. Persistent cough
  2. Wheezing (abnormal high or low pitched sounds when breathing)
  3. Difficulty breathing during normal daily activity
  4. Respiratory infection (including increased phlegm / mucus)
- Notes/reflection area for day-to-day impact and questions
- Local-first persistence (IndexedDB with localStorage fallback)
- End-to-end encrypted sync payloads via GitHub Gists only
- Chart.js analytics for reliever inhaler use trends
- Historical table, 14-day/all-time filtering, CSV export, print/PDF formatting
- Conflict detection + manual local/remote resolution

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/root`
4. Save and wait for Pages deployment.

## GitHub Token Requirements for Sync

The app uses GitHub Gists via REST API v3.

- Classic PAT: enable **`gist`** scope.
- Fine-grained PAT: grant **Gists: Read and Write** permissions.

The token is kept in memory by default. If you enable **Remember token on this device**, the token is encrypted locally with your passphrase before storage.

## Security Model

- All remote health data is encrypted client-side before upload.
- Encryption stack:
  - KDF: PBKDF2 (SHA-256), 250,000 iterations, per-envelope random salt
  - Cipher: AES-GCM with random IV
- Only encrypted envelope JSON is stored in the Gist file.
- The passphrase is never stored.
- Local data is stored in IndexedDB (fallback localStorage).
- If token persistence is enabled, token is stored only as encrypted ciphertext.

## Troubleshooting

- **Wrong passphrase**
  - Pull/decrypt fails. Re-enter the correct passphrase and unlock again.
- **Token revoked or missing scopes**
  - Push/pull fails with GitHub API auth error. Create a token with required permissions.
- **Gist not found**
  - Confirm Gist ID and filename exactly match your sync file.
- **Rate limits**
  - GitHub may return API limit errors. Wait and retry.

## Privacy Warning

- Do not commit tokens, decrypted exports, or copied plaintext health data into git.
- Treat CSV exports and printed files as sensitive health information.

## Disclaimer

This tool is for symptom tracking and record-keeping only. It does not provide medical advice.
