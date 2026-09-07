'use client';

import Markdown from 'react-markdown';

type Props = {
  content: string;
  className?: string;
};

/** Render chat assistant markdown (bold, list, paragraph). */
export default function ChatMarkdown({ content, className }: Props) {
  return (
    <div className={className ? `chat-markdown ${className}` : 'chat-markdown'}>
      <Markdown
        components={{
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ children }) => <code>{children}</code>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
