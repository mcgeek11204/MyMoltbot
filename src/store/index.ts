import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import { Task, Project, Area, Tag, AppState, ViewType, TaskStatus, ChecklistItem, RepeatRule } from '@/types';

interface Actions {
  // Tasks
  addTask: (task: Partial<Task>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTaskToTrash: (id: string) => void;
  restoreTask: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  reorderTasks: (taskIds: string[]) => void;
  
  // Checklist
  addChecklistItem: (taskId: string, title: string) => void;
  updateChecklistItem: (taskId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  
  // Projects
  addProject: (project: Partial<Project>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  completeProject: (id: string) => void;
  
  // Areas
  addArea: (title: string) => string;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  
  // Tags
  addTag: (name: string, color?: string) => string;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  // UI
  setCurrentView: (view: ViewType, itemId?: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  toggleQuickEntry: () => void;
  
  // Data
  clearCompleted: () => void;
  emptyTrash: () => void;
}

const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', 
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6',
  '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'
];

const initialState: AppState = {
  tasks: [],
  projects: [],
  areas: [],
  tags: [],
  currentView: 'inbox',
  selectedItemId: null,
  selectedTaskId: null,
  sidebarCollapsed: false,
  searchQuery: '',
  isQuickEntryOpen: false,
};

export const useStore = create<AppState & Actions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Tasks
      addTask: (taskData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0;
        
        const newTask: Task = {
          id,
          title: taskData.title || '',
          notes: taskData.notes || '',
          status: taskData.status || 'inbox',
          projectId: taskData.projectId || null,
          areaId: taskData.areaId || null,
          tags: taskData.tags || [],
          checklist: taskData.checklist || [],
          scheduledDate: taskData.scheduledDate || null,
          deadline: taskData.deadline || null,
          repeatRule: taskData.repeatRule || null,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          order: maxOrder + 1,
        };

        set((state) => {
          state.tasks.push(newTask);
        });
        return id;
      },

      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            Object.assign(task, updates, { updatedAt: new Date().toISOString() });
          }
        });
      },

      deleteTask: (id) => {
        set((state) => {
          state.tasks = state.tasks.filter(t => t.id !== id);
        });
      },

      moveTaskToTrash: (id) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            task.status = 'trash';
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      restoreTask: (id) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            task.status = 'inbox';
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      completeTask: (id) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            const now = new Date().toISOString();
            task.status = 'completed';
            task.completedAt = now;
            task.updatedAt = now;
          }
        });
      },

      uncompleteTask: (id) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            task.status = 'inbox';
            task.completedAt = null;
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      reorderTasks: (taskIds) => {
        set((state) => {
          taskIds.forEach((id, index) => {
            const task = state.tasks.find(t => t.id === id);
            if (task) {
              task.order = index;
            }
          });
        });
      },

      // Checklist
      addChecklistItem: (taskId, title) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            task.checklist.push({
              id: uuid(),
              title,
              completed: false,
            });
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      updateChecklistItem: (taskId, itemId, updates) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            const item = task.checklist.find(i => i.id === itemId);
            if (item) {
              Object.assign(item, updates);
              task.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      deleteChecklistItem: (taskId, itemId) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            task.checklist = task.checklist.filter(i => i.id !== itemId);
            task.updatedAt = new Date().toISOString();
          }
        });
      },

      toggleChecklistItem: (taskId, itemId) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            const item = task.checklist.find(i => i.id === itemId);
            if (item) {
              item.completed = !item.completed;
              task.updatedAt = new Date().toISOString();
            }
          }
        });
      },

      // Projects
      addProject: (projectData) => {
        const id = uuid();
        const now = new Date().toISOString();
        const projects = get().projects;
        const maxOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order)) : 0;

        const newProject: Project = {
          id,
          title: projectData.title || '新项目',
          notes: projectData.notes || '',
          areaId: projectData.areaId || null,
          tags: projectData.tags || [],
          deadline: projectData.deadline || null,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          order: maxOrder + 1,
        };

        set((state) => {
          state.projects.push(newProject);
        });
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => {
          const project = state.projects.find(p => p.id === id);
          if (project) {
            Object.assign(project, updates, { updatedAt: new Date().toISOString() });
          }
        });
      },

      deleteProject: (id) => {
        set((state) => {
          state.projects = state.projects.filter(p => p.id !== id);
          // 将项目下的任务移到 inbox
          state.tasks.forEach(task => {
            if (task.projectId === id) {
              task.projectId = null;
            }
          });
        });
      },

      completeProject: (id) => {
        set((state) => {
          const project = state.projects.find(p => p.id === id);
          if (project) {
            project.completedAt = new Date().toISOString();
          }
        });
      },

      // Areas
      addArea: (title) => {
        const id = uuid();
        const areas = get().areas;
        const maxOrder = areas.length > 0 ? Math.max(...areas.map(a => a.order)) : 0;

        set((state) => {
          state.areas.push({
            id,
            title,
            order: maxOrder + 1,
          });
        });
        return id;
      },

      updateArea: (id, updates) => {
        set((state) => {
          const area = state.areas.find(a => a.id === id);
          if (area) {
            Object.assign(area, updates);
          }
        });
      },

      deleteArea: (id) => {
        set((state) => {
          state.areas = state.areas.filter(a => a.id !== id);
          // 清除相关引用
          state.tasks.forEach(task => {
            if (task.areaId === id) task.areaId = null;
          });
          state.projects.forEach(project => {
            if (project.areaId === id) project.areaId = null;
          });
        });
      },

      // Tags
      addTag: (name, color) => {
        const id = uuid();
        const usedColors = get().tags.map(t => t.color);
        const availableColors = TAG_COLORS.filter(c => !usedColors.includes(c));
        const tagColor = color || availableColors[0] || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

        set((state) => {
          state.tags.push({
            id,
            name,
            color: tagColor,
          });
        });
        return id;
      },

      updateTag: (id, updates) => {
        set((state) => {
          const tag = state.tags.find(t => t.id === id);
          if (tag) {
            Object.assign(tag, updates);
          }
        });
      },

      deleteTag: (id) => {
        set((state) => {
          state.tags = state.tags.filter(t => t.id !== id);
          // 从任务中移除标签
          state.tasks.forEach(task => {
            task.tags = task.tags.filter(tagId => tagId !== id);
          });
          state.projects.forEach(project => {
            project.tags = project.tags.filter(tagId => tagId !== id);
          });
        });
      },

      // UI
      setCurrentView: (view, itemId = null) => {
        set((state) => {
          state.currentView = view;
          state.selectedItemId = itemId;
          state.selectedTaskId = null;
        });
      },

      setSelectedTaskId: (id) => {
        set((state) => {
          state.selectedTaskId = id;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        });
      },

      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query;
        });
      },

      toggleQuickEntry: () => {
        set((state) => {
          state.isQuickEntryOpen = !state.isQuickEntryOpen;
        });
      },

      // Data
      clearCompleted: () => {
        set((state) => {
          state.tasks = state.tasks.filter(t => t.status !== 'completed');
        });
      },

      emptyTrash: () => {
        set((state) => {
          state.tasks = state.tasks.filter(t => t.status !== 'trash');
        });
      },
    })),
    {
      name: 'gtd-storage',
    }
  )
);

// 选择器
export const selectTasksByView = (state: AppState, view: ViewType, itemId?: string | null) => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (view) {
    case 'inbox':
      return state.tasks.filter(t => t.status === 'inbox' && !t.projectId);
    case 'today':
      return state.tasks.filter(t => 
        t.status === 'today' || 
        (t.scheduledDate && t.scheduledDate <= today && t.status !== 'completed' && t.status !== 'trash')
      );
    case 'upcoming':
      return state.tasks.filter(t => 
        t.scheduledDate && t.status !== 'completed' && t.status !== 'trash'
      ).sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));
    case 'anytime':
      return state.tasks.filter(t => t.status === 'anytime');
    case 'someday':
      return state.tasks.filter(t => t.status === 'someday');
    case 'logbook':
      return state.tasks.filter(t => t.status === 'completed').sort((a, b) => 
        (b.completedAt || '').localeCompare(a.completedAt || '')
      );
    case 'trash':
      return state.tasks.filter(t => t.status === 'trash');
    case 'project':
      return state.tasks.filter(t => t.projectId === itemId && t.status !== 'trash');
    case 'area':
      return state.tasks.filter(t => t.areaId === itemId && t.status !== 'trash');
    case 'tag':
      return state.tasks.filter(t => t.tags.includes(itemId || '') && t.status !== 'trash');
    default:
      return [];
  }
};
