// Shared landscape and circulation. Coordinates are metres, x east, z north.
export function streamX(z) { return 54 + 10*Math.sin(z/47) + 4*Math.sin(z/21); }
export function heightAt(x,z) {
 const base=2.5+0.7*Math.sin(x/49)*Math.cos(z/57)+0.45*Math.sin((x+z)/33)+9*Math.exp(-((x+91)**2/1050+(z-76)**2/850));
 const d=Math.abs(x-streamX(z));
 const blend=Math.max(0,Math.min(1,(d-5)/8));
 return -0.65+(base+0.65)*(blend*blend*(3-2*blend));
}
export function roadNetwork() { return [
 {id:'market_west',width:5.5,points:[[-650,-12],[-175,-19],[-116,-20],[-75,-16],[-45,-5],[-22,-4]]},
 {id:'bridge_east',width:5.5,points:[[-22,-4],[4,-10],[26,-22],[48,-22],[76,-22],[116,-37],[175,-43],[650,-65]]},
 {id:'church_mill',width:4,points:[[-23,9],[-23,30],[-37,44],[-57,55],[-78,64],[-101,62],[-113,81],[-121,93],[-175,108],[-650,310]]},
 {id:'south_farms',width:4.8,points:[[-23,-17],[-26,-41],[-46,-66],[-71,-83],[-102,-108],[-124,-175],[-260,-650]]},
 {id:'east_farms',width:3.6,points:[[83,-25],[96,3],[102,40],[111,83],[132,175],[210,650]]},
 {id:'west_lane',width:3,points:[[-65,-15],[-69,7],[-64,30],[-57,55]]}
 ]; }
export function layout() { return {
 square:{center:[-22,-4],rect:[-37,-18,-7,11]},
 village:{rect:[-92,-57,30,45],housePlots:[[-49,-18,10,9],[-51,12,10,9],[-48,28,11,9],[-30,23,10,9],[-12,24,10,9],[7,18,10,9],[10,0,10,9],[-2,-27,11,9],[-17,-32,10,9],[-37,-34,10,9],[-57,-34,10,9],[-69,-1,9,8],[-68,19,9,8],[10,-39,9,8],[-62,-47,9,8],[-43,-51,9,8],[-4,37,9,8],[17,36,9,8],[-83,7,9,8],[-84,-36,9,8],[-84,-13,9,8],[-82,29,9,8],[-17,-50,9,8],[23,-25,9,8]]},
 church:{center:[-35,59],yard:[-56,39,-12,84]},
 windmill:{center:[-91,76],yard:[-111,57,-70,100]},
 farms:{west:[-137,-137,-54,-58],east:[78,-117,141,113]},
 bridge:{center:[streamX(-22),-22],length:24,width:6,deckY:3.0},
 reserved:'Keep buildings outside road widths + 2m and 13m from stream center. Root owns all terrain, stream, bridge, roads and peripheral trees.'
 }; }
// Compatibility hook for delivered districts; all temporary masses are retired.
export function clearBlockout(name) {}
export function build(THREE,ctx) {
 const g=new THREE.Group(); g.name='root_landscape';
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.92});
 const grass=mat('#749451'), soil=mat('#988261'), water=new THREE.MeshStandardMaterial({color:'#568f91',roughness:0.28,metalness:0.15});
 const wood=mat('#6b4b30'), stone=mat('#858479');
 function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.receiveShadow=true;g.add(o);return o;}
 function box(x,y,z,w,h,d,m){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 function beam(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),6),m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o;}
 const outer=new THREE.PlaneGeometry(16000,16000);outer.rotateX(-Math.PI/2);mesh(outer,grass,0,-1.1,0);
 const geo=new THREE.PlaneGeometry(1100,1100,700,700);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;const colors=[];
 for(let i=0;i<p.count;i++){const stretch=v=>Math.abs(v)>220?Math.sign(v)*(220+(Math.abs(v)-220)*15):v;const x=stretch(p.getX(i)),z=stretch(p.getZ(i));p.setX(i,x);p.setZ(i,z);p.setY(i,heightAt(x,z));const d=Math.abs(x-streamX(z));const c=new THREE.Color(d<10?'#96936a':'#789655');c.multiplyScalar(.95+.05*Math.sin(x*.23)*Math.cos(z*.28)+.04*Math.sin((x+z)*.075));colors.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
 function ribbon(points,width,m,offset=.07,fixedY=null){const verts=[],idx=[];for(let k=0;k<points.length-1;k++){const a=points[k],b=points[k+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/1.7),nx=-(b[1]-a[1])/len*width/2,nz=(b[0]-a[0])/len*width/2;for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,vs=[[a[0]+(b[0]-a[0])*t+nx,a[1]+(b[1]-a[1])*t+nz],[a[0]+(b[0]-a[0])*t-nx,a[1]+(b[1]-a[1])*t-nz],[a[0]+(b[0]-a[0])*u+nx,a[1]+(b[1]-a[1])*u+nz],[a[0]+(b[0]-a[0])*u-nx,a[1]+(b[1]-a[1])*u-nz]];const j=verts.length/3;for(const [x,z]of vs)verts.push(x,fixedY??heightAt(x,z)+offset,z);idx.push(j,j+2,j+1,j+1,j+2,j+3);}}const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));q.setIndex(idx);q.computeVertexNormals();return mesh(q,m);}
 const river=[];for(let z=-5300;z<=5300;z+=(Math.abs(z)<240?2:18))river.push([streamX(z),z]);const rv=[],ri=[];for(let i=0;i<river.length;i++){const [x,z]=river[i];rv.push(x-5.25,.42,z,x+5.25,.42,z);if(i<river.length-1){const j=i*2;ri.push(j,j+2,j+1,j+1,j+2,j+3);}}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));rg.setIndex(ri);rg.computeVertexNormals();mesh(rg,water);
 const roadEdge=mat('#8d8560');for(const r of roadNetwork()){ribbon(r.points,r.width+1.25,roadEdge,.10);ribbon(r.points,r.width,soil,.18);}
 for(const r of roadNetwork())for(const [x,z]of r.points.slice(1,-1)){const q=new THREE.CircleGeometry(r.width/2,16);q.rotateX(-Math.PI/2);const pp=q.attributes.position;for(let i=0;i<pp.count;i++)pp.setY(i,heightAt(x+pp.getX(i),z+pp.getZ(i))+.19);q.computeVertexNormals();mesh(q,soil,x,0,z);}
 // Wooden crossing with planks, piles, braces and open railings.
 const b=layout().bridge,bx=b.center[0],bz=b.center[1];for(let i=0;i<40;i++)box(bx-12+(i+.5)*.6,b.deckY-.18,bz,.57,.36,6,wood);
 for(const zz of [-2.7,2.7]){for(const xx of [-10,-5,0,5,10]){box(bx+xx,1.6,bz+zz,.36,5.3,.36,wood);}for(const yy of [3.65,4.55])box(bx,yy,bz+zz,24,.18,.18,wood);box(bx,2.48,bz+zz,25,.5,.4,wood);for(let i=-10;i<10;i+=5)beam([bx+i,3.5,bz+zz],[bx+i+5,4.5,bz+zz],.10,wood);}
 // Raised earthen approaches meet the bridge's deck rather than descending into the channel.
 for(const sign of [-1,1]){const verts=[];const inds=[];for(let i=0;i<=12;i++){const x=bx+sign*(12+i*.55),y=b.deckY*(1-i/12)+(heightAt(x,bz)+.10)*(i/12);verts.push(x,y,bz-3,x,y,bz+3);if(i<12){const j=i*2;inds.push(j,j+1,j+2,j+1,j+3,j+2);}}const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));q.setIndex(inds);q.computeVertexNormals();const m=soil.clone();m.side=THREE.DoubleSide;mesh(q,m);}
 let seed=84931;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const leaf=[mat('#4c7037'),mat('#587d3c'),mat('#668649'),mat('#779148')];
 const childObjects=Object.values(ctx.objects||{}).filter(o=>o.task&&o.task!=='root'&&o.bbox);
 function insideChild(x,z,pad=3){return childObjects.some(o=>{const b=o.bbox;return x>b[0]-pad&&x<b[3]+pad&&z>b[2]-pad&&z<b[5]+pad;});}
 function roadClearance(x,z){let distance=Infinity;for(const r of roadNetwork())for(let i=0;i<r.points.length-1;i++){const a=r.points[i],b=r.points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));distance=Math.min(distance,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-r.width/2);}return distance;}
 function tree(x,z,s){if(insideChild(x,z,3)||roadClearance(x,z)<3)return;const y=heightAt(x,z);mesh(new THREE.CylinderGeometry(.20*s,.34*s,3.9*s,7),wood,x,y+1.95*s,z);for(let j=0;j<4;j++)mesh(new THREE.IcosahedronGeometry((2.0+rand()*.6)*s,1),leaf[Math.floor(rand()*4)],x+(rand()-.5)*2*s,y+(4.4+rand()*1.6)*s,z+(rand()-.5)*2*s);}
 for(let i=0;i<150;i++){let x=-190+rand()*380,z=-185+rand()*370;if(Math.abs(x)<140&&Math.abs(z)<137)continue;if(Math.abs(x-streamX(z))<15)continue;tree(x,z,.9+rand()*.8);}
 for(let z=-142;z<151;z+=8+rand()*7){if(Math.abs(z+22)<19)continue;const side=rand()>.5?1:-1,x=streamX(z)+side*(14+rand()*5);tree(x,z,.7+rand()*.5);}
 for(let i=0;i<130;i++){const z=-160+rand()*320;if(Math.abs(z+22)<15)continue;const x=streamX(z)+(rand()>.5?1:-1)*(6+rand()*3),y=heightAt(x,z);const r=mesh(new THREE.DodecahedronGeometry(.35+rand()*.7,0),stone,x,Math.max(.4,y)+.2,z);r.scale.set(1.4,.65,1);}
 // Small-scale riparian habitat makes the common stream continuous between districts.
 const batches=new Map(),dummy=new THREE.Object3D();
 function instance(geo,m,x,y,z,sx,sy,sz,angle=0){let b=batches.get(geo);if(!b){b=new Map();batches.set(geo,b);}if(!b.has(m))b.set(m,[]);b.get(m).push([x,y,z,sx,sy,sz,angle]);}
 const stemGeo=new THREE.BoxGeometry(1,1,1),pebbleGeo=new THREE.DodecahedronGeometry(1,0),shrubGeo=new THREE.IcosahedronGeometry(1,1);
 const reed=mat('#72834d'),reedHead=mat('#665238'),ripple=mat('#789d9b'),pebble=mat('#a2a38b');
 for(let i=0;i<430;i++){
  const z=-158+rand()*316;if(Math.abs(z+22)<10)continue;
  const side=rand()<.5?-1:1,x=streamX(z)+side*(5.8+rand()*3.6),y=Math.max(.4,heightAt(x,z));
  if(roadClearance(x,z)<1)continue;
  for(let j=0;j<5;j++){const xx=x+(rand()-.5)*1.1,zz=z+(rand()-.5)*1.2,yy=Math.max(.4,heightAt(xx,zz)),h=.35+rand()*.9;instance(stemGeo,reed,xx,yy+h/2,zz,.05,h,.06,rand()*6.28);if(j===0)instance(stemGeo,reedHead,xx,yy+h,zz,.10,.19,.11);}
  if(i%3===0)instance(pebbleGeo,pebble,x,y+.06,z,.15+rand()*.3,.10+rand()*.15,.2+rand()*.35,rand()*6.28);
 }
 for(let i=0;i<330;i++){const z=-160+rand()*320,x=streamX(z)+(rand()-.5)*8;if(Math.abs(z+22)<5)continue;instance(stemGeo,ripple,x,.432,z,.035+rand()*.05,.008,.3+rand()*1.1,(rand()-.5)*.2);}
 for(let i=0;i<105;i++){const z=-149+rand()*298,x=streamX(z)+(rand()<.5?-1:1)*(10+rand()*2.5);if(Math.abs(z+22)<16||roadClearance(x,z)<2||insideChild(x,z,1))continue;const y=heightAt(x,z),h=.35+rand()*.6;instance(shrubGeo,leaf[i%4],x,y+h*.65,z,.65+rand()*.6,h,.6+rand()*.5,rand()*6.28);}
 // Road stones and worn wheel traces stay on the owned road surfaces.
 const rut=mat('#8c7656');
 for(const r of roadNetwork())for(let k=0;k<r.points.length-1;k++){
  const a=r.points[k],b=r.points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
  for(let d=1;d<L;d+=2.4){const x=a[0]+dx*d/L,z=a[1]+dz*d/L;if(Math.abs(x)>160||Math.abs(z)>160||Math.abs(x-streamX(z))<19)continue;if(x>-95&&x<32&&z>-57&&z<45)continue;
   for(const side of [-1,1]){const xx=x+side*dz/L*r.width*.22,zz=z-side*dx/L*r.width*.22;instance(stemGeo,rut,xx,heightAt(xx,zz)+.205,zz,.13,.012,.7+rand()*.8,ang);}
   if(rand()<.5){const xx=x+dz/L*(rand()-.5)*r.width,zz=z-dx/L*(rand()-.5)*r.width;instance(pebbleGeo,stone,xx,heightAt(xx,zz)+.22,zz,.09,.04,.13,rand()*6.28);}
  }
 }
 for(const [geo,materials]of batches)for(const [m,items]of materials){const im=new THREE.InstancedMesh(geo,m,items.length);items.forEach((v,i)=>{dummy.position.set(v[0],v[1],v[2]);dummy.scale.set(v[3],v[4],v[5]);dummy.rotation.set(0,v[6],0);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});im.receiveShadow=true;g.add(im);}
 return g;
}
