declare module 'screenshot-desktop' {
  interface ScreenshotOptions {
    filename?: string;
    format?: string;
    linuxLibrary?: 'scrot' | 'imagemagick';
  }

  function screenshot(
    options?: ScreenshotOptions
  ): Promise<Buffer> | Promise<string>;

  export = screenshot;
}
