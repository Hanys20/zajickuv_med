import { getHoneys, getPropolis } from '@/lib/products';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';

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

  const grid = (
    <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <ContactForm honeys={honeys} propolis={propolis} />
      <ContactInfo />
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
      className="section-frame scroll-mt-20 border-b border-border px-4 py-8 sm:px-6 md:py-12"
    >
      <div className="mx-auto max-w-content">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-1 text-xl font-extrabold md:text-2xl">{title}</h2>
        {grid}
      </div>
    </section>
  );
}
