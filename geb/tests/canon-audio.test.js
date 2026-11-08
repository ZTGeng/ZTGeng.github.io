import test from 'node:test';
import assert from 'node:assert/strict';
import { CanonAudio } from '../src/chapters/00-intro/bach/audio.js';
import { Arrangement } from '../src/chapters/00-intro/bach/model.js';
const piece = { beats: 4, durationBeats: 4, tempoBpm: 60, notes: [{ midi: 69, startBeat: 0, durationBeats: 2 }, { midi: 72, startBeat: 2, durationBeats: 2 }] };
function context() {
  const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime(v) { this.value = v; } });
  return { currentTime: 0, state: 'running', destination: {}, oscillators: [],
    async resume() {}, async close() { this.state = 'closed'; },
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} }; },
    createOscillator() { const node = { frequency: parameter(), connect() {}, disconnect() {}, start(t) { this.startTime = t; }, stop(t) { this.endTime = t; } }; this.oscillators.push(node); return node; },
  };
}
test('audio-clock scheduling preserves pitch, clips resumed long notes and never reschedules overlaps', async t => {
  const ctx = context(), model = new Arrangement(piece); model.tracks.splice(1); model.position = 1;
  const engine = new CanonAudio({ contextFactory: () => ctx });
  t.after(() => engine.dispose());
  await engine.play(model);
  assert.equal(ctx.oscillators[0].frequency.value, 440);
  assert(Math.abs(ctx.oscillators[0].endTime - ctx.oscillators[0].startTime - 1) < 1e-8);
  ctx.currentTime = .1; engine.tick(); assert.equal(ctx.oscillators.length, 1);
  assert(Math.abs(engine.position() - 1.075) < 1e-8);
  engine.stop(); assert.equal(engine.nodes.size, 0);
});
test('seven-rate scheduling changes duration but not frequency; mute/solo keep independent volume', async () => {
  for (const rate of [.5, .75, 1, 1.25, 1.5, 1.75, 2]) {
    const ctx = context(), model = new Arrangement(piece); model.setRate(rate);
    const engine = new CanonAudio({ contextFactory: () => ctx });
    await engine.play(model);
    assert.equal(ctx.oscillators[0].frequency.value, 440);
    assert(Math.abs(ctx.oscillators[0].endTime - ctx.oscillators[0].startTime - 2 / rate) < 1e-8);
    model.soloId = 2; engine.updateMix(); assert.equal(engine.gains.get(1).gain.value, 0);
    model.soloId = null; model.tracks[1].muted = true; engine.updateMix();
    assert.equal(engine.gains.get(1).gain.value, .8); assert.equal(engine.gains.get(2).gain.value, 0);
    await engine.dispose(); assert.equal(ctx.state, 'closed');
  }
});
test('stopping during audio resume cancels the pending play', async () => {
  const ctx = context(); let resume; ctx.resume = () => new Promise(resolve => { resume = resolve; });
  const engine = new CanonAudio({ contextFactory: () => ctx });
  const pending = engine.play(new Arrangement(piece)); engine.stop(); resume();
  assert.equal(await pending, false); assert.equal(engine.running, false);
});

test('recorded voices share one decoded rate variant and resume at the matching source offset', async t => {
  const ctx = context();
  const buffer = { duration: 2 };
  ctx.decodeAudioData = async () => buffer;
  const sources = [];
  ctx.createBufferSource = () => {
    const source = { connect() {}, disconnect() {}, stop() {}, start(when, offset) { this.offset = offset; } };
    sources.push(source);
    return source;
  };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }));
  const model = new Arrangement({ ...piece, kind: 'audio', audio: { variants: { 2: '/rate-2.wav' } } });
  model.setStart(2, 0);
  model.setRate(2);
  model.pause(1);
  const engine = new CanonAudio({ contextFactory: () => ctx });
  t.after(() => engine.dispose());
  assert(await engine.play(model));
  assert.equal(sources.length, 2);
  for (const source of sources) {
    assert.equal(source.buffer, buffer);
    assert(Math.abs(source.offset - .5) < 1e-8);
  }
  assert(await engine.play(model));
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('loop schedules the next cycle once and non-loop playback releases sources at the end', async t => {
  const ctx = context();
  const model = new Arrangement(piece);
  model.remove(2);
  model.loop = true;
  let ended = 0;
  const engine = new CanonAudio({ contextFactory: () => ctx, onEnded: () => ended++ });
  t.after(() => engine.dispose());
  await engine.play(model);
  ctx.currentTime = 3.95;
  engine.tick();
  const atBoundary = () => ctx.oscillators.filter(source => Math.abs(source.startTime - 4.025) < 1e-8);
  assert.equal(atBoundary().length, 1);
  ctx.currentTime = 4.05;
  engine.tick();
  assert.equal(atBoundary().length, 1);
  assert(Math.abs(engine.position() - .025) < 1e-8);
  assert.equal(ended, 0);

  model.loop = false;
  ctx.currentTime = 0;
  await engine.play(model);
  ctx.currentTime = 4.05;
  engine.tick();
  assert.equal(ended, 1);
  assert.equal(engine.running, false);
  assert.equal(engine.nodes.size, 0);
});
