import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import Badge from '@/components/ui/Badge';

export default function HoneyCard({
  product,
  icon,
  photo,
}: {
  product: Product;
  icon: string;
  photo?: string;
}) {
  return (
    <div className="flex w-[calc(100%-48px)] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-paper-raised sm:w-[calc((100%-70px)/2)] lg:w-[calc((100%-92px)/3)]">
      <div className="relative aspect-square w-full border-b border-border">
        {photo ? (
          <Image
            src={photo}
            alt=""
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
    </div>
  );
}
