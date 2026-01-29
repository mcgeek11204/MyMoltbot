'use client';

import { Task } from '@/types';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, CheckCircle2, Calendar, Tag, Flag, ChevronRight, 
  Sun, Moon, Inbox, Layers, GripVertical
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export function TaskItem({ task, showProject = true }: TaskItemProps) {
  const { 
    completeTask, 
    uncompleteTask, 
    setSelectedTaskId, 
    selectedTaskId,
    projects,
    tags: allTags
  } = useStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = task.status === 'completed';
  const isSelected = selectedTaskId === task.id;
  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const taskTags = allTags.filter(t => task.tags.includes(t.id));

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const formatScheduledDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '今天';
    if (isTomorrow(date)) return '明天';
    return format(date, 'M月d日', { locale: zhCN });
  };

  const getDateColor = () => {
    if (!task.scheduledDate) return 'text-white/40';
    const date = parseISO(task.scheduledDate);
    if (isPast(date) && !isToday(date)) return 'text-red-400';
    if (isToday(date)) return 'text-yellow-400';
    return 'text-white/40';
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'today': return <Sun size={12} className="text-yellow-400" />;
      case 'someday': return <Moon size={12} className="text-purple-400" />;
      case 'anytime': return <Layers size={12} className="text-cyan-400" />;
      default: return null;
    }
  };

  const checklistProgress = task.checklist.length > 0 
    ? `${task.checklist.filter(c => c.completed).length}/${task.checklist.length}`
    : null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected 
          ? 'bg-white/10 ring-1 ring-blue-500/50' 
          : 'hover:bg-white/5'
      } ${isDragging ? 'shadow-2xl z-50' : ''}`}
      onClick={() => setSelectedTaskId(task.id)}
    >
      {/* 拖拽手柄 */}
      <div 
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50 mt-0.5"
      >
        <GripVertical size={16} />
      </div>

      {/* 完成按钮 */}
      <motion.button
        onClick={handleToggle}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          isCompleted ? 'text-green-400' : 'text-white/30 hover:text-white/60'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCompleted ? (
          <CheckCircle2 size={20} />
        ) : (
          <Circle size={20} />
        )}
      </motion.button>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            isCompleted ? 'text-white/40 line-through' : 'text-white'
          }`}>
            {task.title || '无标题'}
          </span>
          {getStatusIcon()}
        </div>

        {/* 元信息 */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* 日期 */}
          {task.scheduledDate && (
            <span className={`flex items-center gap-1 text-xs ${getDateColor()}`}>
              <Calendar size={12} />
              {formatScheduledDate(task.scheduledDate)}
            </span>
          )}

          {/* 项目 */}
          {showProject && project && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <ChevronRight size={12} />
              {project.title}
            </span>
          )}

          {/* 标签 */}
          {taskTags.map(tag => (
            <span 
              key={tag.id}
              className="flex items-center gap-1 text-xs"
              style={{ color: tag.color }}
            >
              <Tag size={10} />
              {tag.name}
            </span>
          ))}

          {/* 子任务进度 */}
          {checklistProgress && (
            <span className="text-xs text-white/40">
              ✓ {checklistProgress}
            </span>
          )}

          {/* 截止日期 */}
          {task.deadline && (
            <span className="flex items-center gap-1 text-xs text-orange-400">
              <Flag size={10} />
              {format(parseISO(task.deadline), 'M/d')}
            </span>
          )}
        </div>

        {/* 备注预览 */}
        {task.notes && !isSelected && (
          <p className="text-xs text-white/30 mt-1 truncate">{task.notes}</p>
        )}
      </div>
    </motion.div>
  );
}
