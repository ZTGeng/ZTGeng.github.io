import { gardenVegetation } from './garden-plants.js';
import { scene } from './scene.js';
import { polygon, path, linePath, railing } from './drawing.js';
import { landscapeSketch } from './landscape.js';
import { millTerraceLayout, gardenLayout } from './channel-layout.js';
import { buildingPoint, flatHouse, faceWindow, archDoor, parapet, barrelRoof, projectedStairs } from './buildings.js';

export function landscape() {
  return `<g id="escher-landscape" aria-hidden="true">${landscapeSketch()}</g>`;
}

export function rearHouses() {
  const main = { id: 'barrel-house', origin: [590, 770], width: 132, depth: 35, height: 215 };
  const small = { id: 'connecting-house', origin: [510, 818], width: 73, depth: 35, height: 155 };
  const p = buildingPoint(main), q = buildingPoint(small);
  return `<g id="escher-rear-houses">
    ${flatHouse(main)}${barrelRoof(main)}${parapet(main, 7)}
    ${faceWindow(p, 23, 0, main.height - 77, 22, 34)}${faceWindow(p, 81, 0, main.height - 77, 22, 34)}
    ${archDoor(p, 59, 0, 0, 23, 42)}
    ${flatHouse(small)}${faceWindow(q, 18, 0, small.height - 57, 15, 24)}
  </g>`;
}

export function foreground() {
  const config = { id: 'terraced-house', origin: [530, 853], width: 171, depth: 52, height: 190 };
  const h = config.height;
  const p = buildingPoint(config);
  const garden = buildingPoint(gardenLayout);
  const gardenWidth = gardenLayout.width, gardenDepth = gardenLayout.depth;
  const gardenCorners = gardenLayout.outline.map(([u,v])=>garden(u,v));
  const {gateWidth, gateHeight, wallHeight} = millTerraceLayout.garden;
  const gateStart = gardenDepth-gateWidth;
  const gatePoint = (t,z) => garden(gardenWidth,gateStart+t,-wallHeight+z);
  const gateArch = `M${gatePoint(0,0)}L${gatePoint(0,gateHeight*.6)}Q${gatePoint(gateWidth/2,gateHeight*1.4)} ${gatePoint(gateWidth,gateHeight*.6)}L${gatePoint(gateWidth,0)}Z`;
  const gateGrid = [
    ...Array.from({length:5},(_,i)=>linePath([gatePoint((i+1)*gateWidth/6,0),gatePoint((i+1)*gateWidth/6,gateHeight)])),
    ...Array.from({length:7},(_,i)=>linePath([gatePoint(0,(i+1)*6),gatePoint(gateWidth,(i+1)*6)])),
  ].join('');
  const stairFront = [p(60, -28, h + 18), p(144, -28, 40), p(144, -28, 22), p(60, -28, h)];
  return `<g id="escher-foreground">
    ${scene.showRightHouses?`<g id="escher-terraced-homes">
      ${flatHouse(config)}
      ${faceWindow(p, 22, 0, 44, 21, 30)}
      ${archDoor(p, 135, 0, 0, 26, 39)}
      ${archDoor(p, 171, 18, 26, 19, 31, 'v')}
      ${projectedStairs(p, [60, 0, h], [0, -28], [7, 0], (h - 22) / 12, 12)}
      ${polygon(stairFront, 'stone-light stair-balustrade')}
      ${path(linePath(stairFront.slice(0, 2)), 'fine-line')}
      ${parapet(config, 16)}
      ${railing(p(25, 20, h + 16), p(82, 20, h + 16), 19)}
      ${railing(p(82, 20, h + 16), p(82, 50, h + 16), 19)}
      ${path(linePath([p(115, 22, h), p(115, 22, h + 25)]), 'courtyard-seat')}
      ${path(linePath([p(104, 22, h + 10), p(128, 22, h + 10)]), 'courtyard-seat')}
    </g>`:''}
    <g id="escher-garden" data-building="garden-planter">
      ${polygon(gardenCorners, 'garden-soil')}
      ${gardenVegetation(garden,millTerraceLayout.garden.plantWidth,gardenDepth)}
      ${polygon([garden(0, 0), garden(gardenWidth, 0), garden(gardenWidth, 0, -wallHeight), garden(0, 0, -wallHeight)], 'stone-light wall-facing')}
      ${polygon([garden(gardenWidth, 0), garden(gardenWidth, gateStart), garden(gardenWidth, gateStart, -wallHeight), garden(gardenWidth, 0, -wallHeight)], 'stone-mid wall-receding')}
      ${path(linePath([garden(0,0),garden(gardenWidth,0),garden(gardenWidth,gateStart)]), 'garden-wall-cap')}
      <g id="escher-garden-gate" data-wall="garden-side">
        <defs><clipPath id="escher-garden-gate-clip"><path d="${gateArch}"/></clipPath></defs>
        ${path(gateGrid,'garden-gate-grid','clip-path="url(#escher-garden-gate-clip)"')}
        ${path(gateArch,'garden-gate-frame')}
      </g>
    </g>
  </g>`;
}
