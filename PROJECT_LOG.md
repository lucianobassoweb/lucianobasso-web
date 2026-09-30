# 1903 — PROJECT LOG

> Memória operacional e de engenharia do projeto. **Append-only**: decisões substituídas não são apagadas; recebem status SUPERSEDED com referência à nova decisão.

## Protocolo obrigatório para qualquer agente
1. Ler `docs/GAME_SPEC.md` e as últimas entradas deste arquivo antes de alterar regras.
2. Não introduzir mecânica que contradiga uma decisão LOCKED sem registrar explicitamente a mudança.
3. Toda alteração de balanceamento deve registrar: hipótese → mudança → métrica/teste → resultado → aprendizado.
4. O jogo é mobile-first, carreira completa ~4h, sem animação de partida.
5. Complexidade pode existir no motor; a interface deve expor apenas informação/decisão relevante.
6. Relações sociais emergem do futebol; nunca criar minigame social.
7. Todo save deve poder chegar a craque lendário. DNA muda caminho/dificuldade, não cria teto impeditivo.
8. Dados reais são camada separada do motor.
9. Telemetria de desenvolvimento deve permitir reconstruir a carreira e diagnosticar balanceamento.

---

## 2026-09-30 — D0001 — Identidade
**Status:** LOCKED
**Decisão:** nome do jogo/projeto = **1903**.
**Motivo:** definido pelo usuário.

## 2026-09-30 — D0002 — Plataforma
**Status:** LOCKED
**Decisão:** experiência desenhada para um único celular/iPhone, vertical, uma mão, offline-first. Sem necessidade inicial de conta, servidor ou sincronização.
**Implicação:** primeira implementação é web/PWA sem dependências para testar rapidamente; persistência está abstraída para migração posterior a SQLite/Capacitor nativo.

## 2026-09-30 — D0003 — Duração e ritmo
**Status:** LOCKED
**Decisão:** carreira completa alvo = **3h30–4h30**, dos 12 anos à aposentadoria (~36–40).
**Meta de design:** ~220–280 acontecimentos apresentados; somente ~100–130 devem exigir decisão ativa.
**Princípio:** tempo sem história deve ser comprimido.

## 2026-09-30 — D0004 — Início aos 12 anos
**Status:** LOCKED
**Decisão:** jogador começa em escolinha, sem posição definida.
**DNA oculto inicial:** altura adulta, dominância lateral real, plasticidade do pé fraco, aptidões técnicas/cognitivas/físicas, maturação, aprendizagem, consistência, resposta à pressão, resistência a lesões, ambição, adaptação, liderança.
**Regra:** o usuário descobre quem é jogando. Atributos aparecem primeiro qualitativamente/faixas e só ficam precisos com experiência.

## 2026-09-30 — D0005 — Lendário sempre possível
**Status:** LOCKED
**Decisão:** não existe PA/teto rígido que torne um save incapaz de chegar a lenda. Características iniciais determinam custo, timing e caminhos eficientes.
**Consequência técnica:** curvas usam resistência de crescimento e aptidões, nunca hard cap individual abaixo do nível lendário.

## 2026-09-30 — D0006 — Partida
**Status:** LOCKED
**Decisão:** sem animações. A partida é um motor probabilístico/event-driven que gera estatísticas coerentes; placar deve emergir das condições, não ser sorteado isoladamente.
**Estatísticas prioritárias:** jogos, minutos, gols, assistências, MOTM, cartões, xG/xA, nota e grandes partidas.

## 2026-09-30 — D0007 — Estado emocional
**Status:** LOCKED
**Decisão:** gols, vitórias, derrotas, banco, lesões e contexto alteram moral/confiança/pressão. Consequências devem se propagar para eventos futuros.
**Regra de UX:** aspectos humanos não devem ser tratados como planilha totalmente transparente.

## 2026-09-30 — D0008 — Relações emergentes
**Status:** LOCKED
**Decisão:** relações não são acionadas pelo jogador por um menu social. Nascem de fatos: vitórias/títulos juntos, assistências, disputa de posição, perda da faixa, faltas, comemoração contra ex-clube etc.
**Modelo interno inicial:** afinidade, respeito, rivalidade, ressentimento + memórias de eventos.

## 2026-09-30 — D0009 — Torcidas
**Status:** LOCKED
**Decisão:** cada torcida mantém memória própria do atleta.
**Eixos:** paixão, ódio, temor, respeito, expectativa.
**Exemplos canônicos:** contratação muito cara + fracasso → torcida do clube tende ao ódio/ressentimento; hat-trick recorrente contra adversário → temor; transferência entre rivais → evento estrutural.

## 2026-09-30 — D0010 — Mercado
**Status:** LOCKED
**Decisão:** valor de mercado != preço exigido pelo clube != disposição do comprador.
**Pipeline:** observação → interesse → sondagem → proposta.
**Usuário pode:** ficar, abrir-se a propostas, pedir saída, forçar saída.
**Regra:** pedir saída nunca garante transferência.

## 2026-09-30 — D0011 — Mundo v0.1
**Status:** LOCKED
**Decisão:** vertical slice inicial somente Brasil, Séries A/B/C/D 2026, 156 clubes reais. Nome/cidade/estádio/cores/tamanho de torcida serão dados de clube; sem escudos.
**Estado alpha.1:** nomes e divisões dos 156 clubes cadastrados; metadados ricos completos apenas para subconjunto prioritário. Enriquecimento restante é backlog de dados, não alteração de arquitetura.

## 2026-09-30 — D0012 — Estatística como recompensa
**Status:** LOCKED
**Decisão:** histórico não é descartável. Guardar por temporada e carreira; permitir leitura de adversários, clássicos, finais, evolução por idade e legado.

## 2026-09-30 — A0001 — Implementação alpha.1
**Build:** 0.1.0-alpha.1
**Entregue:**
- PWA vertical e offline-cache;
- save local;
- 156 clubes BR 2026;
- DNA oculto e PRNG por save;
- crescimento corporal e atributos;
- conhecimento gradual de atributos;
- inferência de posição;
- escolha de base inicial;
- motor de partida simplificado com Poisson contextual;
- gols/assistências/MOTM/cartões/xG/xA/nota;
- moral/confiança;
- relação de temor/respeito após hat-trick;
- season review/histórico;
- exportação de diagnóstico JSON.

**Ainda NÃO considerar validado:** fórmulas de crescimento, gols, valor de mercado, duração real de 4h, força de clubes, fanbase, mercado de transferências e densidade narrativa.

## Próximos experimentos
- E0001: simular 10.000 carreiras sem UI e medir distribuição de OVR por idade.
- E0002: calibrar gols/jogo, G+A por posição e frequência de MOTM/vermelhos.
- E0003: construir mercado brasileiro realista entre divisões.
- E0004: completar metadados cidade/estádio/cores/torcida dos 156 clubes com fonte e confidence flag.
- E0005: criar telemetria estruturada de cada turn/event/decision/state delta.
- E0006: medir duração real de uma carreira e ajustar turn compression.

## 2026-09-30 — D0013 — Formação posicional 12–18
**Status:** LOCKED
**Decisão:** dos 12 aos 18 anos, o usuário escolhe uma posição principal a cada temporada entre GK/CB/FB/DM/CM/AM/WG/ST. A posição natural é oculta e derivada do DNA; não é escolhida pelo algoritmo em nome do usuário.
**Princípio:** liberdade de escolha não significa equivalência de resultado. Uma posição incompatível pode produzir rendimento ruim.

## 2026-09-30 — D0014 — Erro posicional cresce com a idade
**Status:** LOCKED
**Decisão:** desalinhamento posicional é quase irrelevante aos 12 e cresce progressivamente até os 18. A penalidade emerge de compatibilidade, experiência, adaptação e nível competitivo; não aplicar debuff arbitrário fixo.
**Curva atual:** 12=.05, 13=.10, 14=.24, 15=.43, 16=.68, 17=.90, 18=1.08.

## 2026-09-30 — D0015 — Mudança de posição tem custo próprio
**Status:** LOCKED
**Decisão:** trocar de posição cria dívida temporária de adaptação proporcional à distância tática e idade. Experiência antiga permanece; posições vizinhas transferem parte do repertório. GK↔linha é a reconversão mais cara.

## 2026-09-30 — D0016 — Todas as posições são carreiras completas
**Status:** LOCKED
**Decisão:** goleiro, zagueiro, lateral, volante, meias, ponta e atacante devem poder chegar a lenda. Goleiros têm estatísticas próprias (defesas e clean sheets) e motor de rating distinto.

## 2026-09-30 — E0007 — Calibração posicional pareada
**Status:** PASS — primeira calibração
**Método:** 200 DNAs × 5 políticas = 1.000 trajetórias de formação. O mesmo DNA foi comparado em BEST, WORST, LATE_CORRECTION, SWITCHER e RANDOM.
**Resultado:** gap de nota BEST-WORST: 12a=0,08; 14a=0,13; 16a=0,42; 18a=0,53. Nível efetivo aos 18: BEST=75,4; WORST=60,3; correção aos 16=70,8; SWITCHER=60,1.
**Aprendizado:** a curva agora expressa a intenção de design: infância permissiva, adolescência progressivamente seletiva; mudar tarde é viável, mas cobra especialização.

## 2026-09-30 — E0008 — Distribuição de posições naturais
**Status:** PASS
**Amostra:** 5.000 DNAs.
**Distribuição:** GK 10,4%; CB 9,6%; FB 15,7%; DM 11,3%; CM 11,8%; AM 15,9%; WG 16,2%; ST 9,2%.
**Aprendizado:** todas as posições aparecem com frequência material. Manter monitoramento para evitar viés após mudanças no DNA.

## 2026-09-30 — E0009 — Smoke test de carreira completa após sistema posicional
**Status:** PASS técnico / NÃO É calibração estatística final
**Amostra:** 5 carreiras completas automatizadas.
**Resultado técnico:** todas chegaram à aposentadoria sem quebra; 234 turnos por carreira, dentro da faixa estrutural prevista de ~220–280 acontecimentos. Média de 818 jogos profissionais na amostra; OVR médio ~66 aos 18, ~81 aos 24 e pico médio na faixa média dos 80 aos 30–33.
**Alerta:** amostra pequena. A curva de auge/declínio ainda parece longa demais e o valor de mercado brasileiro ainda requer recalibração. Não tratar estes números como aprovados.

## 2026-09-30 — D0013 — Posição é escolhida pelo jogador durante a formação
**Status:** LOCKED
**Decisão:** dos 12 aos 18 anos, o jogador escolhe a posição principal da temporada. Todas as oito macroposições são jogáveis: GK, CB, FB, DM, CM, AM, WG e ST.
**Regra:** a escolha é agência do usuário; o DNA não escolhe a posição em seu lugar.
**Implicação:** a interface mostra experiência acumulada por posição, mas nunca mostra a compatibilidade natural oculta.

## 2026-09-30 — D0014 — Erro de posição deve emergir do futebol
**Status:** LOCKED
**Decisão:** escolher uma posição incompatível com o DNA não aplica um debuff arbitrário fixo. O custo emerge de três fatores combinados:
1. compatibilidade natural oculta entre DNA e função;
2. experiência/proficiência acumulada naquela posição;
3. pressão de especialização, que aumenta fortemente dos 12 aos 18 anos.
**Resultado desejado:** aos 12 quase tudo funciona; aos 16–18 o nível competitivo expõe escolhas inadequadas.

## 2026-09-30 — D0015 — Troca de posição e reconversão
**Status:** LOCKED
**Decisão:** mudar de posição custa adaptação proporcional à idade e à distância funcional entre as posições.
**Exemplos:** WG→AM tem custo baixo/moderado; ST→CB é alto; qualquer posição de linha→GK é extremo.
**Custo:** reduz eficiência imediata e velocidade de desenvolvimento durante adaptação; atributos já adquiridos não desaparecem.
**Princípio:** o usuário perde rendimento/tempo, não “pontos mágicos”.

## 2026-09-30 — D0016 — Descoberta sem revelar a resposta
**Status:** LOCKED
**Decisão:** o jogo não exibe “compatibilidade 91%” ou posição ideal. O feedback vem de desempenho, estatísticas, minutos, experiência e comentários qualitativos do treinador.
**Motivo:** descobrir o jogador é parte da mecânica central.

## 2026-09-30 — D0017 — Partidas simuladas ≠ turnos apresentados
**Status:** LOCKED
**Decisão:** um turno profissional representa um bloco de 3–6 partidas do mundo. Apenas um jogo/evento é destacado na interface, mas todas as partidas alimentam estatísticas, moral, torcida e carreira.
**Meta:** temporada profissional típica com ~30–45 aparições, sem exigir 40–60 toques do usuário.

## 2026-09-30 — D0018 — Densidade da carreira
**Status:** LOCKED PARA PLAYABLE 0.1; REVISÁVEL APÓS TESTE HUMANO
**Decisão:** 9 blocos/turnos por temporada; dos 12 aos 38 anos = **234 avanços principais** antes de contar decisões de posição/mercado.
**Racional:** aproxima a carreira do alvo de ~4 horas sem artificializar cada partida como um turno.

## 2026-09-30 — E0001 — Calibração inicial de progressão
**Status:** CONCLUÍDO / PRIMEIRA PASSAGEM
**Amostra:** 750 carreiras automatizadas, política neutra (explora cedo e tende a estabilizar após 14).
**Resultados principais:**
- OVR médio: 12a 45,2 · 18a 64,7 · 24a 78,4 · 30a 83,1 · 36a 82,0.
- aparições profissionais médias: 810,4;
- gols médios: 92,8;
- assistências médias: 84,0;
- MOTM médio: 15,7;
- vermelhos médios: 2,56;
- pico médio de valor: ~R$ 77,5 mi;
- turnos: 234 fixos.
**Leitura:** progressão agora permite carreiras excelentes sem tornar toda trajetória automaticamente lendária. Precisa de teste humano para ritmo real de 4h.

## 2026-09-30 — E0002 — Auditoria específica do sistema de posição
**Status:** CONCLUÍDO / APROVADO PARA PLAYABLE
**Amostra:** 1.000 trajetórias (250 por política) + lote anterior de 1.400.
**Políticas comparadas:**
- NATURAL: seleciona a posição mais compatível com o DNA desde cedo (benchmark de teto de eficiência; não disponível ao usuário).
- EXPLORE: experimenta cedo e converge para funções adequadas.
- WRONG: insiste deliberadamente na pior compatibilidade.
- LATE-SWITCH: segue posição natural e troca para a pior aos 18.

**Resultados do lote final:**
- NATURAL: OVR 18 = 74,4 · OVR 24 = 87,4 · OVR 30 = 91,9 · nota média 6,97.
- EXPLORE: OVR 18 = 72,1 · OVR 24 = 85,8 · OVR 30 = 90,6 · nota média 6,92.
- WRONG: OVR 18 = 60,3 · OVR 24 = 70,2 · OVR 30 = 74,1 · nota média 6,41.
- LATE-SWITCH: OVR 18 = 75,4 antes da reconversão; OVR 24 = 66,4 · OVR 30 = 71,2 · nota média 6,36.

**Aprendizado:**
- exploração precoce quase não destrói o desenvolvimento: comportamento desejado;
- a posição errada passa a cobrar preço grande com maturação: comportamento desejado;
- uma reconversão extrema aos 18 é muito cara: comportamento desejado, porém deve ser validado em teste humano para não parecer punitivo demais;
- não há save condenado pelo DNA: todas as gerações têm ao menos uma rota natural de alta eficiência.

## 2026-09-30 — E0003 — Viabilidade de todas as posições
**Status:** CONCLUÍDO / PRIMEIRA PASSAGEM
**Benchmark NATURAL, 250 saves:**
- GK 11,2%; CB 9,6%; FB 10,8%; DM 10,8%; CM 12,8%; AM 21,2%; WG 14,4%; ST 9,2%.
- Todas as posições apareceram espontaneamente como rota natural.
- OVR médio aos 30 por posição ficou entre 87,5 (ST) e 94,3 (GK) no benchmark de escolha natural.
**Nota:** distribuição ainda não pretende reproduzir população real de atletas; apenas confirma que nenhuma posição está estruturalmente morta.

## 2026-09-30 — E0004 — Mercado e volume de carreira
**Status:** CONCLUÍDO / PRIMEIRA PASSAGEM
**Amostra:** 500 carreiras automatizadas.
**Resultados:**
- transferências aceitas: média 1,9 · mediana 2 · P90 4 · máximo 7;
- títulos: média 7,1 · mediana 7 · P90 11 · máximo 17;
- aparições profissionais: média 811;
- pico de mercado: média ~R$ 78,3 mi · P90 ~R$ 147,1 mi.
**Mudança decorrente:** pedido de saída LEAVE/FORCE agora pode gerar propostas também no meio da temporada; “pedir para sair” não fica restrito ao fechamento anual.

## 2026-09-30 — A0002 — Primeiro vertical slice jogável
**Build:** 0.1.0-playable.2
**Status:** JOGÁVEL / NÃO CONSIDERAR CONTEÚDO FINAL
**Inclui:**
- criação da carreira aos 12;
- escolha anual de posição dos 12 aos 18;
- oito posições, incluindo goleiro;
- DNA oculto e descoberta progressiva;
- crescimento corporal;
- especialização e custo de reconversão;
- entrada em base brasileira;
- partidas de formação e blocos de partidas profissionais;
- gols, assistências, xG/xA, notas, MOTM, cartões, saves e clean sheets;
- moral, confiança, pressão e reputação;
- títulos probabilísticos provisórios;
- valor de mercado;
- intenção de transferência + propostas + transferências;
- relação de torcida (paixão, ódio, temor, respeito, expectativa) em primeira versão;
- histórico de temporadas e transferências;
- 234 turnos principais por carreira;
- save local e exportação de diagnóstico;
- UI vertical mobile-first com quatro áreas: Carreira, Jogador, Estatísticas, Mundo.

## Limitações conhecidas da playable.2
**Não mascarar como resolvido:**
1. plantéis reais de 2026 ainda não estão implementados no motor;

---

## 2026-09-30 — Hotfix 0.1.4 — travamento após iniciar carreira

### Sintoma
Após clicar em **COMEÇAR A CARREIRA**, a introdução aparecia normalmente. Ao clicar em **CONTINUAR**, a tela seguinte ficava sem evento e sem botão, aparentando travamento.

### Causa
`advanceCareer(save)` detectava `save.pendingEvent`, limpava o evento e executava `return save` imediatamente. Assim, o evento introdutório era removido, mas o próximo turno não era gerado.

### Correção
- remover o retorno antecipado de `advanceCareer`;
- limpar o evento atual e continuar a geração do próximo beat da carreira;
- adicionar fallback em `eventCard()` com botão **CONTINUAR** quando um save antigo estiver sem `pendingEvent`;
- build visual atualizada para `PLAYABLE 0.1.4 SAFARI`;
- preservar a mesma chave/versionamento do save para recuperar carreiras já criadas.

### Validação
Fluxo executado em Chromium headless mobile (390×844):
1. criar carreira;
2. continuar introdução;
3. abrir escolha de posição;
4. selecionar posição;
5. avançar múltiplos blocos de formação.

Resultado: 8 transições consecutivas, sem erros de JavaScript e com botão/evento presente em todos os estados.
