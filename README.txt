# Patrick Sang website discovery files

This package contains machine-readable discovery and AI-context files for https://patrick-sang.is-a.dev/.

## Files included

- `llms.txt` — concise AI-oriented site summary and curated page list.
- `llms-full.txt` — expanded text reference for the main portfolio content.
- `robots.txt` — general crawler access instructions and sitemap location.
- `sitemap.xml` — XML URL index for known site pages.
- `knowledge.json` / `knowledge.md` — structured and human-readable site summaries.
- `agent-manifest.json` / `capabilities.json` / `ai-agents.txt` — informational agent discovery files. They do not create an API.
- `ai.txt` — neutral AI-use note; it does not grant or deny rights.
- `trust.txt` — self-published site/contact summary, not independent verification.
- `context.jsonld` / `schema.json` — Schema.org-style structured data.
- `pricing.json` — explicitly marks pricing as not verified/published.
- `openapi.json` — empty API paths because no public API was verified.
- `README.txt` — this deployment guide.

## Deployment

1. Download and extract the ZIP.
2. Upload the files to the root/public directory of the GitHub Pages site so they are available at the domain root, for example `/llms.txt`, `/robots.txt`, and `/sitemap.xml`.
3. Keep the canonical domain exactly as `https://patrick-sang.is-a.dev`.
4. Verify the files in a browser after publishing.
5. Update `sitemap.xml`, `llms.txt`, `llms-full.txt`, and the page lists when site pages are added, renamed, or removed.

## Important notes

- The homepage and `buildss.html` and `journeyy.html` were checked on 2026-10-21. `labb.html` and `writingg.html` are included because these paths have been used in the site workflow, but should be verified before treating them as current public pages.
- The sitemap lists these known paths; remove any URL that does not exist or is intentionally private.
- The public CV link returned a 404 during review, so the CV PDF is not listed in the sitemap.
- These files improve machine-readable documentation but do not guarantee indexing, AI citations, or search ranking.
- `robots.txt` is not access control. Do not put private data in public site files.
