import { MeshStandardMaterial } from 'three';

// Object-space grain follows the wood as it turns. This only colors the actual
// mesh: there are no glyph images, silhouette textures or custom shadow shaders.
export function makeWoodMaterial() {
  const material = new MeshStandardMaterial({ color: 0xffffff, roughness: .83, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWoodPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWoodPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWoodPosition;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 p = vWoodPosition;
        float warp = sin(p.y * 2.6 + p.z * 1.8) * .035 + sin(p.y * 7.0) * .008;
        float ring = length(vec2(p.x + 2.4 + warp, p.z * 1.7 + 1.1));
        float grain = .5 + .5 * sin(ring * 92.0 + sin(ring * 17.0) * 1.5);
        float fiber = .5 + .5 * sin((ring + warp * .12) * 620.0 + p.y * 2.0);
        float tone = .48 + grain * .23 + fiber * .055;
        diffuseColor.rgb *= mix(vec3(.21, .082, .025), vec3(.56, .31, .125), tone);
      `);
  };
  material.customProgramCacheKey = () => 'geb-object-space-walnut-v1';
  return material;
}
