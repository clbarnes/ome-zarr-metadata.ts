export class Rgba {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromRaw(obj: number[]): Rgba {
    if (obj.length !== 4) {
      throw new Error(`needed 4 values for rgba, got ${obj.length}`);
    }
    return new Rgba(obj[0], obj[1], obj[2], obj[3]);
  }

  toRaw(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }
}

interface LabelColorRaw {
  'label-value': number;
  rgba: number[];
}

export class LabelColor {
  labelValue: number;
  rgba: Rgba;

  constructor(labelValue: number, rgba: Rgba) {
    this.labelValue = labelValue;
    this.rgba = rgba;
  }

  static fromRaw(obj: LabelColorRaw): LabelColor {
    return new LabelColor(obj['label-value'], Rgba.fromRaw(obj.rgba));
  }

  toRaw(): LabelColorRaw {
    return {
      'label-value': this.labelValue,
      rgba: this.rgba.toRaw(),
    };
  }
}

export class Properties {
  labelValue: number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  properties: Map<string, any>;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(labelValue: number, properties: Map<string, any>) {
    this.labelValue = labelValue;
    this.properties = properties;
  }

  static fromRaw(obj: object): Properties {
    let labelValue: number | undefined = undefined;
    const props = new Map();
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'label-value') {
        const val = Number.parseInt(v);
        if (Number.isNaN(val)) {
          throw new Error(`non-numeric label-value ${v}`);
        }
        labelValue = val;
      } else {
        props.set(k, v);
      }
    }
    if (labelValue == null) {
      throw new Error('no label-value');
    }
    return new Properties(labelValue, props);
  }

  toRaw(): object {
    // todo: check this
    const o = { 'label-value': this.labelValue };
    this.properties.forEach((v, k) => {
      Object.defineProperty(o, k, v);
    });
    return o;
  }
}

export class Source {
  image?: string;

  constructor(image?: string) {
    this.image = image;
  }

  static fromRaw(obj: { image?: string }): Source {
    return new Source(obj.image);
  }

  toRaw(): { image?: string } {
    return { image: this.image };
  }
}

export interface ImageLabelRaw {
  version?: string;
  colors?: LabelColorRaw[];
  properties?: object[];
  source?: { image?: string };
}

export class ImageLabel {
  colors?: LabelColor[];
  version?: string;
  properties?: Properties[];
  source?: Source;

  constructor(
    version?: string,
    colors?: LabelColor[],
    properties?: Properties[],
    source?: Source,
  ) {
    this.colors = colors;
    this.version = version;
    this.properties = properties;
    this.source = source;
  }

  static fromRaw(obj: ImageLabelRaw): ImageLabel {
    let source: Source | undefined = undefined;
    if (obj.source != null) {
      source = Source.fromRaw(obj.source);
    }

    return new ImageLabel(
      obj.version,
      obj.colors?.map(LabelColor.fromRaw),
      obj.properties?.map(Properties.fromRaw),
      source,
    );
  }

  toRaw(): ImageLabelRaw {
    return {
      version: this.version,
      colors: this.colors?.map((o) => o.toRaw()),
      properties: this.properties?.map((o) => o.toRaw()),
      source: this.source?.toRaw(),
    };
  }
}
