# Satya Almighty Gym, Tuni

Static, dependency-free website. No build step is needed to run it.

## Run locally

```
npx http-server . -p 5173 -c-1
```

Open http://localhost:5173. Opening `index.html` directly also works, except the embedded map.

## Deploy

Upload the contents of this folder (`index.html`, `css/`, `js/`, `assets/`) to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Things to update

| What | Where |
| --- | --- |
| Phone / WhatsApp number | `index.html` (`tel:`, `wa.me/` links) and `WA` in `js/main.js` |
| Opening hours | `index.html`, "Visit us" section. Currently says to call and confirm. |
| Membership prices | Not shown on purpose (none were provided). Add a section when ready. |
| Instagram, email, address | `index.html`, "Visit us" section and the JSON-LD block in `<head>` |
| Colors | CSS variables at the top of `css/styles.css` |

## Regenerating media (optional)

`assets/` is already generated from the original photos and videos. To rebuild it from the originals in the parent folder:

```
npm install
npm run build:media
```
