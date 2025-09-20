import * as vscode from 'vscode';
import * as path from 'path';
import { ProjectGroupProvider } from './projectGroupProvider';
import { ProjectGroup, ProjectItem, Project } from './types';
import { ProjectGroupManager } from './projectGroupManager';

export function activate(context: vscode.ExtensionContext) {
    
    const projectGroupManager = new ProjectGroupManager(context);
    const projectGroupProvider = new ProjectGroupProvider(projectGroupManager);

    const treeView = vscode.window.createTreeView('multiProjectLauncher', {
        treeDataProvider: projectGroupProvider,
        canSelectMany: false
    });

    const disposables = [
        vscode.commands.registerCommand('projectLauncher.createGroup', async () => {
            const groupName = await vscode.window.showInputBox({
                prompt: 'Enter group name',
                placeHolder: 'e.g., Frontend Projects'
            });

            if (groupName) {
                projectGroupManager.createGroup(groupName);
                projectGroupProvider.refresh();
            }
        }),

        vscode.commands.registerCommand('projectLauncher.addProject', async (group: ProjectGroup) => {
            const uri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Select Project Folder'
            });

            if (uri && uri[0]) {
                projectGroupManager.addProjectToGroup(group.id, uri[0].fsPath);
                projectGroupProvider.refresh();
            }
        }),

        vscode.commands.registerCommand('projectLauncher.deleteGroup', async (group: ProjectGroup) => {
            const answer = await vscode.window.showWarningMessage(
                `Delete group '${group.name}'?`,
                'Yes', 'No'
            );

            if (answer === 'Yes') {
                projectGroupManager.deleteGroup(group.id);
                projectGroupProvider.refresh();
            }
        }),

        vscode.commands.registerCommand('projectLauncher.removeProject', async (item: ProjectItem) => {
            projectGroupManager.removeProjectFromGroup(item.groupId, item.path);
            projectGroupProvider.refresh();
        }),

        // 개별 프로젝트 열기 (새 창)
        vscode.commands.registerCommand('projectLauncher.openProject', async (item: ProjectItem) => {
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(item.path), true);
        }),

        // 개별 프로젝트 열기 (현재 창)
        vscode.commands.registerCommand('projectLauncher.openProjectInCurrentWindow', async (item: ProjectItem) => {
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(item.path), false);
        }),

        vscode.commands.registerCommand('projectLauncher.openGroupKeepWindows', async (group: ProjectGroup) => {
            for (const project of group.projects) {
                const projectPath = typeof project === 'string' ? project : project.path;
                const enabled = typeof project === 'string' ? true : project.enabled;
                if (enabled) {
                    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
                }
            }
        }),

        vscode.commands.registerCommand('projectLauncher.openGroupCloseWindows', async (group: ProjectGroup) => {
            const enabledProjects = group.projects.filter(p => 
                typeof p === 'string' ? true : p.enabled
            );
            
            if (enabledProjects.length > 0) {
                const firstProjectPath = typeof enabledProjects[0] === 'string' 
                    ? enabledProjects[0] 
                    : enabledProjects[0].path;
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(firstProjectPath), false);
                
                for (let i = 1; i < enabledProjects.length; i++) {
                    const project = enabledProjects[i];
                    const projectPath = typeof project === 'string' 
                        ? project 
                        : project.path;
                    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
                }
            }
        }),

        vscode.commands.registerCommand('projectLauncher.refresh', () => {
            projectGroupProvider.refresh();
        }),

        // 커맨드 팔레트에서 그룹 선택하여 열기
        vscode.commands.registerCommand('projectLauncher.openGroupFromPalette', async () => {
            const groups = projectGroupManager.getGroups();
            
            if (groups.length === 0) {
                vscode.window.showInformationMessage('No project groups found. Create a group first.');
                return;
            }

            const quickPickItems = groups.map(group => {
                const enabledCount = group.projects.filter(p => 
                    typeof p === 'string' ? true : p.enabled
                ).length;
                const totalCount = group.projects.length;
                return {
                    label: group.name,
                    description: `${enabledCount}/${totalCount} project(s) enabled`,
                    group: group
                };
            });

            const selected = await vscode.window.showQuickPick(quickPickItems, {
                placeHolder: 'Select a project group to open',
                title: 'Open Project Group'
            });

            if (selected) {
                const openOption = await vscode.window.showQuickPick(
                    [
                        { label: '$(window) Open in New Windows', value: 'new' },
                        { label: '$(split-horizontal) Replace Current Window', value: 'replace' }
                    ],
                    {
                        placeHolder: 'How would you like to open the projects?'
                    }
                );

                if (openOption) {
                    if (openOption.value === 'new') {
                        await vscode.commands.executeCommand('projectLauncher.openGroupKeepWindows', selected.group);
                    } else {
                        await vscode.commands.executeCommand('projectLauncher.openGroupCloseWindows', selected.group);
                    }
                }
            }
        }),

        // 커맨드 팔레트에서 프로젝트 선택하여 열기
        vscode.commands.registerCommand('projectLauncher.openProjectFromPalette', async () => {
            const groups = projectGroupManager.getGroups();
            
            if (groups.length === 0) {
                vscode.window.showInformationMessage('No project groups found. Create a group first.');
                return;
            }

            interface ProjectQuickPickItem extends vscode.QuickPickItem {
                projectPath: string;
            }
            
            const quickPickItems: ProjectQuickPickItem[] = [];
            groups.forEach(group => {
                group.projects.forEach(project => {
                    const projectPath = typeof project === 'string' ? project : project.path;
                    const enabled = typeof project === 'string' ? true : project.enabled;
                    const projectName = path.basename(projectPath);
                    quickPickItems.push({
                        label: `${projectName}${!enabled ? ' (disabled)' : ''}`,
                        description: projectPath,
                        detail: `Group: ${group.name}`,
                        projectPath: projectPath
                    });
                });
            });

            if (quickPickItems.length === 0) {
                vscode.window.showInformationMessage('No projects found. Add projects to your groups first.');
                return;
            }

            const selected = await vscode.window.showQuickPick(quickPickItems, {
                placeHolder: 'Select a project to open',
                title: 'Open Project'
            });

            if (selected) {
                const openOption = await vscode.window.showQuickPick(
                    [
                        { label: '$(window) Open in New Window', value: 'new' },
                        { label: '$(empty-window) Open in Current Window', value: 'current' }
                    ],
                    {
                        placeHolder: 'How would you like to open the project?'
                    }
                );

                if (openOption) {
                    await vscode.commands.executeCommand(
                        'vscode.openFolder',
                        vscode.Uri.file(selected.projectPath),
                        openOption.value === 'new'
                    );
                }
            }
        }),

        // Toggle project enabled/disabled
        vscode.commands.registerCommand('projectLauncher.toggleProjectEnabled', async (item: ProjectItem) => {
            projectGroupManager.toggleProjectEnabled(item.groupId, item.path);
            projectGroupProvider.refresh();
        }),

        vscode.commands.registerCommand('projectLauncher.exportSettings', async () => {
            const groups = projectGroupManager.getGroups();

            if (groups.length === 0) {
                vscode.window.showInformationMessage('No project groups found to export.');
                return;
            }

            const targetUri = await vscode.window.showSaveDialog({
                filters: { 'JSON Files': ['json'] },
                saveLabel: 'Export Project Groups'
            });

            if (!targetUri) {
                return;
            }

            try {
                const payload = projectGroupManager.exportData();
                const contents = JSON.stringify(payload, null, 2);
                await vscode.workspace.fs.writeFile(targetUri, Buffer.from(contents, 'utf8'));
                const summary = payload.groups.length === 1
                    ? '1 project group'
                    : `${payload.groups.length} project groups`;
                vscode.window.showInformationMessage(`Exported ${summary} to ${targetUri.fsPath}.`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to export project groups: ${message}`);
            }
        }),

        vscode.commands.registerCommand('projectLauncher.importSettings', async () => {
            const selection = await vscode.window.showOpenDialog({
                canSelectMany: false,
                filters: { 'JSON Files': ['json'] },
                openLabel: 'Import Project Groups'
            });

            if (!selection || selection.length === 0) {
                return;
            }

            const [sourceUri] = selection;

            try {
                const raw = await vscode.workspace.fs.readFile(sourceUri);
                let parsed: unknown;

                try {
                    parsed = JSON.parse(Buffer.from(raw).toString('utf8'));
                } catch (parseError) {
                    throw new Error('Selected file is not valid JSON.');
                }

                if (projectGroupManager.getGroups().length > 0) {
                    const confirmation = await vscode.window.showWarningMessage(
                        'Importing will replace all existing project groups. Continue?',
                        { modal: true },
                        'Import'
                    );

                    if (confirmation !== 'Import') {
                        return;
                    }
                }

                const importedCount = projectGroupManager.importData(parsed);
                projectGroupProvider.refresh();
                const summary = importedCount === 1
                    ? '1 project group'
                    : `${importedCount} project groups`;
                vscode.window.showInformationMessage(`Imported ${summary} from ${sourceUri.fsPath}.`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to import project groups: ${message}`);
            }
        }),

        treeView
    ];

    context.subscriptions.push(...disposables);
}

export function deactivate() {}
