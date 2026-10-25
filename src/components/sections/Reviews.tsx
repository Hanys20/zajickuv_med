'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import Carousel from '@/components/ui/Carousel';
import { site } from '@/lib/content';

type Review = {
  text: string;
  rating: number | null;
  relativeTime: string | null;
  authorName: string;
  authorUrl: string | null;
  authorPhotoUrl: string | null;
  reviewUrl: string;
  translated: boolean;
};

type ReviewsData = {
  available: boolean;
  rating: number | null;
  count: number;
  reviews: Review[];
  reviewsUrl: string | null;
  attributions: { provider?: string; providerUri?: string }[];
};

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span role="img" aria-label={`${rating} z 5 hvězdiček`} className="whitespace-nowrap text-honey-500">
      {'★'.repeat(filled)}<span className="text-honey-200">{'★'.repeat(5 - filled)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const author = (
    <>
      {review.authorPhotoUrl ? (
        // Fotka autora je součástí atribuce poskytnuté Googlem.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.authorPhotoUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-9 w-9 shrink-0 rounded-full border border-honey-100 object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-honey-100 text-sm font-bold text-honey-800">
          {review.authorName.charAt(0)}
        </span>
      )}
      <span className="min-w-0 truncate text-[13px] font-semibold text-ink">{review.authorName}</span>
    </>
  );

  return (
    <article className="flex w-[calc(100%-48px)] shrink-0 snap-start flex-col rounded-xl border border-border/70 bg-paper-raised p-5 shadow-sm sm:w-[calc((100%-70px)/2)] lg:w-[calc((100%-92px)/3)]">
      <div className="flex min-w-0 items-center gap-2.5">
        {review.authorUrl ? (
          <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2.5 hover:underline">
            {author}
          </a>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">{author}</div>
        )}
      </div>
      {review.rating !== null && (
        <div className="mt-3 text-[14px] leading-none">
          <Stars rating={review.rating} />
        </div>
      )}
      <p className="mt-3 line-clamp-5 text-[13px] leading-relaxed text-ink-dim">{review.text}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-[11.5px] text-ink-dim">
        <span>{review.relativeTime}{review.translated ? ' · Přeloženo Googlem' : ''}</span>
        <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-honey-700 hover:underline">
          Celá recenze ↗
        </a>
      </div>
    </article>
  );
}

export default function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const requested = useRef(false);
  const [data, setData] = useState<ReviewsData | null>(null);
  const mapsUrl = site.reviews.googleMapsUrl;
  const reviews = data?.available ? data.reviews : [];
  const reviewsUrl = data?.reviewsUrl ?? mapsUrl;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const load = () => {
      if (requested.current) return;
      requested.current = true;
      fetch('/api/public/reviews', { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((result: ReviewsData | null) => {
          if (result?.available) setData(result);
        })
        .catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: '240px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="recenze" className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <Reveal className="mx-auto max-w-content">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Co říkají zákazníci</span>
            <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Recenze</h2>
          </div>
          {reviews.length > 0 && (
            <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-honey-700 hover:underline">
              Všechny recenze na Google Maps ↗
            </a>
          )}
        </div>

        {data?.rating != null && (
          <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
            <strong className="text-lg text-ink">{data.rating.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
            <Stars rating={data.rating} />
            <span className="text-ink-dim">z {data.count} hodnocení na Google Maps</span>
            <span className="text-ink-dim">· Nejrelevantnější podle Google</span>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="mt-3 sm:mt-4">
            <Carousel>
              {reviews.map((review, index) => (
                <ReviewCard key={`${review.authorName}-${index}`} review={review} />
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-honey-100 bg-honey-50/50 px-5 py-5 sm:px-6">
            <p className="text-[14px] text-ink-dim">
              Zkušenosti našich zákazníků si můžete přečíst přímo na Google Maps.
            </p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[13px] font-semibold text-honey-700 hover:underline">
              Přejít na recenze ↗
            </a>
          </div>
        )}
      </Reveal>
    </section>
  );
}
