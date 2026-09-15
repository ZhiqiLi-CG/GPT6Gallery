import { heightAt, roadNetwork, layout } from './root.js';

// Public north-street structure retained by north; yard children preserve these pockets.
export function northReservations(){return {gardens:[{x:-88,z:18,r:2.1},{x:10.8,z:26,r:1.8}],drains:{z:[5.85,10.15],halfWidth:.30,x:[-85,9]},entryHalfWidth:1.4};}
export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Northern lane stone drainage and public planting pockets';
 const colors={stone:'#878b7e',light:'#a0a08d',moss:'#657952',dark:'#514c42',bark:'#66503c',pine:'#355e49',pine2:'#456c4e',pink:'#d5a1aa',pink2:'#e0b6ba',gravel:'#a39c83',wood:'#786147',paper:'#d6c8a0'};
 const mats={};for(const [k,c] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.94});
 const boxGeo=new THREE.BoxGeometry(1,1,1),ballGeo=new THREE.IcosahedronGeometry(1,1),cylGeo=new THREE.CylinderGeometry(1,1,1,8),coneGeo=new THREE.ConeGeometry(1,1,4),batch=new Map(),o=new THREE.Object3D();
 function add(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();const key=geo.uuid+m;if(!batch.has(key))batch.set(key,{geo,mat:mats[m],xs:[]});batch.get(key).xs.push(o.matrix.clone());}
 const box=(x,y,z,w,h,d,m,ry=0)=>add(boxGeo,m,x,y,z,w,h,d,0,ry);
 function beam(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();const key=cylGeo.uuid+m;if(!batch.has(key))batch.set(key,{geo:cylGeo,mat:mats[m],xs:[]});batch.get(key).xs.push(o.matrix.clone());}
 const roads=roadNetwork(),lots=layout().town.lots.filter(l=>l.z===-2||l.z===18);
 function roadClear(x,z,margin=.42){for(const rd of roads.filter(r=>r.id!=='market-north'))for(let i=1;i<rd.points.length;i++){const a=rd.points[i-1],b=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+margin)return false;}return true;}
 for(const z of northReservations().drains.z)for(let j=0;j<157;j++){
  const x=-85+j*.6;if(!roadClear(x,z)||lots.some(l=>Math.abs(x-l.x)<1.4))continue;
  // Short stones seat into the slope; paired banks surround a dark open channel.
  const y=heightAt(x,z);box(x,y+.06,z,.55,.10,.20,'dark');
  for(const side of [-1,1]){const zz=z+side*.21,yy=heightAt(x,zz);box(x,yy+.12,zz,.55,.25,.19,j%4===0?'light':'stone',.025*Math.sin(j*5));}
  if(j%8===0)box(x,y+.19,z,.17,.12,.63,'stone');
 }
 function lantern(x,z){const y=heightAt(x,z);box(x,y+.13,z,.7,.30,.7,'stone');box(x,y+.55,z,.24,.72,.24,'stone');box(x,y+.96,z,.60,.15,.6,'light');box(x,y+1.2,z,.40,.38,.4,'dark');box(x,y+1.2,z,.41,.24,.24,'paper');box(x,y+1.2,z,.24,.24,.41,'paper');for(const dx of [-.19,.19])for(const dz of [-.19,.19])box(x+dx,y+1.2,z+dz,.055,.42,.055,'stone');add(coneGeo,'stone',x,y+1.58,z,.61,.40,.61,0,Math.PI/4);add(ballGeo,'stone',x,y+1.88,z,.11,.15,.11);}
 northReservations().gardens.forEach((p,index)=>{
  for(let j=0;j<28;j++){const a=j/28*Math.PI*2,x=p.x+Math.cos(a)*p.r,z=p.z+Math.sin(a)*p.r;box(x,heightAt(x,z)+.09,z,.44,.24,.26,j%3?'stone':'light',-a+Math.PI/2);}
  for(let j=0;j<110;j++){const a=j*2.39996,r=Math.sqrt((j+.5)/110)*(p.r-.26),x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;add(ballGeo,j%5?'gravel':'moss',x,heightAt(x,z)+.055,z,.14,.075,.12);}
  const y=heightAt(p.x,p.z),h=index?3.5:4.6;
  beam([p.x,y-.12,p.z],[p.x+.13,y+h*.78,p.z-.1],.15,'bark');
  for(let k=0;k<7;k++){const a=k*2.4,x=p.x+Math.cos(a)*(index?.7:1.05),z=p.z+Math.sin(a)*(index?.7:1.05),yy=y+h*(.64+k*.047);beam([p.x+.06,y+h*.44,p.z],[x,yy,z],.055,'bark');add(ballGeo,index?(k%2?'pine':'pine2'):(k%2?'pink':'pink2'),x,yy,z,index?.83:.93,index?.32:.58,index?.69:.83);}
  lantern(p.x+(index?-.75:1.0),p.z-1.0);
  for(let k=0;k<4;k++){const x=p.x-.7+k*.15,z=p.z-.75;add(ballGeo,'moss',x,heightAt(x,z)+.08,z,.24,.14,.22);}
 });
 for(const b of batch.values()){const m=new THREE.InstancedMesh(b.geo,b.mat,b.xs.length);b.xs.forEach((mx,i)=>m.setMatrixAt(i,mx));m.castShadow=true;m.receiveShadow=true;g.add(m);}
 return g;
}
