import * as v0_5 from './v0_5/index';

export interface containsOme {
  ome: v0_5.OmeRaw;
}

// will be unions if/when other versions are added
export type AnyOme = v0_5.Ome;
export type ZAttrsRaw = containsOme;

export function omeFromAttrs(obj: ZAttrsRaw): AnyOme {
  if (obj.ome !== null) {
    if (obj.ome.version === '0.5') {
      return v0_5.Ome.fromRaw(obj.ome);
    }
    throw new Error(`OME version ${obj.ome.version} not supported`);
  }
  throw new Error('OME object not inside `"ome"` field not supported');
}
