import { heightAt, roadNetwork, layout } from './root.js';

// This module owns only furnishings, garden planting and enclosures of the southern pair.
export function build(THREE, ctx) {
 const g=new THREE.Group();g.name='Southern central provisions shop and timber work yard';
 const palette={wood:'#806044',lightwood:'#a28357',darkwood:'#4c392b',bamboo:'#a49666',rope:'#c0aa7d',iron:'#474c47',stone:'#899084',moss:'#657a55',soil:'#665541',leaf:'#526b39',leaflight:'#8b9e5e',pine:'#334f3c',pine2:'#435f43',radish:'#ddd6b3',fruit:'#bd783d',red:'#994d38',clay:'#94654e',jar:'#667665',inside:'#352f26',tile:'#626b69',cut:'#b49a6a',bark:'#61503c',cream:'#b9b194'};
 const mats={};Object.entries(palette).forEach(([k,c])=>mats[k]=new THREE.MeshStandardMaterial({color:c,roughness:.9}));
 const cube=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12),ball=new THREE.SphereGeometry(1,10,7),cone=new THREE.CylinderGeometry(.32,1,1,10),rock=new THREE.DodecahedronGeometry(1,1),batches=new Map(),dummy=new THREE.Object3D();
 const H=(x,z)=>heightAt(x,z)+.08;
 const lots=layout().town.lots.filter(l=>l.z===-32&&(l.x===-43||l.x===-31));
 if(lots.length!==2||!roadNetwork().find(r=>r.id==='market-middle'))throw new Error('Missing shared southern central lots or road');
 function add(geo,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){let k=geo.uuid+m;if(!batches.has(k))batches.set(k,{geo,m,items:[]});dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();batches.get(k).items.push(dummy.matrix.clone());}
 function box(x,y,z,w,h,d,m='wood',rx=0,ry=0,rz=0){add(cube,m,x,y,z,w,h,d,rx,ry,rz);}
 function beam(a,b,r,m='wood',round=false){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dv=bv.clone().sub(av),geo=round?cyl:cube,k=geo.uuid+m;if(!batches.has(k))batches.set(k,{geo,m,items:[]});dummy.position.copy(av.add(bv).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dv.clone().normalize());dummy.scale.set(round?r:r*2,dv.length(),round?r:r*2);dummy.updateMatrix();batches.get(k).items.push(dummy.matrix.clone());}
 const rings=new Map();
 function ring(x,y,z,r,t,m='iron',rx=Math.PI/2,ry=0){const key=r+' '+t;if(!rings.has(key))rings.set(key,new THREE.TorusGeometry(r,t,5,20));add(rings.get(key),m,x,y,z,1,1,1,rx,ry);}
 function stone(x,z,s=.3){add(rock,'stone',x,H(x,z)+.055,z,s,.10,s*.8,0,x+z,0);}
 function fence(a,b,style='bamboo'){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/1.35),height=style==='bamboo'?1.03:.92;
  for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=H(x,z);beam([x,y-.08,z],[x,y+height+.10,z],.065,style==='bamboo'?'bamboo':'darkwood',style==='bamboo');if(style==='bamboo')for(const h of [.34,.79])ring(x,y+h,z,.07,.021,'rope');}
  for(let i=0;i<n;i++){const p=[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n],q=[a[0]+(b[0]-a[0])*(i+1)/n,a[1]+(b[1]-a[1])*(i+1)/n];for(const h of [.3,.78])beam([p[0],H(...p)+h,p[1]],[q[0],H(...q)+h,q[1]],.045,style==='bamboo'?'bamboo':'wood',style==='bamboo');}
  const count=Math.floor(length/(style==='bamboo'?.25:.30));for(let i=0;i<count;i++){const t=(i+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;beam([x,H(x,z)+.10,z],[x,H(x,z)+(style==='bamboo'?.91:.86),z],style==='bamboo'?.022:.047,style==='bamboo'?'bamboo':i%3?'wood':'lightwood',style==='bamboo');}
 }
 // An open market entrance and side access, with a low bamboo enclosure.
 fence([-52.48,-37.57],[-52.48,-25.08]);fence([-52.48,-37.57],[-37.05,-37.57]);
 fence([-52.48,-25.08],[-51.7,-25.08]);fence([-48.5,-25.08],[-44.45,-25.08]);fence([-41.55,-25.08],[-37.05,-25.08]);
 fence([-37.05,-37.57],[-37.05,-28.9]);
 fence([-44.48,-25.10],[-44.7,-26.25]);fence([-41.52,-25.10],[-41.3,-26.17]);
 // The domestic enclosure is sawn timber, with both front and east work-yard openings.
 fence([-36.7,-37.57],[-21.5,-37.57],'wood');fence([-21.5,-37.57],[-21.5,-29.4],'wood');fence([-21.5,-27.9],[-21.5,-25.08],'wood');
 fence([-36.7,-25.08],[-32.45,-25.08],'wood');fence([-29.55,-25.08],[-21.5,-25.08],'wood');
 fence([-32.48,-25.10],[-32.68,-26.18],'wood');fence([-29.52,-25.10],[-29.32,-26.18],'wood');
 function tray(x,y,z,w,d){for(let i=0;i<6;i++)box(x-w/2+(i+.5)*w/6,y,z,w/6-.025,.06,d,'lightwood');for(const zz of [-1,1])for(const h of [.08,.22])box(x,y+h,z+zz*d/2,w+.07,.085,.065,'wood');for(const xx of [-1,1])for(const h of [.08,.22])box(x+xx*w/2,y+h,z,.065,.085,d,'wood');for(const xx of [-1,1])for(const zz of [-1,1])box(x+xx*(w/2-.025),y+.13,z+zz*(d/2-.02),.07,.32,.07,'darkwood');}
 function cabbage(x,y,z,r=.17){add(ball,'leaflight',x,y+r*.65,z,r,r*.82,r);for(let i=0;i<7;i++){const a=i*2.399;add(ball,i%2?'leaf':'leaflight',x+Math.cos(a)*r*.57,y+r*.5+(i%2)*.04,z+Math.sin(a)*r*.57,r*.73,r*.35,r*.55,.35,a,.25);}for(let i=0;i<3;i++)beam([x-.05+i*.04,y+r*1.47,z-r*.5],[x-.06+i*.05,y+r*1.53,z+r*.4],.008,'cream');}
 function radish(x,y,z,a=0){add(ball,'radish',x,y+.09,z,.07,.072,.23,0,a,.04);const dx=Math.sin(a),dz=Math.cos(a);beam([x-dx*.14,y+.08,z-dz*.14],[x-dx*.31,y+.06,z-dz*.31],.013,'radish',true);for(let i=0;i<4;i++)add(ball,'leaf',x+dx*.20+Math.cos(i*2)*.06,y+.11+(i%2)*.025,z+dz*.20+Math.sin(i*2)*.06,.055,.025,.16,.2,a+i*.7,0);}
 function counter(x,z,w,kind){const y=Math.max(H(x-w/2,z),H(x+w/2,z))+.94;for(const dx of [-w/2+.13,w/2-.13])for(const dz of [-.36,.36]){const floor=H(x+dx,z+dz);box(x+dx,(floor+y)/2,z+dz,.105,y-floor,.105,'darkwood');}for(const dz of [-.35,.35])box(x,y-.36,z+dz,w,.11,.09,'wood');for(let j=0;j<5;j++)box(x,y,z-.46+j*.23,w,.09,.205,j%2?'wood':'lightwood');
  const tw=(w-.22)/2;for(const side of [-1,1]){const xx=x+side*(w/4);tray(xx,y+.07,z,tw,.77);for(let a=0;a<3;a++)for(let b=0;b<2;b++){const px=xx-tw*.3+a*tw*.3,pz=z-.19+b*.36;if(kind==='veg'&&side<0)cabbage(px,y+.16,pz,.15);else if(kind==='veg')radish(px,y+.20,pz,Math.PI/2+.12*a);else{add(ball,(a+b)%4?'fruit':'red',px,y+.25,pz,.105,.10,.105);if((a+b)%2===0)add(ball,'fruit',px+.06,y+.40,pz,.09,.09,.09);beam([px,y+.32,pz],[px+.012,y+.39,pz],.008,'darkwood');}}}
 }
 counter(-46.20,-26.95,2.55,'veg');counter(-39.58,-26.95,2.45,'fruit');
 function barrel(x,z,r=.4,h=.95){const y=H(x,z);add(cyl,'darkwood',x,y+h*.5,z,r*.89,h,r*.89);for(let i=0;i<16;i++){const a=i*Math.PI/8;box(x+Math.sin(a)*r*.91,y+h*.5,z+Math.cos(a)*r*.91,r*.345,h,.055,i%3?'wood':'lightwood',0,a,0);}for(const f of [.12,.33,.76,.9])ring(x,y+h*f,z,r*.95,.029);for(let i=-2;i<=2;i++){const dx=i*r*.32,len=2*Math.sqrt(Math.max(0,r*r*.81-dx*dx));box(x+dx,y+h+.012,z,r*.30,.045,len,'lightwood');}box(x+.12,y+h+.045,z,.13,.055,.1,'darkwood');}
 barrel(-48.85,-29.20,.39,.99);barrel(-49.65,-29.65,.34,.80);
 const jarGeo=new THREE.LatheGeometry([new THREE.Vector2(.0,0),new THREE.Vector2(.58,.02),new THREE.Vector2(.82,.18),new THREE.Vector2(.9,.48),new THREE.Vector2(.71,.76),new THREE.Vector2(.45,.88),new THREE.Vector2(.43,1),new THREE.Vector2(.33,1),new THREE.Vector2(.34,.84),new THREE.Vector2(.62,.70),new THREE.Vector2(.73,.45),new THREE.Vector2(.60,.14),new THREE.Vector2(0,.11)],16);
 function jar(x,z,r=.24,h=.55,m='clay',lid=false,base=null){const y=base===null?H(x,z):base;add(jarGeo,m,x,y,z,r,h,r);if(lid){add(cyl,'lightwood',x,y+h+.02,z,r*.52,.055,r*.52);add(ball,'darkwood',x,y+h+.066,z,.035,.03,.035);}else ring(x,y+h,z,r*.39,.024,m);}
 // Provisions shelf on the shop's right, well beside the stair route.
 const shelfY=H(-38.25,-28.0)+.58;box(-38.25,shelfY,-28.0,1.05,.08,.43,'wood');for(const dx of [-.42,.42])box(-38.25+dx,shelfY-.28,-28.0,.08,.56,.32,'darkwood');for(let i=0;i<4;i++)jar(-38.64+i*.25,-28.0,.135,.27+(i%2)*.07,i%2?'clay':'jar',true,shelfY+.04);
 function basket(x,z,r=.35,h=.45,base=null){const y=base===null?H(x,z):base;add(cyl,'inside',x,y+.04,z,r*.65,.08,r*.65);for(let j=0;j<9;j++){const t=j/8;ring(x,y+.07+t*(h-.07),z,r*(.72+t*.28),.017,j%2?'rope':'bamboo');}for(let i=0;i<18;i++){const a=i*Math.PI/9;beam([x+Math.sin(a)*r*.7,y+.03,z+Math.cos(a)*r*.7],[x+Math.sin(a)*r,y+h,z+Math.cos(a)*r],.014,'bamboo',true);}ring(x,y+h,z,r,.027,'rope');for(const a of [-1,1]){beam([x+a*r*.8,y+h*.6,z],[x+a*(r+.08),y+h+.17,z],.023,'rope',true);beam([x+a*(r+.08),y+h+.17,z],[x+a*r*.5,y+h,z],.023,'rope',true);}}
 basket(-45.05,-28.03,.28,.4);basket(-40.8,-28.06,.30,.48);for(let i=0;i<4;i++)radish(-40.93+i*.08,H(-40.8,-28.06)+.37,-28.06+i*.015,1.25);
 // Handcart with board bed, axle, ten spokes per wheel, pegged rails and two long shafts.
 const cx=-50.58,cz=-27.75,cy=Math.max(H(-51.25,cz),H(-49.9,cz))+.53;
 for(let i=0;i<6;i++)box(cx-.52+i*.208,cy,cz,.19,.09,1.48,'lightwood');
 beam([cx-.89,cy-.13,cz-.13],[cx+.89,cy-.13,cz-.13],.075,'iron',true);
 for(const side of [-1,1]){const wx=cx+side*.77,wy=cy-.10,wz=cz-.13;ring(wx,wy,wz,.47,.055,'darkwood',0,Math.PI/2);ring(wx,wy,wz,.48,.018,'iron',0,Math.PI/2);beam([wx-.09,wy,wz],[wx+.09,wy,wz],.11,'wood',true);for(let i=0;i<10;i++){const a=i*Math.PI/5;beam([wx,wy,wz],[wx,wy+Math.sin(a)*.43,wz+Math.cos(a)*.43],.022,'lightwood');}for(const zz of [-.66,.66])box(cx+side*.57,cy+.27,cz+zz,.07,.61,.075,'darkwood');for(const hh of [.15,.39])box(cx+side*.57,cy+hh,cz, .065,.105,1.49,'wood');beam([cx+side*.47,cy-.02,cz+.4],[cx+side*.47,cy+.06,cz+2.13],.05,'wood');}
 for(const hh of [.15,.39])box(cx,cy+hh,cz-.71,1.18,.105,.065,'wood');beam([cx,cy-.05,cz+.7],[cx,H(cx,cz+1.0),cz+1.0],.047,'darkwood');basket(cx-.15,cz-.12,.30,.39,cy+.08);cabbage(cx-.18,cy+.33,cz-.1,.22);
 function bed(x,z,w,d){const nx=4,nz=8,verts=[],ids=[];for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let xx=x-w/2+i*w/nx,zz=z-d/2+j*d/nz;verts.push(xx,H(xx,zz)+.06,zz);if(i<nx&&j<nz){let k=j*(nx+1)+i;ids.push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ids);geo.computeVertexNormals();let mesh=new THREE.Mesh(geo,mats.soil);mesh.receiveShadow=true;g.add(mesh);for(const side of [-1,1])beam([x+side*w/2,H(x+side*w/2,z-d/2)+.09,z-d/2],[x+side*w/2,H(x+side*w/2,z+d/2)+.09,z+d/2],.045,'wood');for(let j=0;j<5;j++)for(let i=0;i<2;i++){const xx=x+(i-.5)*w*.43,zz=z-d*.38+j*d*.19;cabbage(xx,H(xx,zz)+.06,zz,.17);}}
 bed(-51.58,-31.73,1.02,2.54);bed(-49.86,-32.02,1.02,2.25);
 for(let i=0;i<6;i++)stone(-50.71,-30.55-i*.48,.23);
 // Trained pine has a bent trunk, exposed branch forks and separated needle pads.
 const px=-50.75,pz=-35.55,py=H(px,pz);
 beam([px,py-.08,pz],[px+.24,py+1.6,pz+.10],.16,'bark',true);beam([px+.24,py+1.6,pz+.10],[px-.1,py+2.9,pz+.16],.10,'bark',true);beam([px-.1,py+2.9,pz+.16],[px+.25,py+3.65,pz+.2],.065,'bark',true);
 for(const [dx,dz,dy,r] of [[-.67,.30,2.15,.72],[.69,.1,2.60,.70],[-.38,-.53,3.12,.76],[.15,.17,3.72,.60]]){beam([px+.12,py+dy-.6,pz+.1],[px+dx,py+dy,pz+dz],.055,'bark',true);for(let i=0;i<7;i++){const a=i*2.399;add(rock,i%3?'pine':'pine2',px+dx+Math.cos(a)*r*.38,py+dy+(i%3)*.07,pz+dz+Math.sin(a)*r*.37,r*.61,.24,r*.58,0,a,0);}}
 for(let i=0;i<5;i++){const a=i*1.25;add(rock,'moss',px+Math.cos(a)*.38,py+.02,pz+Math.sin(a)*.36,.25,.11,.20);}
 const lx=-49.03,lz=-35.68,ly=H(lx,lz);box(lx,ly+.10,lz,.68,.20,.68,'stone');add(cyl,'stone',lx,ly+.27,lz,.23,.2,.23);add(cyl,'stone',lx,ly+.66,lz,.105,.65,.105);box(lx,ly+1.0,lz,.49,.14,.49,'stone');for(const dx of [-.19,.19])for(const dz of [-.19,.19])box(lx+dx,ly+1.23,lz+dz,.085,.36,.085,'stone');add(ball,'cream',lx,ly+1.21,lz,.085,.12,.085);add(cone,'stone',lx,ly+1.49,lz,.43,.23,.43,0,Math.PI/4,0);add(ball,'moss',lx,ly+1.67,lz,.105,.12,.105);
 // Low storage occupies the middle strip beneath eaves, with nothing overhead.
 tray(-37.02,H(-37.02,-33.0)+.08,-33.0,.68,1.13);for(let j=0;j<5;j++)box(-37.02,H(-37.02,-33)+.16+j*.09,-33,.60,.07,1.02,'lightwood');
 // A complete small timber shed on the east shoulder: fitted piers, plank floor,
 // three boarded sides, front door and window, gable infill and a sealed shingle roof.
 const sx=-23.47,sz=-34.86,sw=2.62,sd=2.55;
 const floor=Math.max(...[-sw/2,sw/2].flatMap(dx=>[-sd/2,sd/2].map(dz=>H(sx+dx,sz+dz))))+.23,eh=floor+1.98,rh=eh+.69;
 for(const dx of [-sw/2+.14,sw/2-.14])for(const dz of [-sd/2+.12,sd/2-.12]){const ground=H(sx+dx,sz+dz);box(sx+dx,(ground+floor)/2,sz+dz,.31,floor-ground+.1,.31,'stone');box(sx+dx,(floor+eh)/2,sz+dz,.105,eh-floor,.105,'darkwood');}
 for(let i=0;i<10;i++)box(sx-sw/2+(i+.5)*sw/10,floor,sz,sw/10-.018,.11,sd,'wood');
 for(const side of [-1,1])for(let j=0;j<11;j++)box(sx+side*sw/2,floor+1.0,sz-sd/2+(j+.5)*sd/11,.095,1.99,sd/11-.018,j%3?'wood':'lightwood');
 for(let i=0;i<12;i++){const xx=sx-sw/2+(i+.5)*sw/12;box(xx,floor+1.0,sz-sd/2,sw/12-.014,1.99,.085,i%3?'wood':'lightwood');}
 // Front has a full narrow door on its west half and a framed window on the east.
 box(sx, floor+1.0,sz+sd/2,sw,1.99,.08,'darkwood');
 for(let i=0;i<5;i++)box(sx-.74+i*.17,floor+.86,sz+sd/2+.065,.157,1.65,.075,'lightwood');for(const yy of [.25,1.48])box(sx-.4,floor+yy,sz+sd/2+.12,.82,.085,.04,'wood');beam([sx-.78,floor+.30,sz+sd/2+.15],[sx-.02,floor+1.43,sz+sd/2+.15],.028,'wood');add(ball,'iron',sx-.07,floor+.84,sz+sd/2+.16,.035,.035,.04);
 box(sx+.62,floor+1.18,sz+sd/2+.06,.75,.66,.06,'cream');for(let i=0;i<4;i++)box(sx+.29+i*.22,floor+1.18,sz+sd/2+.1,.035,.7,.06,'wood');for(const yy of [.83,1.18,1.53])box(sx+.62,floor+yy,sz+sd/2+.12,.79,.045,.06,'wood');
 for(const side of [-1,1])for(let i=0;i<12;i++){const xx=-sw/2+(i+.5)*sw/12,hh=.69*(1-Math.abs(xx)/(sw/2));box(sx+xx,eh+hh/2,sz+side*sd/2,sw/12+.005,hh,.085,'wood');}
 const rr=sw/2+.18, rise=.69, angle=Math.atan(rise/rr);for(const side of [-1,1]){box(sx+side*rr/2,eh+rise/2,sz,Math.hypot(rr,rise),.075,sd+.33,'darkwood',0,0,-side*angle);for(let row=0;row<6;row++)for(let col=0;col<10;col++){const xx=.10+(rr-.14)*row/5;box(sx+side*xx,rh-xx*rise/rr+.075,sz-(sd+.32)/2+(col+.5)*(sd+.32)/10,.34,.045,.27,(row+col)%3?'tile':'stone',0,0,-side*angle);}}
 box(sx,rh+.11,sz,.15,.10,sd+.40,'tile');
 const stepZ=sz+sd/2+.27,stepG=H(sx-.4,stepZ);box(sx-.4,(stepG+floor-.04)/2,stepZ,1.0,Math.max(.12,floor-.04-stepG),.49,'stone');
 // Split logs sit on a fitted bearer rack north of the shed, cut ends towards the lane.
 const fx=-24.35,fz=-31.05,fw=1.55,fd=1.22;
 const fy=Math.max(H(fx-fw/2,fz-fd/2),H(fx+fw/2,fz+fd/2))+.20;
 for(const dx of [-.68,.68]){const ground=H(fx+dx,fz);box(fx+dx,(ground+fy)/2,fz,.14,fy-ground,fd,'darkwood');box(fx+dx,fy+.47,fz-.5,.095,1.06,.095,'wood');}
 for(let row=0;row<4;row++)for(let col=0;col<5-row%2;col++){const xx=fx-.56+col*.28+(row%2)*.13,yy=fy+.12+row*.22,zz=fz+(col%2)*.035;add(cyl,'bark',xx,yy,zz,.125,1.11,.125,Math.PI/2,0,.07*(col%3));add(cyl,'cut',xx,yy,zz+.566,.111,.017,.111,Math.PI/2,0,0);ring(xx,yy,zz+.579,.065,.008,'bark',0);beam([xx-.068,yy-.02,zz+.59],[xx+.077,yy+.035,zz+.59],.008,'bark');}
 const bx=-22.40,bz=-30.16,by=H(bx,bz);add(cyl,'bark',bx,by+.27,bz,.30,.54,.30);add(cyl,'cut',bx,by+.548,bz,.28,.025,.28);ring(bx,by+.568,bz,.18,.009,'bark');ring(bx,by+.57,bz,.095,.009,'bark');beam([bx-.12,by+.58,bz],[bx+.28,by+1.24,bz+.06],.031,'wood',true);box(bx-.12,by+.66,bz,.29,.20,.055,'iron',0,0,-.4);
 for(let i=0;i<11;i++){const a=i*2.399,r=.42+(i%3)*.12;box(bx+Math.cos(a)*r,H(bx+Math.cos(a)*r,bz+Math.sin(a)*r)+.03,bz+Math.sin(a)*r,.14,.035,.052,'cut',0,a,0);}
 // Rake leans on the shed's east wall; the head and teeth remain individually visible.
 beam([-21.98,H(-21.98,-34.05),-34.05],[-22.1,floor+1.58,-34.45],.027,'lightwood',true);box(-21.98,H(-21.98,-34.05)+.13,-34.05,.43,.06,.085,'iron');for(let i=0;i<6;i++)box(-22.18+i*.08,H(-21.98,-34.05)+.09,-34.0,.024,.14,.03,'iron');
 jar(-22.21,-27.0,.29,.67,'clay');jar(-22.91,-27.12,.22,.49,'jar');jar(-23.51,-26.8,.19,.43,'clay');
 const benchY=Math.max(H(-27.4,-27),H(-28.6,-27))+.49;box(-28.05,benchY,-27.06,1.65,.09,.49,'wood');for(const dx of [-.61,.61]){let xx=-28.05+dx,yy=H(xx,-27.06);box(xx,(yy+benchY)/2,-27.06,.12,benchY-yy,.37,'darkwood');}basket(-28.35,-27.06,.20,.27,benchY+.05);
 for(let i=0;i<5;i++)stone(-23.40+(i%2)*.17,-28.1-i*.68,.27);
 jar(-34.95,-27.2,.26,.56,'clay');jar(-34.2,-27.2,.19,.43,'clay');for(let i=0;i<5;i++)add(ball,'leaf',-34.95+Math.sin(i*2)*.12,H(-34.95,-27.2)+.67,-27.2+Math.cos(i*2)*.12,.06,.22,.06,Math.cos(i)*.4,0,.3);
 for(const {geo,m,items} of batches.values()){const mesh=new THREE.InstancedMesh(geo,mats[m],items.length);items.forEach((mat,i)=>mesh.setMatrixAt(i,mat));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
