import * as vscode from 'vscode';
import { ProjectGroup } from './types';

export class ProjectGroupManager {
    private static readonly STORAGE_KEY = 'multiProjectLauncher.groups';
    private groups: ProjectGroup[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadGroups();
    }

    private loadGroups(): void {
        this.groups = this.context.globalState.get<ProjectGroup[]>(ProjectGroupManager.STORAGE_KEY, []);
    }

    private saveGroups(): void {
        this.context.globalState.update(ProjectGroupManager.STORAGE_KEY, this.groups);
    }

    getGroups(): ProjectGroup[] {
        return this.groups;
    }

    createGroup(name: string): void {
        const newGroup: ProjectGroup = {
            id: Date.now().toString(),
            name,
            projects: []
        };
        this.groups.push(newGroup);
        this.saveGroups();
    }

    deleteGroup(groupId: string): void {
        this.groups = this.groups.filter(group => group.id !== groupId);
        this.saveGroups();
    }

    addProjectToGroup(groupId: string, projectPath: string): void {
        const group = this.groups.find(g => g.id === groupId);
        if (group && !group.projects.includes(projectPath)) {
            group.projects.push(projectPath);
            this.saveGroups();
        }
    }

    removeProjectFromGroup(groupId: string, projectPath: string): void {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            group.projects = group.projects.filter(p => p !== projectPath);
            this.saveGroups();
        }
    }

    updateGroupName(groupId: string, newName: string): void {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            group.name = newName;
            this.saveGroups();
        }
    }
}