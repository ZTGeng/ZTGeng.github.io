import { MeshStandardMaterial } from 'three';

// A round aperture shapes ONLY the incident illumination. The directional
// lights' ordinary shadow maps still determine every dark silhouette.
// Keeping the rays parallel preserves the exact three orthographic letters.
export function makeReceiverMaterial(color) {
  const material = new MeshStandardMaterial({
    color, roughness: 1, metalness: 0, emissive: 0x101216,
  });
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vReceiverPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvReceiverPosition = position.xy;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vReceiverPosition;')
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        float radius = length(vReceiverPosition);
        float aperture = 1.0 - smoothstep(0.50, 8.0, radius);
        float falloff = 1.0 - 1.0 * min(radius * radius / 64.0, 1.0);
        reflectedLight.directDiffuse *= aperture * falloff;
        reflectedLight.directSpecular *= aperture * falloff;
        reflectedLight.indirectDiffuse *= .025;
        reflectedLight.indirectSpecular *= .025;
      `);
  };
  material.customProgramCacheKey = () => 'geb-circular-incident-light-v5';
  return material;
}
