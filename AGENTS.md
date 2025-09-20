# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, with `extension.ts` wiring VS Code commands, `projectGroupManager.ts` handling persistence, and `projectGroupProvider.ts` driving the tree view; keep shared types in `types.ts`. Tests reside in `src/test/*.test.ts`. Built artifacts land in `dist/` via esbuild—treat this directory and the checked-in `.vsix` bundles as generated outputs. Icons and other assets belong under `resources/`.

## Build, Test, and Development Commands
Run `npm install` once per clone. Use `npm run compile` to type-check, lint, and build to `dist/`. `npm run watch` spins up incremental rebuilds (`watch:esbuild` and `watch:tsc`) while developing the extension. Lint quickly with `npm run lint`, and execute the VS Code test harness with `npm run test` (pre-wired to compile beforehand). For a production-ready build invoke `npm run package`; follow up with `npx vsce package` if you need a refreshed `.vsix` file.

## Coding Style & Naming Conventions
Write strict TypeScript with four-space indentation and single quotes, mirroring the existing files. Keep imports camelCase/PascalCase to satisfy `@typescript-eslint/naming-convention`. Always require braces (`curly`) and strict equality (`eqeqeq`), and terminate statements with semicolons. Use ESLint as the source of truth—`npm run lint -- --fix` can resolve most straightforward issues.

## Testing Guidelines
Place integration-style specs alongside fixtures in `src/test/`, using the `.test.ts` suffix. `npm run test` triggers the Mocha suite through `@vscode/test-cli`; rely on the generated VS Code instance for UI assertions. When adding logic-heavy modules, supplement with focused unit tests and document any manual steps needed to exercise tree view interactions.

## Commit & Pull Request Guidelines
Follow the scoped conventional style already in Git history (`feat:`, `fix:`, `chore:`, `init:`), keeping the subject under ~72 characters and writing in the imperative mood. Reference related issues in the body, note any user-facing changes, and update `README.md` or `CHANGELOG.md` when behavior shifts. Pull requests should summarize intent, list validation commands (e.g., `npm run compile`, `npm run test`), and include screenshots when UI output changes.

## Extension Packaging Tips
Before publishing, bump the version in `package.json`, regenerate `CHANGELOG.md`, run `npm run package`, and verify the `dist/extension.js` output. Create the distributable with `npx vsce package`, attach the resulting `.vsix`, and smoke-test by installing it locally via the VS Code Extensions pane.
