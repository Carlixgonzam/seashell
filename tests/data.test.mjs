import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, events, stateNames } from '../src/data.js';

test('cada hito tiene identidad, fecha y evidencia', () => {
  assert.equal(new Set(events.map((event) => event.id)).size, events.length);
  for (const event of events) {
    assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(event.title && event.summary && event.change);
    assert.ok(event.sources.length > 0);
    assert.ok(Number.isInteger(event.impact) && event.impact >= 1 && event.impact <= 5);
    assert.ok(event.impactReason);
    assert.ok(event.filesChanged === null || Number.isInteger(event.filesChanged) && event.filesChanged > 0);
    if (event.filesChanged === null) assert.ok(event.metricNote);
    assert.ok(stateNames[event.state]);
    assert.ok(categories.some((category) => category.id === event.category));
    for (const source of event.sources) {
      assert.ok(source.label);
      if (source.href) assert.match(source.href, /^https:\/\/github\.com\/FLAGlab\/SCuLPTER\//);
    }
  }
});

test('la espiral mantiene el orden cronológico', () => {
  const dates = events.map((event) => event.date);
  assert.deepEqual(dates, [...dates].sort());
});
