# Bloom Across Miles

Build a bouquet, write a love letter, and send it to someone far away. Plain HTML, CSS and JavaScript with no build step.

## Folder structure

```
index.html                 Markup for every screen, plus the list of CSS and JS files
app.js                     Start-up, and resetAll() (the one action that spans features)

core/                      Shared by every feature. Change with care.
  config.js                APP_URL: where the site is hosted
  state.js                 S: the bouquet being built or viewed
  utils.js                 esc() and toast()
  screens.js               showScreen(name): shows one screen, hides the rest
  base.css                 Reset, fonts, shared buttons, inputs, toast
  screens.css              Screen containers start hidden

bouquet/                   Drawing a bouquet and its link. Used by several features.
  flowers.js               Flower library (drawings, names, meanings)
  render.js                Draws flowers, wrapper, ribbon, gift tag, handles
  link.js                  Encodes a bouquet into a link and reads it back

features/                  One folder per screen. Features don't edit each other.
  landing/                 Landing page and hero bouquet
  builder/                 Bouquet builder, wrap and ribbon tabs, note, starter prompts
  send/                    Send screen, Gmail draft, copied letter card
  recipient/               Envelope, love letter, bouquet reveal, confetti
```

## How the pieces connect

- Every screen in `index.html` is an element with `data-screen="name"` and `data-display="flex"` (or `"block"`). `showScreen('name')` shows that one and hides the rest, so adding a screen never means editing the others.
- Scripts are listed at the bottom of `index.html` in this order: `core`, `bouquet`, one block per feature, then `app.js`. They share the page's global scope, which is why new features follow the rules below.

## Adding a new feature (for example, Photo Booth)

Only three places change, and none of them are existing features:

1. **New folder** `features/photobooth/` with `photobooth.css` and `photobooth.js`.
2. **In `index.html`**:
   - one screen element:
     `<div id="screen-photobooth" data-screen="photobooth" data-display="flex"> ... </div>`
   - one stylesheet line in `<head>`:
     `<link rel="stylesheet" href="features/photobooth/photobooth.css">`
   - one script line, before `app.js`:
     `<script defer src="features/photobooth/photobooth.js"></script>`
3. **The entry point**: point the landing page's "Notify me" card (or any new button) at `Photobooth.open()`.

### Rules that keep other features safe

**Wrap the JavaScript in its own scope and expose one name.** Anything declared inside stays private, so it can't overwrite an existing function such as `render` or `toast`.

```js
/* features/photobooth/photobooth.js */
(function () {
  const state = { shots: [] };          // its own state; never add to S

  function open() {
    showScreen('photobooth');           // core helpers are fine to call
  }

  window.Photobooth = { open };         // the only global it adds
})();
```

**Prefix every CSS rule with the screen's id**, so its styles only apply inside that screen.

```css
#screen-photobooth .frame { ... }
#screen-photobooth button { ... }
```

**Read shared things, don't change them.** A feature may call `showScreen`, `toast`, `esc` or the bouquet drawing functions, and read `S`. It shouldn't edit files in `core/`, `bouquet/` or another feature's folder. If it truly needs a shared change, make it a separate, deliberate change.

**If it ever needs to travel in the link**, add a new field to the payload in `bouquet/link.js` and keep reading the existing fields, so links already sent keep opening.

## Run locally

Open `index.html` in a browser. Links made this way only work on your own computer.

## Host

Drag this whole folder onto https://app.netlify.com/drop while signed in. Links sent from the hosted address open for anyone.

## Common changes

- Add a flower: `bouquet/flowers.js`
- Add a starter message: `features/builder/prompts.js`
- Change the email card: `buildEmailHTML()` in `features/send/send.js`
