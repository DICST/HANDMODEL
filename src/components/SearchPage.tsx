'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { VStack } from '@astryxdesign/core/VStack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Spinner } from '@astryxdesign/core/Spinner';
import { SiteShell, PageHeader, SearchBox } from './SiteShell';
import { BASE, href, type Lang } from '@/lib/site';

type Entry = { route: string; lang: Lang; title: string; text: string };

const L = {
  pt: { error: 'Não foi possível carregar a busca', errorText: 'Verifique sua conexão e recarregue a página.', title: 'Resultados da busca', for: 'Resultados para', none: 'Nada encontrado', noneText: 'Tente novamente com outras palavras.', empty: 'Digite um termo na caixa de busca acima.', count: (n: number) => `${n} página${n === 1 ? '' : 's'}` },
  en: { error: 'Search could not be loaded', errorText: 'Check your connection and reload the page.', title: 'Search results', for: 'Results for', none: 'Nothing found', noneText: 'Please try again with different keywords.', empty: 'Type a term in the search box above.', count: (n: number) => `${n} page${n === 1 ? '' : 's'}` },
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Results({ lang }: { lang: Lang }) {
  const t = L[lang];
  const q = (useSearchParams().get('s') ?? '').trim();
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch(`${BASE}/search-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);
  const hits = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!index || !words.length) return [];
    return index
      .filter((p) => p.lang === lang)
      .filter((p) => {
        const hay = norm(`${p.title} ${p.text}`);
        return words.every((w) => hay.includes(w));
      })
      .map((p) => {
        const pos = Math.max(0, norm(p.text).indexOf(words[0]) - 100);
        return { ...p, excerpt: (pos ? '… ' : '') + p.text.slice(pos, pos + 260) + ' …' };
      });
  }, [index, q, lang]);

  const box = <SearchBox key={q} lang={lang} width="100%" initial={q} />;
  if (!q) return (
    <VStack gap={3}>
      {box}
      <Text color="secondary">{t.empty}</Text>
    </VStack>
  );
  if (failed) return <EmptyState title={t.error} description={t.errorText} />;
  if (!index) return <Spinner />;
  if (!hits.length) return (
    <VStack gap={3}>
      {box}
      <EmptyState title={t.none} description={t.noneText} />
    </VStack>
  );
  return (
    <VStack gap={3}>
      {box}
      <Text color="secondary">
        {t.for} “{q}” · {t.count(hits.length)}
      </Text>
      {hits.map((h) => (
        <Card key={h.route} padding={4}>
          <VStack gap={1}>
            <Heading level={2}>
              <Link href={href(h.route)} style={{ color: 'var(--color-text-accent)' }}>
                {h.title}
              </Link>
            </Heading>
            <Text color="secondary">{h.excerpt}</Text>
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}

export function SearchPage({ lang }: { lang: Lang }) {
  return (
    <SiteShell lang={lang} alternate={{ pt: '/busca/', en: '/en/search/' }}>
      <main className="hand-main">
        <div className="hand-container hand-container--reading">
          <PageHeader title={L[lang].title} lang={lang} />
          <Suspense fallback={<Spinner />}>
            <Results lang={lang} />
          </Suspense>
        </div>
      </main>
    </SiteShell>
  );
}
