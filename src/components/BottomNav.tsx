'use client';

import { Camera, Network, BookOpen, Sparkles, MessageSquare } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'camera', label: 'AR 스캔', icon: Camera },
    { id: 'graph', label: '나와의 관계도', icon: Network },
    { id: 'vault', label: '추억 창고', icon: BookOpen },
    { id: 'physiognomy', label: '관상 분석', icon: Sparkles },
    { id: 'chat', label: 'AI 대화', icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon size={19} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
