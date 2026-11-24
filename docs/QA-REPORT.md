# QA — HAND Model (Astryx) — 23/11/2026

**Alvo:** `out/` servido em `http://localhost:4401/handmodel/` (mesmo prefixo do GitHub Pages) · **Ferramenta:** skill `site-qa` + auditoria de UI (`docs/UI-REVIEW.md`) · **Resultado:** ✅ aprovado com ressalvas

## Resumo

| Área | Resultado | Evidência |
|---|---|---|
| Páginas (17 de conteúdo + busca + 8 redirecionamentos + 404) | ✅ todas respondem | crawl-links: 27 páginas, 77 assets, 0 quebrados, 0 órfãs |
| Links e assets internos | ✅ | nenhum sem prefixo `/handmodel/`, nenhuma âncora inexistente |
| Downloads (9) | ✅ idênticos ao WordPress | compare-files: SHA-256 iguais |
| Fidelidade do texto | ✅ | 16/19 páginas com 100%; as 3 diferenças são intencionais (ver abaixo) |
| Console / rede | ✅ | 0 erros de JS, 0 requisições ≥ 400 em 10 rotas |
| Navegação | ✅ | menu sem recarga, troca de idioma, links legados `?page_id=`, `/login/` → download |
| Abas | ✅ | `#aba-N` abre a aba certa e é atualizado ao clicar |
| Formulários | ✅ | validação PT/EN; campos mantidos após abrir o e-mail |
| Celular (375 px) | ✅ | sem rolagem horizontal, logo visível, menu hambúrguer |
| Acessibilidade básica | ✅ | um `<h1>` por página, `lang` correto, hero com pausa e slides ocultos `inert` |
| Build / ferramentas | ✅ | `tsc`, `next build`, `astryx doctor --built out`: 0 falhas |

## Corrigido nesta rodada

| # | Problema | Correção |
|---|---|---|
| 1 | Rodapé do governo ("Acesso à informação") branco sobre fundo claro | `#footer-brasil` com o fundo escuro do rodapé, alinhado ao contêiner |
| 2 | Crédito "Tema original por Jeison Santiago" | removido (texto e código) |
| 3 | Faixa branca abaixo do rodapé em páginas curtas | rodapé saiu de dentro do `AppShell` (que tem altura mínima de uma tela) |
| 4 | Botão de download da página Modelo HAND era uma imagem sem texto alternativo | virou `Button` "Baixar o HAND Model" / "Download the HAND Model" |
| 5 | Referências renderizadas como títulos de 10 px (`h6`) | viraram parágrafos; hierarquia de títulos normalizada (H1 → H2 → H3) |
| 6 | Páginas sem link (A física do HAND Model, Equipe, The HAND Model Physics) | links "Saiba mais / Learn more" na página Modelo HAND |
| 7 | Home sem `<h1>`; 404 genérica sem `lang` | `<h1>` acessível na home; 404 própria bilíngue (`global-not-found`) |
| 8 | Hero: troca automática sem pausa, foco em slides ocultos, rótulos só em PT, pontos de 10 px | botão pausar/retomar, respeita "reduzir movimento", `inert`, rótulos por idioma, alvos de 32 px |
| 9 | Erros de digitação: "scientst developes", "Historia" sem acento, título vazio "Important Links" | corrigidos |
| 10 | "Ver Manual" forçava download do PDF | abre em nova aba |
| 11 | Busca travava no carregamento se o índice falhasse | estado de erro |
| 12 | Formulário apagava os campos e dizia "Agradecemos" mesmo sem e-mail aberto | mantém os campos e explica o que aconteceu |
| 13 | Badge verde de "sucesso" em versões beta; botões de download desalinhados | badge informativo; botões alinhados na base dos cards |
| 14 | Título repetido ("Baixar" sob "Baixar HAND Model"); linhas de ~170 caracteres | removido; largura de leitura de 78 caracteres |
| 15 | "Olá, mundo!" e "Help Topics" (quase vazia) publicadas sem link | removidas; endereços redirecionam ao início |

## Diferenças intencionais em relação ao WordPress
- "Leave a comment" (não há comentários num site estático), "Baixe…" → botões "Baixar", erros de digitação corrigidos.

## Herdado / fora do nosso controle
- Imagem sem `alt` do widget VLibras (injetado por `barra.brasil.gov.br/barra.js`).
- O link "pular para o conteúdo" vem depois dos links da barra do governo na ordem de tabulação.
- O slogan dentro da imagem do logo é pequeno no celular e está em inglês (é a arte original).
- "Olá, mundo!" e "Help Topics" (sobras do WordPress) foram removidas; `/ola-mundo/` e `/en/help-topics/` redirecionam ao início.
- "Projetos"/"Projects" no menu só dizem "Em breve…" (igual ao original).
- Citação "Novas Geotecnologias no Ordenamento do Ordenamento Territorial" parece ter uma palavra repetida — confirmar o título correto antes de mudar.

## Não testado
- Envio real de e-mail (o formulário só abre o programa de e-mail do visitante).
- Deploy real no GitHub Pages (testado localmente com o mesmo prefixo).
- Navegadores além do Chromium.
