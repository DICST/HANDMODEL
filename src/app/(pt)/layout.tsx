import '../globals.css';
import { RootDocument } from '@/components/RootDocument';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="pt-BR">{children}</RootDocument>;
}
