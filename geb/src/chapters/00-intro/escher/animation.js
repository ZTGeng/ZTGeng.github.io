import { scene } from './scene.js';
import { bucketGeometry, bucketEdgeGeometry } from './wheel.js';

export const motion = { revolution: 30, channelSpeed: 22, fallSpeed: 260 };
export const positiveMod = (value, period) => ((value % period) + period) % period;

export function splashParticle(index, seconds) {
  const life = .7 + (index % 5) * .09;
  const age = positiveMod(seconds + index * .137, life);
  const direction = index % 2 ? 1 : -1;
  const vx = direction * (12 + (index * 17 % 32));
  const vy = -(28 + index * 13 % 34);
  return { x: vx * age, y: vy * age + 62 * age * age,
    opacity: Math.sin(Math.PI * age / life) * .8 };
}

export function startAnimation(root) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'escher-motion-toggle';
  root.after(button);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches, inView = false, frame = 0, previous = null, seconds = 0;
  const rotor = root.querySelector('#escher-wheel-rotor');
  const buckets = [...root.querySelectorAll('#escher-wheel-buckets .wheel-moving-bucket')];
  const currents = [...root.querySelectorAll('.channel-current')].flatMap(group =>
    [...group.querySelectorAll('.current-lane')].map(lane=>{
      const thread=lane.querySelector('.current-thread');
      const length=thread.getTotalLength();
      const samples=Array.from({length:97},(_,i)=>thread.getPointAtLength(length*i/96));
      const at=t=>{
        const x=Math.max(0,Math.min(96,t*96)),i=Math.min(95,Math.floor(x)),f=x-i;
        return {x:samples[i].x*(1-f)+samples[i+1].x*f,y:samples[i].y*(1-f)+samples[i+1].y*f};
      };
      return {thread,length,at,direction:Number(group.dataset.currentDirection),ripples:[...lane.querySelectorAll('.current-ripple')]};
    }));
  const falls = [...root.querySelectorAll('.fall-streak')];
  const drops = [...root.querySelectorAll('.splash-drop')];
  const mist = [...root.querySelectorAll('.splash-mist')];
  const ripples = [...root.querySelectorAll('.pond-ripple ellipse')];
  const panel = root.closest('[role="tabpanel"]');
  const label = () => {
    button.textContent = paused ? '播放动画' : '暂停动画';
    button.setAttribute('aria-label', paused ? '播放水流与水车动画' : '暂停水流与水车动画');
  };
  function paint(t) {
    rotor.setAttribute('transform', `rotate(${positiveMod(t / motion.revolution * 360,360)})`);
    buckets.forEach((el,i) => {
      const phase = positiveMod(i/buckets.length + t/ (motion.revolution/scene.wheel.buckets) /buckets.length,1);
      el.children[0].setAttribute('points',bucketGeometry(phase).map(p=>p.join(',')).join(' '));
      el.children[1].setAttribute('points',bucketEdgeGeometry(phase).map(p=>p.join(',')).join(' '));
      el.style.opacity = Math.min(1,phase*buckets.length*1.5,(1-phase)*buckets.length*1.5);
    });
    currents.forEach(({thread,length,at,direction,ripples})=>{
      // Each ribbon wraps at its own dash period, avoiding a visible reset.
      thread.style.strokeDashoffset=String(-direction*positiveMod(t*Number(thread.dataset.speed),Number(thread.dataset.period)));
      ripples.forEach(el=>{
        const phase=positiveMod(Number(el.dataset.phase)+t*Number(el.dataset.speed)/length,1);
        const u=direction>0?phase:1-phase;
        const p=at(u),a=at(Math.max(0,u-.005)),b=at(Math.min(1,u+.005));
        const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+(direction<0?180:0);
        el.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
        el.style.opacity=String(Math.min(1,phase*12,(1-phase)*12)*.72);
      });
    });
    falls.forEach((el,i)=>{el.style.strokeDashoffset=String(-positiveMod(t*motion.fallSpeed+i*9,64));});
    drops.forEach((el,i)=>{
      const p=splashParticle(i,t);
      el.setAttribute('transform',`translate(${p.x} ${p.y})`); el.style.opacity=p.opacity;
    });
    ripples.forEach((el,i)=>{
      const phase=positiveMod(t*.7+i/ripples.length,1);
      el.setAttribute('transform',`scale(${.25+phase*2.4})`);
      el.style.opacity=(1-phase)*.48;
    });
    mist.forEach((el,i)=>{
      const age=positiveMod(t*.85+i/mist.length,1);
      el.setAttribute('transform',`translate(${Math.sin(i*2.4)*age*10} ${-age*13}) scale(${.65+age*.65})`);
      el.style.opacity = Math.sin(Math.PI*age)*.42;
    });
  }
  const active = () => !paused && inView && !document.hidden && !panel.hidden;
  function tick(now) {
    frame=0;
    if (!active()) { previous=null; return; }
    if (previous !== null) seconds += Math.min((now-previous)/1000,.1);
    previous=now; paint(seconds); frame=requestAnimationFrame(tick);
  }
  function sync() {
    if (!active()) {cancelAnimationFrame(frame);frame=0;previous=null;}
    else if (!frame) frame=requestAnimationFrame(tick);
    root.dataset.motionState=active()?'running':'paused';
  }
  button.addEventListener('click',()=>{paused=!paused;label();sync();});
  const onReduce = () => {paused=reduce.matches;label();sync();};
  reduce.addEventListener('change',onReduce);
  document.addEventListener('visibilitychange',sync);
  const intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();});
  intersection.observe(root);
  const tabs=new MutationObserver(sync); tabs.observe(panel,{attributes:true,attributeFilter:['hidden']});
  const destroy=()=>{
    cancelAnimationFrame(frame);intersection.disconnect();tabs.disconnect();
    reduce.removeEventListener('change',onReduce);document.removeEventListener('visibilitychange',sync);
  };
  window.addEventListener('pagehide',event=>{if(event.persisted){cancelAnimationFrame(frame);frame=0;previous=null;}else destroy();});
  window.addEventListener('pageshow',sync);
  paint(0);label();sync();
  return destroy;
}
