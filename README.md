# Breach Protocol Autosolver

Solve breach protocol minigame in second(s). _Windows_/_Linux_/_GeForce Now_/_Google Stadia_. Every language.

## Video showcase:

[![Video](https://user-images.githubusercontent.com/10232391/111822212-d0fb0e80-88e3-11eb-82de-59fd4d8fd44b.png)](https://www.youtube.com/watch?v=3ZoSwRvh4s0)

## Features

- client for _Windows 10_ and _Linux_
- support for _GeForce Now_ and _Google Stadia_
- support for every language in _Cyberpunk 2077_
- support for every aspect ratio
- GUI calibration for users with non standard settings
- auto updates
- configurable behaviour
- stats and history viewer

## Download

[NexusMods Page](https://www.nexusmods.com/cyberpunk2077/mods/3071)

[GitHub Releases](https://github.com/marcincichocki/breach-protocol-autosolver/releases/latest)

## Documentation

[FAQ](docs/faq.md)

[Troubleshooting](docs/troubleshooting.md)

---

## Development

```bash
npm install # install dependencies
npm run webpack:watch # build code for renderer/worker/main
npm run electron:run # start electron
```

> Running this project on wsl/wsl2 requires x11 server to function properly.

### Build

```bash
npm run electron:build # build binary for current platform
```

### Tests

```bash
npm test # single run
npm run test:watch # watch mode
```

---

## License

[MIT](./LICENSE.md)
