'use client';

import { useStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Sun, Calendar, Layers, Moon, BookOpen, Trash2, 
  Folder, Hash, ChevronDown, ChevronRight, Plus, Menu, Search
} from 'lucide-react';
import { ViewType } from '@/types';
import { useState } from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  color?: string;
}

function NavItem({ icon, label, count, active, onClick, color }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
        active 
          ? 'bg-white/10 text-white' 
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={color || 'text-current'}>{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </motion.button>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}

function CollapsibleSection({ title, children, onAdd }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-3 mb-2">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-semibold text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors"
        >
          <motion.span
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.span>
          {title}
        </button>
        {onAdd && (
          <motion.button
            onClick={onAdd}
            className="p-1 text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={14} />
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { 
    currentView, 
    selectedItemId,
    sidebarCollapsed,
    tasks, 
    projects, 
    areas, 
    tags,
    setCurrentView,
    toggleSidebar,
    addProject,
    addArea,
    addTag,
  } = useStore();

  const inboxCount = tasks.filter(t => t.status === 'inbox' && !t.projectId).length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayCount = tasks.filter(t => 
    t.status === 'today' || 
    (t.scheduledDate && t.scheduledDate <= todayDate && t.status !== 'completed' && t.status !== 'trash')
  ).length;
  const upcomingCount = tasks.filter(t => t.scheduledDate && t.status !== 'completed' && t.status !== 'trash').length;

  const handleAddProject = () => {
    const id = addProject({ title: '新项目' });
    setCurrentView('project', id);
  };

  const handleAddArea = () => {
    const title = prompt('输入区域名称');
    if (title) {
      addArea(title);
    }
  };

  const handleAddTag = () => {
    const name = prompt('输入标签名称');
    if (name) {
      addTag(name);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: sidebarCollapsed ? 0 : 260,
        opacity: sidebarCollapsed ? 0 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden flex flex-col"
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-tight">
          <span className="text-blue-400">Molt</span>GTD
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        {/* 主要视图 */}
        <div className="space-y-1">
          <NavItem
            icon={<Inbox size={18} />}
            label="收件箱"
            count={inboxCount}
            active={currentView === 'inbox'}
            onClick={() => setCurrentView('inbox')}
            color="text-blue-400"
          />
          <NavItem
            icon={<Sun size={18} />}
            label="今天"
            count={todayCount}
            active={currentView === 'today'}
            onClick={() => setCurrentView('today')}
            color="text-yellow-400"
          />
          <NavItem
            icon={<Calendar size={18} />}
            label="计划"
            count={upcomingCount}
            active={currentView === 'upcoming'}
            onClick={() => setCurrentView('upcoming')}
            color="text-red-400"
          />
          <NavItem
            icon={<Layers size={18} />}
            label="随时"
            active={currentView === 'anytime'}
            onClick={() => setCurrentView('anytime')}
            color="text-cyan-400"
          />
          <NavItem
            icon={<Moon size={18} />}
            label="将来某天"
            active={currentView === 'someday'}
            onClick={() => setCurrentView('someday')}
            color="text-purple-400"
          />
        </div>

        {/* 项目 */}
        <CollapsibleSection title="项目" onAdd={handleAddProject}>
          {projects.filter(p => !p.completedAt).map(project => (
            <NavItem
              key={project.id}
              icon={<Folder size={18} />}
              label={project.title}
              count={tasks.filter(t => t.projectId === project.id && t.status !== 'completed' && t.status !== 'trash').length}
              active={currentView === 'project' && selectedItemId === project.id}
              onClick={() => setCurrentView('project', project.id)}
              color="text-green-400"
            />
          ))}
          {projects.filter(p => !p.completedAt).length === 0 && (
            <p className="text-xs text-white/30 px-3 py-2">暂无项目</p>
          )}
        </CollapsibleSection>

        {/* 区域 */}
        {areas.length > 0 && (
          <CollapsibleSection title="区域" onAdd={handleAddArea}>
            {areas.map(area => (
              <NavItem
                key={area.id}
                icon={<Hash size={18} />}
                label={area.title}
                active={currentView === 'area' && selectedItemId === area.id}
                onClick={() => setCurrentView('area', area.id)}
                color="text-orange-400"
              />
            ))}
          </CollapsibleSection>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <CollapsibleSection title="标签" onAdd={handleAddTag}>
            {tags.map(tag => (
              <NavItem
                key={tag.id}
                icon={<div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />}
                label={tag.name}
                count={tasks.filter(t => t.tags.includes(tag.id) && t.status !== 'completed' && t.status !== 'trash').length}
                active={currentView === 'tag' && selectedItemId === tag.id}
                onClick={() => setCurrentView('tag', tag.id)}
              />
            ))}
          </CollapsibleSection>
        )}

        {/* 归档 */}
        <div className="mt-8 pt-4 border-t border-white/10 space-y-1">
          <NavItem
            icon={<BookOpen size={18} />}
            label="日志"
            active={currentView === 'logbook'}
            onClick={() => setCurrentView('logbook')}
            color="text-emerald-400"
          />
          <NavItem
            icon={<Trash2 size={18} />}
            label="废纸篓"
            active={currentView === 'trash'}
            onClick={() => setCurrentView('trash')}
            color="text-gray-400"
          />
        </div>
      </div>
    </motion.aside>
  );
}
