import { scene, squareFootprint } from './scene.js';
import { channelSegments, lowerPierColumns, millTerraceLayout } from './channel-layout.js';
import { wallRun, wallTopAt, channelBrickLength } from './channel-walls.js';
import { projectPlane, across, receding } from './projection.js';
import { polygon, path } from './drawing.js';
import { buildingPoint, flatHouse, faceWindow, projectedStairs, archDoor, millFoundationSideOutline, millTerracePoint } from './buildings.js';

const channel=channelSegments[3],bank=wallRun(channel,'near').outer;
const [a,b]=bank.slice(1,3),x=525;
const bankPoint=[x,a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0])];
const platformOrigin=wallTopAt(channel,bankPoint);
// One coping brick is measured along the oblique bank, not screen x.
const slide=45-channelBrickLength/Math.hypot(...receding);
const origin=projectPlane(platformOrigin,0,slide);
const backV=28;
const previousFrontV=lowerPierColumns[0].x-platformOrigin[0];
const frontV=(previousFrontV+backV)/2;
const platformDrop=25;
const wallHeightReduction=65-scene.millTerrace.canalSupportHeight;
const referenceGround=-18-65-platformDrop;
const ground=referenceGround+wallHeightReduction;
const stairCount=3,stairRun=7,referenceStairRise=5;
const stairRise=referenceStairRise+wallHeightReduction/stairCount;
const groundTarget=projectPlane(millTerraceLayout.origin,millTerraceLayout.door.u+40,
  millTerraceLayout.door.v+millTerraceLayout.door.width,-millTerraceLayout.height);
const stairTop=[groundTarget[0]-stairCount*stairRun,
  groundTarget[1]-stairCount*(stairRun*across[1]+referenceStairRise)];
const dx=stairTop[0]-platformOrigin[0],dy=stairTop[1]-platformOrigin[1]+referenceGround;
const stairV=(dy-dx*across[1])/(receding[1]-across[1]),stairU=dx-stairV;
// Use a true square in the shared ground projection, not equal screen-x
// lengths along the two foreshortened axes. Leave 4% extra on each bridge side.
const houseDepth=(backV-frontV)*1.08;
const square=squareFootprint(houseDepth/(2*squareFootprint(1).halfDepth));
const houseCenterV=(frontV+backV)/2;
export const crossBridgeLayout={wallHeightReduction,referenceGround,origin,platformOrigin,slide,platformEnd:150,bankStepWidth:14,frontV,backV,previousFrontV,platformDrop,start:0,end:150,deck:-18,ground,
  edgeHeight:18,edgeThickness:6,archHeight:56,
  houseMinV:houseCenterV-houseDepth/2,houseMaxV:houseCenterV+houseDepth/2,
  houseWidth:2*square.halfWidth,houseRoof:6,houseBottom:-420,
  stairU,stairV,stairCount,stairRun,stairRise,groundTarget};

export function crossBridge() {
  const c=crossBridgeLayout,p=buildingPoint(c),platformPoint=buildingPoint({origin:c.platformOrigin}),z=c.deck,g=c.ground;
  // A level L-shaped terrace: all edges follow the two ground axes.
  // The sole height transition to the ground is the small stair flight.
  const platform=[[0,c.backV+8],[c.platformEnd,c.backV+8],[c.platformEnd,c.stairV+34],
    [c.stairU,c.stairV+34],[c.stairU,c.stairV],[0,c.stairV]];
  const house={id:'bridge-square-house',origin:p(c.end,c.houseMinV,c.houseBottom),
    width:c.houseWidth,depth:c.houseMaxV-c.houseMinV,height:c.houseRoof-c.houseBottom};
  const q=buildingPoint(house);
  const edge=(v,innerV,material,outer=true)=>`<g class="bridge-raised-edge">
    ${outer?polygon([p(0,v,z+c.edgeHeight),p(c.end,v,z+c.edgeHeight),p(c.end,v,z),p(0,v,z)],material):''}
    ${polygon([p(0,v,z+c.edgeHeight),p(c.end,v,z+c.edgeHeight),p(c.end,innerV,z+c.edgeHeight),p(0,innerV,z+c.edgeHeight)],'stone-light')}
    ${polygon([p(0,innerV,z+c.edgeHeight),p(c.end,innerV,z+c.edgeHeight),p(c.end,innerV,z),p(0,innerV,z)],material)}
  </g>`;
  const [leftCorner,rightCorner]=millTerraceLayout.outline;
  const t=millTerracePoint,H=millTerraceLayout.height;
  const roomFront=[t(...leftCorner),t(...rightCorner),t(...rightCorner,-H),t(...leftCorner,-H)];
  return `<g id="escher-cross-bridge-complex">
    <defs><mask id="bridge-platform-room-occlusion" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1100">
      <rect width="900" height="1100" fill="white"/>
      ${[roomFront,millFoundationSideOutline()].map(points=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="black"/>`).join('')}
    </mask></defs>
    <g id="escher-bridge-under-platform" mask="url(#bridge-platform-room-occlusion)">
      ${platform.map((a,i)=>{const b=platform[(i+1)%platform.length];return polygon([platformPoint(...a,g),platformPoint(...b,g),platformPoint(...b,g-7),platformPoint(...a,g-7)],'stone-mid');}).join('')}
      ${polygon(platform.map(a=>platformPoint(...a,g)),'ground-plane terrace-floor')}
      <g id="escher-bridge-platform-stairs">${projectedStairs(platformPoint,[c.stairU,c.stairV,g],[0,34],[c.stairRun,0],c.stairRise,c.stairCount)}</g>
    </g>
    <g id="escher-cross-bridge">
      ${polygon([[0,c.frontV],[c.end,c.frontV],[c.end,c.backV],[0,c.backV]].map(a=>p(...a,z)),'stone-light bridge-deck')}
      ${edge(c.backV,c.backV-c.edgeThickness,'stone-mid wall-facing')}
      <g id="escher-bridge-bank-steps">
        ${[c.backV,c.backV-c.bankStepWidth].map((v,i)=>polygon([
          p(0,v,0),p(8,v,0),p(8,v,-9),p(16,v,-9),p(16,v,-18),p(0,v,-18)
        ],`bridge-bank-step-side ${i?'stone-light':'stone-mid'}`)).join('')}
        ${projectedStairs(p,[0,c.backV-c.bankStepWidth,0],[0,c.bankStepWidth],[8,0],9,2)}
      </g>
      ${edge(c.frontV,c.frontV+c.edgeThickness,'stone-light wall-facing',false)}
      ${polygon([p(0,c.frontV,z+c.edgeHeight),p(c.end,c.frontV,z+c.edgeHeight),p(c.end,c.frontV,g),p(0,c.frontV,g)],'stone-light wall-facing bridge-front-wall')}
      <g id="escher-bridge-arch">${archDoor(p,8,c.frontV,g,28,c.archHeight)}
        ${path(`M${p(12,c.frontV,g)}L${p(12,c.frontV,g+c.archHeight*.60)}Q${p(24,c.frontV,g+c.archHeight*1.27)} ${p(36,c.frontV,g+c.archHeight*.60)}`,'bridge-arch-intrados')}
      </g>
    </g>
    ${scene.showBridgeHouse?`<g id="escher-bridge-house">${flatHouse(house)}${faceWindow(q,22,0,house.height-90,22,32)}</g>`:''}
  </g>`;
}
