'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { NewsPost } from '@/lib/news';
import Reveal from '@/components/ui/Reveal';

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
    <section className="section-tint border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <Reveal className="mx-auto max-w-content">
        <span className="eyebrow">Co se děje na farmě</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Aktuality</h2>

        <div className="relative mt-5">
          <Image
            src="/images/watercolor/beekeeper.png"
            alt=""
            width={782}
            height={1000}
            className="pointer-events-none absolute bottom-0 right-4 hidden w-60 -scale-x-100 select-none sm:block md:right-8 md:w-80"
          />
          <div className="overflow-hidden rounded-xl border border-honey-200 bg-paper-raised">
            <div className="border-l-4 border-honey-400 py-9 pl-6 pr-6 sm:py-11 sm:pl-9 sm:pr-[280px] md:pr-[380px]">
              <span className="inline-flex items-center rounded-full bg-honey-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-honey-700">
                {formatDate(post.date)}
              </span>
              <h3 className="mt-3.5 text-lg font-extrabold sm:text-xl">{post.title}</h3>
              <p className="mt-2.5 max-w-[65ch] text-[14px] leading-relaxed text-ink-dim">
                {post.body}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
