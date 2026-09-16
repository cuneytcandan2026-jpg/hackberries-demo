/**
 * Click-to-load map.
 *
 * Nothing third-party is requested until the visitor explicitly asks for it,
 * so the page has no Google cookies or requests by default. The "Open in Maps"
 * link beside it always works, so the embed is never required.
 */
export function initMap() {
  const slot = document.getElementById('map-slot');
  const button = document.getElementById('map-load');
  if (!slot || !button) return () => {};

  const onClick = () => {
    const src = slot.dataset.mapSrc;
    if (!src) return;

    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = 'Map showing Hackberries, 190 Windmill Lane, Cheshunt';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('allowfullscreen', '');

    // If the embed is blocked (an extension, a strict network, no connection),
    // leave the visitor with the working directions link instead of a blank box.
    const failed = setTimeout(() => {
      if (!frame.isConnected) return;
      slot.innerHTML =
        '<div class="map-invite"><p class="small muted">The map could not be loaded. ' +
        'The <a href="' + encodeURI(slot.dataset.mapFallback || '#visit') +
        '">directions link</a> above still works.</p></div>';
    }, 8000);
    frame.addEventListener('load', () => clearTimeout(failed), { once: true });

    slot.replaceChildren(frame);
  };

  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
