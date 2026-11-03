import { scene } from './scene.js';
import { polygon } from './drawing.js';
import { channelSegments, channel4BankY } from './channel-layout.js';

// Radius and bucket count are configured together in scene.js.
export function wheelRadius() {
  return scene.wheel.radius;
}

// Fit the approved-size wheel above the bank, then lift it for the composition.
export function wheelCenterY() {
  const { x, radius, depth, faceScale, faceShear, flipX } = scene.wheel;
  const fourth = channelSegments.find(segment => segment.id === 4);
  const a = fourth.from[0];
  const b = fourth.to[0];
  const slope = (b[1] - a[1]) / (b[0] - a[0]);
  const direction = flipX ? -1 : 1;
  const support = Math.hypot(1, faceShear - direction * slope * faceScale);
  const allowed = [false, true].map(near => {
    const rawX = x + (near ? depth[0] : 0);
    const screenX = flipX ? 2 * x + depth[0] - rawX : rawX;
    return channel4BankY(screenX) - (near ? depth[1] : 0) - 3 - (radius + 3) * support;
  });
  return Math.min(...allowed) - scene.wheel.lift;
}

// Fixed projected faces surround two independent moving layers. The circular
// rotor turns BEFORE projection; the exposed buckets travel down the rim.
// Both rim centers and all plank endpoints share one axle projection.
// After reflection its screen direction is right/down 10°, parallel to across.
export function wheelFaces() {
  const {depth}=scene.wheel;
  return {front:[depth[0],depth[1]],rear:[0,0]};
}

function bucketSection(phase) {
  const {radius:r,faceScale,faceShear}=scene.wheel;
  const y=-r+phase*2*r, x=Math.sqrt(Math.max(0,r*r-y*y));
  const radial=[x/r,y/r], tangent=[-y/r,x/r];
  const faces=wheelFaces();
  const at=(radius,face,thickness=0)=>{
    const px=radial[0]*radius+tangent[0]*thickness;
    const py=radial[1]*radius+tangent[1]*thickness;
    return [px*faceScale+faces[face][0],py+px*faceShear+faces[face][1]];
  };
  return {r,at};
}

export function bucketGeometry(phase) {
  const {r,at}=bucketSection(phase);
  return [at(r,'rear'),at(r,'front'),at(r-6,'front'),at(r-6,'rear')];
}

export function bucketEdgeGeometry(phase) {
  const {r,at}=bucketSection(phase);
  return [at(r,'rear'),at(r,'front'),at(r,'front',1.5),at(r,'rear',1.5)];
}

export function drawWaterwheel() {
  const {x,depth,faceScale,faceShear,flipX}=scene.wheel;
  const y=wheelCenterY(),r=wheelRadius();
  const {rear}=wheelFaces();
  const visibleBuckets=scene.wheel.buckets/2;
  const reflection=flipX?`translate(${2*x+depth[0]} 0) scale(-1 1)`:'';
  const spokes=Array.from({length:8},(_,i)=>
    `<path d="M7,-3.5H${r-9}v7H7Z" transform="rotate(${i*45})" class="wheel-timber-spoke"/>`).join('');
  return `<g id="escher-wheel" data-structural-layer="wheel" transform="${reflection}">
    <g transform="translate(${x} ${y})">
      <g transform="matrix(${faceScale} ${faceShear} 0 1 ${rear[0]} ${rear[1]})"><circle r="${r-2.5}" class="wheel-rear-rim" style="fill:none;stroke-width:5"/></g>
      <g id="escher-wheel-buckets">${Array.from({length:visibleBuckets},(_,i)=>`<g class="wheel-moving-bucket">${polygon(bucketGeometry(i/visibleBuckets),'wheel-bucket-plank')}${polygon(bucketEdgeGeometry(i/visibleBuckets),'wheel-bucket-edge')}</g>`).join('')}</g>
      <g transform="matrix(${faceScale} ${faceShear} 0 1 ${depth[0]} ${depth[1]})">
        <circle r="${r-1}" class="wheel-interior"/>
        <g id="escher-wheel-rotor">
          ${spokes}
          <path d="M${r},0a${r},${r} 0 1 0 ${-2*r},0a${r},${r} 0 1 0 ${2*r},0 M${r-10},0a${r-10},${r-10} 0 1 1 ${-2*(r-10)},0a${r-10},${r-10} 0 1 1 ${2*(r-10)},0" fill-rule="evenodd" class="wheel-timber-rim"/>
        </g>
        <circle r="10" class="wheel-timber-hub"/><circle r="3" class="wheel-pin"/>
      </g>
    </g>
  </g>`;
}
