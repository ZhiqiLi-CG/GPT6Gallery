import {heightAt,roadNetwork,layout} from './root.js';
export function build(THREE,ctx){
 const group=new THREE.Group();group.name='rice-storage_complete-farmyard';
 const roads=roadNetwork(),district=layout().districts.find(d=>d.id==='rice-terraces');
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.92});
 const wood=[0x796048,0x80684e,0x705841,0x8d7456,0x76644f].map(mat),dark=mat(0x463c30),stone=[0x797b70,0x89897b,0x6e7269].map(mat),earth=mat(0x96856a),iron=mat(0x424a47),straw=mat(0xb7a273),rope=mat(0x978561),tile=[0x505f64,0x58676b,0x46565d].map(mat),green=[0x425d42,0x536947,0x344f3d].map(mat),sackMat=mat(0xb4a080);

 function mesh(geo,m,x,y,z){let o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
 function box(x,y,z,w,h,d,m=wood[0]){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);}
 function beam(a,b,w=.1,m=wood[0],d=w){let v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=box((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,w,v.length(),d,m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function rod(a,b,r=.035,m=wood[2]){let v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=mesh(new THREE.CylinderGeometry(r*.85,r,v.length(),8),m,...a);o.position.addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function ell(x,y,z,a,b,c,m){const o=mesh(new THREE.SphereGeometry(1,12,8),m,x,y,z);o.scale.set(a,b,c);return o;}
 function ring(x,y,z,r,t,m=rope,rot=true){const o=mesh(new THREE.TorusGeometry(r,t,5,24),m,x,y,z);if(rot)o.rotation.x=Math.PI/2;return o;}
 const clear=(x,z)=>roads.every(r=>r.points.slice(1).every((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)>r.width/2+.35;}));
 // Filled, sampled foundations. Each face descends below the local terrain.
 function pad(x0,z0,x1,z1,top){
  for(let x=x0;x<x1;x+=.45)for(let z=z0;z<z1;z+=.45){const w=Math.min(.45,x1-x),d=Math.min(.45,z1-z),h=Math.min(heightAt(x,z),heightAt(x+w,z+d))-.18;box(x+w/2,(h+top)/2,z+d/2,w+.012,top-h,d+.012,earth);}
  const wall=(ax,az,bx,bz)=>{let n=Math.ceil(Math.hypot(bx-ax,bz-az)/.64);for(let i=0;i<n;i++){let x=ax+(bx-ax)*(i+.5)/n,z=az+(bz-az)*(i+.5)/n,h=heightAt(x,z)-.16,rows=Math.ceil((top-h)/.3);for(let j=0;j<rows;j++){const lo=h+j*(top-h)/rows,hi=h+(j+1)*(top-h)/rows;box(x,(lo+hi)/2,z,ax===bx?.22:Math.abs(bx-ax)/n-.018,hi-lo-.012,az===bz?.22:Math.abs(bz-az)/n-.018,stone[(i+j)%3]);}}};
  wall(x0,z0,x1,z0);wall(x1,z0,x1,z1);wall(x1,z1,x0,z1);wall(x0,z1,x0,z0);
  box((x0+x1)/2,top-.045,(z0+z1)/2,x1-x0,.09,z1-z0,earth);
 }
 const cx=-86.8,cz=-13.5,x0=-89.6,x1=-84,z0=-16.4,z1=-10.6;
 let floor=0;for(let x=-90;x<=-81.8;x+=.25)for(let z=-17;z<=-10.1;z+=.25)floor=Math.max(floor,heightAt(x,z));floor+=.2;
 pad(-90,-17,-81.8,-10.1,floor);
 // Floor is visibly planked inside, with a packed-earth working apron outside.
 for(let i=0;i<19;i++)box(cx,floor+.055,z0+(i+.5)*5.8/19,5.6,.11,5.8/19-.012,wood[i%5]);
 const base=floor+.11,eave=base+2.85,ridge=eave+1.38;
 for(const x of [x0,x1])for(const z of [z0,cz,z1])box(x,base+1.43,z,.2,2.86,.2,dark);
 for(const z of [z0,z1])for(const y of [base+.12,base+1.1,eave])box(cx,y,z,5.78,.16,.17,dark);
 for(const x of [x0,x1])for(const y of [base+.12,eave])box(x,y,cz,.17,.16,5.98,dark);
 // North and south gable wall boards; western wall has a framed slatted vent.
 for(const z of [z0,z1])for(let i=0;i<24;i++){let x=x0+(i+.5)*5.6/24;box(x,base+1.42,z,.221,2.77,.1,wood[(i+(z===z0?1:0))%5]);let gh=1.38*(1-Math.abs(x-cx)/2.8);box(x,eave+gh/2,z,.221,gh,.1,wood[(i+2)%5]);}
 for(let i=0;i<25;i++){let z=z0+(i+.5)*5.8/25;const vent=z>-14.5&&z<-12.5;if(vent){box(x0,base+.78,z,.1,1.46,.22,wood[i%5]);box(x0,base+2.62,z,.1,.45,.22,wood[i%5]);}else box(x0,base+1.42,z,.1,2.78,.22,wood[i%5]);
 // East doorway is open for 1.6m; boards remain complete on both sides.
 if(z<-14.8||z>-12.8)box(x1,base+1.42,z,.1,2.78,.22,wood[(i+2)%5]);else box(x1,base+2.63,z,.1,.43,.22,wood[i%5]);}
 for(const z of [-14.6,-12.4])box(x0-.075,base+1.96,z,.1,1.02,.11,dark);
 for(let y=base+1.55;y<base+2.42;y+=.15)box(x0-.075,y,cz,.12,.078,2.12,wood[3]);
 for(const z of [-14.86,-12.74])box(x1+.08,base+1.18,z,.16,2.36,.15,dark);
 box(x1+.09,base+2.37,-13.8,.18,.2,2.27,dark);
 for(const y of [base+.06,base+2.48])box(x1+.19,y,-12.97,.16,.09,3.95,dark);
 for(let i=0;i<9;i++)box(x1+.22,base+1.22,-12.6+(i+.5)*1.75/9,.11,2.33,.182,wood[(i+1)%5]);
 for(const y of [base+.25,base+2.13])box(x1+.29,y,-11.72,.075,.12,1.83,dark);
 box(x1+.31,base+1.25,-12.32,.06,.24,.085,iron);
 for(const x of [x0,x1])for(const z of [z0,z1])beam([x,base+1.93,z+(z===z0?.68:-.68)],[x,eave-.05,z],.11,dark);
 for(const z of [z0-.07,z1+.07]){beam([x0,eave,z],[cx,ridge,z],.17,dark);beam([cx,ridge,z],[x1,eave,z],.17,dark);beam([cx,eave,z],[cx,ridge,z],.15,dark);for(const s of [-1,1])beam([cx,eave+.05,z],[cx+s*1.55,eave+.6,z],.105,dark);}
 // Continuous pitched tile surfaces with individual overlaps and roll seams.
 const rx=3.35,rz=3.42,rise=1.65,angle=Math.atan2(rise,rx),slope=Math.hypot(rx,rise);
 for(const side of [-1,1]){let o=box(cx+side*rx/2,ridge-rise/2+.04,cz,slope,.13,rz*2,tile[0]);o.rotation.z=-side*angle;
  for(let iz=0;iz<24;iz++)for(let row=0;row<9;row++){const t=(row+.5)/9,x=cx+side*rx*t,y=ridge-rise*t+.14,z=cz-rz+(iz+.5)*rz*2/24;let t0=box(x,y,z,slope/9+.035,.075,rz*2/24-.018,tile[(iz+row)%3]);t0.rotation.z=-side*angle;}
  for(let iz=0;iz<=24;iz++)rod([cx,ridge+.21,cz-rz+iz*rz*2/24],[cx+side*rx,ridge-rise+.21,cz-rz+iz*rz*2/24],.037,tile[1]);
  for(let z=cz-rz;z<=cz+rz+.01;z+=.48)beam([cx,ridge-.10,z],[cx+side*rx,eave-.3,z],.095,wood[2]);
  box(cx+side*rx,eave-.24,cz,.14,.2,rz*2+.12,dark);
 }
 for(let i=0;i<21;i++){let o=mesh(new THREE.CylinderGeometry(.14,.14,.34,10,1,false,0,Math.PI),tile[1],cx,ridge+.19,cz-rz+(i+.5)*rz*2/21);o.rotation.x=Math.PI/2;}
 // Supported east lean-to canopy, with visible framing and weathered boards.
 const ax=-81.96;
 for(const z of [-16.25,-10.8]){box(ax,floor+.12,z,.38,.24,.38,stone[0]);box(ax,floor+1.3,z,.16,2.5,.16,dark);beam([ax,floor+1.73,z+.55*(z<-13?1:-1)],[ax,floor+2.48,z],.11,dark);}
 box(ax,floor+2.5,cz,.18,.19,5.85,dark);
 for(let z=-16.55;z<=-10.5;z+=.43)beam([x1-.1,eave-.27,z],[ax+.15,floor+2.48,z],.1,wood[2]);
 const aw=2.35,ar=.59;for(let j=0;j<26;j++){let o=box(-82.925,floor+2.82,-16.6+(j+.5)*6.2/26,Math.hypot(aw,ar),.085,6.2/26-.012,wood[j%5]);o.rotation.z=-Math.atan2(ar,aw);}
 for(const x of [-83.75,-82.1])box(x,floor+2.87+(x+82.925)*(-ar/aw),cz,.12,.11,6.3,dark);
 // East access descends from the founded apron to the unchanged terrain.
 for(let i=0;i<4;i++){const x=-81.56+i*.4,z=-14.05,top=floor-(i+1)*.12,w=.42;if(clear(x+w/2,z-.8)&&clear(x+w/2,z+.8)){const bot=heightAt(x,z)-.15;box(x,(top+bot)/2,z,w,Math.max(.1,top-bot),1.55,stone[i%3]);}}
 // Ground-level yard patches following sampled terrain, with sparse grit and footprints.
 for(let i=0;i<105;i++){let x=-93.5+(Math.sin(i*24.33)*.5+.5)*12.6,z=-18.5+(Math.sin(i*12.76+1)*.5+.5)*10.3;if(x>-90&&x<-81.7&&z>-17.1&&z<-10)continue;if(!clear(x,z))continue;let o=ell(x,heightAt(x,z)+.025,z,.1+(i%3)*.05,.025,.07,stone[i%3]);o.rotation.y=i;}
 function sack(x,y,z,scale=1){ell(x,y+.35*scale,z,.31*scale,.37*scale,.26*scale,sackMat);ell(x,y+.67*scale,z,.11*scale,.12*scale,.1*scale,sackMat);ring(x,y+.63*scale,z,.09*scale,.017,rope);rod([x-.05,y+.67*scale,z],[x+.1,y+.69*scale,z+.09],.013,rope);for(const a of [-1,1])rod([x+a*.25*scale,y+.12*scale,z],[x+a*.29*scale,y+.48*scale,z],.009,rope);}
 function bucket(x,y,z,s=1){const r=.25*s,h=.45*s;for(let i=0;i<14;i++){let a=i*Math.PI*2/14,o=box(x+Math.sin(a)*r,y+h/2,z+Math.cos(a)*r,.109*s,h,.045*s,wood[i%5]);o.rotation.y=a;}mesh(new THREE.CylinderGeometry(r*.88,r*.88,.045,14),wood[2],x,y+.026,z);for(const t of [.09,.36])ring(x,y+t*s,z,r+.015,.022*s,iron);let o=mesh(new THREE.TorusGeometry(r,.021*s,6,16,Math.PI),iron,x,y+h,z);box(x,y+h+r,z,.16*s,.045*s,.05*s,wood[3]);}
 function basket(x,y,z){const r=.38,h=.38;mesh(new THREE.CylinderGeometry(.25,.22,.06,20),straw,x,y+.035,z);for(let i=0;i<22;i++){let a=i*Math.PI*2/22;rod([x+Math.sin(a)*.24,y+.04,z+Math.cos(a)*.24],[x+Math.sin(a)*r,y+h,z+Math.cos(a)*r],.012,rope);}for(let i=0;i<9;i++)ring(x,y+.07+i*.036,z,.24+i*.0175,.016,straw);ring(x,y+h,z,r,.028,rope);}
 function sheaf(x,y,z,rot=0){for(let i=0;i<22;i++){let a=i*2.3999,r=.1+.1*(i%4)/4;rod([x+Math.cos(a)*r*1.6,y,z+Math.sin(a)*r*1.6],[x+Math.cos(a)*r*.75+rot,y+.95+(i%4)*.03,z+Math.sin(a)*r*.8],.016,straw);}ring(x+rot*.55,y+.5,z,.12,.026,rope);}
 // Braced storage shelves visible through the open sliding door.
 for(const x of [-88.9,-87.9])for(const z of [-15.8,-13.3])box(x,base+.92,z,.09,1.84,.09,dark);
 for(const y of [base+.22,base+.99,base+1.76]){for(let i=0;i<5;i++)box(-88.4,y,-15.8+(i+.5)*2.5/5,1.08,.07,.48,wood[i%5]);}
 beam([-88.93,base+.2,-15.8],[-88.93,base+1.8,-13.3],.07,dark);
 for(let i=0;i<5;i++)sack(-88.4,base+.26,-15.55+i*.48,.62);
 for(let i=0;i<4;i++)sack(-88.4,base+1.03,-15.5+i*.59,.67);
 for(let i=0;i<6;i++)sack(-85.2+(i%2)*.6,base,-15.8+Math.floor(i/2)*.58,.84);
 sack(-84.93,base+.57,-15.46,.84);
 // Low apron workbench, tools and grain set ready to carry to paddies.
 for(const x of [-83.6,-82.9])for(const z of [-11.7,-10.95]){box(x,floor+.48,z,.09,.96,.09,dark);}
 for(let i=0;i<4;i++)box(-83.25,floor+.99,-11.8+(i+.5)*.95/4,1.05,.10,.226,wood[i%5]);
 bucket(-82.72,floor,-15.95);bucket(-83.45,floor,-15.63,.75);basket(-82.62,floor,-12.48);
 sack(-82.65,floor,-11.1,.82);sheaf(-83.32,floor,-12.0);sheaf(-83.28,floor,-11.62,.12);
 basket(-83.25,floor+1.045,-11.3);bucket(-86.2,base,-11.4,.85);
 // Tool rail on exposed east wall: shaped metal hoes, fork and sickle.
 box(-83.72,base+1.62,-15.75,.13,.11,1.1,dark);
 for(let i=0;i<3;i++){const z=-16.1+i*.32;rod([-83.5,floor+.04,z],[-83.67,base+1.82,z],.026,wood[3]);box(-83.53,floor+.18,z+.08,.065,.26,.24,iron);}
 rod([-83.48,floor+.05,-10.9],[-83.57,base+1.96,-10.9],.028,wood[3]);box(-83.52,base+1.76,-10.9,.08,.065,.6,dark);for(let i=0;i<6;i++)rod([-83.5,base+1.77,-11.15+i*.1],[-83.5,base+1.5,-11.15+i*.1],.014,iron);
 rod([-83.05,floor+1.09,-11.62],[-83.45,floor+1.09,-11.62],.025,wood[3]);let sickle=mesh(new THREE.TorusGeometry(.18,.026,5,12,2.7),iron,-83.04,floor+1.09,-11.45);sickle.rotation.x=Math.PI/2;
 // Southern processing rack, founded feet and hanging loose rice panicles.
 const rackZ=-18.15,rackX=-86.5;for(const x of [rackX-1.8,rackX+1.8]){const y=heightAt(x,rackZ);box(x,y+.09,rackZ,.35,.18,.36,stone[0]);rod([x,y+.1,rackZ],[x,y+2.05,rackZ],.065,dark);for(const s of [-1,1])rod([x+s*.33,heightAt(x+s*.33,rackZ+.35),rackZ+.35],[x,y+1.45,rackZ],.047,wood[2]);}
 const rackY=Math.max(heightAt(rackX-1.8,rackZ),heightAt(rackX+1.8,rackZ))+1.78;
 rod([rackX-2,rackY,rackZ],[rackX+2,rackY,rackZ],.07,dark);
 for(let j=0;j<11;j++){let x=rackX-1.55+j*.31;for(let k=0;k<24;k++){const a=k*2.3999,z=rackZ+Math.cos(a)*.15,ex=x+Math.sin(a)*.135,ey=rackY-.75-(k%4)*.035;rod([x+Math.sin(a)*.035,rackY+.05,rackZ],[ex,ey,z],.012,straw);ell(ex,ey+.06,z,.033,.10,.025,straw);}ring(x,rackY-.17,rackZ,.09,.02,rope,false);}
 // Modest wind-shaped pine on the western edge, all roots follow terrain.
 const tx=-93.15,tz=-11.4,ty=heightAt(tx,tz);rod([tx,ty,tz],[tx+.23,ty+3.65,tz+.1],.16,wood[2]);
 for(let i=0;i<7;i++){let a=i*2.4,h=1.7+i*.27,l=.8+(i%3)*.26,ex=tx+.15+Math.cos(a)*l,ez=tz+Math.sin(a)*l;rod([tx+.1,ty+h-.4,tz],[ex,ty+h,ez],.06,wood[2]);for(let j=0;j<4;j++)ell(ex+Math.cos(j*2)*.34,ty+h+.15+(j%2)*.12,ez+Math.sin(j*2)*.3,.68,.27,.55,green[(i+j)%3]);}
 for(let i=0;i<6;i++){let a=i*Math.PI/3;rod([tx,ty+.13,tz],[tx+Math.cos(a)*.48,heightAt(tx+Math.cos(a)*.48,tz+Math.sin(a)*.48)+.03,tz+Math.sin(a)*.48],.047,wood[2]);}
 for(let i=0;i<70;i++){let x=-94.3+(i%10)*.28,z=-17.5+Math.floor(i/10)*1.4;if(i%4===0)x=-80.6;if(x>-91&&z>-17)continue;let y=heightAt(x,z);for(let k=0;k<5;k++)rod([x,y,z],[x+Math.sin(k*2)*.12,y+.15+(i%4)*.065,z+Math.cos(k*2)*.11],.011,green[i%3]);}
 group.userData={floorY:floor,region:district.id,laneClearance:'width/2 + .35m'};
 return group;
}
