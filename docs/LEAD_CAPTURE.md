# Lead capture setup

The site posts validated enquiries as JSON to `LEAD_WEBHOOK_URL`.

1. Create or open the Google Sheet that should receive enquiries.
2. Open **Extensions → Apps Script**.
3. Paste [`scripts/google-sheets-webhook.gs`](../scripts/google-sheets-webhook.gs).
4. Deploy it as a **Web app**, executing as yourself, with access for anyone.
5. Copy the deployed `/exec` URL.
6. Add it to Vercel as `LEAD_WEBHOOK_URL` for Production and Preview.
7. Submit one test enquiry and confirm the row appears before the owner demo.

Suggested header row:

`Received at | Name | Phone | Course | Timing | Source | Client timestamp`

The webhook contains no credentials and only appends the fields already collected
by the form. Do not put a Google Sheet URL or access token in the repository.
