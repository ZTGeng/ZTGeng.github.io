import test from 'node:test';
import assert from 'node:assert/strict';
import { pondLayout, pondPoint, landingPond } from '../src/chapters/00-intro/escher/pond.js';
import { scene, squareFootprint } from '../src/chapters/00-intro/escher/scene.js';
import { waterfallTail, millLayout, millTerraceLayout, referenceMillPlatformAnchor } from '../src/chapters/00-intro/escher/channel-layout.js';
import { terraceHouse, terraceTallHouse } from '../src/chapters/00-intro/escher/landscape.js';

test('pond keeps its front clearance and the fall remains inside after extending the rear edge', () => {
  const p=pondLayout;
  assert.deepEqual(p.impactCenter,[waterfallTail[0]-12+scene.waterfallOffsetX,waterfallTail[1]+scene.waterfallLandingExtension]);
  const actual=pondPoint(...p.localCenter);
  assert.ok(Math.hypot(...actual.map((v,i)=>v-p.center[i]))<1e-8);

  assert.ok(p.minU>millLayout.width+18 && p.minU<millLayout.width+40);
  assert.ok(p.minV-millTerraceLayout.platformOutline[3][1]>10);
  const clearance=millTerraceLayout.platformOutline[3][0]-p.maxU;
  assert.ok(clearance>10&&clearance<16);
  assert.ok(p.maxV<millTerraceLayout.platformOutline[4][1]);
});

test('pond widens to the right while its left and front anchors stay fixed and its rear tracks the wider pier', () => {
  const p=pondLayout,half=squareFootprint(scene.pool.halfSide);
  assert.equal(p.minU,p.impactLocal[0]-half.halfWidth);
  const retreat=squareFootprint(scene.pool.sideRetraction/2);
  const dx=p.impactCenter[0]-millTerraceLayout.origin[0],dy=p.impactCenter[1]-millTerraceLayout.origin[1];
  const referenceV=(dy-dx*Math.tan(10*Math.PI/180))/(Math.tan(-20*Math.PI/180)-Math.tan(10*Math.PI/180));
  assert.ok(Math.abs(p.maxV-(referenceMillPlatformAnchor[1]-scene.lowerPierFootprint.halfDepth-scene.pool.rearPierGap+p.impactLocal[1]-referenceV))<1e-9);
  assert.ok(Math.hypot(...pondPoint(...p.impactLocal).map((v,i)=>v-p.impactCenter[i]))<1e-9);
  assert.ok(p.maxV>p.impactLocal[1]+half.halfDepth);
  assert.equal(p.minV,p.impactLocal[1]-half.halfDepth+2*retreat.halfDepth);
  assert.equal(p.maxU,p.impactLocal[0]+half.halfWidth-2*retreat.halfWidth+scene.pool.widthExpansion);
  assert.ok(p.maxU<p.impactLocal[0]+half.halfWidth);
  assert.ok(p.minV>p.impactLocal[1]-half.halfDepth);
  assert.ok(p.impactLocal[0]>p.minU&&p.impactLocal[0]<p.maxU);
  assert.ok(p.impactLocal[1]>p.minV&&p.impactLocal[1]<p.maxV);
  const markup=landingPond();
  assert.ok(!markup.includes('pond-inlet'));
  assert.equal([...markup.matchAll(/class="pond-water"/g)].length,1);
  assert.match(markup,/<path d="[^"]+Z" class="pond-rim-edge"/);
  assert.equal([...markup.matchAll(/class="pond-ripple"/g)].length,3);
});

test('only the requested upper-left tall house returns and each ornament has an independent rightward pose', () => {
  assert.equal(terraceHouse.height,140);
  assert.ok(terraceHouse.horizontalScale<1);
  const markup=terraceTallHouse();
  assert.ok(markup.includes('data-reference-position="upper-left"'));
  assert.ok(markup.includes('terrace-house-window'));
  assert.deepEqual(scene.ornamentYawDegrees,[25,35]);
});
