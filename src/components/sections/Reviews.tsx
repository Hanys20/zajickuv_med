import Image from 'next/image';
import Carousel from '@/components/ui/Carousel';

const TONES = ['bg-honey-200', 'bg-leaf-100', 'bg-honey-100'];

const PLACEHOLDER_REVIEWS = [
  {
    text: '„Ukázková recenze — text doplní klient / migrace z Google recenzí po zřízení provozovny. Sem přijde delší, autentický text od spokojeného zákazníka popisující zkušenost s nákupem a kvalitou medu.“',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout. Tady bude reálná zkušenost zákazníka, klidně o pár vět delší, ať je vidět, jak bude karta s recenzí vypadat v praxi.“',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout. I tahle karta počítá s trochu delším textem, aby náhled recenzí na homepage působil věrohodně a ne prázdně.“',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout. Po zřízení provozovny na Google Maps se sem propíšou skutečné recenze i s hodnocením hvězdičkami.“',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout. Do té doby tu zůstávají ručně vybrané ukázkové texty, které klient postupně nahradí reálnými ohlasy.“',
  },
];

export default function Reviews() {
  return (
    <section className="border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Co říkají zákazníci</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">Recenze</h2>

        <div className="mt-5">
          <Carousel itemsPerPage={3}>
            {PLACEHOLDER_REVIEWS.map((review, i) => (
              <div key={i} className="card w-[270px] shrink-0 snap-start sm:w-[calc(33.333%-10px)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-[42px] w-12 shrink-0 items-center justify-center ${TONES[i % TONES.length]} [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]`}
                  >
                    <Image src="/images/icons/person.svg" alt="" width={18} height={18} className="opacity-70" />
                  </div>
                  <div className="text-xs font-semibold text-ink-dim">Jméno zákazníka</div>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">{review.text}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
