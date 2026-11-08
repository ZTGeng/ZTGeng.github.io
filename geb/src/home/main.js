import '../../shared/geb.css';
import './style.css';
import './names.js';
import { createSculptureScene } from './scene.js';

const stage = document.getElementById('model-stage');
const status = document.getElementById('scene-status');
const reset = document.getElementById('reset');
const control = document.getElementById('sculpture-control');
let app;

async function start() {
  try {
    app = await createSculptureScene(stage);
    status.hidden = true;
    control.hidden = false;
    reset.disabled = false;
  } catch (error) {
    console.error('Unable to initialize GEB sculpture:', error);
    status.textContent = '三维场景暂时无法显示，请检查网络连接及浏览器的 WebGL 2 支持后刷新。';
    stage.classList.add('scene-unavailable');
  }
}

void start();
// Preserve the GPU context when returning via the back/forward cache.
window.addEventListener('pagehide', (event) => { if (!event.persisted) app?.dispose(); });
if (import.meta.hot) import.meta.hot.dispose(() => app?.dispose());
