import {heightAt,roadNetwork,layout,clearBlockout,streamX} from './root.js';

export function build(THREE,ctx) {
 clearBlockout('farms');
 const g=new THREE.Group();g.name='farms_working_landscape';
 const district=layout().farms, roads=roadNetwork();
 let seed=83032;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.95});
 const m={wood:material('#63452f'),timber:material('#493325'),plaster:material('#e4d4b3'),plaster2:material('#cab88e'),tile:material('#a65237'),tile2:material('#bd7048'),stone:material('#8c8778'),dark:material('#322b23'),soil:material('#634a32'),soil2:material('#85633c'),grain:material('#c9a142'),grain2:material('#e1bd5d'),stalk:material('#b69545'),green:material('#4a7036'),green2:material('#72913b'),hedge:material('#3f6334'),leaf:material('#517a3e'),leaf2:material('#6d8945'),fruit:material('#b84d30'),yard:material('#ac9570'),hay:material('#c7a358'),iron:material('#484640'),white:material('#dfd6be'),animal:material('#988375'),pig:material('#b28d7d')};
 const geo={box:new THREE.BoxGeometry(1,1,1),ball:new THREE.IcosahedronGeometry(1,1),cylinder:new THREE.CylinderGeometry(1,1,1,8),cone:new THREE.ConeGeometry(1,1,8)};
 const batches=new Map(),tmp=new THREE.Object3D();
 function inst(type,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+':'+mat;let b=batches.get(key);if(!b){b={geo:geo[type],mat:m[mat],data:[]};batches.set(key,b);}tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(rx,ry,rz);tmp.updateMatrix();b.data.push(tmp.matrix.clone());}
 const box=(x,y,z,w,h,d,mat,rx=0,ry=0,rz=0)=>inst('box',mat,x,y,z,w,h,d,rx,ry,rz);
 function mesh(q,mat){const o=new THREE.Mesh(q,m[mat]);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function beam(a,b,r=.1,mat='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dir=bv.clone().sub(av);tmp.position.copy(av).add(bv).multiplyScalar(.5);tmp.scale.set(r,dir.length(),r);tmp.rotation.set(0,0,0);tmp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());tmp.updateMatrix();const key='cylinder:'+mat;let ba=batches.get(key);if(!ba){ba={geo:geo.cylinder,mat:m[mat],data:[]};batches.set(key,ba);}ba.data.push(tmp.matrix.clone());}
 function roadDist(x,z){let d=1e9;for(const r of roads)for(let i=1;i<r.points.length;i++){let a=r.points[i-1],b=r.points[i],vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz)));d=Math.min(d,Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz)-r.width/2);}return d;}
 const safe=(x,z,margin=2)=>roadDist(x,z)>margin&&Math.abs(x-streamX(z))>14;
 function inside(x,z,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!=(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;return c;}
 function patch(p,mat,dy=.08){const vs=[],ix=[];let x0=Math.min(...p.map(a=>a[0])),x1=Math.max(...p.map(a=>a[0])),z0=Math.min(...p.map(a=>a[1])),z1=Math.max(...p.map(a=>a[1]));const contour=p.map(a=>new THREE.Vector2(...a));for(const ids of THREE.ShapeUtils.triangulateShape(contour,[])){const a=p[ids[0]],b=p[ids[1]],c=p[ids[2]],n=Math.ceil(Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(a[0]-c[0],a[1]-c[1]),Math.hypot(b[0]-c[0],b[1]-c[1]))/2);function v(u,w){return [a[0]+(b[0]-a[0])*u/n+(c[0]-a[0])*w/n,a[1]+(b[1]-a[1])*u/n+(c[1]-a[1])*w/n];}function tri(ps){let j=vs.length/3;for(const [x,z] of ps)vs.push(x,heightAt(x,z)+dy,z);ix.push(j,j+2,j+1);}for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){tri([v(i,j),v(i+1,j),v(i,j+1)]);if(i+j<n-1)tri([v(i+1,j),v(i+1,j+1),v(i,j+1)]);}}
 const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));q.setIndex(ix);q.computeVertexNormals();const o=mesh(q,mat);o.material=m[mat].clone();o.material.side=THREE.DoubleSide;return [x0,z0,x1,z1];}
 function lane(points,w=3){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len*w/2,nz=(b[0]-a[0])/len*w/2;patch([[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]],'yard',.22);}}
 function gate(x,z,angle,w=3.8){const dx=Math.cos(angle),dz=Math.sin(angle);for(const t of [-w/2,w/2]){let xx=x+dx*t,zz=z+dz*t;box(xx,heightAt(xx,zz)+.8,zz,.23,1.8,.23,'wood');}const hinge=[x-dx*w/2,z-dz*w/2],open=angle+.6;const ex=hinge[0]+Math.cos(open)*w,ez=hinge[1]+Math.sin(open)*w;for(const h of [.5,1.1])beam([hinge[0],heightAt(...hinge)+h,hinge[1]],[ex,heightAt(ex,ez)+h,ez],.065);beam([hinge[0],heightAt(...hinge)+.4,hinge[1]],[ex,heightAt(ex,ez)+1.2,ez],.065);}
 function fence(a,b,hedge=false,gateHere=false){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/2.5),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;for(let i=0;i<=n;i++){const t=i/n*len,x=a[0]+t*dx,z=a[1]+t*dz;if(gateHere&&Math.abs(t-len/2)<2.3)continue;if(!safe(x,z,.8))continue;const y=heightAt(x,z);box(x,y+.72,z,.18,1.65,.18,'wood');if(i<n){const u=(i+1)/n*len;if(gateHere&&Math.abs((t+u)/2-len/2)<2.5)continue;for(const yy of [.5,1.15])beam([x,y+yy,z],[a[0]+u*dx,heightAt(a[0]+u*dx,a[1]+u*dz)+yy,a[1]+u*dz],.06);}}
 if(hedge)for(let t=.5;t<len;t+=1.15){if(gateHere&&Math.abs(t-len/2)<2.5)continue;const x=a[0]+t*dx+dz*.45,z=a[1]+t*dz-dx*.45;if(!safe(x,z,1.3))continue;inst('ball','hedge',x,heightAt(x,z)+.8,z,.9,1+rnd()*.35,.9);}
 if(gateHere){let x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;if(safe(x,z))gate(x,z,Math.atan2(dz,dx));}}
 function boundary(p){for(let i=0;i<p.length;i++)fence(p[i],p[(i+1)%p.length],i%2===0,i===1);}
 function orchard(p){const [x0,z0,x1,z1]=patch(p,'green',.05);boundary(p);for(let x=x0+4;x<x1-2;x+=6.7)for(let z=z0+4;z<z1-2;z+=7){if(!inside(x,z,p)||!safe(x,z,3))continue;const y=heightAt(x,z);beam([x,y,z],[x,y+3.2,z],.19);for(const s of [-1,1])beam([x,y+1.5,z],[x+s*1.1,y+3,z+.3],.10);for(let j=0;j<3;j++){const xx=x+(j-1)*.8,zz=z+(j%2)*.7;inst('ball',j%2?'leaf2':'leaf',xx,y+3.7+j*.25,zz,1.75,1.8,1.8);}for(let j=0;j<10;j++){const a=rnd()*Math.PI*2;inst('ball','fruit',x+Math.cos(a)*1.7,y+3.3+rnd()*1.5,z+Math.sin(a)*1.7,.14,.15,.14);}}}
 function field(p,type){const [x0,z0,x1,z1]=patch(p,type==='grain'?'soil2':'soil');boundary(p);for(let x=x0+.8;x<x1-.5;x+=type==='grain'?.85:1.3){for(let z=z0+.5;z<z1-.5;z+=type==='grain'?.75:.8){if(!inside(x,z,p)||!safe(x,z,2))continue;const y=heightAt(x,z);if(type==='grain'){const xx=x+(rnd()-.5)*.2,zz=z+(rnd()-.5)*.25,h=.7+rnd()*.35;box(xx,y+h/2,zz,.045,h,.045,'stalk');inst('ball',rnd()>.55?'grain':'grain2',xx,y+h,zz,.16,.29,.13);}else if(type==='green'){inst('ball','soil2',x,y+.12,z,.43,.18,.47);inst('ball',rnd()>.3?'green':'green2',x,y+.34,z,.36,.31,.37);for(const sign of [-1,1])inst('ball','green2',x+sign*.22,y+.32,z,.23,.1,.25,0,0,sign*.5);}else{inst('ball',rnd()>.25?'soil':'soil2',x,y+.16,z,.43,.19,.55);}}}}
 function roof(x,z,w,d,eave,rise,mat='tile'){const angle=Math.atan2(rise,d/2),len=Math.hypot(d/2,rise);for(const s of [-1,1]){box(x,eave+rise/2,z+s*d/4,w+1,.22,len+.65,mat,s*angle);for(let i=0;i<=Math.ceil(len/.7);i++){const t=i/Math.ceil(len/.7);box(x,eave+rise*(1-t)+.15,z+s*t*d/2,w+1,.08,.13,mat==='tile'?'tile2':'wood',s*angle);}if(mat==='tile')for(let xx=x-w/2;xx<x+w/2;xx+=.9){beam([xx,eave+rise+.18,z],[xx,eave+.15,z+s*d/2],.025,'tile2');}}beam([x-w/2-.6,eave+rise+.18,z],[x+w/2+.6,eave+rise+.18,z],.16,mat==='tile'?'tile2':'wood');}
 function building(x,z,w,d,h,barn=false){const samples=[];for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])samples.push(heightAt(x+xx,z+zz));const base=Math.max(...samples)+.12,lo=Math.min(...samples)-.3;box(x,(base+lo)/2,z,w+.35,base-lo,d+.35,'stone');box(x,base+h/2,z,w,h,d,barn?'wood':'plaster');const rise=d*.44;
 for(const s of [-1,1]){const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute([x+s*w/2,base+h,z-d/2,x+s*w/2,base+h,z+d/2,x+s*w/2,base+h+rise,z],3));q.computeVertexNormals();const ob=mesh(q,barn?'wood':'plaster');ob.material=ob.material.clone();ob.material.side=THREE.DoubleSide;}
 for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(x+xx,base+h/2,z+zz,.23,h,.23,'timber');for(const s of [-1,1]){for(const hh of [.25,h*.52,h])box(x,base+hh,z+s*(d/2+.025),w,.2,.2,'timber');for(let xx=-w/2+2;xx<w/2;xx+=2.4){box(x+xx,base+h/2,z+s*(d/2+.03),.16,h,.14,'timber');beam([x+xx,base+h*.54,z+s*(d/2+.09)],[x+Math.min(xx+2,w/2),base+h-.2,z+s*(d/2+.09)],.07,'timber');if(!barn){box(x+xx,base+h*.73,z+s*(d/2+.13),1.05,1.1,.10,'dark');for(const t of [-1,1])box(x+xx+t*.67,base+h*.73,z+s*(d/2+.15),.23,1.2,.10,'wood');box(x+xx,base+h*.73,z+s*(d/2+.20),.07,1.1,.10,'wood');}}}
 for(const s of [-1,1]){for(const hh of [.2,h*.52,h])box(x+s*w/2,base+hh,z,.2,.18,d,'timber');beam([x+s*(w/2+.06),base+h,z-d/2],[x+s*(w/2+.06),base+h+rise,z],.1,'timber');beam([x+s*(w/2+.06),base+h,z+d/2],[x+s*(w/2+.06),base+h+rise,z],.1,'timber');box(x+s*(w/2+.08),base+h*.65,z,.12,1.2,1,'dark');}
 const dw=barn?3.8:1.4,dh=barn?3.5:2.3;box(x,base+dh/2,z-d/2-.13,dw,dh,.14,'dark');for(const s of [-1,1]){box(x+s*dw*.3,base+dh/2,z-d/2-.25,dw*.38,dh,.18,'wood',0,s*.18);beam([x+s*dw*.48,base+.1,z-d/2-.36],[x+s*dw*.1,base+dh-.1,z-d/2-.36],.065,'timber');}box(x,base-.04,z-d/2-.7,dw+.5,.28,.9,'stone');roof(x,z,w,d,base+h,rise,barn?'wood':'tile');if(!barn){box(x+w*.25,base+h+rise*.9,z+d*.17,1.05,3,1.1,'stone');box(x+w*.25,base+h+rise*.9+1.55,z+d*.17,1.3,.22,1.35,'stone');}
 if(barn)for(let xx=x-w/2+.5;xx<x+w/2;xx+=.55)for(const s of [-1,1])box(xx,base+h/2,z+s*(d/2+.03),.045,h,.045,'timber');}
 function barrel(x,z){const y=heightAt(x,z);inst('cylinder','wood',x,y+.5,z,.39,.95,.39);for(const yy of [.14,.48,.86])inst('cylinder','iron',x,y+yy,z,.407,.045,.407);}
 function hay(x,z,r=1.5){const y=heightAt(x,z);inst('cylinder','hay',x,y+.7,z,r,1.4,r);inst('cone','hay',x,y+1.7,z,r*1.13,1.5,r*1.13);beam([x,y,z],[x,y+2.8,z],.08);for(let i=0;i<14;i++){let a=i/14*Math.PI*2;beam([x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r],[x+Math.cos(a)*.1,y+2.4,z+Math.sin(a)*.1],.026,'grain');}}
 function cart(x,z){const y=heightAt(x,z);box(x,y+1,z,1.8,.18,3,'wood');for(const xx of [-.94,.94]){box(x+xx,y+1.45,z,.12,.8,3,'wood');beam([x+xx,y+.7,z-1.5],[x+xx,y+.5,z-4],.09);}for(const zz of [-1.42,1.42])box(x,y+1.4,z+zz,1.9,.7,.14,'wood');for(const xx of [-1.2,1.2])for(const zz of [-.95,.95]){const q=new THREE.TorusGeometry(.58,.075,5,12);const ob=mesh(q,'iron');ob.rotation.y=Math.PI/2;ob.position.set(x+xx,y+.62,z+zz);for(let k=0;k<6;k++){const a=k*Math.PI/3;beam([x+xx,y+.62,z+zz],[x+xx,y+.62+Math.sin(a)*.54,z+zz+Math.cos(a)*.54],.035);}}}
 function animal(x,z,kind='sheep',rot=0){const y=heightAt(x,z),mat=kind==='sheep'?'white':kind==='pig'?'pig':'animal',s=kind==='cow'?1.5:1;inst('ball',mat,x,y+.76*s,z,.44*s,.46*s,.74*s,0,rot);const dx=Math.sin(rot),dz=Math.cos(rot);inst('ball',kind==='sheep'?'dark':mat,x+dx*.7*s,y+.93*s,z+dz*.7*s,.26*s,.3*s,.34*s,0,rot);for(const xx of [-.25,.25])for(const zz of [-.43,.43]){const px=x+(xx*Math.cos(rot)+zz*dx)*s,pz=z+(-xx*dx+zz*Math.cos(rot))*s;box(px,y+.3*s,pz,.11*s,.65*s,.11*s,'dark');}if(kind==='cow')for(const ss of [-1,1])beam([x+dx*.7*s+ss*.22,y+1.1*s,z+dz*.7*s],[x+dx*.7*s+ss*.38,y+1.3*s,z+dz*.7*s],.055,'white');}
 function pen(x0,z0,x1,z1,kind,n){const p=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];patch(p,'soil2',.1);for(let i=0;i<4;i++)fence(p[i],p[(i+1)%4],false,i===1);for(let i=0;i<n;i++)animal(x0+1.5+rnd()*(x1-x0-3),z0+1.5+rnd()*(z1-z0-3),kind,rnd()*6.28);box(x0+1,heightAt(x0+1,z0+2)+.35,z0+2,.8,.7,2.5,'wood');box(x0+1,heightAt(x0+1,z0+2)+.72,z0+2,.62,.06,2.2,'dark');}
 function shed(x,z){building(x,z,5,4,2.9,true);for(let i=0;i<5;i++){beam([x-2+i*.4,heightAt(x,z)+.25,z-2.5],[x-2+i*.4,heightAt(x,z)+2.3,z-1.7],.04);}}
 // Southwest holdings: boundaries stay clear of the diagonal route to the square.
 field([[-142,-141],[-119,-141],[-108,-114],[-141,-101]],'grain');
 field([[-141,-98],[-109,-109],[-91,-95],[-103,-89],[-140,-91]],'plough');
 field([[-103,-140],[-55,-140],[-55,-109],[-82,-100],[-95,-115]],'grain');
 field([[-79,-98],[-54,-105],[-54,-87],[-61,-89]],'green');
 orchard([[-101,-79],[-81,-77],[-58,-61],[-101,-59]]);
 patch([[-140,-88],[-105,-88],[-105,-59],[-140,-59]],'yard');
 building(-128,-66,11,8,5.2);building(-117,-82,16,9,5.8,true);shed(-137,-79);
 pen(-139,-72,-136,-60,'pig',2);pen(-113,-73,-105,-60,'sheep',5);
 fence([-140,-88],[-140,-59],true);fence([-140,-59],[-105,-59],false);fence([-140,-88],[-106,-88],false);
 lane([[-78,-89],[-97,-84],[-105,-76],[-121,-75]],3);gate(-105,-76,Math.PI/2,3.8);
 hay(-132,-85,1.6);hay(-135,-85,1.4);hay(-131,-80,1.2);cart(-120,-73);barrel(-122,-64);barrel(-121,-64);barrel(-113,-76);
 // East southern farm, reached from the bridge road by a short north gate lane.
 field([[80,-116],[141,-116],[141,-93],[99,-91],[80,-98]],'grain');
 field([[80,-95],[95,-90],[95,-51],[82,-44]],'green');
 patch([[99,-88],[142,-88],[142,-48],[100,-49]],'yard');
 building(110,-58,11,8,5.3);building(132,-60,16,10,6,true);shed(136,-82);
 pen(100,-87,116,-73,'cow',4);pen(119,-86,130,-75,'pig',4);
 fence([99,-88],[142,-88],true);fence([142,-88],[142,-48],true);fence([100,-49],[140,-48],false,true);
 lane([[119,-37],[120,-48],[120,-66],[131,-72]],3.7);gate(120,-48,0,4);
 cart(122,-68);hay(139,-73,1.6);hay(135,-74,1.7);hay(131,-73,1.25);for(let i=0;i<4;i++)barrel(105+i*.85,-63);
 // Eastern strip fields and orchard straddle the winding north farm road.
 field([[81,-16],[87,-14],[96,7],[98,34],[80,34]],'plough');
 field([[101,-23],[142,-33],[142,-4],[109,1]],'grain');
 patch([[106,5],[142,5],[142,39],[110,36]],'yard');
 building(133,29,11,8,5.2);building(123,12,17,10,5.8,true);shed(140,16);
 pen(111,23,124,36,'sheep',6);fence([108,5],[142,5],false);fence([142,5],[142,39],true);fence([111,38],[142,39],false);
 lane([[98,15],[108,19],[131,20]],3);gate(109,19,Math.PI/2,4);cart(129,21);hay(138,8,1.5);hay(135,7,1.3);barrel(128,28);barrel(129,28);
 orchard([[116,44],[142,43],[142,111],[123,111],[117,88]]);
 field([[80,40],[97,40],[104,73],[81,78]],'green');
 field([[81,82],[106,79],[115,113],[80,113]],'grain');
 // Smaller stacked tools and cut timber keep working yards legible in close views.
 for(const [x,z] of [[-132,-75],[137,-68],[137,23]]){for(let k=0;k<6;k++)inst('cylinder','wood',x+(k%3)*.5,heightAt(x,z)+.3+Math.floor(k/3)*.45,z,.21,2,.21,Math.PI/2);for(let k=0;k<3;k++){beam([x+k*.6,heightAt(x,z),z+2],[x+k*.6+.3,heightAt(x,z)+2.2,z+1.6],.035);for(let j=-1;j<=1;j++)beam([x+k*.6+.3+j*.12,heightAt(x,z)+2.15,z+1.6],[x+k*.6+.3+j*.12,heightAt(x,z)+2.55,z+1.6],.025,'iron');}}
 for(const b of batches.values()){const o=new THREE.InstancedMesh(b.geo,b.mat,b.data.length);b.data.forEach((v,i)=>o.setMatrixAt(i,v));o.castShadow=true;o.receiveShadow=true;g.add(o);}
 return g;
}
