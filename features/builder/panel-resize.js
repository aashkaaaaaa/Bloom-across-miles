/* Drag the edge of the builder sidebar to make it wider or narrower (desktop only).
   Double-click the edge to reset. Arrow keys work when the edge is focused.
   The width is remembered on this device. */
(function () {
  const KEY = 'bam-panel-width-v1';
  const MIN = 190, MAX = 460, DEFAULT = 210;

  function setWidth(panel, w) {
    const width = Math.round(Math.max(MIN, Math.min(MAX, w)));
    panel.style.width = width + 'px';
    return width;
  }
  function remember(w) { try { localStorage.setItem(KEY, String(w)); } catch (e) {} }
  function redraw() { if (typeof render === 'function') render(); } // handles resize with the canvas

  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('builderPanel');
    const handle = document.getElementById('panelResizer');
    if (!panel || !handle) return;

    let saved = DEFAULT;
    try { saved = +localStorage.getItem(KEY) || DEFAULT; } catch (e) {}
    setWidth(panel, saved);

    let drag = null;
    handle.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, w: panel.getBoundingClientRect().width };
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
      if (drag) setWidth(panel, drag.w + e.clientX - drag.x);
    });
    const end = () => {
      if (!drag) return;
      drag = null;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      remember(panel.getBoundingClientRect().width);
      redraw();
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('dblclick', () => { remember(setWidth(panel, DEFAULT)); redraw(); });
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 48 : 16;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const w = panel.getBoundingClientRect().width + (e.key === 'ArrowRight' ? step : -step);
      remember(setWidth(panel, w));
      redraw();
    });
  });
})();
