# Breach Protocol AutoSolver for Cyberpunk 2077

This program automatically solves any\* breach protocol(enemies, terminals or shards).

\*_Might not work with tutorial of breach protocol_

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
