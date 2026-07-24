'use client';

import { Person } from '@/lib/types';
import { Sparkles, RefreshCw, Upload, Heart, ShieldCheck, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { useState, useRef } from 'react';

interface PhysiognomyModuleProps {
  people: Person[];
  onSelectPerson: (id: string) => void;
}

export default function PhysiognomyModule({ people, onSelectPerson }: PhysiognomyModuleProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('person-1');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || people[1];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomPhoto(reader.result as string);
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* Hidden File Input */}
      <input type="file" ref={fileRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />

      {/* Left Section: Face Image & Scanner Reticle */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-white relative">
        <div className="relative w-80 h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/60">
          <img
            src={customPhoto || selectedPerson.avatar}
            alt={selectedPerson.name}
            className="w-full h-full object-cover filter brightness-95"
          />

          {/* Radar Scanning Line Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-transparent to-amber-500/20 animate-radar" />

          {/* Scanner Tags */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs flex items-center justify-between">
            <span className="font-bold text-amber-300">{selectedPerson.name} 님 관상 스캔 완료</span>
            <span className="bg-amber-500/30 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
              AI 관상 비전
            </span>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-6 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Upload size={16} />
          <span>새 얼굴 사진 업로드 관상 분석</span>
        </button>
      </div>

      {/* Right Section: Physiognomy Details & Icebreaker Conversation Guide */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6">
        {/* Person Selector */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            인맥 선택 관상 결과 보기:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {people
              .filter((p) => !p.isUser)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPersonId(p.id);
                    setCustomPhoto(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedPersonId === p.id && !customPhoto
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
          </div>
        </div>

        {/* Analysis Card */}
        {selectedPerson.physiognomy ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-sm font-black text-amber-600 border-b border-slate-100 pb-3">
              <Sparkles size={18} />
              <span>[{selectedPerson.name}] 님의 인상 & 관상 종합 총평</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 font-medium">
              "{selectedPerson.physiognomy.summary}"
            </p>

            {/* Feature Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-amber-700 block mb-1">👑 이마 (관록/리더십)</span>
                <p className="text-slate-600 text-[11px]">{selectedPerson.physiognomy.forehead}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-amber-700 block mb-1">👁️ 눈 (재물/심성)</span>
                <p className="text-slate-600 text-[11px]">{selectedPerson.physiognomy.eyes}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-amber-700 block mb-1">👃 코 (자존감/건강)</span>
                <p className="text-slate-600 text-[11px]">{selectedPerson.physiognomy.nose}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-amber-700 block mb-1">👄 입 (인복/말년)</span>
                <p className="text-slate-600 text-[11px]">{selectedPerson.physiognomy.mouth}</p>
              </div>
            </div>

            {/* Icebreaker Recommendations */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>추천 대화 시작 (아이스브레이킹) 질문 팁</span>
              </p>
              <div className="space-y-2">
                {selectedPerson.physiognomy.icebreakerTips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                    💬 {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            관상 데이터가 없습니다. 사진을 업로드하여 분석해 보세요!
          </div>
        )}
      </div>
    </div>
  );
}
