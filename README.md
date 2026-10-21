# Bloom Across Miles

Build a bouquet, write a love letter, and send it to someone far away. Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: hero, how it works, Photo Booth teaser |
| `create.html` | The builder and the send screen |
| `bouquet.html` | What the recipient opens: envelope, letter, bouquet reveal |
| `about.html` | About the site |
| `privacy.html` | What happens to people's data |
| `404.html` | Shown by GitHub Pages for any address that doesn't exist |

Bouquet links look like `.../bouquet.html#b=...`. Links sent before the site had separate pages (`index.html#b=...` or `#bouquet=...`) are forwarded to `bouquet.html` automatically.

## Folder structure

```
core/                      Shared by every page. Change with care.
  config.js                APP_URL (leave empty unless links must point elsewhere)
  state.js                 S: the bouquet being built or viewed
  utils.js                 esc() and toast()
  screens.js               showScreen(name) for pages with several screens
  layout.js                Site header and footer (edit nav links here once)
  base.css                 Reset, buttons, inputs, toast
  fonts.css                Fonts, served from assets/fonts
  layout.css               Header, footer, About/Privacy page styles
  screens.css              Screens start hidden until showScreen() picks one

bouquet/                   Drawing a bouquet and its link
  flowers.js               Flower library (drawings, names, meanings)
  defaults.js              The starting arrangement
  render.js                Draws flowers, wrapper, ribbon, tag, handles
  link.js                  Packs a bouquet into a link and reads it back

features/                  One folder per feature. Features don't edit each other.
  landing/                 Home page petals and hero bouquet
  builder/                 Builder, tabs, note, starter prompts, draft saving,
                           panel-resize.js (drag the sidebar edge to resize)
  distance/                Distance calculator in the Note tab (OpenStreetMap place search)
  send/                    Send screen, Gmail draft, copied letter card
  recipient/               Envelope, love letter, bouquet reveal, confetti

assets/
  favicon.svg, apple-touch-icon.png, og-image.png (link preview)
  fonts/                   Self-hosted fonts and their licence
```

Each page loads only the scripts it needs, listed at the bottom of its HTML. Scripts share the page's global scope, so new features follow the rules below.

## Adding a new feature (for example, Photo Booth)

1. **New folder** `features/photobooth/` with `photobooth.css` and `photobooth.js`.
2. **New page** `photobooth.html`: copy `about.html` as a starting point, keep the header/footer placeholders, then add your stylesheet and scripts.
3. **Link to it**: add `['photobooth.html', 'Photo Booth']` to `NAV` in `core/layout.js`, and swap the "Coming soon" label on the Home page for a link.

### Rules that keep other features safe

**Wrap the JavaScript in its own scope and expose one name.**

```js
/* features/photobooth/photobooth.js */
(function () {
  const state = { shots: [] };   // its own state; never add to S
  function start() { /* ... */ }
  document.addEventListener('DOMContentLoaded', start);
  window.Photobooth = { start }; // the only global it adds
})();
```

**Prefix CSS with the feature's own id or class**, e.g. `#photobooth .frame { ... }`.

**Read shared things, don't change them.** Call `toast`, `esc`, `showScreen` or the bouquet drawing functions, but don't edit files in `core/`, `bouquet/` or another feature's folder as part of the feature.

**If it ever needs to travel in the link**, add a new field in `bouquet/link.js` and keep reading the old ones, so links already sent keep opening.

## Run locally

Open `index.html` in a browser. Links made this way only work on your own computer.

## Publish on GitHub Pages

Upload everything in this folder to the top of the repository (so `index.html` sits at the root), then **Settings > Pages > Deploy from a branch > main / (root) > Save**. Updates: upload changed files and commit; the address stays the same.

## Custom domain

1. Buy a domain from any registrar.
2. In the repo: **Settings > Pages > Custom domain**, enter it and **Save**. Do this before changing DNS. GitHub adds a `CNAME` file to the repo for you.
3. At the registrar's DNS settings, remove its default records, then add:
   - **Apex** (`example.com`): four `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **www**: a `CNAME` record for `www` pointing to `<your-github-username>.github.io`
4. Wait for DNS (GitHub says up to 24 hours), then tick **Enforce HTTPS**.
5. GitHub recommends verifying the domain in your account settings to prevent takeover, and avoiding wildcard (`*`) DNS records.

Source: GitHub Docs, "Managing a custom domain for your GitHub Pages site".

After the domain works, change `og:image` in each page's `<head>` from `assets/og-image.png` to the full address, e.g. `https://example.com/assets/og-image.png`.

If you ever host somewhere other than GitHub Pages, update the Hosting section of `privacy.html`.

## Distance calculator

`features/distance/` looks up two cities with OpenStreetMap's Nominatim and writes the straight-line distance into the Distance box. Its usage policy (https://operations.osmfoundation.org/policies/nominatim/) sets the rules the code follows: no search-as-you-type (searches run only on Find/Enter), at most 1 request per second (requests are queued 1.1s apart and cached), and visible attribution (the "© OpenStreetMap contributors" line). Keep those if you change it. Only the distance goes into the bouquet; the cities stay in the sender's browser.

## Common changes

- Add a flower: `bouquet/flowers.js`
- Add a starter message: `features/builder/prompts.js`
- Change the email card: `buildEmailHTML()` in `features/send/send.js`
- Change header or footer links: `core/layout.js`
