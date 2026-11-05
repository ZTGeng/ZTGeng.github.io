import './style.css';

// Layout samples only: these drawings are neither scores nor decoded recordings.
const pieces = [
  { id: 'yellow-river', title: '保卫黄河', subtitle: '唱段', type: '人声 · 歌词', vocal: true, beats: 4, bars: 4 },
  { id: 'tigers', title: '两只老虎', subtitle: '旋律', type: '旋律 · 音符', vocal: false, beats: 4, bars: 4 },
  { id: 'crab', title: '螃蟹卡农', subtitle: '器乐', type: '旋律 · 音符', vocal: false, beats: 4, bars: 4 },
  { id: 'dona', title: 'Dona Nobis Pacem', subtitle: '轮唱', type: '人声 · 歌词', vocal: true, beats: 3, bars: 4 },
];
const colors = ['#b8a4cf', '#98bbb0', '#d8b77b', '#91aec9', '#c89da9'];
const root = document.querySelector('[data-canon-demo]');

if (root) {
  const find = name => root.querySelector(`[data-canon-${name}]`);
  const library = find('library');
  const tracksElement = find('tracks');
  const timeline = root.querySelector('.canon-timeline');
  const lyricsToggle = find('lyrics');
  const status = find('status');
  const tracks = [{ id: 1, start: 0, volume: 80, muted: false }, { id: 2, start: 1, volume: 65, muted: false }];
  let nextId = 3;
  let piece = pieces[0];
  let view = 'waveform';
  let showLyrics = true;
  let soloId = null;

  function announce(message) { status.textContent = message; }

  function waveform() {
    return `<svg class="canon-clip-art" viewBox="0 0 400 52" preserveAspectRatio="none" aria-hidden="true">${Array.from({ length: 112 }, (_, i) => {
      const envelope = Math.pow(Math.sin((i % 28) / 28 * Math.PI), .6);
      const h = 3 + envelope * (5 + Math.abs(Math.sin(i * 1.71) * Math.cos(i * .31)) * 37);
      return `<rect x="${(i * 3.57).toFixed(2)}" y="${(26 - h / 2).toFixed(2)}" width="2" height="${h.toFixed(2)}" rx="1" fill="currentColor"/>`;
    }).join('')}</svg>`;
  }

  function notes() {
    const pitches = [0, 2, 4, 2, 5, 4, 2, 0, 2, 4, 7, 5, 2, 4, 2, 0];
    return `<svg class="canon-clip-art" viewBox="0 0 400 52" preserveAspectRatio="none" aria-hidden="true">${pitches.map((p, i) => `<rect x="${i * 25 + 3}" y="${42 - p * 4.7}" width="19" height="5" rx="1.5" fill="currentColor"/>`).join('')}</svg>`;
  }

  function renderTracks() {
    timeline.style.setProperty('--canon-beats', piece.beats);
    tracksElement.innerHTML = tracks.map((track, i) => `<div class="canon-track${track.muted ? ' is-muted' : ''}${soloId !== null && soloId !== track.id ? ' is-excluded' : ''}" data-track-id="${track.id}" style="--track-color:${colors[i]}">
      <div class="canon-track-controls">
        <div class="canon-track-name"><span class="canon-track-dot" aria-hidden="true"></span><strong>声部 ${i + 1}</strong><button class="canon-remove" type="button" data-track-action="remove" aria-label="删除声部 ${i + 1}"${tracks.length === 1 ? ' disabled' : ''}>×</button></div>
        <div class="canon-mix-controls"><button type="button" data-track-action="mute" aria-label="静音声部 ${i + 1}" aria-pressed="${track.muted}">静音</button><button type="button" data-track-action="solo" aria-label="独听声部 ${i + 1}" aria-pressed="${soloId === track.id}">独听</button></div>
        <label class="canon-volume"><span>音量</span><input type="range" min="0" max="100" value="${track.volume}" data-track-volume aria-label="声部 ${i + 1}音量"><output>${track.volume}%</output></label>
        <label class="canon-track-start"><span>开始</span><select data-track-start aria-label="声部 ${i + 1}开始小节">${Array.from({ length: 9 }, (_, n) => `<option value="${n}"${n === track.start ? ' selected' : ''}>第 ${n + 1} 小节</option>`).join('')}</select></label>
      </div>
      <div class="canon-track-lane"><button type="button" class="canon-clip" data-track-clip style="--clip-start:${track.start};--clip-bars:${piece.bars}" aria-label="声部 ${i + 1}，${piece.title}，第 ${track.start + 1} 小节开始，可用左右方向键调整开始小节">
        <span class="canon-clip-heading"><span><span class="canon-clip-grip" aria-hidden="true">⠿</span>${piece.title}</span><span>${piece.bars} 小节</span></span>
        ${view === 'waveform' ? waveform() : notes()}
        ${showLyrics && piece.vocal ? '<span class="canon-clip-lyrics"><span>歌词片段一</span><span>歌词片段二</span><span>歌词片段三</span><span>歌词片段四</span></span>' : ''}
      </button></div>
    </div>`).join('');
    find('count').textContent = `${tracks.length} / 5 声部`;
    find('add').disabled = tracks.length >= 5;
    resizeTimeline();
  }

  function resizeTimeline() {
    const bars = Math.max(8, ...tracks.map(track => track.start + piece.bars));
    timeline.style.setProperty('--canon-bar-count', bars);
    find('bars').innerHTML = Array.from({ length: bars }, (_, i) => `<span>${i + 1}</span>`).join('');
  }

  function renderSelection() {
    library.innerHTML = pieces.map(item => `<button type="button" class="canon-library-item" data-piece="${item.id}" aria-pressed="${item === piece}"><strong>${item.title}</strong><small>${item.type}</small></button>`).join('');
    find('piece').textContent = `${piece.title} · ${piece.subtitle}`;
    find('piece-meta').textContent = `${piece.bars} 小节 · ${piece.beats}/4`;
    find('meter').textContent = `${piece.beats}/4`;
    lyricsToggle.disabled = !piece.vocal;
    lyricsToggle.checked = showLyrics && piece.vocal;
    root.querySelectorAll('[data-canon-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.canonView === view)));
    renderTracks();
  }

  library.addEventListener('click', event => {
    const button = event.target.closest('[data-piece]');
    if (!button) return;
    piece = pieces.find(item => item.id === button.dataset.piece);
    view = piece.vocal ? 'waveform' : 'notes';
    showLyrics = piece.vocal;
    renderSelection();
    // Preserve keyboard focus when replacing the selected library item.
    library.querySelector(`[data-piece="${piece.id}"]`).focus({ preventScroll: true });
    announce(`已预览《${piece.title}》的${piece.vocal ? '波形与歌词' : '音符'}布局；所有声部使用同一曲目的拷贝。素材为排版示意。`);
  });

  root.querySelectorAll('[data-canon-view]').forEach(button => button.addEventListener('click', () => {
    view = button.dataset.canonView;
    root.querySelectorAll('[data-canon-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderTracks();
  }));
  lyricsToggle.addEventListener('change', () => { showLyrics = lyricsToggle.checked; renderTracks(); });

  find('add').addEventListener('click', () => {
    if (tracks.length >= 5) return;
    tracks.push({ id: nextId++, start: Math.min(8, tracks[tracks.length - 1].start + 1), volume: 70, muted: false });
    renderTracks();
    announce(`已添加《${piece.title}》的拷贝，当前共 ${tracks.length} 个声部。`);
  });

  tracksElement.addEventListener('click', event => {
    const button = event.target.closest('[data-track-action]');
    if (!button) return;
    const track = tracks.find(item => item.id === Number(button.closest('[data-track-id]').dataset.trackId));
    const action = button.dataset.trackAction;
    const oldIndex = tracks.indexOf(track);
    if (action === 'remove' && tracks.length > 1) {
      tracks.splice(oldIndex, 1);
      if (soloId === track.id) soloId = null;
    } else if (action === 'mute') track.muted = !track.muted;
    else if (action === 'solo') soloId = soloId === track.id ? null : track.id;
    renderTracks();
    const target = action === 'remove'
      ? tracksElement.querySelectorAll('[data-track-action="remove"]')[Math.min(oldIndex, tracks.length - 1)]
      : tracksElement.querySelector(`[data-track-id="${track.id}"] [data-track-action="${action}"]`);
    target?.focus({ preventScroll: true });
    announce(action === 'remove' ? `已移除声部，当前共 ${tracks.length} 个声部。` : '已更新声部的界面状态；当前预览不输出音频。');
  });

  tracksElement.addEventListener('input', event => {
    if (!event.target.matches('[data-track-volume]')) return;
    const track = tracks.find(item => item.id === Number(event.target.closest('[data-track-id]').dataset.trackId));
    track.volume = Number(event.target.value);
    event.target.nextElementSibling.value = `${track.volume}%`;
  });

  function setStart(track, start, clip) {
    track.start = Math.max(0, Math.min(8, start));
    clip.style.setProperty('--clip-start', track.start);
    const row = clip.closest('[data-track-id]');
    row.querySelector('[data-track-start]').value = track.start;
    clip.setAttribute('aria-label', `${row.querySelector('strong').textContent}，${piece.title}，第 ${track.start + 1} 小节开始，可用左右方向键调整开始小节`);
  }

  tracksElement.addEventListener('change', event => {
    if (!event.target.matches('[data-track-start]')) return;
    const row = event.target.closest('[data-track-id]');
    const track = tracks.find(item => item.id === Number(row.dataset.trackId));
    setStart(track, Number(event.target.value), row.querySelector('[data-track-clip]'));
    resizeTimeline();
  });
  tracksElement.addEventListener('keydown', event => {
    const clip = event.target.closest('[data-track-clip]');
    if (!clip || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const track = tracks.find(item => item.id === Number(clip.closest('[data-track-id]').dataset.trackId));
    setStart(track, track.start + (event.key === 'ArrowRight' ? 1 : -1), clip);
    resizeTimeline();
    announce(`开始位置：第 ${track.start + 1} 小节。`);
  });

  // UI-only placement preview; sound, playback scheduling and waveform decoding are not implemented.
  tracksElement.addEventListener('pointerdown', event => {
    const clip = event.target.closest('[data-track-clip]');
    if (!clip || !event.isPrimary || event.button !== 0) return;
    const track = tracks.find(item => item.id === Number(clip.closest('[data-track-id]').dataset.trackId));
    const original = track.start;
    const originX = event.clientX;
    const barWidth = clip.parentElement.clientWidth / Number(timeline.style.getPropertyValue('--canon-bar-count'));
    clip.setPointerCapture(event.pointerId);
    clip.classList.add('is-dragging');
    function move(e) {
      if (e.pointerId !== event.pointerId) return;
      setStart(track, original + Math.round((e.clientX - originX) / barWidth), clip);
    }
    function finish(e) {
      if (e.pointerId !== event.pointerId) return;
      if (e.type === 'pointercancel' || e.type === 'lostpointercapture') setStart(track, original, clip);
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

  root.querySelectorAll('[data-canon-rate]').forEach(button => button.addEventListener('click', () => {
    root.querySelectorAll('[data-canon-rate]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    announce(`整体速度：${button.dataset.canonRate}×，应用于所有声部。当前预览不输出音频。`);
  }));
  find('loop').addEventListener('click', event => {
    const button = event.currentTarget;
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  });
  find('play').addEventListener('click', () => announce('当前为 UI 预览，尚未接入音频播放。'));
  find('rewind').addEventListener('click', () => announce('播放位置：第 1 小节。声部的开始位置保持不变。'));
  renderSelection();
}
