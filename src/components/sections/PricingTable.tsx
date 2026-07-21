'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Cenik } from '@/lib/content';

export default function PricingTable({ initialCenik }: { initialCenik: Cenik }) {
  const [cenik, setCenik] = useState(initialCenik);

  useEffect(() => {
    fetch('/api/public/pricing')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Cenik | null) => {
        if (data) setCenik(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-l shadow-warm">
        <div className="section-dark flex flex-wrap items-baseline justify-between gap-2 px-4 py-3.5 sm:px-5">
          <h3 className="text-lg font-extrabold text-white">Ceník</h3>
          <span className="text-[11.5px] font-semibold text-honey-200">
            platný od {new Date(cenik.effectiveFrom).toLocaleDateString('cs-CZ')}
          </span>
        </div>
        <div className="overflow-x-auto bg-paper-raised">
          <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-honey-50">
                <th className="border-b border-honey-200 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-honey-700 sm:px-5">
                  Položka
                </th>
                <th className="border-b border-honey-200 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-honey-700 sm:px-5">
                  Balení
                </th>
                <th className="border-b border-honey-200 px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-honey-700 sm:px-5">
                  Cena
                </th>
              </tr>
            </thead>
            <tbody>
              {cenik.honey.map((row) => (
                <tr key={row.size} className="hover:bg-honey-50/60">
                  <td className="border-b border-block px-4 py-2.5 sm:px-5">Med (všechny druhy)</td>
                  <td className="border-b border-block px-4 py-2.5 sm:px-5">{row.size}</td>
                  <td className="border-b border-block px-4 py-2.5 text-right font-bold tabular-nums text-honey-700 sm:px-5">
                    {row.price} {row.unit.split('/')[0].trim()}
                  </td>
                </tr>
              ))}
              {cenik.propolis.map((row) => (
                <tr key={row.name} className="hover:bg-honey-50/60">
                  <td className="border-b border-block px-4 py-2.5 sm:px-5">{row.name}</td>
                  <td className="border-b border-block px-4 py-2.5 sm:px-5">{row.size}</td>
                  <td className="border-b border-block px-4 py-2.5 text-right font-bold tabular-nums text-honey-700 sm:px-5">
                    {row.price} {row.unit}
                  </td>
                </tr>
              ))}
              {cenik.giftSets.map((row, i) => (
                <tr key={row.name} className="hover:bg-honey-50/60">
                  <td className="px-4 py-2.5 sm:px-5">Dárkový karton</td>
                  <td className="px-4 py-2.5 sm:px-5">{row.name.replace('Karton ', '')}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-bold tabular-nums text-honey-700 sm:px-5 ${
                      i === cenik.giftSets.length - 1 ? '' : 'border-b border-block'
                    }`}
                  >
                    {row.price} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-honey-100 bg-honey-50 px-4 py-2.5 text-xs text-ink-dim sm:px-5">
          Uvedené ceny medu zahrnují vratnou zálohu na sklenici {cenik.jarDeposit.amount} Kč.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3.5 rounded-m border border-dashed border-honey-400 bg-honey-50 p-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-m border border-border bg-paper-raised">
          <Image src="/images/icons/mead.svg" alt="" width={26} height={26} />
        </div>
        <div>
          <strong className="text-sm">Také z našeho medu — medovina</strong>
          <p className="mt-1.5 text-[13px] text-ink-dim">
            {cenik.mead.variants.join(' a ')} {cenik.mead.name.toLowerCase()}, zraje minimálně
            10 měsíců. Bez ceny a bez možnosti objednání — nelze přímo prodávat, na webu jen
            zmínka.
          </p>
        </div>
      </div>
    </div>
  );
}
