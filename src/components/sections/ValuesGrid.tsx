import Image from 'next/image';

const TONES = [
  'bg-honey-100 border-honey-200',
  'bg-leaf-100 border-leaf-300',
  'bg-honey-100 border-honey-200',
  'bg-leaf-100 border-leaf-300',
  'bg-honey-100 border-honey-200',
];

const VALUES = [
  {
    icon: '/images/icons/heart.svg',
    title: 'Respekt ke včelám',
    text: 'Včelstvo nevnímáme pouze jako prostředek k získávání medu. Snažíme se rozumět jeho přirozenému vývoji a do života včel zasahovat s rozvahou.',
  },
  {
    icon: '/images/icons/location.svg',
    title: 'Známý původ',
    text: 'Máme přehled o tom, kde naše včely žijí, odkud pochází náš vosk a jakým způsobem je med získáván a zpracováván.',
  },
  {
    icon: '/images/icons/tree.svg',
    title: 'Přírodní materiály',
    text: 'Používáme především dřevo a vlastní včelí vosk. Plastové rámky ani plastové mezistěny do našich úlů nezařazujeme.',
  },
  {
    icon: '/images/icons/cells.svg',
    title: 'Vlastní zpracování vosku',
    text: 'Vosk z našich včelstev si sami čistíme a vyrábíme z něj nové mezistěny. Můžeme tak kontrolovat celý jeho koloběh.',
  },
  {
    icon: '/images/icons/support.svg',
    title: 'Osobní přístup',
    text: 'Jsme malá rodinná včelí farma. Zákazníkům proto rádi představíme původ jednotlivých medů a poradíme s jejich výběrem.',
  },
];

export default function ValuesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map((v, i) => (
        <div key={v.title} className="card flex flex-col items-center bg-paper-raised text-center">
          <div
            className={`mb-3.5 flex h-16 w-16 items-center justify-center rounded-full border ${TONES[i]}`}
          >
            <Image src={v.icon} alt="" width={30} height={30} />
          </div>
          <h3 className="mb-2 text-lg font-extrabold">{v.title}</h3>
          <p className="text-[13.5px] leading-relaxed text-ink-dim">{v.text}</p>
        </div>
      ))}
    </div>
  );
}
