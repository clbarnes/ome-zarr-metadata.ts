export const TRANSLATION = 'translation';
export const SCALE = 'scale';
export const IDENTITY = 'identity';

export abstract class CoordinateTransformation {
  type: string;

  constructor(type: string) {
    this.type = type;
  }

  abstract dataToPhysical(coords: number[]): number[];

  abstract physicalToData(coords: number[]): number[];

  toRaw(): CoordinateTransformationRaw {
    return this;
  }
}

export class Identity extends CoordinateTransformation {
  dataToPhysical(coords: number[]): number[] {
    return coords;
  }
  physicalToData(coords: number[]): number[] {
    return coords;
  }
  type = 'identity';
  constructor() {
    super(IDENTITY);
  }
}

abstract class BaseTranslation extends CoordinateTransformation {
  type = 'translation';

  constructor() {
    super(TRANSLATION);
  }
}

export class Translation extends BaseTranslation {
  translation: number[];

  constructor(translation: number[]) {
    super();
    this.translation = translation;
  }

  ndim(): number {
    return this.translation.length;
  }

  dataToPhysical(coords: number[]): number[] {
    if (coords.length !== this.translation.length) {
      throw new Error('mismatching coordinate dimensionalities');
    }
    return coords.map((val, idx) => val + this.translation[idx]);
  }

  physicalToData(coords: number[]): number[] {
    if (coords.length !== this.translation.length) {
      throw new Error('mismatching coordinate dimensionalities');
    }
    return coords.map((val, idx) => val - this.translation[idx]);
  }
}

export class TranslationPath extends BaseTranslation {
  constructor(path: string) {
    super();
    this.path = path;
  }

  dataToPhysical(coords: number[]): number[] {
    throw new Error('Method not implemented.');
  }

  physicalToData(coords: number[]): number[] {
    throw new Error('Method not implemented.');
  }

  path: string;
}

abstract class BaseScale extends CoordinateTransformation {
  type = 'scale';

  constructor() {
    super(SCALE);
  }
}

export class Scale extends BaseScale {
  constructor(scale: number[]) {
    super();
    this.scale = scale;
  }

  ndim(): number {
    return this.scale.length;
  }

  static default(ndim: number): Scale {
    const arr = new Array(ndim);
    return new Scale(arr.fill(1));
  }

  dataToPhysical(coords: number[]): number[] {
    if (coords.length !== this.scale.length) {
      throw new Error('mismatching coordinate dimensionalities');
    }
    return coords.map((val, idx) => val * this.scale[idx]);
  }

  physicalToData(coords: number[]): number[] {
    if (coords.length !== this.scale.length) {
      throw new Error('mismatching coordinate dimensionalities');
    }
    return coords.map((val, idx) => val / this.scale[idx]);
  }

  scale: number[];
}

export class ScalePath extends BaseScale {
  constructor(path: string) {
    super();
    this.path = path;
  }
  dataToPhysical(coords: number[]): number[] {
    throw new Error('Method not implemented.');
  }
  physicalToData(coords: number[]): number[] {
    throw new Error('Method not implemented.');
  }
  path: string;
}

export interface CoordinateTransformationRaw {
  type: string;
  translation?: number[];
  scale?: number[];
  path?: string;
}

export function coordinateTransformationFromRaw(
  obj: CoordinateTransformationRaw,
): CoordinateTransformation {
  switch (obj.type) {
    case 'identity':
      return new Identity();
    case 'translation':
      if (obj.translation != null) {
        return new Translation(obj.translation);
      }
      if (obj.path != null) {
        return new TranslationPath(obj.path);
      }
      throw new Error('Invalid translation transform');
    case 'scale':
      if (obj.scale != null) {
        return new Scale(obj.scale);
      }
      if (obj.path != null) {
        return new ScalePath(obj.path);
      }
      throw new Error('Invalid scale transform');
  }

  throw new Error(`Coordinate transformation has invalid type: ${obj.type}`);
}

export class CoordinateTransformations {
  scale: Scale;
  translation?: Translation;

  constructor(scale: Scale, translation?: Translation) {
    if (translation != null && translation.ndim() !== scale.ndim()) {
      throw new Error(
        `scale (${scale.ndim()}D) and translation (${translation.ndim()}D) have different dimensionalities`,
      );
    }
    this.scale = scale;
    this.translation = translation;
  }

  ndim(): number {
    return this.scale.ndim();
  }

  dataToPhysical(
    coords: number[],
    parentTransformations?: CoordinateTransformations,
  ): number[] {
    let out = this.scale.dataToPhysical(coords);
    if (this.translation != null) {
      out = this.translation.dataToPhysical(out);
    }
    if (parentTransformations != null) {
      out = parentTransformations.dataToPhysical(out);
    }
    return out;
  }

  physicalToData(
    coords: number[],
    parentTransformations?: CoordinateTransformations,
  ): number[] {
    let out = coords;
    if (parentTransformations != null) {
      out = parentTransformations.physicalToData(coords);
    }
    if (this.translation != null) {
      out = this.translation.physicalToData(out);
    }
    return this.scale.physicalToData(out);
  }

  static fromRaw(
    objs: CoordinateTransformationRaw[],
  ): CoordinateTransformations {
    if (objs.length === 0 || objs.length > 2) {
      throw new Error('1 or 2 transformations allowed');
    }
    const ts = objs.map((o) => coordinateTransformationFromRaw(o));
    const scale = ts[0];
    if (!(scale instanceof Scale)) {
      throw new Error('first transformation must be explicit scale');
    }
    const translate = ts[1];
    if (translate != null && !(translate instanceof Translation)) {
      throw new Error('second transformation must be explicit translation');
    }
    return new CoordinateTransformations(scale, translate);
  }

  toRaw(): CoordinateTransformationRaw[] {
    const arr = [this.scale.toRaw()];
    if (this.translation != null) {
      arr.push(this.translation.toRaw());
    }
    return arr;
  }
}
