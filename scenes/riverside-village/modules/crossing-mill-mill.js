import { heightAt, bankZ, waterLevel, roadNetwork, layout, claimDistrict } from './root.js';
import { claimStructure } from './crossing-mill.js';

export function build(THREE, ctx) {
  claimDistrict('crossing-mill'); claimStructure('mill');
  const g=new THREE.Group(); g.name='crossing-mill-mill working watermill';
  const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9});
  const stone=M(0x938c77), stoneLight=M(0xaca48c), mortar=M(0x777362), plaster=M(0xd9c49c), wood=M(0x62472e), board=M(0x8c6942), endgrain=M(0xa58556), dark=M(0x263632), iron=M(0x3e4540), roof=M(0x6e756e), tileLight=M(0x7b8076), tileDark=M(0x6f786f), sack=M(0xc5ae76), dirt=M(0xaea17c), foam=M(0xa9d1bc), water=new THREE.MeshStandardMaterial({color:0x528f8a,roughness:.27,metalness:.1});
  const mesh=(geo,mat,x=0,y=0,z=0)=>{let o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
  const box=(x,y,z,w,h,d,mat)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  const beam=(a,b,w,d,mat=wood)=>{let A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),o=box(...A.clone().add(B).multiplyScalar(.5).toArray(),w,A.distanceTo(B),d,mat);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());return o;};
  function batch(geo,mat,items){let o=new THREE.InstancedMesh(geo,mat,items.length),d=new THREE.Object3D();items.forEach((v,i)=>{d.position.set(v[0],v[1],v[2]);d.rotation.set(v[6]||0,v[7]||0,v[8]||0);d.scale.set(v[3],v[4],v[5]);d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
  let seed=842;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  function surface(x0,z0,x1,z1,mat,lift=.23){let vs=[],ix=[],nx=Math.ceil((x1-x0)/1),nz=Math.ceil((z1-z0)/1);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;vs.push(x,heightAt(x,z)+lift,z);}for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let a=j*(nx+1)+i;ix.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();return mesh(geo,mat);}
  const m=layout().mill, x=m.x,z=m.z+1,w=m.w,d=Math.min(m.d,12), floor=4.6, middle=8.8,eave=13.2,rise=5.0;
  // Continuous founded masonry volume; coursed face blocks are instanced.
  let minGround=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))-.55;
  box(x,(minGround+middle)/2,z,w,middle-minGround,d,mortar);
  let blocks=[[],[]];
  for(let face of [-1,1])for(let row=0;row<12;row++)for(let i=-1;i<14;i++){
    let lo=Math.max(-w/2,-w/2+(i+(row%2)*.5)*w/13),hi=Math.min(w/2,-w/2+(i+1+(row%2)*.5)*w/13);if(hi-lo<.08)continue;
    let xx=x+(lo+hi)/2,zz=z+face*(d/2+.045),yy=middle-.3-row*.52;if(yy<heightAt(xx,zz)-.3)continue;
    blocks[rand()>.7?1:0].push([xx,yy,zz,hi-lo-.065,.45,.18]);
  }
  for(let face of [-1,1])for(let row=0;row<12;row++)for(let i=-1;i<11;i++){
    let lo=Math.max(-d/2,-d/2+(i+(row%2)*.5)*d/10),hi=Math.min(d/2,-d/2+(i+1+(row%2)*.5)*d/10);if(hi-lo<.08)continue;
    let xx=x+face*(w/2+.045),zz=z+(lo+hi)/2,yy=middle-.3-row*.52;if(yy<heightAt(xx,zz)-.3)continue;
    blocks[rand()>.7?1:0].push([xx,yy,zz,.18,.45,hi-lo-.065]);
  }
  batch(new THREE.BoxGeometry(1,1,1),stone,blocks[0]);batch(new THREE.BoxGeometry(1,1,1),stoneLight,blocks[1]);
  box(x,(middle+eave)/2,z,w,eave-middle,d,plaster);
  for(let zz of [z-d/2-.13,z+d/2+.13]){
    for(let y of [middle,eave])box(x,y,zz,w+.4,.28,.27,wood);
    for(let xx of [x-7.85,x-4,x,x+4,x+7.85])box(xx,(middle+eave)/2,zz,.27,eave-middle,.28,wood);
    for(let xx of [x-6,x+6])beam([xx-1.7,middle+.2,zz],[xx+1.7,eave-.2,zz],.19,.19);
  }
  for(let xx of [x-w/2-.13,x+w/2+.13]){for(let yy of [middle,eave])box(xx,yy,z,.28,.28,d+.4,wood);for(let zz of [-40.8,-37,-33,-29.2])box(xx,11,zz,.28,4.4,.27,wood);for(let zz of [-39,-31])beam([xx,9,zz-1.6],[xx,13,zz+1.6],.19,.19);}
  // Solid plaster gables and complete thin roof slopes, individually coursed slate shingles.
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
  mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),plaster,x,eave,z-d/2);
  let half=w/2+.65, rr=rise+.35, slope=Math.atan2(rr,half),len=Math.hypot(half,rr);
  let shingles=[[],[]];
  for(let side of [-1,1]){
    let o=box(x+side*half/2,eave+rr/2,z,len,.22,d+1.4,roof);o.rotation.z=-side*slope;
    for(let row=0;row<13;row++)for(let col=0;col<21;col++){let t=(row+.5)/13,xx=x+side*half*t,yy=eave+rr*(1-t)+.16,zz=z-(d+1.35)/2+(col+.5)*(d+1.35)/21;shingles[rand()>.54?1:0].push([xx,yy,zz,len/13+.07,.095,(d+1.35)/21-.025,0,0,-side*slope]);}
    for(let zz of [z-d/2-.7,z+d/2+.7])beam([x,eave+rr+.1,zz],[x+side*half,eave,zz],.23,.23,wood);
  }
  batch(new THREE.BoxGeometry(1,1,1),tileLight,shingles[0]);batch(new THREE.BoxGeometry(1,1,1),tileDark,shingles[1]);
  box(x,eave+rr+.12,z,.38,.23,d+1.6,roof);
  for(let zz of [z-d/2-.17,z+d/2+.17]){box(x,eave+2.3,zz,.25,4.6,.25,wood);for(let side of [-1,1])beam([x,eave+rise,zz],[x+side*7.9,eave,zz],.23,.23);box(x,eave+.05,zz,16,.28,.27,wood);}
  function window(xx,yy,zz,face=1,ww=1.25,hh=1.7){let q=new THREE.Group();q.position.set(xx,yy,zz);q.rotation.y=face===2?Math.PI/2:face===-2?-Math.PI/2:face===-1?Math.PI:0;g.add(q);const qb=(a,b,c,u,v,t,mat)=>{let o=new THREE.Mesh(new THREE.BoxGeometry(u,v,t),mat);o.position.set(a,b,c);q.add(o);o.castShadow=true;};qb(0,0,.04,ww,hh,.12,dark);for(let a of [-1,1]){qb(a*(ww/2+.1),0,.16,.17,hh+.3,.2,wood);qb(0,a*(hh/2+.1),.16,ww+.35,.17,.2,wood);}qb(0,0,.2,.085,hh,.1,endgrain);qb(0,0,.2,ww,.08,.1,endgrain);qb(0,-hh/2-.2,.22,ww+.5,.15,.5,stoneLight);}
  for(let face of [-1,1])for(let xx of [x-5.9,x-2,x+2,x+5.9])window(xx,11,z+face*(d/2+.2),face,1.15,1.75);
  for(let side of [-1,1])for(let zz of [-38.9,-31.1]){window(x+side*(w/2+.2),11,zz,side*2);window(x+side*(w/2+.2),6.65,zz,side*2,1.05,1.4);}
  window(x,15,z+d/2+.2,1,1.7,1.65);
  // South double grain door, small upper loft door and roofed loading hoist.
  box(x,6.38,z-d/2-.2,2.8,3.55,.25,dark);
  const planks=[];for(let i=0;i<12;i++)planks.push([x-1.33+i*.242,6.38,z-d/2-.37,.224,3.5,.13]);batch(new THREE.BoxGeometry(1,1,1),board,planks);
  for(let xx of [x-1.55,x+1.55])box(xx,6.45,z-d/2-.43,.22,3.9,.32,wood);box(x,8.38,z-d/2-.43,3.35,.23,.32,wood);
  for(let yy of [5.5,7.2])box(x,yy,z-d/2-.46,2.8,.14,.08,iron);
  box(x,15,z-d/2-.2,1.8,2.5,.19,board);for(let yy of [14.1,15.8])box(x,yy,z-d/2-.34,1.8,.14,.12,wood);
  beam([x,17.25,-40.9],[x,17.25,-43],.24,.25);beam([x,16.45,-40.9],[x,17.25,-42.55],.14,.14);
  beam([x,17.1,-42.7],[x,10.3,-42.7],.035,.035,iron);
  box(x,4.51,-41.6,3.3,.23,1.1,stoneLight);
  const chimneyX=x+4.4,chimneyZ=-32.3;box(chimneyX,16.5,chimneyZ,1.4,6.7,1.3,stone);for(let yy=14;yy<20;yy+=.43)box(chimneyX,yy,chimneyZ,1.46,.075,1.36,mortar);box(chimneyX,20,chimneyZ,1.85,.3,1.75,stoneLight);box(chimneyX,20.17,chimneyZ,1.03,.09,.94,dark);
  // Exact shared wheel: XY plane, axle parallel Z, low paddles touch the water.
  const W=m.wheel,cy=waterLevel+W.radius,R=W.radius, wz=W.z;
  for(let offset of [-.87,.87]){
    mesh(new THREE.TorusGeometry(R-.22,.23,8,64),wood,W.x,cy,wz+offset);
    mesh(new THREE.TorusGeometry(R-.75,.13,6,64),board,W.x,cy,wz+offset);
    mesh(new THREE.TorusGeometry(R-.22,.055,5,64),iron,W.x,cy,wz+offset*1.11);
    for(let i=0;i<12;i++){let a=i*Math.PI/6;beam([W.x+.3*Math.cos(a),cy+.3*Math.sin(a),wz+offset],[W.x+(R-.35)*Math.cos(a),cy+(R-.35)*Math.sin(a),wz+offset],.23,.26);}
  }
  let paddles=[];for(let i=0;i<36;i++){let a=i*Math.PI/18;paddles.push([W.x+(R-.2)*Math.cos(a),cy+(R-.2)*Math.sin(a),wz,.4,.72,2.08,0,0,a]);}batch(new THREE.BoxGeometry(1,1,1),board,paddles);
  function axle(xx,yy,zz,length,r,mat){let o=mesh(new THREE.CylinderGeometry(r,r,length,12),mat,xx,yy,zz);o.rotation.x=Math.PI/2;return o;}
  axle(W.x,cy,wz,2.65,.65,wood);axle(W.x,cy,(wz+1.9-29.8)/2,wz+1.9+29.8,.29,iron);
  for(let zz of [wz+1.75,-27.6]){let base=heightAt(W.x,zz)-.4;box(W.x,(base+cy-.38)/2,zz,1.6,cy-.38-base,1.05,stone);box(W.x,cy-.3,zz,2.1,.4,1.35,wood);axle(W.x,cy,zz,1.25,.43,iron);}
  // Low open race follows the river edge, east inlet to west outlet.
  const raceSouth=wz-1.42,raceNorth=wz+1.5,from=45,to=71;
  box((from+to)/2,waterLevel+.025,wz,to-from,.055,2.65,water);
  for(let zz of [raceSouth,raceNorth]){let courses=[];for(let xx=from;xx<to;xx+=1.3){let ground=heightAt(xx,zz)-.35,top=1.8;box(xx+.6,(ground+top)/2,zz,1.22,top-ground,.42,mortar);for(let yy=.15;yy<1.8;yy+=.45)courses.push([xx+.6,yy,zz,1.2,.38,.49]);}batch(new THREE.BoxGeometry(1,1,1),stone,courses);}
  for(let zz of [raceSouth,raceNorth])beam([to,1.65,zz],[to+3,waterLevel+.12,bankZ(to+3,-1)+(zz===raceNorth?3.4:.1)],.36,.4,stone);
  // Adjustable sluice gate stands across the inlet, leaving a visible opening below it.
  const gateX=66.4;for(let zz of [raceSouth-.05,raceNorth+.05]){box(gateX,2.15,zz,.38,4.2,.38,wood);beam([gateX,3.7,zz],[gateX+1.3,1.7,zz],.18,.18);}
  box(gateX,4.1,wz,.45,.37,3.65,wood);for(let yy=1.3;yy<2.9;yy+=.28)box(gateX,yy,wz,.22,.24,2.7,board);beam([gateX,2.5,wz],[gateX,4.85,wz],.09,.09,iron);
  let hand=mesh(new THREE.TorusGeometry(.46,.065,6,18),iron,gateX,4.8,wz);hand.rotation.y=Math.PI/2;
  for(let zz of [raceSouth-.8,raceNorth+.8])box(gateX+1.2,1.97,zz,.24,.16,1.8,wood);
  for(let j=0;j<8;j++)box(gateX+.65+j*.16,1.95,wz,.14,.15,4.6,board);
  let ripples=[];for(let i=0;i<70;i++){let xx=45+rand()*25,zz=wz+(rand()-.5)*2.45;ripples.push([xx,.68,zz,.15+rand()*.7,.02,.04]);}batch(new THREE.BoxGeometry(1,1,1),foam,ripples);
  // Ground-following yard and accesses. Route clearance is checked against shared polyline.
  const lane=roadNetwork().find(r=>r.id==='south-lane');
  function roadDistance(xx,zz){let dist=Infinity;for(let i=1;i<lane.points.length;i++){let [ax,az]=lane.points[i-1],[bx,bz]=lane.points[i],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((xx-ax)*dx+(zz-az)*dz)/(dx*dx+dz*dz)));dist=Math.min(dist,Math.hypot(xx-ax-t*dx,zz-az-t*dz));}return dist;}
  surface(40,-60,78,-52,dirt);surface(64,-54,68,-39,dirt);surface(51.8,-43,58.2,-41.5,dirt);
  let grit=[];for(let i=0;i<700;i++){let xx=40+rand()*38,zz=-60+rand()*8;if(roadDistance(xx,zz)<lane.width/2+.4)continue;grit.push([xx,heightAt(xx,zz)+.26,zz,.08+rand()*.18,.03,.08+rand()*.17]);}batch(new THREE.BoxGeometry(1,1,1),stoneLight,grit);
  function barrel(xx,zz){let yy=heightAt(xx,zz)+.24;mesh(new THREE.CylinderGeometry(.48,.48,1.22,12),board,xx,yy+.61,zz);for(let h of [.16,.61,1.06]){let t=mesh(new THREE.TorusGeometry(.49,.045,5,12),iron,xx,yy+h,zz);t.rotation.x=Math.PI/2;}mesh(new THREE.CylinderGeometry(.45,.45,.07,12),endgrain,xx,yy+1.25,zz);}
  for(let p of [[42,-54],[43.2,-54.1],[42.4,-55.4],[74,-52.5],[75.2,-52.7]])barrel(...p);
  // Grain bags stacked on a low timber pallet, each tied at the neck.
  const palletX=47,palletZ=-55.8,palletY=heightAt(palletX,palletZ)+.26;for(let j=0;j<7;j++)box(palletX-1.4+j*.46,palletY+.15,palletZ,.39,.23,2.2,wood);
  for(let i=0;i<9;i++){let xx=palletX+(i%3-1)*.82,zz=palletZ+(Math.floor(i/3)-1)*.6,yy=palletY+.75;let o=mesh(new THREE.SphereGeometry(.55,10,8),sack,xx,yy,zz);o.scale.set(.73,1,.61);mesh(new THREE.CylinderGeometry(.13,.10,.21,7),sack,xx,yy+.51,zz);}
  // Timber stack, spacer bearers and sawn ends.
  for(let zz of [-58.7,-56.8])box(62,heightAt(62,zz)+.4,zz,4,.26,.3,wood);
  const timber=[];for(let row=0;row<4;row++)for(let col=0;col<5;col++)timber.push([60.5+col*.65,heightAt(62,-58)+.7+row*.29,-58,.57,.23,3.5]);batch(new THREE.BoxGeometry(1,1,1),board,timber);
  // Open work shelter remains fully south of the lane.
  const sx=72,sz=-56.8,sy=heightAt(sx,sz)+.24;
  for(let xx of [sx-3.8,sx+3.8])for(let zz of [sz-2.5,sz+2.5]){let low=heightAt(xx,zz);box(xx,(low+sy+3.9)/2,zz,.27,sy+3.9-low,.27,wood);}
  for(let zz of [sz-2.5,sz+2.5])box(sx,sy+3.8,zz,8,.25,.3,wood);
  for(let side of [-1,1]){let o=box(sx+side*2.1,sy+4.6,sz,4.5,.2,6.25,roof);o.rotation.z=-side*.365;}
  for(let xx of [sx-3.8,sx+3.8])for(let zz of [sz-2.5,sz+2.5])beam([xx,sy+2.8,zz],[xx+(xx<sx?1:-1),sy+3.8,zz],.16,.16);
  box(sx,sy+1.2,sz-1.2,5,.19,1.15,board);for(let xx of [sx-2,sx+2])for(let zz of [sz-1.55,sz-.85])box(xx,sy+.6,zz,.15,1.2,.15,wood);
  for(let i=0;i<5;i++)box(sx-1.9+i*.72,sy+1.44,sz-1.2,.52,.3,.7,endgrain);
  // Four-wheel grain cart with plank bed, axle, spoked iron-shod wheels and draw shafts.
  const cx=55.2,cz=-55.3,gy=heightAt(cx,cz)+.24,bed=gy+1.25;
  for(let i=0;i<7;i++)box(cx-.95+i*.32,bed,cz,.29,.16,3.35,board);
  for(let side of [-1,1])for(let yy of [bed+.35,bed+.77])box(cx+side*1.15,yy,cz,.12,.31,3.5,board);
  for(let xx of [cx-1.15,cx+1.15])for(let zz of [cz-1.45,cz+1.45])box(xx,bed+.48,zz,.13,1.1,.14,wood);
  for(let zz of [cz-1.17,cz+1.17]){beam([cx-1.5,gy+.7,zz],[cx+1.5,gy+.7,zz],.17,.17,iron);for(let xx of [cx-1.45,cx+1.45]){let o=mesh(new THREE.TorusGeometry(.7,.09,6,20),wood,xx,gy+.73,zz);o.rotation.y=Math.PI/2;let t=mesh(new THREE.TorusGeometry(.75,.04,5,20),iron,xx,gy+.73,zz);t.rotation.y=Math.PI/2;for(let i=0;i<8;i++){let a=i*Math.PI/4;beam([xx,gy+.73,zz],[xx,gy+.73+.66*Math.sin(a),zz+.66*Math.cos(a)],.065,.065,board);}}}
  for(let xx of [cx-.78,cx+.78])beam([xx,bed-.25,cz+1.5],[xx,gy+.48,cz+4.25],.13,.14);
  for(let i=0;i<3;i++){let o=mesh(new THREE.SphereGeometry(.52,10,8),sack,cx+(i-1)*.58,bed+.45,cz);o.scale.set(.65,.75,1);}
  // Millstone and hand tools make the sheltered yard a working place.
  const msx=68.8,msz=-59.2,msy=heightAt(msx,msz);let ms=mesh(new THREE.CylinderGeometry(.83,.83,.28,24),stoneLight,msx,msy+.37,msz);mesh(new THREE.CylinderGeometry(.14,.14,.30,12),dark,msx,msy+.39,msz);
  for(let xx of [76.2,76.55])beam([xx,heightAt(xx,-58.8)+.25,-58.8],[xx-.4,sy+2.8,-59.15],.07,.07,board);
  return g;
}
