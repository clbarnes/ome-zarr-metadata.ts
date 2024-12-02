import {
  type CoordinateTransformationRaw,
  CoordinateTransformations,
} from './coordinateTransformations';

export interface DatasetRaw {
  path: string;
  coordinateTransformations: CoordinateTransformationRaw[];
}

export class Dataset {
  path: string;
  coordinateTransformations: CoordinateTransformations;

  constructor(
    path: string,
    coordinateTransformations: CoordinateTransformations,
  ) {
    this.path = path;
    this.coordinateTransformations = coordinateTransformations;
  }

  ndim(): number {
    return this.coordinateTransformations.ndim();
  }

  static fromRaw(obj: DatasetRaw): Dataset {
    const ct = CoordinateTransformations.fromRaw(obj.coordinateTransformations);
    return new Dataset(obj.path, ct);
  }

  toRaw(): DatasetRaw {
    return {
      path: this.path,
      coordinateTransformations: this.coordinateTransformations.toRaw(),
    };
  }
}
