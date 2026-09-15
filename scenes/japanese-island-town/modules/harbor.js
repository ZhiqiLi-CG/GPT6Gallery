import { heightAt, layout } from './root.js';

// Working waterfront. All coordinates are metres in the shared island frame.
export function build(THREE, ctx) {
 const harbor = layout().harbor, water = harbor.waterY;
 const g = new THREE.Group(); g.name = 'Harbor — quays, eight fishing boats and working yards';
 const material = c => new THREE.MeshStandardMaterial({color:c,roughness:.89});
 const m = {wood:material('#73533c'),deck:material('#9b8060'),dark:material('#493e32'),pale:material('#b29a74'),stone:material('#727975'),mortar:material('#4e5956'),moss:material('#5d6952'),roof:material('#4a585e'),tile:material('#5f6c70'),wall:material('#9b8a6b'),rope:material('#b6a17c'),net:material('#72766b'),red:material('#8e4435'),blue:material('#3d6267'),white:material('#d1c6a4'),fish:material('#a4b2ae'),metal:material('#4b5150'),water:material('#9abfba')};
 const unit = new THREE.BoxGeometry(1,1,1);
 function mesh(geo,mat,x=0,y=0,z=0,parent=g){const a=new THREE.Mesh(geo,mat);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;}
 function box(x,y,z,w,h,d,mat=m.wood,parent=g){const a=mesh(unit,mat,x,y,z,parent);a.scale.set(w,h,d);return a;}
 function beam(a,b,r,mat=m.wood,parent=g,sides=7){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),sides),mat,...av.clone().add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function line(points,r=.025,mat=m.rope,parent=g){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*4),r,5,false),mat,0,0,0,parent);}
 function ring(x,y,z,r,mat=m.rope,parent=g,t=.035){const a=mesh(new THREE.TorusGeometry(r,t,5,20),mat,x,y,z,parent);a.rotation.x=Math.PI/2;return a;}
 function coil(x,y,z,r=.4,parent=g){for(let k=0;k<4;k++)ring(x,y+k*.035,z,r-k*.055,m.rope,parent,.026);}
 function sphere(x,y,z,r,mat,parent=g){return mesh(new THREE.SphereGeometry(r,8,6),mat,x,y,z,parent);}
 function barrel(x,y,z,r=.47,h=1.05,parent=g){mesh(new THREE.CylinderGeometry(r*.86,r*.88,h,12),m.wood,x,y+h/2,z,parent);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;beam([x+Math.cos(a)*r*.88,y+.04,z+Math.sin(a)*r*.88],[x+Math.cos(a)*r*.87,y+h-.04,z+Math.sin(a)*r*.87],.018,m.dark,parent);}for(const yy of [.15,h*.5,h-.14])ring(x,y+yy,z,r*.89,m.metal,parent,.04);mesh(new THREE.CylinderGeometry(r*.84,r*.84,.035,12),m.deck,x,y+h,z,parent);}
 function basket(x,y,z,r=.43,parent=g){mesh(new THREE.CylinderGeometry(r,r*.72,.53,12,1,true),m.pale,x,y+.265,z,parent);for(let j=0;j<5;j++)ring(x,y+.08+j*.1,z,r*(.75+j*.055),m.dark,parent,.018);for(let j=0;j<12;j++){const a=j/12*Math.PI*2;beam([x+r*.73*Math.cos(a),y,z+r*.73*Math.sin(a)],[x+r*Math.cos(a),y+.53,z+r*Math.sin(a)],.021,m.rope,parent);}ring(x,y+.54,z,r,m.rope,parent);}
 function crate(x,y,z,w=.9,parent=g){box(x,y+.045,z,w,.09,w,m.dark,parent);for(const s of [-1,1])for(let k=0;k<3;k++){box(x+s*w*.46,y+.15+k*.18,z,.08,.14,w,m.deck,parent);box(x,y+.15+k*.18,z+s*w*.46,w,.14,.08,m.deck,parent);}for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*w*.43,y+.31,z+sz*w*.43,.09,.62,.09,m.wood,parent);}
 function bollard(x,y,z){beam([x,y,z],[x,y+.64,z],.17,m.dark);beam([x-.32,y+.46,z],[x+.32,y+.46,z],.075,m.metal);coil(x,y+.1,z,.23);}
 function fish(x,y,z,s=.4,parent=g,hanging=false){const a=sphere(x,y,z,s,m.fish,parent);a.scale.set(.32,hanging?1.25:.25,hanging?.22:1.2);const tail=mesh(new THREE.ConeGeometry(s*.35,s*.5,3),m.fish,x,y+(hanging?-s*1.28:0),z+(hanging?0:-s*1.28),parent);if(!hanging)tail.rotation.x=Math.PI/2;sphere(x+s*.11,y+(hanging?s*.7:.07),z+(hanging?0:s*.7),.027,m.dark,parent);}
 function masonry(x0,z0,x1,z1,top,width=2.6){const len=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/len,dz=(z1-z0)/len;const a=box((x0+x1)/2,(top-2.3)/2,(z0+z1)/2,width,top+2.3,len,m.mortar);a.rotation.y=Math.atan2(dx,dz);const rows=Math.ceil((top+1.4)/.68),count=Math.ceil(len/1.55);for(let j=0;j<rows;j++)for(let k=0;k<count;k++){const t=(k+.5)/count,lenStone=len/count-.075;const along=(t-.5)*len+(j%2?.28:0);for(const s of [-1,1]){const x=(x0+x1)/2+dx*along+dz*s*(width/2-.08),z=(z0+z1)/2+dz*along-dx*s*(width/2-.08);const q=box(x,top-.45-j*.66,z,.32,.58,lenStone,(j+k)%11===0?m.moss:m.stone);q.rotation.y=Math.atan2(dx,dz);}}for(let k=0;k<count;k++){const t=(k+.5)/count;const q=box(x0+dx*len*t,top+.02,z0+dz*len*t,width+.15,.22,len/count-.045,m.stone);q.rotation.y=Math.atan2(dx,dz);}}
 // Quay face sits south of the road; its unobstructed apron joins the town approach.
 const quayY=3.35;
 masonry(35.5,-67.4,101.5,-67.4,quayY,3.2);
 for(let x=37;x<100;x+=5.1){box(x,quayY+.16,-68.65,.9,.13,.62,m.pale);bollard(x,quayY+.15,-68.55);}
 // Broad landward apron follows the real sampled surface, leaving the approach open.
 for(let ix=0;ix<31;ix++)for(let iz=0;iz<2;iz++){const x=36+ix*2.1,z=-65.3+iz*.95,y=Math.max(heightAt(x,z)+.11,quayY-.1);box(x,y-.12,z,2.08,.24,.94,(ix+iz)%7===0?m.deck:m.stone);}
 // Two enclosing arms and their shorter returns leave an obvious sea entrance.
 masonry(36.1,-70.5,36.1,-108.5,1.55,2.7);masonry(36.1,-108.5,57.5,-108.5,1.55,2.7);
 masonry(103.3,-68,103.3,-108.5,1.55,2.7);masonry(91,-108.5,103.3,-108.5,1.55,2.7);
 for(const [x,z,c] of [[57.5,-108.5,m.red],[91,-108.5,m.white]]){box(x,1.85,z,1.35,.45,1.35,m.stone);beam([x,2,z],[x,4.2,z],.19,c);box(x,4.1,z,.64,.65,.64,c);mesh(new THREE.ConeGeometry(.58,.35,4),m.dark,x,4.62,z).rotation.y=Math.PI/4;}
 function pier(x,end){const start=-73,deckY=1.53,w=2.6;for(let z=start;z>end;z-=.45)box(x,deckY,z,w,.18,.42,(Math.round(z*10)%3)?m.deck:m.pale);for(const s of [-1,1]){box(x+s*.96,1.22,(start+end)/2,.24,.38,start-end+.5,m.dark);for(let z=start;z>=end;z-=4.8){beam([x+s*1.05,-2.4,z],[x+s*1.05,2.05,z],.19,m.wood);mesh(new THREE.CylinderGeometry(.23,.23,.12,9),m.pale,x+s*1.05,2.06,z);beam([x+s*1.05,-.65,z],[x-s*.8,1.22,z-2.2],.085,m.wood);}}for(let z=start-3;z>end;z-=8)bollard(x+1.03,deckY+.1,z);for(let k=0;k<17;k++){const t=k/16,z=-68.9-4.15*t,y=quayY-(quayY-deckY)*t;box(x,y,z,2.55,.16,.24,m.deck);}for(const s of [-1,1]){beam([x+s*1.15,quayY-.18,-68.9],[x+s*1.15,deckY-.2,-73.1],.13,m.dark);line([[x+s*1.2,quayY+.8,-69],[x+s*1.2,2.8,-71],[x+s*1.2,deckY+.8,-73]],.045,m.rope);for(const z of [-69,-73]){const y=z===-69?quayY:deckY;beam([x+s*1.2,y,z],[x+s*1.2,y+.85,z],.065,m.wood);}}coil(x-.45,deckY+.13,end+2,.4);crate(x,deckY+.12,end+4,.65);}
 for(const [x,z] of [[45,-97],[64,-96],[84,-96]])pier(x,z);
 // Plank-built curved hulls, open interiors, thick gunwales and real fittings.
 function boat(x,z,L,W,angle,index){const b=new THREE.Group();b.position.set(x,water,z);b.rotation.y=angle;g.add(b);b.name=`Fishing boat ${index+1}`;
 const finish=[m.blue,m.wood,m.red,m.wood,m.blue,m.pale,m.wood,m.red][index];const N=20;
 const width=u=>W/2*Math.pow(Math.max(0,Math.sin(Math.PI*(.15+.85*u))),.72);
 const sheer=u=>.98+.58*Math.pow(u,5)+.2*Math.pow(1-u,5);
 const verts=[],ids=[];
 for(let i=0;i<=N;i++){const u=i/N,zz=(u-.5)*L,w=width(u),top=sheer(u);for(const [xx,yy] of [[-w,top],[-w*.78,.05],[-w*.24,-.48],[w*.24,-.48],[w*.78,.05],[w,top]])verts.push(xx,yy,zz);if(i<N)for(let j=0;j<5;j++){const a=i*6+j;ids.push(a,a+6,a+1,a+1,a+6,a+7);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();const hullmat=finish.clone();hullmat.side=THREE.DoubleSide;mesh(geo,hullmat,0,0,0,b);
 // Stern transom closes the hull; taper closes its high pointed bow.
 const sw=width(0);const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute([-sw,1.18,-L/2,-sw*.24,-.48,-L/2,sw*.24,-.48,-L/2,sw,1.18,-L/2],3));tg.setIndex([0,1,2,0,2,3]);tg.computeVertexNormals();mesh(tg,hullmat,0,0,0,b);
 for(const s of [-1,1]){line(Array.from({length:N+1},(_,i)=>[s*width(i/N),sheer(i/N)+.03,(i/N-.5)*L]),.085,m.pale,b);for(let k=1;k<4;k++)line(Array.from({length:N+1},(_,i)=>{const u=i/N;return [s*width(u)*(.76+.24*k/4),.02+(sheer(u)-.02)*k/4,(u-.5)*L];}),.021,m.dark,b);}
 for(let i=2;i<N-1;i+=2){const u=i/N,zz=(u-.5)*L,w=width(u);line([[-w*.96,sheer(u)-.06,zz],[-w*.73,.11,zz],[0,-.32,zz],[w*.73,.11,zz],[w*.96,sheer(u)-.06,zz]],.046,m.dark,b);}
 for(let i=0;i<9;i++){const zz=-L*.34+i*L*.077;box(0,.035,zz,width((zz/L)+.5)*1.4,.11,L*.071,m.deck,b);}
 for(const u of [.23,.52,.73])box(0,.72,(u-.5)*L,width(u)*1.84,.14,.44,m.pale,b);
 box(0,.51,-L*.37,W*.56,.26,L*.17,m.wood,b);box(0,.66,-L*.37,W*.6,.07,L*.18,m.deck,b);
 for(const s of [-1,1]){beam([s*W*.32,1.02,-L*.35],[s*W*.47,1.12,L*.2],.048,m.pale,b);const paddle=box(s*W*.48,1.12,L*.26,.23,.065,.9,m.pale,b);paddle.rotation.y=-s*.07;}
 beam([0,.7,-L*.48],[0,1.6,-L*.65],.065,m.dark,b);box(0,.2,-L*.54,.1,.9,.43,m.wood,b);
 coil(-.35,.83,-L*.25,.34,b);basket(.1,.11,L*.12,.36,b);for(let j=0;j<4;j++)fish(.1+Math.sin(j*2)*.14,.65,L*.12+Math.cos(j*2)*.14,.18,b);
 for(let j=0;j<5;j++)sphere(-W*.26,.32,-L*.05+j*.27,.15,j%2?m.white:m.red,b);
 // Net laid in a low bundle; intersecting strands remain visible in close view.
 for(let k=0;k<9;k++){line([[-.55+k*.11,.19,L*.27],[-.49+k*.1,.41,L*.34],[-.45+k*.095,.22,L*.4]],.016,m.net,b);line([[-.55,.21,L*(.27+k*.016)],[0,.42,L*(.28+k*.013)],[.45,.23,L*(.27+k*.016)]],.016,m.net,b);}
 if(index%3===0){beam([0,.1,-L*.12],[0,3.9,-L*.12],.065,m.wood,b);line([[0,3.7,-L*.12],[W*.35,1,L*.32]],.018,m.rope,b);box(0,3.54,-L*.12,.65,.28,.025,m.white,b);}
 // Bow and stern tied to nearest berth. Local hull transform gives exact endpoints.
 const dock=[45,45,64,64,84,84,45,84][index];for(const u of [.13,.82]){const p=new THREE.Vector3(0,sheer(u)+.05,(u-.5)*L).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(new THREE.Vector3(x,water,z));const zz=Math.max(-95,Math.min(-75,p.z));line([[p.x,p.y,p.z],[(p.x+dock)/2,.68,(p.z+zz)/2],[dock+(x<dock?-1.05:1.05),1.75,zz]],.03,m.rope);}
 }
 const boats=[[40.3,-82,10,3.1,.025],[50,-85,12.2,3.7,-.035],[59.1,-81,10.8,3.2,.03],[69,-86,12.5,3.6,-.035],[79,-81.5,10.5,3.3,.025],[89,-85.5,12.3,3.6,-.03],[50,-97.8,9.1,2.9,.08],[94.7,-99,10.3,3.3,-.22]];
 boats.forEach((a,i)=>boat(...a,i));
 // Shoreside warehouse helpers, fitted individually to the shared relief.
 function roofTileGeo(){const p=[],id=[];for(let j=0;j<2;j++)for(let i=0;i<=6;i++){const a=i/6*Math.PI,x=-.235+.47*i/6,z=j*.71;p.push(x,.075*Math.sin(a)-.58*z,z);if(!j&&i<6){const q=i;id.push(q,q+7,q+1,q+1,q+7,q+8);}}const a=new THREE.BufferGeometry();a.setAttribute('position',new THREE.Float32BufferAttribute(p,3));a.setIndex(id);a.computeVertexNormals();return a;}
 const tileGeo=roofTileGeo();m.tile.side=THREE.DoubleSide;
 function warehouse(x,z,w,d,idx){const samples=[];for(const xx of [-w/2,0,w/2])for(const zz of [-d/2,0,d/2])samples.push(heightAt(x+xx,z+zz));const floor=Math.max(...samples)+.18,low=Math.min(...samples)-.35,h=4.5;
 box(x,(floor+low)/2,z,w+.55,floor-low,d+.55,m.mortar);for(let k=0;k<Math.ceil(w/1.2);k++)box(x-w/2+(k+.5)*w/Math.ceil(w/1.2),floor-.2,z-d/2-.3,w/Math.ceil(w/1.2)-.035,.42,.25,m.stone);
 box(x,floor+h/2,z,w,h,d,m.wall);
 for(let k=0;k<=Math.round(w/.37);k++){const xx=x-w/2+k*w/Math.round(w/.37);for(const side of [-1,1])box(xx,floor+h/2,z+side*(d/2+.035),.045,h,.045,m.dark);}
 for(let k=0;k<=Math.round(d/.37);k++){const zz=z-d/2+k*d/Math.round(d/.37);for(const s of [-1,1])box(x+s*(w/2+.025),floor+h/2,zz,.045,h,.045,m.dark);}
 for(const sx of [-1,1])for(const sz of [-1,1])box(x+sx*w/2,floor+h/2,z+sz*d/2,.22,h+.1,.22,m.dark);
 for(const yy of [.18,3.6,4.45])for(const s of [-1,1]){box(x,floor+yy,z+s*(d/2+.065),w+.2,.17,.17,m.dark);box(x+s*(w/2+.065),floor+yy,z,.17,.17,d,m.dark);}
 // South sliding door and framed shutters on all other elevations.
 box(x-.8,floor+1.56,z-d/2-.1,2.7,3.1,.1,m.dark);for(let k=0;k<7;k++)box(x-2.05+k*.38,floor+1.5,z-d/2-.18,.32,2.95,.07,m.wood);box(x-.62,floor+1.5,z-d/2-.25,.09,.45,.09,m.metal);
 for(const side of [-1,1]){const xx=x+side*w*.32;box(xx,floor+2.2,z+d/2+.08,1.7,1.5,.09,m.dark);for(let j=0;j<5;j++)box(xx-.7+j*.35,floor+2.2,z+d/2+.14,.045,1.4,.05,m.pale);box(xx,floor+2.2,z-d/2-.12,1.5,1.2,.12,m.dark);for(let j=0;j<6;j++)box(xx,floor+1.7+j*.2,z-d/2-.21,1.4,.09,.08,m.wood);box(x+side*(w/2+.1),floor+2.35,z, .1,1.45,2.1,m.dark);for(let j=0;j<7;j++)box(x+side*(w/2+.16),floor+2.35,z-.9+j*.3,.07,1.4,.055,m.pale);}
 const rise=(d/2+.85)*.58,ry=floor+h+rise,hd=d/2+.85;
 for(const s of [-1,1]){const v=[-w/2-.7,ry-hd*.58,s*hd,w/2+.7,ry-hd*.58,s*hd,w/2+.7,ry,0,-w/2-.7,ry,0];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const rm=m.roof.clone();rm.side=THREE.DoubleSide;mesh(geo,rm,x,0,z);
 for(let ix=0;ix<Math.ceil((w+1.4)/.49);ix++)for(let iz=0;iz<Math.ceil(hd/.65);iz++){const tx=x-w/2-.45+ix*.49,tz=z+s*iz*.65;const tile=mesh(tileGeo,(ix+iz)%5===0?m.roof:m.tile,tx,ry+.035-iz*.65*.58,tz);if(s<0)tile.rotation.y=Math.PI;}
 box(x,floor+h-.02,z+s*hd,w+1.55,.2,.22,m.dark);for(let j=0;j<Math.floor(w/.6);j++)box(x-w/2+j*.6,floor+h-.14,z+s*(d/2+.4),.09,.17,.9,m.wood);
 }
 for(const s of [-1,1]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([x+s*w/2,floor+h,z-d/2,x+s*w/2,floor+h,z+d/2,x+s*w/2,ry,z],3));geo.setIndex([0,1,2]);geo.computeVertexNormals();const wall=m.wood.clone();wall.side=THREE.DoubleSide;mesh(geo,wall);beam([x+s*(w/2+.08),floor+h,z-d/2],[x+s*(w/2+.08),ry,z],.095,m.dark);beam([x+s*(w/2+.08),floor+h,z+d/2],[x+s*(w/2+.08),ry,z],.095,m.dark);box(x+s*(w/2+.12),floor+h+.7,z,.12,1.1,.5,m.dark);}
 beam([x-w/2-.8,ry+.11,z],[x+w/2+.8,ry+.11,z],.17,m.roof);for(let j=0;j<Math.ceil(w/.52);j++)ring(x-w/2+j*.52,ry+.12,z,.18,m.tile).rotation.z=Math.PI/2;
 // Door awning, cloth split curtains and entry steps.
 const aw=box(x-.7,floor+3.35,z-d/2-.85,3.9,.14,1.7,m.deck);aw.rotation.x=.12;for(const sx of [-1,1])beam([x-.7+sx*1.8,floor,z-d/2-1.5],[x-.7+sx*1.8,floor+3.35,z-d/2-1.5],.075,m.wood);
 for(let k=0;k<3;k++)box(x-1.85+k*.77,floor+2.92,z-d/2-.34,.72,.61,.035,idx===1?m.blue:m.white);for(let k=0;k<3;k++){const zz=z-d/2-.55-k*.46,yy=floor-.15-k*.19;box(x-.7,yy,zz,3.15,.26,.46,m.stone);}
 box(x+w*.3,floor+3.28,z-d/2-.23,1.6,.48,.11,m.pale);for(let j=0;j<3;j++){box(x+w*.3-.45+j*.42,floor+3.28,z-d/2-.3,.05,.3,.035,m.dark);box(x+w*.3-.43+j*.42,floor+3.32,z-d/2-.32,.23,.035,.03,m.dark);}
 for(let j=0;j<3;j++)barrel(x+w/2-1+j*.68,heightAt(x+w/2-1+j*.68,z-d/2-1.1)+.08,z-d/2-1.1,.31,.8);
 return floor;
 }
 const buildings=[[45.5,-51,11.5,9.1],[63.8,-50,12.8,10],[83,-47.8,12,10.4]];
 buildings.forEach((a,i)=>warehouse(...a,i));
 // Yard paving is sampled to the real terrain; paths connect work places to the clear road.
 for(const [cx,cz,w,d] of [[46,-40.7,19,6],[66,-39.5,17,5],[96,-52,7,15]])for(let x=cx-w/2;x<cx+w/2;x+=1.2)for(let z=cz-d/2;z<cz+d/2;z+=1.2)box(x,heightAt(x,z)+.025,z,1.14,.075,1.14,(Math.round(x+z)%4)?m.wall:m.stone);
 function dryingRack(x,z,w=6){const y=Math.max(heightAt(x-w/2,z),heightAt(x+w/2,z))+.08;for(const s of [-1,1]){beam([x+s*w/2,heightAt(x+s*w/2,z)-.12,z],[x+s*w/2,y+2.9,z],.095,m.wood);beam([x+s*w/2,heightAt(x+s*w/2,z-.7),z-.7],[x+s*w/2,y+1.5,z],.065,m.wood);}for(const h of [1.55,2.65]){beam([x-w/2-.25,y+h,z],[x+w/2+.25,y+h,z],.066,m.pale);for(let j=0;j<12;j++){const xx=x-w/2+.3+j*(w-.6)/11;line([[xx,y+h,z],[xx,y+h-.24,z]],.016,m.rope);fish(xx,y+h-.6,z,.29,g,true);}}}
 dryingRack(44.4,-40,6.9);dryingRack(55.2,-40,6.1);dryingRack(72.6,-39,6.8);dryingRack(96,-48,5.6);
 function netFrame(x,z){const y=Math.max(heightAt(x-2.4,z),heightAt(x+2.4,z))+.1;for(const s of [-1,1])beam([x+s*2.4,heightAt(x+s*2.4,z)-.15,z],[x+s*2.4,y+3.3,z],.085,m.wood);beam([x-2.4,y+3.2,z],[x+2.4,y+3.2,z],.07,m.wood);for(let j=0;j<=15;j++){const xx=x-2.25+j*.3;line([[xx,y+3.13,z],[xx,y+1.9,z+.15],[xx,y+.6+.2*Math.cos(j),z+.32]],.017,m.net);}for(let j=0;j<=10;j++){const yy=y+.65+j*.24;line([[x-2.25,yy,z+.2],[x,yy-.17,z+.32],[x+2.25,yy,z+.2]],.017,m.net);}for(let j=0;j<8;j++)sphere(x-2.1+j*.6,y+3.14,z,.11,j%2?m.white:m.red);}
 netFrame(93.8,-57.2);netFrame(64,-40.4);
 function table(x,z){const y=Math.max(heightAt(x-1.3,z),heightAt(x+1.3,z))+.08;for(const a of [-1,1])for(const b of [-1,1]){const bottom=heightAt(x+a*1.1,z+b*.48)-.06;box(x+a*1.1,(bottom+y+1.12)/2,z+b*.48,.11,y+1.12-bottom,.11,m.dark);}for(let j=0;j<5;j++)box(x,y+1.13,z-.55+j*.275,2.6,.1,.25,m.deck);for(let j=0;j<6;j++)fish(x-.85+j*.34,y+1.24,z,.3);basket(x+1.7,heightAt(x+1.7,z)+.06,z);}
 table(38.5,-55.5);table(55.1,-48);table(94.4,-42);
 for(const [x,z] of [[38,-48],[38.7,-49.2],[55,-55.8],[57,-55.8],[74,-54],[75.1,-54],[90.5,-50],[97,-39]]){const y=heightAt(x,z)+.06;barrel(x,y,z,.43,1.1);coil(x+.8,y+.08,z,.35);}
 for(const [x,z] of [[39,-43],[54.5,-43],[59,-42],[73,-44],[91,-44],[98,-54]]){const y=heightAt(x,z)+.1;crate(x,y,z);crate(x+1.1,heightAt(x+1.1,z)+.1,z,.8);basket(x,y+.64,z,.34);}
 // Drying yard fences, hanging floats and stacked spare planks.
 for(const [x0,x1,z] of [[35.2,59,-36.8],[62,89,-36.8]]){for(let x=x0;x<=x1;x+=2.5){const y=heightAt(x,z);beam([x,y,z],[x,y+1.15,z],.07,m.wood);if(x+2.5<=x1)for(const h of [.45,.95])beam([x,y+h,z],[x+2.5,heightAt(x+2.5,z)+h,z],.055,m.wood);}}
 for(let k=0;k<9;k++){const x=74.3+(k%3)*.28,z=-57.2,y=heightAt(x,z)+.12+Math.floor(k/3)*.17;box(x,y,z,.22,.14,3.3,m.deck);}
 // Handcart, two wheels, axle, plank bed, shafts and stacked catch crates.
 {const x=57,z=-58.2,y=heightAt(x,z);box(x,y+.68,z,1.45,.13,2.1,m.wood);for(const s of [-1,1]){const wheel=mesh(new THREE.TorusGeometry(.48,.07,6,16),m.dark,x+s*.85,y+.5,z);wheel.rotation.y=Math.PI/2;for(let k=0;k<6;k++){const a=k*Math.PI/3;beam([x+s*.85,y+.5,z],[x+s*.85,y+.5+Math.cos(a)*.44,z+Math.sin(a)*.44],.025,m.pale);}beam([x+s*.55,y+.6,z],[x+s*.55,y+.8,z-2.8],.055,m.wood);}beam([x-.92,y+.5,z],[x+.92,y+.5,z],.07,m.dark);crate(x,y+.77,z,.9);}
 // Small boat slip and launch rails at the east quay end, clear of the principal piers.
 for(const x of [96.7,98.5])beam([x,quayY,-69.1],[x,-.55,-79],.12,m.wood);for(let j=0;j<19;j++){const t=j/18;box(97.6,quayY*(1-t)-.55*t,-69.1-9.9*t,2.5,.12,.25,m.deck);}barrel(98.8,quayY+.1,-67.4,.35,.86);
 return g;
}
