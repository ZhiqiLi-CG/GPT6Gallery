import {heightAt, bankZ, waterLevel, layout, claimDistrict} from './root.js';
import {landingPlan, claimWaterfrontPart} from './waterfront.js';

// A deterministic continuous habitat; geography and working access stay owner-defined.
export function build(THREE, ctx) {
  claimDistrict('waterfront');
  claimWaterfrontPart('riparian');
  const g=new THREE.Group();g.name='waterfront-riparian: weeping willows and living banks';
  let seed=90173;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
  const materials={bark:mat(0x66583c),barkLight:mat(0x817052),twig:mat(0x76763c),leaf:mat(0x728e3e),leafLight:mat(0x8fa74f),leafDark:mat(0x597a38),reed:mat(0x6e8544),dry:mat(0xa29b59),cattail:mat(0x62472e),grass:mat(0x81964c),grassDark:mat(0x657f3c),rock:mat(0x939382),rockDark:mat(0x737c6a),moss:mat(0x75844b)};
  const lance=new THREE.BufferGeometry();
  lance.setAttribute('position',new THREE.Float32BufferAttribute([0,-.5,0,-.5,-.07,0,0,.5,0,.5,-.07,0,0,-.04,.12],3));
  lance.setIndex([0,1,4,1,2,4,2,3,4,3,0,4,4,1,0,4,2,1,4,3,2,4,0,3]);lance.computeVertexNormals();
  const geos={stem:new THREE.CylinderGeometry(.72,1,1,6),leaf:lance,rock:new THREE.DodecahedronGeometry(1,0),tail:new THREE.CylinderGeometry(.85,1,1,7)};
  const batches=new Map(),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  const landings=landingPlan(),plan=layout();
  // Recorded finished domestic holdings guard fences as well as walls. Fallback
  // site footprints also protect cottages whose owners have not delivered yet.
  const domestic=Object.entries(ctx.objects||{}).filter(([id,o])=>o.bbox && !/blockout/.test(id) && /riverside.*holding|cottage_holding/.test(id)).map(([,o])=>o.bbox);
  const footprints=[...plan.northHouses.map(([x,z])=>[x-6,0,z-6,x+6,30,z+6]),...plan.southHouses.map(([x,z])=>[x-7,0,z-7,x+7,30,z+7])];
  function clear(x,z,r=0){
    if(x-r < -150 || x+r >150 || z-r < -56 || z+r >58)return false;
    if(x+r>=-34&&x-r<=-10)return false;
    if(z-r<0&&x+r>=38&&x-r<=80)return false;
    for(const d of landings){
      if(Math.abs(x-d.x)<8+r && z>=Math.min(d.tipZ,d.shoreZ)-r && z<=Math.max(d.tipZ,d.shoreZ)+r)return false;
      if(Math.abs(x-d.x)<3+r && z>=Math.min(d.shoreZ,d.roadZ)-r && z<=Math.max(d.shoreZ,d.roadZ)+r)return false;
    }
    for(const b of [...domestic,...footprints])if(x+r>b[0]&&x-r<b[3]&&z+r>b[2]&&z-r<b[5])return false;
    return true;
  }
  function inst(shape,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
    dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();
    const key=shape+':'+m;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(dummy.matrix.clone());
  }
  function beam(a,b,r,m='bark'){
    const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);
    dummy.position.copy(va).add(vb).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();
    const key='stem:'+m;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(dummy.matrix.clone());
  }
  const sites=[[-142,1],[-126,1],[-112,1],[-57,1],[-43,1],[-3,1],[45,1],[65,1],[88,1],[110,1],[133,1],[144,1],[-141,-1],[-123,-1],[-106,-1],[-81,-1],[-46,-1],[-4,-1],[25,-1],[99,-1],[120,-1],[141,-1]];
  const built=[];
  for(let index=0;index<sites.length;index++){
    const [x,side]=sites[index],z=bankZ(x,side)+side*(1.6+rnd()*.9),y=heightAt(x,z),h=8.9+rnd()*3.4,R=4.4+rnd()*1.6;
    if(!clear(x,z,.8))continue;
    const lean=(rnd()-.5)*1.0,top=[x+lean,y+h*.47,z-side*.55];
    // Buttress roots grip the slope; a thick irregular trunk divides into real boughs.
    for(let k=0;k<7;k++){const a=k*Math.PI*2/7,rx=x+Math.cos(a)*1.5,rz=z+Math.sin(a)*1.5;if(clear(rx,rz,.12))beam([rx,heightAt(rx,rz)+.05,rz],[x,y+.75,z],.20+rnd()*.13);}
    const p1=[x+.20,y+h*.21,z-side*.15];beam([x,y-.2,z],p1,.62);beam(p1,top,.48);
    for(let k=0;k<8;k++){
      const a=k*Math.PI*2/8+rnd()*.38,rr=R*(.81+rnd()*.25),hh=h*(.80+rnd()*.17);
      const points=[top,[x+Math.cos(a)*rr*.34,y+hh*.86,z+Math.sin(a)*rr*.34],[x+Math.cos(a)*rr*.72,y+hh,z+Math.sin(a)*rr*.72],[x+Math.cos(a)*rr,y+hh*.86,z+Math.sin(a)*rr]];
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
      for(let j=0;j<11;j++){const a=curve.getPoint(j/11).toArray(),b=curve.getPoint((j+1)/11).toArray();if(clear(a[0],a[2],.32)&&clear(b[0],b[2],.32))beam(a,b,.29*(1-j/15));}
      // Side branchlets and dangling twigs distribute foliage across an umbrella,
      // leaving visible irregular gaps and exposing the main branch crotches.
      for(let t=0;t<23;t++){
        const f=.18+rnd()*.86,aa=a+(rnd()-.5)*.72,rad=rr*f;
        const tx=x+Math.cos(aa)*rad,tz=z+Math.sin(aa)*rad;
        if(!clear(tx,tz,.55))continue;
        const attach=curve.getPoint(.22+Math.min(f,1)*.76);
        const ty=attach.y+.18+rnd()*.18;
        const len=(2.8+rnd()*3.9)*(f<.45?.74:1),bottom=Math.max(y+.6,ty-len);
        const origin=attach.toArray();
        if(!clear(origin[0],origin[2],.3))continue;
        beam(origin,[tx,ty,tz],.048,'twig');
        for(let q=0;q<5;q++){const u=q/5,lx=origin[0]+(tx-origin[0])*u,lz=origin[2]+(tz-origin[2])*u,ly=origin[1]+(ty-origin[1])*u;inst('leaf',q%2?'leafLight':'leaf',lx,ly+.2,lz,.24,.7,.8,.4,aa+q,Math.sin(q)*.7);}
        let prev=[tx,ty,tz];
        for(let j=1;j<=12;j++){
          const u=j/12,bend=Math.sin(u*Math.PI*.6)*.35;
          const px=tx+Math.cos(aa)*bend,pz=tz+Math.sin(aa)*bend,py=ty-(ty-bottom)*u;
          if(!clear(px,pz,.55))break;
          beam(prev,[px,py,pz],.019,'twig');prev=[px,py,pz];
          for(let q=0;q<3;q++){
            const la=aa+q*2.094+j*.5,spread=.14+rnd()*.13;
            inst('leaf',j%4===0?'leafLight':(t%3?'leaf':'leafDark'),px+Math.cos(la)*spread,py-.1,pz+Math.sin(la)*spread,.20+rnd()*.12,.61+rnd()*.32,.7,(rnd()-.5)*.40,la,.24+q*.28);
          }
        }
      }
    }
    // Short bark fissures are confined to the trunk, catching grazing light.
    for(let k=0;k<14;k++){const a=rnd()*Math.PI*2,yy=y+rnd()*h*.33;beam([x+Math.cos(a)*.49,yy,z+Math.sin(a)*.49],[x+Math.cos(a)*.45,yy+.5+rnd()*.5,z+Math.sin(a)*.45],.022,'barkLight');}
    built.push({x,z,h,y,R});
  }
  // Irregular habitat islands extend from the shallow margin to the dry bank.
  // Waves modulate both density and width, so the riverbank never becomes a hedge.
  let reedCount=0,grassCount=0,rockCount=0;
  for(const side of [-1,1]){
    for(let i=0;i<4300;i++){
      const x=-149+rnd()*298,phase=Math.sin(x*.123+side)+.56*Math.sin(x*.337-side*2),width=1.3+1.5*(.5+.5*Math.sin(x*.087));
      if(phase<-.45 || rnd()>.61+.2*phase)continue;
      const offset=-.85+rnd()*width,z=bankZ(x,side)+side*offset;
      if(!clear(x,z,.38))continue;
      const base=heightAt(x,z)-.04,h=1.15+rnd()*1.65,angle=rnd()*6.283,lean=.12+rnd()*.34;
      const top=[x+Math.cos(angle)*lean,Math.max(base,waterLevel-.35)+h,z+Math.sin(angle)*lean];
      beam([x,base,z],top,.027+rnd()*.013,i%8===0?'dry':'reed');reedCount++;
      if(i%3===0){inst('tail','cattail',top[0],top[1]-.16,top[2],.087,.43+rnd()*.18,.087);beam(top,[top[0],top[1]+.18,top[2]],.015,'dry');}
      for(let k=0;k<3;k++){
        const a=angle+k*2.1,hh=h*(.48+rnd()*.30),lx=x+Math.cos(a)*.24,lz=z+Math.sin(a)*.24;
        inst('leaf',k===2?'grass':'reed',lx,base+hh*.60,lz,.10,hh,1,Math.cos(a)*.4,a,Math.sin(a)*.4);
      }
    }
    for(let i=0;i<4300;i++){
      const x=-149+rnd()*298,offset=.8+rnd()*5.5,z=bankZ(x,side)+side*offset;
      if(!clear(x,z,.45)||Math.sin(x*.4+z*1.1)+Math.sin(z*2-x*.16)<-.8)continue;
      const y=heightAt(x,z);
      for(let k=0;k<5;k++){const a=rnd()*6.283,h=.26+rnd()*.68;inst('leaf',i%3?'grass':'grassDark',x+Math.cos(a)*.15,y+h*.44,z+Math.sin(a)*.15,.065+rnd()*.05,h,.8,Math.cos(a)*.5,a,Math.sin(a)*.5);}
      grassCount++;
    }
    for(let i=0;i<170;i++){
      const x=-148+rnd()*296,z=bankZ(x,side)+side*(rnd()*4-.5),r=.25+rnd()*.65;
      if(!clear(x,z,r*1.5))continue;
      const y=heightAt(x,z),a=rnd()*6.28;
      inst('rock',i%3?'rock':'rockDark',x,y+.08,z,r*1.3,r*.62,r,.1,a,rnd()*.3);
      if(i%3===0)inst('rock','moss',x+.04,y+r*.39,z,r*.86,r*.17,r*.78,.05,a,0);
      rockCount++;
    }
  }
  // Enforce clearances on full transformed geometry, including leaning tips.
  const reserves=[[-34,-56,-10,58],[38,-56,80,0],...[...domestic,...footprints].map(b=>[b[0],b[2],b[3],b[5]])];
  for(const d of landings){reserves.push([d.x-8,Math.min(d.tipZ,d.shoreZ),d.x+8,Math.max(d.tipZ,d.shoreZ)]);reserves.push([d.x-3,Math.min(d.shoreZ,d.roadZ),d.x+3,Math.max(d.shoreZ,d.roadZ)]);}
  const extent=new THREE.Box3();let clippedTips=0;
  for(const geo of Object.values(geos))geo.computeBoundingBox();
  for(const [key,raw]of batches){const shapeName=key.split(':')[0];const list=raw.filter(mx=>{extent.copy(geos[shapeName].boundingBox).applyMatrix4(mx);const valid=extent.min.x>=-150&&extent.max.x<=150&&extent.min.z>=-56&&extent.max.z<=58&&!reserves.some(r=>extent.max.x>r[0]&&extent.min.x<r[2]&&extent.max.z>r[1]&&extent.min.z<r[3]);if(!valid)clippedTips++;return valid;});const [shape,m]=key.split(':'),o=new THREE.InstancedMesh(geos[shape],materials[m],list.length);list.forEach((mx,i)=>o.setMatrixAt(i,mx));o.castShadow=true;o.receiveShadow=true;o.name='waterfront-riparian '+key;g.add(o);}
  g.userData={willows:built.length,reedStems:reedCount,grassClumps:grassCount,rocks:rockCount,willowSites:built,clippedTips};
  return g;
}
