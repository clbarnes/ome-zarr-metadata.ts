import { Axes, type AxisRaw } from './axes';
import {
  type CoordinateTransformationRaw,
  CoordinateTransformations,
} from './coordinateTransformations';
import { Dataset, type DatasetRaw } from './datasets';

export interface MultiscaleRaw {
  axes: AxisRaw[];
  datasets: DatasetRaw[];
  coordinateTransformations?: CoordinateTransformationRaw[];
  name?: string;
  type?: string;
  metadata?: object;
}

export class Multiscale {
  axes: Axes;
  datasets: Dataset[];
  coordinateTransformations?: CoordinateTransformations;
  name?: string;
  type?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  metadata?: Map<string, any>;

  constructor(
    axes: Axes,
    datasets: Dataset[],
    coordinateTransformations?: CoordinateTransformations,
    name?: string,
    type?: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    metadata: Map<string, any> = new Map(),
  ) {
    const ndim = axes.ndim();

    for (const d of datasets) {
      if (d.ndim() !== ndim) {
        throw new Error(`dataset is ${d.ndim()}D, axes are ${ndim}D`);
      }
    }

    if (
      coordinateTransformations != null &&
      ndim !== coordinateTransformations.ndim()
    ) {
      throw new Error(
        `coordinateTransformations are ${coordinateTransformations.ndim()}D, axes are ${ndim}D`,
      );
    }

    this.axes = axes;
    this.datasets = datasets;
    this.coordinateTransformations = coordinateTransformations;
    this.name = name;
    this.type = type;
    this.metadata = metadata;
  }

  ndim(): number {
    return this.axes.ndim();
  }

  static fromRaw(obj: MultiscaleRaw): Multiscale {
    let ct: CoordinateTransformations | undefined = undefined;
    if (obj.coordinateTransformations != null) {
      ct = CoordinateTransformations.fromRaw(obj.coordinateTransformations);
    }
    const metadata = new Map();
    if (obj.metadata != null) {
      for (const [k, v] of Object.entries(obj.metadata)) {
        metadata.set(k, v);
      }
    }

    return new Multiscale(
      Axes.fromRaw(obj.axes),
      obj.datasets.map(Dataset.fromRaw),
      ct,
      obj.name,
      obj.type,
      metadata,
    );
  }

  toRaw(): MultiscaleRaw {
    const o = {
      axes: this.axes.toRaw(),
      datasets: this.datasets.map((d) => d.toRaw()),
      name: this.name,
      type: this.type,
    };
    if (this.coordinateTransformations != null) {
      Object.defineProperty(
        o,
        'coordinateTransformations',
        this.coordinateTransformations.toRaw(),
      );
    }
    if (this.metadata != null) {
      Object.defineProperty(o, 'metadata', Object.fromEntries(this.metadata));
    }
    return o;
  }
}
