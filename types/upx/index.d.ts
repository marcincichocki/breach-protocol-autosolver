declare module 'upx' {
  interface UpxOptions {
    faster?: boolean;
    better?: boolean;
    best?: boolean;
    decompress?: boolean;
    list?: boolean;
    force?: boolean;
    brute?: boolean;
    ultraBrute?: boolean;
    overlayCopy?: boolean;
    overlayStrip?: boolean;
    overlaySkip?: boolean;
    8086?: boolean;
    noReloc?: boolean;
    '8bit'?: boolean;
    '8mibRam'?: boolean;
  }

  interface UpxStats {
    cmd: string;
    name: string;
    fileSize: {
      before: string;
      after: string;
    };
    ratio: string;
    format: string;
    affected: number;
  }

  class Upx {
    constructor(path: string, options: UpxOptions);

    output(outPath: string): this;

    start(): Promise<UpxStats>;
  }

  function upxFactory(options?: UpxOptions): (path: string) => Upx;

  export = upxFactory;
}
