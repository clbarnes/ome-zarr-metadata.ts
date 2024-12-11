import { ImageLabel, type ImageLabelRaw } from './imageLabel';
import { Multiscale, type MultiscaleRaw } from './multiscales';

export interface OmeRaw {
  version: string;
  multiscales?: MultiscaleRaw[];
  labels?: string[];
  'image-label'?: ImageLabelRaw;
}

/**
 * Class representing OME metadata, version 0.5
 *
 * https://ngff.openmicroscopy.org/0.5/
 */
export class Ome {
  version = '0.5';
  multiscales?: Multiscale[];
  labels?: string[];
  imageLabel?: ImageLabel;

  constructor(
    multiscales?: Multiscale[],
    labels?: string[],
    imageLabel?: ImageLabel,
  ) {
    this.multiscales = multiscales;
    this.labels = labels;
    this.imageLabel = imageLabel;
  }

  ndim(idx: number): number | null {
    if (this.multiscales == null || this.multiscales[idx] == null) {
      return null;
    }
    return this.multiscales[idx].ndim();
  }

  static fromRaw(obj: OmeRaw): Ome {
    if (obj.version !== '0.5') {
      throw new Error(`expected version 0.5, got ${obj.version}`);
    }
    const multiscales = obj.multiscales?.map((o) => Multiscale.fromRaw(o));

    let imageLabel: ImageLabel | undefined;
    if (obj['image-label'] != null) {
      imageLabel = ImageLabel.fromRaw(obj['image-label']);
    }
    return new Ome(multiscales, obj.labels, imageLabel);
  }

  toRaw(): OmeRaw {
    return {
      version: '0.5',
      multiscales: this.multiscales?.map((o) => o.toRaw()),
      labels: this.labels,
      'image-label': this.imageLabel?.toRaw(),
    };
  }
}
