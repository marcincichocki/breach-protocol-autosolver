/** Caches getter property after first call. */
export function Cache() {
  return (_: unknown, name: PropertyKey, descriptor: PropertyDescriptor) => {
    const { get, configurable, enumerable } = descriptor;

    descriptor.get = function () {
      const value = get.call(this);

      Object.defineProperty(this, name, {
        configurable,
        enumerable,
        writable: false,
        value,
      });

      return value;
    };
  };
}
