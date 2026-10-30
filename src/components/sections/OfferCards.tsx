'use client';

import { useEffect, useState } from 'react';
import type { Availability } from '@/lib/products';
import Carousel from '@/components/ui/Carousel';
import { usePricing } from './PricingProvider';
import OfferCard, { type OfferCardProps } from './OfferCard';

export type OfferProduct = OfferCardProps & {
  slug: string;
  pricingGroup: 'propolis' | 'waxAndCandles' | 'nucs';
};

type AvailabilityRow = { slug: string; availability: Availability };

export default function OfferCards({ initialProducts }: { initialProducts: OfferProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const pricing = usePricing();

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
      {products.map(({ slug, pricingGroup, ...product }) => {
        const row = pricing[pricingGroup].find((item) => item.name === product.name);
        return (
          <OfferCard
            key={slug}
            {...product}
            price={row?.price}
            unit={row?.unit}
            size={pricingGroup === 'propolis' ? row?.size : undefined}
          />
        );
      })}
    </Carousel>
  );
}
