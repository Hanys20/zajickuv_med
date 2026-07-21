import Image from 'next/image';
import Carousel from '@/components/ui/Carousel';

const PLACEHOLDER_REVIEWS = [
  {
    text: '„Ukázková recenze — text doplní klient / migrace z Google recenzí po zřízení provozovny.“',
    icon: '/images/icons/bee.svg',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout.“',
    icon: '/images/icons/honeycomb.svg',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout.“',
    icon: '/images/icons/flower.svg',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout.“',
    icon: '/images/icons/honey-jar.svg',
  },
  {
    text: '„Ukázková recenze — placeholder textu pro layout.“',
    icon: '/images/icons/beehive.svg',
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-honey-200 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]">
                    <Image src={review.icon} alt="" width={20} height={20} className="opacity-70" />
                  </div>
                  <div>
                    <div className="tracking-widest text-honey-500">★★★★★</div>
                    <div className="text-xs font-semibold text-ink-dim">Jméno zákazníka</div>
                  </div>
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
