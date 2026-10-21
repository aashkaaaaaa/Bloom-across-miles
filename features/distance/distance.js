/* Distance calculator (Note tab on create.html).
   The sender types two cities, presses Find, picks the right match, and the
   straight-line distance is written into the Distance box. Cities stay on this
   device; only the distance goes into the bouquet.

   Place search: OpenStreetMap Nominatim. Its usage policy forbids search-as-you-type,
   allows at most 1 request per second, and requires attribution, so searches run only
   on Find/Enter, go through a 1.1s queue, and are cached.
   https://operations.osmfoundation.org/policies/nominatim/ */
(function () {
  const SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
  const STORE_KEY = 'bam-distance-v1';
  const CACHE_KEY = 'bam-geo-cache-v1';
  const EARTH_RADIUS_KM = 6371.0088; // mean Earth radius
  const KM_TO_MILES = 0.621371;

  const state = { from: null, to: null, unit: 'miles' }; // from/to: {name, lat, lon}

  /* ── storage (per-device convenience only) ── */
  function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }

  /* ── place search: one request at a time, at least 1.1s apart, cached ── */
  const cache = load(CACHE_KEY, {});
  let queue = Promise.resolve();
  let lastRequest = 0;
  function search(query) {
    const key = query.trim().toLowerCase();
    if (cache[key]) return Promise.resolve(cache[key]);
    const run = async () => {
      const wait = Math.max(0, lastRequest + 1100 - Date.now());
      if (wait) await new Promise((r) => setTimeout(r, wait));
      lastRequest = Date.now();
      const url = `${SEARCH_URL}?format=jsonv2&limit=5&accept-language=en&q=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('search failed ' + res.status);
      const rows = await res.json();
      const places = rows
        .filter((r) => r.lat && r.lon && r.display_name)
        .map((r) => ({ name: r.display_name, lat: +r.lat, lon: +r.lon }));
      cache[key] = places;
      const keys = Object.keys(cache);
      if (keys.length > 40) delete cache[keys[0]]; // keep the cache small
      save(CACHE_KEY, cache);
      return places;
    };
    const p = queue.then(run, run);
    queue = p.catch(() => {});
    return p;
  }

  /* ── maths ── */
  function km(a, b) {
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  }
  function label(distanceKm, unit) {
    const n = unit === 'km' ? distanceKm : distanceKm * KM_TO_MILES;
    const word = unit === 'km' ? 'km' : 'miles';
    if (n < 1) return unit === 'km' ? 'Less than 1 km apart' : 'Less than a mile apart';
    return `${Math.round(n).toLocaleString('en-US')} ${n >= 1.5 || unit === 'km' ? word : 'mile'} apart`;
  }

  /* ── UI ── */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const short = (name) => name.split(',').slice(0, 3).join(',').trim();          // for picking between matches
  const city = (name) => { const p = name.split(',').map((x) => x.trim()); return p.length > 1 ? `${p[0]}, ${p[p.length - 1]}` : p[0]; }; // e.g. "Ahmedabad, India"

  function field(which, title) {
    return `
      <div class="dc-field" data-which="${which}">
        <label for="dc-${which}">${title}</label>
        <div class="dc-row">
          <input id="dc-${which}" class="inp" type="text" placeholder="City" maxlength="80" autocomplete="off">
          <button type="button" class="dc-find">Find</button>
        </div>
        <div class="dc-status" aria-live="polite"></div>
        <div class="dc-matches"></div>
      </div>`;
  }

  function mount(root) {
    root.innerHTML = `
      <button type="button" class="dc-toggle" aria-expanded="false">📍 Work it out from two cities</button>
      <div class="dc-panel" hidden>
        ${field('from', 'Your city')}
        ${field('to', 'Their city')}
        <div class="dc-units" role="group" aria-label="Unit">
          <button type="button" data-unit="miles">Miles</button>
          <button type="button" data-unit="km">Km</button>
        </div>
        <p class="dc-result" aria-live="polite"></p>
        <p class="dc-credit">Place search <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p>
      </div>`;

    const toggle = root.querySelector('.dc-toggle');
    const panel = root.querySelector('.dc-panel');
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
    });

    root.querySelectorAll('.dc-field').forEach((box) => {
      const which = box.dataset.which;
      const input = box.querySelector('input');
      const status = box.querySelector('.dc-status');
      const matches = box.querySelector('.dc-matches');
      if (state[which]) { input.value = city(state[which].name); status.textContent = '✓ ' + city(state[which].name); }

      const find = async () => {
        const q = input.value.trim();
        if (q.length < 2) { status.textContent = 'Type a city name first.'; return; }
        status.textContent = 'Searching…';
        matches.innerHTML = '';
        try {
          const places = await search(q);
          if (!places.length) { status.textContent = 'No places found. Try adding the country, e.g. "Toronto, Canada".'; return; }
          if (places.length === 1) { choose(which, places[0]); return; }
          status.textContent = 'Which one?';
          matches.innerHTML = places.map((p, i) => `<button type="button" data-i="${i}">${esc(short(p.name))}</button>`).join('');
          matches.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => choose(which, places[+b.dataset.i])));
        } catch (e) {
          status.textContent = "Couldn't reach the place search. Check your connection, or type the distance yourself.";
        }
      };
      box.querySelector('.dc-find').addEventListener('click', find);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); find(); } });
      input.addEventListener('input', () => { state[which] = null; status.textContent = ''; matches.innerHTML = ''; persist(); update(); });
    });

    root.querySelectorAll('.dc-units button').forEach((b) => b.addEventListener('click', () => {
      state.unit = b.dataset.unit; persist(); paintUnits(); update();
    }));

    function choose(which, place) {
      state[which] = place;
      const box = root.querySelector(`.dc-field[data-which="${which}"]`);
      box.querySelector('input').value = city(place.name);
      box.querySelector('.dc-status').textContent = '✓ ' + city(place.name);
      box.querySelector('.dc-matches').innerHTML = '';
      persist(); update();
    }
    function paintUnits() {
      root.querySelectorAll('.dc-units button').forEach((b) => b.classList.toggle('on', b.dataset.unit === state.unit));
    }
    function update() {
      const out = root.querySelector('.dc-result');
      if (!state.from || !state.to) { out.textContent = ''; return; } // the Distance box keeps whatever it last had
      const text = label(km(state.from, state.to), state.unit);
      out.textContent = '✓ Distance set: ' + text;
      const dist = document.getElementById('noteDist');
      if (dist) {
        dist.value = text;
        dist.dispatchEvent(new Event('input', { bubbles: true })); // lets the builder pick it up
      }
    }
    paintUnits();
    if (state.from && state.to) root.querySelector('.dc-result').textContent = '✓ Distance set: ' + label(km(state.from, state.to), state.unit);
  }

  function persist() { save(STORE_KEY, state); }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = load(STORE_KEY, {});
    if (saved.from) state.from = saved.from;
    if (saved.to) state.to = saved.to;
    if (saved.unit === 'km' || saved.unit === 'miles') state.unit = saved.unit;
    const root = document.getElementById('distanceCalc');
    if (root) mount(root);
  });

  window.Distance = { km, label }; // exposed for testing; nothing else depends on it
})();
