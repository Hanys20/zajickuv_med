'use client';

import { useEffect, useState } from 'react';
import type { Availability } from '@/lib/products';
import Carousel from '@/components/ui/Carousel';
import OfferCard, { type OfferCardProps } from './OfferCard';

export type OfferProduct = OfferCardProps & { slug: string };

type AvailabilityRow = { slug: string; availability: Availability };

export default function OfferCards({ initialProducts }: { initialProducts: OfferProduct[] }) {
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    fetch('/api/public/availability', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: AvailabilityRow[] | null) => {
        if (!rows) return;
        setProducts((current) =>
          current.map((product) => {
            const match = rows.find((row) => row.slug === product.slug);
            return match ? { ...product, availability: match.availability } : product;
          })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <Carousel>
      {products.map(({ slug, ...product }) => (
        <OfferCard key={slug} {...product} />
      ))}
    </Carousel>
  );
}
