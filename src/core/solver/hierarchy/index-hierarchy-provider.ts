import { BreachProtocolRawData } from '../../common';
import { HierarchyProvider } from './hierarchy-provider';

/** Marks each daemon with its index. */
export class IndexHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  provide({ daemons }: BreachProtocolRawData) {
    return daemons.map((_, index) => index);
  }
}
