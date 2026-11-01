import {
  AmbientLight, Color, DirectionalLight, Group, Mesh,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, Scene, SRGBColorSpace,
  ACESFilmicToneMapping, WebGLRenderer,
} from 'three';
import { loadSculptureGeometry } from './geometry.js';
import { makeWoodMaterial } from './wood.js';
import { makeReceiverMaterial } from './receiver.js';
import { attachSculptureInteraction } from './interaction.js';
import { fitCamera, ROOM_HALF_SIZE } from './framing.js';

export async function createSculptureScene(stage) {
  const canvas = stage.querySelector('canvas');
  const geometry = await loadSculptureGeometry();
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) { geometry.dispose(); throw error; }
  renderer.setClearColor(0x17191d, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, .1, 100);
  fitCamera(camera, 1, 1);

  const sculpture = new Mesh(geometry, makeWoodMaterial());
  sculpture.name = 'GEB fixed visual hull';
  sculpture.castShadow = true;
  sculpture.receiveShadow = true;
  scene.add(sculpture);

  const room = new Group();
  room.name = 'Fixed perpendicular receivers';
  const extent = ROOM_HALF_SIZE;
  const planeGeometry = new PlaneGeometry(extent * 2, extent * 2);
  function receiver(name, color, position, rotation) {
    // Perfectly planar normals matter: the other two directional lights are
    // tangent to this face and therefore contribute no diffuse illumination.
    const material = makeReceiverMaterial(color);
    const plane = new Mesh(planeGeometry, material);
    plane.name = name;
    plane.position.set(...position);
    plane.rotation.set(...rotation);
    plane.receiveShadow = true;
    plane.castShadow = false;
    room.add(plane);
  }
  receiver('G / normal +X', 0xe2d4bb, [-extent,0,0], [0,Math.PI/2,0]);
  receiver('E / normal +Z', 0xece0ca, [0,0,-extent], [0,0,0]);
  receiver('B / normal +Y', 0xdbceb5, [0,-extent,0], [-Math.PI/2,0,0]);
  scene.add(room);
  scene.add(new AmbientLight(0xffe8cb, .28));

  const lights = [];
  for (const [axis, position, intensity] of [
    ['X', [8,0,0], 2.6], ['Z', [0,0,8], 2.8], ['Y', [0,8,0], 2.5],
  ]) {
    const light = new DirectionalLight(new Color(0xfff1da), intensity);
    light.name = `Orthographic ${axis} projection`;
    light.position.set(...position);
    light.castShadow = true;
    light.shadow.mapSize.set(window.innerWidth < 600 ? 1024 : 2048, window.innerWidth < 600 ? 1024 : 2048);
    // The mesh stays inside its radius-2.252 sphere at EVERY rotation.
    Object.assign(light.shadow.camera, { left: -2.65, right: 2.65, top: 2.65, bottom: -2.65, near: 4, far: 13 });
    light.shadow.camera.updateProjectionMatrix();
    light.shadow.bias = -.00012;
    light.shadow.normalBias = .008;
    light.shadow.radius = 1.4;
    scene.add(light, light.target);
    lights.push(light);
  }

  let frame = 0;
  let disposed = false;
  let visible = true;
  let contextLost = false;
  let shadowsDirty = true;
  let interaction;
  function invalidate(updateShadows = true) {
    shadowsDirty ||= updateShadows;
    if (!disposed && visible && !contextLost && !frame && !document.hidden) frame = requestAnimationFrame(render);
  }
  function render(now) {
    frame = 0;
    if (disposed || contextLost) return;
    const animating = interaction.update(now);
    renderer.shadowMap.needsUpdate = shadowsDirty || animating;
    renderer.render(scene, camera);
    shadowsDirty = false;
    if (animating) invalidate();
  }

  interaction = attachSculptureInteraction({ canvas, sculpture, camera, reset: stage.querySelector('#reset'), invalidate });
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    fitCamera(camera, width, height);
    invalidate(false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate(false);
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  intersectionObserver.observe(stage);
  const controller = new AbortController();
  const options = { signal: controller.signal };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) invalidate(false);
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, options);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const status = stage.querySelector('#scene-status');
    status.textContent = '图形上下文已暂停，正在等待浏览器恢复…';
    status.hidden = false;
  }, options);
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    stage.querySelector('#scene-status').hidden = true;
    invalidate();
  }, options);
  resize();

  return {
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      controller.abort(); interaction.dispose();
      geometry.dispose(); sculpture.material.dispose(); planeGeometry.dispose();
      room.children.forEach(mesh => mesh.material.dispose());
      lights.forEach(light => light.shadow.dispose());
      renderer.dispose();
    },
  };
}
