import {heightAt,roadNetwork,layout} from './root.js';

// Stable construction kit. Unit primitives are instanced per material to keep the town light.
export function kit(THREE){
 const group=new THREE.Group(), bins=new Map();
 const palette={wood:0x654b36,beam:0x49382b,board:0x967557,plaster:0xc5b89b,cream:0xd3c7aa,gray:0xa69f8d,tile:0x46545b,tile2:0x53636b,dark:0x293b42,stone:0x82827a,stone2:0x96948a,glass:0x283d39,soil:0x786448,rope:0xa18a58,leaf:0x4e6940,pink:0xcf92a0};
 const mats={}; for(const [k,v] of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:.91});
 const geos={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),ball:new THREE.IcosahedronGeometry(1,1),cap:new THREE.CylinderGeometry(1,1,1,8,1,false,0,Math.PI)};
 const dummy=new THREE.Object3D();
 function put(type,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+'|'+material;if(!bins.has(key))bins.set(key,[]);dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();bins.get(key).push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',rx=0,ry=0,rz=0){put('box',m,x,y,z,w,h,d,rx,ry,rz)}
 function cylinder(x,y,z,r,h,m='wood',rx=0,ry=0,rz=0){put('cyl',m,x,y,z,r,h,r,rx,ry,rz)}
 function ball(x,y,z,rx,ry,rz,m='leaf'){put('ball',m,x,y,z,rx,ry,rz)}
 function beam(a,b,r=.06,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();const key='cyl|'+m;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(dummy.matrix.clone());}
 function flush(){for(const [key,matrices] of bins){const [type,m]=key.split('|'),mesh=new THREE.InstancedMesh(geos[type],mats[m],matrices.length);matrices.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh)}bins.clear();return group}
 return {group,mats,put,box,cylinder,ball,beam,flush};
}

export function roadClear(x,z,extra=0){return roadNetwork().every(r=>r.points.slice(1).every((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>r.width/2+.35+extra}))}

// A complete shell with all four sides, true gables, under-eave rafters and individual ceramic tiles.
// Children own the returned group and may choose dimensions, storeys, tone and ridge direction.
export function createHouse(THREE,lot,options={}){
 const k=kit(THREE),{box,beam,put}=k;
 const n=Number(lot.id.split('-').at(-1)), w=options.w??(6.8+(n%3)*.22),d=options.d??(7.35+(n%2)*.35),stories=options.stories??(n%3===0?2:1),storyH=options.storyH??2.65;
 const base=lot.y+.5,h=stories*storyH,wall=options.tone??(['plaster','gray','cream'][n%3]),turn=options.ridgeAcross??(n%4===0);
 const X=(x,z)=>[lot.x+x,lot.z+z];
 // Individual masonry courses fill from sampled ground to the level sill.
 for(const side of [-1,1])for(let j=0;j<Math.ceil(d/.65);j++){const z=-d/2+(j+.5)*d/Math.ceil(d/.65),x=side*w/2,[wx,wz]=X(x,z),bottom=heightAt(wx,wz)-.18;for(let yy=bottom;yy<base-.1;yy+=.26){const hh=Math.min(.25,base-.1-yy);box(wx,yy+hh/2,wz,.4,hh,d/Math.ceil(d/.65)-.03,(j%3?'stone':'stone2'))}}
 for(const side of [-1,1])for(let j=0;j<Math.ceil(w/.68);j++){const x=-w/2+(j+.5)*w/Math.ceil(w/.68),z=side*d/2,[wx,wz]=X(x,z),bottom=heightAt(wx,wz)-.18;for(let yy=bottom;yy<base-.1;yy+=.26){const hh=Math.min(.25,base-.1-yy);box(wx,yy+hh/2,wz,w/Math.ceil(w/.68)-.025,hh,.4,(j%3?'stone':'stone2'))}}
 box(lot.x,base-.13,lot.z,w,.22,d,'beam');
 // Walls are segmented around real inset openings.
 function facade(axis,sgn,length){
  const along=(u,y,out=0)=>axis==='x'?[lot.x+sgn*(w/2+out),y,lot.z+u]:[lot.x+u,y,lot.z+sgn*(d/2+out)];
  function panel(u,y,ww,hh,th,m,out=0){const p=along(u,y,out);box(...p,axis==='x'?th:ww,hh,axis==='x'?ww:th,m)}
  const bays=3,bw=length/bays,isFront=axis==='x'&&sgn===(lot.front==='east'?1:-1);
  for(let s=0;s<stories;s++){
   const floor=base+s*storyH;
   for(let b=0;b<bays;b++){
    const u=-length/2+(b+.5)*bw,door=isFront&&b===1&&s===0,ow=door?1.36:1.42,oh=door?2.15:1.10,oy=door?floor+oh/2:floor+1.46;
    panel(u-bw/2+(bw-ow)/4,floor+storyH/2,(bw-ow)/2,storyH,.16,wall);
    panel(u+bw/2-(bw-ow)/4,floor+storyH/2,(bw-ow)/2,storyH,.16,wall);
    const low=oy-oh/2-floor,high=floor+storyH-(oy+oh/2);
    if(low>.01)panel(u,floor+low/2,ow,low,.16,wall);
    panel(u,floor+storyH-high/2,ow,high,.16,wall);
    panel(u,oy,ow,oh,.055,door?'board':'glass',-.035);
    for(const su of [-1,1])panel(u+su*(ow/2+.035),oy,.10,oh+.17,.22,'beam',.02);
    for(const sy of [-1,1])panel(u,oy+sy*(oh/2+.035),ow+.18,.10,.24,'wood',.04);
    for(let a=0;a<=(door?7:5);a++)panel(u-ow/2+a*ow/(door?7:5),oy,.035,oh,.075,'wood',.05);
    if(!door){panel(u,oy,ow,.04,.08,'wood',.06);panel(u+ow*.74,oy,.48,oh+.12,.08,'board',.09);for(let sl=0;sl<5;sl++)panel(u+ow*.74,oy-oh/2+sl*oh/4,.48,.025,.10,'beam',.105)}
    else {panel(u,oy+.3,ow,.06,.12,'beam',.07);panel(u+.16,oy-.1,.035,.22,.06,'dark',.12)}
   }
   for(let b=0;b<=bays;b++)panel(-length/2+b*bw,floor+storyH/2,.15,storyH+.15,.23,'beam',.015);
   for(const yy of [floor,floor+.55,floor+storyH])panel(0,yy,length+.18,.15,.22,'beam',.015);
   // Weatherboard lower skirt with narrow vertical joins.
   for(let u=-length/2+.15;u<length/2;u+=.23)panel(u,floor+.25,.018,.40,.18,'wood',.025);
  }
 }
 facade('x',-1,d);facade('x',1,d);facade('z',-1,w);facade('z',1,w);
 const rw=turn?d:w,rd=turn?w:d,e=.67,half=rw/2+e,roofZ=rd/2+.64,rise=options.rise??(2.1+n%3*.19),roofY=base+h;
 function coord(x,y,z){return turn?[lot.x+z,y,lot.z-x]:[lot.x+x,y,lot.z+z]}
 function rbox(x,y,z,ww,hh,dd,m,rz=0){box(...coord(x,y,z),ww,hh,dd,m,0,turn?Math.PI/2:0,rz)}
 // Filled timber gables on both ends.
 for(const s of [-1,1])for(let x=-rw/2+.12;x<rw/2;x+=.24){const gh=rise*(1-Math.abs(x)/half);rbox(x,roofY+gh/2,s*rd/2,.23,gh,.12,wall)}
 for(const s of [-1,1]){
  const a=coord(-half,roofY,s*rd/2),b=coord(0,roofY+rise,s*rd/2),c=coord(half,roofY,s*rd/2);beam(a,b,.095,'beam');beam(b,c,.095,'beam');beam(coord(0,roofY,s*rd/2),b,.095,'beam');
 }
 const slope=Math.atan2(rise,half),len=Math.hypot(half,rise);
 for(const side of [-1,1]){
  rbox(side*half/2,roofY+rise/2,0,len,.13,roofZ*2,'dark',-side*slope);
  rbox(side*half,roofY-.02,0,.13,.19,roofZ*2+.10,'wood');
  for(let z=-roofZ+.12;z<roofZ;z+=.43)beam(coord(0,roofY+rise-.12,z),coord(side*(half+.08),roofY-.14,z),.062,'wood');
  const rows=Math.ceil(len/.37),cols=Math.ceil(roofZ*2/.29);
  for(let a=0;a<rows;a++)for(let b=0;b<cols;b++){
   const t=(a+.5)/rows,x=side*half*t,y=roofY+rise*(1-t)+.12,z=-roofZ+(b+.5)*roofZ*2/cols;
   rbox(x,y,z,len/rows+.065,.065,roofZ*2/cols-.012,(a+b+n)%5===0?'tile2':'tile',-side*slope);
   // Rounded cover rolls run down the roof slope, interrupted at tile courses.
   const p=coord(side*half*(a/rows),roofY+rise*(1-a/rows)+.16,z),q=coord(side*half*((a+1)/rows),roofY+rise*(1-(a+1)/rows)+.16,z);beam(p,q,.039,'tile2');
  }
 }
 for(let z=-roofZ;z<roofZ;z+=.32)beam(coord(0,roofY+rise+.21,z),coord(0,roofY+rise+.21,z+.34),.135,'tile2');
 // Raised end ridge ornaments are restrained ceramic end caps.
 for(const s of [-1,1])rbox(0,roofY+rise+.27,s*roofZ,.26,.35,.20,'tile');
 // Entrance veranda, canopy and founded stepping stones towards the existing east lane.
 const sign=lot.front==='east'?1:-1;
 box(lot.x+sign*(w/2+.47),base-.04,lot.z,.9,.16,2.1,'wood');
 for(let j=0;j<7;j++)box(lot.x+sign*(w/2+.47),base+.049,lot.z-.9+j*.3,.91,.025,.018,'beam');
 const entryLane=roadNetwork().find(r=>r.id==='east-lane');
 const sx=lot.x+sign*(w/2+.7),ex=15.5-sign*(entryLane.width/2+.22),count=Math.ceil(Math.abs(ex-sx)/.43);
 for(let j=0;j<=count;j++){const x=sx+(ex-sx)*j/Math.max(count,1),gy=heightAt(x,lot.z);box(x,gy+.15,lot.z,.39,.23,1.05,'stone2')}
 // Small tiled entry canopy with visible brackets.
 box(lot.x+sign*(w/2+.55),base+2.38,lot.z,1.2,.13,2,'tile',0,0,sign*.10);
 for(const z of [-.8,.8])beam([lot.x+sign*w/2,base+1.93,lot.z+z],[lot.x+sign*(w/2+.95),base+2.31,lot.z+z],.052,'wood');
 const out=k.flush();out.name=lot.id+' detailed timber house';out.userData={lot:lot.id,base,w,d,h};return out;
}

// Parent-owned remnant above the children's z=28 boundary. Low vegetation preserves house views.
export function createNorthVerge(THREE){
 const k=kit(THREE);
 for(let i=0;i<41;i++){
  const x=-.52+i*.29,z=29.10+.13*Math.sin(i*.7);
  if(!roadClear(x,z,.28))continue;
  const y=heightAt(x,z),h=.18+.055*(i%3);
  k.box(x,y+h/2-.10,z,.265,h,.28,i%4?'stone':'stone2',0,.08*Math.sin(i),0);
  // Tufts root in the ground above the loose field-stone edging.
  if(i%2===0)for(let j=0;j<5;j++){
   const gx=x+.035*(j-2),gz=z+.30+.025*Math.sin(j*2),gy=heightAt(gx,gz);
   k.beam([gx,gy-.025,gz],[gx+.07*Math.sin(i+j),gy+.21+.035*(j%3),gz+.06*Math.cos(j)],.012,'leaf');
  }
  if(i%7===0){const gx=x+.07,gz=z+.36,gy=heightAt(gx,gz);k.ball(gx,gy+.06,gz,.17,.10,.14,'leaf')}
 }
 const g=k.flush();g.name='north verge outside household plots';return g;
}

export const rowOwners=['east-village-shore','east-village-nets','east-village-gardens','east-village-laundry','east-village-upper'];
// Final composition: all ten household systems are delivered in the five child modules.
// The shared architecture helpers above remain their stable construction dependency.
export function build(THREE,ctx){
 const out=new THREE.Group();out.name='east village northern verge';
 out.add(createNorthVerge(THREE));
 return out;
}
