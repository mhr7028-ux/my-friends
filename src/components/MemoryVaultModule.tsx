'use client';

import { Person, Memory } from '@/lib/types';
import { BookOpen, Plus, Calendar, MapPin, Heart, Mic, MicOff, Image as ImageIcon, Send, Sparkles, Phone, Tag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MemoryVaultModuleProps {
  people: Person[];
  memories: Memory[];
  selectedPersonId: string;
  onSelectPerson: (id: string) => void;
  onAddMemory: (memory: Memory) => void;
}

export default function MemoryVaultModule({
  people,
  memories,
  selectedPersonId,
  onSelectPerson,
  onAddMemory,
}: MemoryVaultModuleProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('전체');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newImage, setNewImage] = useState<string | null>(null);

  // Speech Recognition (Continuous STT) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || people[1];
  const personMemories = memories.filter((m) => m.personId === selectedPerson.id);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  // Continuous Speech STT Toggle
  const toggleSpeech = () => {
    if (!speechSupported) {
      alert('사용 중이신 브라우저에서 마이크 음성 인식을 사용할 수 없습니다.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNewContent(transcript);
      if (!newTitle) {
        setNewTitle(`${new Date().toLocaleDateString()} 음성 메모 기록`);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { setIsListening(false); }
      }
    };

    try { recognition.start(); } catch { setIsListening(false); }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const memory: Memory = {
      id: `mem-${Date.now()}`,
      personId: selectedPerson.id,
      date: new Date().toISOString().split('T')[0],
      title: newTitle.trim() || '추억 기록',
      content: newContent.trim(),
      image: newImage || undefined,
      location: '현장 미팅',
    };

    onAddMemory(memory);
    setNewTitle('');
    setNewContent('');
    setNewImage(null);
  };

  const groups = ['전체', '가족', '친척', '고교 동창', '교회 성도', '사업 파트너'];
  const filteredPeople = people.filter(
    (p) => !p.isUser && (selectedGroup === '전체' || p.group === selectedGroup)
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Directory Sidebar: People Directory */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-auto md:h-full shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" />
            <span>인맥 디렉토리</span>
          </h3>

          {/* Group Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  selectedGroup === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Person List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPeople.map((p) => {
            const isSelected = p.id === selectedPerson.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPerson(p.id)}
                className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-xs text-slate-900">{p.name}</p>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                      {p.group}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Section: Memory Vault Timeline */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        {/* Person Hero Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={selectedPerson.avatar}
              alt={selectedPerson.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{selectedPerson.name}</h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {selectedPerson.group}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">{selectedPerson.title}</p>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <Phone size={13} className="text-indigo-500" />
                <span>{selectedPerson.phone}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 sm:max-w-xs">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              <span>첫 만남: {selectedPerson.firstMeetingDate}</span>
            </p>
            <p className="text-slate-500 flex items-center gap-1">
              <MapPin size={13} className="text-rose-500" />
              <span>{selectedPerson.firstMeetingLocation}</span>
            </p>
            <p className="text-slate-700 text-[11px] leading-snug pt-1 italic">
              "{selectedPerson.firstMeetingContext}"
            </p>
          </div>
        </div>

        {/* Create New Memory Form (With 1-Sec Speech STT Button) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-600" />
              <span>새로운 추억 & 대화 메모 기록</span>
            </span>
            <span className="text-[11px] text-slate-400">음성(STT) 또는 텍스트 작성</span>
          </h4>

          <form onSubmit={handleCreateMemory} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="추억 제목 (예: 남한산성 백숙 미팅)"
                className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={toggleSpeech}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                }`}
                title="무중단 음성 말하기로 입력"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isListening ? '듣는 중...' : '음성 메모'}</span>
              </button>
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="상대방과 나눈 대화 내용, 약속, 인상 깊었던 일들을 자유롭게 기록해 보세요..."
              rows={2}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newContent.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={13} />
                <span>추억 카드 저장</span>
              </button>
            </div>
          </form>
        </div>

        {/* Memory Timeline Gallery */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            <span>[{selectedPerson.name}] 님과의 추억 타임라인 ({personMemories.length}건)</span>
          </h4>

          {personMemories.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              아직 등록된 추억 카드가 없습니다. 상단에서 첫 추억 메모를 남겨보세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all"
                >
                  {mem.image && (
                    <img
                      src={mem.image}
                      alt={mem.title}
                      className="w-full h-44 rounded-2xl object-cover border border-slate-100"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 text-sm">{mem.title}</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
                        {mem.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{mem.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
