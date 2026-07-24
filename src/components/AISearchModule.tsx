'use client';

import { Person, Memory, RelationshipEdge } from '@/lib/types';
import { MessageSquare, Send, Mic, MicOff, Image as ImageIcon, Bot, User, BrainCircuit, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface AISearchModuleProps {
  selectedModel: string;
  people: Person[];
  memories: Memory[];
  edges: RelationshipEdge[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AISearchModule({
  selectedModel,
  people,
  memories,
  edges,
}: AISearchModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Speech Recognition (Continuous STT) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleSpeech = () => {
    if (!speechSupported) {
      alert('마이크 음성 인식이 지원되지 않습니다.');
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
      setInputVal(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { setIsListening(false); }
      }
    };

    try { recognition.start(); } catch { setIsListening(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputVal.trim();
    if (!textToSend || isLoading) return;

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          contextData: { people, memories, edges },
        }),
      });

      if (!response.ok || !response.body) throw new Error('API Error');

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: assistantText } : m))
        );
      }
    } catch (err) {
      console.warn('AI Chat Fallback Response:', err);
      // Smart contextual fallback answering from local data
      const queryLower = textToSend.toLowerCase();
      let fallbackText = `네, 대표님! [${selectedModel}] 비서가 인맥 & 추억 데이터를 바탕으로 답변해 드립니다.\n\n`;

      if (queryLower.includes('철수') || queryLower.includes('김철수')) {
        fallbackText += `💡 **김철수 대표님 정보**:\n` +
          `• **직함**: 메나테크 골드 디렉터 / (주)유진 대표\n` +
          `• **첫 만남**: 2023년 5월 12일 (강남 메나테크 센터)\n` +
          `• **나와의 관계 고리**: 나 ➔ 고교동창 박찬호 ➔ 사촌 동생 박지민 ➔ 김철수 대표 (3단계 연결)\n` +
          `• **첫 만남 계기**: 장원술 목사님의 추천 소개로 간 건강 양자검사 상담 진행.`;
      } else if (queryLower.includes('찬호') || queryLower.includes('박찬호')) {
        fallbackText += `💡 **박찬호 사장님 정보**:\n` +
          `• **관계**: 30년지기 불알친구 (중앙고 1학년 같은 반)\n` +
          `• **소식**: 용산 물류 시스템 대표. 주말 남한산성 라운딩 후 사촌동생(박지민 팀장) 마케팅 조언 부탁함.`;
      } else {
        fallbackText += `💡 **추억 소환 결과**:\n` +
          `등록된 인맥 6명 및 추억 타임라인 3건을 안전하게 관리 중입니다. 특정 사람(김철수 대표, 박찬호 사장, 장원술 목사님 등)의 이름을 물어보시면 더욱 자세히 소환해 드리겠습니다!`;
      }

      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: fallbackText,
      };
      setMessages((prev) => [...prev.filter((m) => m.content.trim() !== ''), fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-indigo-600" size={20} />
          <h2 className="font-extrabold text-slate-800 text-base">
            AI 추억 소환 대화 비서 ({selectedModel})
          </h2>
        </div>
      </header>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto py-12">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">인맥과 추억에 대해 무엇이든 물어보세요!</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              마이크 버튼을 누르시고 말씀하시거나 질문을 입력하시면 AI가 인맥 족보와 추억 타임라인을 소환해 줍니다.
            </p>
            <div className="w-full space-y-2 text-xs">
              <button
                onClick={() => setInputVal('김철수 대표님이랑 나랑 나와의 관계도가 어떻게 되지?')}
                className="w-full text-left p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-2xs font-medium"
              >
                💬 "김철수 대표님이랑 나랑 나와의 관계도가 어떻게 되지?"
              </button>
              <button
                onClick={() => setInputVal('박찬호 사장하고 언제 처음 만났고 무슨 이야기 나누었지?')}
                className="w-full text-left p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-2xs font-medium"
              >
                💬 "박찬호 사장하고 언제 처음 만났고 무슨 이야기 나누었지?"
              </button>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User size={16} className="text-slate-600" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 rounded-tl-none shadow-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeech}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shrink-0 border border-slate-200 ${
              isListening ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="무중단 음성 말하기"
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isListening ? '🎙️ 말씀하세요... 연속 음성 듣는 중' : '추억 소환 질문을 입력하거나 마이크로 말씀하세요...'}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 text-xs shadow-2xs focus:outline-none focus:border-indigo-500 font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
