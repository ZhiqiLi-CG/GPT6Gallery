import { heightAt, roadNetwork, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='West provisions shop and pine household';
 const palette={wood:'#826047',pale:'#ae8960',dark:'#4e3c2e',end:'#c49b68',iron:'#454b48',wicker:'#ad9061',wicker2:'#917347',soil:'#554e3a',leaf:'#406844',leaf2:'#678046',pine:'#294d3e',pine2:'#385e48',white:'#d8d4b7',orange:'#cf8b36',red:'#b56639',stone:'#8c9084',water:'#567c78',clay:'#9c6449',glaze:'#697f73',blue:'#536b7c'};
 const mats={};for(const [n,color]of Object.entries(palette))mats[n]=new THREE.MeshStandardMaterial({color,roughness:n==='water'?.25:.88});
 const boxG=new THREE.BoxGeometry(1,1,1),cylG=new THREE.CylinderGeometry(1,1,1,12),ballG=new THREE.SphereGeometry(1,10,7),coneG=new THREE.ConeGeometry(1,1,10),batches=new Map(),o=new THREE.Object3D();
 function add(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geo.uuid+m;if(!batches.has(key))batches.set(key,{geo,m,arr:[]});o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();batches.get(key).arr.push(o.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',rx=0,ry=0,rz=0){add(boxG,m,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,r=.04,m='wood'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dv=bv.clone().sub(av);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dv.clone().normalize());o.scale.set(r,dv.length(),r);o.updateMatrix();const key=cylG.uuid+m;if(!batches.has(key))batches.set(key,{geo:cylG,m,arr:[]});batches.get(key).arr.push(o.matrix.clone());}
 function ball(x,y,z,a,b,c,m){add(ballG,m,x,y,z,a,b,c);}
 const ringCache={};function ring(x,y,z,r,t,m,rx=Math.PI/2,ry=0){const key=r+','+t;if(!ringCache[key])ringCache[key]=new THREE.TorusGeometry(r,t,5,24);add(ringCache[key],m,x,y,z,1,1,1,rx,ry);}
 function ground(x,z){return heightAt(x,z)+.065;}
 function foot(x,z,top,r=.06,m='wood'){beam([x,ground(x,z)-.06,z],[x,top,z],r,m);}
 const roads=roadNetwork(),lots=layout().town.lots.filter(l=>l.x===-66&&[-32,-12].includes(l.z));
 g.userData.sharedLayout={lots:lots.length,roads:roads.length};
 function basket(x,y,z,r=.34,h=.43){add(new THREE.CylinderGeometry(r,r*.7,h,16,1,true),'wicker',x,y+h/2,z);add(cylG,'wicker2',x,y+.035,z,r*.71,.07,r*.71);for(let j=0;j<8;j++)ring(x,y+.05+j*(h-.05)/7,z,r*(.73+.27*j/7),.015,j%2?'wicker':'wicker2');for(let j=0;j<16;j++){let a=j*Math.PI/8;beam([x+Math.cos(a)*r*.72,y+.04,z+Math.sin(a)*r*.72],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.013,'wicker2');}ring(x,y+h,z,r,.027,'pale');}
 function pot(x,z,r=.25,h=.52,m='clay',plant=false){const y=ground(x,z),profile=[[0,0],[r*.65,0],[r*.94,h*.23],[r,h*.56],[r*.68,h*.84],[r*.65,h],[r*.51,h],[r*.52,h*.83]];const geo=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),18);add(geo,m,x,y,z);ring(x,y+h,z,r*.59,.025,m);add(cylG,'soil',x,y+h*.82,z,r*.51,.03,r*.51);if(plant)for(let k=0;k<9;k++){const a=k*2.4;beam([x,y+h*.8,z],[x+Math.cos(a)*r*.6,y+h+.27+(k%3)*.07,z+Math.sin(a)*r*.6],.015,'leaf');ball(x+Math.cos(a)*r*.65,y+h+.23+(k%3)*.07,z+Math.sin(a)*r*.65,r*.25,.17,r*.42,k%2?'leaf':'leaf2');}}
 function barrel(x,z,r=.37,h=.91){let y=ground(x,z);for(let i=0;i<16;i++){let a=i*Math.PI/8;box(x+Math.cos(a)*r*.88,y+h/2,z+Math.sin(a)*r*.88,r*.33,h,.09,i%3?'wood':'pale',0,-a+Math.PI/2);}for(const hh of [.13,h*.5,h-.12])ring(x,y+hh,z,r,.033,'iron');for(let k=-2;k<=2;k++)box(x+k*r*.33,y+h,z,r*.30,.045,2*Math.sqrt(Math.max(.02,r*r-(k*r*.33)**2)),'pale');}
 function crate(x,y,z,w,d,h=.30){for(let k=0;k<5;k++)box(x-w/2+(k+.5)*w/5,y+.025,z,w/5-.014,.05,d,'pale');for(const s of [-1,1]){for(let k=0;k<3;k++){box(x,y+.075+k*.085,z+s*d/2,w,.055,.045,'wood');box(x+s*w/2,y+.075+k*.085,z,.045,.055,d,'wood');}for(const t of [-1,1])box(x+s*w/2,y+h/2,z+t*d/2,.045,h,.045,'dark');}box(x,y+h*.45,z,.04,h*.9,d,'pale');}
 // Low counter on the western wing; each leg extends independently to the fitted forecourt.
 const cx=-69.35,cz=-26.45,cy=Math.max(...[-70.55,-68.15].flatMap(x=>[-26.97,-25.93].map(z=>ground(x,z))))+.87;
 for(const dx of [-1.18,1.18])for(const dz of [-.48,.48]){foot(cx+dx,cz+dz,cy,.065);box(cx+dx,cy-.17,cz+dz,.10,.13,.10,'dark');}
 for(let k=0;k<8;k++)box(cx-1.3+(k+.5)*2.6/8,cy,cz,2.6/8-.012,.095,1.13,k%3?'wood':'pale');
 for(const dz of [-.45,.45])box(cx,cy-.44,cz+dz,2.48,.09,.08,'dark');
 crate(-70.05,cy+.055,cz,.99,.83);crate(-68.87,cy+.055,cz,1.12,.83);
 for(let k=0;k<8;k++){let x=-70.42+(k%4)*.23,z=cz-.23+Math.floor(k/4)*.38;add(coneG,'white',x,cy+.29,z,.09,.40,.09,0,0,Math.PI+.2);for(let j=0;j<4;j++){let a=j*1.7+k;ball(x+Math.cos(a)*.075,cy+.55,z+Math.sin(a)*.09,.045,.17,.085,j%2?'leaf':'leaf2');}}
 for(let k=0;k<12;k++){const x=-69.30+(k%4)*.27,z=cz-.23+Math.floor(k/4)*.23;ball(x,cy+.22,z,.112,.105,.108,k<6?'orange':'red');beam([x,cy+.29,z],[x+.012,cy+.36,z],.015,'dark');}
 // A small beam balance stands on a separate weighing stool beside the east stair wing.
 const bx=-63.05,bz=-26.45,by=ground(bx,bz)+.7;
 for(const dx of [-.32,.32])for(const dz of [-.25,.25])foot(bx+dx,bz+dz,by,.045);
 box(bx,by,bz,.82,.075,.68,'pale');box(bx,by+.08,bz,.30,.12,.24,'iron');beam([bx,by+.1,bz],[bx,by+.79,bz],.032,'iron');beam([bx-.39,by+.67,bz],[bx+.39,by+.73,bz],.022,'iron');
 for(const s of [-1,1]){let px=bx+s*.34,py=by+.27;for(const dz of [-.14,.14])beam([bx+s*.36,by+.70,bz],[px,py+.025,bz+dz],.008,'iron');add(new THREE.CylinderGeometry(.17,.09,.06,16),'iron',px,py,bz);}
 basket(-70.4,ground(-70.4,-27.45),-27.45,.33,.48);basket(-68.1,ground(-68.1,-27.5),-27.5,.29,.38);
 barrel(-62.2,-27.45);barrel(-61.26,-27.6,.32,.78);
 // Two-wheel cart: open slatted cargo body, axle, hubs, twelve spokes, rims and handles.
 const tx=-58.88,tz=-28.8,ty=Math.max(ground(tx-.72,tz),ground(tx+.72,tz))+.57;
 beam([tx-.86,ty,tz],[tx+.86,ty,tz],.065,'iron');
 for(const s of [-1,1]){const xx=tx+s*.75;ring(xx,ty,tz,.51,.058,'dark',0,Math.PI/2);ring(xx,ty,tz,.49,.021,'iron',0,Math.PI/2);beam([xx-.1,ty,tz],[xx+.1,ty,tz],.105,'wood');for(let k=0;k<12;k++){let a=k*Math.PI/6;beam([xx,ty,tz],[xx,ty+Math.cos(a)*.46,tz+Math.sin(a)*.46],.026,'pale');}}
 for(let k=0;k<7;k++)box(tx-.53+k*.177,ty+.17,tz, .16,.07,1.85,'pale');for(const s of [-1,1]){for(let j=0;j<3;j++)box(tx+s*.61,ty+.29+j*.15,tz,.055,.09,1.9,'wood');for(const d of [-.88,.88])box(tx+s*.61,ty+.43,tz+d,.08,.65,.08,'dark');beam([tx+s*.47,ty+.13,tz+.5],[tx+s*.55,ground(tx+s*.55,tz+2.8)+.40,tz+2.8],.048,'wood');foot(tx+s*.47,tz+1.5,ty+.14,.045);}
 for(let j=0;j<3;j++)box(tx,ty+.29+j*.15,tz-.92,1.25,.09,.055,'wood');crate(tx,ty+.22,tz-.2,.92,1.0,.34);basket(tx,ty+.23,tz+.52,.32,.43);
 // Narrow side-yard storage with full boarded back, sides and a sloping plank roof.
 function rack(x,z,w,d,h){const y=Math.max(...[-w/2,w/2].flatMap(dx=>[-d/2,d/2].map(dz=>ground(x+dx,z+dz))));for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])foot(x+dx,z+dz,y+h,.055);for(let k=0;k<7;k++)box(x-w/2+(k+.5)*w/7,y+h*.5,z-d/2,w/7-.012,h,.065,'wood');for(const dx of [-w/2,w/2])for(let k=0;k<5;k++)box(x+dx,y+h*.48,z-d/2+(k+.5)*d/5,.06,h*.96,d/5-.012,'pale');for(let k=0;k<7;k++)box(x-w/2+(k+.5)*w/7,y+h+.09,z,w/7+.01,.08,d+.2,'dark',-.10);for(const hh of [.15,.80]){box(x,y+hh,z,w,.075,d,'wood');for(let k=0;k<9;k++){let xx=x-w*.4+(k%5)*w*.19,zz=z-.05,yy=y+hh+.13+Math.floor(k/5)*.23;add(cylG,'wood',xx,yy,zz,.095,d*.8,.095,Math.PI/2);add(cylG,'end',xx,yy,zz+d*.405,.087,.016,.087,Math.PI/2);beam([xx-.04,yy-.04,zz+d*.42],[xx+.04,yy+.05,zz+d*.42],.008,'dark');}}return y;}
 rack(-58.95,-35.65,1.8,1.65,1.7);basket(-58.5,ground(-58.5,-33.9),-33.9,.4,.59);barrel(-59.7,-32.5,.33,.82);
 rack(-59.03,-13.75,1.85,1.35,1.75);
 // Northern wash court, hollow carved basin and a wooden dipper.
 const wx=-62.9,wz=-17.2,wy=ground(wx,wz);box(wx,wy+.16,wz,1.03,.29,.8,'stone');for(const s of [-1,1]){box(wx+s*.47,wy+.42,wz,.13,.32,.82,'stone');box(wx,wy+.42,wz+s*.35,.84,.32,.13,'stone');}box(wx,wy+.34,wz,.79,.025,.57,'water');beam([wx-.36,wy+.58,wz-.2],[wx+.52,wy+.60,wz+.17],.026,'pale');add(new THREE.CylinderGeometry(.10,.09,.13,12,1,true),'pale',wx-.32,wy+.56,wz-.18);
 pot(-64.1,-17.1,.24,.56,'blue');pot(-61.8,-17.55,.27,.57,'clay',true);pot(-69.7,-17.25,.3,.61,'glaze',true);pot(-68.7,-17.45,.23,.45,'clay',true);basket(-70.35,ground(-70.35,-16.5),-16.5,.34,.4);
 // Rectangular garden containers with soil and individually arranged kitchen leaves.
 for(let j=0;j<2;j++){const x=-59.0,z=-16.25-j*.87,y=ground(x,z);box(x,y+.16,z,1.48,.3,.62,'wood');box(x,y+.325,z,1.34,.02,.48,'soil');for(let k=0;k<6;k++){let xx=x-.55+(k%3)*.55,zz=z-.13+Math.floor(k/3)*.26;for(let q=0;q<4;q++)ball(xx+Math.cos(q*1.7)*.09,y+.46,zz+Math.sin(q*1.7)*.09,.065,.19,.13,(k+q)%2?'leaf':'leaf2');}}
 // Small pruned pine keeps its entire canopy in the eastern strip.
 const px=-58.86,pz=-9.54,py=ground(px,pz);beam([px,py-.1,pz],[px-.18,py+1.7,pz+.08],.13,'dark');beam([px-.18,py+1.6,pz+.08],[px+.1,py+2.84,pz-.07],.075,'wood');
 for(let k=0;k<7;k++){const a=k*2.39,r=.60+(k%2)*.16,yy=py+1.30+k*.23,ex=px+Math.cos(a)*r,ez=pz+Math.sin(a)*r;beam([px-.08,yy-.30,pz],[ex,yy,ez],.04,'dark');for(let j=0;j<5;j++){let aa=j*2.4;ball(ex+Math.cos(aa)*.23,yy+.12+(j%2)*.09,ez+Math.sin(aa)*.24,.37,.22,.35,(j+k)%2?'pine':'pine2');}}ball(px+.1,py+2.88,pz-.07,.52,.28,.45,'pine');
 // Distinct low fences with terrain-sloped rails and deliberate open gateways.
 function fence(a,b,bamboo=false){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.72),ps=[];for(let k=0;k<=n;k++){let x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,y=ground(x,z);foot(x,z,y+(bamboo?.90:.8),bamboo?.035:.05,bamboo?'pale':'dark');ps.push([x,y,z]);}for(let k=1;k<ps.length;k++)for(const h of [.32,.68])beam([ps[k-1][0],ps[k-1][1]+h,ps[k-1][2]],[ps[k][0],ps[k][1]+h,ps[k][2]],.027,bamboo?'wicker':'wood');}
 fence([-57.42,-37.4],[-57.42,-30.4]);fence([-57.42,-26.0],[-57.42,-24.99]);fence([-71.0,-25.1],[-68.0,-25.1]);
 fence([-57.42,-18.85],[-57.42,-15.9],true);fence([-57.42,-12.3],[-57.42,-7.42],true);fence([-60.1,-7.44],[-57.42,-7.44],true);fence([-70.7,-18.77],[-67.8,-18.77],true);fence([-64.3,-18.77],[-61.4,-18.77],true);
 // A short inward-swung gate marks the side entrance without blocking its walking gap.
 fence([-57.42,-15.9],[-58.03,-15.33],true);
 for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(batch.geo,mats[batch.m],batch.arr.length);batch.arr.forEach((mx,i)=>mesh.setMatrixAt(i,mx));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}return g;
}
