import Image from 'next/image';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Availability } from '@/lib/products';

export type OfferCardProps = {
  name: string;
  category: string;
  description: string;
  photo: string;
  href: string;
  availability: Availability;
  cta?: string;
  note?: string;
};

export default function OfferCard({
  name,
  category,
  description,
  photo,
  href,
  availability,
  cta = 'Mám zájem',
  note,
}: OfferCardProps) {
  return (
    <article className="flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-paper-raised sm:w-[calc((100%-64px)/2)] lg:w-[calc((100%-96px)/4)]">
      <div className="relative aspect-square border-b border-border">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 82vw"
          className="object-cover"
        />
        <div className="absolute right-2 top-2">
          <Badge availability={availability} />
        </div>
      </div>
      <div className="flex min-h-[190px] flex-1 flex-col p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-honey-700">{category}</span>
        <h3 className="mt-1 text-[14px] font-bold leading-snug">{name}</h3>
        <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-dim">{description}</p>
        {note && <p className="mt-1.5 text-[11px] font-semibold text-honey-700">{note}</p>}
        {availability !== 'sold-out' ? (
          <Link href={href} className="btn btn-primary btn-block mt-3 !py-2 !text-[12px]">
            {cta}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="btn btn-block mt-3 cursor-not-allowed !border-block !bg-block !py-2 !text-[12px] !text-ink-dim/60"
          >
            {cta}
          </span>
        )}
      </div>
    </article>
  );
}
