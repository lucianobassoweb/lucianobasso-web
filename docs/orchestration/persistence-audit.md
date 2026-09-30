# Auditoria delimitada de persistência — 1903

Base: branch `codex/1903-seven-careers-20260930`, commit `aa17bef`. Escopo: `src/core/persistence.ts`, inicialização e handlers de `src/app.ts`, compatibilidade com o código publicado de `main` (hotfix 0.1.4). Leitura de `AGENTS.md`, protocolo, especificação integral e decisões recentes do log. Nenhum arquivo do jogo, configuração, log, branch ou save real foi alterado.

Resultado: três riscos reproduzidos em VM com armazenamento e DOM em memória. A compatibilidade básica de cinco estados gerados pelo código real da 0.1.4 passou. A suíte já aprovada pelo principal não foi repetida.

## 1. P1 — Falha de gravação interrompe a ação e deixa tela, memória e disco divergentes

**Causa/evidência:** `src/core/persistence.ts:4` chama `localStorage.setItem` sem captura ou resultado explícito. Em `src/app.ts:81`, `:82`, `:83` e `:84`, o motor altera `save` antes de gravar e renderizar. A exceção impede `render()`; na escolha, pode também impedir o `advanceCareer()` seguinte. `clearSave()` tem a mesma ausência de captura em `src/core/persistence.ts:5`, usado em `src/app.ts:86`.

**Reprodução comprovada:** stub de `setItem` lançando `QuotaExceededError` ou `SecurityError`; clicar em criar altera `save` em memória, mantém a tela de criação e não persiste nada. Partindo de uma introdução válida, clicar em avançar com quota excedida deixa o evento `position-2026` em memória, enquanto a tela e o armazenamento permanecem em `intro`. Stub de `removeItem` lançando `SecurityError` também aborta a exclusão antes de limpar estado/tela. Se `getItem` lança `SecurityError`, a captura em `loadSave()` apresenta criação; a criação falha depois na escrita.

**Impacto:** aparência de travamento, escolhas invisíveis e perda do progresso em memória ao recarregar. O hotfix 0.1.4 publicado possuía captura em `storeSave`/`clearSave` no seu `index.html`; a remoção dessa captura constitui regressão comprovada no tratamento de erros, embora o fallback antigo não garantisse durabilidade.

## 2. P1 — JSON estruturalmente inválido passa pela carga e impede a inicialização

**Causa/evidência:** `src/core/persistence.ts:3` valida apenas `version`, convertendo o JSON para `SaveGame` por cast sem validação de estrutura. `src/app.ts:10` aceita esse objeto, `:88` renderiza imediatamente e `:63` acessa `player.currentClubId`.

**Reprodução comprovada:** colocar `{"version":"0.1.0-playable.2"}` na chave `1903.save.playable2` do stub. A carga aceita o objeto; a primeira renderização lança `Cannot read properties of undefined (reading 'currentClubId')`; o root permanece vazio. Nenhum botão de reset/exportação é montado nesse fluxo.

**Impacto:** um save incompleto bloqueia o jogo na abertura e não oferece recuperação pela interface.

## 3. P2 — JSON ilegível aparece como carreira ausente e a criação sobrescreve os bytes existentes

**Causa/evidência:** `src/core/persistence.ts:3` devolve `null` tanto para ausência quanto para falha de parse; `src/app.ts:76` renderiza criação nesse caso; `src/app.ts:81` grava a nova carreira na mesma chave sem preservar o conteúdo anterior ou comunicar a falha.

**Reprodução comprovada:** valor truncado `{"version":"0.1.0-playable.2",` no stub. O aplicativo abre criação e conserva os bytes até a ação de criar; essa ação substitui o valor por uma carreira nova. Não há confirmação de substituição nem cópia do conteúdo ilegível.

**Impacto:** a interface não distingue falha de leitura de primeira execução; o usuário pode destruir evidência útil para recuperação manual. A auditoria não afirma que todo conteúdo truncado seria recuperável.

## Compatibilidade 0.1.4 → 0.3.0

Confirmadas chave `1903.save.playable2` e versão persistida `0.1.0-playable.2`, mantidas também em `src/core/engine.ts:12`; não confundir essa versão de save com a versão visual 0.3.0. O log do hotfix declara a preservação desse contrato.

O harness leu `main:index.html` via Git local, executou exclusivamente seus módulos anteriores ao aplicativo em VM e gerou carreira com o motor antigo. Capturou introdução (12 anos), escolha de posição (12), ingresso `join:` (14), partida (16) e estado adulto (25). Cada snapshot serializado carregou no código atual, renderizou e completou sua primeira transição sem exceção; cidade e clube afetivo foram preservados. A compatibilidade de `join:` está explícita em `src/core/engine.ts:329`. A migração incremental encontra-se em `src/core/calendar.ts:3`, `src/core/pathways.ts:19` e `src/core/coaches.ts:34`.

Isso confirma os estados exercitados, sem provar toda combinação legada ou uma carreira completa migrada. O teste legado existente em `tests/career-behavior.mjs:58` usa um save novo com campos removidos e chamada direta ao motor; ele não cobre a carga/renderização/falhas de armazenamento auditadas aqui.

## Verificação e pendência

Executado uma vez: harness Node/VM temporário `work/persistence-audit-check.mjs`, usando transpile isolado dos fontes atuais de persistência/app e módulos do build já existente. Asserts de todos os cenários acima passaram. DOM/armazenamento foram stubs em memória; nenhum navegador ou armazenamento real foi acessado. O harness foi removido após uso; este relatório é o único artefato final da subtask.

Não há risco listado apenas como hipótese. Pendência: o principal decidir e implementar o tratamento explícito de carga/gravação/exclusão e a preservação de dados rejeitados. Nenhuma correção foi realizada nesta revisão.
