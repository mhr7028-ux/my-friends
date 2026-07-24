import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const systemPrompt = `당신은 'My Friends (마이 프렌즈)' 지능형 인맥 & 추억 & 족보 관리 비서입니다.
나이가 들면서 희미해질 수 있는 사람들의 이름, 첫 만남의 추억, 일가친척 족보, 나와의 관계 고리를 선명하게 지켜주고 소환해 주는 역할을 합니다.
친절하고 품격 있는 어조로 답변하며, 필요 시 관상 기반의 유쾌한 아이스브레이킹 대화 팁과 관계도를 브리핑해주세요.`;

export async function POST(req: Request) {
  try {
    const { messages, model, contextData } = await req.json();

    // 1. Local Ollama Handling (Probes 127.0.0.1 and localhost)
    if (model?.startsWith('ollama-') || model === 'llama3') {
      let targetModel = model.startsWith('ollama-') ? model.replace('ollama-', '') : 'qwen2.5:0.5b';

      const endpoints = ['http://127.0.0.1:11434', 'http://localhost:11434'];
      let activeBaseUrl: string | null = null;

      for (const base of endpoints) {
        try {
          const tagsRes = await fetch(`${base}/api/tags`);
          if (tagsRes.ok) {
            activeBaseUrl = base;
            break;
          }
        } catch {}
      }

      if (activeBaseUrl) {
        try {
          const ollamaRes = await fetch(`${activeBaseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: targetModel,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
              ],
              stream: true,
            }),
          });

          if (ollamaRes.ok && ollamaRes.body) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const reader = ollamaRes.body.getReader();

            const customStream = new ReadableStream({
              async start(controller) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split('\n');
                  for (const line of lines) {
                    if (line.trim()) {
                      try {
                        const parsed = JSON.parse(line);
                        if (parsed.message?.content) {
                          controller.enqueue(encoder.encode(parsed.message.content));
                        }
                      } catch {}
                    }
                  }
                }
                controller.close();
              },
            });

            return new Response(customStream, {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          }
        } catch (e) {
          console.warn('Ollama stream error:', e);
        }
      }
    }

    // 2. Cloud AI Models
    let aiModel: any;
    switch (model) {
      case 'gpt-4o':
        aiModel = openai('gpt-4o');
        break;
      case 'gemini-1.5-pro':
        aiModel = google('models/gemini-1.5-pro-latest');
        break;
      case 'claude-3-5-sonnet':
      default:
        aiModel = anthropic('claude-3-5-sonnet-20240620');
        break;
    }

    const result = await streamText({
      model: aiModel,
      messages: messages,
      system: systemPrompt,
    });

    return (result as any).toTextStreamResponse();
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response('My Friends AI 서비스 연결 준비 중입니다.', { status: 500 });
  }
}
