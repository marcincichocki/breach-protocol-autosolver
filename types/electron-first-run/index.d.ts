declare module 'electron-first-run' {
  function firstRun(): boolean;

  namespace firstRun {
    function clear(): void;
  }

  export = firstRun;
}
