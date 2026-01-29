'use client';

import { useStore, selectTasksByView } from '@/store';
import { TaskItem } from './TaskItem';
import { TaskDetail } from './TaskDetail';
import { QuickEntry } from './QuickEntry';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Inbox, Sun, Calendar, Layers, Moon, BookOpen, 
  Trash2, Folder, Hash, Tag, Menu, Search, MoreHorizontal
} from 'lucide-react';
import { ViewType } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';

const VIEW_CONFIG: Record<ViewType, { icon: React.ReactNode; title: string; color: string }> = {
  inbox: { icon: <Inbox size={24} />, title: '收件箱', color: 'text-blue-400' },
  today: { icon: <Sun size={24} />, title: '今天', color: 'text-yellow-400' },
  upcoming: { icon: <Calendar size={24} />, title: '计划', color: 'text-red-400' },
  anytime: { icon: <Layers size={24} />, title: '随时', color: 'text-cyan-400' },
  someday: { icon: <Moon size={24} />, title: '将来某天', color: 'text-purple-400' },
  logbook: { icon: <BookOpen size={24} />, title: '日志', color: 'text-emerald-400' },
  trash: { icon: <Trash2 size={24} />, title: '废纸篓', color: 'text-gray-400' },
  project: { icon: <Folder size={24} />, title: '项目', color: 'text-green-400' },
  area: { icon: <Hash size={24} />, title: '区域', color: 'text-orange-400' },
  tag: { icon: <Tag size={24} />, title: '标签', color: 'text-pink-400' },
};

export function MainContent() {
  const store = useStore();
  const { 
    currentView, 
    selectedItemId, 
    selectedTaskId, 
    sidebarCollapsed,
    projects,
    areas,
    tags,
    searchQuery,
    isQuickEntryOpen,
    addTask,
    reorderTasks,
    toggleSidebar,
    setSearchQuery,
    toggleQuickEntry,
    emptyTrash,
  } = store;

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 获取当前视图的任务
  let tasks = useMemo(() => selectTasksByView(store, currentView, selectedItemId), [store, currentView, selectedItemId]);

  // 搜索过滤
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.notes.toLowerCase().includes(query)
    );
  }

  // 排序
  tasks = [...tasks].sort((a, b) => a.order - b.order);

  // 获取视图标题
  const getViewTitle = () => {
    if (currentView === 'project' && selectedItemId) {
      const project = projects.find(p => p.id === selectedItemId);
      return project?.title || '项目';
    }
    if (currentView === 'area' && selectedItemId) {
      const area = areas.find(a => a.id === selectedItemId);
      return area?.title || '区域';
    }
    if (currentView === 'tag' && selectedItemId) {
      const tag = tags.find(t => t.id === selectedItemId);
      return tag?.name || '标签';
    }
    return VIEW_CONFIG[currentView]?.title || currentView;
  };

  const viewConfig = VIEW_CONFIG[currentView];
  const selectedTask = selectedTaskId ? store.tasks.find(t => t.id === selectedTaskId) : null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      
      const newOrder = [...tasks];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      
      reorderTasks(newOrder.map(t => t.id));
    }
  };

  const handleAddTask = () => {
    const defaultStatus = ['inbox', 'today', 'anytime', 'someday'].includes(currentView) 
      ? currentView as 'inbox' | 'today' | 'anytime' | 'someday'
      : 'inbox';
    
    addTask({
      title: '',
      status: defaultStatus,
      projectId: currentView === 'project' ? selectedItemId : null,
      areaId: currentView === 'area' ? selectedItemId : null,
      tags: currentView === 'tag' && selectedItemId ? [selectedItemId] : [],
    });
  };

  return (
    <div className="flex-1 flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            {sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={toggleSidebar}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </motion.button>
            )}
            <div className="flex items-center gap-3">
              <span className={viewConfig.color}>{viewConfig.icon}</span>
              <h1 className="text-2xl font-bold text-white">{getViewTitle()}</h1>
              <span className="text-sm text-white/40">{tasks.length} 项</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <motion.div 
              className={`relative flex items-center transition-all ${
                isSearchFocused ? 'w-64' : 'w-48'
              }`}
              animate={{ width: isSearchFocused ? 256 : 192 }}
            >
              <Search size={16} className="absolute left-3 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="搜索..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </motion.div>

            {currentView === 'trash' && tasks.length > 0 && (
              <motion.button
                onClick={emptyTrash}
                className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                清空废纸篓
              </motion.button>
            )}

            <motion.button
              onClick={handleAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              新任务
            </motion.button>
          </div>
        </header>

        {/* 任务列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-white/30"
            >
              <span className={`${viewConfig.color} opacity-30 mb-4`}>
                {viewConfig.icon}
              </span>
              <p className="text-lg">暂无任务</p>
              <p className="text-sm mt-1">点击"新任务"开始添加</p>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1 max-w-3xl mx-auto">
                  <AnimatePresence mode="popLayout">
                    {tasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        showProject={currentView !== 'project'}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* 任务详情面板 */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail task={selectedTask} />
        )}
      </AnimatePresence>

      {/* 快速添加 */}
      <AnimatePresence>
        {isQuickEntryOpen && <QuickEntry />}
      </AnimatePresence>
    </div>
  );
}
