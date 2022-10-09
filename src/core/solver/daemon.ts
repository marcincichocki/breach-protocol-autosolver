import { DaemonRawData } from '../common';
import { HexCodeSequence } from './hex-code-sequence';

export class Daemon extends HexCodeSequence<DaemonRawData> {
  get isChild() {
    return this.parent !== null;
  }

  get isParent() {
    return this.children.size > 0;
  }

  private parent: Daemon = null;

  private readonly children = new Set<Daemon>();

  constructor(
    value: DaemonRawData,
    public readonly index: number,
    id?: string
  ) {
    super(value);
  }

  has(child: Daemon) {
    return this.children.has(child);
  }

  addChild(child: Daemon) {
    this.children.add(child);
  }

  setParent(parent: Daemon) {
    this.parent = parent;
  }

  getParts() {
    return this.children.size ? [this, ...this.children] : [this];
  }
}
