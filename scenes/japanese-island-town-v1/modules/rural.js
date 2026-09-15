import { heightAt, roadNetwork, streamX, layout } from './root.js';

// Rural contents share ground, routes and district geometry with the root.
export function build(THREE, ctx) {
 const group=new THREE.Group(); group.name='rural-terraces-and-island-woodland';
 const district=layout(), roads=roadNetwork(), riceRect=district.rice.rect;
 let seed=84171; const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 const materials=new Map(), batches=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.92}));return materials.get(c)};
 const geometries={box:new THREE.BoxGeometry(1,1,1),rock:new THREE.DodecahedronGeometry(1,0),crown:new THREE.IcosahedronGeometry(1,1),pole:new THREE.CylinderGeometry(1,1,1,7)};
 const dummy=new THREE.Object3D();
 function inst(type,c,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=type+':'+c;if(!batches.has(key))batches.set(key,[]);dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();batches.get(key).push(dummy.matrix.clone());}
 const box=(x,y,z,w,h,d,c,ry=0)=>inst('box',c,x,y,z,w,h,d,0,ry);
 function beam(a,b,r,c){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.sub(va);dummy.position.copy(va).addScaledVector(v,.5);dummy.scale.set(r,v.length(),r);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();let key='pole:'+c;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(dummy.matrix.clone());}
 function mesh(geo,c){const m=new THREE.Mesh(geo,material(c));m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function surface(poly,y,c){const s=new THREE.Shape();poly.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));s.closePath();const ge=new THREE.ShapeGeometry(s);ge.rotateX(-Math.PI/2);ge.translate(0,y,0);return mesh(ge,c);}
 function edge(a,b,y,width,c,depth=.25){let dx=b[0]-a[0],dz=b[1]-a[1];box((a[0]+b[0])/2,y-depth/2,(a[1]+b[1])/2,Math.hypot(dx,dz),depth,width,c,-Math.atan2(dz,dx));}
 function distance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
 function roadClear(x,z,extra=2){return roads.every(r=>r.points.slice(1).every((b,i)=>distance(x,z,r.points[i],b)>r.width/2+extra));}
 function inside(poly,x,z){let ok=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))ok=!ok;}return ok;}
 // One rice tuft is seven tapered, bent individual leaves, instanced in planting rows.
 const blades=[];for(let i=0;i<7;i++){const a=i*2.3999,dx=Math.cos(a),dz=Math.sin(a),h=.6+(i%3)*.13,w=.038;let pts=[[dx*w,0,dz*w],[-dx*w,0,-dz*w],[dx*.16,h*.6,dz*.16],[dx*.30,h,dz*.30]];blades.push(...pts[0],...pts[1],...pts[2],...pts[1],...pts[3],...pts[2]);}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(blades,3));bg.computeVertexNormals();geometries.rice=bg;
 const paddies=[];
 for(let i=0;i<10;i++){
  const z0=24+i*5.8,z1=z0+5.0;
  const east=Math.min(80, i<5?78+i*.65:83-(z1-49)*.48)-.8;
  const west=49+Math.sin(i*.7)*1.4;
  const poly=[[west+.7,z0],[east-1,z0],[east,z0+.8],[east-.2,z1-.6],[east-1,z1],[west,z1],[west-.4,z0+1]];
  let y=-1e3;for(let x=west;x<east;x+=.8)for(let z=z0;z<z1;z+=.7)y=Math.max(y,heightAt(x,z));y+=.38;
  paddies.push({poly,y,z0,z1,west,east});
  surface(poly,y, i%3===0?0x82aead:0x799b87);
  // Each riser reaches below the sampled natural slope; tessellation follows the ground.
  for(let j=0;j<poly.length;j++){
   const a=poly[j],b=poly[(j+1)%poly.length],len=Math.hypot(a[0]-b[0],a[1]-b[1]),n=Math.ceil(len/.9),verts=[],inds=[];
   for(let k=0;k<=n;k++){let t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;verts.push(x,y-.05,z,x,heightAt(x,z)-.3,z);if(k){let q=2*k;inds.push(q-2,q-1,q,q-1,q+1,q);}}
   const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));ge.setIndex(inds);ge.computeVertexNormals();let wall=mesh(ge,0x777962);wall.material.side=THREE.DoubleSide;
   edge(a,b,y+.15,.63,0x82904d,.27);
   for(let k=0;k<n;k++){let t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,h=heightAt(x,z);for(let cy=h+.17;cy<y-.24;cy+=.48)inst('rock',k%3?0x8b8973:0x999581,x,cy,z,.48,.24,.31,0,rnd()*3);}
  }
  for(let z=z0+.72;z<z1-.45;z+=.68)for(let x=west+.7;x<east-.6;x+=.68)if(inside(poly,x,z))inst('rice',i%3===0?0x9caa47:0x729541,x,y+.015,z,1,.86+rnd()*.38,1,0,rnd()*.3);
  // Field inlet with stone cheeks and adjustable wooden sluice board.
  const xx=west+.1,zz=z1-1.15;
  box(xx,y+.2,zz,.22,.5,1.05,0x665b3b);box(xx-.3,y+.32,zz-.5,.2,.8,.17,0x927957);box(xx-.3,y+.32,zz+.5,.2,.8,.17,0x927957);
  edge([west-1.1,z0],[west-1.1,z1+.65],y-.02,.45,0x6c9b9a,.10);
  edge([west-1.55,z0],[west-1.55,z1+.65],y+.12,.21,0x999983,.34);
  edge([west-.68,z0],[west-.68,z1+.65],y+.12,.21,0x999983,.34);
  for(let z=z0+.3;z<z1+.65;z+=.6){let ground=heightAt(west-1.1,z)-.2,top=y-.13;box(west-1.1,(ground+top)/2,z,1.1,Math.max(.2,top-ground),.61,0x858773);}
  for(let z=z0;z<z1+.8;z+=.4){let x=west-2.55,ground=heightAt(x,z);box(x,ground+.075,z,1.2,.15,.43,0xb1a38b);}
  // A supported short flight climbs from the footpath to each bund.
  for(let k=0;k<8;k++){let t=(k+.5)/8,x=west-3.05+t*2.8,z=z0+1.1,ground=heightAt(x,z)-.1,top=heightAt(west-3.05,z)+(y+.15-heightAt(west-3.05,z))*t;box(x,(ground+top)/2,z,.36,Math.max(.2,top-ground),.75,0xa6a18b);}
 }
 // Stair-and-water links follow the terrace sequence on its western side.
 for(let i=0;i<paddies.length-1;i++){const a=paddies[i],b=paddies[i+1];const steps=Math.max(3,Math.ceil(Math.abs(a.y-b.y)/.22));for(let k=0;k<steps;k++){let t=(k+.5)/steps,x=(a.west+b.west)/2-2.5,z=a.z1+(b.z0-a.z1)*t,y=a.y+(b.y-a.y)*t;let ground=heightAt(x,z)-.13,top=y+.195;box(x,(ground+top)/2,z,1.25,Math.max(.23,top-ground),(b.z0-a.z1)/steps+.02,0xaaa28b);}
  edge([a.west-1.1,a.z1],[b.west-1.1,b.z0],Math.min(a.y,b.y),.43,0x699a97,.12);
  beam([a.west-1.1,a.y,a.z1],[b.west-1.1,b.y,b.z0],.15,0x79a9a0);
 }
 // Small field station, solid foundation, framed timber walls, full pitched roof.
 const sx=63,sz=18,sy=Math.max(heightAt(60,16),heightAt(66,20))+.25;
 box(sx,sy-.6,sz,6.8,1.3,5,0x96907a);box(sx,sy+1.6,sz,6,3.2,4.3,0x8c6943);
 for(let x=sx-2.9;x<sx+3;x+=.47)for(let z of [sz-2.2,sz+2.2])box(x,sy+1.6,z,.07,3.1,.10,0x63462e);
 for(let x of [sx-3,sx+3])for(let z of [sz-2.2,sz+2.2])box(x,sy+1.7,z,.23,3.5,.23,0x503c29);
 box(sx-.8,sy+1.22,sz-2.25,1.3,2.45,.1,0x453c2b);box(sx+1.4,sy+1.8,sz-2.28,1.2,.9,.12,0xc3b88f);
 for(let x of [sx+.85,sx+1.4,sx+1.95])box(x,sy+1.8,sz-2.36,.08,1,.09,0x624e32);
 for(let side of [-1,1]){const m=new THREE.BoxGeometry(7.2,.22,3.1);m.rotateX(side*.43);m.translate(sx,sy+3.8,sz+side*1.4);mesh(m,0x4b5350);for(let k=0;k<24;k++){const x=sx-3.5+k*.30;beam([x,sy+4.45,sz],[x,sy+3.17,sz+side*2.85],.07,0x616967);}}
 beam([sx-3.7,sy+4.48,sz],[sx+3.7,sy+4.48,sz],.16,0x68716b);
 for(const x of [sx-3,sx+3]){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute([x,sy+3.15,sz-2.2,x,sy+3.15,sz+2.2,x,sy+4.35,sz],3));ge.computeVertexNormals();const m=mesh(ge,0x81623f);m.material.side=THREE.DoubleSide;}
 // Yard, tools, firewood, rice drying trestle and bound straw bundles.
 for(let x=59;x<68;x+=.8)for(let z=13.8;z<15.7;z+=.6)box(x,heightAt(x,z)+.09,z,.82,.15,.62,0xaaa17e);
 for(let i=0;i<8;i++)beam([59.3,sy+.2+(i%3)*.25,17+i*.32],[60.1,sy+.2+(i%3)*.25,17+i*.32],.14,0x785839);
 for(let i=0;i<3;i++){let x=65+i*.47;beam([x,sy,15.6],[x+.2,sy+2.4,16.5],.05,0xb19a65);box(x,sy+.18,15.6,.32,.4,.09,0x575f59);}
 const rz=21;for(let x of [55,60]){let y=heightAt(x,rz);beam([x,y,rz-.6],[x,y+2.2,rz],.1,0x8d7049);beam([x,y,rz+.6],[x,y+2.2,rz],.1,0x8d7049);}
 const ry=Math.max(heightAt(55,rz),heightAt(60,rz))+2;beam([54.7,ry,rz],[60.3,ry,rz],.1,0x9f8051);
 for(let i=0;i<11;i++){const x=55+i*.45;inst('rock',0xb6a05b,x,ry-.55,rz,.25,.7,.27);box(x,ry-.28,rz,.36,.08,.43,0x6e6440);}
 // Private path joins the farm road near x80,z20, staying south of paddy walls.
 for(let i=0;i<23;i++){let x=66+i*.43,z=18;box(x,heightAt(x,z)+.10,z,.5,.17,1.1,0xb3a386);}
 for(let i=0;i<13;i++){let x=51+i*1.5,z=22,y=heightAt(x,z);beam([x,y,z],[x,y+1.1,z],.065,0x9b8451);if(i<12)beam([x,y+.75,z],[x+1.5,heightAt(x+1.5,z)+.75,z],.048,0x9b8451);}
 // Rocky spring basin ends the root stream ribbon at its actual source.
 const springX=streamX(65),outletY=heightAt(springX,65)+.43;
 let springY=0;for(let a=0;a<6.3;a+=.2)springY=Math.max(springY,heightAt(springX+2.5*Math.cos(a),68+2.1*Math.sin(a)));springY+=.22;
 const basin=[];for(let i=0;i<24;i++){let a=i*Math.PI/12;basin.push([springX+2.55*Math.cos(a),68+2.2*Math.sin(a)]);}surface(basin,springY,0x729e9b);
 for(let i=0;i<25;i++){let a=i*.252;if(Math.sin(a)<-.86)continue;let x=springX+2.7*Math.cos(a),z=68+2.4*Math.sin(a),y=heightAt(x,z);inst('rock',i%3?0x8b927e:0xa1a38a,x,(y+springY)/2,z,.87,Math.max(.7,Math.abs(y-springY)/2+.6),.85,0,a);}
 for(let i=0;i<9;i++){let t=i/8,z=66.05-t*1.15,y=springY+(outletY-springY)*t;box(springX,y-.13,z,1.3,.27,.25,0x77aaa3);for(const side of [-1,1])inst('rock',0x8d9484,springX+side*.95,y-.2,z,.42,.46,.4);}
 // Trees excluded from reserved districts, all roads, farm content, and stream banks.
 const rect=(x,z,r)=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3];
 function free(x,z,margin=0){if(heightAt(x,z)<1.1)return false;if(rect(x,z,[-95-margin,-76-margin,29+margin,37+margin])||rect(x,z,[-74-margin,28-margin,-18+margin,80+margin])||rect(x,z,[47-margin,-113-margin,110+margin,-42+margin]))return false;if(Math.hypot(x+61,z+80)<11+margin)return false;if(rect(x,z,[riceRect[0]-5,12,85,riceRect[3]+4]))return false;if(z>-104&&z<71&&Math.abs(x-streamX(z))<4+margin)return false;return roadClear(x,z,2+margin);}
 function pine(x,z,h){const y=heightAt(x,z),lean=(rnd()-.5)*1.8,a=rnd()*6.28;const crownColors=[0x355a42,0x416447,0x4c6d46,0x597647];beam([x,y-.2,z],[x+lean,y+h*.88,z+.5],h*.035,0x64503a);for(let l=0;l<4;l++){const yy=y+h*(.43+l*.15),spread=h*(.32-l*.038);for(let j=0;j<3;j++){let ang=a+j*2.1+l*.8,xx=x+lean*l/4+Math.cos(ang)*spread*.65,zz=z+Math.sin(ang)*spread*.65;beam([x+lean*l/4,yy-.6,z],[xx,yy+.15,zz],h*.012,0x70563b);inst('crown',crownColors[(l+j)%4],xx,yy+.25,zz,spread*(.68+rnd()*.25),h*(.07+rnd()*.025),spread*.72,0,ang);}}}
 function cherry(x,z,h){let y=heightAt(x,z);beam([x,y-.1,z],[x+.4,y+h*.73,z],.20,0x73574b);for(let j=0;j<6;j++){let a=j*2.4,r=h*.23,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,yy=y+h*(.68+rnd()*.2);beam([x,y+h*.38,z],[xx,yy,zz],.08,0x755547);inst('crown',[0xe0a2a5,0xe7b4b2,0xcea0a5][j%3],xx,yy,zz,h*.25,h*.22,h*.25,0,a);}}
 const planted=[];let pineCount=0,cherryCount=0;
 for(let attempt=0;attempt<9000&&pineCount<285;attempt++){let x=-129+rnd()*258,z=-111+rnd()*229;if(!free(x,z,1.0)||planted.some(p=>Math.hypot(x-p[0],z-p[1])<4.2))continue;let grove=.55+.25*Math.sin(x*.065+z*.033)+.18*Math.sin(z*.16);if(rnd()>grove)continue;if([[-92,42],[-17,83],[22,77],[104,-12],[-40,-91],[-100,-22]].some(p=>Math.hypot(x-p[0],z-p[1])<7.5))continue;let h=6.5+rnd()*6.8;if(z<35&&x< -15&&x> -85)h=4+rnd()*2;pine(x,z,h);planted.push([x,z]);pineCount++;}
 for(const [cx,cz] of [[-92,42],[-17,83],[22,77],[104,-12],[-40,-91],[-100,-22]])for(let j=0;j<10;j++){let a=rnd()*6.28,r=3+rnd()*12,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(!free(x,z,.3)||planted.some(p=>Math.hypot(x-p[0],z-p[1])<3))continue;cherry(x,z,4.7+rnd()*2.5);planted.push([x,z]);cherryCount++;}
 for(let i=0;i<2500;i++){let x=-126+rnd()*252,z=-107+rnd()*224;if(!free(x,z,0))continue;let y=heightAt(x,z);if(i%3===0)inst('rock',i%2?0x8d9580:0xa09f86,x,y+.25,z,.5+rnd()*.9,.3+rnd()*.5,.5+rnd(),0,rnd()*6);else if(i%3===1)inst('crown',i%2?0x6e824c:0x607b4d,x,y+.45,z,.55+rnd(),.4+rnd()*.6,.6+rnd(),0,rnd()*6);else inst('rice',0x85984f,x,y+.04,z,1.3,1.0,1.3,0,rnd()*6);}
 for(const [key,transforms] of batches){const [type,color]=key.split(':');const m=new THREE.InstancedMesh(geometries[type],material(Number(color)),transforms.length);if(type==='rice')m.material.side=THREE.DoubleSide;transforms.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=type!=='rice';m.receiveShadow=true;group.add(m);}
 group.userData={pineCount,cherryCount,paddyCount:paddies.length};
 return group;
}
