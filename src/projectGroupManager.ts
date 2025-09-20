import * as vscode from 'vscode';
import { ProjectGroup, Project } from './types';

interface SerializedProjectGroup {
    id: string;
    name: string;
    projects: Project[];
}

interface ExportPayload {
    formatVersion: number;
    groups: SerializedProjectGroup[];
}

export class ProjectGroupManager {
    private static readonly STORAGE_KEY = 'multiProjectLauncher.groups';
    private static readonly EXPORT_FORMAT_VERSION = 1;
    private groups: ProjectGroup[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadGroups();
    }

    private loadGroups(): void {
        const storedGroups = this.context.globalState.get<ProjectGroup[]>(ProjectGroupManager.STORAGE_KEY, []);
        this.groups = this.normalizeGroups(storedGroups);
    }

    private saveGroups(): void {
        this.context.globalState.update(ProjectGroupManager.STORAGE_KEY, this.groups);
    }

    private createGroupId(): string {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    getGroups(): ProjectGroup[] {
        return this.groups;
    }

    createGroup(name: string): void {
        const newGroup: ProjectGroup = {
            id: this.createGroupId(),
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

    exportData(): ExportPayload {
        const serializedGroups = this.groups.map(group => ({
            id: group.id,
            name: group.name,
            projects: group.projects.map(project => {
                if (typeof project === 'string') {
                    return { path: project, enabled: true };
                }
                return { path: project.path, enabled: project.enabled };
            })
        }));

        return {
            formatVersion: ProjectGroupManager.EXPORT_FORMAT_VERSION,
            groups: serializedGroups
        };
    }

    importData(rawPayload: unknown): number {
        const groups = this.deserializePayload(rawPayload);
        this.groups = groups;
        this.saveGroups();
        return this.groups.length;
    }

    private deserializePayload(rawPayload: unknown): ProjectGroup[] {
        let candidateGroups: unknown;

        if (Array.isArray(rawPayload)) {
            candidateGroups = rawPayload;
        } else if (rawPayload && typeof rawPayload === 'object') {
            const potentialGroups = (rawPayload as { groups?: unknown }).groups;
            if (!Array.isArray(potentialGroups)) {
                throw new Error('Missing "groups" array in import payload.');
            }
            candidateGroups = potentialGroups;
        } else {
            throw new Error('Unsupported configuration format.');
        }

        return this.normalizeGroups(candidateGroups);
    }

    private normalizeGroups(candidateGroups: unknown): ProjectGroup[] {
        if (!Array.isArray(candidateGroups)) {
            return [];
        }

        const normalized: ProjectGroup[] = [];
        const seenIds = new Set<string>();

        candidateGroups.forEach(rawGroup => {
            try {
                const group = this.normalizeGroup(rawGroup);

                let finalId = group.id;
                while (seenIds.has(finalId)) {
                    finalId = this.createGroupId();
                }
                group.id = finalId;

                seenIds.add(group.id);
                normalized.push(group);
            } catch (error) {
                console.warn('Skipping invalid project group', error);
            }
        });

        return normalized;
    }

    private normalizeGroup(rawGroup: unknown): ProjectGroup {
        if (!rawGroup || typeof rawGroup !== 'object') {
            throw new Error('Group is not an object.');
        }

        const { id, name, projects } = rawGroup as {
            id?: unknown;
            name?: unknown;
            projects?: unknown;
        };

        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Group name is required.');
        }

        const normalizedProjects: Project[] = [];
        if (Array.isArray(projects)) {
            const seenPaths = new Set<string>();
            projects.forEach(project => {
                const normalizedProject = this.normalizeProject(project);
                if (!normalizedProject) {
                    return;
                }

                if (seenPaths.has(normalizedProject.path)) {
                    return;
                }

                seenPaths.add(normalizedProject.path);
                normalizedProjects.push(normalizedProject);
            });
        }

        return {
            id: typeof id === 'string' && id.trim() ? id : this.createGroupId(),
            name: name.trim(),
            projects: normalizedProjects
        };
    }

    private normalizeProject(project: unknown): Project | null {
        if (typeof project === 'string') {
            const trimmed = project.trim();
            if (!trimmed) {
                return null;
            }
            return { path: trimmed, enabled: true };
        }

        if (project && typeof project === 'object') {
            const { path, enabled } = project as { path?: unknown; enabled?: unknown };
            if (typeof path === 'string' && path.trim()) {
                return {
                    path: path.trim(),
                    enabled: typeof enabled === 'boolean' ? enabled : true
                };
            }
        }

        return null;
    }
}
