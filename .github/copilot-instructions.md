# Copilot Instructions - Astro Loader PocketBase

This document provides comprehensive instructions for GitHub Copilot and other AI agents working on the `astro-loader-pocketbase` repository.

## Project Overview

This is an Astro content loader package that integrates PocketBase as a data source. It allows Astro sites to load content from PocketBase databases using Astro 5's Content Loader API.

### Key Features

- Content loading from PocketBase collections
- Real-time updates support (via `astro-integration-pocketbase`)
- Incremental builds
- Schema generation and validation
- File handling and transformations

### Additional documentation

- [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)
- [PocketBase Documentation](https://pocketbase.io/docs/)

## Repository Structure

```
src/
├── loader/              # Core loader functionality
├── schema/              # Schema handling and generation
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── index.ts             # Main export file
└── pocketbase-loader.ts # Main loader function
test/                    # Test files
```

## Development Workflow

### Essential NPM Scripts

#### Code Quality

```bash
# Format code (required before commit)
npm run format

# Lint code (oxlint)
npm run lint:fix

# Type checking (required before commit)
npm run typecheck
```

#### Testing

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only e2e tests
npm run test:e2e
```

### Pre-commit Requirements

Before any commit, the following MUST pass:

1. `npm run format` - Code formatting
2. `npm run lint:fix` - Linting with oxlint
3. `npm run typecheck` - TypeScript type checking

These are enforced by husky pre-commit hooks and lint-staged configuration.

## Testing Guidelines

### Test Structure

- **Unit tests**: `*.spec.ts` files
- **E2E tests**: `*.e2e-spec.ts` files
- **Mocks**: Located in `test/_mocks/` directory

### Test Patterns

#### For Bug Fixes

1. **Always create a test case first** that reproduces the issue
2. Run the test to confirm it fails
3. Fix the issue
4. Verify the test now passes
5. Add any additional edge case tests

Example:

```typescript
// Link to the bug report or issue
test("should handle edge case that was causing the bug", () => {
  // Arrange: Setup the problematic scenario
  const problematicInput = createProblematicInput();

  // Act: Execute the function that was buggy
  const result = functionThatWasBuggy(problematicInput);

  // Assert: Verify it now works correctly
  expect(result).toBe(expectedCorrectResult);
});
```

#### For New Features

- Write tests for each public function
- Cover happy path, edge cases, and error scenarios
- Use descriptive test names that explain behavior

#### Test Organization

```typescript
describe("FunctionName", () => {
  describe("when normal conditions", () => {
    test("should return expected result", () => {
      // Test implementation
    });
  });

  describe("when edge case occurs", () => {
    test("should handle gracefully", () => {
      // Test implementation
    });
  });

  describe("when error occurs", () => {
    test("should throw appropriate error", () => {
      // Test implementation
    });
  });
});
```

## Commit Message Format

This project uses **Conventional Commits** enforced by commitlint:

### Format

```
<type>(scope): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `build`: Maintenance tasks

### Examples

```bash
feat(loader): add support for file attachments
fix(schema): handle missing updated field correctly
docs(README): update installation instructions
test(utils): add tests for slugify function
refactor(loader): extract entry parsing logic
```

### Scope Guidelines

Use these scopes when applicable or custom ones:

- `loader`: Core loading functionality
- `schema`: Schema-related changes

## Code Conventions

### TypeScript

- Use strict TypeScript configuration
- Define types in the `types/` directory
- Import types using `import type` syntax
- Use relative imports
- Use descriptive interface names with PascalCase

### Function Organization

- Keep functions small and focused
- Use descriptive names that explain what the function does
- Place utility functions in appropriate `utils/` files
- Export only what's needed externally

### Error Handling

- Provide meaningful error messages
- Handle async operations properly with try/catch

### Testing

- Use `getSuperuserToken()` for authentication in tests
- Create temporary collections for testing
- Clean up test data after each test
- Use `checkE2eConnection()` to verify PocketBase availability
- Use existing mocks from `test/_mocks/`
- Create reusable mocks for common test scenarios
- For PocketBase interactions create e2e tests that use a real PocketBase instance instead of mocks
