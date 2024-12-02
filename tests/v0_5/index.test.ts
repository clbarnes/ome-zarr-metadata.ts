import * as ome from '../../src/v0_5/index';
import * as imageLabel from './examples/image-label.json';
import * as labels from './examples/labels.json';
import * as multiscales from './examples/multiscales.json';

describe('deserialise v0.5', () => {
  test('multiscales', () => {
    ome.Ome.fromRaw(multiscales);
  });

  test('labels', () => {
    ome.Ome.fromRaw(labels);
  });

  test('image-label', () => {
    ome.Ome.fromRaw(imageLabel);
  });
});
