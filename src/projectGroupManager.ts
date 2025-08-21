import * as vscode from 'vscode';
import { ProjectGroup, Project } from './types';

export class ProjectGroupManager {
    private static readonly STORAGE_KEY = 'multiProjectLauncher.groups';
    private groups: ProjectGroup[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadGroups();
    }

    private loadGroups(): void {
        const storedGroups = this.context.globalState.get<ProjectGroup[]>(ProjectGroupManager.STORAGE_KEY, []);
        // Migrate old string[] format to Project[] format
        this.groups = storedGroups.map(group => ({
            ...group,
            projects: group.projects.map(p => 
                typeof p === 'string' 
                    ? { path: p, enabled: true } 
                    : p
            )
        }));
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
        if (group) {
            const projectExists = group.projects.some(p => 
                (typeof p === 'string' ? p : p.path) === projectPath
            );
            if (!projectExists) {
                group.projects.push({ path: projectPath, enabled: true });
                this.saveGroups();
            }
        }
    }

    removeProjectFromGroup(groupId: string, projectPath: string): void {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            group.projects = group.projects.filter(p => 
                (typeof p === 'string' ? p : p.path) !== projectPath
            );
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

    toggleProjectEnabled(groupId: string, projectPath: string): void {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            const projectIndex = group.projects.findIndex(p => 
                (typeof p === 'string' ? p : p.path) === projectPath
            );
            if (projectIndex !== -1) {
                const project = group.projects[projectIndex];
                if (typeof project === 'string') {
                    group.projects[projectIndex] = { path: project, enabled: false };
                } else {
                    project.enabled = !project.enabled;
                }
                this.saveGroups();
            }
        }
    }

    getProjectState(groupId: string, projectPath: string): boolean {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            const project = group.projects.find(p => 
                (typeof p === 'string' ? p : p.path) === projectPath
            );
            if (project) {
                return typeof project === 'string' ? true : project.enabled;
            }
        }
        return true;
    }
}