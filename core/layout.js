/* Shared site header and footer.
   A page opts in with <div data-site-header></div> and <div data-site-footer></div>.
   Edit the links here once and every page updates. */
(function () {
  const NAV = [
    ['index.html', 'Home'],
    ['create.html', 'Create'],
    ['about.html', 'About'],
  ];
  const FOOTER_LINKS = [
    ['index.html', 'Home'],
    ['create.html', 'Create a bouquet'],
    ['about.html', 'About'],
    ['privacy.html', 'Privacy'],
  ];

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const current = (href) => (href === here ? ' aria-current="page"' : '');

  const header = `
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-logo" href="index.html" aria-label="Bloom Across Miles home">
      <img src="assets/favicon.svg" alt="" width="30" height="30"><span>Bloom Across Miles</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      ${NAV.map(([href, label]) => `<a href="${href}"${current(href)}>${label}</a>`).join('')}
      <a class="site-cta" href="create.html">🌷 Make a bouquet</a>
    </nav>
  </div>
</header>`;

  const footer = `
<footer class="site-footer">
  <div class="site-footer-inner">
    <p>© ${new Date().getFullYear()} Bloom Across Miles · For the ones far away 🌷</p>
    <nav aria-label="Footer">
      ${FOOTER_LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
    </nav>
  </div>
</footer>`;

  document.querySelectorAll('[data-site-header]').forEach((el) => { el.outerHTML = header; });
  document.querySelectorAll('[data-site-footer]').forEach((el) => { el.outerHTML = footer; });
})();
