import './style.css';
import { crossBridge } from './cross-bridge.js';
import { currentSurface } from './current.js';
import { startAnimation } from './animation.js';
import { scene } from './scene.js';
import { projectPlane } from './projection.js';
import { drawWaterwheel } from './wheel.js';
import { towerOrnament } from './ornaments.js';
import { towerBeam } from './arches.js';
import { landingPond } from './pond.js';
import { polygon, path, linePath, add } from './drawing.js';
import { materialDefinitions } from './materials.js';
import { landscape, rearHouses, foreground } from './surroundings.js';
import { mill, millFoundation, millBalcony, millRightPlatform, millFoundationSideOutline } from './buildings.js';
import { channelWall, channelFloor, channelTurnFloor, sampleSteppedEdge, wallBaseAt, straightWaterEdges, turnWaterScale, waterInset, wallRun } from './channel-walls.js';
import { bay, mix, towerLevels, channelSegments, channelHalf, turnLayout, structuralOrder, waterfallLip, waterfallTail, lowerPierColumns, columnFeet, towerCapitals, projectTowerPlane, turnHeightAt, turnBanks } from './channel-layout.js';

function stoneBlock(center, u, v, height, tier) {
  const floor = [[-u, -v], [u, -v], [u, v], [-u, v]].map(([a, b]) => tier ? projectTowerPlane(tier,center,a,b) : projectPlane(center,a,b));
  const top = floor.map(p => add(p, [0, -height]));
  return `${polygon([top[0], top[1], floor[1], floor[0]], 'stone-mid')}
    ${polygon([top[1], top[2], floor[2], floor[1]], 'stone-dark')}
    ${polygon(top, 'stone-light')}`;
}

function column(x, bottom, top, baseHeight, tier) {
  const shaftBottom = bottom - baseHeight - 2;
  const r=scene.columnRadius, ring=r+2.5;
  return `<g class="escher-column" data-foot-y="${bottom}" data-cap-y="${top}" data-base-height="${baseHeight}" data-shaft-length="${shaftBottom - top - 15}">
    ${stoneBlock([x, bottom], scene.columnBase.halfWidth, scene.columnBase.halfDepth, baseHeight, tier)}
    ${path(`M${x - r},${shaftBottom}V${top + 15}h${2*r}V${shaftBottom}q${-r},4 ${-2*r},0Z`, 'stone-light')}
    ${path(`M${x + r*.5},${top + 15}V${shaftBottom}`, 'column-shade')}
    ${stoneBlock([x, top + 17], scene.columnCap.halfWidth, scene.columnCap.halfDepth, 12, tier)}
    ${path(`M${x - ring},${bottom - baseHeight - 4}q${ring},5 ${2*ring},0M${x - ring},${top + 23}q${ring},5 ${2*ring},0`, 'fine-line')}
  </g>`;
}

function squarePier(x, bottom, top) {
  return `<g class="escher-column escher-square-pier">
    ${stoneBlock([x, bottom], scene.lowerPierFootprint.halfWidth, scene.lowerPierFootprint.halfDepth, bottom - top - 6, 'left-middle')}
  </g>`;
}

// The two visible lower square piers are the middle tier's right-hand pair
// continued downward. They are painted after channel 4 and the wheel.
function towerColumns(level, side) {
  const { y, top, tier, pierBay } = level;
  if (pierBay) {
    return side === 'rear' ? '' : `<g data-tower-tier="${tier}" data-column-side="right">
      ${lowerPierColumns.map(pier => squarePier(pier.x, pier.bottom, pier.top)).join('')}
    </g>`;
  }
  const corners = bay(level).corners;
  const feet = columnFeet(level), capitals=towerCapitals(level);
  const indices = side === 'rear' ? [3, 2] : [0, 1];
  return `<g data-tower-tier="${tier}" data-column-side="${side}">
    ${indices.map(i => column(feet[i][0], feet[i][1], capitals[i][1], scene.columnBaseHeights[tier], tier)).join('')}
  </g>`;
}

function towerRoof(level) {
  const { center } = bay(level);
  const height = level.y - level.top + 31;
  const { halfWidth: u, halfDepth: v } = scene.towerEave;
  const roof = [[-u, -v], [u, -v], [u, v], [-u, v]]
    .map(([u, v]) => projectTowerPlane(level.tier,center,u,v,height));
  const ornamentOrigin = add(projectPlane(center, 0, 0, height), [0, -16]);
  return `<g class="escher-tower-roof" data-tower="${level.id}">
    ${polygon([roof[0], roof[1], add(roof[1], [0, 8]), add(roof[0], [0, 8])], 'stone-mid')}
    ${polygon([roof[1], roof[2], add(roof[2], [0, 8]), add(roof[1], [0, 8])], 'stone-dark')}
    ${polygon(roof, 'stone-light')}
    <g class="tower-ornament" transform="translate(${ornamentOrigin.join(' ')})">
      ${towerOrnament(level.ornament)}
    </g>
  </g>`;
}

function turnSurface(turn) {
  const { corners, edges, center, entry, exit } = turnLayout(turn);
  // Only the water and coping are drawn here. All vertical wall faces come
  // from the extended straight runs, including those beneath the column feet.
  const scale = (p, factor) => mix(center, p, factor);
  const up = point => add(point, [0, -turnHeightAt(turn.tier, point)]);
  const wet = point => add(up(point), [0, scene.channelWaterFreeboard]);
  const openBanks = [edges[turn.entry], edges[turn.exit]];
  return `<g class="channel-turn" data-turn="${turn.tier}" data-coping-only="true">
    <g class="channel-turn-water">
      ${polygon(corners.map(p => wet(scale(p, turnWaterScale))), 'channel-corner-water')}
      ${openBanks.map(([a, b]) => {
        const innerA = mix(a, b, waterInset), innerB = mix(a, b, 1 - waterInset);
        return polygon([innerA, innerB, scale(innerB, turnWaterScale), scale(innerA, turnWaterScale)].map(wet), 'channel-corner-water');
      }).join('')}
      ${currentSurface(`current-turn-${turn.tier}`,corners.map(p=>wet(scale(p,turnWaterScale))), (t,v)=>{
        const a=wet(entry),b=wet(center),c=wet(exit);
        const q=a.map((x,i)=>(1-t)*(1-t)*x+2*(1-t)*t*b[i]+t*t*c[i]);
        const tangent=a.map((x,i)=>2*(1-t)*(b[i]-x)+2*t*(c[i]-b[i]));
        const length=Math.hypot(...tangent)||1;
        return [q[0]-tangent[1]/length*(v-.5)*9,q[1]+tangent[0]/length*(v-.5)*9];
      },turn.tier==='left-upper'?1:-1,65)}
    </g>
    ${turnBanks(turn).map(bank => `<g class="channel-turn-bank">${polygon(bank.map(up), 'channel-wall-cap')}</g>`).join('')}
  </g>`;
}

function channelSegment(segment, side) {
  const half = channelHalf(segment, side);
  const clipId = `escher-channel-${segment.id}-${side}-clip`;
  const [a, d] = segment.from;
  const [b, c] = segment.to;
  const water = straightWaterEdges(segment, side);
  const nearRun = wallRun(segment, 'near'), farRun = wallRun(segment, 'far');
  const wetOutline=[...sampleSteppedEdge(segment,...water.near).map(water.waterAt),...sampleSteppedEdge(segment,...water.far).map(water.waterAt).toReversed()];
  return `<g id="escher-channel-${segment.id}-${side}" data-structural-layer="channel-${segment.id}-${side}" data-channel-side="${side}" data-wall-height="${water.height}">
    <defs><clipPath id="${clipId}"><rect x="${half.minX}" y="-1000" width="${half.maxX - half.minX}" height="3000"/></clipPath></defs>
    <g clip-path="url(#${clipId})" class="channel-half-artwork"${segment.id === 4 && side === 'left' ? ' mask="url(#escher-landing-platform-mask)"' : ''}>
    <g${segment.id===4?' mask="url(#escher-foundation-floor-mask)"':''}>${channelFloor(farRun)}${channelFloor(nearRun)}</g>
    ${segment.id===1?half.turns.map(turn=>channelTurnFloor(segment,turn)).join(''):''}
    ${polygon([a, b, c, d].map(p=>wallBaseAt(segment,p)), 'channel-corner-stone')}
    ${channelWall(farRun, water.heightAt)}
    <g data-water-elevation="${water.waterElevation}">
      ${polygon(wetOutline, 'channel-corner-water')}
      ${currentSurface(`current-${segment.id}-${side}`,wetOutline,(t,v)=>water.guideAt(mix(mix(...water.near,t),mix(...water.far,t),v)),-1,Math.hypot(b[0]-a[0],b[1]-a[1]))}
    </g>
    ${channelWall(nearRun, water.heightAt)}
    ${half.turns.map(turnSurface).join('')}
    ${half.tailrace ? `${path(linePath(half.tailrace), 'channel-outline')}${path(linePath(half.tailrace), 'channel-top')}${path(linePath(half.tailrace), 'channel-water')}` : ''}
    </g>
  </g>`;
}

function towerLayer(tier) {
  const level = towerLevels.find(item => item.tier === tier);
  const upperTower = scene.towers.find(item => `${item.id}-upper` === tier);
  return `<g id="escher-tier-${tier}" data-structural-layer="${tier}">
    ${level.pierBay ? '' : towerColumns(level, 'rear')}
    ${towerColumns(level, 'front')}
    ${towerBeam(level)}
    ${upperTower ? towerRoof(level) : ''}
  </g>`;
}

function structuralLayers() {
  return structuralOrder.map(id => {
    if (id === 'wheel') return drawWaterwheel();
    if (id.startsWith('channel-')) {
      const [, number, side] = id.split('-');
      return channelSegment(channelSegments.find(segment => segment.id === Number(number)), side);
    }
    return towerLayer(id);
  }).join('');
}

const [lipX, lipY] = waterfallLip;
const [tailX, platformY] = waterfallTail;
const tailY = platformY + scene.waterfallLandingExtension;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox}" role="img" aria-labelledby="escher-svg-title escher-svg-description" class="escher-drawing">
  <title id="escher-svg-title">瀑布：水渠、水磨房与周围建筑群</title>
  <desc id="escher-svg-description">水轮下方的水渠向右后方伸展，再反复折回，最终接到左塔下方的高处落水口。瀑布从那里直落到水轮和平台上的方形水池，形成二维画面中的不可能循环。远处是带有石墙、耕地和植物的梯田，左上有一座高窄小屋；右下的横桥连接水道4和正方形方屋，桥下平台与小阶梯通向门洞旁的地面；左下是种植着杯形与枝状植物的庭院。</desc>
  <defs>${materialDefinitions}<filter id="escher-mist-soften" x="-50%" y="-70%" width="200%" height="240%"><feGaussianBlur stdDeviation="1.4"/></filter><clipPath id="escher-fall-clip"><path d="M${lipX - 16},${lipY}Q${lipX - 30},${lipY + 24} ${lipX - 30},${lipY + 65}L${tailX - 30},${tailY}H${tailX + 5}V${lipY + 60}Q${lipX + 5},${lipY + 20} ${lipX + 16},${lipY}Z"/></clipPath>
    <mask id="escher-foundation-floor-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1000">
      <rect width="900" height="1000" fill="white"/>
      <polygon points="${millFoundationSideOutline().map(p=>p.join(',')).join(' ')}" fill="black"/>
    </mask>
    <!-- The platform occludes the tailrace's exposed wall/floor ends at the
         landing. Apply only to channel 4, leaving wheel and columns intact. -->
    <mask id="escher-landing-platform-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="900">
      <rect width="900" height="900" fill="white"/>
      <rect x="${tailX - 43}" y="${platformY - 27}" width="53" height="45" fill="black"/>
    </mask>
  </defs>
  <rect width="900" height="900" class="scene-paper"/>
  <g class="scene-architecture" transform="translate(0 ${scene.compositionOffsetY})" stroke-linejoin="round" stroke-linecap="round">
    ${landscape()}
    ${millFoundation()}
    ${millBalcony('rear')}
    ${mill()}
    ${structuralLayers()}
    ${crossBridge()}
    <!-- The deck and pond sit above the bridge; only the pier feet need
         restoration here. Their upper parts retain the original layer order. -->
    <g id="escher-pool-platform-layer">
      ${millRightPlatform()}${landingPond()}
      <defs><clipPath id="escher-pier-feet-clip"><rect x="0" y="${Math.min(...lowerPierColumns.map(p=>p.bottom))-18}" width="900" height="90"/></clipPath></defs>
      <use href="#escher-tier-left-lower" clip-path="url(#escher-pier-feet-clip)"/>
    </g>
    <g id="escher-fall-route" transform="translate(${scene.waterfallOffsetX} 0)">
    <g id="escher-waterfall" clip-path="url(#escher-fall-clip)">
      <rect x="${lipX - 40}" y="${lipY}" width="90" height="${tailY - lipY + 10}" class="fall-water"/>
      ${Array.from({ length: 9 }, (_, i) => path(`M${lipX - 16 + i * 4},${lipY}Q${lipX - 30 + i * 4},${lipY + 30} ${lipX - 30 + i * 4},${lipY + 70}V${tailY}`, 'fall-line')).join('')}
      ${Array.from({length:13},(_,i)=>path(`M${lipX-17+i*3},${lipY}Q${lipX-31+i*3},${lipY+30} ${lipX-31+i*3},${lipY+70}V${tailY}`, 'fall-streak')).join('')}
    </g>
    ${path(`M${lipX - 16},${lipY}l32,0`, 'water-lip')}
    <g id="escher-splash" transform="translate(${tailX-12} ${tailY})" aria-hidden="true">
      <g filter="url(#escher-mist-soften)">${Array.from({length:9},(_,i)=>`<g class="splash-mist"><path d="M-19,2 Q-24,-5 -13,-9 Q-17,-20 -4,-19 Q4,-28 11,-16 Q24,-17 19,-6 Q29,2 13,5Z"/></g>`).join('')}</g>
      ${Array.from({length:48},(_,i)=>`<ellipse class="splash-drop" cx="${(i%4-1.5)*3}" cy="-1" rx="${.8+i%3*.25}" ry="${1.25+i%4*.25}"/>`).join('')}
    </g>
    </g>
    ${millBalcony()}
    ${scene.showRightHouses?rearHouses():''}
    ${foreground()}
  </g>
</svg>`;

document.querySelector('#escher-scene').innerHTML = svg;

startAnimation(document.querySelector('#escher-scene'));
