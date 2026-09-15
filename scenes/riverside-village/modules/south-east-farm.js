import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { claimSouthCluster } from './south-bank.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimSouthCluster('east');
  const group=new THREE.Group();group.name='south-east-farm complete eastern holding';
  const palette={plaster:0xdfccb0,cream:0xd0b789,wood:0x6b5037,dark:0x45392d,roof:0x935943,slate:0x666d69,stone:0x969081,glass:0x394a47,shutter:0x667c5b,path:0xb5a17a,soil:0x6d5c3b,leaf:0x698747,leaf2:0x819849,grass:0x80974e,hay:0xc1aa63,iron:0x4a4b43,water:0x68958e,wool:0xe1d6b9,fruit:0xad6140};
  const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:.94})]));
  let seed=65432;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const batches=new Map(),dummy=new THREE.Object3D();
  function inst(type,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+':'+mat;if(!batches.has(key))batches.set(key,[]);batches.get(key).push([x,y,z,sx,sy,sz,rx,ry,rz]);}
  const box=(m,x,y,z,w,h,d,ry=0)=>inst('box',m,x,y,z,w,h,d,0,ry);
  function mesh(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mats[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  function beam(a,b,r,mat='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),c=av.clone().add(bv).multiplyScalar(.5);dummy.position.copy(c);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();const key='beam:'+mat;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(dummy.matrix.clone());}
  function path(points,width,material='path',lift=.27){const v=[],ix=[];for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/1.2);for(let i=0;i<n;i++){let o=v.length/3;for(const [t,s] of [[i/n,-1],[i/n,1],[(i+1)/n,-1],[(i+1)/n,1]]){let x=a[0]+dx*t-dz/len*width*s/2,z=a[1]+dz*t+dx/len*width*s/2;v.push(x,heightAt(x,z)+lift,z);}ix.push(o,o+2,o+1,o+1,o+2,o+3);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const m=mesh(geo,material);m.material=m.material.clone();m.material.side=THREE.DoubleSide;}
  function patch(x,z,w,d,material){for(let i=0;i<d;i+=1)path([[x-w/2,z-d/2+i],[x+w/2,z-d/2+i]],1.06,material,.29);}
  function fence(a,b,gate=false){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/2.8);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);box('wood',x,y+.8,z,.19,1.6,.19);if(i<n){const u=(i+1)/n,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u,yy=heightAt(xx,zz);for(let h of [.6,1.25])beam([x,y+h,z],[xx,yy+h,zz],.12);if(gate)beam([x,y+.45,z],[xx,yy+1.4,zz],.10);}}}
  function building(x,z,w,d,h,kind='house',roof='roof'){
    const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(x+a*w/2,z+b*d/2));const floor=Math.max(...corners)+.24,lo=Math.min(...corners)-.28;
    box('stone',x,(floor+lo)/2,z,w+.35,floor-lo,d+.35);box(kind==='house'?'plaster':'wood',x,floor+h/2,z,w,h,d);
    // Full gables, roof planes with thickness, eaves and ridge cap.
    const rise=w*.37,ww=w/2+.6,dd=d+1.2;const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),kind==='house'?'cream':'wood',x,floor+h,z-d/2);
    const ang=Math.atan2(rise,ww),slope=Math.hypot(ww,rise);for(let side of [-1,1])inst('box',roof,x+side*ww/2,floor+h+rise/2,z,slope,.22,dd,0,0,-side*ang);
    box(roof,x,floor+h+rise+.15,z,.34,.3,dd+.12);for(let s of [-1,1])box('dark',x+s*ww,floor+h-.06,z,.17,.2,dd);
    // Weathered roof courses.
    for(let s of [-1,1])for(let k=1;k<7;k++){let t=k/7;box(roof,x+s*ww*t,floor+h+rise*(1-t)+.14,z,.11,.1,dd);}
    for(let s of [-1,1]){for(let q of [-1,1])box('dark',x+s*(w/2-.06),floor+h/2,z+q*(d/2-.06),.19,h,.19);box('dark',x,floor+h-.12,z+s*d/2,w,.21,.15);for(let hh of [.3,h-.1])box('dark',x+s*w/2,floor+hh,z,.17,.18,d);}
    for(let k=0;k<4;k++)box('dark',x,floor+.6+k*(h-1)/3,z+d/2+.03,w,.1,.12);
    const doorW=kind==='barn'?3.6:kind==='stable'?2.3:1.35,doorH=kind==='barn'?3.8:2.35;
    box('dark',x,floor+doorH/2,z+d/2+.08,doorW+.24,doorH+.18,.18);box('wood',x,floor+doorH/2,z+d/2+.19,doorW,doorH,.13);
    for(let i=0;i<Math.ceil(doorW/.25);i++)box('cream',x-doorW/2+i*.25,floor+doorH/2,z+d/2+.265,.035,doorH,.018);
    for(let hh of [.6,doorH-.45])box('iron',x,floor+hh,z+d/2+.3,doorW,.10,.07);
    box('stone',x,floor+.02,z+d/2+.48,doorW+.5,.25,.85);
    for(let i=1;i<=3;i++){const zz=z+d/2+.6+i*.34,ground=heightAt(x,zz),top=floor*(1-i/4)+ground*(i/4)+.05;box('stone',x,(ground+top)/2,zz,doorW+.5,Math.max(.12,top-ground),.4);}
    const frontZ=z+d/2+.95;path([[x,frontZ],[x,frontZ+2.2]],doorW+.55);
    // Front and rear casement windows and solid shutters; side windows are fully modelled too.
    function window(wx,wz,side=false){let wy=floor+3.6;box('dark',wx,wy,wz,side?.17:1.35,1.55,side?1.35:.17);box('glass',wx+(side?.09:0),wy,wz+(side?0:.09),side?.08:1.08,1.29,side?1.08:.08);for(let s of [-1,1])box('shutter',wx+(side?.13:s*.95),wy,wz+(side?s*.95:.13),side?.15:.43,1.58,side?.43:.15);box('cream',wx+(side?.16:0),wy,wz+(side?0:.16),side?.08:.09,1.35,side?.09:.08);box('cream',wx+(side?.16:0),wy,wz+(side?0:.16),side?.08:1.1,.08,side?1.1:.08);box('stone',wx,wy-.86,wz,side?.32:1.6,.15,side?1.6:.32);}
    if(kind==='house'){for(let s of [-1,1])for(let q of [-1,1])window(x+s*w*.29,z+q*(d/2+.12));for(let q of [-1,1])window(x+w/2+.12,z+q*d*.25,true);for(let q of [-1,1]){box('dark',x-w/2-.12,floor+3.6,z+q*d*.25,.17,1.55,1.35);box('shutter',x-w/2-.21,floor+3.6,z+q*d*.25,.12,1.43,1.23);}}
    else {for(let s of [-1,1]){box('dark',x+s*w*.33,floor+h-.9,z+d/2+.1,1.3,.9,.15);box('shutter',x+s*w*.33+.8,floor+h-.9,z+d/2+.16,.35,1,.16);window(x+s*w*.28,z-d/2-.13);}
      beam([x-doorW/2,floor+.4,z+d/2+.32],[x+doorW/2,floor+doorH-.3,z+d/2+.32],.12);for(let side of [-1,1])for(let k=0;k<d/.5;k++)box('dark',x+side*(w/2+.03),floor+h/2,z-d/2+k*.5,.055,h,.045);}
    box('stone',x-w*.23,floor+h+rise+.1,z-d*.22,1,2.7,1.1);box('dark',x-w*.23,floor+h+rise+1.48,z-d*.22,1.25,.24,1.35);
    return {x,z,w,d,floor,front:frontZ+2.2};
  }
  const sites=layout();const homes=sites.southHouses.filter(([x])=>x>=80);const homeA=building(...homes[0],10,11,5.8),homeB=building(...homes[1],11,11,5.8,'house','slate');
  const [bx,bz]=sites.barns.find(([x])=>x>80);const barn=building(bx,bz,14,19,6.7,'barn');
  const stable=building(123,-102,8,11,4.2,'stable','slate');const shed=building(83,-107,6,9,3.4,'shed');
  // Existing lane and landing remain owned by the parent. These paths end at their edges.
  const lane=roadNetwork().find(r=>r.id==='south-lane');
  function laneZ(x){for(let i=0;i<lane.points.length-1;i++){const a=lane.points[i],b=lane.points[i+1];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}}
  path([[99,laneZ(99)-lane.width/2],[99,-70],[99,-94],[105,-100]],3.4);
  path([[82,-64.05],[82,-66],[86,homeA.front]],2.1);path([[86,homeA.front],[94,-65],[99,-70]],1.7);
  path([[111,homeB.front],[111,-71],[99,-71]],1.7);
  patch(105,-98,22,11,'path');path([[98,barn.front],[98,-99]],3.7);path([[123,stable.front],[121,-94],[110,-94]],2.4);path([[83,shed.front],[88,-99],[97,-99]],2.1);
  // Paddock perimeter and real cross-braced gate facing the working yard.
  const paddock=[[46,-98],[76,-98],[76,-136],[47,-139],[46,-98]];for(let i=0;i<paddock.length-1;i++){let a=paddock[i],b=paddock[i+1];if(i===1){fence(a,[76,-112]);fence([76,-116],b);fence([76,-112],[76,-116],true);}else fence(a,b);}
  path([[76,-114],[79,-114],[79,-99],[94,-99]],2.2);
  // Cottage gardens with cultivated earth, walking strips, rows and orchard crops.
  for(let z of [-74,-80,-86]){patch(69,z,12,3.6,'soil');for(let x=64;x<=74;x+=1.1)for(let dz of [-.9,.0,.9])inst('ball',(Math.floor(x+z)%2?'leaf':'leaf2'),x,heightAt(x,z+dz)+.6,z+dz,.48,.45,.48);}
  path([[82,-66],[77,-69],[77,-91],[89,-99]],1.4);fence([61,-70],[61,-90]);fence([61,-90],[75,-90]);fence([61,-70],[72,-70]);fence([72,-70],[75,-70],true);path([[73.5,-70],[77,-70]],1.2);
  for(let x of [130,137,144])for(let z of [-115,-125,-136]){const xx=x+(rand()-.5)*1.1,zz=z+(rand()-.5)*1.8,y=heightAt(xx,zz),h=4.2+rand();inst('cyl','wood',xx,y+h/2,zz,.32,h,.32);for(let k=0;k<4;k++){let a=k*Math.PI/2;beam([xx,y+2.5,zz],[xx+Math.cos(a)*1.6,y+4.1,zz+Math.sin(a)*1.6],.17);inst('ball',k%2?'leaf':'leaf2',xx+Math.cos(a)*1.2,y+4.3,zz+Math.sin(a)*1.2,2.3,2.1,2.2);}for(let j=0;j<9;j++){let a=rand()*6.28;inst('ball','fruit',xx+Math.cos(a)*2.3,y+3.9+rand(),zz+Math.sin(a)*2.3,.18,.18,.18);}}
  path([[121,-94],[130,-94],[130,-111],[126,-118],[126,-138]],1.3);
  // Field margin shrubs and long grass soften all transitions, sampled on the terrain.
  const margins=[[[42,-94],[43,-145]],[[44,-145],[147,-146]],[[148,-142],[148,-80]],[[47,-94],[72,-94]],[[130,-76],[144,-79]]];
  for(const [a,b]of margins){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let i=0;i<n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t+(rand()-.5)*1.9,z=a[1]+(b[1]-a[1])*t+(rand()-.5)*1.9;inst('ball',i%2?'grass':'leaf',x,heightAt(x,z)+.35,z,.7+rand()*.6,.5+rand()*.7,.6+rand()*.4);}}
  for(let i=0;i<1400;i++){let x=40+rand()*108,z=-148+rand()*81;const field=(x<59&&z< -72)||(x<76&&z<-97)||(x>129&&z<-89)||(z<-132);if(!field)continue;const y=heightAt(x,z);inst('cone',i%3?'grass':'hay',x,y+.36,z,.10+rand()*.13,.5+rand()*.5,.10+rand()*.13);}
  // Hay stacks, covered firewood and useful yard furniture.
  for(let [x,z,r] of [[86,-119,2.4],[81,-122,1.8],[87,-124,1.5]]){let y=heightAt(x,z);inst('cyl','hay',x,y+1.4,z,r,2.8,r);inst('cone','hay',x,y+3.1,z,r*1.14,1.6,r*1.14);box('wood',x,y+3.6,z,.13,2,.13);}
  for(let row=0;row<3;row++)for(let k=0;k<9-row;k++)inst('cyl','wood',88.5+k*.35+row*.1,heightAt(90,-110)+.3+row*.3,-110,.16,2,.16,Math.PI/2);
  box('slate',90,heightAt(90,-110)+1.55,-110,4,.16,2.8);for(let x of [88.3,91.7])box('wood',x,heightAt(x,-110)+.8,-110,.14,1.6,.14);
  function trough(x,z){let y=heightAt(x,z);box('stone',x,y+.3,z,3.5,.5,1.3);for(let s of [-1,1])box('stone',x,y+.75,z+s*.58,3.5,.65,.17);for(let s of [-1,1])box('stone',x+s*1.68,y+.75,z,.17,.65,1.2);box('water',x,y+.83,z,3.12,.04,.96);}
  trough(73,-108);trough(120,-92);
  const cartX=109,cartZ=-97,cartY=heightAt(cartX,cartZ);box('wood',cartX,cartY+1.05,cartZ,2.3,.23,3.4);
  for(let s of [-1,1])for(let k=0;k<3;k++)box('wood',cartX+s*1.12,cartY+1.25+k*.25,cartZ,.12,.16,3.4);box('wood',cartX,cartY+1.55,cartZ-1.65,2.3,.9,.15);
  for(let s of [-1,1])for(let t of [-1,1]){const x=cartX+s*1.3,z=cartZ+t*1.13,y=cartY+.72;const wheel=mesh(new THREE.TorusGeometry(.66,.09,6,16),'dark',x,y,z);wheel.rotation.y=Math.PI/2;for(let a=0;a<Math.PI;a+=Math.PI/4)beam([x,y+Math.sin(a)*.58,z+Math.cos(a)*.58],[x,y-Math.sin(a)*.58,z-Math.cos(a)*.58],.07);}
  for(let s of [-1,1])beam([cartX+s*.8,cartY+1.05,cartZ+1.5],[cartX+s*.8,heightAt(cartX,cartZ+5)+.22,cartZ+5],.13);
  // Sheep are complete small animals with four feet, heads and ears.
  for(let i=0;i<12;i++){const x=51+rand()*19,z=-103-rand()*29,y=heightAt(x,z);inst('ball','wool',x,y+.93,z,.66,.65,1.0);inst('ball','dark',x,y+1.04,z+.9,.30,.35,.40);for(let a of [-1,1])for(let b of [-1,1])inst('cyl','dark',x+a*.35,y+.35,z+b*.55,.095,.7,.095);for(let s of [-1,1])inst('ball','wool',x+s*.30,y+1.23,z+.87,.23,.09,.13);}
  for(let [x,z] of [[89,-68],[115,-77],[121,-94]]){const y=heightAt(x,z);inst('cyl','wood',x,y+.55,z,.46,1.1,.46);for(let h of [.17,.86]){const ring=mesh(new THREE.TorusGeometry(.47,.045,4,12),'iron',x,y+h,z);ring.rotation.x=Math.PI/2;}}
  // Shoreline geography is used as an explicit inland limit; no farm planting enters its reserve.
  group.userData.shorelineLimit=bankZ(82,-1)-5;group.userData.bounds=ctx.bounds;
  for(const [key,items] of batches){const [type,mat]=key.split(':');let geo=type==='box'?new THREE.BoxGeometry(1,1,1):type==='ball'?new THREE.IcosahedronGeometry(1,1):type==='cone'?new THREE.ConeGeometry(1,1,6):new THREE.CylinderGeometry(type==='beam'?.5:1,type==='beam'?.5:1,1,7);const m=new THREE.InstancedMesh(geo,mats[mat],items.length);items.forEach((v,i)=>{if(type==='beam')m.setMatrixAt(i,v);else{dummy.position.set(...v.slice(0,3));dummy.rotation.set(...v.slice(6));dummy.scale.set(...v.slice(3,6));dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}});m.castShadow=true;m.receiveShadow=true;m.name='south-east-farm '+key;group.add(m);}
  return group;
}
