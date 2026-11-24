import pagesJson from '@/content/pages.json';
import downloadsJson from '@/content/downloads.json';

export type Lang = 'pt' | 'en';

export type ImageRef = { src: string; alt: string; width?: number; height?: number; href?: string };
export type Block =
  | { type: 'markdown'; md: string }
  | { type: 'hero'; slides: { image: string | null; title: string; text: string; href?: string }[] }
  | { type: 'carousel'; items: { image: ImageRef | null; title: string }[] }
  | { type: 'tabs'; tabs: { label: string; blocks: Block[] }[] }
  | { type: 'accordion'; items: { title: string; blocks: Block[] }[] }
  | { type: 'entity'; image: ImageRef | null; title: string; blocks: Block[]; button?: { label: string; href: string } }
  | { type: 'columns'; cols: Block[][] }
  | ({ type: 'image' } & ImageRef)
  | { type: 'button'; label: string; href: string; primary?: boolean }
  | { type: 'downloads'; items: { title: string; label: string; href: string }[] }
  | { type: 'contact'; lang: Lang };

export type Page = {
  id: number;
  route: string;
  lang: Lang;
  title: string;
  heading: string | null;
  sidebar: boolean;
  nav: number | null;
  alternate: { pt: string; en: string };
  blocks: Block[];
};

export type DownloadFile = {
  id: number;
  file: string;
  platform: string;
  version: string;
  current: boolean;
  size: number;
};

export const PAGES = pagesJson as unknown as Page[];
export const DOWNLOADS = downloadsJson as DownloadFile[];

/** Prefixo do GitHub Pages (ex.: "/handmodel"), vazio no domínio raiz. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Resolve o marcador %ASSET% dos arquivos estáticos. */
export const asset = (u = '') => u.replaceAll('%ASSET%', BASE);

export const pageByRoute = (route: string) => PAGES.find((p) => p.route === route);

/** Rota sem barras extras: "" (início), "modelo-hand/", "en/about/". */
export const href = (route: string) => '/' + route;

export const isFile = (u: string) => u.includes('%ASSET%') || /\/wp-content\//.test(u);
export const isExternal = (u: string) => /^(https?:)?\/\//.test(u) || u.startsWith('mailto:');

// Menus "Principal Portugues" e "Principal Ingles" do WordPress
export const MENUS: Record<Lang, { page: number; label: string; route: string }[]> = {
  pt: [
    { page: 9, label: 'Início', route: '' },
    { page: 307, label: 'Modelo HAND', route: 'modelo-hand/' },
    { page: 900, label: 'Projetos', route: 'projetos/' },
    { page: 114, label: 'Referências', route: 'referencias/' },
    { page: 101, label: 'História e Créditos', route: 'historia-e-creditos/' },
    { page: 1073, label: 'Contato', route: 'contato/' },
  ],
  en: [
    { page: 161, label: 'Home', route: 'en/' },
    { page: 326, label: 'HAND Model', route: 'en/hand-model/' },
    { page: 905, label: 'Projects', route: 'en/projects/' },
    { page: 764, label: 'References', route: 'en/references/' },
    { page: 201, label: 'About', route: 'en/about/' },
    { page: 1075, label: 'Contact', route: 'en/contact/' },
  ],
};

export const T = {
  pt: {
    tagline: 'Um novo olhar sobre a paisagem',
    search: 'Buscar',
    searchPlaceholder: 'Buscar no site…',
    searchRoute: 'busca/',
    download: 'Baixar HAND Model',
    downloadRoute: 'baixar-hand-model/',
    contactRoute: 'contato/',
    contactTitle: 'Fale conosco',
    contactText: 'Dúvidas e sugestões? Escreva para a equipe do HAND Model.',
    contactCta: 'Entrar em contato',
    partners: 'Realização',
    top: 'Topo',
    home: 'Início',
    otherLang: 'English',
  },
  en: {
    tagline: 'A new look over the landscape',
    search: 'Search',
    searchPlaceholder: 'Search the site…',
    searchRoute: 'en/search/',
    download: 'Download the HAND Model',
    downloadRoute: 'en/download-the-hand-model/',
    contactRoute: 'en/contact/',
    contactTitle: 'Contact us',
    contactText: 'Questions or suggestions? Write to the HAND Model team.',
    contactCta: 'Get in touch',
    partners: 'Partners',
    top: 'Top',
    home: 'Home',
    otherLang: 'Português',
  },
} as const;

export const formatSize = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.round(bytes / 1024)} KB`;
