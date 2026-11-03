import test from 'node:test';
import assert from 'node:assert/strict';
import { towerBeam } from '../src/chapters/00-intro/escher/arches.js';
import { channelTurnFloor, wallBaseAt } from '../src/chapters/00-intro/escher/channel-walls.js';
import { channelSegments, turnLayout, towerLevels, structuralOrder } from '../src/chapters/00-intro/escher/channel-layout.js';
import { landscape } from '../src/chapters/00-intro/escher/surroundings.js';
import { terraceContours, landscapePoint, terraceTop, terracePlants, contourY, rightTerraces } from '../src/chapters/00-intro/escher/landscape.js';
import { scene } from '../src/chapters/00-intro/escher/scene.js';

test('channel 1 has a complete four-corner bed above the middle tower ceiling', () => {
  const segment=channelSegments[0],turn=segment.turns[0];
  const markup=channelTurnFloor(segment,turn);
  const match=markup.match(/<polygon points="([^"]+)" class="channel-corner-stone"/);
  assert.ok(match);
  const top=match[1].split(' ').map(p=>p.split(',').map(Number));
  assert.deepEqual(top,turnLayout(turn).corners.map(p=>wallBaseAt(segment,p)));
  assert.equal(top.length,4);
  assert.ok(structuralOrder.indexOf('left-middle')<structuralOrder.indexOf('channel-1-left'));
});

test('all four arch tiers have two recessed openings and both intermediate tiers have solid caps', () => {
  const levels=towerLevels.filter(l=>!l.pierBay);
  const ids=new Set();
  for(const level of levels) {
    const markup=towerBeam(level);
    assert.equal([...markup.matchAll(/class="arch-intrados"/g)].length,2);
    assert.equal([...markup.matchAll(/class="arch-spring-return"/g)].length,4);
    for(const [,id] of markup.matchAll(/<clipPath id="([^"]+)"/g)) {
      assert.ok(!ids.has(id));ids.add(id);
    }
    const hasCap=level.tier==='left-middle'||level.tier==='right-lower';
    assert.equal(markup.includes('class="tower-intermediate-cap"'),hasCap);
    assert.ok(!/NaN|Infinity/.test(markup));
  }
});

test('terrace study uses independent near/middle/far contours rather than the rejected repeated bands', () => {
  const markup=landscape();
  assert.ok(!/class="landscape-terrace"|landscape-field|landscape-wall/.test(markup));
  assert.ok(!markup.includes('distant-left') && !markup.includes('distant-middle'));
  assert.ok(markup.includes('data-stage="print-details"'));
  assert.equal([...markup.matchAll(/data-contour=/g)].length,terraceContours.length);
  assert.deepEqual(landscapePoint([425,420]),[381,303]);
  assert.equal(new Set(terraceContours.map(c=>c.points.length)).size>3,true);
  for(const depth of ['near','middle','far']) assert.ok(terraceContours.some(c=>c.depth===depth));
  for(const c of terraceContours) assert.ok(c.points.flat().every(Number.isFinite));
});


test('terrace print details stay on the terrain and the three invented stairways remain absent', () => {
  for(let i=0;i<terraceContours.length;i++) {
    const top=terraceTop(i);
    assert.ok(top.length>=4 && top.flat().every(Number.isFinite));
    for(const plant of terracePlants(i)) {
      const [x,y]=plant.reference;
      assert.ok(y<contourY(terraceContours[i],x));
      assert.ok(y>contourY(terraceContours[i-1],x)+terraceContours[i-1].drop);
    }
  }
  const markup=landscape();
  assert.ok(!/terrace-stairs|data-flight|terrace-step-tread|terrace-step-riser/.test(markup));
  assert.equal([...markup.matchAll(/class="terrace-ground"/g)].length,terraceContours.length+rightTerraces.length);
  assert.equal([...markup.matchAll(/class="terrace-ground-texture" clip-path=/g)].length,terraceContours.length);
  assert.equal([...markup.matchAll(/class="terrace-wall-texture" clip-path=/g)].length,terraceContours.length);
  assert.ok(markup.includes('terrace-shrub') && markup.includes('terrace-stone-joint'));
});


test('right hillside long runs and returns maintain coherent directions',()=>{
  assert.equal(rightTerraces.length,5);
  assert.ok(rightTerraces.every(c=>c.points[0][0]===425));
  assert.match(landscape(),/clip-path="url\(#right-hillside-limit\)"/);
  for(const c of rightTerraces) for(let i=1;i<c.points.length;i++) {
    const a=c.points[i-1],b=c.points[i],slope=(b[1]-a[1])/(b[0]-a[0]);
    assert.ok(i%2?slope<-.15&&slope>-.6:slope>.3&&slope<1.2);
  }
});
