## Runtime performance

To make _BPA_ as fast as possible use these settings in performance section:

- `Source format`: jpg
- `Downscale source image`: On
- `Delay`: 0ms
- `Resolve delay`: 0ms

> `Engine` and `Input device` options can also affect performance, but since they are platform dependant, they are not included here.

> **NOTE**: with these settings on, average solution time is in a ballpark of 600ms, which makes it susceptible to [Speedy Gonzales bug](bugs.md#speedy-gonzales-bug).
