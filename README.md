# Breach Protocol AutoSolver for Cyberpunk 2077

Automatically solve any breach protocol.

## Video showcase:

[![Video](https://user-images.githubusercontent.com/10232391/111822212-d0fb0e80-88e3-11eb-82de-59fd4d8fd44b.png)](https://user-images.githubusercontent.com/10232391/111820491-dd7e6780-88e1-11eb-9fad-93cf1a07c82a.mp4)

## Installation and usage

[Download latest release](https://github.com/marcincichocki/breach-protocol-autosolver/releases/latest)

Use <kbd>Ctrl</kbd>+<kbd>NumPad_Decimal</kbd> key bind to start autosolver.

## Recognition accuracy

There are 3 main factors that impact recognition accuracy:

1. resolution

It must match monitor resolution. On very low resolution(below 720p) ocr might be inaccurate.

Please note that FidelityFX resolution scaling does not seem to impact resolution of breach protocol, therefore it's better to use it instead of lowering resolution to increase framerate.

2. gamma

Values higher than 1.50 are will negatively impact ocr.

3. language

Languages that use custom font(ar, ja, ko, **th**, zh-CN, zh-TW) might cause issues, especially when in combination with above factors.

---

Use flags `--threshold-grid <n>`, `--threshold-daemons <n>`, `--threshold-buffer-size <n>` to set fixed threshold for given fragments. This might improve accuracy in edge cases like listed above.

## Options and configuration

Check [list of available flags](https://github.com/marcincichocki/breach-protocol-autosolver/tree/v1.6.1/src/platform-node/cli/options)

---

### Development

```bash
npm install
npm run tsc
node dist/index.js
```

### Build

```bash
npm install
npm run build
```

### Tests

```bash
npm test # single run
npm run watch-test # watch mode
```

---

[MIT](./LICENSE.md)
