import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/lib/content';
import CookieSettingsButton from '@/components/CookieSettingsButton';

export const metadata: Metadata = {
  title: 'Zásady používání cookies',
  description: 'Jaké cookies a podobné technologie web Zajíčkův med používá a jak si je můžete nastavit.',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-base font-extrabold">{title}</h2>
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-dim">{children}</div>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <section className="px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Právní informace</span>
        <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">Zásady používání cookies</h1>
        <p className="mt-2 text-[12.5px] text-ink-dim">Platné od 15. 7. 2025</p>

        <div className="mt-6 max-w-[70ch]">
          <Section title="Co jsou cookies">
            <p>
              Cookies jsou malé textové soubory, které si při návštěvě webu ukládá váš prohlížeč. Podobně
              fungují i jiné technologie ukládající data lokálně ve vašem prohlížeči (například localStorage).
              Používáme je jen v rozsahu popsaném níže.
            </p>
          </Section>

          <Section title="Nezbytné cookies">
            <p>
              Tyto cookies web potřebuje k základnímu fungování a nelze je vypnout. Nesouvisí s běžnou
              návštěvou webu — nastavují se jen při přihlášení do administrace webu:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong>session</strong> — udržuje přihlášení v administraci webu (<code>/admin</code>),
                platnost 30 dní, nastavuje se jen tomu, kdo se do administrace přihlásí.
              </li>
            </ul>
          </Section>

          <Section title="Vaše volba souhlasu s cookies">
            <p>
              Když na webu poprvé zvolíte, zda souhlasíte s nepovinnými (analytickými) cookies, uložíme si
              tuto volbu lokálně ve vašem prohlížeči (localStorage), abychom se vás nemuseli ptát znovu při
              každé návštěvě. Nejde o sledovací cookie — tento údaj neopouští váš prohlížeč a slouží jen k
              zapamatování vaší volby.
            </p>
          </Section>

          <Section title="Analytické cookies">
            <p>
              Rádi bychom v budoucnu měřili anonymní návštěvnost webu, abychom věděli, které stránky lidi
              zajímají. Tato kategorie je na webu připravená, ale aktuálně žádný analytický nástroj aktivně
              neběží — pokud a až ho zapojíme, načte se pouze těm návštěvníkům, kteří s ním vysloví souhlas
              v cookie liště, a tuto stránku předem aktualizujeme s konkrétním popisem použitého nástroje.
            </p>
          </Section>

          <Section title="Služby třetích stran">
            <p>
              Na stránce Kontakt zobrazujeme mapu přes vloženou (embed) Google mapu. Při jejím načtení může
              Google do vašeho prohlížeče uložit vlastní cookies podle{' '}
              <a
                className="underline hover:text-honey-700"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                zásad ochrany soukromí Google
              </a>
              . Na tyto cookies nemáme vliv.
            </p>
          </Section>

          <Section title="Jak nastavení cookies změnit">
            <p>Svou volbu ohledně nepovinných cookies můžete kdykoliv změnit tlačítkem níže:</p>
            <CookieSettingsButton />
          </Section>

          <Section title="Kontakt">
            <p>
              Dotazy ohledně cookies směřujte na{' '}
              <a className="underline hover:text-honey-700" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              . Více o zpracování osobních údajů najdete v{' '}
              <a className="underline hover:text-honey-700" href="/ochrana-osobnich-udaju">
                zásadách ochrany osobních údajů
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
