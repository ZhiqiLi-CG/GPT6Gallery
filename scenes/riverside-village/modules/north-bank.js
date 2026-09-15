import { claimDistrict } from './root.js';

// The composer builds all delivered north-bank holdings independently.
// Waterfront owns the finished landing approaches; drawing another path here
// would overlap their surfaces. All temporary district masses are retired.
export function build(THREE, ctx) {
  claimDistrict('north-bank');
  const group = new THREE.Group();
  group.name = 'Completed north-bank district';
  return group;
}
