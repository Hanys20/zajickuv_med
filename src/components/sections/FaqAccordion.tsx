'use client';

import { useState } from 'react';
import type { FaqItem } from '@/lib/content';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.question}
            className={`mb-2.5 overflow-hidden rounded-md border bg-paper-raised transition-colors ${
              open ? 'border-honey-300' : 'border-border'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-2.5 px-4 py-3.5 text-left text-sm font-bold hover:bg-honey-50/60"
              aria-expanded={open}
            >
              {item.question}
              <svg
                className={`shrink-0 text-honey-600 transition-transform ${open ? 'rotate-180' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className={open ? 'max-h-[600px]' : 'max-h-0'} style={{ overflow: 'hidden', transition: 'max-height 0.2s ease' }}>
              <p className="whitespace-pre-line px-4 pb-4 text-[13.5px] leading-relaxed text-ink-dim">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
