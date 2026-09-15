import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='East provisions shop goods and working yard';
 const lot=layout().town.lots.find(l=>l.x===5&&l.z===-32);if(!lot)return g;
 const roads=roadNetwork();
 if(!roads.length) return g;
 const colors={wood:'#8a6544',wood2:'#a47e52',dark:'#493b2c',iron:'#4f5550',straw:'#b59965',weave:'#826d43',sack:'#b3a07a',tie:'#6d6044',clay:'#98684e',glaze:'#657d78',inside:'#352f24',green:'#677c3d',leaf:'#899957',white:'#d7cfad',purple:'#52445b',soil:'#64523d'};
 const mats={};for(const [k,c] of Object.entries(colors))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.87});
 const boxgeo=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,12,8),cylgeo=new THREE.CylinderGeometry(1,1,1,16),batches=new Map(),dummy=new THREE.Object3D();
 function add(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',ry=0){add(boxgeo,m,x,y,z,w,h,d,0,ry);}
 function ell(x,y,z,rx,ry,rz,m){add(sphere,m,x,y,z,rx,ry,rz);}
 function beam(a,b,r,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());dummy.scale.set(r*2,delta.length(),r*2);dummy.updateMatrix();const key=boxgeo.uuid+m;if(!batches.has(key))batches.set(key,{geo:boxgeo,m,items:[]});batches.get(key).items.push(dummy.matrix.clone());}
 function ring(x,y,z,r,t,m='weave',rx=Math.PI/2,ry=0){add(new THREE.TorusGeometry(r,t,6,24),m,x,y,z,1,1,1,rx,ry);}
 const floor=(x,z)=>heightAt(x,z)+.065;
 function post(x,z,h=.95){const y=floor(x,z);box(x,y+h/2,z,.105,h,.105,'dark');box(x,y+h+.035,z,.14,.07,.14,'wood2');}
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.25);for(let i=0;i<=n;i++){const t=i/n;post(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);}for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u;for(const h of [.36,.79])beam([x,floor(x,z)+h,z],[xx,floor(xx,zz)+h,zz],.035);for(let k=1;k<5;k++){const v=k/5,px=x+(xx-x)*v,pz=z+(zz-z)*v;box(px,floor(px,pz)+.53,pz,.048,.86,.048,'wood2');}}}
 function jar(x,y,z,r=.23,h=.56,m='clay'){
  const pts=[[0,0],[r*.65,0],[r*.94,h*.15],[r,h*.47],[r*.8,h*.74],[r*.47,h*.88],[r*.5,h],[r*.38,h],[r*.36,h*.86]];
  const geo=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(...p)),20);add(geo,m,x,y,z);ring(x,y+h,z,r*.45,.024,m);add(cylgeo,'inside',x,y+h*.84,z,r*.35,.015,r*.35);
 }
 function basket(x,y,z,r=.32,h=.4){
  add(new THREE.CylinderGeometry(r,r*.72,h,20,1,true),'straw',x,y+h/2,z);add(cylgeo,'weave',x,y+.025,z,r*.72,.05,r*.72);
  for(let k=0;k<8;k++){const t=k/7;ring(x,y+.04+t*(h-.05),z,r*(.74+.26*t),.014);}
  for(let k=0;k<20;k++){const a=k*Math.PI/10;beam([x+Math.cos(a)*r*.73,y+.02,z+Math.sin(a)*r*.73],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.009,'weave');}ring(x,y+h,z,r,.024,'straw');
 }
 function sack(x,z,s=1){const y=floor(x,z);ell(x,y+.32*s,z,.28*s,.34*s,.24*s,'sack');ell(x,y+.65*s,z,.10*s,.12*s,.095*s,'sack');ring(x,y+.61*s,z,.082*s,.018,'tie');for(let i=0;i<4;i++)beam([x-.09+i*.055,y+.57*s,z+.12*s],[x-.06+i*.037,y+.7*s,z+.07*s],.009,'tie');}
 function barrel(x,z,r=.36,h=.86){const y=floor(x,z);const pts=[[0,0],[r*.83,0],[r,h*.3],[r,h*.66],[r*.83,h],[0,h]];add(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(...p)),20),'wood',x,y,z);for(let i=0;i<18;i++){const a=i*Math.PI/9;beam([x+Math.cos(a)*r*.84,y+.05,z+Math.sin(a)*r*.84],[x+Math.cos(a)*r,y+h*.48,z+Math.sin(a)*r],.012,'dark');beam([x+Math.cos(a)*r,y+h*.48,z+Math.sin(a)*r],[x+Math.cos(a)*r*.84,y+h-.02,z+Math.sin(a)*r*.84],.012,'dark');}for(const q of [.13,.46,.85])ring(x,y+h*q,z,r*(q===.46?1.01:.93),.035,'iron');for(let k=-2;k<=2;k++)box(x,y+h+.01,z+k*r*.28,r*1.45,.025,.085,'wood2');ring(x,y+h,z,r*.84,.023,'dark');}
 function crate(x,y,z,w=.75,d=.62,h=.57){for(let k=0;k<4;k++)box(x-w/2+(k+.5)*w/4,y+.035,z,w/4-.016,.07,d,'wood2');for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*(w/2-.04),y+h/2,z+sz*(d/2-.04),.065,h,.065,'dark');for(let k=0;k<3;k++){const yy=y+.13+k*(h-.16)/2;for(const s of [-1,1]){box(x,yy,z+s*d/2,w,.105,.048,'wood');box(x+s*w/2,yy,z,.048,.105,d,'wood2');}}}
 function cabbage(x,y,z,s=.17){ell(x,y+s*.7,z,s,s*.8,s,'green');for(let i=0;i<6;i++){const a=i*Math.PI/3;ell(x+Math.cos(a)*s*.43,y+s*.7,z+Math.sin(a)*s*.43,s*.66,s*.83,s*.6,i%2?'leaf':'green');}ell(x,y+s*1.17,z,s*.5,s*.36,s*.5,'leaf');}
 // The uncovered sales counter stands entirely west of the centered stair corridor.
 const cx=2.15,cz=-26.85,top=Math.max(...[-1,1].flatMap(a=>[-1,1].map(b=>floor(cx+a*1.22,cz+b*.43))))+1.04;
 for(const dx of [-1.2,1.2])for(const dz of [-.4,.4]){const y=floor(cx+dx,cz+dz);box(cx+dx,(y+top)/2,cz+dz,.11,top-y,.11,'dark');}
 for(let k=0;k<5;k++)box(cx,top,cz-.42+k*.21,2.65,.085,.195,'wood2');
 for(const dz of [-.41,.41])box(cx,top-.46,cz+dz,2.56,.105,.07,'wood');
 beam([cx-1.2,top-.8,cz-.4],[cx+1.2,top-.1,cz-.4],.035,'wood');
 for(let t=0;t<3;t++){const x=cx-.87+t*.86;box(x,top+.072,cz,.79,.055,.8,'dark');for(const dz of [-.4,.4])box(x,top+.17,cz+dz,.83,.16,.044,'wood');for(const dx of [-.4,.4])box(x+dx,top+.17,cz,.04,.16,.8,'wood');for(let a=0;a<2;a++)for(let b=0;b<3;b++){const xx=x-.19+a*.37,zz=cz-.25+b*.25;if(t===0)cabbage(xx,top+.1,zz,.15);if(t===1){ell(xx,top+.22,zz,.075,.10,.18,'white');for(let k=0;k<3;k++)beam([xx,top+.22,zz-.15],[xx+(k-1)*.065,top+.40,zz-.27],.018,'green');}if(t===2){ell(xx,top+.22,zz,.09,.095,.18,'purple');ell(xx,top+.23,zz-.16,.07,.04,.045,'green');}}}
 basket(1.0,floor(1,-25.5),-25.5,.35,.40);for(let k=0;k<3;k++)cabbage(.88+k*.12,floor(1,-25.5)+.28,-25.5,.13);
 sack(2,-25.5,.94);sack(2.68,-25.58,.84);
 // Low ceramic display on the other side of the entrance.
 const jy=Math.max(floor(7.65,-26.3),floor(8.85,-26.3))+.33;
 for(const x of [7.45,8.8]){const y=floor(x,-26.3);box(x,(y+jy)/2,-26.3,.13,jy-y,.46,'wood');}box(8.12,jy,-26.3,1.65,.07,.68,'wood2');
 for(let k=0;k<4;k++)jar(7.54+k*.39,jy+.04,-26.3,.15+.025*(k%2),.43+.07*(k%2),k%2?'glaze':'clay');basket(9.32,floor(9.32,-26.3),-26.3,.3,.36);
 // Independent handcart: x-axis axle, open bed with individual slats, two spoke wheels.
 const x=11.15,z=-29.25,wy=Math.max(floor(10.3,z),floor(12,z))+.525,by=wy+.12;
 const wheelY=xx=>floor(xx,z)+.525;
 beam([10.20,wheelY(10.27),z],[12.1,wheelY(12.03),z],.07,'iron');
 for(const xx of [10.27,12.03]){const wy=wheelY(xx);ring(xx,wy,z,.46,.065,'dark',0,Math.PI/2);ring(xx,wy,z,.44,.025,'iron',0,Math.PI/2);add(cylgeo,'wood2',xx,wy,z,.115,.23,.115,0,0,Math.PI/2);for(let k=0;k<10;k++){const a=k*Math.PI/5;beam([xx,wy,z],[xx,wy+Math.cos(a)*.42,z+Math.sin(a)*.42],.022,'wood2');}}
 for(let k=0;k<7;k++)box(x-.61+k*.203,by,z-.15,.19,.09,1.68,'wood2');
 for(const dx of [-.67,.67]){for(const dz of [-.96,.65])box(x+dx,by+.30,z+dz,.065,.66,.065,'dark');for(let k=0;k<3;k++)box(x+dx,by+.15+k*.19,z-.15,.055,.12,1.72,'wood');beam([x+dx,by-.04,z+.6],[x+dx,by-.15,z+2.18],.055,'wood2');const gy=floor(x+dx,z+1.75);beam([x+dx,gy,z+1.75],[x+dx,by-.12,z+1.75],.04,'dark');}
 for(const dz of [-.99,.7])for(let k=0;k<3;k++)box(x,by+.15+k*.19,z+dz,1.38,.12,.06,'wood');
 crate(x,by+.06,z-.36,.72,.75,.44);basket(x+.22,by+.06,z+.32,.25,.35);
 // Storage strip and gated enclosure, with rails fitted to local slope.
 fence([12.65,-37.55],[12.65,-31.1]);fence([12.65,-29.85],[12.65,-25.45]);fence([-.6,-37.55],[12.65,-37.55]);
 const gx=12.65,ga=-31.1,gb=-29.85;for(const dz of [ga,gb])post(gx,dz,1.02);for(const h of [.25,.77])beam([gx,floor(gx,ga)+h,ga],[gx,floor(gx,gb)+h,gb],.034,'dark');for(let k=1;k<6;k++){const zz=ga+(gb-ga)*k/6;box(gx,floor(gx,zz)+.51,zz,.07,.77,.065,'wood2');}beam([gx,floor(gx,ga)+.25,ga],[gx,floor(gx,gb)+.77,gb],.03,'wood');
 barrel(11.2,-33.25,.40,.98);barrel(12.05,-33.60,.34,.79);barrel(10.85,-34.25,.33,.82);
 crate(11.65,floor(11.65,-35.5),-35.5,.90,.75,.68);crate(11.65,floor(11.65,-35.5)+.68,-35.5,.72,.65,.56);crate(10.65,floor(10.65,-36.75),-36.75,.72,.73,.58);
 for(const [xx,zz] of [[7.95,-37.02],[8.6,-37.02],[9.25,-37.02]])sack(xx,zz,.91);
 basket(2.1,floor(2.1,-37.05),-37.05,.34,.45);basket(2.9,floor(2.9,-37.05),-37.05,.27,.34);jar(.0,floor(0,-34.7),-34.7,.22,.56);jar(.0,floor(0,-35.4),-35.4,.25,.68,'glaze');
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geo,mats[b.m],b.items.length);b.items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
