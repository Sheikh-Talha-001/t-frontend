export type Status = 'To Do' | 'In Progress' | 'Pending' | 'Completed' | 'Backlog' | 'Active' | 'Blocked';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  date?: string;
  subtasks?: SubTask[];
  assignee?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  sharedWith?: {
    _id: string;
    name: string;
    email: string;
  }[];
  attachments?: {
    _id: string;
    url: string;
    publicId: string;
    filename: string;
    uploadedAt: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  status: 'Running' | 'Ended' | 'Pending';
  progress: number;
}
