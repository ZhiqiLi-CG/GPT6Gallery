import {heightAt,roadNetwork,layout} from './root.js';
import {createHouse,kit,roadClear} from './east-village.js';

// Two complete households. All helpers below operate in world metres.
export function build(THREE,ctx){
 const out=new THREE.Group(); out.name='east-village-upper households';
 const roads=roadNetwork(); // Read the fixed road record alongside layout; roadClear uses this same owner.
 const lots=layout().lots.filter(l=>['east-village-lot-9','east-village-lot-10'].includes(l.id));
 for(const lot of lots){
  const west=lot.x<15, k=kit(THREE), g=k.group;
  g.name=`east-village-upper_${west?'washhouse':'netmakers'}`;
  const clay=new THREE.MeshStandardMaterial({color:0x976b50,roughness:1});
  const indigo=new THREE.MeshStandardMaterial({color:0x526773,roughness:1,side:THREE.DoubleSide});
  const linen=new THREE.MeshStandardMaterial({color:0xc5bda3,roughness:1,side:THREE.DoubleSide});
  function mesh(geo,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function ring(x,y,z,r,t=.025,mat=k.mats.rope,rx=Math.PI/2){return mesh(new THREE.TorusGeometry(r,t,5,24),mat,x,y,z,rx);}
  function footing(x,z,w,d,top){
   const bottom=Math.min(...[-1,1].flatMap(a=>[-1,1].map(b=>heightAt(x+a*w/2,z+b*d/2))))-.12;
   let row=0;
   for(let yy=top-.255;yy>bottom-.27;yy-=.28,row++)for(const side of [-1,1]){
    for(const axis of [0,1]){
     const length=axis?d:w,n=Math.ceil(length/.43);
     for(let i=0;i<n;i++){
      const u=-length/2+(i+.5)*length/n,xx=axis?x+side*w/2:x+u,zz=axis?z+u:z+side*d/2;
      const bot=Math.max(heightAt(xx,zz)-.12,yy),end=Math.min(top,yy+.255);
      if(end>bot)k.box(xx,(bot+end)/2,zz,axis?.23:length/n-.025,end-bot,axis?length/n-.025:.23,(i+row)%4?'stone':'stone2');
     }
    }
   }
  }
  function fence(a,b){
   const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.4),p=[];
   for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=heightAt(x,z);p.push([x,y,z]);
    if(roadClear(x,z,.13)){k.box(x,y+.51,z,.13,1.16,.13,'beam');k.box(x,y+1.10,z,.19,.055,.19,'board');k.box(x,y+.05,z,.27,.17,.25,'stone');}}
   for(let i=1;i<p.length;i++)for(const h of [.37,.83]){const a=p[i-1],b=p[i];if(roadClear((a[0]+b[0])/2,(a[2]+b[2])/2,.12))k.beam([a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.047,'wood');}
  }
  function pot(x,z,r=.24,h=.48,base=null){
   const y=base??heightAt(x,z),pts=[[.01,0],[r*.65,0],[r*.88,h*.13],[r,h*.52],[r*.79,h*.91],[r*.82,h],[r*.67,h],[r*.64,h*.88],[r*.80,h*.50],[r*.52,h*.13],[0,h*.13]].map(p=>new THREE.Vector2(...p));
   mesh(new THREE.LatheGeometry(pts,16),clay,x,y,z);ring(x,y+h*.95,z,r*.75,.028,clay);
  }
  function barrel(x,z,r=.35,h=.82){
   const y=heightAt(x,z);k.cylinder(x,y+h/2,z,r*.90,h,'wood');
   for(let i=0;i<16;i++){const a=i*Math.PI/8;k.box(x+Math.sin(a)*r*.92,y+h/2,z+Math.cos(a)*r*.92,.12,h,.055,i%3?'board':'wood',0,a,0);}
   for(const t of [.12,.34,.79,.93])ring(x,y+h*t,z,r*.99,.026,k.mats.dark);
   k.cylinder(x,y+h+.018,z,r*.88,.04,'board');for(let i=-2;i<=2;i++)k.box(x+i*r*.28,y+h+.046,z,.018,.018,Math.sqrt(r*r-(i*r*.28)**2)*1.6,'wood');
  }
  function basket(x,z,r=.3,h=.37,base=null){
   const y=base??heightAt(x,z);k.cylinder(x,y+.025,z,r*.74,.035,'rope');
   for(let j=0;j<7;j++)ring(x,y+.03+j*h/6,z,r*(.76+.24*j/6),.018);
   for(let i=0;i<18;i++){const a=i*Math.PI/9;k.beam([x+Math.cos(a)*r*.74,y,z+Math.sin(a)*r*.74],[x+Math.cos(a)*r,y+h,z+Math.sin(a)*r],.014,'board');}
   for(const s of [-1,1]){k.beam([x+s*r,y+h,z-.09],[x+s*r,y+h+.14,z],.021,'rope');k.beam([x+s*r,y+h+.14,z],[x+s*r,y+h,z+.09],.021,'rope');}
  }
  function coil(x,z,r=.33,y=null){const yy=y??heightAt(x,z)+.035;for(let i=0;i<5;i++)ring(x,yy+i*.012,z,r-i*.047,.021);}
  function tools(x,z){const y=heightAt(x,z);
   k.beam([x,y+.05,z],[x+.23,y+1.52,z+.11],.031,'board');k.box(x+.23,y+1.50,z+.11,.35,.09,.12,'dark');
   k.beam([x+.34,y+.03,z+.04],[x+.47,y+1.32,z+.16],.027,'wood');
   k.box(x+.34,y+.11,z+.04,.23,.22,.035,'dark',0,0,-.10);
   k.beam([x-.26,y,z+.08],[x-.17,y+1.24,z+.18],.026,'board');
   for(let i=0;i<9;i++)k.beam([x-.17,y+.30,z+.10],[x-.43+i*.065,y+.04,z+.10],.016,'rope');
  }
  function garden(x,z,w=2.55,d=3.05){
   const count=3;
   for(let row=0;row<count;row++){
    const xx=x-w/2+(row+.5)*w/count,rw=w/count-.18;
    for(let j=0;j<9;j++){
     const zz=z-d/2+(j+.5)*d/9,y=heightAt(xx,zz),a=heightAt(xx-rw/2,zz),b=heightAt(xx+rw/2,zz);
     k.box(xx,y+.055,zz,rw,.17,d/9+.015,'soil');
     k.box(xx-rw/2,a+.11,zz,.08,.23,d/9,'stone');k.box(xx+rw/2,b+.11,zz,.08,.23,d/9,'stone');
     k.ball(xx,y+.17,zz,.14,.12,.13,'leaf');
     for(let l=0;l<5;l++){const t=l*1.256+j*.45;k.ball(xx+Math.cos(t)*.13,y+.25,zz+Math.sin(t)*.12,.14,.06,.07,'leaf');}
     if(row===2){k.beam([xx,y+.17,zz],[xx+.035,y+.61,zz],.014,'leaf');k.ball(xx+.09,y+.44,zz,.075,.14,.06,'leaf');}
    }
    for(const s of [-1,1]){const zz=z+s*d/2;k.box(xx,heightAt(xx,zz)+.12,zz,rw,.24,.09,'stone2');}
   }
   // One open irrigation jar and a bamboo watering dipper.
   pot(x+w/2+.35,z-.6,.2,.35);k.beam([x+w/2+.32,heightAt(x+w/2+.32,z-.6)+.32,z-.6],[x+w/2+.17,heightAt(x+w/2+.32,z-.6)+.9,z-.45],.022,'board');
  }
  function shed(x,z,w=2.5,d=3){
   const corners=[[-1,-1],[-1,1],[1,-1],[1,1]],floor=Math.max(...corners.map(([a,b])=>heightAt(x+a*w/2,z+b*d/2)))+.13, eave=floor+1.96,rise=.69,half=w/2+.24,rd=d/2+.25;
   footing(x,z,w,d,floor);
   for(let j=0;j<12;j++)k.box(x-w/2+(j+.5)*w/12,floor+.03,z,w/12-.017,.075,d,'board');
   for(const [a,b] of corners){const xx=x+a*(w/2-.06),zz=z+b*(d/2-.07),gy=heightAt(xx,zz);k.box(xx,(gy+eave)/2,zz,.13,eave-gy,.13,'beam');k.box(xx,gy+.06,zz,.30,.18,.30,'stone2');}
   // Board the rear and side walls; leave a useful open front and storage visibility.
   for(let j=0;j<12;j++)k.box(x-w/2+(j+.5)*w/12,floor+.94,z+d/2,w/12-.018,1.84,.07,'wood');
   for(const s of [-1,1])for(let j=0;j<13;j++)k.box(x+s*w/2,floor+.73,z-d/2+(j+.5)*d/13,.07,1.42,d/13-.018,'board');
   for(const s of [-1,1]){k.box(x,eave,z+s*d/2,w+.12,.13,.14,'beam');k.box(x+s*w/2,eave,z,.13,.13,d,'beam');k.beam([x+s*w/2,floor+1.46,z-d/2],[x+s*(w/2-.4),eave,z-d/2],.05,'wood');}
   const slope=Math.atan2(rise,half),len=Math.hypot(half,rise);
   for(const s of [-1,1]){
    k.box(x+s*half/2,eave+rise/2,z,len,.09,rd*2,'dark',0,0,-s*slope);
    for(let j=0;j<9;j++){const zz=z-rd+j*rd/4;k.beam([x,eave+rise-.08,zz],[x+s*half,eave-.08,zz],.044,'board');}
    for(let a=0;a<5;a++)for(let b=0;b<12;b++){const t=(a+.5)/5,zz=z-rd+(b+.5)*rd/6;k.box(x+s*half*t,eave+rise*(1-t)+.08,zz,len/5+.03,.07,rd/6-.012,(a+b)%3?'tile':'tile2',0,0,-s*slope);k.beam([x+s*half*a/5,eave+rise*(1-a/5)+.12,zz],[x+s*half*(a+1)/5,eave+rise*(1-(a+1)/5)+.12,zz],.028,'tile2');}
   }
   for(let zz=z-rd;zz<z+rd;zz+=.27)k.beam([x,eave+rise+.15,zz],[x,eave+rise+.15,zz+.28],.095,'tile2');
   for(const s of [-1,1])for(let xx=-w/2+.10;xx<w/2;xx+=.20){const hh=rise*(1-Math.abs(xx)/half);k.box(x+xx,eave+hh/2,z+s*d/2,.19,hh,.065,'board');}
   // Shelves, stacked split logs and two baskets under cover.
   k.box(x,floor+.97,z+d/2-.30,w-.20,.07,.48,'board');
   for(let i=0;i<8;i++)k.cylinder(x-w*.31+(i%4)*.23,floor+.18+Math.floor(i/4)*.19,z+d*.20,.095,.69,'wood',Math.PI/2,0,0);
   basket(x-.50,z+.8,.23,.32,floor+1.01);pot(x+.38,z+.85,.18,.34,floor+1.01);basket(x+.60,z-.6,.31,.44,floor+.09);
   // A founded return landing reaches the level lot, then a flight descends beside the shed.
   const stairX=west?3.62:27.90,lz=z-d/2-.35,lw=Math.abs(stairX-x)+.86,lx=(stairX+x)/2,top=floor+.085;
   footing(lx,lz,lw,.67,top-.08);k.box(lx,top-.055,lz,lw,.11,.67,'stone2');
   const n=Math.max(1,Math.ceil((top-heightAt(stairX,lz-1)-.08)/.20));
   const stepRise=(top-heightAt(stairX,lz-1)-.08)/n;
   const rail=[];
   for(let i=0;i<n;i++){
    const zz=lz-.49-i*.29,gy=heightAt(stairX,zz),st=top-(i+1)*stepRise;
    k.box(stairX,(gy-.09+st)/2,zz,.85,Math.max(.13,st-gy+.09),.30,'stone');
    k.box(stairX,st+.012,zz,.88,.055,.29,'stone2');
    if(i%3===0||i===n-1){const rx=stairX+(west?.48:-.48);k.box(rx,st+.44,zz,.085,.90,.085,'beam');rail.push([rx,st+.86,zz]);}
   }
   for(let i=1;i<rail.length;i++)k.beam(rail[i-1],rail[i],.041,'wood');
   return floor;
  }
  function bench(x,z){const y=heightAt(x,z)+.72;
   k.box(x,y,z,1.8,.095,.61,'board');for(const a of [-.69,.69])for(const b of [-.19,.19]){const gy=heightAt(x+a,z+b);k.box(x+a,(gy+y)/2,z+b,.09,y-gy,.09,'beam');}
   k.box(x,y-.20,z,1.45,.10,.12,'wood');k.box(x,y+.07,z,.31,.045,.18,'wood');k.beam([x-.2,y+.08,z-.16],[x+.1,y+.08,z-.1],.017,'dark');return y;
  }
  function lantern(x,z){const y=heightAt(x,z);k.box(x,y+.1,z,.73,.22,.68,'stone');k.box(x,y+.27,z,.5,.17,.46,'stone2');k.cylinder(x,y+.71,z,.14,.8,'stone');k.box(x,y+1.09,z,.48,.14,.47,'stone2');
   k.box(x,y+1.39,z,.30,.49,.30,'dark');for(const a of [-1,1])for(const b of [-1,1])k.box(x+a*.18,y+1.38,z+b*.18,.075,.5,.075,'stone2');
   k.box(x,y+1.67,z,.70,.12,.69,'stone');for(let j=0;j<4;j++)k.box(x,y+1.76+j*.075,z,.64-j*.13,.075,.63-j*.13,'stone2');k.ball(x,y+2.10,z,.095,.15,.095,'stone');}
  function laundry(x,z){const ends=[x-1.43,x+1.43],yy=Math.max(...ends.map(xx=>heightAt(xx,z)))+2.03;
   for(const xx of ends){const gy=heightAt(xx,z);k.cylinder(xx,(gy+yy+.12)/2,z,.055,yy+.12-gy,'wood');k.box(xx,gy+.065,z,.28,.17,.25,'stone');k.beam([xx,yy-.42,z],[xx,yy,z+.27],.028,'wood');}
   const lineY=t=>yy-.12*Math.sin(Math.PI*t);
   for(let i=0;i<24;i++)k.beam([ends[0]+2.86*i/24,lineY(i/24),z],[ends[0]+2.86*(i+1)/24,lineY((i+1)/24),z],.012,'rope');
   for(let c=0;c<3;c++){
    const left=ends[0]+.24+c*.82,width=.61,h=c===1?.94:.75,v=[],ix=[];
    for(let j=0;j<=7;j++)for(let i=0;i<=6;i++){const xx=left+width*i/6,t=(xx-ends[0])/2.86;v.push(xx,lineY(t)-j*h/7,z+.055*Math.sin(i*2+c)*(j/7)+.10*(j/7)**2);if(i&&j){const n=j*7+i;ix.push(n-8,n-1,n,n-8,n,n-7);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,c===1?indigo:linen,0,0,0);
    for(const xx of [left+.08,left+width-.08])k.box(xx,lineY((xx-ends[0])/2.86)+.02,z,.025,.09,.045,'board');
   }
  }
  function net(x,z){const y=Math.max(heightAt(x-1.65,z),heightAt(x+1.65,z))+2.03;
   for(const s of [-1,1]){const xx=x+s*1.65,gy=heightAt(xx,z);k.cylinder(xx,(gy+y)/2,z,.064,y-gy,'wood');k.beam([xx,gy,z+.51],[xx,gy+1.15,z],.039,'wood');}
   k.beam([x-1.78,y,z],[x+1.78,y,z],.043,'wood');
   const p=(u,v)=>[x-1.5+u*3,y-.12*Math.sin(u*Math.PI)-v*1.39,z+.18*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)];
   for(let i=0;i<=20;i++)for(let j=0;j<9;j++)k.beam(p(i/20,j/9),p(i/20,(j+1)/9),.008,'rope');
   for(let j=0;j<=9;j++)for(let i=0;i<20;i++)k.beam(p(i/20,j/9),p((i+1)/20,j/9),.008,'rope');
   for(let i=0;i<=20;i++)for(let j=0;j<=9;j++)k.ball(...p(i/20,j/9),.012,.012,.012,'rope');
   for(let i=0;i<9;i++){const a=p(i/8,0);k.ball(a[0],a[1]-.025,a[2],.07,.105,.06,'board');const b=p(i/8,1);k.ball(b[0],b[1],b[2],.035,.06,.035,'stone');}
   // Repair needle and line on the adjacent bench.
   const by=bench(x,z+1.02);coil(x+.43,z+1.02,.22,by+.085);basket(x-1.22,z+.65,.32,.43);
  }
  function cherry(x,z){const y=heightAt(x,z);k.beam([x,y-.05,z],[x+.13,y+2.55,z+.09],.13,'beam');
   for(let a=0;a<7;a++){
    const t=a*2.399,xx=x+Math.cos(t)*(1.02+.13*(a%2)),zz=z+Math.sin(t)*(1.0+.10*(a%3)),yy=y+2.7+(a%3)*.40;
    k.beam([x+.09,y+1.40+a*.12,z+.05],[xx,yy,zz],.055,'wood');
    for(let b=0;b<3;b++){const ang=t+b*2.1,bx=xx+Math.cos(ang)*.40,bz=zz+Math.sin(ang)*.38,by=yy+.30+.10*b;k.beam([xx,yy,zz],[bx,by,bz],.024,'wood');
     for(let j=0;j<14;j++){const q=j*2.399,r=.36*Math.sqrt((j+.5)/14);k.ball(bx+Math.cos(q)*r,by+.21*Math.sin(j*1.9),bz+Math.sin(q)*r,.13,.10,.12,j%7===0?'leaf':'pink');}}
   }
   for(let i=0;i<19;i++){const xx=x+Math.cos(i*2.4)*(.3+i*.047),zz=z+Math.sin(i*2.4)*(.3+i*.047);k.ball(xx,heightAt(xx,zz)+.025,zz,.028,.014,.023,'pink');}
  }
  const w=west?6.4:6.8,d=west?6.6:7;
  g.add(createHouse(THREE,lot,{w,d,stories:west?2:1,tone:west?'plaster':'cream',ridgeAcross:!west,rise:west?2.22:2.03}));
  // Small masonry kitchen flues penetrate the roof and have open rain-capped vents.
  const fx=lot.x+1.25,fz=lot.z+1.35,roofBase=lot.y+.5+(west?5.3:2.65);
  const fy=roofBase+(west?2.22:2.03)*(1-(west?1.25:1.35)/((west?w:d)/2+.67));
  for(let i=0;i<4;i++)k.box(fx,fy-.14+i*.20,fz,.39,.18,.39,i%2?'stone':'stone2');
  k.box(fx,fy+.61,fz,.30,.19,.30,'dark');
  for(const a of [-1,1])for(const b of [-1,1])k.box(fx+a*.17,fy+.61,fz+b*.17,.06,.22,.06,'stone2');
  k.box(fx,fy+.76,fz,.61,.13,.60,'stone');
  const x0=west?-.05:17.9,x1=west?13.18:32.05,z0=14.72,z1=27.45,front=west?x1:x0;
  fence([x0,z0],[x1,z0]);fence([x0,z1],[x1,z1]);
  const back=west?x0:x1;fence([back,z0],[back,z1]);fence([front,z0],[front,21.18]);fence([front,22.82],[front,z1]);
  // A small open gate leaf sits along the fence, leaving the whole entry width free.
  for(const dz of [.28,.60,.92])k.box(front,heightAt(front,23.1)+dz,23.3,.07,.065,.73,'board');
  const sign=west?1:-1;
  for(let i=0;i<2;i++){const xx=lot.x+sign*(w/2+.86+i*.32),gy=heightAt(xx,lot.z),top=lot.y+.43-i*.14;k.box(xx,(gy-.07+top)/2,lot.z,.34,Math.max(.12,top-gy+.07),1.14,'stone2');}
  if(west){
   shed(1.70,24.2,2.48,3.0);garden(1.52,18.20,2.46,3.0);tools(.62,21.40);
   cherry(7.0,16.0);laundry(10.65,16.15);lantern(12.65,25.2);
   barrel(3.56,24.05,.32,.77);barrel(3.61,25.0,.30,.68);pot(11.96,19.9,.25,.52);pot(12.61,19.60,.18,.37);
   basket(9.1,16.35,.34,.4);pot(11.35,17.27,.34,.37);coil(3.63,21.28,.30);bench(5.0,16.0);
   basket(4.24,15.95,.26,.33);tools(4.0,25.9);
  }else{
   shed(29.93,24.22,2.65,3.10);garden(29.86,18.3,2.68,3.25);tools(31.42,21.35);
   net(23.2,15.55);lantern(18.6,24.75);barrel(27.35,24.25,.32,.8);barrel(27.38,25.25,.31,.7);
   pot(18.48,19.05,.27,.55);pot(19.17,18.95,.20,.38);basket(26.1,16.45,.36,.45);basket(26.7,16.4,.25,.35);coil(26.80,17.15,.35);
   // Fish-drying slatted tray with supported trestles and individually shaped catch.
   const tx=19.3,tz=16.2,ty=heightAt(tx,tz)+.72;
   for(const a of [-.57,.57])for(const b of [-.28,.28])k.beam([tx+a,heightAt(tx+a,tz+b),tz+b],[tx+a*.8,ty,tz+b*.65],.045,'wood');
   for(let i=0;i<10;i++)k.box(tx-.70+i*.155,ty,tz,.07,.055,.75,'board');
   for(let i=0;i<6;i++){const xx=tx-.46+(i%3)*.44,zz=tz-.18+Math.floor(i/3)*.35;k.ball(xx,ty+.065,zz,.15,.035,.053,'gray');k.ball(xx+.13,ty+.065,zz,.055,.028,.073,'gray');}
   tools(28.65,26.2);pot(31.0,22.06,.22,.46);
  }
  // Domestic access stones around the building ends, grounded individually.
  for(let i=0;i<7;i++){
   const xx=west?3.75:27.65,zz=17.2+i*1.35;
   if(roadClear(xx,zz,.28))k.box(xx,heightAt(xx,zz)+.055,zz,.41,.12,.50,'stone2',0,.17*Math.sin(i),0);
  }
  // A few rooted herb clumps soften the back fence, without adding cherry trees.
  for(let i=0;i<12;i++){
   const xx=west?4.3+i*.65:20.0+i*.61,zz=26.97;
   if(roadClear(xx,zz,.24))for(let b=0;b<4;b++)k.ball(xx+.07*Math.sin(b*2),heightAt(xx,zz)+.1+b*.025,zz+.07*Math.cos(b*2),.12,.10,.10,'leaf');
  }
  k.flush();out.add(g);
 }
 return out;
}
