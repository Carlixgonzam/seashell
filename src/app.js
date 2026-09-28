import { categories, categoryNames, events, stateNames } from './data.js';
import { initJournal } from './journal.js';

const namespace = 'http://www.w3.org/2000/svg';
const size = 900;
const center = size / 2;
const baseView = 760;
const zoomLevels = [1, 1.35, 1.75, 2.2];
const elements = {
  exploreToggle: document.querySelector('#explore-toggle'),
  explorePanel: document.querySelector('#explore-panel'),
  search: document.querySelector('#search'),
  categoryFilter: document.querySelector('#category-filter'),
  impactFilter: document.querySelector('#impact-filter'),
  reset: document.querySelector('#reset-filters'),
  emptyReset: document.querySelector('#empty-reset'),
  resultCount: document.querySelector('#result-count'),
  svg: document.querySelector('#spiral'),
  chambers: document.querySelector('#shell-chambers'),
  segments: document.querySelector('#spiral-segments'),
  nodes: document.querySelector('#spiral-nodes'),
  stage: document.querySelector('#map-stage'),
  tooltip: document.querySelector('#map-tooltip'),
  zoomIn: document.querySelector('#zoom-in'),
  zoomOut: document.querySelector('#zoom-out'),
  zoomLevel: document.querySelector('#zoom-level'),
  index: document.querySelector('#event-index'),
  date: document.querySelector('#event-date'),
  title: document.querySelector('#event-title'),
  summary: document.querySelector('#event-summary'),
  sources: document.querySelector('#event-sources'),
  change: document.querySelector('#event-change'),
  impactReason: document.querySelector('#event-impact-reason'),
  measure: document.querySelector('#event-measure'),
  content: document.querySelector('#detail-content'),
  empty: document.querySelector('#detail-empty'),
  previous: document.querySelector('#previous'),
  next: document.querySelector('#next'),
  stepCount: document.querySelector('#step-count'),
  spiralView: document.querySelector('#spiral-view'),
  journalView: document.querySelector('#journal-view'),
  navSpiral: document.querySelector('#nav-spiral'),
  navJournal: document.querySelector('#nav-journal')
};

const state = {
  category: 'all',
  query: '',
  minImpact: 1,
  selected: events.length - 1,
  visible: events.map((_, index) => index),
  zoomIndex: 0
};

const svgElement = (tag, attributes = {}) => {
  const element = document.createElementNS(namespace, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
};

const point = (angle, radius) => {
  const organicRadius = radius + Math.sin(angle * 2.7) * 3;
  return { x: center + Math.cos(angle) * organicRadius, y: center + Math.sin(angle) * organicRadius };
};

const geometry = [{ angle: -Math.PI / 2, radius: 22, ...point(-Math.PI / 2, 22) }];
events.forEach((event) => {
  const previous = geometry.at(-1);
  const angle = previous.angle + .77 + event.impact * .045;
  const radius = previous.radius * 1.09 + 6 + event.impact * .8;
  geometry.push({ angle, radius, ...point(angle, radius) });
});

const segmentPath = (index) => {
  const from = geometry[index];
  const to = geometry[index + 1];
  const points = [];
  for (let step = 0; step <= 36; step += 1) {
    const fraction = step / 36;
    const angle = from.angle + (to.angle - from.angle) * fraction;
    const radius = from.radius + (to.radius - from.radius) * fraction;
    const location = point(angle, radius);
    points.push(`${step ? 'L' : 'M'}${location.x.toFixed(2)} ${location.y.toFixed(2)}`);
  }
  return points.join(' ');
};

const lineWidth = (filesChanged) => filesChanged === null ? 1.7 : Math.min(6.2, 1.3 + Math.log2(filesChanged + 1) * .9);
const hideTooltip = () => { elements.tooltip.hidden = true; };

const positionTooltip = (event) => {
  const bounds = elements.stage.getBoundingClientRect();
  const tooltipWidth = Math.min(230, bounds.width - 20);
  const x = Math.min(bounds.width - tooltipWidth - 8, Math.max(8, event.clientX - bounds.left + 12));
  const y = Math.max(8, event.clientY - bounds.top - 38);
  elements.tooltip.style.left = `${x}px`;
  elements.tooltip.style.top = `${y}px`;
};

const makeMap = () => {
  events.forEach((event, index) => {
    const location = geometry[index + 1];
    if (index > 5 && event.impact >= 4) {
      const innerRadius = Math.max(35, location.radius * .5);
      const inner = point(location.angle, innerRadius);
      const control = point(location.angle + .22, (innerRadius + location.radius) / 2);
      elements.chambers.append(svgElement('path', {
        d: `M${inner.x.toFixed(2)} ${inner.y.toFixed(2)} Q${control.x.toFixed(2)} ${control.y.toFixed(2)} ${location.x.toFixed(2)} ${location.y.toFixed(2)}`,
        class: 'shell-chamber'
      }));
    }
    elements.segments.append(svgElement('path', {
      d: segmentPath(index),
      class: `spiral-segment ${event.filesChanged === null ? 'is-unmeasured' : ''}`,
      'stroke-width': lineWidth(event.filesChanged)
    }));
    const radius = 3.8 + event.impact * 1.6;
    const node = svgElement('g', {
      class: `map-node category-${event.category}`,
      transform: `translate(${location.x.toFixed(2)} ${location.y.toFixed(2)})`,
      role: 'button',
      tabindex: '0',
      'aria-label': `${index + 1}. ${event.title}. ${categoryNames[event.category]}. Relevancia ${event.impact} de 5.`,
      'aria-pressed': 'false'
    });
    node.append(svgElement('circle', { r: Math.max(30, radius + 12), class: 'node-hit' }));
    node.append(svgElement('circle', { r: radius + 11, class: 'node-ripple ripple-inner' }));
    node.append(svgElement('circle', { r: radius + 21, class: 'node-ripple ripple-outer' }));
    node.append(svgElement('circle', { r: radius, class: 'node-core' }));
    node.addEventListener('click', () => { hideTooltip(); select(index); });
    node.addEventListener('pointerenter', (pointerEvent) => {
      elements.tooltip.textContent = event.title;
      elements.tooltip.hidden = false;
      positionTooltip(pointerEvent);
    });
    node.addEventListener('pointermove', positionTooltip);
    node.addEventListener('pointerleave', hideTooltip);
    node.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault();
        select(index);
      } else if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowDown') {
        keyboardEvent.preventDefault();
        move(1);
      } else if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowUp') {
        keyboardEvent.preventDefault();
        move(-1);
      }
    });
    elements.nodes.append(node);
  });
};

const makeFilters = () => {
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.id === 'all' ? 'Todas' : category.label;
    elements.categoryFilter.append(option);
  });
};

const sourceNode = (source) => {
  const item = document.createElement(source.href ? 'a' : 'span');
  item.className = 'source-link';
  item.textContent = source.label.startsWith('vision-prototype/') ? source.label.split('/').at(-1) : source.label;
  item.title = source.label;
  if (source.href) {
    item.href = source.href;
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
  }
  return item;
};

const formatDate = (date) => new Intl.DateTimeFormat('es-CO', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${date}T00:00:00Z`));

const updateZoom = () => {
  const zoom = zoomLevels[state.zoomIndex];
  const width = baseView / zoom;
  const selected = state.selected >= 0 ? geometry[state.selected + 1] : { x: center, y: center };
  const x = Math.max(0, Math.min(size - width, selected.x - width / 2));
  const y = Math.max(0, Math.min(size - width, selected.y - width / 2));
  elements.svg.setAttribute('viewBox', `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${width.toFixed(2)}`);
  elements.zoomLevel.textContent = `${Math.round(zoom * 100)} %`;
  elements.zoomOut.disabled = state.zoomIndex === 0;
  elements.zoomIn.disabled = state.zoomIndex === zoomLevels.length - 1;
};

const select = (index) => {
  if (!state.visible.includes(index)) return;
  state.selected = index;
  const event = events[index];
  const position = state.visible.indexOf(index);
  elements.index.textContent = `${String(index + 1).padStart(2, '0')} / ${String(events.length).padStart(2, '0')}`;
  elements.date.textContent = formatDate(event.date);
  elements.title.textContent = event.title;
  elements.summary.textContent = event.summary;
  elements.sources.replaceChildren(...event.sources.map(sourceNode));
  elements.change.textContent = event.change;
  elements.impactReason.textContent = event.impactReason;
  elements.measure.textContent = `${categoryNames[event.category]} · ${stateNames[event.state]} · relevancia ${event.impact}/5${event.filesChanged === null ? '' : ` · ${event.filesChanged} archivos`}`;
  elements.previous.disabled = position === 0;
  elements.next.disabled = position === state.visible.length - 1;
  elements.stepCount.textContent = `${position + 1} de ${state.visible.length}`;
  elements.nodes.querySelectorAll('.map-node').forEach((node, nodeIndex) => {
    const active = nodeIndex === index;
    node.classList.toggle('is-selected', active);
    node.setAttribute('aria-pressed', String(active));
  });
  elements.segments.querySelectorAll('.spiral-segment').forEach((segment, segmentIndex) => {
    segment.classList.toggle('is-current', segmentIndex === index);
    segment.classList.toggle('is-past', segmentIndex < index);
  });
  updateZoom();
};

const move = (direction) => {
  const position = state.visible.indexOf(state.selected);
  const next = state.visible[position + direction];
  if (next !== undefined) select(next);
};

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

const applyFilters = () => {
  const query = normalize(state.query.trim());
  state.visible = events.map((event, index) => {
    const searchable = normalize([event.title, event.summary, event.change, categoryNames[event.category], event.date].join(' '));
    return (state.category === 'all' || event.category === state.category) && event.impact >= state.minImpact && (!query || searchable.includes(query)) ? index : null;
  }).filter((index) => index !== null);
  elements.nodes.querySelectorAll('.map-node').forEach((node, index) => {
    const visible = state.visible.includes(index);
    node.classList.toggle('is-filtered', !visible);
    node.setAttribute('aria-hidden', String(!visible));
    node.setAttribute('tabindex', visible ? '0' : '-1');
  });
  elements.segments.querySelectorAll('.spiral-segment').forEach((segment, index) => {
    segment.classList.toggle('is-filtered', !state.visible.includes(index));
  });
  elements.resultCount.textContent = `${state.visible.length} hitos`;
  elements.reset.hidden = state.category === 'all' && state.minImpact === 1 && !state.query.trim();
  const hasResults = state.visible.length > 0;
  elements.content.hidden = !hasResults;
  elements.empty.hidden = hasResults;
  if (hasResults) {
    select(state.visible.includes(state.selected) ? state.selected : state.visible.at(-1));
  } else {
    state.selected = -1;
    elements.nodes.querySelectorAll('.map-node').forEach((node) => node.classList.remove('is-selected'));
    elements.segments.querySelectorAll('.spiral-segment').forEach((segment) => segment.classList.remove('is-current'));
    elements.stepCount.textContent = '0 de 0';
    updateZoom();
  }
};

const resetFilters = () => {
  state.category = 'all';
  state.query = '';
  state.minImpact = 1;
  elements.categoryFilter.value = 'all';
  elements.impactFilter.value = '1';
  elements.search.value = '';
  applyFilters();
};

makeMap();
makeFilters();
elements.exploreToggle.addEventListener('click', () => {
  const expanded = elements.exploreToggle.getAttribute('aria-expanded') === 'true';
  elements.exploreToggle.setAttribute('aria-expanded', String(!expanded));
  elements.explorePanel.hidden = expanded;
  if (!expanded) elements.search.focus();
});
elements.categoryFilter.addEventListener('change', (event) => { state.category = event.target.value; applyFilters(); });
elements.impactFilter.addEventListener('change', (event) => { state.minImpact = Number(event.target.value); applyFilters(); });
elements.search.addEventListener('input', (event) => { state.query = event.target.value; applyFilters(); });
elements.reset.addEventListener('click', resetFilters);
elements.emptyReset.addEventListener('click', resetFilters);
elements.previous.addEventListener('click', () => move(-1));
elements.next.addEventListener('click', () => move(1));
elements.zoomIn.addEventListener('click', () => { state.zoomIndex = Math.min(zoomLevels.length - 1, state.zoomIndex + 1); updateZoom(); });
elements.zoomOut.addEventListener('click', () => { state.zoomIndex = Math.max(0, state.zoomIndex - 1); updateZoom(); });
applyFilters();

const showView = () => {
  const journal = location.hash === '#bitacora';
  elements.spiralView.hidden = journal;
  elements.journalView.hidden = !journal;
  elements.navSpiral.setAttribute('aria-current', journal ? 'false' : 'page');
  elements.navJournal.setAttribute('aria-current', journal ? 'page' : 'false');
};

initJournal({
  onOpenEvent: (id) => {
    const index = events.findIndex((event) => event.id === id);
    if (index >= 0) {
      resetFilters();
      select(index);
      location.hash = 'espiral';
      showView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});
window.addEventListener('hashchange', showView);
showView();
