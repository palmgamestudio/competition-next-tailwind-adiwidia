'use client';

import InputSearch from '@/components/Atoms/Input/InputSearch';
import ChatHeader from '@/components/Atoms/ParticleChatAI/ChatHeader';
import ChatRoom from '@/components/Atoms/ParticleChatAI/ChatRoom';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ItemRow = {
  id?: string | number | null;
  slug: string;
  name?: string | null;

  // konteks artifact
  category_name?: string | null;
  province_name?: string | null;

  // teks HTML
  content?: string | null;
  description?: string | null;
};

function stripHtml(html?: string | null): string {
  if (!html) return '';
  const text = html
    .replace(/<\/(script|style)>/gi, ']')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > 4000 ? text.slice(0, 4000) + '…' : text;
}

export default function CardChatAICollection() {
  const { collection_slug } = useParams<{ collection_slug: string }>();

  // ===== states =====
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [item, setItem] = useState<ItemRow | null>(null);
  const [ctxError, setCtxError] = useState<string>('');
  const greetedRef = useRef(false);

  // ===== derive context =====
  const titleText = useMemo(
    () => item?.name || collection_slug || '',
    [item?.name, collection_slug]
  );

  const descriptionText = useMemo(
    () => stripHtml(item?.content || item?.description),
    [item?.content, item?.description]
  );

  // ===== fetch artifact from supabase =====
  const fetchItem = useCallback(async () => {
    try {
      setCtxError('');
      const { data, error } = await supabase
        .from('view_virtual_museum_items_with_category_province')
        .select('*')
        .eq('slug', collection_slug)
        .maybeSingle();

      if (error) throw error;
      setItem((data as ItemRow | null) ?? null);
    } catch (err: any) {
      setCtxError(err?.message ?? 'Gagal memuat konteks koleksi.');
      setItem(null);
    }
  }, [collection_slug]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // ===== greet once when title is ready =====
  useEffect(() => {
    if (greetedRef.current) return;
    if (!titleText) return;
    setMessages([
      {
        id: 'assistant-welcome',
        role: 'assistant',
        content: `Halo! Saya pemandu virtual untuk ${titleText}. Silakan tanya apa saja—asal-usul, makna, proses pembuatan, hingga relevansinya hari ini.`,
      },
    ]);
    greetedRef.current = true;
  }, [titleText]);

  // ===== send message to /api/chat =====
  const sendMessage = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || isLoading) return;

      const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', content: q };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: q,
            // gunakan "artifactContext" agar cocok dengan pedoman + route
            artifactContext: {
              title: titleText,
              category: item?.category_name ?? '',
              province: item?.province_name ?? '',
              description: descriptionText,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data?.error) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        const assistantMessage: Message = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.response || 'Maaf, tidak ada respons.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const assistantMessage: Message = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan ketika memproses pertanyaan Anda. Silakan coba lagi.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, titleText, descriptionText]
  );

  // ===== handlers =====
  const onSubmitSearch = ({ searchValue }: { searchValue: string }) => {
    sendMessage(searchValue);
  };

  return (
    <div className="card-chat">
      <ChatHeader />

      {/* ChatRoom diupgrade agar menerima props ini (lihat implementasi ChatRoom dinamis yg kuberi) */}
      <ChatRoom messages={messages} isLoading={isLoading} />

      <div className="chat-footer">
        <InputSearch
          icon="submit"
          inputSize="small"
          value={input}
          placeholder={titleText ? `Tanya tentang ${titleText}…` : 'Tulis pesan anda disini'}
          onChangeAction={(v) => setInput(v)}            // pastikan InputSearch versi terbaru
          onSubmitAction={(v) => onSubmitSearch({ searchValue: v })}
          disabled={isLoading}
        />
      </div>

      {ctxError && (
        <p className="mt-2 text-xs text-red-600">
          {ctxError} — chat tetap bisa jalan tanpa konteks lengkap.
        </p>
      )}
    </div>
  );
}
