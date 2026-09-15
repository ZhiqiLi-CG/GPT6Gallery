import { heightAt, bankZ, roadNetwork, layout, claimDistrict } from './root.js';
import { centralHoldings, claimCentralHolding } from './south-central-farms.js';

export function build(THREE, ctx) {
  claimDistrict('south-bank'); claimCentralHolding('cottage');
  const holding=centralHoldings().cottage, sites=layout(), lane=roadNetwork().find(r=>r.id==='south-lane');
  const g=new THREE.Group();g.name='south-central-cottage inhabited riverside holding';
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.94});
  const plaster=mat(0xe0d0a8),wood=mat(0x68513a),boards=mat(0x96734d),stone=mat(0x999282),dark=mat(0x293b3b),shutter=mat(0x526c59),soil=mat(0x67513a),dirt=mat(0xb7a17a),clay=mat(0xa96544),iron=mat(0x403e35);
  const roofM=[mat(0x91553e),mat(0xa05f42),mat(0xad704e)],leafM=[mat(0x547541),mat(0x78944a),mat(0x3e663c)];
  const boxGeo=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D(),batches=new Map();
  function mesh(geo,m,x,y,z){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
  function box(x,y,z,w,h,d,m){const o=mesh(boxGeo,m,x,y,z);o.scale.set(w,h,d);return o;}
  function inst(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){let key=geo.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo,m,list:[]});dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();batches.get(key).list.push(dummy.matrix.clone());}
  function beam(a,b,width,m=wood){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,v.length(),width,m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function patch(x,z,w,d,m,lift=.24){const geo=new THREE.PlaneGeometry(w,d,Math.ceil(w/.8),Math.ceil(d/.8));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(x+p.getX(i),z+p.getZ(i))+lift);geo.computeVertexNormals();mesh(geo,m,x,0,z);}
  function path(points,width=1.3){const vs=[],ix=[];for(let k=1;k<points.length;k++){const a=points[k-1],b=points[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/.7);for(let j=0;j<n;j++){const off=vs.length/3;for(const [t,s]of [[j/n,-1],[j/n,1],[(j+1)/n,-1],[(j+1)/n,1]]){const x=a[0]+dx*t-dz/len*width*s/2,z=a[1]+dz*t+dx/len*width*s/2;vs.push(x,heightAt(x,z)+.29,z);}ix.push(off,off+1,off+2,off+1,off+3,off+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,dirt,0,0,0);}
  let [cx,cz]=holding.houses[0];const w=9,d=8,e=.55,h=4.7,rise=3.1;
  let limit=Infinity;for(let x=cx-w/2-e;x<=cx+w/2+e+.001;x+=.1)limit=Math.min(limit,bankZ(x,-1)-5);
  cz=Math.min(cz,limit-d/2-e-.12);
  const corners=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>heightAt(cx+a*(w/2+.2),cz+b*(d/2+.2)));
  const floor=Math.max(...corners)+.3,low=Math.min(...corners)-.5,top=floor+h;
  box(cx,(floor+low)/2,cz,w+.4,floor-low,d+.4,stone);
  box(cx,floor+h/2,cz,w,h,d,plaster);
  // Dressed foundation blocks and repeated timber framing.
  for(let side of [-1,1])for(let x=cx-w/2+.3;x<cx+w/2;x+=.7)inst(boxGeo,stone,x,floor-.18,cz+side*(d/2+.23),.64,.34,.16);
  for(let x of [cx-w/2+.12,cx,cx+w/2-.12])for(let s of [-1,1])inst(boxGeo,wood,x,floor+h/2,cz+s*(d/2+.05),.19,h,.16);
  for(let s of [-1,1]){box(cx,top-.1,cz+s*(d/2+.07),w,.23,.21,wood);box(cx,floor+.15,cz+s*(d/2+.07),w,.2,.2,wood);}
  // Solid plaster gables beneath two separate pitched tile surfaces.
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
  const gab=new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:false});
  for(let s of [-1,1]){mesh(gab,plaster,cx,top,cz+s*d/2-(s===1?.24:0));beam([cx-w/2,top,cz+s*(d/2+.07)],[cx,top+rise,cz+s*(d/2+.07)],.18);beam([cx,top+rise,cz+s*(d/2+.07)],[cx+w/2,top,cz+s*(d/2+.07)],.18);}
  const half=w/2+e,rr=rise+e*rise/(w/2),slope=rise/(w/2),ang=Math.atan(slope),sl=Math.hypot(half,rr);
  for(let s of [-1,1]){const o=box(cx+s*half/2,top+rise-rr/2,cz,sl,.17,d+2*e,roofM[0]);o.rotation.z=-s*ang;
    for(let row=0;row<11;row++)for(let col=0;col<19;col++){const u=(row+.5)/11*half,z=cz-(d+2*e)/2+(col+.5)*(d+2*e)/19;inst(boxGeo,roofM[(row+col*7)%3],cx+s*u,top+rise-u*slope+.13,z,sl/11+.055,.07,(d+2*e)/19-.025,0,0,-s*ang);}
    box(cx+s*half,top+rise-rr,cz,.19,.26,d+2*e,wood);
  }
  const cyl=new THREE.CylinderGeometry(1,1,1,10);
  for(let z=cz-d/2-e+.2;z<cz+d/2+e;z+=.4)inst(cyl,roofM[1],cx,top+rise+.12,z,.19,.44,.19,Math.PI/2);
  // Shuttered casements on all four walls.
  function windowAt(x,z,face){const group=new THREE.Group();g.add(group);group.position.set(x,floor+2.25,z);group.rotation.y=face;
    function b(xx,yy,zz,ww,hh,dd,m){const o=new THREE.Mesh(boxGeo,m);o.position.set(xx,yy,zz);o.scale.set(ww,hh,dd);o.castShadow=true;group.add(o);}
    b(0,0,0,1.22,1.55,.12,wood);b(0,0,-.075,1,1.3,.09,dark);b(0,0,-.15,.07,1.34,.06,boards);b(0,0,-.15,1.04,.07,.06,boards);b(0,-.86,-.16,1.55,.16,.36,stone);
    for(let side of [-1,1]){b(side*.91,0,-.08,.49,1.53,.13,shutter);for(let yy of [-.45,.45])b(side*.91,yy,-.16,.48,.075,.06,wood);}
  }
  for(let x of [cx-2.5,cx+2.5])windowAt(x,cz-d/2-.09,0);
  for(let x of [cx-2.3,cx+2.3])windowAt(x,cz+d/2+.09,Math.PI);
  windowAt(cx-w/2-.09,cz,Math.PI/2);windowAt(cx+w/2+.09,cz,-Math.PI/2);
  box(cx,floor+1.25,cz-d/2-.12,1.6,2.5,.22,wood);
  for(let i=0;i<6;i++)inst(boxGeo,boards,cx-.62+i*.25,floor+1.19,cz-d/2-.25,.225,2.24,.055);
  box(cx+.5,floor+1.18,cz-d/2-.3,.09,.12,.08,iron);
  for(let i=0;i<3;i++){const z=cz-d/2-.35-i*.42,ground=heightAt(cx,z),sy=Math.max(.16,floor-ground-.13*i);box(cx,ground+sy/2,z,2.05,sy,.55,stone);}
  const chimneyX=cx+2.6,chimneyZ=cz+1.35,chimBase=top+rise-2.6*slope-.1;
  box(chimneyX,chimBase+1.65,chimneyZ,1,3.3,1,stone);box(chimneyX,chimBase+3.25,chimneyZ,1.25,.22,1.25,stone);box(chimneyX,chimBase+3.39,chimneyZ,.7,.08,.7,iron);
  for(let j=0;j<7;j++)for(let s of [-1,1])inst(boxGeo,boards,chimneyX,chimBase+.25+j*.44,chimneyZ+s*.505,.95,.045,.025);
  const access=holding.access.map(p=>[...p]);access[0]=[cx,cz-d/2-1.25];path(access,1.7);
  patch(...holding.court,dirt);path([[cx+1,cz-d/2-1.2],...holding.doorPath.slice(1)],1.3);
  path([[18,-43],[24.5,-43],[25.5,-43]],1.1);
  // Open-front woodshed with a complete pitched roof, board back and sides.
  const sx=holding.court[0]+.2,sz=holding.court[1]+5.5,sw=5.2,sd=3.8,sh=2.7;
  const sy=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(sx+a*sw/2,sz+b*sd/2))))+.16;
  box(sx,sy-.17,sz,sw+.2,.4,sd+.2,stone);
  for(let x of [sx-sw/2,sx+sw/2])for(let z of [sz-sd/2,sz+sd/2])box(x,sy+sh/2,z,.19,sh,.19,wood);
  for(let i=0;i<18;i++)inst(boxGeo,boards,sx-sw/2+(i+.5)*sw/18,sy+1.3,sz+sd/2,sw/18-.025,2.6,.12);
  for(let s of [-1,1])for(let i=0;i<12;i++)inst(boxGeo,boards,sx+s*sw/2,sy+1.3,sz-sd/2+(i+.5)*sd/12,.12,2.6,sd/12-.025);
  const shedRise=1.2,shedHalf=sw/2+.32,shedAngle=Math.atan(shedRise/shedHalf);
  for(let s of [-1,1]){const o=box(sx+s*shedHalf/2,sy+sh+shedRise/2,sz,Math.hypot(shedHalf,shedRise),.15,sd+.7,wood);o.rotation.z=-s*shedAngle;for(let j=0;j<10;j++)inst(boxGeo,boards,sx+s*shedHalf/2,sy+sh+shedRise/2+.1,sz-sd/2-.3+j*(sd+.6)/9,Math.hypot(shedHalf,shedRise),.05,.31,0,0,-s*shedAngle);}
  const endMat=mat(0xc29b63),logGeo=new THREE.CylinderGeometry(1,.92,1,8);
  for(let row=0;row<5;row++)for(let col=0;col<9-row%2;col++){const x=sx-2+col*.45+(row%2)*.2,y=sy+.24+row*.4,z=sz+.1;inst(logGeo,wood,x,y,z,.22,2.6,.22,Math.PI/2);inst(cyl,endMat,x,y,z-1.31,.185,.025,.185,Math.PI/2);}
  // Gated kitchen garden; its south fence remains north of the road shoulder.
  const [gx,gz,gw,gd]=holding.garden;
  function fence(a,b){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/1.5);for(let j=0;j<=n;j++){const t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);inst(boxGeo,wood,x,y+.66,z,.14,1.4,.14);if(j<n){const u=(j+1)/n,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u;for(let h of [.5,1.05])beam([x,y+h,z],[xx,heightAt(xx,zz)+h,zz],.09,boards);}}}
  const x0=gx-gw/2,x1=gx+gw/2,z0=gz-gd/2,z1=gz+gd/2;
  fence([x0,z0],[x1,z0]);fence([x1,z0],[x1,z1]);fence([x1,z1],[x0,z1]);fence([x0,z1],[x0,-42.3]);fence([x0,-43.7],[x0,z0]);
  const gateY=heightAt(x0,-43);
  for(let j=0;j<5;j++)inst(boxGeo,shutter,x0,gateY+.58,-43.6+j*.3,.13,1.03,.13);
  for(let y of [.27,.87])beam([x0,gateY+y,-43.7],[x0,gateY+y,-42.3],.11);beam([x0,gateY+.27,-43.7],[x0,gateY+.87,-42.3],.1);
  const leafGeo=new THREE.IcosahedronGeometry(1,0);
  for(let k=0;k<3;k++){const bx=gx-2.8+k*2.75;patch(bx,gz+.25,1.9,5.7,soil,.26);for(let s of [-1,1])box(bx+s*.98,heightAt(bx+s*.98,gz)+.3,gz+.25,.09,.22,5.9,boards);
    for(let row=0;row<9;row++)for(let col=0;col<2;col++){const x=bx-.45+col*.9,z=gz-2.2+row*.61,y=heightAt(x,z)+.42;inst(leafGeo,leafM[k],x,y,z,.28,.22+.08*k,.29);for(let side of [-1,1])inst(leafGeo,leafM[(k+1)%3],x+side*.17,y+.08,z,.2,.09,.28,0,side*.5,side*.4);}}
  // Fine gravel breaks up the worn domestic court without obscuring its circulation.
  let seed=8351;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const gravel=mat(0x9e9177);
  for(let i=0;i<180;i++){const x=holding.court[0]+(random()-.5)*holding.court[2],z=holding.court[1]+(random()-.5)*holding.court[3];inst(leafGeo,gravel,x,heightAt(x,z)+.27,z,.045+random()*.07,.025,.035+random()*.065);}
  // Domestic scale objects around the court and house.
  function barrel(x,z){const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.47,.43,1.1,12),boards,x,y+.55,z);for(let h of [.15,.88])mesh(new THREE.CylinderGeometry(.48,.48,.065,12),iron,x,y+h,z);mesh(new THREE.CylinderGeometry(.4,.4,.045,12),wood,x,y+1.12,z);}
  barrel(11,-37.8);barrel(20.9,-36.7);
  const benchY=heightAt(16,-41);box(16,benchY+.8,-41,2.5,.17,.75,boards);for(let x of [15.05,16.95])for(let z of [-41.22,-40.78])box(x,benchY+.39,z,.12,.78,.12,wood);
  for(let [x,z]of [[1.5,cz-d/2-1],[7,cz-d/2-1],[12,-40.8],[23,-41.8]]){const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.34,.23,.48,10),clay,x,y+.24,z);mesh(new THREE.CylinderGeometry(.28,.28,.04,10),soil,x,y+.49,z);inst(leafGeo,leafM[1],x,y+.69,z,.39,.3,.38);for(let j=0;j<4;j++)inst(leafGeo,mat(j%2?0xe0b955:0xb1849a),x+.22*Math.cos(j*2),y+.93,z+.22*Math.sin(j*2),.1,.1,.1);}
  box(21,heightAt(21,-41)+.35,-41,.8,.7,.7,boards);for(let s of [-1,1])box(21+s*.42,heightAt(21,-41)+.35,-41,.04,.1,.73,wood);
  // Short stepping-stone route and a chopping block beside the shed.
  for(let i=0;i<7;i++){const x=11.5+i*.78,z=-40+i*.24;inst(boxGeo,stone,x,heightAt(x,z)+.28,z,.58,.12,.47,0,i*.17);}
  const by=heightAt(21,-38.8);mesh(new THREE.CylinderGeometry(.45,.57,.6,10),wood,21,by+.3,-38.8);mesh(new THREE.CylinderGeometry(.4,.4,.03,10),endMat,21,by+.61,-38.8);beam([21,by+.6,-38.8],[21.5,by+1.5,-38.65],.07,boards);box(21.12,by+.77,-38.8,.37,.25,.07,iron);
  for(const {geo,m,list}of batches.values()){const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((v,i)=>im.setMatrixAt(i,v));im.castShadow=true;im.receiveShadow=true;g.add(im);}
  g.userData={task:'south-central-cottage',houseCenter:[cx,cz],northEave:cz+d/2+e,shoreLimit:limit,laneWidth:lane.width,bridgeReserve:sites.exclusions.crossing};
  return g;
}
