import { BreachProtocolRawData } from '@/core/common';
import { HierarchyProvider } from './hierarchy-provider';

export class TypesHierarchyProvider
  implements HierarchyProvider<BreachProtocolRawData>
{
  constructor(private readonly typesHierarchy: string[]) {}

  provide(data: BreachProtocolRawData): number[] {
    return data.types.map((type) => {
      return this.typesHierarchy.findIndex((d) => d === type);
    });
  }
}
