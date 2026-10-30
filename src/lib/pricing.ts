import pricingJson from '../../content/pricing/cenik.json';

export type PricedItem = {
  name: string;
  size: string | null;
  price: number | null;
  unit: string;
};

export type Cenik = Omit<typeof pricingJson, 'waxAndCandles' | 'nucs'> & {
  waxAndCandles: PricedItem[];
  nucs: PricedItem[];
};

type StoredPricing = Partial<Cenik> & { catalogVersion?: number };

export function formatPrice(price: number | null, unit: string): string {
  return price === null ? 'Doplníme' : `${price.toLocaleString('cs-CZ')} ${unit}`;
}

// D1 may still contain the previous catalog. Keep prices edited by the client,
// while the names, sizes and new product rows come from the current build.
export function mergePricing(stored: StoredPricing | null | undefined, current: Cenik): Cenik {
  if (!stored) return current;
  const savedPricing = stored;

  function pricedRows(key: 'waxAndCandles' | 'nucs'): PricedItem[] {
    const saved = Array.isArray(savedPricing[key]) ? savedPricing[key] : [];
    return current[key].map((row) => {
      if (savedPricing.catalogVersion !== current.catalogVersion) return row;
      const match = saved.find((item) => item.name === row.name);
      return match && (typeof match.price === 'number' || match.price === null)
        ? { ...row, price: match.price }
        : row;
    });
  }

  return {
    ...current,
    honey: current.honey.map((row) => {
      const match = stored.honey?.find((item) => item.size === row.size);
      return match && typeof match.price === 'number' ? { ...row, price: match.price } : row;
    }),
    propolis: current.propolis.map((row) => {
      const match = stored.propolis?.find((item) => item.name === row.name);
      return match && typeof match.price === 'number' ? { ...row, price: match.price } : row;
    }),
    giftSets: current.giftSets.map((row) => {
      const match = stored.giftSets?.find((item) => item.name === row.name);
      return match && typeof match.price === 'number' ? { ...row, price: match.price } : row;
    }),
    jarDeposit: {
      ...current.jarDeposit,
      amount: typeof stored.jarDeposit?.amount === 'number'
        ? stored.jarDeposit.amount
        : current.jarDeposit.amount,
    },
    waxAndCandles: pricedRows('waxAndCandles'),
    nucs: pricedRows('nucs'),
  };
}
