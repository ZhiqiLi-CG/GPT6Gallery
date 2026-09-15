import {heightAt, roadNetwork, layout, streamX, streamWater, build as buildRoot} from './root.js';

// Parent assembly: both bridges and approaches. Children dress independent reaches.
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='stream-garden: timber crossings';
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.9});
 const wood=[mat(0x806244),mat(0x8d7050),mat(0x967a57),mat(0x75583d)];
 const dark=mat(0x594733),iron=mat(0x42433d),stone=[mat(0x818177),mat(0x929084),mat(0x73776d)],path=mat(0xa49a80),light=mat(0xd3c6a0);
 const cube=new THREE.BoxGeometry(1,1,1),rockGeo=new THREE.DodecahedronGeometry(1,0);
 let seed=9203; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function mesh(geo,m,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function box(x,y,z,w,h,d,m){return mesh(cube,m,x,y,z,w,h,d)}
 function beam(a,b,w,d,m){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),mid=va.clone().add(vb).multiplyScalar(.5);const o=box(mid.x,mid.y,mid.z,w,va.distanceTo(vb),d,m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize());return o}
 function bolt(x,y,z){const o=mesh(new THREE.CylinderGeometry(.032,.032,.018,7),iron,x,y,z);return o}
 function lantern(x,z){const y=heightAt(x,z);box(x,y+.13,z,.85,.26,.85,stone[1]);box(x,y+.4,z,.58,.28,.58,stone[0]);mesh(new THREE.CylinderGeometry(.18,.26,1.05,8),stone[0],x,y+.99,z);box(x,y+1.56,z,.68,.16,.68,stone[1]);box(x,y+1.87,z,.41,.47,.41,light);for(const a of [-1,1])for(const b of [-1,1])box(x+a*.25,y+1.87,z+b*.25,.10,.52,.10,stone[0]);box(x,y+2.16,z,.85,.16,.85,stone[1]);const cap=mesh(new THREE.ConeGeometry(.62,.4,4),stone[0],x,y+2.4,z);cap.rotation.y=Math.PI/4;mesh(new THREE.SphereGeometry(.12,8,6),stone[1],x,y+2.68,z)}
 function bridge(z,clear,arch){
  const c=streamX(z),half=3.5,w=clear+.3,ya=heightAt(c-half,z)+.19,yb=heightAt(c+half,z)+.19;
  const deck=t=>ya+(yb-ya)*t+arch*4*t*(1-t);
  for(const side of [-1,1]){
   const x=c+side*3.35;
   for(let row=0;row<3;row++)for(let k=0;k<Math.ceil(w/.62);k++){
    const zz=z-w/2+(k+.5)*w/Math.ceil(w/.62),top=heightAt(x,zz)+.16;
    box(x,top-.2-row*.35,zz,.86,.32,w/Math.ceil(w/.62)-.035,stone[(row+k)%3]);
   }
   box(x,deck(side<0?0:1)-.33,z,.72,.25,w+.25,stone[1]);
  }
  for(const zz of [-clear*.36,0,clear*.36])for(let k=0;k<28;k++){
   const a=k/28,b=(k+1)/28;beam([c-half+7*a,deck(a)-.29,z+zz],[c-half+7*b,deck(b)-.29,z+zz],.21,.21,dark);
  }
  for(let k=0;k<35;k++){
   const t=(k+.5)/35,x=c-half+t*7;const o=box(x,deck(t)-.075,z,.189,.15,w,wood[k%4]);o.rotation.z=Math.atan((yb-ya+arch*4*(1-2*t))/7);
   for(const side of [-1,1])bolt(x,deck(t)+.012,z+side*clear*.36);
  }
  for(const side of [-1,1]){
   const zz=z+side*(clear/2+.10);
   for(let j=0;j<=6;j++){
    const t=j/6,x=c-half+7*t,y=deck(t);box(x,y+.5,zz,.15,1.2,.15,dark);box(x,y+1.12,zz,.21,.08,.21,wood[1]);
    for(const offset of [-.06,.15]){const o=mesh(new THREE.SphereGeometry(.034,6,4),iron,x,y+offset,zz+side*.081);}
   }
   for(const h of [.48,1.03])for(let k=0;k<28;k++){const a=k/28,b=(k+1)/28;beam([c-half+7*a,deck(a)+h,zz],[c-half+7*b,deck(b)+h,zz],h>.8?.13:.09,h>.8?.16:.09,wood[0]);}
   // Braced end bays remain below the upper rail.
   for(const j of [0,5])beam([c-half+7*j/6,deck(j/6)+.2,zz],[c-half+7*(j+1)/6,deck((j+1)/6)+.84,zz],.065,.065,dark);
  }
 }
 // Read the owner's actual tessellated surfaces, not a guessed terrain clearance.
 // This detached snapshot is never added to the scene; dispose it after indexing.
 const surfaceBins=new Map(),snapshot=buildRoot(THREE,ctx);snapshot.updateMatrixWorld(true);
 const local=(x,z)=>x>33&&x<58&&((z>25&&z<37)||(z>-27&&z<-17));
 snapshot.children.forEach((o,index)=>{
  const road=o.material?.color?.getHex()===0xa49a80;
  if(index!==0&&!road)return;
  const pos=o.geometry.attributes.position,ix=o.geometry.index;
  for(let i=0;i<ix.count;i+=3){
   const p=[];for(let j=0;j<3;j++){const v=new THREE.Vector3().fromBufferAttribute(pos,ix.getX(i+j)).applyMatrix4(o.matrixWorld);p.push(v.x,v.y,v.z);}
   if(!local(p[0],p[2])&&!local(p[3],p[5])&&!local(p[6],p[8]))continue;
   const det=(p[5]-p[8])*(p[0]-p[6])+(p[6]-p[3])*(p[2]-p[8]);if(Math.abs(det)<1e-12)continue;
   const tri={p,det,road};
   for(let x=Math.floor(Math.min(p[0],p[3],p[6]));x<=Math.floor(Math.max(p[0],p[3],p[6]));x++)for(let z=Math.floor(Math.min(p[2],p[5],p[8]));z<=Math.floor(Math.max(p[2],p[5],p[8]));z++){
    const key=x+','+z;if(!surfaceBins.has(key))surfaceBins.set(key,[]);surfaceBins.get(key).push(tri);
   }
  }
 });
 const disposed=new Set();snapshot.traverse(o=>{for(const item of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(item&&!disposed.has(item)){disposed.add(item);if(item.isMaterial)for(const value of Object.values(item))if(value?.isTexture&&!disposed.has(value)){disposed.add(value);value.dispose()}item.dispose();}});
 function surfaceAt(x,z){let ground=-Infinity,road=-Infinity;
  for(const {p,det,road:isRoad} of surfaceBins.get(Math.floor(x)+','+Math.floor(z))||[]){
   const a=((p[5]-p[8])*(x-p[6])+(p[6]-p[3])*(z-p[8]))/det,b=((p[8]-p[2])*(x-p[6])+(p[0]-p[6])*(z-p[8]))/det,c=1-a-b;
   if(Math.min(a,b,c)<-1e-7)continue;const y=a*p[1]+b*p[4]+c*p[7];if(isRoad)road=Math.max(road,y);else ground=Math.max(ground,y);
  }return {ground:Number.isFinite(ground)?ground:heightAt(x,z),road};
 }
 const n=streamX(31),s=streamX(-23),surfaces=[];
 function walkingY(x,z){
  const surface=surfaceAt(x,z),ground=Math.max(heightAt(x,z),surface.ground);
  // Road mesh boundaries have a raised lip. Cover that lip across entire paving triangles.
  let roadEnvelope=surface.road;for(const dx of [-.4,-.2,0,.2,.4])for(const dz of [-.4,-.2,0,.2,.4])roadEnvelope=Math.max(roadEnvelope,surfaceAt(x+dx,z+dz).road-.28*Math.hypot(dx,dz));
  let y=Math.max(ground+.07,roadEnvelope+.065);
  // The clearance clamp comes AFTER blending, so interpolation cannot expose earth/road.
  for(const [c,zz] of [[n,31],[s,-23]])if(Math.abs(z-zz)<4.8){const d=Math.abs(x-c)-3.5,t=Math.max(0,1-Math.max(0,d)/1.05);if(t>0){const deck=heightAt(c+(x>c?3.5:-3.5),zz)+.19;y=y*(1-t)+deck*t;}}
  // Match the accepted bank path across its entire terminal edge, not just its centre.
  for(const end of [27,-19]){const d=Math.abs(z-end),t=Math.max(0,1-d/.8);if(t>0)y=y*(1-t)+(heightAt(x,z)+.035)*t;}
  return Math.max(y,surface.ground+.018,roadEnvelope+.055);
 }
 function pavedPolygon(name,outline){surfaces.push({name,outline});}
 function straight(x0,z0,x1,z1,width){const l=Math.hypot(x1-x0,z1-z0),nx=-(z1-z0)/l*width/2,nz=(x1-x0)/l*width/2;return [[x0+nx,z0+nz],[x1+nx,z1+nz],[x1-nx,z1-nz],[x0-nx,z0-nz]];}
 bridge(31,2.5,.62);bridge(-23,roadNetwork().find(r=>r.id==='harbor-lane').width,.14);
 pavedPolygon('north-west',straight(n-5.5,31,n-3.5,31,2.5));
 // A single simple landing polygon replaces the folded inner bend and overlapping strips.
 // Far edge is perpendicular to the published root road direction (11,8).
 const roadLen=Math.hypot(11,8),ex=55,ez=31+(ex-50)*8/11,rx=8/roadLen*1.15,rz=-11/roadLen*1.15;
 pavedPolygon('north-east',[[n+3.5,29.75],[53.4,29.75],[ex+rx,ez+rz],[ex-rx,ez-rz],[n+3.5,32.25]]);
 pavedPolygon('service-west',straight(35,-23,s-3.5,-23,3.8));
 pavedPolygon('service-east',straight(s+3.5,-23,s+6.7,-23,3.8));
 // Links meet the landing boundary edge-to-edge; no intersecting pavement layers.
 const links=[[[53.1389564,27],[52.8,28.4],[52.8,29.75]],[[47.4033314,-19],[47.4033314,-21.1]]];
 pavedPolygon('north-bank-link',[[52.6639564,27],[53.6139564,27],[53.275,28.4],[53.275,29.75],[52.325,29.75],[52.325,28.4]]);
 pavedPolygon('service-bank-link',straight(47.4033314,-19,47.4033314,-21.1,.95));
 function inside(x,z,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
 const diagnostics={faces:0,downward:0,minTerrainClearance:Infinity,minRoadClearance:Infinity};
 const pavement=path.clone();pavement.polygonOffset=true;pavement.polygonOffsetFactor=-1;pavement.polygonOffsetUnits=-1;
 for(const {name,outline} of surfaces){
  const contour=outline.map(([x,z])=>new THREE.Vector2(x,z)),tris=THREE.ShapeUtils.triangulateShape(contour,[]),v=[],indices=[];
  // Equal subdivisions on every parent triangle give coincident vertices on shared edges.
  const N=48;
  for(const tri of tris){const [a,b,c]=tri.map(i=>outline[i]),rows=[];
   for(let i=0;i<=N;i++){const row=[];for(let j=0;j<=N-i;j++){const u=i/N,w=j/N,x=a[0]*(1-u-w)+b[0]*u+c[0]*w,z=a[1]*(1-u-w)+b[1]*u+c[1]*w;row.push(v.length/3);v.push(x,walkingY(x,z),z);}rows.push(row);}
   function face(a,b,c){const ax=v[b*3]-v[a*3],az=v[b*3+2]-v[a*3+2],bx=v[c*3]-v[a*3],bz=v[c*3+2]-v[a*3+2];if(az*bx-ax*bz<0)[b,c]=[c,b];indices.push(a,b,c);diagnostics.faces++;}
   for(let i=0;i<N;i++)for(let j=0;j<N-i;j++){face(rows[i][j],rows[i+1][j],rows[i][j+1]);if(j<N-i-1)face(rows[i+1][j],rows[i+1][j+1],rows[i][j+1]);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();const top=mesh(geo,pavement,0,0,0);top.name='stream-garden_approach_'+name;top.castShadow=false;
  for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3,x=(v[a]+v[b]+v[c])/3,y=(v[a+1]+v[b+1]+v[c+1])/3,z=(v[a+2]+v[b+2]+v[c+2])/3,surface=surfaceAt(x,z);diagnostics.minTerrainClearance=Math.min(diagnostics.minTerrainClearance,y-surface.ground);if(Number.isFinite(surface.road))diagnostics.minRoadClearance=Math.min(diagnostics.minRoadClearance,y-surface.road);if((v[b+2]-v[a+2])*(v[c]-v[a])-(v[b]-v[a])*(v[c+2]-v[a+2])<=0)diagnostics.downward++;}
  // Closed masonry sides seat every exposed apron edge below the actual earth surface.
  const wall=[],wi=[];
  for(let k=0;k<outline.length;k++){const a=outline[k],b=outline[(k+1)%outline.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(L/.1);
   for(let j=0;j<count;j++){const t0=j/count,t1=(j+1)/count,x0=a[0]+(b[0]-a[0])*t0,z0=a[1]+(b[1]-a[1])*t0,x1=a[0]+(b[0]-a[0])*t1,z1=a[1]+(b[1]-a[1])*t1,mx=(x0+x1)/2,mz=(z0+z1)/2;
    // Suppress internal walls at path/landing joins.
    const nx=-(z1-z0)/Math.hypot(x1-x0,z1-z0)*.015,nz=(x1-x0)/Math.hypot(x1-x0,z1-z0)*.015;
    if(surfaces.some(p=>p.name!==name&&(inside(mx+nx,mz+nz,p.outline)||inside(mx-nx,mz-nz,p.outline))))continue;
    const h0=walkingY(x0,z0),h1=walkingY(x1,z1),b0=Math.min(surfaceAt(x0,z0).ground-.18,h0-.18),b1=Math.min(surfaceAt(x1,z1).ground-.18,h1-.18),start=wall.length/3;
    wall.push(x0,b0,z0,x1,b1,z1,x1,h1,z1,x0,h0,z0);wi.push(start,start+1,start+2,start,start+2,start+3);
   }
  }
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wall,3));wg.setIndex(wi);wg.computeVertexNormals();const wm=stone[1].clone();wm.side=THREE.DoubleSide;const footing=mesh(wg,wm,0,0,0);footing.name='stream-garden_approach_foundation_'+name;
 }
 // Supported timber approach thresholds feather any cross-fall into the existing deck.
 // The bridge's beams, rails and original planks are untouched beneath these short wedges.
 for(const [c,z,half,arch] of [[n,31,1.25,.62],[s,-23,1.9,.14]])for(const side of [-1,1]){
  const edge=c+side*3.5,inner=c+side*2.85,y0=heightAt(c-3.5,z)+.19,y1=heightAt(c+3.5,z)+.19;
  const deck=x=>{const t=(x-c+3.5)/7;return y0+(y1-y0)*t+arch*4*t*(1-t);};
  const vertices=[],ii=[],nx=8,nz=16;
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
   const t=i/nx,x=inner+(edge-inner)*t,zz=z-half+j/nz*half*2,raise=Math.max(0,walkingY(edge,zz)-deck(edge));
   vertices.push(x,deck(x)+.004+raise*t*t,zz,x,deck(x)-.025,zz);
  }
  const row=(nz+1)*2;
  function face(a,b,c){const ax=vertices[b*3]-vertices[a*3],az=vertices[b*3+2]-vertices[a*3+2],bx=vertices[c*3]-vertices[a*3],bz=vertices[c*3+2]-vertices[a*3+2];if(az*bx-ax*bz<0)[b,c]=[c,b];ii.push(a,b,c);}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*row+j*2,b=a+row,d=a+2,cc=b+2;face(a,b,cc);face(a,cc,d);ii.push(a+1,cc+1,b+1,a+1,d+1,cc+1);}
  for(let i=0;i<nx;i++)for(const j of [0,nz]){const a=i*row+j*2,b=a+row;ii.push(a,a+1,b+1,a,b+1,b);}
  for(const i of [0,nx])for(let j=0;j<nz;j++){const a=i*row+j*2,b=a+2;ii.push(a,a+1,b+1,a,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(ii);geo.computeVertexNormals();const wm=wood[1].clone();wm.side=THREE.DoubleSide;const wedge=mesh(geo,wm,0,0,0);wedge.name='stream-garden_approach_threshold_'+z+'_'+side;
 }
 diagnostics.deckJoints=[];for(const [c,z,half] of [[n,31,1.25],[s,-23,1.9]])for(const side of [-1,1]){const x=c+side*3.5,deck=heightAt(x,z)+.19;diagnostics.deckJoints.push({z,side,unbeveledDeltas:[-half,0,half].map(d=>walkingY(x,z+d)-deck),thresholdJointGap:.004});}
 g.userData.approachDiagnostics=diagnostics;
 lantern(n-5.35,34);lantern(n+6.7,28.1);
 // Approach edge cobbles and discreet mooring/handcart bollards.
 for(const z of [31,-23]){const c=streamX(z),cw=z===31?2.5:3.8;for(const side of [-1,1])for(let k=0;k<5;k++){const x=c+side*(3.75+k*.30),zz=z+(cw/2+.52);mesh(rockGeo,stone[k%3],x,heightAt(x,zz)+.05,zz,.19,.12,.15)}}
 // The parent owns these short transitions, between the children's three reaches.
 const moss=mat(0x596a3e),grass=mat(0x657748),straw=mat(0x9a8f60);
 const roads=roadNetwork(),lots=layout().lots;
 function roadClear(x,z,radius){
  for(const road of roads)for(let k=1;k<road.points.length;k++){
   const a=road.points[k-1],b=road.points[k],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
   if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<road.width/2+.35+radius)return false;
  }
  if(lots.some(p=>Math.abs(x-p.x)<p.w/2+radius&&Math.abs(z-p.z)<p.d/2+radius))return false;
  // Parent bridge access, including the east-bank harbor connector.
  for(const points of links)for(let k=1;k<points.length;k++){
   const a=points[k-1],b=points[k],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
   if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<.75+radius)return false;
  }
  if(Math.abs(z-31)<2.2)return false;
  return true;
 }
 for(const [za,zb] of [[-29.6,-19.4],[27.4,35.6]]){
  for(let z=za;z<zb;z+=.46)for(const side of [-1,1]){
   const zz=z+(rand()-.5)*.25,x=streamX(zz)+side*(2.48+rand()*.35),r=.32+rand()*.3;
   // Irregular bank toe stones sit partly under water and partly in the earth bank.
   if(Math.abs(zz-31)>1.6&&Math.abs(zz+23)>2.35)mesh(rockGeo,stone[Math.floor(rand()*3)],x,streamWater(zz)+.25,zz,r,.64+rand()*.2,r*.8).rotation.y=rand()*6;
   for(let j=0;j<4;j++){
    const px=streamX(zz)+side*(3.05+rand()*2.6),pz=zz+(rand()-.5)*.4,pr=.05+rand()*.11;
    if(!roadClear(px,pz,pr))continue;
    mesh(rockGeo,stone[j%3],px,heightAt(px,pz)+pr*.2,pz,pr,pr*.6,pr*.8).rotation.y=rand()*6;
   }
  }
  for(let i=0;i<65;i++){
   const z=za+rand()*(zb-za),side=i%2?1:-1,x=streamX(z)+side*(3.2+rand()*3.1);
   if(!roadClear(x,z,.38))continue;const y=heightAt(x,z);
   if(i%4===0)mesh(rockGeo,moss,x,y+.03,z,.22+rand()*.28,.09,.2+rand()*.2);
   for(let j=0;j<6;j++){
    const angle=rand()*6.28,h=.22+rand()*.47,dx=Math.cos(angle),dz=Math.sin(angle),px=x+dx*.08,pz=z+dz*.08;
    beam([px,y-.025,pz],[px+dx*.15,y+h,pz+dz*.15],.014,.023,j%3?grass:straw);
   }
  }
 }
 // Mortared wing walls beside each bridge stop the apron edge eroding into the stream.
 for(const z of [31,-23])for(const side of [-1,1])for(const fore of [-1,1]){
  const clear=z===31?2.5:3.8;
  for(let j=0;j<3;j++){
   const zz=z+fore*(clear/2+.24+j*.45),x=streamX(z)+side*3.18;
   for(let row=0;row<3;row++)box(x,streamWater(zz)+.12+row*.27,zz,.63,.24,.42,stone[(j+row)%3]);
  }
 }
 return g;
}
