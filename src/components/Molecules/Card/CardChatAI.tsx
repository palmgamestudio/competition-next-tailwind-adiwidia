'use client';

import InputSearch from '@/components/Atoms/Input/InputSearch';
import ChatHeader from '@/components/Atoms/ParticleChatAI/ChatHeader';
import ChatRoom from '@/components/Atoms/ParticleChatAI/ChatRoom';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';
import {
  CULTURE_WITH_RELATIONS,
  cultureCategory,
  cultureProvince,
  type CultureWithRelations,
} from '@/utils/supabase-queries';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type CultureRow = CultureWithRelations;

function stripHtml(html?: string | null): string {
  if (!html) return '';
  // hapus tag & normalisasi whitespace
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
  // batasi panjang biar payload ke API ringan
  return text.length > 4000 ? text.slice(0, 4000) + '…' : text;
}

export default function CardChatAI() {
  const { category, province, culture_slug } = useParams<{
    category?: string;
    province?: string;
    culture_slug?: string;
  }>();

  // ====== UI/Input State ======
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ====== Context (Culture) ======
  const [culture, setCulture] = useState<CultureRow | null>(null);
  const [ctxError, setCtxError] = useState<string>('');
  const initializedRef = useRef(false);

  const titleText = useMemo(
    () => culture?.name || (culture_slug ?? ''),
    [ culture?.name, culture_slug]
  );
  const descriptionText = useMemo(
    () => stripHtml(culture?.content),
    [culture?.content]
  );

  // ====== Chat State ======
  const [messages, setMessages] = useState<Message[]>([]);

  // greeting setelah context tersedia (sekali)
  useEffect(() => {
    if (initializedRef.current) return;
    if (!titleText) return;

    setMessages([
      {
        id: 'assistant-welcome',
        role: 'assistant',
        content: `Halo! Saya pemandu virtual untuk ${titleText}. Tanyakan apa saja tentang budaya ini—asal-usul, makna, proses pembuatan, hingga relevansinya hari ini.`,
      },
    ]);
    initializedRef.current = true;
  }, [titleText]);

  // ====== Fetch culture context from Supabase ======
  const fetchCulture = useCallback(async () => {
    try {
      setCtxError('');
      if (!culture_slug) return;

      const { data, error } = await supabase
        .from('cultures')
        .select(CULTURE_WITH_RELATIONS)
        .eq('slug', culture_slug)
        .single();

      if (error) throw error;
      setCulture(data as CultureRow);
    } catch (err: any) {
      setCtxError(err?.message ?? 'Gagal memuat konteks budaya.');
      setCulture(null);
    }
  }, [culture_slug]);

  useEffect(() => {
    fetchCulture();
  }, [fetchCulture]);

  // ====== Submit to /api/chat with cultureContext ======
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            // ==== penting: gunakan konteks "cultures", bukan "artifact" ====
            cultureContext: {
              title: titleText,
              category:
                cultureCategory(culture)?.category_name ?? category ?? '',
              province:
                cultureProvince(culture)?.name ?? province ?? '',
              slug: culture?.slug ?? culture_slug ?? '',
              description: descriptionText,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data?.error) {
          throw new Error(data?.error || 'Request gagal');
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
          content:
            'Maaf, terjadi kesalahan ketika memproses pertanyaan Anda. Silakan coba lagi.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        // optional: log error ke monitoring
        // console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      titleText,
      culture,
      category,
      province,
      culture_slug,
      descriptionText,
    ]
  );

  // ====== Handlers ======
  const onSubmitSearch = ({ searchValue }: { searchValue: string }) => {
    // InputSearch mengirim string via onSubmitAction
    sendMessage(searchValue);
  };

  // ====== Render ======
  return (
    <div className="card-chat">
      {/* Header tetap punyamu; kalau mau tampilkan ctxError, bisa inject kecil di sini */}
      <ChatHeader />

      {/* ChatRoom: berikan messages + isLoading sebagai props opsional.
          Jika ChatRoom belum mendukung, jadikan props opsional di definisinya. */}
      <ChatRoom messages={messages} isLoading={isLoading} />

      <div className="chat-footer">
        <InputSearch
          icon="submit"
          inputSize="small"
          value={input}
          placeholder={
            titleText
              ? `Tanya tentang ${titleText}…`
              : 'Tulis pesan anda disini'
          }
          onChangeAction={(v: string) => setInput(v)} // kalau InputSearch mendukung onChange
          onSubmitAction={(v: string) => onSubmitSearch({ searchValue: v })}
          disabled={isLoading}
        />
        {/* Jika InputSearch tidak punya onChangeAction/disabled,
            hapus props tersebut, tetap pakai onSubmitAction saja. */}
      </div>

      {/* Optional: kecilkan error context */}
      {ctxError && (
        <p className="mt-2 text-xs text-red-600">
          {ctxError} — chat tetap bisa jalan tanpa konteks lengkap.
        </p>
      )}
    </div>
  );
}
