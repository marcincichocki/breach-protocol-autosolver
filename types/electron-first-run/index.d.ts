declare module 'electron-first-run' {
  interface FirstRunOptions {
    name: string;
  }

  function firstRun(options?: FirstRunOptions): boolean;

  namespace firstRun {
    function clear(options?: FirstRunOptions): void;
  }

  export = firstRun;
}
