import { projectPlane } from './projection.js';
import { millLayout, millTerraceLayout, millRightPlatformOutline, millPlatformRailEnd } from './channel-layout.js';
import { polygon, path, linePath, railing } from './drawing.js';
import { channelSegments } from './channel-layout.js';
import { wallRun, wallBaseAt } from './channel-walls.js';
import { scene } from './scene.js';

export const buildingPoint = config => (u = 0, v = 0, z = 0) => projectPlane(config.origin, u, v, z);
export const millTerracePoint = buildingPoint(millTerraceLayout);

export function flatHouse(config) {
  const p = buildingPoint(config);
  const { width: w, depth: d, height: h, id } = config;
  return `<g data-building="${id}">
    ${polygon([p(0, 0, h), p(w, 0, h), p(w, 0), p(0, 0)], 'stone-light wall-facing building-front-wall')}
    ${polygon([p(w, 0, h), p(w, d, h), p(w, d), p(w, 0)], 'stone-mid wall-receding building-side-wall')}
    ${polygon([p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)], 'terrace-floor building-roof-plane')}
  </g>`;
}

export function faceWindow(p, u, v, z, width, height, side = 'u') {
  const at = (t, dz) => p(u + (side === 'u' ? t : 0), v + (side === 'v' ? t : 0), z + dz);
  return `<g>${polygon([at(0, 0), at(width, 0), at(width, height), at(0, height)], 'window-dark')}
    ${path(linePath([at(-3, height + 3), at(width + 3, height + 3)]), 'window-frame')}
    ${path(linePath([at(-3, -2), at(width + 3, -2)]), 'window-frame')}
    ${path(linePath([at(width / 2, 0), at(width / 2, height)]), 'window-frame')}</g>`;
}

export function archDoor(p, u, v, z, width, height, side = 'u') {
  const at = (t, dz) => p(u + (side === 'u' ? t : 0), v + (side === 'v' ? t : 0), z + dz);
  return path(`M${at(0, 0)}L${at(0, height * .60)}Q${at(width / 2, height * 1.40)} ${at(width, height * .60)}L${at(width, 0)}Z`, 'window-dark');
}

export function parapet(config, height = 16) {
  const p = buildingPoint(config);
  const { width: w, depth: d, height: h } = config;
  return `<g class="building-parapet">
    ${polygon([p(0, 0, h), p(w, 0, h), p(w, 0, h + height), p(0, 0, h + height)], 'stone-light')}
    ${polygon([p(w, 0, h), p(w, d, h), p(w, d, h + height), p(w, 0, h + height)], 'stone-mid')}
    ${path(linePath([p(0, 0, h + height), p(0, d, h + height), p(w, d, h + height)]), 'fine-line')}
  </g>`;
}

export function barrelRoof(config) {
  const p = buildingPoint(config);
  const { width: w, depth: d, height: h } = config;
  const a = p(12, 6, h + 3), b = p(w - 12, 6, h + 3);
  const c = p(w - 12, d - 6, h + 3), e = p(12, d - 6, h + 3);
  const frontCrown = p(w / 2, 6, h + 44), backCrown = p(w / 2, d - 6, h + 44);
  return `<g class="barrel-roof">
    ${path(`M${a}Q${frontCrown} ${b}L${c}Q${backCrown} ${e}Z`, 'stone-mid')}
    ${path(`M${a}Q${frontCrown} ${b}Z`, 'stone-light')}
    ${path(`M${e}Q${backCrown} ${c}`, 'roof-curve')}
  </g>`;
}

export function projectedStairs(p, origin, width, run, rise, count) {
  const local = (i, back = false, outer = false, down = false) => p(
    origin[0] + (i + (back ? 1 : 0)) * run[0] + (outer ? width[0] : 0),
    origin[1] + (i + (back ? 1 : 0)) * run[1] + (outer ? width[1] : 0),
    origin[2] - (i + (down ? 1 : 0)) * rise,
  );
  return `<g class="stone-stairs">${Array.from({ length: count }, (_, j) => {
    const i = count - 1 - j;
    return `${polygon([local(i, true), local(i, true, true), local(i, true, true, true), local(i, true, false, true)], 'stone-mid stair-riser')}
      ${polygon([local(i), local(i, false, true), local(i, true, true), local(i, true)], 'stone-light stair-tread')}`;
  }).join('')}</g>`;
}

// The near room wall occludes channel 4's thin floor ends.
export function millFoundationSideOutline() {
  const {outline,height}=millTerraceLayout;
  const [a,b]=outline.slice(1,3);
  const p=millTerracePoint;
  return [p(...a),p(...b),p(b[0],b[1],-height),p(a[0],a[1],-height)];
}

export function millFoundation() {
  const { outline, height, platformOutline, platformThickness, door } = millTerraceLayout;
  const p = millTerracePoint;
  const sides = outline.map((a, i) => {
    const b = outline[(i + 1) % outline.length];
    if (b[0] <= a[0] && b[1] <= a[1]) return '';
    if (b[1] === a[1]) return '';
    if (i === 3) {
      // The rear retaining wall belongs to channel 4, rather than the tall
      // room below the pond. Extend it to the outermost channel corner.
      const channel = channelSegments[3];
      const end = wallRun(channel, 'near').outer.reduce((a,b) => a[0] > b[0] ? a : b);
      const right = wallBaseAt(channel, end).map((v,i) => v + (i === 1 ? scene.wallDepth : 0));
      const x = p(...a)[0];
      const left = [x, right[1] + (x-right[0])*scene.waterwayDirections.receding[1]];
      const h = millTerraceLayout.canalSupportHeight;
      const {canalLowerHeight:lowerHeight,canalLowerSetback:setback}=millTerraceLayout;
      const baseLeft=[left[0],left[1]+h],far=[right[0],right[1]+h];
      const near=baseLeft.map((v,i)=>(v+far[i])/2);
      // Equal physical setbacks on the two perpendicular ground axes.
      const backGap=setback*scene.channelFootprint.halfDepth/scene.channelFootprint.halfWidth;
      const outerNear=projectPlane(near,setback,0);
      const outerCorner=projectPlane(far,setback,backGap);
      const backOuter=projectPlane(far,-80,backGap),backInner=projectPlane(far,-80,0);
      const roof=[near,outerNear,outerCorner,backOuter,backInner,far];
      const down=p=>[p[0],p[1]+lowerHeight];
      return `<g id="escher-canal-two-storey">
        ${polygon([outerCorner,backOuter,down(backOuter),down(outerCorner)],'stone-light wall-facing mill-canal-lower-corner')}
        ${polygon([outerNear,outerCorner,down(outerCorner),down(outerNear)],'stone-mid wall-receding mill-canal-lower-wall')}
        ${polygon([near,outerNear,down(outerNear),down(near)],'stone-light wall-facing mill-canal-lower-return')}
        ${polygon(roof,'ground-plane terrace-floor mill-canal-lower-roof')}
        <g id="escher-canal-lower-railing-rear">${railing(outerCorner,backOuter,22)}</g>
        ${polygon([left,right,far,baseLeft], 'stone-mid wall-receding building-side-wall mill-foundation-right-wall mill-canal-support-wall')}
        <g id="escher-canal-lower-railing">${railing(projectPlane(outerCorner,0,-80),outerCorner,22)}</g>
      </g>`;
    }
    return polygon([p(...a), p(...b), p(b[0], b[1], -height), p(a[0], a[1], -height)], 'stone-mid wall-receding building-side-wall mill-foundation-right-wall');
  }).reverse().join('');
  // One uninterrupted front facade, including the projecting roof return.
  // Joining its outline avoids outlining the former polygons' shared seam.
  const front = outline.flatMap((a,i)=>{
    const b=outline[(i+1)%outline.length];
    return b[1]===a[1] && b[0]>a[0] ? [a,b] : [];
  });
  const frontWall=polygon([...front.map(a=>p(...a)),...front.toReversed().map(a=>p(a[0],a[1],-height))], 'stone-light wall-facing mill-foundation-front-wall');
  const rim = platformOutline.map((a, i) => {
    const b = platformOutline[(i + 1) % platformOutline.length];
    if (b[0] <= a[0] && b[1] <= a[1]) return '';
    return polygon([p(...a), p(...b), p(b[0], b[1], -platformThickness), p(a[0], a[1], -platformThickness)], 'mill-platform-rim');
  }).join('');
  return `<g id="escher-mill-foundation" data-building="mill-foundation">
    ${sides}${frontWall}
    <g id="escher-foundation-door" data-wall="right">${archDoor(p, door.u, door.v, -height, door.width, door.height, 'v')}</g>
    <g id="escher-mill-platform">${rim}${polygon(platformOutline.map(a => p(...a)), 'ground-plane terrace-floor')}</g>
  </g>`;
}

export function millRightPlatform() {
  return `<g id="escher-mill-right-platform">${polygon(millRightPlatformOutline.map(point => millTerracePoint(...point)), 'ground-plane terrace-floor mill-right-platform-surface')}</g>`;
}

export function millBalcony(side = 'front') {
  const p = millTerracePoint;
  const outline = millTerraceLayout.platformOutline;
  const edges = outline.map((a, i) => ({ a, b: i === 4 ? millPlatformRailEnd : outline[(i + 1) % outline.length], i }))
    .filter(({ i }) => side === 'front' ? millTerraceLayout.platformFrontEdges.includes(i) : !millTerraceLayout.platformFrontEdges.includes(i));
  return `<g id="escher-mill-balcony${side === 'rear' ? '-rear' : ''}">
    ${edges.map(({ a, b, i }) => `<g data-platform-edge="${i}">${path(linePath([p(...a), p(...b)]), 'balcony-edge')}${millTerraceLayout.platformRailEdges.includes(i) ? railing(p(...a), p(...b), 24) : ''}</g>`).join('')}
    ${side === 'front' ? [50, 86, 122, 158].map(u => path(linePath([p(u, -36, -6), p(u, -20, -20), p(u + 11, -36, -6)]), 'balcony-bracket')).join('') : ''}
  </g>`;
}

export function mill() {
  const config = millLayout;
  const { width: w, depth: d, height: h, roofRise } = config;
  const p = buildingPoint(config);
  const roofHeight = u => h + roofRise * (1 - Math.abs(2 * u / w - 1));
  const chimney = (u, v) => {
    const base = roofHeight(u);
    const top = base + 55;
    return `${polygon([p(u - 9, v - 5, base), p(u + 9, v - 5, base), p(u + 9, v - 5, top), p(u - 9, v - 5, top)], 'stone-mid')}
      ${polygon([p(u + 9, v - 5, base), p(u + 9, v + 5, base), p(u + 9, v + 5, top), p(u + 9, v - 5, top)], 'stone-dark')}
      ${polygon([p(u - 12, v - 8, top), p(u + 12, v - 8, top), p(u, v, top + 14)], 'roof-dark')}
      ${polygon([p(u + 12, v - 8, top), p(u + 12, v + 8, top), p(u, v, top + 14)], 'roof-dark')}`;
  };
  return `<g id="escher-mill" data-building="mill">
    ${polygon([p(0, 0), p(0, d), p(0, d, h), p(0, 0, h)], 'stone-mid')}
    ${polygon([p(0, 0), p(w, 0), p(w, 0, h), p(w / 2, 0, h + roofRise), p(0, 0, h)], 'stone-light wall-facing building-front-wall')}
    ${polygon([p(w, 0), p(w, d), p(w, d, h), p(w, 0, h)], 'stone-mid wall-receding building-side-wall')}
    ${polygon([p(w / 2, 0, h + roofRise), p(w / 2, d, h + roofRise), p(w, d, h), p(w, 0, h)], 'roof-dark')}
    ${path(linePath([p(-8, 0, h), p(w / 2, 0, h + roofRise + 5), p(w / 2, d, h + roofRise + 5), p(w + 8, d, h)]), 'roof-edge')}
    ${path(linePath([p(w / 2, 0, h + roofRise + 5), p(w + 7, 0, h)]), 'roof-edge')}
    ${chimney(70, 15)}
    ${faceWindow(p, 24, 0, 38, 29, 45)}
    <g class="mill-front-door">${polygon([p(80, 0), p(109, 0), p(109, 0, 76), p(80, 0, 76)], 'window-dark')}</g>
  </g>`;
}
