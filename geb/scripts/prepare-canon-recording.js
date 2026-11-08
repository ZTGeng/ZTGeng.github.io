import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { rates } from '../src/chapters/00-intro/bach/score.js';

const [input, directory, bpmText, barsText, startText = '0', meterText = '4'] = process.argv.slice(2);
const [tempoBpm, barCount, start, beats] = [bpmText, barsText, startText, meterText].map(Number);
const durationBeats = barCount * beats;
const duration = durationBeats * 60 / tempoBpm;
if (!input || !directory || !Number.isFinite(start) || start < 0 || !Number.isInteger(barCount) || !Number.isInteger(beats) || barCount < 1 || beats < 1 || !(duration >= .5 && duration <= 120)) {
  throw new Error('Usage: node scripts/prepare-canon-recording.js input.wav new-output-directory BPM bars [startSeconds] [beatsPerBar]');
}

const sampleRate = 24000;
function ffmpeg(args, stdin) {
  const result = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', ...args], { input: stdin, maxBuffer: 32 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}

const pcm = ffmpeg(['-ss', String(start), '-t', String(duration), '-i', resolve(input), '-ac', '1', '-ar', String(sampleRate), '-f', 'f32le', 'pipe:1']);
const samples = pcm.length / 4;
if (samples / sampleRate < duration - .04) throw new Error('源录音不足指定的小节长度');
const peakCount = 4096;
const waveformPeaks = Array.from({ length: peakCount }, (_, index) => {
  let peak = 0;
  for (let i = Math.floor(index * samples / peakCount); i < Math.floor((index + 1) * samples / peakCount); i++) peak = Math.max(peak, Math.abs(pcm.readFloatLE(i * 4)));
  return Math.min(1, peak);
});
const peak = Math.max(...waveformPeaks, .001);
const normalized = waveformPeaks.map(value => Number((value / peak).toFixed(4)));

// A fresh directory and FFmpeg's -n protect existing exports.
const output = resolve(directory);
mkdirSync(output);
const variants = {};
for (const rate of rates) {
  const name = `rate-${rate}.wav`;
  const length = duration / rate;
  const filters = [rate === 1 ? null : `atempo=${rate}`, 'apad', `atrim=duration=${length}`].filter(Boolean).join(',');
  ffmpeg(['-n', '-f', 'f32le', '-ar', String(sampleRate), '-ac', '1', '-i', 'pipe:0', '-af', filters, '-c:a', 'pcm_s16le', join(output, name)], pcm);
  variants[rate] = `./${name}`;
}
writeFileSync(join(output, 'recording.json'), JSON.stringify({ kind: 'audio', display: 'waveform', hasLyrics: false, tempoBpm, beats, bars: barCount, durationBeats, waveformPeaks: normalized, audio: { variants } }, null, 2) + '\n');
