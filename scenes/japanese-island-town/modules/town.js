import { heightAt, roadNetwork, layout } from './root.js';

// Town owns the complete house shells. Children furnish the three street pairs.
export function build(THREE, ctx) {
 const group = new THREE.Group(); group.name='Thirty-six timber townhouses with ceramic tiled roofs';
 const colors={timber:'#624534',dark:'#3c3028',plank:'#866246',plank2:'#76533d',cream:'#c7bba0',paper:'#d0c9ae',glass:'#516967',stone:'#7d8076',stone2:'#939285',tile:'#596369',tile2:'#657077',tile3:'#48555b',cap:'#465157',step:'#a19b86',red:'#934b3b',blue:'#465c68'};
 const mats={}; for(const [k,c] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.86});
 const boxGeo=new THREE.BoxGeometry(1,1,1), batches=new Map(), dummy=new THREE.Object3D();
 function add(geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geo.uuid+mat; if(!batches.has(key))batches.set(key,{geo,mat:mats[mat],items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='timber',rx=0,ry=0,rz=0){add(boxGeo,m,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,r=.07,m='timber'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);dummy.position.copy(av.clone().add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r*2,d.length(),r*2);dummy.updateMatrix();const key=boxGeo.uuid+m;if(!batches.has(key))batches.set(key,{geo:boxGeo,mat:mats[m],items:[]});batches.get(key).items.push(dummy.matrix.clone());}
 function roofTile(s,slope){const v=[],idx=[];for(let j=0;j<2;j++)for(let k=0;k<=6;k++){const t=k/6*Math.PI,dx=-.19*Math.cos(t),dz=j*.57;v.push(dx,.065*Math.sin(t)-slope*dz+j*.037,s*dz);}for(let k=0;k<6;k++)idx.push(...(s>0?[k,k+7,k+1,k+1,k+7,k+8]:[k,k+1,k+7,k+1,k+8,k+7]));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();return g;}
 const capGeo=new THREE.CylinderGeometry(.17,.17,.48,9,1,false,0,Math.PI*2);
 const roads=roadNetwork(); // Shared authoritative roads; also used by the yard children.
 for(let i=0;i<layout().town.lots.length;i++){
  const l=layout().town.lots[i], x=l.x,z=l.z,w=l.w-(i%3)*.25,d=7.0+(i%2)*.3,sign=l.face==='north'?1:-1;
  const sample=[];for(const dx of [-w/2,0,w/2])for(const dz of [-d/2,0,d/2])sample.push(heightAt(x+dx,z+dz));
  const low=Math.min(...sample)-.3,floor=Math.max(...sample)+.38,h=3.5+(i%4)*.26+(i%9===3?1.8:0),ey=floor+h,run=d/2+.76,rise=1.72+(i%3)*.16,ridge=ey+rise,slope=rise/run;
  // A masonry plinth closes the entire slope under the floor, with individually coursed exposed stones.
  box(x,(low+floor)/2,z,w+.24,floor-low,d+.24,'stone');
  // Staggered, level masonry courses on all four exposed foundation faces.
  for(const side of [-1,1])for(const axis of ['x','z']){
   const span=axis==='x'?w:d;
   for(let row=0,yy=floor-.18;yy>low;row++,yy-=.35){
    for(let u=-span/2-.4+(row%2)*.4;u<span/2;u+=.8){
     const start=Math.max(-span/2,u),end=Math.min(span/2,u+.76);if(end<=start)continue;
     const mid=(start+end)/2,xx=axis==='x'?x+mid:x+side*(w/2+.13),zz=axis==='x'?z+side*(d/2+.13):z+mid;
     if(yy+.16<heightAt(xx,zz)-.05)continue;
     box(xx,yy,zz,axis==='x'?end-start:.10,.29,axis==='x'?.10:end-start,(row+Math.floor((u+span)*5)+i)%3?'stone':'stone2');
    }
   }
  }
  box(x,floor+.1,z,w+.4,.2,d+.4,'dark');
  box(x,floor+h/2,z,w,h,d,i%4===1?'cream':'plank');
  // Closely spaced boards on all four faces, plus framing rails and posts.
  for(let xx=-w/2+.12;xx<w/2;xx+=.28)for(const side of [-1,1])box(x+xx,floor+h*.33,z+side*(d/2+.022),.025,h*.66,.055,'plank2');
  for(let zz=-d/2+.12;zz<d/2;zz+=.28)for(const side of [-1,1])box(x+side*(w/2+.022),floor+h*.33,z+zz,.055,h*.66,.025,'plank2');
  for(const side of [-1,1]){for(const xx of [-w/2,-w/4,0,w/4,w/2])box(x+xx,floor+h/2,z+side*(d/2+.06),.15,h+.12,.16,'dark');for(const yy of [.24,2.5,h-.1])box(x,floor+yy,z+side*(d/2+.075),w+.22,.14,.17,'dark');for(const zz of [-d/2,0,d/2])box(x+side*(w/2+.06),floor+h/2,z+zz,.16,h+.12,.15,'dark');for(const yy of [.24,2.5,h-.1])box(x+side*(w/2+.06),floor+yy,z,.16,.14,d+.16,'dark');}
  function window(xx,yy,zz,wide,tall,sideWall=false){if(!sideWall){box(xx,yy,zz,wide+.17,tall+.18,.13,'dark');box(xx,yy,zz+Math.sign(zz-z)*.08,wide,tall,.07,i%3?'paper':'glass');for(let k=-wide/2;k<=wide/2+.01;k+=.27)box(xx+k,yy,zz+Math.sign(zz-z)*.13,.045,tall,.045,'timber');for(let k=-tall/2;k<=tall/2+.01;k+=.32)box(xx,yy+k,zz+Math.sign(zz-z)*.13,wide,.04,.045,'timber');}else{box(xx,yy,zz,.13,tall+.18,wide+.17,'dark');box(xx+Math.sign(xx-x)*.08,yy,zz,.07,tall,wide,'paper');for(let k=-wide/2;k<=wide/2+.01;k+=.27)box(xx+Math.sign(xx-x)*.13,yy,zz+k,.045,tall,.045,'timber');for(let k=-tall/2;k<=tall/2+.01;k+=.32)box(xx+Math.sign(xx-x)*.13,yy+k,zz,.045,.04,wide,'timber');}}
  for(const side of [-1,1]){window(x-w*.28,floor+1.75,z+side*(d/2+.14),1.65,1.35);window(x+w*.28,floor+1.75,z+side*(d/2+.14),1.65,1.35);window(x+side*(w/2+.14),floor+1.8,z,1.8,1.25,true);if(h>5)for(const xx of [-2.1,2.1])window(x+xx,floor+4.1,z+side*(d/2+.14),2.0,1.1);}
  const front=z+sign*(d/2+.16);box(x,floor+1.15,front,1.65,2.3,.16,'dark');box(x,floor+1.15,front+sign*.1,1.4,2.16,.12,'plank2');for(let k=-.6;k<=.6;k+=.2)box(x+k,floor+1.46,front+sign*.18,.045,1.35,.055,'timber');box(x+.1,floor+1.03,front+sign*.22,.07,.14,.05,'dark');
  // Entrance stoop and terrain-fitted stairs remain inside the parcel's approach strip.
  box(x,floor-.06,front+sign*.52,2.2,.24,1,'timber');
  const endGround=heightAt(x,front+sign*3.8)+.12,drop=Math.max(.2,floor-endGround),steps=Math.max(2,Math.ceil(drop/.23)),tread=3.0/steps;
  for(let k=0;k<steps;k++){const zz=front+sign*(.9+(k+.5)*tread),ground=heightAt(x,zz),top=Math.max(ground+.07,floor-(k+1)*drop/steps);box(x,(top+ground)/2,zz,1.85,Math.max(.08,top-ground),tread+.025,'step');}
  if(drop>.9)for(const side of [-1,1]){let last=null;for(let k=0;k<=4;k++){const t=k/4,zz=front+sign*(.9+t*3),yy=Math.max(heightAt(x,zz)+.1,floor-t*drop);box(x+side*.99,yy+.42,zz,.095,.88,.095,'timber');const point=[x+side*.99,yy+.87,zz];if(last)beam(last,point,.055,'dark');last=point;}}
  // Timber gable ends fully enclose the triangular roof volume.
  for(const side of [-1,1]){const shoulder=rise-slope*d/2,vs=[0,0,-d/2,0,0,d/2,0,shoulder,d/2,0,rise,0,0,shoulder,-d/2],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex([0,1,2,0,2,3,0,3,4]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mats.plank2);m.material=mats.plank2.clone();m.material.side=THREE.DoubleSide;m.position.set(x+side*w/2,ey,z);group.add(m);beam([x+side*(w/2+.02),ey+shoulder,z-d/2],[x+side*(w/2+.02),ridge,z],.07,'dark');beam([x+side*(w/2+.02),ridge,z],[x+side*(w/2+.02),ey+shoulder,z+d/2],.07,'dark');box(x+side*(w/2+.04),ey+rise*.38,z,.1,rise*.77,.13,'dark');}
  const eaveInfill=rise-slope*d/2;
  for(const side of [-1,1])box(x,ey+eaveInfill/2,z+side*(d/2-.07),w,eaveInfill+.08,.16,'dark');
  const roofWidth=w+1.25,angle=Math.atan(slope),length=Math.hypot(run,rise);
  for(const side of [-1,1]){box(x,ey+rise/2,z+side*run/2,roofWidth,.12,length,'tile',side*angle);const tileGeo=roofTile(side,slope);const nx=Math.ceil(roofWidth/.38),nz=Math.ceil(run/.5);for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){const xx=x-roofWidth/2+.19+a*(roofWidth-.38)/(nx-1),zz=b*(run-.5)/(nz-1);add(tileGeo,['tile','tile2','tile3'][(a*7+b*5+i)%3],xx,ridge-zz*slope+.065,z+side*zz);}
   box(x,ey-.08,z+side*run,roofWidth+.14,.19,.18,'dark');for(let xx=-w/2;xx<=w/2;xx+=.46)beam([x+xx,ey+eaveInfill-.13,z+side*(d/2-.1)],[x+xx,ey-.13,z+side*(run+.06)],.052,'timber');
   for(const end of [-1,1])beam([x+end*roofWidth/2,ridge+.08,z],[x+end*roofWidth/2,ey+.06,z+side*run],.085,'cap');
  }
  box(x,ridge+.13,z,roofWidth+.28,.19,.28,'cap');for(let xx=-roofWidth/2;xx<roofWidth/2;xx+=.46)add(capGeo,'cap',x+xx,ridge+.29,z,1,1,1,0,0,Math.PI/2);for(const end of [-1,1]){box(x+end*(roofWidth/2+.04),ridge+.29,z,.19,.46,.42,'cap');box(x+end*(roofWidth/2+.11),ridge+.52,z,.27,.12,.48,'cap');}
  // Door awnings, shop curtains and sign brackets add variety without intruding into the lanes.
  box(x,floor+2.58,front+sign*.47,2.55,.11,1.0,'tile',sign*.12);for(const dx of [-1.02,1.02])beam([x+dx,floor+2.5,front+sign*.8],[x+dx,floor+1.94,front],.045,'timber');
  if(i%4===1||i%7===0){for(let q=0;q<4;q++)box(x-.67+q*.45,floor+2.02,front+sign*.78,.42,.70,.035,i%2?'blue':'red');for(let q=0;q<4;q++)box(x-.67+q*.45,floor+2.12,front+sign*.81,.13,.12,.012,'paper');box(x+w*.38,floor+2.13,front+sign*.28,.65,1.26,.18,'dark');for(let q=0;q<3;q++){box(x+w*.38,floor+2.49-q*.3,front+sign*.39,.29,.045,.012,'cream');box(x+w*.38+.06,floor+2.44-q*.3,front+sign*.39,.04,.17,.012,'cream');}}
  if(i%6===2){const xx=x+2.1,zz=z+.8,yy=ridge-.8*slope;box(xx,yy+.55,zz,.42,1.25,.42,'dark');box(xx,yy+1.23,zz,.7,.13,.65,'tile');}
 }
 for(const batch of batches.values()){const m=new THREE.InstancedMesh(batch.geo,batch.mat,batch.items.length);batch.items.forEach((mx,i)=>m.setMatrixAt(i,mx));m.castShadow=true;m.receiveShadow=true;group.add(m);}
 return group;
}
