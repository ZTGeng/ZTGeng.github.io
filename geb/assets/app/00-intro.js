import"./geb2.js";const se=[...document.querySelectorAll("[data-proof-case]")],Ze=[...document.querySelectorAll(".proof-result")],_e=document.querySelector("#proof-announcement");for(const t of se)t.addEventListener("click",()=>{const e=t.dataset.proofCase;for(const n of se)n.setAttribute("aria-pressed",String(n===t));for(const n of Ze)n.hidden=n.id!==`proof-${e}`;document.querySelector("#proof-prompt").hidden=!0,_e.textContent=e==="provable"?"推演已展开：证明 G 会违背系统的自洽性。详细推理位于按钮下方。":"推演已展开：G 在通常的自然数中为真，但在这个系统中不可证明。详细推理位于按钮下方。"});const m=(t,e)=>`<polygon points="${t.map(n=>n.join(",")).join(" ")}" class="${e}"/>`,b=(t,e,n="")=>`<path d="${t}" class="${e}" ${n}/>`,L=t=>t.map(([e,n],o)=>`${o?"L":"M"}${e},${n}`).join(" "),W=(t,e,n=1)=>[t[0]+e[0]*n,t[1]+e[1]*n];function Qt(t,e,n=23){const o=Math.ceil(Math.hypot(e[0]-t[0],e[1]-t[1])/16);let a="";for(let r=0;r<=o;r++){const i=t[0]+(e[0]-t[0])*r/o,c=t[1]+(e[1]-t[1])*r/o;a+=`M${i},${c}v${-n-3}`}return`<g class="terrace-railing">${b(`M${t[0]},${t[1]-n}L${e[0]},${e[1]-n}M${t[0]},${t[1]-6}L${e[0]},${e[1]-6}${a}`,"railing-line")}</g>`}function ge(t,e,n,o,a=300){const r=Math.max(3,Math.round(a/66)),i=[.17,.35,.53,.72,.86];return`<g class="channel-current" data-current-direction="${o}">
    <defs><clipPath id="${t}">${m(e,"")}</clipPath></defs>
    <g clip-path="url(#${t})">
      ${i.map((c,s)=>{const h=Array.from({length:49},(f,d)=>{const g=d/48;return n(g,c+Math.sin(g*Math.PI*7+s*1.9)*.025)}),l=61+s*13;return`<g class="current-lane" data-lane="${s}">
          ${b(L(h),"current-thread",`data-period="${l}" data-speed="${18+s*2}" stroke-dasharray="${20+s*4} 6 3 ${l-29-s*4}"`)}
          ${s%2===0?Array.from({length:r},(f,d)=>`<g class="current-ripple" data-phase="${(d+.18*Math.sin(d*3+s)+.11*s)/r}" data-speed="${20+s*1.8}"><g transform="scale(${.72+d%3*.12} .62)">
            <path d="M-2.5,-2 Q-.5,0 -2.5,2" class="current-crest"/>
            ${d%2===0?'<ellipse cx="1.5" cy=".3" rx=".8" ry=".45" class="current-foam"/>':""}
          </g></g>`).join(""):""}
        </g>`}).join("")}
    </g>
  </g>`}const pt=Math.tan(10*Math.PI/180),xt=Math.tan(-20*Math.PI/180),Bt=Math.atan(Math.sqrt(pt/-xt)),me=Math.sqrt(pt*-xt),Ye=Math.sqrt(1-me**2),ze=Math.sin(Bt)/Ye;function ot(t){const e=pt-xt;return{halfSide:t,halfWidth:t*Math.sqrt(-xt/e),halfDepth:t*Math.sqrt(pt/e)}}const p={viewBox:"0 0 900 884",compositionOffsetY:-36,aqueductDrop:16,waterwayDirections:{across:[1,pt],receding:[1,xt]},towerBay:ot(31),lowerPierFootprint:{halfWidth:5.75,halfDepth:4.6},channelFootprint:ot(42),channelWallThickness:18,channelWallHeights:{1:{left:4,right:7},2:{left:15,right:11},3:{left:19,right:23},4:{left:31,right:27}},channelWaterFreeboard:2,towerBayCenterOffset:[10,-9],columnCap:ot(8),columnBaseHeights:{"right-lower":8,"left-middle":20,"right-upper":25,"left-upper":31},towerEave:ot(44),archFrame:{...ot(40),top:28,bottom:-18},waterfallOutletX:354,waterfallLandingExtension:8,waterfallOffsetX:-10,pool:{halfSide:60,sideRetraction:18,rearPierGap:2,rimWidth:3,rimHeight:3},ornamentYawDegrees:[25,35],wallDepth:8,wheel:{x:389,radius:64,lift:25,depth:[-40*Math.cos(Bt),40*me*Math.sin(Bt)],faceScale:ze,faceShear:0,buckets:24},mill:{origin:[157,642],width:137,depth:205,height:146,roofRise:68,slide:-48},towers:[{id:"left",x:371,y:296,top:190,ornament:0,lowerLevels:[{id:"middle",y:460,top:334},{id:"lower",y:674,top:476,pierBay:!0}]},{id:"right",x:680,y:337,top:227,ornament:1,lowerLevels:[{id:"lower",y:500,top:375}]}],millTerrace:{origin:[139,642-18*pt],outline:[[38,-20],[280,-20],[280,82],[262,82],[262,225],[38,225]],door:{u:280,v:8,width:56,height:96},garden:{left:38,right:280,depth:180,lift:32,wallHeight:32,gateWidth:26,gateHeight:46},platformOutline:[[-18,-36],[180,-36],[180,-20],[280,-20],[280,82],[262,82],[262,225],[-18,225]],canalSupportHeight:65,canalLowerHeight:95,canalLowerSetback:34,platformThickness:6,platformRailEdges:[0,1,2,3,4,7],platformFrontEdges:[0,1,2,3,4],height:141}},$e=([t,e])=>[1,e/t],Z=$e(p.waterwayDirections.across),G=$e(p.waterwayDirections.receding);function R(t,e,n,o=0){return[t[0]+e*Z[0]+n*G[0],t[1]+e*Z[1]+n*G[1]-o]}const dt=t=>Math.atan2(t[1],t[0])*180/Math.PI;dt(Z),dt(G),Math.abs(dt(Z)-dt(G)),180-Math.abs(dt(Z)-dt(G));const k=(t,e,n=.5)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n],we=p.towers.find(t=>t.id==="left"),Ge=p.towers.find(t=>t.id==="right"),Jt=Ge.x-we.x,Kt=({x:t,y:e})=>[t+p.towerBayCenterOffset[0],e+p.towerBayCenterOffset[1]],ye=Kt(we),Me=R(ye,Jt,0),be=R(Me,0,-Jt),Ne=R(be,Jt,0),Je={"left-upper":ye,"right-upper":Me,"left-middle":be,"right-lower":Ne},te=p.towers.flatMap(t=>[{...t,tier:`${t.id}-upper`},...t.lowerLevels.map(e=>({x:t.x,...e,tier:`${t.id}-${e.id}`}))]).map(t=>{const e=Je[t.tier]??Kt(t),n=t.pierBay?0:p.aqueductDrop,o=[e[0],e[1]+n],a=o[1]+9;return{...t,center:o,y:a,top:t.top+a-t.y}});function ht(t,e=p.towerBay){const{x:n,y:o}=t,a=t.center??Kt({x:n,y:o}),{halfWidth:r,halfDepth:i}=e,c=[[-r,-i],[r,-i],[r,i],[-r,i]].map(([d,g])=>R(a,d,g)),[s,h,l,f]=c;return{corners:c,center:a,edges:{front:[h,s],right:[h,l],back:[l,f],left:[s,f]}}}const ee=Object.fromEntries(te.map(t=>[t.tier,ht(t,p.channelFootprint)])),at=(t,e)=>ee[t].edges[e],J=t=>k(...t),Ke=J(at("left-upper","front")).map((t,e)=>e===1?t-p.channelWallHeights[1].left+p.channelWaterFreeboard:t);function tn(t){return ht(t).corners.map(e=>[e[0],e[1]-st(t.tier)])}const en=ht(te.find(t=>t.tier==="left-middle")).edges.right.map(([t,e])=>({x:t,top:e+p.wallDepth-5})),ke=at("right-upper","front"),xe=at("left-middle","back"),St=at("right-lower","front"),qt=J(ke).map((t,e)=>J(xe)[e]-t),nn=J(St),rn=(p.waterfallOutletX-nn[0])/qt[0],Se=St.map(t=>t.map((e,n)=>e+qt[n]*rn)),At=t=>St[0][1]+(t-St[0][0])*qt[1]/qt[0];J(Se).map((t,e)=>e===1?t-p.channelWallHeights[4].left+p.channelWaterFreeboard:t);const Ae=[p.waterfallOutletX,At(p.waterfallOutletX)-p.channelWallHeights[4].left],Vt=Ae,on=p.millTerrace.origin[1]+(p.waterfallOutletX-p.millTerrace.origin[0])*Z[1],Ut=on-Ae[1],an=p.mill.origin[1]-Ut,sn={...p.mill,origin:R([p.mill.origin[0],an],0,p.mill.slide)},bt={...p.millTerrace,origin:R([p.millTerrace.origin[0],p.millTerrace.origin[1]-Ut],0,p.mill.slide),height:p.millTerrace.height+Ut},Xt=en.map(t=>({...t,bottom:At(t.x)-p.channelWallHeights[4].left})),cn=[Xt[0].x,Xt[0].bottom],It=cn.map((t,e)=>t-bt.origin[e]),ce=(It[1]-Z[1]*It[0])/(G[1]-Z[1]),ut=[It[0]-ce,ce],ln=[ut[0]+p.lowerPierFootprint.halfWidth,ut[1]],Ot=bt.platformOutline.map(([t,e],n)=>[t,n===4||n===5?ut[1]:e]),Q={...bt,outline:[[bt.garden.left,Ot[3][1]],...Ot.slice(3,7),[bt.garden.left,225]],platformOutline:Ot},wt=Q.garden,ne=Q.outline[1],hn=Q.outline[0][0],Wt=ne[0]-hn,dn=R(Q.origin,...ne,-Q.height+wt.lift),Lt={origin:R(dn,-Wt,-wt.depth),width:Wt,depth:wt.depth,backV:ne[1],outline:[[0,0],[Wt,0],[Wt,wt.depth],[0,wt.depth]]},ie=(t,e,n,o)=>t.flatMap((a,r)=>{const i=t[(r+1)%t.length],c=o*(a[e]-n)>=-1e-9,s=o*(i[e]-n)>=-1e-9,h=()=>k(a,i,(n-a[e])/(i[e]-a[e]));return c&&s?[i]:c?[h()]:s?[h(),i]:[]}),fn=ie(ie(Q.platformOutline,0,ut[0],1),1,ut[1],-1),Ht=[{id:1,fromTier:"left-upper",toTier:"right-upper",from:at("left-upper","right"),to:at("right-upper","left"),turns:[{tier:"left-upper",entry:"right",exit:"front"}]},{id:2,fromTier:"right-upper",toTier:"left-middle",from:ke,to:xe,turns:[{tier:"right-upper",entry:"left",exit:"front"}]},{id:3,fromTier:"left-middle",toTier:"right-lower",from:at("left-middle","right"),to:at("right-lower","left"),turns:[{tier:"left-middle",entry:"back",exit:"right"}]},{id:4,fromTier:"right-lower",from:St,to:Se,turns:[{tier:"right-lower",entry:"left",exit:"front"}]}],pn={"left-upper":{entry:"right",exit:"front",heights:[p.channelWallHeights[1].left,p.channelWallHeights[1].left]},"right-upper":{entry:"left",exit:"front",heights:[p.channelWallHeights[1].right,p.channelWallHeights[2].right]},"left-middle":{entry:"back",exit:"right",heights:[p.channelWallHeights[2].left,p.channelWallHeights[3].left]},"right-lower":{entry:"left",exit:"front",heights:[p.channelWallHeights[3].right,p.channelWallHeights[4].right]}};function st(t,e){const[n,o]=pn[t].heights;return(n+o)/2}function kt(t,e,n,o,a=0){return R(e,n,o,a)}function un(t){return ht(t).corners.map(e=>[e[0],t.top+e[1]-t.y])}function gn(t){const e=[0,p.channelWallThickness/(2*p.channelFootprint.halfSide),1-p.channelWallThickness/(2*p.channelFootprint.halfSide),1],n={front:"1,0",right:"2,1",back:"1,2",left:"0,1"},o=new Set(["1,1",n[t.entry],n[t.exit]]),a=new Map;for(let l=0;l<3;l++)for(let f=0;f<3;f++){if(o.has(`${l},${f}`))continue;const d=[[l,f],[l+1,f],[l+1,f+1],[l,f+1]];d.forEach((g,M)=>{const u=d[(M+1)%4],$=`${g}:${u}`,y=`${u}:${g}`;a.has(y)?a.delete(y):a.set($,[g,u])})}const{corners:[r,i,,c]}=ee[t.tier],s=([l,f])=>r.map((d,g)=>d+e[l]*(i[g]-r[g])+e[f]*(c[g]-r[g])),h=[];for(;a.size;){const l=a.values().next().value[0],f=[];let d=l;do{f.push(d);const g=[...a.entries()].find(([,[M]])=>String(M)===String(d));a.delete(g[0]),d=g[1][1]}while(String(d)!==String(l));h.push(f.map(s))}return h}function jt(t){const e=ee[t.tier];return{...e,entry:J(e.edges[t.entry]),exit:t.tail??J(e.edges[t.exit])}}function mn(t,e){const n=(J(t.from)[0]+J(t.to)[0])/2,o=.8;return{...t,side:e,cutX:n,minX:e==="left"?-1e3:n-o,maxX:e==="left"?n+o:2e3,turns:t.turns.filter(a=>(jt(a).center[0]<n?"left":"right")===e),tailrace:e==="left"?t.tailrace:void 0}}const $n=["channel-4-left","wheel","left-lower","channel-2-left","channel-3-left","left-middle","channel-1-left","left-upper","channel-3-right","channel-4-right","right-lower","channel-1-right","channel-2-right","right-upper"];function wn(){return p.wheel.radius}function yn(){const{x:t,radius:e,depth:n,faceScale:o,faceShear:a}=p.wheel,r=Ht.find(d=>d.id===4),i=r.from[0],c=r.to[0],s=(c[1]-i[1])/(c[0]-i[0]),l=Math.hypot(1,a- -1*s*o),f=[!1,!0].map(d=>{const g=t+(d?n[0]:0),M=2*t+n[0]-g;return At(M)-(d?n[1]:0)-3-(e+3)*l});return Math.min(...f)-p.wheel.lift}function je(){const{depth:t}=p.wheel;return{front:[t[0],t[1]],rear:[0,0]}}function Pe(t){const{radius:e,faceScale:n,faceShear:o}=p.wheel,a=-e+t*2*e,r=Math.sqrt(Math.max(0,e*e-a*a)),i=[r/e,a/e],c=[-a/e,r/e],s=je();return{r:e,at:(l,f,d=0)=>{const g=i[0]*l+c[0]*d,M=i[1]*l+c[1]*d;return[g*n+s[f][0],M+g*o+s[f][1]]}}}function We(t){const{r:e,at:n}=Pe(t);return[n(e,"rear"),n(e,"front"),n(e-6,"front"),n(e-6,"rear")]}function Le(t){const{r:e,at:n}=Pe(t);return[n(e,"rear"),n(e,"front"),n(e,"front",1.5),n(e,"rear",1.5)]}function Mn(){const{x:t,depth:e,faceScale:n,faceShear:o}=p.wheel,a=yn(),r=wn(),{rear:i}=je(),c=p.wheel.buckets/2,s=`translate(${2*t+e[0]} 0) scale(-1 1)`,h=Array.from({length:8},(l,f)=>`<path d="M7,-3.5H${r-9}v7H7Z" transform="rotate(${f*45})" class="wheel-timber-spoke"/>`).join("");return`<g id="escher-wheel" data-structural-layer="wheel" transform="${s}">
    <g transform="translate(${t} ${a})">
      <g transform="matrix(${n} ${o} 0 1 ${i[0]} ${i[1]})"><circle r="${r-2.5}" class="wheel-rear-rim" style="fill:none;stroke-width:5"/></g>
      <g id="escher-wheel-buckets">${Array.from({length:c},(l,f)=>`<g class="wheel-moving-bucket">${m(We(f/c),"wheel-bucket-plank")}${m(Le(f/c),"wheel-bucket-edge")}</g>`).join("")}</g>
      <g transform="matrix(${n} ${o} 0 1 ${e[0]} ${e[1]})">
        <circle r="${r-1}" class="wheel-interior"/>
        <g id="escher-wheel-rotor">
          ${h}
          <path d="M${r},0a${r},${r} 0 1 0 ${-2*r},0a${r},${r} 0 1 0 ${2*r},0 M${r-10},0a${r-10},${r-10} 0 1 1 ${-2*(r-10)},0a${r-10},${r-10} 0 1 1 ${2*(r-10)},0" fill-rule="evenodd" class="wheel-timber-rim"/>
        </g>
        <circle r="10" class="wheel-timber-hub"/><circle r="3" class="wheel-pin"/>
      </g>
    </g>
  </g>`}const Ct={revolution:30,fallSpeed:260},nt=(t,e)=>(t%e+e)%e;function bn(t,e){const n=.7+t%5*.09,o=nt(e+t*.137,n),r=(t%2?1:-1)*(12+t*17%32),i=-(28+t*13%34);return{x:r*o,y:i*o+62*o*o,opacity:Math.sin(Math.PI*o/n)*.8}}function kn(t){const e=document.createElement("button");e.type="button",e.className="escher-motion-toggle",t.after(e);const n=matchMedia("(prefers-reduced-motion: reduce)");let o=n.matches,a=!1,r=0,i=null,c=0;const s=t.querySelector("#escher-wheel-rotor"),h=[...t.querySelectorAll("#escher-wheel-buckets .wheel-moving-bucket")],l=[...t.querySelectorAll(".channel-current")].flatMap(x=>[...x.querySelectorAll(".current-lane")].map(w=>{const j=w.querySelector(".current-thread"),P=j.getTotalLength(),C=Array.from({length:97},(F,H)=>j.getPointAtLength(P*H/96));return{thread:j,length:P,at:F=>{const H=Math.max(0,Math.min(96,F*96)),U=Math.min(95,Math.floor(H)),_=H-U;return{x:C[U].x*(1-_)+C[U+1].x*_,y:C[U].y*(1-_)+C[U+1].y*_}},direction:Number(x.dataset.currentDirection),ripples:[...w.querySelectorAll(".current-ripple")]}})),f=[...t.querySelectorAll(".fall-streak")],d=[...t.querySelectorAll(".splash-drop")],g=[...t.querySelectorAll(".splash-mist")],M=[...t.querySelectorAll(".pond-ripple ellipse")],u=t.closest('[role="tabpanel"]'),$=()=>{e.textContent=o?"播放动画":"暂停动画",e.setAttribute("aria-label",o?"播放水流与水车动画":"暂停水流与水车动画")};function y(x){s.setAttribute("transform",`rotate(${nt(x/Ct.revolution*360,360)})`),h.forEach((w,j)=>{const P=nt(j/h.length+x/(Ct.revolution/p.wheel.buckets)/h.length,1);w.children[0].setAttribute("points",We(P).map(C=>C.join(",")).join(" ")),w.children[1].setAttribute("points",Le(P).map(C=>C.join(",")).join(" ")),w.style.opacity=Math.min(1,P*h.length*1.5,(1-P)*h.length*1.5)}),l.forEach(({thread:w,length:j,at:P,direction:C,ripples:O})=>{w.style.strokeDashoffset=String(-C*nt(x*Number(w.dataset.speed),Number(w.dataset.period))),O.forEach(F=>{const H=nt(Number(F.dataset.phase)+x*Number(F.dataset.speed)/j,1),U=C>0?H:1-H,_=P(U),K=P(Math.max(0,U-.005)),ae=P(Math.min(1,U+.005)),Ie=Math.atan2(ae.y-K.y,ae.x-K.x)*180/Math.PI+(C<0?180:0);F.setAttribute("transform",`translate(${_.x} ${_.y}) rotate(${Ie})`),F.style.opacity=String(Math.min(1,H*12,(1-H)*12)*.72)})}),f.forEach((w,j)=>{w.style.strokeDashoffset=String(-nt(x*Ct.fallSpeed+j*9,64))}),d.forEach((w,j)=>{const P=bn(j,x);w.setAttribute("transform",`translate(${P.x} ${P.y})`),w.style.opacity=P.opacity}),M.forEach((w,j)=>{const P=nt(x*.7+j/M.length,1);w.setAttribute("transform",`scale(${.25+P*2.4})`),w.style.opacity=(1-P)*.48}),g.forEach((w,j)=>{const P=nt(x*.85+j/g.length,1);w.setAttribute("transform",`translate(${Math.sin(j*2.4)*P*10} ${-P*13}) scale(${.65+P*.65})`),w.style.opacity=Math.sin(Math.PI*P)*.42})}const S=()=>!o&&a&&!document.hidden&&!u.hidden;function A(x){if(r=0,!S()){i=null;return}i!==null&&(c+=Math.min((x-i)/1e3,.1)),i=x,y(c),r=requestAnimationFrame(A)}function T(){S()?r||(r=requestAnimationFrame(A)):(cancelAnimationFrame(r),r=0,i=null),t.dataset.motionState=S()?"running":"paused"}e.addEventListener("click",()=>{o=!o,$(),T()});const q=()=>{o=n.matches,$(),T()};n.addEventListener("change",q),document.addEventListener("visibilitychange",T);const E=new IntersectionObserver(x=>{a=x[0].isIntersecting,T()});E.observe(t);const D=new MutationObserver(T);D.observe(u,{attributes:!0,attributeFilter:["hidden"]});const v=()=>{cancelAnimationFrame(r),E.disconnect(),D.disconnect(),n.removeEventListener("change",q),document.removeEventListener("visibilitychange",T)};return window.addEventListener("pagehide",x=>{x.persisted?(cancelAnimationFrame(r),r=0,i=null):v()}),window.addEventListener("pageshow",T),y(0),$(),T(),v}const Y=(t,e)=>t.reduce((n,o,a)=>n+o*e[a],0),gt=(t,e)=>t.map((n,o)=>n+e[o]),ct=(t,e)=>t.map(n=>n*e),Te=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],Zt=t=>ct(t,1/Math.hypot(...t));function Et(t,e,n){const o=[...t],a=(e+1)%3,r=(e+2)%3;return o[a]=t[a]*Math.cos(n)-t[r]*Math.sin(n),o[r]=t[a]*Math.sin(n)+t[r]*Math.cos(n),o}function xn(t,e,n){const o=[],a=[];return t.forEach((r,i)=>{const c=t[(i+1)%t.length],s=Y(r,e)-n,h=Y(c,e)-n;if(s<=1e-9&&o.push(r),s>=-1e-9&&a.push(r),s<-1e-9&&h>1e-9||s>1e-9&&h<-1e-9){const l=gt(r,ct(gt(c,ct(r,-1)),s/(s-h)));o.push(l),a.push(l)}}),{inside:o,outside:a}}function Sn(t){const e=[];for(let n=0;n<3;n++)for(const o of[-1,1]){const a=[0,0,0];a[n]=o;const r=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,c])=>{const s=[0,0,0];return s[n]=o,s[(n+1)%3]=i,s[(n+2)%3]=c,Et(s,t,Math.PI/4)});e.push({points:r,normal:Et(a,t,Math.PI/4),d:1})}return e}function An(){const t=[0,1,2].map(Sn);return t.flatMap((e,n)=>e.flatMap(o=>{let a=[o.points];for(let r=0;r<3;r++)r!==n&&(a=a.flatMap(i=>{const c=[];let s=i;for(const h of t[r]){if(s.length<3)break;const l=xn(s,h.normal,h.d);l.outside.length>=3&&c.push(l.outside),s=l.inside}return c}));return a.map(r=>({points:r,normal:o.normal}))}))}function jn(){const t=[];for(let e=0;e<3;e++)for(const n of[-1,1])for(const o of[-1,1]){const a=(e+1)%3,r=(e+2)%3,i=[0,0,0],c=[0,0,0],s=[0,0,0],h=[0,0,0];i[a]=2*n,c[a]=n,c[r]=o,c[e]=1,s[r]=2*o,h[a]=n,h[r]=o,h[e]=-1;const l=[0,0,0];l[a]=2*n,l[r]=2*o;const f=[i,c,s,h];f.forEach((d,g)=>{const M=[d,f[(g+1)%4],l];let u=Zt(Te(gt(M[1],ct(d,-1)),gt(l,ct(d,-1))));Y(u,d)<0&&(u=ct(u,-1)),t.push({points:M,normal:u})})}return t}function Pn(t){const e=p.waterwayDirections.across[1],n=-p.waterwayDirections.receding[1],o=Math.atan(Math.sqrt(e/n)),a=Math.asin(Math.sqrt(e*n)),r=[Math.cos(o),Math.sin(o),0],i=[Math.sin(a)*Math.sin(o),-Math.sin(a)*Math.cos(o),-Math.cos(a)],c=Zt(Te(r,i)),s=Zt([-1,-2,4]),h=p.ornamentYawDegrees[t]*Math.PI/180,l=(t===0?An():jn()).map($=>({points:$.points.map(y=>Et(y,2,h)),normal:Et($.normal,2,h)})),f=t===0?98:100,d=l.flatMap($=>$.points.map(y=>[Y(y,r),Y(y,i)])),g=Math.max(...d.map($=>$[1])),M=Math.min(...d.map($=>$[1])),u=f/(g-M);return l.filter($=>Y($.normal,c)<-1e-8).sort(($,y)=>Y(ct(y.points.reduce(gt,[0,0,0]),1/y.points.length),c)-Y(ct($.points.reduce(gt,[0,0,0]),1/$.points.length),c)).map($=>{const y=Math.max(0,Y($.normal,s)),S=Math.round(91+y*115);return b(L($.points.map(A=>[Y(A,r)*u,(Y(A,i)-g)*u+16]))+"Z","ornament-face",`style="fill:rgb(${S},${S+1},${S-10})"`)}).join("")}function Wn(t){if(t.pierBay)return"";const{center:e}=ht(t),n=p.archFrame,o=t.y-t.top,a=[[-n.halfWidth,-n.halfDepth],[n.halfWidth,-n.halfDepth],[n.halfWidth,n.halfDepth],[-n.halfWidth,n.halfDepth]].map(([d,g])=>kt(t.tier,e,d,g)),r=10;function i(d,g,M,u,$){const y=W(d,[0,-o-n.top]),S=W(g,[0,-o-n.top]),A=W(d,[0,-o-n.bottom]),T=W(g,[0,-o-n.bottom]),q=k(A,T,.17),E=k(A,T,.83),D=W(k(A,T),[0,-56]),v=W(q,M),x=W(E,M),w=W(D,M),j=`escher-arch-${t.tier}-${$}`,P=O=>q.map((F,H)=>(1-O)**2*F+2*(1-O)*O*D[H]+O*O*E[H]),C=[.14,.32,.5,.68,.86].map(O=>{const F=P(O),H=q.map((_,K)=>2*((1-O)*(D[K]-_)+O*(E[K]-D[K]))),U=Math.hypot(...H);return b(L([F,W(F,[H[1]*7/U,-H[0]*7/U])]),"arch-stone-joint")}).join("");return`<g class="arch-masonry" data-arch-side="${$}" data-thickness="${r}">
      ${b(`M${y}L${S} ${T} ${E}Q${D} ${q}L${A}Z`,u)}
      <defs><clipPath id="${j}"><path d="M${q}Q${D} ${E}l0,45L${W(q,[0,45])}Z"/></clipPath></defs>
      <g clip-path="url(#${j})">
        ${b(`M${q}Q${D} ${E}L${x}Q${w} ${v}Z`,"arch-intrados")}
        ${m([q,v,W(v,[0,6]),W(q,[0,6])],"arch-spring-return")}
        ${m([E,x,W(x,[0,6]),W(E,[0,6])],"arch-spring-return")}
        ${b(`M${v}Q${w} ${x}`,"arch-inner-edge")}
      </g>
      ${C}
    </g>`}const c=kt(t.tier,e,0,0),s=(d,g)=>{const M=kt(t.tier,e,d,g);return[M[0]-c[0],M[1]-c[1]]},h=a.map(d=>W(d,[0,-o-n.top])),l=h.map(d=>W(d,[0,-7])),f=t.tier==="left-middle"||t.tier==="right-lower"?`<g class="tower-intermediate-cap" data-tier="${t.tier}">
       ${m([l[0],l[1],h[1],h[0]],"stone-mid")}
       ${m([l[1],l[2],h[2],h[1]],"stone-dark")}
       ${m(l,"stone-light")}
      </g>`:m(h,"stone-light");return`<g class="escher-tier-beam" data-tier="${t.tier}">
    ${i(a[0],a[1],s(0,r),"stone-mid","front")}
    ${i(a[1],a[2],s(-r,0),"stone-dark","right")}
    ${f}
  </g>`}const Ft=Q.origin,re=[Vt[0]-12+p.waterfallOffsetX,Vt[1]+p.waterfallLandingExtension],qe=re[0]-Ft[0],Ln=re[1]-Ft[1],Ee=(Ln-qe*Z[1])/(G[1]-Z[1]),ve=qe-Ee,oe=ot(p.pool.halfSide),tt=ot(p.pool.rimWidth),He=ot(p.pool.sideRetraction/2),Fe=ve-oe.halfWidth,De=ve+oe.halfWidth-2*He.halfWidth,Oe=Ee-oe.halfDepth+2*He.halfDepth,Ce=ut[1]-p.lowerPierFootprint.halfDepth-p.pool.rearPierGap,Tn=[(Fe+De)/2,(Oe+Ce)/2],qn={center:R(Ft,...Tn),minU:Fe,maxU:De,minV:Oe,maxV:Ce},En=(t,e,n=0)=>R(Ft,t,e,n),et=(t=0,e=0)=>{const{minU:n,maxU:o,minV:a,maxV:r}=qn;return[[n+t*tt.halfWidth,a+t*tt.halfDepth],[o-t*tt.halfWidth,a+t*tt.halfDepth],[o-t*tt.halfWidth,r-t*tt.halfDepth],[n+t*tt.halfWidth,r-t*tt.halfDepth]].map(([i,c])=>En(i,c,e))};function vn(){const t=p.pool.rimHeight,e=et(0,t),n=et(1,t),o=a=>a.join(",");return`<g id="escher-landing-pond">
    <defs><clipPath id="escher-pond-water-clip">${m(et(1),"")}</clipPath></defs>
    ${m(et(),"pond-water")}
    ${b(`${L(e)}Z ${L(n.toReversed())}Z`,"pond-rim",'fill-rule="evenodd"')}
    ${m([e[0],e[1],et()[1],et()[0]],"pond-rim-front")}
    ${m([e[1],e[2],et()[2],et()[1]],"pond-rim-side")}
    ${b(L(e)+"Z","pond-rim-edge")}
    <g clip-path="url(#escher-pond-water-clip)">
      ${[0,1,2].map(a=>`<g class="pond-ripple" transform="translate(${o(re)})"><ellipse rx="18" ry="4"/></g>`).join("")}
    </g>
  </g>`}const Hn=`
  <pattern id="escher-stone-light" width="9" height="9" patternUnits="userSpaceOnUse">
    <rect width="9" height="9" fill="#d8d3c4"/>
    <path d="M-2,9L9,-2M7,11L11,7" stroke="#8e8878" stroke-width=".65" opacity=".25"/>
  </pattern>
  <pattern id="escher-stone-mid" width="7" height="7" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="#aaa697"/>
    <path d="M-2,7L7,-2M5,9L9,5" stroke="#655f51" stroke-width=".7" opacity=".3"/>
  </pattern>
  <pattern id="escher-stone-dark" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#817e71"/>
    <path d="M-2,6L6,-2M4,8L8,4" stroke="#49483f" stroke-width=".75" opacity=".35"/>
  </pattern>
  <pattern id="escher-brick-front" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${Z[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-light)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#8d8778" stroke-width=".75" opacity=".48"/>
  </pattern>
  <pattern id="escher-brick-side" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${G[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-mid)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#625e52" stroke-width=".8" opacity=".5"/>
  </pattern>
  <pattern id="escher-roof-tiles" width="18" height="14" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${G[1]} .65 .7 0 0)">
    <rect width="18" height="14" fill="#737368"/>
    <path d="M0,0V6Q4.5,11 9,6V0M9,0V6Q13.5,11 18,6V0M-4.5,7V13Q0,18 4.5,13V7M4.5,7V13Q9,18 13.5,13V7" fill="none" stroke="#42483e" stroke-width=".9"/>
  </pattern>
  <pattern id="escher-paving" width="45" height="30" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${Z[1]} -.8 ${-.8*G[1]} 0 0)">
    <rect width="45" height="30" fill="#d3cdbb"/>
    <path d="M0,0H45V30H0Z" fill="none" stroke="#a29b89" stroke-width=".8"/>
  </pattern>`,X=t=>{const e=Math.sin(t*127.1+31.7)*43758.5453;return e-Math.floor(e)};function Fn(t,e,n){const o=Array.from({length:26},(a,r)=>{const i=-e+8+X(t+r)*(e-14);return`<ellipse cx="${(X(t+r+40)-.5)*n*(.45-.4*i/e)}" cy="${i}" rx=".65" ry="1"/>`}).join("");return`<path d="M${-n/2},${-e}Q${-n*.3},${-e*.45} -4,0Q0,4 4,0Q${n*.3},${-e*.45} ${n/2},${-e}Z" class="garden-sponge"/>
    <path d="M${-n*.29},${-e+6}Q-2,${-e*.4} -1,-4M${n*.27},${-e+6}Q2,${-e*.4} 1,-4" class="garden-sponge-rib"/>
    <g class="garden-pores">${o}</g>
    <ellipse cx="0" cy="${-e}" rx="${n/2}" ry="${n*.18}" class="garden-sponge-rim"/>
    <ellipse cx="0" cy="${-e+1}" rx="${n*.36}" ry="${n*.105}" class="garden-sponge-hollow"/>`}function Dn(t,e){let n="";function o(a,r,i,c,s){const h=c*Math.PI/180,l=a+Math.cos(h)*i,f=r+Math.sin(h)*i;if(n+=`M${a},${r}Q${a+Math.cos(h+.2)*i*.5},${r+Math.sin(h+.2)*i*.5} ${l},${f}`,s)for(const d of[-34,5,39])o(l,f,i*(.52+X(t+s+d)*.1),c+d,s-1)}return o(0,0,e*.42,-90,3),b(n,"garden-coral")}function On(t,e){return Array.from({length:4},(n,o)=>{const a=(o-1.5)*5,r=(X(t+o)-.5)*22;return b(`M${a},0C${a-12},${-e*.35} ${a+r+11},${-e*.6} ${a+r},${-e}q-7,-9 -10,0q0,6 5,4`,"garden-tendril")}).join("")}function Cn(t,e){return Array.from({length:7},(n,o)=>b(`M0,0Q${(o-3)*2},${-e*.55} ${(o-3)*4},${-e*(.55+X(t+o)*.45)}`,"garden-grass")).join("")}function Rn(t,e,n){const o=[];for(let r=0;r<55;r++)o.push({u:8+X(r)*(e-16),v:6+X(r+80)*(n-16),kind:"grass",h:15+X(r+20)*24,seed:r});[[.08,.8,104,27],[.19,.66,85,31],[.3,.9,125,34],[.42,.73,66,23],[.15,.43,75,38],[.32,.42,92,32],[.46,.48,52,27],[.09,.19,44,23],[.34,.18,58,35],[.53,.24,43,23]].forEach(([r,i,c,s],h)=>o.push({u:r*e,v:i*n,kind:"sponge",h:c,w:s,seed:100+h}));for(let r=0;r<9;r++)o.push({u:(.48+X(r+180)*.43)*e,v:(.12+X(r+190)*.65)*n,kind:"coral",h:45+X(r+200)*50,seed:200+r});for(let r=0;r<11;r++)o.push({u:(.25+X(r+220)*.65)*e,v:(.45+X(r+240)*.5)*n,kind:"curl",h:38+X(r+260)*54,seed:300+r});return`<g id="escher-garden-vegetation">${o.map(r=>({...r,xy:t(r.u,r.v)})).sort((r,i)=>r.xy[1]-i.xy[1]).map(r=>`<g class="garden-specimen" data-kind="${r.kind}" transform="translate(${r.xy.join(" ")})">${r.kind==="sponge"?Fn(r.seed,r.h,r.w):r.kind==="coral"?Dn(r.seed,r.h):r.kind==="curl"?On(r.seed,r.h):Cn(r.seed,r.h)}</g>`).join("")}</g>`}const mt=[{id:"ridge-far-1",depth:"far",drop:25,points:[[20,72],[177,29],[282,31],[340,64],[458,30],[700,28],[920,26]]},{id:"ridge-far-2",depth:"far",drop:32,points:[[20,146],[102,121],[145,125],[145,96],[226,72],[283,81],[292,101],[379,76],[435,87],[485,59],[555,65],[578,98],[720,73],[780,77],[816,104],[920,83]]},{id:"ridge-middle-1",depth:"middle",drop:37,points:[[20,252],[91,225],[112,203],[175,183],[203,211],[272,190],[285,165],[344,155],[378,181],[443,159],[480,176],[556,142],[610,155],[644,136],[717,143],[756,167],[826,150],[920,157]]},{id:"ridge-middle-2",depth:"middle",drop:43,points:[[20,380],[75,352],[87,328],[184,280],[203,302],[270,276],[280,292],[447,233],[477,254],[579,217],[596,230],[675,199],[724,217],[920,200]]},{id:"ridge-near-1",depth:"near",drop:42,points:[[20,474],[82,438],[99,407],[185,354],[214,368],[257,345],[286,365],[341,341],[358,363],[476,317],[509,337],[612,298],[641,316],[719,281],[769,303],[920,267]]},{id:"ridge-near-2",depth:"near",drop:43,points:[[20,589],[73,558],[88,527],[158,487],[174,458],[254,405],[278,419],[302,397],[318,424]]},{id:"ridge-near-3",depth:"near",drop:41,points:[[20,690],[71,659],[82,624],[139,592],[150,553],[258,483],[272,456],[321,427]]},{id:"ridge-near-4",depth:"near",drop:36,points:[[20,785],[66,756],[75,729],[132,701],[144,668],[205,638],[220,612],[279,575]]}].map(t=>{if(t.points.at(-1)[0]!==920)return t;const e=t.points.map(a=>[...a]),[n,o]=e.slice(-2);return e.push([1160,o[1]+(1160-o[0])*(o[1]-n[1])/(o[0]-n[0])]),{...t,points:e}});function le(t,e){const n=e.findIndex((i,c)=>c<e.length-1&&t<=e[c+1][0]),o=n<0?e.length-2:n,[a,r]=e.slice(o,o+2);return a[1]+(t-a[0])/(r[0]-a[0])*(r[1]-a[1])}const B=([t,e])=>[le(t,[[20,0],[323,323],[425,381],[747,690],[920,780]]),le(e,[[20,50],[140,110],[420,303],[560,421],[800,620],[1200,925]])];function N(t,e){const n=t.points;for(let o=1;o<n.length;o++){const a=n[o-1],r=n[o];if(e>=a[0]&&e<=r[0]&&r[0]>a[0])return a[1]+(r[1]-a[1])*(e-a[0])/(r[0]-a[0])}return e<n[0][0]?n[0][1]:n.at(-1)[1]}function Qn(t){const e=mt[t],n=t?mt[t-1]:{points:[[20,20],[1160,20]],drop:0},o=Math.max(e.points[0][0],n.points[0][0]),a=Math.min(e.points.at(-1)[0],n.points.at(-1)[0]),r=[...new Set([o,a,...e.points.map(s=>s[0]),...n.points.map(s=>s[0])])].filter(s=>s>=o&&s<=a).sort((s,h)=>s-h),i=r.map(s=>[s,N(e,s)]),c=r.map(s=>[s,Math.min(N(e,s),N(n,s)+n.drop)]);return[...i,...c.toReversed()].map(B)}function Re(t,e){let n="";return t.slice(1).forEach((o,a)=>{const r=t[a],i=Math.hypot(o[0]-r[0],o[1]-r[1]);for(let c=1;c*9<e;c++){const s=c*9;n+=b(L([[r[0],r[1]+s],[o[0],o[1]+s]].map(B)),"terrace-stone-joint");for(let h=c%2?10:20;h<i;h+=24){const l=h/i,f=[r[0]+(o[0]-r[0])*l,r[1]+(o[1]-r[1])*l+s];n+=b(L([f,[f[0],f[1]+7]].map(B)),"terrace-stone-joint")}}}),n}function Qe(t,e=mt){const n=e[t],o=e[t-1];let a="";for(let r=n.points[0][0]+8;r<n.points.at(-1)[0];r+=15){const i=o?N(o,r)+o.drop:20,c=N(n,r);for(let s=i+5+r%7;s<c-3;s+=10)a+=L([[r,s],[r+6,s+2]].map(B))}return b(a,"terrace-earth-hatch")}function Bn(t){const e=mt[t],n=mt[t-1];return t===0?[]:[[125,390,665],[90,325,590,855],[73,238,505,735],[58,170,368,620,830],[72,209,465,722,872],[65,155,265],[54,119,235],[47,124,223]][t].filter(a=>a<e.points.at(-1)[0]&&N(e,a)-(N(n,a)+n.drop)>18).map((a,r)=>({reference:[a,N(e,a)-6],size:(e.depth==="far"?.45:e.depth==="middle"?.6:.8)*(1+r%3*.12)}))}function Be({reference:t,size:e}){const[n,o]=B(t);return`<g class="terrace-shrub" transform="translate(${n} ${o}) scale(${e})">
    <path d="M0,0L0,-13M0,-4l-6,-5m6,3l6,-6m-6,2l-4,-6m4,4l3,-7"/>
    <path d="M-6,-8q-5,-3 -2,-6q-3,-4 2,-5q0,-5 5,-3q4,-4 6,1q6,-1 4,4q4,4 -1,6q-2,5 -7,2Z" class="terrace-shrub-crown"/>
  </g>`}const yt={roof:[[80,72],[107,80],[146,70],[122,60]],height:140,horizontalScale:.6,afterContour:2};function Vn(){const t=B([113,212])[0],e=i=>{const c=B(i);return[t+(c[0]-t)*yt.horizontalScale,c[1]]},n=yt.roof.map(e),o=yt.roof.map(([i,c])=>e([i,c+yt.height])),a=e([93.5,64]),r=e([134,53]);return`<g id="escher-terrace-tall-house" data-reference-position="upper-left">
    ${m([n[0],n[1],o[1],o[0]],"terrace-house-front")}
    ${m([n[1],n[2],o[2],o[1]],"terrace-house-side")}
    ${b(`M${n[0]}Q${a} ${n[1]}L${n[2]}Q${r} ${n[3]}Z`,"terrace-house-roof")}
    ${b(`M${n[0]}Q${a} ${n[1]}Z`,"terrace-house-front")}
    ${m([[127,88],[134,86],[134,100],[127,102]].map(e),"terrace-house-window")}
  </g>`}const Rt=Array.from({length:5},(t,e)=>{const n=360+e*100;return{drop:24+e%3*2,points:[[425,n],[650+e*11,n-70-e*2],[680+e*11,n-54-e],[870-e*5,n-115-e*3],[900+e*2,n-95-e*2],[1160,n-180+e*5]]}});function Un(){return`<defs><clipPath id="right-hillside-limit">${m([[0,0],[900,0],[900,At(900)-31],[0,At(0)-31]],"")}</clipPath></defs><g id="escher-right-hillside" clip-path="url(#right-hillside-limit)">${Rt.map((t,e)=>{const n=Rt[e-1],o=t.points.map(B),a=n?n.points.map(([c,s])=>B([c,s+n.drop])):t.points.map(([c])=>B([c,20])),r=t.points.map(([c,s])=>B([c,s+t.drop])),i=`right-hill-${e}`;return`<g class="terrace-study-middle">
      <defs><clipPath id="${i}">${m([...o,...a.toReversed()],"")}</clipPath></defs>
      ${m([...o,...a.toReversed()],"terrace-ground")}
      <g clip-path="url(#${i})">${Qe(e,Rt)}</g>
      ${t.points.slice(1).map((c,s)=>{const h=t.points[s];return m([h,c,[c[0],c[1]+t.drop],[h[0],h[1]+t.drop]].map(B),c[1]>h[1]?"terrace-wall-side":"terrace-wall-front")}).join("")}
      ${Re(t.points,t.drop)}
      ${b(L(o),"terrace-study-edge")}${b(L(r),"terrace-wall-base")}
      ${[550,735,965,1100].map((c,s)=>{c+=Math.sin(e*3+s)*18;const h=N(t,c)-7;return!n||h>N(n,c)+n.drop+14?Be({reference:[c,h],size:.55+e%3*.08}):""}).join("")}
    </g>`}).join("")}</g>`}function Xn(){return`<g id="escher-terrace-background" data-stage="print-details">
    ${Un()}
    ${mt.map(({id:t,depth:e,drop:n,points:o},a)=>{const r=o.map(B),i=Qn(a),c=`escher-terrace-ground-${a}`,s=`escher-terrace-wall-${a}`,h=o.toReversed().map(([d,g])=>B([d,g+n])),l=o.slice(1).map((d,g)=>{const M=o[g],u=d[1]>M[1]||d[0]-M[0]<25;return m([M,d,[d[0],d[1]+n],[M[0],M[1]+n]].map(B),u?"terrace-wall-side":"terrace-wall-front")}).join(""),f=o.slice(1,-1).map(([d,g])=>b(L([[d,g],[d,g+n]].map(B)),"terrace-wall-return")).join("");return`<g data-contour="${t}" class="terrace-study-${e}">
        <defs>
          <clipPath id="${c}">${m(i,"")}</clipPath>
          <clipPath id="${s}">${m([...r,...h],"")}</clipPath>
        </defs>
        ${m(i,"terrace-ground")}
        <g class="terrace-ground-texture" clip-path="url(#${c})">${Qe(a)}</g>
        ${l}${f}
        <g class="terrace-wall-texture" clip-path="url(#${s})">${Re(o,n)}</g>
        ${b(L(r),"terrace-study-edge")}
        ${b(L(h.toReversed()),"terrace-wall-base")}
        ${Bn(a).map(Be).join("")}
      </g>`}).map((t,e)=>t+(e===yt.afterContour?Vn():"")).join("")}
  </g>`}const z=p.channelWallThickness/(2*p.channelFootprint.halfSide),Mt=1-2*z,_t=24,Ve=(t,e)=>Array.from({length:_t+1},(n,o)=>k(t,e,o/_t)),ft=4,Yt=[1/3,2/3];function it(t,e){const[n,o]=t.from,r=t.to[0].map((h,l)=>h-n[l]),i=o.map((h,l)=>h-n[l]),c=e.map((h,l)=>h-n[l]),s=r[0]*i[1]-r[1]*i[0];return{t:(c[0]*i[1]-c[1]*i[0])/s,v:(r[0]*c[1]-r[1]*c[0])/s}}function Pt(t,e){if(typeof e=="number"){const a=k(...t.from),r=k(...t.to);e=k(a,r,(e-a[0])/(r[0]-a[0]))}const n=it(t,e).t,o=Math.min(2,Math.max(0,Math.floor((n+1e-9)*3)));return ft*(e.course??2*t.id-1+o)}function lt(t,e){const{t:n,v:o}=it(t,e),a=ft*(2*t.id-1),r=a+2*ft;let i;if(n<=0)i=a-st(t.fromTier);else if(n>=1)i=r-(t.toTier?st(t.toTier):p.channelWallHeights[4].left);else{const c=st(t.fromTier,k(...t.from,o)),s=t.toTier?st(t.toTier,k(...t.to,o)):p.channelWallHeights[4].left;i=(a-c)*(1-n)+(r-s)*n}return W(e,[0,i])}const Ue=(t,e)=>W(lt(t,e),[0,-Pt(t,e)]);function zt(t,e,n){const o=it(t,e).t,a=it(t,n).t,r=Yt.map((c,s)=>({s:(c-o)/(a-o),course:2*t.id-1+s})).filter(({s:c})=>Number.isFinite(c)&&c>1e-8&&c<1-1e-8),i=Ve(e,n).map((c,s)=>({p:c,s:s/_t})).filter(({s:c})=>!r.some(s=>Math.abs(c-s.s)<1e-8));return r.forEach(({s:c,course:s})=>{const h=a>o?s:s+1,l=a>o?s+1:s;i.push({s:c,p:Object.assign(k(e,n,c),{course:h})},{s:c,p:Object.assign(k(e,n,c),{course:l})})}),i.sort((c,s)=>c.s-s.s).map(({p:c})=>c)}function Gt(t,e){const n=e==="near"?z:1-z,o=e==="near"?0:1,a=t.from[o],r=t.to[o],i=k(...t.from,n),c=k(...t.to,n),s=(g,M,u,$)=>{if(!M)return[u,$];const y=Ht.flatMap(w=>w.turns).find(w=>w.tier===M),S=jt(y),A=(w,j)=>Math.hypot(w[0]-j[0],w[1]-j[1])<1e-7,q=[y.entry,y.exit].find(w=>S.edges[w].every(j=>g.some(P=>A(P,j))))===y.entry?y.exit:y.entry,D=S.edges[q].some(w=>A(w,u))?z:1,v=k(...g),x=S.center.map((w,j)=>2*D*(w-v[j]));return[W(u,x),W($,x)]},[h,l]=s(t.from,t.fromTier,a,i),[f,d]=s(t.to,t.toTier,r,c);if(t.fromTier==="left-upper"&&e==="far"){const g=t.turns.find(S=>S.tier==="left-upper"),{corners:[M,u,,$],center:y}=jt(g);return{bank:e,segment:t,outer:[M,$,a,r,f],inner:[k(M,u,z),k(y,$,Mt),i,c,d]}}return{bank:e,segment:t,outer:[h,a,r,f],inner:[l,i,c,d]}}function he(t,e){const n=typeof e=="function"?e:()=>e,o=u=>t.segment?Ue(t.segment,u):W(u,[0,-n(u)]),a=u=>t.segment?lt(t.segment,u):u,r=u=>u.slice(1).flatMap(($,y)=>(t.segment?zt(t.segment,u[y],$):Ve(u[y],$)).slice(y?1:0)),i=r(t.outer).map(o),c=r(t.inner).map(o),s=t.outer.slice(1).map((u,$)=>Math.hypot(u[0]-t.outer[$][0],u[1]-t.outer[$][1])),h=s.slice(0,t.outer.length-3).reduce((u,$)=>u+$,0);let l=0,f="";s.forEach((u,$)=>{const y=l+u;if(u>1e-8){const S=Math.ceil((l-h)/29)*29+h;for(let A=S;A<y-1e-7;A+=29){const T=(A-l)/u,q=k(t.outer[$],t.outer[$+1],T),E=k(t.inner[$],t.inner[$+1],T);f+=b(L([o(q),o(E)]),"channel-joint channel-cap-joint"),t.bank!=="far"&&(f+=b(L([o(q),a(q)]),"channel-joint channel-vertical-joint"))}}l=y});let d="",g="",M="";if(t.segment){const u=t.segment;t.outer.slice(1).forEach(($,y)=>{const S=t.outer[y],A=t.inner[y],T=t.inner[y+1],q=it(u,S).t,E=it(u,$).t,D=[0,...Yt.map(v=>(v-q)/(E-q)).filter(v=>Number.isFinite(v)&&v>1e-8&&v<1-1e-8).sort((v,x)=>v-x),1];D.slice(1).forEach((v,x)=>{const w=D[x],j=Pt(u,k(S,$,(w+v)/2))/ft,P=(U,_,K)=>o(Object.assign(k(U,_,K),{course:j})),C=P(S,$,w),O=P(S,$,v),F=P(A,T,v),H=P(A,T,w);M+=b(L([C,O,F,H])+"Z","channel-wall-cap",'stroke="none"'),M+=b(L([C,O])+L([H,F]),"channel-coping-edge")})}),Yt.forEach(($,y)=>{const S=k(t.outer.at(-3),t.outer.at(-2),$),A=k(t.inner.at(-3),t.inner.at(-2),$),T=2*u.id-1+y,q=(w,j)=>o(Object.assign([...w],{course:j})),E=[q(S,T+1),q(A,T+1)],D=[q(S,T),q(A,T)],v=E[0][0]<E[1][0]?0:1,x=u.id%2?v:1-v;d+=b(L([E[1-x],E[x],D[x]]),"channel-step-edge",`data-visible-edge="${u.id%2?"left":"right"}"`)});for(let $=1;$<2*u.id+1;$++){let y=!1,S="";r(t.outer).forEach(A=>{if(Pt(u,A)>$*ft+.01){const T=W(a(A),[0,-$*ft]);S+=`${y?"L":"M"}${T}`,y=!0}else y=!1}),S&&(g+=b(S,"channel-course-joint"))}}return`<g class="channel-side-wall" data-extended-through-turn="true" data-bank="${t.bank}" data-joint-style="${t.bank==="far"?"cap-only":"brick"}">
    ${m([...r(t.inner).map(a),...c.toReversed()],"channel-wall-inner")}
    ${m([...r(t.outer).map(a),...i.toReversed()],"channel-wall-outer")}
    ${t.segment?M:m([...i,...c.toReversed()],"channel-wall-cap")}
    ${d}<g class="channel-wall-joints">${g}${f}</g>
  </g>`}function de(t){const e=t.outer.map(a=>t.segment?lt(t.segment,a):a),n=t.inner.map(a=>t.segment?lt(t.segment,a):a),o=e.map(a=>W(a,[0,p.wallDepth]));return`<g class="channel-floor" data-extended-through-turn="true">
    ${m([...e,...o.toReversed()],"channel-bed-side")}
    ${m([...e,...n.toReversed()],"channel-corner-stone")}
  </g>`}function In(t,e){const n=jt(e).corners.map(a=>lt(t,a)),o=n.map(a=>W(a,[0,p.wallDepth]));return`<g class="channel-turn-floor" data-turn="${e.tier}" data-full-turn-bed="true">
    ${m([n[0],n[1],o[1],o[0]],"channel-bed-side")}
    ${m([n[1],n[2],o[2],o[1]],"channel-bed-side")}
    ${m(n,"channel-corner-stone")}
  </g>`}function Zn(t,e="left"){const[n,o]=t.from,[a,r]=t.to,i=k(...t.from)[0]<k(...t.to)[0],c=e==="left"===i?.15:.85,s=Pt(t,k(k(...t.from),k(...t.to),c));return{near:[k(n,o,z),k(a,r,z)],far:[k(n,o,1-z),k(a,r,1-z)],height:s,heightAt:h=>Pt(t,h),waterElevation:s-p.channelWaterFreeboard,waterAt:h=>W(Ue(t,h),[0,p.channelWaterFreeboard]),guideAt:h=>{const{t:l,v:f}=it(t,h),d=st(t.fromTier,k(...t.from,f)),g=t.toTier?st(t.toTier,k(...t.to,f)):p.channelWallHeights[4].left;return W(h,[0,-d*(1-l)-g*l+p.channelWaterFreeboard])}}}const vt=t=>(e=0,n=0,o=0)=>R(t.origin,e,n,o),Dt=vt(Q);function _n(t,e,n,o,a,r,i="u"){const c=(s,h)=>t(e+(i==="u"?s:0),n+(i==="v"?s:0),o+h);return`<g>${m([c(0,0),c(a,0),c(a,r),c(0,r)],"window-dark")}
    ${b(L([c(-3,r+3),c(a+3,r+3)]),"window-frame")}
    ${b(L([c(-3,-2),c(a+3,-2)]),"window-frame")}
    ${b(L([c(a/2,0),c(a/2,r)]),"window-frame")}</g>`}function Yn(t,e,n,o,a,r,i="u"){const c=(s,h)=>t(e+(i==="u"?s:0),n+(i==="v"?s:0),o+h);return b(`M${c(0,0)}L${c(0,r*.6)}Q${c(a/2,r*1.4)} ${c(a,r*.6)}L${c(a,0)}Z`,"window-dark")}function zn(){const{outline:t,height:e}=Q,[n,o]=t.slice(1,3),a=Dt;return[a(...n),a(...o),a(o[0],o[1],-e),a(n[0],n[1],-e)]}function Gn(){const{outline:t,height:e,platformOutline:n,platformThickness:o,door:a}=Q,r=Dt,i=t.map((l,f)=>{const d=t[(f+1)%t.length];if(d[0]<=l[0]&&d[1]<=l[1]||d[1]===l[1])return"";if(f===3){const g=Ht[3],M=Gt(g,"near").outer.reduce((F,H)=>F[0]>H[0]?F:H),u=lt(g,M).map((F,H)=>F+(H===1?p.wallDepth:0)),$=r(...l)[0],y=[$,u[1]+($-u[0])*p.waterwayDirections.receding[1]],S=Q.canalSupportHeight,{canalLowerHeight:A,canalLowerSetback:T}=Q,q=[y[0],y[1]+S],E=[u[0],u[1]+S],D=q.map((F,H)=>(F+E[H])/2),v=T*p.channelFootprint.halfDepth/p.channelFootprint.halfWidth,x=R(D,T,0),w=R(E,T,v),j=R(E,-80,v),P=R(E,-80,0),C=[D,x,w,j,P,E],O=F=>[F[0],F[1]+A];return`<g id="escher-canal-two-storey">
        ${m([w,j,O(j),O(w)],"stone-light wall-facing mill-canal-lower-corner")}
        ${m([x,w,O(w),O(x)],"stone-mid wall-receding mill-canal-lower-wall")}
        ${m([D,x,O(x),O(D)],"stone-light wall-facing mill-canal-lower-return")}
        ${m(C,"ground-plane terrace-floor mill-canal-lower-roof")}
        <g id="escher-canal-lower-railing">${Qt(R(w,0,-80),w,22)}${Qt(w,j,22)}</g>
        ${m([y,u,E,q],"stone-mid wall-receding building-side-wall mill-foundation-right-wall mill-canal-support-wall")}
      </g>`}return m([r(...l),r(...d),r(d[0],d[1],-e),r(l[0],l[1],-e)],"stone-mid wall-receding building-side-wall mill-foundation-right-wall")}).reverse().join(""),c=t.flatMap((l,f)=>{const d=t[(f+1)%t.length];return d[1]===l[1]&&d[0]>l[0]?[l,d]:[]}),s=m([...c.map(l=>r(...l)),...c.toReversed().map(l=>r(l[0],l[1],-e))],"stone-light wall-facing mill-foundation-front-wall"),h=n.map((l,f)=>{const d=n[(f+1)%n.length];return d[0]<=l[0]&&d[1]<=l[1]?"":m([r(...l),r(...d),r(d[0],d[1],-o),r(l[0],l[1],-o)],"mill-platform-rim")}).join("");return`<g id="escher-mill-foundation" data-building="mill-foundation">
    ${i}${s}
    <g id="escher-foundation-door" data-wall="right">${Yn(r,a.u,a.v,-e,a.width,a.height,"v")}</g>
    <g id="escher-mill-platform">${h}${m(n.map(l=>r(...l)),"ground-plane terrace-floor")}</g>
  </g>`}function Nn(){return`<g id="escher-mill-right-platform">${m(fn.map(t=>Dt(...t)),"ground-plane terrace-floor mill-right-platform-surface")}</g>`}function fe(t="front"){const e=Dt,n=Q.platformOutline,o=n.map((a,r)=>({a,b:r===4?ln:n[(r+1)%n.length],i:r})).filter(({i:a})=>t==="front"?Q.platformFrontEdges.includes(a):!Q.platformFrontEdges.includes(a));return`<g id="escher-mill-balcony${t==="rear"?"-rear":""}">
    ${o.map(({a,b:r,i})=>`<g data-platform-edge="${i}">${b(L([e(...a),e(...r)]),"balcony-edge")}${Q.platformRailEdges.includes(i)?Qt(e(...a),e(...r),24):""}</g>`).join("")}
    ${t==="front"?[50,86,122,158].map(a=>b(L([e(a,-36,-6),e(a,-20,-20),e(a+11,-36,-6)]),"balcony-bracket")).join(""):""}
  </g>`}function Jn(){const t=sn,{width:e,depth:n,height:o,roofRise:a}=t,r=vt(t),i=s=>o+a*(1-Math.abs(2*s/e-1)),c=(s,h)=>{const l=i(s),f=l+55;return`${m([r(s-9,h-5,l),r(s+9,h-5,l),r(s+9,h-5,f),r(s-9,h-5,f)],"stone-mid")}
      ${m([r(s+9,h-5,l),r(s+9,h+5,l),r(s+9,h+5,f),r(s+9,h-5,f)],"stone-dark")}
      ${m([r(s-12,h-8,f),r(s+12,h-8,f),r(s,h,f+14)],"roof-dark")}
      ${m([r(s+12,h-8,f),r(s+12,h+8,f),r(s,h,f+14)],"roof-dark")}`};return`<g id="escher-mill" data-building="mill">
    ${m([r(0,0),r(0,n),r(0,n,o),r(0,0,o)],"stone-mid")}
    ${m([r(0,0),r(e,0),r(e,0,o),r(e/2,0,o+a),r(0,0,o)],"stone-light wall-facing building-front-wall")}
    ${m([r(e,0),r(e,n),r(e,n,o),r(e,0,o)],"stone-mid wall-receding building-side-wall")}
    ${m([r(e/2,0,o+a),r(e/2,n,o+a),r(e,n,o),r(e,0,o)],"roof-dark")}
    ${b(L([r(-8,0,o),r(e/2,0,o+a+5),r(e/2,n,o+a+5),r(e+8,n,o)]),"roof-edge")}
    ${b(L([r(e/2,0,o+a+5),r(e+7,0,o)]),"roof-edge")}
    ${c(70,15)}
    ${_n(r,24,0,38,29,45)}
    <g class="mill-front-door">${m([r(80,0),r(109,0),r(109,0,76),r(80,0,76)],"window-dark")}</g>
  </g>`}function Kn(){return`<g id="escher-landscape" aria-hidden="true">${Xn()}</g>`}function tr(){const t={origin:[530,853],height:190},e=t.height,n=vt(t),o=vt(Lt),a=Lt.width,r=Lt.depth,i=Lt.outline.map(([M,u])=>o(M,u)),{gateWidth:c,gateHeight:s,wallHeight:h}=Q.garden,l=r-c,f=(M,u)=>o(a,l+M,-h+u),d=`M${f(0,0)}L${f(0,s*.6)}Q${f(c/2,s*1.4)} ${f(c,s*.6)}L${f(c,0)}Z`,g=[...Array.from({length:5},(M,u)=>L([f((u+1)*c/6,0),f((u+1)*c/6,s)])),...Array.from({length:7},(M,u)=>L([f(0,(u+1)*6),f(c,(u+1)*6)]))].join("");return n(60,-28,e+18),n(144,-28,40),n(144,-28,22),n(60,-28,e),`<g id="escher-foreground">
    
    <g id="escher-garden" data-building="garden-planter">
      ${m(i,"garden-soil")}
      ${Rn(o,a,r)}
      ${m([o(0,0),o(a,0),o(a,0,-h),o(0,0,-h)],"stone-light wall-facing")}
      ${m([o(a,0),o(a,l),o(a,l,-h),o(a,0,-h)],"stone-mid wall-receding")}
      ${b(L([o(0,0),o(a,0),o(a,l)]),"garden-wall-cap")}
      <g id="escher-garden-gate" data-wall="garden-side">
        <defs><clipPath id="escher-garden-gate-clip"><path d="${d}"/></clipPath></defs>
        ${b(g,"garden-gate-grid",'clip-path="url(#escher-garden-gate-clip)"')}
        ${b(d,"garden-gate-frame")}
      </g>
    </g>
  </g>`}function Nt(t,e,n,o,a){const r=[[-e,-n],[e,-n],[e,n],[-e,n]].map(([c,s])=>a?kt(a,t,c,s):R(t,c,s)),i=r.map(c=>W(c,[0,-o]));return`${m([i[0],i[1],r[1],r[0]],"stone-mid")}
    ${m([i[1],i[2],r[2],r[1]],"stone-dark")}
    ${m(i,"stone-light")}`}function er(t,e,n,o,a){const r=e-o-2;return`<g class="escher-column" data-foot-y="${e}" data-cap-y="${n}" data-base-height="${o}" data-shaft-length="${r-n-15}">
    ${Nt([t,e],7.5,5.5,o,a)}
    ${b(`M${t-6},${r}V${n+15}h12V${r}q-6,4 -12,0Z`,"stone-light")}
    ${b(`M${t+3},${n+15}V${r}`,"column-shade")}
    ${Nt([t,n+17],p.columnCap.halfWidth,p.columnCap.halfDepth,12,a)}
    ${b(`M${t-8},${e-o-4}q8,5 16,0M${t-8},${n+23}q8,5 16,0`,"fine-line")}
  </g>`}function nr(t,e,n){return`<g class="escher-column escher-square-pier">
    ${Nt([t,e],p.lowerPierFootprint.halfWidth,p.lowerPierFootprint.halfDepth,e-n-6,"left-middle")}
  </g>`}function pe(t,e){const{y:n,top:o,tier:a,pierBay:r}=t;if(r)return e==="rear"?"":`<g data-tower-tier="${a}" data-column-side="right">
      ${Xt.map(h=>nr(h.x,h.bottom,h.top)).join("")}
    </g>`;ht(t).corners;const i=tn(t),c=un(t);return`<g data-tower-tier="${a}" data-column-side="${e}">
    ${(e==="rear"?[3,2]:[0,1]).map(h=>er(i[h][0],i[h][1],c[h][1],p.columnBaseHeights[a],a)).join("")}
  </g>`}function rr(t){const{center:e}=ht(t),n=t.y-t.top+31,{halfWidth:o,halfDepth:a}=p.towerEave,r=[[-o,-a],[o,-a],[o,a],[-o,a]].map(([c,s])=>kt(t.tier,e,c,s,n)),i=W(R(e,0,0,n),[0,-16]);return`<g class="escher-tower-roof" data-tower="${t.id}">
    ${m([r[0],r[1],W(r[1],[0,8]),W(r[0],[0,8])],"stone-mid")}
    ${m([r[1],r[2],W(r[2],[0,8]),W(r[1],[0,8])],"stone-dark")}
    ${m(r,"stone-light")}
    <g class="tower-ornament" transform="translate(${i.join(" ")})">
      ${Pn(t.ornament)}
    </g>
  </g>`}function or(t){const{corners:e,edges:n,center:o,entry:a,exit:r}=jt(t),i=(l,f)=>k(o,l,f),c=l=>W(l,[0,-st(t.tier)]),s=l=>W(c(l),[0,p.channelWaterFreeboard]),h=[n[t.entry],n[t.exit]];return`<g class="channel-turn" data-turn="${t.tier}" data-coping-only="true">
    <g class="channel-turn-water">
      ${m(e.map(l=>s(i(l,Mt))),"channel-corner-water")}
      ${h.map(([l,f])=>{const d=k(l,f,z),g=k(l,f,1-z);return m([d,g,i(g,Mt),i(d,Mt)].map(s),"channel-corner-water")}).join("")}
      ${ge(`current-turn-${t.tier}`,e.map(l=>s(i(l,Mt))),(l,f)=>{const d=s(a),g=s(o),M=s(r),u=d.map((S,A)=>(1-l)*(1-l)*S+2*(1-l)*l*g[A]+l*l*M[A]),$=d.map((S,A)=>2*(1-l)*(g[A]-S)+2*l*(M[A]-g[A])),y=Math.hypot(...$)||1;return[u[0]-$[1]/y*(f-.5)*9,u[1]+$[0]/y*(f-.5)*9]},t.tier==="left-upper"?1:-1,65)}
    </g>
    ${gn(t).map(l=>`<g class="channel-turn-bank">${m(l.map(c),"channel-wall-cap")}</g>`).join("")}
  </g>`}function ar(t,e){const n=mn(t,e),o=`escher-channel-${t.id}-${e}-clip`,[a,r]=t.from,[i,c]=t.to,s=Zn(t,e),h=Gt(t,"near"),l=Gt(t,"far"),f=[...zt(t,...s.near).map(s.waterAt),...zt(t,...s.far).map(s.waterAt).toReversed()];return`<g id="escher-channel-${t.id}-${e}" data-structural-layer="channel-${t.id}-${e}" data-channel-side="${e}" data-wall-height="${s.height}">
    <defs><clipPath id="${o}"><rect x="${n.minX}" y="-1000" width="${n.maxX-n.minX}" height="3000"/></clipPath></defs>
    <g clip-path="url(#${o})" class="channel-half-artwork"${t.id===4&&e==="left"?' mask="url(#escher-landing-platform-mask)"':""}>
    <g${t.id===4?' mask="url(#escher-foundation-floor-mask)"':""}>${de(l)}${de(h)}</g>
    ${t.id===1?n.turns.map(d=>In(t,d)).join(""):""}
    ${m([a,i,c,r].map(d=>lt(t,d)),"channel-corner-stone")}
    ${he(l,s.heightAt)}
    <g data-water-elevation="${s.waterElevation}">
      ${m(f,"channel-corner-water")}
      ${ge(`current-${t.id}-${e}`,f,(d,g)=>s.guideAt(k(k(...s.near,d),k(...s.far,d),g)),-1,Math.hypot(i[0]-a[0],i[1]-a[1]))}
    </g>
    ${he(h,s.heightAt)}
    ${n.turns.map(or).join("")}
    ${n.tailrace?`${b(L(n.tailrace),"channel-outline")}${b(L(n.tailrace),"channel-top")}${b(L(n.tailrace),"channel-water")}`:""}
    </g>
  </g>`}function sr(t){const e=te.find(o=>o.tier===t),n=p.towers.find(o=>`${o.id}-upper`===t);return`<g data-structural-layer="${t}">
    ${e.pierBay?Nn()+vn():""}
    ${e.pierBay?"":pe(e,"rear")}
    ${pe(e,"front")}
    ${Wn(e)}
    ${n?rr(e):""}
  </g>`}function cr(){return $n.map(t=>{if(t==="wheel")return Mn();if(t.startsWith("channel-")){const[,e,n]=t.split("-");return ar(Ht.find(o=>o.id===Number(e)),n)}return sr(t)}).join("")}const[I,V]=Ke,[Tt,Xe]=Vt,$t=Xe+p.waterfallLandingExtension,ir=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${p.viewBox}" role="img" aria-labelledby="escher-svg-title escher-svg-description" class="escher-drawing">
  <title id="escher-svg-title">瀑布：水渠、水磨房与周围建筑群</title>
  <desc id="escher-svg-description">水轮下方的水渠向右后方伸展，再反复折回，最终接到左塔下方的高处落水口。瀑布从那里直落到水轮和平台上的方形水池，形成二维画面中的不可能循环。远处是带有石墙、耕地和植物的梯田，左上有一座高窄小屋；左下是种植着杯形与枝状植物的庭院。</desc>
  <defs>${Hn}<filter id="escher-mist-soften" x="-50%" y="-70%" width="200%" height="240%"><feGaussianBlur stdDeviation="1.4"/></filter><clipPath id="escher-fall-clip"><path d="M${I-16},${V}Q${I-30},${V+24} ${I-30},${V+65}L${Tt-30},${$t}H${Tt+5}V${V+60}Q${I+5},${V+20} ${I+16},${V}Z"/></clipPath>
    <mask id="escher-foundation-floor-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1000">
      <rect width="900" height="1000" fill="white"/>
      <polygon points="${zn().map(t=>t.join(",")).join(" ")}" fill="black"/>
    </mask>
    <!-- The platform occludes the tailrace's exposed wall/floor ends at the
         landing. Apply only to channel 4, leaving wheel and columns intact. -->
    <mask id="escher-landing-platform-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="900">
      <rect width="900" height="900" fill="white"/>
      <rect x="${Tt-43}" y="${Xe-27}" width="53" height="45" fill="black"/>
    </mask>
  </defs>
  <rect width="900" height="900" class="scene-paper"/>
  <g class="scene-architecture" transform="translate(0 ${p.compositionOffsetY})" stroke-linejoin="round" stroke-linecap="round">
    ${Kn()}
    ${Gn()}
    ${fe("rear")}
    ${Jn()}
    ${cr()}
    <g id="escher-fall-route" transform="translate(${p.waterfallOffsetX} 0)">
    <g id="escher-waterfall" clip-path="url(#escher-fall-clip)">
      <rect x="${I-40}" y="${V}" width="90" height="${$t-V+10}" class="fall-water"/>
      ${Array.from({length:9},(t,e)=>b(`M${I-16+e*4},${V}Q${I-30+e*4},${V+30} ${I-30+e*4},${V+70}V${$t}`,"fall-line")).join("")}
      ${Array.from({length:13},(t,e)=>b(`M${I-17+e*3},${V}Q${I-31+e*3},${V+30} ${I-31+e*3},${V+70}V${$t}`,"fall-streak")).join("")}
    </g>
    ${b(`M${I-16},${V}l32,0`,"water-lip")}
    <g id="escher-splash" transform="translate(${Tt-12} ${$t})" aria-hidden="true">
      <g filter="url(#escher-mist-soften)">${Array.from({length:9},(t,e)=>'<g class="splash-mist"><path d="M-19,2 Q-24,-5 -13,-9 Q-17,-20 -4,-19 Q4,-28 11,-16 Q24,-17 19,-6 Q29,2 13,5Z"/></g>').join("")}</g>
      ${Array.from({length:48},(t,e)=>`<ellipse class="splash-drop" cx="${(e%4-1.5)*3}" cy="-1" rx="${.8+e%3*.25}" ry="${1.25+e%4*.25}"/>`).join("")}
    </g>
    </g>
    ${fe()}
    
    ${tr()}
  </g>
</svg>`;document.querySelector("#escher-scene").innerHTML=ir;kn(document.querySelector("#escher-scene"));const rt=[...document.querySelectorAll('[role="tab"]')],lr=[...document.querySelectorAll('[role="tabpanel"]')];function ue(t){for(const e of rt){const n=e===t;e.setAttribute("aria-selected",String(n)),e.tabIndex=n?0:-1}for(const e of lr)e.hidden=e.id!==t.getAttribute("aria-controls")}for(const[t,e]of rt.entries())e.addEventListener("click",()=>ue(e)),e.addEventListener("keydown",n=>{let o;switch(n.key){case"ArrowRight":o=(t+1)%rt.length;break;case"ArrowLeft":o=(t-1+rt.length)%rt.length;break;case"Home":o=0;break;case"End":o=rt.length-1;break;default:return}n.preventDefault(),ue(rt[o]),rt[o].focus()});document.querySelector("#copyright-year").textContent=new Date().getFullYear();
