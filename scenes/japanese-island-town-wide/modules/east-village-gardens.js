import {heightAt,roadNetwork,layout} from './root.js';
import {createHouse,kit,roadClear} from './east-village.js';

export function build(THREE,ctx){
 const out=new THREE.Group(); out.name='east-village-gardens kitchen garden fisher households';
 const pots=new THREE.MeshStandardMaterial({color:0x946952,roughness:.95,side:THREE.DoubleSide});
 const cloths=[0xc5c0a7,0x647985,0xa3a893].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));
 for(const [i,lotId] of ['east-village-lot-5','east-village-lot-6'].entries()){
 const lot=layout().lots.find(l=>l.id===lotId),g=new THREE.Group(); g.name='east-village-gardens_'+(i?'east':'west');
 const k=kit(THREE),{box,cylinder,ball,beam}=k;g.add(k.group);k.mats.sage=new THREE.MeshStandardMaterial({color:0x7b9161,roughness:1});
 g.add(createHouse(THREE,lot,{w:6.5,d:6.8,stories:i?2:1,tone:i?'gray':'cream',ridgeAcross:!i,rise:i?2.1:1.95}));
 const ground=(x,z)=>heightAt(x,z);
 function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;k.group.add(m);return m;}
 function torus(x,y,z,r,t,m='dark',rx=Math.PI/2){const o=mesh(new THREE.TorusGeometry(r,t,5,24),k.mats[m],x,y,z);o.rotation.x=rx;return o;}
 function fence(a,b){let n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.35);for(let j=0;j<=n;j++){let t=j/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=ground(x,z);if(!roadClear(x,z,.12))continue;box(x,y+.49,z,.14,1.04,.14,'wood');box(x,y+1.03,z,.2,.08,.2,'board');if(j<n){let tt=(j+1)/n,nx=a[0]+(b[0]-a[0])*tt,nz=a[1]+(b[1]-a[1])*tt,ny=ground(nx,nz);for(let h of [.38,.78])beam([x,y+h,z],[nx,ny+h,nz],.045,'board');for(let s=1;s<4;s++){let px=x+(nx-x)*s/4,pz=z+(nz-z)*s/4,py=ground(px,pz);cylinder(px,py+.57,pz,.022,.67,'wood');}}}}
 const xmin=i?17.8:.15,xmax=i?30.1:13.2,zmin=-19.9,zmax=-2.65,front=i?xmin:xmax,back=i?xmax:xmin;
 fence([xmin,zmin],[xmax,zmin]);fence([xmin,zmax],[xmax,zmax]);fence([back,zmin],[back,zmax]);fence([front,zmin],[front,-11]);fence([front,-9],[front,zmax]);
 // Soil beds have individual retained cells fitted to the rising terrain.
 function garden(x,z,w,d){for(let r=0;r<3;r++){let zz=z+(r-1)*.9;for(let p=0;p<10;p++){let xx=x-w/2+(p+.5)*w/10,yy=ground(xx,zz);box(xx,yy+.07,zz,w/10+.01,.18,.65,'soil');}for(let s of [-1,1])for(let p=0;p<10;p++){let xx=x-w/2+(p+.5)*w/10,zz2=zz+s*.37,yy=ground(xx,zz2);box(xx,yy+.14,zz2,w/10-.01,.25,.08,'board');}for(let s of [-1,1]){let xx=x+s*w/2;box(xx,ground(xx,zz)+.14,zz,.08,.26,.81,'wood');}
 for(let p=0;p<6;p++){let xx=x-w/2+.34+p*(w-.68)/5,yy=ground(xx,zz)+.18;if(r<2){ball(xx,yy+.16,zz,.18,.2,.18,'leaf');for(let a=0;a<7;a++){let ang=a*Math.PI*2/7;ball(xx+Math.cos(ang)*.16,yy+.09,zz+Math.sin(ang)*.16,.16,.07,.13,a%2?'leaf':'sage');beam([xx,yy+.14,zz],[xx+Math.cos(ang)*.25,yy+.1,zz+Math.sin(ang)*.25],.009,'leaf');}}else{cylinder(xx,yy+.91,zz,.027,1.9,'wood');for(let n=0;n<9;n++){let h=n*.17;beam([xx+.045*Math.sin(n),yy+h,zz+.04*Math.cos(n)],[xx+.045*Math.sin(n+1),yy+h+.17,zz+.04*Math.cos(n+1)],.015,'leaf');ball(xx+(n%2?-.12:.12),yy+h+.1,zz,.13,.047,.065,'leaf');} } }
 }let yy=ground(x,z+.9)+1.94;beam([x-w/2+.25,yy,z+.9],[x+w/2-.25,yy,z+.9],.025,'rope');}
 garden(i?21.4:8.6,-17.4,4.2,2.6);
 function pot(x,z,r=.25,h=.45,plant=false){let y=ground(x,z);const pts=[[.55*r,0],[.83*r,.08*h],[r,.55*h],[.8*r,.92*h],[.85*r,h],[.69*r,h],[.64*r,.88*h],[.78*r,.55*h],[.45*r,.16*h]].map(p=>new THREE.Vector2(...p));mesh(new THREE.LatheGeometry(pts,16),pots,x,y,z);cylinder(x,y+.16*h,z,r*.55,.035,'soil');if(plant){for(let a=0;a<5;a++){let an=a*1.256;beam([x,y+.2,z],[x+Math.cos(an)*.16,y+h+.18,z+Math.sin(an)*.16],.015,'leaf');ball(x+Math.cos(an)*.14,y+h+.14,z+Math.sin(an)*.14,.12,.08,.15,'leaf');}}}
 function bucket(x,z){let y=ground(x,z),r=.22;for(let a=0;a<14;a++){let an=a/14*Math.PI*2;box(x+Math.cos(an)*r,y+.19,z+Math.sin(an)*r,.085,.38,.045,'board',0,-an+Math.PI/2);}cylinder(x,y+.05,z,.2,.06,'wood');for(let h of [.08,.31])torus(x,y+h,z,r,.016);let handle=torus(x,y+.35,z,r*.95,.017,'dark',0);handle.scale.y=.8;cylinder(x,y+.13,z,.18,.012,'glass');}
 function barrel(x,z){let y=ground(x,z),r=.37;for(let a=0;a<18;a++){let an=a/18*Math.PI*2;box(x+Math.cos(an)*r,y+.43,z+Math.sin(an)*r,.125,.86,.062,a%3?'wood':'board',0,-an+Math.PI/2);}for(let h of [.12,.42,.73])torus(x,y+h,z,r+.025,.026);cylinder(x,y+.8,z,r-.01,.055,'board');for(let a=-2;a<=2;a++)box(x+a*.115,y+.83,z,.016,.015,Math.sqrt(Math.max(0,r*r-(a*.115)**2))*2,'wood');}
 function tools(x,z){let y=ground(x,z);beam([x,y+.02,z],[x+.2,y+1.45,z+.08],.029,'board');box(x-.03,y+.1,z,.27,.25,.06,'dark');beam([x+.2,y+1.45,z+.08],[x+.45,y+1.45,z+.08],.03,'wood');beam([x+.5,y+.03,z],[x+.62,y+1.5,z],.027,'wood');box(x+.5,y+.12,z,.45,.055,.07,'wood');for(let a=0;a<6;a++)box(x+.3+a*.08,y+.07,z+.06,.022,.17,.025,'dark');}
 function shed(x,z,lean){const w=3.1,d=2.8,ys=[ground(x-w/2,z-d/2),ground(x+w/2,z-d/2),ground(x-w/2,z+d/2),ground(x+w/2,z+d/2)],base=Math.max(...ys)+.12,eave=base+1.95,rise=lean?.55:.7;
 for(let sx of [-1,1])for(let sz of [-1,1]){let xx=x+sx*(w/2-.12),zz=z+sz*(d/2-.12),yy=ground(xx,zz);box(xx,(yy+base)/2,zz,.35,base-yy+.18,.35,'stone');box(xx,base+.96,zz,.13,1.96,.13,'beam');}
 for(let p=0;p<15;p++){let xx=x-w/2+.11+p*(w-.22)/14;box(xx,base+.83,z-d/2,.18,1.68,.1,p%4?'board':'wood');}
 for(let s of [-1,1]){for(let p=0;p<9;p++)box(x+s*w/2,base+.8,z-d/2+.13+p*.23,.09,1.6,.2,'board');beam([x+s*w/2,base+.1,z-d/2],[x+s*w/2,base+1.7,z+.65],.045,'beam');}
 for(let s of [-1,1])box(x,eave,z+s*d/2,w+.2,.14,.14,'beam');
 for(let p=0;p<13;p++)box(x-w/2+.12+p*.235,base,z,.22,.1,d,'wood');
 if(lean){let angle=Math.atan(rise/(d+.4));box(x,eave+rise/2,z,w+.45,.12,Math.hypot(d+.4,rise),'dark',angle);for(let a=0;a<8;a++)for(let b=0;b<12;b++){let zz=-d/2-.16+a*(d+.32)/7,yy=eave+rise*(.5-zz/(d+.4));box(x-w/2-.15+b*(w+.3)/11,yy+.1,z+zz,.29,.075,.47,(a+b)%4?'tile':'tile2',angle);}for(let a=0;a<7;a++)beam([x-w/2+a*w/6,eave+rise,z-d/2-.2],[x-w/2+a*w/6,eave,z+d/2+.2],.05,'wood');beam([x-w/2-.2,eave+rise+.12,z-d/2-.2],[x+w/2+.2,eave+rise+.12,z-d/2-.2],.08,'tile2');}
 else{let half=w/2+.2,slope=Math.atan(rise/half);for(let s of [-1,1]){box(x+s*half/2,eave+rise/2,z,Math.hypot(half,rise),.12,d+.4,'dark',0,0,-s*slope);for(let a=0;a<5;a++)for(let b=0;b<11;b++){let t=(a+.5)/5;box(x+s*half*t,eave+rise*(1-t)+.09,z-d/2-.12+b*(d+.24)/10,Math.hypot(half,rise)/5+.05,.08,.3,(a+b)%4?'tile':'tile2',0,0,-s*slope);beam([x+s*half*a/5,eave+rise*(1-a/5)+.15,z-d/2-.12+b*(d+.24)/10],[x+s*half*(a+1)/5,eave+rise*(1-(a+1)/5)+.15,z-d/2-.12+b*(d+.24)/10],.029,'tile2');}for(let b=0;b<7;b++)beam([x,eave+rise-.1,z-d/2+b*d/6],[x+s*half,eave-.1,z-d/2+b*d/6],.05,'wood');}for(let b=0;b<11;b++)beam([x,eave+rise+.16,z-d/2-.2+b*.3],[x,eave+rise+.16,z-d/2+.12+b*.3],.09,'tile2');for(let s of [-1,1])for(let a=-6;a<=6;a++){let xx=a*.23;box(x+xx,eave+rise*(1-Math.abs(xx)/half)/2,z+s*d/2,.22,rise*(1-Math.abs(xx)/half),.1,'board');}}
 box(x,base+.65,z-.7,2.35,.14,.6,'board');for(let s of [-1,1])box(x+s*.9,base+.3,z-.7,.09,.65,.1,'wood');for(let a=0;a<7;a++)cylinder(x-.6+a*.18,base+.2,z-.4,.085,.8,'wood',Math.PI/2);return base;}
 shed(i?27.45:2.7,-17.2,!i);
 function net(x,z,w,h){let y=Math.max(ground(x-w/2,z),ground(x+w/2,z));for(let s of [-1,1]){let xx=x+s*w/2,gy=ground(xx,z);cylinder(xx,(gy+y+h)/2,z,.065,y+h-gy+.2,'wood');beam([xx,gy+.1,z+.5],[xx,y+h*.6,z],.032,'wood');}beam([x-w/2,y+h,z],[x+w/2,y+h,z],.03,'rope');const point=(u,v)=>[x-w/2+u*w,y+.35+v*(h-.4)-.14*Math.sin(Math.PI*u),z+.08*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)];for(let a=0;a<=16;a++)for(let b=0;b<9;b++)beam(point(a/16,b/9),point(a/16,(b+1)/9),.008,'rope');for(let b=0;b<=9;b++)for(let a=0;a<16;a++)beam(point(a/16,b/9),point((a+1)/16,b/9),.008,'rope');for(let a=0;a<7;a++){const p=point((a+.5)/7,.96);ball(p[0],p[1],p[2],.06,.09,.06,'board');} }
 function bench(x,z){let y=ground(x,z);box(x,y+.51,z,1.8,.11,.62,'board');for(let a of [-.7,.7])for(let b of [-.21,.21])box(x+a,y+.24,z+b,.09,.52,.09,'wood');for(let r=0;r<5;r++)torus(x-.25,y+.58+r*.016,z,.12+r*.03,.015,'rope');box(x+.52,y+.6,z,.25,.05,.055,'wood',0,.3);}
 if(!i){net(8.2,-3.65,3.6,1.95);bench(4.65,-3.7);}else{net(28.65,-10.7,1.8,1.85);bench(28.55,-7.1);}
 const bx=i?26.2:1.05,bz=-14.1;barrel(bx,bz);barrel(bx+.88,bz+.13);tools(i?28.2:.65,-12.5);
 for(let a=0;a<4;a++)pot((i?24.4:6.1)+a*.52,-15.1,.19+(a%2)*.035,.38+(a%2)*.1,a%2===0);
 bucket(i?24.7:11.2,-18.3);bucket(i?26.2:4.8,-16.7);pot(i?28.6:2.1,-13.05,.32,.55);
 // Narrow stepping routes connect the working yard to the existing house entry.
 for(let a=0;a<11;a++){let x=i?18.35:12.65,z=-16.7+a*.55;if(roadClear(x,z,.25))box(x,ground(x,z)+.055,z,.49,.13,.40,'stone2',0,.08*Math.sin(a));}
 if(i){let x1=19.1,x2=24.5,z=-3.65,top=Math.max(ground(x1,z),ground(x2,z))+2.1;for(let x of [x1,x2]){let y=ground(x,z);cylinder(x,(y+top)/2,z,.065,top-y+.1,'wood');beam([x,y+.04,z+.46],[x,top-.55,z],.04,'wood');}for(let a=0;a<18;a++){let x=x1+(x2-x1)*a/18,nx=x1+(x2-x1)*(a+1)/18;beam([x,top-.15*Math.sin(a/18*Math.PI),z],[nx,top-.15*Math.sin((a+1)/18*Math.PI),z],.017,'rope');}for(let a=0;a<5;a++){let x=19.5+a*.94,yy=top-.15*Math.sin((x-x1)/(x2-x1)*Math.PI),geo=new THREE.PlaneGeometry(.72,a%2?1.05:.8,8,8),p=geo.attributes.position;for(let v=0;v<p.count;v++)p.setZ(v,.045*Math.sin(p.getX(v)*23+a)+.04*Math.cos(p.getY(v)*9));geo.computeVertexNormals();mesh(geo,cloths[a%3],x,yy-(a%2?1.05:.8)/2,z);for(let s of [-1,1])box(x+s*.26,yy+.025,z,.037,.10,.06,'wood');}}
 else{
 // Exactly one compact cherry, branching trunk and clustered individual blossoms.
 let x=1.65,z=-4.2,y=ground(x,z);beam([x,y-.08,z],[x+.15,y+2.1,z],.12,'wood');for(let a=0;a<6;a++){let an=a*2.4,tx=x+Math.cos(an)*.85,tz=z+Math.sin(an)*.85,ty=y+2.35+(a%3)*.25;beam([x+.1,y+1.2+a*.12,z],[tx,ty,tz],.048,'wood');for(let b=0;b<8;b++){let ba=b*2.4,rr=.12+(b%3)*.15;ball(tx+Math.cos(ba)*rr,ty+.05+(b%2)*.2,tz+Math.sin(ba)*rr,.23,.18,.23,b%6?'pink':'leaf');}}
 let lx=12.2,lz=-6.4,ly=ground(lx,lz);box(lx,ly+.11,lz,.73,.22,.7,'stone');cylinder(lx,ly+.52,lz,.18,.75,'stone2');box(lx,ly+.95,lz,.52,.13,.52,'stone');box(lx,ly+1.2,lz,.34,.4,.34,'dark');for(let a of [-1,1])for(let b of [-1,1])box(lx+a*.2,ly+1.2,lz+b*.2,.10,.43,.1,'stone2');cylinder(lx,ly+1.5,lz,.46,.12,'stone');const cap=mesh(new THREE.ConeGeometry(.53,.25,4),k.mats.stone2,lx,ly+1.66,lz);cap.rotation.y=Math.PI/4;ball(lx,ly+1.88,lz,.10,.13,.1,'stone');
 }
 k.flush();out.add(g);
 }
 return out;
}
