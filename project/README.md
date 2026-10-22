# Firebase rebuild: Builds + Geospatial Lab (no Firebase Storage)

This package replaces the Mavo/GitHub data layer in the supplied pages with Firebase Authentication and Cloud Firestore. **It does not use Firebase Storage**, so you do not need to upgrade your Firebase plan for image uploads. Images are hosted in your website repository (for example, `img/projects/map.jpg`) or on an external image host; Firestore stores only the image URL/path.

## Files

- `buildss.html` — Projects page.
- `lab.html` — Geospatial Lab page with Leaflet map.
- `firebase-config.js` — Firebase web configuration.
- `firebase-common.js` — Firebase initialization, auth and image URL validation.
- `projects-firebase.js` — project CRUD, rich text, search/sort, likes/bookmarks.
- `lab-firebase.js` — experiment CRUD, filters, stats and Leaflet markers.
- `lab-seed.json` — nine starter Lab experiments.
- `firestore.rules` — Firestore security rules.
- `migration.html` / `migration.js` — optional one-time importer for old JSON content.

## 1. Create Firebase project

1. Open https://console.firebase.google.com/ and create a project.
2. In Project settings → General → Your apps, register a Web app.
3. Copy its web configuration into `firebase-config.js`, replacing every placeholder.
4. In Authentication → Sign-in method, enable **Email/Password** and **Anonymous**.
5. In Firestore Database, create a database in production mode.

**Do not create a Firebase Storage bucket.** This package no longer imports or calls Firebase Storage.

## 2. Publish Firestore rules

1. Open Firestore Database → Rules.
2. Replace the editor contents with the complete contents of `firestore.rules`.
3. Click Publish.

The rules allow public reading of project and experiment content, but only authorized administrators can create, update or delete that content. Likes/bookmarks are restricted to the signed-in user's UID.

## 3. Create your administrator

1. Open Authentication → Users → Add user. Enter your admin email and a strong password.
2. Copy the new user's UID.
3. Open Firestore → Data and create a collection named `admins`.
4. Create a document whose Document ID is exactly the UID.
5. Add a Boolean field named `enabled` with value `true` and save.

## 4. Add images without Firebase Storage

1. Put image files in your website repository, usually inside the existing `img/` folder. For example: `img/flood-dashboard.jpg`.
2. Commit and push the image file to GitHub with the rest of the website.
3. In the Projects admin editor, paste `img/flood-dashboard.jpg` in the thumbnail field. A full HTTPS image URL also works.
4. In the Lab editor, paste up to three image paths/URLs in the image fields.

Relative paths are resolved from the page's web address. If your HTML pages are in the repository root and images are in `img/`, use `img/filename.jpg`. If you put an image in another folder, use its correct relative path. The image must actually exist in the published website repository; the browser cannot copy a selected local file into GitHub automatically.

The preset SVG illustrations on the Projects page remain available. Do not paste large base64 images into Firestore; use a hosted file path or URL instead.

## 5. Test locally

Firebase module imports require a local web server; do not open HTML files directly with a `file://` address.

- Open a terminal in this folder and run `python -m http.server 8000`.
- Open `http://localhost:8000/buildss.html` and `http://localhost:8000/lab.html`.
- Sign in with your admin email/password and test adding/editing a project and experiment.
- Confirm the record remains after refreshing.
- Add a real image path/URL and confirm it loads.
- Add latitude and longitude to an experiment and confirm its marker appears on the Leaflet map.

## 6. Migrate existing Mavo/GitHub content

1. Keep the old website and data repository as a backup.
2. Export/download the JSON data used by the old Builds page and Lab page.
3. Open `migration.html` using the local server and sign in as the authorized admin.
4. Import the project JSON, then the Lab JSON. The importer adds records; do not import the same file twice.
5. Check titles, descriptions, image paths, links and experiment details.
6. After verification, remove `migration.html` and `migration.js` from the public deployment.

If you cannot find the old JSON data, do not delete the old site. The original Builds HTML contains a template, not the complete remote project dataset.

## 7. Deploy to GitHub Pages

1. Put `buildss.html`, `lab.html`, `firebase-config.js`, `firebase-common.js`, `projects-firebase.js`, `lab-firebase.js`, and `lab-seed.json` in the same folder. Keep any existing images/assets they reference.
2. Commit and push the files to GitHub Pages.
3. In Firebase Authentication → Settings → Authorized domains, add your deployed domain (including `patrick-sang.is-a.dev` if that is where you host it).
4. Test public reading and administrator sign-in on the live pages.

## Notes

- Project descriptions are stored as Quill HTML and sanitized before display.
- Image fields store paths/URLs only. Firebase Storage and its billing plan are not used.
- The Lab starter seed is offered only when the experiments collection is empty and an authorized admin opens the Lab.
- The contact form remains connected to its original Formspree endpoint.


### Important when updating an already-working Lab page

The `firebase-config.js` included in this example package contains placeholders. If your deployed `lab.html` already signs in successfully, **keep your existing working `firebase-config.js`** when uploading the updated Projects files. Do not replace it with the placeholder file. The Projects page now binds the sign-in control before setting up the rich-text editor, reports sign-in errors in the status area, and automatically opens the admin editor after an authorized admin signs in.
