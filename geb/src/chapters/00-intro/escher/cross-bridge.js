import { scene, squareFootprint } from './scene.js';
import { channelSegments, channel4Slope, projectMillPlane, lowerPierColumns, millTerraceLayout } from './channel-layout.js';
import { wallRun, wallBaseAt, wallReferenceHeightAt, channelBrickLength } from './channel-walls.js';
import { across } from './projection.js';
import { polygon, path } from './drawing.js';
import { buildingPoint, flatHouse, faceWindow, projectedStairs, millTerracePoint } from './buildings.js';
import { archOutline, intersectLines, stairGeometry } from './architectural-geometry.js';

const channel=channelSegments[3],bank=wallRun(channel,'near').outer;
const [a,b]=bank.slice(1,3),x=525;
const bankPoint=[x,a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0])];
const platformOrigin=[bankPoint[0],bankPoint[1]-wallReferenceHeightAt(channel,bankPoint)];
// One coping brick is measured along the oblique bank, not screen x.
const slide=45-2*channelBrickLength/Math.hypot(1,channel4Slope);
const origin=projectMillPlane(platformOrigin,0,slide);
const backV=28;
const previousFrontV=lowerPierColumns[0].x-platformOrigin[0];
const frontV=(previousFrontV+backV)/2;
// Fit the bridge foot and terrace to the underside of the actual channel bed.
// The fixed landing datum also anchors the boundary wall below the doorway.
const referenceGround=-108;
const ground=-wallReferenceHeightAt(channel,bankPoint)-scene.wallDepth;
const platformLift=ground-referenceGround;
const inverseAt=(point,z)=>{
  const dx=point[0]-platformOrigin[0],dy=point[1]-platformOrigin[1]+z;
  const v=(dy-dx*across[1])/(channel4Slope-across[1]);
  return [dx-v,v];
};
const platformRise=15+platformLift;
const platformDoorEdge=projectMillPlane(millTerraceLayout.origin,millTerraceLayout.door.u,
  millTerraceLayout.door.v+millTerraceLayout.door.width,-millTerraceLayout.referenceHeight+platformRise);
const platformLeft=inverseAt(platformDoorEdge,ground);
const referencePlatformFrontV=platformLeft[1],platformWidthScale=.5;
const platformFrontV=backV+8-((backV+8)-referencePlatformFrontV)*platformWidthScale;
// Use the visible intersection of the terrace front edge and building corner,
// not a height offset measured in the other projection frame.
const buildingCorner=millTerracePoint(millTerraceLayout.door.u,millTerraceLayout.outline[2][1],-millTerraceLayout.height);
const terraceFront=projectMillPlane(platformOrigin,0,platformFrontV,ground);
const platformBuildingContact=[buildingCorner[0],terraceFront[1]+(buildingCorner[0]-terraceFront[0])*across[1]];
const referenceTerraceFront=projectMillPlane(platformOrigin,0,referencePlatformFrontV,ground);
const referencePlatformBuildingContact=[buildingCorner[0],referenceTerraceFront[1]+(buildingCorner[0]-referenceTerraceFront[0])*across[1]];
const groundWallTopReference=[referencePlatformBuildingContact[0],referencePlatformBuildingContact[1]-millTerraceLayout.heightReduction];
// Use a true square in the shared ground projection, not equal screen-x
// lengths along the two foreshortened axes.
const bridgeWidth=backV-frontV;
const houseDepth=bridgeWidth*scene.bridge.house.depthRatio;
const square=squareFootprint(houseDepth/(2*squareFootprint(1).halfDepth));
const houseMinV=frontV-bridgeWidth*scene.bridge.house.nearOverhangRatio;
export const crossBridgeLayout={recedingSlope:channel4Slope,platformLift,referenceGround,origin,platformOrigin,slide,platformEnd:scene.bridge.length,frontV,backV,previousFrontV,start:0,end:scene.bridge.length,deck:-scene.brickCourseHeight,ground,
  wallBottom:-scene.bridge.wallHeight,edgeHeight:scene.brickCourseHeight,edgeThickness:6,archStart:0,archHeight:scene.bridge.arch.height,
  houseMinV,houseMaxV:houseMinV+houseDepth,
  houseWidth:2*square.halfWidth,houseRoof:6,houseBottom:-420,houseLeftShift:8,houseLift:12,houseScreenOffset:[14,-40],
  cornerStep:{height:scene.brickCourseHeight/2,width:channelBrickLength/Math.hypot(1,channel4Slope),run:12},
  platformLeft,platformFrontV,referencePlatformFrontV,platformWidthScale,platformRise,platformDoorEdge,platformBuildingContact,
  referencePlatformBuildingContact,groundWallTopReference};

export function crossBridge() {
  const c=crossBridgeLayout,p=buildingPoint(c),z=c.deck,g=c.ground;
  const houseAnchor=p(c.end-c.houseLeftShift,c.houseMinV,c.houseBottom+c.houseLift);
  const house={id:'bridge-square-house',recedingSlope:channel4Slope,
    origin:houseAnchor.map((v,i)=>v+c.houseScreenOffset[i]),
    width:c.houseWidth,depth:c.houseMaxV-c.houseMinV,height:c.houseRoof-c.houseBottom};
  const q=buildingPoint(house);
  // Center the pair on the facade. A level local crown plane projects along
  // the roof edge; the right sill descends with the long stair's grade.
  const doors=scene.bridge.houseDoors;
  const archRise=doors.leftHeight*doors.riseRatio;
  const houseDoors=[0,1].map(index=>{
    const center=house.width/2+(index-.5)*doors.spacing;
    const width=doors.width,u=center-width/2;
    const height=doors.leftHeight+index*doors.spacing*platformStairsLayout.longRise/platformStairsLayout.longRun;
    const z=doors.crownElevation-height;
    const at=(t,h)=>q(u+t,0,z+h);
    return `<g data-door-height="${height}" data-arch-rise="${archRise}" data-door-center="${center}" data-door-crown="${q(center,0,z+height)[1]}">${path(
      archOutline(at,width,height,archRise),'window-dark')}</g>`;
  }).join('');
  const edge=(v,innerV,material,outer=true)=>`<g class="bridge-raised-edge">
    ${outer?polygon([p(0,v,z+c.edgeHeight),p(c.end,v,z+c.edgeHeight),p(c.end,v,z),p(0,v,z)],material):''}
    ${polygon([p(0,v,z+c.edgeHeight),p(c.end,v,z+c.edgeHeight),p(c.end,innerV,z+c.edgeHeight),p(0,innerV,z+c.edgeHeight)],'stone-light')}
    ${polygon([p(0,innerV,z+c.edgeHeight),p(c.end,innerV,z+c.edgeHeight),p(c.end,innerV,z),p(0,innerV,z)],material)}
  </g>`;
  return `<g id="escher-cross-bridge-complex">
    <g id="escher-cross-bridge">
      ${polygon([[0,c.frontV],[c.end,c.frontV],[c.end,c.backV],[0,c.backV]].map(a=>p(...a,z)),'stone-light bridge-deck')}
      ${edge(c.backV,c.backV-c.edgeThickness,'stone-mid wall-facing')}
      <g id="escher-bridge-corner-step">
        ${[c.backV-c.edgeThickness-c.cornerStep.width,c.backV-c.edgeThickness].map((v,i)=>polygon([
          p(0,v,z+c.cornerStep.height),p(c.cornerStep.run,v,z+c.cornerStep.height),
          p(c.cornerStep.run,v,z),p(0,v,z)
        ],i?'stone-mid':'stone-light')).join('')}
        ${projectedStairs(p,[0,c.backV-c.edgeThickness-c.cornerStep.width,z+c.cornerStep.height],
          [0,c.cornerStep.width],[c.cornerStep.run,0],c.cornerStep.height,1)}
      </g>
      ${edge(c.frontV,c.frontV+c.edgeThickness,'stone-light wall-facing',false)}
      ${polygon([p(0,c.frontV,z+c.edgeHeight),p(c.end,c.frontV,z+c.edgeHeight),p(c.end,c.frontV,c.wallBottom),p(0,c.frontV,c.wallBottom)],'stone-light wall-facing bridge-front-wall')}
      <g id="escher-bridge-arch">${path(
        archOutline((t,h)=>p(c.archStart+t,c.frontV,bridgeArchFloor+h),scene.bridge.arch.width,c.archHeight,c.archHeight*scene.bridge.arch.riseRatio),'window-dark')}
      </g>
      <g id="escher-bridge-small-window">${faceWindow(p,90,c.frontV,c.deck-34,14,18)}</g>
    </g>
    ${scene.showBridgeHouse?`<g id="escher-bridge-house">${flatHouse(house)}${faceWindow(q,22,0,house.height-90,22,32)}<g id="escher-house-stair-doors" transform="translate(${doors.screenOffsetX} 0)">${houseDoors}</g></g>`:''}
  </g>`;
}


// Six edges: doorway return, vertical rise, bank underside, bridge underside,
// then the two perpendicular ground axes back to the doorway return.
export const replacementPlatformOutline=(()=>{
  const c=crossBridgeLayout;
  const b=[...c.groundWallTopReference];
  const width=millTerraceLayout.outline[2][0]-millTerraceLayout.outline[3][0];
  const a=[b[0]-width,b[1]-width*channel4Slope];
  const bridgeFoot=projectMillPlane(c.origin,0,c.frontV,c.ground);
  const bedY=x=>{
    const point=[x,bankPoint[1]+(x-bankPoint[0])*channel4Slope];
    return wallBaseAt(channel,point)[1]+scene.wallDepth-.75;
  };
  const d=[bridgeFoot[0],bedY(bridgeFoot[0])];
  const corner=[b[0],bedY(b[0])];
  const length=60/Math.hypot(...across);
  const e=[d[0]+length,d[1]+length*across[1]];
  const f=intersectLines(e,[1,channel4Slope],a,across);
  return [a,b,corner,d,e,f];
})();

export const bridgeArchFloor=crossBridgeLayout.ground-(replacementPlatformOutline[3][1]
  -projectMillPlane(crossBridgeLayout.origin,0,crossBridgeLayout.frontV,crossBridgeLayout.ground)[1]);

export function replacementPlatform(){
  const points=replacementPlatformOutline;
  return `<g id="escher-replacement-platform">
    ${points.map((a,i)=>{const b=points[(i+1)%points.length];return polygon([a,b,[b[0],b[1]+1],[a[0],a[1]+1]],'stone-mid');}).join('')}
    ${polygon(points,'ground-plane terrace-floor')}
  </g>`;
}


export const platformStairsLayout=(()=>{
  const [a,b,,,e,f]=replacementPlatformOutline;
  // The boundary wall runs through B along the across axis, splitting EF.
  const split=intersectLines(e,[1,channel4Slope],b,across);
  const m=millTerraceLayout;
  const floor=millTerracePoint(m.door.u,m.outline[2][1],-m.height);
  return {shortStart:f,split,longEnd:e,rise:floor[1]-b[1],shortCount:6,shortRun:9,longCount:26,longRun:12,longRise:9};
})();

export function platformStairs(long=false){
 const c=platformStairsLayout;
 const start=long?c.split:c.shortStart,end=long?c.longEnd:c.split;
 const count=long?c.longCount:c.shortCount,run=long?c.longRun:c.shortRun;
 const rise=long?c.longRise:c.rise/count;
 const width=end.map((v,i)=>v-start[i]);
 const p=(x,y,z)=>[x,y-z];
 const geometry=stairGeometry(p,[...start,0],width,[run,run*across[1]],rise,count);
 const sideOutline=j=>geometry.side(j);
 const near=sideOutline(0);
 if(!long){
  // One continuous outline includes the platform and stairs, with no joint
  // at the first riser and no internal wall across the stair entrance.
  const a=replacementPlatformOutline[0];
  near.unshift(a);
  near.push([a[0],a[1]+c.rise]);
 }
 return `<g id="escher-platform-${long?'long':'short'}-stairs">
  ${polygon(sideOutline(1),'stone-light wall-facing stair-side-far')}
  ${projectedStairs(p,[...start,0],width,[run,run*across[1]],rise,count)}
  ${polygon(near,'stone-light wall-facing stair-side-near')}
 </g>`;
}
