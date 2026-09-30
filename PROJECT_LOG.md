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


## 2026-09-30 — D0019 — Vida sorteada e decisões profissionais
**Status:** LOCKED por instrução do usuário.
Tudo que compõe a condição inicial é sorteado: cidade, família, profissões dos pais, características e trajetória prévia. Nome permanece personalizável. Talento não depende da condição econômica. O jogador começa numa escolinha próxima de onde vive, sem vaga automática em clube grande. Estudar ocupa tempo que poderia ser dedicado ao desenvolvimento futebolístico e abre caminhos depois da carreira. Sempre pode continuar no futebol menor.

## 2026-09-30 — D0020 — Reconversão adulta e função
**Status:** LOCKED por instrução do usuário; complementa D0013, não elimina a escolha anual 12–18.
Treinador e atleta podem sugerir mudança depois da formação. Reconversão preserva atributos e experiência antiga, exige adaptação e pode depender da aceitação do treinador. Posição não determina sozinha o rendimento: papel, demanda e apoio do time importam. Estudos de Ronaldinho, Kaká, Romário, Diego Souza e Rivaldo registrados em `docs/CAREER_CASE_STUDIES.md`.

## 2026-09-30 — A0003 — Motor experimental derivado de cinco carreiras
**Build:** 0.2.0-experimental. Não substitui automaticamente a publicação 0.1.4.
**Entregue:** fonte modular recuperada; hotfix 0.1.4 reconciliado; sorteio inicial local e familiar; infância adquirida separada do DNA; escola/futebol como decisão anual; observação, testes incertos, apoio familiar e permanência local; dispensas de base sem eliminação do save; discussão de posição e função após os 18; segunda trajetória oferecida no encerramento sem diploma automático.

**Mudanças de fórmula / hipótese:**
- estudar deve ter custo futebolístico reconhecível: multiplicadores 0,82/0,94/1,00 e progresso escolar 1/0,8/0,35;
- avaliação não deve conhecer o futuro: atributos observáveis e físico atual determinam aprovação, com ruído; probabilidade 12–86%;
- dispensa não é diagnóstico genético: base pode dispensar aos 14–16, com avaliação anual simplificada de 2,5–18%;
- maturação deve mudar ritmo: multiplicador físico 0,56–1,12 até os 21, conforme idade de maturação;
- crescimento corporal deve ser fracionado: dividir o crescimento esperado por 4,5, pois existem múltiplas atualizações anuais;
- veterano perde capacidade física sem esquecer futebol: declínio de pace/stamina/strength começa aos 30; preservar crescimento-base técnico/cognitivo aos 33+, mantendo ruído;
- função muda exigências: peso de 12% da diferença leitura/técnica versus mobilidade; apoio ofensivo contextual simplificado;
- não permitir fabricar experiência alternando posições: transferência parcial incide somente sobre a diferença positiva entre proficiências.

**Correções de integridade:** continuar não pula decisões; escolhas fora do evento não são aceitas; comentário do treinador não consulta compatibilidade oculta; saves antigos recebem contexto incremental sem trocar clube/posição; origem e deslocamento não usam cidade `A DEFINIR`; gerador standalone usa caminhos relativos ao projeto; caches separados para build modular e standalone.

**Validação final:**
- TypeScript estrito e build: PASS.
- 100 carreiras comportamentais: todas chegam ao encerramento, 234 blocos; 14 cidades distintas; 106 registros de rejeição/dispensa; 58 saves tentam novamente após uma rejeição; nenhum NaN/Infinity. Todos se profissionalizam sob a política de aceitar testes e persistir; isto evidencia acesso ainda generoso, não taxa real de sucesso.
- 30 pares com o mesmo DNA, política escola versus futebol: OVR aos 19 de 70,67 versus 74,20; escola concluída com prioridade escolar, incompleta com prioridade exclusiva de futebol. 60 trajetórias; parâmetros experimentais.
- Reconversão aos 35: atributos preservados, posição anterior registrada, dívida recuperável; função fixa aproveita melhor um perfil técnico com mobilidade baixa; avalia-se mesmo resultado de teste/comentário ao alterar só DNA escondido.
- Save legado sem `life`/`tactical`: PASS, preservando clube e posição.
- 200 carreiras neutras: OVR médio 18=63,3; 24=76,3; 30=80,2; 36=77,8; média de 778 aparições. Frequência de partidas ainda alta e aposentadoria fixa continuam pendentes.
- Auditoria posicional: 100 DNAs por política, agora realmente pareados; NATURAL/EXPLORE/WRONG/LATE-SWITCH aos 30 = 91,9/89,0/72,9/70,1. Todas as oito posições aparecem.

**Antes/depois:** referência anterior neutra (750 saves, outra política) 30=83,1 e 36=82,0; experimental (200 saves) 30=80,2 e 36=77,8. Não é comparação causal pareada: mudaram escola, acesso, infância e política de reconversão. A auditoria pareada compara políticas dentro da versão nova. Conservar dados brutos e não apresentar diferenças entre builds como medidas isoladas de cada mecanismo.

**Decisão:** manter como experimental para revisão e teste humano. As biografias demonstram mecanismos, não frequências. Profissão futura está no estágio de escolha de percurso; não há simulação de conclusão de curso/emprego. Rede humana, fornecimento de passes, táticas, lesões, aposentadoria variável e metadados completos permanecem backlog.

**Interface móvel / offline:** Chromium 153, viewport 390×844: 48 transições, quatro abas, negociação de função adulta, recarga com save e recarga offline passaram; sem erros JavaScript e sem overflow horizontal. Screenshot inspecionado. O launcher agent-browser não iniciou neste ambiente; a execução usou Chromium diretamente por Playwright. Safari real/iPhone continua sem validação nesta sessão.

## 2026-09-30 — A0004 — Extensão autorizada: Lulinha e Somália
**Status:** IMPLEMENTADO / EXPERIMENTAL. O usuário pediu estudar e levar os dois casos ao motor. Homônimo confirmado: Somália atacante de Grêmio e Fluminense, Wanderson de Paula Sabino.

**Pesquisa:** fontes contemporâneas e entrevistas em 2007/2020/2026 para Lulinha; formação Usipa/América, relatos de 2011/2015 e registro posterior para Somália. Evitar transferir ao atacante episódios do Somália do Botafogo. Relatos sobre negociações não provam o êxito de uma carreira alternativa. Multa milionária não é venda nem valor de mercado. Fontes e ressalvas em `docs/CAREER_CASE_STUDIES.md`.

**Hipóteses e mudanças:**
- expectativa da base separada da experiência sênior; negociação de entrada gradual/imediata, com carga que diminui nos primeiros 1.800 minutos;
- pressão passa a interagir com resposta emocional e fadiga; não há fama convertida em aptidão;
- afastamentos curtos 1–2 blocos e longos 4–6; zero partidas durante afastamento; crescimento reduzido, atributos e DNA preservados;
- escolha de papel na retomada após liberação, com condição e exposição distintas;
- mercado admite clubes menores ao abrir negociação ou para veterano com menos de 900 minutos; intenção de permanecer não obriga saída;
- não punir contratação cara por “rendimento ruim” sem ao menos 450 minutos para avaliação;
- legado reconhece carreira e vínculo local; não exige elite;
- aposentadoria 36–39 por decisão, limite 40: SUPERSEDES o fim fixo aos 38 em A0002/A0003 para a experimental 0.2.0. Mantém duração de 216–252 blocos; benchmark deliberadamente para aos 38;
- formação para treinador oferecida como percurso após carreira com escola concluída e 100 aparições, sem licença/emprego automáticos. Esses critérios são uma regra de jogo, não requisitos oficiais da CBF.

**Validação final desta extensão:**
- `npm test` e TypeScript estrito: PASS.
- 100 carreiras completas comportamentais: 100 encerradas, 234 blocos na política que para aos 38, 107 registros de rejeição/dispensa, 59 novas tentativas após rejeição; sem valores não finitos. Profissionalização ainda generosa sob política de persistência/aceitar testes.
- escola/futebol, 30 pares: OVR19 70,65/74,19. Escolhas escolares mantêm consequência persistente.
- cenários adicionais: entrada gradual tem menos exposição que imediata; seis blocos de afastamento geram zero aparições; retorno exige decisão; DNA preservado; projeto menor oferecido em 33 propostas ao longo de 100 janelas construídas, com possibilidade de permanecer em 38 janelas; legado local reconhecido; parar aos 36 e seguir até limite40: PASS; percurso de treinador fica EM FORMAÇÃO.
- lote neutro 200 carreiras: OVR18=63,2, 24=76,0, 30=79,4, 36=78,0, 38=75,6; média 745,7 aparições. Benchmark ainda tem excesso de partidas e curva a calibrar.
- 100 DNAs × quatro políticas pareadas: OVR30 NATURAL=91,7 / EXPLORE=89,0 / WRONG=72,8 / LATE-SWITCH=70,0; oito posições viáveis.
- navegador Chromium, 390×844: 48 transições, quatro abas, negociação adulta, recarga de save e offline PASS; zero erros JS ou overflow. Safari real não testado.

**Arquivos de evidência:** `behavior-results-seven-cases.json`, `new-case-results.json`, `calibration-careers-seven-cases.json`, `calibration-positions-seven-cases.json`, `browser-results-seven-cases.json`. Resultados anteriores preservados como estágio A0003, não apresentados como versão final após os dois casos novos.

**Decisão:** manter experimental, revisar por PR e testar com usuário. Afastamentos não são modelo clínico; taxas não foram inferidas de Somália. Internacionalização, empréstimos, economia da família, crise coletiva, pessoas persistentes, licenças reais e segunda profissão completa continuam pendentes.


## 2026-09-30 — D0021 — Treinadores e trajetória profissional
**DECISÃO DO USUÁRIO:** treinadores com competências/preferências/personalidade; relação pode determinar vontade de permanecer; permanência no cargo decorre dos resultados; banco amplo de identidades reais. Durante a execução, acrescentou posição por temporada, decisão em cada turno, quadro gráfico de atuação, OVR lento, categorias separadas, profissionalização por destaque sub-20, estreia como marco e uma partida por turno.

## 2026-09-30 — A0005 — Revisão experimental 0.3.0
**Status:** IMPLEMENTADO / VALIDADO EM PROTÓTIPO. SUPERSEDE o ritmo em blocos, promoção automática por idade e coeficientes anteriores. Não altera a versão publicada até integração.

**Hipótese:** campanha, comando e história pessoal tornam propostas e permanência decisões concretas. Mais partidas não devem acelerar evolução. Destaque juvenil abre oportunidade, sem entregar carreira sênior pronta.

**Mudanças:** 140 identidades reais com fontes/datas; perfis editoriais e quatro tendências institucionais explicitamente separadas dos fatos. Relações por pessoa, confiança profissional distinta de afinidade, calendário integral, direção determinística, sucessão por projeto, propostas contextualizadas e reconsideração após troca. Quadro gráfico por partida, posição/categoria por temporada, contagem profissional separada. Convite por evidência sub-20, opção de adiar, estreia registrada e primeiros minutos curtos. Normalização de desenvolvimento por calendário e escola acumulada durante o ano. Última partida fica visível antes do balanço.

**Antes/depois:** A0004 neutro OVR18=63,2 e OVR30=79,4; nova amostra neutra 200: OVR18=55.3, OVR24=66.5, OVR30=70.8. Frequência e políticas de eventos mudaram, portanto os lotes não são um ensaio causal pareado. A redução corresponde a progressão mais lenta, não prova precisão biográfica.

**Amostras e evidências:**
- TypeScript estrito e quatro roteiros comportamentais de `npm test`: PASS.
- 100 carreiras completas: 48 com aparições profissionais; 127 rejeições/dispensas, 64 novas tentativas. Sem valores não finitos ou travamentos. Profissionalização depende da política de decisão; não é taxa real de atletas.
- Escola/futebol: 30 pares; OVR19=62.90/65.38; efeito persistente. Crédito escolar acompanha o calendário, impedindo troca de última hora para ganhar conclusão.
- 100 DNAs × quatro políticas pareadas: OVR30 natural=81.5, explorar=78.8, pior posição=63.9, troca tardia=61.8; oito posições presentes. Produção profissional possível em todas as funções; não usar gols como critério de promoção para goleiro.
- Calendário: clube com 38 jogos mesmo durante ausência; equilíbrio global de gols/vitórias; repetição de avanço não duplica rodadas. Demissão determinística perante os mesmos dados; confiança profissional preservada em reencontro; cargos únicos; mudança em proposta exige reavaliação: PASS.
- Convite/estreia: sem promoção apenas por aniversário; separação sub-20/sênior; aparições aumentam no máximo uma por turno; estreia inicial com 9 minutos no cenário de motor; crescimento de OVR de 0,10 num cenário de partida; última partida antes do balanço: PASS.
- Chromium móvel 390×844: fluxo inicial 48 transições, quatro abas, save/offline/reconversão PASS. Cenário adicional: convite, estreia, primeiros 18 minutos, quadro de atuação, comando, tabela, busca e estatísticas por categoria/posição PASS; sem erro JS/overflow. Entradas montadas de teste não representam uma carreira natural.

**Resultados:** `behavior-results-0.3.0.json`, `new-case-results-0.3.0.json`, `coach-results-0.3.0.json`, `single-match-results-0.3.0.json`, `calibration-careers-0.3.0.json`, `calibration-positions-0.3.0.json`, `browser-results-0.3.0.json`, `browser-story-results-0.3.0.json`.

**Interpretação e decisão:** manter experimental para teste pelo usuário. A política neutra apresenta muitas carreiras sem acesso sênior; preservar a rota de futebol menor sem usar a seleção como punição genética. Campanhas C/D e base têm formatos experimentais, não regulamentos oficiais. Personalidades numéricas ainda exigem curadoria de cada treinador. Elencos, internacionalização, empréstimos, contratos de comissão e envelhecimento dos treinadores permanecem pendentes. O ritmo agora varia de 401 a 909 turnos de calendário no lote; o alvo de quatro horas precisa de validação humana. Os saves antigos são preservados, sem reescrever fatos passados em blocos.
