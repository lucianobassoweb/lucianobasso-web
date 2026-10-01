# 1903

Jogo de carreira individual no futebol, responsivo para celular e desktop, com funcionamento offline. Começa aos 12 numa escolinha local. As decisões profissionais e de vida conduzem uma biografia sorteada.

Versão experimental 0.3.11: estudos de Ronaldinho, Kaká, Romário, Diego Souza, Rivaldo, Lulinha e Somália aplicados a origem familiar, escola, descoberta, reconversão, transição, afastamentos e longevidade. Ver `docs/CAREER_CASE_STUDIES.md`, `docs/GAME_SPEC.md` e `PROJECT_LOG.md` para decisões, fórmulas, fontes e limites.

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

## 0.3.2 — capítulos e consequências visíveis

A pesquisa de New Star Soccer, Football Manager, Wildermyth e Citizen Sleeper está em [docs/GAMEPLAY_CASE_STUDIES.md](docs/GAMEPLAY_CASE_STUDIES.md). A primeira adaptação adiciona objetivos curtos por contexto, progresso por participação real, resultado parcial e arquivo biográfico em Histórico. A última decisão mantém um recibo factual após recarga, capturado antes da próxima partida.

Capítulos não distribuem bônus nem garantem propostas, e não consultam o DNA oculto. Motor, calendário e critérios de promoção permanecem iguais. Saves antigos começam a registrar capítulos a partir da atualização. `npm test` inclui `tests/story-career.mjs`; verificação e limites completos em `docs/GAMEPLAY_REVIEW_0.3.2.md`.

## 0.3.3 — reações e contexto sempre visíveis

Torcida, treinador e contexto/próximos passos aparecem diretamente na situação da partida, sem painéis recolhidos. Ajuste de interface, com o motor e a compatibilidade de saves da 0.3.2.

## 0.3.4 — contexto da sua carreira

Contexto e próximo passo passam a ser compostos a partir de fatos observados e das decisões presentes. Leitura local e determinística, sem consulta ao DNA nem mudanças nas regras esportivas. Saves existentes recebem a leitura ao abrir a atualização.

## 0.3.5 — três respostas para dilemas da carreira

Decisões entre partidas variam com a situação e têm efeitos de esforço, descanso, estudo da atuação, cooperação, aproximação pessoal e intriga. Famílias possuem intervalo de reaparição e memória persistente; marcos e propostas preservados. Afinidade pessoal e confiança profissional continuam distintas.


## 0.3.6 — torcida e responsabilidade em campo

Cobrança por setor e reconhecimento individual passam a considerar posição, minutos, placar, nota, defesas, gols/assistências, xG/xA, expulsão, clássico, adversário, expectativa, campanha e memória. A reação modifica relação com a torcida, pressão, moral e confiança; momentos severos podem gerar memória de cobrança e uma resposta posterior pode fechar esse episódio. Sem culpa individual no banco e sem inventar erros pessoais. Base/local têm intensidade menor e linguagem própria. Saves mantêm os eventos já oferecidos. Sonho/experimentação de posição e porta profissional adulta permanecem próximos trabalhos do motor.


## 0.3.7 — produção do atacante e disputa por espaço

Nota de ST/WG passa a exigir produção observada: assistência permite boa avaliação sem gol; sem contribuição direta/criação suficiente a nota não sobe apenas pelo repertório. Justificativa visível na partida. Sequência recente no mesmo clube/categoria/posição/temporada pesa na escalação, treinador e torcida; formação recebe menor intensidade. Banco e entradas curtas sem gol não inventam nem apagam a seca. Gol encerra o episódio, assistências/criação atenuam. Critério de promoção ofensiva foi ajustado à nova nota com produção por90minutos e amostra mínima, sem promoção automática por idade. Saves legados mantêm seus eventos/notas: registro recente começa nas próximas atuações, sem inventar partidas antigas.


## 0.3.8 — busca de avaliação com custo e oportunidade

Buscar outras avaliações custa 3 de fadiga mental e até 2 de pressão, informados antes do clique e registrados no recibo. Uma busca por temporada, sem acumular enquanto aguarda a próxima lista; só sem vínculo com clube e fora do profissional, com fadiga abaixo de 80. A prioridade favorece um segundo candidato na próxima lista e é consumida nessa geração, mesmo sem segunda opção. Não altera a probabilidade de aprovação. Eventos/saves antigos mantêm o conteúdo e recebem o hint atual. Pressão/fadiga ainda não reduzem diretamente nota juvenil ou aprovação; não confundir busca, convite e teste.

Teste repetível: `tests/search-evaluation.mjs`, 8 grupos, além da suíte e gates do protocolo. Revisão independente: 7 grupos. Validação de interface em 390×844 e 320×740 com save fictício isolado; sem teste Safari físico.


## 0.3.9 — produção recente e escalação

No ataque, partidas sem gol/assistência/criação suficiente têm teto de nota6,3 (6,5 em menos30min;6,0 com xG>=0,6 não convertido). Um gol não libera nota quase perfeita: teto7,6+0,6G+0,3A, limitado10. Assistências e criação registradas continuam positivas. Nenhuma nota antiga recalculada.

Um gol encerra a seca, mas a produção da janela recente ainda pode custar espaço. Amostra até8 registros, pelo menos6atuações substanciais/360min; ST(G+0,45A)/90>=0,25 e WG(G+A)/90>=0,40 são referências experimentais. Cobranças combinadas pelo maior valor, com criação e intensidade por idade. Chance profissional recebe a penalidade depois do limite esportivo, impedindo que atributos altos absorvam o custo. Não há titularidade ou banco automático, nem concorrente de elenco inventado. Saves mantidos sem novo campo obrigatório; histórico desconhecido não reconstruído.

Verificação: suíte completa,17gruposforma/7integração; gates200carreiras e100DNAs×4políticas. UI isolada390×844/320×740. Diagnóstico exato do relato17j1G0A6,8 não fornecido; fixture equivalente não é o save do usuário.


## 0.3.10 — o ano anterior orienta a posição

Após o balanço anual, um ano ruim documentado na escolinha/base abre uma proposta do treinador para experimentar outra posição. Avaliação exige pelo menos8jogos/420minutos, posição única conhecida e categoria juvenil. Usa rendimento e atributos aprendidos, sem consultarDNA. ST/WG têm critério de produção; defensores/goleiros não são julgados por falta de gols.

Você pode aceitar a proposta, testar outra posição ou insistir. Aceitar aplica a adaptação já existente; insistir reduz a chance de começar como titular naquele projeto em8p.p. até13anos,12até15,16até18. A evidência atual pode recuperar espaço com5jogos/240minutos e rendimento suficiente; uma piora posterior pode reabrir a cobrança. Clube/posição/categoria/temporada diferentes encerram essa consequência. Não congela aprendizagem ou potencial. O custo é informado antes do clique e aparece no recibo.

Histórico ausente ou misturado não gera veredito. Eventos legados mantêmIDs/corpo e não recebem custo retroativo. Plano novo é opcional e validado no save; chave/schema mantidos. Testes11grupospuros+4integração, suíte e gates completos. Evidência mobile em fixture isolada; sem Safari físico/playtest4h.


## 0.3.11 — formação, condição e recomeço

Jogar mostra diretamente condição física, fadiga mental, pressão, confiança e moral, com valores atuais /100. Fadiga menor é melhor. Os novos dilemas usam o mesmo termo, evitando uma energia mental sem indicador próprio. Recomeçar carreira fica visível nessa tela e requer confirmação; cancelar ou falhar ao apagar mantém a carreira.

Atributos usam referência adulta: partida aos12 reduzida19,2 pontos, aprendizagem1,4× até13,2,75× entre14–17 e1,25× entre18–21. Base inicial menor não define potencial máximo. Descoberta é comparada com pares; avaliaçãoSub-20 já aproxima exigência adulta. Saves anteriores recebem conversão única dos atributos antes18; histórico/DNA/evento pendente preservados, adultos não recebem desconto. Dados originais não são escritos na simples leitura. Testes500DNAs: máximo inicial36,3 e máximo durante13anos47,56; não são limites científicos nem hard caps. Verlog/revisão e gates para efeitos nas trajetórias.


Correção final deUX0.3.11: HUD compacto persistente durante a rolagem (no celular acima da navegação), uma coluna e faixa de temporada substituem os dois cartões grandes. Balanço anual mostra os números do ano encerrado, partidas mostram o ano em andamento. Capítulos ficam depois das decisões; reações/contexto/próximos passos continuam diretos.
