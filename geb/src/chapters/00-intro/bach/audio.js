import { audible, midiFrequency, secondsPerBeat, noteEvents } from './score.js';

export class CanonAudio {
  constructor({ contextFactory = () => new AudioContext(), onEnded = () => {}, onError = () => {} } = {}) {
    this.contextFactory = contextFactory;
    this.onEnded = onEnded;
    this.onError = onError;
    this.nodes = new Set();
    this.gains = new Map();
    this.buffers = new Map();
    this.generation = 0;
    this.running = false;
  }
  async play(model) {
    this.stop();
    const generation = this.generation;
    this.context ||= this.contextFactory();
    await this.context.resume();
    if (generation !== this.generation) return false;
    if (this.context.state !== 'running') throw new Error('浏览器未能启动音频，请再次点击播放');
    this.buffer = null;
    if (model.piece.kind === 'audio') {
      const url = model.piece.audio.variants[model.rate];
      const controller = new AbortController();
      this.loading = controller;
      let buffer = this.buffers.get(url);
      if (!buffer) {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('录音加载失败，请点击播放重试');
        buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        if (generation !== this.generation) return false;
        const duration = model.piece.durationBeats * secondsPerBeat(model.piece, model.rate);
        if (Math.abs(buffer.duration - duration) > .04) throw new Error('录音长度与小节数据不一致');
      }
      this.buffers.delete(url);
      this.buffers.set(url, buffer);
      if (this.buffers.size > 3) this.buffers.delete(this.buffers.keys().next().value);
      this.buffer = buffer;
      this.loading = null;
    }
    this.model = model;
    this.startBeat = model.position >= model.length ? 0 : model.position;
    this.startTime = this.context.currentTime + .025;
    this.cursor = this.startBeat;
    this.running = true;
    this.master = this.context.createGain();
    // Fixed headroom, independent of mute/solo: changing voice count never boosts another voice.
    this.master.gain.value = .16;
    this.master.connect(this.context.destination);
    for (const track of model.tracks) {
      const gain = this.context.createGain();
      gain.gain.value = audible(track, model.soloId) ? track.volume / 100 : 0;
      gain.connect(this.master);
      this.gains.set(track.id, gain);
    }
    this.updateMix();
    this.tick();
    if (!this.running) return false;
    this.timer = setInterval(() => this.tick(), 25);
    return true;
  }
  position(absolute = false) {
    if (!this.running) return this.model?.position || 0;
    const beat = this.startBeat + Math.max(0, this.context.currentTime - this.startTime) / secondsPerBeat(this.model.piece, this.model.rate);
    return absolute ? beat : this.model.loop ? beat % this.model.length : Math.min(beat, this.model.length);
  }
  tick() {
    if (!this.running) return;
    try {
      const { piece, tracks, loop } = this.model;
      const beat = this.position(true);
      if (!loop && beat >= this.model.length) {
        this.stop(); this.onEnded(); return;
      }
      const spb = secondsPerBeat(piece, this.model.rate);
      const horizon = beat + .15 / spb;
      // Overlap only at initial resume; later windows select by original start.
      const events = noteEvents(piece, tracks, this.cursor, horizon, loop);
      for (const event of events) {
        if (this.cursor !== this.startBeat && event.sourceStart < this.cursor) continue;
        this.scheduleNote(event, spb);
      }
      this.cursor = horizon;
    } catch (error) { this.stop(); this.onError(error); }
  }
  scheduleNote(event, spb) {
    const ctx = this.context;
    const when = Math.max(ctx.currentTime, this.startTime + (event.start - this.startBeat) * spb);
    const end = this.startTime + (event.end - this.startBeat) * spb;
    if (end <= when) return;
    const source = this.buffer ? ctx.createBufferSource() : ctx.createOscillator();
    const envelope = ctx.createGain();
    if (this.buffer) source.buffer = this.buffer;
    else {
      source.type = 'triangle';
      source.frequency.value = midiFrequency(event.midi);
    }
    const attack = Math.min(this.buffer ? .008 : .004, (end - when) / 4);
    const release = Math.min(this.buffer ? .025 : .020, (end - when) / 4);
    const attackEnd = when + attack;
    const releaseStart = end - release;
    const peak = .7;
    const sustain = this.buffer ? peak : .32;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(peak, attackEnd);
    if (!this.buffer) {
      const decay = Math.min(.085, (releaseStart - attackEnd) / 2);
      envelope.gain.exponentialRampToValueAtTime(sustain, attackEnd + decay);
    }
    envelope.gain.setValueAtTime(sustain, releaseStart);
    envelope.gain.linearRampToValueAtTime(0, end);
    source.connect(envelope); envelope.connect(this.gains.get(event.trackId));
    const voice = { source, envelope };
    this.nodes.add(voice);
    source.onended = () => { source.disconnect(); envelope.disconnect(); this.nodes.delete(voice); };
    if (this.buffer) {
      const offset = (event.start - event.sourceStart) * spb + when - (this.startTime + (event.start - this.startBeat) * spb);
      source.start(when, Math.max(0, offset));
    } else source.start(when);
    source.stop(end);
  }
  updateMix() {
    if (!this.context || !this.model) return;
    for (const track of this.model.tracks) {
      const gain = this.gains.get(track.id)?.gain;
      if (!gain) continue;
      gain.cancelScheduledValues(this.context.currentTime);
      gain.setTargetAtTime(audible(track, this.model.soloId) ? track.volume / 100 : 0, this.context.currentTime, .008);
    }
  }
  stop() {
    this.generation++;
    this.loading?.abort();
    this.loading = null;
    this.running = false;
    clearInterval(this.timer);
    for (const { source, envelope } of this.nodes) {
      source.onended = null;
      try { source.stop(); } catch { /* Already ended. */ }
      source.disconnect(); envelope.disconnect();
    }
    this.nodes.clear();
    for (const gain of this.gains.values()) gain.disconnect();
    this.gains.clear();
    this.master?.disconnect();
  }
  async dispose() {
    this.stop();
    this.buffers.clear();
    this.buffer = null;
    if (this.context && this.context.state !== 'closed') await this.context.close();
  }
}
