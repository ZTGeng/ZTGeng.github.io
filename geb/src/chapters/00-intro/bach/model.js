import { rates, arrangementLength } from './score.js';

const defaultAdditionalVolume = 70;

export class Arrangement {
  constructor(piece) {
    this.piece = piece;
    this.tracks = [];
    this.nextId = 1;
    this.resetVoices();
    this.rate = 1;
    this.loop = false;
    this.position = 0;
    this.status = 'stopped';
  }
  get length() { return arrangementLength(this.piece, this.tracks); }
  resetVoices() {
    this.tracks.splice(0, this.tracks.length, { id: this.nextId++, start: 0, volume: 80, muted: false });
    this.soloId = null;
    this.add();
  }
  defaultStartAfter(track) {
    return track.start + (this.piece.defaultVoiceDelayBars ?? 2);
  }
  add() {
    if (this.tracks.length === 5) return false;
    const start = this.defaultStartAfter(this.tracks.at(-1));
    this.tracks.push({ id: this.nextId++, start, volume: defaultAdditionalVolume, muted: false });
    return true;
  }
  remove(id) {
    const index = this.tracks.findIndex(t => t.id === id);
    if (this.tracks.length === 1 || index < 0) return false;
    this.tracks.splice(index, 1);
    if (this.soloId === id) this.soloId = null;
    this.position = Math.min(this.position, this.length);
    return true;
  }
  setStart(id, bar) {
    const track = this.tracks.find(t => t.id === id);
    if (track && Number.isFinite(bar)) track.start = Math.max(0, Math.round(bar));
  }
  setRate(rate) {
    if (!rates.includes(rate)) throw new Error('速度必须为 0.50×～2.00× 的七个档位');
    this.rate = rate;
  }
  select(piece) {
    if (!piece.available) return false;
    this.piece = piece;
    this.resetVoices();
    this.rewind();
    return true;
  }
  pause(position) { this.position = Math.max(0, Math.min(position, this.length)); this.status = 'paused'; }
  rewind() { this.position = 0; this.status = 'stopped'; }
  ended() { this.position = this.length; this.status = 'ended'; }
}
