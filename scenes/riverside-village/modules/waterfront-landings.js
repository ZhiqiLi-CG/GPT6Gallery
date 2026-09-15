import {heightAt, waterLevel, claimDistrict} from './root.js';
import {landingPlan, claimWaterfrontPart} from './waterfront.js';

export function build(THREE,ctx) {
  claimDistrict('waterfront');
  claimWaterfrontPart('landings');
  const group=new THREE.Group(); group.name='Nine boats and three working timber landings';
  const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.91});
  const woods=[0x82735a,0x998266,0x77684f,0xa58e6e,0x8e7b60].map(material);
  const frame=material(0x574735),ropeMat=material(0xb6a17c),iron=material(0x444d49);
  const inner=material(0x9c825f),hullM=[0x4c6c67,0x78594a,0x65737b].map(material),netMat=material(0x706c4d);
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  function mesh(p,geo,m,x=0,y=0,z=0){const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;p.add(a);return a;}
  function box(p,w,h,d,m,x,y,z){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
  function beam(p,a,b,r,m=frame){const A=v(...a),B=v(...b),d=B.clone().sub(A);const o=mesh(p,new THREE.CylinderGeometry(r,r,d.length(),7),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());return o;}
  function line(p,pts,r=.025,m=ropeMat){return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a=>v(...a))),Math.max(12,pts.length*4),r,5,false),m);}
  function coil(p,x,y,z,r=.4){const pts=[];for(let k=0;k<=110;k++){const a=k/110*Math.PI*8,rr=r*(.42+.58*k/110);pts.push([x+Math.cos(a)*rr,y+.035,z+Math.sin(a)*rr]);}line(p,pts,.035);line(p,[[x+r,y+.035,z],[x+r+.27,y+.04,z+.17],[x+r+.46,y+.03,z+.38]],.035);}
  function crate(p,x,y,z,s=.85){
    box(p,s,.06,s,frame,x,y+.03,z);
    for(let j=0;j<4;j++)for(const a of [-1,1]){
      box(p,s,.135,.075,woods[j%5],x,y+.12+j*.18,z+a*s/2);
      box(p,.075,.135,s,woods[(j+2)%5],x+a*s/2,y+.12+j*.18,z);
    }
    for(const dx of [-1,1])for(const dz of [-1,1])box(p,.09,.82,.09,frame,x+dx*(s/2-.035),y+.4,z+dz*(s/2-.035));
    for(let k=0;k<5;k++)box(p,s/5-.018,.055,s,woods[k],x-s*.4+k*s/5,y+.83,z);
    beam(p,[x-s/2,y+.11,z+s/2+.045],[x+s/2,y+.73,z+s/2+.045],.055,woods[1]);
  }
  function barrel(p,x,y,z){
    const pts=[[0,0],[.34,0],[.41,.15],[.46,.58],[.4,1.02],[.34,1.12],[0,1.12]].map(a=>new THREE.Vector2(...a));
    mesh(p,new THREE.LatheGeometry(pts,14),woods[2],x,y,z);
    for(const h of [.14,.57,1.0]){const r=h===.57?.465:.406;const t=mesh(p,new THREE.TorusGeometry(r,.035,5,18),iron,x,y+h,z);t.rotation.x=Math.PI/2;}
    for(let j=0;j<14;j++){const a=j*Math.PI/7;line(p,[[x+Math.sin(a)*.347,y+.04,z+Math.cos(a)*.347],[x+Math.sin(a)*.457,y+.57,z+Math.cos(a)*.457],[x+Math.sin(a)*.347,y+1.08,z+Math.cos(a)*.347]],.009,frame);}
    box(p,.64,.045,.67,woods[1],x,y+1.13,z);
  }
  function trap(p,x,y,z){
    const w=1.1,l=1.45,h=.68;
    for(let j=0;j<=6;j++){const zz=z-l/2+j*l/6;const pts=[];for(let k=0;k<=12;k++){const a=k*Math.PI/12;pts.push([x+Math.cos(a)*w/2,y+Math.sin(a)*h,zz]);}line(p,pts,.027,woods[1]);}
    for(let k=0;k<=10;k++){const a=k*Math.PI/10;beam(p,[x+Math.cos(a)*w/2,y+Math.sin(a)*h,z-l/2],[x+Math.cos(a)*w/2,y+Math.sin(a)*h,z+l/2],.02,netMat);}
    for(const zz of [z-l/2,z+l/2])for(let k=-3;k<=3;k++)beam(p,[x+k*.13,y,zz],[x+k*.13,y+Math.sqrt(1-(k*.13/.55)**2)*h,zz],.018,netMat);
    coil(p,x+.75,y+.04,z,.22);
  }
  // Closed solid hull shell: outer planking, inner planking, rim and thick floor.
  function boat(x,z,angle,len,width,color,ashore=false){
    const p=new THREE.Group();p.position.set(x,waterLevel-.40,z);p.rotation.y=angle;group.add(p);
    const half=len/2,N=28;
    const breadth=t=>width/2*Math.pow(Math.max(0,1-t*t),.65)+.055;
    const sections=[];
    for(let j=0;j<=N;j++){
      const t=-1+2*j/N,b=breadth(t),zz=t*half,rise=.13*Math.pow(Math.abs(t),5);
      sections.push([[-b*.30,.02+rise,zz],[-b*.70,.31+rise,zz],[-b,1.04+rise,zz],[-Math.max(.015,b-.13),1.045+rise,zz],[-b*.60,.50+rise,zz],[b*.60,.50+rise,zz],[Math.max(.015,b-.13),1.045+rise,zz],[b,1.04+rise,zz],[b*.70,.31+rise,zz],[b*.30,.02+rise,zz]]);
    }
    const verts=[],idx=[];for(const row of sections)for(const pt of row)verts.push(...pt);
    for(let j=0;j<N;j++)for(let k=0;k<10;k++){const a=j*10+k,b=j*10+(k+1)%10,c=(j+1)*10+k,d=(j+1)*10+(k+1)%10;idx.push(a,c,b,b,c,d);}
    for(const j of [0,N])for(let k=1;k<9;k++)idx.push(j*10,j*10+k,j*10+k+1);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();
    const shell=material(color);shell.side=THREE.DoubleSide;mesh(p,geo,shell);
    for(const side of [-1,1]){
      for(const h of [.38,.65,.88])line(p,sections.map((row,j)=>{const t=-1+2*j/N;return [side*breadth(t)*(.70+(h-.31)/.73*.30),h+.13*Math.pow(Math.abs(t),5),t*half];}),.018,frame);
      line(p,sections.map((row,j)=>[side*(breadth(-1+2*j/N)-.055),1.065+.13*Math.pow(Math.abs(-1+2*j/N),5),(-1+2*j/N)*half]),.073,woods[1]);
    }
    for(let j=0;j<12;j++){const t=-.82+j*1.64/11;box(p,breadth(t)*1.14,.065,len/15,woods[j%5],0,.55,t*half);}
    for(let j=0;j<7;j++){const t=-.78+j*.26,b=breadth(t);line(p,[[-b+.16,1.015,t*half],[-b*.59,.59,t*half],[b*.59,.59,t*half],[b-.16,1.015,t*half]],.047,frame);}
    for(const t of [-.49,.03,.50])box(p,breadth(t)*1.78,.12,.34,woods[1],0,.85,t*half);
    for(const side of [-1,1]){beam(p,[side*.36,.98,-len*.24],[side*.71,1.16,len*.27],.034,woods[3]);const o=box(p,.17,.05,.64,woods[2],side*.74,1.17,len*.31);o.rotation.y=side*.13;}
    for(const t of [-.95,.95])beam(p,[0,.55,t*half],[0,1.22,t*half],.06,frame);
    if(ashore){
      let base=-100;
      for(let j=0;j<=12;j++){const zz=-half+j*len/12,t=zz/half;for(const xx of [-breadth(t),0,breadth(t)]){const wx=x+xx*Math.cos(angle)+zz*Math.sin(angle),wz=z-xx*Math.sin(angle)+zz*Math.cos(angle);base=Math.max(base,heightAt(wx,wz));}}
      p.position.y=base+.12;
      for(const zz of [-len*.28,len*.28]){const q=p.localToWorld(v(0,0,zz));const ground=heightAt(q.x,q.z);box(group,1.9,p.position.y-ground+.13,.34,frame,q.x,(ground+p.position.y+.13)/2,q.z);}
    }
    coil(p,.1,.63,-len*.32,.25);
    p.updateMatrixWorld(true);
    return {p,bow:p.localToWorld(v(0,1.21,-half*.95)),stern:p.localToWorld(v(0,1.21,half*.95))};
  }
  for(const [i,d] of landingPlan().entries()){
    const begin=group.children.length;
    const p=new THREE.Group();p.name=`${d.id} landing structure and equipment`;group.add(p);
    const L=Math.abs(d.tipZ-d.shoreZ),mid=(d.tipZ+d.shoreZ)/2,w=d.pierWidth,y=d.deckY;
    // Continuous girders support separate crosswise deck boards.
    for(const dx of [-w*.36,0,w*.36])box(p,.22,.34,L,frame,d.x+dx,y-.36,mid);
    const count=Math.ceil(L/.30),step=L/count;
    for(let j=0;j<count;j++){
      const z=d.shoreZ-d.side*(j+.5)*step;
      box(p,w,.18,step-.022,woods[(j+i*2)%5],d.x,y-.09,z);
      for(const dx of [-w*.35,w*.35])mesh(p,new THREE.CylinderGeometry(.024,.024,.01,5),iron,d.x+dx,y+.006,z);
      if(j%4===0)box(p,.011,.007,step*.64,frame,d.x+.47*Math.sin(j*7),y+.006,z);
    }
    const n=Math.ceil(L/3.7);
    for(let j=0;j<=n;j++){
      const z=d.shoreZ+(d.tipZ-d.shoreZ)*j/n;
      box(p,w+.12,.22,.24,frame,d.x,y-.37,z);
      for(const s of [-1,1]){
        const x=d.x+s*(w/2-.13),bed=heightAt(x,z)-.25,top=y+.64;
        beam(p,[x,bed,z],[x,top,z],.155,woods[(j+2)%5]);
        mesh(p,new THREE.CylinderGeometry(.177,.177,.11,8),iron,x,y+.45,z);
        if(j<n){const z2=d.shoreZ+(d.tipZ-d.shoreZ)*(j+1)/n,bottom=Math.max(waterLevel-.8,heightAt(x,(z+z2)/2)+.2);beam(p,[x,bottom,z],[x,y-.39,z2],.075);beam(p,[x,y-.39,z],[x,bottom,z2],.075);}
      }
    }
    // A low side bench leaves the central working passage open.
    const bz=d.shoreZ-d.side*2.2;
    box(p,.48,.13,1.65,woods[1],d.x-1.30,y+.48,bz);
    for(const zz of [bz-.6,bz+.6])box(p,.12,.43,.12,frame,d.x-1.30,y+.215,zz);
    crate(p,d.x+1.15,y,d.shoreZ-d.side*1.0,.75);
    barrel(p,d.x+1.14,y,d.shoreZ-d.side*2.25);
    coil(p,d.x+.85,y,d.tipZ+d.side*1.1,.39);
    trap(p,d.x-.95,y,d.tipZ+d.side*2.5);
    // Paired floating boats. Southern placements stay east of the mill reserve.
    const sides=d.side===-1?[1,1]:[-1,1];
    for(let b=0;b<2;b++){
      const bx=d.x+sides[b]*3.05;
      const zz=d.tipZ+d.side*(3.2+b*(d.side===-1?7.2:2.7)),len=5.1+b*.5;
      const bo=boat(bx,zz,.04*(b===0?1:-1),len,1.85+b*.15,[0x4c6c67,0x78594a,0x65737b][(i+b)%3]);
      const postX=d.x+sides[b]*(w/2-.13);
      for(const end of [bo.bow,bo.stern]){
        const t=Math.max(0,Math.min(n,Math.round((end.z-d.shoreZ)/(d.tipZ-d.shoreZ)*n))),postZ=d.shoreZ+(d.tipZ-d.shoreZ)*t/n;
        line(group,[[postX,y+.45,postZ],[(postX+end.x)/2,Math.min(y+.1,end.y-.05),(postZ+end.z)/2],[end.x,end.y,end.z]],.038);
      }
      // Timber fenders hang between hull and pier.
      const fz=zz+.4,fx=bx-sides[b]*1.02;
      beam(group,[fx,waterLevel+.05,fz],[fx,waterLevel+.65,fz],.11,woods[2]);
      line(group,[[fx,waterLevel+.67,fz],[bx-sides[b]*.9,waterLevel+.71,fz]],.027);
    }
    const ashX=d.x+(d.side===-1?5.5:4.4),ashZ=d.shoreZ+d.side*4.5;
    boat(ashX,ashZ,i===2?Math.PI/2:(d.side===-1?.06:-.12),4.65,1.65,0x8b7860,true);
    // Shore net drying frame, braced at the feet, outside the access path.
    const rackX=d.x+(d.side===-1?9.3:7.1),rackZ=d.shoreZ+d.side*2.5,span=3.2;
    const gy=Math.max(heightAt(rackX,rackZ-span/2),heightAt(rackX,rackZ+span/2)),top=gy+2.8;
    for(const s of [-1,1]){const zz=rackZ+s*span/2;beam(group,[rackX,heightAt(rackX,zz)-.1,zz],[rackX,top+.12,zz],.095);beam(group,[rackX+.65,heightAt(rackX+.65,zz),zz],[rackX,gy+1.25,zz],.055);}
    beam(group,[rackX,top,rackZ-span/2],[rackX,top,rackZ+span/2],.07);
    for(let j=0;j<=16;j++){const t=j/16,zz=rackZ-span/2+t*span,sag=.28*Math.sin(t*Math.PI);line(group,[[rackX,top-sag,zz],[rackX+.12,top-.8-sag,zz],[rackX+.22,top-1.65-sag,zz]],.017,netMat);}
    for(let j=0;j<=9;j++){const pts=[];for(let k=0;k<=16;k++){const t=k/16;pts.push([rackX+j/9*.22,top-j*.184-.28*Math.sin(t*Math.PI),rackZ-span/2+t*span]);}line(group,pts,.017,netMat);}
    for(let j=0;j<7;j++)mesh(group,new THREE.SphereGeometry(.065,6,5),woods[1],rackX,top-.28*Math.sin(j/6*Math.PI),rackZ-span/2+j*span/6);
    const gearX=d.x+(d.side===-1?9.0:6.6),gearZ=d.shoreZ+d.side*6.2,ground=heightAt(gearX,gearZ);
    crate(group,gearX,ground+.04,gearZ,.9);if(i!==1)crate(group,gearX,ground+.90,gearZ,.78);
    barrel(group,gearX+1.05,heightAt(gearX+1.05,gearZ)+.02,gearZ);
    trap(group,gearX,heightAt(gearX,gearZ+d.side*1.2)+.04,gearZ+d.side*1.2);
    const site=new THREE.Group();site.name=`waterfront-landings_${d.id}`;
    for(const o of group.children.slice(begin))site.add(o);
    group.add(site);
  }
  return group;
}
