'use client';

import { useState } from 'react';
import { Person, RelationshipEdge, Memory } from '@/lib/types';
import { INITIAL_PEOPLE, INITIAL_EDGES, INITIAL_MEMORIES } from '@/lib/mockData';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ARCameraModule from '@/components/ARCameraModule';
import RelationshipGraphModule from '@/components/RelationshipGraphModule';
import MemoryVaultModule from '@/components/MemoryVaultModule';
import PhysiognomyModule from '@/components/PhysiognomyModule';
import AISearchModule from '@/components/AISearchModule';
import { UserPlus } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('camera');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('person-1');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Application Data States
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [edges, setEdges] = useState<RelationshipEdge[]>(INITIAL_EDGES);
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);

  // Add Person Modal State
  const [showAddPersonModal, setShowAddPersonModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newGroup, setNewGroup] = useState<any>('사업 파트너');
  const [newMeetingContext, setNewMeetingContext] = useState<string>('');

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPersonId = `person-${Date.now()}`;
    const newPerson: Person = {
      id: newPersonId,
      name: newName.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      phone: newPhone.trim() || '010-0000-0000',
      title: newTitle.trim() || '지인 / 파트너',
      group: newGroup,
      firstMeetingDate: new Date().toISOString().split('T')[0],
      firstMeetingLocation: '강남 미팅 장소',
      firstMeetingContext: newMeetingContext.trim() || '새로운 첫 만남 기록',
      tags: [newGroup],
    };

    const newEdge: RelationshipEdge = {
      id: `edge-${Date.now()}`,
      sourceId: 'user-0',
      targetId: newPersonId,
      relationType: 'business',
      label: '지인 / 파트너',
    };

    setPeople((prev) => [...prev, newPerson]);
    setEdges((prev) => [...prev, newEdge]);
    setSelectedPersonId(newPersonId);

    setNewName('');
    setNewTitle('');
    setNewPhone('');
    setNewMeetingContext('');
    setShowAddPersonModal(false);
  };

  const handleAddEdge = (newEdge: RelationshipEdge) => {
    setEdges((prev) => [...prev, newEdge]);
  };

  const handleAddMemory = (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'camera':
        return (
          <ARCameraModule
            people={people}
            edges={edges}
            onSelectPerson={(id) => {
              setSelectedPersonId(id);
              setActiveTab('vault');
            }}
            onNavigateToGraph={(id) => {
              setSelectedPersonId(id);
              setActiveTab('graph');
            }}
          />
        );
      case 'graph':
        return (
          <RelationshipGraphModule
            people={people}
            edges={edges}
            onAddEdge={handleAddEdge}
            selectedPersonId={selectedPersonId}
            onSelectPerson={(id) => setSelectedPersonId(id)}
          />
        );
      case 'vault':
        return (
          <MemoryVaultModule
            people={people}
            memories={memories}
            selectedPersonId={selectedPersonId}
            onSelectPerson={(id) => setSelectedPersonId(id)}
            onAddMemory={handleAddMemory}
          />
        );
      case 'physiognomy':
        return (
          <PhysiognomyModule
            people={people}
            onSelectPerson={(id) => {
              setSelectedPersonId(id);
              setActiveTab('vault');
            }}
          />
        );
      case 'chat':
      default:
        return (
          <AISearchModule
            selectedModel={selectedModel}
            people={people}
            memories={memories}
            edges={edges}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans relative">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddPerson={() => setShowAddPersonModal(true)}
          onToggleMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Tab Viewport */}
        <main className="flex-1 overflow-hidden relative">{renderActiveTab()}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-600" />
                <span>새로운 인맥 프로필 추가</span>
              </h3>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">이름 *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">그룹 분류</label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white"
                  >
                    <option value="가족">가족</option>
                    <option value="친척">친척</option>
                    <option value="고교 동창">고교 동창</option>
                    <option value="대학 동문">대학 동문</option>
                    <option value="교회 성도">교회 성도</option>
                    <option value="사업 파트너">사업 파트너</option>
                    <option value="지인">지인</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">전화번호</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">직함 / 역할</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 메나테크 사업가 / 대표"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">첫 만남 계기 / 에피소드</label>
                <textarea
                  value={newMeetingContext}
                  onChange={(e) => setNewMeetingContext(e.target.value)}
                  placeholder="언제 어디서 만나게 되었는지 간단히 메모해 두세요..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  프로필 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
