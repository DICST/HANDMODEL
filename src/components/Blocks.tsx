'use client';

import { forwardRef, useEffect, useId, useState } from 'react';
import { Link as AxLink } from '@astryxdesign/core/Link';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Carousel } from '@astryxdesign/core/Carousel';
import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { Avatar } from '@astryxdesign/core/Avatar';
import { ArrowDownTrayIcon, DocumentTextIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { ContactForm } from './ContactForm';
import { asset, isExternal, isFile, DOWNLOADS, formatSize, type Block, type ImageRef, type Lang } from '@/lib/site';

// ------------------------------------------------------------ links
/** Âncora comum (arquivos e sites externos não passam pelo roteador do Next). */
const PlainAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function PlainAnchor(props, ref) {
  return <a ref={ref} {...props} />;
});
const DownloadAnchor = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function DownloadAnchor(props, ref) {
  return <a ref={ref} download {...props} />;
});

/** Link do Astryx: páginas pelo roteador do Next (LinkProvider); arquivos e sites externos por âncora comum. */
function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  const url = asset(href);
  if (isFile(href) || isExternal(href)) {
    const external = isExternal(href) && !href.startsWith('mailto:');
    return (
      <AxLink href={url} as={PlainAnchor} isExternalLink={external} type="inherit">
        {children}
      </AxLink>
    );
  }
  return (
    <AxLink href={url} type="inherit">
      {children}
    </AxLink>
  );
}

function MdImage({ src, alt }: { src: string; alt: string }) {
  return <img src={asset(src)} alt={alt} loading="lazy" style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />;
}

const mdComponents = { link: SmartLink, image: MdImage };

function Md({ md }: { md: string }) {
  return (
    <Markdown components={mdComponents} contentWidth="100%">
      {md}
    </Markdown>
  );
}

// ------------------------------------------------------------ mídia
function Figure({ img, maxWidth }: { img: ImageRef; maxWidth?: number }) {
  const el = (
    <img
      src={asset(img.src)}
      alt={img.alt}
      width={img.width}
      height={img.height}
      loading="lazy"
      style={{ maxWidth: maxWidth ?? img.width ?? '100%', width: '100%', height: 'auto' }}
    />
  );
  return (
    <figure className="hand-figure">
      {img.href ? <SmartLink href={img.href}>{el}</SmartLink> : el}
    </figure>
  );
}

const HERO_T = {
  pt: { region: 'Destaques', slide: (n: number, t: number) => `Destaque ${n} de ${t}`, pause: 'Pausar destaques', play: 'Retomar destaques' },
  en: { region: 'Highlights', slide: (n: number, t: number) => `Highlight ${n} of ${t}`, pause: 'Pause highlights', play: 'Resume highlights' },
};

function Hero({ slides, lang }: { slides: Extract<Block, { type: 'hero' }>['slides']; lang: Lang }) {
  const t = HERO_T[lang];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    // respeita "reduzir movimento" e pausa enquanto o mouse/foco está no destaque
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (slides.length < 2 || paused || hover || reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length, paused, hover]);
  return (
    <section
      className="hand-hero"
      aria-roledescription="carousel"
      aria-label={t.region}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}>
      {slides.map((s, k) => (
        <div
          key={k}
          className="hand-hero-slide"
          data-active={k === i}
          aria-hidden={k !== i}
          inert={k !== i}
          role="group"
          aria-roledescription="slide"
          aria-label={t.slide(k + 1, slides.length)}
          style={{ backgroundImage: s.image ? `url("${asset(s.image)}")` : undefined }}>
          <div className="hand-hero-caption">
            <p className="hand-hero-title">{s.title}</p>
            {s.href ? (
              <AxLink
                href={s.href}
                as={isExternal(s.href) ? PlainAnchor : undefined}
                isExternalLink={isExternal(s.href)}
                color="inherit"
                type="large"
                hasUnderline>
                {s.text}
              </AxLink>
            ) : (
              <Text type="large" color="inherit">
                {s.text}
              </Text>
            )}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="hand-hero-dots">
          <button type="button" className="hand-hero-pause" aria-label={paused ? t.play : t.pause} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? '▶' : '❚❚'}
          </button>
          {slides.map((_s, k) => (
            <button key={k} type="button" className="hand-hero-dot" aria-label={t.slide(k + 1, slides.length)} aria-current={k === i} onClick={() => setI(k)} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppsCarousel({ items, lang }: { items: Extract<Block, { type: 'carousel' }>['items']; lang: Lang }) {
  return (
    <Card variant="muted" padding={3}>
      <Carousel gap={2} hasSnap aria-label={lang === 'en' ? 'Applications' : 'Aplicações'}>
        {items.map((it, k) => (
          <VStack key={k} className="hand-app" gap={3} hAlign="center">
            {it.image && <img src={asset(it.image.src)} alt="" loading="lazy" />}
            <Text type="large" weight="semibold" justify="center">
              {it.title}
            </Text>
          </VStack>
        ))}
      </Carousel>
    </Card>
  );
}

function Tabs({ tabs, lang }: { tabs: Extract<Block, { type: 'tabs' }>['tabs']; lang: Lang }) {
  const id = useId();
  const [value, setValue] = useState('0');
  // abre a aba indicada no endereço (#aba-2)
  useEffect(() => {
    const m = /^#aba-(\d+)$/.exec(window.location.hash);
    if (m && tabs[Number(m[1]) - 1]) setValue(String(Number(m[1]) - 1));
  }, [tabs]);
  // todos os painéis ficam no HTML (busca do navegador e indexação); só o ativo aparece
  return (
    <VStack gap={0}>
      <TabList
        value={value}
        onChange={(v) => {
          setValue(v);
          window.history.replaceState(null, '', `#aba-${Number(v) + 1}`);
        }}
        hasDivider
        overflow="auto">
        {tabs.map((t, k) => (
          <Tab key={k} value={String(k)} label={t.label} panelId={`${id}-panel-${k}`} />
        ))}
      </TabList>
      {tabs.map((t, k) => (
        <div key={k} id={`${id}-panel-${k}`} role="tabpanel" aria-label={t.label} className="hand-tabpanel" hidden={String(k) !== value}>
          <Blocks blocks={t.blocks} lang={lang} />
        </div>
      ))}
    </VStack>
  );
}

function Accordion({ items, lang }: { items: Extract<Block, { type: 'accordion' }>['items']; lang: Lang }) {
  return (
    <Card padding={0}>
      <CollapsibleGroup type="single" hasDividers density="balanced" style={{ paddingInline: 'var(--spacing-4, 16px)' }}>
        {items.map((it, k) => (
          <Collapsible
            key={k}
            value={String(k)}
            trigger={
              <Text type="body" weight="semibold">
                {it.title}
              </Text>
            }>
            <VStack paddingBlockEnd={2}>
              <Blocks blocks={it.blocks} lang={lang} />
            </VStack>
          </Collapsible>
        ))}
      </CollapsibleGroup>
    </Card>
  );
}

function Entity({ block, lang }: { block: Extract<Block, { type: 'entity' }>; lang: Lang }) {
  return (
    <Card padding={4}>
      <HStack gap={5} vAlign="center" className="hand-entity">
        <div className="hand-entity-media">
          {block.image ? <Figure img={block.image} maxWidth={180} /> : <Avatar name={block.title} size={96} tooltip={false} />}
        </div>
        <VStack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Heading level={3}>{block.title}</Heading>
          <Blocks blocks={block.blocks} lang={lang} />
          {block.button && (
            <HStack>
              <Button label={block.button.label} variant="secondary" size="sm" href={block.button.href} target="_blank" rel="noopener noreferrer" as={PlainAnchor} />
            </HStack>
          )}
        </VStack>
      </HStack>
    </Card>
  );
}

function Downloads({ items, lang }: { items: Extract<Block, { type: 'downloads' }>['items']; lang: Lang }) {
  return (
    <Grid columns={{ minWidth: 240 }} gap={3}>
      {items.map((it, k) => {
        const file = it.href.replace(/^.*delightful-downloads\//, '');
        const meta = DOWNLOADS.find((d) => d.file === file);
        const isDoc = /\.pdf$/i.test(file);
        const title = it.title || (meta ? `${meta.platform} ${meta.version}`.trim() : it.label);
        return (
          <Card key={k} padding={4} elevation="low" height="100%">
            <VStack gap={3} height="100%">
              <HStack gap={2} vAlign="center">
                <Icon icon={isDoc ? DocumentTextIcon : ComputerDesktopIcon} size="md" color="secondary" />
                <Text type="large" weight="semibold">
                  {title}
                </Text>
              </HStack>
              <HStack gap={2} vAlign="center" wrap="wrap" style={{ flex: 1, alignContent: 'flex-start' }}>
                {meta?.version && <Badge label={`v${meta.version}`} variant={meta.current ? 'info' : 'neutral'} />}
                <Text type="supporting" color="secondary">
                  {file.split('/').pop()} · {meta ? formatSize(meta.size) : ''}
                </Text>
              </HStack>
              <Button
                label={isDoc ? it.label : lang === 'en' ? 'Download' : 'Baixar'}
                tooltip={it.label}
                variant={meta?.current === false ? 'secondary' : 'primary'}
                href={asset(it.href)}
                as={isDoc ? PlainAnchor : DownloadAnchor}
                target={isDoc ? '_blank' : undefined}
                icon={<Icon icon={isDoc ? DocumentTextIcon : ArrowDownTrayIcon} />}
                width="100%"
              />
            </VStack>
          </Card>
        );
      })}
    </Grid>
  );
}

// ------------------------------------------------------------ renderizador
export function Blocks({ blocks, lang = 'pt' }: { blocks: Block[]; lang?: Lang }) {
  return (
    <VStack gap={4}>
      {blocks.map((b, k) => {
        switch (b.type) {
          case 'markdown':
            return b.md.trim() === '---' ? <Divider key={k} /> : <Md key={k} md={b.md} />;
          case 'hero':
            return <Hero key={k} slides={b.slides} lang={lang} />;
          case 'carousel':
            return <AppsCarousel key={k} items={b.items} lang={lang} />;
          case 'tabs':
            return <Tabs key={k} tabs={b.tabs} lang={lang} />;
          case 'accordion':
            return <Accordion key={k} items={b.items} lang={lang} />;
          case 'entity':
            return <Entity key={k} block={b} lang={lang} />;
          case 'columns':
            return (
              <Grid key={k} columns={{ minWidth: 260 }} gap={5}>
                {b.cols.map((c, j) => (
                  <div key={j} className={c[0]?.type === 'image' ? 'hand-profile' : undefined} style={{ textAlign: c[0]?.type === 'image' ? 'center' : undefined }}>
                    {c[0]?.type === 'image' ? (
                      <VStack gap={2} hAlign="center">
                        <img src={asset(c[0].src)} alt={c[0].alt} loading="lazy" />
                        <Blocks blocks={c.slice(1)} lang={lang} />
                      </VStack>
                    ) : (
                      <Blocks blocks={c} lang={lang} />
                    )}
                  </div>
                ))}
              </Grid>
            );
          case 'image':
            return <Figure key={k} img={b} />;
          case 'button':
            return (
              <HStack key={k}>
                {isExternal(b.href) || isFile(b.href) ? (
                  <Button label={b.label} variant={b.primary ? 'primary' : 'secondary'} size={b.primary ? 'lg' : 'md'} href={asset(b.href)} as={PlainAnchor} target={isExternal(b.href) ? '_blank' : undefined} />
                ) : (
                  <Button label={b.label} variant={b.primary ? 'primary' : 'secondary'} size={b.primary ? 'lg' : 'md'} href={b.href} icon={b.primary ? <Icon icon={ArrowDownTrayIcon} /> : undefined} />
                )}
              </HStack>
            );
          case 'downloads':
            return <Downloads key={k} items={b.items} lang={lang} />;
          case 'contact':
            return <ContactForm key={k} lang={b.lang} />;
          default:
            return null;
        }
      })}
    </VStack>
  );
}
