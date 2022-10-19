import { BreachProtocolRawData } from '../../common';
import { HierarchyProvider } from './hierarchy-provider';
import { IndexHierarchyProvider } from './index-hierarchy-provider';

export class TypesHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  private readonly fallback = new IndexHierarchyProvider();

  constructor(private readonly typesHierarchy: string[]) {}

  provide(data: BreachProtocolRawData): number[] {
    if (data.types) {
      return data.types.map((type) =>
        this.typesHierarchy.findIndex((d) => d === type)
      );
    }

    return this.fallback.provide(data);
  }
}
