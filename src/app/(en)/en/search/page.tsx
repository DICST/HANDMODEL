import { SearchPage } from '@/components/SearchPage';

export const metadata = { title: 'Search Results – HAND Model', robots: { index: false } };
export default function Page() {
  return <SearchPage lang="en" />;
}
