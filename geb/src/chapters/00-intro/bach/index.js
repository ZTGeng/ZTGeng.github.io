import './style.css';

import { pieces } from './library.js';
import { Arrangement } from './model.js';
import { CanonAudio } from './audio.js';

const colors = ['#b8a4cf', '#98bbb0', '#d8b77b', '#91aec9', '#c89da9'];
const root = document.querySelector('[data-canon-demo]');

if (root) {
  const find = name => root.querySelector(`[data-canon-${name}]`);
  const library = find('library');
  const tracksElement = find('tracks');
  const timeline = root.querySelector('.canon-timeline');
  const status = find('status');
  const model = new Arrangement(pieces[0]);
  const tracks = model.tracks;
  let piece = model.piece;
  const playButton = find('play');
  const positionLabel = find('position');
  const playhead = root.querySelector('.canon-playhead');
  const seekHandle = find('seek');
  const barsElement = find('bars');
  const zoomOut = find('zoom-out');
  const zoomIn = find('zoom-in');
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const panel = root.closest('[role="tabpanel"]');
  const scroller = root.querySelector('.canon-timeline-scroll');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let attempt = 0;
  let loading = false;
  let noteRows = [];
  let lastPositionText = '';
  let zoomIndex = zoomLevels.indexOf(1);
  let seekDrag = null;

  function announce(message) { status.textContent = message; }

  function syncTransport() {
    const playing = model.status === 'playing';
    playButton.disabled = loading;
    find('play-icon').setAttribute('d', loading ? '' : playing ? 'M4 2.5h3v11H4z M9 2.5h3v11H9z' : 'M4 2.5v11L13 8z');
    find('play-text').textContent = loading ? '正在加载…' : playing ? '暂停' : '播放';
    seekHandle.setAttribute('aria-disabled', String(loading || playing));
    seekHandle.tabIndex = loading || playing ? -1 : 0;
  }

  function paint(beat, follow = false) {
    const bar = beat / piece.beats;
    const count = Number(timeline.style.getPropertyValue('--canon-bar-count'));
    playhead.style.setProperty('--canon-progress', Math.min(1, bar / count));
    const position = beat >= model.length ? '播放结束' : `第 ${Math.floor(bar) + 1} 小节`;
    if (model.status !== 'playing') {
      seekHandle.setAttribute('aria-valuemax', String(model.length));
      seekHandle.setAttribute('aria-valuenow', String(beat));
      const pulse = Math.floor((beat % piece.beats) / (piece.pulseBeats ?? 1)) + 1;
      seekHandle.setAttribute('aria-valuetext', beat >= model.length ? position : `${position}，第 ${pulse} 拍`);
    }
    if (position !== lastPositionText) {
      positionLabel.textContent = position;
      lastPositionText = position;
    }
    for (const row of noteRows) {
      const localBeat = beat - row.track.start * piece.beats;
      const events = piece.display === 'waveform' ? piece.lyrics || [] : piece.notes;
      const current = model.status === 'playing'
        ? events.findIndex(n => n.startBeat <= localBeat && localBeat < n.startBeat + n.durationBeats)
        : -1;
      if (row.active === current) continue;
      row.notes[row.active]?.classList.remove('is-sounding');
      row.notes[current]?.classList.add('is-sounding');
      row.active = current;
    }
    if (follow && !reducedMotion.matches && !scroller.matches(':focus-within')) {
      const x = playhead.offsetLeft;
      const controls = Number.parseFloat(getComputedStyle(timeline).getPropertyValue('--canon-control-width'));
      const right = scroller.scrollLeft + scroller.clientWidth;
      if (x > right - 18) scroller.scrollLeft += x - right + 40;
      else if (x < scroller.scrollLeft + controls) scroller.scrollLeft = Math.max(0, x - controls);
    }
  }

  const audio = new CanonAudio({
    onEnded() {
      model.ended();
      cancelAnimationFrame(frame);
      syncTransport();
      paint(model.position);
      announce('播放结束。');
    },
    onError(error) {
      pause();
      announce(error.message || '音频播放失败，请重试。');
    },
  });

  function animate() {
    if (model.status !== 'playing') return;
    paint(audio.position(), true);
    frame = requestAnimationFrame(animate);
  }

  function pause() {
    attempt++;
    const position = audio.running ? audio.position() : model.position;
    const wasActive = loading || model.status === 'playing';
    loading = false;
    audio.stop();
    cancelAnimationFrame(frame);
    if (wasActive) model.pause(position);
    syncTransport();
    paint(model.position);
  }

  function pauseForEdit() {
    pause();
    if (model.status === 'ended') model.rewind();
  }

  async function play() {
    const request = ++attempt;
    loading = true;
    syncTransport();
    try {
      if (!await audio.play(model) || request !== attempt) return;
      model.status = 'playing';
      loading = false;
      syncTransport();
      announce('正在播放。');
      animate();
    } catch (error) {
      if (request !== attempt) return;
      pause();
      announce(error.message || '音频加载失败，请点击播放重试。');
    }
  }

  function notes() {
    const low = Math.min(...piece.notes.map(note => note.midi));
    const high = Math.max(...piece.notes.map(note => note.midi));
    const range = Math.max(1, high - low);
    return `<svg class="canon-clip-art" viewBox="0 0 400 52" preserveAspectRatio="none" aria-hidden="true">${piece.notes.map(note => {
      const x = note.startBeat / piece.durationBeats * 400;
      const width = note.durationBeats / piece.durationBeats * 400;
      const y = 43 - (note.midi - low) / range * 37;
      return `<rect x="${x + .5}" y="${y}" width="${Math.max(1, width - 1)}" height="5" rx="1" fill="currentColor"/>`;
    }).join('')}</svg>`;
  }

  function waveform() {
    return '<svg class="canon-clip-art" data-canon-waveform preserveAspectRatio="none" aria-hidden="true" stroke="currentColor"><path vector-effect="non-scaling-stroke"/></svg>';
  }

  function drawWaveforms() {
    const waveforms = tracksElement.querySelectorAll('[data-canon-waveform]');
    const width = waveforms[0]?.getBoundingClientRect().width;
    if (!width) return;

    const peaks = piece.waveformPeaks;
    const barWidth = Number.parseFloat(getComputedStyle(timeline).getPropertyValue('--canon-bar-width'));
    // Match the 256 bars at minimum zoom, including the clip's two 1px borders.
    const spacing = (barWidth * piece.bars * zoomLevels[0] - 2) / 256;
    const strokeWidth = spacing * .7;
    const count = Math.max(1, Math.floor(width / spacing));
    const segments = [];
    for (let index = 0; index < count; index++) {
      const start = Math.floor(index * peaks.length / count);
      const end = Math.max(start + 1, Math.floor((index + 1) * peaks.length / count));
      let peak = 0;
      for (let sample = start; sample < end; sample++) peak = Math.max(peak, peaks[sample]);
      const halfHeight = Math.max(.5, peak * 24);
      const x = index * spacing + strokeWidth / 2;
      segments.push(`M${x.toFixed(3)} ${(26 - halfHeight).toFixed(3)}V${(26 + halfHeight).toFixed(3)}`);
    }
    const path = segments.join('');
    for (const svg of waveforms) {
      svg.setAttribute('viewBox', `0 0 ${width} 52`);
      svg.setAttribute('stroke-width', strokeWidth);
      svg.firstElementChild.setAttribute('d', path);
    }
  }

  function lyrics() {
    if (!piece.hasLyrics || !piece.lyrics?.length) return '';
    return `<span class="canon-clip-lyrics">${piece.lyrics.map(cue => {
      const label = document.createElement('span');
      label.textContent = cue.text;
      label.dataset.lyricCue = '';
      label.style.left = `${cue.startBeat / piece.durationBeats * 100}%`;
      label.style.width = `${cue.durationBeats / piece.durationBeats * 100}%`;
      return label.outerHTML;
    }).join('')}</span>`;
  }

  function renderTracks() {
    timeline.style.setProperty('--canon-beats', piece.beats / (piece.pulseBeats ?? 1));
    tracksElement.innerHTML = tracks.map((track, i) => `<div class="canon-track${track.muted ? ' is-muted' : ''}${model.soloId !== null && model.soloId !== track.id ? ' is-excluded' : ''}" data-track-id="${track.id}" style="--track-color:${colors[i]}">
      <div class="canon-track-controls">
        <div class="canon-track-name"><span class="canon-track-dot" aria-hidden="true"></span><strong>声部 ${i + 1}</strong><button class="canon-remove" type="button" data-track-action="remove" aria-label="删除声部 ${i + 1}"${tracks.length === 1 ? ' disabled' : ''}>×</button></div>
        <div class="canon-mix-controls"><button type="button" data-track-action="mute" aria-label="静音声部 ${i + 1}" aria-pressed="${track.muted}">静音</button><button type="button" data-track-action="solo" aria-label="独听声部 ${i + 1}" aria-pressed="${model.soloId === track.id}">独听</button></div>
        <label class="canon-volume"><span>音量</span><input type="range" min="0" max="100" value="${track.volume}" data-track-volume aria-label="声部 ${i + 1}音量"><output>${track.volume}%</output></label>
        <label class="canon-track-start"><span>开始</span><select data-track-start aria-label="声部 ${i + 1}开始小节"></select></label>
      </div>
      <div class="canon-track-lane"><button type="button" class="canon-clip" data-track-clip style="--clip-start:${track.start};--clip-bars:${piece.bars}" aria-label="声部 ${i + 1}，${piece.title}，第 ${track.start + 1} 小节开始，可用左右方向键调整开始小节">
        <span class="canon-clip-heading"><span><span class="canon-clip-grip" aria-hidden="true">⠿</span>${piece.title}</span><span>${piece.bars} 小节</span></span>
        ${piece.display === 'waveform' ? waveform() : notes()}
        ${lyrics()}
      </button></div>
    </div>`).join('');
    find('count').textContent = `${tracks.length} / 5 声部`;
    find('add').disabled = tracks.length >= 5;
    noteRows = [...tracksElement.querySelectorAll('[data-track-id]')].map((row, index) => ({
      track: tracks[index],
      notes: [...row.querySelectorAll(piece.display === 'waveform' ? '[data-lyric-cue]' : '.canon-clip-art rect')],
      active: -1,
    }));
    resizeTimeline();
  }

  function resizeTimeline(minimumBars = 8) {
    const bars = Math.max(minimumBars, ...tracks.map(track => track.start + piece.bars));
    timeline.style.setProperty('--canon-bar-count', bars);
    barsElement.innerHTML = Array.from({ length: bars }, (_, i) => `<span>${i + 1}</span>`).join('');
    const options = Array.from({ length: bars + 1 }, (_, i) => `<option value="${i}">第 ${i + 1} 小节</option>`).join('');
    tracksElement.querySelectorAll('[data-track-start]').forEach((select, index) => {
      if (select.length !== bars + 1) select.innerHTML = options;
      select.value = tracks[index].start;
    });
    syncZoomButtons();
    drawWaveforms();
    paint(audio.running ? audio.position() : model.position);
  }

  function syncZoomButtons() {
    zoomOut.disabled = zoomIndex === 0 || timeline.clientWidth <= scroller.clientWidth;
    zoomIn.disabled = zoomIndex === zoomLevels.length - 1;
  }

  function changeZoom(direction) {
    const before = barsElement.clientWidth;
    const scroll = scroller.scrollLeft;
    zoomIndex += direction;
    timeline.style.setProperty('--canon-zoom', zoomLevels[zoomIndex]);
    if (before) scroller.scrollLeft = scroll * barsElement.clientWidth / before;
    syncZoomButtons();
    drawWaveforms();
  }

  zoomOut.addEventListener('click', () => changeZoom(-1));
  zoomIn.addEventListener('click', () => changeZoom(1));
  new ResizeObserver(() => {
    syncZoomButtons();
    drawWaveforms();
  }).observe(scroller);

  function seek(beat) {
    model.pause(beat);
    paint(model.position);
  }

  function seekAt(clientX) {
    const { left, width } = barsElement.getBoundingClientRect();
    if (width > 0) seek((clientX - left) / width * barsElement.childElementCount * piece.beats);
  }

  function announcePosition() {
    announce(`播放起始位置：${seekHandle.getAttribute('aria-valuetext')}。`);
  }

  function canSeek() {
    return !loading && model.status !== 'playing';
  }

  seekHandle.addEventListener('pointerdown', event => {
    if (!canSeek() || seekDrag || !event.isPrimary || event.button !== 0) return;
    seekDrag = {
      id: event.pointerId,
      offset: event.clientX - playhead.getBoundingClientRect().left,
      position: model.position,
      status: model.status,
    };
    seekHandle.focus({ preventScroll: true });
    seekHandle.setPointerCapture(event.pointerId);
  });
  seekHandle.addEventListener('pointermove', event => {
    if (seekDrag?.id === event.pointerId && canSeek()) seekAt(event.clientX - seekDrag.offset);
  });
  function finishSeek(event) {
    if (seekDrag?.id !== event.pointerId) return;
    const drag = seekDrag;
    seekDrag = null;
    if (!canSeek()) return;
    if (event.type === 'pointerup') {
      seekAt(event.clientX - drag.offset);
      announcePosition();
    } else {
      model.position = drag.position;
      model.status = drag.status;
      paint(model.position);
    }
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    seekHandle.addEventListener(type, finishSeek);
  }
  seekHandle.addEventListener('keydown', event => {
    if (!canSeek()) return;
    const pulse = piece.pulseBeats ?? 1;
    const positions = { ArrowLeft: model.position - pulse, ArrowRight: model.position + pulse, Home: 0, End: model.length };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    seek(positions[event.key]);
    announcePosition();
  });
  barsElement.addEventListener('click', event => {
    if (!canSeek()) return;
    seekAt(event.clientX);
    announcePosition();
  });

  function renderSelection() {
    library.innerHTML = pieces.map(item => `<button type="button" class="canon-library-item" data-piece="${item.id}" aria-pressed="${item === piece}"${item.available ? '' : ' disabled'}><strong>${item.title}</strong><small>${item.type}</small></button>`).join('');
    find('library-count').textContent = `${pieces.filter(item => item.available).length} 首可播放`;
    find('piece').textContent = `${piece.title} · ${piece.subtitle}`;
    const meter = `${piece.timeSignature?.numerator ?? piece.beats}/${piece.timeSignature?.denominator ?? 4}`;
    const barCount = piece.repeats?.length ? `${piece.barCount} 小节（反复后 ${piece.bars} 小节）` : `${piece.bars} 小节`;
    find('piece-meta').textContent = `${barCount} · ${meter}`;
    find('meter').textContent = meter;
    renderTracks();
  }

  library.addEventListener('click', event => {
    const button = event.target.closest('[data-piece]');
    if (!button) return;
    const selection = pieces.find(item => item.id === button.dataset.piece);
    if (!selection?.available || selection === piece) return;
    pause();
    model.select(selection);
    piece = model.piece;
    scroller.scrollLeft = 0;
    renderSelection();
    // Preserve keyboard focus when replacing the selected library item.
    library.querySelector(`[data-piece="${piece.id}"]`).focus({ preventScroll: true });
    announce(`已选择《${piece.title}》。`);
  });

  find('add').addEventListener('click', () => {
    if (tracks.length >= 5) return;
    pauseForEdit();
    model.add();
    renderTracks();
    announce(`已添加《${piece.title}》的拷贝，当前共 ${tracks.length} 个声部。`);
  });

  tracksElement.addEventListener('click', event => {
    const button = event.target.closest('[data-track-action]');
    if (!button) return;
    const track = tracks.find(item => item.id === Number(button.closest('[data-track-id]').dataset.trackId));
    const action = button.dataset.trackAction;
    const oldIndex = tracks.indexOf(track);
    if (action === 'remove') {
      pauseForEdit();
      if (!model.remove(track.id)) return;
    } else if (action === 'mute') track.muted = !track.muted;
    else if (action === 'solo') model.soloId = model.soloId === track.id ? null : track.id;
    audio.updateMix();
    renderTracks();
    const target = action === 'remove'
      ? tracksElement.querySelectorAll('[data-track-action="remove"]')[Math.min(oldIndex, tracks.length - 1)]
      : tracksElement.querySelector(`[data-track-id="${track.id}"] [data-track-action="${action}"]`);
    target?.focus({ preventScroll: true });
    announce(action === 'remove' ? `已移除声部，当前共 ${tracks.length} 个声部。` : '已更新声部混音。');
  });

  tracksElement.addEventListener('input', event => {
    if (!event.target.matches('[data-track-volume]')) return;
    const track = tracks.find(item => item.id === Number(event.target.closest('[data-track-id]').dataset.trackId));
    track.volume = Number(event.target.value);
    event.target.nextElementSibling.value = `${track.volume}%`;
    audio.updateMix();
  });

  function setStart(track, start, clip) {
    const previous = track.start;
    model.setStart(track.id, start);
    if (previous !== track.start) model.position = Math.min(model.position, model.length);
    clip.style.setProperty('--clip-start', track.start);
    const row = clip.closest('[data-track-id]');
    row.querySelector('[data-track-start]').value = track.start;
    clip.setAttribute('aria-label', `${row.querySelector('strong').textContent}，${piece.title}，第 ${track.start + 1} 小节开始，可用左右方向键调整开始小节`);
  }

  tracksElement.addEventListener('change', event => {
    if (!event.target.matches('[data-track-start]')) return;
    const row = event.target.closest('[data-track-id]');
    const track = tracks.find(item => item.id === Number(row.dataset.trackId));
    pauseForEdit();
    setStart(track, Number(event.target.value), row.querySelector('[data-track-clip]'));
    resizeTimeline();
  });
  tracksElement.addEventListener('keydown', event => {
    const clip = event.target.closest('[data-track-clip]');
    if (!clip || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const track = tracks.find(item => item.id === Number(clip.closest('[data-track-id]').dataset.trackId));
    pauseForEdit();
    setStart(track, track.start + (event.key === 'ArrowRight' ? 1 : -1), clip);
    resizeTimeline();
    announce(`开始位置：第 ${track.start + 1} 小节。`);
  });

  tracksElement.addEventListener('pointerdown', event => {
    const clip = event.target.closest('[data-track-clip]');
    if (!clip || !event.isPrimary || event.button !== 0) return;
    const track = tracks.find(item => item.id === Number(clip.closest('[data-track-id]').dataset.trackId));
    const original = track.start;
    function barAt(clientX) {
      const { left, width } = barsElement.getBoundingClientRect();
      return (clientX - left) / width * barsElement.childElementCount;
    }
    const grabOffset = barAt(event.clientX) - original;
    let lastX = event.clientX;
    let dragFrame = 0;
    function updateDrag() {
      const next = Math.max(0, Math.round(barAt(lastX) - grabOffset));
      if (next === track.start) return;
      if (audio.running || loading || model.status === 'ended') pauseForEdit();
      setStart(track, next, clip);
      if (next + piece.bars > barsElement.childElementCount) resizeTimeline();
    }
    function edgeScroll() {
      const bounds = scroller.getBoundingClientRect();
      const controls = clip.closest('[data-track-id]').querySelector('.canon-track-controls').offsetWidth;
      const delta = lastX > bounds.right - 32 ? 8 : lastX < bounds.left + controls + 12 ? -8 : 0;
      if (delta > 0 && scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1) {
        resizeTimeline(barsElement.childElementCount + 1);
      }
      if (delta) { scroller.scrollLeft += delta; updateDrag(); }
      dragFrame = requestAnimationFrame(edgeScroll);
    }
    clip.setPointerCapture(event.pointerId);
    clip.classList.add('is-dragging');
    function move(e) {
      if (e.pointerId !== event.pointerId) return;
      lastX = e.clientX;
      updateDrag();
      if (!dragFrame) dragFrame = requestAnimationFrame(edgeScroll);
    }
    function finish(e) {
      if (e.pointerId !== event.pointerId) return;
      if (e.type === 'pointercancel' || e.type === 'lostpointercapture') setStart(track, original, clip);
      cancelAnimationFrame(dragFrame);
      clip.classList.remove('is-dragging');
      clip.removeEventListener('pointermove', move);
      clip.removeEventListener('pointerup', finish);
      clip.removeEventListener('pointercancel', finish);
      clip.removeEventListener('lostpointercapture', finish);
      if (clip.hasPointerCapture(event.pointerId)) clip.releasePointerCapture(event.pointerId);
      resizeTimeline();
      announce(`开始位置：第 ${track.start + 1} 小节。`);
    }
    clip.addEventListener('pointermove', move);
    clip.addEventListener('pointerup', finish);
    clip.addEventListener('pointercancel', finish);
    clip.addEventListener('lostpointercapture', finish);
  });

  const rate = find('rate');
  rate.addEventListener('input', () => {
    const value = Number(rate.value).toFixed(2);
    find('rate-value').value = `${value}×`;
    rate.setAttribute('aria-valuetext', `${value}倍`);
  });
  rate.addEventListener('change', () => {
    const resume = audio.running || loading;
    pause();
    model.setRate(Number(rate.value));
    announce(`整体速度 ${model.rate.toFixed(2)}×。`);
    if (resume) void play();
  });
  find('loop').addEventListener('click', event => {
    const resume = audio.running || loading;
    pause();
    model.loop = !model.loop;
    event.currentTarget.setAttribute('aria-pressed', String(model.loop));
    if (resume) void play();
  });
  playButton.addEventListener('click', () => {
    if (model.status === 'playing') {
      pause();
      announce('已暂停。');
    } else void play();
  });
  find('rewind').addEventListener('click', () => {
    pause();
    model.rewind();
    scroller.scrollLeft = 0;
    paint(0);
    announce('已回到开头。');
  });
  const pauseIfHidden = () => {
    if ((panel.hidden || document.hidden) && (loading || audio.running)) {
      pause();
      announce('已暂停。');
    }
  };
  new MutationObserver(pauseIfHidden).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', pauseIfHidden);
  window.addEventListener('pagehide', event => {
    pause();
    if (!event.persisted) void audio.dispose();
  });
  renderSelection();
  syncTransport();
}
