import {heightAt,streamX,streamWater,roadNetwork,layout} from './root.js';

export function build(THREE,ctx){
 const group=new THREE.Group(); group.name='estuary-bank_lower_stream';
 const assemblies={};for(const name of ['stones','reeds','moss','pines','driftwood']){const a=new THREE.Group();a.name='estuary-bank_'+name;assemblies[name]=a;group.add(a)}
 let seed=89137; const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const roads=roadNetwork(),lots=layout().lots;
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:0.96});
 const stoneM=[0x777971,0x85867b,0x656e67,0x939083,0x626860].map(mat);
 const mossM=mat(0x586743),bark=mat(0x665743),heart=mat(0xa6997a),wood=mat(0x9b947f),darkWood=mat(0x756e59);
 const reedM=[0x75805a,0x8c9164,0x5e7451,0xaaa078].map(mat),seedM=mat(0x76654b);
 const pineM=[0x354c3a,0x435b40,0x53694b].map(mat);
 const bucket=new Map(),stoneGeo=[];
 const dummy=new THREE.Object3D(),rodGeometries=new Map();
 const sphere=new THREE.IcosahedronGeometry(1,1),unitCyl=new THREE.CylinderGeometry(1,1,1,7),needleGeo=new THREE.ConeGeometry(0.026,0.35,3);
 for(let j=0;j<6;j++){let geo=new THREE.IcosahedronGeometry(1,1);let p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);let f=1+0.13*Math.sin(x*9+j*2)*Math.cos(z*7+y*8);p.setXYZ(i,x*f,y*(0.95+0.12*Math.sin(x*7+z*8+j)),z*f)}geo.computeVertexNormals();stoneGeo.push(geo)}
 function instance(geo,m,x,y,z,sx,sy,sz,ry=0,q=null){let key=geo.uuid+m.uuid;if(!bucket.has(key))bucket.set(key,{geo,m,list:[]});dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,0);if(q)dummy.quaternion.copy(q);dummy.updateMatrix();bucket.get(key).list.push(dummy.matrix.clone())}
 function rod(a,b,r0,r1,m){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const ratio=Math.round(r1/r0*10)/10;if(!rodGeometries.has(ratio))rodGeometries.set(ratio,new THREE.CylinderGeometry(ratio,1,1,7));const geo=rodGeometries.get(ratio);instance(geo,m,...av.add(bv).multiplyScalar(.5).toArray(),r0,v.length(),r0,0,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()))}
 function distance(x,z,a,b){let dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
 function valid(x,z,r=0){if(z-r < -84||z+r> -30||x+r>=49||Math.abs(x-streamX(z))+r>8||Math.abs(x-streamX(z))-r<2.14)return false;if(lots.some(p=>Math.abs(x-p.x)<p.w/2+r&&Math.abs(z-p.z)<p.d/2+r))return false;return !roads.some(p=>p.points.slice(1).some((b,i)=>distance(x,z,p.points[i],b)<p.width/2+.35+r))}
 const taper=z=>Math.max(0,Math.min(1,z+84,-30-z));
 function rock(x,z,r,flat=1){if(!valid(x,z,r))return;let y=heightAt(x,z),h=r*(.45+rand()*.5)*flat;instance(stoneGeo[Math.floor(rand()*6)],stoneM[Math.floor(rand()*5)],x,y+h*.22,z,r,h,r*(.65+rand()*.4),rand()*6.28);if(z>-68&&r>.28&&rand()<.56){instance(sphere,mossM,x-.05,y+h*.94,z,.62*r,.038,.52*r,rand()*6.28)}}
 // Scattered shoal and bank stones: asymmetric clusters, no regular retaining wall.
 for(let i=0;i<720;i++){let z=-83.8+rand()*53.6;if(rand()>taper(z))continue;let side=rand()<.5?-1:1,off=2.55+rand()*3.3,x=streamX(z)+side*off,r=.18+Math.pow(rand(),2)*.66;rock(x,z,r)}
 for(let i=0;i<2600;i++){let z=-83.9+rand()*53.8;if(rand()>taper(z))continue;let off=2.35+Math.pow(rand(),1.8)*4.7,x=streamX(z)+(rand()<.5?-off:off);rock(x,z,.045+rand()*.13,.6)}
 // Botanical blades are folded triangular prisms; curving segment centers make them lean.
 const blades=reedM.map(()=>({p:[],ix:[]}));
 function blade(x,y,z,angle,h,w,bend,mi){let b=blades[mi],start=b.p.length/3;for(let k=0;k<=5;k++){let t=k/5,lean=bend*t*t,cx=x+Math.cos(angle)*lean,cz=z+Math.sin(angle)*lean,cy=y+h*(t-.16*t*t),ww=w*(1-t)*.5; b.p.push(cx-Math.sin(angle)*ww,cy,cz+Math.cos(angle)*ww,cx,cy+.025*(1-t),cz,cx+Math.sin(angle)*ww,cy,cz-Math.cos(angle)*ww);if(k){let a=start+(k-1)*3,c=start+k*3;b.ix.push(a,c,a+1,a+1,c,c+1,a+1,c+1,a+2,a+2,c+1,c+2)}}}
 for(let i=0;i<430;i++){let z=-82.5+rand()*52,x=streamX(z)+(rand()<.5?-1:1)*(2.65+rand()*3.7);if(!valid(x,z,.45)||rand()>taper(z))continue;let y=heightAt(x,z);if(y<.03)continue;const wet=z<-65&&y-streamWater(z)<1.8,n=10+Math.floor(rand()*11),h=(wet?.6:.35)+rand()*.65;for(let k=0;k<n;k++){let a=rand()*6.28,rr=rand()*.15,bx=x+Math.cos(a)*rr,bz=z+Math.sin(a)*rr;blade(bx,heightAt(bx,bz)-.015,bz,a,h*(.6+rand()*.6),.04+rand()*.06,.2+rand()*.4,Math.floor(rand()*4))}if(wet&&rand()<.6){for(let j=0;j<3;j++){let a=rand()*6.28,b=[x+.12*Math.cos(a),y+h*1.35,z+.12*Math.sin(a)];rod([x,y,z],b,.014,.01,reedM[1]);instance(sphere,seedM,b[0],b[1],b[2],.045,.14,.045)}}}
 for(let b=0;b<4;b++){let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(blades[b].p,3));geo.setIndex(blades[b].ix);geo.computeVertexNormals();let m=reedM[b].clone();m.side=THREE.DoubleSide;assemblies.reeds.add(new THREE.Mesh(geo,m))}
 // Small terrain-conforming cushions and visible moss tips upstream.
 for(let i=0;i<580;i++){let z=-68+rand()*37,x=streamX(z)+(rand()<.5?-1:1)*(2.55+rand()*3.6);if(!valid(x,z,.18))continue;let y=heightAt(x,z);instance(sphere,mossM,x,y+.015,z,.09+rand()*.15,.035,.07+rand()*.13,rand()*6.28)}
 function pine(z,side,size){let x=streamX(z)+side*5.9;if(!valid(x,z,1.6))return;let y=heightAt(x,z),top=[x+.95*size,y+5.8*size,z-.25*size];let nodes=[[x,y-.12,z],[x-.15,y+1.7*size,z],[x+.38*size,y+3.7*size,z-.16],top];for(let i=1;i<nodes.length;i++)rod(nodes[i-1],nodes[i],(.24-i*.04)*size,(.19-i*.035)*size,bark);
  for(let k=0;k<7;k++){let a=k*2.399,rx=x+Math.cos(a)*(.65+rand()*.65),rz=z+Math.sin(a)*(.65+rand()*.65);rod([x,y+.08,z],[rx,heightAt(rx,rz)+.045,rz],.09,.023,bark);let ex=rx+Math.cos(a)*.35,ez=rz+Math.sin(a)*.35;rod([rx,heightAt(rx,rz)+.045,rz],[ex,heightAt(ex,ez)+.008,ez],.026,.007,bark)}
  for(let c=0;c<5;c++){let a=c*2.399,end=[top[0]+Math.cos(a)*.55,top[1]+.12,top[2]+Math.sin(a)*.45];rod([top[0]-.12,top[1]-.65,top[2]],end,.045,.007,bark);for(let n=0;n<75;n++){let az=rand()*6.28,rr=rand()*.43;instance(needleGeo,pineM[c%3],end[0]+Math.cos(az)*rr,end[1]+rand()*.25,end[2]+Math.sin(az)*rr,1,1+rand()*.4,1,az,new THREE.Quaternion().setFromEuler(new THREE.Euler((rand()-.5)*1.5,az,(rand()-.5)*1.5)))}}
  for(let k=0;k<13;k++){let a=k*2.399,level=2.3+rand()*3.2,base=[x+.15*level,y+level*size,z-.04*level],len=(1.1+rand()*.8)*size,tip=[base[0]+Math.cos(a)*len+.4,base[1]+.28,base[2]+Math.sin(a)*len*.66];rod(base,tip,.07*size,.018*size,bark);for(let t=0;t<5;t++){let aa=a+(t-2)*.5,end=[tip[0]+Math.cos(aa)*.55,tip[1]+.13+rand()*.22,tip[2]+Math.sin(aa)*.5];rod(tip,end,.017,.006,bark);for(let n=0;n<34;n++){let az=rand()*6.28,rr=rand()*.5,px=end[0]+Math.cos(az)*rr,pz=end[2]+Math.sin(az)*rr*.7,py=end[1]+rand()*.22;let q=new THREE.Quaternion().setFromEuler(new THREE.Euler((rand()-.5)*1.6,rand()*6.28,(rand()-.5)*1.6));instance(needleGeo,pineM[(k+t)%3],px,py,pz,1,1+rand()*.6,1,0,q)}}}
 }
 pine(-74,-1,1.02);pine(-56,1,1.06);pine(-38,-1,.95);
 // Bleached tidal logs follow sampled ground at each endpoint; snapped forks and end grain.
 for(let i=0;i<11;i++){let z=-81+rand()*12,x=streamX(z)+(i%2?1:-1)*(3.35+rand()*2.8),a=rand()*6.28,len=.7+rand()*1.6,r=.06+rand()*.065;let xa=x+Math.cos(a)*len*.5,za=z+Math.sin(a)*len*.5,xb=x-Math.cos(a)*len*.5,zb=z-Math.sin(a)*len*.5;if(!valid(xa,za,.16)||!valid(xb,zb,.16)||heightAt(x,z)<.05)continue;let p=[xa,heightAt(xa,za)+r*.7,za],q=[xb,heightAt(xb,zb)+r*.7,zb];rod(p,q,r,r*.83,wood);const v=new THREE.Vector3(...q).sub(new THREE.Vector3(...p)).normalize(),rot=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v);instance(unitCyl,heart,...p,r*.88,.012,r*.88,0,rot);for(let n=0;n<3;n++){let f=.2+n*.23,c=p.map((v,k)=>v+(q[k]-v)*f);rod(c,[c[0]+Math.sin(a)*.2,c[1]+.14+rand()*.17,c[2]-Math.cos(a)*.3],r*.42,.009,darkWood)}for(let n=0;n<3;n++){let off=(n-1)*r*.5;rod([p[0]+off,p[1]+r*.7,p[2]],[q[0]+off,q[1]+r*.6,q[2]],.006,.006,darkWood)}}
 for(const {geo,m,list} of bucket.values()){const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((mx,i)=>im.setMatrixAt(i,mx));im.castShadow=true;im.receiveShadow=true;const key=stoneM.includes(m)?'stones':m===mossM?'moss':reedM.includes(m)||m===seedM?'reeds':pineM.includes(m)||m===bark?'pines':'driftwood';assemblies[key].add(im)}
 return group;
}
