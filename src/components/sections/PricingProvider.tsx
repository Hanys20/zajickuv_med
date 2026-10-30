'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { mergePricing, type Cenik } from '@/lib/pricing';

const PricingContext = createContext<Cenik | null>(null);

export default function PricingProvider({
  initialPricing,
  children,
}: {
  initialPricing: Cenik;
  children: ReactNode;
}) {
  const [pricing, setPricing] = useState(initialPricing);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/pricing', { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Cenik | null) => {
        if (data && !controller.signal.aborted) setPricing(mergePricing(data, initialPricing));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [initialPricing]);

  return <PricingContext.Provider value={pricing}>{children}</PricingContext.Provider>;
}

export function usePricing(): Cenik {
  const pricing = useContext(PricingContext);
  if (!pricing) throw new Error('Product prices must be rendered inside PricingProvider.');
  return pricing;
}
