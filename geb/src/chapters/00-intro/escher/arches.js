import { scene } from './scene.js';
import { bay, mix, projectTowerPlane } from './channel-layout.js';
import { polygon, path, linePath, add } from './drawing.js';

// A finite masonry arch: outer face, curved intrados and return at each spring.
export function towerBeam(level) {
  if (level.pierBay) return '';
  const intermediate=level.tier==='left-middle'||level.tier==='right-lower';
  const { center } = bay(level), frame=intermediate
    ? {...scene.archFrame,top:scene.intermediateArch.top} : scene.archFrame;
  const height=level.y-level.top;
  const corners=[[-frame.halfWidth,-frame.halfDepth],[frame.halfWidth,-frame.halfDepth],[frame.halfWidth,frame.halfDepth],[-frame.halfWidth,frame.halfDepth]]
    .map(([u,v])=>projectTowerPlane(level.tier,center,u,v));
  const thickness=10;
  function face(a,b,inward,material,side) {
    const ta=add(a,[0,-height-frame.top]),tb=add(b,[0,-height-frame.top]);
    const ba=add(a,[0,-height-frame.bottom]),bb=add(b,[0,-height-frame.bottom]);
    const left=mix(ba,bb,.17),right=mix(ba,bb,.83),crown=add(mix(ba,bb),[0,-frame.crown]);
    const insetLeft=add(left,inward),insetRight=add(right,inward),insetCrown=add(crown,inward);
    const clip=`escher-arch-${level.tier}-${side}`;
    const q=t=>left.map((v,i)=>(1-t)**2*v+2*(1-t)*t*crown[i]+t*t*right[i]);
    const joints=[.14,.32,.5,.68,.86].map(t=>{
      const p=q(t),tangent=left.map((v,i)=>2*((1-t)*(crown[i]-v)+t*(right[i]-crown[i])));
      const length=Math.hypot(...tangent);
      return path(linePath([p,add(p,[tangent[1]*7/length,-tangent[0]*7/length])]),'arch-stone-joint');
    }).join('');
    return `<g class="arch-masonry" data-arch-side="${side}" data-thickness="${thickness}">
      ${path(`M${ta}L${tb} ${bb} ${right}Q${crown} ${left}L${ba}Z`,material)}
      <defs><clipPath id="${clip}"><path d="M${left}Q${crown} ${right}l0,45L${add(left,[0,45])}Z"/></clipPath></defs>
      <g clip-path="url(#${clip})">
        ${path(`M${left}Q${crown} ${right}L${insetRight}Q${insetCrown} ${insetLeft}Z`,'arch-intrados')}
        ${polygon([left,insetLeft,add(insetLeft,[0,6]),add(left,[0,6])],'arch-spring-return')}
        ${polygon([right,insetRight,add(insetRight,[0,6]),add(right,[0,6])],'arch-spring-return')}
        ${path(`M${insetLeft}Q${insetCrown} ${insetRight}`,'arch-inner-edge')}
      </g>
      ${joints}
    </g>`;
  }
  const origin=projectTowerPlane(level.tier,center,0,0);
  const inward=(u,v)=>{
    const p=projectTowerPlane(level.tier,center,u,v);
    return [p[0]-origin[0],p[1]-origin[1]];
  };
  const top=corners.map(p=>add(p,[0,-height-frame.top]));
  // The intermediate ceiling is a flush plane: no separate thick top slab.
  const cap=intermediate
    ? `<g class="tower-intermediate-top" data-tier="${level.tier}" data-thickness="0">${polygon(top,'stone-light')}</g>`
    : polygon(top,'stone-light');
  return `<g class="escher-tier-beam" data-tier="${level.tier}">
    ${face(corners[0],corners[1],inward(0,thickness),'stone-mid','front')}
    ${face(corners[1],corners[2],inward(-thickness,0),'stone-dark','right')}
    ${cap}
  </g>`;
}
