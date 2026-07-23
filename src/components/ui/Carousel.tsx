'use client';

import { Children, cloneElement, isValidElement, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode[];
};

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

// Nekonečný karusel: položky jsou ztrojené (kopie-skutečné-kopie), scrollujeme
// uprostřed a při přiblížení k okraji tiše (bez animace) skočíme o jednu
// "kopii" dál/zpět, takže scrollování nikdy nenarazí na konec.
//
// Pozn.: záměrně NEpoužíváme Tailwind `scroll-smooth` (CSS scroll-behavior:
// smooth) na scrolleru - kdyby tam bylo, prohlížeč by dle specifikace
// interpretoval i naše "tiché" přeskoky (behavior: 'auto') jako smooth,
// takže by přeskok na druhou kopii byl viditelně animovaný ("cukne zpátky
// na začátek"). Animaci řídíme čistě přes explicitní `behavior` v JS.
export default function Carousel({ children }: Props) {
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeDot, setActiveDot] = useState(0);

  const peekOffset = useCallback((el: HTMLDivElement): number => {
    const value = getComputedStyle(el).scrollPaddingLeft;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }, []);

  const nearestIndex = useCallback((): number => {
    const el = scrollerRef.current;
    if (!el || !el.children.length) return count;
    const elRect = el.getBoundingClientRect();
    const target = elRect.left + peekOffset(el);
    let nearest = 0;
    let nearestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const dist = Math.abs((child as HTMLElement).getBoundingClientRect().left - target);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    return nearest;
  }, [count, peekOffset]);

  const scrollToChildIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const el = scrollerRef.current;
    const child = el?.children[index] as HTMLElement | undefined;
    if (!el || !child) return;
    const elRect = el.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    el.scrollTo({ left: el.scrollLeft + (childRect.left - elRect.left - peekOffset(el)), behavior });
  }, [peekOffset]);

  useLayoutEffect(() => {
    if (count === 0) return;
    scrollToChildIndex(count, 'auto');
    setActiveDot(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const handleScroll = useCallback(() => {
    const idx = nearestIndex();
    setActiveDot(((idx % count) + count) % count);

    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const settled = nearestIndex();
      if (settled < count) scrollToChildIndex(settled + count, 'auto');
      else if (settled >= count * 2) scrollToChildIndex(settled - count, 'auto');
    }, 150);
  }, [count, nearestIndex, scrollToChildIndex]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [handleScroll]);

  const goTo = useCallback(
    (dotIndex: number) => {
      const current = nearestIndex();
      const currentDot = ((current % count) + count) % count;
      let delta = dotIndex - currentDot;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      scrollToChildIndex(current + delta);
    },
    [count, nearestIndex, scrollToChildIndex]
  );

  const next = useCallback(() => scrollToChildIndex(nearestIndex() + 1), [nearestIndex, scrollToChildIndex]);
  const prev = useCallback(() => scrollToChildIndex(nearestIndex() - 1), [nearestIndex, scrollToChildIndex]);

  if (count === 0) return null;

  const tripled = [0, 1, 2].flatMap((copy) => items.map((child, i) => cloneElement(child, { key: `c${copy}-${i}` })));

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <button
        type="button"
        aria-label="Předchozí"
        onClick={prev}
        className="flex h-10 w-6 shrink-0 items-center justify-center text-honey-500 transition-all hover:-translate-x-0.5 hover:text-honey-700"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="min-w-0 flex-1">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto py-2 [scroll-padding-left:24px] [scroll-padding-right:24px] sm:[scroll-padding-left:28px] sm:[scroll-padding-right:28px] lg:[scroll-padding-left:32px] lg:[scroll-padding-right:32px]"
        >
          {tripled}
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Karta ${i + 1}`}
              aria-current={activeDot === i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                activeDot === i ? 'w-5 bg-honey-500' : 'w-2 bg-honey-200 hover:bg-honey-300'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Další"
        onClick={next}
        className="flex h-10 w-6 shrink-0 items-center justify-center text-honey-500 transition-all hover:translate-x-0.5 hover:text-honey-700"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
