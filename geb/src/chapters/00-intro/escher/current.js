import { polygon, path, linePath } from './drawing.js';

// Parameterized ribbons follow the water plane, independently of masonry
// steps. Both channel halves share identical paths and animation phases.
export function currentSurface(id, outline, pointAt, direction, lengthHint=300) {
  const count=Math.max(3,Math.round(lengthHint/66));
  const lanes=[.17,.35,.53,.72,.86];
  return `<g class="channel-current" data-current-direction="${direction}">
    <defs><clipPath id="${id}">${polygon(outline,'')}</clipPath></defs>
    <g clip-path="url(#${id})">
      ${lanes.map((lane,i)=>{
        const points=Array.from({length:49},(_,n)=>{
          const t=n/48;
          return pointAt(t,lane+Math.sin(t*Math.PI*7+i*1.9)*.025);
        });
        const period=61+i*13;
        return `<g class="current-lane" data-lane="${i}">
          ${path(linePath(points),'current-thread',`data-period="${period}" data-speed="${18+i*2}" stroke-dasharray="${20+i*4} 6 3 ${period-29-i*4}"`)}
          ${i%2===0?Array.from({length:count},(_,j)=>`<g class="current-ripple" data-phase="${(j+.18*Math.sin(j*3+i)+.11*i)/count}" data-speed="${20+i*1.8}"><g transform="scale(${.72+(j%3)*.12} .62)">
            <path d="M-2.5,-2 Q-.5,0 -2.5,2" class="current-crest"/>
            ${j%2===0?'<ellipse cx="1.5" cy=".3" rx=".8" ry=".45" class="current-foam"/>':''}
          </g></g>`).join(''):''}
        </g>`;
      }).join('')}
    </g>
  </g>`;
}
