'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store';

export function KeyboardShortcuts() {
  const {
    toggleQuickEntry,
    toggleSidebar,
    setCurrentView,
    selectedTaskId,
    setSelectedTaskId,
    completeTask,
    moveTaskToTrash,
    tasks,
    currentView,
    selectedItemId,
  } = useStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 忽略在输入框中的快捷键
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      // 只处理 Escape
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
      }
      return;
    }

    // Cmd/Ctrl + N: 快速添加
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      toggleQuickEntry();
      return;
    }

    // Cmd/Ctrl + B: 切换侧边栏
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
      return;
    }

    // 数字键快速导航
    if (e.key === '1') {
      setCurrentView('inbox');
    } else if (e.key === '2') {
      setCurrentView('today');
    } else if (e.key === '3') {
      setCurrentView('upcoming');
    } else if (e.key === '4') {
      setCurrentView('anytime');
    } else if (e.key === '5') {
      setCurrentView('someday');
    }

    // 任务操作
    if (selectedTaskId) {
      if (e.key === 'Enter') {
        e.preventDefault();
        completeTask(selectedTaskId);
        setSelectedTaskId(null);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        moveTaskToTrash(selectedTaskId);
        setSelectedTaskId(null);
      } else if (e.key === 'Escape') {
        setSelectedTaskId(null);
      }
    }

    // 上下键选择任务
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const visibleTasks = tasks.filter(t => {
        if (currentView === 'inbox') return t.status === 'inbox' && !t.projectId;
        if (currentView === 'today') return t.status === 'today';
        if (currentView === 'project') return t.projectId === selectedItemId;
        return t.status === currentView;
      });

      if (visibleTasks.length === 0) return;

      const currentIndex = selectedTaskId 
        ? visibleTasks.findIndex(t => t.id === selectedTaskId)
        : -1;

      let newIndex;
      if (e.key === 'ArrowDown') {
        newIndex = currentIndex < visibleTasks.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : visibleTasks.length - 1;
      }

      setSelectedTaskId(visibleTasks[newIndex].id);
    }
  }, [
    toggleQuickEntry,
    toggleSidebar,
    setCurrentView,
    selectedTaskId,
    setSelectedTaskId,
    completeTask,
    moveTaskToTrash,
    tasks,
    currentView,
    selectedItemId,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
