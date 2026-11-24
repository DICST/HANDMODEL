// Converte o conteúdo do WordPress HAND Model em blocos estruturados para o site Astryx.
//
// Entrada:  scripts/source/<ID>.json  (HTML renderizado de cada página, URLs com %BASE%)
// Saída:    src/content/pages.json    (páginas -> blocos: markdown, hero, carousel, tabs,
//                                      accordion, entity, columns, image, button, downloads, contact)
//           public/search-index.json  (busca no navegador)
//           public/wp-content/...     (imagens e arquivos de download usados)
//
// Uso: node scripts/convert.mjs [raiz-do-wordpress]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'scripts/source');
const WP = process.argv[2] || 'C:/laragon/www/handmodel';
const routes = JSON.parse(fs.readFileSync(path.join(SRC, 'routes.json'), 'utf8'));

// ------------------------------------------------------------ URLs
// %BASE%/rota          -> /rota            (navegação interna; o Next adiciona o basePath)
// %BASE%/wp-content/x  -> %ASSET%/wp-content/x (arquivo estático; o basePath é aplicado na renderização)
const fixUrl = (u = '') =>
  u
    .replace(/%BASE%\/(wp-(?:content|includes)\/)/g, '%ASSET%/$1')
    .replace(/%BASE%\//g, '/')
    .replace(/&#0?38;|&amp;/g, '&');

// ------------------------------------------------------------ Markdown
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', '+': '⁺' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '-': '₋', '+': '₊' };
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '_', hr: '---' });
td.use(gfm);
td.addRule('sup', { filter: 'sup', replacement: (c) => (/^[\d+-]+$/.test(c) ? [...c].map((x) => SUP[x]).join('') : `^${c}`) });
td.addRule('sub', { filter: 'sub', replacement: (c) => (/^[\d+-]+$/.test(c) ? [...c].map((x) => SUB[x]).join('') : c) });
td.addRule('link', {
  filter: (n) => n.nodeName === 'A' && n.getAttribute('href'),
  replacement: (c, n) => (c.trim() ? `[${c.trim()}](${fixUrl(n.getAttribute('href'))})` : ''),
});
// (Turndown dá prioridade à última regra adicionada)
// ícones pequenos (e-mail, Lattes) viram links de texto
td.addRule('iconLink', {
  filter: (n) => n.nodeName === 'A' && n.querySelector('img') && Number(n.querySelector('img').getAttribute('width') || 99) <= 40,
  replacement: (_c, n) => {
    const src = n.querySelector('img').getAttribute('src') || '';
    const href = n.getAttribute('href') || '';
    const label = /email/i.test(src) ? 'E-mail' : /lattes/i.test(src) ? 'Currículo Lattes' : n.textContent.trim() || 'Link';
    return `[${label}](${fixUrl(href)})`;
  },
});
td.addRule('img', {
  filter: 'img',
  replacement: (_c, n) => `![${n.getAttribute('alt') || ''}](${fixUrl(n.getAttribute('src'))})`,
});
// h5/h6 do WordPress eram usados para listas de referências (viram títulos de 10px): passam a parágrafos
td.addRule('smallHeading', { filter: ['h5', 'h6'], replacement: (c) => (c.trim() ? `\n\n${c.trim()}\n\n` : '') });
td.remove(['script', 'style', 'noscript', 'form', 'button', 'input']);

const toMd = (html) =>
  td
    .turndown(html)
    .replace(/\u00a0/g, ' ')
    .replace(/^[ \t]+$/gm, '')
    .replace(/^#{1,6}\s*$/gm, '') // títulos vazios
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/\*\*([^*\n]+?)\*\*\*\*:\*\*/g, '**$1:**') // <strong>X</strong><strong>:</strong>
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// ------------------------------------------------------------ Blocos
const cleanText = (s) => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const num = (v) => (v ? Number(v) : undefined);

function imageOf($, el) {
  const img = $(el).find('img').first();
  if (!img.length) return null;
  const a = img.closest('a');
  return {
    src: fixUrl(img.attr('src')),
    alt: img.attr('alt') || '',
    width: num(img.attr('width')),
    height: num(img.attr('height')),
    href: a.length ? fixUrl(a.attr('href')) : undefined,
  };
}

// elemento que contém só uma imagem (opcionalmente com link) e nada de texto
const isImageOnly = ($, el) => {
  const $el = $(el);
  const img = $el.is('img') ? $el : $el.find('img');
  return img.length === 1 && cleanText($el.text()) === '' && Number(img.attr('width') || 999) > 40;
};

function parseSlider($, wrap) {
  const slides = $(wrap).find('.sa_hover_container').toArray();
  const hero = slides.some((s) => /background-image/.test($(s).attr('style') || ''));
  if (hero) {
    return {
      type: 'hero',
      slides: slides.map((s) => {
        const bg = /url\((?:&quot;|["'])?([^)"']+?)(?:&quot;|["'])?\)/.exec($(s).attr('style') || '');
        const cap = $(s).find('.carousel-caption');
        const a = cap.find('a').first();
        return {
          image: bg ? fixUrl(bg[1].replace(/&quot;/g, '')) : null,
          title: cleanText(cap.find('h1,h2,h3,h4').first().text()),
          text: cleanText(a.length ? a.text() : cap.find('p').first().text()),
          href: a.length ? fixUrl(a.attr('href')) : undefined,
        };
      }),
    };
  }
  return {
    type: 'carousel',
    items: slides.map((s) => ({ image: imageOf($, s), title: cleanText($(s).find('h1,h2,h3,h4').first().text()) })),
  };
}

function parseAccordion($, el) {
  const items = [];
  $(el)
    .find('.accordions-head')
    .each((_i, h) => {
      const title = cleanText($(h).find('.accordions-head-title').text());
      const content = $(h).nextAll('.accordion-content').first();
      items.push({ title, blocks: parseChildren($, content) });
    });
  return { type: 'accordion', items };
}

function parseRow($, row) {
  const cols = $(row).children('[class*="col-"]').toArray();
  if (!cols.length) return parseChildren($, row);
  // linha "logo/foto + texto" (instituições, projetos, equipe)
  if (cols.length === 2 && (isImageOnly($, cols[0]) || cleanText($(cols[0]).text()) === '') && cleanText($(cols[1]).text())) {
    const second = $(cols[1]);
    const title = cleanText(second.find('h1,h2,h3,h4').first().text());
    const btnEl = second.find('a.btn').first();
    const button = btnEl.length ? { label: cleanText(btnEl.text()), href: fixUrl(btnEl.attr('href')) } : undefined;
    const body = second.clone();
    body.find('h1,h2,h3,h4').first().remove();
    body.find('a.btn').closest('p').remove();
    return [{ type: 'entity', image: imageOf($, cols[0]), title, blocks: parseChildren($, body), button }];
  }
  return [{ type: 'columns', cols: cols.map((c) => parseChildren($, c)) }];
}

function parseChildren($, parent) {
  const blocks = [];
  let buf = [];
  let liBuf = [];
  const flushLi = () => {
    if (liBuf.length) buf.push(`<ul>${liBuf.join('')}</ul>`);
    liBuf = [];
  };
  const flush = () => {
    flushLi();
    const md = toMd(buf.join('\n'));
    if (md) blocks.push({ type: 'markdown', md });
    buf = [];
  };
  const push = (b) => {
    flush();
    if (Array.isArray(b)) blocks.push(...b);
    else if (b) blocks.push(b);
  };

  $(parent)
    .contents()
    .each((_i, node) => {
      if (node.type === 'text') {
        if (node.data.trim()) buf.push(node.data);
        return;
      }
      if (node.type !== 'tag') return;
      const $n = $(node);
      const tag = node.name;
      if (tag === 'script' || tag === 'style' || $n.attr('id') === 'xsbf-after-content' || $n.is('footer')) return;
      if (tag === 'li') {
        liBuf.push($.html(node));
        return;
      }
      flushLi();
      if ($n.find('.owl-carousel').length || $n.hasClass('owl-carousel')) return push(parseSlider($, node));
      if ($n.hasClass('ffs-tabbed-nav')) {
        const labels = $n.find('> ul.resp-tabs-list > li').toArray().map((l) => cleanText($(l).text()));
        const panels = $n.find('.fruitful_tab').toArray();
        return push({ type: 'tabs', tabs: panels.map((p, i) => ({ label: labels[i] || `Aba ${i + 1}`, blocks: parseChildren($, p) })) });
      }
      if ($n.hasClass('responsive-tabs')) {
        const tabs = [];
        $n.children().each((_j, c) => {
          if ($(c).hasClass('tabtitle')) tabs.push({ label: cleanText($(c).text()), blocks: [] });
          else if ($(c).hasClass('tabcontent') && tabs.length) tabs[tabs.length - 1].blocks = parseChildren($, c);
        });
        return push({ type: 'tabs', tabs });
      }
      if ($n.hasClass('accordions')) return push(parseAccordion($, node));
      if ($n.hasClass('row')) return push(parseRow($, node));
      if ($n.hasClass('wpcf7')) return push({ type: 'contact', lang: /^en/i.test($n.attr('lang') || '') ? 'en' : 'pt' });
      if (tag === 'p' && $n.find('a.ddownload-button').length) {
        const a = $n.find('a.ddownload-button').first();
        const title = cleanText($n.clone().find('a').remove().end().text()).replace(/:$/, '');
        return push({ type: 'download', title, label: cleanText(a.text()), href: fixUrl(a.attr('href')) });
      }
      if (tag === 'p' && $n.children('a.btn').length && cleanText($n.text()) === cleanText($n.children('a.btn').text())) {
        const a = $n.children('a.btn').first();
        return push({ type: 'button', label: cleanText(a.text()), href: fixUrl(a.attr('href')) });
      }
      if ((tag === 'figure' || tag === 'p' || tag === 'div') && isImageOnly($, node)) {
        const img = imageOf($, node);
        // banner "Clique aqui e baixe" (imagem sem alt) vira um botão de verdade
        if (/baixa(pt|en)\.png/.test(img.src) && img.href) {
          const en = /baixaen/.test(img.src);
          return push({ type: 'button', label: en ? 'Download the HAND Model' : 'Baixar o HAND Model', href: img.href, primary: true });
        }
        return push({ type: 'image', ...img });
      }
      if (tag === 'div' && !$n.attr('class')) {
        // div sem classe: só um invólucro, desce nele
        return push(parseChildren($, node));
      }
      buf.push($.html(node));
    });
  flush();
  // agrupa downloads consecutivos
  const out = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.type === 'download') {
      if (last && last.type === 'downloads') last.items.push(b);
      else out.push({ type: 'downloads', items: [b] });
    } else out.push(b);
  }
  return out;
}

// ------------------------------------------------------------ Páginas
const blocksText = (blocks) =>
  blocks
    .map((b) => {
      if (b.type === 'markdown') return b.md.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_>`-]/g, ' ');
      if (b.type === 'tabs') return b.tabs.map((t) => t.label + ' ' + blocksText(t.blocks)).join(' ');
      if (b.type === 'accordion') return b.items.map((t) => t.title + ' ' + blocksText(t.blocks)).join(' ');
      if (b.type === 'columns') return b.cols.map(blocksText).join(' ');
      if (b.type === 'entity') return [b.title, blocksText(b.blocks)].join(' ');
      if (b.type === 'hero') return b.slides.map((s) => `${s.title} ${s.text}`).join(' ');
      if (b.type === 'carousel') return b.items.map((s) => s.title).join(' ');
      if (b.type === 'downloads') return b.items.map((s) => `${s.title} ${s.label}`).join(' ');
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

// ------------------------------------------------------------ Limpeza
const assetExists = (u) => !u || !u.startsWith('%ASSET%/') || fs.existsSync(path.join(WP, decodeURIComponent(u.slice('%ASSET%/'.length))));
const imgOk = (img) => (img && assetExists(img.src) ? img : null);

/** Imagens inexistentes viram null (avatar com iniciais), e linhas "---" entre cards somem. */
function tidy(blocks) {
  const out = [];
  blocks.forEach((b, i) => {
    if (b.type === 'markdown' && b.md.trim() === '---') {
      const prev = blocks[i - 1], next = blocks[i + 1];
      if (prev?.type === 'entity' || next?.type === 'entity' || !next) return;
    }
    if (b.type === 'image' && !assetExists(b.src)) return;
    if (b.type === 'entity') { b.image = imgOk(b.image); b.blocks = tidy(b.blocks); }
    if (b.type === 'tabs') b.tabs.forEach((t) => (t.blocks = tidy(t.blocks)));
    if (b.type === 'accordion') b.items.forEach((t) => (t.blocks = tidy(t.blocks)));
    if (b.type === 'columns') b.cols = b.cols.map(tidy).filter((c) => c.length);
    if (b.type === 'carousel') b.items.forEach((t) => (t.image = imgOk(t.image)));
    if (b.type === 'markdown') b.md = b.md.replace(/!\[[^\]]*\]\((%ASSET%\/[^)\s]+)\)/g, (m, u) => (assetExists(u) ? m : ''));
    out.push(b);
  });
  return out;
}

/** Remove o título repetido no começo do conteúdo (a página já mostra o título). */
function dropRepeatedTitle(blocks, titles) {
  const first = blocks[0];
  if (first?.type === 'columns' && first.cols.length === 1) return dropRepeatedTitle([...first.cols[0], ...blocks.slice(1)], titles);
  if (first?.type !== 'markdown') return blocks;
  const norm = (s) => s.replace(/[_*#]/g, '').trim().toLowerCase();
  const lines = first.md.split('\n');
  // igual ao título, ou o começo dele ("Baixar" sob "Baixar HAND Model")
  if (/^#{1,6}\s/.test(lines[0]) && titles.some((t) => t && (norm(lines[0]) === norm(t) || norm(t).startsWith(norm(lines[0]) + ' ')))) {
    const md = lines.slice(1).join('\n').trim();
    return md ? [{ ...first, md }, ...blocks.slice(1)] : blocks.slice(1);
  }
  return blocks;
}

/** Remove títulos órfãos no fim (ex.: "Important Links" sem nada abaixo). */
function dropTrailingHeading(blocks) {
  const last = blocks[blocks.length - 1];
  if (last?.type === 'markdown') {
    const md = last.md.replace(/(\n*(---|#{1,6}\s[^\n]*)\s*)+$/, '').trim();
    if (md !== last.md.trim()) return md ? [...blocks.slice(0, -1), { ...last, md }] : dropTrailingHeading(blocks.slice(0, -1));
  }
  return blocks;
}

/** Hierarquia de títulos: a página tem o <h1>; o conteúdo começa em <h2> e não passa de <h4>. */
function normalizeHeadings(blocks) {
  let min = 7;
  const scan = (bs) => bs.forEach((b) => {
    if (b.type === 'markdown') for (const m of b.md.matchAll(/^(#{1,6})\s/gm)) min = Math.min(min, m[1].length);
    (b.blocks ? [b.blocks] : []).concat(b.tabs?.map((t) => t.blocks) ?? [], b.items?.map((t) => t.blocks ?? []) ?? [], b.cols ?? []).forEach(scan);
  });
  scan(blocks);
  if (min === 7) return;
  const shift = 2 - min;
  const fix = (bs) => bs.forEach((b) => {
    if (b.type === 'markdown') b.md = b.md.replace(/^(#{1,6})(\s)/gm, (_m, h, s) => '#'.repeat(Math.min(4, Math.max(2, h.length + shift))) + s);
    (b.blocks ? [b.blocks] : []).concat(b.tabs?.map((t) => t.blocks) ?? [], b.items?.map((t) => t.blocks ?? []) ?? [], b.cols ?? []).forEach(fix);
  });
  fix(blocks);
}

// Erros de digitação evidentes do conteúdo original (correções explícitas e documentadas)
const CONTENT_FIXES = [
  ['Brazilian scientst developes a fast method to preview floods', 'Brazilian scientist develops a fast method to preview floods'],
  ['Historia e Créditos', 'História e Créditos'],
];
const applyFixes = (obj) => {
  let s = JSON.stringify(obj);
  for (const [a, b] of CONTENT_FIXES) s = s.split(a).join(b);
  return JSON.parse(s);
};

// Conteúdo relacionado que no WordPress ficava sem nenhum link (páginas órfãs)
const RELATED = {
  307: '**Saiba mais:** [A física do HAND Model](/a-fisica-do-hand-model/) · [Equipe](/equipe/)',
  326: '**Learn more:** [The HAND Model Physics](/en/the-hand-model-physics/)',
};

// Fora da busca: post padrão do WordPress e página praticamente vazia
const NOT_IN_SEARCH = new Set([1, 1190]);

const NAV_OF_PAGE ={9: 9, 161: 161, 307: 307, 326: 326, 900: 900, 905: 905, 114: 114, 764: 764, 101: 101, 201: 201, 1073: 1073, 1075: 1075 };
const pages = [];
// Removidas a pedido: post padrão "Olá, mundo!" (1) e "Help Topics" quase vazia (1190); os endereços redirecionam ao início
const EXCLUDED = new Set([1, 1190]);
for (const [idStr, route] of Object.entries(routes)) {
  if (EXCLUDED.has(Number(idStr))) continue;
  const id = Number(idStr);
  const src = JSON.parse(fs.readFileSync(path.join(SRC, `${id}.json`), 'utf8'));
  const $ = cheerio.load(src.main);
  const article = $('article').first();
  const content = article.find('.entry-content').first();
  let blocks = parseChildren($, content.length ? content : article);
  // remove o rodapé de metadados do post ("Sem categoria")
  const lang = src.lang.startsWith('en') ? 'en' : 'pt';
  const title = src.title.replace(/ – HAND Model$/, '').replace(/ – Um novo olhar sobre a paisagem$| – A new look over the landscape$/, '');
  const headerTitle = cleanText(article.find('.entry-header .entry-title, header .entry-title').first().text());
  blocks = dropTrailingHeading(dropRepeatedTitle(tidy(blocks), [title, headerTitle]));
  normalizeHeadings(blocks);
  if (RELATED[id]) blocks.push({ type: 'markdown', md: RELATED[id] });
  // o formulário segue o idioma da página (o WordPress marcava todos como pt-BR)
  const setLang = (bs) => bs.forEach((b) => {
    if (b.type === 'contact') b.lang = lang;
    (b.blocks ? [b.blocks] : []).concat(b.tabs?.map((t) => t.blocks) ?? [], b.items?.map((t) => t.blocks ?? []) ?? [], b.cols ?? []).forEach(setLang);
  });
  setLang(blocks);
  // metadados de post (data e categoria), como no tema original
  const meta = cleanText(article.find('.entry-meta .posted-on').first().text());
  const cats = cleanText(article.find('.cat-links').first().text());
  if (meta || cats) blocks.unshift({ type: 'markdown', md: `_${[meta, cats].filter(Boolean).join(' · ')}_` });
  pages.push(applyFixes({
    id,
    route,
    lang,
    title: id === 9 || id === 161 ? 'HAND Model' : title,
    heading: headerTitle || null,
    sidebar: /id="secondary"/.test(src.main),
    nav: NAV_OF_PAGE[id] ?? null,
    alternate: { pt: fixUrl(src.langSwitch.pt || '%BASE%/'), en: fixUrl(src.langSwitch.en || '%BASE%/en/') },
    blocks,
  }));
}

fs.mkdirSync(path.join(ROOT, 'src/content'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/content/pages.json'), JSON.stringify(pages, null, 1));
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'public/search-index.json'),
  JSON.stringify(pages.filter((p) => !NOT_IN_SEARCH.has(p.id)).map((p) => ({ route: p.route, lang: p.lang, title: p.title, text: blocksText(p.blocks) }))),
);

// ------------------------------------------------------------ Arquivos
const want = new Set([
  'wp-content/themes/flat-bootstrap/img-inpe/logo_hand.png',
  'wp-content/uploads/2018/01/handlogo-3.png',
  'wp-content/uploads/2018/01/handlogo-3-150x150.png',
  'wp-content/uploads/2019/05/logo12018-300x75.png',
  'wp-content/uploads/2019/05/CCST_name-300x75.png',
  'wp-content/uploads/2019/05/inpe_name.png',
]);
const DOWNLOADS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/downloads.json'), 'utf8'));
for (const d of DOWNLOADS) want.add(`wp-content/uploads/delightful-downloads/${d.file}`);
const json = JSON.stringify(pages);
for (const m of json.matchAll(/%ASSET%\/(wp-content\/[^"')\s?#]+)/g)) want.add(decodeURIComponent(m[1]));
const missing = [];
for (const rel of want) {
  const from = path.join(WP, rel);
  if (!fs.existsSync(from)) {
    missing.push(rel);
    continue;
  }
  const to = path.join(ROOT, 'public', rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(to) || fs.statSync(to).size !== fs.statSync(from).size) fs.copyFileSync(from, to);
}
console.log(`páginas: ${pages.length}, arquivos: ${want.size - missing.length}`);
if (missing.length) console.log('ausentes no WordPress:\n  ' + missing.join('\n  '));
