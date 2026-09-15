import {heightAt,roadNetwork,layout} from './root.js';
import {createVillageKit} from './central-village.js';

export function build(THREE,ctx){
 const world=new THREE.Group();world.name='central-village-market_trade_households';
 const lots=layout().lots.filter(p=>['central-village-lot-3','central-village-lot-4'].includes(p.id));
 const roads=roadNetwork();
 for(const [index,p] of lots.entries()){
  const cloth=index===0,sgn=p.front==='east'?1:-1;
  const g=new THREE.Group();g.name=`central-village-market_${cloth?'cloth':'carpenter'}_house_yard`;world.add(g);
  const k=createVillageKit(THREE,g),{box:B,cylinder:C,beam:E,mesh:M,material:mat}=k;
  const wood=0x68503a,dark=0x3d352b,light=0x987754,plaster=cloth?0xc2b397:0xad9b7b,iron=0x444942;
  const W=cloth?5.9:5.8,D=cloth?6.5:6.0,H=cloth?6.0:3.35,top=p.y+0.34;
  const x=p.x,z=p.z,front=x+sgn*W/2;
  function torus(xx,yy,zz,r,t,color,rot=Math.PI/2){const o=M(new THREE.TorusGeometry(r,t,6,20),mat(color),xx,yy,zz);o.rotation.x=rot;return o}
  function post(xx,zz,h=1.9,w=.12){let y=heightAt(xx,zz);B(xx,y+h/2-.03,zz,w,h+.06,w,wood);return y}
  function plank(xx,yy,zz,w,h,d,color=light){return B(xx,yy,zz,w,h,d,color)}
  function groundBox(xx,zz,w,d,h,color){return B(xx,heightAt(xx,zz)+h/2-.025,zz,w,h,d,color)}
  // Irregular earth scuffs follow the terrain beneath repeated household activity.
  function worn(xx,zz,rx,rz){
   const v=[xx,heightAt(xx,zz)+.018,zz],ix=[];
   for(let i=0;i<=28;i++){const a=i/28*Math.PI*2,r=1+.06*Math.sin(i*2.6);const px=xx+Math.cos(a)*rx*r,pz=zz+Math.sin(a)*rz*r;v.push(px,heightAt(px,pz)+.018,pz);if(i)ix.push(0,i+1,i)}
   const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geom.setIndex(ix);geom.computeVertexNormals();M(geom,mat(0x8a8062));
  }
  worn(x+sgn*4.25,z+.5,.67,1.7);worn(x-sgn*1.2,z-4.5,1.3,.69);worn(x-sgn*4.2,z+.1,.78,1.37);
  k.foundation(x,z,W+.05,D+.05,top);
  // Fitted floorboards and continuous sill beams.
  for(let j=0;j<Math.ceil(D/.27);j++)B(x,top+.045,z-D/2+(j+.5)*D/Math.ceil(D/.27),W,.09,D/Math.ceil(D/.27)-.014,light);
  // Each wall is assembled around genuine apertures; local u is horizontal along its face.
  function wall(axis,side,openings){
   const len=axis==='x'?D:W,normal=axis==='x'?x+side*W/2:z+side*D/2;
   const put=(u,y,l,h,dep,color,offset=0)=>axis==='x'?B(normal+side*offset,y,z+u,dep,h,l,color):B(x+u,y,normal+side*offset,l,h,dep,color);
   const intervals=[-len/2,...openings.flatMap(o=>[o.u-o.w/2,o.u+o.w/2]),len/2].sort((a,b)=>a-b);
   for(let i=1;i<intervals.length;i++){
    const a=intervals[i-1],b=intervals[i],u=(a+b)/2;if(b-a<.001)continue;
    const holes=openings.filter(o=>u>o.u-o.w/2+.001&&u<o.u+o.w/2-.001).sort((a,b)=>a.bottom-b.bottom);
    let yy=0;
    for(const o of [...holes,{bottom:H,h:0}]){if(o.bottom>yy)put(u,top+(yy+o.bottom)/2,b-a,o.bottom-yy,.18,plaster);yy=o.bottom+o.h}
   }
   for(const yy of [.13,1.0,H-.06,...(cloth?[3.03]:[])])put(0,top+yy,len+.12,.17,.26,dark,.02);
   for(let u=-len/2;u<=len/2+.01;u+=len/4)put(u,top+H/2,.18,H+.1,.25,wood,.025);
   // Applied vertical weatherboards below the window sills.
   for(let u=-len/2+.11;u<len/2;u+=.24){
    if(openings.some(o=>o.bottom<.9&&Math.abs(u-o.u)<o.w/2+.06))continue;
    put(u,top+.56,.21,.75,.045,wood,.13);
   }
   for(const o of openings){
    for(const u of [o.u-o.w/2,o.u+o.w/2])put(u,top+o.bottom+o.h/2,.12,o.h+.18,.29,dark,.075);
    for(const yy of [o.bottom,o.bottom+o.h])put(o.u,top+yy,o.w+.2,.12,.32,wood,.08);
    if(o.kind==='shop'){
     put(o.u,top+o.bottom+.36,o.w-.1,.08,.68,light,-.17);
     put(o.u,top+o.bottom+.17,o.w-.15,.3,.12,wood,-.16);
     // Interior shadow backing is well behind the opening and separated from its casing.
     put(o.u,top+o.bottom+o.h/2,o.w-.12,o.h-.12,.07,0x514333,-.55);
    }else{
     const y=top+o.bottom+o.h/2;
     put(o.u,y,o.w-.11,o.h-.09,.065,o.kind==='door'?0x716047:0xb5b7a0,-.055);
     for(let u=o.u-o.w/2+.16;u<o.u+o.w/2;u+=.17)put(u,y,.027,o.h-.12,.045,dark,-.008);
     for(let yy=o.bottom+.12;yy<o.bottom+o.h;yy+=.32)put(o.u,top+yy,o.w-.12,.025,.045,dark,.0);
     put(o.u,y,.065,o.h-.08,.08,wood,.02);
     if(o.kind==='door'){
      put(o.u+.15,top+o.bottom+.98,.052,.17,.03,iron,.075);
      for(const yy of [o.bottom-.08,o.bottom+o.h+.08])put(o.u,top+yy,o.w+.35,.07,.34,wood,.12);
     }else{
      // One slid-aside boarded shutter, with separate rails and small slats.
      const su=o.u+o.w*.66;
      put(su,y,o.w*.24,o.h+.05,.07,wood,.14);
      for(let yy=o.bottom+.1;yy<o.bottom+o.h;yy+=.17)put(su,top+yy,o.w*.24,.025,.09,light,.18);
     }
    }
   }
  }
  const openings=[{u:-1.8,w:1.1,bottom:.14,h:2.24,kind:'door'},{u:.62,w:2.4,bottom:.82,h:1.55,kind:cloth?'shop':'window'}];
  if(cloth)openings.push({u:-1.25,w:1.35,bottom:3.65,h:1.45,kind:'window'},{u:1.25,w:1.35,bottom:3.65,h:1.45,kind:'window'});
  wall('x',sgn,openings);
  wall('x',-sgn,[{u:-1.2,w:1.1,bottom:1.3,h:1.1,kind:'window'},...(cloth?[{u:.7,w:1.7,bottom:3.7,h:1.3,kind:'window'}]:[])]);
  for(const side of [-1,1])wall('z',side,[{u:.0,w:1.6,bottom:1.3,h:1.1,kind:'window'},...(cloth?[{u:.0,w:1.6,bottom:3.7,h:1.3,kind:'window'}]:[])]);
  // Peg heads at structural joints, readable as joinery in the shop close-ups.
  for(const zz of [-D/2,0,D/2])for(const yy of [1,cloth?3.03:H-.06]){
   const peg=C(front+sgn*.16,top+yy,z+zz,.033,.033,.045,light,8);peg.rotation.z=Math.PI/2;
  }
  const mainRoof=k.roof({x,y:top+H,z,w:(cloth?W:D)+1.24,d:(cloth?D:W)+1.04,rise:cloth?2.0:1.85,axis:cloth?'z':'x',tileColor:cloth?0x465359:0x566063,gableColor:plaster});
  // Scoped hearth outlet: sample this roof, including its rotated tile courses.
  // A separate assembly leaves all accepted roof forms and household geometry intact.
  const outlet=new THREE.Group();g.add(outlet);
  outlet.userData.role='hearth-flue';
  const fk=createVillageKit(THREE,outlet),fb=fk.box;
  const fx=x+(cloth?1.35:-.95),fz=z+(cloth?.95:-1.35);
  g.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
  function roofAt(xx,zz){
   ray.set(new THREE.Vector3(xx,top+H+5,zz),down);
   const hit=ray.intersectObject(mainRoof,true)[0];
   if(!hit)throw new Error('Market flue flashing missed its roof');
   return hit.point.y;
  }
  const surface=roofAt(fx,fz),shaftBottom=top+H-.18,shaftTop=surface+.72;
  // Timber headers carry the shaft under the roof, bearing on opposite wall plates.
  for(const offset of [-.30,.30]){
   if(cloth)fb(x,shaftBottom-.08,fz+offset,W,.16,.12,wood);
   else fb(fx+offset,shaftBottom-.08,z,.12,.16,D,wood);
  }
  // Hollow masonry stack, with narrow recessed horizontal bedding joints.
  const rows=Math.ceil((shaftTop-shaftBottom)/.24),rowH=(shaftTop-shaftBottom)/rows;
  for(let j=0;j<rows;j++){
   const yy=shaftBottom+(j+.5)*rowH,color=j%2?0x858479:0x797b71;
   for(const side of [-1,1]){
    fb(fx+side*.175,yy,fz,.09,rowH-.009,.44,color);
    fb(fx,yy,fz+side*.175,.26,rowH-.009,.09,color);
   }
  }
  // Individually fitted sheet-metal apron panels follow the tile surface around the shaft.
  const grid=[-.40,-.23,.23,.40];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){
   if(a===1&&b===1)continue;
   const corners=[[grid[a],grid[b]],[grid[a+1],grid[b]],[grid[a+1],grid[b+1]],[grid[a],grid[b+1]]];
   const positions=[];
   for(const dy of [0,-.045])for(const [dx,dz] of corners)positions.push(fx+dx,roofAt(fx+dx,fz+dz)+.025+dy,fz+dz);
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
   geo.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);geo.computeVertexNormals();
   fk.mesh(geo,fk.material(0x535d5c));
  }
  // Raised counterflashing returns lap the masonry and hide the apron/shaft joint.
  for(const side of [-1,1]){
   fb(fx+side*.225,surface+.17,fz,.025,.28,.48,0x59625f);
   fb(fx,surface+.17,fz+side*.225,.43,.28,.025,0x59625f);
   fb(fx+side*.185,shaftTop+.025,fz,.11,.07,.48,0x676d65);
   fb(fx,shaftTop+.025,fz+side*.185,.26,.07,.11,0x676d65);
  }
  // Deep soot-dark throat stays below four genuinely open vent faces.
  fb(fx,shaftTop-.22,fz,.255,.018,.255,0x242b28);
  for(const dx of [-.18,.18])for(const dz of [-.18,.18])fb(fx+dx,shaftTop+.18,fz+dz,.045,.27,.045,0x525952);
  // Small hipped metal rain hood, closed below and supported at its four corners.
  const capShape=new THREE.CylinderGeometry(.09,.46,.12,4,1);
  const hood=fk.mesh(capShape,fk.material(0x596361),fx,shaftTop+.38,fz);hood.rotation.y=Math.PI/4;
  fb(fx,shaftTop+.31,fz,.66,.035,.66,0x4c5654);
  outlet.userData.center=[fx,surface,fz];
  // Narrow eave awning over the shop, supported by exposed brackets and sloped boards.
  const ay=top+2.6,ax=front+sgn*.38;
  for(let i=0;i<14;i++){
   const zz=z-D/2+.28+i*(D-.55)/13;
   E([front,ay+.22,zz],[front+sgn*.86,ay-.04,zz],.085,wood);
   B(ax,ay+.14,zz,.89,.075,(D-.55)/13-.016,dark).rotation.z=-sgn*.25;
  }
  for(const zz of [z-2.75,z+2.5])E([front,ay-.55,zz],[front+sgn*.76,ay-.05,zz],.09,wood);
  // Gate and enclosure retain open views to the trades.
  const xf=x+sgn*5.32,xb=x-sgn*5.23,z0=z-5.68,z1=z+5.68,gz=z-1.8;
  k.fence([xb,z0],[xf,z0],.87);k.fence([xb,z1],[xf,z1],.87);k.fence([xb,z0],[xb,z1],.87);
  k.fence([xf,z0],[xf,gz-.76],.82);k.fence([xf,gz+.76],[xf,z1],.82);
  // Open gate leaf hinged along the yard, with a diagonal brace.
  const gy=post(xf,gz+.76,1.25,.16);post(xf,gz-.76,1.25,.16);
  for(const yy of [.27,.84])E([xf,gy+yy,gz+.76],[xf-sgn*.9,gy+yy,gz+.98],.075,wood);
  E([xf,gy+.27,gz+.76],[xf-sgn*.9,gy+.84,gz+.98],.065,wood);
  // Individual stepping stones terminate in the lot's verge, before reserved lane clearance.
  const end=x+sgn*5.27,start=front+sgn*.25,n=5;
  for(let i=0;i<n;i++){
   const xx=start+(end-start)*i/(n-1),ground=heightAt(xx,gz),h=Math.max(.09,(top+.1-ground)*(1-i/(n-1)));
   B(xx,ground+h/2,gz,.43,h,.93,i%2?0x89877b:0x9b9788);
  }
  // Pots have modeled shoulders, a genuinely open dark mouth, rim and earth or water.
  function pot(xx,zz,s=1,green=false){const y=heightAt(xx,zz),color=green?0x636e59:0x8b654b;
   const pts=[[.16,0],[.29,.13],[.32,.38],[.22,.57],[.20,.61],[.17,.61],[.18,.53],[.25,.36],[.22,.15],[.12,.10]].map(v=>new THREE.Vector2(v[0]*s,v[1]*s));
   M(new THREE.LatheGeometry(pts,16),mat(color),xx,y,zz);C(xx,y+.16*s,zz,.20*s,.20*s,.03*s,0x3b3b2c,12);torus(xx,y+.61*s,zz,.192*s,.022*s,color);
  }
  function barrel(xx,zz,s=.8){const y=heightAt(xx,zz);C(xx,y+.43*s,zz,.35*s,.32*s,.84*s,0x806346,16);
   for(let j=0;j<16;j++){const a=j*Math.PI/8;E([xx+Math.cos(a)*.334*s,y+.06*s,zz+Math.sin(a)*.334*s],[xx+Math.cos(a)*.365*s,y+.80*s,zz+Math.sin(a)*.365*s],.021*s,dark)}
   for(const h of [.13,.7])torus(xx,y+h*s,zz,.353*s,.027*s,iron);
   for(let j=-2;j<=2;j++)B(xx+j*.115*s,y+.86*s,zz,.105*s,.04*s,Math.sqrt(.34**2-(j*.115)**2)*2*s,light);
  }
  function bench(xx,zz,w=1.7,d=.65){const y=heightAt(xx,zz);
   for(const dx of [-w*.4,w*.4])for(const dz of [-d*.35,d*.35])B(xx+dx,y+.42,zz+dz,.1,.84,.1,wood);
   for(let j=0;j<3;j++)B(xx,y+.86,zz+(j-1)*d/3,w,.1,d/3-.017,light);
   E([xx-w*.4,y+.23,zz],[xx+w*.4,y+.23,zz],.085,wood);return y+.92;
  }
  function logs(xx,zz,along='z'){
   const ground=heightAt(xx,zz);
   for(let row=0;row<3;row++)for(let j=0;j<4-row;j++){
    const a=xx+(j-(3-row)/2)*.24,y=ground+.13+row*.21;
    const log=C(a,y,zz,.105,.12,1.12,wood,9);log.rotation.x=Math.PI/2;
    const end=C(a,y,zz-.57,.091,.091,.012,0xad875c,9);end.rotation.x=Math.PI/2;
    const ring=torus(a,y,zz-.58,.057,.007,dark,0);
   }
  }
  // Rear side storage shed: founded posts, three boarded walls, dimensional tiled roof.
  const sx=x-sgn*4.2,sz=z+.15,sy=heightAt(sx,sz)+.13;
  for(const dx of [-.65,.65])for(const dz of [-1.22,1.22]){
   groundBox(sx+dx,sz+dz,.3,.3,.19,0x87867b);B(sx+dx,sy+1,sz+dz,.12,2,.12,wood);
  }
  for(const zz of [sz-1.22,sz+1.22]){
   for(let j=0;j<7;j++)B(sx-.6+j*.2,sy+.7,zz,.18,1.4,.07,wood);
   E([sx-.7,sy+1.85,zz],[sx+.7,sy+1.85,zz],.13,dark);
  }
  for(let j=0;j<12;j++)B(sx-sgn*.66,sy+.72,sz-1.1+j*.2,.075,1.45,.18,wood);
  k.roof({x:sx,y:sy+1.96,z:sz,w:1.87,d:2.98,rise:.64,tileColor:0x56615e,gableColor:wood});
  logs(sx,sz-.15);
  for(let j=0;j<4;j++)for(let row=0;row<3;row++)B(sx-.38+j*.23,sy+.15+row*.13,sz+.45,.20,.10,1.4,light);
  // Two kitchen plots with independent soil ridges and modeled leafy plants.
  for(let row=0;row<2;row++){
   const bz=z+4.65+row*.46,bx=x-sgn*.7;
   groundBox(bx,bz,2.4,.38,.10,0x685840);
   for(let i=0;i<8;i++){
    const px=bx-1.03+i*.29,py=heightAt(px,bz)+.10;
    for(let l=0;l<5;l++){
     const a=l*2.4+i,leaf=M(new THREE.SphereGeometry(1,5,4),mat(l%2?0x687748:0x536942),px+Math.sin(a)*.09,py+.14,bz+Math.cos(a)*.075);leaf.scale.set(.06,.20,.075);leaf.rotation.z=Math.sin(a)*.62;leaf.rotation.x=Math.cos(a)*.62;
    }
   }
  }
  for(const bz of [z+4.38,z+5.45])B(x-sgn*.7,heightAt(x-sgn*.7,bz)+.1,bz,2.65,.16,.08,wood);
  barrel(x+sgn*4.42,z+3.75,.88);pot(x+sgn*3.64,z+4.75,.95);pot(x+sgn*4.4,z+4.85,.72,true);
  const by=bench(x-sgn*1.2,z-4.5,1.8,.64);logs(x-sgn*3.3,z-4.7);
  // Long-handled yard rake with tines and a shallow basket.
  E([x-sgn*4.9,p.y+.15,z-3.4],[x-sgn*4.72,p.y+1.72,z-3.0],.045,light);
  B(x-sgn*4.9,p.y+.17,z-3.4,.42,.06,.1,wood);
  for(let j=0;j<6;j++)B(x-sgn*4.9+(j-2.5)*.075,p.y+.11,z-3.4,.022,.19,.026,iron);
  C(x-sgn*4.15,p.y+.2,z-3.3,.3,.23,.38,0x967b4e,12);torus(x-sgn*4.15,p.y+.4,z-3.3,.3,.025,light);
  // Drying pole across the south yard with pegged, softly pleated cloth surfaces.
  function fabric(xx,yy,zz,width,height,color,axis='z'){
   const vs=[],ix=[],N=16;
   for(let j=0;j<=N;j++)for(let v=0;v<=4;v++){
    const u=(j/N-.5)*width,drop=v/4*height,wave=Math.sin(j*.95)*.037+Math.sin(j*.44)*.025*v;
    vs.push(axis==='z'?xx+wave:xx+u,yy-drop,axis==='z'?zz+u:zz+wave);
    if(j&&v){let a=j*5+v;ix.push(a-6,a-1,a,a-6,a,a-5)}
   }
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();const m=mat(color).clone();m.side=THREE.DoubleSide;M(geo,m);
   for(const u of [-width*.36,width*.36])B(axis==='z'?xx:xx+u,yy+.01,axis==='z'?zz+u:zz,.055,.13,.04,light);
  }
  const dx=x+sgn*3.78,dz=z-4.6,dy=heightAt(dx,dz);
  for(const zz of [dz-.68,dz+.68])post(dx,zz,2.03,.1);
  E([dx,dy+2,dz-.82],[dx,dy+2,dz+.82],.065,light);
  fabric(dx,dy+1.97,dz,.97,1.05,cloth?0x3d566a:0xb4a580);
  if(cloth){
   // Framed retail counter in the actual recessed shop opening.
   const cz=z+.62,cy=top+.82+.42;
   for(let j=0;j<6;j++){
    const zz=cz-.96+j*.37,color=[0x3f536a,0xb08d4c,0x7d7663][j%3];
    const bolt=C(front+sgn*.03,cy+.12,zz,.13,.13,.55,color,12);bolt.rotation.z=Math.PI/2;
    const end=C(front+sgn*.315,cy+.12,zz,.106,.106,.012,color,12);end.rotation.z=Math.PI/2;
    const core=C(front+sgn*.326,cy+.12,zz,.033,.033,.018,light,10);core.rotation.z=Math.PI/2;
   }
   // Indigo split curtains hang from an exposed storefront pole.
   E([front+sgn*.28,top+2.46,cz-1.24],[front+sgn*.28,top+2.46,cz+1.24],.05,light);
   for(let j=0;j<4;j++){
    fabric(front+sgn*.3,top+2.42,cz-.88+j*.59,.55,.43,0x3e5361);
    B(front+sgn*.32,top+2.11,cz-.88+j*.59,.014,.028,.37,0xb1a27f);
   }
   // Folded cloth on outdoor cutting table, scissors and wooden spool.
   for(let i=0;i<4;i++)B(x-sgn*1.35,by+.045+i*.065,z-4.5,.74,.055,.45,i%2?0xaa915e:0x4d6170);
   const spool=C(x-sgn*.58,by+.12,z-4.52,.08,.08,.22,0xb1a17b,12);
   for(const yy of [by+.02,by+.22])C(x-sgn*.58,yy,z-4.52,.11,.11,.025,wood,12);
   E([x-sgn*.68,by+.025,z-4.27],[x-sgn*.3,by+.025,z-4.45],.025,iron);
   E([x-sgn*.68,by+.025,z-4.46],[x-sgn*.3,by+.025,z-4.29],.025,iron);
   for(const zz of [z-4.27,z-4.46])torus(x-sgn*.72,by+.026,zz,.055,.011,iron);
  }else{
   // Carpenter's open front working apron, two trestles carrying unfinished planks.
   const tx=x+sgn*4.27,tz=z+.1,ty=heightAt(tx,tz);
   for(const zz of [tz-.78,tz+.78]){
    for(const s of [-1,1])E([tx+s*.4,ty,zz],[tx+s*.13,ty+.88,zz],.11,wood);
    B(tx,ty+.9,zz,1.02,.13,.17,light);E([tx-.3,ty+.28,zz],[tx+.3,ty+.28,zz],.08,wood);
   }
   for(let j=0;j<2;j++)B(tx+(j-1)*.25,ty+1.01,tz,.22,.10,2.34+(j%2)*.35,0xa4855e);
   // A forked tenon is actually cut into the third plank's end.
   B(tx+.25,ty+1.01,tz-.12,.22,.10,2.10,0xa4855e);
   for(const a of [-1,1])B(tx+.25+a*.077,ty+1.01,tz+1.04,.065,.10,.25,0xb39770);
   for(const zz of [tz-.86,tz+.88])B(tx-.25,ty+1.065,zz,.215,.008,.014,0x544b3b);
   // Plane has a timber sole, dark protruding blade and arched hand grip.
   B(tx,ty+1.12,tz+.5,.18,.12,.40,wood);B(tx,ty+1.23,tz+.48,.15,.14,.026,iron).rotation.x=.36;
   const handle=torus(tx,ty+1.24,tz+.59,.075,.021,dark,0);handle.rotation.y=Math.PI/2;
   // Frame saw suspended on exterior front: rectangular frame, taut blade and teeth.
   const sawX=front+sgn*.23,sawZ=z+2.38,syy=top+1.32;
   for(const zz of [sawZ-.34,sawZ+.34])B(sawX,syy,zz,.08,.64,.065,light);
   B(sawX,syy+.23,sawZ,.08,.07,.76,wood);B(sawX,syy-.24,sawZ,.025,.055,.68,iron);
   for(let i=0;i<15;i++)B(sawX,syy-.275,sawZ-.3+i*.043,.025,.034,.021,iron).rotation.x=.4;
   E([sawX,syy+.29,sawZ-.34],[sawX,syy+.29,sawZ+.34],.012,0xaaa087);
   // Bench mallet, chisel, square and cut timber offcuts.
   E([x+.55,by+.04,z-4.62],[x+1.03,by+.04,z-4.42],.047,light);
   B(x+.57,by+.10,z-4.62,.14,.15,.32,wood);
   B(x+1.2,by+.035,z-4.5,.07,.06,.28,light);B(x+1.2,by+.02,z-4.28,.055,.03,.19,iron);
   B(x+1.65,by+.025,z-4.45,.27,.045,.047,iron);B(x+1.52,by+.025,z-4.58,.047,.045,.29,iron);
   // Curled shavings have thin curled sections and tapering chips on the ground.
   for(let i=0;i<23;i++){
    const xx=tx+Math.sin(i*2.4)*.63,zz=tz+Math.cos(i*1.7)*1.38,yy=heightAt(xx,zz)+.025;
    const sh=M(new THREE.TorusGeometry(.045+.015*(i%3),.009,4,10,Math.PI*1.65),mat(0xc1a474),xx,yy+.026,zz);sh.rotation.x=Math.PI/2;sh.rotation.z=i;
   }
   for(let i=0;i<5;i++)B(x+2.18,p.y+.07+i*.055,z-4.53,.15,.05,.67-i*.06,light).rotation.y=i*.09;
  }
  // All assembly and geometry nodes receive the exact owned prefix.
  let serial=0;g.traverse(o=>{if(o!==g)o.name=`${g.name}_${serial++}`});
 }
 return world;
}
