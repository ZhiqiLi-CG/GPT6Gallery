import {heightAt,streamX,streamWater,roadNetwork,layout} from './root.js';

// The upper reach: all geometry is terrain-founded; the river itself belongs to root.
export function build(THREE,ctx) {
 const root=new THREE.Group();root.name='spring-bank_upper_stream';
 let seed=728319;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const between=(a,b)=>a+(b-a)*rand(); const roads=roadNetwork(),plan=layout();
 const mat=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.95,...opts});
 const pebble=mat(0xffffff);
 const bark=mat(0x594c3b),rootwood=mat(0x645542),wet=mat(0xffffff,{vertexColors:true,roughness:.78}),moss=mat(0x536a38),reed=mat(0x697543),fern=mat(0x476a3c),needle=mat(0x344d38),pink=mat(0xcfa5a5),pollen=mat(0xbab28a),foam=mat(0xb3c9bc,{transparent:true,opacity:.37,depthWrite:false});
 const sphere=new THREE.IcosahedronGeometry(1,1),leafGeo=new THREE.SphereGeometry(1,5,3),needleGeo=new THREE.ConeGeometry(1,1,5);
 const cylinders=new Map(),stoneMeshes=[];
 const batches=new Map(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),tmp=new THREE.Object3D();
 function group(id,kind){const g=new THREE.Group();g.name='spring-bank_'+id;g.userData.kind=kind;root.add(g);return g;}
 function instance(g,geo,material,x,y,z,sx,sy,sz,rotation=null,color=null){let bs=batches.get(g);if(!bs){bs=new Map();batches.set(g,bs)}const key=geo.uuid+material.uuid;let b=bs.get(key);if(!b){b={geo,material,items:[]};bs.set(key,b)}tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.quaternion.identity();if(rotation)tmp.quaternion.copy(rotation);tmp.updateMatrix();b.items.push({matrix:tmp.matrix.clone(),color});}
 function mesh(g,geo,m){const o=new THREE.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function branch(g,a,b,r1,r2,m=bark){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const len=v.length();if(len<.001)return;const ratio=Math.round(r2/r1*10)/10;let geo=cylinders.get(ratio);if(!geo){geo=new THREE.CylinderGeometry(ratio,1,1,7);cylinders.set(ratio,geo)}q.setFromUnitVectors(up,v.normalize());instance(g,geo,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r1,len,r1,q);}

 function ellLeaf(g,a,b,width,m=fern){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));q.setFromUnitVectors(up,v.clone().normalize());instance(g,leafGeo,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,v.length()/2,width*.2,q);}
 function laneClear(x,z,r){return roads.every(l=>l.points.slice(1).every((b,i)=>{const a=l.points[i],vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz)));return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)>l.width/2+.35+r}));}
 function allowed(x,z,r=.1){if(x-r<34.15||x+r>56||z-r<36||z+r>64||Math.abs(x-streamX(z))+r>8)return false;if(!laneClear(x,z,r))return false;return !plan.lots.some(l=>Math.abs(x-l.x)<l.w/2+r&&Math.abs(z-l.z)<l.d/2+r);}
 function fade(z){return Math.min(1,Math.max(0,z-36),Math.max(0,64-z));}
 function stone(g,x,z,rx,ry,rz,mossy=true){
  const geo=new THREE.IcosahedronGeometry(1,1);const pos=geo.attributes.position,cols=[];const base=new THREE.Color();const ang=between(0,6.28),cs=Math.cos(ang),sn=Math.sin(ang);
  for(let i=0;i<pos.count;i++){const xx=pos.getX(i),yy=pos.getY(i),zz=pos.getZ(i),jitter=1+.12*Math.sin(xx*14+zz*11+yy*21+ang);const lx=xx*rx*jitter,lz=zz*rz*jitter,wx=x+lx*cs-lz*sn,wz=z+lx*sn+lz*cs;const y=heightAt(wx,wz)+ry*(yy*jitter+.52)-.07;pos.setXYZ(i,wx,y,wz);base.set(y<streamWater(wz)+.18?0x3f4845:0x77796b);base.multiplyScalar(.84+.2*(yy+1)/2+.08*Math.sin(xx*13+zz*8));cols.push(base.r,base.g,base.b)}geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.computeVertexNormals();const rock=mesh(g,geo,wet);stoneMeshes.push(rock);
  if(mossy){rock.updateMatrixWorld(true);const ray=new THREE.Raycaster();for(let j=0;j<6;j++){const xx=x+between(-.48,.48)*rx,zz=z+between(-.48,.48)*rz;ray.set(new THREE.Vector3(xx,30,zz),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(rock)[0];if(hit&&hit.point.y>streamWater(zz)+.25){q.setFromUnitVectors(up,hit.face.normal);instance(g,sphere,moss,xx,hit.point.y+.015,zz,rx*between(.13,.25),.045,rz*between(.13,.25),q)}}}
  return rock;
 }
 function fernPlant(g,x,z,size){const y=heightAt(x,z)-.015;for(let f=0;f<7;f++){const a=f*2.399+between(-.2,.2),reach=size*between(.62,1),p=[];for(let k=0;k<=5;k++){const t=k/5;p.push([x+Math.cos(a)*reach*t,y+size*(.1+1.4*t-1.04*t*t),z+Math.sin(a)*reach*t])}for(let k=1;k<p.length;k++)branch(g,p[k-1],p[k],.009*(1-k/7),.004,reed);for(let j=1;j<=8;j++){const t=j/9,px=x+Math.cos(a)*reach*t,pz=z+Math.sin(a)*reach*t,py=y+size*(.1+1.4*t-1.04*t*t);for(const s of [-1,1]){const len=size*.25*Math.sin(Math.PI*t);ellLeaf(g,[px,py,pz],[px+Math.cos(a+s*1.05)*len,py+.025,pz+Math.sin(a+s*1.05)*len],len*.19)}}}}
 function reeds(g,x,z,size){const y=heightAt(x,z)-.03;for(let j=0;j<9;j++){const a=between(0,6.28),rr=between(0,.17),xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr,h=size*between(.55,1.1),lean=between(.05,.25);ellLeaf(g,[xx,y,zz],[xx+Math.cos(a)*lean,y+h,zz+Math.sin(a)*lean],.018,reed);ellLeaf(g,[xx,y+h*.25,zz],[xx+Math.cos(a+1)*h*.38,y+h*.67,zz+Math.sin(a+1)*h*.38],.028,reed);if(j%4===0){branch(g,[xx,y,zz],[xx+lean*.2,y+h*1.08,zz],.008,.004,reed);instance(g,leafGeo,pollen,xx+lean*.2,y+h*1.05,zz,.035,.12,.035)}}}
 // Banks: discontinuous rock clusters, exposed gravel and layered undergrowth.
 for(let zi=0;zi<7;zi++)for(const side of [-1,1]){
  const z0=36+zi*4,z1=Math.min(64,z0+4),g=group(`bank_${zi}_${side<0?'west':'east'}`,'rocky-bank-with-pebbles-moss-ferns-and-reeds');
  for(let j=0;j<8;j++){const z=between(z0+.15,z1-.15),x=streamX(z)+side*between(3.25,4.35),r=between(.28,.66);if(allowed(x,z,r)&&rand()<fade(z))stone(g,x,z,r,between(.26,.62),r*between(.7,1.4));}
  for(let j=0;j<95;j++){const z=between(z0+.04,z1-.04),d=between(2.25,5.2),x=streamX(z)+side*d,s=between(.035,.16);if(!allowed(x,z,s)||rand()>fade(z))continue;const y=heightAt(x,z);instance(g,sphere,pebble,x,y+s*.15,z,s,s*between(.35,.8),s*between(.7,1.5),null,new THREE.Color().setHSL(.12,.08,between(.30,.48)));}
  for(let j=0;j<9;j++){const z=between(z0+.3,z1-.3),x=streamX(z)+side*between(3.25,6.5);if(allowed(x,z,.65)&&rand()<fade(z))fernPlant(g,x,z,between(.35,.68));}
  for(let j=0;j<7;j++){const z=between(z0+.2,z1-.2),x=streamX(z)+side*between(2.35,3.15);if(allowed(x,z,.3)&&rand()<fade(z))reeds(g,x,z,between(.5,1.05));}
  for(let j=0;j<18;j++){const z=between(z0+.1,z1-.1),x=streamX(z)+side*between(3.3,6.5);if(allowed(x,z,.3)&&rand()<fade(z))for(let k=0;k<4;k++){const xx=x+between(-.22,.22),zz=z+between(-.22,.22);instance(g,sphere,moss,xx,heightAt(xx,zz)-.008,zz,between(.12,.3),between(.045,.1),between(.1,.25));}}
 }
 // A loose rocky horseshoe sits behind and beside the naturally emerging source.
 // There is no stone crossing the 4.2m wetted channel and no new river plane.
 const source=[[0,58.8,1.0,.72,.85],[-1.85,58.95,.48,.62,.64],[1.95,59.15,.5,.55,.6],[-3.4,58.6,1.0,.95,1.15],[3.25,58.75,.85,.75,1.0],[-3.25,60.5,1.0,1.1,1.2],[3.45,60.7,1.0,.7,.85],[-1.1,61.5,1.05,.95,.9],[1.05,61.7,.8,.65,.85],[-4.75,61.5,.78,.75,.9],[4.8,61.8,.72,.55,.65],[-2.8,62.7,.7,.5,.6],[2.2,62.8,.65,.45,.6]];
 source.forEach(([dx,z,rx,ry,rz],i)=>{const x=streamX(z)+dx;if(allowed(x,z,Math.max(rx,rz))){const g=group('spring_rock_'+i,'terrain-founded-weathered-spring-outcrop');stone(g,x,z,rx,ry,rz);for(let j=0;j<3;j++){const xx=x+between(-rx,rx),zz=z+between(-rz,rz);if(allowed(xx,zz,.5))fernPlant(g,xx,zz,.45)}}});
 const shallows=group('shoals_and_ripples','small-water-edge-shoal-stones-and-sparse-current-ripples');
 for(let j=0;j<20;j++){const z=between(37,57),side=j%2?1:-1,x=streamX(z)+side*between(1.6,2.0);stone(shallows,x,z,between(.13,.27),between(.78,.98),between(.19,.39),false);}
 for(let j=0;j<26;j++){const z=between(37,57.5),x=streamX(z)+between(-1.4,1.4);if(heightAt(x,z)>streamWater(z))continue;const pts=[];for(let k=0;k<9;k++){const xx=x+(k/8-.5)*between(.4,.7),zz=z+Math.sin(k/8*Math.PI)*.12;pts.push(new THREE.Vector3(xx,streamWater(zz)+.052,zz))}const curve=new THREE.CatmullRomCurve3(pts),o=mesh(shallows,new THREE.TubeGeometry(curve,8,.009,3,false),foam);o.castShadow=false;}
 function tree(id,z,dx,h,cherry=false){
  const x=streamX(z)+dx;if(!allowed(x,z,1.25))return;const g=group(id,cherry?'branched-cherry-with-roots-and-individual-blossoms':'branched-pine-with-gripping-roots-and-needle-sprays'),y=heightAt(x,z)-.08;
  const trunk=[[x,y,z],[x+.14,y+h*.28,z-.12],[x-.12,y+h*.6,z+.13],[x+.32,y+h*.86,z+.04],[x+.22,y+h,z-.12]];
  for(let i=1;i<trunk.length;i++)branch(g,trunk[i-1],trunk[i],.2*(1-(i-1)/5),.19*(1-i/5));
  // Roots trace actual terrain, branching into fine gripping rootlets.
  for(let k=0;k<7;k++){const a=k*2.399,reach=between(.75,1.35),pts=[];for(let j=0;j<5;j++){const t=j/4,xx=x+Math.cos(a+.15*t)*reach*t,zz=z+Math.sin(a+.15*t)*reach*t;pts.push([xx,heightAt(xx,zz)+.10*(1-t),zz])}for(let j=1;j<pts.length;j++)branch(g,pts[j-1],pts[j],.11*(1-(j-1)/5),.09*(1-j/5),rootwood);for(const s of [-1,1]){const a2=a+s*.5,xx=pts[3][0]+Math.cos(a2)*.43,zz=pts[3][2]+Math.sin(a2)*.43;branch(g,pts[3],[xx,heightAt(xx,zz)+.018,zz],.027,.009,rootwood)}}
  for(let k=0;k<(cherry?10:12);k++){
   const a=k*2.399,level=.38+(k/(cherry?10:12))*.5,reach=(cherry?1.45:1.65)*(1-.45*(level-.38))*between(.8,1.15),start=[x,y+h*level,z],elbow=[x+Math.cos(a)*reach*.53,y+h*level+.18,z+Math.sin(a)*reach*.53],end=[x+Math.cos(a)*reach,y+h*level+(cherry?.8:.42),z+Math.sin(a)*reach];branch(g,start,elbow,.095,.052);branch(g,elbow,end,.052,.025);
   for(let b=0;b<4;b++){const a2=a+(b-1.5)*.62,rr=between(.48,.86),tip=[end[0]+Math.cos(a2)*rr,end[1]+between(.13,.6),end[2]+Math.sin(a2)*rr];branch(g,end,tip,.025,.009);
    if(cherry){for(let c=0;c<20;c++){const xx=tip[0]+between(-.30,.30),yy=tip[1]+between(-.19,.22),zz=tip[2]+between(-.30,.30);const s=between(.044,.072);for(let petal=0;petal<5;petal++){const a3=petal*1.257;instance(g,sphere,pink,xx+Math.cos(a3)*s*.55,yy,zz+Math.sin(a3)*s*.55,s*.57,s*.3,s*.57,null,new THREE.Color().setHSL(.98,.22,between(.61,.78)))}instance(g,sphere,pollen,xx,yy+.014,zz,.017,.011,.017)}for(let c=0;c<4;c++)ellLeaf(g,tip,[tip[0]+between(-.3,.3),tip[1]+.1,tip[2]+between(-.3,.3)],.05,fern);}
    else{for(let c=0;c<11;c++){const xx=tip[0]+between(-.37,.37),yy=tip[1]+between(-.1,.24),zz=tip[2]+between(-.37,.37);instance(g,sphere,needle,xx,yy,zz,between(.2,.35),between(.10,.18),between(.16,.29));for(let n=0;n<3;n++){const aa=between(0,6.28),v=new THREE.Vector3(Math.cos(aa)*.5,1,Math.sin(aa)*.5).normalize();q.setFromUnitVectors(up,v);instance(g,needleGeo,needle,xx+Math.cos(aa)*.13,yy+.12,zz+Math.sin(aa)*.13,.024,.23,.024,q)}}}
   }
  }
  for(let k=0;k<10;k++){const xx=x+between(-.65,.65),zz=z+between(-.65,.65);instance(g,sphere,moss,xx,heightAt(xx,zz)+.01,zz,.19,.045,.15)}
 }
 tree('pine_source_west',59.2,-4.8,5.6);tree('pine_upper_east',54.3,4.8,5.8);tree('pine_lower_west',42,-4.8,5.3);tree('cherry_lower_east',41.0,5.4,4.2,true);tree('cherry_temple_bank',50.0,-5.25,4.5,true);
 // Two old pine roots grip the spring's west outcrop, sampled against its actual faces.
 const gripping=group('source_gripping_roots','old-pine-roots-following-spring-rock-faces');
 const ray=new THREE.Raycaster();stoneMeshes.forEach(o=>o.updateMatrixWorld(true));
 function contact(x,z){ray.set(new THREE.Vector3(x,29,z),new THREE.Vector3(0,-1,0));const hits=ray.intersectObjects(stoneMeshes);return Math.max(heightAt(x,z),hits.length?hits[0].point.y:-10);}
 for(let arm=0;arm<2;arm++){let last=null;for(let k=0;k<=28;k++){const t=k/28,x=streamX(59.2)-4.8+t*(2.0+arm*.35),z=59.2-.9*t+Math.sin(t*3.14)*(.25+arm*.32),p=[x,contact(x,z)+.026+.045*(1-t),z];if(last)branch(gripping,last,p,.087*(1-t)+.016,.075*(1-t)+.013,rootwood);last=p;}for(const side of [-1,1]){let prev=last;for(let k=1;k<=6;k++){const t=k/6,x=last[0]+t*.48,z=last[2]+side*t*.37,p=[x,contact(x,z)+.018,z];branch(gripping,prev,p,.022*(1-t)+.008,.018*(1-t)+.005,rootwood);prev=p}}}
 // Batch repeated botanical parts to keep the complete island affordable to render.
 for(const [g,bs] of batches)for(const b of bs.values()){const im=new THREE.InstancedMesh(b.geo,b.material,b.items.length);b.items.forEach((it,i)=>{im.setMatrixAt(i,it.matrix);if(it.color)im.setColorAt(i,it.color)});im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;g.add(im)}
 return root;
}
