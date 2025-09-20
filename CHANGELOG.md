# Change Log

All notable changes to the "Multi Project Launcher" extension will be documented in this file.

## [1.2.0] - 2025-09-20

### Added
- Export/import commands for project groups to make migrating settings across editors straightforward

## [1.1.0] - 2025-08-21

### Added
- **Project Enable/Disable Toggle**: Selectively enable or disable projects within a group
- Visual indicators for enabled/disabled states with checkbox-style icons
- Project count display showing enabled vs total projects (e.g., "Frontend (2/3)")
- Toggle command accessible via inline button and context menu
- Support for selective project opening - only enabled projects are opened when launching a group

### Improved
- Better visual distinction between enabled and disabled projects
- Enhanced tree view with clear status indicators
- Improved type safety with proper TypeScript interfaces
- Better path handling using Node.js path module

### Fixed
- Type safety improvements removing `any` types
- Console.log statements removed from production code
- Cross-platform path compatibility

## [1.0.1] - 2025-06-27

### Fixed
- VSCode engine compatibility issue (now supports VSCode 1.74.0+)
- Fixed view ID references for proper extension activation
- Updated all "Project Launcher" references to "Multi Project Launcher"

## [1.0.0] - 2025-06-27

### Added

- Create and manage project groups
- Add projects to groups via folder selection
- Open all projects in a group (with options to keep or close existing windows)
- Open individual projects from any group
- Command palette integration for quick access
- Tree view in sidebar with intuitive icons
- Context menus for all major operations
- Persistent storage of project groups across sessions

### Features

- **Project Groups**: Organize related projects together
- **Batch Opening**: Open multiple projects with one click
- **Flexible Options**: Choose how to open projects (new window/current window)
- **Easy Management**: Add, remove, and delete operations via context menus
- **Command Palette**: Quick access to open groups or individual projects
