# 1903

Jogo de carreira individual no futebol, responsivo para celular e desktop, com funcionamento offline. Começa aos 12 numa escolinha local. As decisões profissionais e de vida conduzem uma biografia sorteada.

Versão experimental 0.3.1: estudos de Ronaldinho, Kaká, Romário, Diego Souza, Rivaldo, Lulinha e Somália aplicados a origem familiar, escola, descoberta, reconversão, transição, afastamentos e longevidade. Ver `docs/CAREER_CASE_STUDIES.md`, `docs/GAME_SPEC.md` e `PROJECT_LOG.md` para decisões, fórmulas, fontes e limites.

```bash
npm ci
npm run typecheck
npm test
npm run standalone
node dist/dev/simulate.js 200
node dist/dev/position-audit.js 100
```

`index.html` é o build standalone. `web/index.html` é a entrada modular copiada para `dist` pelo build. `src` contém o motor em TypeScript; `tests` verifica comportamentos de carreira. `make_standalone.py` gera o HTML com CSS/JS embutidos e usa caminhos relativos ao projeto.

Servidor local: `python3 -m http.server 8000`. A versão publicada anterior não muda até a integração da revisão. Save local preserva chave e schema principal da 0.1.4; campos de contexto são opcionais e inicializados para saves antigos.

Limites: campeonatos e partidas ainda simplificados; muitos metadados de clubes incompletos; cidade de nascimento e UF escolhidas na criação, inclusive fora das sugestões; aposentadoria escolhida a partir dos 36 e limitada aos 40; segundo percurso permite escolher trabalho/formação, sem simular a nova profissão completa. Frequências experimentais não representam a população real de atletas.

Verificação opcional de navegador: `tests/browser-smoke.cjs` usa Playwright (instalado separadamente). `PLAYWRIGHT_MODULE` permite informar o módulo disponível no ambiente e `CHROMIUM_EXECUTABLE` um Chromium já instalado. A prova executada nesta revisão está em `browser-results-0.3.0.json` e `browser-story-results-0.3.0.json`; não equivale a teste em Safari real.


Nesta revisão: 140 treinadores reais com fontes; perfis de jogo e relações persistentes; permanência calculada pela campanha; propostas com contexto do comando; uma partida por turno e decisões profissionais; quadro de atuação; posição e categoria por temporada; convite por destaque sub-20, estreia própria e minutos graduais. Regras, distinção entre cadastro real e parâmetros editoriais, limitações e validação: `docs/COACH_SYSTEM.md`.

O calendário de competições é experimental. Crescimento lento, taxas de promoção e duração da experiência seguem em calibração. Para avaliar o novo percurso, começar uma carreira nova evita misturar histórico de antigas versões em blocos com o calendário atual; saves existentes continuam preservados.

## Revisão de interface e origem — 30/09/2026

Na criação, cidade/UF e clube do coração são escolhas obrigatórias. Sugestões de cidades não limitam o campo. A residência inicial e a escolinha ficam na cidade escolhida; torcer por um clube não garante ingresso nele. Família, infância e DNA continuam sorteados.

A tela Jogar prioriza o evento e as decisões, com resumo lateral no desktop e detalhes expansíveis no celular. Reações da torcida e treinador ficam no quadro da partida, em um painel expansível. Navegação: Jogar, Meu jogador, Histórico, Clube e mercado. Dados técnicos e apagar carreira ficam em Configurações e dados.

Verificação reproduzível: `tests/browser-ui-redesign.cjs`, com evidências em `browser-ui-results-0.3.0.json`, além dos fluxos existentes de carreira e estreia. O teste abre o HTML diretamente em 390×844 e 1440×960.

## 0.3.1 — interface e proteção do progresso

Identidade editorial de futebol, placar com os dois times, métricas específicas de goleiro, navegação com ícones e estado anunciado, orientações iniciais no celular, formulário com validação nativa e títulos semânticos. Dados ilegíveis abrem uma recuperação que mantém os bytes originais; falha de armazenamento informa o problema e oferece exportação/retry. Não existe importação automática de saves neste ciclo.

`npm test` inclui os 18 grupos de persistência. Para verificar os estados visuais sem tocar saves reais, depois de `npm run standalone` abra `tests/persistence-ui.html?scenario=corrupt` ou `?scenario=quota` pelo servidor local: a fixture usa somente armazenamento em memória. Evidências e limites em `docs/UI_REVIEW_0.3.1.md` e `PROJECT_LOG.md`.

A geração standalone atualiza o identificador do cache pelo conteúdo do HTML. A atualização não apaga localStorage. A configuração de subagentes e o roteamento estão em `AGENTS.md` e `docs/ORCHESTRATION.md`; verificação: `npm run check:orchestration`.
