import { SearchPage } from '@/components/SearchPage';

export const metadata = { title: 'Resultados da busca – HAND Model', robots: { index: false } };
export default function Page() {
  return <SearchPage lang="pt" />;
}
