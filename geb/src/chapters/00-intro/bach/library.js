import tigers from './pieces/tigers.json';
import goldberg from './pieces/goldberg-variation-3.json';
import { prepareNotePiece, validateScore } from './score.js';

const candidates = [
  prepareNotePiece({ ...tigers, defaultVoiceDelayBars: 2, subtitle: '儿歌', type: '旋律 · 无歌词', available: true }),
  { id: 'yellow-river', title: '保卫黄河', defaultVoiceDelayBars: 1, subtitle: '合唱', type: '人声素材待定', available: false },
  prepareNotePiece({ ...goldberg, defaultVoiceDelayBars: 1, subtitle: '巴赫', type: '旋律 · 无歌词', available: true }),
  { id: 'dona', title: 'Dona Nobis Pacem', type: '人声素材待定', available: false },
];

const recordings = import.meta.glob('./pieces/recordings/*/recording.json', { eager: true, import: 'default' });
const assets = import.meta.glob('./pieces/recordings/*/*.wav', { eager: true, query: '?url', import: 'default' });
export const pieces = candidates.map(candidate => {
  if (candidate.available) return candidate;
  const directory = `./pieces/recordings/${candidate.id}/`;
  const recording = recordings[`${directory}recording.json`];
  if (!recording) return candidate;
  try {
    const variants = Object.fromEntries(Object.entries(recording.audio.variants).map(([rate, path]) => [rate, assets[directory + path.replace(/^\.\//, '')]]));
    return validateScore({ ...recording, id: candidate.id, title: candidate.title, defaultVoiceDelayBars: candidate.defaultVoiceDelayBars, subtitle: candidate.subtitle, type: recording.hasLyrics ? '人声 · 歌词' : '录音', audio: { variants }, available: true });
  } catch {
    return { ...candidate, type: '录音数据待核对' };
  }
});
