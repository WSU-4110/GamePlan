
const conceptLibrary = {
  'health-system': {
    title: 'Health System',
    description: 'Manages health and damage for characters.',
    comments: [
      { author: 'Alice', role: 'Dev', time: '2 days ago', text: 'Works well for RPGs.' },
      { author: 'Bob', role: 'Tester', time: '1 week ago', text: 'Try adding healing over time.' }
    ],
    engines: {
      unity: {
        title: 'Unity Implementation',
        summary: 'Uses C# MonoBehaviour with event-driven health.',
        code: 'public class Health : MonoBehaviour {}',
        links: [{ label: 'Unity Docs', url: 'https://docs.unity3d.com' }]
      }
    }
  }
};

const commentStore = {};

function getComments(conceptId) {
  if (!commentStore[conceptId]) {
    const baseComments = conceptLibrary[conceptId]?.comments || [];
    commentStore[conceptId] = baseComments.map(c => ({ ...c }));
  }
  return commentStore[conceptId];
}

function setModalVisibility(isVisible, modalEl) {
  if (!modalEl) return;
  modalEl.setAttribute('aria-hidden', String(!isVisible));
  modalEl.classList.toggle('open', isVisible);
  if (isVisible) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
}

function filterExamples(engineFilterValue, categoryFilterValue, examplesGrid) {
  if (!examplesGrid) return;
  const allExamples = examplesGrid.querySelectorAll('.example-card');
  allExamples.forEach(example => {
    const engine = example.getAttribute('data-engine');
    const category = example.getAttribute('data-category');
    const show = (engineFilterValue === 'all' || engine === engineFilterValue) &&
                 (categoryFilterValue === 'all' || category === categoryFilterValue);
    example.style.display = show ? 'block' : 'none';
  });
}

function updateEngineTabs(engineTabs, activeEngine) {
  if (!engineTabs) return;
  engineTabs.forEach(tab => {
    const isActive = tab.dataset.engine === activeEngine;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

function renderEnginePanel(conceptId, engine, titleEl, summaryEl, codeEl, linksEl) {
  const concept = conceptLibrary[conceptId];
  const data = concept?.engines?.[engine];
  if (!data) return;
  titleEl.textContent = data.title;
  summaryEl.textContent = data.summary;
  codeEl.textContent = data.code;
  linksEl.innerHTML = '';
  data.links.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.label;
    linksEl.appendChild(a);
  });
}

function openConcept(conceptId, modalEl, titleEl, descEl) {
  const concept = conceptLibrary[conceptId];
  if (!concept) return;
  titleEl.textContent = concept.title;
  descEl.textContent = concept.description;
  setModalVisibility(true, modalEl);
}

module.exports = {
  conceptLibrary,
  commentStore,
  getComments,
  setModalVisibility,
  filterExamples,
  updateEngineTabs,
  renderEnginePanel,
  openConcept
};
