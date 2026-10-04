import { getHoneys, getPropolis } from '@/lib/products';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import Reveal from '@/components/ui/Reveal';

type Props = {
  eyebrow?: string;
  title?: string;
  id?: string;
  bare?: boolean;
};

export default function ContactSection({
  eyebrow = 'Objednávka / dotaz',
  title = 'Napište nám',
  id = 'kontakt',
  bare = false,
}: Props) {
  const honeys = getHoneys();
  const propolis = getPropolis();
  const theme = bare ? 'light' : 'dark';

  const grid = (
    <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <ContactForm honeys={honeys} propolis={propolis} theme={theme} />
      <ContactInfo theme={theme} />
    </div>
  );

  if (bare) {
    return (
      <div id={id} className="scroll-mt-20">
        {grid}
      </div>
    );
  }

  return (
    <section
      id={id}
      className="section-dark scroll-mt-20 border-b border-honey-900/50 px-4 py-10 sm:px-6 md:py-14"
    >
      <Reveal className="mx-auto max-w-content">
        <span className="eyebrow-invert">{eyebrow}</span>
        <h2 className="mt-1 text-xl font-extrabold text-white md:text-2xl">{title}</h2>
        {grid}
      </Reveal>
    </section>
  );
}
