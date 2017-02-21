## [Version 1.1.4](https://github.com/glayzzle/grafine/releases/tag/v1.1.4) (2017-2-21)

### Minor Changes

- add a typescript definition: [`f172409`](https://github.com/glayzzle/grafine/commit/f172409)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.1.3...v1.1.4)

## [Version 1.1.3](https://github.com/glayzzle/grafine/releases/tag/v1.1.3) (2017-2-19)

### Minor Changes

- use iterator instead  keyword: [`ba909f3`](https://github.com/glayzzle/grafine/commit/ba909f3)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.1.2...v1.1.3)

## [Version 1.1.2](https://github.com/glayzzle/grafine/releases/tag/v1.1.2) (2017-2-19)

### Patches

- fix index scan: [`f194f8c`](https://github.com/glayzzle/grafine/commit/f194f8c)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.1.1...v1.1.2)

## [Version 1.1.1](https://github.com/glayzzle/grafine/releases/tag/v1.1.1) (2017-2-19)

### Patches

- https://github.com/glayzzle/grafine/issues/4 fix collisions with Map objects: [`8a1bdff`](https://github.com/glayzzle/grafine/commit/8a1bdff)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.1.0...v1.1.1)

## [Version 1.1.0](https://github.com/glayzzle/grafine/releases/tag/v1.1.0) (2017-2-19)

### Major Changes

- generate documentation: [`12f29ae`](https://github.com/glayzzle/grafine/commit/12f29ae)
- add JS sources: [`dabb3ba`](https://github.com/glayzzle/grafine/commit/dabb3ba)
- rewrite the api in order to make it more consistent: [`5888530`](https://github.com/glayzzle/grafine/commit/5888530)

### Minor Changes

- add js & doc generators: [`5507257`](https://github.com/glayzzle/grafine/commit/5507257)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.0.2...v1.1.0)

## [Version 1.0.2](https://github.com/glayzzle/grafine/releases/tag/v1.0.2) (2017-2-18)

### Minor Changes

- add an index iterator: [`2f10553`](https://github.com/glayzzle/grafine/commit/2f10553)
- avoid points dispersion between shards: [`adb3206`](https://github.com/glayzzle/grafine/commit/adb3206)
- add a removeIndex helper: [`a1fa1a1`](https://github.com/glayzzle/grafine/commit/a1fa1a1)

### Patches

- remove index building/done elsewhere: [`5bc3e7c`](https://github.com/glayzzle/grafine/commit/5bc3e7c)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.0.1...v1.0.2)

## [Version 1.0.1](https://github.com/glayzzle/grafine/releases/tag/v1.0.1) (2017-2-13)

### Minor Changes

- add ignore files: [`5c265b1`](https://github.com/glayzzle/grafine/commit/5c265b1)

[...full changes](https://github.com/glayzzle/grafine/compare/v1.0.0...v1.0.1)

## [Version 1.0.0](https://github.com/glayzzle/grafine/releases/tag/v1.0.0) (2017-2-13)

### Major Changes

- general rewrite in order to expose classes (for extensions): [`a30efed`](https://github.com/glayzzle/grafine/commit/a30efed)

[...full changes](https://github.com/glayzzle/grafine/compare/v0.2.0...v1.0.0)

## [Version 0.2.0](https://github.com/glayzzle/grafine/releases/tag/v0.2.0) (2017-2-13)

### Major Changes

- https://github.com/glayzzle/grafine/issues/3 start the index shard implementation (wip): [`86e1c47`](https://github.com/glayzzle/grafine/commit/86e1c47)
- https://github.com/glayzzle/grafine/issues/3 start the points shard implementation (wip): [`ca675d6`](https://github.com/glayzzle/grafine/commit/ca675d6)
- rewrite every function with new framework: [`8b25e2b`](https://github.com/glayzzle/grafine/commit/8b25e2b)

### Minor Changes

- https://github.com/glayzzle/grafine/issues/3 handle import/export of a point: [`cd465ea`](https://github.com/glayzzle/grafine/commit/cd465ea)
- https://github.com/glayzzle/php-reflection/issues/13 start to migrate the bench file: [`f4adebf`](https://github.com/glayzzle/grafine/commit/f4adebf)
- https://github.com/glayzzle/php-reflection/issues/13 implement push function on shard & flag changes: [`9561606`](https://github.com/glayzzle/grafine/commit/9561606)
- implement a size helper on graph + using shards factory now to create a point instance: [`e8f482e`](https://github.com/glayzzle/grafine/commit/e8f482e)
- implement remove & fixes: [`f7cb68a`](https://github.com/glayzzle/grafine/commit/f7cb68a)

### Patches

- https://github.com/glayzzle/grafine/issues/3 fix index creation: [`873f4a4`](https://github.com/glayzzle/grafine/commit/873f4a4)
- https://github.com/glayzzle/grafine/issues/3 fix index methods: [`6b65ed3`](https://github.com/glayzzle/grafine/commit/6b65ed3)
- https://github.com/glayzzle/php-reflection/issues/13 fix uuid function + improve hashing on index function: [`638b23f`](https://github.com/glayzzle/grafine/commit/638b23f)
- fix benchmark with new framework: [`fb2238e`](https://github.com/glayzzle/grafine/commit/fb2238e)
- use new framework for tests: [`8e84bbf`](https://github.com/glayzzle/grafine/commit/8e84bbf)

[...full changes](https://github.com/glayzzle/grafine/compare/v0.1.0...v0.2.0)

## [Version 0.1.0](https://github.com/glayzzle/grafine/releases/tag/v0.1.0) (2017-2-10)

### Major Changes

- improve items deletion speed: [`7a637ff`](https://github.com/glayzzle/grafine/commit/7a637ff)
- improve deletion speed and implement a re-index function on graphs: [`d8cc099`](https://github.com/glayzzle/grafine/commit/d8cc099)
- implement objects export (to serialize them as json): [`a47ca4c`](https://github.com/glayzzle/grafine/commit/a47ca4c)
- implement export/import: [`7c2f85a`](https://github.com/glayzzle/grafine/commit/7c2f85a)

### Minor Changes

- add npm package: [`c35d5eb`](https://github.com/glayzzle/grafine/commit/c35d5eb)
- add test & bench: [`40bca47`](https://github.com/glayzzle/grafine/commit/40bca47)
- add travis & coveralls: [`05574df`](https://github.com/glayzzle/grafine/commit/05574df)

### Patches

- fix memory on indexes: [`905b569`](https://github.com/glayzzle/grafine/commit/905b569)
- fix size detection: [`ea82bf8`](https://github.com/glayzzle/grafine/commit/ea82bf8)
