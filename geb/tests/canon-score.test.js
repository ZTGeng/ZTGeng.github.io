import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareNotePiece, validateScore, noteEvents, arrangementLength, midiFrequency, secondsPerBeat } from '../src/chapters/00-intro/bach/score.js';
const data = JSON.parse(readFileSync(new URL('../src/chapters/00-intro/bach/pieces/tigers.json', import.meta.url)));
const piece = { ...data, beats: 4 };
test('real tigers melody has 32 contiguous notes across eight complete bars', () => {
  validateScore(piece);
  assert.equal(piece.notes.length, 32);
  let beat = 0;
  for (const note of piece.notes) { assert.equal(note.startBeat, beat); beat += note.durationBeats; }
  assert.equal(beat, 32);
  assert.equal(piece.hasLyrics, false);
  assert.equal(midiFrequency(69), 440);
});
test('note scheduling resumes held notes and preserves delayed copies at loop boundaries', () => {
  const tracks = [{ id: 1, start: 0 }, { id: 2, start: 2 }];
  assert.equal(arrangementLength(piece, tracks), 40);
  assert.equal(noteEvents(piece, tracks, 10.5, 11)[0].start, 10.5);
  const events = noteEvents(piece, tracks, 39.5, 40.5, true);
  assert(events.some(e => e.trackId === 2 && e.end === 40));
  assert(events.some(e => e.trackId === 1 && e.start === 40));
  assert.equal(noteEvents(piece, tracks, 40, 41).length, 0);
});

test('Goldberg Variation 3 uses six quarter-note units per bar and repeats each eight-bar section separately', () => {
  const original = JSON.parse(readFileSync(new URL('../src/chapters/00-intro/bach/pieces/goldberg-variation-3.json', import.meta.url)));
  const score = prepareNotePiece(original);
  assert.equal(original.notes.length, 163);
  assert.equal(score.beats, 6);
  assert.equal(score.pulseBeats, 1.5);
  assert.equal(score.barCount, 16);
  assert.equal(score.bars, 32);
  assert.equal(score.notes.length, 326);
  assert.equal(score.durationBeats * secondsPerBeat(score, 1), 120);
  const first = original.notes.filter(note => note.startBeat < 48);
  const second = original.notes.filter(note => note.startBeat >= 48);
  const shift = (notes, offset) => notes.map(note => ({ ...note, startBeat: note.startBeat + offset }));
  assert.deepEqual(score.notes, [...first, ...shift(first, 48), ...shift(second, 48), ...shift(second, 96)]);
  const tracks = [{ id: 1, start: 0 }, { id: 2, start: 1 }];
  assert.equal(noteEvents(score, tracks, 6, 6.25).find(event => event.trackId === 2).start, 6);
  assert.deepEqual(original.notes[0], { midi: 71, startBeat: 0, durationBeats: 1.75 });
  const [held] = noteEvents(score, tracks.slice(0, 1), 24, 24.25);
  assert.equal(held.midi, 74);
  assert.equal(held.sourceStart, 23.5);
  assert.equal(held.end, 24.25);
  assert.equal(noteEvents(score, tracks.slice(0, 1), 11, 11.25).length, 0);
  assert.equal(noteEvents(score, tracks.slice(0, 1), 59, 59.25).length, 0);
});
