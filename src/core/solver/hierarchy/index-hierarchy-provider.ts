import { BreachProtocolRawData } from '@/core/common';
import { HierarchyProvider } from './hierarchy-provider';

export class IndexHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  provide({ daemons }: BreachProtocolRawData) {
    return daemons.map((_, index) => index);
  }
}
