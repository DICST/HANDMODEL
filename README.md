<div align="center">

<img src="public/wp-content/themes/flat-bootstrap/img-inpe/logo_hand.png" alt="HAND Model — A new look over the landscape" width="320">

# HAND Model

**Site oficial do HAND Model (Height Above the Nearest Drainage)**
Modelo digital de terreno normalizado pela rede de drenagem, desenvolvido no Brasil pelo INPE e pelo Cemaden.

[![Deploy](https://github.com/DICST/HANDMODEL/actions/workflows/deploy.yml/badge.svg)](https://github.com/DICST/HANDMODEL/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![Astryx](https://img.shields.io/badge/Astryx_Design_System-0.7-1b8aa3)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-estático-222?logo=github)

[**Acessar o site**](https://dicst.github.io/HANDMODEL/) · [**Baixar o HAND Model**](https://dicst.github.io/HANDMODEL/baixar-hand-model/) · [English](https://dicst.github.io/HANDMODEL/en/)

</div>

---

## Sumário

- [Sobre o HAND Model](#sobre-o-hand-model)
- [Sobre este repositório](#sobre-este-repositório)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Conteúdo e downloads](#conteúdo-e-downloads)
- [Publicação (GitHub Pages)](#publicação-github-pages)
- [Qualidade](#qualidade)
- [Como contribuir](#como-contribuir)
- [Créditos](#créditos)
- [Licença](#licença)

## Sobre o HAND Model

O **HAND** (*Height Above the Nearest Drainage* — altura acima da drenagem mais próxima) é um modelo digital de
terreno normalizado pela rede de drenagem. Ele representa, de forma fisicamente substanciada, o potencial gravitacional
relativo dos terrenos e permite explorar quantitativamente a topo-hidrologia da paisagem: movimento, acumulação,
infiltração, armazenamento e drenagem da água.

Aplicações incluem hidrologia, modelagem ambiental, previsão de áreas suscetíveis a enchentes e deslizamentos,
zoneamento de terrenos, ecofisiologia da paisagem, biogeoquímica e pedologia.

O projeto é coordenado por **Antonio Donato Nobre** (CCST/INPE) e **Luz Adriana Cuartas** (Cemaden).
Referência principal: Nobre, A. D. et al. (2011). *Height Above the Nearest Drainage – a hydrologically relevant new
terrain model.* Journal of Hydrology, 404, 13–29.

## Sobre este repositório

Este repositório contém a nova versão do site do HAND Model, migrada de WordPress para um **site estático** publicado no
**GitHub Pages**:

- todo o conteúdo do site original, em **português e inglês**, com as mesmas páginas e menus;
- **downloads livres** do programa (Linux, macOS e Windows) e dos manuais, sem necessidade de cadastro ou login;
- interface reconstruída com o **[Astryx Design System](https://astryx.atmeta.com/)**, acessível e responsiva;
- sem servidor, banco de dados ou PHP para manter.

## Funcionalidades

| | |
|---|---|
| 🌐 **Bilíngue** | Português e inglês, com troca de idioma que leva à página equivalente |
| ⬇️ **Downloads** | Versão 1.0 para Linux, macOS e Windows, versões anteriores e manuais (pt-BR e en) |
| 🔎 **Busca** | Busca no próprio navegador, sem servidor, tolerante a acentos |
| 📑 **Conteúdo rico** | Destaques, carrossel de aplicações, abas, perguntas frequentes em acordeão, equipe e instituições |
| ✉️ **Contato** | Formulário com validação que abre o e-mail do visitante (programa padrão, Outlook.com ou Gmail) |
| 📱 **Responsivo** | Layout para celular, tablet e desktop, com menu móvel |
| ♿ **Acessível** | Hierarquia de títulos, textos alternativos, foco por teclado, destaque com pausa e "reduzir movimento" |
| 🔗 **Links antigos preservados** | Endereços do WordPress (`?page_id=…`, `?ddownload=…`, `/login/`) redirecionam para as páginas novas |
| 🇧🇷 **Barra do Governo Federal** | Barra e rodapé institucionais do gov.br |

## Tecnologias

- **[Next.js 16](https://nextjs.org/)** com exportação estática (`output: 'export'`)
- **[React 19](https://react.dev/)** e TypeScript
- **[Astryx Design System](https://astryx.atmeta.com/)** (Meta) — componentes, tema `hand` e i18n pt-BR
- **[Heroicons](https://heroicons.com/)** — ícones
- **GitHub Actions + GitHub Pages** — build e publicação automáticos

## Começando

Pré-requisito: **Node.js 24** (ou 20+).

```bash
git clone https://github.com/DICST/HANDMODEL.git
cd HANDMODEL
npm install
npm run dev
```

O site abre em `http://localhost:3000/handmodel/` (o prefixo imita o endereço do GitHub Pages).

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Gera o site estático em `out/` (inclui o pós-build para o GitHub Pages) |
| `npm run serve` | Serve `out/` em `http://localhost:4400/handmodel/`, exatamente como no GitHub Pages |
| `npm run doctor` | Verificação do Astryx sobre o build |
| `npm run convert` | Regera o conteúdo (`src/content/pages.json`) a partir de `scripts/source/` |

Para testar com outro prefixo, defina `BASE_PATH` antes do build (no PowerShell: `$env:BASE_PATH="/HANDMODEL"; npm run build`).

## Estrutura do projeto

```
├── .github/workflows/deploy.yml   Build e publicação no GitHub Pages
├── public/                        Arquivos estáticos (imagens e downloads, mesmos caminhos do WordPress)
│   └── wp-content/uploads/delightful-downloads/   Programas e manuais
├── scripts/
│   ├── source/                    HTML original de cada página do WordPress (fonte do conteúdo)
│   ├── convert.mjs                Converte o HTML em blocos estruturados + índice de busca
│   ├── postbuild.mjs              Ajusta o export do Next para servidores estáticos
│   └── serve.mjs                  Servidor local com o prefixo do GitHub Pages
├── src/
│   ├── app/                       Rotas (um layout por idioma: (pt) e (en)), 404 global, CSS global
│   ├── components/                SiteShell (cabeçalho e rodapé), Blocks (renderiza o conteúdo), formulários, busca
│   ├── content/                   pages.json (páginas em blocos) e downloads.json (metadados dos arquivos)
│   ├── lib/                       Menus, textos por idioma, rotas e utilitários
│   └── themes/hand/               Tema Astryx gerado (azul-petróleo #1b8aa3)
├── themes/hand/                   Fonte do tema (editado com o editor de temas do Astryx)
└── docs/                          Relatórios de QA e de auditoria de UI
```

### Como o conteúdo é renderizado

O conteúdo de cada página fica em `src/content/pages.json` como uma lista de **blocos**. O componente
`src/components/Blocks.tsx` transforma cada bloco num componente do Astryx:

| Bloco | Componente |
|---|---|
| `markdown` | `Markdown` (textos, listas, links, imagens) |
| `hero` | destaque com slides, pausa e indicadores |
| `carousel` | `Carousel` |
| `tabs` | `TabList` + painéis (endereço `#aba-N` compartilhável) |
| `accordion` | `CollapsibleGroup` + `Collapsible` |
| `entity` | `Card` com logo ou `Avatar` (instituições, projetos, equipe) |
| `downloads` | `Grid` de `Card` com versão, tamanho e botão de download |
| `contact` | `FormLayout` + `TextInput` / `TextArea` |

## Conteúdo e downloads

**Editar um texto:** altere o bloco correspondente em `src/content/pages.json` (o texto está em Markdown) e rode
`npm run build`. Se preferir reconverter tudo a partir do HTML original, edite `scripts/source/<ID>.json` e rode
`npm run convert`.

**Publicar uma nova versão do programa:**

1. Coloque o arquivo em `public/wp-content/uploads/delightful-downloads/<ano>/<mês>/`.
2. Registre-o em `src/content/downloads.json` (plataforma, versão, `current: true` e tamanho em bytes).
3. Aponte o botão da página de download para o novo arquivo em `src/content/pages.json`.

| Arquivo | Conteúdo |
|---|---|
| `2019/03/HANDMODEL_Linux.7z` | HAND Model 1.0 beta — Linux |
| `2019/06/HANDMODEL.app.7z` | HAND Model 1.0 beta — macOS |
| `2019/03/release.rar` | HAND Model 1.0 beta — Windows |
| `2018/02/HAND-Model.pdf` | Manual do usuário (pt-BR) |
| `2018/05/HAND-Model.pdf` | User guide (en) |
| `2018/05/buildHand.tar.gz`, `2018/05/buildHandMac.zip` | Versões 0.8.1 beta (Linux, macOS) |
| `2018/04/HAND.dmg`, `2018/04/HAND_WIN_VERSION.zip` | Versões 0.6.4 (macOS, Windows) |

> O GitHub aceita arquivos de até **100 MB**; o maior arquivo atual tem ~30 MB e o site inteiro ~176 MB.

**Formulário de contato:** o destinatário fica em `src/components/ContactForm.tsx` (constante `TO`).

## Publicação (GitHub Pages)

A publicação é automática a cada `push` na branch `main`:

1. Em **Settings → Pages**, em **Build and deployment → Source**, escolha **GitHub Actions** (uma única vez).
2. O workflow [`deploy.yml`](.github/workflows/deploy.yml) instala as dependências, gera o site com
   `BASE_PATH=/<nome-do-repositório>` e publica em `https://<organização>.github.io/<repositório>/`.
3. Para um domínio próprio (ex.: `handmodel.ccst.inpe.br`), configure-o em **Settings → Pages → Custom domain** e
   altere `BASE_PATH` para `/` no workflow.

> GitHub Pages em repositório **privado** exige plano pago da organização (GitHub Team ou Enterprise).

## Qualidade

Antes de publicar, o projeto passa por:

- `tsc` (TypeScript), `next build` e `astryx doctor --built out` sem falhas;
- verificação de links e arquivos em todas as rotas, com o prefixo do GitHub Pages;
- comparação dos downloads com os originais (SHA-256);
- testes de navegação, formulários, busca, idiomas e layout em celular e desktop.

Os relatórios estão em [`docs/QA-REPORT.md`](docs/QA-REPORT.md) e [`docs/UI-REVIEW.md`](docs/UI-REVIEW.md).

## Como contribuir

1. Crie uma branch a partir da `main`: `git checkout -b minha-alteracao`.
2. Faça a alteração e confira localmente com `npm run build` e `npm run serve`.
3. Abra um *pull request* descrevendo o que mudou; a publicação acontece quando ele for integrado à `main`.

## Créditos

**Coordenação do HAND Model:** Antonio Donato Nobre (CCST/INPE) e Luz Adriana Cuartas (Cemaden).

**Instituições:** [INPE](http://www.inpe.br/) · [CCST](http://www.ccst.inpe.br/) · [Cemaden](https://www.cemaden.gov.br/) ·
[INPA](http://portal.inpa.gov.br/) · [FURB](http://www.furb.br/)

**Financiamento:** projeto GeoClima (CNPq), Modelo Brasileiro do Sistema Terrestre (BESM — Rede Clima) e Cemaden.

A lista completa de autores, colaboradores e projetos está na página
[História e Créditos](https://dicst.github.io/HANDMODEL/historia-e-creditos/).

## Licença

O código deste site está disponível para uso das instituições do projeto. O conteúdo (textos, imagens, logotipos,
programas e manuais do HAND Model) pertence aos seus autores e instituições. Ao usar o HAND Model em trabalhos
científicos, cite Nobre et al. (2011), Nobre et al. (2015) ou Cuartas et al. (2012), conforme a aplicação.
