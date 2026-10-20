import type { Metadata } from 'next';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Podmínky použití',
  description: 'Podmínky použití webu Zajíčkův med a obsahu z Map Google.',
};

export default function TermsPage() {
  return (
    <section className="px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Právní informace</span>
        <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">Podmínky použití</h1>
        <div className="mt-6 max-w-[70ch] space-y-6 text-[14.5px] leading-relaxed text-ink-dim">
          <div>
            <h2 className="mb-2 text-base font-extrabold text-ink">O tomto webu</h2>
            <p>
              Web Zajíčkův med provozuje {site.contact.person}. Informace o nabídce a dostupnosti průběžně
              aktualizujeme. Pro potvrzení objednávky nás prosím kontaktujte.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-base font-extrabold text-ink">Obsah z Map Google</h2>
            <p>
              Na webu zobrazujeme mapu a zákaznické recenze poskytované službou Google Maps. Recenze píší
              jejich autoři a aktuální znění i hodnocení najdete přímo na Google Maps. Na použití obsahu
              Google Maps se vztahují{' '}
              <a href="https://policies.google.com/terms?hl=cs" target="_blank" rel="noopener noreferrer" className="underline hover:text-honey-700">
                smluvní podmínky společnosti Google
              </a>{' '}
              a{' '}
              <a href="https://www.google.com/intl/cs_ALL/help/terms_maps/" target="_blank" rel="noopener noreferrer" className="underline hover:text-honey-700">
                dodatečné podmínky Map Google
              </a>
              .
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-base font-extrabold text-ink">Kontakt</h2>
            <p>
              Dotazy k webu posílejte na{' '}
              <a href={`mailto:${site.contact.email}`} className="underline hover:text-honey-700">{site.contact.email}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
