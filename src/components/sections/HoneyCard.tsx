import Image from 'next/image';
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
    <div className="w-[260px] shrink-0 snap-start overflow-hidden rounded-md border border-border bg-paper-raised">
      <div className="relative aspect-square w-full border-b border-border">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 640px) 260px, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="imgph h-full rounded-none border-0">
            <Image src={icon} alt="" width={40} height={40} className="opacity-60" />
          </div>
        )}
        {photo && (
          <span className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-honey-200 bg-white/90 shadow-sm backdrop-blur-sm">
            <Image src={icon} alt="" width={18} height={18} />
          </span>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white/90 p-0.5 shadow-sm backdrop-blur-sm">
          <Badge availability={product.availability} />
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13.5px] font-bold leading-snug">{product.name}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">{product.shortDescription}</p>
      </div>
    </div>
  );
}
