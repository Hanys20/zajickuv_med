'use client';

import { useEffect, useState } from 'react';
import type { Availability } from '@/lib/products';
import Carousel from '@/components/ui/Carousel';
import { cenik as fallbackCenik } from '@/lib/content';
import { mergePricing } from '@/lib/pricing';
import type { Cenik } from '@/lib/content';
import OfferCard, { type OfferCardProps } from './OfferCard';

export type OfferProduct = OfferCardProps & {
  slug: string;
  pricingGroup?: 'waxAndCandles' | 'nucs';
};

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

  useEffect(() => {
    fetch('/api/public/pricing', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Cenik | null) => {
        if (!data) return;
        const pricing = mergePricing(data, fallbackCenik);
        setProducts((current) => current.map((product) => {
          if (!product.pricingGroup) return product;
          const row = pricing[product.pricingGroup].find((item) => item.name === product.name);
          return row ? { ...product, price: row.price, unit: row.unit } : product;
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <Carousel>
      {products.map(({ slug, pricingGroup, ...product }) => (
        <OfferCard key={slug} {...product} />
      ))}
    </Carousel>
  );
}
