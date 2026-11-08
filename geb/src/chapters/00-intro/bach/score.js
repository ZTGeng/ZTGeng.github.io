export const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
export const midiFrequency = midi => 440 * 2 ** ((midi - 69) / 12);
export const secondsPerBeat = (piece, rate) => 60 / piece.tempoBpm / rate;
export const arrangementLength = (piece, tracks) => Math.max(...tracks.map(t => t.start * piece.beats + piece.durationBeats));
export const audible = (track, soloId) => !track.muted && (soloId === null || soloId === track.id);

// Note scores store time in quarter-note units, independent of their time signature.
export function prepareNotePiece(score) {
  const { numerator, denominator } = score.timeSignature;
  const beats = numerator * 4 / denominator;
  const pulseBeats = denominator === 8 && numerator >= 6 && numerator % 3 === 0 ? 1.5 : 1;
  const piece = validateScore({ ...score, beats, pulseBeats, bars: score.barCount });
  if (!score.repeats?.length) return piece;

  const notes = [];
  let nextBar = 1;
  let bars = 0;
  for (const { fromBar, toBar, times } of score.repeats) {
    if (fromBar !== nextBar || !Number.isInteger(toBar) || toBar < fromBar || toBar > score.barCount || !Number.isInteger(times) || times < 1) {
      throw new Error('反复小节范围无效');
    }
    const start = (fromBar - 1) * beats;
    const end = toBar * beats;
    const section = score.notes.filter(note => note.startBeat >= start && note.startBeat < end);
    for (let pass = 0; pass < times; pass++) {
      const offset = bars * beats - start;
      for (const note of section) notes.push({ ...note, startBeat: note.startBeat + offset });
      bars += toBar - fromBar + 1;
    }
    nextBar = toBar + 1;
  }
  if (nextBar !== score.barCount + 1) throw new Error('反复小节范围未覆盖曲谱');
  return validateScore({ ...piece, bars, notes, durationBeats: bars * beats });
}

export function validateScore(piece) {
  if (!(piece.tempoBpm > 0 && piece.beats > 0 && piece.durationBeats > 0)) throw new Error('曲目节拍数据无效');
  if (piece.kind === 'notes' && (!piece.notes?.length || piece.notes.some(n => !Number.isInteger(n.midi) || n.midi < 0 || n.midi > 127 || n.startBeat < 0 || !(n.durationBeats > 0) || n.startBeat + n.durationBeats > piece.durationBeats))) throw new Error('曲目音符数据无效');
  if (piece.kind === 'audio') {
    if (!rates.every(rate => piece.audio?.variants?.[rate])) throw new Error('曲目缺少变速录音');
    if (!piece.waveformPeaks?.length || piece.waveformPeaks.some(peak => !Number.isFinite(peak) || peak < 0 || peak > 1)) throw new Error('录音波形数据无效');
    if (piece.hasLyrics && (!piece.lyrics?.length || piece.lyrics.some(cue => typeof cue.text !== 'string' || !Number.isFinite(cue.startBeat) || cue.startBeat < 0 || !(cue.durationBeats > 0) || cue.startBeat + cue.durationBeats > piece.durationBeats))) throw new Error('录音歌词时间无效');
  }
  return piece;
}

// Half-open scheduling window; a resumed long note is clipped at the left edge.
export function noteEvents(piece, tracks, from, to, loop = false) {
  const length = arrangementLength(piece, tracks);
  const result = [];
  const firstCycle = loop ? Math.floor(from / length) : 0;
  const lastCycle = loop ? Math.floor(to / length) : 0;
  const segments = piece.kind === 'audio' ? [{ startBeat: 0, durationBeats: piece.durationBeats }] : piece.notes;
  for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
    for (const track of tracks) for (const [index, note] of segments.entries()) {
      const start = cycle * length + track.start * piece.beats + note.startBeat;
      const end = start + note.durationBeats;
      if (start < to && end > from) result.push({ trackId: track.id, index, midi: note.midi, sourceStart: start, start: Math.max(start, from), end: Math.min(end, (cycle + 1) * length) });
    }
  }
  return result;
}
