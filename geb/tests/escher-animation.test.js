import test from 'node:test';
import assert from 'node:assert/strict';
import { motion, positiveMod, splashParticle, createSplashParticle, startAnimation } from '../src/chapters/00-intro/escher/animation.js';
import { animationHarness } from './helpers/animation-harness.js';
import { bucketGeometry, bucketEdgeGeometry, wheelFaces, drawWaterwheel } from '../src/chapters/00-intro/escher/wheel.js';
import { scene } from '../src/chapters/00-intro/escher/scene.js';

test('cached splash trajectories preserve the original motion at arbitrary times', () => {
  for (let i = 0; i < 48; i++) {
    const at = createSplashParticle(i);
    for (const t of [0, .15, .5, 10000]) {
      const life = .7 + (i % 5) * .09, age = positiveMod(t + i * .137, life);
      assert.deepEqual(at(t), {
        x: (i % 2 ? 1 : -1) * (12 + (i * 17 % 32)) * age,
        y: -(28 + i * 13 % 34) * age + 62 * age * age,
        opacity: Math.sin(Math.PI * age / life) * .8,
      });
    }
  }
});

test('animation frames use cached metadata and pause/resume without advancing paused time', () => {
  const host = animationHarness(startAnimation);
  try {
    const reads = host.datasetReads;
    host.advance(0); host.advance(80);
    const moving = host.snapshot();
    host.toggle();
    assert.equal(host.state, 'paused');
    host.advance(1000);
    assert.deepEqual(host.snapshot(), moving);
    host.toggle();
    assert.equal(host.state, 'running');
    host.advance(2000);
    assert.deepEqual(host.snapshot(), moving);
    host.advance(2080);
    assert.notDeepEqual(host.snapshot(), moving);
    assert.equal(host.datasetReads, reads);
  } finally { host.close(); }
});

test('each translating plank remains attached to both projected rims and has radial depth', () => {
  const {front,rear}=wheelFaces(),radius=scene.wheel.radius;
  assert.deepEqual(front,scene.wheel.depth);
  for(let i=0;i<=100;i++) {
    const phase=i/100,points=bucketGeometry(phase);
    for(const [index,center,r] of [[0,rear,radius],[1,front,radius],[2,front,radius-6],[3,rear,radius-6]]) {
      const p=points[index];
      const x=(p[0]-center[0])/scene.wheel.faceScale;
      const y=p[1]-center[1]-x*scene.wheel.faceShear;
      assert.ok(Math.abs(x*x+y*y-r*r)<1e-8);
    }
    assert.ok(Math.abs(points[1][1]-points[0][1]-scene.wheel.depth[1])<1e-8);
    const edge=bucketEdgeGeometry(phase);
    assert.deepEqual(edge.slice(0,2),points.slice(0,2));
    assert.ok(edge.flat().every(Number.isFinite));
  }
  const markup=drawWaterwheel();
  assert.equal([...markup.matchAll(/class="wheel-moving-bucket"/g)].length,scene.wheel.buckets/2);
  assert.ok(markup.indexOf('escher-wheel-buckets')<markup.indexOf('escher-wheel-rotor'));
  assert.ok(markup.indexOf('wheel-interior')<markup.indexOf('escher-wheel-rotor'));
});

test('one spoke pitch advances the translating bucket layer by exactly one bucket', () => {
  const elapsed=motion.revolution/scene.wheel.buckets;
  assert.equal(elapsed/motion.revolution*360,360/scene.wheel.buckets);
  const visible=scene.wheel.buckets/2;
  const phaseAt=t=>positiveMod(.25+t/elapsed/visible,1);
  assert.ok(Math.abs(phaseAt(elapsed)-phaseAt(0)-1/visible)<1e-12);
  assert.equal(phaseAt(elapsed*visible),phaseAt(0));
  assert.equal(positiveMod(-1,40),39);
});

test('splash particles repeat without unbounded allocation and disperse on both sides', () => {
  for(let i=0;i<48;i++) {
    const life=.7+(i%5)*.09;
    for(const t of [0,.15,.5,10000]) {
      const a=splashParticle(i,t),b=splashParticle(i,t+life);
      assert.ok(Math.abs(a.x-b.x)<1e-7);
      assert.ok(Math.abs(a.y-b.y)<1e-7);
      assert.ok(a.opacity>=0 && a.opacity<=.8);
      assert.ok(Math.abs(a.x)<50 && Math.abs(a.y)<50);
    }
    const p=splashParticle(i,.3);
    assert.ok(i%2?p.x>=0:p.x<=0);
  }
});


test('wheel thickness and plank edges are parallel to the across channel direction after reflection', () => {
  const {front,rear}=wheelFaces();
  const dx=(front[0]-rear[0])*(scene.wheel.flipX?-1:1);
  const dy=front[1]-rear[1];
  assert.ok(dx>0 && dy>0);
  assert.ok(Math.abs(dy/dx-scene.waterwayDirections.across[1])<1e-10);
  for(const phase of [.1,.3,.5,.8,.95]) {
    const [a,b]=bucketGeometry(phase);
    assert.ok(Math.abs((b[1]-a[1])/(-(b[0]-a[0]))-scene.waterwayDirections.across[1])<1e-10);
  }
});


test('water ribbons remain identical across half clips and wrap at their full dash period', async () => {
  const {currentSurface}=await import('../src/chapters/00-intro/escher/current.js');
  const outline=[[0,0],[300,0],[300,20],[0,20]];
  const pointAt=(t,v)=>[t*300,v*20];
  const left=currentSurface('left',outline,pointAt,-1);
  const right=currentSurface('right',outline,pointAt,-1);
  assert.equal(left.replaceAll('left','half'),right.replaceAll('right','half'));
  for(const match of left.matchAll(/data-period="([^"]+)"[^>]*stroke-dasharray="([^"]+)"/g)) {
    assert.equal(match[2].split(' ').map(Number).reduce((a,b)=>a+b,0),Number(match[1]));
  }
  assert.ok(!left.includes('NaN'));
  assert.match(left,/clip-path="url\(#left\)"/);
});
