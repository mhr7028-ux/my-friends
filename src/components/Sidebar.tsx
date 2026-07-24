'use client';

import { Camera, Network, BookOpen, Sparkles, MessageSquare, BrainCircuit, Mic, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
}: SidebarProps) {
  const sessionRes = useSession();
  const session = sessionRes?.data;

  const navItems = [
    { id: 'camera', label: 'AR 카메라 & 관상 비서', icon: Camera, badge: 'AR HUD' },
    { id: 'graph', label: '나와의 관계도 & 족보', icon: Network, badge: '촌수 Tracer' },
    { id: 'vault', label: '인맥 & 추억 창고', icon: BookOpen, badge: 'Memory' },
    { id: 'physiognomy', label: '관상 아이스브레이킹', icon: Sparkles },
    { id: 'chat', label: 'AI 추억 소환 대화', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-20">
      {/* App Branding */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-md">
          F
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
            My Friends
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">
              v1.0
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">인맥 & 추억 & 족보 AR 비서</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-3.5 flex-1 overflow-y-auto space-y-6">
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-2 px-2 uppercase tracking-wider">
            핵심 기능 모듈
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Model Selector */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <BrainCircuit size={15} className="text-indigo-500" />
            <span>AI 두뇌 엔진 선택</span>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="gpt-4o">OpenAI (GPT-4o Vision)</option>
            <option value="gemini-1.5-pro">Google (Gemini 1.5 Pro)</option>
            <option value="claude-3-5-sonnet">Anthropic (Claude 3.5)</option>
            <option value="ollama-qwen2.5:0.5b">Ollama (🟢 로컬 Qwen 2.5)</option>
            <option value="ollama-qwen3.6">Ollama (무료 Qwen 3.6)</option>
            <option value="ollama-gemma4:12b">Ollama (무료 Gemma4 12B)</option>
          </select>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            💡 이미지 분석 & 관상은 <span className="font-semibold text-slate-600">GPT-4o / Gemini</span>, 일반 대화 메모는 <span className="font-semibold text-slate-600">Ollama</span>를 추천합니다.
          </p>
        </div>
      </div>

      {/* Footer: STT Status Badge + Google Profile */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        <div className="w-full py-2 px-3 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-center justify-center gap-2 text-indigo-700 font-bold text-[11px]">
          <Mic size={14} className="text-indigo-500 animate-pulse shrink-0" />
          <span>무중단 음성(STT) 연동됨</span>
        </div>

        {session?.user ? (
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 truncate">
              {session.user.image ? (
                <img src={session.user.image} alt="User" className="w-7 h-7 rounded-full border border-indigo-300 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {session.user.name?.[0] || '유저'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{session.user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="로그아웃"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google-demo', { redirect: false })}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <LogIn size={15} />
            <span>Google 계정으로 로그인</span>
          </button>
        )}
      </div>
    </aside>
  );
}
