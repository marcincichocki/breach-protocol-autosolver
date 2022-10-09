export interface HierarchyProvider<T> {
  /** Returns list of number which indicates which elements will be prioritized(higher is better). */
  provide(data: T): number[];
}
