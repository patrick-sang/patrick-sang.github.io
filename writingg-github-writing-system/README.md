# Writing manager + per-article social previews

Prepared for GitHub username **patrick-sang** and the site `https://patrick-sang.is-a.dev`.

## What's included

- `writingg.html` — your existing writing index, updated to load content from `writing-data.json` and link to separate crawlable article pages.
- `writing-admin.html` — Mavo editing interface for adding, editing, and deleting individual writings.
- `writing-data.json` — migrated existing five writings, so your current content is retained.
- `build_writing.py` — generates `/writing/<slug>/index.html` pages with unique Open Graph and Twitter metadata.
- `.github/workflows/deploy-writing.yml` — builds and deploys the site to GitHub Pages whenever `main` changes.
- `writing-style.css` — extracted stylesheet used by generated articles and the admin page.

## Install into your repository

1. Open `https://github.com/patrick-sang/patrick-sang.github.io` and confirm this is the repository that currently publishes `patrick-sang.is-a.dev`.
2. Upload/merge the files in this package into the repository root, keeping your other website files. Do not delete existing images or pages.
3. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. This workflow deploys the `_site` artifact; don't keep a conflicting branch-based Pages deployment workflow enabled.
4. Commit the changes to the `main` branch. Check **Actions** and wait for “Build and deploy writing site” to succeed.
5. Open `https://patrick-sang.is-a.dev/writingg.html` for the public writing index and `https://patrick-sang.is-a.dev/writing-admin.html` for the editor.

## Editing writings

1. Open `writing-admin.html` on the live site.
2. Use the Mavo toolbar to log in with GitHub. If Mavo asks for authorization, authorize the GitHub access it requests.
3. Add a writing item, fill in title, slug, date, reading time, standfirst, tags, cover image and body, then Save.
4. Separate paragraphs with a blank line. Start a subheading with `## ` and a pull quote with `> `.
5. After the save commits `writing-data.json`, GitHub Actions regenerates article pages. The index and article metadata update after deployment completes.

## Important notes

- The GitHub backend URL in `writing-admin.html` assumes the repository is `patrick-sang/patrick-sang.github.io`, branch `main`, and file `writing-data.json`. If the actual repo or branch differs, change `mv-storage` to the correct GitHub file URL.
- Mavo's GitHub login/authorization availability can depend on the Mavo GitHub backend's current OAuth configuration. This package does not contain a private token or client secret. Never publish a GitHub personal access token in HTML.
- For a cover, paste a public URL into the cover URL field. If the Mavo image editor supports local image upload on your configured backend, selecting a local file stores the image data in the content JSON; the build script then materializes it into a file. For best performance, use compressed WebP/JPEG images. If local upload is not offered by the Mavo UI, upload the image into your repo's `img/` folder and paste its public URL.
- The workflow publishes the entire repository website from `_site`. It keeps other site files while excluding Git metadata and workflow files. Check that your custom domain configuration file (`CNAME`) is present in the repository so the domain continues to work.
- Social platforms cache previews. After a new article is published, use the platform's preview debugger or wait for the cache to refresh.

## Local test

Run `python build_writing.py` from this folder. It creates `_site/writing/<slug>/index.html` pages. Open one of those generated HTML files and confirm it contains its own `og:title`, `og:description`, `og:image`, and canonical URL.
