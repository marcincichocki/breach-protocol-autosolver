import { BreachProtocolRawData } from '@/core/common';
import { HierarchyProvider } from './hierarchy-provider';
import { IndexHierarchyProvider } from './index-hierarchy-provider';

/** Focuses one daemon, and applies index to others. */
export class FocusHierarchyProvider
  extends IndexHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  constructor(private readonly focusedDaemonIndex: number) {
    super();
  }

  override provide(rawData: BreachProtocolRawData) {
    const hierarchy = super.provide(rawData);

    hierarchy[this.focusedDaemonIndex] = Number.POSITIVE_INFINITY;

    return hierarchy;
  }
}
