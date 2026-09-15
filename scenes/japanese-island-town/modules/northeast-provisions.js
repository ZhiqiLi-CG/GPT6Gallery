import { heightAt, roadNetwork, layout } from './root.js';
import { northReservations } from './north.js';

export function build(T,ctx){
 const root=new T.Group();root.name='Northeast provisions';
 const colors={wood:'#806044',light:'#aa8760',dark:'#554536',iron:'#454b49',soil:'#695442',stone:'#878778',leaf:'#54744a',leaf2:'#78935b',green:'#93a76c',cream:'#d8ceb1',carrot:'#b67d43',purple:'#665266',tea:'#637365',ceramic:'#969c90',basket:'#ad9166',sack:'#b1a483',roof:'#62625a'};
 const mats=Object.fromEntries(Object.entries(colors).map(([k,c])=>[k,new T.MeshStandardMaterial({color:c,roughness:.88})]));
 const geos={box:new T.BoxGeometry(1,1,1),ball:new T.IcosahedronGeometry(1,1),cyl:new T.CylinderGeometry(1,1,1,12),tor:new T.TorusGeometry(1,.065,5,24)};
 let g,batches;const dummy=new T.Object3D();
 function start(id,kind){g=new T.Group();g.name='northeast-provisions_'+id;g.userData.kind=kind;batches=new Map();root.add(g);}
 function finish(){for(const {geo,mat,ms} of batches.values()){const m=new T.InstancedMesh(geo,mat,ms.length);ms.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;g.add(m);}}
 function add(type,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();const key=type+mat;if(!batches.has(key))batches.set(key,{geo:geos[type],mat:mats[mat],ms:[]});batches.get(key).ms.push(dummy.matrix.clone());}
 const box=(x,y,z,w,h,d,m='wood',ry=0)=>add('box',m,x,y,z,w,h,d,0,ry);
 const ball=(x,y,z,w,h,d,m)=>add('ball',m,x,y,z,w,h,d);
 function beam(a,b,r,m='wood'){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);dummy.position.copy(p.add(q).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());dummy.scale.set(r,v.length(),r);dummy.updateMatrix();const key='cyl'+m;if(!batches.has(key))batches.set(key,{geo:geos.cyl,mat:mats[m],ms:[]});batches.get(key).ms.push(dummy.matrix.clone());}
 const ring=(x,y,z,r,m='iron',vertical=false)=>add('tor',m,x,y,z,r,r,r,vertical?0:Math.PI/2);
 const ground=(x,z)=>heightAt(x,z)+.065;
 const roads=roadNetwork(),reservations=northReservations(),lots=layout().town.lots;
 function allowed(x,z,margin=.12){if(x<-1+margin||x>13-margin||z<-7+margin||z>29-margin)return false;
  for(const rd of roads)for(let i=1;i<rd.points.length;i++){const a=rd.points[i-1],b=rd.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<rd.width/2+margin)return false;}
  if(reservations.gardens.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+margin))return false;
  if(x<=reservations.drains.x[1]&&reservations.drains.z.some(v=>Math.abs(z-v)<reservations.drains.halfWidth+margin))return false;
  if(lots.filter(l=>l.x===5&&(l.z===-2||l.z===18)).some(l=>Math.abs(x-l.x)<1.2+margin&&((l.z<0&&z>1.5&&z<8)||(l.z>0&&z>8&&z<14.5))))return false;
  return true;
 }
 function table(x,z,w,d,h){const top=Math.max(...[-1,1].flatMap(i=>[-1,1].map(j=>ground(x+i*w/2,z+j*d/2))))+h;
  for(const i of [-1,1])for(const j of [-1,1]){const xx=x+i*(w/2-.13),zz=z+j*(d/2-.13),yy=ground(xx,zz);box(xx,(yy+top)/2,zz,.12,top-yy,.12,'dark');}
  for(let i=0;i<Math.ceil(w/.22);i++)box(x-w/2+(i+.5)*w/Math.ceil(w/.22),top,z,w/Math.ceil(w/.22)-.012,.10,d,'light');
  box(x,top-.27,z-d/2+.08,w,.11,.08);box(x,top-.27,z+d/2-.08,w,.11,.08);return top+.055;
 }
 function tray(x,y,z,w=.75,d=.64){box(x,y,z,w,.065,d,'light');for(const s of [-1,1]){box(x+s*w/2,y+.13,z,.055,.26,d);box(x,y+.13,z+s*d/2,w,.26,.055);} }
 function cabbage(x,y,z,r=.17){ball(x,y+r*.7,z,r,r*.8,r,'green');for(let i=0;i<6;i++){let a=i*2.4;add('ball',i%2?'leaf':'leaf2',x+Math.cos(a)*r*.6,y+r*.55,z+Math.sin(a)*r*.6,r*.65,r*.6,r*.3,0,-a,.35);}}
 function vegetable(x,y,z,type,i){if(type===0)cabbage(x,y,z,.16);else if(type===1){ball(x,y+.09,z,.08,.09,.23,'purple');beam([x,y+.16,z-.19],[x+.025,y+.19,z-.26],.025,'leaf');}else{add('ball',type===2?'cream':'carrot',x,y+.10,z,.07,.085,.25,0,(i%3-.8)*.15);for(let k=0;k<3;k++)beam([x,y+.1,z-.2],[x+(k-1)*.09,y+.17,z-.39],.018,'leaf');}}
 function stockedTray(x,y,z,type){tray(x,y,z);for(let i=0;i<6;i++)vegetable(x+(i%3-1)*.22,y+.08,z+(Math.floor(i/3)-.5)*.25,type,i);}
 function basket(x,z,r=.35,fill=true){const y=ground(x,z);add('cyl','basket',x,y+.04,z,r*.73,.08,r*.73);for(let i=0;i<9;i++)ring(x,y+.08+i*.047,z,r*(.75+i*.026),'basket');for(let i=0;i<20;i++){const a=i*Math.PI/10;beam([x+Math.cos(a)*r*.74,y+.04,z+Math.sin(a)*r*.74],[x+Math.cos(a)*r,y+.5,z+Math.sin(a)*r],.013,'wood');}if(fill)for(let i=0;i<5;i++)cabbage(x+Math.cos(i*2.4)*r*.45,y+.31,z+Math.sin(i*2.4)*r*.45,.13);}
 function barrel(x,z,r=.34,h=.83){const y=ground(x,z);for(let i=0;i<16;i++){const a=i*Math.PI/8;box(x+Math.cos(a)*r*.88,y+h/2,z+Math.sin(a)*r*.88,.11,h,.10,i%3?'wood':'light',-a);}for(const f of [.12,.47,.85])ring(x,y+h*f,z,r,'iron');add('cyl','dark',x,y+.04,z,r,.08,r);add('cyl','wood',x,y+h-.03,z,r*.98,.07,r*.98);for(let i=-2;i<=2;i++)box(x+i*.10,y+h+.013,z,.015,.01,Math.sqrt(Math.max(0,r*r-(i*.10)**2))*1.9,'dark');}
 function jar(x,y,z,r=.14,h=.35){ball(x,y+h*.43,z,r,h*.44,r,'tea');add('cyl','ceramic',x,y+h*.82,z,r*.50,h*.17,r*.5);ring(x,y+h*.91,z,r*.53,'ceramic');add('cyl','dark',x,y+h*.91,z,r*.42,.012,r*.42);}
 function sack(x,z,h=.69){const y=ground(x,z);ball(x,y+h*.43,z,.28,h*.48,.24,'sack');ball(x,y+h*.9,z,.12,.12,.11,'sack');ring(x,y+h*.84,z,.095,'wood');for(let k=0;k<3;k++)beam([x+.25,y+.2+k*.11,z],[x+.26,y+.25+k*.11,z+.045],.009,'cream');}
 function tools(x,z){let y=ground(x,z);beam([x,y,z],[x+.14,y+1.25,z+.12],.028,'wood');box(x+.14,y+1.25,z+.12,.40,.075,.14,'iron');beam([x+.25,y,z],[x+.40,y+1.04,z+.07],.025,'light');box(x+.25,y+.06,z,.14,.18,.035,'iron');}
 function fence(points,style=0){for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/.8);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!allowed(x,z,.16))continue;let y=ground(x,z);beam([x,y-.07,z],[x,y+(style?.9:.68),z],style?.036:.045,style?'basket':'dark');if(i<n){const nx=a[0]+(b[0]-a[0])*(i+1)/n,nz=a[1]+(b[1]-a[1])*(i+1)/n;if(!allowed(nx,nz,.16))continue;for(const h of [.28,style?.75:.58])beam([x,y+h,z],[nx,ground(nx,nz)+h,nz],.032,'wood');if(style)for(let k=1;k<4;k++){const xx=x+(nx-x)*k/4,zz=z+(nz-z)*k/4,yy=ground(xx,zz);beam([xx,yy,zz],[xx,yy+.78,zz],.017,'basket');}}}}}
 // Produce frontage: goods are beside the fixed central stair, at yard ground level.
 start('produce_counter','wooden-greengrocer-counter-with-individual-vegetables');let y=table(1.96,3.36,2.45,1.03,.77);for(let i=0;i<3;i++)stockedTray(1.15+i*.81,y,3.36,i);finish();
 start('produce_baskets_crates','woven-harvest-baskets-and-spare-slatted-crates');basket(1.15,4.78,.34);basket(2.1,4.72,.32);for(let i=0;i<2;i++){let yy=ground(8.7,2.6)+i*.38;tray(8.7,yy+.06,2.6,.72,.7);}basket(7.2,2.7,.34);tools(9.02,1.95);finish();
 start('handcart','two-wheeled-spoked-vegetable-handcart');{
 const x=8.0,z=4.4,yy=Math.max(ground(7.25,z),ground(8.75,z))+.46;
 for(let i=0;i<6;i++)box(x-.54+i*.215,yy+.04,z,.2,.09,1.30,'light');
 for(const s of [-1,1]){for(const hh of [.22,.43])box(x+s*.67,yy+hh,z,.065,.15,1.37);box(x,yy+.31,z+s*.66,1.35,.30,.06);beam([x+s*.47,yy-.08,z+.3],[x+s*.47,ground(x+s*.47,2.82)+.38,2.82],.046);const xx=x+s*.8;add('tor','iron',xx,yy-.03,z,.43,.43,.43,0,Math.PI/2);for(let k=0;k<10;k++){let a=k*Math.PI/5;beam([xx,yy-.03,z],[xx,yy-.03+Math.cos(a)*.40,z+Math.sin(a)*.40],.024,'light');}beam([xx-.07,yy-.03,z],[xx+.07,yy-.03,z],.10,'wood');}
 beam([x-.89,yy-.03,z],[x+.89,yy-.03,z],.065,'iron');stockedTray(x,yy+.12,z,3);beam([x,ground(x,3.89),3.89],[x,yy,3.89],.05);const west=ground(x-.8,z),east=ground(x+.8,z),tilt=Math.atan2(east-west,1.6);g.applyMatrix4(new T.Matrix4().makeTranslation(x,(west+east)/2+.43,z).multiply(new T.Matrix4().makeRotationZ(tilt)).multiply(new T.Matrix4().makeTranslation(-x,-yy+.03,-z)));}
 finish();
 start('tea_bench','low-timber-tea-bench-with-serving-tray-and-cups');y=table(2.0,12.11,2.54,.79,.44);box(2.22,y+.035,12.1,.80,.055,.49,'dark');for(let i=0;i<3;i++){let x=1.96+i*.24;add('cyl','ceramic',x,y+.105,12.10,.074,.13,.074);ring(x,y+.17,12.10,.073,'cream');add('cyl','dark',x,y+.171,12.10,.058,.004,.058);}jar(2.52,y+.06,12.16,.13,.25);finish();
 start('provisions_counter','stocked-tea-counter-with-jars-boxes-and-grain');y=table(8,12.62,2.14,.97,.86);for(let i=0;i<6;i++)jar(7.25+(i%3)*.37,y,12.40+Math.floor(i/3)*.39,.13,.33+(i%2)*.05);tray(8.70,y,12.62,.50,.64);for(let i=0;i<15;i++)ball(8.52+(i%3)*.14,y+.14,12.4+Math.floor(i/3)*.095,.048,.04,.05,'sack');finish();
 start('tea_storage','tied-grain-sacks-and-hooped-lidded-storage-vessels');barrel(8.7,13.82,.32,.91);barrel(7.8,13.86,.31,.74);sack(1.15,13.49,.77);sack(1.84,13.54,.61);sack(2.5,13.52,.70);finish();
 // Rear storage shed: boarded closed walls, full gables, two roof slopes and working door.
 start('rear_shed','complete-framed-boarded-storage-shed-with-pitched-roof');{
 const x=2.4,z=25.95,w=3.0,d=2.7,base=Math.max(...[-1,1].flatMap(i=>[-1,1].map(j=>ground(x+i*w/2,z+j*d/2))))+.14,eave=base+2.12,ridge=eave+.84;
 for(const i of [-1,1])for(const j of [-1,1]){const xx=x+i*w/2,zz=z+j*d/2,bot=heightAt(xx,zz)-.08;box(xx,(bot+base)/2,zz,.31,base-bot,.31,'stone');box(xx,(base+eave)/2,zz,.14,eave-base,.14,'dark');}
 for(const s of [-1,1]){box(x,base-.12,z+s*d/2,w+.12,.19,.17,'dark');box(x+s*w/2,base-.12,z,.17,.19,d,'dark');const xx=x+s*w/2,za=z-d/2,zb=z+d/2;beam([xx,heightAt(xx,za)+.15,za],[xx,base-.20,zb],.065,'wood');beam([xx,base-.20,za],[xx,heightAt(xx,zb)+.15,zb],.065,'wood');}
 for(let i=0;i<14;i++)box(x-w/2+(i+.5)*w/14,base,z,w/14-.008,.11,d,'wood');
 for(let i=0;i<14;i++){const xx=x-w/2+(i+.5)*w/14;box(xx,(base+eave)/2,z+d/2,w/14-.012,eave-base,.095,i%3?'wood':'light');if(Math.abs(xx-x)>.54)box(xx,(base+eave)/2,z-d/2,w/14-.012,eave-base,.095,'wood');}
 for(const s of [-1,1])for(let i=0;i<12;i++)box(x+s*w/2,(base+eave)/2,z-d/2+(i+.5)*d/12,.095,eave-base,d/12-.012,'wood');
 for(const s of [-1,1]){box(x,eave,z+s*d/2,w+.16,.14,.16,'dark');for(let i=0;i<14;i++){const xx=x-w/2+(i+.5)*w/14,h=.84*(1-Math.abs(xx-x)/(w/2));box(xx,eave+h/2,z+s*d/2,w/14-.008,h,.095,'wood');}beam([x-w/2,eave,z+s*d/2],[x,ridge,z+s*d/2],.07,'dark');beam([x,ridge,z+s*d/2],[x+w/2,eave,z+s*d/2],.07,'dark');}
 for(let i=0;i<5;i++)box(x-.48+i*.24,base+.95,z-d/2-.035,.23,1.9,.10,'light');box(x,base+1.98,z-d/2-.04,1.16,.17,.14,'dark');for(const h of [.34,1.62])box(x,base+h,z-d/2-.10,1.05,.10,.06,'dark');beam([x-.44,base+.38,z-d/2-.15],[x+.43,base+1.58,z-d/2-.15],.038);ring(x+.34,base+1.02,z-d/2-.14,.07,'iron',true);
 const slope=Math.atan2(.84,w/2);for(const s of [-1,1]){const m=new T.Mesh(new T.BoxGeometry(Math.hypot(w/2+.23,.84+.13),.105,d+.46),mats.roof);m.position.set(x+s*(w/4+.1),eave+.42,z);m.rotation.z=-s*slope;g.add(m);for(let j=0;j<13;j++)beam([x,ridge+.065,z-d/2-.23+j*(d+.46)/12],[x+s*(w/2+.22),eave-.06,z-d/2-.23+j*(d+.46)/12],.026,'dark');}beam([x,ridge+.09,z-d/2-.27],[x,ridge+.09,z+d/2+.27],.075,'dark');
 // Six shallow steps resolve the naturally sloping threshold.
 for(let j=0;j<6;j++){const zz=z-d/2-.16-j*.24,bot=heightAt(x,zz)-.04,top=base-.08-j*.20;box(x,(bot+top)/2,zz,1.16,Math.max(.12,top-bot),.25,'stone');}
 }finish();
 function bed(id,x,z,w,d,type){start(id,'retained-worked-vegetable-bed');for(let j=0;j<Math.ceil(d/.24);j++)for(let i=0;i<Math.ceil(w/.24);i++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.24),zz=z-d/2+(j+.5)*d/Math.ceil(d/.24);box(xx,ground(xx,zz)+.08,zz,w/Math.ceil(w/.24)+.005,.18,d/Math.ceil(d/.24)+.005,'soil');}for(const s of [-1,1]){for(let i=0;i<Math.ceil(w/.35);i++){const xx=x-w/2+(i+.5)*w/Math.ceil(w/.35),zz=z+s*d/2;box(xx,ground(xx,zz)+.1,zz,w/Math.ceil(w/.35)-.012,.27,.14,'stone');}for(let i=0;i<Math.ceil(d/.35);i++){const zz=z-d/2+(i+.5)*d/Math.ceil(d/.35),xx=x+s*w/2;box(xx,ground(xx,zz)+.1,zz,.14,.27,d/Math.ceil(d/.35)-.012,'stone');}}
 for(let j=0;j<Math.floor(d/.43);j++)for(let i=0;i<Math.floor(w/.43);i++){const xx=x-w/2+.29+i*.43,zz=z-d/2+.30+j*.43,yy=ground(xx,zz)+.18;if(!type)cabbage(xx,yy,zz,.16);else for(let k=0;k<5;k++)beam([xx,yy,zz],[xx+Math.cos(k*2.4)*.10,yy+.30+(k%2)*.08,zz+Math.sin(k*2.4)*.10],.022,k%2?'leaf':'leaf2');}finish();}
 bed('rear_cabbage_bed',6.35,24.40,2.55,1.55,0);bed('rear_onion_bed',6.35,27.13,2.55,1.48,1);bed('greengrocer_kitchen_bed',11.68,-2.58,1.35,3.5,1);
 start('rear_tools_containers','garden-tools-watering-vessels-and-empty-baskets');tools(4.42,27.12);barrel(8.22,27.9,.27,.58);basket(4.5,24.30,.29,false);jar(8.13,ground(8.13,24.12),24.12,.29,.61);beam([8.13,ground(8.13,24.12)+.6,24.12],[8.49,ground(8.13,24.12)+.92,24.22],.026,'light');finish();
 start('fences_gates','varied-terrain-seated-shop-fences-and-open-garden-gates');
 fence([[12.57,-6.4],[12.57,4.9],[10.7,4.9]],1);fence([[.55,5.14],[3.40,5.14]]);fence([[6.66,5.20],[9.34,5.20]]);
 fence([[.48,10.82],[3.34,10.82]],1);fence([[6.66,11.00],[9.43,11.0]],1);fence([[12.55,12],[12.55,23.45]],0);
 fence([[.20,23.65],[.20,28.66],[3.78,28.66]],1);fence([[5.03,28.66],[8.78,28.66]],1);fence([[8.79,28.65],[8.79,27.5]],1);
 // Open, braced rear gate folds into the fence, leaving a 1.25m opening.
 fence([[3.80,28.62],[3.82,27.72]],0);beam([3.8,ground(3.8,28.62)+.2,28.62],[3.82,ground(3.82,27.72)+.57,27.72],.024,'wood');finish();
 return root;
}
