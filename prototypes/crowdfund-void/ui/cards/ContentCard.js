export function createContentCard(item) {
  const el = document.createElement('article');
  el.className = `pv-card pv-card--${item.size} ${item.locked ? 'is-locked' : ''}`;
  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  el.dataset.cardId = item.id;

  const title = document.createElement('h3');
  title.className = 'pv-card__title';
  title.textContent = item.title;
  el.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'pv-card__meta';
  meta.textContent = item.type;
  el.appendChild(meta);

  if (item.locked) {
    const lock = document.createElement('div');
    lock.className = 'pv-card__lock';
    lock.textContent = 'locked';
    el.appendChild(lock);
  }

  return el;
}

