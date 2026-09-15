import {heightAt,roadNetwork,layout} from './root.js';

export function build(THREE,ctx){
 const g=new THREE.Group();g.name='Se-laundry: tended household wash court';
 const lot=layout().town.lots[11],dx=lot.x-5,dz=lot.z+44,roads=roadNetwork();
 const colors={wood:0x7b6142,woodLight:0xa58a5f,dark:0x4a4032,iron:0x494b45,rope:0xb8a17d,straw:0xac8955,strawLight:0xc6a572,soil:0x4c402d,terra:0x966649,glaze:0x637c71,leaf:0x436b3e,leafLight:0x69804b,radish:0xe2d9b4,stone:0x929386,stoneDark:0x72786b,moss:0x616c48,cream:0xdad4bd,blue:0x6b8190,red:0xa17062};
 const mats=Object.fromEntries(Object.entries(colors).map(([n,c])=>[n,new THREE.MeshStandardMaterial({color:c,roughness:.94,side:THREE.DoubleSide})]));
 const geos={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,16),ball:new THREE.SphereGeometry(1,10,6),leaf:new THREE.SphereGeometry(1,7,5),ring:new THREE.TorusGeometry(1,.045,6,32),rock:new THREE.DodecahedronGeometry(1,0)};
 const batches={},o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 function form(shape,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){o.position.set(x+dx,y,z+dz);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();(batches[shape+'|'+mat]??=[]).push(o.matrix.clone());}
 const ground=(x,z)=>heightAt(x+dx,z+dz)+.087;
 function beam(a,b,r,mat='wood'){const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);o.position.set((a[0]+b[0])/2+dx,(a[1]+b[1])/2,(a[2]+b[2])/2+dz);o.quaternion.setFromUnitVectors(up,v.clone().normalize());o.scale.set(r,v.length(),r);o.updateMatrix();(batches['cyl|'+mat]??=[]).push(o.matrix.clone());}
 function ring(mat,x,y,z,r){form('ring',mat,x,y,z,r,r,r,Math.PI/2);}
 const reservations=[];
 function reserve(id,x,z,rx,rz){const radius=Math.hypot(rx,rz);for(const road of roads)for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x+dx-a[0])*vx+(z+dz-a[1])*vz)/(vx*vx+vz*vz)));if(Math.hypot(x+dx-a[0]-t*vx,z+dz-a[1]-t*vz)<road.width/2+radius+.3)throw Error(id+' intersects road clearance');}if(x-rx<-.8||x+rx>10.8||z-rz< -51.6||z+rz> -38.15)throw Error(id+' outside yard');if(z< -47.5&&x+rx>3.6&&x-rx<6.4)throw Error(id+' blocks entry');reservations.push({id,x:x+dx,z:z+dz,rx,rz});}
 function leaf(x,y,z,a,h=.34){form('leaf','leaf',x+Math.cos(a)*h*.23,y+h*.37,z+Math.sin(a)*h*.23,.068,h*.56,.025,Math.sin(a)*.65,a,Math.cos(a)*.65);beam([x,y,z],[x+Math.cos(a)*h*.45,y+h*.69,z+Math.sin(a)*h*.45],.009,'leafLight');}
 function pot(x,z,r=.24,h=.37){reserve('pot',x,z,r*1.15,r*1.15);const y=ground(x,z);const profile=[[0,0],[r*.68,0],[r*.84,h*.12],[r,h*.83],[r*.98,h],[r*.8,h],[r*.79,h*.82],[r*.68,h*.2],[0,h*.2]].map(p=>new THREE.Vector2(...p));const m=new THREE.Mesh(new THREE.LatheGeometry(profile,20),mats.terra);m.position.set(x+dx,y,z+dz);m.castShadow=true;m.receiveShadow=true;g.add(m);ring('terra',x,y+h*.93,z,r*.94);form('cyl','soil',x,y+h*.82,z,r*.78,.026,r*.78);for(let i=0;i<7;i++)leaf(x,y+h*.85,z,i*2.4,r*1.3);}
 // Low wooden vegetable trays with individual boards, corner stakes and planted soil.
 function planter(x,z,w,d,type){reserve('planter',x,z,w/2+.06,d/2+.06);const y=ground(x,z),h=.27;form('box','soil',x,y+.15,z,w-.1,.22,d-.1);for(const s of [-1,1]){for(let k=0;k<3;k++)form('box','wood',x,y+.05+k*.09,z+s*d/2,w,.075,.045);form('box','woodLight',x+s*w/2,y+h/2,z,.045,h,d);for(const t of [-1,1]){form('box','dark',x+s*w/2,y+.17,z+t*d/2,.06,.35,.06);form('ball','iron',x+s*(w/2+.027),y+.2,z+t*(d/2-.05),.014,.014,.014);}}
 for(let i=0;i<6;i++)for(let j=0;j<2;j++){const xx=x-w*.39+i*w*.156,zz=z+(j-.5)*d*.44;if(type==='daikon'){form('ball','radish',xx,y+.28,zz,.065,.13,.065);for(let k=0;k<5;k++)leaf(xx,y+.34,zz,k*1.256+i,.3);}else for(let k=0;k<4;k++){const a=k*1.57;beam([xx,y+.24,zz],[xx+Math.cos(a)*.052,y+.66+(i%3)*.035,zz+Math.sin(a)*.052],.018,k%2?'leaf':'leafLight');}}
 }
 // Two planted boxes fit beside the approach without occupying the gate swing.
 planter(8.05,-48.72,2.3,.72,'daikon');planter(8.85,-49.78,1.2,.56,'scallion');
 // Clothesline with carved pole tops, cross-pieces, sagging rope, folded hems and pegs.
 reserve('laundry',1.7,-48.85,1.42,.25);
 const ends=[[.38,-48.85],[3.02,-48.85]],tops=[];
 for(const [x,z] of ends){const y=ground(x,z);form('cyl','stoneDark',x,y+.065,z,.14,.13,.14);beam([x,y,z],[x,y+2.16,z],.047);form('ball','woodLight',x,y+2.19,z,.058,.055,.058);form('box','wood',x,y+2.04,z,.075,.075,.39);for(let k=0;k<3;k++)ring('rope',x,y+1.99+k*.022,z,.054);tops.push(y+2.06);}
 const ropeY=t=>tops[0]*(1-t)+tops[1]*t-.10*Math.sin(t*Math.PI);
 for(let i=0;i<30;i++){let a=i/30,b=(i+1)/30;beam([.38+2.64*a,ropeY(a),-48.85],[.38+2.64*b,ropeY(b),-48.85],.013,'rope');}
 for(const [start,w,h,mat] of [[.16,.60,.97,'cream'],[.43,.51,.76,'blue'],[.68,.62,1.08,'cream']]){
 const x=.38+2.64*start,top=ropeY(start),pos=[],uv=[],ind=[],nx=16,ny=18;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny;pos.push(x+u*w+dx,top-v*h-.035*Math.sin(u*Math.PI),-48.85+.037*Math.sin(u*8*Math.PI)+.075*v*v*Math.sin(u*Math.PI)+dz);uv.push(u,v);}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const n=j*(nx+1)+i;ind.push(n,n+1,n+nx+1,n+1,n+nx+2,n+nx+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();const cloth=new THREE.Mesh(geo,mats[mat]);cloth.castShadow=true;cloth.receiveShadow=true;g.add(cloth);
 for(const u of [.09,.91]){form('box','woodLight',x+u*w,top+.018,-48.86,.028,.11,.037,0,0,.12);form('box','iron',x+u*w,top+.025,-48.883,.03,.014,.009);}
 for(let i=0;i<16;i++){const u=i/16,v=(i+1)/16;beam([x+u*w,top-h-.035*Math.sin(u*Math.PI),-48.85+.037*Math.sin(u*8*Math.PI)+.075*Math.sin(u*Math.PI)],[x+v*w,top-h-.035*Math.sin(v*Math.PI),-48.85+.037*Math.sin(v*8*Math.PI)+.075*Math.sin(v*Math.PI)],.007,mat);}
 }
 // Wash basket: woven side strips, crossing base strips, stout bound rim and two handles.
 {const x=2.35,z=-50.05,r=.31,y=ground(x,z);reserve('basket',x,z,.37,.37);form('cyl','straw',x,y+.045,z,r*.76,.07,r*.76);for(let k=0;k<10;k++)ring(k%2?'straw':'strawLight',x,y+.07+k*.027,z,r*(.77+k*.023));for(let k=0;k<24;k++){const a=k*Math.PI/12;beam([x+Math.cos(a)*r*.77,y+.055,z+Math.sin(a)*r*.77],[x+Math.cos(a)*r,y+.33,z+Math.sin(a)*r],.012,'strawLight');}ring('strawLight',x,y+.34,z,r);for(const s of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x+s*r+dx,y+.23,z-.09+dz),new THREE.Vector3(x+s*(r+.035)+dx,y+.46,z+dz),new THREE.Vector3(x+s*r+dx,y+.23,z+.09+dz)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,12,.021,6,false),mats.straw));}form('ball','cream',x,y+.18,z,.22,.095,.19);form('box','blue',x+.035,y+.25,z,.31,.025,.24,0,.3,.08);}
 // Water barrel with separated staves, dark open interior and iron hoops.
 {const x=.82,z=-50.13,r=.32,h=.72,y=ground(x,z);reserve('barrel',x,z,.36,.36);form('cyl','dark',x,y+.07,z,r*.86,.1,r*.86);for(let i=0;i<20;i++){const a=i*Math.PI/10;form('box',i%3?'wood':'woodLight',x+Math.cos(a)*r*.93,y+h/2,z+Math.sin(a)*r*.93,.088,h,.045,0,-a+Math.PI/2);}for(const yy of [.1,.32,.63])ring('iron',x,y+yy,z,r);form('cyl','glaze',x,y+.51,z,r*.84,.015,r*.84);ring('woodLight',x,y+h,z,r*.93);form('box','woodLight',x,y+h+.025,z,.12,.055,.78,0,.23);}
 // Stone lantern: broad foot, tapered column, open four-pier light chamber, carved roof and finial.
 {const x=9.6,z=-50.57,y=ground(x,z);reserve('lantern',x,z,.48,.48);form('box','stoneDark',x,y+.10,z,.73,.2,.73);form('cyl','stone',x,y+.28,z,.29,.19,.29);form('cyl','stone',x,y+.73,z,.125,.74,.125);ring('stoneDark',x,y+.43,z,.145);form('box','stone',x,y+1.15,z,.49,.16,.49);for(const sx of [-1,1])for(const sz of [-1,1])form('box','stone',x+sx*.19,y+1.43,z+sz*.19,.095,.44,.095);form('box','stoneDark',x,y+1.225,z,.29,.035,.29);form('cyl','cream',x,y+1.31,z,.055,.16,.055);form('box','stone',x,y+1.68,z,.57,.13,.57);const roof=new THREE.Mesh(new THREE.CylinderGeometry(.18,.65,.25,4),mats.stone);roof.rotation.y=Math.PI/4;roof.position.set(x+dx,y+1.86,z+dz);roof.castShadow=true;g.add(roof);form('ball','stone',x,y+2.08,z,.10,.13,.10);form('ball','moss',x-.23,y+.215,z+.17,.13,.014,.09);}
 pot(7.16,-50.42,.23,.36);pot(10.0,-47.5,.19,.3);
 // Shallow rear strip: nothing tall, no wall or eave interference.
 pot(1.35,-38.86,.16,.23);pot(1.84,-38.86,.17,.25);pot(2.36,-38.86,.15,.22);
 {const x=7.8,z=-38.86,y=ground(x,z);reserve('rear-wood',x,z,.66,.2);for(const s of [-1,1])form('box','dark',x+s*.49,y+.055,z,.1,.11,.32);for(let row=0;row<2;row++)for(let i=0;i<6-row;i++){const xx=x-.5+i*.2+row*.1,yy=y+.16+row*.15;beam([xx,yy,z-.16],[xx,yy,z+.16],.085,'wood');form('cyl','woodLight',xx,yy,z-.167,.069,.014,.069,Math.PI/2);form('cyl','woodLight',xx,yy,z+.167,.069,.014,.069,Math.PI/2);form('cyl','dark',xx+.015,yy,z-.176,.014,.006,.014,Math.PI/2);}}
 for(const [key,items] of Object.entries(batches)){const [shape,mat]=key.split('|'),m=new THREE.InstancedMesh(geos[shape],mats[mat],items.length);items.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;g.add(m);}
 g.userData.reservations=reservations;return g;
}
