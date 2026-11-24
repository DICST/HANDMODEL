'use client';

import { forwardRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import { Icon } from '@astryxdesign/core/Icon';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/** Âncora comum para âncoras de página (#top) e sites externos. */
const PlainAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function PlainAnchor(props, ref) {
  return <a ref={ref} {...props} />;
});
import { Link as AxLink } from '@astryxdesign/core/Link';
import { MENUS, T, BASE, href, type Lang } from '@/lib/site';

type Props = {
  lang: Lang;
  /** página do menu que fica selecionada */
  nav?: number | null;
  /** rota equivalente no outro idioma */
  alternate?: { pt: string; en: string };
  children: React.ReactNode;
};

export function SearchBox({ lang, width = 200, initial = '' }: { lang: Lang; width?: number | string; initial?: string }) {
  const t = T[lang];
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const go = () => router.push(`${href(t.searchRoute)}?s=${encodeURIComponent(q)}`);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}>
      <TextInput
        type="search"
        size="sm"
        label={t.search}
        isLabelHidden
        placeholder={t.searchPlaceholder}
        startIcon="search"
        value={q}
        onChange={setQ}
        onEnter={go}
        width={width}
        htmlName="s"
        enterKeyHint="search"
      />
    </form>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const t = T[lang];
  const home = lang === 'en' ? 'en/' : '';
  const partners = [
    { href: 'https://www.cemaden.gov.br/', src: '/wp-content/uploads/2019/05/logo12018-300x75.png', alt: 'Cemaden' },
    { href: 'http://www.ccst.inpe.br/', src: '/wp-content/uploads/2019/05/CCST_name-300x75.png', alt: 'CCST – Centro de Ciência do Sistema Terrestre' },
    { href: 'http://www.inpe.br/', src: '/wp-content/uploads/2019/05/inpe_name.png', alt: 'INPE – Instituto Nacional de Pesquisas Espaciais' },
  ];
  return (
    <footer className="hand-footer">
      <div className="hand-container">
        <div className="hand-partners" aria-label={t.partners}>
          {partners.map((p) => (
            <AxLink key={p.href} href={p.href} as={PlainAnchor} target="_blank" rel="noopener noreferrer" label={p.alt}>
              <img src={BASE + p.src} alt={p.alt} loading="lazy" />
            </AxLink>
          ))}
        </div>
        <div className="hand-footer-bottom">
          <HStack gap={3} vAlign="center">
            <AxLink href="#top" as={PlainAnchor} color="inherit" type="supporting">
              ↑ {t.top}
            </AxLink>
            <Text type="supporting" color="inherit">|</Text>
            <AxLink href={href(home)} color="inherit" type="supporting">
              {t.home}
            </AxLink>
          </HStack>
          <Text type="supporting" color="inherit">
            © {new Date().getFullYear()}{' '}
            <AxLink href={href(home)} color="inherit" type="inherit">
              HAND Model
            </AxLink>
            .
          </Text>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ lang, nav, alternate, children }: Props) {
  const t = T[lang];
  const other: Lang = lang === 'pt' ? 'en' : 'pt';
  const otherHref = alternate?.[other] ?? (other === 'en' ? '/en/' : '/');
  return (
    <>
    <AppShell
      height="auto"
      variant="section"
      topNav={
        <TopNav
          label={lang === 'en' ? 'Main menu' : 'Menu principal'}
          heading={
            <Link href={href(lang === 'en' ? 'en/' : '')} aria-label="HAND Model – início" style={{ display: 'block' }}>
              <img className="hand-logo" src={`${BASE}/wp-content/themes/flat-bootstrap/img-inpe/logo_hand.png`} alt={`HAND Model – ${t.tagline}`} />
            </Link>
          }
          startContent={MENUS[lang].map((m) => (
            <TopNavItem key={m.page} label={m.label} href={href(m.route)} isSelected={nav === m.page} />
          ))}
          endContent={
            <HStack gap={2} vAlign="center">
              <span className="hand-search-full">
                <SearchBox lang={lang} />
              </span>
              <span className="hand-search-icon">
                <Button label={t.search} isIconOnly icon={<Icon icon={MagnifyingGlassIcon} />} variant="ghost" size="sm" href={href(t.searchRoute)} />
              </span>
              <Button
                label={t.otherLang}
                variant="ghost"
                size="sm"
                href={otherHref}
                tooltip={other === 'en' ? 'Read this page in English' : 'Ler esta página em português'}
              />
            </HStack>
          }
        />
      }>
      <div id="top" />
      {children}
    </AppShell>
    {/* fora do AppShell: ele ocupa no mínimo uma tela inteira, e o rodapé dentro dele deixava
        uma faixa branca abaixo em páginas curtas */}
    <Footer lang={lang} />
    </>
  );
}

export function PageHeader({ title, lang }: { title: string; lang: Lang }) {
  return (
    <VStack gap={1} paddingBlockEnd={6}>
      <Text type="supporting" color="secondary">
        HAND Model · {T[lang].tagline}
      </Text>
      <Heading level={1} type="display-3">
        {title}
      </Heading>
    </VStack>
  );
}

