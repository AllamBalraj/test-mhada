# Google Sheets Feedback Collection (Apps Script)

This project submits feedback to a **Google Apps Script Web App** endpoint. The web app writes each submission as a new row in a Google Sheet.

## 1) Create a Google Sheet

Create a sheet named `Feedback` with these columns (row 1 headers):

- submittedAt
- name
- email
- improve
- feedback
- pageUrl
- userAgent

## 2) Create Apps Script

Open the Google Sheet → **Extensions → Apps Script**.

Paste the provided `Code.gs`.

Important notes for CORS:

- The frontend sends `Content-Type: text/plain` to avoid a browser **preflight** request.
- Your script should handle both:
  - `e.postData.contents` JSON
  - and return `Access-Control-Allow-Origin: *`
- Optional: include a `doOptions(e)` handler for preflight (some environments/extensions may still trigger it).

## 3) Deploy as Web App

- Deploy → New deployment
- Type: Web app
- Execute as: **Me**
- Who has access: **Anyone** (or "Anyone with link")

Copy the web app URL.

## 4) Configure the frontend

Create `.env`:

- `VITE_FEEDBACK_ENDPOINT="<YOUR_APPS_SCRIPT_WEB_APP_URL>"`

Then rebuild/redeploy.

## Troubleshooting CORS from localhost

If you still see CORS errors:

- Make sure you re-deployed after editing Apps Script (new deployment version)
- Ensure the web app access is set to **Anyone**
- Keep `Content-Type: text/plain` on the frontend (prevents preflight)
