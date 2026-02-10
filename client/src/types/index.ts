export interface User {
    id: string;
    email: string;
    username: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    category?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TimeLog {
    id: string;
    taskId: string;
    userId: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    task?: Task;
}
