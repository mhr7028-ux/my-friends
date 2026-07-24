'use client';

import { Person, RelationshipEdge, RelationshipPathResult } from '@/lib/types';
import { findRelationshipPath } from '@/lib/graphUtils';
import { Network, UserCheck, Plus, Sparkles, ArrowRight, ShieldCheck, Heart, User, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface RelationshipGraphModuleProps {
  people: Person[];
  edges: RelationshipEdge[];
  onAddEdge: (newEdge: RelationshipEdge) => void;
  selectedPersonId?: string;
  onSelectPerson: (personId: string) => void;
}

export default function RelationshipGraphModule({
  people,
  edges,
  onAddEdge,
  selectedPersonId = 'person-1',
  onSelectPerson,
}: RelationshipGraphModuleProps) {
  const [currentTargetId, setCurrentTargetId] = useState<string>(selectedPersonId);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Edge Form State
  const [sourceId, setSourceId] = useState<string>('user-0');
  const [targetId, setTargetId] = useState<string>('person-1');
  const [relationType, setRelationType] = useState<any>('introducer');
  const [label, setLabel] = useState<string>('소개자');

  const user = people.find((p) => p.isUser) || people[0];
  const currentTarget = people.find((p) => p.id === currentTargetId) || people[1];

  // Calculate Shortest Path from User ("나") to currentTarget
  const pathResult: RelationshipPathResult | null = findRelationshipPath(
    user.id,
    currentTarget.id,
    people,
    edges
  );

  const handleCreateEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId === targetId) {
      alert('동일한 사람을 연결할 수 없습니다.');
      return;
    }
    const newEdge: RelationshipEdge = {
      id: `edge-${Date.now()}`,
      sourceId,
      targetId,
      relationType,
      label,
    };
    onAddEdge(newEdge);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Section: Interactive Relationship Visual Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
              <Network size={16} />
              <span>나와의 관계도 & 족보 지형도 (Relationship Tracer)</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              나에서 시작하는 인맥 고리 & 촌수 탐색
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              사람을 선택하면 나(User)로부터 연결되는 최단 경로와 촌수를 AI가 즉시 시각화해 줍니다.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>새 인맥 고리 연결</span>
          </button>
        </div>

        {/* Person Selector Horizontal Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
            🎯 나와의 관계도를 탐색할 인물 선택:
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {people
              .filter((p) => !p.isUser)
              .map((p) => {
                const isSelected = p.id === currentTargetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentTargetId(p.id);
                      onSelectPerson(p.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{p.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {p.group}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Degree Tracer Highlight Card */}
        {pathResult && (
          <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                  {pathResult.degrees >= 0 ? `${pathResult.degrees}단계` : '미연결'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    [{user.name}] ➔ [{currentTarget.name}] 나와의 관계 고리
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {pathResult.degrees >= 0 ? `총 ${pathResult.degrees}단계를 거쳐 친밀하게 연결되어 있습니다.` : '아직 연결 고리가 없습니다.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectPerson(currentTarget.id)}
                className="px-3.5 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Heart size={14} />
                <span>추억 소환</span>
              </button>
            </div>

            {/* Visual Node Path Stream */}
            {pathResult.path.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  🔗 단계별 인맥 연결 다리 (Step-by-Step Path):
                </p>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 overflow-x-auto">
                  {pathResult.path.map((step, idx) => (
                    <div key={step.person.id} className="flex flex-col md:flex-row items-center gap-3 shrink-0">
                      {/* Node Card */}
                      <div
                        onClick={() => onSelectPerson(step.person.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          step.person.isUser
                            ? 'bg-gradient-to-br from-indigo-500 to-sky-500 text-white border-indigo-400 shadow-md'
                            : step.person.id === currentTarget.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-100'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <img
                          src={step.person.avatar}
                          alt={step.person.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/40 shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-xs leading-tight">{step.person.name}</p>
                          <p className={`text-[10px] ${step.person.isUser || step.person.id === currentTarget.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {step.person.title}
                          </p>
                        </div>
                      </div>

                      {/* Arrow / Connection Edge Indicator */}
                      {idx < pathResult.path.length - 1 && (
                        <div className="flex flex-col items-center justify-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80 text-[11px] font-bold shrink-0">
                          <span className="text-[10px] text-indigo-500 font-semibold">
                            {pathResult.path[idx + 1]?.edgeToNext?.label || '연결'}
                          </span>
                          <ArrowRight size={14} className="text-indigo-600 hidden md:block" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary Speech Bubble */}
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-4 rounded-2xl border border-sky-200 text-xs leading-relaxed text-slate-800 flex items-start gap-3">
              <Sparkles size={20} className="text-sky-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-900 mb-1">💡 AI 나와의 관계 브리핑 & 아이스브레이킹 대화 팁</p>
                <p className="text-slate-700">{pathResult.description}</p>
                {pathResult.commonFriends.length > 0 && (
                  <p className="mt-2 text-indigo-700 font-bold text-[11px]">
                    🤝 공통 아는 사람: {pathResult.commonFriends.map((f) => f.name).join(', ')} 님
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: All Network Edges List */}
      <div className="w-full md:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto space-y-4">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
          <span>전체 인맥 & 족보 리스트</span>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
            {edges.length}개 관계
          </span>
        </h4>

        <div className="space-y-2.5">
          {edges.map((edge) => {
            const src = people.find((p) => p.id === edge.sourceId);
            const tgt = people.find((p) => p.id === edge.targetId);
            if (!src || !tgt) return null;
            return (
              <div
                key={edge.id}
                className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded text-[10px]">
                    {edge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="truncate">{src.name}</span>
                  <span className="text-slate-400">↔</span>
                  <span className="truncate">{tgt.name}</span>
                </div>
                {edge.notes && (
                  <p className="text-[11px] text-slate-500 leading-snug">{edge.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Adding New Relationship Edge */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Network size={18} className="text-indigo-600" />
                <span>새로운 인맥 관계 추가</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEdge} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">인물 A (출발):</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white"
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">인물 B (대상):</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 bg-white"
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">관계 호칭 / 라벨:</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="예: 사촌 동생, 첫 만남 소개자, 부부, 고교 동창"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  연결 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
