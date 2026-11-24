import type { Metadata } from 'next';
import { PAGES, pageByRoute, BASE, type Lang } from './site';
import { PageView } from '@/components/PageView';
import { Redirect } from '@/components/Redirect';

// Login / cadastro / esqueci a senha: o download agora é livre, então levam à página de download.
const REDIRECTS: Record<string, string> = {
  'login/': 'baixar-hand-model/',
  'cadastro/': 'baixar-hand-model/',
  'esqueci-a-senha/': 'baixar-hand-model/',
  'en/login/': 'en/download-the-hand-model/',
  'en/sign-up/': 'en/download-the-hand-model/',
  'en/forgot-password/': 'en/download-the-hand-model/',
  // páginas removidas (sobras do WordPress): links antigos levam ao início
  'ola-mundo/': '',
  'en/help-topics/': 'en/',
};

const prefix = (lang: Lang) => (lang === 'en' ? 'en/' : '');
const toRoute = (lang: Lang, slug?: string[]) => prefix(lang) + (slug?.length ? slug.join('/') + '/' : '');

export function staticParams(lang: Lang) {
  const routes = [...PAGES.filter((p) => p.lang === lang).map((p) => p.route), ...Object.keys(REDIRECTS).filter((r) => (lang === 'en') === r.startsWith('en/'))];
  return routes.map((r) => {
    const rest = r.slice(prefix(lang).length).replace(/\/$/, '');
    return { slug: rest ? rest.split('/') : [] };
  });
}

export async function pageMetadata(lang: Lang, params: Promise<{ slug?: string[] }>): Promise<Metadata> {
  const { slug } = await params;
  const route = toRoute(lang, slug);
  const page = pageByRoute(route);
  if (!page) return { title: 'HAND Model', robots: { index: false } };
  const isHome = page.id === 9 || page.id === 161;
  return {
    title: isHome ? `HAND Model – ${lang === 'en' ? 'A new look over the landscape' : 'Um novo olhar sobre a paisagem'}` : `${page.title} – HAND Model`,
    alternates: { languages: { 'pt-BR': `${BASE}${page.alternate.pt}`, en: `${BASE}${page.alternate.en}` } },
    icons: { icon: `${BASE}/wp-content/uploads/2018/01/handlogo-3-150x150.png`, apple: `${BASE}/wp-content/uploads/2018/01/handlogo-3.png` },
  };
}

export async function renderRoute(lang: Lang, params: Promise<{ slug?: string[] }>) {
  const { slug } = await params;
  const route = toRoute(lang, slug);
  if (REDIRECTS[route] !== undefined) return <Redirect to={REDIRECTS[route]} />;
  const page = pageByRoute(route);
  if (!page) return null;
  return <PageView page={page} />;
}
