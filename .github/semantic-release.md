# Semantic Release Configuration

This repository uses a custom semantic release configuration to provide enhanced changelog generation and GitHub interaction.

## Features

### 📖 Enhanced Changelog

The changelog automatically categorizes commits with emojis and includes contributor information:

- ✨ **Features** - New functionality (`feat` commits)
- 🩹 **Fixes** - Bug fixes (`fix` commits)
- 📚 **Documentation** - Documentation updates (`docs` commits)
- 🛠️ **Internals** - Internal changes (`refactor`, `style`, `test`, `build`, `ci`, `chore` commits)
- ⚡ **Performance** - Performance improvements (`perf` commits)
- ↩️ **Reverts** - Reverted changes (`revert` commits)
- ⚠️ **BREAKING CHANGES** - Breaking changes (commits with `BREAKING CHANGE` footer)

Each commit entry includes:

- Scope (if provided)
- Commit message with linked issues and usernames
- Commit hash link
- Author attribution (@username)

### 💬 Custom GitHub Comments

#### Issue Comments

**For Pre-releases:**

```
🎉 This issue is included in version X.X.X-next.X which is now available for testing! 🧪

📦 NPM: astro-loader-pocketbase@X.X.X-next.X
📖 GitHub Release: X.X.X-next.X

@username Can you check if everything works as expected in your project with this new version? Any feedback is welcome.

<small>This change will be included in the next regular release.</small>
```

**For Regular Releases:**

```
🎉 This issue is included in version X.X.X which is now available! 🚀

📦 NPM: astro-loader-pocketbase@X.X.X
📖 GitHub Release: X.X.X
```

#### Pull Request Comments

**For Pre-releases:**

```
🎉 This PR is included in version X.X.X-next.X which is now available for testing! 🧪

📦 NPM: astro-loader-pocketbase@X.X.X-next.X
📖 GitHub Release: X.X.X-next.X

@username Thank you for your contribution!

<small>This change will be included in the next regular release.</small>
```

**For Regular Releases:**

```
🎉 This PR is included in version X.X.X which is now available! 🚀

📦 NPM: astro-loader-pocketbase@X.X.X
📖 GitHub Release: X.X.X

Thank you for your contribution!
```

### 📚 Documentation

Added comprehensive documentation in `.github/semantic-release.md` explaining:

- How the new changelog categories work
- Examples of issue and PR comment templates
- Configuration file structure
- Commit types and their release impact

### 💻 Example Changelog Entry

Here's an example of how a changelog entry would look for a release like [PR #48](https://github.com/pawcoding/astro-loader-pocketbase/pull/48):

```markdown
## 2.7.1 (2025-08-10)

### 🩹 Fixes

- Cleanup entries correctly when using `idField` configuration option ([a1b2c3d](https://github.com/pawcoding/astro-loader-pocketbase/commit/a1b2c3d)) by @pawcoding

### 🛠️ Internals

- Replace `eslint` with `oxlint` to make linting tasks even faster ([d4e5f6g](https://github.com/pawcoding/astro-loader-pocketbase/commit/d4e5f6g)) by @pawcoding
- Setup for Copilot and other agents ([h7i8j9k](https://github.com/pawcoding/astro-loader-pocketbase/commit/h7i8j9k)) by @pawcoding
- Add GitHub issue templates for better bug reporting and feature requests ([l0m1n2o](https://github.com/pawcoding/astro-loader-pocketbase/commit/l0m1n2o)) by @pawcoding
- Update dependencies to latest versions ([p3q4r5s](https://github.com/pawcoding/astro-loader-pocketbase/commit/p3q4r5s)) by @pawcoding

[2.7.1](https://github.com/pawcoding/astro-loader-pocketbase/compare/2.7.0...2.7.1) (5 commits)
```

## Configuration Files

### `release.config.cjs`

Main configuration file that sets up:

- Commit analysis rules
- Release notes generation with custom templates
- Changelog generation
- NPM publishing
- Git asset updates
- GitHub releases and comments

### `.semantic-release/templates/`

Custom Handlebars templates for changelog generation:

- `template.hbs` - Main changelog template with emoji categories
- `header.hbs` - Release header format
- `commit.hbs` - Individual commit entry format with contributor attribution
- `footer.hbs` - Release footer with links and commit count

## Release Branches

- **`master`** - Stable releases (latest)
- **`next`** - Pre-releases for testing (next channel)

## Commit Types and Release Impact

| Type       | Description                  | Release | Changelog Section |
| ---------- | ---------------------------- | ------- | ----------------- |
| `feat`     | New feature                  | Minor   | ✨ Features       |
| `fix`      | Bug fix                      | Patch   | 🩹 Fixes          |
| `docs`     | Documentation (README scope) | Patch   | 📚 Documentation  |
| `docs`     | Other documentation          | None    | 📚 Documentation  |
| `refactor` | Code refactoring             | Patch   | 🛠️ Internals      |
| `style`    | Code style changes           | Patch   | 🛠️ Internals      |
| `test`     | Adding/updating tests        | None    | 🛠️ Internals      |
| `build`    | Build system (deps scope)    | Patch   | 🛠️ Internals      |
| `build`    | Other build changes          | None    | 🛠️ Internals      |
| `ci`       | CI configuration             | None    | 🛠️ Internals      |
| `chore`    | Maintenance tasks            | None    | 🛠️ Internals      |
| `perf`     | Performance improvements     | Patch   | ⚡ Performance    |

## Breaking Changes

Commits with `BREAKING CHANGE` or `BREAKING CHANGES` in the footer will:

- Trigger a major release
- Be listed in a special "⚠️ BREAKING CHANGES" section
- Include migration information from the commit footer
