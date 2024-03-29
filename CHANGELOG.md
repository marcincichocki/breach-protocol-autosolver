# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.12.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.11.0...v2.12.0) (2023-12-17)


### Features

* **core:** use trim strategy by default ([64cc08c](https://github.com/marcincichocki/breach-protocol-autosolver/commit/64cc08ca3903bdf076d415a9816d0a02a67699d1))

## [2.11.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.10.0...v2.11.0) (2023-10-22)


### Features

* **client-electron:** add ability clear stats ([e598e04](https://github.com/marcincichocki/breach-protocol-autosolver/commit/e598e04172c38f06ca6b054f257979e39c95ece1))
* **client-electron:** add ability to restore default settings ([4dc552a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4dc552afe437667140ee3ea78c4b07334f8af0b3))
* **client-electron:** save state to files immediately  ([6ae3bfb](https://github.com/marcincichocki/breach-protocol-autosolver/commit/6ae3bfbd5d40a6098d63db4c962496b08604270b))
* **client-electron:** set minimum width of renderer to 1080px ([eada534](https://github.com/marcincichocki/breach-protocol-autosolver/commit/eada534b69542a80ae922e63e0bbd053817a8eb5))


### Bug Fixes

* **common:** move cursor to the bottom right corner via nircmd ([3bf3efe](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3bf3efebb6ae3b72ef4903bca388ea26005836d8)), closes [#374](https://github.com/marcincichocki/breach-protocol-autosolver/issues/374)

## [2.10.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.9.0...v2.10.0) (2023-10-02)


### Features

* **core:** add ukrainian game language support ([bc3c3ac](https://github.com/marcincichocki/breach-protocol-autosolver/commit/bc3c3ac3ecc749de9dbf2eebe026de9775894e27))

## [2.9.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.5...v2.9.0) (2023-09-27)


### Features

* **core:** add support for patch 2.0 ([d138fd8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/d138fd8c6630de0580a2a4a20e2d097f2f862c65))

### [2.8.5](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.4...v2.8.5) (2022-11-28)


### Bug Fixes

* **common:** add missing F13-F24 vkeys ([a1bf34c](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a1bf34c6ca31aa93a979200e7fa21773d1668f1b))

### [2.8.4](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.3...v2.8.4) (2022-11-28)


### Bug Fixes

* **client-electron:** allow to bind F20-F24 keys ([94d9516](https://github.com/marcincichocki/breach-protocol-autosolver/commit/94d951665ac5ea5b59ceafe2837a9f6b46f30bd2)), closes [#346](https://github.com/marcincichocki/breach-protocol-autosolver/issues/346)

### [2.8.3](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.2...v2.8.3) (2022-11-13)


### Bug Fixes

* **client-electron:** remove duplicate value from language select ([3d851b1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3d851b1e535fb81435f00dbac92ff05b710b4509))

### [2.8.2](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.1...v2.8.2) (2022-10-19)


### Bug Fixes

* **core:** filter child daemons from sequence breaks ([0e47dde](https://github.com/marcincichocki/breach-protocol-autosolver/commit/0e47dde5657f9dab4ac689d5ac358e41b2f28f29))


### Performance improvements

* **core:** defer sequence constructor logic ([85bb4d1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/85bb4d1933136494b5246cd0cf7bb7ab282891fb))

### [2.8.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.8.0...v2.8.1) (2022-10-15)


### Bug Fixes

* **client-electron:** show correct fragment while calibrating ([4e4c9ea](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4e4c9eaa4c50927ca5f4f4ce1f88c7e6ab36346a))

## [2.8.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.7.0...v2.8.0) (2022-10-15)


### Features

* **client-electron:** add ability to emit sequences immediately  ([41f5db6](https://github.com/marcincichocki/breach-protocol-autosolver/commit/41f5db65a5421ab11b2499d9f9c6d26954d5f550))
* **client-electron:** add ability to sort daemons by order in the sequence ([54fc847](https://github.com/marcincichocki/breach-protocol-autosolver/commit/54fc847301f1c8795fd8d0de345bfb8c5417ac92))
* **client-electron:** add dynamic navigation ([a5bbb5d](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a5bbb5dfc6727e36c643e72a78283eb4ff3f22ea))
* **client-electron:** add key binds to solve with focus for sixth and seventh daemon ([94f667b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/94f667b4f1ad2a75304b0776290428df95d702e1))
* **client-electron:** add simple pagination to analyze view ([fd714e8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/fd714e8d93d6fa5775256bebee29455227c38444)), closes [#294](https://github.com/marcincichocki/breach-protocol-autosolver/issues/294)
* **core:** add ability to order sequences by types ([1ab78a3](https://github.com/marcincichocki/breach-protocol-autosolver/commit/1ab78a3e9279e08b680bd6d617030d13d0300b13)), closes [#249](https://github.com/marcincichocki/breach-protocol-autosolver/issues/249)


### Bug Fixes

* **client-electron:** calculate acquired daemons from resolved sequence ([c5266e2](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c5266e2164f11dacf86da5a0ee3169816b4114bf))
* **client-electron:** filter analyze results by daemons from resolved sequence ([70b501e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/70b501e2ca0ab379d8a1172b06f57ba8bf9a98f8))
* **client-electron:** handle missing source file ([6e5c55b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/6e5c55b4731320a80c9fc7ed776bd64ee6fcc0b6)), closes [#277](https://github.com/marcincichocki/breach-protocol-autosolver/issues/277)
* **client-electron:** prevent conditional jsx from executing ([f18cd7b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f18cd7bd8092e516093ff090ae75865f21d8a27e))
* **client-electron:** prevent flicker in json viewer ([f26af63](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f26af63176a9f605a0ba277a198479ec5085e6bc))
* **common:** add extra delay after game is activated for nircmd ([721bf12](https://github.com/marcincichocki/breach-protocol-autosolver/commit/721bf12d6beffad428a5f7ffc60856707c67b14c))
* **core:** add orphan daemons to daemons of resolved sequence ([a56cfd7](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a56cfd73034bbb5d44cac94796d79c9712cd1b0d))


### Performance improvements

* **core:** defer generation of sequences ([dc239ea](https://github.com/marcincichocki/breach-protocol-autosolver/commit/dc239ea78149f09552f58ab7d2fb94124f70f88f))

## [2.7.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.6.0...v2.7.0) (2022-10-08)


### Features

* **client-electron:** replace json string preview with json tree viewer ([4d7aa99](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4d7aa998922c078531fa43c475605d53f33a762c))


### Bug Fixes

* **client-electron:** remove horizontal scrollbar from fragment preview ([8e2ee8e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/8e2ee8e93e681a11bb555d5e823cc1d205ae5860))
* **client-electron:** use buffer size from entry in viewer ([9a817d8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9a817d852fa85af94194c2e236e604e4b25a1cac))
* **core:** apply stricter constraints on grid fragment ([8e7eb28](https://github.com/marcincichocki/breach-protocol-autosolver/commit/8e7eb281a2da060bae956bc01fa521dbd2a42454))
* **core:** recognize up to 7 daemons ([90448c7](https://github.com/marcincichocki/breach-protocol-autosolver/commit/90448c76d4fd8016223698db4c6eeddd74c6ad4d))

## [2.6.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.5.0...v2.6.0) (2022-09-22)


### Features

* **client-electron:** add highlight support to buffer viewer ([ba657c8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ba657c8619a7f273d56ef7c48f9e85427d89d338))
* **client-electron:** darken unused codes in history viewer ([1479b52](https://github.com/marcincichocki/breach-protocol-autosolver/commit/1479b52c50b13f159b76a0e493ed7a482a1971f5))


### Bug Fixes

* **client-electron:** set unique ids for file inputs ([9b53a97](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9b53a97206ca64e4cd22110332fb93af532a4cfe))

## [2.5.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.4.0...v2.5.0) (2022-09-21)


### Features

* **client-electron:** add links to warning about unhandled types fragment ([b5e28a1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/b5e28a1fda6c9265ac801137ee0bd800386dffb5))
* **client-electron:** show release notes when update is available ([542f98b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/542f98bbed897e7f29852a0c2d9f8ef93bddc3ef))
* **core:** add ability to specify fixed buffer size ([2762d73](https://github.com/marcincichocki/breach-protocol-autosolver/commit/2762d73babc959fd7650cfb1fd5734966e3bdbc9))


### Bug Fixes

* **client-electron:** update layout of release notes dialog ([15c9e30](https://github.com/marcincichocki/breach-protocol-autosolver/commit/15c9e30056f7b4e7fb48352119a93e665d4654c7))
* **core:** update control group when using extended buffer size ([581c553](https://github.com/marcincichocki/breach-protocol-autosolver/commit/581c5531e1074f21c70180e4ae98fe4a6ad4a551))

## [2.4.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.3.1...v2.4.0) (2022-09-18)


### Features

* **core:** add ability to use extended range for daemons and buffer size ([e2cd762](https://github.com/marcincichocki/breach-protocol-autosolver/commit/e2cd7623ebee391d205a603b0d005285123b9be7))

### [2.3.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.3.0...v2.3.1) (2022-03-25)


### Bug Fixes

* **client-electron:** use unique id on lists ([ebc232a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ebc232aa57d131492579d291d6b4fca7f42827b1))
* **common:** always stop BP on end of a sequence ([a564c34](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a564c345dd8579b2fb9f71ce7e92f5cc9334e66a)), closes [#250](https://github.com/marcincichocki/breach-protocol-autosolver/issues/250)
* **core:** pick best sequence from duplicates ([1a1b5b7](https://github.com/marcincichocki/breach-protocol-autosolver/commit/1a1b5b7f05bab9bc95a400ba9140d34786e49c73))

## [2.3.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.2.1...v2.3.0) (2021-10-24)


### Features

* **client-electron:** add ability to recognize daemon type ([3683dac](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3683dac3dc0f5d519da01d84af2ea6e849463566)), closes [#242](https://github.com/marcincichocki/breach-protocol-autosolver/issues/242)
* **common:** extract blue channel from daemon fragment ([c8f4256](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c8f42567df67d4efc05cab4d6a63c2bda8aeaa5b)), closes [#241](https://github.com/marcincichocki/breach-protocol-autosolver/issues/241)
* **core:** add ability to break sequence between daemons ([7166855](https://github.com/marcincichocki/breach-protocol-autosolver/commit/716685561f2ff5f36c127f408376bc3e42da15b0))


### Bug Fixes

* **core:** filter sequence parts by index ([3e36f74](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3e36f74d261e5192d4e5f1a354880b9c0b994359))

### [2.2.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.2.0...v2.2.1) (2021-10-19)


### Bug Fixes

* **client-electron:** check if key bind can be registered ([f43f616](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f43f616fd93dff23a50e91e087d591f2ddf74b0a)), closes [#240](https://github.com/marcincichocki/breach-protocol-autosolver/issues/240)
* **client-electron:** prevent memory leak in preload ([182db5a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/182db5a2db95e27759dfdb1278a6c8204675cd71))

## [2.2.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.1.0...v2.2.0) (2021-10-12)


### Features

* **client-electron:** add ability to analyze BP ([bd17efd](https://github.com/marcincichocki/breach-protocol-autosolver/commit/bd17efd8779444108cb1c82f208b05f5ea47033f)), closes [#222](https://github.com/marcincichocki/breach-protocol-autosolver/issues/222) [#223](https://github.com/marcincichocki/breach-protocol-autosolver/issues/223)
* **client-electron:** add ability to analyze BP from clipboard ([2d04803](https://github.com/marcincichocki/breach-protocol-autosolver/commit/2d0480380204bfc9fd63f0d23902dfa694d5569f)), closes [#234](https://github.com/marcincichocki/breach-protocol-autosolver/issues/234)
* **client-electron:** add ability to analyze from file ([f7acc83](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f7acc83fcab0e3b7934e56e6b86d9b9374192261)), closes [#231](https://github.com/marcincichocki/breach-protocol-autosolver/issues/231)
* **client-electron:** add ability to spotlight squares in the grid ([88aba00](https://github.com/marcincichocki/breach-protocol-autosolver/commit/88aba008e4c53060d349a50f29e8a226ef28d48d))
* **client-electron:** focus renderer on recognition error ([2201964](https://github.com/marcincichocki/breach-protocol-autosolver/commit/2201964a52dabeef69dafe01a21e408c29edc5e0))
* **common:** add ability to activate game window ([7d6bdac](https://github.com/marcincichocki/breach-protocol-autosolver/commit/7d6bdac702f9d32821a52f5b04934d143fbf8342)), closes [#224](https://github.com/marcincichocki/breach-protocol-autosolver/issues/224)
* **core:** add ability to filter recognizer results ([0b5179b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/0b5179bfb2117eab234fe9c7581508505ed7775d)), closes [#235](https://github.com/marcincichocki/breach-protocol-autosolver/issues/235)


### Bug Fixes

* **client-electron:** improve time saved approximation ([18a415b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/18a415be75e0732cd5068c510f92810d30aea06a))
* **client-electron:** prevent multiple instances ([ac8f6a0](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ac8f6a0ec1d0a73e60aa3e73d920556af2ec21ec)), closes [#229](https://github.com/marcincichocki/breach-protocol-autosolver/issues/229)
* **client-electron:** show dropzone only on file drag ([57ae17a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/57ae17a84fce51881349fc93bbf5e8ba3b569174))
* **common:** always move cursor on ahk engine ([428f5fe](https://github.com/marcincichocki/breach-protocol-autosolver/commit/428f5fec8b520b30f9a1797363e0e955be0de179))
* **common:** send correct window title on linux ([eee9a9e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/eee9a9e4e9d71b4ab6f00a8f5142793aa8684027))
* **common:** update bitmask implementation ([4f1206d](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4f1206da00b9f2a38b4c70425cedb7e911b24966))


### Performance improvements

* **core:** add reverse hex codes map ([e349fa9](https://github.com/marcincichocki/breach-protocol-autosolver/commit/e349fa9c700d551737cd1875312f2e94e58ea5b6))

## [2.1.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0...v2.1.0) (2021-09-27)


### Features

* **client-electron:** add ability to change game bindings ([aedc3a5](https://github.com/marcincichocki/breach-protocol-autosolver/commit/aedc3a561e7b983d2436d9d33508e89922b2dc84)), closes [#208](https://github.com/marcincichocki/breach-protocol-autosolver/issues/208)
* **client-electron:** add ability to remove key bind ([798f659](https://github.com/marcincichocki/breach-protocol-autosolver/commit/798f659e822adba70bc34905d9debc282a9da7a9))
* **client-electron:** add auto save to key bind component ([7117a86](https://github.com/marcincichocki/breach-protocol-autosolver/commit/7117a868a8303a828ebaa336809ea96e2c8f6a0b))
* **client-electron:** add new key binds ([9da55df](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9da55df9e4ba77e0f942574a302fbee54dce7263)), closes [#210](https://github.com/marcincichocki/breach-protocol-autosolver/issues/210)
* **client-electron:** show fragment status in calibration page ([fee3c5f](https://github.com/marcincichocki/breach-protocol-autosolver/commit/fee3c5f8a7eb0ccc32a7ef2f2d4a7ed165a44f8e))
* **core:** add ability to sort sequences by index of a daemon ([8970596](https://github.com/marcincichocki/breach-protocol-autosolver/commit/8970596117c9368bb3bc6b569e5a2fedb4a68e93))


### Bug Fixes

* **common:** use AutoHotkey path from settings ([c46f2b1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c46f2b1a585f506e1f05a272e329baee455b6c68))


### Performance improvements

* **client-electron:** remove unused robots ([efec24a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/efec24a2c57a34adfcee3ee489d73b689ef08d8b)), closes [#215](https://github.com/marcincichocki/breach-protocol-autosolver/issues/215)

## [2.0.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-rc.1...v2.0.0) (2021-09-16)


### Bug Fixes

* **client-electron:** include every 3rd party license ([9dcfbce](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9dcfbce1a82230a17fa75e22f4a94bc76f2ec2cb)), closes [#205](https://github.com/marcincichocki/breach-protocol-autosolver/issues/205)
* **client-electron:** isolate renderer window ([08919a9](https://github.com/marcincichocki/breach-protocol-autosolver/commit/08919a98e7bf7ea5dfc745c2ecc98bc4dbe2de25)), closes [#139](https://github.com/marcincichocki/breach-protocol-autosolver/issues/139)
* **client-electron:** show release notes only once ([75bcbdb](https://github.com/marcincichocki/breach-protocol-autosolver/commit/75bcbdb3d127be61ccabc3138ac38865be327eca)), closes [#184](https://github.com/marcincichocki/breach-protocol-autosolver/issues/184)

## [2.0.0-rc.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-rc.0...v2.0.0-rc.1) (2021-09-07)


### Features

* **client-electron:** add ability to delay resolve step ([13fb17f](https://github.com/marcincichocki/breach-protocol-autosolver/commit/13fb17fea3bce2eb2ff1e7e12befac75680b6867)), closes [#198](https://github.com/marcincichocki/breach-protocol-autosolver/issues/198)


### Bug Fixes

* **client-electron:** prefetch audio files ([c25d23b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c25d23b252402d9015133c6517bc0a61d93ce805)), closes [#190](https://github.com/marcincichocki/breach-protocol-autosolver/issues/190)
* **client-electron:** set product name as dialog title ([fe45c5a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/fe45c5a2ab97e5cf0de61e8cc4e85ed196415b2f)), closes [#189](https://github.com/marcincichocki/breach-protocol-autosolver/issues/189)
* **core:** allow daemons of length 6 ([c1ee30e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c1ee30e3af3fa3e7d886889c5cae2dd8e746a6ac)), closes [#194](https://github.com/marcincichocki/breach-protocol-autosolver/issues/194)


### Performance improvements

* **client-electron:** remove dead code ([a168a6e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a168a6e5ea30cd96378e729ae7815a138f59f663)), closes [#197](https://github.com/marcincichocki/breach-protocol-autosolver/issues/197)
* **common:** add ability to downscale source image ([53782b6](https://github.com/marcincichocki/breach-protocol-autosolver/commit/53782b61ca8097c4cc8cae58fcf22cc449aba7e3))
* **common:** skip setTimeout of 0ms ([447e37a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/447e37aef17ce0cc576b725be5db16cd3d299f88))
* **core:** format fragments as png ([31cb24b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/31cb24bd29a00bf05a6616c4fbb2bd3b40cc9478))

## [2.0.0-rc.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-beta.3...v2.0.0-rc.0) (2021-08-31)


### Features

* **client-electron:** add dialog component ([f090a41](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f090a4173b4f26c826dc5d78659e268e40200633))
* **client-electron:** show release notes after update ([50ca4c4](https://github.com/marcincichocki/breach-protocol-autosolver/commit/50ca4c438158b5b8b172f8fc3b223455fa5f4eb0)), closes [#180](https://github.com/marcincichocki/breach-protocol-autosolver/issues/180)


### Bug Fixes

* **client-electron:** catch auto update errors ([96dc6f5](https://github.com/marcincichocki/breach-protocol-autosolver/commit/96dc6f5d549f92b874fc8a46c81c7506a5ea9354))

## [2.0.0-beta.3](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2021-08-26)


### Bug Fixes

* **client-electron:** check if path to audio file is defined ([6e6bef4](https://github.com/marcincichocki/breach-protocol-autosolver/commit/6e6bef4538d66fd7940d2ece7705f01757fc91b6))

## [2.0.0-beta.2](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2021-08-26)


### Bug Fixes

* **common:** update ahk and xdotool robots ([bcf3301](https://github.com/marcincichocki/breach-protocol-autosolver/commit/bcf3301d8cdcae8b38fa8c05db1af4411a04a335))

## [2.0.0-beta.1](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2021-08-26)


### Features

* **client-electron:** add ability to play sound on breach start ([909e7ac](https://github.com/marcincichocki/breach-protocol-autosolver/commit/909e7ac17334e9e4579ea5ca776ef0d54ed6f0cf)), closes [#172](https://github.com/marcincichocki/breach-protocol-autosolver/issues/172) [#164](https://github.com/marcincichocki/breach-protocol-autosolver/issues/164)
* **client-electron:** add error handler to worker ([cce0da1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/cce0da18217fbf1a0ddd097d51daa7ff98b91111))


### Bug Fixes

* **client-electron:** catch unhandled promises ([d455198](https://github.com/marcincichocki/breach-protocol-autosolver/commit/d455198393ad423b5e27d4418cc2ec74c64a9912))
* **client-electron:** preserve metadata in action ([497601b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/497601ba1516e3ea4bd8671663747257cea4d332))
* **client-electron:** resolve race condition ([0927d44](https://github.com/marcincichocki/breach-protocol-autosolver/commit/0927d4416b71fba01f9cbdfaf967ed350c5d11c8))
* **core:** catch unhandled errors during ocr ([a32c7a6](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a32c7a6c488fa8f02b4f69dfd88b208c08a79b30)), closes [#166](https://github.com/marcincichocki/breach-protocol-autosolver/issues/166)
* **core:** handle custom resolutions ([d437366](https://github.com/marcincichocki/breach-protocol-autosolver/commit/d4373665915fbfb37a2d6f1c75e0ccd5089231ec))
* **core:** load traindeddata with new strategy ([f5c016e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f5c016ea652dea3aefdf2875cf7a34338c0cfda4)), closes [#162](https://github.com/marcincichocki/breach-protocol-autosolver/issues/162)
* **linux:** send correct keystroke ([b20f91a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/b20f91a2a0904e48165e6859aa945f1aaf71c2a1))

## [2.0.0-beta.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.8.0...v2.0.0-beta.0) (2021-08-22)


### ⚠ BREAKING CHANGES

* update keybind from CommandOrControl+numdel to Alt+`
* nodejs client has been removed in favor of electron client.

All flags has been removed, use electron client settings instead.

### Features

* **client-electron:** add ability to remove history entry ([13ea451](https://github.com/marcincichocki/breach-protocol-autosolver/commit/13ea451f477002abca3250e14365fa7e17dbbf23)), closes [#115](https://github.com/marcincichocki/breach-protocol-autosolver/issues/115)
* **client-electron:** add ability to save snapshots ([611e7cc](https://github.com/marcincichocki/breach-protocol-autosolver/commit/611e7cc13a0266531f10feca7473011d855f2e92))
* **client-electron:** add auto update ([00d0bca](https://github.com/marcincichocki/breach-protocol-autosolver/commit/00d0bca1d0f395bee6200d9d358b44f31aeb938e)), closes [#110](https://github.com/marcincichocki/breach-protocol-autosolver/issues/110) [#128](https://github.com/marcincichocki/breach-protocol-autosolver/issues/128)
* **client-electron:** add AutoHotkey support ([0076154](https://github.com/marcincichocki/breach-protocol-autosolver/commit/0076154bb73605a3ad5a4d81dd65e3233745975f)), closes [#157](https://github.com/marcincichocki/breach-protocol-autosolver/issues/157) [#134](https://github.com/marcincichocki/breach-protocol-autosolver/issues/134) [#132](https://github.com/marcincichocki/breach-protocol-autosolver/issues/132)
* **client-electron:** add calibration page ([2f0edba](https://github.com/marcincichocki/breach-protocol-autosolver/commit/2f0edba0eb01109aa0251c2f1d4f237aeca5e291))
* **client-electron:** add custom title bar ([500edee](https://github.com/marcincichocki/breach-protocol-autosolver/commit/500edeefe22eb609ae0140dae2f569ed15c05cac))
* **client-electron:** add dashboard page ([2578eb8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/2578eb82fd0351b12763c43e63e4dafee189b374))
* **client-electron:** add form controls ([aee4df1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/aee4df15b952a23bd0bd308b5bc0a21e4fe49af6)), closes [#69](https://github.com/marcincichocki/breach-protocol-autosolver/issues/69)
* **client-electron:** add help menu ([a89355a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a89355a5edb2d5e134a6c18c6d572fc32ad5892c))
* **client-electron:** add history page ([d8cbe40](https://github.com/marcincichocki/breach-protocol-autosolver/commit/d8cbe401803b10059c445295e2d4e3c67fe3bdac)), closes [#74](https://github.com/marcincichocki/breach-protocol-autosolver/issues/74)
* **client-electron:** add keybind component ([29b86b1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/29b86b1109661c843d08b6714d46ce354d32dcfa))
* **client-electron:** add keyboard resolver ([ab7d66f](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ab7d66f962f5bd74b72e72ee63bd4566841cac78)), closes [#130](https://github.com/marcincichocki/breach-protocol-autosolver/issues/130)
* **client-electron:** add linux build ([56cbfc1](https://github.com/marcincichocki/breach-protocol-autosolver/commit/56cbfc1400c6dd378f3b5ee2a73729ed3fb0d4a2)), closes [#138](https://github.com/marcincichocki/breach-protocol-autosolver/issues/138)
* **client-electron:** add oss attributions ([61d153c](https://github.com/marcincichocki/breach-protocol-autosolver/commit/61d153c602e8a2b3fb88ac0a2e661e9fab995ad0)), closes [#133](https://github.com/marcincichocki/breach-protocol-autosolver/issues/133) [#143](https://github.com/marcincichocki/breach-protocol-autosolver/issues/143)
* **client-electron:** add settings page ([f0fc78b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f0fc78b0b515a5161494d7f0d9e26a63823be5a1)), closes [#68](https://github.com/marcincichocki/breach-protocol-autosolver/issues/68)
* **client-electron:** add status bar ([afb1173](https://github.com/marcincichocki/breach-protocol-autosolver/commit/afb1173966dfeac98f44f1a686297d94ea42a1a2))
* **client-electron:** add status to fragment result ([3f6a9bb](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3f6a9bb2c4f882f962da113654719b8022cde876))
* **client-electron:** add svg arrows ([990bacf](https://github.com/marcincichocki/breach-protocol-autosolver/commit/990bacf5a8c81eba87d8d6aa42ea2f731b17ff23))
* **client-electron:** add tray icon ([68d265e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/68d265e5f9f6ca0c3d86414dafcd23d681632287)), closes [#80](https://github.com/marcincichocki/breach-protocol-autosolver/issues/80)
* **client-electron:** cache fragments during calibration ([3a6882a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3a6882a6930934b93be050c5bf2103c6fb89bc7c)), closes [#81](https://github.com/marcincichocki/breach-protocol-autosolver/issues/81)
* **client-electron:** confirm history size change ([7332f6c](https://github.com/marcincichocki/breach-protocol-autosolver/commit/7332f6c1566ec18e6489f65fd8e943061cf6dd68)), closes [#121](https://github.com/marcincichocki/breach-protocol-autosolver/issues/121)
* **client-electron:** save history entires to store ([9a860c2](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9a860c28faf17ed5c36b467ee351d0f331aca7ab)), closes [#71](https://github.com/marcincichocki/breach-protocol-autosolver/issues/71)
* **client-electron:** validate electron accelerator ([14d7efe](https://github.com/marcincichocki/breach-protocol-autosolver/commit/14d7efe46a14977c340ad0b8031a384e93a1a86d)), closes [#150](https://github.com/marcincichocki/breach-protocol-autosolver/issues/150)
* **core:** update correction map ([b7645ec](https://github.com/marcincichocki/breach-protocol-autosolver/commit/b7645ec860e8aab3b5175b81f9b12e30af2091c1)), closes [#54](https://github.com/marcincichocki/breach-protocol-autosolver/issues/54)


### Bug Fixes

* **client-electron:** change renderer title ([289a02b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/289a02b3503ea0fb38f2afb2ffd23b76e96f5fee))
* **client-electron:** correct default settings ([16cb195](https://github.com/marcincichocki/breach-protocol-autosolver/commit/16cb195f24efbdb50c5fc1aefc0e2ea01b9b94be))
* **client-electron:** disable button while loading ([76629cd](https://github.com/marcincichocki/breach-protocol-autosolver/commit/76629cded45c915b65a4ac39b767af943c6a97d2))
* **client-electron:** disable worker on focus ([6ab7021](https://github.com/marcincichocki/breach-protocol-autosolver/commit/6ab70218ac9ac122e4e31eb4062d5f832a7df2cf)), closes [#144](https://github.com/marcincichocki/breach-protocol-autosolver/issues/144) [#149](https://github.com/marcincichocki/breach-protocol-autosolver/issues/149)
* **client-electron:** handle stderr ([568c7f3](https://github.com/marcincichocki/breach-protocol-autosolver/commit/568c7f36ed9d554a420b99cdf8cb5682aff5195e))
* **client-electron:** move visually hidden input away ([ce1c795](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ce1c7955fbd88f8f1157042ace99c98c8415950a)), closes [#137](https://github.com/marcincichocki/breach-protocol-autosolver/issues/137)
* **client-electron:** remove secondary scroll ([467ff9d](https://github.com/marcincichocki/breach-protocol-autosolver/commit/467ff9d8e9069d5140e59dc8846fff967e241ba2)), closes [#122](https://github.com/marcincichocki/breach-protocol-autosolver/issues/122)
* **client-electron:** remove source with history entry ([95cb19a](https://github.com/marcincichocki/breach-protocol-autosolver/commit/95cb19a5cd195f856f7088b4d4b10655fa26e546))
* **client-electron:** resolve hook issue in history page ([9adec4e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9adec4e99f9ecffd9ed464c5ecfddaf2fa82cb5d))
* **client-electron:** resolve ui issues in history page ([85d1048](https://github.com/marcincichocki/breach-protocol-autosolver/commit/85d10481a2cc3bc4109cc0876b8ee65b25de0f6c)), closes [#82](https://github.com/marcincichocki/breach-protocol-autosolver/issues/82)
* **client-electron:** restore key bind on blur ([c619552](https://github.com/marcincichocki/breach-protocol-autosolver/commit/c61955255677a14fbe9115188602e270c66db3a1)), closes [#98](https://github.com/marcincichocki/breach-protocol-autosolver/issues/98)
* **client-electron:** show spinner in settings page ([b544cde](https://github.com/marcincichocki/breach-protocol-autosolver/commit/b544cde7bed8c23dc1b6c24c404314c74ccb7ba6))
* **client-electron:** show spinner on bootstrap ([61f428b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/61f428ba93e86399810dfeaddda841e25a0e8ca4))
* **client-electron:** show window on ready event ([9efed75](https://github.com/marcincichocki/breach-protocol-autosolver/commit/9efed75fb73286ba3771964f98e5231fc7da3c49))
* **client-electron:** skip first arrow on highlight ([f05e64b](https://github.com/marcincichocki/breach-protocol-autosolver/commit/f05e64bc87a058f00b4a4d905b8063f59886862e)), closes [#91](https://github.com/marcincichocki/breach-protocol-autosolver/issues/91)
* **client-electron:** use correct mime type ([4ba22c8](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4ba22c86e74cf386a294349bbd3718d77199b4e3))


* refactor!(client-electron): update default settings ([759d951](https://github.com/marcincichocki/breach-protocol-autosolver/commit/759d9515d94412e95c78498cee3451f608a7d830))
* remove node client  ([4403944](https://github.com/marcincichocki/breach-protocol-autosolver/commit/440394423949b63b5fed9bf5a8d0799d8276356b)), closes [#117](https://github.com/marcincichocki/breach-protocol-autosolver/issues/117) [#112](https://github.com/marcincichocki/breach-protocol-autosolver/issues/112) [#76](https://github.com/marcincichocki/breach-protocol-autosolver/issues/76) [#43](https://github.com/marcincichocki/breach-protocol-autosolver/issues/43) [#24](https://github.com/marcincichocki/breach-protocol-autosolver/issues/24)

## [1.8.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.7.0...v1.8.0) (2021-04-27)


### Features

* add basic electron client ([a50dcce](https://github.com/marcincichocki/breach-protocol-autosolver/commit/a50dcce52da77f88fc81f18608afce1924ea35b2)), closes [#55](https://github.com/marcincichocki/breach-protocol-autosolver/issues/55)
* add format flag ([14f52e2](https://github.com/marcincichocki/breach-protocol-autosolver/commit/14f52e2168025f76cb38635ec8454185faeda768))
* add trim buffer size recognition strategy ([3871deb](https://github.com/marcincichocki/breach-protocol-autosolver/commit/3871deb87ad777ecf310b20ea600e068f1715078))
* move cursor to the middle of squares ([e2f06b3](https://github.com/marcincichocki/breach-protocol-autosolver/commit/e2f06b32d480b0d4adfb6338fe12bac09632ac8b))


### Bug Fixes

* force exit if overlap fit in a buffer ([ee9b04e](https://github.com/marcincichocki/breach-protocol-autosolver/commit/ee9b04ea4d40e8480f3a478d6244982e5c858e2d)), closes [#61](https://github.com/marcincichocki/breach-protocol-autosolver/issues/61)
* use cropped width in buffer size fragment ([1688437](https://github.com/marcincichocki/breach-protocol-autosolver/commit/16884374789674262859803de28f6da1819e019a))

## [1.7.0](https://github.com/marcincichocki/breach-protocol-autosolver/compare/v1.6.1...v1.7.0) (2021-04-16)


### Features

* add automatic buffer size threshold detection ([4912ce9](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4912ce933e2e1666d647472ce2a3eb0053e2be3e))
* add support for any allowed resolution ([4f7832d](https://github.com/marcincichocki/breach-protocol-autosolver/commit/4f7832d9373c24a8377c5ecaf0703442f7750ff8))


### Bug Fixes

* update allowed buffer size values ([056a3c7](https://github.com/marcincichocki/breach-protocol-autosolver/commit/056a3c7d38b548314f932344b386f5b575756ad5))

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
