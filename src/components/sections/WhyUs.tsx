import Image from 'next/image';
import CountUp from '@/components/ui/CountUp';

const CARDS = [
  {
    icon: '/images/icons/family.svg',
    title: 'Rodinná tradice',
    text: 'Včelaření se v naší rodině předává po generace. Navazujeme na zkušenosti našich předků a zároveň se stále učíme lépe rozumět včelám a jejich potřebám.',
    tone: 'bg-honey-100 border-honey-200',
  },
  {
    icon: '/images/icons/honeycomb-alt.svg',
    title: 'Vlastní koloběh vosku',
    text: 'Používáme vosk z našich vlastních včelstev, u kterého známe jeho původ. Mezistěny si vyrábíme sami.',
    tone: 'bg-leaf-100 border-leaf-300',
  },
  {
    icon: '/images/icons/hive.svg',
    title: 'Dřevěné úly',
    text: 'Včelaříme v dřevěných úlech a dáváme přednost přírodním materiálům před plastovými rámky a mezistěnami.',
    tone: 'bg-honey-100 border-honey-200',
  },
  {
    icon: '/images/icons/leaf.svg',
    title: 'Šetrná péče o včely',
    text: 'Včelstva vedeme co nejpřirozenější cestou a maximálně omezujeme látky, které jsou včelám a přírodě cizí.',
    tone: 'bg-leaf-100 border-leaf-300',
  },
];

export default function WhyUs() {
  return (
    <section className="section-tint relative overflow-hidden border-b border-border px-4 py-8 sm:px-6 md:py-12">
      <div className="relative mx-auto max-w-content">
        <span className="eyebrow">Proč zrovna my</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">
          Proč si vybrat med právě od nás?
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.title} className="card flex flex-col items-center bg-paper-raised text-center">
              <div
                className={`mb-3.5 flex h-16 w-16 items-center justify-center rounded-full border ${card.tone}`}
              >
                <Image src={card.icon} alt="" width={30} height={30} />
              </div>
              <h3 className="mb-2 text-lg font-extrabold">{card.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-dim">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="section-dark mt-5 rounded-l px-4 py-8 text-center">
          <p className="text-5xl font-extrabold text-honey-300 sm:text-6xl">
            <CountUp target={20} suffix="+" />
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wide text-white/85">
            let osobních zkušeností
          </p>
        </div>
      </div>
    </section>
  );
}
