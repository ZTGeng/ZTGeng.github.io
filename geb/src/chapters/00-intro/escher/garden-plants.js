import { path } from './drawing.js';

// The print's foreground combines hollow sponge cups, branching coral,
// curling stems and low grassy growth, rather than identical potted plants.
const noise=n=>{const x=Math.sin(n*127.1+31.7)*43758.5453;return x-Math.floor(x);};
function sponge(seed,h,w) {
  const dots=Array.from({length:26},(_,i)=>{
    const y=-h+8+noise(seed+i)* (h-14),x=(noise(seed+i+40)-.5)*w*(.45-.4*y/h);
    return `<ellipse cx="${x}" cy="${y}" rx=".65" ry="1"/>`;
  }).join('');
  return `<path d="M${-w/2},${-h}Q${-w*.30},${-h*.45} -4,0Q0,4 4,0Q${w*.30},${-h*.45} ${w/2},${-h}Z" class="garden-sponge"/>
    <path d="M${-w*.29},${-h+6}Q-2,${-h*.4} -1,-4M${w*.27},${-h+6}Q2,${-h*.4} 1,-4" class="garden-sponge-rib"/>
    <g class="garden-pores">${dots}</g>
    <ellipse cx="0" cy="${-h}" rx="${w/2}" ry="${w*.18}" class="garden-sponge-rim"/>
    <ellipse cx="0" cy="${-h+1}" rx="${w*.36}" ry="${w*.105}" class="garden-sponge-hollow"/>`;
}
function coral(seed,h) {
  let d='';
  function branch(x,y,length,angle,depth){
    const a=angle*Math.PI/180,bx=x+Math.cos(a)*length,by=y+Math.sin(a)*length;
    d+=`M${x},${y}Q${x+Math.cos(a+.2)*length*.5},${y+Math.sin(a+.2)*length*.5} ${bx},${by}`;
    if(depth) for(const turn of [-34,5,39]) branch(bx,by,length*(.52+noise(seed+depth+turn)*.1),angle+turn,depth-1);
  }
  branch(0,0,h*.42,-90,3);
  return path(d,'garden-coral');
}
function curl(seed,h) {
  return Array.from({length:4},(_,j)=>{
    const x=(j-1.5)*5,lean=(noise(seed+j)-.5)*22;
    return path(`M${x},0C${x-12},${-h*.35} ${x+lean+11},${-h*.6} ${x+lean},${-h}q-7,-9 -10,0q0,6 5,4`,'garden-tendril');
  }).join('');
}
function grass(seed,h) {
  return Array.from({length:7},(_,j)=>path(`M0,0Q${(j-3)*2},${-h*.55} ${(j-3)*4},${-h*(.55+noise(seed+j)*.45)}`,'garden-grass')).join('');
}
export function gardenVegetation(project,width,depth) {
  const plants=[];
  for(let i=0;i<55;i++) plants.push({u:8+noise(i)* (width-16),v:6+noise(i+80)*(depth-16),kind:'grass',h:15+noise(i+20)*24,seed:i});
  const cups=[[.08,.8,104,27],[.19,.66,85,31],[.3,.9,125,34],[.42,.73,66,23],[.15,.43,75,38],[.32,.42,92,32],[.46,.48,52,27],[.09,.19,44,23],[.34,.18,58,35],[.53,.24,43,23]];
  cups.forEach(([u,v,h,w],i)=>plants.push({u:u*width,v:v*depth,kind:'sponge',h,w,seed:100+i}));
  for(let i=0;i<9;i++) plants.push({u:(.48+noise(i+180)*.43)*width,v:(.12+noise(i+190)*.65)*depth,kind:'coral',h:45+noise(i+200)*50,seed:200+i});
  for(let i=0;i<11;i++) plants.push({u:(.25+noise(i+220)*.65)*width,v:(.45+noise(i+240)*.5)*depth,kind:'curl',h:38+noise(i+260)*54,seed:300+i});
  return `<g id="escher-garden-vegetation">${plants.map(p=>({...p,xy:project(p.u,p.v)})).sort((a,b)=>a.xy[1]-b.xy[1]).map(p=>`<g class="garden-specimen" data-kind="${p.kind}" transform="translate(${p.xy.join(' ')})">${p.kind==='sponge'?sponge(p.seed,p.h,p.w):p.kind==='coral'?coral(p.seed,p.h):p.kind==='curl'?curl(p.seed,p.h):grass(p.seed,p.h)}</g>`).join('')}</g>`;
}
