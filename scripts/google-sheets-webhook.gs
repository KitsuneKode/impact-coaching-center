/**
 * Bound to the lead spreadsheet. Deploy as a Web app:
 * Execute as: Me
 * Who has access: Anyone
 *
 * Paste the deployed /exec URL into Vercel as LEAD_WEBHOOK_URL.
 */
function doPost(event) {
  var lead = JSON.parse(event.postData.contents || "{}");
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.appendRow([
    new Date(),
    lead.name || "",
    lead.phone || "",
    lead.course || "",
    lead.timing || "",
    lead.source || "website",
    lead.receivedAt || "",
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON
  );
}
