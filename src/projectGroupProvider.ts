import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectGroup, ProjectItem, Project } from './types';
import { ProjectGroupManager } from './projectGroupManager';

export class ProjectGroupProvider implements vscode.TreeDataProvider<ProjectGroup | ProjectItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectGroup | ProjectItem | undefined | null | void> = new vscode.EventEmitter<ProjectGroup | ProjectItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectGroup | ProjectItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private projectGroupManager: ProjectGroupManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProjectGroup | ProjectItem): vscode.TreeItem {
        if ('projects' in element) {
            // It's a ProjectGroup
            const enabledCount = element.projects.filter(p => 
                typeof p === 'string' ? true : p.enabled
            ).length;
            const totalCount = element.projects.length;
            const item = new vscode.TreeItem(
                `${element.name} (${enabledCount}/${totalCount})`, 
                vscode.TreeItemCollapsibleState.Expanded
            );
            item.contextValue = 'projectGroup';
            item.iconPath = new vscode.ThemeIcon('folder-library');
            return item;
        } else {
            // It's a ProjectItem
            const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
            item.contextValue = element.enabled ? 'projectItem' : 'projectItemDisabled';
            item.tooltip = `${element.path}${!element.enabled ? ' (disabled)' : ''}`;
            
            // Use checkbox-style icons for clear enabled/disabled state
            if (element.enabled) {
                item.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('charts.green'));
            } else {
                item.iconPath = new vscode.ThemeIcon('circle-large-outline', new vscode.ThemeColor('disabledForeground'));
            }
            
            // Add visual indicator for disabled items
            if (!element.enabled) {
                item.description = '○ disabled';
            }
            
            return item;
        }
    }

    getChildren(element?: ProjectGroup | ProjectItem): Thenable<(ProjectGroup | ProjectItem)[]> {
        if (!element) {
            // Root level - return all groups
            return Promise.resolve(this.projectGroupManager.getGroups());
        } else if ('projects' in element) {
            // It's a ProjectGroup - return its projects
            const projectItems: ProjectItem[] = element.projects.map(project => {
                const projectPath = typeof project === 'string' ? project : project.path;
                const enabled = typeof project === 'string' ? true : project.enabled;
                return {
                    groupId: element.id,
                    path: projectPath,
                    name: path.basename(projectPath),
                    enabled: enabled
                };
            });
            return Promise.resolve(projectItems);
        } else {
            // It's a ProjectItem - no children
            return Promise.resolve([]);
        }
    }

    getParent(element: ProjectGroup | ProjectItem): ProjectGroup | undefined {
        if ('projects' in element) {
            // It's a ProjectGroup - no parent
            return undefined;
        } else {
            // It's a ProjectItem - find its parent group
            return this.projectGroupManager.getGroups().find(group => group.id === element.groupId);
        }
    }
}