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
