import Image from 'next/image';
import Link from 'next/link';

type Props = {
  name: string;
  category: string;
  description: string;
  photo: string;
  href: string;
  cta?: string;
  note?: string;
};

export default function OfferCard({ name, category, description, photo, href, cta = 'Mám zájem', note }: Props) {
  return (
    <article className="w-[78%] shrink-0 snap-start overflow-hidden rounded-md border border-border bg-paper-raised sm:w-[calc((100%-64px)/2)] lg:w-[calc((100%-96px)/4)]">
      <div className="relative aspect-square border-b border-border">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 82vw"
          className="object-cover"
        />
      </div>
      <div className="flex min-h-[174px] flex-col p-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-honey-700">{category}</span>
        <h3 className="mt-1 text-[14px] font-bold leading-snug">{name}</h3>
        <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-dim">{description}</p>
        {note && <p className="mt-1.5 text-[11px] font-semibold text-honey-700">{note}</p>}
        <Link
          href={href}
          className="mt-3 self-start text-[11px] font-bold uppercase tracking-wide text-honey-700 underline decoration-honey-300 underline-offset-4 transition-colors hover:text-honey-900"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
