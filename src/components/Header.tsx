'use client';

import { Search, UserPlus, Sparkles, Camera, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddPerson: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenAddPerson,
}: HeaderProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'camera':
        return '📷 스마트 AR 카메라 & 관상 비서';
      case 'graph':
        return '🌳 나와의 관계도 & 족보 Tracer';
      case 'vault':
        return '📖 인맥 & 추억 소환 창고';
      case 'physiognomy':
        return '🔮 관상 아이스브레이킹 AI';
      case 'chat':
        return '💬 AI 추억 소환 대화';
      default:
        return 'My Friends';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <span>{getTabTitle()}</span>
        </h2>
        <div className="hidden md:flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>보안 메모리 연동됨</span>
        </div>
      </div>

      {/* Quick Actions & Search */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 관계, 지인 검색..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {/* Quick AR Camera Button */}
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
            activeTab === 'camera'
              ? 'bg-indigo-600 text-white shadow-indigo-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Camera size={14} />
          <span>AR 스캔</span>
        </button>

        {/* Add Person Modal Button */}
        <button
          onClick={onOpenAddPerson}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">새 인맥 등록</span>
        </button>
      </div>
    </header>
  );
}
