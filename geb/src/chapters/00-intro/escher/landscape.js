import { channel4BankY } from './channel-layout.js';
import { polygon, path, linePath } from './drawing.js';

// Independently marked major contours from the museum's
// 950×1200 reproduction, not a procedural repeated terrace/angle pattern.
// Reference: https://www.escherinhetpaleis.nl/en/about-escher/masterpieces/waterfall
// Coordinates are image pixels. Register the image border, tower corner and
// center, and mill roof separately: the reconstructed foreground proportions
// differ from the print, so a single global stretch would detach wall ends.
export const terraceContours = [
  { id:'ridge-far-1', depth:'far', drop:25, points:[[20,72],[177,29],[282,31],[340,64],[458,30],[700,28],[920,26]] },
  { id:'ridge-far-2', depth:'far', drop:32, points:[[20,146],[102,121],[145,125],[145,96],[226,72],[283,81],[292,101],[379,76],[435,87],[485,59],[555,65],[578,98],[720,73],[780,77],[816,104],[920,83]] },
  { id:'ridge-middle-1', depth:'middle', drop:37, points:[[20,252],[91,225],[112,203],[175,183],[203,211],[272,190],[285,165],[344,155],[378,181],[443,159],[480,176],[556,142],[610,155],[644,136],[717,143],[756,167],[826,150],[920,157]] },
  { id:'ridge-middle-2', depth:'middle', drop:43, points:[[20,380],[75,352],[87,328],[184,280],[203,302],[270,276],[280,292],[447,233],[477,254],[579,217],[596,230],[675,199],[724,217],[920,200]] },
  { id:'ridge-near-1', depth:'near', drop:42, points:[[20,474],[82,438],[99,407],[185,354],[214,368],[257,345],[286,365],[341,341],[358,363],[476,317],[509,337],[612,298],[641,316],[719,281],[769,303],[920,267]] },
  { id:'ridge-near-2', depth:'near', drop:43, points:[[20,589],[73,558],[88,527],[158,487],[174,458],[254,405],[278,419],[302,397],[318,424]] },
  { id:'ridge-near-3', depth:'near', drop:41, points:[[20,690],[71,659],[82,624],[139,592],[150,553],[258,483],[272,456],[321,427]] },
  { id:'ridge-near-4', depth:'near', drop:36, points:[[20,785],[66,756],[75,729],[132,701],[144,668],[205,638],[220,612],[279,575]] },
].map(contour=>{
  if(contour.points.at(-1)[0]!==920) return contour;
  const points=contour.points.map(p=>[...p]);
  const [a,b]=points.slice(-2);
  points.push([1160,b[1]+(1160-b[0])*(b[1]-a[1])/(b[0]-a[0])]);
  return {...contour,points};
});

function register(value,anchors) {
  const found=anchors.findIndex((a,i)=>i<anchors.length-1&&value<=anchors[i+1][0]);
  const i=found<0?anchors.length-2:found;
  const [a,b]=anchors.slice(i,i+2);
  return a[1]+(value-a[0])/(b[0]-a[0])*(b[1]-a[1]);
}

export const landscapePoint = ([x,y]) => [
  register(x,[[20,0],[323,323],[425,381],[747,690],[920,780]]),
  register(y,[[20,50],[140,110],[420,303],[560,421],[800,620],[1200,925]]),
];

export function contourY(contour,x) {
  const points=contour.points;
  for(let i=1;i<points.length;i++) {
    const a=points[i-1],b=points[i];
    if(x>=a[0]&&x<=b[0]&&b[0]>a[0]) return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
  }
  return x<points[0][0]?points[0][1]:points.at(-1)[1];
}

export function terraceTop(index) {
  const lower=terraceContours[index];
  const upper=index?terraceContours[index-1]:{points:[[20,20],[1160,20]],drop:0};
  const min=Math.max(lower.points[0][0],upper.points[0][0]);
  const max=Math.min(lower.points.at(-1)[0],upper.points.at(-1)[0]);
  const xs=[...new Set([min,max,...lower.points.map(p=>p[0]),...upper.points.map(p=>p[0])])]
    .filter(x=>x>=min&&x<=max).sort((a,b)=>a-b);
  const front=xs.map(x=>[x,contourY(lower,x)]);
  // Common endpoints connect every terrace top directly to the wall above.
  const back=xs.map(x=>[x,Math.min(contourY(lower,x),contourY(upper,x)+upper.drop)]);
  return [...front,...back.toReversed()].map(landscapePoint);
}

function wallGrain(points,drop) {
  let result='';
  points.slice(1).forEach((b,i)=>{
    const a=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let row=1;row*9<drop;row++) {
      const y=row*9;
      result+=path(linePath([[a[0],a[1]+y],[b[0],b[1]+y]].map(landscapePoint)),'terrace-stone-joint');
      for(let d=(row%2?10:20);d<length;d+=24) {
        const t=d/length,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+y];
        result+=path(linePath([p,[p[0],p[1]+7]].map(landscapePoint)),'terrace-stone-joint');
      }
    }
  });
  return result;
}

function groundGrain(index, contours=terraceContours) {
  const lower=contours[index],upper=contours[index-1];
  let d='';
  for(let x=lower.points[0][0]+8;x<lower.points.at(-1)[0];x+=15) {
    const back=upper?contourY(upper,x)+upper.drop:20;
    const front=contourY(lower,x);
    for(let y=back+5+(x%7);y<front-3;y+=10) {
      d+=linePath([[x,y],[x+6,y+2]].map(landscapePoint));
    }
  }
  return path(d,'terrace-earth-hatch');
}

export function terracePlants(index) {
  const lower=terraceContours[index],upper=terraceContours[index-1];
  if(index===0) return [];
  const candidates=[[125,390,665],[90,325,590,855],[73,238,505,735],[58,170,368,620,830],
    [72,209,465,722,872],[65,155,265],[54,119,235],[47,124,223]][index];
  return candidates.filter(x=>x<lower.points.at(-1)[0]&&contourY(lower,x)-(contourY(upper,x)+upper.drop)>18)
    .map((x,i)=>({reference:[x,contourY(lower,x)-6],size:(lower.depth==='far'?.45:lower.depth==='middle'?.6:.8)*(1+i%3*.12)}));
}

function shrub({reference,size}) {
  const [x,y]=landscapePoint(reference);
  return `<g class="terrace-shrub" transform="translate(${x} ${y}) scale(${size})">
    <path d="M0,0L0,-13M0,-4l-6,-5m6,3l6,-6m-6,2l-4,-6m4,4l3,-7"/>
    <path d="M-6,-8q-5,-3 -2,-6q-3,-4 2,-5q0,-5 5,-3q4,-4 6,1q6,-1 4,4q4,4 -1,6q-2,5 -7,2Z" class="terrace-shrub-crown"/>
  </g>`;
}

// The one tall, narrow house visible in the print's upper-left terraces.
// Image coordinates match the same registration as the terrain contours.
export const terraceHouse={roof:[[80,72],[107,80],[146,70],[122,60]],height:140,horizontalScale:.6,afterContour:2};
export function terraceTallHouse() {
  const centerX=landscapePoint([113,212])[0];
  const housePoint=point=>{
    const p=landscapePoint(point);
    return [centerX+(p[0]-centerX)*terraceHouse.horizontalScale,p[1]];
  };
  const roof=terraceHouse.roof.map(housePoint);
  const base=terraceHouse.roof.map(([x,y])=>housePoint([x,y+terraceHouse.height]));
  const frontCrown=housePoint([93.5,64]),backCrown=housePoint([134,53]);
  return `<g id="escher-terrace-tall-house" data-reference-position="upper-left">
    ${polygon([roof[0],roof[1],base[1],base[0]],'terrace-house-front')}
    ${polygon([roof[1],roof[2],base[2],base[1]],'terrace-house-side')}
    ${path(`M${roof[0]}Q${frontCrown} ${roof[1]}L${roof[2]}Q${backCrown} ${roof[3]}Z`,'terrace-house-roof')}
    ${path(`M${roof[0]}Q${frontCrown} ${roof[1]}Z`,'terrace-house-front')}
    ${polygon([[127,88],[134,86],[134,100],[127,102]].map(housePoint),'terrace-house-window')}
  </g>`;
}

// Related shallow terraces with deterministic variations in slope and bends.
// Long receding runs share their direction; short returns face down-right.
export const rightTerraces=Array.from({length:5},(_,i)=>{
  const y=360+i*100;
  return {drop:24+i%3*2,points:[[425,y],[650+i*11,y-70-i*2],[680+i*11,y-54-i],[870-i*5,y-115-i*3],[900+i*2,y-95-i*2],[1160,y-180+i*5]]};
});
function rightHillside() {
  return `<defs><clipPath id="right-hillside-limit">${polygon([[0,0],[900,0],[900,channel4BankY(900)-31],[0,channel4BankY(0)-31]],'')}</clipPath></defs><g id="escher-right-hillside" clip-path="url(#right-hillside-limit)">${rightTerraces.map((c,i)=>{
    const previous=rightTerraces[i-1];
    const top=c.points.map(landscapePoint);
    const back=previous?previous.points.map(([x,y])=>landscapePoint([x,y+previous.drop])):c.points.map(([x])=>landscapePoint([x,20]));
    const bottom=c.points.map(([x,y])=>landscapePoint([x,y+c.drop]));
    const clip=`right-hill-${i}`;
    return `<g class="terrace-study-middle">
      <defs><clipPath id="${clip}">${polygon([...top,...back.toReversed()],'')}</clipPath></defs>
      ${polygon([...top,...back.toReversed()],'terrace-ground')}
      <g clip-path="url(#${clip})">${groundGrain(i,rightTerraces)}</g>
      ${c.points.slice(1).map((b,j)=>{const a=c.points[j];return polygon([a,b,[b[0],b[1]+c.drop],[a[0],a[1]+c.drop]].map(landscapePoint),b[1]>a[1]?'terrace-wall-side':'terrace-wall-front');}).join('')}
      ${wallGrain(c.points,c.drop)}
      ${path(linePath(top),'terrace-study-edge')}${path(linePath(bottom),'terrace-wall-base')}
      ${[550,735,965,1100].map((x,j)=>{
        x+=Math.sin(i*3+j)*18;
        const y=contourY(c,x)-7;
        return !previous||y>contourY(previous,x)+previous.drop+14?shrub({reference:[x,y],size:.55+(i%3)*.08}):'';
      }).join('')}
    </g>`;
  }).join('')}</g>`;
}

export function landscapeSketch() {
  return `<g id="escher-terrace-background" data-stage="print-details">
    ${rightHillside()}
    ${terraceContours.map(({id,depth,drop,points},index)=>{
      const edge=points.map(landscapePoint);
      const ground=terraceTop(index);
      const groundClip=`escher-terrace-ground-${index}`,wallClip=`escher-terrace-wall-${index}`;
      const bottom=points.toReversed().map(([x,y])=>landscapePoint([x,y+drop]));
      const faces=points.slice(1).map((b,i)=>{
        const a=points[i];
        const side=b[1]>a[1]||b[0]-a[0]<25;
        return polygon([a,b,[b[0],b[1]+drop],[a[0],a[1]+drop]].map(landscapePoint),side?'terrace-wall-side':'terrace-wall-front');
      }).join('');
      const corners=points.slice(1,-1).map(([x,y])=>path(linePath([[x,y],[x,y+drop]].map(landscapePoint)),'terrace-wall-return')).join('');
      return `<g data-contour="${id}" class="terrace-study-${depth}">
        <defs>
          <clipPath id="${groundClip}">${polygon(ground,'')}</clipPath>
          <clipPath id="${wallClip}">${polygon([...edge,...bottom],'')}</clipPath>
        </defs>
        ${polygon(ground,'terrace-ground')}
        <g class="terrace-ground-texture" clip-path="url(#${groundClip})">${groundGrain(index)}</g>
        ${faces}${corners}
        <g class="terrace-wall-texture" clip-path="url(#${wallClip})">${wallGrain(points,drop)}</g>
        ${path(linePath(edge),'terrace-study-edge')}
        ${path(linePath(bottom.toReversed()),'terrace-wall-base')}
        ${terracePlants(index).map(shrub).join('')}
      </g>`;
    }).map((markup,index)=>markup+(index===terraceHouse.afterContour?terraceTallHouse():'')).join('')}
  </g>`;
}
