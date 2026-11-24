# HAND Model site — UI Review (standalone 6-pillar audit)

**Audited:** 2026-11-23
**Baseline:** Abstract 6-pillar standards (there is no UI-SPEC). Astryx conventions from AGENTS.md: tokens, not raw hex/px.
**Screenshots:** Taken with headless Chromium against `http://localhost:4401/handmodel/` at 1440x900, 375x812 and 320x700. There are 18 routes per viewport, plus a keyboard-focus walk and a contrast probe. The PNGs are in the session scratchpad, not in the repo.
**Registry audit:** Skipped (there is no `components.json` and no shadcn).

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 2/4 | Typos in the EN hero, "Historia" without its accent in the nav and H1, "Em breve…" / "Coming soon…" pages in the main nav, a WordPress "Olá, mundo!" placeholder that is still published, and a stray "Important Links" heading with nothing under it |
| 2. Visuals | 2/4 | The home page has no H1. The main download CTA on Modelo HAND is a raster image with empty alt. The full-bleed logo does not line up with the 1140px content column |
| 3. Color | 3/4 | The accent is used with restraint and the contrast probe found no failures. But globals.css has 6 raw hex values and 4 rgba values. The bright-blue partner logos clash with the ink footer. A green "success" Badge marks *beta* builds |
| 4. Typography | 2/4 | Citations are rendered as markdown H6 at **10px**. Heading levels skip (H1 to H3/H4/H6). Body lines run to about 170 characters at desktop width |
| 5. Spacing | 2/4 | Short pages show a white band between the site footer and the gov footer. globals.css hard-codes about 50 px values. Entity cards waste 180px. Download cards have ragged button rows |
| 6. Experience Design | 2/4 | The physics pages are orphans. The hero auto-rotates with no pause control, and its hidden slides keep focusable links. Hero dots are 10x10px. The contact form shows "sent" even if no mail client opens. "Ver Manual" forces a download |

**Overall: 13/24**

Known issues the main session is already fixing (only recorded here):
- (K1) The barra.js gov footer showed white "Acesso à informação" on a light background. In the current build `#footer-brasil` already has the ink background (globals.css:63-66). See S1 for the gap that remains.
- (K2) The "Tema original por Jeison Santiago" credit. It no longer shows in the current build, but `T.pt.theme` / `T.en.theme` (src/lib/site.ts) and the `<AxLink href="http://jeisonsantiago.com">` in SiteShell.tsx `Footer` are still in the source. Delete both so it cannot come back.

---

## Top Priority Fixes (ranked by user impact)

1. **[BLOCKER] The main download CTA on `/modelo-hand/` and `/en/hand-model/` is an image link with no accessible name** (`pages.json` image block `baixapt.png` / EN equivalent with `alt: ""` and `href: /baixar-hand-model/`). Screen readers announce only "link" and the text in the image cannot be translated or zoomed. **Fix:** in pages.json, replace the `image` block with `{ "type": "button", "label": "Baixar o HAND Model", "href": "/baixar-hand-model/" }` (EN: "Download the HAND Model"). This uses the existing `button` case in Blocks.tsx. Or, at minimum, set `alt` to the call-to-action text.
2. **[BLOCKER] Citations are rendered as 10px H6 headings** on `/modelo-hand/`, `/en/hand-model/`, `/historia-e-creditos/` (História tab) and `/en/about/`. That is 4–6 entries per page at 10px/600, which is unreadable and makes the outline meaningless. **Fix:** in pages.json, turn every `###### [Author…](url). Title…` line into a plain paragraph or a list item (`- [Author…](url). Title…`). The `/referencias/` page already does this correctly. Make "#### Referências" `## Referências`.
3. **[BLOCKER] Good content is unreachable:** `/a-fisica-do-hand-model/` and `/en/the-hand-model-physics/` (about 5 KB of core science content each) and `/equipe/` have **zero inbound links**; only site search finds them. Meanwhile "Projetos" / "Projects" in the **main nav** lead to a page that only says "Em breve…" / "Coming soon…". **Fix:** in `MENUS` (src/lib/site.ts), swap the Projetos/Projects item for "A física do HAND" / "HAND Physics", or add the physics page as a second link on Modelo HAND. Hide `projetos/` and `en/projects/` until they have content.
4. **[WARNING] The home page has no H1.** Both hero slides render `<h2>HAND Model</h2>`, so the outline starts at two identical H2s. **Fix:** PageView.tsx, for `isHome`: render a visually hidden or visible `<Heading level={1}>HAND Model – {tagline}</Heading>` above the hero. Change the slide titles in `Hero` (Blocks.tsx) from `<h2>` to `Text type="display-…"` or a `<p>`, so hidden slides do not add headings.
5. **[WARNING] The hero carousel breaks keyboard and motion accessibility** (Blocks.tsx `Hero`). (a) It auto-advances every 6 s with no pause/stop control (WCAG 2.2.2). (b) Inactive slides are `aria-hidden` but their `AxLink` stays focusable, so focus can land on an invisible link. (c) The dots are 10x10px (WCAG 2.5.8 needs at least 24x24) and the focus ring is the browser default 1px outline on a dark photo. (d) The labels "Destaques" and "Slide N" are hard-coded in PT on EN pages. **Fix:** add a pause button and pause on hover/focus-within. Put `inert` on inactive slides instead of only `aria-hidden`. Make the dots 24px hit areas with a 2px `var(--color-border-focus)`-style ring. Localise the labels through `T[lang]`.
6. **[WARNING] Typos and copy defects on the most visible strings:** the EN hero says "Brazilian scien**tst** develop**es** a fast method to **preview** floods". It should be "Brazilian scientist develops a fast method to predict floods". The nav, page title and H1 say "Historia e Créditos" when it should be "**História** e Créditos" (MENUS in site.ts and the page title in pages.json id 101). The EN home ends with an empty "### Important Links" section (pages.json id 161, last markdown block), so delete it or add the links.
7. **[WARNING] White band between the site footer and the gov footer on short pages** (`/projetos/`, `/en/projects/`, `/en/help-topics/`, `/ola-mundo/`, `/contato/` at tall viewports). The AppShell ends, `body` shows white, and then `#footer-brasil` starts at the bottom. It looks broken. **Fix:** make the AppShell area grow so the footers touch. For example, `body { display:flex; flex-direction:column; min-height:100dvh }` with the Providers wrapper set to `flex:1`. Or give `body` the ink background below the shell. Also align `#footer-brasil` content with `.hand-container`: the "Acesso à informação" logo starts at x≈260 while the content starts at x≈166.

---

## Detailed Findings

### Pillar 1: Copywriting (2/4)

- **WARNING:** EN hero slide 1 has typos ("scientst", "developes", "preview" where "predict" is meant). See pages.json id 161 `hero.slides[0].text`.
- **WARNING:** "Historia e Créditos" is missing its accent in MENUS (src/lib/site.ts), in the page title/H1 (pages.json id 101) and in `<title>`. It should be "História e Créditos".
- **WARNING:** "Em breve…" and "Coming soon…" are the only content of `projetos/` and `en/projects/`, yet both are in the primary nav. A placeholder in the main nav reads as an abandoned site. Remove them from the nav or add content.
- **WARNING:** `/ola-mundo/` publishes the WordPress default post ("Bem-vindo ao WordPress. Esse é o seu primeiro post…") and it is in `search-index.json`, so a search for "hand" can surface it. `/en/help-topics/` contains only "### HAND Help Topics" and is also indexed. **Fix:** remove both from pages.json (or leave them out of the build and the search index). If old URLs must survive, add redirects.
- **WARNING:** Several headings duplicate the heading right above them:
  - `/baixar-hand-model/`: H1 "Baixar HAND Model" is followed by H3 "Baixar". Delete the "### Baixar" block.
  - `/modelo-hand/`: H1 "Modelo HAND" is followed by H2 "O HAND model", which is also mixed-case PT/EN. Delete it or rename it to "Sobre o programa".
  - `/en/help-topics/`: H1 "Help Topics" is followed by H3 "HAND Help Topics".
  - `/contato/` and `/en/contact/`: H1 "Contato" is followed by H2 "Fale conosco".
  - `/historia-e-creditos/`: the tab label "Perguntas Frequentes" is followed by a panel heading "### _Perguntas Frequentes_". The same pattern repeats in the other tabs.
- **WARNING:** Mixed languages:
  - The logo image always shows the EN tagline "A new look over the landscape", even on PT pages. Use a PT logo variant or a tagline-free logo.
  - The logo link's `aria-label="HAND Model – início"` is hard-coded in PT on EN pages (SiteShell.tsx). Use `T[lang].home`.
  - The hero `aria-label="Destaques"` and the carousel `aria-label="Aplicações"` (Blocks.tsx) are PT on EN pages.
  - "O HAND model" is a PT sentence-case heading with an English noun.
- **WARNING:** pages.json has the typo "Novas Geotecnologias no _Ordenamento_ do Ordenamento Territorial" (duplicated word, on `/referencias/` and `/en/references/`).
- Minor:
  - EN contact intro "Contact us for better information and suggestions:" is awkward. Use "Questions or suggestions? Write to the HAND Model team:".
  - The EN form button is the generic "Submit". Use "Send message".
  - "Terrains Zoning" should be "Terrain Zoning".
  - "MacOS" / "MAC OS" / "MacOS" are inconsistent. Use "macOS".
- Minor: the sidebar CTA repeats its heading exactly ("Baixar HAND Model" heading, then "Baixar HAND Model" button). Use the heading "Baixe o HAND Model" with a "Ir para downloads" button, or drop the heading and keep the platform line.
- OK: there is a search empty state ("Nada encontrado / Tente novamente com outras palavras."), and form errors are specific.

### Pillar 2: Visuals (2/4)

- **BLOCKER:** The image-as-button CTA (`baixapt.png`, 900x76, "Clique aqui e baixe o HAND MODEL") has empty alt. It is low-resolution raster text and does not match the Astryx Button style used everywhere else. See Top fix 1.
- **WARNING:** The home page has no H1 (the DOM probe found `h1: 0`) and two identical `<h2>HAND Model</h2>` slide titles. Neither slide gives a visual focal point beyond the photo.
- **WARNING:** The header is full-bleed while the content is centred at 1140px. At 1440px the logo sits at x=8 and the content at x=166. The two left edges do not align, so the page looks unanchored. **Fix:** constrain the TopNav content to the same max width, or use the AppShell/TopNav width prop if one exists (check `npx astryx --dense component TopNav`).
- **WARNING:** The partner logos in the footer (CCST and INPE are saturated #2a6ad8-style blue rectangles; Cemaden is transparent) look mismatched on the `--hand-ink` background. **Fix:** put the three logos on white tiles of the same size (`Card` with `padding={3}`), or use monochrome/white versions.
- **WARNING:** Entity cards on `/equipe/` have a fixed 180px media column with a 96px Avatar centred in it, which leaves a big gap before the name (globals.css `.hand-entity-media`). Use `width: auto` or Astryx `Item`/`List` rows (AGENTS.md: "Dense data = rows").
- **WARNING:** On mobile (375px) the logo tagline renders at about 6px and is illegible (logo is 132x36, from a 548x150 image). Use a tagline-free logo below 760px.
- **WARNING:** On mobile the VLibras widget (gov script) covers the hero dots and, on long pages, body text at the right edge. It comes from a third party, but you can avoid the hero overlap by moving the dots to the left or the bottom-centre.
- Minor: the "Ver Manual" (PDF) card uses the same download icon as the binary downloads. Use `DocumentTextIcon` or `EyeIcon` on the button.
- Minor: the Applications carousel crops the 6th item with only a small `>` control as the affordance. That works, but the label "E…" is cut mid-word at 1440px.
- OK: icon-only buttons have labels ("Buscar", "Abrir navegação"). Cards and Tabs follow Astryx styling.

### Pillar 3: Color (3/4)

- The contrast probe (text against computed background on home, projetos, baixar, contato, equipe) found **no WCAG AA failures**. The accent #1b8aa3 is limited to primary buttons, links, the selected tab and the teal sidebar card, so the 60/30/10 split holds: white body, ink footer, teal accent.
- **WARNING:** globals.css has raw colours where the Astryx rule calls for tokens: `#0f2f3a` (`--hand-ink`), `#cfe3e8`, `#e6f7fb` x2, `#f5f7f8`, `#fff` x4, and 4 `rgba(...)` (hero gradient, dots, footer border, gov border). **Fix:** move the ink and footer colours into the `hand` theme (`astryx experimental theme editor set hand …`) and reference `var(--color-*)` tokens. Keep raw values only for the photo gradient.
- **WARNING:** Downloads (Blocks.tsx `Downloads`) use a green `Badge variant="success"` for "v1.0 beta". Green signals "stable/OK" on a beta build, and AGENTS.md says "Badge = counts only". **Fix:** use plain `Text type="supporting"` or a neutral `Token` label for the version, and say "beta" in the text.
- Minor: the inline `#7F7F7F` / `#EDEDED` / `white` in RootDocument.tsx is the required gov-bar placeholder before barra.js loads. That is acceptable, but the `.hand-gov { background:#fff }` rule then fights the inline `#7F7F7F`. Pick one.
- Minor: search result titles set `style={{ color: 'var(--color-text-accent)' }}` on a Next `Link` (SearchPage.tsx). Use the Astryx `Link` with the Next link via `as` so hover and focus styling come from the theme.

### Pillar 4: Typography (2/4)

Rendered heading sizes and weights (from the DOM probe at 1440px): H1 29px/600 · H2 20px/600 (component) · hero H2 38.4px/700 · markdown H3 17px/700 · H4 14px/700 · H5 12px/600 · **H6 10px/600**. That is 7 sizes and 3 weights for headings alone.

- **BLOCKER:** Citations are written as `######` and render at 10px/600 on `/modelo-hand/`, `/en/hand-model/`, `/historia-e-creditos/` and `/en/about/` (6 per page in História). See Top fix 2.
- **WARNING:** Heading levels skip and invert:
  - `/historia-e-creditos/` goes H1, then H3 "Breve histórico…" (17px *italic*), H4, H5 "por Antonio Donato Nobre" (12px, a byline marked up as a heading), H4 "Referências", H6.
  - `/baixar-hand-model/` goes H1 then H3.
  - The H4 "Referências" at 14px is *smaller* than the 16px body text.

  **Fix:** in pages.json, shift each page's markdown headings so the first content heading is `##`. Make bylines plain italic paragraphs (`_por Antonio Donato Nobre_`). Remove the `_…_` emphasis from headings. A systematic option is to remap levels in `Md` (Blocks.tsx): map h3→h2, h4→h3, and render h5/h6 as `Text weight="semibold"`, using the Markdown `components` prop already in use.
- **WARNING:** The download page uses bold paragraphs ("**Descrição:**", "**Requisitos recomendados…**", "**Versões anteriores:**") as section titles. They do not appear in the outline and sit at body size, so the page has no scannable hierarchy. Make them `## Descrição`, `## Requisitos`, `## Versões anteriores`.
- **WARNING:** Lines are too long. Pages without a sidebar (home, `/modelo-hand/`, `/historia-e-creditos/`, `/en/about/`) set body text across the full 1108px column, about 160–175 characters per line (the comfortable range is 60–80). **Fix:** cap prose width in `Md` with `<Markdown contentWidth="72ch">` (it currently passes `"100%"`). Keep tabs, cards and downloads full-width.
- Minor: the hero title uses a hand-rolled `clamp(1.6rem,3vw,2.4rem)` and weight 700 (globals.css `.hand-hero-caption h2`), while every other display heading uses Astryx `type="display-3"` at weight 600. Use `Heading type="display-2"` with `color="inherit"`.

### Pillar 5: Spacing (2/4)

- **WARNING:** The white band between the footers on short pages is visible on 4+ routes. See Top fix 7.
- **WARNING:** globals.css hard-codes about 50 px values (`padding-block: 32px 56px`, `gap: 32px`, `padding: 28px 32px`, `gap: 24px`, `top: 88px`, `margin-top: 24px`, `padding-block: 16px`, and others). They happen to sit on a 4/8 grid, but they bypass the theme's spacing scale, so a theme density change will not reach the main frame. **Fix:** replace them with `var(--spacing-N)` tokens, or use `VStack`/`Grid` `gap`/`padding` props for `.hand-main`, `.hand-with-sidebar`, `.hand-partners` and `.hand-footer-bottom`.
- **WARNING:** On the downloads grid (`/baixar-hand-model/`, "Versões anteriores"), cards of different heights leave their buttons on different baselines. The Windows card wraps its file name onto a second line, so its "Baixar" button sits 28px lower than its neighbours. In the top row the Windows card's meta line fits on one line, so its button sits higher than Linux/macOS. **Fix:** make each card a full-height `VStack` and push the Button to the bottom (`marginBlockStart: auto`, or a `Spacer` if Astryx has one). Or move the filename to its own line in every card.
- **WARNING:** On `/equipe/`, the 180px media column (`.hand-entity-media`) plus `gap={5}` leaves about 120px of dead space between the avatar and the text.
- Minor: the Accordion uses `style={{ paddingInline: 'var(--spacing-4, 16px)' }}` on `CollapsibleGroup`. Check `npx astryx --dense component CollapsibleGroup` for a padding prop, or wrap it in `Card padding={4}` instead of `padding={0}`.
- Minor: `PageHeader` has `paddingBlockEnd={6}`, and `Blocks` stacks use `gap={4}`. A markdown heading block that directly follows the page header (for example "O HAND model") sits 24px + margin below the H1, but only 16px from the paragraph after it, so the spacing rhythm is inconsistent.
- OK: there is no horizontal overflow at 375px or 320px (scrollWidth equals the viewport on every tested route). Tabs scroll horizontally, as intended.

### Pillar 6: Experience Design (2/4)

- **BLOCKER:** Orphan pages: `/a-fisica-do-hand-model/`, `/en/the-hand-model-physics/` and `/equipe/` have no inbound links. The content of `/equipe/` is duplicated by the "Equipe" tab on História e Créditos. See Top fix 3. Point `/equipe/` to `/historia-e-creditos/#aba-3`, or link it from there.
- **WARNING:** Hero carousel problems: auto-rotation with no pause, focusable links inside `aria-hidden` slides, 10px dots and a weak focus ring. See Top fix 5.
- **WARNING:** Contact form (ContactForm.tsx):
  - After submit it **always** shows the success Banner "Agradecemos a sua mensagem…" and clears the fields, even when no mail client is configured (common on webmail-only machines). The user's text is lost and nothing was sent. **Fix:** keep the field values. Change the banner to an info status: "Abrimos seu programa de e-mail. Se nada aconteceu, escreva para <address>", with a copy button or a visible `mailto:` link.
  - The recipient is a personal bolsista address hard-coded in the component. Move it to `site.ts` and use a team or role address.
- **WARNING:** On `/baixar-hand-model/`, the "Ver Manual" button uses `DownloadAnchor` (`download` attribute), so the PDF is forced to download instead of opening as the label says. **Fix:** use `PlainAnchor` with `target="_blank"` for `.pdf` files (`isDoc`).
- **WARNING:** Search (SearchPage.tsx) calls `fetch(search-index.json)` with no `.catch`. If the fetch fails (wrong base path, offline), the user sees a permanent `Spinner`. **Fix:** catch the error and show `EmptyState` with an error message and a retry button.
- **WARNING:** Keyboard path: the AppShell skip link "Pular para o conteúdo" is only the **9th** Tab stop, because the gov bar's 7 links plus 1 empty-name link come first. Also, `SiteShell` renders `<div id="top" />` and the skip link target is not obviously `main`. **Fix:** insert a skip link of your own as the first child of `body` in RootDocument.tsx, before `#barra-brasil`, pointing to `#conteudo`. Put `id="conteudo"` on `<main className="hand-main">` in PageView.tsx and SearchPage.tsx.
- **WARNING:** Mobile tap targets in the header: search icon 28x28, "English" 69x28, menu 32x32. These pass WCAG 2.5.8 (24px) but fall short of the 44px touch guideline. Use `size="md"` for these Buttons below 760px.
- **WARNING:** The tabs on `/historia-e-creditos/` and `/en/about/` read `#aba-N` on load, but they never write the hash when a tab changes. Users cannot share or bookmark a tab, and Back does not return to the previous tab. **Fix:** in `Tabs` `onChange`, call `history.replaceState(null, '', '#aba-' + (k + 1))`. On mobile only 3 of the 7 tabs are visible. Consider `overflow="menu"` if TabList supports it (`npx astryx --dense component TabList`).
- Minor: `aria-label={t.partners}` on a plain `div` (`.hand-partners`) is ignored by assistive tech. Use `<section aria-label>` or a visible "Realização" heading.
- Minor: the mobile nav drawer lists only the 6 menu items. The language switch and search stay in the header bar, which is fine, but the drawer has no "Baixar HAND Model" entry. The main conversion action is reachable on mobile only from the sidebar card, which sits *below* the article.
- OK: there is a search empty state, inline form validation with specific messages, a Spinner while searching, `lang` is set correctly per tree (`pt-BR` / `en-US`), and every rendered `<img>` has an `alt` attribute. The empty alt on decorative carousel icons is appropriate.

---

## Files Audited

- C:\laragon\www\handmodel-astryx\src\components\SiteShell.tsx
- C:\laragon\www\handmodel-astryx\src\components\Blocks.tsx
- C:\laragon\www\handmodel-astryx\src\components\PageView.tsx
- C:\laragon\www\handmodel-astryx\src\components\SearchPage.tsx
- C:\laragon\www\handmodel-astryx\src\components\ContactForm.tsx
- C:\laragon\www\handmodel-astryx\src\components\RootDocument.tsx
- C:\laragon\www\handmodel-astryx\src\app\globals.css
- C:\laragon\www\handmodel-astryx\src\lib\site.ts
- C:\laragon\www\handmodel-astryx\src\content\pages.json (all 19 pages: heading-level and alt-text scan)
- C:\laragon\www\handmodel-astryx\out\ (built HTML, search-index.json, inbound-link scan)
- Rendered routes at 1440 / 375 / 320px: home, modelo-hand, projetos, referencias, historia-e-creditos, contato, baixar-hand-model, a-fisica-do-hand-model, equipe, ola-mundo, busca?s=hand, login, cadastro, en/, en/projects, en/help-topics, en/about, en/hand-model
