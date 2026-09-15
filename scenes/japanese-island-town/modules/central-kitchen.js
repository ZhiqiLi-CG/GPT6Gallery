import {heightAt, roadNetwork, layout} from './root.js';
import {northReservations} from './north.js';
import {northCentralLayout} from './north-central.js';

export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Central kitchen vegetable terraces and covered firewood court';
 const colors={wood:'#73553c',cut:'#b29468',wood2:'#937453',dark:'#493f32',iron:'#555e5a',soil:'#65533d',stone:'#828778',stone2:'#9a9b88',leaf:'#4d7046',leaf2:'#6f8852',vein:'#9daa75',terra:'#a2785c',water:'#6e9394',basket:'#ae9266',flower:'#cfadb7',roof:'#666b5c'};
 const mats={};for(const[k,v]of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:v,roughness:.93});
 const boxG=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12),ball=new THREE.IcosahedronGeometry(1,1),torus=new THREE.TorusGeometry(1,.065,6,20),batches=new Map(),o=new THREE.Object3D();
 function put(geo,m){let key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,mat:mats[m],xs:[]});batches.get(key).xs.push(o.matrix.clone());}
 function add(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();put(geo,m);}
 const box=(x,y,z,w,h,d,m)=>add(boxG,m,x,y,z,w,h,d);
 function beam(a,b,r,m){let p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();put(cyl,m);}
 const lot=northCentralLayout().find(l=>l.index===27),shell=layout().town.lots[27],roads=roadNetwork(),res=northReservations();
 function clear(x,z,r=.05){if(x-r<ctx.bounds[0]||x+r>ctx.bounds[2])return false;for(const rd of roads)for(let i=1;i<rd.points.length;i++){let a=rd.points[i-1],b=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+r+.1)return false;}if(res.drains.z.some(v=>Math.abs(z-v)<res.drains.halfWidth+r))return false;if(Math.abs(x-shell.x)<1.2+r&&z>1.5)return false;if(Math.abs(x-lot.sidePathX)<.38+r&&z>=-6.25&&z<=4.72)return false;if(x>=-31&&x<=-24.8&&Math.abs(z-lot.frontPathZ)<.34+r)return false;return true;}
 function seatedBox(x,z,w,h,d,m,top=null){const ground=Math.min(...[-1,1].flatMap(s=>[-1,1].map(t=>heightAt(x+s*w/2,z+t*d/2))))-.06;const yy=top===null?heightAt(x,z)+h:top;box(x,(ground+yy)/2,z,w,yy-ground,d,m);return yy;}
 function cabbage(x,y,z,k){add(ball,k%2?'leaf':'leaf2',x,y+.13,z,.19,.18,.19);for(let j=0;j<7;j++){let a=j*2.399+k,xx=x+Math.cos(a)*.15,zz=z+Math.sin(a)*.15;add(ball,j%2?'leaf':'leaf2',xx,y+.13,zz,.10,.055,.21,-.25,Math.PI/2-a,.23);beam([x,y+.11,z],[xx,y+.18,zz],.009,'vein');}}
 function bed(x,z,w,d){if(!clear(x,z,Math.max(w,d)/2))throw Error('Kitchen bed reservation conflict');let top=Math.max(...[-1,1].flatMap(s=>[-1,1].map(t=>heightAt(x+s*w/2,z+t*d/2))))+.17;seatedBox(x,z,w,.3,d,'soil',top);for(const side of [-1,1]){for(let xx=x-w/2+.18;xx<x+w/2;xx+=.35)seatedBox(xx,z+side*d/2,.33,.3,.18,(Math.round(xx*10)%2)?'stone':'stone2',top+.08);for(let zz=z-d/2+.15;zz<z+d/2;zz+=.3)seatedBox(x+side*w/2,zz,.18,.3,.28,'stone',top+.08);}
 const nx=Math.floor((w-.25)/.43),nz=Math.floor((d-.25)/.46);for(let j=0;j<nz;j++){const zz=z+(j-(nz-1)/2)*.46;box(x,top+.025,zz,w-.28,.045,.065,'dark');for(let i=0;i<nx;i++)cabbage(x+(i-(nx-1)/2)*.43,top+.03,zz,i+j);}return top;}
 bed(-34.45,3.45,2.55,1.45);bed(-22.95,-.65,1.55,1.6);bed(-22.95,2.1,1.55,1.55);
 // A complete open-front rain shelter, grounded legs, boarded back/sides, roof, fascia and diagonal braces.
 const sx=-22.95,sz=-4.65,w=1.85,d=2.05,roofY=Math.max(heightAt(sx-.93,sz+1),heightAt(sx+.93,sz+1))+1.98;
 for(const dx of [-w/2+.11,w/2-.11])for(const dz of [-d/2+.1,d/2-.1]){const x=sx+dx,z=sz+dz,base=heightAt(x,z)-.12;const cap=roofY+.10+dz*Math.sin(.16);box(x,(base+cap)/2,z,.13,cap-base,.13,'wood');}
 for(let k=0;k<9;k++){const x=sx-w/2+.12+k*.2,base=heightAt(x,sz-d/2)-.03;box(x,(base+roofY-.15)/2,sz-d/2,.18,roofY-.15-base,.08,'wood2');}
 for(const side of [-1,1])for(const hh of [.3,.9,1.4])beam([sx+side*w/2,heightAt(sx+side*w/2,sz-d/2)+hh,sz-d/2],[sx+side*w/2,roofY-1.7+hh,sz+d/2],.045,'wood');
 for(const dz of [-.92,.92])box(sx,roofY+.035+dz*Math.sin(.16),sz+dz,1.9,.14,.14,'wood');
 const slope=.16;for(let k=0;k<11;k++)add(boxG,'roof',sx-1.02+k*.205,roofY+.10,sz,.195,.11,2.4,-slope);for(const dz of [-1.17,1.17])box(sx,roofY+.10+dz*Math.sin(slope),sz+dz,2.23,.16,.10,'wood');
 for(const side of [-1,1])beam([sx+side*.82,roofY-.65,sz+.89],[sx+side*.82,roofY-.04,sz+.2],.055,'wood2');
 // Split logs lie on bearers; pale end-grain discs and rings remain visible from the open front.
 const logY=Math.max(heightAt(sx-.7,sz+.75),heightAt(sx+.7,sz+.75))+.20;
 for(const xx of [-.65,.65])seatedBox(sx+xx,sz,.14,.2,1.65,'wood',logY-.02);
 for(let j=0;j<5;j++)for(let i=0;i<6-(j===4?1:0);i++){const x=sx-.67+i*.26+(j%2)*.04,y=logY+.11+j*.22;beam([x,y,sz-.78],[x,y,sz+.77],.125,'wood');add(cyl,'cut',x,y,sz+.78,.109,.018,.109,Math.PI/2);add(torus,'wood2',x,y,sz+.792,.07,.07,.07);}
 // Working area beside the wood store, with a seated block, embedded axe and two loose split pieces.
 let x=-22.95,z=-2.65,y=heightAt(x,z);add(cyl,'wood',x,y+.25,z,.32,.53,.32);add(cyl,'cut',x,y+.525,z,.305,.015,.305);add(torus,'wood2',x,y+.535,z,.20,.20,.20,Math.PI/2);beam([x-.05,y+.51,z],[x+.24,y+1.18,z-.07],.028,'wood2');add(boxG,'iron',x-.04,y+.63,z,.26,.14,.065,0,0,-.25);
 for(let k=0;k<2;k++)beam([x+.5,y+.08,z-.25+k*.24],[x+.5,y+.11,z+.06+k*.24],.07,'cut');
 function vessel(x,z,r,h,m='terra',water=false){let y=heightAt(x,z);add(new THREE.CylinderGeometry(.90, .70,1,16,1,true),m,x,y+h/2,z,r,h,r);add(cyl,'dark',x,y+.065,z,r*.7,.09,r*.7);add(torus,m,x,y+h,z,r*.90,r*.90,r*.90,Math.PI/2);if(water)add(cyl,'water',x,y+h*.72,z,r*.81,.02,r*.81);return y;}
 function basket(x,z,r=.3){let y=vessel(x,z,r,.36,'basket');for(let j=0;j<5;j++)add(torus,'wood2',x,y+.06+j*.071,z,r*(.75+j*.038),r*(.75+j*.038),r*(.75+j*.038),Math.PI/2);for(let k=0;k<16;k++){let a=k*Math.PI/8;beam([x+Math.cos(a)*r*.71,y+.03,z+Math.sin(a)*r*.71],[x+Math.cos(a)*r*.9,y+.36,z+Math.sin(a)*r*.9],.009,'wood');}return y;}
 y=basket(-28,3.15,.36);for(let k=0;k<3;k++)cabbage(-28+(k-1)*.13,y+.22,3.15,k);basket(-27.05,3.4,.27);
 y=vessel(-23,-1.92,.22,.38,'wood2',true);add(torus,'iron',-23,y+.50,-1.92,.20,.23,.20);
 for(const [xx,zz]of [[-28.8,3.5],[-35.8,2.45]]){let yy=vessel(xx,zz,.23,.37);for(let k=0;k<6;k++){let a=k*2.4,px=xx+Math.cos(a)*.2,pz=zz+Math.sin(a)*.2;beam([xx,yy+.32,zz],[px,yy+.74,pz],.015,'leaf');add(ball,'leaf',px,yy+.54,pz,.11,.06,.15);for(let j=0;j<5;j++)add(ball,'flower',px+.065*Math.cos(j*1.257),yy+.75,pz+.065*Math.sin(j*1.257),.055,.032,.055);}}
 // Long hoe and rake grounded against the shelter side, with individual rake teeth.
 for(let k=0;k<2;k++){let xx=-21.92,zz=-4.9+k*.62,yy=heightAt(xx,zz);beam([xx,yy+.05,zz],[xx-.2,yy+1.44,zz+.10],.025,'wood2');box(xx,yy+.06,zz,k?.35:.25,.07,.14,'iron');if(k)for(let j=0;j<5;j++)box(xx-.15+j*.075,yy+.06,zz+.13,.025,.06,.20,'iron');}
 function fence(a,b,bamboo=false){let n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.7),last=null;for(let j=0;j<=n;j++){let t=j/n,x=a[0]+t*(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]);if(!clear(x,z,.075)){last=null;continue;}let y=heightAt(x,z);beam([x,y-.09,z],[x,y+.87,z],bamboo?.036:.053,bamboo?'wood2':'wood');if(last)for(const h of [.25,.68])beam([last.x,last.y+h,last.z],[x,y+h,z],.031,'wood2');last={x,y,z};}}
 fence([-36.7,5.25],[-32.5,5.25],true);fence([-29.5,5.25],[-25.4,5.25]);fence([-24.1,5.25],[-21.6,5.25],true);fence([-21.65,-6],[-21.65,5.25],true);fence([-36.7,-5.8],[-36.7,3.7],true);
 // Gate swung inward beside the east path opening, leaving a 1.3 metre walk-through.
 fence([-24.1,5.25],[-23.95,4.25]);beam([-24.1,heightAt(-24.1,5.25)+.2,5.25],[-23.95,heightAt(-23.95,4.25)+.75,4.25],.025,'wood');
 for(let k=0;k<7;k++){const xx=k<4?-23.85:-36.15,zz=k<4?-2.5+k*1.25:-3+(k-4)*1.75;if(clear(xx,zz,.22))add(cyl,'stone2',xx,heightAt(xx,zz)+.055,zz,.23,.13,.31,0,k*.8);}
 // Small open-chamber stone lantern beside the vegetable beds.
 x=-33,z=2.65;y=heightAt(x,z);seatedBox(x,z,.53,.16,.53,'stone');box(x,y+.4,z,.19,.55,.19,'stone');box(x,y+.72,z,.44,.12,.44,'stone2');for(const dx of [-.15,.15])for(const dz of [-.15,.15])box(x+dx,y+.91,z+dz,.06,.3,.06,'stone');box(x,y+.79,z,.19,.035,.19,'dark');add(new THREE.ConeGeometry(.4,.23,4),'stone',x,y+1.17,z,1,1,1,0,Math.PI/4);add(ball,'stone2',x,y+1.34,z,.09,.12,.09);
 for(const b of batches.values()){let mesh=new THREE.InstancedMesh(b.geo,b.mat,b.xs.length);b.xs.forEach((mx,i)=>mesh.setMatrixAt(i,mx));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}return g;
}
