# Breach Protocol AutoSolver for Cyberpunk 2077

This program automatically solves any\* breach protocol(enemies, terminals or shards).

\*_Might not work with tutorial of breach protocol_

## Video showcase:
[![Video](https://user-images.githubusercontent.com/10232391/111822212-d0fb0e80-88e3-11eb-82de-59fd4d8fd44b.png)](https://user-images.githubusercontent.com/10232391/111820491-dd7e6780-88e1-11eb-9fad-93cf1a07c82a.mp4)


## Installation and usage

[Download latest release](https://github.com/marcincichocki/breach-protocol-autosolver/releases/latest)

unzip it, and launch `breach-protocol-autosolver-#{version}.exe`

Then enter breach protocol minigame and use `Ctrl+,`(`,` is Del on numpad) keybind to launch autosolver.

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
