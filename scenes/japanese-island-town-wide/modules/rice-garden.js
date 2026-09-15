import {heightAt,roadNetwork,layout} from './root.js';
// Tiny contour beds and a worked drying clearing. All ground contacts use the shared terrain.
export function build(THREE,ctx){
 const root=new THREE.Group();root.name='rice-garden';
 const roads=roadNetwork(),district=layout().districts.find(d=>d.id==='rice-terraces');
 const mats={};for(const [n,c] of Object.entries({soil:0x45392b,furrow:0x302a20,earth:0x948469,stone:0x797b6d,stone2:0x929181,bamboo:0x98865a,node:0x695f3e,wood:0x6b5237,rope:0xb6a17a,straw:0xbaaa69,grain:0xc7b47a,leaf:0x536c3d,leaf2:0x6e8351,heart:0x8b9a68,radish:0xd6c9a4,iron:0x54574e,water:0x627e75,bark:0x645341,tree:0x536b43,tree2:0x68794d}))mats[n]=new THREE.MeshStandardMaterial({color:c,roughness:n==='water'?0.4:0.96});
 const geos={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,9,6),pole:new THREE.CylinderGeometry(1,1,1,8),cone:new THREE.ConeGeometry(1,1,7)};
 let group,batches;
 function start(id){group=new THREE.Group();group.name='rice-garden_'+id;root.add(group);batches=new Map()}
 function finish(){for(const {geo,mat,ms} of batches.values()){const m=new THREE.InstancedMesh(geo,mat,ms.length);ms.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=m.receiveShadow=true;group.add(m)}}
 function instance(shape,mat,p,s,q){const key=shape+'_'+mat;if(!batches.has(key))batches.set(key,{geo:geos[shape],mat:mats[mat],ms:[]});const m=new THREE.Matrix4();m.compose(new THREE.Vector3(...p),q||new THREE.Quaternion(),new THREE.Vector3(...s));batches.get(key).ms.push(m)}
 function box(x,y,z,w,h,d,mat,rot=0){instance('box',mat,[x,y,z],[w,h,d],new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rot))}
 function ball(x,y,z,sx,sy,sz,mat,rot=0){instance('ball',mat,[x,y,z],[sx,sy,sz],new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rot))}
 function pole(a,b,r,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);instance('pole',mat,av.add(bv).multiplyScalar(.5).toArray(),[r,d.length(),r],new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()))}
 function ring(x,y,z,r,th,mat,vertical=false){const m=new THREE.Mesh(new THREE.TorusGeometry(r,th,5,20,vertical?Math.PI:Math.PI*2),mats[mat]);m.position.set(x,y,z);if(!vertical)m.rotation.x=Math.PI/2;m.castShadow=true;group.add(m)}
 function bamboo(a,b,r=.035){pole(a,b,r,'bamboo');const n=Math.ceil(Math.hypot(...a.map((v,i)=>b[i]-v))/.35);for(let i=1;i<n;i++){const t=i/n,p=a.map((v,j)=>v+(b[j]-v)*t),q=a.map((v,j)=>v+(b[j]-v)*(t+.012));pole(p,q,r*1.23,'node')}}
 const along=[.5547,.83205],across=[.83205,-.5547],rotation=Math.atan2(-along[1],along[0]);
 function at(x,z,u,v){return [x+along[0]*u+across[0]*v,z+along[1]*u+across[1]*v]}
 function clear(x,z){return roads.every(r=>r.points.slice(1).every((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>r.width/2+.35}))}
 function leaf(x,y,z,a,len=.2,w=.08,mat='leaf'){const end=[x+Math.cos(a)*len,y+len*.7,z+Math.sin(a)*len];const mid=[(x+end[0])/2,y+len*.57,(z+end[2])/2];ball(...mid,len*.58,.035,w,mat,-a);pole([x,y,z],end,.009,'heart')}
 function bed(id,x,z,crop){
  start(id);const L=2.15,W=.78;let top=-Infinity;for(let u=-L/2;u<=L/2+.01;u+=.1)for(let v=-W/2;v<=W/2+.01;v+=.08){const p=at(x,z,u,v);top=Math.max(top,heightAt(...p))}top+=.11;
  // Narrow soil columns terminate below the sampled surface, ensuring no daylight below the beds.
  for(let u=-L/2+.05;u<L/2;u+=.1)for(let v=-W/2+.05;v<W/2;v+=.1){const p=at(x,z,u,v),base=heightAt(...p)-.11;box(p[0],(base+top)/2,p[1],.105,top-base,.105,'soil',rotation)}
  function edge(u,v,len,long){const p=at(x,z,u,v);let low=Infinity;for(let a=-len/2;a<=len/2+.01;a+=.06)for(const b of [-.1,.1]){const q=at(x,z,u+(long?a:b),v+(long?b:a));low=Math.min(low,heightAt(...q)-.09)}const rows=Math.ceil((top+.055-low)/.16),h=(top+.055-low)/rows;for(let k=0;k<rows;k++)box(p[0],low+h*(k+.5),p[1],long?len-.014:.19,h-.01,long?.19:len-.014,(k+Math.round(u*10))%2?'stone':'stone2',rotation)}
  for(const v of [-W/2,W/2])for(let u=-L/2+.15;u<L/2;u+=.3)edge(u,v,.30,true);
  for(const u of [-L/2,L/2])for(const v of [-.25,0,.25])edge(u,v,.26,false);
  for(const v of [-.2,.2]){const p=at(x,z,0,v);box(p[0],top+.012,p[1],1.98,.025,.075,'furrow',rotation)}
  for(let i=0;i<5;i++)for(const v of [-.20,.20]){const p=at(x,z,-.8+i*.4,v),y=top+.04;
   if(crop==='cabbage'){for(let k=0;k<8;k++)leaf(p[0],y,p[1],k*Math.PI/4+i,.19,.09,k%2?'leaf':'leaf2');ball(p[0],y+.1,p[1],.09,.115,.09,'heart');for(let k=0;k<4;k++)leaf(p[0],y+.06,p[1],k*1.57,.09,.045,'leaf2')}
   else if(crop==='radish'){ball(p[0],y+.025,p[1],.041,.09,.044,'radish');for(let k=0;k<6;k++)leaf(p[0],y+.04,p[1],k*1.047+i,.2,.041,'leaf2')}
   else {const a=[p[0],top,p[1]],b=[p[0]+.04,top+1.28,p[1]+.025];bamboo(a,b,.016);let prev=a;for(let k=1;k<=10;k++){const t=k/10,ang=k*1.6,end=[p[0]+.045*Math.cos(ang),top+t*1.12,p[1]+.045*Math.sin(ang)];pole(prev,end,.008,'leaf');if(k%2===0)leaf(...end,ang,.14,.065,'leaf2');prev=end}}
  }
  if(crop==='bean'){for(const u of [-1,1]){const p=at(x,z,u,0);bamboo([p[0],top-.15,p[1]],[p[0],top+1.55,p[1]],.035);for(let k=0;k<3;k++)ring(p[0],top+1.42+k*.025,p[1],.043,.01,'rope')}for(const h of [.6,1.43]){const a=at(x,z,-1.1,0),b=at(x,z,1.1,0);bamboo([a[0],top+h,a[1]],[b[0],top+h,b[1]])}}
  finish();return top;
 }
 bed('cabbage_bed',-71.35,54.55,'cabbage');bed('radish_bed',-69.65,56.2,'radish');bed('bean_bed',-67.75,57.8,'bean');
 start('worked_clearing');
 // Terrain-following worn patches: intentionally open circulation between the small beds.
 const positions=[],indices=[],colors=[];const NR=20,NS=100;
 for(let j=0;j<=NR;j++)for(let i=0;i<=NS;i++){const a=i/NS*Math.PI*2,r=j/NR,border=1+.045*Math.sin(a*7)+.04*Math.cos(a*11),x=-69.65+2.75*r*border*Math.cos(a),z=56.8+3.42*r*border*Math.sin(a);positions.push(x,heightAt(x,z)+.013,z);const col=new THREE.Color(0x948469).lerp(new THREE.Color(0x80916a),Math.max(0,(r-.8)/.2)*.8).multiplyScalar(.91+.075*Math.sin(x*28+z*37));colors.push(col.r,col.g,col.b);if(j&&i){const k=j*(NS+1)+i;indices.push(k-NS-2,k-1,k-NS-1,k-NS-1,k-1,k)}}
 const earthGeo=new THREE.BufferGeometry();earthGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));earthGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));earthGeo.setIndex(indices.map((v,i,a)=>i%3===1?a[i+1]:i%3===2?a[i-1]:v));earthGeo.computeVertexNormals();const earthMesh=new THREE.Mesh(earthGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));earthMesh.receiveShadow=true;group.add(earthMesh);

 const path=[[-72.25,53.4],[-72.18,53.93],[-71.94,54.5],[-71.66,55.13],[-71.22,55.78],[-70.75,56.18],[-70.40,56.68],[-70.2,57.3],[-69.85,57.9],[-69.48,58.5],[-69.05,59.08],[-68.70,59.62]];
 for(let i=0;i<path.length;i++){const [x,z]=path[i];if(!clear(x,z))continue;const outline=Array.from({length:7},(_,k)=>{const a=k/7*Math.PI*2+i*.31,r=1+.1*Math.sin(k*7+i);return[x+.255*r*Math.cos(a),z+.22*r*Math.sin(a)]}),top=Math.max(...outline.map(p=>heightAt(...p)))+.025,vs=[],ix=[];for(const p of outline)vs.push(p[0],top,p[1]);for(const p of outline)vs.push(p[0],heightAt(...p)-.075,p[1]);for(let k=0;k<7;k++){const n=(k+1)%7;if(k>0&&k<6)ix.push(0,k+1,k);ix.push(k,n,k+7,n,n+7,k+7)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setIndex(ix);geo.computeVertexNormals();const stone=new THREE.Mesh(geo,i%2?mats.stone:mats.stone2);stone.castShadow=stone.receiveShadow=true;group.add(stone)}

 // Sparse scattered roots, weeds and chips leave room to work.
 for(let i=0;i<44;i++){const x=-72.8+(Math.sin(i*27.41)*.5+.5)*6.2,z=53.4+(Math.cos(i*33.71)*.5+.5)*7.1;if(x>-72.2&&x<-67&&z>53.5&&z<60.2)continue;const y=heightAt(x,z);for(let k=0;k<3;k++)leaf(x,y+.02,z,k*2.1+i,.13,.025,'leaf');ball(x+.12,y+.025,z,.045,.024,.04,'stone')}
 finish();
 start('drying_rack');const rx=-71.15,rz=58.9,railY=Math.max(...[-1.15,1.15].map(u=>heightAt(...at(rx,rz,u,0))))+1.83;
 for(const u of [-1.1,1.1]){const p=at(rx,rz,u,0);bamboo([p[0],heightAt(...p)-.2,p[1]],[p[0],railY+.12,p[1]],.066);for(const v of [-.48,.48]){const foot=at(rx,rz,u,v);bamboo([foot[0],heightAt(...foot)-.1,foot[1]],[p[0],railY-.26,p[1]],.042)}for(let k=0;k<4;k++)ring(p[0],railY-.04+k*.025,p[1],.076,.013,'rope')}
 for(const y of [railY,railY-.95]){const a=at(rx,rz,-1.34,0),b=at(rx,rz,1.34,0);bamboo([a[0],y,a[1]],[b[0],y,b[1]],.053)}
 for(const flip of [-1,1]){const a=at(rx,rz,-1.1*flip,0),b=at(rx,rz,1.1*flip,0);bamboo([a[0],railY-1.42,a[1]],[b[0],railY-.2,b[1]],.033)}
 for(let i=0;i<8;i++){const p=at(rx,rz,-.91+i*.26,0);for(const side of [-1,1]){const bx=p[0]+across[0]*.12*side,bz=p[1]+across[1]*.12*side;for(let k=0;k<12;k++){const a=k*2.399,spread=.12+(k%3)*.013,end=[bx+Math.cos(a)*spread,railY-.85-(k%4)*.04,bz+Math.sin(a)*spread];const neck=[bx,railY-.21,bz];pole([p[0],railY+.04,p[1]],neck,.009,'straw');pole(neck,end,.008,'straw');for(let seed=0;seed<4;seed++)ball(end[0]+.013*Math.sin(seed),end[1]-seed*.025,end[2],.016,.037,.012,'grain')}ring(bx,railY-.27,bz,.060,.013,'rope');ring(bx,railY-.30,bz,.06,.011,'rope')}}finish();
 start('tools_and_harvest');
 function tub(x,z,r,h,basket){let ground=-Infinity;for(let i=0;i<12;i++)ground=Math.max(ground,heightAt(x+r*Math.cos(i*.524),z+r*Math.sin(i*.524)));const y=ground+.025;if(!basket){const shell=new THREE.Mesh(new THREE.CylinderGeometry(r*.97,r*.70,h,16,1,true),new THREE.MeshStandardMaterial({color:0x6b5237,roughness:.94,side:THREE.DoubleSide}));shell.position.set(x,y+h/2,z);shell.castShadow=true;group.add(shell)}ball(x,y-.1,z,r*1.1,.16,r*1.1,'stone');for(let i=0;i<(basket?24:16);i++){const a=i*Math.PI*2/(basket?24:16),b=[x+Math.cos(a)*r*.72,y,z+Math.sin(a)*r*.72],t=[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r];pole(b,t,basket?.014:.030,basket?'bamboo':'wood')}for(let i=0;i<(basket?10:3);i++){const t=i/(basket?9:2);ring(x,y+t*h,z,r*(.72+.28*t),basket?.012:.016,basket?'rope':'iron')}instance('pole',basket?'bamboo':'water',[x,y+(basket?.025:h*.52),z],[r*.74,.023,r*.74]);ring(x,y+h,z,r,.025,basket?'bamboo':'wood');ring(x,y+h,z,r*.89,.021,basket?'bamboo':'iron',true);return y+h}
 const by=tub(-69.35,59.6,.22,.35,false),hy=tub(-70.2,57.65,.29,.24,true);for(let i=0;i<3;i++){ball(-70.2+.08*Math.sin(i*2),hy-.03,57.65+.09*Math.cos(i*2),.075,.07,.07,'heart');leaf(-70.2,hy,57.65,i*2,.1,.04,'leaf')}
 for(let i=0;i<7;i++){const a=[-68.8+i*.027,heightAt(-68.8+i*.027,60.05)+.07,60.05],b=[-67.6+i*.027,heightAt(-67.6+i*.027,60.55)+.07,60.55];bamboo(a,b,.018)}
 for(const t of [.30,.72]){const x=-68.8+1.2*t+.08,z=60.05+.5*t,y=heightAt(x,z)+.08;pole([x-.04,y-.04,z+.10],[x+.04,y+.07,z-.1],.018,'rope');pole([x+.04,y+.07,z-.1],[x+.13,y-.02,z+.02],.018,'rope')}
 const hx=-68.4,hz=55.2,hy0=heightAt(hx,hz);pole([hx,hy0+.04,hz],[hx-.25,hy0+1.25,hz+.1],.026,'wood');box(hx,hy0+.06,hz-.09,.23,.06,.23,'iron',.2);finish();
 start('farm_tree');const tx=-67.02,tz=54.1,ty=heightAt(tx,tz);pole([tx,ty-.2,tz],[tx-.09,ty+1.5,tz+.04],.10,'bark');for(let i=0;i<5;i++){const a=i*1.256,p=[tx+.27*Math.cos(a),heightAt(tx+.27*Math.cos(a),tz+.27*Math.sin(a))+.015,tz+.27*Math.sin(a)];pole([tx,ty+.2,tz],p,.047,'bark')}
 for(let i=0;i<7;i++){const a=i*2.399,b=[tx+Math.cos(a)*.56,ty+1.6+(i%3)*.22,tz+Math.sin(a)*.62];pole([tx-.05,ty+.85,tz],b,.04,'bark');for(let j=0;j<5;j++){const t=j*2.399;ball(b[0]+.17*Math.cos(t),b[1]+.13*Math.sin(j),b[2]+.18*Math.sin(t),.19,.145,.18,(i+j)%2?'tree':'tree2');for(let k=0;k<8;k++){const a=k*2.399+j;ball(b[0]+.17*Math.cos(t)+.18*Math.cos(a),b[1]+.13*Math.sin(j)+.12*Math.sin(k*1.7),b[2]+.18*Math.sin(t)+.18*Math.sin(a),.095,.018,.046,(i+k)%2?'tree':'tree2',a)}}}finish();
 root.userData.district=district.id;return root;
}
