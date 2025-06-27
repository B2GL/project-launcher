import * as vscode from 'vscode';
import { ProjectGroupProvider } from './projectGroupProvider';
import { ProjectGroup, ProjectItem } from './types';
import { ProjectGroupManager } from './projectGroupManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Project Launcher extension is now active!');
    
    const projectGroupManager = new ProjectGroupManager(context);
    const projectGroupProvider = new ProjectGroupProvider(projectGroupManager);

    const treeView = vscode.window.createTreeView('projectLauncher', {
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
            for (const projectPath of group.projects) {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
            }
        }),

        vscode.commands.registerCommand('projectLauncher.openGroupCloseWindows', async (group: ProjectGroup) => {
            if (group.projects.length > 0) {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(group.projects[0]), false);
                
                for (let i = 1; i < group.projects.length; i++) {
                    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(group.projects[i]), true);
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

            const quickPickItems = groups.map(group => ({
                label: group.name,
                description: `${group.projects.length} project(s)`,
                group: group
            }));

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

            const quickPickItems: any[] = [];
            groups.forEach(group => {
                group.projects.forEach(projectPath => {
                    const projectName = projectPath.split('/').pop() || projectPath;
                    quickPickItems.push({
                        label: projectName,
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

        treeView
    ];

    context.subscriptions.push(...disposables);
}

export function deactivate() {}
