import {heightAt,roadNetwork,layout} from './root.js';

// Version 1 optional district construction kit. Coordinates are world metres.
export const villagePairs = [
 {id:'central-village-south',lots:[1,2],z:-48},
 {id:'central-village-market',lots:[3,4],z:-33},
 {id:'central-village-tea',lots:[5,6],z:-10},
 {id:'central-village-gardens',lots:[7,8],z:6},
 {id:'central-village-north',lots:[9,10],z:22}
];
export function laneClear(x,z,margin=0){
 for(const road of roadNetwork())for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
  if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<road.width/2+0.35+margin)return false;
 }return true;
}
export function createVillageKit(THREE,parent){
 const mats=new Map(),geos=new Map();
 const material=(color)=>{if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:0.9}));return mats.get(color)};
 const wood=material(0x65503c),dark=material(0x423b30),stone=material(0x87867b);
 const geo=(key,f)=>{if(!geos.has(key))geos.set(key,f());return geos.get(key)};
 function mesh(geometry,mat,x=0,y=0,z=0,group=parent){const m=new THREE.Mesh(geometry,typeof mat==='number'?material(mat):mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
 function box(x,y,z,w,h,d,mat=wood,group=parent){const m=mesh(geo('box',()=>new THREE.BoxGeometry(1,1,1)),mat,x,y,z,group);m.scale.set(w,h,d);return m}
 function cylinder(x,y,z,rt,rb,h,mat=wood,n=10,group=parent){return mesh(geo(`c${rt},${rb},${h},${n}`,()=>new THREE.CylinderGeometry(rt,rb,h,n)),mat,x,y,z,group)}
 function beam(a,b,width=0.12,mat=wood,group=parent,depth=width){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,v.length(),depth,mat,group);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
 // Solid, curved-at-eaves gable roof. w is CROSS-ridge; d is ALONG-ridge.
 // axis:'x' rotates the entire roof and gables 90 degrees about world y.
 function roof({x,y,z,w,d,rise=2.1,axis='z',tileColor=0x4b5659,gableColor=0xb6aa8b}){
  const g=new THREE.Group();g.position.set(x,y,z);if(axis==='x')g.rotation.y=Math.PI/2;parent.add(g);
  const tile=material(tileColor),under=material(0x594a38),gable=material(gableColor);
  const R=w/2,profile=t=>rise*(1-t)+0.26*t**7;
  const steps=12,cols=Math.ceil(d/0.32),spacing=d/cols;
  const tileGeom=new THREE.CylinderGeometry(0.075,0.075,1,8,1,true);
  const tileBatch=new THREE.InstancedMesh(tileGeom,tile,steps*cols*2);tileBatch.castShadow=true;tileBatch.receiveShadow=true;g.add(tileBatch);
  const dummy=new THREE.Object3D();let index=0;
  for(const sign of [-1,1])for(let k=0;k<steps;k++){
   const t0=k/steps,t1=(k+1)/steps,xa=sign*R*t0,xb=sign*R*t1,ya=profile(t0),yb=profile(t1);
   // Thick contiguous timber-backed ceramic strips support the overlaid roll tiles.
   const a=[xa,ya,0],b=[xb,yb,0];const length=Math.hypot(xb-xa,yb-ya);
   beam(a,b,0.14,tile,g,d);
   for(let j=0;j<cols;j++){
    dummy.position.set((xa+xb)/2,(ya+yb)/2+0.08,-d/2+spacing*(j+0.5));
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(xb-xa,yb-ya,0).normalize());
    dummy.scale.set(1,length+0.07,1);dummy.updateMatrix();tileBatch.setMatrixAt(index++,dummy.matrix);
   }
   // Narrow raised transverse lips expose the overlapping course structure.
   box(xb,yb+0.045,0,0.058,0.08,d+0.05,tile,g);
  }
  tileBatch.instanceMatrix.needsUpdate=true;
  for(let j=0;j<=Math.ceil(d/0.55);j++){
   const zz=-d/2+j*d/Math.ceil(d/0.55);
   for(const sign of [-1,1])for(let k=0;k<4;k++)beam([sign*R*k/4,profile(k/4)-0.19,zz],[sign*R*(k+1)/4,profile((k+1)/4)-0.19,zz],0.105,under,g);
  }
  for(const zz of [-d/2,d/2]){
   for(const sign of [-1,1])for(let k=0;k<6;k++)beam([sign*R*k/6,profile(k/6)-0.08,zz],[sign*R*(k+1)/6,profile((k+1)/6)-0.08,zz],0.19,dark,g);
   // Closed timber/plaster gable inside the eaves, with applied king-post framing.
   const endZ=zz-Math.sign(zz)*0.52,gw=R-0.62,gy=profile(gw/R);
   const shape=new THREE.Shape();shape.moveTo(-gw,0);shape.lineTo(-gw,gy);shape.lineTo(0,rise-0.12);shape.lineTo(gw,gy);shape.lineTo(gw,0);shape.closePath();
   mesh(new THREE.ExtrudeGeometry(shape,{depth:0.16,bevelEnabled:false}),gable,0,-0.10,endZ-0.08,g);
   beam([-gw,0,endZ],[gw,0,endZ],0.18,dark,g);beam([0,0,endZ],[0,rise-0.12,endZ],0.18,dark,g);
   for(const sign of [-1,1])beam([sign*gw,0,endZ],[0,rise-0.12,endZ],0.12,wood,g);
  }
  for(let j=0;j<Math.ceil(d/0.38);j++){
   const cap=cylinder(0,rise+0.13,-d/2+(j+0.5)*d/Math.ceil(d/0.38),0.19,0.19,d/Math.ceil(d/0.38)+0.045,tile,10,g);cap.rotation.x=Math.PI/2;
  }
  for(const sign of [-1,1])box(sign*R,profile(1)-0.06,0,0.18,0.21,d+0.12,dark,g);
  return g;
 }
 function foundation(x,z,w,d,top){
  // Perimeter stones extend into sampled ground; no elevated unsupported slabs.
  for(const side of [-1,1])for(let j=0;j<Math.ceil(w/0.70);j++){
   const xx=x-w/2+(j+0.5)*w/Math.ceil(w/0.70),zz=z+side*d/2,ground=heightAt(xx,zz)-0.15;
   const rows=Math.max(1,Math.ceil((top-ground)/0.29));for(let k=0;k<rows;k++)box(xx,ground+(k+0.5)*(top-ground)/rows,zz,w/Math.ceil(w/0.70)-0.025,(top-ground)/rows-0.014,0.40,[0x87867b,0x73766f,0x969185][(j+k)%3]);
  }
  for(const side of [-1,1])for(let j=0;j<Math.ceil(d/0.70);j++){
   const xx=x+side*w/2,zz=z-d/2+(j+0.5)*d/Math.ceil(d/0.70),ground=heightAt(xx,zz)-0.15;
   const rows=Math.max(1,Math.ceil((top-ground)/0.29));for(let k=0;k<rows;k++)box(xx,ground+(k+0.5)*(top-ground)/rows,zz,0.40,(top-ground)/rows-0.014,d/Math.ceil(d/0.70)-0.025,[0x87867b,0x73766f,0x969185][(j+k)%3]);
  }
  box(x,top-0.11,z,w+0.22,0.22,d+0.22,stone);
 }
 function fence(a,b,h=1.0){
  const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.35),posts=[];
  for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=heightAt(x,z);if(!laneClear(x,z,0.10)){posts.push(null);continue}box(x,y+h/2,z,0.13,h+0.13,0.13,wood);posts.push([x,y,z])}
  for(let i=1;i<posts.length;i++)if(posts[i-1]&&posts[i])for(const level of [0.35,0.80])beam([posts[i-1][0],posts[i-1][1]+h*level,posts[i-1][2]],[posts[i][0],posts[i][1]+h*level,posts[i][2]],0.09,wood);
 }
 function lantern(x,z,scale=1){const y=heightAt(x,z),s=scale;
  // Local footing stones penetrate each sampled corner on sloping inter-row ground.
  for(const dx of [-0.23,0.23])for(const dz of [-0.23,0.23]){
   const xx=x+dx*s,zz=z+dz*s,low=Math.min(y-0.035*s,heightAt(xx,zz)-0.13*s),top=y+0.035*s;
   box(xx,(low+top)/2,zz,0.45*s,top-low,0.45*s,((dx+dz)>0?0x797c70:0x88867c));
  }
  box(x,y+0.12*s,z,0.92*s,0.26*s,0.92*s,stone);cylinder(x,y+0.36*s,z,0.32*s,0.42*s,0.22*s,stone,8);
  cylinder(x,y+0.94*s,z,0.15*s,0.20*s,1.02*s,stone,8);
  // Separate collars expose the column's fitted stone joints.
  cylinder(x,y+0.46*s,z,0.207*s,0.207*s,0.065*s,0x99978a,8);
  cylinder(x,y+1.42*s,z,0.18*s,0.18*s,0.07*s,0x99978a,8);
  box(x,y+1.51*s,z,0.71*s,0.18*s,0.71*s,stone);
  // Real hollow fire chamber, framed square openings on all four faces.
  for(const dx of [-0.26,0.26])for(const dz of [-0.26,0.26])box(x+dx*s,y+1.86*s,z+dz*s,0.11*s,0.53*s,0.11*s,stone);
  for(const side of [-1,1]){
   box(x+side*0.26*s,y+1.655*s,z,0.11*s,0.12*s,0.43*s,stone);
   box(x,y+1.655*s,z+side*0.26*s,0.43*s,0.12*s,0.11*s,stone);
   box(x+side*0.26*s,y+2.065*s,z,0.11*s,0.12*s,0.43*s,stone);
   box(x,y+2.065*s,z+side*0.26*s,0.43*s,0.12*s,0.11*s,stone);
  }
  box(x,y+2.105*s,z,0.46*s,0.025*s,0.46*s,0x45463e);
  // An open bronze oil cup and wick are visible through the chamber windows.
  cylinder(x,y+1.645*s,z,0.145*s,0.09*s,0.075*s,0x4e5548,14);
  cylinder(x,y+1.684*s,z,0.122*s,0.122*s,0.008*s,0x262d24,16);
  const rim=mesh(geo(`lamp-rim-${s}`,()=>new THREE.TorusGeometry(0.136*s,0.012*s,6,18)),material(0x656a50),x,y+1.69*s,z);rim.rotation.x=Math.PI/2;
  beam([x+0.055*s,y+1.685*s,z],[x+0.085*s,y+1.73*s,z],0.015*s,0x39392d);
  cylinder(x,y+2.17*s,z,0.58*s,0.42*s,0.18*s,stone,4).rotation.y=Math.PI/4;
  cylinder(x,y+2.34*s,z,0.12*s,0.58*s,0.28*s,stone,4).rotation.y=Math.PI/4;
  cylinder(x,y+2.54*s,z,0.05*s,0.14*s,0.17*s,stone,8);
  // Restrained mineral/moss patches sit on the exposed plinth, not in the street.
  for(let i=0;i<10;i++){
   const angle=i*2.39996,rr=(0.30+0.065*Math.sin(i*3.1))*s;
   const patch=mesh(geo('lantern-moss',()=>new THREE.IcosahedronGeometry(1,0)),material(i%3===0?0x8b9172:0x69745c),x+Math.cos(angle)*rr,y+0.254*s,z+Math.sin(angle)*rr);
   patch.scale.set((0.025+0.012*(i%3))*s,0.004*s,0.021*s);
  }
 }
 return {material,mesh,box,cylinder,beam,roof,foundation,fence,lantern,wood,dark,stone};
}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Central village stone lanterns';const k=createVillageKit(THREE,g);
 // The five delivered pair modules own all ten houses and their worked yards.
 // Temporary envelopes are retired; this module retains only shared lanterns.
 for(const [x,z] of [[-20.45,-40.5],[-14.6,-19.3],[-20.4,-2],[-14.6,14]])if(laneClear(x,z,0.65))k.lantern(x,z,0.84);
 return g;
}
