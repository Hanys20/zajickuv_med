import Image from 'next/image';
import Carousel from '@/components/ui/Carousel';

const photos = [
  { src: '/images/gallery/vceli-vosk-a-svicky.webp', alt: 'Včelí vosk připravený k výrobě svíček', portrait: false },
  { src: '/images/gallery/prace-u-ulu.webp', alt: 'Včelař při práci u otevřeného úlu', portrait: true },
  { src: '/images/gallery/ramek-se-vcelami.webp', alt: 'Včely na rámku vytaženém z úlu', portrait: true },
  { src: '/images/gallery/vcely-pred-ulem.webp', alt: 'Včely přilétající ke vchodu do úlu', portrait: true },
  { src: '/images/gallery/kontrola-ramku.webp', alt: 'Včelař kontrolující rámek proti slunci', portrait: false },
  { src: '/images/gallery/zivot-na-farme.webp', alt: 'Ze života na rodinné farmě', portrait: false },
  { src: '/images/gallery/vcela-na-kvetu.webp', alt: 'Včela sbírající nektar na fialovém květu', portrait: false },
  { src: '/images/gallery/staceni-medu.webp', alt: 'Stáčení čerstvého medu', portrait: true },
  { src: '/images/gallery/druhy-medu.webp', alt: 'Světlý a tmavý med z rodinné farmy', portrait: false },
  { src: '/images/gallery/plny-plast.webp', alt: 'Rámek s plástem plným včel', portrait: true },
  { src: '/images/gallery/rada-ulu.webp', alt: 'Řada dřevěných úlů na stanovišti', portrait: false },
  { src: '/images/gallery/vcelnice-v-lese.webp', alt: 'Včelař na lesním stanovišti', portrait: false },
];

export default function FarmGallery() {
  return (
    <div>
      <div className="mb-5 text-center md:mb-7">
        <span className="eyebrow-invert">Jak to u nás vypadá</span>
        <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">Ze života včelí farmy</h2>
      </div>

      <Carousel gapClassName="gap-1.5 sm:gap-2">
        {photos.map((photo) => (
          <figure
            key={photo.src}
            className={`relative shrink-0 snap-start overflow-hidden rounded-[6px] ${
              photo.portrait
                ? 'h-[280px] w-[187px] sm:h-[300px] sm:w-[200px] lg:h-[250px] lg:w-[167px]'
                : 'h-[280px] w-[84vw] max-w-[420px] sm:h-[300px] sm:w-[450px] sm:max-w-none lg:h-[250px] lg:w-[375px]'
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={photo.portrait ? '(min-width: 1024px) 167px, 200px' : '(min-width: 1024px) 375px, 84vw'}
              className="object-cover"
            />
          </figure>
        ))}
      </Carousel>
    </div>
  );
}
