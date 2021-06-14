declare module 'screenshot-desktop' {
  namespace screenshot {
    function listDisplays(): Promise<ScreenshotDisplayOutput[]>;
    function availableDisplays(): Promise<ScreenshotDisplayOutput[]>;

    function parseDisplayOutput(output: string): ScreenshotDisplayOutput;

    const EXAMPLE_DISPLAYS_OUTPUT: string;

    function all(): Promise<Buffer[]> | Promise<string[]>;

    type ScreenshotFormat = 'jpg' | 'png';

    type ScreenshotLinuxLibrary = 'scrot' | 'imagemagick';

    interface ScreenshotOptions {
      filename?: string;
      format?: ScreenshotFormat;
      linuxLibrary?: ScreenshotLinuxLibrary;
      screen?: string;
    }

    interface ScreenshotDisplayOutput {
      id: string;
      name: string;
      top: number;
      right: number;
      bottom: number;
      left: number;
      dpiScale: number;
      width: number;
      height: number;
    }
  }

  function screenshot(
    options?: screenshot.ScreenshotOptions
  ): Promise<Buffer> | Promise<string>;

  export = screenshot;
}
