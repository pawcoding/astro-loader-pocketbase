## [2.8.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.8.0...v2.8.1) (2025-09-20)

# [2.8.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.7.1...v2.8.0) (2025-08-30)


### Bug Fixes

* **loader:** do not add lastModified cache hint if invalid date ([9ae7733](https://github.com/pawcoding/astro-loader-pocketbase/commit/9ae77330c0a5fe98fe55f63704046eb2c7086294))


### Features

* add `fields` option to only load partial entries ([39aded2](https://github.com/pawcoding/astro-loader-pocketbase/commit/39aded2d3e3eadaf349e1a7b0b870b900dcf59bd))
* **live-loader:** add `page`, `perPage`, and `sort` collection filters ([036e4fe](https://github.com/pawcoding/astro-loader-pocketbase/commit/036e4fe407d60de307362a0a07a1b0191560384c))
* **live-loader:** add additional filter for `getLiveCollection` function ([8ea02ed](https://github.com/pawcoding/astro-loader-pocketbase/commit/8ea02edfa7cd8d565f451d8b50286a4e7bb5ca3c))
* **loader:** add experimental setting to only generate types ([2715a23](https://github.com/pawcoding/astro-loader-pocketbase/commit/2715a2350331fd54fc0d973b0bb74cc7e4e324af))
* **content:** add html id attribute to sections when using multiple content fields ([a931c3e](https://github.com/pawcoding/astro-loader-pocketbase/commit/a931c3e4b53d191adcc6c507b845aeee384bf531))
* **loader:** add live collection loader ([ea5a107](https://github.com/pawcoding/astro-loader-pocketbase/commit/ea5a107e9da57a605e6475e4974d59dc8b7c08d9))
* **loader:** add live entry loader ([5d3bf74](https://github.com/pawcoding/astro-loader-pocketbase/commit/5d3bf7432b12edc00f8ecca83c534571e82e8fb9))

## [2.7.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.7.0...v2.7.1) (2025-08-10)


### Bug Fixes

* **cleanup:** delete entries with custom ids ([b072088](https://github.com/pawcoding/astro-loader-pocketbase/commit/b072088d6be11a8c78ac667f5b2ae549eaf5e6b6))

# [2.7.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.6.2...v2.7.0) (2025-07-05)


### Features

* **auth:** authenticate loader with impersonate token ([7169179](https://github.com/pawcoding/astro-loader-pocketbase/commit/7169179548e4a86bf96fb8491097e37cfe164592))

## [2.6.2](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.6.1...v2.6.2) (2025-06-28)

## [2.6.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.6.0...v2.6.1) (2025-06-18)

# [2.6.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.5.0...v2.6.0) (2025-04-18)


### Bug Fixes

* **cleanup:** apply filter when looking for outdated entries ([205aaa3](https://github.com/pawcoding/astro-loader-pocketbase/commit/205aaa3af8a568600df8c1c03a31df00bbc3dc7a))
* **cleanup:** clear whole store on error ([161741e](https://github.com/pawcoding/astro-loader-pocketbase/commit/161741e952b2a754932364c392b155f4040619a8))


### Features

* **schema:** parse `geoPoint` fields ([6067a4f](https://github.com/pawcoding/astro-loader-pocketbase/commit/6067a4ff4ff331177e2688477355a4649526cc17))

# [2.5.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.4.1...v2.5.0) (2025-04-09)


### Bug Fixes

* **refresh:** do not re-use realtime data when custom filter is set ([16b0ec9](https://github.com/pawcoding/astro-loader-pocketbase/commit/16b0ec9033150ce9c10aa1d0baf68a54afa92e93))


### Features

* **loader:** add support for custom pocketbase filter ([#35](https://github.com/pawcoding/astro-loader-pocketbase/issues/35)) ([367af9a](https://github.com/pawcoding/astro-loader-pocketbase/commit/367af9a15ce18cf3b6c815e3fd88cdd324924a14))

## [2.4.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.4.0...v2.4.1) (2025-02-16)

# [2.4.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.3.1...v2.4.0) (2025-02-15)


### Bug Fixes

* **loader:** print total numer of entries to simplify debugging ([1c8cdfd](https://github.com/pawcoding/astro-loader-pocketbase/commit/1c8cdfdecf27ef5ce73e77fe17d3e43cdbc846a0))


### Features

* **loader:** support force refresh to update all entries ([e22cc46](https://github.com/pawcoding/astro-loader-pocketbase/commit/e22cc4692d6bde95ffecb341d260899410a3bbe4))

## [2.3.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.3.0...v2.3.1) (2025-02-02)

# [2.3.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.2.1...v2.3.0) (2025-02-01)


### Features

* **refresh:** re-use realtime event data to refresh collection ([efae282](https://github.com/pawcoding/astro-loader-pocketbase/commit/efae2826ad93da4d4fa918a6614dcffe1135934a)), closes [#26](https://github.com/pawcoding/astro-loader-pocketbase/issues/26)

## [2.2.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.2.0...v2.2.1) (2025-01-25)


### Bug Fixes

* **refresh:** handle array in refresh context data ([5a51b97](https://github.com/pawcoding/astro-loader-pocketbase/commit/5a51b97a9fbf1d46b62ec5a41a9a8418a3d04a13)), closes [pawcoding/astro-integration-pocketbase#10](https://github.com/pawcoding/astro-integration-pocketbase/issues/10)

# [2.2.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.1.0...v2.2.0) (2025-01-21)


### Bug Fixes

* **schema:** remove default values from improved types ([82b6b70](https://github.com/pawcoding/astro-loader-pocketbase/commit/82b6b70273169bf74f37bcbdd3377c63486f971e))


### Features

* **schema:** add option to improve types ([d8c9780](https://github.com/pawcoding/astro-loader-pocketbase/commit/d8c9780b202cc2a55e651fb90f26a379be5bb7b5))

# [2.1.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.0.2...v2.1.0) (2025-01-11)


### Features

* **refresh:** check refresh context for mentioned collection ([3bff3e5](https://github.com/pawcoding/astro-loader-pocketbase/commit/3bff3e509b00e0ade1f4389bf33ceae2adf45f43)), closes [#23](https://github.com/pawcoding/astro-loader-pocketbase/issues/23)

## [2.0.2](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.0.1...v2.0.2) (2025-01-11)

## [2.0.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v2.0.0...v2.0.1) (2024-12-31)

# [2.0.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v1.0.2...v2.0.0) (2024-12-24)


### Features

* add support for PocketBase 0.23.0 ([a98f1b4](https://github.com/pawcoding/astro-loader-pocketbase/commit/a98f1b41d07bd66aca244f1ed2f473027d011be2))


### BREAKING CHANGES

* This also removes support for PocketBase 0.22.
There are a lot of breaking changes in this new version of PocketBase,
e.g. new endpoint for login, new collection schema format, etc.

Since this version already brings a lot of changes, I used this chance
to refactor some of the internals and configuration options. Please
refer to the new README for more details.

## [1.0.2](https://github.com/pawcoding/astro-loader-pocketbase/compare/v1.0.1...v1.0.2) (2024-12-16)

## [1.0.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/v1.0.0...v1.0.1) (2024-12-14)


### Bug Fixes

* **load:** only print update message when package was previously installed ([2977878](https://github.com/pawcoding/astro-loader-pocketbase/commit/29778788d0d4081406370c627d526e1c06f7c2f2))
* **load:** use correct date format for updated entries request ([c9df0d2](https://github.com/pawcoding/astro-loader-pocketbase/commit/c9df0d2f4638fac1aabfbc2b90ff0dd6336668fa)), closes [#18](https://github.com/pawcoding/astro-loader-pocketbase/issues/18)

# [1.0.0](https://github.com/pawcoding/astro-loader-pocketbase/compare/v0.5.0...v1.0.0) (2024-12-07)


### Bug Fixes

* **release:** update version number ([901af52](https://github.com/pawcoding/astro-loader-pocketbase/commit/901af52bfd91dc970e8bcee6fffcf8aaae97c75f))


### Documentation

* **README:** add note for compatibility ([2613918](https://github.com/pawcoding/astro-loader-pocketbase/commit/261391897ad6984eebbaf7bbb8195ada2382eb67))


### BREAKING CHANGES

* **release:** This is the first stable release of this package.
* **README:** This marks the first stable release of this package.
