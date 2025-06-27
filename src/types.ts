export interface ProjectGroup {
    id: string;
    name: string;
    projects: string[];
}

export interface ProjectItem {
    groupId: string;
    path: string;
    name: string;
}