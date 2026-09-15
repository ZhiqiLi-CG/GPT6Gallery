import {heightAt,roadNetwork,layout} from './root.js';
import {createHouse,kit,roadClear} from './east-village.js';

// All dimensions in metres and all helpers use world positions.
export function build(THREE,ctx){
 const all=new THREE.Group();all.name='east-village-shore complete fisher households';
 const lots=layout().lots.filter(l=>l.id==='east-village-lot-1'||l.id==='east-village-lot-2');
 const lane=roadNetwork().find(r=>r.id==='east-lane');
 for(let index=0;index<lots.length;index++){
  const lot=lots[index],west=index===0,k=kit(THREE),{box,beam,ball,cylinder}=k,g=k.group;
  g.name='east-village-shore_'+(west?'weatherboard-household':'plaster-household');
  const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.93,side:THREE.DoubleSide});
  const clay=mat(0x9b7157),cloths=[mat(0xbebaa2),mat(0x647c81),mat(0x9eac9f)],netMat=mat(0x776d4d);
  function mesh(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
  function line(points,r=.018,m=k.mats.rope){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*3),r,5,false),m)}
  function ring(x,y,z,r,t=.025,m=k.mats.rope){const o=mesh(new THREE.TorusGeometry(r,t,5,32),m,x,y,z);o.rotation.x=Math.PI/2;return o}
  function patch(x,z,w,d){const geo=new THREE.PlaneGeometry(w,d,12,10);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(x+p.getX(i),z+p.getZ(i))+.018);geo.computeVertexNormals();mesh(geo,k.mats.soil,x,0,z)}
  function foot(x,z,h=.2){const y=heightAt(x,z);box(x,y+h/2-.06,z,.36,h,.36,'stone');return y+h-.06}
  function fence(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.45);let prev;
   for(let j=0;j<=n;j++){const x=a[0]+(b[0]-a[0])*j/n,z=a[1]+(b[1]-a[1])*j/n,y=heightAt(x,z);if(!roadClear(x,z,.16))continue;
    box(x,y+.57,z,.13,1.2,.13,'beam');box(x,y+1.2,z,.18,.07,.18,'board');
    if(prev)for(const h of [.36,.9])beam([prev[0],prev[2]+h,prev[1]],[x,y+h,z],.045,'wood');
    if(prev)for(let q=1;q<5;q++){const xx=prev[0]+(x-prev[0])*q/5,zz=prev[1]+(z-prev[1])*q/5,yy=heightAt(xx,zz);box(xx,yy+.65,zz,.037,.87,.055,'board')}
    prev=[x,z,y];
   }
  }
  function vessel(x,z,r=.35,h=.62,type='barrel'){
   const y=heightAt(x,z),m=type==='pot'?clay:k.mats.board;
   const points=[new THREE.Vector2(0,0),new THREE.Vector2(r*.75,0),new THREE.Vector2(r,.25*h),new THREE.Vector2(r*.94,h),new THREE.Vector2(r*.78,h),new THREE.Vector2(r*.79,.16*h),new THREE.Vector2(0,.16*h)];
   mesh(new THREE.LatheGeometry(points,20),m,x,y+.02,z);
   for(const hh of [h*.2,h*.83,h])ring(x,y+.02+hh,z,r*(hh===h?.94:.99),.023,type==='pot'?clay:k.mats.dark);
   if(type!=='pot')for(let i=0;i<18;i++){const a=i*Math.PI/9;beam([x+r*.78*Math.cos(a),y+.05,z+r*.78*Math.sin(a)],[x+r*.96*Math.cos(a),y+h,z+r*.96*Math.sin(a)],.009,'beam')}
   if(type==='barrel'){cylinder(x,y+h+.045,z,r*.88,.05,'board');for(let j=-2;j<=2;j++)box(x+j*r*.3,y+h+.075,z,.016,.012,Math.sqrt(Math.max(.01,r*r*.73-(j*r*.3)**2))*2,'beam')}
   if(type==='tub'){cylinder(x,y+.19,z,r*.77,.018,'glass');box(x,y+h+.08,z,r*1.7,.055,.15,'board',0,.25,0)}
   if(type==='pot'){cylinder(x,y+h*.85,z,r*.74,.04,'soil');for(let j=0;j<7;j++){const a=j*2.4,px=x+Math.cos(a)*r*.45,pz=z+Math.sin(a)*r*.45;beam([px,y+h*.8,pz],[px+.06,y+h+.33,pz],.012,'leaf');ball(px+.04,y+h+.24,pz,.12,.08,.055,'leaf')}}
  }
  function basket(x,z,r=.34){const y=heightAt(x,z),h=.47;
   cylinder(x,y+.04,z,r*.71,.07,'board');
   for(let j=0;j<9;j++)ring(x,y+.075+j*.046,z,r*(.74+j*.028),.016);
   for(let j=0;j<22;j++){const a=j*Math.PI/11;beam([x+r*.72*Math.cos(a),y+.055,z+r*.72*Math.sin(a)],[x+r*.98*Math.cos(a),y+h,z+r*.98*Math.sin(a)],.012,'rope')}
   ring(x,y+h,z,r,.025);
   for(const s of [-1,1])line([[x+s*r,y+h-.08,z-.12],[x+s*(r+.06),y+h+.15,z],[x+s*r,y+h-.08,z+.12]],.023);
   for(let j=0;j<4;j++){const xx=x-.16+j*.1;ball(xx,y+.18+j*.025,z,.065,.04,.21,'stone2');box(xx,y+.19+j*.025,z+.2,.10,.016,.10,'gray',0,.7,0)}
  }
  function coil(x,z,r=.38){const y=heightAt(x,z);for(let c=0;c<4;c++)ring(x,y+.035+c*.027,z,r-c*.054,.024);line([[x+r,y+.05,z],[x+r+.20,heightAt(x+r+.2,z)+.04,z-.12],[x+r+.36,heightAt(x+r+.36,z-.28)+.04,z-.28]],.025)}
  function shed(x,z,w=2.6,d=3.4){
   const y=Math.max(...[-1,1].flatMap(s=>[-1,1].map(t=>heightAt(x+s*w/2,z+t*d/2))))+.17,eave=y+2.03,rise=.72,half=w/2+.24;
   // Individual foundations, a raised slatted floor and four stout braced corners.
   for(const s of [-1,1])for(const t of [-1,1]){const px=x+s*(w/2-.12),pz=z+t*(d/2-.12),gy=heightAt(px,pz);box(px,(gy+y)/2,pz,.38,y-gy+.15,.38,'stone');box(px,y+1.04,pz,.14,2.16,.14,'beam')}
   // Coursed retaining foundation follows the slope beneath the level storage floor.
   for(const axis of ['x','z'])for(const sign of [-1,1]){const length=axis==='x'?d:w,n=Math.ceil(length/.42);for(let j=0;j<n;j++){const u=-length/2+(j+.5)*length/n,px=x+(axis==='x'?sign*(w/2-.05):u),pz=z+(axis==='z'?sign*(d/2-.05):u),gy=heightAt(px,pz)-.10;for(let yy=gy;yy<y-.035;yy+=.22){const hh=Math.min(.21,y-.035-yy);box(px,yy+hh/2,pz,axis==='x'?.24:length/n-.016,hh,axis==='z'?.24:length/n-.016,(j+Math.floor(yy*5))%3?'stone':'stone2')}}}
   const stairX=x+.25,frontZ=z+d/2;
   const drop=y-heightAt(stairX,frontZ+.18),steps=Math.max(1,Math.ceil(drop/.22));
   for(let j=0;j<steps;j++){const zz=frontZ+.17+j*.29,gy=heightAt(stairX,zz),top=y-.035-j*.21;if(top>gy)box(stairX,(gy+top)/2,zz,.85,top-gy+.04,.32,'stone2')}
   for(let j=0;j<Math.ceil(w/.19);j++)box(x-w/2+.1+j*.19,y,z,.18,.11,d,'board');
   for(const s of [-1,1]){box(x+s*w/2,eave,z,.13,.17,d+.1,'wood');for(let j=0;j<12;j++){const pz=z-d/2+(j+.5)*d/12;box(x+s*w/2,y+.78,pz,.065,1.5,d/12-.022,'board')}
    beam([x+s*w/2,y+.23,z-d/2],[x+s*w/2,y+1.65,z-d/2+.83],.055,'beam')}
   for(let j=0;j<13;j++)box(x-w/2+(j+.5)*w/13,y+.87,z-d/2,w/13-.015,1.7,.07,'board');
   for(const t of [-1,1]){beam([x-w/2,eave,z+t*d/2],[x,eave+rise,z+t*d/2],.065,'beam');beam([x,eave+rise,z+t*d/2],[x+w/2,eave,z+t*d/2],.065,'beam')}
   const slope=Math.atan2(rise,half),len=Math.hypot(half,rise);
   for(const s of [-1,1]){box(x+s*half/2,eave+rise/2,z,len,.11,d+.5,'dark',0,0,-s*slope);
    for(let j=0;j<10;j++)beam([x,eave+rise-.1,z-d/2-.2+j*(d+.4)/9],[x+s*half,eave-.12,z-d/2-.2+j*(d+.4)/9],.038,'wood');
    for(let a=0;a<6;a++)for(let b=0;b<14;b++){const t=(a+.5)/6,zz=z-(d+.5)/2+(b+.5)*(d+.5)/14;box(x+s*half*t,eave+rise*(1-t)+.09,zz,len/6+.04,.075,(d+.5)/14-.01,(a+b)%4?'tile':'tile2',0,0,-s*slope);beam([x+s*half*a/6,eave+rise*(1-a/6)+.13,zz],[x+s*half*(a+1)/6,eave+rise*(1-(a+1)/6)+.13,zz],.028,'tile2')}
   }
   for(let j=0;j<13;j++)beam([x,eave+rise+.16,z-d/2-.23+j*(d+.46)/13],[x,eave+rise+.16,z-d/2-.23+(j+1)*(d+.46)/13],.09,'tile2');
   // Rear shelf, stacked rope and poles remain visible through the open front.
   box(x,y+.87,z-.85,w-.28,.10,.48,'wood');for(let j=0;j<4;j++)ring(x-.7+j*.44,y+.95,z-.85,.17,.025);
   for(let j=0;j<5;j++)beam([x-.8+j*.27,y+.12,z-1.0],[x-.64+j*.27,y+1.78,z-1.12],.034,'board');
  }
  function netFrame(x,z,w=4.4){const base=Math.max(heightAt(x-w/2,z),heightAt(x+w/2,z)),top=base+2.43,bottom=base+.48;
   for(const s of [-1,1]){const px=x+s*w/2,gy=foot(px,z);box(px,(gy+top)/2,z,.17,top-gy+.2,.17,'beam');beam([px,gy+.1,z-.58],[px,top-.55,z],.058,'wood');beam([px,gy+.1,z+.48],[px,top-.65,z],.058,'wood')}
   beam([x-w/2-.13,top,z],[x+w/2+.13,top,z],.085,'wood');
   const x0=x-w/2+.15,x1=x+w/2-.15,y0=bottom,y1=top-.14,step=.18;
   // Intersect two diagonal rope families with the rectangular opening: actual open mesh.
   for(const slope of [-1,1])for(let c=y0-(x1-x0);c<y1+(x1-x0);c+=step){const hits=[];for(const xx of [x0,x1]){const yy=c+slope*(xx-x0);if(yy>=y0&&yy<=y1)hits.push([xx,yy,z+.018])}for(const yy of [y0,y1]){const xx=x0+(yy-c)/slope;if(xx>=x0&&xx<=x1)hits.push([xx,yy,z+.018])}if(hits.length>=2)beam(hits[0],hits[1],.011,'rope')}
   for(const yy of [y0,y1])beam([x0,yy,z],[x1,yy,z],.022,'rope');for(const xx of [x0,x1])beam([xx,y0,z],[xx,y1,z],.022,'rope');
   for(let j=0;j<13;j++){const xx=x0+j*(x1-x0)/12;beam([xx,top+.06,z],[xx,y1-.05,z],.017,'rope');ball(xx,y1-.1,z+.05,.065,.095,.06,j%3?'board':'cream');ball(xx,y0,z,.037,.055,.033,'stone')}
  }
  function laundry(x,z){const y=Math.max(heightAt(x,z-1.7),heightAt(x,z+1.7))+2.2;for(const s of [-1,1]){const gy=foot(x,z+s*1.7);box(x,(gy+y)/2,z+s*1.7,.095,y-gy+.05,.095,'wood');beam([x-.25,y,z+s*1.7],[x+.25,y,z+s*1.7],.04,'wood')}
   line([[x,y,z-1.7],[x,y-.14,z],[x,y,z+1.7]],.014);
   for(let n=0;n<3;n++){const zz=z-1.14+n*.9,ww=.69,hh=n===1?1.18:.82,geo=new THREE.PlaneGeometry(ww,hh,8,8),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i);p.setXYZ(i,.08*Math.sin(u*18+v*5)*(hh/2-v)/hh,v,u)}geo.computeVertexNormals();mesh(geo,cloths[n],x,y-.10-hh/2,zz);
    for(const s of [-1,1])box(x,y-.09,zz+s*ww*.4,.045,.12,.04,'board');
   }
  }
  function garden(x,z,w=4.6){patch(x,z,w,1.55);for(const s of [-1,1])for(let j=0;j<12;j++){const xx=x-w/2+(j+.5)*w/12,zz=z+s*.78,yy=heightAt(xx,zz);box(xx,yy+.065,zz,w/12-.02,.16,.15,'stone')}
   for(let row=0;row<3;row++)for(let j=0;j<13;j++){const xx=x-w/2+.26+j*(w-.5)/12,zz=z-.48+row*.48,yy=heightAt(xx,zz);ball(xx,yy+.047,zz,.16,.07,.15,'soil');
    for(let l=0;l<5;l++){const a=l*2.4+j,hh=.14+.08*(row%2);beam([xx,yy+.06,zz],[xx+Math.sin(a)*.08,yy+hh+.07,zz+Math.cos(a)*.07],.012,'leaf');ball(xx+Math.sin(a)*.11,yy+hh,zz+Math.cos(a)*.1,.11,.045,.055,'leaf')}
   }
  }
  function tools(x,z){const y=heightAt(x,z);beam([x,y+.08,z],[x+.18,y+1.45,z],.024,'board');box(x,y+.11,z,.22,.3,.055,'dark',0,0,-.1);beam([x+.43,y+.11,z],[x+.48,y+1.5,z],.025,'board');box(x+.42,y+.18,z,.39,.055,.10,'wood');for(let i=0;i<7;i++)box(x+.25+i*.055,y+.08,z,.016,.20,.022,'wood');
   beam([x+.85,y+.1,z],[x+.97,y+1.35,z],.023,'wood');for(let j=0;j<9;j++)beam([x+.86,y+.45,z],[x+.70+j*.035,y+.05,z+.08*Math.sin(j)],.016,'rope')}
  function lantern(x,z){const y=heightAt(x,z);box(x,y+.11,z,.65,.25,.65,'stone');box(x,y+.3,z,.46,.16,.46,'stone2');cylinder(x,y+.69,z,.13,.65,'stone');box(x,y+1.05,z,.47,.13,.47,'stone2');box(x,y+1.28,z,.34,.37,.34,'dark');for(const s of [-1,1])for(const t of [-1,1])box(x+s*.18,y+1.28,z+t*.18,.09,.42,.09,'stone');box(x,y+1.52,z,.61,.14,.61,'stone2');const roof=mesh(new THREE.ConeGeometry(.47,.28,4),k.mats.stone,x,y+1.7,z);roof.rotation.y=Math.PI/4;ball(x,y+1.91,z,.095,.14,.095,'stone')}
  function cherry(x,z){const y=heightAt(x,z);beam([x,y-.12,z],[x+.14,y+2.15,z+.08],.13,'beam');for(let j=0;j<7;j++){const a=j*2.4,ex=x+Math.cos(a)*(1.0+(j%2)*.25),ez=z+Math.sin(a)*(1.0+(j%2)*.25),ey=y+2.4+(j%3)*.35;beam([x+.1,y+1.4+(j%3)*.17,z],[ex,ey,ez],.055,'wood');for(let b=0;b<3;b++){const px=ex+.25*Math.sin(j+b*3),pz=ez+.28*Math.cos(j+b*3),py=ey+.25+b*.10;beam([ex,ey,ez],[px,py,pz],.022,'wood');for(let c=0;c<8;c++){const a2=c*2.4+j;const cx=px+.27*Math.cos(a2),cy=py+.19*Math.sin(c*1.7),cz=pz+.27*Math.sin(a2);for(let petal=0;petal<5;petal++){const pa=petal*Math.PI*2/5;ball(cx+.074*Math.sin(pa),cy+.032*Math.cos(pa*2),cz+.074*Math.cos(pa),.075,.055,.068,c%7?'pink':'cream')}ball(cx,cy+.035,cz,.025,.027,.025,'cream')}}}for(let j=0;j<21;j++){const px=x+1.2*Math.sin(j*2.4),pz=z+1.2*Math.cos(j*2.4);ball(px,heightAt(px,pz)+.025,pz,.045,.015,.035,'pink')}}
  const house=createHouse(THREE,lot,{w:6.6,d:6.8,stories:west?1:2,tone:west?'gray':'plaster',rise:west?1.95:2.15,ridgeAcross:!west});g.add(house);
  // Timber lap cladding respects every recessed opening on the low home.
  if(west){const base=house.userData.base;for(const axis of ['x','z'])for(const sign of [-1,1]){const len=axis==='x'?6.8:6.6,bw=len/3,front=axis==='x'&&sign===1;
   for(let bay=0;bay<3;bay++){const mid=-len/2+(bay+.5)*bw,door=front&&bay===1,ow=door?1.36:1.42,lo=door?0:.91,hi=door?2.15:2.01;
    for(let r=0;r<15;r++){const yy=.10+r*.172;let spans=[[mid-bw/2+.08,mid+bw/2-.08]];if(yy+.085>lo&&yy-.085<hi)spans=[[mid-bw/2+.08,mid-ow/2-.10],[mid+ow/2+.1,mid+bw/2-.08]];
     for(const [a,b] of spans)if(b>a){const u=(a+b)/2;box(lot.x+(axis==='x'?sign*3.39:u),base+yy,lot.z+(axis==='z'?sign*3.49:u),axis==='x'?.045:b-a,.151,axis==='z'?.045:b-a,r%4?'board':'wood')}
    }
   }
  }}
  // Short plaster cooking flue, flashed into a roof slope and protected by a ceramic cap.
  {const cx=lot.x+1.65,cz=lot.z-1.9,roofY=house.userData.base+house.userData.h+(west?1.95*(1-1.65/3.97):2.15*(1-1.9/4.07));box(cx,roofY+.25,cz,.38,.85,.42,'gray');box(cx,roofY+.65,cz,.42,.12,.46,'dark');for(const a of [-1,1])box(cx+a*.16,roofY+.79,cz,.06,.25,.38,'stone');box(cx,roofY+.93,cz,.59,.09,.61,'tile')}
  const outer=west?-.35:32.2,inner=west?13.35:17.65,south=-57.45,north=-41.0;
  fence([outer,south],[inner,south]);fence([outer,north],[inner,north]);fence([outer,south],[outer,north]);fence([inner,south],[inner,-49.05]);fence([inner,-46.95],[inner,north]);
  for(const zz of [-49.05,-46.95]){const y=heightAt(inner,zz);box(inner,y+.76,zz,.20,1.55,.20,'beam');box(inner,y+1.54,zz,.27,.08,.27,'board')}
  // Paths are supplied by the parent's lane-edge helper. Yard stones branch away from the porch.
  for(let j=0;j<9;j++){const x=west?12.25:18.8,z=-49.2-j*.68;if(roadClear(x,z,.29))box(x,heightAt(x,z)+.08,z,.47,.15,.46,'stone2',0,.18*Math.sin(j),0)}
  patch(west?8:23,-55.25,5.8,3.0);shed(west?1.6:30.15,-53.7,2.55,3.5);netFrame(west?8:23,-55.55,4.4);
  garden(west?8:23,-42.3,4.7);laundry(west?2.0:29.9,-47.45);
  for(let j=0;j<3;j++)vessel((west?4.75:26.5)+j*.78,-53.25,.30,.52,'pot');
  vessel(west?3.45:28.3,-52.3,.36,.72,'barrel');vessel(west?3.5:28.25,-51.35,.31,.61,'barrel');
  vessel(west?11.55:19.15,-53.65,.45,.42,'tub');vessel(west?11.6:19.2,-54.8,.3,.47,'pot');
  basket(west?6.1:21.1,-54.2);basket(west?7.0:22.05,-54.15,.29);coil(west?9.5:24.6,-54.1);coil(west?10.4:25.5,-54.3,.3);
  tools(west?1.0:29.4,-51.75);lantern(west?12.65:18.38,-46.3);
  if(west)cherry(1.65,-42.9);
  // An outdoor low mending bench, spare floats and hand needle.
  const bx=west?10.1:25.15,bz=-56.8,by=heightAt(bx,bz);box(bx,by+.43,bz,1.25,.09,.4,'board');for(const s of [-1,1])box(bx+s*.46,by+.2,bz,.1,.43,.32,'wood');for(let j=0;j<4;j++)ball(bx-.35+j*.22,by+.54,bz,.075,.10,.07,'cream');beam([bx-.4,by+.52,bz-.1],[bx+.3,by+.52,bz-.1],.015,'wood');
  // Hanged float strings on the shed-side wall, with real connecting rope.
  const fx=west?2.92:28.83,fz=-53.7,fy=heightAt(fx,fz);for(let s=0;s<2;s++){line([[fx,fy+1.8,fz-.55+s*.7],[fx+.05,fy+1.1,fz-.5+s*.7],[fx,fy+.45,fz-.6+s*.7]],.018);for(let j=0;j<6;j++)ball(fx+.045,fy+.55+j*.21,fz-.55+s*.7,.09,.115,.085,j%2?'cream':'board')}
  all.add(k.flush());
 }
 return all;
}
