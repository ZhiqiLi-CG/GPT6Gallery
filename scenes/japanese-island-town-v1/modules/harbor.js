import { heightAt, layout, roadNetwork } from './root.js';

// All timber waterfront contents. Permanent ground, sea and quay belong to root.
export function build(THREE, ctx) {
 const g = new THREE.Group(); g.name='harbor-working-waterfront';
 const plan=layout(), roads=roadNetwork(), quay=plan.harbor.quay;
 const Q=2.915, sea=plan.seaLevel;
 g.userData.arrival=roads.find(r=>r.id==='shore').points.at(-1);
 const C={wood:0x795334,dark:0x49362a,plank:0xa28154,light:0xb79a6b,roof:0x465257,edge:0x667171,rope:0xb4a47a,net:0x52615a,fish:0xbac6bb,indigo:0x344f62,red:0xa4533b};
 const mats=new Map();
 function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.87,side:THREE.DoubleSide}));return mats.get(c)}
 function mesh(p,geo,c,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m}
 const box=(p,x,y,z,w,h,d,c)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
 function beam(p,a,b,r,c){let va=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(va);let m=mesh(p,new THREE.CylinderGeometry(r,r,v.length(),7),c);m.position.copy(va.addScaledVector(v,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
 function ball(p,x,y,z,r,c,s=[1,1,1]){let m=mesh(p,new THREE.SphereGeometry(r,8,6),c,x,y,z);m.scale.set(...s);return m}
 function line(p,pts,r=.035,c=C.rope){for(let i=1;i<pts.length;i++)beam(p,pts[i-1],pts[i],r,c)}
 function coil(p,x,y,z,r=.4){for(let i=0;i<3;i++){let m=mesh(p,new THREE.TorusGeometry(r+i*.065,.035,4,20),C.rope,x,y+i*.045,z);m.rotation.x=Math.PI/2}}
 function crate(p,x,y,z,w=.95){box(p,x,y+w*.5,z,w,.95*w,w,C.dark);for(let i=0;i<5;i++){let a=(i-2)*w/5;for(let s of [-1,1]){box(p,x+a,y+w*.5,z+s*w*.505,w*.17,w*.92,.07,C.plank);box(p,x+s*w*.505,y+w*.5,z+a,.07,w*.92,w*.17,C.plank)}}for(let s of [-1,1])for(let h of [.16,.78])box(p,x,y+w*h,z+s*w*.55,w*1.06,.1,.07,C.wood)}
 function barrel(p,x,y,z,r=.45,h=1.05){mesh(p,new THREE.CylinderGeometry(r*.87,r*.88,h,12),C.plank,x,y+h*.5,z);for(let hh of [.16,.5,.84]){let m=mesh(p,new THREE.TorusGeometry(r*.91,.035,4,12),C.dark,x,y+h*hh,z);m.rotation.x=Math.PI/2}for(let i=0;i<12;i++){let a=i*Math.PI/6;beam(p,[x+Math.cos(a)*r*.87,y+.07,z+Math.sin(a)*r*.87],[x+Math.cos(a)*r*.87,y+h-.07,z+Math.sin(a)*r*.87],.016,C.dark)}box(p,x,y+h+.012,z,r*1.5,.045,.12,C.light)}
 function basket(p,x,y,z,r=.48){mesh(p,new THREE.CylinderGeometry(r,r*.7,.48,12,1,true),C.light,x,y+.25,z);for(let i=0;i<5;i++){let m=mesh(p,new THREE.TorusGeometry(r*(.75+.05*i),.025,4,12),C.wood,x,y+.08+i*.095,z);m.rotation.x=Math.PI/2}for(let i=0;i<4;i++)fish(p,x+(i%2-.5)*.27,y+.42,z+Math.floor(i/2)*.15,.55,false)}
 function fish(p,x,y,z,size=1,hanging=true){let f=new THREE.Group();f.position.set(x,y,z);p.add(f);ball(f,0,0,0,.27,C.fish,[.55,size*1.6,.45]);let tail=mesh(f,new THREE.ConeGeometry(.18,.3,3),0x879b96,0,.49*size,0);tail.rotation.z=Math.PI;ball(f,.08,-.23*size,-.08,.032,C.dark);if(!hanging)f.rotation.x=Math.PI/2;return f}
 function net(p,x,y,z,w,h){for(let i=0;i<=Math.ceil(w/.32);i++){let xx=Math.min(w,i*.32);let pts=[];for(let j=0;j<=8;j++){let t=j/8;pts.push([x+xx,y-h*t,z+.15*Math.sin(Math.PI*t)+.23*Math.sin(xx/w*Math.PI)*t])}line(p,pts,.018,C.net)}for(let j=0;j<=Math.ceil(h/.3);j++){let t=Math.min(1,j*.3/h),pts=[];for(let i=0;i<=12;i++){let xx=w*i/12;pts.push([x+xx,y-h*t,z+.15*Math.sin(Math.PI*t)+.23*Math.sin(xx/w*Math.PI)*t])}line(p,pts,.018,C.net)}for(let i=0;i<=w/.6;i++)ball(p,x+i*.6,y,z,.09,C.light)}
 function roof(p,w,d,h){const rise=1.75,run=d/2+.65,angle=Math.atan2(rise,run),len=Math.hypot(run,rise);for(let side of [-1,1]){let m=box(p,0,h+rise/2,side*run/2,w+1.2,.18,len,C.roof);m.rotation.x=side*angle;for(let x=-w/2-.48;x<=w/2+.5;x+=.36){beam(p,[x,h+rise+.13,0],[x,h+.13,side*run],.072,C.edge)}for(let t=.22;t<1;t+=.22)beam(p,[-w/2-.6,h+rise*(1-t)+.14,side*run*t],[w/2+.6,h+rise*(1-t)+.14,side*run*t],.04,C.roof)}beam(p,[-w/2-.7,h+rise+.13,0],[w/2+.7,h+rise+.13,0],.17,C.edge);for(let s of [-1,1]){const sh=new THREE.Shape();sh.moveTo(-d/2,h);sh.lineTo(d/2,h);sh.lineTo(0,h+rise);sh.closePath();let m=mesh(p,new THREE.ShapeGeometry(sh),C.wood,s*w/2,0,0);m.rotation.y=Math.PI/2;}}
 function shed(x,z,w,d,h,index){let p=new THREE.Group();p.position.set(x,Q,z);g.add(p);box(p,0,.12,0,w+.4,.24,d+.4,0x85897d);box(p,0,h/2,0,w,h,d,C.wood);for(let a=-w/2+.15;a<w/2;a+=.31)for(let s of [-1,1])box(p,a,h/2,s*(d/2+.02),.025,h,.04,C.dark);for(let a=-d/2+.15;a<d/2;a+=.31)for(let s of [-1,1])box(p,s*(w/2+.02),h/2,a,.04,h,.025,C.dark);for(let xx of [-w/2,0,w/2])for(let zz of [-d/2,d/2])box(p,xx,h/2,zz,.2,h,.2,C.dark);for(let yy of [.25,h-.1]){box(p,0,yy,-d/2-.06,w,.17,.13,C.dark);box(p,0,yy,d/2+.06,w,.17,.13,C.dark)}
 // Inset door, split indigo curtain, windows on every public facade.
 box(p,-w*.2,1.22,-d/2-.06,1.75,2.3,.08,C.dark);for(let i=0;i<2;i++)box(p,-w*.2+(i-.5)*.82,2.1,-d/2-.15,.79,.64,.06,C.indigo);box(p,-w*.2,.22,-d/2-.46,2.1,.2,.8,C.plank);
 for(let side of [-1,1]){box(p,side*(w/2+.04),1.85,0,.06,1.3,2.0,0xb5b6a0);for(let i=-2;i<=2;i++)box(p,side*(w/2+.10),1.85,i*.42,.08,1.42,.065,C.dark);for(let yy of [1.2,1.85,2.5])box(p,side*(w/2+.10),yy,0,.08,.07,2.1,C.dark)}
 box(p,w*.25,1.75,-d/2-.05,1.7,1.2,.08,0xc8bea0);for(let i=-2;i<=2;i++)box(p,w*.25+i*.32,1.75,-d/2-.12,.055,1.3,.07,C.dark);box(p,w*.25,1.75,-d/2-.13,1.8,.06,.07,C.dark);box(p,0,2,d/2+.06,2,1.2,.08,0xb5b6a0);for(let i=-3;i<=3;i++)box(p,i*.3,2,d/2+.12,.06,1.3,.07,C.dark);
 roof(p,w,d,h);box(p,-w*.2,2.88,-d/2-.16,2.25,.43,.1,C.light);for(let i=0;i<3;i++){box(p,-w*.2+(i-1)*.55,2.88,-d/2-.23,.06,.27,.03,C.dark);box(p,-w*.2+(i-1)*.55,2.9,-d/2-.24,.24,.04,.03,C.dark)}
 // Side stacked stores within shed yard.
 barrel(g,x+w/2+.95,Q,z+.6);crate(g,x+w/2+.95,Q,z-.65,.8);
 }
 shed(58,-65.7,7,6,3.4,0);shed(70,-65.5,8,6,3.8,1);shed(84.8,-65.5,8,6.5,3.6,2);
 // Three fish drying frames with individually suspended fish in two tiers.
 function rack(x,z,w){for(let s of [-1,1]){beam(g,[x+s*w/2,Q,z],[x+s*w/2,Q+2.8,z],.1,C.dark);beam(g,[x+s*w/2,Q+.2,z-.7],[x+s*w/2,Q+1.5,z],.07,C.wood)}for(let yy of [Q+1.4,Q+2.65]){beam(g,[x-w/2-.2,yy,z],[x+w/2+.2,yy,z],.085,C.wood);for(let i=0;i<Math.floor(w/.45);i++){let xx=x-w/2+.3+i*.45;beam(g,[xx,yy,z],[xx,yy-.24,z],.018,C.rope);fish(g,xx,yy-.66,z,0.8+(i%3)*.08)}}}
 rack(60,-72.9,5.6);rack(70,-73,5.5);rack(84,-72.9,5.6);
 for(let x of [77,92]){for(let dx of [-1.6,1.6])beam(g,[x+dx,Q,-69.8],[x+dx,Q+3,-69.8],.1,C.wood);beam(g,[x-1.8,Q+2.9,-69.8],[x+1.8,Q+2.9,-69.8],.1,C.wood);net(g,x-1.5,Q+2.8,-69.8,3,2.1)}
 // Low sorting tables, bins, a wheeled handcart and dock workers.
 function table(x,z){for(let a of [-.85,.85])for(let b of [-.4,.4])box(g,x+a,Q+.5,z+b,.12,1,.12,C.dark);box(g,x,Q+1.04,z,2.2,.13,1.1,C.plank);for(let i=0;i<6;i++)fish(g,x-.8+i*.28,Q+1.2,z,.65,false)}
 table(64.7,-70);table(79,-73.1);for(let p of [[55,-69],[66,-71.5],[74.8,-67],[89.8,-66],[88.5,-73.5]]){crate(g,p[0],Q,p[1]);crate(g,p[0]+.15,Q+.97,p[1],.75);basket(g,p[0]+1.1,Q,p[1]-.2)}
 for(let p of [[54,-73],[75.2,-73],[91.8,-73]]){barrel(g,p[0],Q,p[1]);coil(g,p[0]+.95,Q+.05,p[1]);ball(g,p[0]+1.3,Q+.32,p[1]-.7,.32,C.red)}
 box(g,79.5,Q+.72,-64.4,1.3,.17,2.2,C.wood);for(let s of [-1,1]){let m=mesh(g,new THREE.TorusGeometry(.47,.075,5,12),C.dark,79.5+s*.8,Q+.47,-64.4);m.rotation.y=Math.PI/2;for(let j=0;j<4;j++){let a=j*Math.PI/4;beam(g,[79.5+s*.8,Q+.47+Math.sin(a)*.43,-64.4+Math.cos(a)*.43],[79.5+s*.8,Q+.47-Math.sin(a)*.43,-64.4-Math.cos(a)*.43],.03,C.wood)}beam(g,[79.5+s*.52,Q+.8,-64],[79.5+s*.52,Q+1,-61.7],.06,C.wood)}crate(g,79.5,Q+.81,-64.4,.9);
 function person(x,y,z,turn=0){let p=new THREE.Group();p.position.set(x,y,z);p.rotation.y=turn;g.add(p);for(let s of [-1,1]){beam(p,[s*.17,.12,0],[s*.13,.85,0],.105,C.dark);box(p,s*.17,.08,-.07,.23,.12,.38,C.dark);beam(p,[s*.22,1.32,0],[s*.38,.94,-.18],.09,C.indigo)}mesh(p,new THREE.CylinderGeometry(.23,.34,.68,7),C.indigo,0,1.08,0);ball(p,0,1.6,0,.2,0xbb9771);mesh(p,new THREE.ConeGeometry(.43,.19,12),C.light,0,1.83,0)}
 person(65,Q,-72,1);person(78,Q,-71.7,2);person(91,Q,-68,0);
 // Three connected finger piers. Quay descent is a generous flight of timber steps.
 const piers=[{x:57,end:-102},{x:73,end:-106},{x:90,end:-102}];
 for(let {x,end} of piers){for(let i=0;i<12;i++){let zz=-75.5-i*.48,top=Q-(Q-1.1)*i/11;box(g,x,top-.1,zz,2.65,.2,.50,i%3?C.plank:C.light)}for(let side of [-1,1]){beam(g,[x+side*1.1,.75,-81],[x+side*1.1,Q-.25,-75.3],.13,C.dark);beam(g,[x+side*1.3,Q+1,-75.3],[x+side*1.3,2.1,-81],.075,C.wood)}
 for(let zz=-81;zz>end;zz-=.4)box(g,x,1.03,zz,2.7,.18,.37,Math.round(zz*10)%3?C.plank:C.light);
 for(let side of [-1,1]){beam(g,[x+side*.95,.75,-80.7],[x+side*.95,.75,end],.15,C.dark);for(let zz=-80.5;zz>=end;zz-=4){beam(g,[x+side*1.3,-2.4,zz],[x+side*1.3,1.65,zz],.16,C.dark);coil(g,x+side*1.3,1.58,zz,.18);beam(g,[x+side*1.3,-.6,zz],[x-side*.7,.7,zz-2.8],.07,C.wood)}}coil(g,x,1.15,end+2);barrel(g,x,1.13,-83,.33,.7);
 }
 person(73,1.14,-88,1);
 function boat(x,z,L,W,rot,index){let p=new THREE.Group();p.position.set(x,sea,z);p.rotation.y=rot;g.add(p);
 const zz=[-L*.5,-L*.35,0,L*.35,L*.49],ww=[.035,W*.34,W*.5,W*.45,W*.29],rim=[1.55,1.16,1.02,1.05,1.17];
 // V-bottom shaped hull with thick-looking gunwales, interior and strakes.
 const verts=[],idx=[];for(let i=0;i<zz.length;i++){verts.push(-ww[i],rim[i],zz[i],-ww[i]*.64,-.35,zz[i],0,-.65,zz[i],ww[i]*.64,-.35,zz[i],ww[i],rim[i],zz[i]);if(i)for(let j=0;j<4;j++){let a=(i-1)*5+j,b=i*5+j;idx.push(a,b,a+1,a+1,b,b+1)}}
 idx.push(20,21,24,21,23,24,21,22,23);let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(p,geo,index%2?0x725036:0x996d42);
 for(let s of [-1,1]){line(p,zz.map((v,i)=>[s*ww[i],rim[i],v]),.11,C.dark);for(let t of [.25,.6])line(p,zz.map((v,i)=>[s*ww[i]*(.64+.36*t),-.35+(rim[i]+.35)*t,v]),.035,C.light)}
 function width(v){let i=0;while(i<3&&v>zz[i+1])i++;let t=(v-zz[i])/(zz[i+1]-zz[i]);return ww[i]+(ww[i+1]-ww[i])*t}
 for(let v=-L*.31;v<L*.42;v+=.48){let w=width(v);box(p,0,.11,v,w*1.45,.13,.45,C.plank);line(p,[[-w*.93,.92,v],[-w*.65,.13,v],[0,.03,v],[w*.65,.13,v],[w*.93,.92,v]],.055,C.dark)}
 for(let v of [-L*.21,L*.13,L*.34])box(p,0,.64,v,width(v)*1.9,.17,.38,C.light);
 box(p,0,.17,L*.54,.15,1.35,.64,C.dark);beam(p,[0,.82,L*.48],[.5,1,L*.32],.065,C.wood);
 for(let s of [-1,1]){beam(p,[s*W*.27,.75,-L*.22],[s*W*.62,1.12,L*.31],.045,C.light);let m=box(p,s*W*.62,1.12,L*.31,.22,.055,1.05,C.plank);m.rotation.y=s*.18}
 coil(p,-W*.12,.27,-L*.29,.32);basket(p,W*.18,.2,L*.23,.36);crate(p,-W*.19,.19,L*.05,.6);for(let i=0;i<3;i++)ball(p,W*.36,1.1,-.9+i*.7,.17,i%2?C.light:C.red);
 if(index===1||index===4){box(p,0,1.13,L*.15,W*.58,1.25,L*.24,C.wood);box(p,0,1.4,L*.15-L*.125,W*.42,.5,.06,0xacc1b4);box(p,0,1.83,L*.15,W*.72,.14,L*.3,C.roof)}
 if(index===0||index===3||index===5){beam(p,[0,.18,-L*.05],[0,6.0,-L*.05],.095,C.wood);beam(p,[-1.8,4.7,-L*.05],[1.8,4.7,-L*.05],.06,C.wood);line(p,[[-W*.45,1,0],[0,5.8,-L*.05],[W*.45,1,0]],.025);line(p,[[0,1.4,-L*.47],[0,5.8,-L*.05],[0,1.2,L*.44]],.025);beam(p,[-1.6,4.65,-L*.05],[1.6,4.65,-L*.05],.14,0xc1bda1)}
 else{net(p,-W*.3,1.02,-L*.12,W*.6,.7)}
 return p;}
 const fleet=[[53.4,-101,9,3.1,-.04],[61.8,-97,10,3.5,.04],[68.5,-90,8.4,3.2,-.025],[77.7,-99,11,3.6,.035],[85.6,-89.5,9.5,3.5,-.035],[95,-96,10.5,3.5,.03],[88.5,-108,7.4,2.8,1.48]];
 fleet.forEach((b,i)=>{boat(...b,i);const [x,z,L,W,rot]=b;const mx=x+Math.sin(rot)*L*.32,mz=z+Math.cos(rot)*L*.32;let pier=piers.reduce((a,v)=>Math.abs(v.x-x)<Math.abs(a.x-x)?v:a,piers[0]);let dockZ=Math.max(pier.end+1,z+L*.25);line(g,[[mx,.95,mz],[(mx+pier.x)/2,.72,(mz+dockZ)/2],[pier.x+(x<pier.x?-1.3:1.3),1.4,dockZ]],.038);});
 // Ladder and colorful spare floats emphasize the tidal working edge.
 for(let x of [64,82]){for(let s of [-.3,.3])beam(g,[x+s,-.3,quay[1]-.25],[x+s,Q+.4,quay[1]-.25],.045,C.dark);for(let yy=0;yy<Q+.3;yy+=.35)beam(g,[x-.33,yy,quay[1]-.3],[x+.33,yy,quay[1]-.3],.04,C.wood)}
 // Small private approach stones conform to sampled coast beside the eastern shed.
 for(let i=0;i<5;i++){let x=92,z=-60-i*.6;let y=Math.max(heightAt(x,z),Q-.2);box(g,x,y+.08,z,1.1,.16,.5,0xa19e89)}
 return g;
}
