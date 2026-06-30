# AGENTS.md

Compact ramp-up guide for AI agents. Each item exists because an agent would likely miss it.

## Project

An Astro content loader package that integrates PocketBase as a data source, using Astro's Content Loader API. Key capabilities: loading PocketBase collections, real-time updates (via `astro-integration-pocketbase`), incremental builds, schema generation/validation, and file handling.

Relevant upstream documentation:

- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [PocketBase Documentation](https://pocketbase.io/docs/)

## Environment

- Node >= 22.12.0 required; `.nvmrc` specifies node version. Use `nvm use` before anything.
- Package manager: `npm` (version enforced via `packageManager` field). Do not use pnpm or yarn.

## Essential commands

```bash
npm run format       # oxfmt — format all files
npm run lint:fix     # oxlint --fix — lint + auto-fix
npm run typecheck    # @typescript/native-preview on src/ and test/
npm test             # vitest run (unit + e2e, needs PocketBase for e2e)
npm run test:unit    # unit tests only — no PocketBase needed
npm run test:e2e     # e2e tests only — PocketBase must be running first
npm run build        # tsdown → dist/
```

Run a single test file:

```bash
npx vitest run test/path/to/file.spec.ts
```

## Pre-commit order (husky enforces this)

All three must pass before committing, in this order:

1. `npm run format`
2. `npm run lint:fix`
3. `npm run typecheck`

`lint-staged` runs oxfmt + oxlint on staged files automatically. The pre-commit hook also runs `npm run typecheck` if any `.ts` files are staged.

## E2E test setup

E2E tests require a PocketBase instance at `http://localhost:8090`.

```bash
# One-time: download PocketBase binary to .pocketbase/ (gitignored)
npm run test:e2e:setup

# Start PocketBase (blocks terminal — use a separate terminal)
./.pocketbase/pocketbase serve

# Then run e2e tests
npm run test:e2e
```

Hardcoded test credentials: `test@pawcode.de` / `test1234` (created by the setup script).

`npm run test:unit` is safe without PocketBase. The vitest global setup (`test/global-setup.ts`) skips the connection check when no e2e-spec files are in scope.

## Typecheck quirk

`npm run typecheck` uses `@typescript/native-preview` (TypeScript v7 internally), not `tsc`. CI additionally runs `npx tsc --noEmit` separately because results can differ. If you get typecheck failures from one but not the other, both matter.

## Code conventions (enforced by oxlint — violations are errors)

- Use `interface`, not `type`, for object shapes.
- Use `Array<T>`, not `T[]`.
- Use `undefined`, never `null` (`unicorn/no-null: error`).
- Use `import type` for type-only imports (`typescript/consistent-type-imports`).
- Filenames must be kebab-case (`unicorn/filename-case`).
- No circular imports (`import/no-cycle`).
- No CommonJS (`import/no-commonjs`).
- Max 500 lines per file, 100 lines per function.
- JS/CJS files are not linted (oxlint ignores `*.{js,cjs}`).

## Testing conventions

- Unit tests: `*.spec.ts` — mock everything, no real PocketBase.
- E2E tests: `*.e2e-spec.ts` — use a real PocketBase instance, not mocks.
- For any PocketBase interaction, write an e2e test instead of mocking the HTTP layer.
- Reuse helpers from `test/_mocks/`: `createLoaderOptions`, `createLoaderContext`, `StoreMock`, `LoggerMock`, etc.
- `restoreMocks: true` globally — all `vi.fn()` mocks auto-restore after each test.
- Access the superuser token in e2e tests via vitest's `ProvidedContext` (injected by global setup).

## Commit messages

Enforced by commitlint (`@commitlint/config-conventional`):

```
<type>(scope): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`
Scopes: `loader`, `schema` (or custom)

## Branch and release

- Default PR target: `next` branch (pre-release), not `master`.
- Releases are driven by semantic-release from `master`/`next`. Commit types determine version bumps automatically.

## Build output

- Bundler: `tsdown` → `dist/` (ESM only, `.mjs`).
- Only `dist/` is published to npm.
- Build runs automatically on `npm publish` via `prepublishOnly`.

## CI notes

- `HUSKY=0` is set in all CI jobs — do not remove it.
- CI runs `npm run lint`, `npm run format:check`, `npx tsc --noEmit`, `npm run build`, and `npm test` in sequence.
- PocketBase is downloaded and started as a background process in CI before tests run.
