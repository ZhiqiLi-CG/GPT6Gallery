import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { centralHoldings, claimCentralHolding } from './south-central-farms.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimCentralHolding('west');
  const h=centralHoldings().west, g=new THREE.Group();g.name='south-central-west working farm';
  const shared={shore:bankZ(-19,-1),roads:roadNetwork(),layout:layout(),bounds:ctx.bounds};
  let seed=3471; const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.94});
  const M={plaster:mat(0xd9c6a1),wood:mat(0x725039),lightwood:mat(0x997653),dark:mat(0x453b2e),stone:mat(0x918c7b),roof:mat(0x954f38),tile:mat(0xac6649),slate:mat(0x646b6c),glass:mat(0x314a49),shutter:mat(0x667653),dirt:mat(0xb29c75),soil:mat(0x65513a),grass:mat(0x87994c),leaf:mat(0x597c36),leaf2:mat(0x759443),hay:mat(0xc6ab59),iron:mat(0x44463c),water:mat(0x6b9690),wool:mat(0xe4dcc3),fruit:mat(0xb35e35)};
  const boxGeo=new THREE.BoxGeometry(1,1,1), ballGeo=new THREE.IcosahedronGeometry(1,1), batches=new Map();
  const temp=new THREE.Object3D();
  function inst(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geo.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo,m,items:[]});temp.position.set(x,y,z);temp.scale.set(sx,sy,sz);temp.rotation.set(rx,ry,rz);temp.updateMatrix();batches.get(key).items.push(temp.matrix.clone());}
  const box=(x,y,z,w,t,d,m,rx=0,ry=0,rz=0)=>inst(boxGeo,m,x,y,z,w,t,d,rx,ry,rz);
  const ball=(x,y,z,sx,sy,sz,m)=>inst(ballGeo,m,x,y,z,sx,sy,sz);
  function beam(a,b,width,m){const delta=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));temp.position.set(...a).addScaledVector(delta,.5);temp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());temp.scale.set(width,delta.length(),width);temp.updateMatrix();const key=boxGeo.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo:boxGeo,m,items:[]});batches.get(key).items.push(temp.matrix.clone());}
  function patch(cx,cz,w,d,m,lift=.25){const geo=new THREE.PlaneGeometry(w,d,Math.ceil(w),Math.ceil(d));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(cx+p.getX(i),cz+p.getZ(i))+lift);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.position.set(cx,0,cz);mesh.receiveShadow=true;g.add(mesh);}
  function path(points,width=2.3){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),v=[],idx=[],n=Math.ceil(len/.8);for(let j=0;j<=n;j++){for(const s of [-1,1]){const x=a[0]+dx*j/n-dz/len*width*s/2,z=a[1]+dz*j/n+dx/len*width*s/2;v.push(x,heightAt(x,z)+.29,z);}if(j<n){let k=j*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,M.dirt);m.receiveShadow=true;g.add(m);}}
  function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2.6);for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=heightAt(x,z);box(x,y+.88,z,.19,1.85,.19,M.wood);if(i){const px=a[0]+(b[0]-a[0])*(i-1)/n,pz=a[1]+(b[1]-a[1])*(i-1)/n;for(const lift of [.65,1.25])beam([px,heightAt(px,pz)+lift,pz],[x,y+lift,z],.13,M.lightwood);}}}
  function gate(x,z,w,angle=0){const y=heightAt(x,z);for(const dx of [-w/2,w/2])box(x+dx,y+.92,z,.3,1.95,.3,M.wood);const pivot=new THREE.Vector3(x-w/2,y,z);const ex=x-w/2+w*Math.cos(angle),ez=z+w*Math.sin(angle);for(const lift of [.5,1.2])beam([pivot.x,y+lift,z],[ex,heightAt(ex,ez)+lift,ez],.14,M.lightwood);beam([pivot.x,y+.5,z],[ex,heightAt(ex,ez)+1.2,ez],.12,M.lightwood);}
  function building(site,w,d,wallH,roofMat,isBarn=false){const [x,z]=site;const heights=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(x+a*w/2,z+b*d/2));const floor=Math.max(...heights)+.25,low=Math.min(...heights)-.4,eave=floor+wallH,rise=w*.37;
    box(x,(low+floor)/2,z,w+.4,floor-low,d+.4,M.stone);
    box(x,floor+wallH/2,z,w,wallH,d,isBarn?M.lightwood:M.plaster);
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise+.4);shape.closePath();const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),isBarn?M.lightwood:M.plaster);mesh.position.set(x,eave,z-d/2);mesh.castShadow=true;g.add(mesh);
    const rw=w/2+.6,rr=rise+.4,slope=Math.atan2(rr,rw),len=Math.hypot(rw,rr);
    for(const side of [-1,1]){box(x+side*rw/2,eave+rr/2,z,len,.19,d+1.2,roofMat,0,0,-side*slope);
      for(let row=0;row<6;row++)for(let col=0;col<Math.ceil((d+1)/.8);col++){const t=(row+.5)/6;box(x+side*rw*t,eave+rr*(1-t)+.13,z-d/2-.5+(col+.5)*.8,len/6-.025,.07,.76,roofMat===M.roof?(col%4===0?M.tile:M.roof):M.slate,0,0,-side*slope);}
      box(x+side*(w/2+.48),eave+.03,z,.18,.25,d+1.35,M.wood);
    }
    box(x,eave+rr+.12,z,.3,.25,d+1.3,roofMat);
    for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.1),floor+wallH/2,z+sz*(d/2+.035),.22,wallH,.18,M.wood);
    for(const side of [-1,1]){box(x,floor+.3,z+side*(d/2+.07),w,.18,.16,M.wood);box(x,eave-.2,z+side*(d/2+.07),w,.2,.16,M.wood);}
    function window(wx,wz,rotation=0){const front=(dx,dy,dz,ww,hh,dd,m)=>{box(wx+dx*Math.cos(rotation)+dz*Math.sin(rotation),floor+dy,wz-dx*Math.sin(rotation)+dz*Math.cos(rotation),ww,hh,dd,m,0,rotation);};front(0,2.8,0,1.22,1.5,.14,M.dark);front(0,2.8,.09,.99,1.28,.1,M.glass);front(0,2.8,.16,.075,1.35,.09,M.lightwood);front(0,2.8,.16,1.03,.07,.09,M.lightwood);for(const s of [-1,1]){front(s*.89,2.8,.05,.43,1.55,.12,M.shutter);front(s*.89,2.42,.13,.44,.085,.08,M.wood);}front(0,1.99,.12,1.46,.16,.35,M.stone);}
    if(!isBarn){for(const side of [-1,1])for(const dx of [-w*.28,w*.28])window(x+dx,z+side*(d/2+.09),side===1?0:Math.PI);for(const side of [-1,1])for(const dz of [-d*.25,d*.25])window(x+side*(w/2+.09),z+dz,side*Math.PI/2);}
    else {for(let dx=-w/2+.5;dx<w/2;dx+=.65)for(const side of [-1,1])box(x+dx,floor+wallH/2,z+side*(d/2+.035),.035,wallH,.075,M.wood);for(let dz=-d/2+.5;dz<d/2;dz+=.7)for(const side of [-1,1])box(x+side*(w/2+.035),floor+wallH/2,z+dz,.075,wallH,.035,M.wood);box(x,eave+rise*.25,z+d/2+.04,1.2,1.2,.12,M.dark);}
    const doorW=isBarn?3.7:1.55,doorH=isBarn?3.9:2.6,dz=z+d/2+.13;box(x,floor+doorH/2,dz,doorW+.22,doorH+.14,.16,M.dark);for(const s of [-1,1]){box(x+s*doorW/4,floor+doorH/2,dz+.09,doorW/2-.05,doorH,.12,M.wood);for(const yy of [.5,doorH-.45])box(x+s*doorW/4,floor+yy,dz+.17,doorW/2-.12,.10,.09,M.lightwood);beam([x+s*.08,floor+.5,dz+.24],[x+s*(doorW/2-.14),floor+doorH-.45,dz+.24],.1,M.lightwood);}
    for(let j=0;j<3;j++){const zz=dz+.35+j*.35,ground=heightAt(x,zz);const top=floor-.08-j*.13;box(x,(ground+top)/2,zz,doorW+.55,Math.max(.14,top-ground),.42,M.stone);}
    if(!isBarn){box(x+2.7,eave+rise+.15,z-2,1.0,3.3,1.1,M.stone);box(x+2.7,eave+rise+1.8,z-2,1.23,.25,1.32,M.stone);box(x+2.7,eave+rise+1.94,z-2,.75,.07,.84,M.dark);}
    // Foundation block joints and short gable braces.
    for(const side of [-1,1])for(let xx=-w/2+.45;xx<w/2;xx+=.85)box(x+xx,floor-.25,z+side*(d/2+.21),.76,.24,.06,M.stone);
    for(const side of [-1,1]){beam([x-w/2,eave,z+side*(d/2+.08)],[x,eave+rise,z+side*(d/2+.08)],.14,M.wood);beam([x+w/2,eave,z+side*(d/2+.08)],[x,eave+rise,z+side*(d/2+.08)],.14,M.wood);}
    return floor;
  }
  building(h.houses[0],10,11,5.5,M.roof);
  building(h.barns[0],13,18,6.2,M.slate,true);
  building([-5.5,-94],7,8,3.5,M.roof,true);
  patch(...h.court,M.dirt);path(h.access);path(h.doorPath,1.6);path([[-19,-87],[-7,-86],[-7,-82.5]],1.7);path([[-19,-92],[-5.5,-88.8]],2);path([[-19,-95],[-17,-118],[-21,-122]],2.3);
  // Court enclosure: entrance gap 3.8m north, barn opening southwest, paddock lane south.
  fence([-37,-85],[-21,-85]);fence([-17,-85],[-13,-85]);fence([-1,-85],[.8,-85]);fence([.8,-85],[.8,-100]);fence([.8,-100],[-15,-100]);fence([-37,-85],[-37,-100]);fence([-37,-100],[-34,-100]);gate(-19,-85,4,1.16);
  const [gx,gz,gw,gd]=h.garden;patch(gx,gz,gw,gd,M.soil);
  for(let i=0;i<5;i++){const x=gx-gw/2+1+i*2.3;patch(x,gz,1.4,gd-1,M.dirt,.27);patch(x,gz,1.05,gd-1.4,M.soil,.29);for(let j=0;j<15;j++){const z=gz-gd/2+1+j*.87,y=heightAt(x,z)+.42;for(const s of [-1,1])ball(x+s*.2,y,z,.28,.23,.3,i%2?M.leaf2:M.leaf);}}
  fence([-13.6,-102],[-.3,-102]);fence([-.3,-102],[-.3,-119]);fence([-.3,-119],[-13.6,-119]);fence([-13.6,-119],[-13.6,-113]);fence([-13.6,-110],[-13.6,-102]);path([[-17,-111.5],[-7,-111.5]],1.1);
  // Fruit trees form an orchard beyond the court, leaving the access track clear.
  for(const [x,z] of [[-34,-69],[-26,-68],[-35,-77],[-27,-77],[-35,-84],[-4,-63],[-4,-68]]){const y=heightAt(x,z),hh=3+rand();beam([x,y,z],[x+.13,y+hh+1,z],.28,M.wood);for(let j=0;j<4;j++){const a=j*Math.PI/2+.4,bx=x+Math.cos(a)*1.15,bz=z+Math.sin(a)*1.15;beam([x,y+2,z],[bx,y+hh+.5,bz],.16,M.wood);ball(bx,y+hh+.7,bz,1.45,1.55,1.4,j%2?M.leaf:M.leaf2);for(let k=0;k<3;k++)ball(bx+(rand()-.5)*2,y+hh+.3+rand(),bz+(rand()-.5)*2,.12,.13,.12,M.fruit);}}
  const [px,pz,pw,pd]=h.pasture;patch(px,pz,pw,pd,M.grass,.22);
  fence([-40,-122],[-23,-122]);fence([-19,-122],[-4,-122]);fence([-4,-122],[-4,-146]);fence([-4,-146],[-40,-146]);fence([-40,-146],[-40,-122]);gate(-21,-122,4,.92);
  // Grass clumps, meadow flowers and stones are instanced and avoid paths/buildings.
  for(let i=0;i<2100;i++){const x=-42+rand()*44,z=-148+rand()*90;const inPasture=z< -123&&x< -5;const edge=x< -38||z< -146|| (z>-84&&x<-23);if(!inPasture&&!edge)continue;if(z>-64&&x<-31)continue;const y=heightAt(x,z)+.25;const ht=.15+rand()*.36;box(x,y+ht/2,z,.05,ht,.22,i%3?M.grass:M.leaf2,0,rand()*Math.PI);if(i%14===0)ball(x,y+ht,z,.09,.07,.09,M.hay);}
  // Small sheep flock, four legs planted separately against the relief.
  for(const [x,z]of [[-31,-132],[-27,-136],[-15,-132],[-21,-139],[-33,-140],[-12,-141]]){const y=heightAt(x,z);ball(x,y+1.05,z,.88,.62,.52,M.wool);ball(x+.75,y+1.04,z,.33,.38,.28,M.dark);for(const dx of [-.55,.5])for(const dz of [-.3,.3]){const gy=heightAt(x+dx,z+dz);box(x+dx,(gy+y+.9)/2,z+dz,.12,y+.9-gy,.12,M.dark);}ball(x+.75,y+1.32,z+.3,.17,.09,.13,M.dark);ball(x+.75,y+1.32,z-.3,.17,.09,.13,M.dark);}
  // Water trough with visible basin, a pump and feeding rack.
  {const x=-11,z=-125,y=heightAt(x,z);box(x,y+.17,z,3,.3,1.25,M.stone);for(const dz of [-.62,.62])box(x,y+.55,z+dz,3.2,.8,.18,M.stone);for(const dx of [-1.5,1.5])box(x+dx,y+.55,z,.18,.8,1.2,M.stone);box(x,y+.55,z,2.8,.04,1.02,M.water);box(x+2,y+.9,z,.17,1.8,.17,M.iron);beam([x+2,y+1.5,z],[x+1.25,y+1.5,z],.13,M.iron);}
  for(let i=0;i<4;i++){const x=-36.5+(i%2)*1.5,z=-109+Math.floor(i/2)*1.6,y=heightAt(x,z);box(x,y+.7,z,1.35,1.3,1.4,M.hay);for(const dx of [-.4,.4])box(x+dx,y+.72,z,.06,1.35,1.42,M.wood);}
  // Firewood stacked beneath a small freestanding fuel shelter.
  for(const x of [-2.3,1.7])for(const z of [-86.2,-84.2]){const y=heightAt(x,z);box(x,y+1.05,z,.15,2.1,.15,M.wood);}
  box(-.3,heightAt(-.3,-85.2)+2.25,-85.2,4.4,.14,2.5,M.slate,.15);
  for(let r=0;r<4;r++)for(let c=0;c<8-r;c++){const x=-1.8+c*.42+r*.18,z=-85.2,y=heightAt(x,z);inst(new THREE.CylinderGeometry(.19,.2,1.6,7),M.wood,x,y+.24+r*.34,z,1,1,1,Math.PI/2);ball(x,y+.24+r*.34,z+.82,.16,.16,.035,M.lightwood);}
  // Four-wheel farm wagon, plank bed, sides, axles, spokes and draw shafts.
  {const x=-29,z=-89,y=heightAt(x,z);box(x,y+1.05,z,2.2,.25,3.5,M.wood);for(let i=0;i<7;i++)box(x,y+1.22,z-1.45+i*.46,2.1,.1,.42,M.lightwood);for(const s of [-1,1]){for(const lift of [1.45,1.83])box(x+s*1.12,y+lift,z,.13,.27,3.55,M.lightwood);for(const zz of [-1.1,1.1]){beam([x-1.4,y+.72,z+zz],[x+1.4,y+.72,z+zz],.14,M.iron);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.65,.09,6,14),M.dark);wheel.rotation.y=Math.PI/2;wheel.position.set(x+s*1.34,y+.72,z+zz);g.add(wheel);for(let j=0;j<6;j++){let a=j*Math.PI/3;beam([x+s*1.34,y+.72,z+zz],[x+s*1.34,y+.72+Math.cos(a)*.59,z+zz+Math.sin(a)*.59],.065,M.lightwood);}}beam([x+s*.7,y+1.05,z+1.6],[x+s*.7,y+.65,z+4.5],.13,M.wood);}}
  // Worn court gravel, stepping stones and a barrel at the stable.
  for(let i=0;i<210;i++){const x=-35+rand()*26,z=-99+rand()*13;if(x>-10&&z<-89)continue;ball(x,heightAt(x,z)+.31,z,.05+rand()*.12,.03,.06+rand()*.12,i%3?M.stone:M.soil);}
  for(const [x,z]of [[-2,-88],[-32,-95]]){const y=heightAt(x,z);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.48,.43,1.2,12),M.lightwood);barrel.position.set(x,y+.6,z);g.add(barrel);for(const dy of [.2,.95]){const band=new THREE.Mesh(new THREE.TorusGeometry(.475,.04,4,12),M.iron);band.rotation.x=Math.PI/2;band.position.set(x,y+dy,z);g.add(band);}}
  for(const {geo,m,items} of batches.values()){const mesh=new THREE.InstancedMesh(geo,m,items.length);items.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
  return g;
}
