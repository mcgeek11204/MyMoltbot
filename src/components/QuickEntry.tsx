'use client';

import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { X, Inbox, Sun, Calendar, Folder, Tag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '@/types';

export function QuickEntry() {
  const { 
    addTask, 
    toggleQuickEntry, 
    projects,
    tags: allTags,
    setSelectedTaskId,
    setCurrentView,
  } = useStore();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('inbox');
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const id = addTask({
      title: title.trim(),
      status,
      scheduledDate,
      projectId,
      tags: selectedTags,
    });

    setTitle('');
    toggleQuickEntry();
    setSelectedTaskId(id);
    
    // 根据状态导航到对应视图
    if (projectId) {
      setCurrentView('project', projectId);
    } else if (status === 'today') {
      setCurrentView('today');
    } else {
      setCurrentView('inbox');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      toggleQuickEntry();
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={toggleQuickEntry}
      />

      {/* 弹窗 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">快速添加</h3>
            <button
              onClick={toggleQuickEntry}
              className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 标题输入 */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="我要做..."
            className="w-full text-lg text-white bg-transparent border-none outline-none placeholder-white/30 mb-4"
          />

          {/* 快捷选项 */}
          <div className="flex flex-wrap gap-2">
            {/* 状态按钮 */}
            <button
              onClick={() => setStatus(status === 'inbox' ? 'today' : 'inbox')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                status === 'today' 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {status === 'today' ? <Sun size={14} /> : <Inbox size={14} />}
              {status === 'today' ? '今天' : '收件箱'}
            </button>

            {/* 日期按钮 */}
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setScheduledDate(scheduledDate ? null : today);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                scheduledDate 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Calendar size={14} />
              {scheduledDate || '日期'}
            </button>

            {/* 项目选择 */}
            {projects.filter(p => !p.completedAt).slice(0, 3).map(project => (
              <button
                key={project.id}
                onClick={() => setProjectId(projectId === project.id ? null : project.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  projectId === project.id
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <Folder size={14} />
                {project.title}
              </button>
            ))}

            {/* 标签选择 */}
            {allTags.slice(0, 3).map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTags(
                  selectedTags.includes(tag.id)
                    ? selectedTags.filter(t => t !== tag.id)
                    : [...selectedTags, tag.id]
                )}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-opacity-20' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                style={selectedTags.includes(tag.id) ? { 
                  backgroundColor: `${tag.color}20`, 
                  color: tag.color 
                } : undefined}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-white/5 border-t border-white/10">
          <button
            onClick={toggleQuickEntry}
            className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            添加任务
          </button>
        </div>
      </motion.div>
    </>
  );
}
