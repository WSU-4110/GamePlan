const {
    conceptLibrary,
    commentStore,
    getComments,
    setModalVisibility,
    filterExamples,
    updateEngineTabs,
    renderEnginePanel,
    openConcept,
} = require('../js/script.js');

beforeEach(() => {
    // Reset DOM and comment store before each test
    document.body.innerHTML = '';
    for (const key in commentStore) delete commentStore[key];
});

//
//   TEST: 
describe('getComments()', () => {

    test('returns a list of comments for a valid concept', () => {
        const comments = getComments('health-system');
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(2);
    });

    test('returns an empty array for a concept with no comments', () => {
        const comments = getComments('nonexistent-concept');
        expect(comments).toEqual([]);
    });

    test('does not mutate original commentStore', () => {
        const before = JSON.stringify(commentStore);
        getComments('health-system');
        const after = JSON.stringify(commentStore);
        expect(before).toBe(after);
    });

});

//
// ───────────────────────────────────────────────
//   TEST: setModalVisibility
// ───────────────────────────────────────────────
//
describe('setModalVisibility()', () => {

    test('setModalVisibility shows and hides modal correctly', () => {
        document.body.innerHTML = `<div id="modal"></div>`;
        const modal = document.getElementById('modal');

        setModalVisibility(true, modal);
        expect(modal.classList.contains('open')).toBe(true);

        setModalVisibility(false, modal);
        expect(modal.classList.contains('open')).toBe(false);
    });

    test('does nothing if modal is null', () => {
        expect(() => setModalVisibility(true, null)).not.toThrow();
    });
});
// 

describe('filterExamples()', () => {

    test('hides and shows elements correctly based on engine match', () => {
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

    test('shows all examples when engine = all', () => {
        document.body.innerHTML = `
            <div id="grid">
                <div class="example-card" data-engine="unity"></div>
                <div class="example-card" data-engine="unreal"></div>
            </div>
        `;
        const grid = document.getElementById('grid');

        filterExamples('all', 'all', grid);
        const cards = Array.from(grid.querySelectorAll('.example-card'));

        cards.forEach(card => {
            expect(card.style.display).toBe('block');
        });
    });

    test('handles missing grid gracefully', () => {
        expect(() => filterExamples('unity', 'all', null)).not.toThrow();
    });
});

describe('updateEngineTabs()', () => {

    test('sets correct active tab', () => {
        document.body.innerHTML = `
            <button class="engine-tab" data-engine="unity"></button>
            <button class="engine-tab" data-engine="unreal"></button>
        `;
        const tabs = Array.from(document.querySelectorAll('.engine-tab'));

        updateEngineTabs(tabs, 'unreal');

        expect(tabs[1].classList.contains('active')).toBe(true);
        expect(tabs[0].classList.contains('active')).toBe(false);
    });

    test('removes active class from all other tabs', () => {
        document.body.innerHTML = `
            <button class="engine-tab active" data-engine="unity"></button>
            <button class="engine-tab" data-engine="unreal"></button>
        `;
        const tabs = Array.from(document.querySelectorAll('.engine-tab'));

        updateEngineTabs(tabs, 'unreal');

        expect(tabs[0].classList.contains('active')).toBe(false);
        expect(tabs[1].classList.contains('active')).toBe(true);
    });

    test('does nothing if tabs list is empty', () => {
        expect(() => updateEngineTabs([], 'unity')).not.toThrow();
    });
});

//
// ───────────────────────────────────────────────
//   TEST: renderEnginePanel
// ───────────────────────────────────────────────
//
describe('renderEnginePanel()', () => {

    test('fills DOM elements correctly', () => {
        const titleEl = document.createElement('h3');
        const sumEl = document.createElement('p');
        const codeEl = document.createElement('pre');
        const linksEl = document.createElement('div');

        renderEnginePanel('health-system', 'unity', titleEl, sumEl, codeEl, linksEl);

        expect(titleEl.textContent).toContain('Unity');
        expect(sumEl.textContent.toLowerCase()).toContain('health');
        expect(linksEl.querySelector('a').href).toContain('unity3d');
    });

    test('handles unknown engine gracefully', () => {
        const titleEl = document.createElement('h3');
        const sumEl = document.createElement('p');
        const codeEl = document.createElement('pre');
        const linksEl = document.createElement('div');

        expect(() =>
            renderEnginePanel('health-system', 'unknown-engine', titleEl, sumEl, codeEl, linksEl)
        ).not.toThrow();
    });

});
describe('openConcept()', () => {

    test('fills modal with title/description and sets visible', () => {
        document.body.innerHTML = `<div id="modal"></div>`;
        const modal = document.getElementById('modal');

        const title = document.createElement('h2');
        const desc = document.createElement('p');

        openConcept('health-system', modal, title, desc);

        expect(title.textContent).toContain('Health System');
        expect(desc.textContent.toLowerCase()).toContain('health');
        expect(modal.classList.contains('open')).toBe(true);
    });

    test('fails silently if modal is missing', () => {
        const title = document.createElement('h2');
        const desc = document.createElement('p');

        expect(() =>
            openConcept('health-system', null, title, desc)
        ).not.toThrow();
    });

    test('handles unknown concept IDs safely', () => {
        document.body.innerHTML = `<div id="modal"></div>`;
        const modal = document.getElementById('modal');

        const title = document.createElement('h2');
        const desc = document.createElement('p');

        openConcept('something-unknown', modal, title, desc);

        expect(title.textContent.length).toBeGreaterThan(0); // fallback content
        expect(modal.classList.contains('open')).toBe(true);
    });

});
