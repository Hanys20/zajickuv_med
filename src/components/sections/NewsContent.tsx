'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { NewsPost } from '@/lib/news';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsContent({ initialPost }: { initialPost: NewsPost | null }) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    fetch('/api/public/news')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: NewsPost | null) => {
        if (data) setPost(data);
      })
      .catch(() => {});
  }, []);

  if (!post) return null;

  return (
    <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Co se děje na farmě</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Aktuality</h2>

        <div className="mt-5 overflow-hidden rounded-l border border-honey-200 bg-paper-raised">
          <div className="border-l-4 border-honey-400 px-6 py-9 sm:px-9 sm:py-11">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-honey-700">
              <Image src="/images/icons/calendar.svg" alt="" width={12} height={12} />
              {formatDate(post.date)}
            </span>
            <h3 className="mt-3.5 text-lg font-extrabold sm:text-xl">{post.title}</h3>
            <p className="mt-2.5 max-w-[65ch] text-[14px] leading-relaxed text-ink-dim">
              {post.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
