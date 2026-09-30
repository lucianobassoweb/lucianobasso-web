# 1903

Jogo de carreira individual no futebol, mobile, vertical e offline-first. Começa aos 12 numa escolinha local. As decisões profissionais e de vida conduzem uma biografia sorteada.

Versão experimental 0.3.0: estudos de Ronaldinho, Kaká, Romário, Diego Souza, Rivaldo, Lulinha e Somália aplicados a origem familiar, escola, descoberta, reconversão, transição, afastamentos e longevidade. Ver `docs/CAREER_CASE_STUDIES.md`, `docs/GAME_SPEC.md` e `PROJECT_LOG.md` para decisões, fórmulas, fontes e limites.

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

Limites: campeonatos e partidas ainda simplificados; muitos metadados de clubes incompletos; origem usa apenas cidades conhecidas; aposentadoria escolhida a partir dos 36 e limitada aos 40; segundo percurso permite escolher trabalho/formação, sem simular a nova profissão completa. Frequências experimentais não representam a população real de atletas.

Verificação opcional de navegador: `tests/browser-smoke.cjs` usa Playwright (instalado separadamente). `PLAYWRIGHT_MODULE` permite informar o módulo disponível no ambiente e `CHROMIUM_EXECUTABLE` um Chromium já instalado. A prova executada nesta revisão está em `browser-results-0.3.0.json` e `browser-story-results-0.3.0.json``; não equivale a teste em Safari real.


Nesta revisão: 140 treinadores reais com fontes; perfis de jogo e relações persistentes; permanência calculada pela campanha; propostas com contexto do comando; uma partida por turno e decisões profissionais; quadro de atuação; posição e categoria por temporada; convite por destaque sub-20, estreia própria e minutos graduais. Regras, distinção entre cadastro real e parâmetros editoriais, limitações e validação: `docs/COACH_SYSTEM.md`.

O calendário de competições é experimental. Crescimento lento, taxas de promoção e duração da experiência seguem em calibração. Para avaliar o novo percurso, começar uma carreira nova evita misturar histórico de antigas versões em blocos com o calendário atual; saves existentes continuam preservados.
