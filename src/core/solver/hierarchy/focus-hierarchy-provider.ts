import { BreachProtocolRawData } from '../../common';
import { HierarchyProvider } from './hierarchy-provider';

/** Focuses one daemon, and applies index to others. */
export class FocusHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  constructor(
    private readonly focusedDaemonIndex: number,
    private readonly base: HierarchyProvider<BreachProtocolRawData>
  ) {}

  provide(rawData: BreachProtocolRawData) {
    const hierarchy = this.base.provide(rawData);

    if (this.focusedDaemonIndex in hierarchy) {
      hierarchy[this.focusedDaemonIndex] = Number.POSITIVE_INFINITY;
    }

    return hierarchy;
  }
}
