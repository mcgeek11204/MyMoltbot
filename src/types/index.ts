// GTD 核心类型定义

export type TaskStatus = 'inbox' | 'today' | 'scheduled' | 'anytime' | 'someday' | 'completed' | 'trash';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  projectId: string | null;
  areaId: string | null;
  tags: string[];
  checklist: ChecklistItem[];
  scheduledDate: string | null; // ISO date string
  deadline: string | null; // ISO date string
  repeatRule: RepeatRule | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
}

export interface RepeatRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 每隔多少个周期
  daysOfWeek?: number[]; // 0-6, 仅 weekly
  dayOfMonth?: number; // 1-31, 仅 monthly
}

export interface Project {
  id: string;
  title: string;
  notes: string;
  areaId: string | null;
  tags: string[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
}

export interface Area {
  id: string;
  title: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook' | 'trash' | 'project' | 'area' | 'tag';

export interface AppState {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  tags: Tag[];
  currentView: ViewType;
  selectedItemId: string | null; // 当前选中的 project/area/tag id
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  searchQuery: string;
  isQuickEntryOpen: boolean;
}
