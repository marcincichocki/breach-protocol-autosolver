# Breach Protocol AutoSolver for Cyberpunk 2077

Automatically solve any breach protocol.

## Video showcase:

[![Video](https://user-images.githubusercontent.com/10232391/111822212-d0fb0e80-88e3-11eb-82de-59fd4d8fd44b.png)](https://www.youtube.com/watch?v=3ZoSwRvh4s0)

## Installation and usage

[Download latest release](https://github.com/marcincichocki/breach-protocol-autosolver/releases/latest)

Use <kbd>Ctrl</kbd>+<kbd>NumPad_Decimal</kbd> key bind to start autosolver.

## Recognition accuracy

There are 3 main factors that impact recognition accuracy:

1. resolution

It must match monitor resolution. On very low resolution(below 720p) ocr might be inaccurate.

Please note that FidelityFX resolution scaling does not seem to impact resolution of breach protocol, therefore it's better to use it instead of lowering resolution to increase framerate.

2. gamma

Values higher than 1.50 will negatively impact ocr.

`--experimental-buffer-size-recognition` flag can be used to improve buffer size recognition at very high gamma levels.

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
npm run webpack:watch
npm run electron:run
```

### Build

```bash
npm install
npm run electron:build
```

### Tests

```bash
npm test # single run
npm run test:watch # watch mode
```

---

[MIT](./LICENSE.md)
