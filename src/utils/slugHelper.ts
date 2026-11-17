export function createCleanSlug(raw: string): string {
  const normalized = (raw || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return normalized || 'my-website';
}

export function withSafeIframeNavigation(html: string): string {
  const source = html || '<!doctype html><html><body></body></html>';
  const guardScript = `<script>
(function(){
  if (window.__buildStudioNavGuard) return;
  window.__buildStudioNavGuard = true;
  document.addEventListener('click', function(e) {
    if (e.defaultPrevented) return;
    var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!anchor) return;
    var href = (anchor.getAttribute('href') || '').trim();
    if (!href || href === '#' || href.indexOf('javascript:') === 0) {
      e.preventDefault();
      return;
    }
    if (href.charAt(0) === '#') {
      var targetEl = document.getElementById(href.slice(1));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (/^https?:\\/\\//i.test(href)) {
      if (href.indexOf('aistudio.google.com') !== -1 || href.indexOf('ais-dev-') !== -1) {
        e.preventDefault();
        return;
      }
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      return;
    }
    // Prevent relative links inside srcDoc from reloading Build Studio or hitting aistudio.google.com
    e.preventDefault();
    var slugId = href.replace(/^\\.?\\//, '').replace(/\\.html$/i, '').toLowerCase();
    var section = slugId ? document.getElementById(slugId) : null;
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (href === '/' || href === 'index.html') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, false);

  document.addEventListener('submit', function(e) {
    if (e.defaultPrevented) return;
    var form = e.target;
    var action = (form && form.getAttribute && form.getAttribute('action') || '').trim();
    if (!action || !/^https?:\\/\\//i.test(action)) {
      e.preventDefault();
    }
  }, false);
})();
</script>`;

  if (/<\/body>/i.test(source)) {
    return source.replace(/<\/body>/i, `${guardScript}</body>`);
  }
  return `${source}${guardScript}`;
}
