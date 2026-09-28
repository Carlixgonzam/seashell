import { references } from './journal-data.js';

const storageKey = 'seashell.journal.v1';
const statuses = new Set(['unread', 'reading', 'applied']);
const referenceIds = new Set(references.map((reference) => reference.id));
const elements = {
  list: document.querySelector('#journal-list'),
  add: document.querySelector('#journal-add'),
  position: document.querySelector('#journal-position'),
  status: document.querySelector('#journal-status'),
  title: document.querySelector('#journal-title'),
  titleInput: document.querySelector('#journal-title-input'),
  question: document.querySelector('#journal-question'),
  video: document.querySelector('#journal-video'),
  related: document.querySelector('#journal-related'),
  note: document.querySelector('#journal-note'),
  evidence: document.querySelector('#journal-evidence'),
  evidenceLink: document.querySelector('#journal-evidence-link'),
  urlLabel: document.querySelector('#journal-url-label'),
  urlInput: document.querySelector('#journal-url-input'),
  saved: document.querySelector('#journal-saved'),
  delete: document.querySelector('#journal-delete'),
  export: document.querySelector('#journal-export'),
  import: document.querySelector('#journal-import'),
  importFile: document.querySelector('#journal-import-file')
};

const emptyRecord = () => ({ status: 'unread', note: '', evidence: '' });
const validUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const cleanRecord = (value) => ({
  status: statuses.has(value?.status) ? value.status : 'unread',
  note: typeof value?.note === 'string' ? value.note.slice(0, 100000) : '',
  evidence: typeof value?.evidence === 'string' ? value.evidence.slice(0, 2048) : ''
});

const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const notes = {};
    Object.entries(saved.notes || {}).forEach(([id, record]) => {
      if (referenceIds.has(id) || /^custom-[a-zA-Z0-9-]+$/.test(id)) notes[id] = cleanRecord(record);
    });
    const custom = Array.isArray(saved.custom) ? saved.custom.slice(0, 200).flatMap((page) => {
      if (!/^custom-[a-zA-Z0-9-]+$/.test(page?.id || '')) return [];
      return [{ id: page.id, title: typeof page.title === 'string' ? page.title.slice(0, 120) : '', videoUrl: typeof page.videoUrl === 'string' ? page.videoUrl.slice(0, 2048) : '' }];
    }) : [];
    return { notes, custom, selected: typeof saved.selected === 'string' ? saved.selected : references[0].id };
  } catch {
    return { notes: {}, custom: [], selected: references[0].id };
  }
};

const state = readState();
const pages = () => [...references, ...state.custom];
const selectedPage = () => pages().find((page) => page.id === state.selected) || references[0];
const currentRecord = () => state.notes[state.selected] || emptyRecord();

const save = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    elements.saved.textContent = 'Guardado';
  } catch {
    elements.saved.textContent = 'No se pudo guardar. Exporta tus notas.';
  }
};

const growNote = () => {
  elements.note.style.height = 'auto';
  elements.note.style.height = `${Math.max(240, elements.note.scrollHeight)}px`;
};

const updateEvidenceLink = () => {
  const url = validUrl(elements.evidence.value);
  elements.evidenceLink.hidden = !url;
  if (url) elements.evidenceLink.href = url;
  else elements.evidenceLink.removeAttribute('href');
};

const renderList = () => {
  const nodes = pages().map((page, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'journal-list-item';
    button.classList.toggle('is-selected', page.id === state.selected);
    button.setAttribute('aria-current', page.id === state.selected ? 'page' : 'false');
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.textContent = page.title || 'Sin título';
    button.append(number, title);
    button.addEventListener('click', () => selectPage(page.id));
    return button;
  });
  elements.list.replaceChildren(...nodes);
};

const renderPage = () => {
  const page = selectedPage();
  state.selected = page.id;
  const custom = state.custom.some((item) => item.id === page.id);
  const record = currentRecord();
  const position = pages().findIndex((item) => item.id === page.id) + 1;
  elements.position.textContent = `${String(position).padStart(2, '0')} / ${String(pages().length).padStart(2, '0')}`;
  elements.status.value = record.status;
  elements.title.hidden = custom;
  elements.titleInput.hidden = !custom;
  elements.title.textContent = page.title;
  elements.titleInput.value = page.title;
  elements.question.hidden = custom;
  elements.question.textContent = page.question || '';
  const videoUrl = validUrl(page.videoUrl);
  elements.video.hidden = !videoUrl;
  if (videoUrl) elements.video.href = videoUrl;
  else elements.video.removeAttribute('href');
  elements.related.hidden = !page.relatedEventId;
  elements.related.dataset.eventId = page.relatedEventId || '';
  elements.note.value = record.note;
  elements.evidence.value = record.evidence;
  updateEvidenceLink();
  elements.urlLabel.hidden = !custom;
  elements.urlInput.hidden = !custom;
  elements.urlInput.value = custom ? page.videoUrl : '';
  elements.delete.hidden = !custom;
  elements.saved.textContent = 'Guardado';
  requestAnimationFrame(growNote);
  renderList();
};

const selectPage = (id) => {
  if (!pages().some((page) => page.id === id)) return;
  state.selected = id;
  renderPage();
  save();
};

const updateRecord = (changes) => {
  state.notes[state.selected] = { ...currentRecord(), ...changes };
  save();
};

export const initJournal = ({ onOpenEvent }) => {
  elements.add.addEventListener('click', () => {
    const page = { id: `custom-${crypto.randomUUID()}`, title: '', videoUrl: '' };
    state.custom.push(page);
    selectPage(page.id);
    elements.titleInput.focus();
  });
  elements.status.addEventListener('change', () => updateRecord({ status: elements.status.value }));
  elements.note.addEventListener('input', () => { updateRecord({ note: elements.note.value }); growNote(); });
  elements.evidence.addEventListener('input', () => { updateRecord({ evidence: elements.evidence.value }); updateEvidenceLink(); });
  elements.titleInput.addEventListener('input', () => {
    const page = state.custom.find((item) => item.id === state.selected);
    if (!page) return;
    page.title = elements.titleInput.value;
    renderList();
    save();
  });
  elements.urlInput.addEventListener('change', () => {
    const page = state.custom.find((item) => item.id === state.selected);
    if (!page) return;
    page.videoUrl = elements.urlInput.value.trim();
    renderPage();
    save();
  });
  elements.related.addEventListener('click', () => onOpenEvent(elements.related.dataset.eventId));
  elements.delete.addEventListener('click', () => {
    if (!window.confirm('¿Eliminar esta página de la bitácora?')) return;
    state.custom = state.custom.filter((page) => page.id !== state.selected);
    delete state.notes[state.selected];
    state.selected = references[0].id;
    renderPage();
    save();
  });
  elements.export.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ schema: 'seashell-journal-v1', exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seashell-bitacora-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  elements.import.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', async () => {
    const file = elements.importFile.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('too-large');
      const imported = JSON.parse(await file.text());
      if (imported.schema !== 'seashell-journal-v1') throw new Error('invalid-schema');
      if (!window.confirm('¿Reemplazar las notas actuales con este archivo?')) {
        elements.importFile.value = '';
        return;
      }
      const cleaned = JSON.parse(JSON.stringify({ notes: imported.notes, custom: imported.custom, selected: imported.selected }));
      localStorage.setItem(storageKey, JSON.stringify(cleaned));
      const restored = readState();
      state.notes = restored.notes;
      state.custom = restored.custom;
      state.selected = restored.selected;
      renderPage();
      save();
      elements.saved.textContent = 'Importado';
    } catch {
      elements.saved.textContent = 'No se pudo importar el archivo.';
    }
    elements.importFile.value = '';
  });
  renderPage();
};
