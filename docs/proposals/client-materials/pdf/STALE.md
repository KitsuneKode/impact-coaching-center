# These PDFs are out of date — do not send them

Last verified stale: 20 September 2026.

They still contain wording the ADRs removed and the DOCX no longer has:

- **Clerk** as a client-owned production account (removed by ADR-0001 and spec §10)
- **stock counts** as a feature and as client-supplied data (ADR-0002 and spec §9: Books are enabled or disabled)
- **Resend / transactional email** as the order-update channel (spec §10: WhatsApp, with no email fallback at launch)

`ICT-Final-Project-Quotation.pdf` alone had six matches at the time of writing.

Sending one of these to ICT would put scope in front of them that the team has
already decided not to build, and would contradict the change note in
`docs/proposals/2026-09-20-change-note-whatsapp-verification.md`.

## Regenerating them

The `.docx` and `.pptx` one directory up are correct and reproducible:

```bash
bun run materials:docs   # rebuild DOCX and PPTX from the generators
bun run materials:pdf    # convert them to PDF
```

`materials:pdf` needs LibreOffice on PATH (`soffice` or `libreoffice`). It is
not a project dependency; the script prints install instructions and exits
non-zero rather than silently leaving these files in place.

Delete this file in the same commit that replaces the PDFs.
