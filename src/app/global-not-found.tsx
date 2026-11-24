import './globals.css';
import type { Metadata } from 'next';
import { RootDocument } from '@/components/RootDocument';
import { NotFoundView } from '@/components/NotFoundView';

// Com dois layouts raiz (pt e en), o 404 precisa ser global (experimental.globalNotFound no next.config).
export const metadata: Metadata = {
  title: 'Página não encontrada – HAND Model',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <RootDocument lang="pt-BR">
      <NotFoundView />
    </RootDocument>
  );
}
