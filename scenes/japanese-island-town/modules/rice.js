import { heightAt, layout } from './root.js';

export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='Rice terraces and northern farmstead';
 const mats={}; const mat=(n,c,r=0.9,m=0)=>mats[n]||(mats[n]=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m}));
 const stone=mat('stone','#777b6a'),cap=mat('cap','#93927b'),mud=mat('mud','#655e3e'),earth=mat('earth','#8b8455'),grass=mat('grass','#768253'),wood=mat('wood','#765334'),dark=mat('dark','#3d3026'),plaster=mat('plaster','#c8b993'),tile=mat('tile','#4e5c60',.75),tile2=mat('tile2','#637075',.7),straw=mat('straw','#b3a260'),bamboo=mat('bamboo','#979064'),leaf=mat('leaf','#355b3d'),pink=mat('pink','#d7a8b0'),water=mat('water','#749d8b',.33,.08),shine=mat('shine','#afc4a7',.25);
 const boxGeo=new THREE.BoxGeometry(1,1,1),stoneGeo=new THREE.DodecahedronGeometry(1,0),cylGeo=new THREE.CylinderGeometry(1,1,1,8),sphereGeo=new THREE.IcosahedronGeometry(1,1);
 const batches=new Map(),dummy=new THREE.Object3D();
 function add(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){let key=geo.uuid+m.uuid;if(!batches.has(key))batches.set(key,{geo,m,items:[]});batches.get(key).items.push([x,y,z,sx,sy,sz,rx,ry,rz]);}
 const box=(x,y,z,w,h,d,m,ry=0)=>add(boxGeo,m,x,y,z,w,h,d,0,ry,0);
 function beam(a,b,r,m){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());const e=new THREE.Euler().setFromQuaternion(dummy.quaternion);add(cylGeo,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,v.length(),r,e.x,e.y,e.z);}
 function mesh(geo,m){const o=new THREE.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function wall(x0,z0,x1,z1,top,bottom,gaps=[]){const len=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/len,dz=(z1-z0)/len,ang=-Math.atan2(dz,dx);for(let y=bottom+.2;y<top-.08;y+=.4){const shift=(Math.round(y*10)%2)*.45;for(let s=.45;s<len;s+=.88){const p=Math.min(len-.35,s+shift);if(gaps.some(([a,b])=>p>a&&p<b))continue;box(x0+dx*p,y,z0+dz*p,.79,.35,.56,stone,ang);}}for(let s=.43;s<len;s+=.85){if(gaps.some(([a,b])=>s>a&&s<b))continue;box(x0+dx*s,top,z0+dz*s,.81,.18,.72,cap,ang);}}
 // Rice clump: eight curved ribbon leaves, instanced thousands of times in regular rows.
 const pv=[],pi=[];for(let k=0;k<8;k++){const a=k*2.399,dx=Math.cos(a),dz=Math.sin(a),ht=.54+(k%3)*.1;let base=pv.length/3;for(let j=0;j<4;j++){const t=j/3,spread=.3*t*t,w=.028*(1-t)+.004;for(const side of [-1,1])pv.push(dx*spread-dz*w*side,ht*t,dz*spread+dx*w*side);}for(let j=0;j<3;j++){let n=base+j*2;pi.push(n,n+2,n+1,n+1,n+2,n+3);}}
 const riceGeo=new THREE.BufferGeometry();riceGeo.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));riceGeo.setIndex(pi);riceGeo.computeVertexNormals();
 const riceMats=['#6f8739','#829747','#587832'].map((c,i)=>{let m=mat('rice'+i,c);m.side=THREE.DoubleSide;return m;});
 const terraces=layout().rice.terraces;
 terraces.forEach((t,i)=>{
  const cx=(t.x0+t.x1)/2,cz=(t.z0+t.z1)/2,w=t.x1-t.x0;
  // All surfaces use the agreed exact stepped level; the shallow water sits above the mud.
  box(cx,t.y-.12,cz,w,.24,10,mud);
  box(cx+.7,t.y+.215,cz,w-2.8,.04,8.65,water);
  wall(t.x0,t.z0,t.x1,t.z0,t.y+.3,t.y-(i?1.45:1.1),[[.95,1.95]]);
  wall(t.x1,t.z0,t.x1,t.z1,t.y+.3,Math.min(t.y-1.4,heightAt(t.x1+.4,cz)-.1));
  wall(t.x0,t.z0,t.x0,t.z1,t.y+.3,Math.min(t.y-1.1,heightAt(t.x0-.4,cz)));
  box(cx,t.y+.22,t.z0+.42,w,.3,.65,earth);
  box(t.x1-.48,t.y+.19,cz,.66,.3,9.3,grass);
  box(t.x0+.48,t.y+.19,cz,.66,.3,9.3,earth);
  if(i===5){wall(t.x0,t.z1,t.x1,t.z1,t.y+.3,10);box(cx,t.y+.2,t.z1-.4,w,.3,.65,earth);}
  // Western stone-lined gravity canal, cascading from one bed to the next.
  box(37.5,t.y+.215,cz,.78,.04,9.7,water);
  box(36.97,t.y+.23,cz,.21,.35,9.5,cap);
  box(38.02,t.y+.23,t.z0+1,.21,.35,1.3,cap);
  box(38.02,t.y+.23,t.z0+6.2,.21,.35,7,cap);
  // Channel and gate connect directly to standing water, with raised plank access.
  const gateZ=t.z0+2.1;
  for(const z of [gateZ-.43,gateZ+.43])box(38.08,t.y+.65,z,.14,1.05,.14,wood);
  box(38.08,t.y+.29,gateZ,.12,.5,.72,wood);beam([38.08,t.y+.75,gateZ],[38.08,t.y+1.25,gateZ],.055,dark);
  box(38.08,t.y+1.25,gateZ,.45,.09,.09,wood);
  if(i>0){box(37.5,t.y-.57,t.z0+.07,.58,1.52,.12,water);for(const x of [37.04,37.96])box(x,t.y-.42,t.z0,.24,1.8,.6,stone);}
  for(let q=0;q<5;q++)box(37.5,t.y+.48,t.z0+3.15+q*.21,1.85,.12,.18,wood);
  // Stone steps on the west bund provide access between adjacent levels.
  if(i>0)for(let s=0;s<5;s++)box(39.05,t.y-1.4+(s+1)*.3-.1,t.z0-1.7+s*.37,1.1,.27,.42,cap);
  for(let z=t.z0+1.15,row=0;z<t.z1-.75;z+=.77,row++)for(let x=40.1,col=0;x<t.x1-1.05;x+=.79,col++){
   if(i===5&&x<43&&z>68)continue;
   const seed=(row*17+col*13+i*11)%29,s=.83+seed*.012;
   add(riceGeo,riceMats[(row+col+i)%3],x,t.y+.08,z,s,s,s,0,seed*.37,0);
  }
  // Glints and silt specks between planted rows make the water visible close up.
  for(let k=0;k<36;k++){const x=40.2+((k*7.17+i*2.3)%(w-6.2)),z=t.z0+1+((k*1.31)%7.8);box(x,t.y+.238,z,.19+(k%4)*.13,.007,.027,shine,.1);}
  for(let k=0;k<22;k++){const x=t.x0+2+(k*2.27)%(w-3);add(stoneGeo,stone,x,t.y+.31,t.z0+.5,.1,.065,.07,0,k,0);}
 });
 // Lined header cistern at the upper end of the channel, replenished by a rainwater spout.
 const ty=terraces[5].y;
 box(39.9,ty+.18,70.55,5.1,.32,4.2,stone);box(39.9,ty+.44,70.55,4.65,.1,3.72,water);
 for(const x of [37.35,42.45])wall(x,68.5,x,72.65,ty+.8,ty+.28);
 for(const z of [68.5,72.65])wall(37.35,z,42.45,z,ty+.8,ty+.28,z===68.5?[[0,.85]]:[]);
 box(37.5,ty+.33,68.5,.65,.12,.72,water);
 for(let k=0;k<4;k++)box(42.7+k*.48,ty+.35,71.6,.39,.18,.8,cap);
 // Terrain-following farm access stones and worked soil, avoiding the public path at x33.
 function path(points,width){for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.48);for(let k=0;k<=n;k++){let x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;box(x,heightAt(x,z)+.1,z,width,.17,.53,earth,-Math.atan2(b[0]-a[0],b[1]-a[1]));}}}
 path([[35,86],[39,81],[43,78],[54,77],[61,76],[68,75]],1.1);
 // Farmhouse: stone plinth above highest corner, complete walls and ceramic gable.
 const hx=48,hz=81,hw=10.8,hd=6.8;
 const corners=[heightAt(hx-hw/2,hz-hd/2),heightAt(hx+hw/2,hz-hd/2),heightAt(hx-hw/2,hz+hd/2),heightAt(hx+hw/2,hz+hd/2)];
 const floor=Math.max(...corners)+.3,low=Math.min(...corners)-.15;
 box(hx,(floor+low)/2,hz,hw,floor-low,hd,stone);
 for(const z of [hz-hd/2-.02,hz+hd/2+.02])wall(hx-hw/2,z,hx+hw/2,z,floor,low+.2);
 box(hx,floor+.11,hz,11,.22,7,wood);
 box(hx,floor+1.9,hz,10.55,3.6,6.6,plaster);
 for(const x of [hx-5.35,hx-2.7,hx,hx+2.7,hx+5.35])for(const z of [hz-3.36,hz+3.36])box(x,floor+1.9,z,.16,3.8,.15,dark);
 for(const z of [hz-3.4,hz+3.4]){box(hx,floor+.55,z,10.8,1.02,.13,wood);for(let x=hx-5.2;x<hx+5.3;x+=.23)box(x,floor+.55,z,.032,1.02,.035,dark);box(hx,floor+3.63,z,10.9,.22,.22,dark);}
 for(const x of [hx-5.4,hx+5.4]){for(let z=hz-3.2;z<hz+3.3;z+=.24)box(x,floor+1.9,z,.12,3.6,.21,wood);}
 // South door, sliding lattice windows on both faces and end-wall shutters.
 box(hx-1.5,floor+1.22,hz-3.49,1.5,2.42,.1,dark);
 for(let x=hx-2.15;x<hx-.8;x+=.17)box(x,floor+1.23,hz-3.56,.11,2.33,.09,wood);
 box(hx-1,floor+1.23,hz-3.64,.09,.14,.1,cap);
 function window(x,z,w){box(x,floor+2.22,z,w,1.35,.1,dark);box(x,floor+2.22,z-.06,w-.13,1.18,.07,plaster);for(let q=-w/2+.14;q<w/2;q+=.22)box(x+q,floor+2.22,z-.13,.035,1.32,.035,dark);for(const y of [1.58,2.02,2.47,2.88])box(x,floor+y,z-.13,w,.045,.04,dark);}
 window(hx+2.3,hz-3.49,2.8);window(hx-3.7,hz-3.49,1.4);window(hx,hz+3.49,3.2);
 // Full triangular gable end walls and two tiled slopes.
 const eave=floor+3.85,ridge=floor+6.25,rw=12.5,rd=8.4;
 for(const xx of [hx-hw/2,hx+hw/2]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([xx,eave,hz-hd/2,xx,eave,hz+hd/2,xx,ridge,hz],3));geo.setIndex([0,1,2,2,1,0]);geo.computeVertexNormals();mesh(geo,wood);for(const zz of [hz-2,hz-1,hz,hz+1,hz+2])beam([xx,eave,zz],[xx,ridge-Math.abs(zz-hz)*2.4/3.4,zz],.055,dark);}
 const slope=Math.atan2(ridge-eave,rd/2),slen=Math.hypot(rd/2,ridge-eave);
 for(const side of [-1,1]){add(boxGeo,tile,hx,(ridge+eave)/2,hz+side*rd/4,rw,.16,slen,side*slope,0,0);
  for(let x=hx-rw/2+.12;x<hx+rw/2;x+=.31)for(let j=0;j<9;j++){const t=(j+.5)/9,z=hz+side*t*rd/2,y=ridge-t*(ridge-eave)+.13;add(cylGeo,(j+Math.round(x*3))%3?tile:tile2,x,y,z,.098,slen/9+.045,.098,Math.PI/2+side*slope,0,0);}
  beam([hx-rw/2,eave,hz+side*rd/2],[hx+rw/2,eave,hz+side*rd/2],.12,dark);
 }
 for(let x=hx-rw/2;x<hx+rw/2;x+=.32){add(cylGeo,tile2,x,ridge+.16,hz,.18,.34,.18,0,0,Math.PI/2);}
 // Clay stove flue with a rain cap and a bamboo roof-water collector to the header pond.
 box(hx+2,ridge-.2,hz+1, .46,1.4,.46,stone);box(hx+2,ridge+.57,hz+1,.68,.14,.68,tile);
 beam([42,eave-.13,76.8],[51,eave-.13,76.8],.11,bamboo);
 beam([42,eave-.13,76.8],[40,ty+1.1,71.5],.14,bamboo);
 for(const [x,z] of [[41.5,75.5],[40.5,72.8]])beam([x,heightAt(x,z),z],[x,ty+1.2+(z-71.5)*.25,z],.065,wood);
 // Raised porch and steps, all posts anchored to the terrain.
 for(let x=hx-4.8;x<hx+4.9;x+=.24)box(x,floor+.08,hz-4.1,.215,.17,1.4,wood);
 for(const x of [hx-4.8,hx+4.8]){const ground=heightAt(x,hz-4.5);box(x,(floor+ground)/2,hz-4.5,.2,floor-ground,.2,dark);}
 for(let s=0;s<4;s++)box(hx-1.5,floor-.7+s*.19,hz-5.5+s*.32,1.9,.24,.4,cap);
 // Attached tool shelter east of the farmhouse.
 const sx=57,sz=81,sy=Math.max(heightAt(55,79),heightAt(59,83))+.24;
 box(sx,sy-.3,sz,5,.6,5,earth);
 for(const x of [54.8,59.2])for(const z of [78.8,83.2])box(x,sy+1.45,z,.18,2.9,.18,wood);
 add(boxGeo,wood,sx,sy+3.05,sz,5.5,.18,5.8,-.13,0,0);
 for(let x=54.3;x<59.8;x+=.27)add(boxGeo,tile2,x,sy+3.18,sz,.23,.11,5.8,-.13,0,0);
 for(let x=54.9;x<59.3;x+=.22)box(x,sy+1.45,83.2,.19,2.85,.12,wood);
 for(let z=79;z<83.2;z+=.8){beam([54.8,sy+.2,z],[54.8,sy+2.55,z+.3],.035,bamboo);box(54.8,sy+.22,z,.5,.16,.11,dark);}
 // Woven baskets, rope hoops and bundled harvested straw.
 function basket(x,y,z,r=.4){add(new THREE.CylinderGeometry(r*.95,r*.72,.65,12,1,true),straw,x,y+.325,z);for(let j=0;j<5;j++){const o=mesh(new THREE.TorusGeometry(r*(.75+j*.05),.027,5,16),wood);o.rotation.x=Math.PI/2;o.position.set(x,y+.08+j*.13,z);}for(let a=0;a<12;a++){const t=a/12*Math.PI*2;beam([x+Math.cos(t)*r*.75,y+.02,z+Math.sin(t)*r*.75],[x+Math.cos(t)*r*.96,y+.64,z+Math.sin(t)*r*.96],.016,wood);}}
 for(const [x,z,r] of [[56,80,.48],[57,79.5,.4],[58.2,82,.52],[45,76.4,.38],[49.5,76.3,.32]])basket(x,x>54?sy+.02:heightAt(x,z)+.1,z,r);
 function bundle(x,y,z,s=1){add(new THREE.ConeGeometry(.42,1.5,9),straw,x,y+.75*s,z,s,s,s);for(let k=0;k<9;k++){const a=k*.7;beam([x+Math.cos(a)*.4*s,y,z+Math.sin(a)*.4*s],[x+Math.cos(a)*.1*s,y+1.35*s,z+Math.sin(a)*.1*s],.028,earth);}const o=mesh(new THREE.TorusGeometry(.21*s,.035,5,14),wood);o.rotation.x=Math.PI/2;o.position.set(x,y+.78*s,z);}
 for(let i=0;i<8;i++)bundle(55.6+(i%4)*.75,sy,81.8+Math.floor(i/4)*.75,.85);
 for(const [x,z] of [[66,64.4],[77,34.4],[83,14.4]]){const y=heightAt(x,z)+.35;for(const d of [-1.3,1.3]){beam([x+d,y,z-.35],[x+d,y+2,z],.065,wood);beam([x+d,y,z+.35],[x+d,y+2,z],.065,wood);}beam([x-1.6,y+1.65,z],[x+1.6,y+1.65,z],.07,wood);for(let j=0;j<6;j++)bundle(x-1.15+j*.45,y+.35,z,.65);}
 for(let i=0;i<16;i++)add(cylGeo,wood,59,sy+.15+Math.floor(i/4)*.22,80+(i%4)*.23,.105,.95,.105,0,0,Math.PI/2);
 // Low split-bamboo yard fence, with an open entrance to the porch.
 function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5);let last=null;for(let j=0;j<=n;j++){const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n,y=heightAt(x,z);box(x,y+.6,z,.085,1.2,.085,bamboo);if(last)for(const h of [.42,.94])beam([last[0],last[1]+h,last[2]],[x,y+h,z],.038,bamboo);last=[x,y,z];}}
 fence([40,77],[40,87]);fence([40,87],[58,87]);fence([58,87],[61,84]);fence([40,77],[44,77]);
 // Garden beds and low vegetation on unused margins, fitted individually to relief.
 for(let row=0;row<5;row++)for(let j=0;j<12;j++){const x=62+row*.66,z=77+j*.44,y=heightAt(x,z);box(x,y+.055,z,.48,.09,.39,mud);add(sphereGeo,leaf,x,y+.24,z,.23,.21,.25);}
 function tree(x,z,s,cherry=false){const y=heightAt(x,z);beam([x,y,z],[x+.2*s,y+4.6*s,z],.17*s,wood);for(let k=0;k<6;k++){let a=k*2.4,xx=x+Math.cos(a)*(1+(k%2)*.55)*s,zz=z+Math.sin(a)*(1+(k%2)*.55)*s,yy=y+(3.2+k*.35)*s;beam([x,y+2.3*s,z],[xx,yy,zz],.07*s,wood);add(sphereGeo,cherry?pink:leaf,xx,yy,zz,1.35*s,(cherry?.85:.48)*s,1.2*s,0,a,0);if(cherry)for(let b=0;b<3;b++)add(sphereGeo,pink,xx+Math.cos(b*2)*s*.7,yy+.2*s,zz+Math.sin(b*2)*s*.7,.7*s,.5*s,.7*s);}}
 for(const [x,z,s,c] of [[39,89,1,1],[58,88,.85,0],[68,80,.8,0],[78,72,.85,1],[85,62,.8,0],[91,43,.85,0],[92,25,.75,1],[88,13,.7,0],[43,91,.7,1],[68,88,.65,0]])if(heightAt(x,z)>3)tree(x,z,s,!!c);
 for(let k=0;k<270;k++){const x=35.7+((k*7.337)%59),z=14+((k*13.719)%77);if(heightAt(x,z)<3)continue;if(terraces.some(t=>x>=t.x0-1&&x<=t.x1+1&&z>=t.z0-1&&z<=t.z1+1))continue;if(x>39&&x<67&&z>75&&z<89)continue;const y=heightAt(x,z);add(sphereGeo,k%5?grass:leaf,x,y+.24,z,.28+(k%3)*.12,.28,.36);if(k%4===0)add(stoneGeo,stone,x+.3,y+.12,z,.28,.17,.23);}
 // Instance batches keep the dense planting and masonry inexpensive to compose.
 for(const {geo,m,items} of batches.values()){const im=new THREE.InstancedMesh(geo,m,items.length);for(let i=0;i<items.length;i++){const [x,y,z,sx,sy,sz,rx,ry,rz]=items[i];dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);}im.castShadow=true;im.receiveShadow=true;g.add(im);}
 return g;
}
