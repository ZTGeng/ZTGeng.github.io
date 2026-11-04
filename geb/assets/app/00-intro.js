import"./geb2.js";const Ce=[...document.querySelectorAll("[data-proof-case]")],Rn=[...document.querySelectorAll(".proof-result")],qn=document.querySelector("#proof-announcement");for(const t of Ce)t.addEventListener("click",()=>{const e=t.dataset.proofCase;for(const n of Ce)n.setAttribute("aria-pressed",String(n===t));for(const n of Rn)n.hidden=n.id!==`proof-${e}`;document.querySelector("#proof-prompt").hidden=!0,qn.textContent=e==="provable"?"推演已展开：证明 G 会违背系统的自洽性。详细推理位于按钮下方。":"推演已展开：G 在通常的自然数中为真，但在这个系统中不可证明。详细推理位于按钮下方。"});const Mt=Math.tan(10*Math.PI/180),Ft=Math.tan(-20*Math.PI/180),he=Math.atan(Math.sqrt(Mt/-Ft)),nn=Math.sqrt(Mt*-Ft),On=Math.sqrt(1-nn**2),vn=Math.sin(he)/On,I=Math.ceil(8);function N(t){const e=Mt-Ft;return{halfSide:t,halfWidth:t*Math.sqrt(-Ft/e),halfDepth:t*Math.sqrt(Mt/e)}}const f={viewBox:"0 0 900 800",compositionOffsetY:-6,backgroundOffsetY:-30,brickCourseHeight:I,aqueductDrop:16,waterwayDirections:{across:[1,Mt],receding:[1,Ft]},towerBay:N(37),lowerPierFootprint:{halfWidth:7.5,halfDepth:6},channelFootprint:N(50),channelWallThickness:25,channelSplitOffsets:{2:24,3:-60,4:-16},channelWallHeights:{1:{left:I,right:3*I},2:{left:5*I,right:3*I},3:{left:5*I,right:7*I},4:{left:9*I,right:7*I}},channelWaterFreeboard:2,towerBayCenterOffset:[10,-9],columnCap:N(10),columnBase:N(11.8),columnRadius:7.5,columnBaseHeights:{"right-lower":I,"left-middle":3*I,"right-upper":5*I,"left-upper":7*I},towerEave:N(54),archFrame:{...N(48),top:28,bottom:-18,crown:56},intermediateArch:{top:16,capThickness:0},waterfallOutletX:354,waterfallLandingExtension:8,waterfallOffsetX:-10,waterfallVisualShiftX:-5,pool:{halfSide:60,sideRetraction:18,widthExpansion:8,rearPierGap:2,rimWidth:3,rimHeight:3},ornamentYawDegrees:[25,35],ornamentDrop:6,wallDepth:8,doorGround:{width:150,vanishingDistance:900},wheel:{x:389,offsetX:-8,centerY:552.1089319438277,radius:64,depth:[-52*Math.cos(he),52*nn*Math.sin(he)],faceScale:vn,faceShear:0,buckets:24},mill:{origin:[157,642],width:137,depth:410/3,height:146,roofRise:68,slide:-48,referenceChannelHalfSide:42,referenceCopingHeight:31},towers:[{id:"left",x:371,y:296,top:190,ornament:0,lowerLevels:[{id:"middle",y:460,top:334},{id:"lower",y:674,top:476,pierBay:!0}]},{id:"right",x:680,y:337,top:227,ornament:1,lowerLevels:[{id:"lower",y:500,top:375}]}],millTerrace:{origin:[139,642-18*Mt],outline:[[38,-20],[276,-20],[276,82],[258,82],[258,225],[38,225]],door:{u:276,width:56,height:96},garden:{left:38,right:276,plantWidth:242,soilLeftExtension:70,soilRearExtension:65,depth:180,lift:32,wallHeight:32,gateWidth:26,gateHeight:46},platformOutline:[[-18,-36],[180,-36],[180,-20],[276,-20],[276,82],[258,82],[258,225],[-18,225]],canalSupportHeight:0,canalLowerHeight:160,canalLowerSetback:34,platformThickness:6,platformRailEdges:[0,1,2,3,4,7],platformFrontEdges:[0,1,2,3,4],height:141,heightScale:2/3,foundationPerspectiveShift:.04}},rn=([t,e])=>[1,e/t],W=rn(f.waterwayDirections.across),J=rn(f.waterwayDirections.receding);function Z(t,e,n,r=0){return[t[0]+e*W[0]+n*J[0],t[1]+e*W[1]+n*J[1]-r]}const wt=t=>Math.atan2(t[1],t[0])*180/Math.PI;wt(W),wt(J),Math.abs(wt(W)-wt(J)),180-Math.abs(wt(W)-wt(J));const L=(t,e,n=.5)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n],on=f.towers.find(t=>t.id==="left"),Bn=f.towers.find(t=>t.id==="right"),re=Bn.x-on.x,ke=({x:t,y:e})=>[t+f.towerBayCenterOffset[0],e+f.towerBayCenterOffset[1]],an=ke(on),sn=Z(an,re,0),cn=Z(sn,0,-re),de=Z(cn,re,0),Un={"left-upper":an,"right-upper":sn,"left-middle":cn,"right-lower":de},Rt=[f.wheel.x+f.wheel.depth[0]/2,f.wheel.centerY+f.wheel.depth[1]/2+f.wheel.radius],O=(Rt[1]+f.channelWallHeights[4].left-f.channelWaterFreeboard-de[1]-f.aqueductDrop)/(Rt[0]-de[0]),Se=O-J[1],U=(t,e,n,r=0)=>{const a=Z(t,e,n,r);return[a[0],a[1]+Se*n]},Qn=re*(W[1]-J[1])-5*f.brickCourseHeight-3*f.brickCourseHeight-f.wallDepth-f.intermediateArch.top-f.intermediateArch.capThickness-15-2,At=f.towers.flatMap(t=>[{...t,tier:`${t.id}-upper`},...t.lowerLevels.map(e=>({x:t.x,...e,tier:`${t.id}-${e.id}`}))]).map(t=>{const e=Un[t.tier]??ke(t),n=t.pierBay?0:f.aqueductDrop,r=[e[0],e[1]+n],a=r[1]+9,o=({"left-upper":1,"right-upper":3,"left-middle":5,"right-lower":7}[t.tier]??0)*f.brickCourseHeight,i=t.pierBay?t.top+a-t.y:r[1]-o-f.columnBaseHeights[t.tier]-17-Qn+9;return{...t,center:r,y:a,top:i}});function lt(t,e=f.towerBay){const{x:n,y:r}=t,a=t.center??ke({x:n,y:r}),{halfWidth:o,halfDepth:i}=e,s=[[-o,-i],[o,-i],[o,i],[-o,i]].map(([l,g])=>ft(t.tier,a,l,g)),[c,d,h,p]=s;return{corners:s,center:a,edges:{front:[d,c],right:[d,h],back:[h,p],left:[c,p]}}}const xe=Object.fromEntries(At.map(t=>[t.tier,lt(t,f.channelFootprint)])),dt=(t,e)=>xe[t].edges[e],ot=t=>L(...t),fe=N(f.mill.referenceChannelHalfSide),Yn=ot(lt(At.find(t=>t.tier==="left-upper"),fe).edges.front).map((t,e)=>e===1?t-f.channelWallHeights[1].left+f.channelWaterFreeboard:t);function Xn(t){return lt(t).corners.map(e=>[e[0],e[1]-Jt(t.tier)])}const Gn=lt(At.find(t=>t.tier==="left-middle")).edges.right.map(([t,e])=>({x:t,top:e+f.wallDepth-5})),ln=dt("right-upper","front"),hn=dt("left-middle","back"),qt=dt("right-lower","front"),pe=ot(ln).map((t,e)=>ot(hn)[e]-t),Zn=ot(qt),Ve=(Rt[0]-Zn[0])/pe[0],dn=qt.map(t=>[t[0]+pe[0]*Ve,t[1]+pe[0]*Ve*O]),_t=t=>qt[0][1]+(t-qt[0][0])*O;ot(dn).map((t,e)=>e===1?t-f.channelWallHeights[4].left+f.channelWaterFreeboard:t);Rt[0],_t(Rt[0])-f.channelWallHeights[4].left;const Fe=Z(At.find(t=>t.tier==="right-lower").center,fe.halfWidth,-fe.halfDepth),In=t=>Fe[1]+(t-Fe[0])*J[1],zt=[f.waterfallOutletX,In(f.waterfallOutletX)-f.mill.referenceCopingHeight],_n=f.millTerrace.origin[1]+(f.waterfallOutletX-f.millTerrace.origin[0])*W[1],Tt=_n-zt[1],zn=f.mill.origin[1]-Tt,ge={...f.mill,recedingSlope:O,origin:Z([f.mill.origin[0],zn],0,f.mill.slide)},ht={...f.millTerrace,recedingSlope:O,origin:Z([f.millTerrace.origin[0],f.millTerrace.origin[1]-Tt],0,f.mill.slide),referenceHeight:f.millTerrace.height+Tt,height:(f.millTerrace.height+Tt)*f.millTerrace.heightScale,heightReduction:(f.millTerrace.height+Tt)*(1-f.millTerrace.heightScale)},Nn=-f.channelFootprint.halfWidth*f.channelWallThickness/(2*f.channelFootprint.halfSide),gt=Gn.map(t=>({...t,bottom:_t(t.x)+Nn*(W[1]-O)-f.channelWallHeights[4].left})),Re=Z(At.find(t=>t.tier==="right-lower").center,f.channelFootprint.halfWidth,-f.channelFootprint.halfDepth),Jn=t=>Re[1]+(t-Re[0])*J[1]-f.mill.referenceCopingHeight,Kn=[gt[0].x,Jn(gt[0].x)],yt=Kn.map((t,e)=>t-ht.origin[e]),Ot=(()=>{const t=(yt[1]-W[1]*yt[0])/(J[1]-W[1]);return[yt[0]-t,t]})(),qe=(yt[1]-W[1]*yt[0])/(O-W[1]),Oe=[yt[0]-qe,qe],tr=[Oe[0]+f.lowerPierFootprint.halfWidth-(Ot[1]-Oe[1]),Ot[1]],Wt=ht.platformOutline.map(([t,e],n)=>[t,n===4||n===5?Ot[1]:e]),A={...ht,door:{...ht.door,v:(Wt[3][1]+Wt[4][1]-ht.door.width)/2},outline:[[ht.garden.left,Wt[3][1]],...Wt.slice(3,7),[ht.garden.left,225]],platformOutline:Wt},fn=t=>f.millTerrace.foundationPerspectiveShift*Math.max(0,A.outline[2][1]-t),Nt=t=>Math.max(0,Math.min(1,t)),oe=(t,e,n=0)=>{const r=A,a=U(r.origin,t,e,n);return a[0]+=fn(e)*Nt((t-r.outline[0][0])/(r.door.u-r.outline[0][0]))*Nt(-n/r.height),a},X=A.garden,ae=A.outline[1],er=A.outline[0][0],Qt=ae[0]-er,nr=U(A.origin,...ae,-A.height+X.lift);oe(...ae,-A.height+X.lift);const z={origin:U(nr,-Qt,-X.depth),width:Qt,depth:X.depth,backV:ae[1],soilLeft:-X.soilLeftExtension,outline:[[-X.soilLeftExtension,0],[Qt,0],[Qt,X.depth],[0,X.depth],[0,X.depth+X.soilRearExtension],[-X.soilLeftExtension,X.depth+X.soilRearExtension]]},rr=(t,e,n=0)=>{const r=U(z.origin,t,e,n),a=z.backV-z.depth+e;return r[0]+=fn(a)*Nt(t/z.width)*Nt(1-(X.lift+n)/A.height),r},ve=(t,e,n,r)=>t.flatMap((a,o)=>{const i=t[(o+1)%t.length],s=r*(a[e]-n)>=-1e-9,c=r*(i[e]-n)>=-1e-9,d=()=>L(a,i,(n-a[e])/(i[e]-a[e]));return s&&c?[i]:s?[d()]:c?[d(),i]:[]}),or=ge.origin[0]-A.origin[0]+ge.width,ar=ve(ve(A.platformOutline,0,or,1),1,Ot[1],-1),se=[{id:1,fromTier:"left-upper",toTier:"right-upper",from:dt("left-upper","right"),to:dt("right-upper","left"),turns:[{tier:"left-upper",entry:"right",exit:"front"}]},{id:2,fromTier:"right-upper",toTier:"left-middle",from:ln,to:hn,turns:[{tier:"right-upper",entry:"left",exit:"front"}]},{id:3,fromTier:"left-middle",toTier:"right-lower",from:dt("left-middle","right"),to:dt("right-lower","left"),turns:[{tier:"left-middle",entry:"back",exit:"right"}]},{id:4,fromTier:"right-lower",from:qt,to:dn,turns:[{tier:"right-lower",entry:"left",exit:"front"}]}],sr={"left-upper":{entry:"right",exit:"front",heights:[f.channelWallHeights[1].left,f.channelWallHeights[1].left]},"right-upper":{entry:"left",exit:"front",heights:[f.channelWallHeights[1].right,f.channelWallHeights[2].right]},"left-middle":{entry:"back",exit:"right",heights:[f.channelWallHeights[2].left,f.channelWallHeights[3].left]},"right-lower":{entry:"left",exit:"front",heights:[f.channelWallHeights[3].right,f.channelWallHeights[4].right]}};function Jt(t,e){const[n,r]=sr[t].heights;return(n+r)/2}function ft(t,e,n,r,a=0){const o=Z(e,n,r,a);return[o[0],o[1]+(t==="right-lower"?Se*r:0)]}function ir(t){return lt(t).corners.map(e=>[e[0],t.top+e[1]-t.y])}function cr(t){const e=[0,f.channelWallThickness/(2*f.channelFootprint.halfSide),1-f.channelWallThickness/(2*f.channelFootprint.halfSide),1],n={front:"1,0",right:"2,1",back:"1,2",left:"0,1"},r=new Set(["1,1",n[t.entry],n[t.exit]]),a=new Map;for(let h=0;h<3;h++)for(let p=0;p<3;p++){if(r.has(`${h},${p}`))continue;const l=[[h,p],[h+1,p],[h+1,p+1],[h,p+1]];l.forEach((g,y)=>{const m=l[(y+1)%4],u=`${g}:${m}`,w=`${m}:${g}`;a.has(w)?a.delete(w):a.set(u,[g,m])})}const{corners:[o,i,,s]}=xe[t.tier],c=([h,p])=>o.map((l,g)=>l+e[h]*(i[g]-o[g])+e[p]*(s[g]-o[g])),d=[];for(;a.size;){const h=a.values().next().value[0],p=[];let l=h;do{p.push(l);const g=[...a.entries()].find(([,[y]])=>String(y)===String(l));a.delete(g[0]),l=g[1][1]}while(String(l)!==String(h));d.push(p.map(c))}return d}function vt(t){const e=xe[t.tier];return{...e,entry:ot(e.edges[t.entry]),exit:t.tail??ot(e.edges[t.exit])}}function lr(t,e){const n=(ot(t.from)[0]+ot(t.to)[0])/2+(f.channelSplitOffsets[t.id]??0),r=.8;return{...t,side:e,cutX:n,minX:e==="left"?-1e3:n-r,maxX:e==="left"?n+r:2e3,turns:t.turns.filter(a=>(vt(a).center[0]<n?"left":"right")===e),tailrace:e==="left"?t.tailrace:void 0}}const hr=["channel-4-left","wheel","left-lower","channel-2-left","channel-3-left","left-middle","channel-1-left","left-upper","channel-3-right","channel-4-right","right-lower","channel-1-right","channel-2-right","right-upper"],$=(t,e)=>`<polygon points="${t.map(n=>n.join(",")).join(" ")}" class="${e}"/>`,M=(t,e,n="")=>`<path d="${t}" class="${e}" ${n}/>`,H=t=>t.map(([e,n],r)=>`${r?"L":"M"}${e},${n}`).join(" "),E=(t,e,n=1)=>[t[0]+e[0]*n,t[1]+e[1]*n];function ue(t,e,n=23){const r=Math.ceil(Math.hypot(e[0]-t[0],e[1]-t[1])/16);let a="";for(let o=0;o<=r;o++){const i=t[0]+(e[0]-t[0])*o/r,s=t[1]+(e[1]-t[1])*o/r;a+=`M${i},${s}v${-n-3}`}return`<g class="terrace-railing">${M(`M${t[0]},${t[1]-n}L${e[0]},${e[1]-n}M${t[0]},${t[1]-6}L${e[0]},${e[1]-6}${a}`,"railing-line")}</g>`}const et=f.channelWallThickness/(2*f.channelFootprint.halfSide),jt=1-2*et,me=24,Ct=(t,e)=>Array.from({length:me+1},(n,r)=>L(t,e,r/me)),Xt=f.brickCourseHeight,Vt=29,$e=[1/3,2/3];function kt(t,e){const[n,r]=t.from,a=t.to[0],o=a.map((l,g)=>l-n[g]),i=r.map((l,g)=>l-n[g]),s=e.map((l,g)=>l-n[g]),c=t.to[1].map((l,g)=>l-a[g]-r[g]+n[g]),d=o[0]*i[1]-o[1]*i[0];let h=(s[0]*i[1]-s[1]*i[0])/d,p=(o[0]*s[1]-o[1]*s[0])/d;for(let l=0;l<6;l++){const g=n.map((w,b)=>w+h*o[b]+p*i[b]+h*p*c[b]-e[b]),y=o.map((w,b)=>w+p*c[b]),m=i.map((w,b)=>w+h*c[b]),u=y[0]*m[1]-y[1]*m[0];h-=(g[0]*m[1]-g[1]*m[0])/u,p-=(y[0]*g[1]-y[1]*g[0])/u}return{t:h,v:p}}function St(t,e){if(typeof e=="number"){const a=L(...t.from),o=L(...t.to);e=L(a,o,(e-a[0])/(o[0]-a[0]))}const n=kt(t,e).t,r=Math.min(2,Math.max(0,Math.floor((n+1e-9)*3)));return Xt*(e.course??2*t.id-1+r)}function ut(t,e){return[...e]}const pn=(t,e)=>E(ut(t,e),[0,-St(t,e)]);function dr(t,e,n){const r=kt(t,e).t,a=kt(t,n).t,o=$e.map((s,c)=>({s:(s-r)/(a-r),course:2*t.id-1+c})).filter(({s})=>Number.isFinite(s)&&s>1e-8&&s<1-1e-8),i=Ct(e,n).map((s,c)=>({p:s,s:c/me})).filter(({s})=>!o.some(c=>Math.abs(s-c.s)<1e-8));return o.forEach(({s,course:c})=>{const d=a>r?c:c+1,h=a>r?c+1:c;i.push({s,p:Object.assign(L(e,n,s),{course:d})},{s,p:Object.assign(L(e,n,s),{course:h})})}),i.sort((s,c)=>s.s-c.s).map(({p:s})=>s)}function Kt(t,e){const n=e==="near"?et:1-et,r=e==="near"?0:1,a=t.from[r],o=t.to[r],i=L(...t.from,n),s=L(...t.to,n),c=(g,y,m,u)=>{if(!y){if(t.id===4){const P=-24*(t.to[0][1]-t.from[0][1])/(t.to[0][0]-t.from[0][0]);return[E(m,[-24,P]),E(u,[-24,P])]}return[m,u]}const w=se.flatMap(k=>k.turns).find(k=>k.tier===y),b=vt(w),x=(k,P)=>Math.hypot(k[0]-P[0],k[1]-P[1])<1e-7,T=[w.entry,w.exit].find(k=>b.edges[k].every(P=>g.some(j=>x(j,P))))===w.entry?w.exit:w.entry,F=b.edges[T].some(k=>x(k,m))?et:1,V=L(...g),S=b.center.map((k,P)=>2*F*(k-V[P]));return[E(m,S),E(u,S)]},[d,h]=c(t.from,t.fromTier,a,i),[p,l]=c(t.to,t.toTier,o,s);if(t.fromTier==="left-upper"&&e==="far"){const g=t.turns.find(b=>b.tier==="left-upper"),{corners:[y,m,,u],center:w}=vt(g);return{bank:e,segment:t,outer:[y,u,a,o,p],inner:[L(y,m,et),L(w,u,jt),i,s,l]}}return{bank:e,segment:t,outer:[d,a,o,p],inner:[h,i,s,l]}}function Be(t,e){const n=typeof e=="function"?e:()=>e,r=m=>t.segment?pn(t.segment,m):E(m,[0,-n(m)]),a=m=>t.segment?ut(t.segment,m):m,o=m=>m.slice(1).flatMap((u,w)=>(t.segment?dr(t.segment,m[w],u):Ct(m[w],u)).slice(w?1:0)),i=o(t.outer).map(r),s=o(t.inner).map(r),c=t.outer.slice(1).map((m,u)=>Math.hypot(m[0]-t.outer[u][0],m[1]-t.outer[u][1])),d=c.slice(0,t.outer.length-3).reduce((m,u)=>m+u,0);let h=0,p="";c.forEach((m,u)=>{const w=h+m;if(m>1e-8){const b=Math.ceil((h-d)/Vt)*Vt+d;for(let x=b;x<w-1e-7;x+=Vt){const D=(x-h)/m,T=L(t.outer[u],t.outer[u+1],D),C=L(t.inner[u],t.inner[u+1],D);p+=M(H([r(T),r(C)]),"channel-joint channel-cap-joint"),t.bank!=="far"&&(p+=M(H([r(T),a(T)]),"channel-joint channel-vertical-joint"))}}h=w});let l="",g="",y="";if(t.segment){const m=t.segment;t.outer.slice(1).forEach((u,w)=>{const b=t.outer[w],x=t.inner[w],D=t.inner[w+1],T=kt(m,b).t,C=kt(m,u).t,F=[0,...$e.map(V=>(V-T)/(C-T)).filter(V=>Number.isFinite(V)&&V>1e-8&&V<1-1e-8).sort((V,S)=>V-S),1];F.slice(1).forEach((V,S)=>{const k=F[S],P=St(m,L(b,u,(k+V)/2))/Xt,j=(Y,K,at)=>r(Object.assign(L(Y,K,at),{course:P})),B=j(b,u,k),v=j(b,u,V),q=j(x,D,V),R=j(x,D,k);y+=M(H([B,v,q,R])+"Z","channel-wall-cap",'stroke="none"'),y+=M(H([B,v])+H([R,q]),"channel-coping-edge")})}),$e.forEach((u,w)=>{const b=L(t.outer.at(-3),t.outer.at(-2),u),x=L(t.inner.at(-3),t.inner.at(-2),u),D=2*m.id-1+w,T=(k,P)=>r(Object.assign([...k],{course:P})),C=[T(b,D+1),T(x,D+1)],F=[T(b,D),T(x,D)],V=C[0][0]<C[1][0]?0:1,S=m.id%2?V:1-V;l+=M(H([C[1-S],C[S],F[S]]),"channel-step-edge",`data-visible-edge="${m.id%2?"left":"right"}"`)});for(let u=1;u<2*m.id+1;u++){let w=!1,b="";o(t.outer).forEach(x=>{if(St(m,x)>u*Xt+.01){const D=E(a(x),[0,-u*Xt]);b+=`${w?"L":"M"}${D}`,w=!0}else w=!1}),b&&(g+=M(b,"channel-course-joint"))}}return`<g class="channel-side-wall" data-extended-through-turn="true" data-bank="${t.bank}" data-joint-style="${t.bank==="far"?"cap-only":"brick"}">
    ${$([...o(t.inner).map(a),...s.toReversed()],"channel-wall-inner")}
    ${$([...o(t.outer).map(a),...i.toReversed()],"channel-wall-outer")}
    ${t.segment?y:$([...i,...s.toReversed()],"channel-wall-cap")}
    ${l}<g class="channel-wall-joints">${g}${p}</g>
  </g>`}function Ue(t){const e=t.outer.map(a=>t.segment?ut(t.segment,a):a),n=t.inner.map(a=>t.segment?ut(t.segment,a):a),r=e.map(a=>E(a,[0,f.wallDepth]));return`<g class="channel-floor" data-extended-through-turn="true">
    ${$([...e,...r.toReversed()],"channel-bed-side")}
    ${$([...e,...n.toReversed()],"channel-corner-stone")}
  </g>`}function fr(t,e){const n=vt(e).corners.map(a=>ut(t,a)),r=n.map(a=>E(a,[0,f.wallDepth]));return`<g class="channel-turn-floor" data-turn="${e.tier}" data-full-turn-bed="true">
    ${$([n[0],n[1],r[1],r[0]],"channel-bed-side")}
    ${$([n[1],n[2],r[2],r[1]],"channel-bed-side")}
    ${$(n,"channel-corner-stone")}
  </g>`}function pr(t,e="left"){const[n,r]=t.from,[a,o]=t.to,i=L(...t.from)[0]<L(...t.to)[0],s=e==="left"===i?.15:.85,c=St(t,L(L(...t.from),L(...t.to),s)),d=p=>(p=Math.max(0,Math.min(1,p)),p*p*(3-2*p)),h=p=>{const{t:l,v:g}=kt(t,p),y=Jt(t.fromTier,L(...t.from,g)),m=t.toTier?Jt(t.toTier,L(...t.to,g)):f.channelWallHeights[4].left,u=(d(3*l-1)+d(3*l-2))/2,w=f.channelWaterFreeboard+2*Math.sin(Math.PI*Math.max(0,Math.min(1,l)))**2;return E(p,[0,-y-(m-y)*u+w])};return{near:[L(n,r,et),L(a,o,et)],far:[L(n,r,1-et),L(a,o,1-et)],height:c,heightAt:p=>St(t,p),waterElevation:c-f.channelWaterFreeboard,waterAt:h,guideAt:h}}const mt=t=>(e=0,n=0,r=0)=>{const a=Z(t.origin,e,n,r);return t.recedingSlope!==void 0&&(a[1]+=n*(t.recedingSlope-f.waterwayDirections.receding[1])),a},$t=mt(A);function gr(t){const e=mt(t),{width:n,depth:r,height:a,id:o}=t;return`<g data-building="${o}">
    ${$([e(0,0,a),e(n,0,a),e(n,0),e(0,0)],"stone-light wall-facing building-front-wall")}
    ${$([e(n,0,a),e(n,r,a),e(n,r),e(n,0)],"stone-mid wall-receding building-side-wall")}
    ${$([e(0,0,a),e(n,0,a),e(n,r,a),e(0,r,a)],"terrace-floor building-roof-plane")}
  </g>`}function we(t,e,n,r,a,o,i="u"){const s=(c,d)=>t(e+(i==="u"?c:0),n+(i==="v"?c:0),r+d);return`<g>${$([s(0,0),s(a,0),s(a,o),s(0,o)],"window-dark")}
    ${M(H([s(-3,o+3),s(a+3,o+3)]),"window-frame")}
    ${M(H([s(-3,-2),s(a+3,-2)]),"window-frame")}
    ${M(H([s(a/2,0),s(a/2,o)]),"window-frame")}</g>`}function gn(t,e,n,r,a,o,i="u"){const s=(c,d)=>t(e+(i==="u"?c:0),n+(i==="v"?c:0),r+d);return M(`M${s(0,0)}L${s(0,o*.6)}Q${s(a/2,o*1.4)} ${s(a,o*.6)}L${s(a,0)}Z`,"window-dark")}function un(t,e,n,r,a,o){const i=(s,c=!1,d=!1,h=!1)=>t(e[0]+(s+(c?1:0))*r[0]+(d?n[0]:0),e[1]+(s+(c?1:0))*r[1]+(d?n[1]:0),e[2]-(s+(h?1:0))*a);return`<g class="stone-stairs">${Array.from({length:o},(s,c)=>{const d=o-1-c;return`${$([i(d,!0),i(d,!0,!0),i(d,!0,!0,!0),i(d,!0,!1,!0)],"stone-mid stair-riser")}
      ${$([i(d),i(d,!1,!0),i(d,!0,!0),i(d,!0)],"stone-light stair-tread")}`}).join("")}</g>`}function ur(){const{outline:t,height:e}=A,[n,r]=t,a=oe;return[a(...n),a(...r),a(r[0],r[1],-e),a(n[0],n[1],-e)]}function mr(){const{outline:t,height:e}=A,[n,r]=t.slice(1,3),a=oe;return[a(...n),a(...r),a(r[0],r[1],-e),a(n[0],n[1],-e)]}function mn(){const{door:t,outline:e,height:n}=A,{width:r,vanishingDistance:a}=f.doorGround,o=e[2][1],i=-1400,s=c=>r*(1+(o-c)/a);return{u:t.u,endV:o,startV:i,ground:-n,widthAt:s,rightU:c=>t.u+s(c)}}function $r(){const{u:t,endV:e,startV:n,ground:r,widthAt:a,rightU:o}=mn(),i=(h,p)=>$t(h,p,r),s=[[t,n],[o(n),n],[o(e),e],[t,e]].map(([h,p])=>i(h,p)),c=[0,.3,.6,.9,1].map(h=>M(H([i(t+h*a(e),e),i(t+h*a(n),n)]),"door-ground-grid")),d=[];for(let h=0;h<24;h++){const p=1/(1-h*.04),l=e-f.doorGround.vanishingDistance*(p-1);if(l<n)break;d.push(M(H([i(t,l),i(o(l),l)]),"door-ground-grid"))}return`<g id="escher-door-ground">${$(s,"ground-plane terrace-floor mill-door-ground")}
    <defs><clipPath id="escher-door-ground-grid-clip">${$(s,"")}</clipPath></defs>
    <g clip-path="url(#escher-door-ground-grid-clip)">${c.join("")}${d.join("")}</g>
  </g>`}function wr(t){const{height:e}=A,{u:n,endV:r,startV:a,rightU:o}=mn(),i=o(r),s=6,c=-e,d=c-900,h=$t(n,r,c)[1]-t[1],p=c+h,l=(g,y,m)=>$t(g,y,m);return`<g id="escher-door-ground-walls">
    <g id="escher-door-ground-upper-wall">
      ${$([l(n,r,p),l(i,r,p),l(i,r,c),l(n,r,c)],"stone-light wall-facing door-ground-upper-face")}
      ${$([l(n,r,p),l(i,r,p),l(o(r+s),r+s,p),l(n,r+s,p)],"stone-light door-ground-upper-cap")}
    </g>
    <g id="escher-door-ground-right-wall">
      ${$([l(o(r+s)+s,r+s,p),l(o(a)+s,a,p),l(o(a)+s,a,d),l(o(r+s)+s,r+s,d)],"stone-mid wall-receding door-ground-right-face")}
      ${M(H([l(o(r+s),r+s,p),l(o(r+s)+s,r+s,p),l(o(r+s)+s,r+s,d),l(o(r+s),r+s,d)])+"Z","stone-mid wall-receding door-ground-right-return",'stroke="none"')}
      ${M(H([l(o(r+s)+s,r+s,p),l(o(r+s)+s,r+s,d)]),"door-ground-right-outer-edge",'fill="none"')}
      ${$([l(o(r+s),r+s,p),l(o(a),a,p),l(o(a)+s,a,p),l(o(r+s)+s,r+s,p)],"stone-light door-ground-right-cap")}
    </g>
  </g>`}function yr(){const{outline:t,height:e,platformOutline:n,platformThickness:r,door:a}=A,o=oe,i=t.map((h,p)=>{const l=t[(p+1)%t.length];if(l[0]<=h[0]&&l[1]<=h[1]||l[1]===h[1])return"";if(p===3){const g=se[3],y=Kt(g,"near").outer.reduce((q,R)=>q[0]>R[0]?q:R),m=ut(g,y).map((q,R)=>q+(R===1?f.wallDepth:0)),u=o(...h)[0],w=[u,m[1]+(u-m[0])*O],b=A.canalSupportHeight,{canalLowerHeight:x,canalLowerSetback:D}=A,T=[w[0],w[1]+b],C=[m[0],m[1]+b],F=T.map((q,R)=>(q+C[R])/2+50*(R===0?1:O)),V=D*f.channelFootprint.halfDepth/f.channelFootprint.halfWidth,S=U(F,D,0),k=U(C,D,V),P=U(C,-80,V),j=U(C,-80,0),B=[F,S,k,P,j,C],v=q=>[q[0],q[1]+x];return`<g id="escher-canal-two-storey">
        ${$([k,P,v(P),v(k)],"stone-light wall-facing mill-canal-lower-corner")}
        ${$([S,k,v(k),v(S)],"stone-mid wall-receding mill-canal-lower-wall")}
        ${$([F,S,v(S),v(F)],"stone-light wall-facing mill-canal-lower-return")}
        ${$(B,"ground-plane terrace-floor mill-canal-lower-roof")}
        <g id="escher-canal-lower-railing-rear">${ue(k,P,22)}</g>
        ${b>0?$([w,m,C,T],"stone-mid wall-receding building-side-wall mill-foundation-right-wall mill-canal-support-wall"):""}
        <g id="escher-canal-lower-railing">${ue(U(k,0,-80),k,22)}</g>
      </g>`}return $([o(...h),o(...l),o(l[0],l[1],-e),o(h[0],h[1],-e)],"stone-mid wall-receding building-side-wall mill-foundation-right-wall")}).reverse().join(""),s=t.flatMap((h,p)=>{const l=t[(p+1)%t.length];return l[1]===h[1]&&l[0]>h[0]?[h,l]:[]}),c=$([...s.map(h=>o(...h)),...s.toReversed().map(h=>o(h[0],h[1],-e))],"stone-light wall-facing mill-foundation-front-wall"),d=n.map((h,p)=>{const l=n[(p+1)%n.length];return l[0]<=h[0]&&l[1]<=h[1]?"":$([o(...h),o(...l),o(l[0],l[1],-r),o(h[0],h[1],-r)],"mill-platform-rim")}).join("");return`<g id="escher-mill-foundation" data-building="mill-foundation">
    ${i}${c}
    <g id="escher-foundation-door" data-wall="right">${gn(o,a.u,a.v,-e,a.width,a.height,"v")}</g>
    <g id="escher-mill-platform">${d}${$(n.map(h=>o(...h)),"ground-plane terrace-floor")}</g>
  </g>`}function br(){return`<g id="escher-mill-right-platform">${$(ar.map(t=>$t(...t)),"ground-plane terrace-floor mill-right-platform-surface")}</g>`}function Qe(t="front"){const e=$t,n=A.platformOutline,r=n.map((a,o)=>({a,b:o===4?tr:n[(o+1)%n.length],i:o})).filter(({i:a})=>t==="front"?A.platformFrontEdges.includes(a):!A.platformFrontEdges.includes(a));return`<g id="escher-mill-balcony${t==="rear"?"-rear":""}">
    ${r.map(({a,b:o,i})=>`<g data-platform-edge="${i}">${M(H([e(...a),e(...o)]),"balcony-edge")}${A.platformRailEdges.includes(i)?ue(e(...a),e(...o),24):""}</g>`).join("")}
    ${t==="front"?[50,86,122,158].map(a=>M(H([e(a,-36,-6),e(a,-20,-20),e(a+11,-36,-6)]),"balcony-bracket")).join(""):""}
  </g>`}function Mr(){const t=ge,{width:e,depth:n,height:r,roofRise:a}=t,o=mt(t),i=mt({...t,recedingSlope:f.waterwayDirections.receding[1]}),s=d=>r+a*(1-Math.abs(2*d/e-1)),c=(d,h)=>{const p=s(d),l=p+55;return`${$([o(d-9,h-5,p),o(d+9,h-5,p),o(d+9,h-5,l),o(d-9,h-5,l)],"stone-mid")}
      ${$([o(d+9,h-5,p),o(d+9,h+5,p),o(d+9,h+5,l),o(d+9,h-5,l)],"stone-dark")}
      ${$([o(d-12,h-8,l),o(d+12,h-8,l),o(d,h,l+14)],"roof-dark")}
      ${$([o(d+12,h-8,l),o(d+12,h+8,l),o(d,h,l+14)],"roof-dark")}`};return`<g id="escher-mill" data-building="mill">
    ${$([o(0,0),o(0,n),o(0,n,r),o(0,0,r)],"stone-mid")}
    ${$([o(0,0),o(e,0),o(e,0,r),o(e/2,0,r+a),o(0,0,r)],"stone-light wall-facing building-front-wall")}
    ${$([o(e,0),o(e,n),o(e,n,r),o(e,0,r)],"stone-mid wall-receding building-side-wall")}
    ${$([i(e/2,0,r+a),i(e/2,n,r+a),i(e,n,r),i(e,0,r)],"roof-dark")}
    ${M(H([i(-8,0,r),i(e/2,0,r+a+5),i(e/2,n,r+a+5),i(e+8,n,r)]),"roof-edge")}
    ${M(H([o(e/2,0,r+a+5),o(e+7,0,r)]),"roof-edge")}
    ${c(70,15)}
    ${we(o,24,0,38,29,45)}
    <g class="mill-front-door">${$([o(80,0),o(109,0),o(109,0,76),o(80,0,76)],"window-dark")}</g>
  </g>`}const Le=se[3],kr=Kt(Le,"near").outer,[Yt,Ye]=kr.slice(1,3),Xe=525,$n=[Xe,Yt[1]+(Xe-Yt[0])*(Ye[1]-Yt[1])/(Ye[0]-Yt[0])],xt=pn(Le,$n),Sr=45-2*Vt/Math.hypot(1,O),xr=U(xt,0,Sr),Lt=28,Lr=gt[0].x-xt[0],He=(Lr+Lt)/2,Hr=25,Pr=-83-Hr,Ut=-St(Le,$n)-f.wallDepth,Ar=Ut-Pr,Wr=(t,e)=>{const n=t[0]-xt[0],a=(t[1]-xt[1]+e-n*W[1])/(O-W[1]);return[n-a,a]},Tr=15+Ar,jr=U(A.origin,A.door.u,A.door.v+A.door.width,-A.referenceHeight+Tr),Er=Wr(jr,Ut),wn=Er[1],Dr=.5,Cr=Lt+8-(Lt+8-wn)*Dr,te=$t(A.door.u,A.outline[2][1],-A.height),Ge=U(xt,0,Cr,Ut);te[0],Ge[1]+(te[0]-Ge[0])*W[1];const Ze=U(xt,0,wn,Ut),Ie=[te[0],Ze[1]+(te[0]-Ze[0])*W[1]],Vr=[Ie[0],Ie[1]-A.heightReduction],ye=(Lt-He)*1.08*1.15,Fr=N(ye/(2*N(1).halfDepth)),_e=(He+Lt)/2,Pe={recedingSlope:O,origin:xr,frontV:He,backV:Lt,end:150,deck:-f.brickCourseHeight,ground:Ut,edgeHeight:f.brickCourseHeight,edgeThickness:6,archStart:0,archHeight:56,houseMinV:_e-ye/2,houseMaxV:_e+ye/2,houseWidth:2*Fr.halfWidth,houseRoof:6,houseBottom:-420,houseLeftShift:8,houseLift:12,houseScreenOffset:[14,-40],cornerStep:{height:f.brickCourseHeight/2,width:Vt/Math.hypot(1,O),run:12},groundWallTopReference:Vr};function Rr(){const t=Pe,e=mt(t),n=t.deck,r=t.ground,a=e(t.end-t.houseLeftShift,t.houseMinV,t.houseBottom+t.houseLift),o={id:"bridge-square-house",recedingSlope:O,origin:a.map((u,w)=>u+t.houseScreenOffset[w]),width:t.houseWidth,depth:t.houseMaxV-t.houseMinV,height:t.houseRoof-t.houseBottom},i=mt(o),s=u=>Et.longEnd[1]+(u-Et.longEnd[0])*(W[1]+Et.longRise/Et.longRun)+18,d=2*(s(i(35,0)[0])+9*W[1]-754),h=s(i(35,0)[0])+13*W[1]-d,p=d/10,l=d/3,g=(o.width-64)/2-22,y=[35,73].map(u=>{const w=u+g,b=26,x=w-b/2,D=s(i(w,0)[0]),T=s(i(u,0)[0])+b/2*W[1]-h-l-(u-35)*W[1],C=i(x,0)[1]-D,F=(V,S)=>i(x+V,0,C+S);return`<g data-door-height="${T}" data-arch-rise="${p}" data-door-center="${w}" data-door-crown="${i(w,0,C+T)[1]}">${M(`M${F(0,0)}L${F(0,T-p)}Q${F(b/2,T+p)} ${F(b,T-p)}L${F(b,0)}Z`,"window-dark")}</g>`}).join(""),m=(u,w,b,x=!0)=>`<g class="bridge-raised-edge">
    ${x?$([e(0,u,n+t.edgeHeight),e(t.end,u,n+t.edgeHeight),e(t.end,u,n),e(0,u,n)],b):""}
    ${$([e(0,u,n+t.edgeHeight),e(t.end,u,n+t.edgeHeight),e(t.end,w,n+t.edgeHeight),e(0,w,n+t.edgeHeight)],"stone-light")}
    ${$([e(0,w,n+t.edgeHeight),e(t.end,w,n+t.edgeHeight),e(t.end,w,n),e(0,w,n)],b)}
  </g>`;return`<g id="escher-cross-bridge-complex">
    <g id="escher-cross-bridge">
      ${$([[0,t.frontV],[t.end,t.frontV],[t.end,t.backV],[0,t.backV]].map(u=>e(...u,n)),"stone-light bridge-deck")}
      ${m(t.backV,t.backV-t.edgeThickness,"stone-mid wall-facing")}
      <g id="escher-bridge-corner-step">
        ${[t.backV-t.edgeThickness-t.cornerStep.width,t.backV-t.edgeThickness].map((u,w)=>$([e(0,u,n+t.cornerStep.height),e(t.cornerStep.run,u,n+t.cornerStep.height),e(t.cornerStep.run,u,n),e(0,u,n)],w?"stone-mid":"stone-light")).join("")}
        ${un(e,[0,t.backV-t.edgeThickness-t.cornerStep.width,n+t.cornerStep.height],[0,t.cornerStep.width],[t.cornerStep.run,0],t.cornerStep.height,1)}
      </g>
      ${m(t.frontV,t.frontV+t.edgeThickness,"stone-light wall-facing",!1)}
      ${$([e(0,t.frontV,n+t.edgeHeight),e(t.end,t.frontV,n+t.edgeHeight),e(t.end,t.frontV,r),e(0,t.frontV,r)],"stone-light wall-facing bridge-front-wall")}
      <g id="escher-bridge-arch">${gn(e,t.archStart,t.frontV,r,28,t.archHeight)}
        ${M(`M${e(t.archStart+4,t.frontV,r)}L${e(t.archStart+4,t.frontV,r+t.archHeight*.6)}Q${e(t.archStart+16,t.frontV,r+t.archHeight*1.27)} ${e(t.archStart+28,t.frontV,r+t.archHeight*.6)}`,"bridge-arch-intrados")}
      </g>
      <g id="escher-bridge-small-window">${we(e,90,t.frontV,t.deck-34,14,18)}</g>
    </g>
    ${`<g id="escher-bridge-house">${gr(o)}${we(i,22,0,o.height-90,22,32)}<g id="escher-house-stair-doors" transform="translate(20 0)">${y}</g></g>`}
  </g>`}const Ae=(()=>{const t=Pe,e=[...t.groundWallTopReference],n=A.outline[2][0]-A.outline[3][0],r=[e[0]-n,e[1]-n*O],a=U(t.origin,0,t.frontV,t.ground),o=[e[0],a[1]+(e[0]-a[0])*O],i=60/Math.hypot(...W),s=[a[0]+i,a[1]+i*W[1]],c=(r[1]-s[1]-W[1]*(r[0]-s[0]))/(O-W[1]),d=[s[0]+c,s[1]+c*O];return[r,e,o,a,s,d]})();function qr(){const t=Ae;return`<g id="escher-replacement-platform">
    ${t.map((e,n)=>{const r=t[(n+1)%t.length];return $([e,r,[r[0],r[1]+1],[e[0],e[1]+1]],"stone-mid")}).join("")}
    ${$(t,"ground-plane terrace-floor")}
  </g>`}const Et=(()=>{const[t,e,,,n,r]=Ae,a=(e[1]-n[1]-W[1]*(e[0]-n[0]))/(O-W[1]),o=[n[0]+a,n[1]+a*O],i=A,s=$t(i.door.u,i.outline[2][1],-i.height);return{shortStart:r,split:o,longEnd:n,rise:s[1]-e[1],shortCount:6,shortRun:9,longCount:26,longRun:12,longRise:9}})();function ze(t=!1){const e=Et,n=t?e.split:e.shortStart,r=t?e.longEnd:e.split,a=t?e.longCount:e.shortCount,o=t?e.longRun:e.shortRun,i=t?e.longRise:e.rise/a,s=r.map((l,g)=>l-n[g]),c=(l,g,y)=>[l,g-y],d=(l,g=0,y=0)=>[n[0]+l*o+s[0]*g,n[1]+l*o*W[1]+s[1]*g+(l+y)*i],h=l=>{const g=[d(0,l)];for(let y=0;y<a;y++)g.push([d(y+1,l)[0],d(y+1,l)[1]-i],d(y+1,l));return g.push([n[0]+s[0]*l,n[1]+s[1]*l+a*i]),g},p=h(0);if(!t){const l=Ae[0];p.unshift(l),p.push([l[0],l[1]+e.rise])}return`<g id="escher-platform-${t?"long":"short"}-stairs">
  ${$(h(1),"stone-light wall-facing stair-side-far")}
  ${un(c,[...n,0],s,[o,o*W[1]],i,a)}
  ${$(p,"stone-light wall-facing stair-side-near")}
 </g>`}function yn(t,e,n,r,a=300){const o=Math.max(3,Math.round(a/66)),i=[.17,.35,.53,.72,.86];return`<g class="channel-current" data-current-direction="${r}">
    <defs><clipPath id="${t}">${$(e,"")}</clipPath></defs>
    <g clip-path="url(#${t})">
      ${i.map((s,c)=>{const d=Array.from({length:49},(p,l)=>{const g=l/48;return n(g,s+Math.sin(g*Math.PI*7+c*1.9)*.025)}),h=61+c*13;return`<g class="current-lane" data-lane="${c}">
          ${M(H(d),"current-thread",`data-period="${h}" data-speed="${18+c*2}" stroke-dasharray="${20+c*4} 6 3 ${h-29-c*4}"`)}
          ${c%2===0?Array.from({length:o},(p,l)=>`<g class="current-ripple" data-phase="${(l+.18*Math.sin(l*3+c)+.11*c)/o}" data-speed="${20+c*1.8}"><g transform="scale(${.72+l%3*.12} .62)">
            <path d="M-2.5,-2 Q-.5,0 -2.5,2" class="current-crest"/>
            ${l%2===0?'<ellipse cx="1.5" cy=".3" rx=".8" ry=".45" class="current-foam"/>':""}
          </g></g>`).join(""):""}
        </g>`}).join("")}
    </g>
  </g>`}function Or(){return f.wheel.radius}function vr(){return f.wheel.centerY}function bn(){const{depth:t}=f.wheel;return{front:[t[0],t[1]],rear:[0,0]}}function Mn(t){const{radius:e,faceScale:n,faceShear:r}=f.wheel,a=-e+t*2*e,o=Math.sqrt(Math.max(0,e*e-a*a)),i=[o/e,a/e],s=[-a/e,o/e],c=bn();return{r:e,at:(h,p,l=0)=>{const g=i[0]*h+s[0]*l,y=i[1]*h+s[1]*l;return[g*n+c[p][0],y+g*r+c[p][1]]}}}function kn(t){const{r:e,at:n}=Mn(t);return[n(e,"rear"),n(e,"front"),n(e-6,"front"),n(e-6,"rear")]}function Sn(t){const{r:e,at:n}=Mn(t);return[n(e,"rear"),n(e,"front"),n(e,"front",1.5),n(e,"rear",1.5)]}function Br(){const{x:t,depth:e,faceScale:n,faceShear:r}=f.wheel,a=vr(),o=Or(),{rear:i}=bn(),s=f.wheel.buckets/2,c=`translate(${2*t+e[0]} 0) scale(-1 1)`,d=Array.from({length:8},(h,p)=>`<path d="M7,-3.5H${o-9}v7H7Z" transform="rotate(${p*45})" class="wheel-timber-spoke"/>`).join("");return`<g id="escher-wheel" data-structural-layer="wheel" transform="translate(${f.wheel.offsetX} 0) ${c}">
    <g transform="translate(${t} ${a})">
      <g transform="matrix(${n} ${r} 0 1 ${i[0]} ${i[1]})"><circle r="${o-2.5}" class="wheel-rear-rim" style="fill:none;stroke-width:5"/></g>
      <g id="escher-wheel-buckets">${Array.from({length:s},(h,p)=>`<g class="wheel-moving-bucket">${$(kn(p/s),"wheel-bucket-plank")}${$(Sn(p/s),"wheel-bucket-edge")}</g>`).join("")}</g>
      <g transform="matrix(${n} ${r} 0 1 ${e[0]} ${e[1]})">
        <circle r="${o-1}" class="wheel-interior"/>
        <g id="escher-wheel-rotor">
          ${d}
          <path d="M${o},0a${o},${o} 0 1 0 ${-2*o},0a${o},${o} 0 1 0 ${2*o},0 M${o-10},0a${o-10},${o-10} 0 1 1 ${-2*(o-10)},0a${o-10},${o-10} 0 1 1 ${2*(o-10)},0" fill-rule="evenodd" class="wheel-timber-rim"/>
        </g>
        <circle r="10" class="wheel-timber-hub"/><circle r="3" class="wheel-pin"/>
      </g>
    </g>
  </g>`}const ie={revolution:30,fallSpeed:260},st=(t,e)=>(t%e+e)%e;function Ur(t,e){const n=.7+t%5*.09,r=st(e+t*.137,n),o=(t%2?1:-1)*(12+t*17%32),i=-(28+t*13%34);return{x:o*r,y:i*r+62*r*r,opacity:Math.sin(Math.PI*r/n)*.8}}function Qr(t){const e=document.createElement("button");e.type="button",e.className="escher-motion-toggle",t.after(e);const n=matchMedia("(prefers-reduced-motion: reduce)");let r=n.matches,a=!1,o=0,i=null,s=0;const c=t.querySelector("#escher-wheel-rotor"),d=[...t.querySelectorAll("#escher-wheel-buckets .wheel-moving-bucket")],h=[...t.querySelectorAll(".channel-current")].flatMap(S=>[...S.querySelectorAll(".current-lane")].map(k=>{const P=k.querySelector(".current-thread"),j=P.getTotalLength(),B=Array.from({length:97},(q,R)=>P.getPointAtLength(j*R/96));return{thread:P,length:j,at:q=>{const R=Math.max(0,Math.min(96,q*96)),Y=Math.min(95,Math.floor(R)),K=R-Y;return{x:B[Y].x*(1-K)+B[Y+1].x*K,y:B[Y].y*(1-K)+B[Y+1].y*K}},direction:Number(S.dataset.currentDirection),ripples:[...k.querySelectorAll(".current-ripple")]}})),p=[...t.querySelectorAll(".fall-streak")],l=[...t.querySelectorAll(".splash-drop")],g=[...t.querySelectorAll(".splash-mist")],y=[...t.querySelectorAll(".pond-ripple ellipse")],m=t.closest('[role="tabpanel"]'),u=()=>{e.textContent=r?"播放动画":"暂停动画",e.setAttribute("aria-label",r?"播放水流与水车动画":"暂停水流与水车动画")};function w(S){c.setAttribute("transform",`rotate(${st(S/ie.revolution*360,360)})`),d.forEach((k,P)=>{const j=st(P/d.length+S/(ie.revolution/f.wheel.buckets)/d.length,1);k.children[0].setAttribute("points",kn(j).map(B=>B.join(",")).join(" ")),k.children[1].setAttribute("points",Sn(j).map(B=>B.join(",")).join(" ")),k.style.opacity=Math.min(1,j*d.length*1.5,(1-j)*d.length*1.5)}),h.forEach(({thread:k,length:P,at:j,direction:B,ripples:v})=>{k.style.strokeDashoffset=String(-B*st(S*Number(k.dataset.speed),Number(k.dataset.period))),v.forEach(q=>{const R=st(Number(q.dataset.phase)+S*Number(q.dataset.speed)/P,1),Y=B>0?R:1-R,K=j(Y),at=j(Math.max(0,Y-.005)),De=j(Math.min(1,Y+.005)),Fn=Math.atan2(De.y-at.y,De.x-at.x)*180/Math.PI+(B<0?180:0);q.setAttribute("transform",`translate(${K.x} ${K.y}) rotate(${Fn})`),q.style.opacity=String(Math.min(1,R*12,(1-R)*12)*.72)})}),p.forEach((k,P)=>{k.style.strokeDashoffset=String(-st(S*ie.fallSpeed+P*9,64))}),l.forEach((k,P)=>{const j=Ur(P,S);k.setAttribute("transform",`translate(${j.x} ${j.y})`),k.style.opacity=j.opacity}),y.forEach((k,P)=>{const j=st(S*.7+P/y.length,1);k.setAttribute("transform",`scale(${.25+j*2.4})`),k.style.opacity=(1-j)*.48}),g.forEach((k,P)=>{const j=st(S*.85+P/g.length,1);k.setAttribute("transform",`translate(${Math.sin(P*2.4)*j*10} ${-j*13}) scale(${.65+j*.65})`),k.style.opacity=Math.sin(Math.PI*j)*.42})}const b=()=>!r&&a&&!document.hidden&&!m.hidden;function x(S){if(o=0,!b()){i=null;return}i!==null&&(s+=Math.min((S-i)/1e3,.1)),i=S,w(s),o=requestAnimationFrame(x)}function D(){b()?o||(o=requestAnimationFrame(x)):(cancelAnimationFrame(o),o=0,i=null),t.dataset.motionState=b()?"running":"paused"}e.addEventListener("click",()=>{r=!r,u(),D()});const T=()=>{r=n.matches,u(),D()};n.addEventListener("change",T),document.addEventListener("visibilitychange",D);const C=new IntersectionObserver(S=>{a=S[0].isIntersecting,D()});C.observe(t);const F=new MutationObserver(D);F.observe(m,{attributes:!0,attributeFilter:["hidden"]});const V=()=>{cancelAnimationFrame(o),C.disconnect(),F.disconnect(),n.removeEventListener("change",T),document.removeEventListener("visibilitychange",D)};return window.addEventListener("pagehide",S=>{S.persisted?(cancelAnimationFrame(o),o=0,i=null):V()}),window.addEventListener("pageshow",D),w(0),u(),D(),V}const tt=(t,e)=>t.reduce((n,r,a)=>n+r*e[a],0),Ht=(t,e)=>t.map((n,r)=>n+e[r]),ct=(t,e)=>t.map(n=>n*e),xn=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],be=t=>ct(t,1/Math.hypot(...t));function ee(t,e,n){const r=[...t],a=(e+1)%3,o=(e+2)%3;return r[a]=t[a]*Math.cos(n)-t[o]*Math.sin(n),r[o]=t[a]*Math.sin(n)+t[o]*Math.cos(n),r}function Yr(t,e,n){const r=[],a=[];return t.forEach((o,i)=>{const s=t[(i+1)%t.length],c=tt(o,e)-n,d=tt(s,e)-n;if(c<=1e-9&&r.push(o),c>=-1e-9&&a.push(o),c<-1e-9&&d>1e-9||c>1e-9&&d<-1e-9){const h=Ht(o,ct(Ht(s,ct(o,-1)),c/(c-d)));r.push(h),a.push(h)}}),{inside:r,outside:a}}function Xr(t){const e=[];for(let n=0;n<3;n++)for(const r of[-1,1]){const a=[0,0,0];a[n]=r;const o=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,s])=>{const c=[0,0,0];return c[n]=r,c[(n+1)%3]=i,c[(n+2)%3]=s,ee(c,t,Math.PI/4)});e.push({points:o,normal:ee(a,t,Math.PI/4),d:1})}return e}function Gr(){const t=[0,1,2].map(Xr);return t.flatMap((e,n)=>e.flatMap(r=>{let a=[r.points];for(let o=0;o<3;o++)o!==n&&(a=a.flatMap(i=>{const s=[];let c=i;for(const d of t[o]){if(c.length<3)break;const h=Yr(c,d.normal,d.d);h.outside.length>=3&&s.push(h.outside),c=h.inside}return s}));return a.map(o=>({points:o,normal:r.normal}))}))}function Zr(){const t=[];for(let e=0;e<3;e++)for(const n of[-1,1])for(const r of[-1,1]){const a=(e+1)%3,o=(e+2)%3,i=[0,0,0],s=[0,0,0],c=[0,0,0],d=[0,0,0];i[a]=2*n,s[a]=n,s[o]=r,s[e]=1,c[o]=2*r,d[a]=n,d[o]=r,d[e]=-1;const h=[0,0,0];h[a]=2*n,h[o]=2*r;const p=[i,s,c,d];p.forEach((l,g)=>{const y=[l,p[(g+1)%4],h];let m=be(xn(Ht(y[1],ct(l,-1)),Ht(h,ct(l,-1))));tt(m,l)<0&&(m=ct(m,-1)),t.push({points:y,normal:m})})}return t}function Ir(t){const e=f.waterwayDirections.across[1],n=-f.waterwayDirections.receding[1],r=Math.atan(Math.sqrt(e/n)),a=Math.asin(Math.sqrt(e*n)),o=[Math.cos(r),Math.sin(r),0],i=[Math.sin(a)*Math.sin(r),-Math.sin(a)*Math.cos(r),-Math.cos(a)],s=be(xn(o,i)),c=be([-1,-2,4]),d=f.ornamentYawDegrees[t]*Math.PI/180,h=(t===0?Gr():Zr()).map(u=>({points:u.points.map(w=>ee(w,2,d)),normal:ee(u.normal,2,d)})),p=t===0?98:100,l=h.flatMap(u=>u.points.map(w=>[tt(w,o),tt(w,i)])),g=Math.max(...l.map(u=>u[1])),y=Math.min(...l.map(u=>u[1])),m=p/(g-y);return h.filter(u=>tt(u.normal,s)<-1e-8).sort((u,w)=>tt(ct(w.points.reduce(Ht,[0,0,0]),1/w.points.length),s)-tt(ct(u.points.reduce(Ht,[0,0,0]),1/u.points.length),s)).map(u=>{const w=Math.max(0,tt(u.normal,c)),b=Math.round(91+w*115);return M(H(u.points.map(x=>[tt(x,o)*m,(tt(x,i)-g)*m+16]))+"Z","ornament-face",`style="fill:rgb(${b},${b+1},${b-10})"`)}).join("")}function _r(t){if(t.pierBay)return"";const e=t.tier==="left-middle"||t.tier==="right-lower",{center:n}=lt(t),r=e?{...f.archFrame,top:f.intermediateArch.top}:f.archFrame,a=t.y-t.top,o=[[-r.halfWidth,-r.halfDepth],[r.halfWidth,-r.halfDepth],[r.halfWidth,r.halfDepth],[-r.halfWidth,r.halfDepth]].map(([l,g])=>ft(t.tier,n,l,g)),i=10;function s(l,g,y,m,u){const w=E(l,[0,-a-r.top]),b=E(g,[0,-a-r.top]),x=E(l,[0,-a-r.bottom]),D=E(g,[0,-a-r.bottom]),T=L(x,D,.17),C=L(x,D,.83),F=E(L(x,D),[0,-r.crown]),V=E(T,y),S=E(C,y),k=E(F,y),P=`escher-arch-${t.tier}-${u}`,j=v=>T.map((q,R)=>(1-v)**2*q+2*(1-v)*v*F[R]+v*v*C[R]),B=[.14,.32,.5,.68,.86].map(v=>{const q=j(v),R=T.map((K,at)=>2*((1-v)*(F[at]-K)+v*(C[at]-F[at]))),Y=Math.hypot(...R);return M(H([q,E(q,[R[1]*7/Y,-R[0]*7/Y])]),"arch-stone-joint")}).join("");return`<g class="arch-masonry" data-arch-side="${u}" data-thickness="${i}">
      ${M(`M${w}L${b} ${D} ${C}Q${F} ${T}L${x}Z`,m)}
      <defs><clipPath id="${P}"><path d="M${T}Q${F} ${C}l0,45L${E(T,[0,45])}Z"/></clipPath></defs>
      <g clip-path="url(#${P})">
        ${M(`M${T}Q${F} ${C}L${S}Q${k} ${V}Z`,"arch-intrados")}
        ${$([T,V,E(V,[0,6]),E(T,[0,6])],"arch-spring-return")}
        ${$([C,S,E(S,[0,6]),E(C,[0,6])],"arch-spring-return")}
        ${M(`M${V}Q${k} ${S}`,"arch-inner-edge")}
      </g>
      ${B}
    </g>`}const c=ft(t.tier,n,0,0),d=(l,g)=>{const y=ft(t.tier,n,l,g);return[y[0]-c[0],y[1]-c[1]]},h=o.map(l=>E(l,[0,-a-r.top])),p=e?`<g class="tower-intermediate-top" data-tier="${t.tier}" data-thickness="0">${$(h,"stone-light")}</g>`:$(h,"stone-light");return`<g class="escher-tier-beam" data-tier="${t.tier}">
    ${s(o[0],o[1],d(0,i),"stone-mid","front")}
    ${s(o[1],o[2],d(-i,0),"stone-dark","right")}
    ${p}
  </g>`}const Bt=A.origin,We=[zt[0]-12+f.waterfallOffsetX,zt[1]+f.waterfallLandingExtension],Te=We[0]-Bt[0],Ln=We[1]-Bt[1],zr=(Ln-Te*W[1])/(J[1]-W[1]),je=(Ln-Te*W[1])/(O-W[1]),Hn=Te-je,Ee=N(f.pool.halfSide),_=N(f.pool.rimWidth),Pn=N(f.pool.sideRetraction/2),An=Hn-Ee.halfWidth,Wn=Hn+Ee.halfWidth-2*Pn.halfWidth+f.pool.widthExpansion,Tn=je-Ee.halfDepth+2*Pn.halfDepth,Me=Ot[1]-f.lowerPierFootprint.halfDepth-f.pool.rearPierGap+je-zr,Nr=[(An+Wn)/2,(Tn+Me)/2],Jr={center:U(Bt,...Nr),minU:An,maxU:Wn,minV:Tn,maxV:Me,rearExtension:22,extensionMaxU:gt[0].x-Bt[0]-Me-12},Kr=(t,e,n=0)=>U(Bt,t,e,n),rt=(t=0,e=0)=>{const{minU:n,maxU:r,minV:a,maxV:o,rearExtension:i,extensionMaxU:s}=Jr;return[[n+t*_.halfWidth,a+t*_.halfDepth],[r-t*_.halfWidth,a+t*_.halfDepth],[r-t*_.halfWidth,o-t*_.halfDepth],[s-t*_.halfWidth,o-t*_.halfDepth],[s-t*_.halfWidth,o+i-t*_.halfDepth],[n+t*_.halfWidth,o+i-t*_.halfDepth]].map(([c,d])=>Kr(c,d,e))};function to(){const t=f.pool.rimHeight,e=rt(0,t),n=rt(1,t),r=a=>a.join(",");return`<g id="escher-landing-pond">
    <defs><clipPath id="escher-pond-water-clip">${$(rt(1),"")}</clipPath><clipPath id="escher-pond-wheel-overlap-clip">${$(rt(),"")}</clipPath></defs>
    ${$(rt(),"pond-water")}
    ${M(`${H(e)}Z ${H(n.toReversed())}Z`,"pond-rim",'fill-rule="evenodd"')}
    ${$([e[0],e[1],rt()[1],rt()[0]],"pond-rim-front")}
    ${$([e[1],e[2],rt()[2],rt()[1]],"pond-rim-side")}
    ${M(H(e)+"Z","pond-rim-edge")}
    <g clip-path="url(#escher-pond-water-clip)">
      ${[0,1,2].map(a=>`<g class="pond-ripple" transform="translate(${r(We)})"><ellipse rx="18" ry="4"/></g>`).join("")}
    </g>
  </g>`}const Ne=f.doorGround.width/f.doorGround.vanishingDistance,eo=(O-Ne*W[1])/(1-Ne),no=`
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
  <pattern id="escher-brick-front" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${W[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-light)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#8d8778" stroke-width=".75" opacity=".48"/>
  </pattern>
  <pattern id="escher-brick-side" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${O} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-mid)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#625e52" stroke-width=".8" opacity=".5"/>
  </pattern>
  <pattern id="escher-roof-tiles" width="18" height="14" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${J[1]} .65 .7 0 0)">
    <rect width="18" height="14" fill="#737368"/>
    <path d="M0,0V6Q4.5,11 9,6V0M9,0V6Q13.5,11 18,6V0M-4.5,7V13Q0,18 4.5,13V7M4.5,7V13Q9,18 13.5,13V7" fill="none" stroke="#42483e" stroke-width=".9"/>
  </pattern>
  <pattern id="escher-paving" width="45" height="30" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${W[1]} -.8 ${-.8*O} 0 0)">
    <rect width="45" height="30" fill="#d3cdbb"/>
    <path d="M0,0H45V30H0Z" fill="none" stroke="#a29b89" stroke-width=".8"/>
  </pattern>
  <pattern id="escher-brick-ground-perspective" href="#escher-brick-side" patternTransform="matrix(1 ${eo} 0 1 0 0)"/>`,G=t=>{const e=Math.sin(t*127.1+31.7)*43758.5453;return e-Math.floor(e)};function ro(t,e,n){const r=Array.from({length:26},(a,o)=>{const i=-e+8+G(t+o)*(e-14);return`<ellipse cx="${(G(t+o+40)-.5)*n*(.45-.4*i/e)}" cy="${i}" rx=".65" ry="1"/>`}).join("");return`<path d="M${-n/2},${-e}Q${-n*.3},${-e*.45} -4,0Q0,4 4,0Q${n*.3},${-e*.45} ${n/2},${-e}Z" class="garden-sponge"/>
    <path d="M${-n*.29},${-e+6}Q-2,${-e*.4} -1,-4M${n*.27},${-e+6}Q2,${-e*.4} 1,-4" class="garden-sponge-rib"/>
    <g class="garden-pores">${r}</g>
    <ellipse cx="0" cy="${-e}" rx="${n/2}" ry="${n*.18}" class="garden-sponge-rim"/>
    <ellipse cx="0" cy="${-e+1}" rx="${n*.36}" ry="${n*.105}" class="garden-sponge-hollow"/>`}function oo(t,e){let n="";function r(a,o,i,s,c){const d=s*Math.PI/180,h=a+Math.cos(d)*i,p=o+Math.sin(d)*i;if(n+=`M${a},${o}Q${a+Math.cos(d+.2)*i*.5},${o+Math.sin(d+.2)*i*.5} ${h},${p}`,c)for(const l of[-34,5,39])r(h,p,i*(.52+G(t+c+l)*.1),s+l,c-1)}return r(0,0,e*.42,-90,3),M(n,"garden-coral")}function ao(t,e){return Array.from({length:4},(n,r)=>{const a=(r-1.5)*5,o=(G(t+r)-.5)*22;return M(`M${a},0C${a-12},${-e*.35} ${a+o+11},${-e*.6} ${a+o},${-e}q-7,-9 -10,0q0,6 5,4`,"garden-tendril")}).join("")}function so(t,e){return Array.from({length:7},(n,r)=>M(`M0,0Q${(r-3)*2},${-e*.55} ${(r-3)*4},${-e*(.55+G(t+r)*.45)}`,"garden-grass")).join("")}function io(t,e,n){const r=[];for(let o=0;o<55;o++)r.push({u:8+G(o)*(e-16),v:6+G(o+80)*(n-16),kind:"grass",h:15+G(o+20)*24,seed:o});[[.08,.8,104,27],[.19,.66,85,31],[.3,.9,125,34],[.42,.73,66,23],[.15,.43,75,38],[.32,.42,92,32],[.46,.48,52,27],[.09,.19,44,23],[.34,.18,58,35],[.53,.24,43,23]].forEach(([o,i,s,c],d)=>r.push({u:o*e,v:i*n,kind:"sponge",h:s,w:c,seed:100+d}));for(let o=0;o<9;o++)r.push({u:(.48+G(o+180)*.43)*e,v:(.12+G(o+190)*.65)*n,kind:"coral",h:45+G(o+200)*50,seed:200+o});for(let o=0;o<11;o++)r.push({u:(.25+G(o+220)*.65)*e,v:(.45+G(o+240)*.5)*n,kind:"curl",h:38+G(o+260)*54,seed:300+o});return`<g id="escher-garden-vegetation">${r.map(o=>({...o,xy:t(o.u,o.v)})).sort((o,i)=>o.xy[1]-i.xy[1]).map(o=>`<g class="garden-specimen" data-kind="${o.kind}" transform="translate(${o.xy.join(" ")})">${o.kind==="sponge"?ro(o.seed,o.h,o.w):o.kind==="coral"?oo(o.seed,o.h):o.kind==="curl"?ao(o.seed,o.h):so(o.seed,o.h)}</g>`).join("")}</g>`}const Pt=[{id:"ridge-far-1",depth:"far",drop:25,points:[[20,72],[177,29],[282,31],[340,64],[458,30],[700,28],[920,26]]},{id:"ridge-far-2",depth:"far",drop:32,points:[[20,146],[102,121],[145,125],[145,96],[226,72],[283,81],[292,101],[379,76],[435,87],[485,59],[555,65],[578,98],[720,73],[780,77],[816,104],[920,83]]},{id:"ridge-middle-1",depth:"middle",drop:37,points:[[20,252],[91,225],[112,203],[175,183],[203,211],[272,190],[285,165],[344,155],[378,181],[443,159],[480,176],[556,142],[610,155],[644,136],[717,143],[756,167],[826,150],[920,157]]},{id:"ridge-middle-2",depth:"middle",drop:43,points:[[20,380],[75,352],[87,328],[184,280],[203,302],[270,276],[280,292],[447,233],[477,254],[579,217],[596,230],[675,199],[724,217],[920,200]]},{id:"ridge-near-1",depth:"near",drop:42,points:[[20,474],[82,438],[99,407],[185,354],[214,368],[257,345],[286,365],[341,341],[358,363],[476,317],[509,337],[612,298],[641,316],[719,281],[769,303],[920,267]]},{id:"ridge-near-2",depth:"near",drop:43,points:[[20,589],[73,558],[88,527],[158,487],[174,458],[254,405],[278,419],[302,397],[318,424]]},{id:"ridge-near-3",depth:"near",drop:41,points:[[20,690],[71,659],[82,624],[139,592],[150,553],[258,483],[272,456],[321,427]]},{id:"ridge-near-4",depth:"near",drop:36,points:[[20,785],[66,756],[75,729],[132,701],[144,668],[205,638],[220,612],[279,575]]}].map(t=>{if(t.points.at(-1)[0]!==920)return t;const e=t.points.map(a=>[...a]),[n,r]=e.slice(-2);return e.push([1160,r[1]+(1160-r[0])*(r[1]-n[1])/(r[0]-n[0])]),{...t,points:e}});function Je(t,e){const n=e.findIndex((i,s)=>s<e.length-1&&t<=e[s+1][0]),r=n<0?e.length-2:n,[a,o]=e.slice(r,r+2);return a[1]+(t-a[0])/(o[0]-a[0])*(o[1]-a[1])}const Q=([t,e])=>[Je(t,[[20,0],[323,323],[425,381],[747,690],[920,780]]),Je(e,[[20,50],[140,110],[420,303],[560,421],[800,620],[1200,925]])];function nt(t,e){const n=t.points;for(let r=1;r<n.length;r++){const a=n[r-1],o=n[r];if(e>=a[0]&&e<=o[0]&&o[0]>a[0])return a[1]+(o[1]-a[1])*(e-a[0])/(o[0]-a[0])}return e<n[0][0]?n[0][1]:n.at(-1)[1]}function co(t){const e=Pt[t],n=t?Pt[t-1]:{points:[[20,20],[1160,20]],drop:0},r=Math.max(e.points[0][0],n.points[0][0]),a=Math.min(e.points.at(-1)[0],n.points.at(-1)[0]),o=[...new Set([r,a,...e.points.map(c=>c[0]),...n.points.map(c=>c[0])])].filter(c=>c>=r&&c<=a).sort((c,d)=>c-d),i=o.map(c=>[c,nt(e,c)]),s=o.map(c=>[c,Math.min(nt(e,c),nt(n,c)+n.drop)]);return[...i,...s.toReversed()].map(Q)}function jn(t,e){let n="";return t.slice(1).forEach((r,a)=>{const o=t[a],i=Math.hypot(r[0]-o[0],r[1]-o[1]);for(let s=1;s*9<e;s++){const c=s*9;n+=M(H([[o[0],o[1]+c],[r[0],r[1]+c]].map(Q)),"terrace-stone-joint");for(let d=s%2?10:20;d<i;d+=24){const h=d/i,p=[o[0]+(r[0]-o[0])*h,o[1]+(r[1]-o[1])*h+c];n+=M(H([p,[p[0],p[1]+7]].map(Q)),"terrace-stone-joint")}}}),n}function En(t,e=Pt){const n=e[t],r=e[t-1];let a="";for(let o=n.points[0][0]+8;o<n.points.at(-1)[0];o+=15){const i=r?nt(r,o)+r.drop:20,s=nt(n,o);for(let c=i+5+o%7;c<s-3;c+=10)a+=H([[o,c],[o+6,c+2]].map(Q))}return M(a,"terrace-earth-hatch")}function lo(t){const e=Pt[t],n=Pt[t-1];return t===0?[]:[[125,390,665],[90,325,590,855],[73,238,505,735],[58,170,368,620,830],[72,209,465,722,872],[65,155,265],[54,119,235],[47,124,223]][t].filter(a=>a<e.points.at(-1)[0]&&nt(e,a)-(nt(n,a)+n.drop)>18).map((a,o)=>({reference:[a,nt(e,a)-6],size:(e.depth==="far"?.45:e.depth==="middle"?.6:.8)*(1+o%3*.12)}))}function Dn({reference:t,size:e}){const[n,r]=Q(t);return`<g class="terrace-shrub" transform="translate(${n} ${r}) scale(${e})">
    <path d="M0,0L0,-13M0,-4l-6,-5m6,3l6,-6m-6,2l-4,-6m4,4l3,-7"/>
    <path d="M-6,-8q-5,-3 -2,-6q-3,-4 2,-5q0,-5 5,-3q4,-4 6,1q6,-1 4,4q4,4 -1,6q-2,5 -7,2Z" class="terrace-shrub-crown"/>
  </g>`}const Dt={roof:[[80,72],[107,80],[146,70],[122,60]],height:140,horizontalScale:.6,afterContour:2};function ho(){const t=Q([113,212])[0],e=i=>{const s=Q(i);return[t+(s[0]-t)*Dt.horizontalScale,s[1]]},n=Dt.roof.map(e),r=Dt.roof.map(([i,s])=>e([i,s+Dt.height])),a=e([93.5,64]),o=e([134,53]);return`<g id="escher-terrace-tall-house" data-reference-position="upper-left">
    ${$([n[0],n[1],r[1],r[0]],"terrace-house-front")}
    ${$([n[1],n[2],r[2],r[1]],"terrace-house-side")}
    ${M(`M${n[0]}Q${a} ${n[1]}L${n[2]}Q${o} ${n[3]}Z`,"terrace-house-roof")}
    ${M(`M${n[0]}Q${a} ${n[1]}Z`,"terrace-house-front")}
    ${$([[127,88],[134,86],[134,100],[127,102]].map(e),"terrace-house-window")}
  </g>`}const ce=Array.from({length:5},(t,e)=>{const n=360+e*100;return{drop:24+e%3*2,points:[[425,n],[650+e*11,n-70-e*2],[680+e*11,n-54-e],[870-e*5,n-115-e*3],[900+e*2,n-95-e*2],[1160,n-180+e*5]]}});function fo(){return`<defs><clipPath id="right-hillside-limit">${$([[0,0],[900,0],[900,_t(900)-31],[0,_t(0)-31]],"")}</clipPath></defs><g id="escher-right-hillside" clip-path="url(#right-hillside-limit)">${ce.map((t,e)=>{const n=ce[e-1],r=t.points.map(Q),a=n?n.points.map(([s,c])=>Q([s,c+n.drop])):t.points.map(([s])=>Q([s,20])),o=t.points.map(([s,c])=>Q([s,c+t.drop])),i=`right-hill-${e}`;return`<g class="terrace-study-middle">
      <defs><clipPath id="${i}">${$([...r,...a.toReversed()],"")}</clipPath></defs>
      ${$([...r,...a.toReversed()],"terrace-ground")}
      <g clip-path="url(#${i})">${En(e,ce)}</g>
      ${t.points.slice(1).map((s,c)=>{const d=t.points[c];return $([d,s,[s[0],s[1]+t.drop],[d[0],d[1]+t.drop]].map(Q),s[1]>d[1]?"terrace-wall-side":"terrace-wall-front")}).join("")}
      ${jn(t.points,t.drop)}
      ${M(H(r),"terrace-study-edge")}${M(H(o),"terrace-wall-base")}
      ${[550,735,965,1100].map((s,c)=>{s+=Math.sin(e*3+c)*18;const d=nt(t,s)-7;return!n||d>nt(n,s)+n.drop+14?Dn({reference:[s,d],size:.55+e%3*.08}):""}).join("")}
    </g>`}).join("")}</g>`}function po(){return`<g id="escher-terrace-background" data-stage="print-details">
    ${fo()}
    ${Pt.map(({id:t,depth:e,drop:n,points:r},a)=>{const o=r.map(Q),i=co(a),s=`escher-terrace-ground-${a}`,c=`escher-terrace-wall-${a}`,d=r.toReversed().map(([l,g])=>Q([l,g+n])),h=r.slice(1).map((l,g)=>{const y=r[g],m=l[1]>y[1]||l[0]-y[0]<25;return $([y,l,[l[0],l[1]+n],[y[0],y[1]+n]].map(Q),m?"terrace-wall-side":"terrace-wall-front")}).join(""),p=r.slice(1,-1).map(([l,g])=>M(H([[l,g],[l,g+n]].map(Q)),"terrace-wall-return")).join("");return`<g data-contour="${t}" class="terrace-study-${e}">
        <defs>
          <clipPath id="${s}">${$(i,"")}</clipPath>
          <clipPath id="${c}">${$([...o,...d],"")}</clipPath>
        </defs>
        ${$(i,"terrace-ground")}
        <g class="terrace-ground-texture" clip-path="url(#${s})">${En(a)}</g>
        ${h}${p}
        <g class="terrace-wall-texture" clip-path="url(#${c})">${jn(r,n)}</g>
        ${M(H(o),"terrace-study-edge")}
        ${M(H(d.toReversed()),"terrace-wall-base")}
        ${lo(a).map(Dn).join("")}
      </g>`}).map((t,e)=>t+(e===Dt.afterContour?ho():"")).join("")}
  </g>`}function go(){return`<g id="escher-landscape" aria-hidden="true">${po()}</g>`}function uo(){const t={origin:[530,853],height:190},e=t.height,n=mt(t),r=rr,a=z.width,o=z.depth,i=z.outline.map(([y,m])=>r(y,m,-A.garden.wallHeight)),{gateWidth:s,gateHeight:c,wallHeight:d}=A.garden,h=o-s,p=(y,m)=>r(a,h+y,-d+m),l=`M${p(0,0)}L${p(0,c*.6)}Q${p(s/2,c*1.4)} ${p(s,c*.6)}L${p(s,0)}Z`,g=[...Array.from({length:5},(y,m)=>H([p((m+1)*s/6,0),p((m+1)*s/6,c)])),...Array.from({length:7},(y,m)=>H([p(0,(m+1)*6),p(s,(m+1)*6)]))].join("");return n(60,-28,e+18),n(144,-28,40),n(144,-28,22),n(60,-28,e),`<g id="escher-foreground">
    
    <g id="escher-garden" data-building="garden-planter">
      <g mask="url(#escher-foundation-floor-mask)">${$(i,"garden-soil")}</g>
      ${io((y,m)=>r(y+z.soilLeft+16,m,-d),a-z.soilLeft-32,o)}
      ${$([r(z.soilLeft,0),r(a,0),r(a,0,-d),r(z.soilLeft,0,-d)],"stone-light wall-facing")}
      ${$([r(a,0),r(a,h),r(a,h,-d),r(a,0,-d)],"stone-mid wall-receding")}
      ${M(H([r(z.soilLeft,0),r(a,0),r(a,h)]),"garden-wall-cap")}
      <g id="escher-garden-gate" data-wall="garden-side">
        <defs><clipPath id="escher-garden-gate-clip"><path d="${l}"/></clipPath></defs>
        ${M(g,"garden-gate-grid",'clip-path="url(#escher-garden-gate-clip)"')}
        ${M(l,"garden-gate-frame")}
      </g>
    </g>
  </g>`}function Ke(t,e,n,r,a){const o=[[-e,-n],[e,-n],[e,n],[-e,n]].map(([s,c])=>a?ft(a,t,s,c):Z(t,s,c)),i=o.map(s=>E(s,[0,-r]));return`${$([i[0],i[1],o[1],o[0]],"stone-mid")}
    ${$([i[1],i[2],o[2],o[1]],"stone-dark")}
    ${$(i,"stone-light")}`}function mo(t,e,n,r,a){const o=e-r-2,i=f.columnRadius,s=i+2.5;return`<g class="escher-column" data-foot-y="${e}" data-cap-y="${n}" data-base-height="${r}" data-shaft-length="${o-n-15}">
    <g class="column-base-masonry" data-courses="${r/f.brickCourseHeight}">
      ${Ke([t,e],f.columnBase.halfWidth,f.columnBase.halfDepth,r,a)}
      ${Array.from({length:r/f.brickCourseHeight-1},(c,d)=>{const h=(d+1)*f.brickCourseHeight,p=f.columnBase.halfWidth,l=f.columnBase.halfDepth,g=[[-p,-l],[p,-l],[p,l]].map(([y,m])=>ft(a,[t,e],y,m,h));return M(H(g),"channel-course-joint")}).join("")}
    </g>
    ${M(`M${t-i},${o}V${n+15}h${2*i}V${o}q${-i},4 ${-2*i},0Z`,"stone-light")}
    ${M(`M${t+i*.5},${n+15}V${o}`,"column-shade")}
    ${Ke([t,n+17],f.columnCap.halfWidth,f.columnCap.halfDepth,12,a)}
    ${M(`M${t-s},${e-r-4}q${s},5 ${2*s},0M${t-s},${n+23}q${s},5 ${2*s},0`,"fine-line")}
  </g>`}function $o(t,e,n){const{halfWidth:r,halfDepth:a}=f.lowerPierFootprint,o=[[-r,-a],[r,-a],[r,a],[-r,a]],i=o.map(([c,d])=>E(Z([t,e],c,d),[0,Se*d])),s=o.map(([c,d])=>Z([t,n+6],c,d));return`<g class="escher-column escher-square-pier">
    ${$([s[0],s[1],i[1],i[0]],"stone-mid")}
    ${$([s[1],s[2],i[2],i[1]],"stone-dark")}
    ${$(s,"stone-light")}
    ${t===gt[0].x?`<g class="wheel-axle-bearing" transform="translate(${t+r} ${f.wheel.centerY+8})"><ellipse rx="3.8" ry="5.5" fill="#777567" stroke="#514f46"/><ellipse rx="1.8" ry="2.6" fill="#494c42" stroke="none"/></g>`:""}
  </g>`}function tn(t,e){const{y:n,top:r,tier:a,pierBay:o}=t;if(o)return e==="rear"?"":`<g data-tower-tier="${a}" data-column-side="right">
      ${gt.map(d=>$o(d.x,d.bottom,d.top)).join("")}
    </g>`;lt(t).corners;const i=Xn(t),s=ir(t);return`<g data-tower-tier="${a}" data-column-side="${e}">
    ${(e==="rear"?[3,2]:[0,1]).map(d=>mo(i[d][0],i[d][1],s[d][1],f.columnBaseHeights[a],a)).join("")}
  </g>`}function wo(t){const{center:e}=lt(t),n=t.y-t.top+31,{halfWidth:r,halfDepth:a}=f.towerEave,o=[[-r,-a],[r,-a],[r,a],[-r,a]].map(([s,c])=>ft(t.tier,e,s,c,n)),i=E(Z(e,0,0,n),[0,-16+f.ornamentDrop]);return`<g class="escher-tower-roof" data-tower="${t.id}">
    ${$([o[0],o[1],E(o[1],[0,8]),E(o[0],[0,8])],"stone-mid")}
    ${$([o[1],o[2],E(o[2],[0,8]),E(o[1],[0,8])],"stone-dark")}
    ${$(o,"stone-light")}
    <g class="tower-ornament" transform="translate(${i.join(" ")})">
      ${Ir(t.ornament)}
    </g>
  </g>`}function yo(t){const{corners:e,edges:n,center:r,entry:a,exit:o}=vt(t),i=(h,p)=>L(r,h,p),s=h=>E(h,[0,-Jt(t.tier)]),c=h=>E(s(h),[0,f.channelWaterFreeboard]),d=[n[t.entry],n[t.exit]];return`<g class="channel-turn" data-turn="${t.tier}" data-coping-only="true">
    <g class="channel-turn-water">
      ${$(e.map(h=>c(i(h,jt))),"channel-corner-water")}
      ${d.map(([h,p])=>{const l=L(h,p,et),g=L(h,p,1-et);return $([l,g,i(g,jt),i(l,jt)].map(c),"channel-corner-water")}).join("")}
      ${yn(`current-turn-${t.tier}`,e.map(h=>c(i(h,jt))),(h,p)=>{const l=c(a),g=c(r),y=c(o),m=l.map((b,x)=>(1-h)*(1-h)*b+2*(1-h)*h*g[x]+h*h*y[x]),u=l.map((b,x)=>2*(1-h)*(g[x]-b)+2*h*(y[x]-g[x])),w=Math.hypot(...u)||1;return[m[0]-u[1]/w*(p-.5)*9,m[1]+u[0]/w*(p-.5)*9]},t.tier==="left-upper"?1:-1,65)}
    </g>
    ${cr(t).map(h=>`<g class="channel-turn-bank">${$(h.map(s),"channel-wall-cap")}</g>`).join("")}
  </g>`}function bo(t,e){const n=lr(t,e),r=`escher-channel-${t.id}-${e}-clip`,[a,o]=t.from,[i,s]=t.to,c=pr(t,e),d=Kt(t,"near"),h=Kt(t,"far"),p=[...Ct(...c.near).map(c.waterAt),...Ct(...c.far).map(c.waterAt).toReversed()];return`<g id="escher-channel-${t.id}-${e}" data-structural-layer="channel-${t.id}-${e}" data-channel-side="${e}" data-wall-height="${c.height}">
    <defs><clipPath id="${r}"><rect x="${n.minX}" y="-1000" width="${n.maxX-n.minX}" height="3000"/></clipPath></defs>
    <g clip-path="url(#${r})" class="channel-half-artwork"${t.id===4&&e==="left"?' mask="url(#escher-landing-platform-mask)"':""}>
    <g${t.id===4?' mask="url(#escher-foundation-floor-mask)"':""}>
    ${Ue(h)}${Ue(d)}
    ${t.id===1?n.turns.map(l=>fr(t,l)).join(""):""}
    ${$([a,i,s,o].map(l=>ut(t,l)),"channel-corner-stone")}
    ${Be(h,c.heightAt)}
    <g data-water-elevation="${c.waterElevation}">
      ${$(p,"channel-corner-water")}
      ${M(H(Ct(...c.far).map(c.waterAt)),"channel-waterline")}
      ${yn(`current-${t.id}-${e}`,p,(l,g)=>c.guideAt(L(L(...c.near,l),L(...c.far,l),g)),-1,Math.hypot(i[0]-a[0],i[1]-a[1]))}
    </g>
    ${Be(d,c.heightAt)}
    ${n.turns.map(yo).join("")}
    ${n.tailrace?`${M(H(n.tailrace),"channel-outline")}${M(H(n.tailrace),"channel-top")}${M(H(n.tailrace),"channel-water")}`:""}
    </g></g>
  </g>`}function Mo(t){const e=At.find(r=>r.tier===t),n=f.towers.find(r=>`${r.id}-upper`===t);return`<g id="escher-tier-${t}" data-structural-layer="${t}">
    ${e.pierBay?"":tn(e,"rear")}
    ${tn(e,"front")}
    ${_r(e)}
    ${n?wo(e):""}
  </g>`}function ko(){return hr.map(t=>{if(t==="wheel")return Br();if(t.startsWith("channel-")){const[,e,n]=t.split("-");return bo(se.find(r=>r.id===Number(e)),n)}return Mo(t)}).join("")}const[bt,pt]=Yn,[Gt,Cn]=zt,Zt=Cn+f.waterfallLandingExtension,So=f.waterwayDirections.across[1],It=t=>pt+t*So,Vn=f.waterfallOffsetX+f.waterfallVisualShiftX,ne=bt-Vn,le=t=>`M${ne-26+t},${It(-26+t)}C${ne-44+t},${pt+4} ${bt-40+t},${pt+18} ${bt-40+t},${pt+65}L${Gt-40+t},${Zt}`,xo=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f.viewBox}" role="img" aria-labelledby="escher-svg-title escher-svg-description" class="escher-drawing">
  <title id="escher-svg-title">瀑布：水渠、水磨房与周围建筑群</title>
  <desc id="escher-svg-description">水轮下方的水渠向右后方伸展，再反复折回，最终接到左塔下方的高处落水口。瀑布从那里直落到水轮和平台上的方形水池，形成二维画面中的不可能循环。远处是带有石墙、耕地和植物的梯田，左上有一座高窄小屋；右下的横桥连接水道4和方屋，桥下设有沿门洞窄墙、水道与桥底闭合的六边形平台；左下是种植着杯形与枝状植物的庭院。</desc>
  <defs>${no}<filter id="escher-mist-soften" x="-50%" y="-70%" width="200%" height="240%"><feGaussianBlur stdDeviation="1.4"/></filter><clipPath id="escher-fall-clip"><path d="${le(0)}L${Gt+5},${Zt}L${bt+5},${pt+65}C${bt+5},${pt+18} ${ne+1},${pt+4} ${ne+16},${It(16)}Z"/></clipPath>
    <mask id="escher-foundation-floor-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1000">
      <rect width="900" height="1000" fill="white"/>
      ${[ur(),mr()].map(t=>`<polygon points="${t.map(e=>e.join(",")).join(" ")}" fill="black"/>`).join("")}
    </mask>
    <!-- The platform occludes the tailrace's exposed wall/floor ends at the
         landing. Apply only to channel 4, leaving wheel and columns intact. -->
    <mask id="escher-landing-platform-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="900">
      <rect width="900" height="900" fill="white"/>
      <rect x="${Gt-43}" y="${Cn-27}" width="53" height="45" fill="black"/>
    </mask>
  </defs>
  <rect width="900" height="900" class="scene-paper"/>
  <g class="scene-architecture" transform="translate(0 ${f.compositionOffsetY})" stroke-linejoin="round" stroke-linecap="round">
    <g class="scene-background" transform="translate(0 ${f.backgroundOffsetY})">${go()}</g>
    ${yr()}
    ${Qe("rear")}
    ${Mr()}
    ${ko()}
    ${Rr()}
    ${ze(!0)}
    <g mask="url(#escher-foundation-floor-mask)">${$r()}</g>
    ${wr(Pe.groundWallTopReference)}
    ${qr()}
    ${ze()}
    <!-- The deck and pond sit above the bridge; only the pier feet need
         restoration here. Their upper parts retain the original layer order. -->
    <g id="escher-pool-platform-layer">
      ${br()}${to()}
      <use href="#escher-wheel" clip-path="url(#escher-pond-wheel-overlap-clip)"/>
      <defs><clipPath id="escher-pier-feet-clip"><rect x="0" y="${Math.min(...gt.map(t=>t.bottom))-18}" width="900" height="90"/></clipPath></defs>
      <use href="#escher-tier-left-lower" clip-path="url(#escher-pier-feet-clip)"/>
    </g>
    <g id="escher-fall-route" transform="translate(${Vn} 0)">
    <g id="escher-waterfall" clip-path="url(#escher-fall-clip)">
      <rect x="${bt-50}" y="${It(-26)}" width="120" height="${Zt-It(-26)+10}" class="fall-water"/>
      ${Array.from({length:12},(t,e)=>M(le(e*4),"fall-line")).join("")}
      ${Array.from({length:17},(t,e)=>M(le(-1+e*3),"fall-streak")).join("")}
    </g>
    <g id="escher-splash" transform="translate(${Gt-12} ${Zt})" aria-hidden="true">
      <g filter="url(#escher-mist-soften)">${Array.from({length:9},(t,e)=>'<g class="splash-mist"><path d="M-19,2 Q-24,-5 -13,-9 Q-17,-20 -4,-19 Q4,-28 11,-16 Q24,-17 19,-6 Q29,2 13,5Z"/></g>').join("")}</g>
      ${Array.from({length:48},(t,e)=>`<ellipse class="splash-drop" cx="${(e%4-1.5)*3}" cy="-1" rx="${.8+e%3*.25}" ry="${1.25+e%4*.25}"/>`).join("")}
    </g>
    </g>
    ${Qe()}
    
    ${uo()}
  </g>
</svg>`;document.querySelector("#escher-scene").innerHTML=xo;Qr(document.querySelector("#escher-scene"));const it=[...document.querySelectorAll('[role="tab"]')],Lo=[...document.querySelectorAll('[role="tabpanel"]')];function en(t){for(const e of it){const n=e===t;e.setAttribute("aria-selected",String(n)),e.tabIndex=n?0:-1}for(const e of Lo)e.hidden=e.id!==t.getAttribute("aria-controls")}for(const[t,e]of it.entries())e.addEventListener("click",()=>en(e)),e.addEventListener("keydown",n=>{let r;switch(n.key){case"ArrowRight":r=(t+1)%it.length;break;case"ArrowLeft":r=(t-1+it.length)%it.length;break;case"Home":r=0;break;case"End":r=it.length-1;break;default:return}n.preventDefault(),en(it[r]),it[r].focus()});document.querySelector("#copyright-year").textContent=new Date().getFullYear();
