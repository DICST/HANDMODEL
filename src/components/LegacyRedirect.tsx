'use client';

import { useEffect } from 'react';
import { BASE, DOWNLOADS } from '@/lib/site';

// Endereços antigos do WordPress continuam funcionando:
// /?page_id=307, /?page_id=313&lang=en, /?ddownload=1265, /?s=termo
const PAGE_ROUTES: Record<string, string> = {
  9: '', 307: 'modelo-hand/', 900: 'projetos/', 114: 'referencias/', 101: 'historia-e-creditos/',
  1073: 'contato/', 289: 'baixar-hand-model/', 70: 'equipe/', 1200: 'a-fisica-do-hand-model/', 1: '',
  161: 'en/', 326: 'en/hand-model/', 905: 'en/projects/', 764: 'en/references/', 201: 'en/about/',
  1075: 'en/contact/', 313: 'en/download-the-hand-model/', 1202: 'en/the-hand-model-physics/', 1190: 'en/',
  847: 'baixar-hand-model/', 779: 'baixar-hand-model/', 996: 'baixar-hand-model/',
  855: 'en/download-the-hand-model/', 782: 'en/download-the-hand-model/', 998: 'en/download-the-hand-model/',
};

export function LegacyRedirect() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('page_id') ?? p.get('p');
    if (id && id in PAGE_ROUTES) return void window.location.replace(`${BASE}/${PAGE_ROUTES[id]}`);
    const d = DOWNLOADS.find((x) => String(x.id) === p.get('ddownload'));
    if (d) return void window.location.replace(`${BASE}/wp-content/uploads/delightful-downloads/${d.file}`);
    const s = p.get('s');
    if (s !== null && !/\/(busca|search)\/?$/.test(window.location.pathname)) {
      window.location.replace(`${BASE}/${p.get('lang') === 'en' ? 'en/search/' : 'busca/'}?s=${encodeURIComponent(s)}`);
    }
  }, []);
  return null;
}
