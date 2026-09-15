import { heightAt, roadNetwork, layout } from './root.js';

// Parent grounds only. Three spatial children own fences, gardens and furnishings.
export function build(THREE, ctx) {
  const group = new THREE.Group();
  group.name = 'Southern town: fitted earthen yards and worn approaches';
  const roads = roadNetwork();
  const lots = layout().town.lots.filter(l => l.z === -64 || l.z === -44);
  const earth = new THREE.MeshStandardMaterial({vertexColors:true, roughness:1});
  const gravel = new THREE.MeshStandardMaterial({color:'#b5a98c',roughness:1});
  const positions=[],colors=[],indices=[];
  function distance(x,z,a,b) {
    const dx=b[0]-a[0], dz=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
    return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
  }
  function inRoad(x,z,margin=.22) {
    return roads.some(r=>r.points.slice(1).some((b,i)=>distance(x,z,r.points[i],b)<r.width/2+margin));
  }
  // The first shore-side parcel ends at the inland edge of the root shore path.
  // Reject disconnected earth fragments across it, using the authoritative polyline.
  function inlandOfShore(x,z) {
    const shore=roads.find(r=>r.id==='shore-path');
    if(!shore)return true;
    let nearest=Infinity,inland=true;
    for(let i=1;i<shore.points.length;i++) {
      const a=shore.points[i-1],b=shore.points[i],d=distance(x,z,a,b);
      if(d<nearest) {
        nearest=d;
        inland=(b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0])>=0;
      }
    }
    return inland;
  }
  function occupied(x,z) {
    return lots.some((l,i)=>Math.abs(x-l.x)<(l.w-(i%3)*.25)/2+.18 && Math.abs(z-l.z)<(7+(i%2)*.3)/2+.18);
  }
  function hash(n) {const v=Math.sin(n*127.13+48.7)*43758.5453; return v-Math.floor(v);}
  const stones=[];
  for(let i=0;i<lots.length;i++) {
    const l=lots[i],south=l.z===-64;
    const x0=l.x-5.55,x1=l.x+5.55,z0=south?-77.4:-51.45,z1=south?-56.55:-38.2;
    const nx=Math.ceil((x1-x0)/.48), nz=Math.ceil((z1-z0)/.48);
    const dx=(x1-x0)/nx,dz=(z1-z0)/nz;
    for(let a=0;a<nx;a++)for(let b=0;b<nz;b++) {
      const x=x0+(a+.5)*dx,z=z0+(b+.5)*dz;
      if(inRoad(x,z,.55)||occupied(x,z)||(i===0&&!inlandOfShore(x,z)))continue;
      const n=positions.length/3;
      for(const [xx,zz] of [[x-dx/2,z-dz/2],[x-dx/2,z+dz/2],[x+dx/2,z-dz/2],[x+dx/2,z+dz/2]]) {
        positions.push(xx,heightAt(xx,zz)+.085,zz);
        const color=new THREE.Color(i%3===0?'#968a6a':i%3===1?'#a19576':'#9d9071');
        color.multiplyScalar(.96+.07*hash(xx*9+zz*17));colors.push(color.r,color.g,color.b);
      }
      indices.push(n,n+1,n+2,n+2,n+1,n+3);
      if(hash(a*11+b*131+i*817)>.96 && Math.abs(x-l.x)>1.3)stones.push([x,heightAt(x,z)+.115,z,.055+hash(b*119+i)*.08]);
    }
    // Worn stepping stones along a side passage, beneath the child-owned gate/fence layout.
    for(let k=0;k<(south?14:5);k++) {
      const x=l.x+(i%2?-1:1)*5.04,z=(south?-75.5:-49.9)+k*.77;
      if(inRoad(x,z,.5)||occupied(x,z)||(i===0&&!inlandOfShore(x,z)))continue;
      stones.push([x,heightAt(x,z)+.13,z,.23]);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,earth);mesh.receiveShadow=true;group.add(mesh);
  const rockGeo=new THREE.DodecahedronGeometry(1,0),matrix=new THREE.Object3D();
  const pebbles=new THREE.InstancedMesh(rockGeo,gravel,stones.length);
  stones.forEach(([x,y,z,s],i)=>{matrix.position.set(x,y,z);matrix.rotation.set(0,hash(i)*6.28,0);matrix.scale.set(s*1.3,s*.24,s);matrix.updateMatrix();pebbles.setMatrixAt(i,matrix.matrix);});
  pebbles.receiveShadow=true;pebbles.castShadow=true;group.add(pebbles);
  return group;
}
