import {heightAt, roadNetwork, layout} from './root.js';
import {northReservations} from './north.js';

export function northCentralLayout(){return layout().town.lots.map((l,i)=>({...l,index:i})).filter(l=>[26,27,32,33].includes(l.index)).map(l=>({...l,rect:l.z<0?(l.x===-43?[-52.7,-6.8,-37,5.48]:[-37,-6.8,-23,5.48]):(l.x===-43?[-51,10.55,-37,28.65]:[-37,10.55,-23,28.65]),sidePathX:l.x===-43?-49.1:-24.8,frontPathZ:l.z<0?4.72:11.22,rearPathZ:l.z<0?-6.25:23.15}));}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='North-central worked yards, access paths and family laundry court';
 const yardGroups=new Map();for(const l of northCentralLayout()){const q=new THREE.Group();q.name=`north-central_yard_surface_${l.index}`;g.add(q);yardGroups.set(l.index,q);}const laundry=new THREE.Group();laundry.name='north-central_family_laundry_court';g.add(laundry);let current=g;
 const colors={earth:'#95886a',earth2:'#9a8e71',earth3:'#8f8166',path:'#b0a18a',stone:'#8a8d80',light:'#a3a290',wood:'#745339',wood2:'#967451',dark:'#4b4034',rope:'#c4ad7b',cream:'#ddd8bd',blue:'#788b96',sage:'#98a389',terra:'#a77657',leaf:'#4d7050',pink:'#d8a6af',water:'#758f8d',iron:'#535b57'};
 const mats={};for(const [k,c] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.92,side:THREE.DoubleSide});
 const bg=new THREE.BoxGeometry(1,1,1),cg=new THREE.CylinderGeometry(1,1,1,10),sg=new THREE.IcosahedronGeometry(1,1),tg=new THREE.TorusGeometry(1,.075,6,16),batch=new Map(),o=new THREE.Object3D();
 function inst(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();put(geo,m);}
 function put(geo,m){const key=current.uuid+geo.uuid+m;if(!batch.has(key))batch.set(key,{geo,m:mats[m],xs:[],target:current});batch.get(key).xs.push(o.matrix.clone());}
 const box=(x,y,z,w,h,d,m,ry=0)=>inst(bg,m,x,y,z,w,h,d,0,ry);
 function beam(a,b,r,m){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();put(cg,m);}
 const roads=roadNetwork(),res=northReservations(),lots=northCentralLayout();
 function allowed(x,z,margin=.10){for(const rd of roads)for(let i=1;i<rd.points.length;i++){const a=rd.points[i-1],b=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+margin)return false;}if(res.gardens.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.15))return false;if(x>res.drains.x[0]&&x<res.drains.x[1]&&res.drains.z.some(v=>Math.abs(z-v)<res.drains.halfWidth+.04)&&!lots.some(l=>Math.abs(x-l.x)<res.entryHalfWidth))return false;return true;}
 function surface(rect,m,offset=.035,exclude=true){let [x0,z0,x1,z1]=rect,v=[],idx=[],nx=Math.ceil((x1-x0)/.42),nz=Math.ceil((z1-z0)/.42);for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){let a=x0+(x1-x0)*ix/nx,b=x0+(x1-x0)*(ix+1)/nx,c=z0+(z1-z0)*iz/nz,d=z0+(z1-z0)*(iz+1)/nz,x=(a+b)/2,z=(c+d)/2;if(!allowed(x,z))continue;if(exclude&&lots.some(l=>Math.abs(x-l.x)<(9-l.index%3*.25)/2+.2&&Math.abs(z-l.z)<(7+l.index%2*.3)/2+.2))continue;let n=v.length/3;for(const [xx,zz]of [[a,c],[a,d],[b,c],[b,d]])v.push(xx,heightAt(xx,zz)+offset,zz);idx.push(n,n+1,n+2,n+2,n+1,n+3);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mats[m]);mesh.receiveShadow=true;current.add(mesh);}
 for(const l of lots){current=yardGroups.get(l.index);surface(l.rect,l.index%2?'earth2':'earth');if(l.z<0)surface([l.sidePathX-.38,l.rearPathZ,l.sidePathX+.38,l.frontPathZ],'path',.055);
  if(l.z>0)surface([l.sidePathX-.38,l.frontPathZ,l.sidePathX+.38,l.rearPathZ],'path',.055);
  surface([Math.min(l.sidePathX,l.x),l.frontPathZ-.34,Math.max(l.sidePathX,l.x),l.frontPathZ+.34],'path',.055);
  surface([l.x-1.16,l.z<0?l.frontPathZ:9.8,l.x+1.16,l.z<0?6.2:l.frontPathZ],'path',.055);
  if(l.z>0)surface([Math.min(l.x-3.7,l.sidePathX-.38),22.82,Math.max(l.x+3.7,l.sidePathX+.38),23.48],'path',.055);
 }
 for(const l of lots)for(let k=0;k<180;k++){current=yardGroups.get(l.index);const [a,c,b,d]=l.rect,x=a+(.5+.5*Math.sin(k*127.13+l.index))*(b-a),z=c+(.5+.5*Math.sin(k*311.71+2))*(d-c);if(!allowed(x,z)||Math.abs(x-l.x)<4.8&&Math.abs(z-l.z)<4.05)continue;inst(sg,k%3?'earth3':'light',x,heightAt(x,z)+.05,z,.035+(k%3)*.014,.022,.035);}
 current=laundry;
 // Southwest family yard: a narrow working court beside the complete shell.
 function fence(a,b){let length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/.95),last=null;for(let i=0;i<=n;i++){let t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=heightAt(x,z);box(x,y+.48,z,.12,1.03,.12,'wood');for(const h of [.31,.77])if(last)beam([last.x,last.y+h,last.z],[x,y+h,z],.044,'wood2');last={x,y,z};}}
 fence([-52.25,-5.9],[-52.25,4.7]);fence([-52.25,-5.9],[-49.7,-5.9]);fence([-52.25,4.85],[-50,4.85]);fence([-48.5,4.85],[-44.5,4.85]);fence([-41.5,4.85],[-37.5,4.85]);
 // Open side gate hung against its own seated post.
 fence([-50,4.85],[-50,3.95]);
 const poles=[[-51.2,-3.6],[-51.2,1.3]],tops=poles.map(([x,z])=>[x,heightAt(x,z)+2.25,z]);for(let i=0;i<2;i++)beam([poles[i][0],heightAt(...poles[i])-.12,poles[i][1]],tops[i],.065,'wood');beam(tops[0],tops[1],.015,'rope');
 for(let k=0;k<5;k++){const z=-3.32+k*.86,ya=tops[0][1]+(tops[1][1]-tops[0][1])*(z+3.6)/4.9,h=k%2?.95:1.25;const v=[],ids=[];for(let i=0;i<=6;i++){let zz=z+i*.105,yy=ya+(tops[1][1]-tops[0][1])*i*.105/4.9,xx=-51.2+.045*Math.sin(i*2+k);v.push(xx,yy,zz,xx+.035,yy-h+.04*Math.sin(i),zz);if(i<6)ids.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ids);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mats[['cream','blue','cream','sage','cream'][k]]);mesh.castShadow=true;current.add(mesh);for(const dz of [.09,.52])box(-51.2,ya+.035,z+dz,.06,.12,.035,'wood2');}
 function tub(x,z,r=.4){const y=heightAt(x,z);inst(cg,'wood2',x,y+.26,z,r,.48,r);inst(cg,'dark',x,y+.509,z,r*.83,.012,r*.83);inst(cg,'water',x,y+.52,z,r*.72,.012,r*.72);for(const h of [.09,.4])inst(tg,'iron',x,y+h,z,r, r, r,Math.PI/2);for(let k=0;k<12;k++){let a=k/12*Math.PI*2;box(x+Math.cos(a)*r,y+.26,z+Math.sin(a)*r,.035,.43,.035,'wood');}}
 tub(-50.6,2.9,.53);tub(-49.9,2,.24);
 let sy=heightAt(-50.75,2.05);box(-50.75,sy+.20,2.05,.62,.37,.5,'stone');for(let i=0;i<7;i++)box(-50.75,sy+.402,1.85+i*.06,.59,.035,.025,'light');
 // Seated plank storage chest, hinges and a lid; baskets and short firewood.
 const cy=heightAt(-50.7,-5);box(-50.7,cy+.4,-5,1.5,.74,.65,'wood');for(let k=0;k<7;k++)box(-51.36+k*.215,cy+.42,-4.66,.19,.66,.035,'wood2');box(-50.7,cy+.81,-5,1.58,.10,.74,'wood2');for(const dx of [-.47,.47])box(-50.7+dx,cy+.85,-5,.06,.025,.66,'iron');box(-50.7,cy+.62,-4.62,.16,.20,.06,'iron');
 for(let j=0;j<3;j++)for(let i=0;i<5-j;i++){let x=-38.8+i*.20,z=3.65,y=heightAt(x,z)+.16+j*.18;beam([x,y,z-.36],[x,y,z+.36],.10,'wood');inst(cg,'wood2',x,y,z+.37,.084,.025,.084,Math.PI/2);}
 function pot(x,z,r,flowers=false){let y=heightAt(x,z);inst(cg,'terra',x,y+r*.7,z,r,r*1.3,r);inst(tg,'terra',x,y+r*1.35,z,r,r,r,Math.PI/2);inst(cg,'earth3',x,y+r*1.36,z,r*.8,.025,r*.8);for(let j=0;j<7;j++){let a=j*2.4,xx=x+Math.cos(a)*r*.65,zz=z+Math.sin(a)*r*.65;beam([x,y+r*1.35,z],[xx,y+r*2.6,zz],.018,'leaf');inst(sg,flowers?'pink':'leaf',xx,y+r*2.7,zz,r*.3,r*.25,r*.3);}}
 for(const [x,z,r,f]of [[-47.1,3.25,.29,true],[-46.25,3.3,.25,false],[-45.55,3.5,.23,true],[-39.1,2.4,.32,false],[-47.7,4.0,.3,true]])pot(x,z,r,f);
 // Small stone lantern marks the side gate without narrowing the approach.
 let x=-51.25,z=4.3,y=heightAt(x,z);box(x,y+.13,z,.62,.26,.62,'stone');box(x,y+.53,z,.22,.65,.22,'stone');box(x,y+.93,z,.5,.16,.5,'light');box(x,y+1.14,z,.32,.3,.32,'dark');box(x,y+1.14,z,.33,.19,.20,'cream');box(x,y+1.14,z,.20,.19,.33,'cream');inst(new THREE.ConeGeometry(.46,.27,4),'stone',x,y+1.41,z,1,1,1,0,Math.PI/4);inst(sg,'stone',x,y+1.62,z,.10,.12,.10);
 for(const b of batch.values()){const m=new THREE.InstancedMesh(b.geo,b.m,b.xs.length);b.xs.forEach((mx,i)=>m.setMatrixAt(i,mx));m.castShadow=true;m.receiveShadow=true;b.target.add(m);}return g;
}
