'use client';

import Link from 'next/link';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import ptBR from '@astryxdesign/core/locales/pt-BR.generated.js';
// Tema "hand": neutral + azul-petróleo do site original (gerado por `astryx experimental theme editor`)
import { themes, defaultThemeSlug } from '../astryx-themes';

export function Providers({ locale, children }: { locale: 'pt-BR' | 'en'; children: React.ReactNode }) {
  return (
    <InternationalizationProvider locale={locale} messages={{ 'pt-BR': ptBR }}>
      <Theme theme={themes[defaultThemeSlug]} mode="light">
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </InternationalizationProvider>
  );
}
