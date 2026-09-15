import { heightAt, bankZ, layout, roadNetwork, claimDistrict } from './root.js';

// Two domestic holdings; root geography is always sampled at the point of use.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const g = new THREE.Group(); g.name = 'north-west-riverside — two inhabited cottage holdings';
  let holding=g;
  const mat = color => new THREE.MeshStandardMaterial({color, roughness:.93});
  const M={cream:mat(0xdbc9a7),sage:mat(0xbfc4ac),wood:mat(0x594333),board:mat(0x977452),stone:mat(0x929080),light:mat(0xb2aa94),glass:mat(0x293e3c),red:mat(0x985d42),slate:mat(0x586661),metal:mat(0x3f4541),soil:mat(0x68513a),path:mat(0xb9a580),leaf:mat(0x52793d),lightleaf:mat(0x82994c),pot:mat(0xa56545),cloth:mat(0xe0d7bb),blue:mat(0x637e87),skin:mat(0xc49a76),ochre:mat(0xb99c60)};
  const tiles=[[0x985d42,0x8b513c,0xa4694a,0x915941],[0x586661,0x63716c,0x52615d,0x6a7470]].map(a=>a.map(mat));
  const cube=new THREE.BoxGeometry(1,1,1),ballGeo=new THREE.IcosahedronGeometry(1,1);
  function mesh(geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;holding.add(a);return a;}
  function box(x,y,z,w,h,d,m){const a=mesh(cube,m,x,y,z);a.scale.set(w,h,d);return a;}
  function ball(x,y,z,r,m,sx=1,sy=1,sz=1){const a=mesh(ballGeo,m,x,y,z);a.scale.set(r*sx,r*sy,r*sz);return a;}
  function beam(a,b,w,m=M.wood){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=box(...p.add(q).multiplyScalar(.5).toArray(),w,v.length(),w,m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function cyl(x,y,z,r,h,m,rt=r){return mesh(new THREE.CylinderGeometry(rt,r,h,10),m,x,y,z);}
  function surface(x0,z0,x1,z1,m=M.path,lift=.12){const geo=new THREE.PlaneGeometry(x1-x0,z1-z0,Math.max(1,Math.ceil(x1-x0)),Math.max(1,Math.ceil(z1-z0)));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let j=0;j<p.count;j++){let x=p.getX(j)+(x0+x1)/2,z=p.getZ(j)+(z0+z1)/2;p.setXYZ(j,x,heightAt(x,z)+lift,z);}geo.computeVertexNormals();const a=mesh(geo,m);a.castShadow=false;}
  const road=roadNetwork().find(r=>r.id==='north-road');
  function roadZ(x){for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}throw Error('No north road at holding');}
  const edge=x=>roadZ(x)-(road.width+1.4)/2-.65;
  function foundation(x,z,w,d){const heights=[];for(const a of [-1,0,1])for(const b of [-1,0,1])heights.push(heightAt(x+a*w/2,z+b*d/2));const low=Math.min(...heights)-.4,top=Math.max(...heights)+.26;box(x,(low+top)/2,z,w,top-low,d,M.stone);return top;}
  function fence(x0,z0,x1,z1,gate=false){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.7);for(let j=0;j<=n;j++){const x=x0+(x1-x0)*j/n,z=z0+(z1-z0)*j/n,y=heightAt(x,z);box(x,y+.68,z,.15,1.36,.15,M.wood);if(j<n){const xx=x0+(x1-x0)*(j+1)/n,zz=z0+(z1-z0)*(j+1)/n;for(const h of [.43,1.02])beam([x,y+h,z],[xx,heightAt(xx,zz)+h,zz],.105,M.board);if(gate)beam([x,y+.39,z],[xx,heightAt(xx,zz)+1.1,zz],.095);else for(const t of [.25,.5,.75]){let px=x+(xx-x)*t,pz=z+(zz-z)*t;box(px,heightAt(px,pz)+.73,pz,.075,1.1,.09,M.board);}}}}
  function roof(x,z,w,d,y,rise,palette,plaster){
    // Plastered gable ends fill the whole roof volume; tiled slopes and fascia enclose it.
    const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,rise-.12);sh.closePath();mesh(new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false}),plaster,x,y,z-d/2);
    const hw=w/2+.48,hd=d/2+.46,len=Math.hypot(hw,rise),angle=Math.atan2(rise,hw),nr=Math.ceil(len/.57),nc=Math.ceil(hd*2/.65);
    for(const s of [-1,1]){const p=box(x+s*hw/2,y+rise/2,z,len,.17,hd*2,tiles[palette][0]);p.rotation.z=-s*angle;
      for(let r=0;r<nr;r++)for(let c=0;c<nc;c++){const t=(r+.5)/nr;const p=box(x+s*hw*(1-t),y+rise*t+.115,z-hd+(c+.5)*hd*2/nc,len/nr-.018,.075,hd*2/nc-.025,tiles[palette][(r*3+c*7)%4]);p.rotation.z=-s*angle;}
      beam([x+s*hw,y,z-hd],[x+s*hw,y,z+hd],.19);
      for(const end of [-1,1])beam([x+s*hw,y,z+end*hd],[x,y+rise,z+end*hd],.16);
    }
    beam([x,y+rise+.18,z-hd],[x,y+rise+.18,z+hd],.23,tiles[palette][1]);
  }
  function window(x,y,z,rot,shutter){function b(dx,dy,dz,w,h,d,m){const a=box(x+Math.cos(rot)*dx+Math.sin(rot)*dz,y+dy,z-Math.sin(rot)*dx+Math.cos(rot)*dz,w,h,d,m);a.rotation.y=rot;return a;}
    b(0,0,0,1.16,1.35,.14,M.wood);b(0,0,.085,.92,1.11,.07,M.glass);b(0,0,.13,.06,1.11,.07,M.light);b(0,0,.13,.92,.06,.07,M.light);b(0,-.74,.1,1.48,.15,.34,M.light);
    for(const s of [-1,1]){b(s*.78,0,.02,.32,1.34,.12,shutter);for(let k=0;k<5;k++)b(s*.78,-.51+k*.25,.09,.32,.035,.045,M.wood);}
  }
  function barrel(x,z){const y=heightAt(x,z);cyl(x,y+.47,z,.36,.94,M.board,.32);for(const h of [.16,.74])cyl(x,y+h,z,.368,.075,M.metal);cyl(x,y+.95,z,.30,.04,M.wood);for(let j=0;j<10;j++){let a=j*Math.PI/5;beam([x+.35*Math.cos(a),y+.1,z+.35*Math.sin(a)],[x+.32*Math.cos(a),y+.88,z+.32*Math.sin(a)],.024);}}
  function pot(x,z){const y=heightAt(x,z);cyl(x,y+.24,z,.21,.46,M.pot,.29);ball(x,y+.57,z,.32,M.leaf,1,.8,1);for(let k=0;k<5;k++)ball(x+.19*Math.cos(k*2),y+.75,z+.19*Math.sin(k*2),.068,k%2?M.ochre:M.cloth);}
  function garden(x0,z0,x1,z1){surface(x0,z0,x1,z1,M.soil,.10);for(let x=x0+.5;x<x1-.2;x+=.78){for(let z=z0+.5;z<z1-.2;z+=.62){let y=heightAt(x,z);ball(x,y+.26,z,.27,M.leaf,1,.7,1);for(let j=0;j<3;j++)ball(x+.14*Math.cos(j*2.1),y+.34,z+.14*Math.sin(j*2.1),.14,M.lightleaf,1,.65,1);}}for(const z of [z0,z1])beam([x0,heightAt(x0,z)+.12,z],[x1,heightAt(x1,z)+.12,z],.13,M.board);for(const x of [x0,x1])beam([x,heightAt(x,z0)+.12,z0],[x,heightAt(x,z1)+.12,z1],.13,M.board);}
  function shed(x,z,palette){const w=3.1,d=3.5,b=foundation(x,z,w+.2,d+.2);box(x,b+1.2,z,w,2.4,d,M.board);for(const s of [-1,1]){for(let j=0;j<9;j++)box(x-w/2+(j+.5)*w/9,b+1.2,z+s*(d/2+.035),.035,2.4,.03,M.wood);for(let j=0;j<10;j++)box(x+s*(w/2+.035),b+1.2,z-d/2+(j+.5)*d/10,.03,2.4,.035,M.wood);}roof(x,z,w,d,b+2.4,.95,palette,M.board);box(x,b+1,z+d/2+.075,1.1,2,.10,M.wood);for(let j=0;j<6;j++)box(x-.45+j*.18,b+1,z+d/2+.14,.025,1.93,.025,M.board);beam([x-.49,b+.15,z+d/2+.17],[x+.49,b+1.8,z+d/2+.17],.09,M.board);box(x+1,b+1.4,z+d/2+.08,.48,.63,.12,M.glass);
    for(let row=0;row<3;row++)for(let j=0;j<5;j++){const a=cyl(x-1+j*.39,b+.16+row*.32,z-d/2-.42,.15,.7,M.board);a.rotation.x=Math.PI/2;}
  }
  function person(x,z,color){const y=heightAt(x,z);for(const s of [-1,1]){beam([x+s*.13,y+.12,z],[x+s*.12,y+.77,z],.16);box(x+s*.13,y+.09,z+.08,.2,.18,.36,M.wood);}cyl(x,y+1.07,z,.25,.66,color,.2);ball(x,y+1.58,z,.20,M.skin);cyl(x,y+1.77,z,.32,.06,M.ochre);for(const s of [-1,1])beam([x+s*.2,y+1.3,z],[x+s*.42,y+.99,z+.15],.12,color);}
  function chicken(x,z){const y=heightAt(x,z);ball(x,y+.31,z,.25,M.cloth,1,.9,.7);ball(x+.21,y+.53,z,.12,M.cloth);ball(x+.27,y+.66,z,.06,M.red);const a=mesh(new THREE.ConeGeometry(.055,.18,4),M.ochre,x+.34,y+.53,z);a.rotation.z=-Math.PI/2;for(const s of [-1,1])beam([x,y+.2,z+s*.08],[x,y+.02,z+s*.08],.03,M.ochre);}
  const records=[];
  for(const [i,left,right,palette] of [[8,-120,-94,0],[9,-87,-60,1]]){
    holding=new THREE.Group();holding.name='north-west-riverside_holding_'+i;g.add(holding);
    const [x,sz]=layout().northHouses[i],z=Math.max(sz,bankZ(x,1)+12),w=8,d=9,h=i===8?4.65:5.05,plaster=i===8?M.cream:M.sage;
    const b=foundation(x,z,w+.36,d+.36);box(x,b+h/2,z,w,h,d,plaster);
    for(const s of [-1,1]){
      box(x,b+.3,z+s*4.53,w,.6,.12,M.light);box(x+s*4.03,b+.3,z,.12,.6,d,M.light);
      box(x,b+h-.12,z+s*4.56,w,.22,.16,M.wood);box(x+s*4.06,b+h-.12,z,.16,.22,d,M.wood);
      for(const e of [-1,1])box(x+s*3.95,b+h/2,z+e*4.45,.20,h,.20,M.wood);
      for(const dx of [-2.45,2.45])window(x+dx,b+2.43,z+s*4.59,s===1?0:Math.PI,i===8?M.leaf:M.blue);
      for(const dz of [-2.4,2.3])window(x+s*4.09,b+2.43,z+dz,s*Math.PI/2,i===8?M.leaf:M.blue);
      // Stone joints and masonry corner quoins remain visible from either bank.
      for(let row=0;row<2;row++)for(let j=0;j<11;j++)box(x-3.75+j*.73+(row%2)*.20,b+.03+row*.31,z+s*4.602,.028,.27,.025,M.stone);
      for(let row=0;row<5;row++)for(const e of [-1,1])box(x+e*3.74,b+.78+row*.63,z+s*4.54,.48,.29,.13,M.light);
    }
    roof(x,z,w,d,b+h,2.85,palette,plaster);
    for(const s of [-1,1]){
      const gz=z+s*4.56;box(x,b+h+1.15,gz,.72,1,.12,M.wood);box(x,b+h+1.15,gz+s*.075,.49,.75,.06,M.glass);
      beam([x,b+h,gz],[x,b+h+2.6,gz],.16);for(const e of [-1,1])beam([x+e*3.3,b+h+.08,gz],[x+e*.55,b+h+2.3,gz],.12);
    }
    const cx=x+1.9,cz=z-.95,cy=b+h+2.75;box(cx,cy-.85,cz,.8,2.9,.91,M.stone);box(cx,cy+.64,cz,1.04,.19,1.15,M.light);box(cx,cy+.75,cz,.56,.025,.65,M.glass);for(let j=0;j<7;j++)box(cx,cy-2.1+j*.39,cz+.46,.80,.035,.025,M.wood);
    const front=z+4.62;box(x,b+1.23,front,1.4,2.46,.15,M.wood);for(let j=0;j<7;j++)box(x-.6+j*.2,b+1.23,front+.095,.025,2.3,.03,M.board);ball(x+.43,b+1.15,front+.15,.07,M.metal);
    const canopy=box(x,b+2.8,front+.53,2.25,.16,1.2,tiles[palette][0]);canopy.rotation.x=.12;for(const s of [-1,1])beam([x+s*.91,b+2.76,front+.96],[x+s*.91,b+2.05,front+.05],.11);
    for(let j=0;j<3;j++){const zz=front+.22+j*.34,top=b-.025-j*.08,low=heightAt(x,zz)-.1;box(x,(top+low)/2,zz,1.8,Math.max(.12,top-low),.39,M.light);}
    surface(x-4.55,front+.6,x+4.55,edge(x)-.2);surface(x-.9,front+.75,x+.9,roadZ(x)-road.width/2+.15,M.path,.15);
    // Perimeter and divided gate; all geometry keeps the x[-93,-89] landing corridor open.
    const south=Math.max(29.2,bankZ(left,1)+6,bankZ(right,1)+6);
    fence(left,south,right,south);fence(left,south,left,edge(left));fence(right,south,right,edge(right));
    fence(left,edge(left),x-1.05,edge(x-1.05));fence(x+1.05,edge(x+1.05),right,edge(right));fence(x-1.05,edge(x-1.05),x-.05,edge(x-.05)-.60,true);
    const shedX=i===8?-116.8:-83.8,shedZ=i===8?40:35;
    shed(shedX,shedZ,1-palette);surface(shedX-.6,shedZ+1.9,shedX+.6,edge(shedX)-1);surface(Math.min(shedX,x),edge(x)-1.5,Math.max(shedX,x),edge(x)-.65);
    if(i===8){garden(-112.5,30.3,-105.7,37.8);garden(-112.5,39.3,-106.5,42.4);}else{garden(-66.7,30.0,-61.2,39.6);garden(-80.3,30.1,-77.3,36.7);}
    pot(x-1.6,front+.73);pot(x+1.6,front+.73);barrel(x-4.9,z+2.6);barrel(shedX+2.15,shedZ+.65);
    const bx=x+2.8,bz=front+1.4,by=heightAt(bx,bz);box(bx,by+.56,bz,1.7,.14,.48,M.board);for(const s of [-1,1])box(bx+s*.6,by+.27,bz,.13,.54,.43,M.wood);box(bx,by+.97,bz-.18,1.7,.63,.11,M.board);
    const lx=i===8?-109:-80,lz=i===8?44:41;
    for(const xx of [lx-2,lx+2])box(xx,heightAt(xx,lz)+1.1,lz,.1,2.2,.1,M.wood);beam([lx-2,heightAt(lx-2,lz)+2.15,lz],[lx+2,heightAt(lx+2,lz)+2.15,lz],.027,M.cloth);
    for(let j=0;j<3;j++){const xx=lx-1.3+j*1.2;box(xx,heightAt(xx,lz)+1.63,lz,.79,.99,.035,j===1?M.blue:M.cloth);}
    person(x-2,edge(x)-1.8,i===8?M.blue:M.ochre);chicken(shedX+2.0,shedZ+2.4);chicken(shedX+2.7,shedZ+3.0);
    // A low work table, basket and split logs make each yard legible at close range.
    const tx=shedX+3.0,tz=shedZ-1.0,ty=heightAt(tx,tz);box(tx,ty+.77,tz,1.5,.13,.85,M.board);for(const dx of [-.6,.6])for(const dz of [-.3,.3])box(tx+dx,ty+.36,tz+dz,.1,.72,.1,M.wood);cyl(tx,ty+1.0,tz,.27,.33,M.ochre,.32);ball(tx,ty+1.2,tz,.23,M.leaf,1,.5,1);
    records.push({index:i,x,z,foundation:b,bankClearance:Math.min(...[-4.18,4.18].map(dx=>z-4.68-bankZ(x+dx,1))),bounds:[left-.15,3,south-.15,right+.15,15,Math.max(edge(left),edge(right))+.15]});
  }
  g.userData={holdings:records,landingCorridor:[-93,-89],dwellingCount:2,barnCount:0};
  return g;
}
