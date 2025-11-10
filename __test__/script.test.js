

const {
  conceptLibrary,
  commentStore,
  getComments,
  setModalVisibility,
  filterExamples,
  updateEngineTabs,
  renderEnginePanel,
  openConcept
} = require('../js/script.js');

beforeEach(() => {
  document.body.innerHTML = '';
  for (const k in commentStore) delete commentStore[k];
});

test('getComments returns list of comments for valid concept', () => {
  const comments = getComments('health-system');
  expect(Array.isArray(comments)).toBe(true);
  expect(comments.length).toBe(2);
});

test('setModalVisibility shows and hides modal correctly', () => {
  document.body.innerHTML = `<div id="modal"></div>`;
  const modal = document.getElementById('modal');
  setModalVisibility(true, modal);
  expect(modal.classList.contains('open')).toBe(true);
  setModalVisibility(false, modal);
  expect(modal.classList.contains('open')).toBe(false);
});

test('filterExamples hides and shows elements correctly', () => {
  document.body.innerHTML = `
    <div id="grid">
      <div class="example-card" data-engine="unity" data-category="ai"></div>
      <div class="example-card" data-engine="unreal" data-category="ai"></div>
    </div>
  `;
  const grid = document.getElementById('grid');
  filterExamples('unity', 'all', grid);
  const cards = grid.querySelectorAll('.example-card');
  expect(cards[0].style.display).toBe('block');
  expect(cards[1].style.display).toBe('none');
});

test('updateEngineTabs sets correct active tab', () => {
  document.body.innerHTML = `
    <button class="engine-tab" data-engine="unity"></button>
    <button class="engine-tab" data-engine="unreal"></button>
  `;
  const tabs = Array.from(document.querySelectorAll('.engine-tab'));
  updateEngineTabs(tabs, 'unreal');
  expect(tabs[1].classList.contains('active')).toBe(true);
});

test('renderEnginePanel fills DOM elements correctly', () => {
  const titleEl = document.createElement('h3');
  const sumEl = document.createElement('p');
  const codeEl = document.createElement('pre');
  const linksEl = document.createElement('div');
  renderEnginePanel('health-system', 'unity', titleEl, sumEl, codeEl, linksEl);
  expect(titleEl.textContent).toContain('Unity');
  expect(sumEl.textContent).toContain('health');
  expect(linksEl.querySelector('a').href).toContain('unity3d');
});

test('openConcept fills modal and sets visible', () => {
  document.body.innerHTML = `<div id="modal"></div>`;
  const modal = document.getElementById('modal');
  const title = document.createElement('h2');
  const desc = document.createElement('p');
  openConcept('health-system', modal, title, desc);
  expect(title.textContent).toContain('Health System');
  expect(desc.textContent).toContain('health');
  expect(modal.classList.contains('open')).toBe(true);
});
