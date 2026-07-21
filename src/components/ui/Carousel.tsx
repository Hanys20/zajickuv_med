'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';

type Props = {
  children: ReactNode[];
  itemsPerPage?: number;
};

export default function Carousel({ children, itemsPerPage = 4 }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(children.length / itemsPerPage));

  const scrollToPage = useCallback(
    (target: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(pageCount - 1, target));
      const child = el.children[clamped * itemsPerPage] as HTMLElement | undefined;
      if (child) {
        el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
      }
      setPage(clamped);
    },
    [itemsPerPage, pageCount]
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = el.scrollLeft / maxScroll;
    setPage(Math.round(ratio * (pageCount - 1)));
  }, [pageCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 scroll-smooth"
      >
        {children}
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Předchozí"
            disabled={page <= 0}
            onClick={() => scrollToPage(page - 1)}
            className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-honey-300 bg-paper-raised text-honey-700 shadow-warm transition-opacity hover:bg-honey-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Další"
            disabled={page >= pageCount - 1}
            onClick={() => scrollToPage(page + 1)}
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-honey-300 bg-paper-raised text-honey-700 shadow-warm transition-opacity hover:bg-honey-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            ›
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Strana ${i + 1}`}
                aria-current={page === i}
                onClick={() => scrollToPage(i)}
                className={`h-2.5 rounded-full transition-all ${
                  page === i ? 'w-6 bg-honey-500' : 'w-2.5 bg-honey-200 hover:bg-honey-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
