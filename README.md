# CubeFlow

Serve this folder on HTTPS (or localhost for development). Both `index.html`
and `CUBE Timer.html` include locally bundled CSS and fonts.

## Offline use

1. Open the hosted app online once.
2. Open Settings and wait for **Available offline**.
3. Reopen the same URL without internet to practice normally.

The service worker caches both pages, CSS, JavaScript, and every font. Saved
solves still use the existing browser storage. Offline caching does not back
up solves: clearing site data removes both saves and downloaded assets.
Opening HTML via `file://` cannot install an offline cache; use a web server.

Updates download in the background and activate after all CubeFlow tabs/windows
close, so an update never reloads an active solve. The cache is scoped to the
app directory and works under a hosting subdirectory too.

## Updating the bundle

Generated assets are included; visitors and static hosts need no build tools.
After changing Tailwind classes, rebuild CSS with Tailwind CSS **3.4.17**:

```powershell
./.tools/tailwindcss.exe -c tailwind.config.cjs -i assets/tailwind.input.css -o assets/app.css --minify
```

The standalone compiler is available from the Tailwind CSS v3.4.17 GitHub
release. It is a development tool, not part of the deployed app.
After any change to HTML, styles, fonts, or offline JavaScript, run:

```powershell
node scripts/build-offline.mjs
```

This regenerates `sw.js` with a content-based cache version. Deploy both HTML
files, `sw.js`, and the entire `assets/` folder together. Serve `sw.js` with
revalidation (`Cache-Control: no-cache`) and a JavaScript content type.

Fonts are distributed under the included SIL Open Font License files in
`assets/fonts/`.
