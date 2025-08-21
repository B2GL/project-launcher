export interface Project {
    path: string;
    enabled: boolean;
}

export interface ProjectGroup {
    id: string;
    name: string;
    projects: (string | Project)[];
}

export interface ProjectItem {
    groupId: string;
    path: string;
    name: string;
    enabled: boolean;
}