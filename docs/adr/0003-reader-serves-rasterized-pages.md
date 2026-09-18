# The Reader serves pre-rasterized pages, not pdf.js

Resources are read in the browser rather than downloaded, because the client requires that documents not be directly downloadable. The Reader serves page images rasterized when staff upload the document, in AVIF with a WebP fallback at roughly 640 / 1024 / 1600 widths, and never ships a PDF rendering engine to the visitor.

## Considered options

Rendering with `pdfjs-dist` in the browser was rejected on payload: it costs roughly 458 KB of main bundle plus a 1.27 MB worker before a single byte of the document arrives. ICT's audience is largely on budget Android phones on slow Assam connections, where that is the whole experience. Rasterizing on first view was rejected because it puts the cost on a student rather than on the rare, staff-initiated upload, and hides conversion failures from the person able to retry them.

## Consequences

Uploads take a few seconds of processing and can fail visibly in the admin, which is the intended trade. A source document that cannot be rasterized cannot be published. pdf.js remains available as an optional, lazily loaded enhancement if text search inside a Resource is ever wanted.

Serving images does not make a Resource private: anything rendered can be screenshotted, and any file delivered can be forwarded. The site must never claim otherwise.
