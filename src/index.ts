import * as v0_5 from './v0_5/index';

export type AnyOme = v0_5.Ome;
export type AnyOmeRaw = v0_5.OmeRaw;

export function omeFromRaw(obj: AnyOmeRaw): AnyOme {
  if (obj.version === '0.5') {
    return v0_5.Ome.fromRaw(obj);
  }
  throw new Error(`OME version ${obj.version} not supported`);
}
