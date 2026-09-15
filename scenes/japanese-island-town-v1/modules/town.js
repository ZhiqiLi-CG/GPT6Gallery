import { heightAt, roadNetwork, layout } from './root.js';

// One common construction vocabulary; all placement uses the owner's live terrain and lanes.
export function build(THREE, ctx) {
 const source = new THREE.Group(), out = new THREE.Group(); out.name='town-inhabited-lanes';
 let parent=source;
 const records=[];
 function record(id,kind,from){source.updateMatrixWorld(true);let b=new THREE.Box3();for(let j=from;j<source.children.length;j++)b.expandByObject(source.children[j]);if(!b.isEmpty())records.push({id:'town_'+id,kind,bbox:[...b.min.toArray(),...b.max.toArray()].map(v=>Math.round(v*100)/100)})}
 const palettes=[0x78523a,0x68462f,0x896144,0x614531,0x967351];
 const materials=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.91}));return materials.get(c)};
 const cube=new THREE.BoxGeometry(1,1,1), cylinder=new THREE.CylinderGeometry(1,1,1,8), orb=new THREE.IcosahedronGeometry(1,1), stone=new THREE.DodecahedronGeometry(1,0);
 const mesh=(geo,c,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geo,material(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m};
 const box=(x,y,z,w,h,d,c)=>mesh(cube,c,x,y,z,w,h,d);
 const cyl=(x,y,z,r,h,c)=>mesh(cylinder,c,x,y,z,r,h,r);
 const ball=(x,y,z,r,c,sx=1,sy=1,sz=1)=>mesh(orb,c,x,y,z,r*sx,r*sy,r*sz);
 const beam=(a,b,r,c)=>{let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);let m=mesh(cylinder,c,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,v.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m};
 const roads=roadNetwork(), lots=layout().town.lots;
 function nearest(x,z){let best={distance:1e6};for(const r of roads)for(let i=1;i<r.points.length;i++){let a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz))),px=a[0]+t*dx,pz=a[1]+t*dz,dist=Math.hypot(x-px,z-pz);if(dist-r.width/2<best.distance)best={distance:dist-r.width/2,x:px,z:pz,width:r.width};}return best;}
 function clear(x,z,r=.5){if(x<-94||x>27||z<-73||z>37||Math.hypot(x+61,z+80)<10+r+.5)return false;if(nearest(x,z).distance<r+.5)return false;return !lots.some(l=>Math.abs(x-l.x)<l.w/2+r+.3&&Math.abs(z-l.z)<l.d/2+r+.3)}
 const occupied=[];
 function free(x,z,r=.5){return clear(x,z,r)&&!occupied.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+r)}
 function roof(w,d,y,rise,shade=0x485257){
  const half=d/2+.65, span=w+1.2, slope=Math.atan2(rise,half), len=Math.hypot(half,rise);
  for(const s of [-1,1]){
   let m=box(0,y+rise/2,s*half/2,span,.21,len,shade);m.rotation.x=s*slope;
   // Each raised tile channel runs from ridge to eave; fine transverse seams mark courses.
   for(let x=-span/2+.15;x<span/2;x+=.44)beam([x,y+rise+.13,0],[x,y+.13,s*half],.065,0x626a6b);
   for(let j=1;j<=7;j++){let t=j/7;box(0,y+rise*(1-t)+.15,s*half*t,span,.055,.055,0x363f44)}
   box(0,y-.05,s*half,span+.15,.23,.24,0x394447);
  }
  box(0,y+rise+.20,0,span+.28,.26,.35,0x343e43);
  for(let x of [-span/2,span/2]){ball(x,y+rise+.35,0,.23,0x525d60);for(let s of [-1,1])beam([x,y+rise,0],[x,y,s*half],.115,0x394347)}
 }
 function gable(w,d,y,rise,c){const vs=[];for(let x of [-w/2,w/2])vs.push(x,y,-d/2,x,y,d/2,x,y+rise,0);let ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));ge.setIndex([0,1,2,5,4,3]);ge.computeVertexNormals();let m=material(c).clone();m.side=THREE.DoubleSide;parent.add(new THREE.Mesh(ge,m));for(let x of [-w/2,w/2]){beam([x,y,-d/2],[x,y+rise,0],.10,0x4c3526);beam([x,y,d/2],[x,y+rise,0],.10,0x4c3526);beam([x,y,0],[x,y+rise,0],.095,0x4c3526)}}
 function windowPanel(x,y,z,w,h,turn=false,lit=false){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=turn?Math.PI/2:0;parent.add(g);let prev=parent;parent=g;
  box(0,0,0,w+.22,h+.20,.12,0x493728);box(0,0,-.08,w,h,.07,lit?0xe9d7a3:0xc7bfa5);
  for(let k=0;k<=4;k++)box(-w/2+w*k/4,0,-.14,.055,h,.055,0x6c5036);
  for(let k=0;k<=3;k++)box(0,-h/2+h*k/3,-.14,w,.045,.055,0x6c5036);
  box(0,-h/2-.16,-.14,w+.35,.13,.3,0x58412c);parent=prev;
 }
 function barrel(x,y,z,r=.44){cyl(x,y+.52,z,r,1.04,0x97734b);for(let h of [.13,.55,.94])cyl(x,y+h,z,r+.035,.075,0x4c4b3e);cyl(x,y+1.055,z,r*.89,.03,0xb28c59);for(let a=0;a<8;a++){let q=a*Math.PI/4;beam([x+r*Math.cos(q),y+.05,z+r*Math.sin(q)],[x+r*Math.cos(q),y+1,z+r*Math.sin(q)],.025,0x674c32)}}
 function basket(x,y,z){cyl(x,y+.27,z,.39,.5,0xb09760);cyl(x,y+.52,z,.41,.065,0xd0b578);for(let a=0;a<7;a++)ball(x+.22*Math.cos(a),y+.53,z+.22*Math.sin(a),.15,0x8b9e57)}
 function lantern(x,z){let y=heightAt(x,z);box(x,y+.13,z,.9,.25,.9,0x999b89);cyl(x,y+.65,z,.19,1,0x8d9284);box(x,y+1.17,z,.62,.18,.62,0xa7a798);box(x,y+1.54,z,.5,.65,.5,0x9c9e8f);for(let s of [-1,1]){box(x,y+1.55,z+s*.256,.28,.29,.02,0x4b5448);box(x+s*.256,y+1.55,z,.02,.29,.28,0x4b5448)}let m=mesh(new THREE.ConeGeometry(.66,.38,4),0x9b9e8c,x,y+2.02,z);m.rotation.y=Math.PI/4;ball(x,y+2.3,z,.16,0xa9aa98)}
 function pine(x,z,size=1){let y=heightAt(x,z);beam([x,y,z],[x+.35*size,y+5.6*size,z],.20*size,0x63503a);for(let j=0;j<4;j++){let a=j*2.4,xx=x+Math.cos(a)*1.4*size,zz=z+Math.sin(a)*1.4*size,yy=y+(3.1+j*.72)*size;beam([x+.2,y+(2.3+j*.65)*size,z],[xx,yy,zz],.095*size,0x63503a);ball(xx,yy+.3*size,zz,1.6*size,j%2?0x355846:0x43664a,1.3,.46,1)}ball(x+.35*size,y+6*size,z,1.45*size,0x416449,1,.6,1)}
 function cherry(x,z,size=1){let y=heightAt(x,z);beam([x,y,z],[x+.25,y+3.6*size,z],.17*size,0x645042);for(let j=0;j<5;j++){let a=j*2.4,xx=x+Math.cos(a)*1.25*size,zz=z+Math.sin(a)*1.25*size,yy=y+(3.6+(j%2)*.6)*size;beam([x,y+2*size,z],[xx,yy,zz],.075*size,0x695144);ball(xx,yy,zz,1.6*size,[0xe6b5b9,0xf0c8c8,0xd8a3b1][j%3],1,.8,1)}ball(x,y+4.8*size,z,1.25*size,0xefc8c9)}
 function stonePath(a,b,width=1.25){let L=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.ceil(L/.58);for(let k=0;k<=n;k++){let t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;box(x,heightAt(x,z)+.14,z,width,.19,.52,k%3?0xb1aa90:0x9b9b87)}}
 function fence(a,b){let L=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.ceil(L/.78);for(let j=0;j<=n;j++){let t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!clear(x,z,.18))continue;let y=heightAt(x,z);cyl(x,y+.68,z,.065,1.35,0xa08b58);if(j<n){let xx=a[0]+(b[0]-a[0])*(j+1)/n,zz=a[1]+(b[1]-a[1])*(j+1)/n;if(clear(xx,zz,.18))for(let h of [.45,1.05])beam([x,y+h,z],[xx,heightAt(xx,zz)+h,zz],.045,0x807044)}}}
 function yardSurface(l){
  const vertices=[],colors=[];
  for(let x=l.x-l.w/2-2;x<l.x+l.w/2+2;x+=.75)for(let z=l.z-l.d/2-2;z<l.z+l.d/2+2;z+=.75){
   if(nearest(x+.375,z+.375).distance<.6)continue;
   if(lots.some(o=>o!==l&&Math.abs(x-o.x)<o.w/2+.8&&Math.abs(z-o.z)<o.d/2+.8))continue;
   const corners=[[x,z],[x+.75,z],[x+.75,z+.75],[x,z+.75]],color=new THREE.Color(0xa7a083);color.multiplyScalar(1+.025*Math.sin(x*17+z*8));
   for(let k of [0,2,1,0,3,2]){let p=corners[k];vertices.push(p[0],heightAt(...p)+.055,p[1]);colors.push(color.r,color.g,color.b)}
  }
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ge.computeVertexNormals();source.add(new THREE.Mesh(ge,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})));
 }
 for(let i=0;i<lots.length;i++){
  const start=source.children.length;
  let l=lots[i],nr=nearest(l.x,l.z),dx=nr.x-l.x,dz=nr.z-l.z,theta=Math.abs(dx)>Math.abs(dz)?(dx>0?-Math.PI/2:Math.PI/2):(dz>0?Math.PI:0);
  yardSurface(l);
  let swap=Math.abs(Math.sin(theta))>.5,w=(swap?l.d:l.w)-.6,d=(swap?l.w:l.d)-.6;
  // The shore elbow comes close to this pad: a compact house faces the market instead.
  const atElbow=l.id==='lot11',anchorX=l.x+(atElbow?1.2:0);
  if(atElbow){theta=Math.PI;swap=false;w=6.4;d=6.0}
  let floor=l.y+.55;for(let xx of [-l.w/2,l.w/2])for(let zz of [-l.d/2,l.d/2])floor=Math.max(floor,heightAt(l.x+xx,l.z+zz)+.17);
  const world=(x,z)=>[anchorX+x*Math.cos(theta)+z*Math.sin(theta),l.z-x*Math.sin(theta)+z*Math.cos(theta)];
  // Courses of foundation stone step down to the actual slope on all four sides.
  const fw=atElbow?w+.3:l.w,fd=atElbow?d+.3:l.d;
  for(let side=0;side<4;side++){let horizontal=side<2,len=horizontal?fw:fd,n=Math.ceil(len/1.1);for(let j=0;j<n;j++){let t=-len/2+(j+.5)*len/n,x=anchorX+(horizontal?t:(side===2?-1:1)*fw/2),z=l.z+(horizontal?(side===0?-1:1)*fd/2:t),ground=heightAt(x,z)-.25,H=Math.max(.2,floor-ground);box(x,ground+H/2,z,horizontal?len/n:.25,H,horizontal?.25:len/n,0x83877b);for(let yy=floor-.42;yy>ground;yy-=.48)box(x,yy,z,horizontal?len/n-.045:.29,.032,horizontal?.29:len/n-.045,0x616e65)}}
  let home=new THREE.Group();home.position.set(anchorX,floor,l.z);home.rotation.y=theta;source.add(home);parent=home;
  let h=3.8+(i%4)*.49,wood=palettes[i%palettes.length];
  box(0,.1,0,w+.2,.22,d+.2,0x594332);
  box(0,h/2+.18,0,w,h,d,wood);
  // Timber boards wrap all four elevations, with ochre plaster under the upper eave.
  box(0,h-.33,0,w+.04,.85,d+.04,0xcebd94);
  for(let x=-w/2+.15;x<w/2;x+=.34)for(let s of [-1,1])box(x,h/2-.35,s*(d/2+.035),.025,h-.8,.06,0x4e392a);
  for(let z=-d/2+.15;z<d/2;z+=.34)for(let s of [-1,1])box(s*(w/2+.035),h/2-.35,z,.06,h-.8,.025,0x4e392a);
  for(let x of [-w/2,w/2])for(let z of [-d/2,d/2])box(x,h/2,z,.18,h+.3,.18,0x443527);
  for(let yy of [.38,h-1.0,h+.06]){for(let s of [-1,1]){box(0,yy,s*(d/2+.07),w+.15,.17,.16,0x4c3828);box(s*(w/2+.07),yy,0,.16,.17,d+.15,0x4c3828)}}
  // Sliding entrance and framed paper windows; each side is finished for compass views.
  box(0,1.32,-d/2-.09,1.7,2.45,.13,0x362c22);for(let s of [-1,1]){box(s*.39,1.27,-d/2-.17,.73,2.2,.06,0x9c8258);for(let k=0;k<4;k++)box(s*.39-.28+k*.19,1.27,-d/2-.22,.045,2.2,.055,0x56422e)}
  for(let x of [-w*.31,w*.31])windowPanel(x,1.9,-d/2-.12,1.5,1.55,false,i%4===0);
  for(let x of [-w*.25,w*.25]){let g=new THREE.Group();g.position.set(x,2.0,d/2+.12);g.rotation.y=Math.PI;parent.add(g);let save=parent;parent=g;windowPanel(0,0,0,1.55,1.4);parent=save}
  for(let s of [-1,1])for(let z of [-d*.23,d*.23]){let g=new THREE.Group();g.position.set(s*(w/2+.12),2.0,z);g.rotation.y=s<0?Math.PI/2:-Math.PI/2;parent.add(g);let save=parent;parent=g;windowPanel(0,0,0,1.4,1.45);parent=save}
  if(h>4.7)for(let x of [-w*.27,w*.27])windowPanel(x,h-.59,-d/2-.11,1.55,.64);
  gable(w,d,h+.16,1.95+(i%3)*.22,wood);roof(w,d,h+.17,1.95+(i%3)*.22,i%3===0?0x505c61:0x434e53);
  // Narrow front veranda, posts, roof canopy and individual wooden decking.
  for(let k=0;k<Math.floor(w/.35);k++)box(-w/2+.2+k*.35,.27,-d/2-.62,.33,.15,1.06,0x9b7850);
  for(let x of [-w/2+.3,w/2-.3])box(x,1.55,-d/2-.93,.13,2.7,.13,0x5e4530);
  let canopy=box(0,2.95,-d/2-.65,w+.1,.13,1.6,0x555f61);canopy.rotation.x=-.15;
  for(let x=-w/2+.15;x<w/2;x+=.5)beam([x,3.08,-d/2+.1],[x,2.86,-d/2-1.4],.05,0x788082);
  if(i%3===0||i===14){for(let k=0;k<4;k++)box(-.73+k*.48,2.24,-d/2-1.03,.44,.61,.045,i%2?0xb48e51:0x405e72);for(let k of [0,2])cyl(-.58+k*.4,2.23,-d/2-1.065,.1,.015,0xd2c4a0).rotation.x=Math.PI/2;box(w/2-.45,2.3,-d/2-1.06,.46,.83,.10,0xd4bc86);for(let k=0;k<3;k++)box(w/2-.45,2.5-k*.22,-d/2-1.12,.20,.055,.035,0x493f2e)}
  if(i%6===1){box(w*.27,h+1.4,d*.22,.58,2.2,.65,0x746e60);box(w*.27,h+2.57,d*.22,.83,.18,.88,0x4e5350)}
  barrel(w/2-.64,.34,-d/2-.57,.35);if(i%2===0)basket(-w/2+.55,.35,-d/2-.6);
  parent=source;
  let front=world(0,-d/2-1.15),road=nearest(...front),approachEnd=[road.x,road.z];
  let vx=front[0]-road.x,vz=front[1]-road.z,vl=Math.hypot(vx,vz);if(vl>.1)approachEnd=[road.x+vx/vl*(road.width/2+.12),road.z+vz/vl*(road.width/2+.12)];
  stonePath(front,approachEnd,1.35);
  // A short stair meets the raised veranda without erasing the sloping lane.
  const steps=Math.max(1,Math.ceil((floor+.28-heightAt(...front))/.24));for(let k=0;k<steps;k++){let p=world(0,-d/2-1.2-k*.28),yy=floor+.25-k*.24,ground=heightAt(...p);if(yy>ground)box(p[0],(ground+yy)/2,p[1],swap?.36:1.55,yy-ground,swap?1.55:.36,0xa4a28b)}
  // Private rear yards have a vegetable plot, bamboo enclosure and occasional storehouse.
  let rear=world(0,d/2+3.6),rx=rear[0],rz=rear[1];
  if(clear(rx,rz,1.7)){
   const size=3.4;for(let ix=0;ix<5;ix++)for(let iz=0;iz<5;iz++){let x=rx-size/2+ix*.72,z=rz-size/2+iz*.72;box(x,heightAt(x,z)+.045,z,.69,.1,.69,0x776343);if((ix+iz)%2===0){for(let a=0;a<3;a++){let leaf=ball(x+.1*Math.cos(a*2),heightAt(x,z)+.24,z+.1*Math.sin(a*2),.22,0x648050,1,.6,1)}}}
   for(let s of [-1,1])fence([rx-2,rz+s*2],[rx+2,rz+s*2]);fence([rx-2,rz-2],[rx-2,rz+2]);occupied.push({x:rx,z:rz,r:2.2});
  }
  if(i%3===1){for(let s of [-1,1]){let p=world(s*(w/2+2.7),d/2+1);if(!free(...p,1.8))continue;let by=heightAt(...p),minY=by;for(let ax of [-1.8,1.8])for(let az of [-1.8,1.8]){let sy=heightAt(p[0]+ax,p[1]+az);by=Math.max(by,sy);minY=Math.min(minY,sy)}
    box(p[0],(minY+by)/2,p[1],3.4,by-minY+.7,3.4,0x828574);
    let shed=new THREE.Group();shed.position.set(p[0],by+.28,p[1]);shed.rotation.y=theta;source.add(shed);parent=shed;
    box(0,1.05,0,3.1,2.1,2.7,0x765235);for(let x=-1.4;x<=1.4;x+=.34)for(let q of [-1,1])box(x,1.05,q*1.38,.045,2.1,.07,0x4e3b27);box(0,1,-1.4,1.18,1.92,.09,0x4b3827);gable(3.1,2.7,2.15,.9,0x806044);roof(3.1,2.7,2.15,.9);box(0,-.1,0,3.4,.5,3,0x828574);parent=source;occupied.push({x:p[0],z:p[1],r:2.4});break;
   }}
  record(l.id,'timber-house-with-private-yard-and-garden',start);
 }
 // Street furniture is placed in pockets outside lane widths and house footprints.
 const furnitureStart=source.children.length;
 for(let i=0;i<lots.length;i++){
  const l=lots[i];for(let s of [-1,1]){let x=l.x+s*(l.w/2+1.8),z=l.z-l.d/2-1.9;if(!free(x,z,.85))continue;let y=heightAt(x,z);
   if(i%4===0){lantern(x,z);occupied.push({x,z,r:1})}
   else if(i%4===1){barrel(x,y,z);barrel(x+.82,y,z+.3,.32);occupied.push({x,z,r:1.2})}
   else if(i%4===2){box(x,y+.75,z,1.8,.15,.9,0x937043);for(let sx of [-.72,.72])for(let sz of [-.3,.3])box(x+sx,y+.38,z+sz,.09,.75,.09,0x634b31);basket(x,y+.84,z);occupied.push({x,z,r:1.3})}
   else { // Two wheels, axle, slatted cart bed and long pulling shafts.
    box(x,y+.67,z,1.25,.18,2,0x997047);for(let q of [-1,1]){let wheel=cyl(x+q*.8,y+.5,z,.48,.12,0x4e4031);wheel.rotation.z=Math.PI/2;cyl(x+q*.8,y+.5,z,.16,.16,0xa58657).rotation.z=Math.PI/2;box(x+q*.6,y+1,z,.09,.65,2,0x967447);beam([x+q*.43,y+.71,z-.8],[x+q*.43,y+.39,z-2.5],.06,0x9c7b4c)}for(let k=0;k<5;k++)box(x,y+.85+k*.09,z+.96,1.2,.06,.07,0x95744c);basket(x,y+.8,z);occupied.push({x,z,r:2.5})}break;
  }
 }
 record('street_furniture','carts-barrels-market-tables-and-stone-lanterns',furnitureStart);
 // Small orchards and pines occupy the remaining slope pockets, not road or house space.
 const plantingStart=source.children.length;
 let seed=291;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0,count=0;i<900&&count<74;i++){let x=-93+rand()*119,z=-71+rand()*105,size=.72+rand()*.36;if(!free(x,z,2.5)||heightAt(x,z)<.8)continue;if(count%3===0)cherry(x,z,size);else pine(x,z,size);occupied.push({x,z,r:3.1});count++}
 // Low ferny hedges and yard boulders articulate ground at pedestrian scale.
 for(let i=0;i<200;i++){let x=-92+rand()*118,z=-69+rand()*105;if(!free(x,z,.55)||heightAt(x,z)<.8)continue;let y=heightAt(x,z);if(i%4===0)mesh(stone,0x8c9180,x,y+.21,z,.65,.43,.50);else for(let j=0;j<3;j++)ball(x+j*.29,y+.32,z,.40,0x60784c,1,.7,1)}
 record('yard_planting','cherry-and-pine-gardens-with-shrubs-and-stones',plantingStart);
 out.userData.objects=records;
 // Collapse repeated timber, tile, foliage and stone primitives into efficient instances.
 source.updateMatrixWorld(true);const batches=new Map();
 source.traverse(m=>{if(!m.isMesh)return;const key=m.geometry.uuid+'/'+m.material.uuid;if(!batches.has(key))batches.set(key,{geometry:m.geometry,material:m.material,matrices:[]});batches.get(key).matrices.push(m.matrixWorld.clone())});
 for(const b of batches.values()){let m=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((t,i)=>m.setMatrixAt(i,t));m.castShadow=true;m.receiveShadow=true;out.add(m)}
 return out;
}
