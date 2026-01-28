export function openCheckout(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

