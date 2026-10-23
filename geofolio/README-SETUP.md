# GeoFolio — Firebase setup guide

GeoFolio replaces Mavo with Firebase Authentication and Cloud Firestore while keeping the existing portfolio presentation and core interactions. Firebase Storage is not used.

## Included features

- Existing responsive portfolio layout, navigation, hero, about/contact section and footer
- Project cards, project detail modal, rich-text descriptions (Quill), technologies, dates, GitHub and demo links
- Search, category filters, recent projects, sorting and live project/technology/like counts
- Project likes and bookmarks; bookmarks are stored in the visitor's browser, likes in Firestore
- View counter, print/save-as-PDF action, thumbnail URL/repository paths and SVG presets
- Firebase email/password administrator sign-in
- Admin-only add, edit and delete project controls
- Existing Formspree contact form remains unchanged

## 1. Create a Firebase project

1. Visit https://console.firebase.google.com/ and choose **Add project**.
2. Give it the name `GeoFolio` (the Firebase project ID may need to be a unique variation such as `geofolio-12345`). Complete the wizard.
3. In **Project settings → General → Your apps**, add a **Web app** (`</>`).
4. Register the app. Copy the Firebase configuration object shown by Firebase.

## 2. Add your Firebase web configuration

1. Open `buildss-firebase.html` in a code editor. The page title and navigation branding are set to **GeoFolio**.
2. Find `const firebaseConfig = { ... }`.
3. Replace each `PASTE_...` placeholder with the matching value from Firebase's web-app configuration.
4. Save. Do not paste a service-account private key into this file. The web config is intended to be public; access is controlled by the rules and admin records.

## 3. Enable administrator email/password sign-in

1. Firebase Console → **Build → Authentication → Get started**.
2. Open **Sign-in method**.
3. Enable **Email/Password** and save.
4. Open **Users → Add user**.
5. Create your administrator email and a strong password. Do not enable public account registration in this portfolio; the page only exposes sign-in.

## 4. Create the Firestore database

1. Firebase Console → **Build → Firestore Database → Create database**.
2. Choose a location close to your audience (for example, an appropriate region available to your project).
3. Create the database.
4. Open the **Rules** tab, replace the starter rules with the contents of `firestore.rules`, and click **Publish**.

The rules allow everyone to read projects and increment the public like/view counters, but only users with an enabled admin marker can create, edit or delete projects.

## 5. Mark your account as an administrator

This is the important step that prevents the “signed in but admin panel never opens” problem.

1. Open Firebase Console → **Authentication → Users**.
2. Copy the administrator user's **UID**.
3. Open **Firestore Database → Data → Start collection**.
4. Set collection ID to `admins`.
5. Set document ID to the exact copied UID (not the email address).
6. Add a field: `enabled` — type **boolean** — value `true`.
7. Save the document.
8. Return to the portfolio, sign in again. The UI checks `admins/{your-auth-uid}` before displaying editing controls.

Only create admin marker documents yourself in the Firebase Console. The client-side app intentionally cannot grant admin permissions.

## 6. Add project thumbnails without Firebase Storage

GeoFolio does not upload image files to Firebase. In the add/edit project forms, enter either:

- A public HTTPS image URL, such as an image hosted on your own website or another public image host; or
- A relative path to an image included in your website repository, such as `./img/project-map.png`. Keep the image file in that path when deploying.

The built-in SVG presets remain available. Avoid pasting large data URLs into Firestore documents; Firestore documents have a 1 MiB size limit.

## 7. Run the page locally

Firebase module imports require a web server; opening the HTML as `file://` can fail.

Easy options:
- **VS Code**: install/use Live Server, right-click the HTML file, choose **Open with Live Server**.
- **GitHub Pages**: upload `buildss-firebase.html` and rename it to the filename you want (for example `geofolio.html` or `index.html`). Keep it alongside the existing `img/` folder so paths such as `./img/logo.webp` still work.
- **Firebase Hosting**: optional; use the Firebase CLI if you already use it.

For GitHub Pages, go to repository **Settings → Pages**, select the branch and folder containing the page, and save. Wait for deployment, then open the published HTTPS URL.

## 8. Add and manage projects

1. Open the deployed page and select **Admin sign in**.
2. Sign in with the email/password created in Firebase Authentication.
3. Confirm the account has `admins/{UID}` with `enabled: true`.
4. Open **Manage → Add New GIS Project**.
5. Enter title, category, thumbnail image URL or repository path, technologies, year, rich description, GitHub URL and demo URL.
6. Click **Publish Project**. Projects are saved in Firestore and appear to visitors.
7. Use **Edit** or **Delete** on project cards while signed in.

## 9. Existing Mavo projects and migration

The original HTML used Mavo's GitHub backend (`patrick-sang/gis-projects-data`); project records were not embedded in the uploaded HTML itself. This conversion therefore does not automatically import remote Mavo records.

Before switching your live page:
1. Open the old working Mavo page while signed in and export/copy its project records from the Mavo GitHub data repository or the Mavo data interface.
2. Create equivalent projects through the new Firebase admin panel, or import a JSON file into Firestore using a trusted one-time migration script.
3. Compare titles, descriptions, technologies, images and links on the new page with the old page.
4. Only then replace the live page.

Do not paste GitHub tokens into the new page. The Firebase web config is not a service-account credential; never expose private service-account keys.

## 10. Troubleshooting

- **Sign-in works but admin editing is hidden:** confirm the Firestore document path is exactly `admins/<Authentication UID>` and field `enabled` is Boolean `true`; then sign out and back in.
- **`auth/invalid-credential`:** check email/password and that Email/Password is enabled.
- **`Missing or insufficient permissions`:** publish the supplied Firestore rules and verify the admin document.
- **Thumbnail does not appear:** check that the image URL is publicly accessible or that the relative path matches the image location in your deployed repository. HTTPS image URLs are recommended.
- **Page says it cannot load projects:** confirm the Firebase config values, Firestore database exists, and browser console errors.
- **Styles/images are missing:** keep the existing `img/` directory and its assets beside the HTML file.
- **A project has no date ordering:** enter its year/date consistently; the page sorts by the displayed year string.

## Security note

Firebase browser configuration is public by design. Security comes from Firestore rules and the admin allowlist. Never deploy open write rules or put private service-account credentials in the HTML. Public likes and view counters are intentionally simple and can be abused by automated traffic; for a high-traffic production site, move counters to trusted backend logic and rate-limit them.
