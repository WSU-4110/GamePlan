
const {
  setupMobileMenu,
  setupBrowseFilters,
  setupSearch,
  setupButtons,
  searchMatches,
  filterMatch,
} = require('../js/script.js');

function el(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text) node.textContent = text;
  document.body.appendChild(node);
  return node;
}

describe('searchMatches (pure)', () => {
  test('matches by title, description, and keywords', () => {
    const example = {
      title: 'Inventory System',
      description: 'drag and drop items',
      keywords: ['ui', 'items', 'drag'],
    };
    expect(searchMatches(example, 'inventory')).toBe(true);
    expect(searchMatches(example, 'drag')).toBe(true);
    expect(searchMatches(example, 'unknown')).toBe(false);
  });
});

describe('filterMatch (pure)', () => {
  test('handles all and specific filters', () => {
    expect(filterMatch('all', 'all', 'unity', 'ui')).toBe(true);
    expect(filterMatch('unity', 'all', 'unity', 'combat')).toBe(true);
    expect(filterMatch('unity', 'ui', 'unity', 'combat')).toBe(false);
    expect(filterMatch('godot', '2d', 'unity', '2d')).toBe(false);
  });
});

describe('setupMobileMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('toggles active classes on hamburger click and closes on link', () => {
    const hamburger = el('button', { class: 'hamburger' });
    const menu = el('nav', { class: 'nav-menu' });
    const link = el('a', { class: 'nav-link' });
    menu.appendChild(link);

    setupMobileMenu();

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(true);
    expect(menu.classList.contains('active')).toBe(true);

    link.click();
    expect(hamburger.classList.contains('active')).toBe(false);
    expect(menu.classList.contains('active')).toBe(false);
  });
});

describe('setupBrowseFilters', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    history.replaceState({}, '', '/browse.html');
  });

  test('filters cards based on selects', () => {
    const engine = el('select', { id: 'engine-filter' });
    const optAll = document.createElement('option');
    optAll.value = 'all';
    engine.appendChild(optAll);
    const optUnity = document.createElement('option');
    optUnity.value = 'unity';
    engine.appendChild(optUnity);

    const category = el('select', { id: 'category-filter' });
    const cAll = document.createElement('option');
    cAll.value = 'all';
    category.appendChild(cAll);
    const cUI = document.createElement('option');
    cUI.value = 'ui';
    category.appendChild(cUI);

    const grid = el('div', { id: 'examples-grid' });
    const card1 = document.createElement('div');
    card1.className = 'example-card';
    card1.setAttribute('data-engine', 'unity');
    card1.setAttribute('data-category', 'ui');
    const card2 = document.createElement('div');
    card2.className = 'example-card';
    card2.setAttribute('data-engine', 'godot');
    card2.setAttribute('data-category', '2d');
    grid.appendChild(card1);
    grid.appendChild(card2);

    setupBrowseFilters();

    engine.value = 'unity';
    category.value = 'ui';
    engine.dispatchEvent(new Event('change'));
    category.dispatchEvent(new Event('change'));

    expect(card1.style.display).toBe('block');
    expect(card2.style.display).toBe('none');
  });

  test('reads engine from url params', () => {
    history.replaceState({}, '', '/browse.html?engine=unity');

    const engine = el('select', { id: 'engine-filter' });
    const optUnity = document.createElement('option');
    optUnity.value = 'unity';
    engine.appendChild(optUnity);
    const category = el('select', { id: 'category-filter' });
    const grid = el('div', { id: 'examples-grid' });

    const card = document.createElement('div');
    card.className = 'example-card';
    card.setAttribute('data-engine', 'unity');
    card.setAttribute('data-category', 'ui');
    grid.appendChild(card);

    setupBrowseFilters();

    expect(engine.value).toBe('unity');
  });
});

describe('setupSearch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('performs search and renders results, and clears on empty', () => {
    const input = el('input', { id: 'search-input' });
    const btn = el('button', { id: 'search-btn' }, 'Search');
    const grid = el('div', { id: 'search-results-grid' });
    const info = el('div', { id: 'results-info' });
    const count = el('span', { id: 'results-count' });
    info.appendChild(count);
    const nores = el('div', { id: 'no-results' });

    setupSearch();

    input.value = 'inventory';
    btn.click();
    expect(grid.children.length).toBeGreaterThan(0);
    expect(info.style.display).toBe('block');
    expect(nores.style.display).toBe('none');

    input.value = '';
    btn.click();
    expect(grid.children.length).toBe(0);
    expect(info.style.display).toBe('none');
  });
});

describe('setupButtons', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    window.alert.mockRestore();
  });

  test('shows loading state and reverts after timeout with alert', () => {
    el('button', { class: 'btn' }, 'Download');
    setupButtons();

    // lowercase comments: the button is replaced by clone; re-select it
    const wired = document.querySelector('.btn');
    wired.click();
    expect(wired.textContent).toBe('Loading...');
    expect(wired.disabled).toBe(true);

    jest.advanceTimersByTime(1000);

    expect(window.alert).toHaveBeenCalled();
    expect(wired.textContent).toBe('Download');
    expect(wired.disabled).toBe(false);
  });
});
