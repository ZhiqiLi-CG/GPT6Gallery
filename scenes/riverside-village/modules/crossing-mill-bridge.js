import {heightAt, bankZ, waterLevel, roadNetwork, layout, claimDistrict} from './root.js';
import {claimStructure} from './crossing-mill.js';

export function build(THREE,ctx) {
  claimDistrict('crossing-mill'); claimStructure('bridge');
  const out=new THREE.Group(); out.name='crossing-mill-bridge_five_arch_stone_bridge';
  const b=layout().bridge, x=b.x, W=b.width, crown=b.deckY;
  const end=39, span=12, radius=5, rise=4.0, spring=1.05, centers=[-24,-12,0,12,24];
  const roadWidth=roadNetwork().find(r=>r.id==='bridge-north').width;
  const smooth=t=>t*t*(3-2*t);
  function deck(z,xx=x){let t=Math.max(0,Math.min(1,(Math.abs(z)-25)/(end-25)));return crown+(heightAt(xx,Math.sign(z)*end)+.20-crown)*smooth(t);}
  function width(z){return W+(roadWidth-W)*smooth(Math.max(0,(Math.abs(z)-30)/9));}
  const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.96});
  const stone=[0x9c9783,0xa6a08b,0xb2ab96,0x97927e,0xb9b29e,0xa49c86].map(material);
  const mortar=material(0x827e6c), dark=material(0x777965), moss=material(0x68724c), gravel=material(0xb4a68a), rut=material(0xa29479);
  const merged=new Map(), boxes=new Map(); let seed=20119;
  const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  function accumulate(geo,mat,px=0,py=0,pz=0,rot=0){
    let arr=merged.get(mat);if(!arr){arr=[];merged.set(mat,arr);}
    const g=geo.index?geo.toNonIndexed():geo,p=g.attributes.position,c=Math.cos(rot),s=Math.sin(rot);
    for(let i=0;i<p.count;i++){let a=p.getX(i),v=p.getZ(i);arr.push(px+a*c+v*s,py+p.getY(i),pz-a*s+v*c);} if(g!==geo)g.dispose();geo.dispose();
  }
  function box(px,py,pz,w,h,d,mat,rx=0){if(h<=0||w<=0||d<=0)return;let list=boxes.get(mat);if(!list){list=[];boxes.set(mat,list);}list.push([px,py,pz,w,h,d,rx]);}
  function profile(points,depth,px,pz,mat){const s=new THREE.Shape();points.forEach((p,i)=>i?s.lineTo(...p):s.moveTo(...p));s.closePath();accumulate(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:32}),mat,px,0,pz,Math.PI/2);}
  // A solid extruded spandrel above each open elliptical barrel. Local horizontal = -world z.
  for(const center of centers){
    let p=[];for(let i=0;i<=24;i++){let u=-radius+2*radius*i/24;p.push([u,deck(center-u)-.30]);}
    p.push([radius,spring]);for(let i=0;i<=48;i++){let a=i*Math.PI/48;p.push([radius*Math.cos(a),spring+rise*Math.sin(a)]);}p.push([-radius,deck(center+radius)-.30]);
    profile(p,W,x-W/2,center,mortar);
  }
  // Piers and abutments are founded below the sampled river bed.
  for(let z=-30;z<=30;z+=span){let floor=Math.min(heightAt(x-W/2,z),heightAt(x+W/2,z),-3.5)-.35;
    box(x,(deck(z)-.30+floor)/2,z,W,deck(z)-.30-floor,2,mortar);
    if(Math.abs(z)<30){
      for(const side of [-1,1]){
        // Pointed nose plan, with a sloping stone cap, facing both river directions.
        const base=x+side*W/2, tip=base+side*2.0, top=3.5;
        const pts=[[base,floor,z-1],[base,floor,z+1],[tip,floor,z],[base,top,z-1],[base,top,z+1],[tip,top-.65,z]];
        const idx=[0,2,1,3,4,5,0,1,4,0,4,3,1,2,5,1,5,4,2,0,3,2,3,5];
        if(side<0)for(let k=0;k<idx.length;k+=3){let t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t;}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(idx.flatMap(i=>pts[i]),3));accumulate(g,stone[1]);
        for(let y=waterLevel+.1;y<top-.6;y+=.48){
          for(let edge of [-1,1]){let dx=tip-base,dz=-edge;let length=Math.hypot(dx,dz);let a=new THREE.BoxGeometry(length,.035,.035);accumulate(a,dark,(base+tip)/2,y,z+edge*.5,Math.atan2(-dz,dx));}
        }
      }
    }
  }
  // Distinct radial voussoirs continue through the full depth of the arch barrels.
  for(const center of centers)for(let i=0;i<25;i++){
    let a=i*Math.PI/25+.007,c=(i+1)*Math.PI/25-.007;
    for(let strip=0;strip<6;strip++){
      let p=[];for(let j=0;j<=3;j++){let t=a+(c-a)*j/3;p.push([radius*Math.cos(t),spring+rise*Math.sin(t)]);}
      for(let j=3;j>=0;j--){let t=a+(c-a)*j/3;p.push([(radius+.65)*Math.cos(t),spring+(rise+.65)*Math.sin(t)]);}
      profile(p,W/6-.018,x-W/2+strip*W/6,center,stone[(i+strip*2)%stone.length]);
    }
    for(const side of [-1,1]){
      let p=[];for(let j=0;j<=3;j++){let t=a+(c-a)*j/3;p.push([radius*Math.cos(t),spring+rise*Math.sin(t)]);}
      for(let j=3;j>=0;j--){let t=a+(c-a)*j/3;p.push([(radius+.67)*Math.cos(t),spring+(rise+.67)*Math.sin(t)]);}
      profile(p,.18,x+side*W/2-(side<0?.18:0),center,stone[(i+2)%stone.length]);
    }
  }
  // Coursed masonry faces with joints, clipped around the dressed rings.
  for(const side of [-1,1])for(let row=0;row<20;row++){
    let y=-3.65+row*.52, intervals=[[-31,31]];
    for(const c of centers){let r=y<spring?radius+.68:(y<spring+rise+.67?(radius+.68)*Math.sqrt(1-((y-spring)/(rise+.67))**2):0);if(r<=0)continue;
      intervals=intervals.flatMap(([a,b])=>c+r<=a||c-r>=b?[[a,b]]:[[a,Math.max(a,c-r)],[Math.min(b,c+r),b]].filter(([a,b])=>b-a>.05));
    }
    for(const [a,b]of intervals){let n=Math.ceil((b-a)/(1.0+rand()*.35));for(let i=0;i<n;i++){let za=a+(b-a)*i/n+.018,zb=a+(b-a)*(i+1)/n-.018,zc=(za+zb)/2,h=Math.min(.48,Math.min(deck(za),deck(zb))-.34-y);if(h>.05)box(x+side*(W/2+.025),y+h/2,zc,.14,h,zb-za,stone[Math.floor(rand()*6)]);}}
  }
  // Bank-founded ramp fill in short sections follows the smooth road profile.
  for(const side of [-1,1])for(let i=0;i<16;i++){
    let z=side*(31+(i+.5)*.5),top=deck(z)-.28,low=Math.min(heightAt(x-width(z)/2,z),heightAt(x+width(z)/2,z))-.4;
    box(x,(top+low)/2,z,W,top-low,.51,mortar);
    for(const edge of [-1,1])for(let y=low;y<top;y+=.50)box(x+edge*W/2,(y+Math.min(y+.47,top))/2,z,.14,Math.min(.47,top-y),.47,stone[(i+Math.floor(y*2)+60)%6]);
  }
  // Thin load-bearing deck, gravel surface and worn wheel tracks, all continuous to the root roads.
  function ribbon(xa,xb,z0,z1,mat,lift=0){let verts=[],ids=[];let n=Math.ceil((z1-z0)*2);for(let i=0;i<=n;i++){let z=z0+(z1-z0)*i/n;for(const f of [xa,xb]){let xx=x+width(z)*f;verts.push(xx,deck(z,xx)+lift,z);}if(i<n){let j=i*2;ids.push(j,j+2,j+1,j+1,j+2,j+3);}}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(ids);accumulate(g,mat);}
  ribbon(-.5,.5,-39,39,gravel);
  for(let i=0;i<156;i++){
    let z0=-39+i*.5,z1=z0+.5,pts=[];
    for(const lift of [-.025,-.32])for(const z of [z0,z1])for(const side of [-1,1]){let xx=x+side*W/2;pts.push([xx,deck(z,xx)+lift,z]);}
    const idx=[0,2,1,1,2,3,4,5,6,5,7,6,0,4,2,2,4,6,1,3,5,3,7,5,0,1,4,1,5,4,2,6,3,3,6,7];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(idx.flatMap(j=>pts[j]),3));accumulate(g,stone[1]);
  }
  for(let sign of [-1,1])ribbon(sign*.17-.019,sign*.17+.019,-38.9,38.9,rut,.012);
  // Raised parapets leave over six metres clear between their inner faces at the main span.
  for(const side of [-1,1])for(let i=0;i<98;i++){
    const z=-38.61+i*.79,ww=width(z),xx=x+side*(W/2-.23),t=Math.max(0,(Math.abs(z)-35)/4),h=1.0-.7*smooth(t),d=.765;
    for(let row=0;row<2;row++)box(xx,deck(z)+h*(row+.5)/2,z,.48,h/2-.025,d,stone[(i+row*3)%6],-Math.atan((deck(z+.1)-deck(z-.1))/.2));
    box(xx,deck(z)+h+.09,z,.64,.18,.79,stone[(i+1)%6],-Math.atan((deck(z+.1)-deck(z-.1))/.2));
    if(i%4===0&&Math.abs(z)<29)box(x+side*(W/2+.104),deck(z)-.62,z,.03,.19,.16,dark);
  }
  // Sparse damp stone and moss stain the pier bases; all repeated marks are batched.
  for(let z=-18;z<=18;z+=12)for(const side of [-1,1])for(let i=0;i<18;i++){
    box(x+side*(W/2+.105),waterLevel+.12+rand()*.85,z+(rand()-.5)*1.80,.025,.07+rand()*.20,.12+rand()*.28,i%3?dark:moss);
  }
  // Bridge-end dressed terminal blocks, low guard stones and edge paving. No furniture in the road.
  for(const endSign of [-1,1])for(const side of [-1,1]){
    const z=endSign*34.6,xx=x+side*(W/2-.22),h=deck(z);
    box(xx,h+.63,z,.73,1.25,.78,stone[2]);box(xx,h+1.31,z,.87,.16,.90,stone[4]);
    for(let j=0;j<3;j++){let zz=endSign*(35.8+j*.95),px=x+side*(W/2-.26);box(px,deck(zz)+.055,zz,.46,.11,.8,stone[(j+2)%6]);}
  }
  // Batching keeps thousands of individual stones inexpensive to compose.
  for(const [mat,arr]of merged){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;out.add(m);}
  for(const [mat,list]of boxes){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,list.length),o=new THREE.Object3D();list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(p[6],0,0);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;out.add(m);}
  out.userData={task:'crossing-mill-bridge',spans:5,riverBanks:[bankZ(x,-1),bankZ(x,1)],clearRoadWidth:W-.94};
  return out;
}
