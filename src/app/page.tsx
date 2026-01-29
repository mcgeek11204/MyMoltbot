'use client';

import { Sidebar, MainContent, KeyboardShortcuts } from '@/components';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 防止 hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-950">
        <div className="w-[260px] bg-gradient-to-b from-slate-900 to-slate-800" />
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <KeyboardShortcuts />
      <Sidebar />
      <MainContent />
    </div>
  );
}
