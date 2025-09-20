# Multi Project Launcher

A powerful VS Code extension that helps you organize and launch multiple project folders as groups. Perfect for developers working with microservices, monorepos, or multiple related projects.

## Features

- **Project Groups**: Organize your projects into logical groups
- **Batch Opening**: Open all projects in a group with a single click
- **Flexible Opening Options**: Choose to keep existing windows or replace them
- **Individual Project Launch**: Open single projects from any group
- **Command Palette Integration**: Quick access to all features via command palette
- **Intuitive UI**: Dedicated sidebar view with easy-to-use interface

## Usage

### Creating a Group

1. Click the Multi Project Launcher icon in the Activity Bar
2. Click the "+" button in the view toolbar
3. Enter a name for your group

### Adding Projects to a Group

1. Right-click on a group or click the folder icon next to it
2. Select "Add Project to Group"
3. Choose the project folder you want to add

### Opening Projects

**Open All Projects in a Group:**
- Right-click on a group and choose:
  - "Open All Projects (Keep Windows)" - Opens each project in a new window
  - "Open All Projects (Close Windows)" - Replaces current window with projects

**Open Individual Project:**
- Click the window icon next to a project
- Or right-click and choose your preferred opening method

**Using Command Palette:**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Search for:
  - "Multi Project Launcher: Open Project Group" - Select and open a group
  - "Multi Project Launcher: Open Project" - Select and open individual projects

### Managing Projects

- **Enable/Disable Projects**: Click the checkbox icon or right-click → "Toggle Project Enabled/Disabled"
  - Enabled projects show with a green checkmark (✅)
  - Disabled projects show with an empty circle (○) and "disabled" label
  - Only enabled projects open when launching a group
  - Group headers show enabled count (e.g., "Frontend (2/3)" means 2 of 3 projects are enabled)
- **Remove Project**: Click the "×" icon next to a project or right-click → "Remove Project"
- **Delete Group**: Right-click on a group → "Delete Group"
- **Refresh View**: Click the refresh icon in the view toolbar

### Exporting and Importing Groups

- **Export**: Open the Multi Project Launcher view, click the cloud-upload icon, or run `Multi Project Launcher: Export Project Launcher Settings` from the Command Palette. Choose where to save the JSON snapshot of your groups.
- **Import**: Run `Multi Project Launcher: Import Project Launcher Settings`, select the exported JSON file, and confirm the overwrite prompt. The extension replaces your existing groups with the imported set, making IDE migrations straightforward.

## Extension Settings

This extension stores your project groups in VS Code's global state, so they persist across sessions and workspaces.

## Requirements

- VS Code 1.74.0 or higher
- Works with Cursor IDE and other VS Code-based editors

## Known Issues

Please report issues on our [GitHub repository](https://github.com/your-username/project-launcher/issues).

## Release Notes

### 1.2.0

- Added export/import commands so you can migrate project groups between VS Code-based editors
- Updated toolbar with cloud icons for quick backups and restores

### 1.1.0

- Added project enable/disable toggle functionality
- Visual indicators for project states with checkbox-style icons
- Selective project opening - only enabled projects launch with group
- Improved type safety and code quality

### 1.0.0

Initial release of Multi Project Launcher:
- Create and manage project groups
- Add/remove projects from groups
- Open projects individually or as groups
- Command palette integration
- Intuitive tree view interface

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

**Enjoy organizing your projects!**
