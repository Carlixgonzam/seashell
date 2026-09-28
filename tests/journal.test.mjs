import test from 'node:test';
import assert from 'node:assert/strict';
import { events } from '../src/data.js';
import { playlistUrl, references } from '../src/journal-data.js';

test('las referencias de la bitácora apuntan a videos e hitos existentes', () => {
  const eventIds = new Set(events.map((event) => event.id));
  assert.match(playlistUrl, /^https:\/\/www\.youtube\.com\/playlist\?/);
  assert.equal(new Set(references.map((reference) => reference.id)).size, references.length);
  for (const reference of references) {
    assert.ok(reference.title && reference.question);
    assert.match(reference.videoUrl, /^https:\/\/www\.youtube\.com\/watch\?v=/);
    assert.ok(eventIds.has(reference.relatedEventId));
  }
});
