import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů',
  description: 'Jak Zajíčkův med zpracovává osobní údaje návštěvníků webu a zákazníků.',
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-base font-extrabold">{title}</h2>
      <div className="space-y-3 text-[14.5px] leading-relaxed text-ink-dim">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <section className="px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto max-w-content">
        <span className="eyebrow">Právní informace</span>
        <h1 className="mt-1.5 text-2xl font-extrabold md:text-[28px]">Zásady ochrany osobních údajů</h1>
        <p className="mt-2 text-[12.5px] text-ink-dim">Aktualizováno 28. 10. 2026</p>

        <div className="mt-6 max-w-[70ch]">
          <Section title="Kdo je správcem osobních údajů">
            <p>
              Provozovatelem webu zajickuv-med.cz a správcem osobních údajů je {site.contact.person}, se
              sídlem {site.contact.address.street}, {site.contact.address.zip} {site.contact.address.city}{' '}
              (dále jen „my“ nebo „správce“). Jde o prodej přebytků medu ze dvora bez IČO, nejedná se o
              formální podnikání — přesto s osobními údaji návštěvníků a zákazníků nakládáme v souladu s
              nařízením GDPR.
            </p>
            <p>
              Kontakt ve věci ochrany osobních údajů:{' '}
              <a className="underline hover:text-honey-700" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              , telefon{' '}
              <a className="underline hover:text-honey-700" href={`tel:${site.contact.phone.replace(/\s/g, '')}`}>
                {site.contact.phone}
              </a>
              .
            </p>
          </Section>

          <Section title="Jaké osobní údaje zpracováváme">
            <p>
              Osobní údaje získáváme pouze tehdy, když nám je sami poskytnete — zejména vyplněním
              kontaktního formuláře. Jde o:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>jméno,</li>
              <li>e-mailovou adresu,</li>
              <li>telefonní číslo (nepovinné),</li>
              <li>obsah zprávy a vybraný produkt.</li>
            </ul>
            <p>
              Po stisknutí tlačítka Odeslat poptávku jsou údaje předány přes server webu službě
              Formspree, která zajišťuje jejich přijetí a doručení do naší e-mailové schránky.
              Server webu obsah poptávky neukládá do databáze. Zpráva může být uložena ve službě
              Formspree a v našich e-mailových schránkách pro vyřízení poptávky.
            </p>
          </Section>

          <Section title="Proč a jak dlouho údaje zpracováváme">
            <p>
              Údaje z poptávek zpracováváme za účelem vyřízení vaší objednávky či dotazu, po dobu nezbytnou
              k jejich vyřízení a případné navazující komunikaci, nejdéle však po dobu 3 let od posledního
              kontaktu, pokud nám nesdělíte jinak. Právním základem je plnění poptávky a náš oprávněný zájem
              na vyřízení dotazu.
            </p>
          </Section>

          <Section title="Komu údaje předáváme">
            <p>
              Při odeslání formuláře údaje zpracovávají poskytovatel hostingu a přesměrování pošty
              Cloudflare, služba Formspree, Inc. a poskytovatelé našich e-mailových schránek.
              Formspree může údaje zpracovávat také v USA. Podrobnosti uvádí{' '}
              <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-honey-700">
                zásady ochrany soukromí Formspree
              </a>. Více o cookies a technických datech spojených s provozem webu najdete v{' '}
              <a className="underline hover:text-honey-700" href="/cookies">
                zásadách používání cookies
              </a>
              .
            </p>
          </Section>

          <Section title="Mapy a recenze Google">
            <p>
              Na stránce Kontakt se načítá mapa od Googlu. Na úvodní stránce zobrazujeme recenze
              z Google Maps; jejich texty získává server webu a fotografie autorů se mohou načítat
              přímo z Googlu. V takovém případě může Google zpracovat technické údaje o návštěvě,
              například IP adresu. Podrobnosti najdete v{' '}
              <a href="https://policies.google.com/privacy?hl=cs" target="_blank" rel="noopener noreferrer" className="underline hover:text-honey-700">
                zásadách ochrany soukromí Google
              </a>.
            </p>
          </Section>

          <Section title="Vaše práva">
            <p>Ve vztahu ke svým osobním údajům máte právo:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>na přístup k údajům, které o vás zpracováváme,</li>
              <li>na opravu nepřesných či neúplných údajů,</li>
              <li>na výmaz („právo být zapomenut“),</li>
              <li>vznést námitku proti zpracování,</li>
              <li>na omezení zpracování,</li>
              <li>
                podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz), pokud se domníváte, že
                zpracování není v souladu s právními předpisy.
              </li>
            </ul>
            <p>
              Pro uplatnění kteréhokoliv z těchto práv nás kontaktujte na{' '}
              <a className="underline hover:text-honey-700" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              .
            </p>
          </Section>

          <Section title="Změny těchto zásad">
            <p>
              Tyto zásady můžeme čas od času aktualizovat, například při zavedení nových funkcí webu (např.
              zapojení analytiky návštěvnosti). Aktuální verze
              je vždy dostupná na této stránce.
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
