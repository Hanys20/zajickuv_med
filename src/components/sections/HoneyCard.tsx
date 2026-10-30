import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import Badge from '@/components/ui/Badge';
import { formatPrice, type Cenik } from '@/lib/pricing';

export default function HoneyCard({
  product,
  icon,
  photo,
  prices,
}: {
  product: Product;
  icon: string;
  photo?: string;
  prices: Cenik['honey'];
}) {
  return (
    <article className="flex w-[calc(100%-48px)] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-paper-raised sm:w-[calc((100%-70px)/2)] lg:w-[calc((100%-92px)/3)]">
      <div className="relative aspect-square w-full border-b border-border">
        {photo ? (
          <Image
            src={photo}
            alt={`${product.name} z rodinné včelí farmy Zajíčkův med`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="imgph h-full rounded-none border-0">
            <Image src={icon} alt="" width={40} height={40} className="opacity-60" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge availability={product.availability} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[13.5px] font-bold leading-snug">{product.name}</h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-dim">{product.shortDescription}</p>

        <dl
          aria-label="Balení a ceny medu"
          className="mt-3 grid w-full grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-1.5"
        >
          {prices.map((row) => (
            <div
              key={row.size}
              className="rounded-lg border border-honey-100 bg-honey-50/70 px-2 py-1.5 text-center"
            >
              <dt className="text-[11px] font-medium leading-4 text-ink-dim">
                {row.size.replace(/(\d)\s*(g|kg)\b/, '$1 $2')}
              </dt>
              <dd className="mt-0.5 whitespace-nowrap text-sm font-bold leading-5 tabular-nums text-honey-700">
                {formatPrice(row.price, row.unit.split('/')[0].trim())}
              </dd>
            </div>
          ))}
        </dl>

        {product.availability === 'sold-out' ? (
          <span
            aria-disabled="true"
            className="btn btn-block mt-3 cursor-not-allowed !border-block !bg-block !py-2 !text-[12px] !text-ink-dim/60"
          >
            Ochutnat med
          </span>
        ) : (
          <Link
            href={`/kontakt?med=${product.slug}#kontakt`}
            className="btn btn-primary btn-block mt-3 !py-2 !text-[12px]"
          >
            Ochutnat med
          </Link>
        )}
      </div>
    </article>
  );
}
