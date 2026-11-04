import"./geb2.js";const ge=[...document.querySelectorAll("[data-proof-case]")],$n=[...document.querySelectorAll(".proof-result")],wn=document.querySelector("#proof-announcement");for(const t of ge)t.addEventListener("click",()=>{const e=t.dataset.proofCase;for(const n of ge)n.setAttribute("aria-pressed",String(n===t));for(const n of $n)n.hidden=n.id!==`proof-${e}`;document.querySelector("#proof-prompt").hidden=!0,wn.textContent=e==="provable"?"推演已展开：证明 G 会违背系统的自洽性。详细推理位于按钮下方。":"推演已展开：G 在通常的自然数中为真，但在这个系统中不可证明。详细推理位于按钮下方。"});const ut=Math.tan(10*Math.PI/180),St=Math.tan(-20*Math.PI/180),zt=Math.atan(Math.sqrt(ut/-St)),Pe=Math.sqrt(ut*-St),yn=Math.sqrt(1-Pe**2),bn=Math.sin(zt)/yn;function Y(t){const e=ut-St;return{halfSide:t,halfWidth:t*Math.sqrt(-St/e),halfDepth:t*Math.sqrt(ut/e)}}const f={viewBox:"0 0 900 884",compositionOffsetY:-36,aqueductDrop:16,waterwayDirections:{across:[1,ut],receding:[1,St]},towerBay:Y(37),lowerPierFootprint:{halfWidth:7.5,halfDepth:6},channelFootprint:Y(50),channelWallThickness:25,channelWallHeights:{1:{left:4,right:7},2:{left:15,right:11},3:{left:19,right:23},4:{left:31,right:27}},channelWaterFreeboard:2,towerBayCenterOffset:[10,-9],columnCap:Y(10),columnBase:Y(11.8),columnRadius:7.5,columnBaseHeights:{"right-lower":8,"left-middle":20,"right-upper":25,"left-upper":31},towerEave:Y(54),archFrame:{...Y(48),top:28,bottom:-18},waterfallOutletX:354,waterfallLandingExtension:8,waterfallOffsetX:-10,pool:{halfSide:60,sideRetraction:18,widthExpansion:20,rearPierGap:2,rimWidth:3,rimHeight:3},ornamentYawDegrees:[25,35],wallDepth:8,wheel:{x:389,radius:64,lift:25,depth:[-52*Math.cos(zt),52*Pe*Math.sin(zt)],faceScale:bn,faceShear:0,buckets:24},mill:{origin:[157,642],width:137,depth:205,height:146,roofRise:68,slide:-48,referenceChannelHalfSide:42},towers:[{id:"left",x:371,y:296,top:190,ornament:0,lowerLevels:[{id:"middle",y:460,top:334},{id:"lower",y:674,top:476,pierBay:!0}]},{id:"right",x:680,y:337,top:227,ornament:1,lowerLevels:[{id:"lower",y:500,top:375}]}],millTerrace:{origin:[139,642-18*ut],outline:[[38,-20],[306,-20],[306,82],[288,82],[288,225],[38,225]],door:{u:306,v:8,width:56,height:96},garden:{left:38,right:306,plantWidth:242,depth:180,lift:32,wallHeight:32,gateWidth:26,gateHeight:46},platformOutline:[[-18,-36],[180,-36],[180,-20],[306,-20],[306,82],[288,82],[288,225],[-18,225]],canalSupportHeight:50,canalLowerHeight:110,canalLowerSetback:34,platformThickness:6,platformRailEdges:[0,1,2,3,4,7],platformFrontEdges:[0,1,2,3,4],height:141}},Le=([t,e])=>[1,e/t],U=Le(f.waterwayDirections.across),_=Le(f.waterwayDirections.receding);function R(t,e,n,o=0){return[t[0]+e*U[0]+n*_[0],t[1]+e*U[1]+n*_[1]-o]}const ft=t=>Math.atan2(t[1],t[0])*180/Math.PI;ft(U),ft(_),Math.abs(ft(U)-ft(_)),180-Math.abs(ft(U)-ft(_));const k=(t,e,n=.5)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n],Ve=f.towers.find(t=>t.id==="left"),Mn=f.towers.find(t=>t.id==="right"),se=Mn.x-Ve.x,ie=({x:t,y:e})=>[t+f.towerBayCenterOffset[0],e+f.towerBayCenterOffset[1]],Ee=ie(Ve),qe=R(Ee,se,0),Fe=R(qe,0,-se),kn=R(Fe,se,0),xn={"left-upper":Ee,"right-upper":qe,"left-middle":Fe,"right-lower":kn},Pt=f.towers.flatMap(t=>[{...t,tier:`${t.id}-upper`},...t.lowerLevels.map(e=>({x:t.x,...e,tier:`${t.id}-${e.id}`}))]).map(t=>{const e=xn[t.tier]??ie(t),n=t.pierBay?0:f.aqueductDrop,o=[e[0],e[1]+n],a=o[1]+9;return{...t,center:o,y:a,top:t.top+a-t.y}});function tt(t,e=f.towerBay){const{x:n,y:o}=t,a=t.center??ie({x:n,y:o}),{halfWidth:r,halfDepth:c}=e,i=[[-r,-c],[r,-c],[r,c],[-r,c]].map(([d,w])=>R(a,d,w)),[s,h,l,p]=i;return{corners:i,center:a,edges:{front:[h,s],right:[h,l],back:[l,p],left:[s,p]}}}const ce=Object.fromEntries(Pt.map(t=>[t.tier,tt(t,f.channelFootprint)])),lt=(t,e)=>ce[t].edges[e],K=t=>k(...t),De=Y(f.mill.referenceChannelHalfSide),Sn=K(tt(Pt.find(t=>t.tier==="left-upper"),De).edges.front).map((t,e)=>e===1?t-f.channelWallHeights[1].left+f.channelWaterFreeboard:t);function Hn(t){return tt(t).corners.map(e=>[e[0],e[1]-st(t.tier)])}const Wn=tt(Pt.find(t=>t.tier==="left-middle")).edges.right.map(([t,e])=>({x:t,top:e+f.wallDepth-5})),Oe=lt("right-upper","front"),Ce=lt("left-middle","back"),Ht=lt("right-lower","front"),Rt=K(Oe).map((t,e)=>K(Ce)[e]-t),jn=K(Ht),An=(f.waterfallOutletX-jn[0])/Rt[0],Re=Ht.map(t=>t.map((e,n)=>e+Rt[n]*An)),Wt=t=>Ht[0][1]+(t-Ht[0][0])*Rt[1]/Rt[0];K(Re).map((t,e)=>e===1?t-f.channelWallHeights[4].left+f.channelWaterFreeboard:t);f.waterfallOutletX,Wt(f.waterfallOutletX)-f.channelWallHeights[4].left;const me=tt(Pt.find(t=>t.tier==="right-lower"),De).corners[1],Tn=t=>me[1]+(t-me[0])*_[1],vt=[f.waterfallOutletX,Tn(f.waterfallOutletX)-f.channelWallHeights[4].left],Pn=f.millTerrace.origin[1]+(f.waterfallOutletX-f.millTerrace.origin[0])*U[1],Gt=Pn-vt[1],Ln=f.mill.origin[1]-Gt,Vn={...f.mill,origin:R([f.mill.origin[0],Ln],0,f.mill.slide)},kt={...f.millTerrace,origin:R([f.millTerrace.origin[0],f.millTerrace.origin[1]-Gt],0,f.mill.slide),height:f.millTerrace.height+Gt},jt=Wn.map(t=>({...t,bottom:Wt(t.x)-f.channelWallHeights[4].left})),En=[jt[0].x,jt[0].bottom],Nt=En.map((t,e)=>t-kt.origin[e]),$e=(Nt[1]-U[1]*Nt[0])/(_[1]-U[1]),gt=[Nt[0]-$e,$e],qn=[gt[0]+f.lowerPierFootprint.halfWidth,gt[1]],Zt=kt.platformOutline.map(([t,e],n)=>[t,n===4||n===5?gt[1]:e]),D={...kt,outline:[[kt.garden.left,Zt[3][1]],...Zt.slice(3,7),[kt.garden.left,225]],platformOutline:Zt},yt=D.garden,le=D.outline[1],Fn=D.outline[0][0],qt=le[0]-Fn,Dn=R(D.origin,...le,-D.height+yt.lift),Ft={origin:R(Dn,-qt,-yt.depth),width:qt,depth:yt.depth,backV:le[1],outline:[[0,0],[qt,0],[qt,yt.depth],[0,yt.depth]]},we=(t,e,n,o)=>t.flatMap((a,r)=>{const c=t[(r+1)%t.length],i=o*(a[e]-n)>=-1e-9,s=o*(c[e]-n)>=-1e-9,h=()=>k(a,c,(n-a[e])/(c[e]-a[e]));return i&&s?[c]:i?[h()]:s?[h(),c]:[]}),On=we(we(D.platformOutline,0,gt[0],1),1,gt[1],-1),Lt=[{id:1,fromTier:"left-upper",toTier:"right-upper",from:lt("left-upper","right"),to:lt("right-upper","left"),turns:[{tier:"left-upper",entry:"right",exit:"front"}]},{id:2,fromTier:"right-upper",toTier:"left-middle",from:Oe,to:Ce,turns:[{tier:"right-upper",entry:"left",exit:"front"}]},{id:3,fromTier:"left-middle",toTier:"right-lower",from:lt("left-middle","right"),to:lt("right-lower","left"),turns:[{tier:"left-middle",entry:"back",exit:"right"}]},{id:4,fromTier:"right-lower",from:Ht,to:Re,turns:[{tier:"right-lower",entry:"left",exit:"front"}]}],Cn={"left-upper":{entry:"right",exit:"front",heights:[f.channelWallHeights[1].left,f.channelWallHeights[1].left]},"right-upper":{entry:"left",exit:"front",heights:[f.channelWallHeights[1].right,f.channelWallHeights[2].right]},"left-middle":{entry:"back",exit:"right",heights:[f.channelWallHeights[2].left,f.channelWallHeights[3].left]},"right-lower":{entry:"left",exit:"front",heights:[f.channelWallHeights[3].right,f.channelWallHeights[4].right]}};function st(t,e){const[n,o]=Cn[t].heights;return(n+o)/2}function xt(t,e,n,o,a=0){return R(e,n,o,a)}function Rn(t){return tt(t).corners.map(e=>[e[0],t.top+e[1]-t.y])}function vn(t){const e=[0,f.channelWallThickness/(2*f.channelFootprint.halfSide),1-f.channelWallThickness/(2*f.channelFootprint.halfSide),1],n={front:"1,0",right:"2,1",back:"1,2",left:"0,1"},o=new Set(["1,1",n[t.entry],n[t.exit]]),a=new Map;for(let l=0;l<3;l++)for(let p=0;p<3;p++){if(o.has(`${l},${p}`))continue;const d=[[l,p],[l+1,p],[l+1,p+1],[l,p+1]];d.forEach((w,m)=>{const u=d[(m+1)%4],$=`${w}:${u}`,y=`${u}:${w}`;a.has(y)?a.delete(y):a.set($,[w,u])})}const{corners:[r,c,,i]}=ce[t.tier],s=([l,p])=>r.map((d,w)=>d+e[l]*(c[w]-r[w])+e[p]*(i[w]-r[w])),h=[];for(;a.size;){const l=a.values().next().value[0],p=[];let d=l;do{p.push(d);const w=[...a.entries()].find(([,[m]])=>String(m)===String(d));a.delete(w[0]),d=w[1][1]}while(String(d)!==String(l));h.push(p.map(s))}return h}function At(t){const e=ce[t.tier];return{...e,entry:K(e.edges[t.entry]),exit:t.tail??K(e.edges[t.exit])}}function Bn(t,e){const n=(K(t.from)[0]+K(t.to)[0])/2,o=.8;return{...t,side:e,cutX:n,minX:e==="left"?-1e3:n-o,maxX:e==="left"?n+o:2e3,turns:t.turns.filter(a=>(At(a).center[0]<n?"left":"right")===e),tailrace:e==="left"?t.tailrace:void 0}}const Qn=["channel-4-left","wheel","left-lower","channel-2-left","channel-3-left","left-middle","channel-1-left","left-upper","channel-3-right","channel-4-right","right-lower","channel-1-right","channel-2-right","right-upper"],g=(t,e)=>`<polygon points="${t.map(n=>n.join(",")).join(" ")}" class="${e}"/>`,M=(t,e,n="")=>`<path d="${t}" class="${e}" ${n}/>`,T=t=>t.map(([e,n],o)=>`${o?"L":"M"}${e},${n}`).join(" "),A=(t,e,n=1)=>[t[0]+e[0]*n,t[1]+e[1]*n];function Jt(t,e,n=23){const o=Math.ceil(Math.hypot(e[0]-t[0],e[1]-t[1])/16);let a="";for(let r=0;r<=o;r++){const c=t[0]+(e[0]-t[0])*r/o,i=t[1]+(e[1]-t[1])*r/o;a+=`M${c},${i}v${-n-3}`}return`<g class="terrace-railing">${M(`M${t[0]},${t[1]-n}L${e[0]},${e[1]-n}M${t[0]},${t[1]-6}L${e[0]},${e[1]-6}${a}`,"railing-line")}</g>`}const N=f.channelWallThickness/(2*f.channelFootprint.halfSide),bt=1-2*N,Kt=24,ve=(t,e)=>Array.from({length:Kt+1},(n,o)=>k(t,e,o/Kt)),pt=4,Ct=29,te=[1/3,2/3];function ht(t,e){const[n,o]=t.from,r=t.to[0].map((h,l)=>h-n[l]),c=o.map((h,l)=>h-n[l]),i=e.map((h,l)=>h-n[l]),s=r[0]*c[1]-r[1]*c[0];return{t:(i[0]*c[1]-i[1]*c[0])/s,v:(r[0]*i[1]-r[1]*i[0])/s}}function Tt(t,e){if(typeof e=="number"){const a=k(...t.from),r=k(...t.to);e=k(a,r,(e-a[0])/(r[0]-a[0]))}const n=ht(t,e).t,o=Math.min(2,Math.max(0,Math.floor((n+1e-9)*3)));return pt*(e.course??2*t.id-1+o)}function dt(t,e){const{t:n,v:o}=ht(t,e),a=pt*(2*t.id-1),r=a+2*pt;let c;if(n<=0)c=a-st(t.fromTier);else if(n>=1)c=r-(t.toTier?st(t.toTier):f.channelWallHeights[4].left);else{const i=st(t.fromTier,k(...t.from,o)),s=t.toTier?st(t.toTier,k(...t.to,o)):f.channelWallHeights[4].left;c=(a-i)*(1-n)+(r-s)*n}return A(e,[0,c])}const he=(t,e)=>A(dt(t,e),[0,-Tt(t,e)]);function ee(t,e,n){const o=ht(t,e).t,a=ht(t,n).t,r=te.map((i,s)=>({s:(i-o)/(a-o),course:2*t.id-1+s})).filter(({s:i})=>Number.isFinite(i)&&i>1e-8&&i<1-1e-8),c=ve(e,n).map((i,s)=>({p:i,s:s/Kt})).filter(({s:i})=>!r.some(s=>Math.abs(i-s.s)<1e-8));return r.forEach(({s:i,course:s})=>{const h=a>o?s:s+1,l=a>o?s+1:s;c.push({s:i,p:Object.assign(k(e,n,i),{course:h})},{s:i,p:Object.assign(k(e,n,i),{course:l})})}),c.sort((i,s)=>i.s-s.s).map(({p:i})=>i)}function Bt(t,e){const n=e==="near"?N:1-N,o=e==="near"?0:1,a=t.from[o],r=t.to[o],c=k(...t.from,n),i=k(...t.to,n),s=(w,m,u,$)=>{if(!m)return[u,$];const y=Lt.flatMap(b=>b.turns).find(b=>b.tier===m),S=At(y),H=(b,W)=>Math.hypot(b[0]-W[0],b[1]-W[1])<1e-7,L=[y.entry,y.exit].find(b=>S.edges[b].every(W=>w.some(j=>H(j,W))))===y.entry?y.exit:y.entry,O=S.edges[L].some(b=>H(b,u))?N:1,E=k(...w),x=S.center.map((b,W)=>2*O*(b-E[W]));return[A(u,x),A($,x)]},[h,l]=s(t.from,t.fromTier,a,c),[p,d]=s(t.to,t.toTier,r,i);if(t.fromTier==="left-upper"&&e==="far"){const w=t.turns.find(S=>S.tier==="left-upper"),{corners:[m,u,,$],center:y}=At(w);return{bank:e,segment:t,outer:[m,$,a,r,p],inner:[k(m,u,N),k(y,$,bt),c,i,d]}}return{bank:e,segment:t,outer:[h,a,r,p],inner:[l,c,i,d]}}function ye(t,e){const n=typeof e=="function"?e:()=>e,o=u=>t.segment?he(t.segment,u):A(u,[0,-n(u)]),a=u=>t.segment?dt(t.segment,u):u,r=u=>u.slice(1).flatMap(($,y)=>(t.segment?ee(t.segment,u[y],$):ve(u[y],$)).slice(y?1:0)),c=r(t.outer).map(o),i=r(t.inner).map(o),s=t.outer.slice(1).map((u,$)=>Math.hypot(u[0]-t.outer[$][0],u[1]-t.outer[$][1])),h=s.slice(0,t.outer.length-3).reduce((u,$)=>u+$,0);let l=0,p="";s.forEach((u,$)=>{const y=l+u;if(u>1e-8){const S=Math.ceil((l-h)/Ct)*Ct+h;for(let H=S;H<y-1e-7;H+=Ct){const P=(H-l)/u,L=k(t.outer[$],t.outer[$+1],P),V=k(t.inner[$],t.inner[$+1],P);p+=M(T([o(L),o(V)]),"channel-joint channel-cap-joint"),t.bank!=="far"&&(p+=M(T([o(L),a(L)]),"channel-joint channel-vertical-joint"))}}l=y});let d="",w="",m="";if(t.segment){const u=t.segment;t.outer.slice(1).forEach(($,y)=>{const S=t.outer[y],H=t.inner[y],P=t.inner[y+1],L=ht(u,S).t,V=ht(u,$).t,O=[0,...te.map(E=>(E-L)/(V-L)).filter(E=>Number.isFinite(E)&&E>1e-8&&E<1-1e-8).sort((E,x)=>E-x),1];O.slice(1).forEach((E,x)=>{const b=O[x],W=Tt(u,k(S,$,(b+E)/2))/pt,j=(X,z,et)=>o(Object.assign(k(X,z,et),{course:W})),v=j(S,$,b),C=j(S,$,E),F=j(H,P,E),q=j(H,P,b);m+=M(T([v,C,F,q])+"Z","channel-wall-cap",'stroke="none"'),m+=M(T([v,C])+T([q,F]),"channel-coping-edge")})}),te.forEach(($,y)=>{const S=k(t.outer.at(-3),t.outer.at(-2),$),H=k(t.inner.at(-3),t.inner.at(-2),$),P=2*u.id-1+y,L=(b,W)=>o(Object.assign([...b],{course:W})),V=[L(S,P+1),L(H,P+1)],O=[L(S,P),L(H,P)],E=V[0][0]<V[1][0]?0:1,x=u.id%2?E:1-E;d+=M(T([V[1-x],V[x],O[x]]),"channel-step-edge",`data-visible-edge="${u.id%2?"left":"right"}"`)});for(let $=1;$<2*u.id+1;$++){let y=!1,S="";r(t.outer).forEach(H=>{if(Tt(u,H)>$*pt+.01){const P=A(a(H),[0,-$*pt]);S+=`${y?"L":"M"}${P}`,y=!0}else y=!1}),S&&(w+=M(S,"channel-course-joint"))}}return`<g class="channel-side-wall" data-extended-through-turn="true" data-bank="${t.bank}" data-joint-style="${t.bank==="far"?"cap-only":"brick"}">
    ${g([...r(t.inner).map(a),...i.toReversed()],"channel-wall-inner")}
    ${g([...r(t.outer).map(a),...c.toReversed()],"channel-wall-outer")}
    ${t.segment?m:g([...c,...i.toReversed()],"channel-wall-cap")}
    ${d}<g class="channel-wall-joints">${w}${p}</g>
  </g>`}function be(t){const e=t.outer.map(a=>t.segment?dt(t.segment,a):a),n=t.inner.map(a=>t.segment?dt(t.segment,a):a),o=e.map(a=>A(a,[0,f.wallDepth]));return`<g class="channel-floor" data-extended-through-turn="true">
    ${g([...e,...o.toReversed()],"channel-bed-side")}
    ${g([...e,...n.toReversed()],"channel-corner-stone")}
  </g>`}function Un(t,e){const n=At(e).corners.map(a=>dt(t,a)),o=n.map(a=>A(a,[0,f.wallDepth]));return`<g class="channel-turn-floor" data-turn="${e.tier}" data-full-turn-bed="true">
    ${g([n[0],n[1],o[1],o[0]],"channel-bed-side")}
    ${g([n[1],n[2],o[2],o[1]],"channel-bed-side")}
    ${g(n,"channel-corner-stone")}
  </g>`}function Xn(t,e="left"){const[n,o]=t.from,[a,r]=t.to,c=k(...t.from)[0]<k(...t.to)[0],i=e==="left"===c?.15:.85,s=Tt(t,k(k(...t.from),k(...t.to),i));return{near:[k(n,o,N),k(a,r,N)],far:[k(n,o,1-N),k(a,r,1-N)],height:s,heightAt:h=>Tt(t,h),waterElevation:s-f.channelWaterFreeboard,waterAt:h=>A(he(t,h),[0,f.channelWaterFreeboard]),guideAt:h=>{const{t:l,v:p}=ht(t,h),d=st(t.fromTier,k(...t.from,p)),w=t.toTier?st(t.toTier,k(...t.to,p)):f.channelWallHeights[4].left;return A(h,[0,-d*(1-l)-w*l+f.channelWaterFreeboard])}}}const it=t=>(e=0,n=0,o=0)=>R(t.origin,e,n,o),Vt=it(D);function In(t){const e=it(t),{width:n,depth:o,height:a,id:r}=t;return`<g data-building="${r}">
    ${g([e(0,0,a),e(n,0,a),e(n,0),e(0,0)],"stone-light wall-facing building-front-wall")}
    ${g([e(n,0,a),e(n,o,a),e(n,o),e(n,0)],"stone-mid wall-receding building-side-wall")}
    ${g([e(0,0,a),e(n,0,a),e(n,o,a),e(0,o,a)],"terrace-floor building-roof-plane")}
  </g>`}function Be(t,e,n,o,a,r,c="u"){const i=(s,h)=>t(e+(c==="u"?s:0),n+(c==="v"?s:0),o+h);return`<g>${g([i(0,0),i(a,0),i(a,r),i(0,r)],"window-dark")}
    ${M(T([i(-3,r+3),i(a+3,r+3)]),"window-frame")}
    ${M(T([i(-3,-2),i(a+3,-2)]),"window-frame")}
    ${M(T([i(a/2,0),i(a/2,r)]),"window-frame")}</g>`}function Qe(t,e,n,o,a,r,c="u"){const i=(s,h)=>t(e+(c==="u"?s:0),n+(c==="v"?s:0),o+h);return M(`M${i(0,0)}L${i(0,r*.6)}Q${i(a/2,r*1.4)} ${i(a,r*.6)}L${i(a,0)}Z`,"window-dark")}function Me(t,e,n,o,a,r){const c=(i,s=!1,h=!1,l=!1)=>t(e[0]+(i+(s?1:0))*o[0]+(h?n[0]:0),e[1]+(i+(s?1:0))*o[1]+(h?n[1]:0),e[2]-(i+(l?1:0))*a);return`<g class="stone-stairs">${Array.from({length:r},(i,s)=>{const h=r-1-s;return`${g([c(h,!0),c(h,!0,!0),c(h,!0,!0,!0),c(h,!0,!1,!0)],"stone-mid stair-riser")}
      ${g([c(h),c(h,!1,!0),c(h,!0,!0),c(h,!0)],"stone-light stair-tread")}`}).join("")}</g>`}function Ue(){const{outline:t,height:e}=D,[n,o]=t.slice(1,3),a=Vt;return[a(...n),a(...o),a(o[0],o[1],-e),a(n[0],n[1],-e)]}function Zn(){const{outline:t,height:e,platformOutline:n,platformThickness:o,door:a}=D,r=Vt,c=t.map((l,p)=>{const d=t[(p+1)%t.length];if(d[0]<=l[0]&&d[1]<=l[1]||d[1]===l[1])return"";if(p===3){const w=Lt[3],m=Bt(w,"near").outer.reduce((F,q)=>F[0]>q[0]?F:q),u=dt(w,m).map((F,q)=>F+(q===1?f.wallDepth:0)),$=r(...l)[0],y=[$,u[1]+($-u[0])*f.waterwayDirections.receding[1]],S=D.canalSupportHeight,{canalLowerHeight:H,canalLowerSetback:P}=D,L=[y[0],y[1]+S],V=[u[0],u[1]+S],O=L.map((F,q)=>(F+V[q])/2),E=P*f.channelFootprint.halfDepth/f.channelFootprint.halfWidth,x=R(O,P,0),b=R(V,P,E),W=R(V,-80,E),j=R(V,-80,0),v=[O,x,b,W,j,V],C=F=>[F[0],F[1]+H];return`<g id="escher-canal-two-storey">
        ${g([b,W,C(W),C(b)],"stone-light wall-facing mill-canal-lower-corner")}
        ${g([x,b,C(b),C(x)],"stone-mid wall-receding mill-canal-lower-wall")}
        ${g([O,x,C(x),C(O)],"stone-light wall-facing mill-canal-lower-return")}
        ${g(v,"ground-plane terrace-floor mill-canal-lower-roof")}
        <g id="escher-canal-lower-railing-rear">${Jt(b,W,22)}</g>
        ${g([y,u,V,L],"stone-mid wall-receding building-side-wall mill-foundation-right-wall mill-canal-support-wall")}
        <g id="escher-canal-lower-railing">${Jt(R(b,0,-80),b,22)}</g>
      </g>`}return g([r(...l),r(...d),r(d[0],d[1],-e),r(l[0],l[1],-e)],"stone-mid wall-receding building-side-wall mill-foundation-right-wall")}).reverse().join(""),i=t.flatMap((l,p)=>{const d=t[(p+1)%t.length];return d[1]===l[1]&&d[0]>l[0]?[l,d]:[]}),s=g([...i.map(l=>r(...l)),...i.toReversed().map(l=>r(l[0],l[1],-e))],"stone-light wall-facing mill-foundation-front-wall"),h=n.map((l,p)=>{const d=n[(p+1)%n.length];return d[0]<=l[0]&&d[1]<=l[1]?"":g([r(...l),r(...d),r(d[0],d[1],-o),r(l[0],l[1],-o)],"mill-platform-rim")}).join("");return`<g id="escher-mill-foundation" data-building="mill-foundation">
    ${c}${s}
    <g id="escher-foundation-door" data-wall="right">${Qe(r,a.u,a.v,-e,a.width,a.height,"v")}</g>
    <g id="escher-mill-platform">${h}${g(n.map(l=>r(...l)),"ground-plane terrace-floor")}</g>
  </g>`}function _n(){return`<g id="escher-mill-right-platform">${g(On.map(t=>Vt(...t)),"ground-plane terrace-floor mill-right-platform-surface")}</g>`}function ke(t="front"){const e=Vt,n=D.platformOutline,o=n.map((a,r)=>({a,b:r===4?qn:n[(r+1)%n.length],i:r})).filter(({i:a})=>t==="front"?D.platformFrontEdges.includes(a):!D.platformFrontEdges.includes(a));return`<g id="escher-mill-balcony${t==="rear"?"-rear":""}">
    ${o.map(({a,b:r,i:c})=>`<g data-platform-edge="${c}">${M(T([e(...a),e(...r)]),"balcony-edge")}${D.platformRailEdges.includes(c)?Jt(e(...a),e(...r),24):""}</g>`).join("")}
    ${t==="front"?[50,86,122,158].map(a=>M(T([e(a,-36,-6),e(a,-20,-20),e(a+11,-36,-6)]),"balcony-bracket")).join(""):""}
  </g>`}function Yn(){const t=Vn,{width:e,depth:n,height:o,roofRise:a}=t,r=it(t),c=s=>o+a*(1-Math.abs(2*s/e-1)),i=(s,h)=>{const l=c(s),p=l+55;return`${g([r(s-9,h-5,l),r(s+9,h-5,l),r(s+9,h-5,p),r(s-9,h-5,p)],"stone-mid")}
      ${g([r(s+9,h-5,l),r(s+9,h+5,l),r(s+9,h+5,p),r(s+9,h-5,p)],"stone-dark")}
      ${g([r(s-12,h-8,p),r(s+12,h-8,p),r(s,h,p+14)],"roof-dark")}
      ${g([r(s+12,h-8,p),r(s+12,h+8,p),r(s,h,p+14)],"roof-dark")}`};return`<g id="escher-mill" data-building="mill">
    ${g([r(0,0),r(0,n),r(0,n,o),r(0,0,o)],"stone-mid")}
    ${g([r(0,0),r(e,0),r(e,0,o),r(e/2,0,o+a),r(0,0,o)],"stone-light wall-facing building-front-wall")}
    ${g([r(e,0),r(e,n),r(e,n,o),r(e,0,o)],"stone-mid wall-receding building-side-wall")}
    ${g([r(e/2,0,o+a),r(e/2,n,o+a),r(e,n,o),r(e,0,o)],"roof-dark")}
    ${M(T([r(-8,0,o),r(e/2,0,o+a+5),r(e/2,n,o+a+5),r(e+8,n,o)]),"roof-edge")}
    ${M(T([r(e/2,0,o+a+5),r(e+7,0,o)]),"roof-edge")}
    ${i(70,15)}
    ${Be(r,24,0,38,29,45)}
    <g class="mill-front-door">${g([r(80,0),r(109,0),r(109,0,76),r(80,0,76)],"window-dark")}</g>
  </g>`}const Xe=Lt[3],zn=Bt(Xe,"near").outer,[Dt,xe]=zn.slice(1,3),Se=525,Gn=[Se,Dt[1]+(Se-Dt[0])*(xe[1]-Dt[1])/(xe[0]-Dt[0])],Et=he(Xe,Gn),Nn=45-Ct/Math.hypot(..._),Jn=R(Et,0,Nn),Xt=28,Kn=jt[0].x-Et[0],de=(Kn+Xt)/2,tr=25,Ie=65-f.millTerrace.canalSupportHeight,Ze=-83-tr,er=Ze+Ie,Qt=3,ne=7,_e=5,nr=_e+Ie/Qt,He=R(D.origin,D.door.u+40,D.door.v+D.door.width,-D.height),Ye=[He[0]-Qt*ne,He[1]-Qt*(ne*U[1]+_e)],ze=Ye[0]-Et[0],rr=Ye[1]-Et[1]+Ze,Ge=(rr-ze*U[1])/(_[1]-U[1]),or=ze-Ge,re=(Xt-de)*1.08,ar=Y(re/(2*Y(1).halfDepth)),We=(de+Xt)/2,sr={origin:Jn,platformOrigin:Et,platformEnd:150,bankStepWidth:14,frontV:de,backV:Xt,end:150,deck:-18,ground:er,edgeHeight:18,edgeThickness:6,archHeight:56,houseMinV:We-re/2,houseMaxV:We+re/2,houseWidth:2*ar.halfWidth,houseRoof:6,houseBottom:-420,stairU:or,stairV:Ge,stairCount:Qt,stairRun:ne,stairRise:nr};function ir(){const t=sr,e=it(t),n=it({origin:t.platformOrigin}),o=t.deck,a=t.ground,r=[[0,t.backV+8],[t.platformEnd,t.backV+8],[t.platformEnd,t.stairV+34],[t.stairU,t.stairV+34],[t.stairU,t.stairV],[0,t.stairV]],c={id:"bridge-square-house",origin:e(t.end,t.houseMinV,t.houseBottom),width:t.houseWidth,depth:t.houseMaxV-t.houseMinV,height:t.houseRoof-t.houseBottom},i=it(c),s=(m,u,$,y=!0)=>`<g class="bridge-raised-edge">
    ${y?g([e(0,m,o+t.edgeHeight),e(t.end,m,o+t.edgeHeight),e(t.end,m,o),e(0,m,o)],$):""}
    ${g([e(0,m,o+t.edgeHeight),e(t.end,m,o+t.edgeHeight),e(t.end,u,o+t.edgeHeight),e(0,u,o+t.edgeHeight)],"stone-light")}
    ${g([e(0,u,o+t.edgeHeight),e(t.end,u,o+t.edgeHeight),e(t.end,u,o),e(0,u,o)],$)}
  </g>`,[h,l]=D.outline,p=Vt,d=D.height;return`<g id="escher-cross-bridge-complex">
    <defs><mask id="bridge-platform-room-occlusion" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1100">
      <rect width="900" height="1100" fill="white"/>
      ${[[p(...h),p(...l),p(...l,-d),p(...h,-d)],Ue()].map(m=>`<polygon points="${m.map(u=>u.join(",")).join(" ")}" fill="black"/>`).join("")}
    </mask></defs>
    <g id="escher-bridge-under-platform" mask="url(#bridge-platform-room-occlusion)">
      ${r.map((m,u)=>{const $=r[(u+1)%r.length];return g([n(...m,a),n(...$,a),n(...$,a-7),n(...m,a-7)],"stone-mid")}).join("")}
      ${g(r.map(m=>n(...m,a)),"ground-plane terrace-floor")}
      <g id="escher-bridge-platform-stairs">${Me(n,[t.stairU,t.stairV,a],[0,34],[t.stairRun,0],t.stairRise,t.stairCount)}</g>
    </g>
    <g id="escher-cross-bridge">
      ${g([[0,t.frontV],[t.end,t.frontV],[t.end,t.backV],[0,t.backV]].map(m=>e(...m,o)),"stone-light bridge-deck")}
      ${s(t.backV,t.backV-t.edgeThickness,"stone-mid wall-facing")}
      <g id="escher-bridge-bank-steps">
        ${[t.backV,t.backV-t.bankStepWidth].map((m,u)=>g([e(0,m,0),e(8,m,0),e(8,m,-9),e(16,m,-9),e(16,m,-18),e(0,m,-18)],`bridge-bank-step-side ${u?"stone-light":"stone-mid"}`)).join("")}
        ${Me(e,[0,t.backV-t.bankStepWidth,0],[0,t.bankStepWidth],[8,0],9,2)}
      </g>
      ${s(t.frontV,t.frontV+t.edgeThickness,"stone-light wall-facing",!1)}
      ${g([e(0,t.frontV,o+t.edgeHeight),e(t.end,t.frontV,o+t.edgeHeight),e(t.end,t.frontV,a),e(0,t.frontV,a)],"stone-light wall-facing bridge-front-wall")}
      <g id="escher-bridge-arch">${Qe(e,8,t.frontV,a,28,t.archHeight)}
        ${M(`M${e(12,t.frontV,a)}L${e(12,t.frontV,a+t.archHeight*.6)}Q${e(24,t.frontV,a+t.archHeight*1.27)} ${e(36,t.frontV,a+t.archHeight*.6)}`,"bridge-arch-intrados")}
      </g>
    </g>
    ${`<g id="escher-bridge-house">${In(c)}${Be(i,22,0,c.height-90,22,32)}</g>`}
  </g>`}function Ne(t,e,n,o,a=300){const r=Math.max(3,Math.round(a/66)),c=[.17,.35,.53,.72,.86];return`<g class="channel-current" data-current-direction="${o}">
    <defs><clipPath id="${t}">${g(e,"")}</clipPath></defs>
    <g clip-path="url(#${t})">
      ${c.map((i,s)=>{const h=Array.from({length:49},(p,d)=>{const w=d/48;return n(w,i+Math.sin(w*Math.PI*7+s*1.9)*.025)}),l=61+s*13;return`<g class="current-lane" data-lane="${s}">
          ${M(T(h),"current-thread",`data-period="${l}" data-speed="${18+s*2}" stroke-dasharray="${20+s*4} 6 3 ${l-29-s*4}"`)}
          ${s%2===0?Array.from({length:r},(p,d)=>`<g class="current-ripple" data-phase="${(d+.18*Math.sin(d*3+s)+.11*s)/r}" data-speed="${20+s*1.8}"><g transform="scale(${.72+d%3*.12} .62)">
            <path d="M-2.5,-2 Q-.5,0 -2.5,2" class="current-crest"/>
            ${d%2===0?'<ellipse cx="1.5" cy=".3" rx=".8" ry=".45" class="current-foam"/>':""}
          </g></g>`).join(""):""}
        </g>`}).join("")}
    </g>
  </g>`}function cr(){return f.wheel.radius}function lr(){const{x:t,radius:e,depth:n,faceScale:o,faceShear:a}=f.wheel,r=Lt.find(d=>d.id===4),c=r.from[0],i=r.to[0],s=(i[1]-c[1])/(i[0]-c[0]),l=Math.hypot(1,a- -1*s*o),p=[!1,!0].map(d=>{const w=t+(d?n[0]:0),m=2*t+n[0]-w;return Wt(m)-(d?n[1]:0)-3-(e+3)*l});return Math.min(...p)-f.wheel.lift}function Je(){const{depth:t}=f.wheel;return{front:[t[0],t[1]],rear:[0,0]}}function Ke(t){const{radius:e,faceScale:n,faceShear:o}=f.wheel,a=-e+t*2*e,r=Math.sqrt(Math.max(0,e*e-a*a)),c=[r/e,a/e],i=[-a/e,r/e],s=Je();return{r:e,at:(l,p,d=0)=>{const w=c[0]*l+i[0]*d,m=c[1]*l+i[1]*d;return[w*n+s[p][0],m+w*o+s[p][1]]}}}function tn(t){const{r:e,at:n}=Ke(t);return[n(e,"rear"),n(e,"front"),n(e-6,"front"),n(e-6,"rear")]}function en(t){const{r:e,at:n}=Ke(t);return[n(e,"rear"),n(e,"front"),n(e,"front",1.5),n(e,"rear",1.5)]}function hr(){const{x:t,depth:e,faceScale:n,faceShear:o}=f.wheel,a=lr(),r=cr(),{rear:c}=Je(),i=f.wheel.buckets/2,s=`translate(${2*t+e[0]} 0) scale(-1 1)`,h=Array.from({length:8},(l,p)=>`<path d="M7,-3.5H${r-9}v7H7Z" transform="rotate(${p*45})" class="wheel-timber-spoke"/>`).join("");return`<g id="escher-wheel" data-structural-layer="wheel" transform="${s}">
    <g transform="translate(${t} ${a})">
      <g transform="matrix(${n} ${o} 0 1 ${c[0]} ${c[1]})"><circle r="${r-2.5}" class="wheel-rear-rim" style="fill:none;stroke-width:5"/></g>
      <g id="escher-wheel-buckets">${Array.from({length:i},(l,p)=>`<g class="wheel-moving-bucket">${g(tn(p/i),"wheel-bucket-plank")}${g(en(p/i),"wheel-bucket-edge")}</g>`).join("")}</g>
      <g transform="matrix(${n} ${o} 0 1 ${e[0]} ${e[1]})">
        <circle r="${r-1}" class="wheel-interior"/>
        <g id="escher-wheel-rotor">
          ${h}
          <path d="M${r},0a${r},${r} 0 1 0 ${-2*r},0a${r},${r} 0 1 0 ${2*r},0 M${r-10},0a${r-10},${r-10} 0 1 1 ${-2*(r-10)},0a${r-10},${r-10} 0 1 1 ${2*(r-10)},0" fill-rule="evenodd" class="wheel-timber-rim"/>
        </g>
        <circle r="10" class="wheel-timber-hub"/><circle r="3" class="wheel-pin"/>
      </g>
    </g>
  </g>`}const _t={revolution:30,fallSpeed:260},ot=(t,e)=>(t%e+e)%e;function dr(t,e){const n=.7+t%5*.09,o=ot(e+t*.137,n),r=(t%2?1:-1)*(12+t*17%32),c=-(28+t*13%34);return{x:r*o,y:c*o+62*o*o,opacity:Math.sin(Math.PI*o/n)*.8}}function fr(t){const e=document.createElement("button");e.type="button",e.className="escher-motion-toggle",t.after(e);const n=matchMedia("(prefers-reduced-motion: reduce)");let o=n.matches,a=!1,r=0,c=null,i=0;const s=t.querySelector("#escher-wheel-rotor"),h=[...t.querySelectorAll("#escher-wheel-buckets .wheel-moving-bucket")],l=[...t.querySelectorAll(".channel-current")].flatMap(x=>[...x.querySelectorAll(".current-lane")].map(b=>{const W=b.querySelector(".current-thread"),j=W.getTotalLength(),v=Array.from({length:97},(F,q)=>W.getPointAtLength(j*q/96));return{thread:W,length:j,at:F=>{const q=Math.max(0,Math.min(96,F*96)),X=Math.min(95,Math.floor(q)),z=q-X;return{x:v[X].x*(1-z)+v[X+1].x*z,y:v[X].y*(1-z)+v[X+1].y*z}},direction:Number(x.dataset.currentDirection),ripples:[...b.querySelectorAll(".current-ripple")]}})),p=[...t.querySelectorAll(".fall-streak")],d=[...t.querySelectorAll(".splash-drop")],w=[...t.querySelectorAll(".splash-mist")],m=[...t.querySelectorAll(".pond-ripple ellipse")],u=t.closest('[role="tabpanel"]'),$=()=>{e.textContent=o?"播放动画":"暂停动画",e.setAttribute("aria-label",o?"播放水流与水车动画":"暂停水流与水车动画")};function y(x){s.setAttribute("transform",`rotate(${ot(x/_t.revolution*360,360)})`),h.forEach((b,W)=>{const j=ot(W/h.length+x/(_t.revolution/f.wheel.buckets)/h.length,1);b.children[0].setAttribute("points",tn(j).map(v=>v.join(",")).join(" ")),b.children[1].setAttribute("points",en(j).map(v=>v.join(",")).join(" ")),b.style.opacity=Math.min(1,j*h.length*1.5,(1-j)*h.length*1.5)}),l.forEach(({thread:b,length:W,at:j,direction:v,ripples:C})=>{b.style.strokeDashoffset=String(-v*ot(x*Number(b.dataset.speed),Number(b.dataset.period))),C.forEach(F=>{const q=ot(Number(F.dataset.phase)+x*Number(F.dataset.speed)/W,1),X=v>0?q:1-q,z=j(X),et=j(Math.max(0,X-.005)),ue=j(Math.min(1,X+.005)),mn=Math.atan2(ue.y-et.y,ue.x-et.x)*180/Math.PI+(v<0?180:0);F.setAttribute("transform",`translate(${z.x} ${z.y}) rotate(${mn})`),F.style.opacity=String(Math.min(1,q*12,(1-q)*12)*.72)})}),p.forEach((b,W)=>{b.style.strokeDashoffset=String(-ot(x*_t.fallSpeed+W*9,64))}),d.forEach((b,W)=>{const j=dr(W,x);b.setAttribute("transform",`translate(${j.x} ${j.y})`),b.style.opacity=j.opacity}),m.forEach((b,W)=>{const j=ot(x*.7+W/m.length,1);b.setAttribute("transform",`scale(${.25+j*2.4})`),b.style.opacity=(1-j)*.48}),w.forEach((b,W)=>{const j=ot(x*.85+W/w.length,1);b.setAttribute("transform",`translate(${Math.sin(W*2.4)*j*10} ${-j*13}) scale(${.65+j*.65})`),b.style.opacity=Math.sin(Math.PI*j)*.42})}const S=()=>!o&&a&&!document.hidden&&!u.hidden;function H(x){if(r=0,!S()){c=null;return}c!==null&&(i+=Math.min((x-c)/1e3,.1)),c=x,y(i),r=requestAnimationFrame(H)}function P(){S()?r||(r=requestAnimationFrame(H)):(cancelAnimationFrame(r),r=0,c=null),t.dataset.motionState=S()?"running":"paused"}e.addEventListener("click",()=>{o=!o,$(),P()});const L=()=>{o=n.matches,$(),P()};n.addEventListener("change",L),document.addEventListener("visibilitychange",P);const V=new IntersectionObserver(x=>{a=x[0].isIntersecting,P()});V.observe(t);const O=new MutationObserver(P);O.observe(u,{attributes:!0,attributeFilter:["hidden"]});const E=()=>{cancelAnimationFrame(r),V.disconnect(),O.disconnect(),n.removeEventListener("change",L),document.removeEventListener("visibilitychange",P)};return window.addEventListener("pagehide",x=>{x.persisted?(cancelAnimationFrame(r),r=0,c=null):E()}),window.addEventListener("pageshow",P),y(0),$(),P(),E}const G=(t,e)=>t.reduce((n,o,a)=>n+o*e[a],0),mt=(t,e)=>t.map((n,o)=>n+e[o]),ct=(t,e)=>t.map(n=>n*e),nn=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],oe=t=>ct(t,1/Math.hypot(...t));function Ut(t,e,n){const o=[...t],a=(e+1)%3,r=(e+2)%3;return o[a]=t[a]*Math.cos(n)-t[r]*Math.sin(n),o[r]=t[a]*Math.sin(n)+t[r]*Math.cos(n),o}function pr(t,e,n){const o=[],a=[];return t.forEach((r,c)=>{const i=t[(c+1)%t.length],s=G(r,e)-n,h=G(i,e)-n;if(s<=1e-9&&o.push(r),s>=-1e-9&&a.push(r),s<-1e-9&&h>1e-9||s>1e-9&&h<-1e-9){const l=mt(r,ct(mt(i,ct(r,-1)),s/(s-h)));o.push(l),a.push(l)}}),{inside:o,outside:a}}function ur(t){const e=[];for(let n=0;n<3;n++)for(const o of[-1,1]){const a=[0,0,0];a[n]=o;const r=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([c,i])=>{const s=[0,0,0];return s[n]=o,s[(n+1)%3]=c,s[(n+2)%3]=i,Ut(s,t,Math.PI/4)});e.push({points:r,normal:Ut(a,t,Math.PI/4),d:1})}return e}function gr(){const t=[0,1,2].map(ur);return t.flatMap((e,n)=>e.flatMap(o=>{let a=[o.points];for(let r=0;r<3;r++)r!==n&&(a=a.flatMap(c=>{const i=[];let s=c;for(const h of t[r]){if(s.length<3)break;const l=pr(s,h.normal,h.d);l.outside.length>=3&&i.push(l.outside),s=l.inside}return i}));return a.map(r=>({points:r,normal:o.normal}))}))}function mr(){const t=[];for(let e=0;e<3;e++)for(const n of[-1,1])for(const o of[-1,1]){const a=(e+1)%3,r=(e+2)%3,c=[0,0,0],i=[0,0,0],s=[0,0,0],h=[0,0,0];c[a]=2*n,i[a]=n,i[r]=o,i[e]=1,s[r]=2*o,h[a]=n,h[r]=o,h[e]=-1;const l=[0,0,0];l[a]=2*n,l[r]=2*o;const p=[c,i,s,h];p.forEach((d,w)=>{const m=[d,p[(w+1)%4],l];let u=oe(nn(mt(m[1],ct(d,-1)),mt(l,ct(d,-1))));G(u,d)<0&&(u=ct(u,-1)),t.push({points:m,normal:u})})}return t}function $r(t){const e=f.waterwayDirections.across[1],n=-f.waterwayDirections.receding[1],o=Math.atan(Math.sqrt(e/n)),a=Math.asin(Math.sqrt(e*n)),r=[Math.cos(o),Math.sin(o),0],c=[Math.sin(a)*Math.sin(o),-Math.sin(a)*Math.cos(o),-Math.cos(a)],i=oe(nn(r,c)),s=oe([-1,-2,4]),h=f.ornamentYawDegrees[t]*Math.PI/180,l=(t===0?gr():mr()).map($=>({points:$.points.map(y=>Ut(y,2,h)),normal:Ut($.normal,2,h)})),p=t===0?98:100,d=l.flatMap($=>$.points.map(y=>[G(y,r),G(y,c)])),w=Math.max(...d.map($=>$[1])),m=Math.min(...d.map($=>$[1])),u=p/(w-m);return l.filter($=>G($.normal,i)<-1e-8).sort(($,y)=>G(ct(y.points.reduce(mt,[0,0,0]),1/y.points.length),i)-G(ct($.points.reduce(mt,[0,0,0]),1/$.points.length),i)).map($=>{const y=Math.max(0,G($.normal,s)),S=Math.round(91+y*115);return M(T($.points.map(H=>[G(H,r)*u,(G(H,c)-w)*u+16]))+"Z","ornament-face",`style="fill:rgb(${S},${S+1},${S-10})"`)}).join("")}function wr(t){if(t.pierBay)return"";const{center:e}=tt(t),n=f.archFrame,o=t.y-t.top,a=[[-n.halfWidth,-n.halfDepth],[n.halfWidth,-n.halfDepth],[n.halfWidth,n.halfDepth],[-n.halfWidth,n.halfDepth]].map(([d,w])=>xt(t.tier,e,d,w)),r=10;function c(d,w,m,u,$){const y=A(d,[0,-o-n.top]),S=A(w,[0,-o-n.top]),H=A(d,[0,-o-n.bottom]),P=A(w,[0,-o-n.bottom]),L=k(H,P,.17),V=k(H,P,.83),O=A(k(H,P),[0,-56]),E=A(L,m),x=A(V,m),b=A(O,m),W=`escher-arch-${t.tier}-${$}`,j=C=>L.map((F,q)=>(1-C)**2*F+2*(1-C)*C*O[q]+C*C*V[q]),v=[.14,.32,.5,.68,.86].map(C=>{const F=j(C),q=L.map((z,et)=>2*((1-C)*(O[et]-z)+C*(V[et]-O[et]))),X=Math.hypot(...q);return M(T([F,A(F,[q[1]*7/X,-q[0]*7/X])]),"arch-stone-joint")}).join("");return`<g class="arch-masonry" data-arch-side="${$}" data-thickness="${r}">
      ${M(`M${y}L${S} ${P} ${V}Q${O} ${L}L${H}Z`,u)}
      <defs><clipPath id="${W}"><path d="M${L}Q${O} ${V}l0,45L${A(L,[0,45])}Z"/></clipPath></defs>
      <g clip-path="url(#${W})">
        ${M(`M${L}Q${O} ${V}L${x}Q${b} ${E}Z`,"arch-intrados")}
        ${g([L,E,A(E,[0,6]),A(L,[0,6])],"arch-spring-return")}
        ${g([V,x,A(x,[0,6]),A(V,[0,6])],"arch-spring-return")}
        ${M(`M${E}Q${b} ${x}`,"arch-inner-edge")}
      </g>
      ${v}
    </g>`}const i=xt(t.tier,e,0,0),s=(d,w)=>{const m=xt(t.tier,e,d,w);return[m[0]-i[0],m[1]-i[1]]},h=a.map(d=>A(d,[0,-o-n.top])),l=h.map(d=>A(d,[0,-7])),p=t.tier==="left-middle"||t.tier==="right-lower"?`<g class="tower-intermediate-cap" data-tier="${t.tier}">
       ${g([l[0],l[1],h[1],h[0]],"stone-mid")}
       ${g([l[1],l[2],h[2],h[1]],"stone-dark")}
       ${g(l,"stone-light")}
      </g>`:g(h,"stone-light");return`<g class="escher-tier-beam" data-tier="${t.tier}">
    ${c(a[0],a[1],s(0,r),"stone-mid","front")}
    ${c(a[1],a[2],s(-r,0),"stone-dark","right")}
    ${p}
  </g>`}const It=D.origin,fe=[vt[0]-12+f.waterfallOffsetX,vt[1]+f.waterfallLandingExtension],rn=fe[0]-It[0],yr=fe[1]-It[1],on=(yr-rn*U[1])/(_[1]-U[1]),an=rn-on,pe=Y(f.pool.halfSide),nt=Y(f.pool.rimWidth),sn=Y(f.pool.sideRetraction/2),cn=an-pe.halfWidth,ln=an+pe.halfWidth-2*sn.halfWidth+f.pool.widthExpansion,hn=on-pe.halfDepth+2*sn.halfDepth,dn=gt[1]-f.lowerPierFootprint.halfDepth-f.pool.rearPierGap,br=[(cn+ln)/2,(hn+dn)/2],Mr={center:R(It,...br),minU:cn,maxU:ln,minV:hn,maxV:dn},kr=(t,e,n=0)=>R(It,t,e,n),rt=(t=0,e=0)=>{const{minU:n,maxU:o,minV:a,maxV:r}=Mr;return[[n+t*nt.halfWidth,a+t*nt.halfDepth],[o-t*nt.halfWidth,a+t*nt.halfDepth],[o-t*nt.halfWidth,r-t*nt.halfDepth],[n+t*nt.halfWidth,r-t*nt.halfDepth]].map(([c,i])=>kr(c,i,e))};function xr(){const t=f.pool.rimHeight,e=rt(0,t),n=rt(1,t),o=a=>a.join(",");return`<g id="escher-landing-pond">
    <defs><clipPath id="escher-pond-water-clip">${g(rt(1),"")}</clipPath></defs>
    ${g(rt(),"pond-water")}
    ${M(`${T(e)}Z ${T(n.toReversed())}Z`,"pond-rim",'fill-rule="evenodd"')}
    ${g([e[0],e[1],rt()[1],rt()[0]],"pond-rim-front")}
    ${g([e[1],e[2],rt()[2],rt()[1]],"pond-rim-side")}
    ${M(T(e)+"Z","pond-rim-edge")}
    <g clip-path="url(#escher-pond-water-clip)">
      ${[0,1,2].map(a=>`<g class="pond-ripple" transform="translate(${o(fe)})"><ellipse rx="18" ry="4"/></g>`).join("")}
    </g>
  </g>`}const Sr=`
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
  <pattern id="escher-brick-front" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${U[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-light)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#8d8778" stroke-width=".75" opacity=".48"/>
  </pattern>
  <pattern id="escher-brick-side" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${_[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-mid)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#625e52" stroke-width=".8" opacity=".5"/>
  </pattern>
  <pattern id="escher-roof-tiles" width="18" height="14" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${_[1]} .65 .7 0 0)">
    <rect width="18" height="14" fill="#737368"/>
    <path d="M0,0V6Q4.5,11 9,6V0M9,0V6Q13.5,11 18,6V0M-4.5,7V13Q0,18 4.5,13V7M4.5,7V13Q9,18 13.5,13V7" fill="none" stroke="#42483e" stroke-width=".9"/>
  </pattern>
  <pattern id="escher-paving" width="45" height="30" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${U[1]} -.8 ${-.8*_[1]} 0 0)">
    <rect width="45" height="30" fill="#d3cdbb"/>
    <path d="M0,0H45V30H0Z" fill="none" stroke="#a29b89" stroke-width=".8"/>
  </pattern>`,I=t=>{const e=Math.sin(t*127.1+31.7)*43758.5453;return e-Math.floor(e)};function Hr(t,e,n){const o=Array.from({length:26},(a,r)=>{const c=-e+8+I(t+r)*(e-14);return`<ellipse cx="${(I(t+r+40)-.5)*n*(.45-.4*c/e)}" cy="${c}" rx=".65" ry="1"/>`}).join("");return`<path d="M${-n/2},${-e}Q${-n*.3},${-e*.45} -4,0Q0,4 4,0Q${n*.3},${-e*.45} ${n/2},${-e}Z" class="garden-sponge"/>
    <path d="M${-n*.29},${-e+6}Q-2,${-e*.4} -1,-4M${n*.27},${-e+6}Q2,${-e*.4} 1,-4" class="garden-sponge-rib"/>
    <g class="garden-pores">${o}</g>
    <ellipse cx="0" cy="${-e}" rx="${n/2}" ry="${n*.18}" class="garden-sponge-rim"/>
    <ellipse cx="0" cy="${-e+1}" rx="${n*.36}" ry="${n*.105}" class="garden-sponge-hollow"/>`}function Wr(t,e){let n="";function o(a,r,c,i,s){const h=i*Math.PI/180,l=a+Math.cos(h)*c,p=r+Math.sin(h)*c;if(n+=`M${a},${r}Q${a+Math.cos(h+.2)*c*.5},${r+Math.sin(h+.2)*c*.5} ${l},${p}`,s)for(const d of[-34,5,39])o(l,p,c*(.52+I(t+s+d)*.1),i+d,s-1)}return o(0,0,e*.42,-90,3),M(n,"garden-coral")}function jr(t,e){return Array.from({length:4},(n,o)=>{const a=(o-1.5)*5,r=(I(t+o)-.5)*22;return M(`M${a},0C${a-12},${-e*.35} ${a+r+11},${-e*.6} ${a+r},${-e}q-7,-9 -10,0q0,6 5,4`,"garden-tendril")}).join("")}function Ar(t,e){return Array.from({length:7},(n,o)=>M(`M0,0Q${(o-3)*2},${-e*.55} ${(o-3)*4},${-e*(.55+I(t+o)*.45)}`,"garden-grass")).join("")}function Tr(t,e,n){const o=[];for(let r=0;r<55;r++)o.push({u:8+I(r)*(e-16),v:6+I(r+80)*(n-16),kind:"grass",h:15+I(r+20)*24,seed:r});[[.08,.8,104,27],[.19,.66,85,31],[.3,.9,125,34],[.42,.73,66,23],[.15,.43,75,38],[.32,.42,92,32],[.46,.48,52,27],[.09,.19,44,23],[.34,.18,58,35],[.53,.24,43,23]].forEach(([r,c,i,s],h)=>o.push({u:r*e,v:c*n,kind:"sponge",h:i,w:s,seed:100+h}));for(let r=0;r<9;r++)o.push({u:(.48+I(r+180)*.43)*e,v:(.12+I(r+190)*.65)*n,kind:"coral",h:45+I(r+200)*50,seed:200+r});for(let r=0;r<11;r++)o.push({u:(.25+I(r+220)*.65)*e,v:(.45+I(r+240)*.5)*n,kind:"curl",h:38+I(r+260)*54,seed:300+r});return`<g id="escher-garden-vegetation">${o.map(r=>({...r,xy:t(r.u,r.v)})).sort((r,c)=>r.xy[1]-c.xy[1]).map(r=>`<g class="garden-specimen" data-kind="${r.kind}" transform="translate(${r.xy.join(" ")})">${r.kind==="sponge"?Hr(r.seed,r.h,r.w):r.kind==="coral"?Wr(r.seed,r.h):r.kind==="curl"?jr(r.seed,r.h):Ar(r.seed,r.h)}</g>`).join("")}</g>`}const $t=[{id:"ridge-far-1",depth:"far",drop:25,points:[[20,72],[177,29],[282,31],[340,64],[458,30],[700,28],[920,26]]},{id:"ridge-far-2",depth:"far",drop:32,points:[[20,146],[102,121],[145,125],[145,96],[226,72],[283,81],[292,101],[379,76],[435,87],[485,59],[555,65],[578,98],[720,73],[780,77],[816,104],[920,83]]},{id:"ridge-middle-1",depth:"middle",drop:37,points:[[20,252],[91,225],[112,203],[175,183],[203,211],[272,190],[285,165],[344,155],[378,181],[443,159],[480,176],[556,142],[610,155],[644,136],[717,143],[756,167],[826,150],[920,157]]},{id:"ridge-middle-2",depth:"middle",drop:43,points:[[20,380],[75,352],[87,328],[184,280],[203,302],[270,276],[280,292],[447,233],[477,254],[579,217],[596,230],[675,199],[724,217],[920,200]]},{id:"ridge-near-1",depth:"near",drop:42,points:[[20,474],[82,438],[99,407],[185,354],[214,368],[257,345],[286,365],[341,341],[358,363],[476,317],[509,337],[612,298],[641,316],[719,281],[769,303],[920,267]]},{id:"ridge-near-2",depth:"near",drop:43,points:[[20,589],[73,558],[88,527],[158,487],[174,458],[254,405],[278,419],[302,397],[318,424]]},{id:"ridge-near-3",depth:"near",drop:41,points:[[20,690],[71,659],[82,624],[139,592],[150,553],[258,483],[272,456],[321,427]]},{id:"ridge-near-4",depth:"near",drop:36,points:[[20,785],[66,756],[75,729],[132,701],[144,668],[205,638],[220,612],[279,575]]}].map(t=>{if(t.points.at(-1)[0]!==920)return t;const e=t.points.map(a=>[...a]),[n,o]=e.slice(-2);return e.push([1160,o[1]+(1160-o[0])*(o[1]-n[1])/(o[0]-n[0])]),{...t,points:e}});function je(t,e){const n=e.findIndex((c,i)=>i<e.length-1&&t<=e[i+1][0]),o=n<0?e.length-2:n,[a,r]=e.slice(o,o+2);return a[1]+(t-a[0])/(r[0]-a[0])*(r[1]-a[1])}const B=([t,e])=>[je(t,[[20,0],[323,323],[425,381],[747,690],[920,780]]),je(e,[[20,50],[140,110],[420,303],[560,421],[800,620],[1200,925]])];function J(t,e){const n=t.points;for(let o=1;o<n.length;o++){const a=n[o-1],r=n[o];if(e>=a[0]&&e<=r[0]&&r[0]>a[0])return a[1]+(r[1]-a[1])*(e-a[0])/(r[0]-a[0])}return e<n[0][0]?n[0][1]:n.at(-1)[1]}function Pr(t){const e=$t[t],n=t?$t[t-1]:{points:[[20,20],[1160,20]],drop:0},o=Math.max(e.points[0][0],n.points[0][0]),a=Math.min(e.points.at(-1)[0],n.points.at(-1)[0]),r=[...new Set([o,a,...e.points.map(s=>s[0]),...n.points.map(s=>s[0])])].filter(s=>s>=o&&s<=a).sort((s,h)=>s-h),c=r.map(s=>[s,J(e,s)]),i=r.map(s=>[s,Math.min(J(e,s),J(n,s)+n.drop)]);return[...c,...i.toReversed()].map(B)}function fn(t,e){let n="";return t.slice(1).forEach((o,a)=>{const r=t[a],c=Math.hypot(o[0]-r[0],o[1]-r[1]);for(let i=1;i*9<e;i++){const s=i*9;n+=M(T([[r[0],r[1]+s],[o[0],o[1]+s]].map(B)),"terrace-stone-joint");for(let h=i%2?10:20;h<c;h+=24){const l=h/c,p=[r[0]+(o[0]-r[0])*l,r[1]+(o[1]-r[1])*l+s];n+=M(T([p,[p[0],p[1]+7]].map(B)),"terrace-stone-joint")}}}),n}function pn(t,e=$t){const n=e[t],o=e[t-1];let a="";for(let r=n.points[0][0]+8;r<n.points.at(-1)[0];r+=15){const c=o?J(o,r)+o.drop:20,i=J(n,r);for(let s=c+5+r%7;s<i-3;s+=10)a+=T([[r,s],[r+6,s+2]].map(B))}return M(a,"terrace-earth-hatch")}function Lr(t){const e=$t[t],n=$t[t-1];return t===0?[]:[[125,390,665],[90,325,590,855],[73,238,505,735],[58,170,368,620,830],[72,209,465,722,872],[65,155,265],[54,119,235],[47,124,223]][t].filter(a=>a<e.points.at(-1)[0]&&J(e,a)-(J(n,a)+n.drop)>18).map((a,r)=>({reference:[a,J(e,a)-6],size:(e.depth==="far"?.45:e.depth==="middle"?.6:.8)*(1+r%3*.12)}))}function un({reference:t,size:e}){const[n,o]=B(t);return`<g class="terrace-shrub" transform="translate(${n} ${o}) scale(${e})">
    <path d="M0,0L0,-13M0,-4l-6,-5m6,3l6,-6m-6,2l-4,-6m4,4l3,-7"/>
    <path d="M-6,-8q-5,-3 -2,-6q-3,-4 2,-5q0,-5 5,-3q4,-4 6,1q6,-1 4,4q4,4 -1,6q-2,5 -7,2Z" class="terrace-shrub-crown"/>
  </g>`}const Mt={roof:[[80,72],[107,80],[146,70],[122,60]],height:140,horizontalScale:.6,afterContour:2};function Vr(){const t=B([113,212])[0],e=c=>{const i=B(c);return[t+(i[0]-t)*Mt.horizontalScale,i[1]]},n=Mt.roof.map(e),o=Mt.roof.map(([c,i])=>e([c,i+Mt.height])),a=e([93.5,64]),r=e([134,53]);return`<g id="escher-terrace-tall-house" data-reference-position="upper-left">
    ${g([n[0],n[1],o[1],o[0]],"terrace-house-front")}
    ${g([n[1],n[2],o[2],o[1]],"terrace-house-side")}
    ${M(`M${n[0]}Q${a} ${n[1]}L${n[2]}Q${r} ${n[3]}Z`,"terrace-house-roof")}
    ${M(`M${n[0]}Q${a} ${n[1]}Z`,"terrace-house-front")}
    ${g([[127,88],[134,86],[134,100],[127,102]].map(e),"terrace-house-window")}
  </g>`}const Yt=Array.from({length:5},(t,e)=>{const n=360+e*100;return{drop:24+e%3*2,points:[[425,n],[650+e*11,n-70-e*2],[680+e*11,n-54-e],[870-e*5,n-115-e*3],[900+e*2,n-95-e*2],[1160,n-180+e*5]]}});function Er(){return`<defs><clipPath id="right-hillside-limit">${g([[0,0],[900,0],[900,Wt(900)-31],[0,Wt(0)-31]],"")}</clipPath></defs><g id="escher-right-hillside" clip-path="url(#right-hillside-limit)">${Yt.map((t,e)=>{const n=Yt[e-1],o=t.points.map(B),a=n?n.points.map(([i,s])=>B([i,s+n.drop])):t.points.map(([i])=>B([i,20])),r=t.points.map(([i,s])=>B([i,s+t.drop])),c=`right-hill-${e}`;return`<g class="terrace-study-middle">
      <defs><clipPath id="${c}">${g([...o,...a.toReversed()],"")}</clipPath></defs>
      ${g([...o,...a.toReversed()],"terrace-ground")}
      <g clip-path="url(#${c})">${pn(e,Yt)}</g>
      ${t.points.slice(1).map((i,s)=>{const h=t.points[s];return g([h,i,[i[0],i[1]+t.drop],[h[0],h[1]+t.drop]].map(B),i[1]>h[1]?"terrace-wall-side":"terrace-wall-front")}).join("")}
      ${fn(t.points,t.drop)}
      ${M(T(o),"terrace-study-edge")}${M(T(r),"terrace-wall-base")}
      ${[550,735,965,1100].map((i,s)=>{i+=Math.sin(e*3+s)*18;const h=J(t,i)-7;return!n||h>J(n,i)+n.drop+14?un({reference:[i,h],size:.55+e%3*.08}):""}).join("")}
    </g>`}).join("")}</g>`}function qr(){return`<g id="escher-terrace-background" data-stage="print-details">
    ${Er()}
    ${$t.map(({id:t,depth:e,drop:n,points:o},a)=>{const r=o.map(B),c=Pr(a),i=`escher-terrace-ground-${a}`,s=`escher-terrace-wall-${a}`,h=o.toReversed().map(([d,w])=>B([d,w+n])),l=o.slice(1).map((d,w)=>{const m=o[w],u=d[1]>m[1]||d[0]-m[0]<25;return g([m,d,[d[0],d[1]+n],[m[0],m[1]+n]].map(B),u?"terrace-wall-side":"terrace-wall-front")}).join(""),p=o.slice(1,-1).map(([d,w])=>M(T([[d,w],[d,w+n]].map(B)),"terrace-wall-return")).join("");return`<g data-contour="${t}" class="terrace-study-${e}">
        <defs>
          <clipPath id="${i}">${g(c,"")}</clipPath>
          <clipPath id="${s}">${g([...r,...h],"")}</clipPath>
        </defs>
        ${g(c,"terrace-ground")}
        <g class="terrace-ground-texture" clip-path="url(#${i})">${pn(a)}</g>
        ${l}${p}
        <g class="terrace-wall-texture" clip-path="url(#${s})">${fn(o,n)}</g>
        ${M(T(r),"terrace-study-edge")}
        ${M(T(h.toReversed()),"terrace-wall-base")}
        ${Lr(a).map(un).join("")}
      </g>`}).map((t,e)=>t+(e===Mt.afterContour?Vr():"")).join("")}
  </g>`}function Fr(){return`<g id="escher-landscape" aria-hidden="true">${qr()}</g>`}function Dr(){const t={origin:[530,853],height:190},e=t.height,n=it(t),o=it(Ft),a=Ft.width,r=Ft.depth,c=Ft.outline.map(([m,u])=>o(m,u)),{gateWidth:i,gateHeight:s,wallHeight:h}=D.garden,l=r-i,p=(m,u)=>o(a,l+m,-h+u),d=`M${p(0,0)}L${p(0,s*.6)}Q${p(i/2,s*1.4)} ${p(i,s*.6)}L${p(i,0)}Z`,w=[...Array.from({length:5},(m,u)=>T([p((u+1)*i/6,0),p((u+1)*i/6,s)])),...Array.from({length:7},(m,u)=>T([p(0,(u+1)*6),p(i,(u+1)*6)]))].join("");return n(60,-28,e+18),n(144,-28,40),n(144,-28,22),n(60,-28,e),`<g id="escher-foreground">
    
    <g id="escher-garden" data-building="garden-planter">
      ${g(c,"garden-soil")}
      ${Tr(o,D.garden.plantWidth,r)}
      ${g([o(0,0),o(a,0),o(a,0,-h),o(0,0,-h)],"stone-light wall-facing")}
      ${g([o(a,0),o(a,l),o(a,l,-h),o(a,0,-h)],"stone-mid wall-receding")}
      ${M(T([o(0,0),o(a,0),o(a,l)]),"garden-wall-cap")}
      <g id="escher-garden-gate" data-wall="garden-side">
        <defs><clipPath id="escher-garden-gate-clip"><path d="${d}"/></clipPath></defs>
        ${M(w,"garden-gate-grid",'clip-path="url(#escher-garden-gate-clip)"')}
        ${M(d,"garden-gate-frame")}
      </g>
    </g>
  </g>`}function ae(t,e,n,o,a){const r=[[-e,-n],[e,-n],[e,n],[-e,n]].map(([i,s])=>a?xt(a,t,i,s):R(t,i,s)),c=r.map(i=>A(i,[0,-o]));return`${g([c[0],c[1],r[1],r[0]],"stone-mid")}
    ${g([c[1],c[2],r[2],r[1]],"stone-dark")}
    ${g(c,"stone-light")}`}function Or(t,e,n,o,a){const r=e-o-2,c=f.columnRadius,i=c+2.5;return`<g class="escher-column" data-foot-y="${e}" data-cap-y="${n}" data-base-height="${o}" data-shaft-length="${r-n-15}">
    ${ae([t,e],f.columnBase.halfWidth,f.columnBase.halfDepth,o,a)}
    ${M(`M${t-c},${r}V${n+15}h${2*c}V${r}q${-c},4 ${-2*c},0Z`,"stone-light")}
    ${M(`M${t+c*.5},${n+15}V${r}`,"column-shade")}
    ${ae([t,n+17],f.columnCap.halfWidth,f.columnCap.halfDepth,12,a)}
    ${M(`M${t-i},${e-o-4}q${i},5 ${2*i},0M${t-i},${n+23}q${i},5 ${2*i},0`,"fine-line")}
  </g>`}function Cr(t,e,n){return`<g class="escher-column escher-square-pier">
    ${ae([t,e],f.lowerPierFootprint.halfWidth,f.lowerPierFootprint.halfDepth,e-n-6,"left-middle")}
  </g>`}function Ae(t,e){const{y:n,top:o,tier:a,pierBay:r}=t;if(r)return e==="rear"?"":`<g data-tower-tier="${a}" data-column-side="right">
      ${jt.map(h=>Cr(h.x,h.bottom,h.top)).join("")}
    </g>`;tt(t).corners;const c=Hn(t),i=Rn(t);return`<g data-tower-tier="${a}" data-column-side="${e}">
    ${(e==="rear"?[3,2]:[0,1]).map(h=>Or(c[h][0],c[h][1],i[h][1],f.columnBaseHeights[a],a)).join("")}
  </g>`}function Rr(t){const{center:e}=tt(t),n=t.y-t.top+31,{halfWidth:o,halfDepth:a}=f.towerEave,r=[[-o,-a],[o,-a],[o,a],[-o,a]].map(([i,s])=>xt(t.tier,e,i,s,n)),c=A(R(e,0,0,n),[0,-16]);return`<g class="escher-tower-roof" data-tower="${t.id}">
    ${g([r[0],r[1],A(r[1],[0,8]),A(r[0],[0,8])],"stone-mid")}
    ${g([r[1],r[2],A(r[2],[0,8]),A(r[1],[0,8])],"stone-dark")}
    ${g(r,"stone-light")}
    <g class="tower-ornament" transform="translate(${c.join(" ")})">
      ${$r(t.ornament)}
    </g>
  </g>`}function vr(t){const{corners:e,edges:n,center:o,entry:a,exit:r}=At(t),c=(l,p)=>k(o,l,p),i=l=>A(l,[0,-st(t.tier)]),s=l=>A(i(l),[0,f.channelWaterFreeboard]),h=[n[t.entry],n[t.exit]];return`<g class="channel-turn" data-turn="${t.tier}" data-coping-only="true">
    <g class="channel-turn-water">
      ${g(e.map(l=>s(c(l,bt))),"channel-corner-water")}
      ${h.map(([l,p])=>{const d=k(l,p,N),w=k(l,p,1-N);return g([d,w,c(w,bt),c(d,bt)].map(s),"channel-corner-water")}).join("")}
      ${Ne(`current-turn-${t.tier}`,e.map(l=>s(c(l,bt))),(l,p)=>{const d=s(a),w=s(o),m=s(r),u=d.map((S,H)=>(1-l)*(1-l)*S+2*(1-l)*l*w[H]+l*l*m[H]),$=d.map((S,H)=>2*(1-l)*(w[H]-S)+2*l*(m[H]-w[H])),y=Math.hypot(...$)||1;return[u[0]-$[1]/y*(p-.5)*9,u[1]+$[0]/y*(p-.5)*9]},t.tier==="left-upper"?1:-1,65)}
    </g>
    ${vn(t).map(l=>`<g class="channel-turn-bank">${g(l.map(i),"channel-wall-cap")}</g>`).join("")}
  </g>`}function Br(t,e){const n=Bn(t,e),o=`escher-channel-${t.id}-${e}-clip`,[a,r]=t.from,[c,i]=t.to,s=Xn(t,e),h=Bt(t,"near"),l=Bt(t,"far"),p=[...ee(t,...s.near).map(s.waterAt),...ee(t,...s.far).map(s.waterAt).toReversed()];return`<g id="escher-channel-${t.id}-${e}" data-structural-layer="channel-${t.id}-${e}" data-channel-side="${e}" data-wall-height="${s.height}">
    <defs><clipPath id="${o}"><rect x="${n.minX}" y="-1000" width="${n.maxX-n.minX}" height="3000"/></clipPath></defs>
    <g clip-path="url(#${o})" class="channel-half-artwork"${t.id===4&&e==="left"?' mask="url(#escher-landing-platform-mask)"':""}>
    <g${t.id===4?' mask="url(#escher-foundation-floor-mask)"':""}>${be(l)}${be(h)}</g>
    ${t.id===1?n.turns.map(d=>Un(t,d)).join(""):""}
    ${g([a,c,i,r].map(d=>dt(t,d)),"channel-corner-stone")}
    ${ye(l,s.heightAt)}
    <g data-water-elevation="${s.waterElevation}">
      ${g(p,"channel-corner-water")}
      ${Ne(`current-${t.id}-${e}`,p,(d,w)=>s.guideAt(k(k(...s.near,d),k(...s.far,d),w)),-1,Math.hypot(c[0]-a[0],c[1]-a[1]))}
    </g>
    ${ye(h,s.heightAt)}
    ${n.turns.map(vr).join("")}
    ${n.tailrace?`${M(T(n.tailrace),"channel-outline")}${M(T(n.tailrace),"channel-top")}${M(T(n.tailrace),"channel-water")}`:""}
    </g>
  </g>`}function Qr(t){const e=Pt.find(o=>o.tier===t),n=f.towers.find(o=>`${o.id}-upper`===t);return`<g id="escher-tier-${t}" data-structural-layer="${t}">
    ${e.pierBay?"":Ae(e,"rear")}
    ${Ae(e,"front")}
    ${wr(e)}
    ${n?Rr(e):""}
  </g>`}function Ur(){return Qn.map(t=>{if(t==="wheel")return hr();if(t.startsWith("channel-")){const[,e,n]=t.split("-");return Br(Lt.find(o=>o.id===Number(e)),n)}return Qr(t)}).join("")}const[Z,Q]=Sn,[Ot,gn]=vt,wt=gn+f.waterfallLandingExtension,Xr=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f.viewBox}" role="img" aria-labelledby="escher-svg-title escher-svg-description" class="escher-drawing">
  <title id="escher-svg-title">瀑布：水渠、水磨房与周围建筑群</title>
  <desc id="escher-svg-description">水轮下方的水渠向右后方伸展，再反复折回，最终接到左塔下方的高处落水口。瀑布从那里直落到水轮和平台上的方形水池，形成二维画面中的不可能循环。远处是带有石墙、耕地和植物的梯田，左上有一座高窄小屋；右下的横桥连接水道4和正方形方屋，桥下平台与小阶梯通向门洞旁的地面；左下是种植着杯形与枝状植物的庭院。</desc>
  <defs>${Sr}<filter id="escher-mist-soften" x="-50%" y="-70%" width="200%" height="240%"><feGaussianBlur stdDeviation="1.4"/></filter><clipPath id="escher-fall-clip"><path d="M${Z-16},${Q}Q${Z-30},${Q+24} ${Z-30},${Q+65}L${Ot-30},${wt}H${Ot+5}V${Q+60}Q${Z+5},${Q+20} ${Z+16},${Q}Z"/></clipPath>
    <mask id="escher-foundation-floor-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1000">
      <rect width="900" height="1000" fill="white"/>
      <polygon points="${Ue().map(t=>t.join(",")).join(" ")}" fill="black"/>
    </mask>
    <!-- The platform occludes the tailrace's exposed wall/floor ends at the
         landing. Apply only to channel 4, leaving wheel and columns intact. -->
    <mask id="escher-landing-platform-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="900">
      <rect width="900" height="900" fill="white"/>
      <rect x="${Ot-43}" y="${gn-27}" width="53" height="45" fill="black"/>
    </mask>
  </defs>
  <rect width="900" height="900" class="scene-paper"/>
  <g class="scene-architecture" transform="translate(0 ${f.compositionOffsetY})" stroke-linejoin="round" stroke-linecap="round">
    ${Fr()}
    ${Zn()}
    ${ke("rear")}
    ${Yn()}
    ${Ur()}
    ${ir()}
    <!-- The deck and pond sit above the bridge; only the pier feet need
         restoration here. Their upper parts retain the original layer order. -->
    <g id="escher-pool-platform-layer">
      ${_n()}${xr()}
      <defs><clipPath id="escher-pier-feet-clip"><rect x="0" y="${Math.min(...jt.map(t=>t.bottom))-18}" width="900" height="90"/></clipPath></defs>
      <use href="#escher-tier-left-lower" clip-path="url(#escher-pier-feet-clip)"/>
    </g>
    <g id="escher-fall-route" transform="translate(${f.waterfallOffsetX} 0)">
    <g id="escher-waterfall" clip-path="url(#escher-fall-clip)">
      <rect x="${Z-40}" y="${Q}" width="90" height="${wt-Q+10}" class="fall-water"/>
      ${Array.from({length:9},(t,e)=>M(`M${Z-16+e*4},${Q}Q${Z-30+e*4},${Q+30} ${Z-30+e*4},${Q+70}V${wt}`,"fall-line")).join("")}
      ${Array.from({length:13},(t,e)=>M(`M${Z-17+e*3},${Q}Q${Z-31+e*3},${Q+30} ${Z-31+e*3},${Q+70}V${wt}`,"fall-streak")).join("")}
    </g>
    ${M(`M${Z-16},${Q}l32,0`,"water-lip")}
    <g id="escher-splash" transform="translate(${Ot-12} ${wt})" aria-hidden="true">
      <g filter="url(#escher-mist-soften)">${Array.from({length:9},(t,e)=>'<g class="splash-mist"><path d="M-19,2 Q-24,-5 -13,-9 Q-17,-20 -4,-19 Q4,-28 11,-16 Q24,-17 19,-6 Q29,2 13,5Z"/></g>').join("")}</g>
      ${Array.from({length:48},(t,e)=>`<ellipse class="splash-drop" cx="${(e%4-1.5)*3}" cy="-1" rx="${.8+e%3*.25}" ry="${1.25+e%4*.25}"/>`).join("")}
    </g>
    </g>
    ${ke()}
    
    ${Dr()}
  </g>
</svg>`;document.querySelector("#escher-scene").innerHTML=Xr;fr(document.querySelector("#escher-scene"));const at=[...document.querySelectorAll('[role="tab"]')],Ir=[...document.querySelectorAll('[role="tabpanel"]')];function Te(t){for(const e of at){const n=e===t;e.setAttribute("aria-selected",String(n)),e.tabIndex=n?0:-1}for(const e of Ir)e.hidden=e.id!==t.getAttribute("aria-controls")}for(const[t,e]of at.entries())e.addEventListener("click",()=>Te(e)),e.addEventListener("keydown",n=>{let o;switch(n.key){case"ArrowRight":o=(t+1)%at.length;break;case"ArrowLeft":o=(t-1+at.length)%at.length;break;case"Home":o=0;break;case"End":o=at.length-1;break;default:return}n.preventDefault(),Te(at[o]),at[o].focus()});document.querySelector("#copyright-year").textContent=new Date().getFullYear();
