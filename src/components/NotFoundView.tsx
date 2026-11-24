'use client';

import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { SiteShell } from './SiteShell';
import { T, href } from '@/lib/site';

/** Página 404 bilíngue (o GitHub Pages serve o 404.html para qualquer endereço inexistente). */
export function NotFoundView() {
  return (
    <SiteShell lang="pt">
      <main className="hand-main">
        <div className="hand-container hand-container--reading">
          <VisuallyHidden>
            <h1>Página não encontrada – Page not found</h1>
          </VisuallyHidden>
          <EmptyState
            title="Página não encontrada · Page not found"
            description="O endereço pode ter mudado com a nova versão do site. · This address may have changed with the new version of the site."
          />
          <HStack gap={2} hAlign="center" wrap="wrap" paddingBlockStart={4}>
            <Button label="Ir para o início" variant="primary" href={href('')} />
            <Button label="Go to the home page" href={href('en/')} />
            <Button label={T.pt.download} variant="ghost" href={href(T.pt.downloadRoute)} />
          </HStack>
        </div>
      </main>
    </SiteShell>
  );
}
