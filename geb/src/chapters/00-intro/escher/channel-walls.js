import { scene } from './scene.js';
import { mix, turnHeightAt, turnLayout, channelSegments } from './channel-layout.js';
import { polygon, add, path, linePath } from './drawing.js';

// Keep a constant physical bank thickness through both straight runs and bends.
export const waterInset = scene.channelWallThickness / (2 * scene.channelFootprint.halfSide);
export const turnWaterScale = 1 - 2 * waterInset;
const subdivisions = 24;
export const sampleEdge = (a, b) => Array.from({ length: subdivisions + 1 }, (_, i) => mix(a, b, i / subdivisions));

export const brickCourseHeight = scene.brickCourseHeight;
export const channelBrickLength = 29;
export const wallStepStations = [1/3,2/3];

function station(segment, point) {
  const [a,d]=segment.from,b=segment.to[0];
  const along=b.map((x,i)=>x-a[i]),cross=d.map((x,i)=>x-a[i]),delta=point.map((x,i)=>x-a[i]);
  const skew=segment.to[1].map((x,i)=>x-b[i]-d[i]+a[i]);
  const determinant=along[0]*cross[1]-along[1]*cross[0];
  let t=(delta[0]*cross[1]-delta[1]*cross[0])/determinant;
  let v=(along[0]*delta[1]-along[1]*delta[0])/determinant;
  // The approach to the pitched turn tapers its end cross-section. Invert
  // that bilinear strip rather than treating it as a parallelogram.
  for(let i=0;i<6;i++) {
    const error=a.map((x,k)=>x+t*along[k]+v*cross[k]+t*v*skew[k]-point[k]);
    const dt=along.map((x,k)=>x+v*skew[k]),dv=cross.map((x,k)=>x+t*skew[k]);
    const det=dt[0]*dv[1]-dt[1]*dv[0];
    t-=(error[0]*dv[1]-error[1]*dv[0])/det;
    v-=(dt[0]*error[1]-dt[1]*error[0])/det;
  }
  return {t,v};
}

export function wallHeightAt(segment, point) {
  if(typeof point === 'number') {
    const start=mix(...segment.from),end=mix(...segment.to);
    point=mix(start,end,(point-start[0])/(end[0]-start[0]));
  }
  const t=station(segment,point).t;
  const step=Math.min(2,Math.max(0,Math.floor((t+1e-9)*3)));
  return brickCourseHeight*(point.course ?? (2*segment.id-1+step));
}

// All beds and turn floors share the original channel plane. Thicker courses
// raise the coping, rather than lowering the bed to keep old column feet.
export function wallBaseAt(_segment, point) {
  return [...point];
}

export const wallTopAt = (segment,point) => add(wallBaseAt(segment,point),[0,-wallHeightAt(segment,point)]);

// Duplicate the exact break point at both elevations: a vertical riser, never
// a sampled diagonal ramp. The same points drive water and moving highlights.
export function sampleSteppedEdge(segment,a,b) {
  const from=station(segment,a).t,to=station(segment,b).t;
  const breaks=wallStepStations.map((t,i)=>({s:(t-from)/(to-from),course:2*segment.id-1+i}))
    .filter(({s})=>Number.isFinite(s)&&s>1e-8&&s<1-1e-8);
  const samples=sampleEdge(a,b).map((p,i)=>({p,s:i/subdivisions}))
    .filter(({s})=>!breaks.some(br=>Math.abs(s-br.s)<1e-8));
  breaks.forEach(({s,course})=>{
    const before=to>from?course:course+1,after=to>from?course+1:course;
    samples.push({s,p:Object.assign(mix(a,b,s),{course:before})},{s,p:Object.assign(mix(a,b,s),{course:after})});
  });
  return samples.sort((a,b)=>a.s-b.s).map(({p})=>p);
}

// Continue each straight wall into its adjoining junction. The outer bank
// reaches the opposite bay edge; the inner bank stops at the inner elbow.
// Both endpoints remain on the same wall line as the original straight run.
export function wallRun(segment, bank) {
  const inset = bank === 'near' ? waterInset : 1 - waterInset;
  const index = bank === 'near' ? 0 : 1;
  const a = segment.from[index], b = segment.to[index];
  const innerA = mix(...segment.from, inset), innerB = mix(...segment.to, inset);
  const extend = (edge, tier, outer, inner) => {
    if (!tier) {
      // Carry the masonry past the open water outlet so both mill piers
      // have a full-width footing. The water itself ends under the wheel.
      if(segment.id===4) {
        const dx=-24,dy=dx*(segment.to[0][1]-segment.from[0][1])/(segment.to[0][0]-segment.from[0][0]);
        return [add(outer,[dx,dy]),add(inner,[dx,dy])];
      }
      return [outer, inner];
    }
    const turn = channelSegments.flatMap(segment => segment.turns).find(turn => turn.tier === tier);
    const geometry = turnLayout(turn);
    const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-7;
    const connection = [turn.entry, turn.exit].find(name => geometry.edges[name].every(point => edge.some(p => same(p, point))));
    const other = connection === turn.entry ? turn.exit : turn.entry;
    const innerElbow = geometry.edges[other].some(point => same(point, outer));
    const fraction = innerElbow ? waterInset : 1;
    const middle = mix(...edge);
    const delta = geometry.center.map((value, i) => 2 * fraction * (value - middle[i]));
    return [add(outer, delta), add(inner, delta)];
  };
  const [head, innerHead] = extend(segment.from, segment.fromTier, a, innerA);
  const [tail, innerTail] = extend(segment.to, segment.toTier, b, innerB);
  if (segment.fromTier === 'left-upper' && bank === 'far') {
    // The waterfall has no second straight run: carry this same outside wall
    // around the final bend to the lip, leaving the middle of the lip open.
    const turn = segment.turns.find(turn => turn.tier === 'left-upper');
    const { corners: [fl, fr, , bl], center } = turnLayout(turn);
    return {
      bank, segment,
      outer: [fl, bl, a, b, tail],
      inner: [mix(fl, fr, waterInset), mix(center, bl, turnWaterScale), innerA, innerB, innerTail],
    };
  }
  return { bank, segment, outer: [head, a, b, tail], inner: [innerHead, innerA, innerB, innerTail] };
}

export function channelWall(run, height) {
  const at = typeof height === 'function' ? height : () => height;
  const up = point => run.segment ? wallTopAt(run.segment,point) : add(point,[0,-at(point)]);
  const base = point => run.segment ? wallBaseAt(run.segment,point) : point;
  const sampleRun = nodes => nodes.slice(1).flatMap((end, i) => (run.segment?sampleSteppedEdge(run.segment,nodes[i],end):sampleEdge(nodes[i],end)).slice(i ? 1 : 0));
  const outerTop = sampleRun(run.outer).map(up), innerTop = sampleRun(run.inner).map(up);
  // Anchor brick spacing to the original straight section, then continue it
  // in both directions over the extended path, including the waterfall bend.
  const spans = run.outer.slice(1).map((end, i) => Math.hypot(end[0] - run.outer[i][0], end[1] - run.outer[i][1]));
  const anchor = spans.slice(0, run.outer.length - 3).reduce((sum, length) => sum + length, 0);
  let walked = 0, joints = '';
  spans.forEach((length, i) => {
    const end = walked + length;
    if (length > 1e-8) {
      const first = Math.ceil((walked - anchor) / channelBrickLength) * channelBrickLength + anchor;
      for (let distance = first; distance < end - 1e-7; distance += channelBrickLength) {
        const t = (distance - walked) / length;
        const outer = mix(run.outer[i], run.outer[i + 1], t);
        const inner = mix(run.inner[i], run.inner[i + 1], t);
        joints += path(linePath([up(outer), up(inner)]), 'channel-joint channel-cap-joint');
        if (run.bank !== 'far') joints += path(linePath([up(outer), base(outer)]), 'channel-joint channel-vertical-joint');
      }
    }
    walked = end;
  });
  let risers='',courses='',coping='';
  if(run.segment) {
    const segment=run.segment;
    // Draw each horizontal coping strip independently. Never fill the
    // projected vertical riser between two strips.
    run.outer.slice(1).forEach((end,index)=>{
      const start=run.outer[index],ia=run.inner[index],ib=run.inner[index+1];
      const ta=station(segment,start).t,tb=station(segment,end).t;
      const cuts=[0,...wallStepStations.map(t=>(t-ta)/(tb-ta)).filter(t=>Number.isFinite(t)&&t>1e-8&&t<1-1e-8).sort((a,b)=>a-b),1];
      cuts.slice(1).forEach((to,j)=>{
        const from=cuts[j],course=wallHeightAt(segment,mix(start,end,(from+to)/2))/brickCourseHeight;
        const at=(a,b,t)=>up(Object.assign(mix(a,b,t),{course}));
        const a=at(start,end,from),b=at(start,end,to),c=at(ia,ib,to),d=at(ia,ib,from);
        coping+=path(linePath([a,b,c,d])+'Z','channel-wall-cap','stroke="none"');
        coping+=path(linePath([a,b])+linePath([d,c]),'channel-coping-edge');
      });
    });
    wallStepStations.forEach((t,i)=>{
      const outer=mix(run.outer.at(-3),run.outer.at(-2),t);
      const inner=mix(run.inner.at(-3),run.inner.at(-2),t);
      const course=2*segment.id-1+i;
      const atCourse=(p,c)=>up(Object.assign([...p],{course:c}));
      const high=[atCourse(outer,course+1),atCourse(inner,course+1)];
      const low=[atCourse(outer,course),atCourse(inner,course)];
      const left=high[0][0]<high[1][0]?0:1;
      const edge=segment.id%2?left:1-left;
      risers+=path(linePath([high[1-edge],high[edge],low[edge]]),'channel-step-edge',`data-visible-edge="${segment.id%2?'left':'right'}"`);
    });
    for(let course=1;course<2*segment.id+1;course++) {
      let drawing=false,d='';
      sampleRun(run.outer).forEach(p=>{
        if(wallHeightAt(segment,p)>course*brickCourseHeight+.01) {
          const q=add(base(p),[0,-course*brickCourseHeight]);
          d+=`${drawing?'L':'M'}${q}`;drawing=true;
        } else drawing=false;
      });
      if(d) courses+=path(d,'channel-course-joint');
    }
  }
  return `<g class="channel-side-wall" data-extended-through-turn="true" data-bank="${run.bank}" data-joint-style="${run.bank === 'far' ? 'cap-only' : 'brick'}">
    ${polygon([...sampleRun(run.inner).map(base), ...innerTop.toReversed()], 'channel-wall-inner')}
    ${polygon([...sampleRun(run.outer).map(base), ...outerTop.toReversed()], 'channel-wall-outer')}
    ${run.segment?coping:polygon([...outerTop, ...innerTop.toReversed()], 'channel-wall-cap')}
    ${risers}<g class="channel-wall-joints">${courses}${joints}</g>
  </g>`;
}

// The slab follows precisely the same extended wall path. Its plain vertical
// edge stays separate from the brick joints, which stop at the wall's base.
export function channelFloor(run) {
  const outer=run.outer.map(p=>run.segment?wallBaseAt(run.segment,p):p);
  const inner=run.inner.map(p=>run.segment?wallBaseAt(run.segment,p):p);
  const lower = outer.map(point => add(point, [0, scene.wallDepth]));
  return `<g class="channel-floor" data-extended-through-turn="true">
    ${polygon([...outer, ...lower.toReversed()], 'channel-bed-side')}
    ${polygon([...outer, ...inner.toReversed()], 'channel-corner-stone')}
  </g>`;
}

// The complete bed spans the first turn above the middle tower's ceiling.
// It is drawn with channel 1, above that tower and below its water and walls.
export function channelTurnFloor(segment,turn) {
  const top=turnLayout(turn).corners.map(p=>wallBaseAt(segment,p));
  const bottom=top.map(p=>add(p,[0,scene.wallDepth]));
  return `<g class="channel-turn-floor" data-turn="${turn.tier}" data-full-turn-bed="true">
    ${polygon([top[0],top[1],bottom[1],bottom[0]],'channel-bed-side')}
    ${polygon([top[1],top[2],bottom[2],bottom[1]],'channel-bed-side')}
    ${polygon(top,'channel-corner-stone')}
  </g>`;
}

export function straightWaterEdges(segment, side = 'left') {
  const [a, d] = segment.from, [b, c] = segment.to;
  const leftToRight=mix(...segment.from)[0]<mix(...segment.to)[0];
  const fraction=(side==='left')===leftToRight?.15:.85;
  const height=wallHeightAt(segment,mix(mix(...segment.from),mix(...segment.to),fraction));
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const waterAt=point=>{
    const {t,v}=station(segment,point);
    const head=turnHeightAt(segment.fromTier,mix(...segment.from,v));
    const tail=segment.toTier?turnHeightAt(segment.toTier,mix(...segment.to,v)):scene.channelWallHeights[4].left;
    // Rise only AFTER each masonry step, without a vertical jump in the
    // water. A shared smooth surface drives its boundary and every ripple.
    const progress=(smooth(3*t-1)+smooth(3*t-2))/2;
    const freeboard=scene.channelWaterFreeboard+2*Math.sin(Math.PI*Math.max(0,Math.min(1,t)))**2;
    return add(point,[0,-head-(tail-head)*progress+freeboard]);
  };
  return {
    near: [mix(a, d, waterInset), mix(b, c, waterInset)],
    far: [mix(a, d, 1 - waterInset), mix(b, c, 1 - waterInset)],
    height,
    heightAt: point => wallHeightAt(segment, point),
    waterElevation: height - scene.channelWaterFreeboard,
    waterAt,
    guideAt:waterAt,
  };
}
