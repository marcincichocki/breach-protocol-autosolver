# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.6.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.6.0...v1.6.1) (2021-04-08)


### Bug Fixes

* set correct min value for --delay flag ([ba9c446](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ba9c446a4f5c6ae68af09d79d72a8e4e9409fbb2))

## [1.6.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.5.1...v1.6.0) (2021-04-08)


### Features

* add --delay and --disable-auto-exit flags ([62b9c61](https://github.com/marcincichocki/breach-protocol-autosolver/commit/62b9c61aadefe1530773098eb9e4532f260b6887)), closes [#39](https://github.com/marcincichocki/breach-protocol-autosolver/issues/39) [#41](https://github.com/marcincichocki/breach-protocol-autosolver/issues/41)
* add display scaling support ([5b8f328](https://github.com/marcincichocki/breach-protocol-autosolver/commit/5b8f328a8606f52ca5cbab78bd6262381a94f6c0))

### [1.5.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.5.0...v1.5.1) (2021-04-07)


### Bug Fixes

* prevent child daemon to be marked as parent ([76ac227](https://github.com/marcincichocki/breach-protocol-autosolver/commit/76ac227d4594692a26f32d991491fb262b19234d))

## [1.5.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.4.1...v1.5.0) (2021-04-05)


### Features

* add ability to specify custom threshold ([90d2008](https://github.com/marcincichocki/breach-protocol-autosolver/commit/90d20081d5e92d7d88dc40cfee126d939ba5cdba))
* improve sequence generation logic ([4bb07dc](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4bb07dcff3250cd455b90ae4d4eb2396117eeb19)), closes [#20](https://github.com/marcincichocki/breach-protocol-autosolver/issues/20) [#35](https://github.com/marcincichocki/breach-protocol-autosolver/issues/35)

### [1.4.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.4.0...v1.4.1) (2021-04-03)


### Bug Fixes

* improve ocr accuracy for eastern languages ([ade70f2](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ade70f23786c81f903120979fb6740676d9939e4))
* only save debug info on validation error ([abf8636](https://github.com/marcincichocki/breach-protocol-autosolver/commit/abf8636426e19ac5c7cdab4ab7f7717d39f98940))
* prevent infinite call stack in translations ([ee1f432](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ee1f4327629be4a077f3e29bb8cbccbe883c506a))

## [1.4.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.3.0...v1.4.0) (2021-04-01)


### Features

* add flag validation and help ([6a3d214](https://github.com/marcincichocki/breach-protocol-autosolver/commit/6a3d2142fa2d62f529a8a4c987f7e81af4dfcaf4))
* add logger translations ([45e94ee](https://github.com/marcincichocki/breach-protocol-autosolver/commit/45e94eebe896bd420eb099c04de6263fbb72506e)), closes [#22](https://github.com/marcincichocki/breach-protocol-autosolver/issues/22)
* add OCR data validation ([f1b6a0a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f1b6a0a4bda4143b0604392c8f9fb125a35c284f))
* add sound effect on OCR error ([990f43f](https://github.com/marcincichocki/breach-protocol-autosolver/commit/990f43f0587d3b8824a32eaa53d65b869c651072)), closes [#19](https://github.com/marcincichocki/breach-protocol-autosolver/issues/19)


### Bug Fixes

* block event listener during OCR ([f4c69c4](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f4c69c489f9cb8b6db2fdd34dab818282caf7a0a)), closes [#23](https://github.com/marcincichocki/breach-protocol-autosolver/issues/23)

## [1.3.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.2.2...v1.3.0) (2021-03-26)


### Features

* check for updates on startup ([af7eed6](https://github.com/marcincichocki/breach-protocol-autosolver/commit/af7eed6ad0c10743ab365d8641c2ece524e21c7d))
* save screenshot and ocr data ([d71261e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/d71261ee42c6cc35b29348e672151cee80a8075d))

### [1.2.2](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.2.1...v1.2.2) (2021-03-23)


### Bug Fixes

* resolve infinite call stack error ([923fadd](https://github.com/marcincichocki/breach-protocol-autosolver/commit/923fadde73678b1c683c91a77fb0c4c0a79ac939))

### [1.2.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.2.0...v1.2.1) (2021-03-23)


### Bug Fixes

* allow search restart ([f864876](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f86487617b3ac89847b3368414b3a034e6054a6a)), closes [#8](https://github.com/marcincichocki/breach-protocol-autosolver/issues/8)

## [1.2.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.1.1...v1.2.0) (2021-03-23)


### Features

* add multi monitor support ([f6e9fcc](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f6e9fcce3c485683b7a4b0cd6bd4b3b0a2648244)), closes [#5](https://github.com/marcincichocki/breach-protocol-autosolver/issues/5)


### Bug Fixes

* improve ocr accuracy on 1080p and 2160p ([de74f3c](https://github.com/marcincichocki/breach-protocol-autosolver/commit/de74f3ce51da06bf7b287f4746a426dd2fcbb1de)), closes [#4](https://github.com/marcincichocki/breach-protocol-autosolver/issues/4)

### [1.1.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.1.0...v1.1.1) (2021-03-20)


### Bug Fixes

* allow single code for --key-bind flag ([117de63](https://github.com/marcincichocki/breach-protocol-autosolver/commit/117de63a12d33d3ef1c39784556b5a37e6709a4c))

## [1.1.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.0.0...v1.1.0) (2021-03-19)


### Features

* add --key-bind option ([436ea44](https://github.com/marcincichocki/breach-protocol-autosolver/commit/436ea44868a2989df5ae1981a5d9bf5f0fb39c63))

## [1.0.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v0.1.1...v1.0.0) (2021-03-19)


### Features

* add binary build script ([c60521b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c60521bd15299af367f5c0044eaa2ec1a0fdf760))


### Bug Fixes

* remove --debug-port flag from worker ([c3431c0](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c3431c0744927e2042d53beea639352d79e62eb1))

### [0.1.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v0.1.0...v0.1.1) (2021-03-18)


### Bug Fixes

* disable logger by default ([e94206f](https://github.com/marcincichocki/breach-protocol-autosolver/commit/e94206f9afd1f88db7d741cd35ff63ea02f548d9))
* resolve ts compilation error ([aa113c7](https://github.com/marcincichocki/breach-protocol-autosolver/commit/aa113c771a7127af0348ee3f75913b15e9f5061d))

## 0.1.0 (2021-03-18)
