# Breach Protocol AutoSolver for Cyberpunk 2077

This program automatically solves any\* breach protocol(enemies, terminals or shards).

\*_Might not work with tutorial of breach protocol_

## Video showcase:

[![Video](https://user-images.githubusercontent.com/10232391/111822212-d0fb0e80-88e3-11eb-82de-59fd4d8fd44b.png)](https://user-images.githubusercontent.com/10232391/111820491-dd7e6780-88e1-11eb-9fad-93cf1a07c82a.mp4)

## Installation and usage

NOTE: check out supported [resolutions and gamma setting](#supported-resolutions) before downloading.

[Download latest release](https://github.com/marcincichocki/breach-protocol-autosolver/releases/latest)

unzip it, and launch `breach-protocol-autosolver-#{version}.exe`

Then enter breach protocol mini game and use `Ctrl+,` (`,` [is dot on num pad](https://highfieldtales.files.wordpress.com/2014/10/numpad.jpg)) key bind to launch autosolver.

## Custom key bind

[Use this table as a reference for key codes](https://github.com/torvalds/linux/blob/8b12a62a4e3ed4ae99c715034f557eb391d6b196/include/uapi/linux/input-event-codes.h#L65)

And pass `--key-bind` option to main binary.

```bash
./breach-protocol-autosolver-1.0.0.exe --key-bind 29,53 # Ctrl+/
./breach-protocol-autosolver-1.0.0.exe --key-bind 42,69 # LShift+Numlock
```

It is advised to create shortcut with preferred combination.

## Supported resolutions

OCR was tested on following resolutions:

- 1080p(1920x1080)
- 1440p(2560x1440)
- 2160p(3840x2160)

Resolutions lower than native monitor resolution are likely to case OCR errors.

Please note that FidelityFX resolution scaling does not seem to impact resolution of breach protocol, therefore it's better to use it instead of lowering resolution to increase framerate. On lower resolutions and/or aspect ratios OCR might be inacurate.

## Gamma

Cyberpunk 2077 gamma setting can completly block OCR. Supported values range from `0.95` to `1.75`.

### Development

NOTE: due to usage of many platform dependent packages, this repo **might** not compile on wsl(may require `VcXsrv` and other things). It's therefore advised to build it only on Windows.

```bash
# clone or download repo, then:
npm install
npx tsc
node dist/index.js
```

### Build

To compile program use these commands:

```bash
npm install
npm run build
```

Compiled program location: `./dist/breach-protocol-autosolver-#{version}.zip`

### Tests

```bash
npm run test # single run
npm run watch-test # watch mode
```

---

[MIT](./LICENSE.md)
