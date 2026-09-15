import {heightAt, roadNetwork, layout} from './root.js';
import {northReservations} from './north.js';
import {northCentralLayout} from './north-central.js';

export function build(THREE,ctx){
 const group=new THREE.Group();group.name='Central tea shop: wares, bench and terraced herb kitchen garden';
 const lot=northCentralLayout().find(l=>l.index===33), shell=layout().town.lots[33], roads=roadNetwork(), reservations=northReservations();
 if(!lot||shell.x!==lot.x)throw new Error('Tea shop shared lot missing');
 const palette={wood:'#79583b',plank:'#9a7953',darkwood:'#584332',iron:'#525b54',stone:'#818779',lightstone:'#a1a38c',soil:'#64553f',furrow:'#79664b',moss:'#697753',leaf:'#456b42',leaf2:'#708c54',green:'#95a46b',flower:'#d8a4af',yellow:'#bfb27a',cream:'#d8cfad',blue:'#728d94',tea:'#677c69',clay:'#a47557',water:'#688f8b',wicker:'#ae9060',rope:'#c1ac7b',dark:'#423f34',white:'#d4d4b6'};
 const mats={};for(const[k,c]of Object.entries(palette))mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:k==='blue'||k==='tea'?.48:.88});
 const geo={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,12),ball:new THREE.IcosahedronGeometry(1,1),ring:new THREE.TorusGeometry(1,.045,5,24),cone:new THREE.ConeGeometry(1,1,4)};
 const batch=new Map(),o=new THREE.Object3D();let section="counter";
 function save(g,m){let k=section+g.uuid+m;if(!batch.has(k))batch.set(k,{geo:g,mat:mats[m],xs:[],name:section});batch.get(k).xs.push(o.matrix.clone());}
 function put(g,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();save(g,m);}
 const box=(x,y,z,w,h,d,m,ry=0)=>put(geo.box,m,x,y,z,w,h,d,0,ry);
 const ball=(x,y,z,w,h,d,m)=>put(geo.ball,m,x,y,z,w,h,d);
 const cyl=(x,y,z,r,h,m)=>put(geo.cyl,m,x,y,z,r,h,r);
 const ring=(x,y,z,r,m)=>put(geo.ring,m,x,y,z,r,r,r,Math.PI/2);
 function beam(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();save(geo.cyl,m);}
 function clear(x,z,r){for(const road of roads)for(let i=1;i<road.points.length;i++){const[a,b]=[road.points[i-1],road.points[i]],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<road.width/2+r+.12)return false;}if(reservations.drains.z.some(q=>Math.abs(z-q)<reservations.drains.halfWidth+r+.05))return false;return true;}
 function topGround(x,z,w,d){return Math.max(...[-.5,0,.5].flatMap(a=>[-.5,0,.5].map(b=>heightAt(x+a*w,z+b*d))));}
 function pad(x,z,w,d){if(!clear(x,z,Math.hypot(w,d)/2))throw new Error('Tea prop road clearance');const y=topGround(x,z,w,d)+.075;const bottom=Math.min(heightAt(x-w/2,z-d/2),heightAt(x+w/2,z-d/2),heightAt(x,z))-.08;box(x,(y+bottom)/2,z,w,y-bottom,d,'stone');return y;}
 function table(x,z,w,d,h){if(!clear(x,z,Math.hypot(w,d)/2))throw new Error('Tea table road clearance');const top=topGround(x,z,w,d)+h;
  for(const dx of [-w*.4,w*.4])for(const dz of [-d*.35,d*.35]){const ground=heightAt(x+dx,z+dz)-.1;box(x+dx,(ground+top)/2,z+dz,.115,top-ground,.115,'wood');}
  for(let i=0;i<5;i++)box(x,top,z-d/2+d*(i+.5)/5,w,.095,d/5-.014,'plank');
  for(const dz of [-d*.35,d*.35]){box(x,top-.18,z+dz,w,.19,.08,'wood');beam([x-w*.39,top-.66,z+dz],[x+w*.39,top-.2,z+dz],.035,'darkwood');}
  return top+.048;
 }
 // Lathed vessels include a rim, inner wall and closed inner floor.
 const vesselGeo=new Map();
 function vessel(x,y,z,r,h,m,closed=false){const key=closed?'jar':'cup';if(!vesselGeo.has(key)){const profile=closed?[[0,0],[.65,0],[.94,.15],[1,.55],[.86,.84],[.63,.9],[.63,1],[.52,1],[.52,.88],[.72,.76],[.8,.4],[.5,.12],[0,.12]]:[[0,0],[.65,0],[.77,.12],[1,1],[.86,1],[.65,.16],[0,.16]];vesselGeo.set(key,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),20));}put(vesselGeo.get(key),m,x,y,z,r,h,r);if(closed){cyl(x,y+h+.024,z,r*.69,.045,m);ball(x,y+h+.065,z,r*.13,.045,r*.13,m);}}
 function tray(x,y,z,w,d){box(x,y+.035,z,w,.065,d,'darkwood');for(const dz of [-d/2,d/2])box(x,y+.09,z+dz,w,.1,.035,'plank');for(const dx of [-w/2,w/2])box(x+dx,y+.09,z,.035,.1,d,'plank');return y+.069;}
 function basket(x,y,z,r,h,filled=false){cyl(x,y+.035,z,r*.73,.07,'wicker');for(let j=0;j<9;j++)ring(x,y+.07+j*(h-.08)/8,z,r*(.77+.23*j/8),j%2?'wicker':'wood');for(let i=0;i<20;i++){let a=i*Math.PI/10;beam([x+Math.cos(a)*r*.75,y+.04,z+Math.sin(a)*r*.75],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.016,'wicker');}if(filled)for(let k=0;k<9;k++){let a=k*2.4,rr=r*.63*Math.sqrt(k/9);ball(x+Math.cos(a)*rr,y+h-.03+(k%2)*.055,z+Math.sin(a)*rr,r*.25,r*.25,r*.25,k%3?'green':'cream');}return y+h;}
 function barrel(x,z,r,h){const y=pad(x,z,r*1.9,r*1.9);cyl(x,y+h/2,z,r*.94,h,'wood');for(let i=0;i<16;i++){const a=i*Math.PI/8;box(x+Math.cos(a)*r*.94,y+h/2,z+Math.sin(a)*r*.94,.08,h-.04,.08,i%3?'plank':'wood');}for(const t of [.12,.45,.85])ring(x,y+h*t,z,r,'iron');for(let i=-3;i<=3;i++){const dx=i*r*.25,len=2*Math.sqrt(Math.max(0,r*r-dx*dx))*.93;box(x+dx,y+h+.035,z,r*.23,.065,len,'plank');}box(x,y+h+.08,z,r*1.6,.055,.11,'wood');return y;}
 function flowerpot(x,z,r,flowers=true){const y=pad(x,z,r*1.75,r*1.75);vessel(x,y,z,r,r*1.4,'clay');cyl(x,y+r*1.22,z,r*.79,.045,'soil');for(let i=0;i<9;i++){const a=i*2.4,xx=x+Math.cos(a)*r*.8,zz=z+Math.sin(a)*r*.8,yy=y+r*(2+i%3*.15);beam([x,y+r*1.25,z],[xx,yy,zz],.014,'leaf');ball(xx,yy-.07,zz,.10,.06,.16,'leaf2');if(flowers)for(let p=0;p<5;p++){const aa=p*Math.PI*2/5;ball(xx+.047*Math.cos(aa),yy+.03,zz+.047*Math.sin(aa),.045,.024,.045,'flower');}}}
 // Front trading counter on the west side of the 2.4 m entrance corridor.
 let x=lot.x-3.55,z=12.6,y=table(x,z,2.65,1.08,.87);
 const cupsY=tray(x-.63,y,z-.1,1.12,.73);for(let i=0;i<4;i++)for(let j=0;j<2;j++)vessel(x-1.02+i*.26,cupsY,z-.29+j*.32,.103,.17,(i+j)%3?'cream':'blue');
 const jarY=tray(x+.68,y,z+.1,1.00,.73);for(let i=0;i<3;i++){vessel(x+.34+i*.32,jarY,z+.22,.135,.34+i%2*.045,i%2?'tea':'blue',true);box(x+.34+i*.32,jarY+.2,z+.092,.11,.12,.012,'cream');}
 for(let i=0;i<3;i++){const xx=x+.36+i*.3;box(xx,jarY+.085,z-.13,.23,.17,.24,'cream');box(xx,jarY+.176,z-.13,.026,.018,.25,'rope');box(xx,jarY+.177,z-.13,.235,.018,.024,'rope');}
 // A small counter-front leaf emblem is distinct from the parent's vertical doorway sign.
 box(x,y-.25,z-.572,.49,.31,.04,'darkwood');beam([x-.13,y-.32,z-.601],[x+.12,y-.18,z-.601],.009,'cream');ball(x-.055,y-.22,z-.606,.09,.035,.012,'green');ball(x+.04,y-.28,z-.606,.08,.03,.012,'green');
 // A complete sitting bench, with level seat and four individually seated legs.
 section='bench_provisions';x=lot.x+3.55;z=12.4;y=table(x,z,2.45,.65,.47);
 for(const dx of [-1.02,1.02])box(x+dx,y+.3,z+.23,.085,.72,.085,'wood');for(const h of [.24,.47])box(x,y+h,z+.23,2.45,.15,.06,'plank');
 // Provisions on low timber skids behind the bench, clear of facade and stair.
 for(let k=0;k<3;k++){x=-28.45+k*.8;z=13.6;const yy=pad(x,z,.67,.67);box(x,yy+.04,z,.64,.08,.60,'wood');basket(x,yy+.08,z,.3,.33,true);}
 // Lidded bulk storage and nested baskets on the east service strip.
 section='side_storage';barrel(-23.45,16.5,.43,.93);barrel(-23.45,18.1,.37,.82);
 let by=pad(-23.45,19.65,.85,.85);for(let i=0;i<3;i++)basket(-23.45,by+i*.18,19.65,.34+i*.035,.34);
 section='flower_pots';flowerpot(-36.15,13.75,.27);flowerpot(-32.95,13.72,.23);flowerpot(-26.1,13.6,.24);flowerpot(-23.55,21.7,.32,false);
 // Four-sided stone light chamber, visibly open between the posts.
 section='stone_lantern';x=-23.45;z=12.7;y=pad(x,z,.66,.66);box(x,y+.1,z,.65,.20,.65,'stone');cyl(x,y+.48,z,.13,.6,'stone');box(x,y+.83,z,.5,.16,.5,'lightstone');for(const dx of [-.18,.18])for(const dz of [-.18,.18])box(x+dx,y+1.08,z+dz,.075,.38,.075,'stone');cyl(x,y+.96,z,.095,.1,'cream');box(x,y+1.31,z,.52,.10,.52,'stone');put(geo.cone,'stone',x,y+1.49,z,.49,.30,.49,0,Math.PI/4);ball(x,y+1.70,z,.09,.12,.09,'stone');
 // Retained beds: level soil contained by individually laid stone courses on a rising hillside.
 function bed(cx,cz,w,d,type){const top=topGround(cx,cz,w,d)+.18;const nx=Math.ceil(w/.46),nz=Math.ceil(d/.4);
  for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const xx=cx-w/2+(ix+.5)*w/nx,zz=cz-d/2+(iz+.5)*d/nz,low=heightAt(xx,zz)-.1;box(xx,(top+low)/2,zz,w/nx+.015,top-low,d/nz+.015,'soil');}
  for(const side of [-1,1])for(let i=0;i<nx;i++){const xx=cx-w/2+(i+.5)*w/nx,zz=cz+side*d/2,low=heightAt(xx,zz)-.12,n=Math.max(1,Math.ceil((top-low)/.22));for(let j=0;j<n;j++)box(xx,low+(j+.5)*(top-low)/n,zz,w/nx-.023,(top-low)/n-.016,.21,(i+j)%4?'stone':'lightstone');}
  for(const side of [-1,1])for(let i=0;i<nz;i++){const xx=cx+side*w/2,zz=cz-d/2+(i+.5)*d/nz,low=heightAt(xx,zz)-.12,n=Math.max(1,Math.ceil((top-low)/.22));for(let j=0;j<n;j++)box(xx,low+(j+.5)*(top-low)/n,zz,.21,(top-low)/n-.016,d/nz-.021,'stone');}
  for(let row=0;row<3;row++){const zz=cz-.43+row*.43;box(cx,top+.017,zz,w-.28,.035,.10,'furrow');for(let i=0;i<9;i++){const xx=cx-w*.41+i*w*.1025;if(type===0){for(let k=0;k<5;k++){const a=k*2.4;ball(xx+.10*Math.cos(a),top+.13,zz+.10*Math.sin(a),.13,.09,.16,k%2?'green':'leaf2');}ball(xx,top+.17,zz,.11,.13,.11,'green');}else if(type===1){for(let k=0;k<5;k++){const a=k*2.4;beam([xx,top,zz],[xx+.1*Math.cos(a),top+.44+(k%2)*.09,zz+.1*Math.sin(a)],.018,'leaf');}}else if(type===2){cyl(xx,top+.08,zz,.045,.15,'cream');for(let k=0;k<5;k++){let a=k*2.4;ball(xx+.09*Math.cos(a),top+.17,zz+.09*Math.sin(a),.05,.05,.17,'leaf2');}}else{for(let k=0;k<4;k++){let a=k*2.4;beam([xx,top,zz],[xx+.08*Math.cos(a),top+.3,zz+.08*Math.sin(a)],.014,'leaf');ball(xx+.08*Math.cos(a),top+.3,zz+.08*Math.sin(a),.1,.09,.11,'leaf2');}}}}
  // Small weathered plant marker, planted in the soil.
  box(cx+w*.39,top+.16,cz-.45,.09,.33,.045,'plank');box(cx+w*.39,top+.29,cz-.45,.22,.13,.055,'cream');return top;
 }
 section='herb_terraces';for(let row=0;row<2;row++)for(let col=0;col<2;col++)bed(col?-28.15:-34.05,row?27.22:24.7,3.8,1.38,row*2+col);
 // Rising stone access through the middle; its southern end meets the clear rear cross-path.
 section='garden_access';for(let k=0;k<12;k++){const zz=23.85+k*.38,xx=-31.15,top=topGround(xx,zz,1.05,.4)+.085,low=heightAt(xx,zz-.2)-.12;box(xx,(top+low)/2,zz,1.05,top-low,.39,k%3?'stone':'lightstone');}
 // Side working stones, water jar with open mouth, bamboo dipper and tool rest.
 for(let k=0;k<7;k++){const zz=24.0+k*.65;pad(-25.2,zz,.57,.43);}
 section='garden_tools';x=-23.9;z=25.4;y=pad(x,z,1.05,1.05);vessel(x,y,z,.49,.87,'clay');cyl(x,y+.72,z,.34,.025,'water');beam([x-.42,y+.91,z-.12],[x+.36,y+.94,z+.12],.025,'wood');vessel(x+.3,y+.87,z+.10,.095,.10,'plank');
 x=-23.75;z=27.4;y=heightAt(x,z);beam([x,y,z],[x-.13,y+1.3,z+.1],.029,'wood');box(x-.13,y+1.3,z+.1,.37,.20,.05,'iron');basket(-24.0,pad(-24,26.6,.7,.7),26.6,.32,.35,false);
 // Low split-bamboo fencing follows the slope. The south gate opens alongside the access.
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.8);let last;for(let i=0;i<=n;i++){const t=i/n,xx=a[0]+(b[0]-a[0])*t,zz=a[1]+(b[1]-a[1])*t,yy=heightAt(xx,zz);if(!clear(xx,zz,.12))throw new Error('Tea fence road clearance');box(xx,yy+.48,zz,.09,1.07,.09,'wood');if(last)for(const h of [.29,.73])beam([last[0],last[1]+h,last[2]],[xx,yy+h,zz],.035,'plank');last=[xx,yy,zz];}}
 section='garden_fence';fence([-36.6,23.85],[-32.0,23.85]);fence([-30.3,23.85],[-26.0,23.85]);fence([-36.6,23.85],[-36.6,28.65]);fence([-36.6,28.65],[-23.15,28.65]);fence([-23.15,28.65],[-23.15,23.85]);fence([-32.0,23.85],[-32.0,24.85]);
 for(const xx of [-36.4,-35.8,-24.1]){const zz=28.1;ball(xx,heightAt(xx,zz)+.12,zz,.28,.16,.22,'moss');}
 for(const b of batch.values()){const mesh=new THREE.InstancedMesh(b.geo,b.mat,b.xs.length);b.xs.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='central-tea_'+b.name;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return group;
}
