'use client';

import { Person, RelationshipPathResult } from '@/lib/types';
import { findRelationshipPath } from '@/lib/graphUtils';
import { Camera, RefreshCw, Upload, Image as ImageIcon, Sparkles, Network, Mic, Heart, Phone, Calendar, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ARCameraModuleProps {
  people: Person[];
  edges: any[];
  onSelectPerson: (personId: string) => void;
  onNavigateToGraph: (personId: string) => void;
}

export default function ARCameraModule({
  people,
  edges,
  onSelectPerson,
  onNavigateToGraph,
}: ARCameraModuleProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('person-1'); // Default to Kim Chul-soo
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || people[1];
  const user = people.find((p) => p.isUser) || people[0];

  // Calculate Degree of Separation Path (나와의 관계도)
  const pathResult: RelationshipPathResult | null = findRelationshipPath(
    user.id,
    selectedPerson.id,
    people,
    edges
  );

  // Enable Real Phone/PC Webcam Stream
  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setTimeout(() => setIsScanning(false), 1200);
    } catch (err) {
      console.warn('Camera access error fallback:', err);
      setCameraActive(true);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Image Upload Handler
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clipboard Paste Handler (Ctrl + V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setCustomImage(reader.result as string);
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 1000);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  return (
    <div
      tabIndex={0}
      onPaste={handlePaste}
      className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-900 text-white outline-none"
    >
      {/* Left Main Section: Camera Viewfinder & AR Overlay */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden select-none">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFile}
          accept="image/*"
          className="hidden"
        />

        {/* Video / Image Stream Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {customImage ? (
            <img src={customImage} alt="Scanned Person" className="w-full h-full object-cover" />
          ) : cameraActive ? (
            <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" playsInline muted />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={selectedPerson.avatar}
                alt={selectedPerson.name}
                className="w-full h-full object-cover filter brightness-90 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
          )}

          {/* AR Target Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            {/* Corner Markers */}
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 border-2 border-dashed border-sky-400/70 rounded-3xl flex items-center justify-center animate-radar">
              <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-xl" />
              <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-xl" />
              <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-xl" />
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-xl" />

              {/* Scanning status banner */}
              {isScanning && (
                <div className="px-4 py-2 bg-sky-500/90 text-white font-black text-xs rounded-full shadow-lg backdrop-blur-md animate-bounce flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>AI 비전 관상 & 족보 탐색 중...</span>
                </div>
              )}
            </div>
          </div>

          {/* AR HUD Glass Card Overlay (Top Right / Bottom Left) */}
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-96 glass-dark p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase">
                  AR HUD LENS V1.0
                </span>
              </div>
              <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full font-bold">
                {selectedPerson.group}
              </span>
            </div>

            {/* Main Person Identity */}
            <div className="flex items-center gap-3">
              <img
                src={selectedPerson.avatar}
                alt="Avatar"
                className="w-13 h-13 rounded-2xl object-cover border-2 border-sky-400 shadow-md shrink-0"
              />
              <div className="truncate">
                <h3 className="text-base font-extrabold text-white leading-tight flex items-center gap-2">
                  <span>{selectedPerson.name}</span>
                </h3>
                <p className="text-xs text-sky-200 font-medium truncate">{selectedPerson.title}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                  <Phone size={11} className="text-sky-400" />
                  <span>{selectedPerson.phone}</span>
                </p>
              </div>
            </div>

            {/* Degree of Separation HUD Highlight (나와의 관계도) */}
            {pathResult && (
              <div className="bg-indigo-950/80 p-2.5 rounded-xl border border-indigo-400/40 text-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-200 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    <Network size={13} className="text-indigo-400" />
                    나와의 관계도
                  </span>
                  <span className="bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded text-[10px]">
                    {pathResult.degrees > 0 ? `${pathResult.degrees}단계 연결` : '본인'}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-white leading-relaxed">
                  {pathResult.description}
                </p>
              </div>
            )}

            {/* Quick Action Bar inside HUD */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigateToGraph(selectedPerson.id)}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Network size={13} />
                <span>족보 맵 보기</span>
              </button>
              <button
                onClick={() => onSelectPerson(selectedPerson.id)}
                className="py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Heart size={13} />
                <span>추억 소환</span>
              </button>
            </div>
          </div>

          {/* Camera Viewfinder Bottom Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-10 bg-slate-900/80 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Camera size={16} />
                <span>폰 카메라 켜기</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Camera size={16} />
                <span>카메라 끄기</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
              title="사진 업로드 (또는 Ctrl+V 붙여넣기)"
            >
              <Upload size={14} />
              <span>사진 업로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Panel: Physiognomy & Icebreaker Digest */}
      <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-auto md:h-full p-5 overflow-y-auto space-y-5">
        {/* Sample Person Selection Tabs */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            인식할 사람 선택 (스캔 시뮬레이션)
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {people
              .filter((p) => !p.isUser)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonId(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedPersonId === p.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{p.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Physiognomy Analysis Card */}
        {selectedPerson.physiognomy ? (
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400">
              <Sparkles size={16} />
              <span>관상(Physiognomy) AI 분석 결과</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{selectedPerson.physiognomy.summary}"
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                <span className="font-bold text-slate-400">이마 (관록운):</span>
                <span className="text-slate-200 text-right">{selectedPerson.physiognomy.forehead}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                <span className="font-bold text-slate-400">눈 (심성/재물):</span>
                <span className="text-slate-200 text-right">{selectedPerson.physiognomy.eyes}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                <span className="font-bold text-slate-400">코 (건강/자존감):</span>
                <span className="text-slate-200 text-right">{selectedPerson.physiognomy.nose}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg">
                <span className="font-bold text-slate-400">입 (인복/말년):</span>
                <span className="text-slate-200 text-right">{selectedPerson.physiognomy.mouth}</span>
              </div>
            </div>

            {/* Recommended Icebreaker Topics */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-sky-400 mb-1.5">💬 추천 아이스브레이킹 대화 주제</p>
              <ul className="space-y-1.5">
                {selectedPerson.physiognomy.icebreakerTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-sky-950/50 p-2.5 rounded-xl border border-sky-800/40 flex items-start gap-2">
                    <span className="text-sky-400 font-bold shrink-0">Point {idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 p-4 rounded-2xl text-center text-xs text-slate-400">
            관상 데이터가 없습니다. 사진을 업로드해 관상을 분석해 보세요!
          </div>
        )}

        {/* First Meeting Memory Digest */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Calendar size={15} />
            <span>첫 만남 기록</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="flex items-center gap-1 text-slate-400">
              <MapPin size={13} className="text-rose-400" />
              <span>{selectedPerson.firstMeetingLocation} ({selectedPerson.firstMeetingDate})</span>
            </p>
            <p className="text-slate-200 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl">
              "{selectedPerson.firstMeetingContext}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
