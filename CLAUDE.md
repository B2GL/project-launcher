# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "Multi Project Launcher" that helps developers organize and launch multiple project folders as groups. It's particularly useful for managing microservices, monorepos, or multiple related projects.

## Development Commands

### Build and Package
```bash
# Development build
npm run compile

# Production build (for publishing)
npm run package

# Watch mode for development
npm run watch

# Type checking only
npm run check-types

# Lint code
npm run lint

# Run tests
npm test

# Package extension as VSIX
npm run vscode:prepublish
```

### Testing Individual Components
```bash
# Compile test files
npm run compile-tests

# Watch test files
npm run watch-tests

# Run pre-test setup
npm run pretest
```

## Architecture Overview

### Core Components

1. **Extension Entry Point** (`src/extension.ts`)
   - Activates the extension and registers all commands
   - Creates TreeView for the sidebar UI
   - Handles command palette integration
   - Manages opening projects individually or in groups

2. **Project Group Manager** (`src/projectGroupManager.ts`)
   - Manages persistent storage of project groups using VS Code's globalState
   - CRUD operations for groups and projects
   - Storage key: `multiProjectLauncher.groups`

3. **Tree Data Provider** (`src/projectGroupProvider.ts`)
   - Implements VS Code's TreeDataProvider interface
   - Provides hierarchical data structure for the sidebar view
   - Handles refresh events and tree item rendering

4. **Type Definitions** (`src/types.ts`)
   - `ProjectGroup`: Contains id, name, and array of project paths
   - `ProjectItem`: Represents individual project in a group

### Command Structure

The extension registers multiple commands that are accessible via:
- Context menus (right-click)
- Inline buttons in the tree view
- Command palette (Cmd+Shift+P)

Key commands:
- `projectLauncher.createGroup`: Create new project group
- `projectLauncher.addProject`: Add project to existing group
- `projectLauncher.openGroupKeepWindows`: Open all projects in new windows
- `projectLauncher.openGroupCloseWindows`: Replace current window with projects
- `projectLauncher.openProjectFromPalette`: Quick pick interface for opening projects

### Data Persistence

Project groups are stored in VS Code's global state, which persists across:
- VS Code sessions
- Workspace changes
- Extension updates

The data structure is an array of ProjectGroup objects stored under the key `multiProjectLauncher.groups`.

## Extension Manifest

The extension contributes:
- Custom activity bar container with dedicated icon
- Tree view in the sidebar
- Context menu items with different actions based on tree item type
- Command palette commands with "Multi Project Launcher" category

## Build Process

The extension uses esbuild for bundling:
- Development builds include source maps and watch mode
- Production builds are minified and optimized
- TypeScript compilation is separate from bundling for type checking