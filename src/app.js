import { categories, categoryNames, events, stateNames } from './data.js';

const svgNamespace = 'http://www.w3.org/2000/svg';
const canvasSize = 840;
const center = canvasSize / 2;
const zoomLevels = [1, 1.35, 1.75, 2.2];
const elements = {
  filters: document.querySelector('#filters'),
  search: document.querySelector('#search'),
  minImpact: document.querySelector('#min-impact'),
  impactOutput: document.querySelector('#impact-output'),
  resultCount: document.querySelector('#result-count'),
  totalEvents: document.querySelector('#total-events'),
  svg: document.querySelector('#spiral'),
  guides: document.querySelector('#spiral-guides'),
  segments: document.querySelector('#spiral-segments'),
  nodes: document.querySelector('#spiral-nodes'),
  stage: document.querySelector('#map-stage'),
  tooltip: document.querySelector('#map-tooltip'),
  zoomIn: document.querySelector('#zoom-in'),
  zoomOut: document.querySelector('#zoom-out'),
  zoomLevel: document.querySelector('#zoom-level'),
  scrubber: document.querySelector('#scrubber'),
  index: document.querySelector('#event-index'),
  date: document.querySelector('#event-date'),
  category: document.querySelector('#event-category'),
  title: document.querySelector('#detail-title'),
  summary: document.querySelector('#event-summary'),
  impact: document.querySelector('#event-impact'),
  impactFill: document.querySelector('#impact-fill'),
  impactReason: document.querySelector('#event-impact-reason'),
  status: document.querySelector('#event-status'),
  files: document.querySelector('#event-files'),
  change: document.querySelector('#event-change'),
  sources: document.querySelector('#event-sources'),
  content: document.querySelector('#detail-content'),
  empty: document.querySelector('#detail-empty'),
  previous: document.querySelector('#previous'),
  next: document.querySelector('#next'),
  stepCount: document.querySelector('#step-count')
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
  const element = document.createElementNS(svgNamespace, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
};

const geometry = [{ angle: -Math.PI / 2, radius: 16, x: center, y: center }];
events.forEach((event) => {
  const previous = geometry.at(-1);
  const angle = previous.angle + .73 + event.impact * .055;
  const radius = previous.radius + 10 + event.impact * 3.6;
  geometry.push({ angle, radius, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius });
});

const segmentPath = (index) => {
  const from = geometry[index];
  const to = geometry[index + 1];
  const commands = [];
  for (let step = 0; step <= 28; step += 1) {
    const fraction = step / 28;
    const angle = from.angle + (to.angle - from.angle) * fraction;
    const radius = from.radius + (to.radius - from.radius) * fraction;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    commands.push(`${step ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return commands.join(' ');
};

const lineWidth = (filesChanged) => filesChanged === null ? 2 : Math.min(7, 1.4 + Math.log2(filesChanged + 1) * 1.05);

const makeGuides = () => {
  [100, 200, 300, 390].forEach((radius) => {
    elements.guides.append(svgElement('circle', { cx: center, cy: center, r: radius, class: 'guide-ring' }));
  });
  const origin = svgElement('text', { x: center + 23, y: center + 4, class: 'guide-label' });
  origin.textContent = 'inicio';
  elements.guides.append(origin);
};

const moveTooltip = (pointerEvent) => {
  const bounds = elements.stage.getBoundingClientRect();
  const width = Math.min(230, bounds.width - 24);
  const x = Math.min(bounds.width - width - 10, Math.max(10, pointerEvent.clientX - bounds.left + 16));
  const y = Math.max(10, pointerEvent.clientY - bounds.top - 64);
  elements.tooltip.style.left = `${x}px`;
  elements.tooltip.style.top = `${y}px`;
};

const showTooltip = (pointerEvent, event) => {
  elements.tooltip.textContent = `${event.title} · relevancia ${event.impact}/5`;
  elements.tooltip.hidden = false;
  moveTooltip(pointerEvent);
};

const hideTooltip = () => { elements.tooltip.hidden = true; };

const makeMap = () => {
  makeGuides();
  events.forEach((event, index) => {
    const segment = svgElement('path', {
      d: segmentPath(index),
      class: `spiral-segment ${event.filesChanged === null ? 'is-unmeasured' : ''}`,
      'data-index': index,
      'stroke-width': lineWidth(event.filesChanged)
    });
    elements.segments.append(segment);

    const position = geometry[index + 1];
    const radius = 8 + event.impact * 2.5;
    const node = svgElement('g', {
      class: `map-node category-${event.category} state-${event.state}`,
      transform: `translate(${position.x.toFixed(2)} ${position.y.toFixed(2)})`,
      role: 'button',
      tabindex: '0',
      'aria-label': `${index + 1}. ${event.title}, relevancia ${event.impact} de 5`,
      'aria-pressed': 'false',
      'data-index': index
    });
    node.append(svgElement('circle', { r: Math.max(26, radius + 8), class: 'node-hit' }));
    node.append(svgElement('circle', { r: radius + 5, class: 'node-outline' }));
    if (event.category === 'finding') {
      node.append(svgElement('path', { d: `M0 ${-radius} L${radius} 0 L0 ${radius} L${-radius} 0 Z`, class: 'node-core' }));
    } else {
      node.append(svgElement('circle', { r: radius, class: 'node-core' }));
    }
    const number = svgElement('text', { x: 0, y: 4, 'text-anchor': 'middle', class: 'node-number' });
    number.textContent = String(index + 1);
    node.append(number);
    node.addEventListener('click', () => { hideTooltip(); select(index); });
    node.addEventListener('pointerenter', (pointerEvent) => showTooltip(pointerEvent, event));
    node.addEventListener('pointermove', moveTooltip);
    node.addEventListener('pointerleave', hideTooltip);
    node.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault();
        select(index);
      }
      if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowDown') {
        keyboardEvent.preventDefault();
        move(1);
      }
      if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowUp') {
        keyboardEvent.preventDefault();
        move(-1);
      }
    });
    elements.nodes.append(node);
  });
};

const makeFilters = () => {
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.setAttribute('aria-pressed', String(category.id === state.category));
    button.addEventListener('click', () => {
      state.category = category.id;
      applyFilters();
    });
    elements.filters.append(button);
  });
};

const sourceNode = (source) => {
  const item = document.createElement(source.href ? 'a' : 'span');
  item.className = 'source-link';
  item.textContent = source.label;
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
  const size = canvasSize / zoom;
  const position = state.selected >= 0 ? geometry[state.selected + 1] : { x: center, y: center };
  const x = Math.max(0, Math.min(canvasSize - size, position.x - size / 2));
  const y = Math.max(0, Math.min(canvasSize - size, position.y - size / 2));
  elements.svg.setAttribute('viewBox', `${x.toFixed(2)} ${y.toFixed(2)} ${size.toFixed(2)} ${size.toFixed(2)}`);
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
  elements.category.textContent = categoryNames[event.category];
  elements.title.textContent = event.title;
  elements.summary.textContent = event.summary;
  elements.impact.textContent = `${event.impact} / 5`;
  elements.impactFill.style.width = `${event.impact * 20}%`;
  elements.impactReason.textContent = event.impactReason;
  elements.status.textContent = stateNames[event.state];
  elements.files.textContent = event.filesChanged === null ? event.metricNote : `${event.filesChanged}${event.fileScope ? ` · ${event.fileScope}` : ''}`;
  elements.change.textContent = event.change;
  elements.sources.replaceChildren(...event.sources.map(sourceNode));
  elements.stepCount.textContent = `${position + 1} de ${state.visible.length}`;
  elements.previous.disabled = position === 0;
  elements.next.disabled = position === state.visible.length - 1;
  elements.scrubber.max = String(Math.max(0, state.visible.length - 1));
  elements.scrubber.value = String(position);
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
    const matchesCategory = state.category === 'all' || event.category === state.category;
    const searchable = normalize([event.title, event.summary, event.change, categoryNames[event.category], event.date].join(' '));
    return matchesCategory && event.impact >= state.minImpact && (!query || searchable.includes(query)) ? index : null;
  }).filter((index) => index !== null);
  elements.filters.querySelectorAll('.filter-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.category === state.category));
  });
  elements.nodes.querySelectorAll('.map-node').forEach((node, index) => {
    const visible = state.visible.includes(index);
    node.classList.toggle('is-filtered', !visible);
    node.setAttribute('aria-hidden', String(!visible));
    node.setAttribute('tabindex', visible ? '0' : '-1');
  });
  elements.segments.querySelectorAll('.spiral-segment').forEach((segment, index) => {
    segment.classList.toggle('is-filtered', !state.visible.includes(index));
  });
  elements.resultCount.textContent = `${state.visible.length} ${state.visible.length === 1 ? 'hito visible' : 'hitos visibles'}`;
  elements.impactOutput.textContent = String(state.minImpact);
  const hasResults = state.visible.length > 0;
  elements.content.hidden = !hasResults;
  elements.empty.hidden = hasResults;
  elements.previous.disabled = !hasResults;
  elements.next.disabled = !hasResults;
  elements.scrubber.disabled = !hasResults;
  if (hasResults) {
    select(state.visible.includes(state.selected) ? state.selected : state.visible.at(-1));
  } else {
    state.selected = -1;
    elements.index.textContent = '—';
    elements.stepCount.textContent = '0 de 0';
    elements.nodes.querySelectorAll('.map-node').forEach((node) => node.classList.remove('is-selected'));
    elements.segments.querySelectorAll('.spiral-segment').forEach((segment) => segment.classList.remove('is-current'));
    updateZoom();
  }
};

makeMap();
makeFilters();
elements.totalEvents.textContent = String(events.length);
elements.previous.addEventListener('click', () => move(-1));
elements.next.addEventListener('click', () => move(1));
elements.search.addEventListener('input', (event) => { state.query = event.target.value; applyFilters(); });
elements.minImpact.addEventListener('input', (event) => { state.minImpact = Number(event.target.value); applyFilters(); });
elements.scrubber.addEventListener('input', (event) => { select(state.visible[Number(event.target.value)]); });
elements.zoomIn.addEventListener('click', () => { state.zoomIndex = Math.min(zoomLevels.length - 1, state.zoomIndex + 1); updateZoom(); });
elements.zoomOut.addEventListener('click', () => { state.zoomIndex = Math.max(0, state.zoomIndex - 1); updateZoom(); });
applyFilters();
