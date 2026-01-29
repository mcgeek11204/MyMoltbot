'use client';

import { Task, TaskStatus } from '@/types';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { 
  X, Calendar, Sun, Moon, Layers, Inbox, Trash2, Tag, Folder,
  Plus, Flag, Repeat, CheckSquare, Square, GripVertical
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';

interface TaskDetailProps {
  task: Task;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'inbox', label: '收件箱', icon: <Inbox size={16} />, color: 'text-blue-400' },
  { value: 'today', label: '今天', icon: <Sun size={16} />, color: 'text-yellow-400' },
  { value: 'anytime', label: '随时', icon: <Layers size={16} />, color: 'text-cyan-400' },
  { value: 'someday', label: '将来某天', icon: <Moon size={16} />, color: 'text-purple-400' },
];

export function TaskDetail({ task }: TaskDetailProps) {
  const {
    updateTask,
    deleteTask,
    moveTaskToTrash,
    setSelectedTaskId,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
    projects,
    tags: allTags,
  } = useStore();

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes);
  }, [task.id, task.title, task.notes]);

  useEffect(() => {
    if (!task.title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [task.id]);

  const handleTitleBlur = () => {
    if (title !== task.title) {
      updateTask(task.id, { title });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== task.notes) {
      updateTask(task.id, { notes });
    }
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      addChecklistItem(task.id, newChecklistItem.trim());
      setNewChecklistItem('');
    }
  };

  const handleDateChange = (date: string | null) => {
    updateTask(task.id, { scheduledDate: date });
    setShowDatePicker(false);
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
    setShowStatusMenu(false);
  };

  const handleProjectChange = (projectId: string | null) => {
    updateTask(task.id, { projectId });
    setShowProjectMenu(false);
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = task.tags.includes(tagId)
      ? task.tags.filter(t => t !== tagId)
      : [...task.tags, tagId];
    updateTask(task.id, { tags: newTags });
  };

  const handleDelete = () => {
    if (task.status === 'trash') {
      deleteTask(task.id);
    } else {
      moveTaskToTrash(task.id);
    }
    setSelectedTaskId(null);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[0];
  const currentProject = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const taskTags = allTags.filter(t => task.tags.includes(t.id));

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-96 h-screen bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden"
    >
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/60">任务详情</h3>
        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleDelete}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} />
          </motion.button>
          <motion.button
            onClick={() => setSelectedTaskId(null)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 标题 */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="任务名称..."
          className="w-full text-lg font-semibold text-white bg-transparent border-none outline-none placeholder-white/30"
        />

        {/* 备注 */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="添加备注..."
          rows={3}
          className="w-full text-sm text-white/70 bg-white/5 rounded-lg p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none placeholder-white/30"
        />

        {/* 操作按钮 */}
        <div className="space-y-2">
          {/* 状态 */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className={currentStatus.color}>{currentStatus.icon}</span>
              <span className="text-sm text-white/80">{currentStatus.label}</span>
            </button>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-white/10 shadow-xl z-10 overflow-hidden"
              >
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors ${
                      task.status === option.value ? 'bg-white/5' : ''
                    }`}
                  >
                    <span className={option.color}>{option.icon}</span>
                    <span className="text-sm text-white/80">{option.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* 日期 */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Calendar size={16} className="text-red-400" />
              <span className="text-sm text-white/80">
                {task.scheduledDate 
                  ? format(parseISO(task.scheduledDate), 'yyyy年M月d日', { locale: zhCN })
                  : '添加日期'
                }
              </span>
              {task.scheduledDate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateChange(null);
                  }}
                  className="ml-auto p-1 text-white/40 hover:text-white/80"
                >
                  <X size={14} />
                </button>
              )}
            </button>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-white/10 shadow-xl z-10 p-3"
              >
                <input
                  type="date"
                  value={task.scheduledDate || ''}
                  onChange={(e) => handleDateChange(e.target.value || null)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                    className="flex-1 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                  >
                    今天
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      handleDateChange(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    明天
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* 项目 */}
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Folder size={16} className="text-green-400" />
              <span className="text-sm text-white/80">
                {currentProject?.title || '添加到项目'}
              </span>
              {currentProject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectChange(null);
                  }}
                  className="ml-auto p-1 text-white/40 hover:text-white/80"
                >
                  <X size={14} />
                </button>
              )}
            </button>
            {showProjectMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto"
              >
                {projects.filter(p => !p.completedAt).map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectChange(project.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors ${
                      task.projectId === project.id ? 'bg-white/5' : ''
                    }`}
                  >
                    <Folder size={14} className="text-green-400" />
                    <span className="text-sm text-white/80">{project.title}</span>
                  </button>
                ))}
                {projects.length === 0 && (
                  <p className="px-3 py-2 text-sm text-white/40">暂无项目</p>
                )}
              </motion.div>
            )}
          </div>

          {/* 标签 */}
          <div className="relative">
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Tag size={16} className="text-pink-400" />
              <span className="text-sm text-white/80">
                {taskTags.length > 0 ? taskTags.map(t => t.name).join(', ') : '添加标签'}
              </span>
            </button>
            {showTagMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto"
              >
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-white/80">{tag.name}</span>
                    {task.tags.includes(tag.id) && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </button>
                ))}
                {allTags.length === 0 && (
                  <p className="px-3 py-2 text-sm text-white/40">暂无标签</p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 子任务清单 */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            清单
          </h4>
          <div className="space-y-1">
            {task.checklist.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 group"
              >
                <button
                  onClick={() => toggleChecklistItem(task.id, item.id)}
                  className={`flex-shrink-0 ${item.completed ? 'text-green-400' : 'text-white/30 hover:text-white/60'}`}
                >
                  {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateChecklistItem(task.id, item.id, { title: e.target.value })}
                  className={`flex-1 text-sm bg-transparent border-none outline-none ${
                    item.completed ? 'text-white/40 line-through' : 'text-white/80'
                  }`}
                />
                <button
                  onClick={() => deleteChecklistItem(task.id, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-white/30" />
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                placeholder="添加子任务..."
                className="flex-1 text-sm bg-transparent border-none outline-none text-white/80 placeholder-white/30"
              />
            </div>
          </div>
        </div>

        {/* 元信息 */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/30">
            创建于 {format(parseISO(task.createdAt), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
          </p>
          {task.completedAt && (
            <p className="text-xs text-white/30 mt-1">
              完成于 {format(parseISO(task.completedAt), 'yyyy年M月d日 HH:mm', { locale: zhCN })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
