'use client';

import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { SiteShell, PageHeader } from './SiteShell';
import { Blocks } from './Blocks';
import { T, href, type Page } from '@/lib/site';

function Sidebar({ lang }: { lang: Page['lang'] }) {
  const t = T[lang];
  return (
    <aside className="hand-sidebar">
      <VStack gap={3}>
        <Card padding={4} variant="teal">
          <VStack gap={2}>
            <Heading level={2}>{t.download}</Heading>
            <Text color="secondary">Linux · MacOS · Windows</Text>
            <HStack>
              <Button label={t.download} variant="primary" href={href(t.downloadRoute)} />
            </HStack>
          </VStack>
        </Card>
        <Card padding={4}>
          <VStack gap={2}>
            <Heading level={2}>{t.contactTitle}</Heading>
            <Text color="secondary">{t.contactText}</Text>
            <HStack>
              <Button label={t.contactCta} href={href(t.contactRoute)} />
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </aside>
  );
}

export function PageView({ page }: { page: Page }) {
  const isHome = page.id === 9 || page.id === 161;
  const content = <Blocks blocks={page.blocks} lang={page.lang} />;
  return (
    <SiteShell lang={page.lang} nav={page.nav} alternate={page.alternate}>
      <main className="hand-main">
        {/* largura por tipo de página: coluna de leitura centralizada para textos, um pouco mais larga
            na home (hero e carrossel) e a grade completa quando há barra lateral */}
        <div className={`hand-container ${page.sidebar ? '' : isHome ? 'hand-container--home' : 'hand-container--reading'}`}>
          {isHome ? (
            // a home abre com o hero (sem título visível), mas precisa de um <h1> para leitores de tela e SEO
            <VisuallyHidden>
              <h1>HAND Model – {T[page.lang].tagline}</h1>
            </VisuallyHidden>
          ) : (
            <PageHeader title={page.heading || page.title} lang={page.lang} />
          )}
          {page.sidebar ? (
            <div className="hand-with-sidebar">
              <article style={{ minWidth: 0 }}>{content}</article>
              <Sidebar lang={page.lang} />
            </div>
          ) : (
            <article>{content}</article>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
