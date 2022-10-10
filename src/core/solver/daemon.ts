import {
  BreachProtocolRawData,
  DaemonRawData,
  DaemonsRawData,
} from '../common';
import { HexCodeSequence } from './hex-code-sequence';

export class Daemon extends HexCodeSequence<DaemonRawData> {
  /** Whether this daemon is a child of another daemon. */
  get isChild() {
    return this.parents.size > 0;
  }

  /** Whether this daemon is a parent of another daemon. */
  get isParent() {
    return this.children.size > 0;
  }

  private readonly parents = new Set<Daemon>();
  private readonly children = new Set<Daemon>();

  constructor(value: DaemonRawData, public readonly index: number) {
    super(value);
  }

  static parse(daemons: DaemonsRawData): Daemon[];
  static parse(rawData: BreachProtocolRawData): Daemon[];
  static parse(daemonsOrRawData: DaemonsRawData | BreachProtocolRawData) {
    const rawData = Array.isArray(daemonsOrRawData)
      ? daemonsOrRawData
      : daemonsOrRawData.daemons;
    const daemons = rawData.map((d, i) => new Daemon(d, i));

    for (const d1 of daemons) {
      for (const d2 of daemons) {
        if (d1 === d2) {
          continue;
        }

        if (d1.tValue.includes(d2.tValue) && !d1.isChild) {
          d1.addChild(d2);
        }
      }
    }

    return daemons;
  }

  /** Checks whether this daemon has given child. */
  has(child: Daemon) {
    return this.children.has(child);
  }

  /** Adds child for this daemon. */
  addChild(child: Daemon) {
    if (this.isChild) {
      throw new Error('Child daemon cannot have children.');
    }

    child.parents.add(this);
    this.children.add(child);
  }

  /** Returns all daemons that are part of this daemon. */
  getParts() {
    return this.children.size ? [this, ...this.children] : [this];
  }
}
