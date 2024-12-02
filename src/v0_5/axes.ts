export const SPACE = 'space';
export const TIME = 'time';
export const CHANNEL = 'channel';

abstract class Axis {
  name: string;
  type?: string;
  unit?: string;

  constructor(name: string, type?: string, unit?: string) {
    this.name = name;
    this.type = type;
    this.unit = unit;
  }

  toRaw(): AxisRaw {
    return this;
  }
}

export type TimeUnit =
  | 'attosecond'
  | 'centisecond'
  | 'day'
  | 'decisecond'
  | 'exasecond'
  | 'femtosecond'
  | 'gigasecond'
  | 'hectosecond'
  | 'hour'
  | 'kilosecond'
  | 'megasecond'
  | 'microsecond'
  | 'millisecond'
  | 'minute'
  | 'nanosecond'
  | 'petasecond'
  | 'picosecond'
  | 'second'
  | 'terasecond'
  | 'yoctosecond'
  | 'yottasecond'
  | 'zeptosecond'
  | 'zettasecond';

export class TimeAxis extends Axis {
  type = 'time';
  declare unit?: TimeUnit | string;

  constructor(name: string, unit?: TimeUnit | string) {
    super(name, TIME, unit);
  }
}

export type SpaceUnit =
  | 'angstrom'
  | 'attometer'
  | 'centimeter'
  | 'decimeter'
  | 'exameter'
  | 'femtometer'
  | 'foot'
  | 'gigameter'
  | 'hectometer'
  | 'inch'
  | 'kilometer'
  | 'megameter'
  | 'meter'
  | 'micrometer'
  | 'mile'
  | 'millimeter'
  | 'nanometer'
  | 'parsec'
  | 'petameter'
  | 'picometer'
  | 'terameter'
  | 'yard'
  | 'yoctometer'
  | 'yottameter'
  | 'zeptometer'
  | 'zettameter';

export class SpaceAxis extends Axis {
  type = 'space';
  declare unit?: SpaceUnit | string;

  constructor(name: string, unit?: SpaceUnit | string) {
    super(name, SPACE, unit);
  }
}

export class ChannelAxis extends Axis {
  type = 'channel';

  constructor(name: string) {
    super(name, CHANNEL);
  }
}

export interface AxisRaw {
  name: string;
  type?: string;
  unit?: string;
}

export class CustomAxis extends Axis {}

function axisFromRaw(obj: AxisRaw): Axis {
  switch (obj.type) {
    case SPACE:
      return new SpaceAxis(obj.name, obj.unit);
    case TIME:
      return new TimeAxis(obj.name, obj.unit);
    case CHANNEL:
      return new ChannelAxis(obj.name);
  }

  return new CustomAxis(obj.name, obj.type, obj.unit);
}

export class Axes {
  time?: TimeAxis;
  space: SpaceAxis[];
  channel?: ChannelAxis;
  custom?: CustomAxis;

  constructor(
    space: SpaceAxis[],
    time?: TimeAxis,
    channelOrCustom?: ChannelAxis | CustomAxis,
  ) {
    if (space.length < 2 || space.length > 3) {
      throw new Error(`Must have 2 or 3 space axes, got ${space.length}`);
    }
    this.space = space;

    if (channelOrCustom instanceof ChannelAxis) {
      this.channel = channelOrCustom;
    } else if (
      channelOrCustom?.type != null &&
      [SPACE, TIME, CHANNEL].includes(channelOrCustom.type)
    ) {
      throw new Error(
        `Custom/null axis may not be space, time, or channel; got ${channelOrCustom.type}`,
      );
    } else {
      this.custom = channelOrCustom;
    }
    this.time = time;
  }

  ndim(): number {
    let n = this.space.length;
    if (this.time != null) {
      n += 1;
    }
    if (this.channel != null || this.custom != null) {
      n += 1;
    }
    return n;
  }

  static fromRaw(objs: AxisRaw[]): Axes {
    if (objs.length < 2 || objs.length > 5) {
      throw new Error(`Needed 2-5 axes, got ${objs.length}`);
    }
    let time: TimeAxis | undefined = undefined;
    const space: SpaceAxis[] = [];
    let other: ChannelAxis | CustomAxis | undefined = undefined;

    const axs = objs.map(axisFromRaw).reverse();
    while (axs.length > 0) {
      const ax = axs.pop();
      if (ax == null) {
        // can't happen anyway
        break;
      }

      if (ax instanceof TimeAxis) {
        if (time != null) {
          throw new Error('>1 time axis');
        }
        if (space.length > 0) {
          throw new Error('time axis after space axes');
        }
        if (other != null) {
          throw new Error('time axis after channel/custom axes');
        }
        time = ax as TimeAxis;
        continue;
      }

      if (ax instanceof ChannelAxis || ax instanceof CustomAxis) {
        if (space.length > 0) {
          throw new Error('channel/custom axis after space axes');
        }
        if (other != null) {
          throw new Error('more than 1 channel/custom axis');
        }
        other = ax;
        continue;
      }

      if (ax instanceof SpaceAxis) {
        if (space.length >= 3) {
          throw new Error('more than 3 space axes');
        }
        space.push(ax as SpaceAxis);
        continue;
      }

      throw new Error(`unrecognised axis type: ${ax}`);
    }

    return new Axes(space, time, other);
  }

  toRaw(): AxisRaw[] {
    const out: AxisRaw[] = [];
    if (this.time != null) {
      out.push(this.time.toRaw());
    }
    for (const s of this.space) {
      out.push(s.toRaw());
    }
    if (this.custom != null) {
      out.push(this.custom.toRaw());
    }
    if (this.channel != null) {
      if (this.custom != null) {
        throw new Error('got a custom and a channel dimension');
      }
      out.push(this.channel.toRaw());
    }
    return out;
  }
}
