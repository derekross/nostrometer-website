import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { NostrEvent } from '@nostrify/nostrify';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  event: NostrEvent;
  className?: string;
}

const NOSTR_REF = /nostr:(npub1|note1|nprofile1|nevent1|naddr1)([023456789acdefghjklmnpqrstuvwxyz]+)/g;

/** Renders a kind 30023 article. Nostr references and hashtags link to njump. */
export function MarkdownContent({ event, className }: MarkdownContentProps) {
  const processed = useMemo(() => {
    let text = event.content;

    const codeBlocks: string[] = [];
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    text = text.replace(NOSTR_REF, (_m, prefix: string, data: string) => {
      const id = `${prefix}${data}`;
      return `[nostr:${id.slice(0, 12)}…](https://njump.me/${id})`;
    });
    text = text.replace(/(^|\s)#([\p{L}\p{N}_]+)/gu, '$1[#$2](https://njump.me/t/$2)');

    codeBlocks.forEach((block, i) => {
      text = text.replace(`__CODE_BLOCK_${i}__`, block);
    });
    return text;
  }, [event.content]);

  return (
    <div className={cn('max-w-[65ch] text-lg leading-7', className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="t-h2 mt-12 mb-4 first:mt-0">{children}</h2>,
          h2: ({ children }) => <h2 className="t-h3 mt-10 mb-3 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl font-bold first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-6 mb-2 text-lg font-bold">{children}</h4>,
          h5: ({ children }) => <h5 className="mt-4 mb-2 font-bold">{children}</h5>,
          h6: ({ children }) => <h6 className="eyebrow mt-4 mb-2">{children}</h6>,
          p: ({ children }) => <p className="mb-5">{children}</p>,
          ul: ({ children }) => <ul className="mb-5 ml-6 list-disc space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-5 ml-6 list-decimal space-y-1.5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-primary pl-4 text-muted-foreground">{children}</blockquote>
          ),
          hr: () => <div role="separator" className="tick-ruler my-10" />,
          a: ({ href, children }) => {
            const safe = sanitizeUrl(href);
            if (!safe) return <span>{children}</span>;
            return (
              <a href={safe} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:decoration-2">
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
            const safe = sanitizeUrl(typeof src === 'string' ? src : undefined);
            if (!safe) return null;
            return (
              <img
                src={safe}
                alt={alt ?? ''}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="my-6 max-w-full rounded-md border"
              />
            );
          },
          pre: ({ children }) => <pre className="my-6 overflow-x-auto rounded-md border bg-muted p-4 text-sm leading-6">{children}</pre>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            return isBlock ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">{children}</code>
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-base">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b px-3 py-2 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b px-3 py-2 align-top">{children}</td>,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
