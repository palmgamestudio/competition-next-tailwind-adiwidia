"use client";

import InputSearch from "@/components/Atoms/Input/InputSearch";
import ChatHeader from "@/components/Atoms/ParticleChatAI/ChatHeader";
import ChatRoom from "@/components/Atoms/ParticleChatAI/ChatRoom";
import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  sceneName: string;
  sceneSlug: string;
  aiContext?: string | null;
};

export default function CardChatAIMuseum({
  sceneName,
  sceneSlug,
  aiContext,
}: Props) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const greetedRef = useRef(false);

  // Reset thread when scene changes
  useEffect(() => {
    greetedRef.current = false;
    setMessages([]);
    setInput("");
  }, [sceneSlug]);

  useEffect(() => {
    if (greetedRef.current || !sceneName) return;
    setMessages([
      {
        id: "assistant-welcome",
        role: "assistant",
        content: `Halo! Saya pemandu virtual untuk ${sceneName}. Tanyakan apa saja tentang ruang ini—koleksi, sejarah, atau makna budayanya.`,
      },
    ]);
    greetedRef.current = true;
  }, [sceneName, sceneSlug]);

  const sendMessage = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || isLoading) return;

      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: q },
      ]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: q,
            cultureContext: {
              title: sceneName,
              category: "Museum Virtual Tour 360",
              slug: sceneSlug,
              description: aiContext ?? "",
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || data?.error) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.response || "Maaf, tidak ada respons.",
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              "Maaf, terjadi kesalahan ketika memproses pertanyaan Anda. Silakan coba lagi.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [aiContext, isLoading, sceneName, sceneSlug]
  );

  return (
    <div className="card-chat museum-chat">
      <ChatHeader />
      <ChatRoom messages={messages} isLoading={isLoading} />
      <div className="chat-footer">
        <InputSearch
          icon="submit"
          inputSize="small"
          value={input}
          placeholder={
            sceneName ? `Tanya tentang ${sceneName}…` : "Tulis pesan anda disini"
          }
          onChangeAction={setInput}
          onSubmitAction={(v) => sendMessage(v)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
