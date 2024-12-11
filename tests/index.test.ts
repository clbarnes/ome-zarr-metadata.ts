import { omeFromAttrs } from '../src/index';
import * as multiscalesV0_5 from './v0_5/examples/multiscales.json';

describe('any: read v0.5', () => {
  test('any-multiscales', () => {
    const parsed = omeFromAttrs({ ome: multiscalesV0_5 });
    expect(parsed.version).toBe('0.5');
  });
});
