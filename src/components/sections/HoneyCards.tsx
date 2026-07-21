'use client';

import { useEffect, useState } from 'react';
import type { Product, Availability } from '@/lib/products';
import { HONEY_ICONS, HONEY_PHOTOS } from '@/lib/productIcons';
import HoneyCard from './HoneyCard';
import Carousel from '@/components/ui/Carousel';

type AvailabilityRow = { slug: string; availability: Availability };

export default function HoneyCards({ initialHoneys }: { initialHoneys: Product[] }) {
  const [honeys, setHoneys] = useState(initialHoneys);

  useEffect(() => {
    fetch('/api/public/availability')
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: AvailabilityRow[] | null) => {
        if (!rows) return;
        setHoneys((current) =>
          current.map((product) => {
            const match = rows.find((row) => row.slug === product.slug);
            return match ? { ...product, availability: match.availability } : product;
          })
        );
      })
      .catch(() => {});
  }, []);

  return (
    <Carousel itemsPerPage={4}>
      {honeys.map((honey) => (
        <HoneyCard
          key={honey.slug}
          product={honey}
          icon={HONEY_ICONS[honey.slug]}
          photo={HONEY_PHOTOS[honey.slug]}
        />
      ))}
    </Carousel>
  );
}
