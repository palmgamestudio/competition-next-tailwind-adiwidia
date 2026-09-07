'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatRoomProps {
  messages?: ChatMessage[];
  isLoading?: boolean;
  brandLogoSrc?: string; // avatar asisten
}

export default function ChatRoom({
  messages = [],
  isLoading = false,
  brandLogoSrc = '/image/brand/logo.svg',
}: ChatRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll hanya di dalam chat-room, jangan geser seluruh halaman
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-room" ref={containerRef}>
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <div key={msg.id} className="room-chat-question">
            <p className="question whitespace-pre-wrap">{msg.content}</p>
          </div>
        ) : (
          <div key={msg.id} className="room-chat-answer">
            <div className="answer-profile">
              <Image
                src={brandLogoSrc}
                alt="Profile Image"
                width={16}
                height={16}
                className="profile-image"
              />
            </div>
            <p className="answer whitespace-pre-wrap">{msg.content}</p>
          </div>
        )
      )}

      {/* Indikator "asisten sedang mengetik" */}
      {isLoading && (
        <div className="room-chat-answer">
          <div className="answer-profile">
            <Image
              src={brandLogoSrc}
              alt="Profile Image"
              width={16}
              height={16}
              className="profile-image"
            />
          </div>
          <div className="answer">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
              <span
                className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
