import { scene, squareFootprint } from './scene.js';
import { projectPlane, across, receding } from './projection.js';
import { millTerraceLayout, waterfallTail, channel4Slope, projectMillPlane, referenceMillPlatformAnchor, lowerPierColumns } from './channel-layout.js';
import { polygon, path, linePath } from './drawing.js';

const origin=millTerraceLayout.origin;
const impactCenter=[waterfallTail[0]-12+scene.waterfallOffsetX,waterfallTail[1]+scene.waterfallLandingExtension];
const dx=impactCenter[0]-origin[0],dy=impactCenter[1]-origin[1];
const referenceV=(dy-dx*across[1])/(receding[1]-across[1]);
const v=(dy-dx*across[1])/(channel4Slope-across[1]);
const u=dx-v;
const footprint=squareFootprint(scene.pool.halfSide);
const rim=squareFootprint(scene.pool.rimWidth);
const retreat=squareFootprint(scene.pool.sideRetraction/2);
const minU=u-footprint.halfWidth,maxU=u+footprint.halfWidth-2*retreat.halfWidth+scene.pool.widthExpansion;
const minV=v-footprint.halfDepth+2*retreat.halfDepth,maxV=referenceMillPlatformAnchor[1]-scene.lowerPierFootprint.halfDepth-scene.pool.rearPierGap+v-referenceV;
const localCenter=[(minU+maxU)/2,(minV+maxV)/2];
export const pondLayout={
  center:projectMillPlane(origin,...localCenter),localCenter,impactCenter,impactLocal:[u,v],
  minU,maxU,minV,maxV,
  rearExtension:22,extensionMaxU:lowerPierColumns[0].x-origin[0]-maxV-12,
};
export const pondPoint=(u,v,z=0)=>projectMillPlane(origin,u,v,z);
const corners=(inset=0,z=0)=>{
  const {minU,maxU,minV,maxV,rearExtension,extensionMaxU}=pondLayout;
  return [[minU+inset*rim.halfWidth,minV+inset*rim.halfDepth],
    [maxU-inset*rim.halfWidth,minV+inset*rim.halfDepth],
    [maxU-inset*rim.halfWidth,maxV-inset*rim.halfDepth],
    [extensionMaxU-inset*rim.halfWidth,maxV-inset*rim.halfDepth],
    [extensionMaxU-inset*rim.halfWidth,maxV+rearExtension-inset*rim.halfDepth],
    [minU+inset*rim.halfWidth,maxV+rearExtension-inset*rim.halfDepth]].map(([a,b])=>pondPoint(a,b,z));
};

export function landingPond() {
  const {minU,maxU,minV,maxV}=pondLayout;
  const h=scene.pool.rimHeight,outer=corners(0,h),inner=corners(1,h);
  const edge=point=>point.join(',');
  return `<g id="escher-landing-pond">
    <defs><clipPath id="escher-pond-water-clip">${polygon(corners(1),'')}</clipPath><clipPath id="escher-pond-wheel-overlap-clip">${polygon(corners(),'')}</clipPath></defs>
    ${polygon(corners(),'pond-water')}
    ${path(`${linePath(outer)}Z ${linePath(inner.toReversed())}Z`,'pond-rim','fill-rule="evenodd"')}
    ${polygon([outer[0],outer[1],corners()[1],corners()[0]],'pond-rim-front')}
    ${polygon([outer[1],outer[2],corners()[2],corners()[1]],'pond-rim-side')}
    ${path(linePath(outer)+'Z','pond-rim-edge')}
    <g clip-path="url(#escher-pond-water-clip)">
      ${[0,1,2].map(i=>`<g class="pond-ripple" transform="translate(${edge(impactCenter)})"><ellipse rx="18" ry="4"/></g>`).join('')}
    </g>
  </g>`;
}
