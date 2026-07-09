# Chatbot → Google Sheet mirror (setup)

Every Mshirika chat turn is already saved to the database and is reviewable in
the studio at **/studio/conversations** ("Chat & concerns"). This optional
mirror ALSO appends each turn to a Google Sheet in real time, so the team can
triage/tag concerns in a familiar spreadsheet.

The code is already deployed but **dormant** until the `CHAT_SHEET_WEBHOOK_URL`
env var is set. No spreadsheet API keys or service accounts are needed — it
posts to a Google Apps Script web app you own.

## 1. Create the sheet

1. Create a new Google Sheet (e.g. "CoopBank — Chatbot Concerns").
2. In row 1 add headers: `Timestamp | Session | Page | Customer message | Bot reply`.

## 2. Add the Apps Script

In the sheet: **Extensions → Apps Script**, delete any boilerplate, paste:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.sessionId || '',
      data.page || '',
      data.userMessage || '',
      data.botReply || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Deploy as a web app

1. **Deploy → New deployment → type: Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
   (The URL is an unguessable secret; only our server knows it.)
3. Authorize when prompted. Copy the **Web app URL**
   (looks like `https://script.google.com/macros/s/AKfy…/exec`).

## 4. Point the site at it

Set the env var on Cloud Run (production service `coopbank-concept-web`):

```bash
gcloud run services update coopbank-concept-web \
  --region=europe-west1 --project=sakura-group-482908 \
  --update-env-vars="CHAT_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfy…/exec"
```

Use `--update-env-vars` (never `--set-env-vars`, which wipes existing vars).
New chat messages will start appearing in the sheet within seconds.

## Notes

- The mirror is best-effort: if the sheet/script is down, the customer reply and
  the database log are unaffected.
- To turn it off, remove the env var (`--remove-env-vars=CHAT_SHEET_WEBHOOK_URL`).
- The database (`/studio/conversations`) remains the source of truth; the sheet
  is a convenience mirror.
