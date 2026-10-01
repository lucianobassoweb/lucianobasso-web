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

### D0022 / A0006 — Origem escolhida e revisão da interface

Pedido: cidade de nascimento e clube do coração devem ser escolhas iniciais; refazer UI/UX. Implementado campo livre de cidade com sugestões, UF obrigatória e seleção entre 156 clubes; propagação para origem/residência/escolinha. Nova interface responsiva com foco no evento, escolhas numeradas, resumo lateral ou expansível, navegação clara, recibo de escolha, tipografia maior e painéis de reação/contexto.

Verificação: build TypeScript; browser-smoke (48 transições, save e offline); browser-career-story (convite, estreia, quadro, treinadores, posições/categorias); browser-ui-redesign (390×844 e 1440×960, validação de origem, cidade fora da lista, clube independente, ausência de overflow, navegação e save). CLI agent-browser indisponível; Playwright/Chromium utilizado. Githack confirmado 403; entrega do HTML independente, sem declarar o link online resolvido.

## 2026-09-30 — H0001 — Continuidade no Codex local

**Pedido do usuário:** trazer o desenvolvimento do chat “Continuar projeto do jogo” para a conversa local “Continue o desenvolvimento do 1903”.

**Origem conferida:** PR #1, branch `codex/1903-seven-careers-20260930`, commit `aa17befbb31a3e10a6e93a283896cd67319555aa`. Importados fonte modular, HTML standalone, estudos, especificação, protocolo, log e testes. PR continua em rascunho; `main` permanece no hotfix 0.1.4.

**Decisões vigentes:** D0021 e D0022 prevalecem sobre o ritmo em blocos e o sorteio de cidade/clube afetivo. Uma partida por turno, categorias separadas, acesso profissional por evidência sub-20, estreia gradual, OVR lento, treinadores persistentes, origem escolhida e interface revisada. As sete carreiras e suas fontes permanecem nos documentos do projeto.

**Trabalho local anterior:** a tentativa incompleta de 0.1.5 foi preservada em stash e em patch externo ao repositório. Não foi aplicada sobre a 0.3.0: parte das proteções de escolhas já existe na versão importada, e memória detalhada de partidas deve ser reavaliada no motor modular antes de qualquer integração.

**Verificação nesta transferência:** instalação de dependências a partir do cache; `npm run typecheck` e `npm test` PASS. 100 carreiras encerradas; 48 com aparições profissionais; 60 trajetórias pareadas de escola/futebol; cenários de save legado, reconversão, retorno, aposentadoria, treinador, calendário, promoção e estreia PASS. Nenhuma fórmula foi alterada nesta transferência. A prévia no navegador desta sessão não pôde ser validada por conexão local recusada; provas de navegador anteriores permanecem históricas.

**Próxima etapa:** auditar a 0.3.0 real antes de desenvolver: persistência e migração, histórico por clube/adversário, ritmo após abandonar blocos, seleção sub-20 e variedade/efeitos das decisões. Resolver acesso jogável de forma verificável sem priorizar GitHub Pages. Safari/iPhone e duração humana continuam pendentes.


## 2026-09-30 — D0023 / A0007 — Orquestração de subagentes

**Pedido:** escolher modelos por atividade para ganhar tempo e economizar tokens. Autorização explícita do usuário; nenhuma conversa independente foi criada.

**Hipótese:** separar investigação delimitada, correção especializada e integração evita leituras repetidas e conflitos. Paralelizar somente tarefas independentes reduz espera; delegar pequenas alterações pode aumentar custo.

**Implementação:** AGENTS.md no workspace e no repositório; configuração de projeto e ponte local com cinco papéis. Explorador Luna low, verificador Luna medium, implementador Sol 6.1 medium, revisor Sol 6.1 high, especialista Astra high apenas após insuficiência concreta. Principal mantém modelo selecionado na conversa, integra/loga/gera build/publica. Máximo de dois trabalhadores simultâneos, briefing sem histórico integral, respostas até 400 palavras, um dono por arquivo, sem agentes recursivos. Política detalhada e diário em docs/ORCHESTRATION.md e docs/orchestration/runs.jsonl.

**Piloto efetivamente executado:** Luna verificou configuração e depois criticou a UI em leitura; Sol 6.1 auditou persistência, reproduziu três riscos e foi reutilizado para correção exclusiva de persistence.ts e teste próprio. Implementação reutilizou esforço high da auditoria para conservar contexto; isso não altera o default medium para novos trabalhos. Principal editou UI, configuração, log e bundle. Sem conflito de arquivos; Astra desnecessário.

**Validação:** parser TOML e checker aprovaram cinco papéis, arquivos relativos e limite de dois trabalhadores, incluindo a ponte do workspace. A aceitação das solicitações de modelo foi observada. Não há comprovação de que uma sessão já aberta releu os defaults do TOML: a ferramenta desta rodada recebeu overrides explícitos.

**Resultado/aprendizado:** delegação encontrou corrupção estrutural, perda de bytes rejeitados e falhas de quota/armazenamento que eram invisíveis no fluxo normal. Valores de tokens, custo, identidade interna confirmada e duração completa não foram expostos; ficam null no diário. Nenhum percentual de economia foi inventado. Próxima rodada deve comparar entregas semelhantes antes de alterar roteamento ou aumentar concorrência.

## 2026-09-30 — D0024 / A0008 — 0.3.1 experimental: UI e proteção do progresso

**Pedido durante a rodada:** conferir como ficou UI/UX, aplicar habilidades disponíveis e baixar o necessário. Skills design:design-critique e frontend-design aplicadas; ambas já instaladas. Nenhum download adicional necessário para a solução entregue.

**Base/causeamento:** motor 0.3.0 importado do commit aa17bef. A UI existente já tinha decisões numeradas, detalhes expansíveis e toque adequado. Crítica estática apontou orientações ocultadas no celular, títulos visuais sem semântica e intenção de mercado sem seleção anunciada. Inspeção real mostrou placar que identificava apenas o adversário e painel de atuação longo. Recarga durante o teste apresentou UI antiga pelo cache 0.3.0 do worker standalone, apesar do HTML modificado.

**Direção/implementação da interface:** azul profundo/marfim/dourado; logo compacto, títulos editoriais e fontes locais, sem depender de rede. Ícones SVG embutidos na navegação, rótulos curtos com nomes acessíveis completos e estado atual. Placar central identifica ambos os times; métricas de goleiro ficam em quatro colunas. Espaçamento móvel compactado para antecipar decisões; detalhes de torcida/contexto permanecem expansíveis. Orientações da criação ficam visíveis no celular. Formulário nativo com campos obrigatórios, submit por teclado e fallback para nome composto só de espaços. Títulos de seção usam h3; intenção de mercado anuncia aria-pressed. Nenhuma fórmula, categoria, DNA, evento ou condição de promoção foi alterada.

**Persistência: reprodução e correção:** auditoria Sol reproduziu quota/indisponibilidade interrompendo handlers, objeto só com version quebrando render e JSON truncado virando criação/sobrescrita. Agora leitura e escrita validam estrutura original e campos modernos quando presentes; opcionais ausentes continuam aceitos. Falhas de acesso/read/write/clear são capturadas. Dados inválidos/não finitos/cíclicos não substituem o original. Toda mutação revalida o registro atual; corrupção de outra aba também fica protegida. Os bytes rejeitados permanecem na chave original e ficam disponíveis para download. UI corrompida impede nova carreira automática e oferece download/retry; falha de quota mantém a carreira em memória com aviso, exportação e tentativa de salvar. Exclusão que falha não limpa o estado da tela. Não foi implementado reparo/importação automática de bytes inválidos; é uma pendência explícita.

**Compatibilidade:** preservados chave 1903.save.playable2 e schema 0.1.0-playable.2. Auditoria prévia carregou cinco snapshots do motor 0.1.4 real (introdução, posição, ingresso, partida e adulto) e completou a primeira transição sem perder origem/clube afetivo. Isso não prova todos os saves legados. O teste novo cobre ausência de campos posteriores e payload moderno; os saves do usuário não foram acessados nem modificados pelos testes de persistência.

**Cache/build:** standalone gera HTML, bundle e identificador do cache derivado de SHA256 do HTML. Worker instala novo cache e assume clientes após ativação; limpeza limitada ao prefixo correspondente. Build modular tem cache de versão atualizado. LocalStorage não é apagado. Não registrar uma recarga com cache velho como validação da build nova. Correção conferida por conteúdo real servido; fluxo final usa a build 0.3.1.

**Verificação desta sessão:**
- npm test: quatro roteiros comportamentais existentes + 18 grupos de persistência PASS. Lote de 100 carreiras encerradas, 48 profissionais, 60 trajetórias pareadas escola/futebol; cenários de retorno/reconversão/calendário/treinador/promoção/estreia preservados. Nenhuma recalibração opcional foi executada por se tratar de UI/persistência/configuração.
- TypeScript e geração standalone PASS; checker de agentes/ponte PASS. Os testes Node usam armazenamento em memória.
- Navegador do Codex: origem 127.0.0.1:8766 separada da carreira do usuário em 8765. Formulário obrigatório, criação, introdução, posição, escola e primeira atuação; 24 transições adicionais em 390×844, recarga de save, quatro abas, estado de mercado, perfil/estatísticas. Nenhum erro JavaScript, overflow ou aviso de save nesse fluxo.
- Carreira e mercado em 320 px; carreira em 1440×960; sem overflow observado. Navegação de 60 px; escolhas observadas de 98–119 px. Resumo recolhido em render móvel e aberto em desktop. Goleiro com quatro métricas conferido.
- Fixture tests/persistence-ui.html simula storage só em memória: corrupção mostrou painel com criação bloqueada; quota mostrou aviso e carreira jogável. A primeira prova detectou aviso duplicado no painel de recuperação; corrigido e revalidado, restando um único botão de download. A fixture é repetível após gerar o bundle.
- Capturas mobile/desktop e HTML independente nos outputs locais. Não foi instalado pacote, fonte remota ou navegador adicional.

**Resultado/limites/próximo passo:** 0.3.1 experimental jogável; docs/UI_REVIEW_0.3.1.md registra decisões e evidências. docs/TECHNICAL_AUDIT_0.3.1.md resume cinco riscos, incluindo duração 401–909 turnos, ledger por adversário/estádio ausente e dependência da política na profissionalização. A carreira de quatro horas, Safari/iPhone físico, offline no dispositivo e leitor de tela real continuam sem validação nesta sessão. Medir uma carreira humana e persistir memória compacta de partidas são as próximas melhorias do core. GitHub Pages não entrou no escopo.

**Adendo de entrega local:** a build 0.3.1 foi aberta em 8765 no mesmo origin da carreira existente. A carga exibiu Luciano Basso, Grêmio, 23 anos, OVR83 e o mesmo balanço 2036 com proposta do Vasco. Apenas abertura/recarga; nenhuma escolha, avanço ou gravação foi executada nesse save. Captura móvel salva e viewport temporário restaurado.

## 2026-09-30 — H0002 — Casos de jogos e expectativa entre partidas

**Pedido:** estudar outros cases e trazer suas mecânicas para o 1903, após a comparação com o Modo Carreira do Lance.

**Hipótese antes da implementação:** decisões repetidas, recibos que mostram apenas o rótulo e consequências escondidas enfraquecem a expectativa. Objetivos curtos, retorno factual da escolha e capítulos persistentes podem melhorar a compreensão do percurso sem acrescentar partidas, controle de treino ou sorteios ao motor. Diversão precisa de avaliação humana; aprovação técnica não comprova envolvimento.

**Plano/escopo:** fontes oficiais de New Star Soccer, Football Manager, Wildermyth e Citizen Sleeper. Separar fatos e inferências em docs/GAMEPLAY_CASE_STUDIES.md. Camada narrativa opcional e determinística, com contexto da escolinha/base/profissional/retorno, progresso por participação real, prazo e resultado parcial. Resultados de escolhas capturados antes de simular o próximo turno. Sem alterar fórmulas de DNA, posição, partida, promoção, calendário ou garantias de mercado; saves antigos iniciam novos capítulos a partir da atualização, sem inventar passado.

**Orquestração:** Luna low pesquisa exclusivamente o documento; Sol 6.1 medium implementa core/tipos/validação/teste focado; principal integra UI, versões, documentação, gates e entrega. Typecheck anterior às edições PASS. As mecânicas propostas na pesquisa que alteram confiança/promessas ficam para outro experimento: neste ciclo objetivos documentam evidências, sem bônus numéricos.

## 2026-09-30 — D0025 / A0009 — 0.3.2: referência de jogos aplicada

**Causa/hipótese:** H0002. O fluxo anterior repetia opções genéricas, guardava somente o rótulo da escolha na UI e recolhia consequências em contexto/histórico. A pesquisa oficial (New Star Soccer, Football Manager, Wildermyth, Citizen Sleeper) sugeriu retorno próximo, objetivos, memória e arcos. Não houve experiência pessoal de jogar essas referências nesta sessão; fatos/inferências/fontes estão em docs/GAMEPLAY_CASE_STUDIES.md.

**Implementação:** stories.ts observa o motor determinístico. Formação3partidas/120min; regularidade3partidas/150min/2notas>=6,8 (tambémGK); retorno2partidas/45min. Prazo8careerTurns. Banco/afastamento não contam. Fecha por êxito/prazo/mudança temporada-clube-categoria/aposentadoria, registra progresso parcial. Sem bônus numéricos, novo RNG, critério novo de promoção, garantia de vaga/proposta ou leitura do DNA. Limite60capítulos; no máximo1capítulo regular por contexto anual, além de retorno. UI mostra objetivo/progresso/balanço e arquivo biográfico no Histórico.

**Retorno das escolhas:** wrapper cobre early returns de escola/conversa/aposentadoria/reconsideração de mercado. Captura antes do próximo advance para não atribuir nota/gols futuros à escolha. Guarda explicação e diferenças observáveis com rótulos humanos. Removidas educação adulta sem implementação e busca de avaliação quando já saturada. career:local passa a estabelecer intenção STAY, tornando continuidade uma escolha de permanência quando estava aberta; fórmula esportiva inalterada.

**Revisão causa/efeito:** protótipo do trabalhador reabria a mesma meta a cada conclusão; principal identificou repetição/arquivo crescente e pediu limite por contexto, cap60 e copy factual. Resultado ajustado antes de gates finais. Microajuste de copy: prazo contado desde abertura, não oito novas rodadas a cada leitura.

**Compatibilidade:** story/lastChoiceResult opcionais e guardados estruturalmente. Inicialização só registra daqui em diante, sem transformar estatísticas antigas em capítulo. Key1903.save.playable2 e version0.1.0-playable.2 iguais. Recibo/progresso persistem e dados corrompidos continuam protegidos.

**Gates:** typecheck, npm test (quatro roteiros+18grupos persistência+histórias), standalone14módulos e checker PASS. Histórias validam migração, progresso real GK, idempotência, prazo parcial, banco/lesão, retorno e todos os recibos antecipados citados. Diferencial versus dist0.3.1 preservado antes dos edits:24carreiras até aposentadoria/31.632operações, estado esportivo/RNG/vida/mercado/coaching idêntico por operação com mesmas escolhas,741capítulos no lote. Excluídos só story/lastChoiceResult/history. Políticas aleatórias podem mudar ao remover opções sem efeito: não inferir que distribuições agregadas sob índices diferentes sejam invariantes.

**Amostras/métricas:** 200carreiras neutras:391–909turnos,média621,9;OVR18médio56,OVR30médio71,1. Auditoria100DNAs por política:OVR30natural81,5,exploração78,8,piorposição63,9,trocatardia61,8; oito posições presentes. Sem alteração de fórmulas ou recalibração. Relatórios calibração/diferencial em outputs.

**Fluxo real:** navegadorCodex em8766 independente do save do usuário8765. Save antigo de teste13anos/GK começou0participações após ação, sem retrospectiva; convite/continuidade e3partidas somaram184min/progresso0→1→2→3; payoff e biografia, recarga preservou registro.390/320/1440px sem overflow/aviso save/erroJS observado. Capturas e HTML em outputs. Save real não avançado/gravadopelos testes.

**Interpretação/decisão:** manter0.3.2experimental. A camada tornou expectativa e consequência legíveis; não comprova que o jogo ficou mais divertido. Não resolve todos os menus genéricos de partidas. Promessas negociadas, arcos paralelos e eventos que relembram rivalidades estão planejados, não entregues. Próximo experimento: dilemas raros condicionados a fatos e playtest humano de leitura/expectativa. Safari/iPhone físico, offline físico, leitor de tela e alvo4h permanecem pendentes. Nenhuma ação em GitHubPages.

## 2026-09-30 — D0026 / A0010 — 0.3.3: informações da partida sem clique

**Pedido/causa:** o usuário quer ler reação da torcida, reação do treinador, contexto e próximos passos diretamente. Na 0.3.2 estes textos estavam dentro de details fechados; reduzir a altura do quadro havia escondido retorno necessário para entender a carreira. Esta decisão substitui a UI expansível descrita em D0022.

**Implementação:** substituídos os dois disclosures por seções estáticas em feedbackCard/eventCard. Torcida e treinador identificados separadamente; contexto/próximos passos com título, antes das escolhas. Nenhum controle permite recolher essas informações. Ajustadas margens e quebra de texto; leitura por rolagem no celular. Eventos sem feedback continuam com corpo diretamente visível. Nenhuma fórmula, evento, estado ou chave/schema de save alterado.

**Build/cache:** 0.3.3 experimental em fonte, pacote, build modular e standalone. HTML regenerado com 14 módulos e cache derivado do conteúdo. Distribuição independente copiada para outputs/1903-playable-0.3.3.html. Leitura de AGENTS/spec/log/protocolo e typecheck anterior às mudanças PASS. Trabalho delimitado feito pelo principal, sem overhead de delegação.

**Verificação:** typecheck após mudança e standalone/build PASS. Gates obrigatórios do protocolo: simulate200 e position-audit100 concluídos, relatórios nos outputs; estatísticas coincidem com a 0.3.2 (OVR30 natural81,5/exploração78,8/piorposição63,9/trocatardia61,8). Não houve recalibração. Não criados testes que espelham markup nem repetido npm test completo, pois motor/persistência não foram alterados.

**UI real:** carreira descartável na origem8766, goleiro Sub-15, com três escolhas. Em390×844 e320×740, textos de torcida/treinador/contexto presentes e com altura positiva, fora de qualquer details; nenhum overflow horizontal. Após recarga continuaram visíveis; três escolhas habilitadas, sem errosJS capturados. Captura em outputs/UI_0.3.3_REACTIONS_MOBILE.png. Viewport temporário restaurado e aba de teste fechada.

**Entrega local/save:** aba do usuário8765 aberta com query0.3.3. Mesma carreira LucianoBasso/Grêmio/23anos/OVR83 e balanço2036,36jogos/5gols/7assistências/CopaBrasil, opções permanecer ou Vasco106mi. Nenhuma decisão/avanço/gravação efetuada neste save. Mudança observável na próxima situação com quadro de atuação. Limites: Safari/iPhone físico e leitor de tela real não testados. Próximo passo continua core/playtest; hospedagem e descoberta de posição não entraram neste ajuste.

## 2026-09-30 — H0003 — leitura específica do momento da carreira

**Pedido:** contexto e próximos passos mais ricos, sem frases prontas repetitivas. **Causa verificada:** feedback da base usa sinal genérico sem destaque e todas as rodadas recebem a mesma conclusão em contextualDecision; no profissional a frase muda apenas entre banco/crise/padrão. A UI exibe event.body sem interpretar trajetória. **Hipótese:** selecionar os fatos mais relevantes do save e associá-los às escolhas reais torna a decisão compreensível. Variação lexical sem mudança de situação não resolve a causa.

**Escopo/orquestração:** Sol6.1high implementa módulo puro de contexto e testes factuais; principal integra UI, concisão, revisão de causalidade/compatibilidade, versões, gates e entrega. Sem alterar RNG, calendário, critérios esportivos ou schema. Leitura inicial spec/log/protocolo e typecheck PASS. Contextos de partida, balanço anual e mercado; eventos especiais preservam descrição. Hipóteses de leitura não equivalem a resultados futuros garantidos.

## 2026-09-30 — D0027 / A0011 — 0.3.4: contexto situado e leitura do próximo passo

**Hipótese/causa:** H0003. O problema não era comprimento apenas: event.body recebia uma conclusão constante em cada rodada. Trocar sinônimos manteria essa repetição. A solução interpreta fatos já simulados e seleciona até três tensões relevantes, em vez de expandir todo o estado.

**Implementação:** novo módulo puro context.ts, chamado pela UI para atuação, balanço anual e mercado. Compara participação/titularidade, nota com média da mesma categoria, confiança profissional observável, mudança documentada de posição, função, campanha coletiva, retomada, escola/avaliações e propostas. Próximo passo ligado aos ids de escolhas existentes. Não revela compatibilidade/DNA, não consome RNG, não inicializa mundo/relação, não escreve no save e não muda fórmulas/decisões do motor. Eventos especiais sem quadro e históricos incompletos preservam descrição; sem inventar partidas individuais passadas.

**Variedade/revisão:** escola e estrutura local aparecem no início, após decisões relevantes ou tensão escolar tardia. Cinco rodadas reais verificam diversidade de observação além dos números e no máximo uma ocorrência de cada contexto inicial. Na primeira prova mobile, titularidade ainda repetia em duas partidas: principal acrescentou interpretação de intervenções GK, jogo sem sofrer gol, contribuição ofensiva em vitória/empate/derrota, expulsão e oportunidade excepcional como titular. Nota versus média ganha relevância a partir de diferença0,4 (limiar de apresentação, não de balanceamento). Retorno/gatilhos graves têm prioridade. Rotinas permanecem concisas quando faltam fatos novos; não há sorteio de frases.

**Balanço/mercado:** seasonHistory do ano encerrado, nunca currentSeason já zerada. Preserva título/dispensa/valor do corpo legado. Acrescenta papel exercido como titular/reserva ou comparação anual no mesmo clube; remove duplicação simples da nota do resumo. Propostas concretas e contrato contextualizam permanência/mudança, sem garantir titularidade. A revisão também corrigiu gramática do treinador e orientações que mencionavam escolhas ausentes.

**Testes:** typecheck anterior e final PASS. Suite npm test completa PASS com16grupos de contexto inicial, quatro suites esportivas, persistência18grupos e histórias. Após refinamento principal, teste focado final17grupos PASS, incluindo GK/intervenções/resultado/expulsão; fixtures isolam as tensões e não exigem preenchimento escolar quando há fato mais relevante. Saves profundamente congelados, getters de DNA/compatibilidade que lançam erro e Math.random bloqueado demonstram pureza/determinismo. Build standalone15módulos PASS. Gates finais200carreiras e100DNAs por política concluídos: JSONs idênticos à0.3.3. Nenhuma recalibração ou mudança de schema/key.

**UI:** origem8766 descartável, GK13/Sub15; uma escolha avançou a partida80min/1defesa/6,5 para52min/3defesas/6,3. Detectada repetição, corrigida e recarga exibiu contraste nota6,3/média6,72, três defesas numa derrota e descoberta reflexos.390×844 e320×740: informações abertas, sem overflow, três escolhas habilitadas, sem erroJS. Captura outputs/CONTEXT_0.3.4_MOBILE.png. Viewport restaurado; aba de teste encerrada. Origem8765 usuário só aberta/recargada: LucianoBasso/Grêmio/23anos/OVR83, mesmo balanço2036 e propostaVasco106mi; agora contexto mostra31titularidades/36participações e contrato2temporadas. Nenhuma escolha ou avanço neste save.

**Orquestração/entrega/limites:** Sol6.1high teve exclusividade do módulo/teste até liberar; principal revisou, refinou interpretação/UI, integrou/validou/registrou/publicou na branch experimental. Não houve segundo trabalhador ou escalada.0.3.4 local e HTML em outputs. Texto continua composicional/determinístico e pode repetir uma tensão quando ela persiste; não prometer biografia escrita sob demanda ou diversão comprovada. Ledger individual por adversário ainda ausente. Safari/iPhone físico, leitor de tela e playtest humano prolongado não testados. Próximo passo: avaliar leitura real e adicionar acontecimentos que geram novas tensões, sem preencher rotina com parágrafos genéricos.

## 2026-09-30 — H0004 — decisões situacionais com custo e memória

**Pedido:** variar os caminhos de “Qual é sua decisão?”, incluindo esforço fora do horário, favores para ganhar espaço e disputa desleal. O usuário autoriza decisões pontuais de esforço; isso não cria gestão de sessões de treino. **Causa:** rotina juvenil sempre local/explore/education e profissional stable/responsibility/discuss/market. As regras de escalação usam rendimento, experiência e confiança profissional; afinidade pessoal é separada.

**Hipótese/escopo:** famílias de dilemas selecionadas por fatos, com três respostas semanticamente distintas, cooldown e memória persistente opcional. Esforço extra com ganho pequeno e custo real, descanso, apoio ao grupo, aproximação pessoal e intriga não violenta entre concorrentes abstratos. Escolha desleal pode ter benefício incerto e custo de confiança/relações, nunca contratação/posição garantida. Nenhum nome de colega ou elenco real será inventado. Preservar decisões especiais, ofertas e pendingEvent já salvo.

**Causa/efeito a verificar:** physicalCondition/mentalFatigue não afetam a nota da base atual; custo apenas nesses campos tornaria esforço juvenil praticamente gratuito. Carga transitória decorrente da nova escolha deverá ter efeito explícito na próxima atuação juvenil, sem punir saves que não tomaram essa decisão. Favores podem melhorar abertura ao diálogo, sem comprar confiança técnica.

**Engenharia:** typecheck inicial PASS; cópia de dist/index/engine0.3.4 preservada em work/1903-baseline-0.3.4. Sol6.1medium dono módulo/tipos/engine/guards/teste; principal integração UI/contexto/recibo/coaches/docs/log/build/gates; revisão independente após integração se necessário. Sem alterações de key/schema obrigatório. Medir gates antes/depois e separar mudança de distribuição por escolhas novas de recalibração de DNA/posição.


## 2026-09-30 — D0028 / A0012 — 0.3.5: três respostas a dilemas entre partidas

**Causa/hipótese:** H0004. A variação foi ligada a situação e consequências, não ao sorteio de sinônimos. Sete famílias: carga/recuperação, espaço, contribuição à organização, rivalidade, pressão, adaptação e caminho. Cada rotina oferece três ids distintos; seleção determinística, sem sorteio, com intervalo de cinco rodadas por família e memória limitada. Preferências, condições e eventos persistentes podem voltar; não afirmar ausência de repetição para sempre. Posição/função, estreia, proposta, balanço, afastamento e aposentadoria preservam seus próprios eventos. Um pendingEvent já salvo mantém escolhas originais até a resolução.

**Motor/efeitos:** módulo decisions.ts; ganho extra no atributo associado à posição, .25×calendarScale (0,1125 na formação/local de20datas; cerca0,059 no profissional de38). Teto99. Custa condição5/fadiga4; bloqueado por lesão, condição<55, fadiga>=80 e repetição antes de cinco rodadas. Carga2 fora do profissional reduz próxima nota0,4 e seguinte0,2, consumida após partida; descanso reduz uma unidade. É custo provocado pela escolha, ausente nos saves sem esforço extra. Descanso recupera condição4 e reduz fadiga5; vídeo aumenta conhecimento3 sem aumentar atributo; alívio reduz pressão4/confiança1; estudo da função reduz adaptação até2 com condição−2/fadiga+3; exposição confiança+2/pressão+5. Todos respeitam limites e relatam deltas aplicados, inclusive zero no teto, sem revelar o valor basal de atributo oculto.

**Relações:** ajuda custa fadiga4, afinidade do grupo+2 e do treinador atual+4, sem ganho de confiança profissional. Cooperação custa fadiga2/respeito do grupo+3. Afinidade e conflito influenciam abertura ao pedido de clareza: dialogue+(affinity−50)×0,12−conflict×0,08>=55; perfil continua predominante, sem comprar escalação. Intriga: chance de descoberta clamp(0,55+ressentimento/200;0,55;0,9); fadiga+3/rivalidade+4. Descoberta: confiança profissional−6/afinidade−3/conflito+8, respeito do grupo−5/ressentimento+8. Sem descoberta: afinidade treinador+2/grupo+2 e ressentimento+2. Relações limitadas0–100, memórias16. Nenhum concorrente nomeado, removido, lesionado ou vaga garantida. No futebol local sem clube, efeitos/memórias são só do grupo; ex-treinador/tactical preservados. Contribuição social é abstrata; retornos narrativos específicos de cada memória ainda não implementados.

**UI/compatibilidade:** contexto do dilema vira próximo passo diretamente visível. Recibo inclui fadiga mental e efeitos reais antes da próxima simulação; decimais compactos, efeitos menores0,01 anunciados sem arredondar a zero. Vocabulário adulto AMATEUR separado de base/escola/empresário; mercado só aparece nos novos packs profissionais, conversas locais continuam possíveis em clube. Log de permanência adulta fala do jogador e capítulo adulto do futebol local. Alterados labels de adversário/treinador local. Chave1903.save.playable2 e versão estrutural0.1.0-playable.2 mantidas; decisionMemory e decisionContext/family opcionais, com guards naturais/enums/limites. Nenhuma reclassificação retroativa de partidas.

**Revisão/retrabalho:** implementador Sol6.1medium; revisão Sol6.1high independente reproduziu trêsP2: ganho acima99, resumo nominal no teto e favor local alterando ex-treinador. Corrigidos pelo implementador; revisor retestou cinco fixtures em dist e encerrou todos. Principal revisou copy/nextStep, labels adultos, integração, pacote/build, testes e gates. Teste de treinador assumia que toda primeira rotina tinha discuss: fixture passou a verificar conversa de evento legado explicitamente, preservando cobertura; teste de contexto usa apenas ids de fato oferecidos. Gates dev agora lançam erro ao atingir6000operações sem aposentadoria, evitando relatório de carreira incompleta silencioso.

**Testes:** suite npm test completa PASS: quatro suites esportivas,18grupos de persistência, histórias,17grupos contexto e15grupos novos. Novos grupos cobrem diversidade/cooldown, ids forjados, idempotência, lesão, GK, carga e nota2→1→0, ausência de RNG na seleção, reload/guard/corrupção, caps/deltas, ex-treinador, conversa com afinidade/conflito e contexto adulto. Typecheck final/standalone16módulos PASS. Após ajustes de copy, focused15PASS. Gates finais200carreiras e100DNAs×4políticas concluídos com aposentadoria exigida; todas oito posições presentes. Relatórios em outputs. Sem teste Safari/iPhone físico ou playtest humano prolongado.

**Balanceamento antes/depois/decisão:** política neutra200: OVR30médio71,1→72,1; jogos profissionais196→126,7; transferências0,8→0,4; turnos621,9→584,4 (472–909). Política pareada100 por posição: natural OVR30 81,5→82,7; exploração78,8→80,0; piorposição63,9→65,1; trocatardia61,8→62,6; jogos natural377→350/exploração224→213/pior79→73/tardia314→270. Diferença natural/pior continua17,6; explorar cedo não condena. Não houve recalibração DNA/compatibilidade. Manter como experimental: escolhas novas mudam política/RNG de resolução e oportunidades, esforço introduz custo de nota e afinidade afeta diálogo; agregados não isolam causalidade nem são incidência real. Queda de jogos/progressão profissional pede observação no próximo ciclo, especialmente a porta adulta ausente. Não afirmar meta de quatro horas validada.

**Mobile real/save:** origem8766 descartável GK13/Sub15: cinco avanços mostraram PATH→SERVICE→LOAD→RIVALRY→PRESSURE; ajuda gerou fadiga4/afinidadegrupo2; extra ganho0,11/condição−5/fadiga4 e nota seguinte com carga; intriga circulou sem descoberta, afinidadegrupo2/ressentimento2/rivalidade4/fadiga3. Recarga preservou recibo e opções.390×844 e320×740 sem overflow, três botões habilitados, informações abertas fora de details, sem erroJS capturado. Screenshot outputs/DECISIONS_0.3.5_MOBILE.png; viewport restaurado/aba teste fechada. Aba anterior do usuário deixou de estar disponível; nova aba8765query0.3.5 exibiu exatamente LucianoBasso/Grêmio/23/OVR83/balanço2036,36jogos31titularidades e opçãoVasco106mi. Nenhuma escolha, avanço, reset ou importação nesse save.

**Diagnóstico recebido/pendência confirmada:** arquivo separado de uma carreira23anos/SãoLuiz, AMATEUR/YOUTH, não a carreira da aba. Carga/pendência preservada/avanço/recarga na build0.3.5 PASS somente cópia Node e armazenamento falso; turno223→224, famíliaSERVICE/três escolhas, arquivooriginal intacto. Zero profissional condiz com categoria, não demonstra perda de stats. Revisão read-only em baseline seguiu714operações até40, sempre amador: promotionEvidence só permite16–20; testes adultos preservamYOUTH e mercado exigeSENIOR. Assim a rota adulta profissional está fechada, contrariando caminho possível de amadurecimento tardio. Não remover status para forçar migração nem transformar jogos antigos em profissionais. Próximo ciclo motor próprio: evidência local recente→avaliação adulta incerta→convite/transição existente→estreia, com recusa/intervalo e calibração. Não acoplado à0.3.5 nem tratado como resolvido. Fase interna adulta ainda pode dizer PROFISSIONAL/AUGE mesmo com categoriaAMATEUR; apresentação/phase precisa ser reconciliada nesse ciclo. Relatórios diagnósticos mantidos apenas em outputs, sem publicar o save bruto.

**Entrega/orquestração:** HTML standalone0.3.5 em outputs, branch experimental/PRexistente; main/Pages mantidos. Até dois trabalhadores simultâneos, briefings delimitados, modelos solicitados Sol6.1medium/high; modelo efetivo, tokens e custo não expostos e registradosnull. Nenhuma porcentagem de economia inventada. Próximo passo prioritário: porta profissional adulta baseada em evidência observável e oportunidade, seguida de playtest sobre variedade e ritmo.


## 2026-09-30 — D0029 — sonho inicial, proposta de posição e estagnação

**Respostas diretas do usuário:** (1) “o sonho inicial é escolhido por mim”; (2) treinador “pode perguntar se quero, se eu não aceitar tem consequencias. igual a vida real”; (3) insistência inadequada “impede a profissionalizacao ou ao menos mantem o jogador em times muito ruins e não há evolucao”. Respondem às três perguntas da pesquisa POSITION_DISCOVERY_RESEARCH.md, antes pendentes. Decisão de design registrada; esta entrada não declara implementação nem recalibração do motor.

**Regra aceita:** sonho inicial escolhido pelo usuário entre posições, sem atacante imposto. Sonho e posição exercida são campos conceitualmente separados: desejo não altera DNA nem exige especialização definitiva aos12. Entrar sem posição fixa continua compatível. Para saves existentes, não inventar um sonho retrospectivo a partir da primeira posição do histórico.

**Agência:** treinador pode propor experimentar outra posição, com justificativa por repertório observado/atuações e oportunidade tática. O usuário aceita ou recusa; posição não muda silenciosamente. Aceitar abre experiência e adaptação com custo coerente com idade/distância, não sucesso garantido. Recusar mantém a posição desejada e pode custar espaço, apoio do comando ou a oportunidade oferecida; efeitos dependem da proposta, necessidade do time, estilo do treinador e rendimento posterior. Não usar recusa isolada como sentença genética ou retirar atributos só por desobediência. Trocas posteriores continuam negociáveis e devem permitir sair de um percurso ruim.

**Consequência esportiva escolhida:** insistência prolongada sem responder às exigências da posição pode impedir promoção, limitar mercado a projetos fracos e estagnar a carreira. Interpretar “não há evolução” como estagnação relevante na função/carreira, não congelamento universal e arbitrário de todos os atributos. Aprendizagem específica, maturação e experiência podem ocorrer sem produzir desempenho suficiente para progredir naquele papel. Um atleta com desempenho adequado não deve ser bloqueado porque o motor sabe sua compatibilidade oculta. Amostra suficiente e feedback concreto, infância permissiva, competição progressivamente seletiva.

**Compatibilidade com princípios anteriores:** caminho lendário possível no save não é sucesso garantido em qualquer posição ou sob qualquer decisão. Pode exigir revisar o sonho, experimentar, reconstruir repertório e aceitar oportunidade menor. Reversibilidade da rota deve existir; não acrescentar hard cap permanente. A porta adulta ausente confirmada em D0028 precisa ser corrigida para que a consequência seja da trajetória, não de um bloqueio técnico aos21. Incompatibilidade, falta de habilidade atual, concorrência e dívida de adaptação são causas distintas; posição e função permanecem separadas.

**Plano de implementação/aceitação:** campo opcional dreamPosition e UI de criação, sem migração que fabrique preferência; sugestão de posição como evento explícito, argumentos visíveis, aceite/recusa persistentes e retorno da experiência; comparação pareada insistir/aceitar/recusar-e-recuperar ao longo de idades, com resultado de promoção/espaço/mercado/desenvolvimento; todos8caminhos, save antigo preservado e nenhum diagnóstico genético exposto. Revisar critérios atuais de promoção/mercado junto da porta adulta, sem bloquear todo adulto por idade. Não aumentar punição sem medir nota, evolução e oportunidades. Próxima revisão requer E2E mobile e gates do protocolo.

**Trabalho desta resposta:** conferidas perguntas originais, pesquisa, POSITION_SYSTEM e growthStep/feedback existentes; principal registrou decisões em spec/sistema/outputs. Sem alterar código, build, fórmulas ou save e sem novo teste de código por alteração documental. Delegação dispensada neste escopo. Confirmação de regra não equivale a build nova; versão jogável permanece0.3.5.


## 2026-09-30 — H0005 — responsabilidade posicional na avaliação da torcida

**Pedido:** torcida cobra zagueiro/goleiro em derrota e atacante quando o time não marca; motor percebido como limitado. **Reprodução:** baseline0.3.5 seed14, GK25Grêmio80min/0–3/nota6,1/1defesa e ST80min/0–3/6,3. Ambos recebem “A torcida mantém a avaliação anterior”, hate0/passion0/respect0,15. O algoritmo diminui paixão jázerada e sempre aumenta respeito; texto deriva da diferença apósclamp e ignora posição/minutos/setor. Banco no mesmo jogo não teve atuação, deve continuar sem culpa individual.

**Hipótese/escopo:** avaliação determinística de cobrança e reconhecimento por papel, placar, nota, minutos, defesas/produção/xG, oposição/clássico/expectativa e memória existente. Distinguir frustração coletiva, responsabilidade do setor e evidência individual. Golsofrido não prova falha pessoal; derrota não apaga grande atuação; vitória não absolve mau desempenho. Retorno modifica relação persistente e pressão/estado mental, com memória em momentos relevantes. Base/local recebem leitura proporcional à idade, sem projetar hostilidade profissional em toda infância.

**Engenharia:** typecheck inicialPASS; dist/index0.3.5 preservados em work/1903-baseline-0.3.5. ImplementadorSol6.1medium dono fans.ts/testespuros; principal engine/tipos/integracaotests/versoes/log/build/gates. Revisor independente para integração/limites/clamps. Preservar RNG/scoring/calendário/estatísticas/key/versionstructural. Não inventar ledger de erros/duelos/chances ou cronologia de gols durante presença que o motor ainda não registra. D0029 de sonho/posição continua design pendente, porta adulta também pendente: não declarar resolvidos por este ajuste.

## 2026-09-30 — D0030 / A0013 — 0.3.6: torcida cobra responsabilidade em campo

**Causa/resultado:** H0005 reproduzida no motor anterior e corrigida no estado, não apenas na frase. Seed14Grêmio0–3Corinthians/GK80min6,1 e ST80min6,3: nova cobrança defensiva/ataque, respectivamente; hate aplicado0,67727/0,55153, pressure final13,35348/12,88927 a partir12 e respect0, em vez do ganho automático0,15. Minutos/placar/nota/stats/RNG do avanço imediato coincidem com baseline, confirmado independentemente para GK/ST/CB. CB ficou no banco: nenhuma cobrança individual. Igualdade imediata não implica carreira futura igual: os novos efeitos emocionais afetam oportunidades e desempenho posteriores pelos consumidores existentes.

**Avaliação:** fans.ts pura/determinística, recebe apenas observações, estado mental e relação/contexto. Pesos defesa/ataque GK1/0, CB0,95/0,08, FB0,68/0,38, DM0,72/0,32, CM0,42/0,55, AM0,2/0,82, WG0,12/0,95, ST0,08/1; parâmetros experimentais, não medidas reais. Derrota/gols sofridos geram responsabilidade defensiva; time sem marcar gera responsabilidade ofensiva. Nota baixa/expulsão aumentam cobrança individual, mesmo em vitória. Boa nota, defesas, produção e partida sem sofrer gol geram reconhecimento que pode coexistir com cobrança coletiva. xG amplia exposição do ataque sem declarar chance perdida; xA observado atenua cobrança de CM/AM/WG sem inventar assistência. Minutos/90 e idade/categoria reduzem intensidade; base até13escala0,28, até15 0,45, até17 0,65; local0,6/base0,75/profissional1 limitam escala. Fallback de categorias segue calendário14U15/15U17/16–20U20, integração fornece categoria explícita inclusiveAMATEUR.

**Contexto/limites:** demanda0,7–1,5 por expectativa, força relativa do adversário, campanha realmente registrada >=5jogos abaixoesperado, clássico, relação e memórias recentes. Não infere sequência de derrotas de uma partida. Deltas reais apósclamp0–100: até3paixão/ódio/pressão e2respeito/moral/confiança por avaliação; reconhecimento não garante aprovação irrestrita. Bônus legados de clássico/produção e memórias contra adversários preservados, portanto teto por avaliação não é teto do total de um clássico. Removido respeito automático por participação e dupla penalidade de respeito pela expulsão. Não alterados sorteio/calendário/scoring/DNA/crescimento; não acrescentadas estatísticas fictícias de erros/duelos ou minuto dos gols. O placar integral expõe o setor, não prova falha pessoal nem que todo gol ocorreu durante a presença do jogador. Pressão e confiança têm consumidor esportivo profissional existente; nota juvenil ainda não depende do estado mental, embora esse estado e a relação persistam.

**Memórias:** PRESSURE somenteSENIOR>=60min/derrota/nota<=5,4 e margem>=3, clássico ou expectativa>=80, com crítica>=2. Até4memóriasPRESSURE por temporada, duplicata exata suprimida e armazenamento existente16porrelação. REDEMPTION exige cobrança/FLOP documentado nosúltimos2anos, boa resposta vitoriosa>=60min/nota>=8 com gol/assistência ou GKsemsofrergol. Ordem de memórias newest-first encerra o último episódio com uma redenção, nova cobrança posterior reabre; não gera várias redenções para a mesma cobrança com placares diferentes. RECOGNITION em grande atuação de clássico. Memória própria também entra no históricoTORCIDA; não reduz peso antigo silenciosamente. Campo enum ampliado, guard textual já compatível; chave1903.save.playable2 e versãoestrutural0.1.0-playable.2 mantidas. Nenhuma migração obrigatória, alteração retroativa ou reescrita do pendingEvent salvo.

**Implementação/revisão:** Sol6.1medium em fans/testespuros; principal engine/tipos/testesintegração/build/docs/gates; Sol6.1high leitura independente. Revisor apontou texto de redenção sem redução implementada e repetição semântica por episódio; corrigidos antes de revisão final. 20grupospuros PASS,5gruposintegração PASS; seisgruposindependentes PASS com54combinações extremas e comparaçãoimediata baseline. Tests abrangem oito posições/IND, piso/teto, NaN/Infinity observações, RNGglobal/DNA proibidos, minutos0/curtos, boa atuação na derrota, máatuação na vitória, xA/xG, pressão/expectativa/campanha, save/reload/eventolegado e memória/histórico reais. Formaçãofixture iniciou com posição/escola já escolhidas; primeira tentativa não chegou à partida por decisão escolarpendente, fixture ajustada. Fixture severa requer confiança elevada/baixa experiência posicional e busca determinística até2000seeds, sem mock de placar ou estado real do usuário.

**Gates:** npmtest completo PASS (suites anteriores e25novosgrupos), typecheck/standalone17módulos PASS, checkorchestrationPASS.200carreiras e100DNAs×4políticas completaram aposentadoria; todasoito posições preservadas. Relatórios outputs/FANS_0.3.6_*GATE.json. Baseline0.3.5→0.3.6 neutra: OVR30 72,1→72,5; jogosprof126,7→129,6; transferências0,4→0,5; turnosmédios584,4→586,8 (448–909). Pareada posição: natural OVR30 82,7→82,6/apps350→349; explorar80→80/apps213→213; pior65,1→65/apps73→73; tardia62,6→62,6/apps270→269. Diferença natural/pior17,6 permanece. Agregados de políticas automatizadas não validam diversão/quatrohoras nem isolam causalidade de cada delta; manter experimental e observar acumulação de pressão.

**Mobile/save:** fixture fictícia em origem8767 com localStorage substituído por Map em memória, sem acessar save real.390×844 mostrou Grêmio0–3Corinthians/GK80min6,1/1defesa e cobrança defensiva diretamente visível fora de details. Escolha revisão gerou conhecimentohandling+3/fadiga+2 e partida seguinte0–1com banco semculpa.320×740 e390×844 semoverflow; consolecapturado semwarn/error. Fixture não inclui sw/favicon, pedidos404 conhecidos do servidor de teste, sem promessa de offline/Safari. Screenshot outputs/FANS_0.3.6_MOBILE.png. Teste encerrado/viewportrestaurado/servidor8767parado. Abausuário8765 atualizada query0.3.6: LucianoBasso/Grêmio23/OVR83/balanço2036 com36jogos5G7A6,92/CopaBrasil e propostaVasco106mi preservados. Nenhuma decisão, avanço, reset ou importação nesse save; a reação nova vale para partidas futuras, não o balanço jáguardado.

**Entrega/próximo:** standalone em outputs/1903-0.3.6-experimental.html e atualização da mesma branch/PRdraft#1. Log/docsD0029 pendentes incorporados sem afirmar implementação. Atédoistrabalhadores, tokens/custo/modelo efetivo nãoexpostos=null; relatório independente em outputs. Motor ainda carece de fatos individuais mais ricos para responsabilidades específicas, e porta profissional adulta continua fechada; próximo ciclo deve corrigir essa rota observável e implementar sonho/proposta de experimentação já aprovados. Esta rodada resolve julgamento posicional da torcida, não toda a profundidade da simulação.

## 2026-09-30 — H0006 — atacante sem produção, nota e titularidade

**Pedido:** seisjogossemgol mantendo titularidade e69min/0G/nota7,1. Não foi fornecido snapshot desse jogo; reprodução equivalente seed9/U15/ST78min/0G0A/nota7,2/2–1/titular na0.3.6. Nota juvenil vem de repertório−padrãoetário e ruído, sem obrigação de produção; escalaçãojuvenil .72 independente do desempenho recente. Profissional usa nível/confiança/bond, mas não sequência de produção. Nenhum ledger recente porposição persistido. Não assumir que toda partida sem gol é ruim: assistência/criação são evidência, enquanto pressão/desmarque individuais ainda não são registrados pelo motor.

**Plano/decisão:** próxima0.3.7. Nota ofensiva limitada à evidência real já disponível (G/A/xA/xG, minutos), sem premiar DNA/OVR como se fosse atuação; atacante pode receber boa nota semgol com contribuição registrada. Memória recente opcional e limitada8atuações reais porclube/categoria/posição/temporada, sem reconstrução inventada de seca em savelegado. Peso progressivo de pelo menos3atuações substanciais/180min e maior em6/360min, reduzido na infância; assistências/criação atenuam, gol reabre trajetória, banco não conta. Efeito na chance de titularidade, confiança profissional, torcida e feedback factual; não remoção automática em qualquer seisjogos nem bloqueio definitivo por seca.

**Orquestração:** Sol6.1medium dono form.ts/testeform; principal nota/engine/types/persistence/UI/build/docs/log/gates; revisãoindependenteSol6.1high apósintegração. Baseline0.3.6 dist/index preservados em work/1903-baseline-0.3.6. Chave/save/pendingpreservados; notas antigas não recalculadas. Meta: causa→reprodução→correção→teste repetível e gates, sem alegar validaçãohumana/Safari ou resolver a portaadulta/sonho pendentes nesteescopo.

## 2026-09-30 — D0031 / A0014 — 0.3.7: nota ofensiva observada e sequência recente na escalação

**Resultado/causa:** H0006, duas falhas reais corrigidas. Reprodução equivalente ao relato seed9/ST12/U15/titular78min/0G0A7,2 → mesma partida78min/0G0A6,6 sem memória nova anterior; justificativa visível de pouca produção. Não foi recebido save do jogo69min7,1; não declarar reprodução desse snapshot exato. Notas antigas/pending preservados. Critério técnico disponível na base não é evidência de boa atuação. A escalação agora consulta produção recente observada, com efeitos concretos posteriores; uma sequência não gera expulsão automática do time independentemente da contribuição/contexto.

**Notas:** observedAttackRating no match.ts, consumida após nota bruta antes dos stats/MOTM, profissional e formação/local. ST/WG sem gol/assistência e xA<0,5: teto6,6 com>=30min,6,8emparticipação<30min; xG>=0,6 sem conversão>=30min teto6,4. Assistência permite nota7+ (teto7,8+0,3porassist); gol não recebe esse teto; xA>=0,5 sem participação direta permitiria7,2 (>=1permitiria7,8). Esta última alternativa é testada apenas em fixturepura: geradores atuais semassist máximoST≈0,166/WG≈0,371prof e0,16base; não anunciar como variedade de engine já disponível. Nada de pressing/desmarque/duelo inventado. ratingReason opcional e factual exibida logo depois dos minutos, sem clique; legado semcampo continuaaceito. YouthMOTM recalculado pela nota final, evitando6,6comMOTM pornota bruta8,2. ProfissionalMOTM já calculado apósnota final. Custos anteriores de carga juvenil continuam na nota bruta.

**Forma/efeitos:** form.ts pura, sem DNA/RNG. Contexto clube/categoria/posição/temporada; até8observações qualificadas (>=45min ou participação positiva comgol), marcadorlastObservedTurn inclui banco/cameos. Semgol desdeúltimogol: pelo menos3atuações>=45min e180min para iniciar, plena6/360min. PesoST1/WG0,5/demais0, gols encerram; assistências0,12porA+xA0,06 aliviam até0,55. Penalty de chance titular máxima0,30SENIOR/0,24AMATEUR/0,18base×idade(<=12 0,5/<=13 0,7/<=15 0,85/demais1). Entrada curta semgol não cria seca nem apaga anteriores; gol de12min encerra. Contexto novo zera leitura antesdaescalação. Idempotência por turn <=marcador; pendingavançorepetido não aplica efeitosduplos. Importação cursor>careerTurn rejeitada. Observaçõesfinita/min0–120/rating0–10/G/Ainteiros0–20/xGxA0–20 e ordemestrita/limite8 guardadas. Chave1903.save.playable2/versionstructural0.1.0-playable.2 preservadas; ausência de recentForm significa histórico desconhecido, sem gerar seca a partir de média/OVR/statsagregados.

**Integração:** startPenalty subtraído da chance profissional, respeitando clamp0,08–0,92 e rampadeestreia existente. Base/local titular .72−penalty comclamp.25–.85; substituto usa45% dos minutosgerados (mínimo12), xG/xA também45%. Ainda não há banco sementrada no simuladorjuvenil; todo fixturejuvenil gera participação, e G/A seguem o sorteio anterior à definição de minutos. Não declarar simulador de chances minucioso. Formacobrada em texto profissional/base, acrescida à reação factual da partida. Somente novasatuações>=45min comsecaativageram intensidade=penalty/(prof.30/base.18): pressão+0,6×intensidade/confiança−0,2; hatepróprio+0,3quandoháclube; profissional trust−intensidade×(1+(100−paciência)/100). Local podeescalarintensidade>1porcap.24/normalizador.18, porém muda poucos décimos porpartida; não atribuir bondprofissional noamador. Banco/cameo não renovam custo pela secaantiga. Estes efeitos somam ao resultado/nota/torcida existentes, sem recalibrar DNA/crescimento/condição/calendário. Não inventado concorrente específico, favoritismo ou lesão para garantir banco.

**Regressão encontrada/calibração:** primeirogate100 mostrou STnatural(n8)0G0A profissionais, porque nova nota limitada+promoçãopor7,2impedia mesmoatacantes produtivos. Relatóriospréajuste preservados outputs/ATTACK_0.3.7_DRAFT_*GATE.json. Corrigido promotionEvidence ofensivo para nota>=6,7 e (G+0,45A)/90>=0,30ST ou(G+A)/90>=0,45WG. Mantidos8jogos/420min/U20/clube/idade16–20; demaisGK7,05/defesa6,95/meias7,2preservados. Não inventar janelas nem estatísticas porposição que categorias agregadas não contêm. Evidência de ST com7,5mas0G0A continuainelegível; ST4G/800min6,8 eWG5A/800min6,8 elegíveis; idade14/7partidas/419min continuaminsuficientes. Convite antesdaestreia eprofessionalStatusINVITED preservados. Recalibração ligada à nota nova, não tornar profissional todo jogador poridade, nem abrir portaadulta ainda ausente.

**Revisão/retrabalho:** Sol6.1medium somenteform/teste, principalengine/types/persistence/match/UI/gates/log; Sol6.1high read-only. Revisor detectouMOTMraw, oitoentradascurtasapagando evidência e cursorfuturo travando gravação. Corrigidos pelo principal com regressões; branch de xA inatingível foi documentada, não falsamente anunciada. Suite completa npmtest PASS apósintegraçãofinal:13gruposforma e5integração novos, suitesanteriores inclusive20torcida/5engine/persistência intactas. Integração pareada120seeds idênticos excetohistórico6×69minsemprodução: U15starts90→79 eSENIOR59→19; as oportunidades diminuem, não proíbemtitularidade universalmente. Revisor11grupos independentes PASS:160pares U15121→104/SENIOR78→27; seed6base76→34min/seed1adult90→20, placarigual; import/write/recovery, reset/gol/cameo/idempotência/limiares/promoçãopipeline. Nenhuma pendência final. Artefato outputs/ATTACK_0.3.7_INDEPENDENT_REVIEW.md. typecheck/standalone18módulos PASS, diffcheckPASS. Sem testeSafari/iPhone físico ou playtesthumano prolongado.

**Gates finais/balanceamento:**200carreiras+100DNAs×4políticas completaramaposentadoria, todas8posições presentes. Baseline0.3.6→0.3.7 neutroOVR30 72,5→72,1; jogos129,6→220; transferências0,5→0,7; turnos586,8→632,7 (391–909). Posição: naturalOVR30 82,6→82,6/apps349→426; explorar80→79,9/apps213→304; pior65→65,1/apps73→129; tardia62,6→62,5/apps269→363. NaturalST agora139,4G/29,8A porcarreira(n8), WG172,4G/122,5A(n17); oportunidade de atacanteprodutivo restaurada. Diferença natural/pior17,5preservada. Aumento de oportunidades é material e ligado à promoção ofensiva/escalação/RNGdepolíticas; manterexperimental e observar frequência de convocação/déficit. Nenhuma causalidade estatística isolada ou meta4hvalidada alegada. Relatóriosfinais outputs/ATTACK_0.3.7_*GATE.json.

**UI/mobile/save:** fixturefictícia6×69min0G0A7,1 emorigem8768, storageMapmemória separado do real; versãofinal gerouST12sub35min0G0A6,6/xA0,06, justificativa, treinador/torcida citando6atuações/414minsemgol. Próximaescolhastay geroupartida1–2/ST42mintitular0G0A6,6; chance reduzida não significa nunca ser titular.390×844 e320×740 semoverflow/reaçãoforadedetails, semwarning/errorcapturado; screenshot outputs/ATTACK_0.3.7_MOBILE.png. Fonte SWcopiada, favicon404dofixtureconhecido, offline não testado. Servidor8768parado, viewportrestaurado/abatestefechada.8765query0.3.7 exibiuLucianoBasso23GrêmioOVR83/balanço2036/36j5G7A6,92/CopaBrasil/propostaVasco106mi igual0.3.6. Nenhuma escolha/avanço/import/reset no saveusuário. Notas eeventopendentes continuam antigos; registro recente começa das próximas atuaçõessemreconstrução inventada. Standaloneoutputs/1903-0.3.7-experimental.html, mesma branch ePRdraft#1.

**Próximo/limites:** gol não é única contribuição legítima, mas motor ainda não registra desmarques, pressão, passes-chave ouduelos; scoringcontinua simplificado. Desenvolvimento da posição/sonho eportaadulta continuam pendentes. Seleçãoporforma não substitui concorrência detalhada de elenco. Não afirmar que todosseisjogossemgol deveriamautomaticamentebancarumST comassistências/boa criação. Modelo solicitadoSol6.1medium/high, efetivo/custo/tokensnull nãoexpostos; atédoistrabalhadores. Mudança completa publicada na experimental, semmergeemmain/Pages.

## 2026-09-30 — H0007 — busca de avaliação sem custo e benefício fraco

**Pedido/reprodução:** usuário pergunta o que perde em career:explore.0.3.7 confere+1observação, semcusto ourisco direto; reprovação−3confiança sónumteste posterior. Observação sóabre segundo candidato apartir6, logo+1acimadolimiar não amplia chancealguma. min(30,observations+1) também podia reduzircontador>30emeventolegado. Não confundir procurar/serconvidado/seraprovado.

**Escopo0.3.8:** busca útil, custosa e opcional: fadigamental+3/pressão+2, prioridade para a próximageração de candidatos com+12p.p na chance de ampliar de1para2candidatos, semgarantirsegundo candidato, convite imediato, aceitefamília/aprovação oupromoção. Apenassemclube/nãoSENIOR; uma busca portemporada, semstack enquantoaguardalista e indisponívelcomfadiga>=80. Ganhoobservação+1monotônico, semclamp30retroativo. Consumo na lista realmentegerada, semalterar chance deaprovaçãodoteste. Labels/reciboantes/depois verdadeiros comdeltas0–100. Hint atual no render paraeventolegado, semreescreverid/corpo/optionspersistidos; opçãoinaplicável desabilitada/guardadanomotor. Novoscampos opcionais, seminventarhistóriaoudebitargastoemR$ semsaldo.

**Limitesautorizados:** pedido de decisões comcustos/benefícios jápresente na sessão; correção pequena semperguntas. Pressão/fadiga não alteramnota juvenil nemprobabilidadedotestehoje; custo é estado persistente que pesa na rotina/carga/profissional, não anunciar perdaimediata denota/vaga. Nenhumtraidor/reputaçãodanificada porprocuraravaliação. Porta adultaprofissional/plantéis permanecem fora deste ajuste. Principal implementação/integracão/log/gates; revisorSol6.1high reutilizado read-only, semnovochat. Gates do protocolo final e UIemfixtureisolado.


## 2026-09-30 — D0032 / A0015 — 0.3.8: procurar avaliações com esforço e ganho efetivo

**Resultado/causa:** H0007 confirmado: career:explore só+1observação sem custo, e acima6 sem ganho marginal na chance de segundo candidato; clamp30 podia retroceder contador em evento legado. Corrigido no motor/pathways, sem remendo apenas textual. Busca aplica fadiga+3/pressão+2 (delta real com cap100), observação+1 monotônica, searchPriority e lastSearchSeason opcionais. Somente sem clube/nãoSENIOR e fadiga<80, uma portemporada semstack enquantoaguardalista. Disponibilidade pura para render; guarda antesensureStories/snapshot impede mutação em açãolegada bloqueada. Sem R$ inventado, vaga retirada ou reputação punida.

**Ganho/causalidade:** geração seguinte de candidatos consome prioridade uma vez, mesmo sem segundo candidato. Base chance clamp((observed−35)/65,.12,.65), prioridade +.12 até.77. Acima6observações acréscimo12p.p.; abaixo6 habilita sorteio antesausente, portanto não dizer ganho líquido sempre12p.p. TrialProbability igual, família/aceite/convite/profissionalização distintos. Semprioridade, sorteiosanteriores mantidos. Observação+1 não mantém boost permanente. Uma segunda opção pode ter logística pior, não garantir ganho esportivo.

**UI/save:** hint dinâmico antesclique mostra custos atuais mesmo em pendingantigo comhint somenteganho; IDs/corpo/optionspersistidos preservados. Estado de prioridade entra em snapshot/recibo factual. Guard boolean opcional e lastSearchSeason integer>=0<=season, semnovo schema/chave. Eventos bloqueados desabilitados comrazão. Legado semcampos aceito, corrupção conserva bytes. Camposnovos não reconstroem buscaantiga. Semcusto retroativo em escolha járesolvida.

**Testes:** typecheck/standalone18módulos/npmtest completo PASS. 8grupos search-evaluation: deltas/cap/idempotência; monotonicidade70→71/cooldown; sorteio+0,12 consumido; abaixo6 semgarantia; clube/SENIOR/sobrecarga/priority/cooldown guardado; pressure100; reload/legado/corrupção/cursorfuturo; pipeline real idade13turn2→triallist semtesteautomático. Revisãoindependente Sol6.1high reutilizado read-only:7gruposPASS, 800paresporcenário CMatrib50/seedsiguais, listas2candidatos obs0 0→258; obs6/70 167→258, nenhuma garantia. 91paresganharam opção; análise não estima taxa populacional. Relatório outputs/SEARCH_0.3.8_INDEPENDENT_REVIEW.md. Principal owns source/integracão/build/log, nenhum outro trabalhador necessário.

**Gates:**200carreiras e100DNAs×4políticas completamaposentadoria; oito posições presentes. Neutro0.3.7→0.3.8 OVR30 72,1→71,8; apps220→210,1; transferências0,7→0,6; turnos632,7→631,7(min391max909). Política neutra sorteia opções e podebuscar; disponibilidade/custo/lista modificam trajetórias/RNG, não efeito isolado de pressão. Posição natural82,6/apps426, explorar79,9/apps304, pior65,1/apps129, tardia62,5/apps363 iguais0.3.7; políticas não escolhem novoexplore. NaturalST139,4G29,8A(n8), WG172,4G122,5A(n17)preservados. Artefatos outputs/SEARCH_0.3.8_*GATE.json. 4h não validadas por playtest.

**Navegador/mobile:** HTMLfinal emfixtureisolada8769 comlocalStorageMapefêmero e jogador Testeavaliação12ST semclube, pendinglegado. Antesclique hint fadiga+3/pressão+2; apósclique recibo exato+3/+2/+1 semconviteautomático, partida52min0G0A6,6 e próximaescolha.390×844 e320×740 semoverflow, consolewarning/errorvazio capturado; screenshot outputs/SEARCH_0.3.8_MOBILE.png. Reloadpersistência testadoNode, fixturebrowser resetaMap por desenho; não declarar reloadbrowserpersistente. Servidor8769parado, testeaba fechada, viewportrestaurado. Userpreview8765query0.3.8 mantémLucianoBasso/Grêmio/23/OVR83/pendingTemporada2036/36j5G7A6,92/CopaBrasil/Vasco106mi; nenhumavanço/escolha/import/reset. Standalone outputs/1903-0.3.8-experimental.html. SemSafari/iPhone físico, offline ouplaytesthumano.

**Limites/próximo:** fadiga/pressão não reduzem diretamente nota juvenil ou chance deaprovaçãoatual; custo é estadopersistente/rotina, não alegar performancereduziu. Custo3/2é parâmetroexperimental, não pesquisa fisiológica. Porta profissional adulta, sonho escolhido/aceitar recusa de posição eledger deações individuais continuam pendentes. Roteamento/custos: Sol6.1high solicitado/aceito, modelo efetivo/tokens/custonullexposição indisponível. Publicação na mesma experimental/PRdraft#1, main/Pagessemalteração.


## 2026-09-30 — H0008 — atacante 17 partidas, 1 gol, zero assistências e titularidade

**Relato e reprodução:** usuário informa17j/1G/0A/média6,8/todos titular. Snapshot exato não disponível; prévia visível mantém outro contexto (Grêmio23/balanço36j5G7A), diagnóstico solicitado sem bloquear investigação. Não atribuir números do relato a essa carreira.0.3.8 usa nota juvenil de repertório com teto6,6 em partidas vazias;1gol permite9,6 e pode inflar média. Forma olha apenas sequência depois último gol, apagando toda consequência mesmo em1G/8atuações. Profissional subtrai penalty antesclamp e atributos podem absorvê-la acima.92:120paresatrib99/ST/profconf100 semseca108titulares/comseca104, efeito fraco por saturação. Não afirmar que17j1G impede toda nota6,8 em futebol real: ações não registradas poderiam justificar; engine atual não possui esse ledger.

**Plano0.3.9:** nota observada semprodução teto6,3/curta6,5/desperdício xG>=.6teto6,0; gol1 não libera9,6, teto7,6+0,6G+0,3A limitado10. Manterassistência/criação como evidência positiva. Memória da produção na janela observada<=8,>=6atuações360min, com limiar ST(G+.45A)/90=.25/WG(G+A)/90=.40; gol encerra seca mas não baixa produção inteira. Combinar consequências por máximo, não somar duaspenalidades. Chance profissional: clampesportivo primeiro e subtrair forma depois; semnovoRNG/DNA/plantelinventado. Saves/notas/eventos antigos mantidos, sem reconstruir17atuações da média. Sol6.1medium reutilizado donoform/testepuro; principalengine/match/testeintegração/UI/build/gates/log e revisorSol6.1high read-only. Calibrar pelosgates protocolo e preservar caminho produtivo àpromoção.


## 2026-09-30 — D0033 / A0016 — 0.3.9: produção persistente e consequência após limite da escalação

**Causa/correção:** H0008. Relato17j1G0A6,8/todos titular semdiagnósticoexato, investigaçãoequivalente confirmada. Trêsfalhas: teto de nota vazio6,6/repertóriojuvenil;1gol liberava9,6 e zeravaformacobrada; forma antesclamp podia ser absorvida por atributos.0.3.9: notas vazias cap6,3 (curta<30 6,5;>=30/xG>=.6cap6,0),1gol teto8,2/2gols8,8/3gols9,4+assist.3até10. Não é nota universal obrigatória; raw inferior preservado eass/criaçãoregistradas permitembomdesempenho. Média teórica16×69minsemG/A/xA.1 raw9,6 e1gol raw9,6: antes(16×6,6+9,6)/17=6,776→nova(16×6,3+8,2)/17=6,412. Essa é fixturecontrole, não recalcular relato/save. Não inventar ledgerpressing/desmarque para justificar6,8.

**Produção/memória:**1gol zera contadorseca, não toda avaliação. form.ts puro registra camposderivadosrolling no retorno apenas;persistedobservations/schema/key intactos. Janela<=8registrosqualificados,>=6atuações45min e360minsubstanciais. Cameogol conta total/min, não qualificaamostra. ST(G+.45A)/90 ref.25; WG(G+A)/90ref.40; déficitrelativo ealívioxA<=.35. Max(seca,produção)×pesoST1/WG.5×idade/capsanteriores. Semnovo RNG/DNA, semduplacobrança, semreconstruir17partidas a partir de agregado.6dry90+gol12min: seca0/penalty.1043478, antes0;8×90/1golpenalty.15,2golsnajanela podemrecuperar0. Assists/xA aliviam, nenhumaaprendizagemcongelada. Texto cita apenasjanela/count/min/G/Aobservados.

**Escalação:** primeiro sportingStart=clamp(baseesportivo,.08,.92); baseStart=clamp(sportingStart−recentPenalty,.08,.92), rampaestreia/comeback intactas. SemRNGadicional. Attribute99/highconfidence120seeds pareados: fresh108starts, dry104antes→dry75depois;penaltyagorarealmesmoacimaceiling. Não todossemprebanco, semconcorrênciacomnomeinventado. Base cap.72−penaltyjáestavacorreto, rollingagora impede1golapagarefeito. Banco mantémzeroavaliação/custoindividual e inclui contextoanteriorcoachText semduplicarstatus.

**Integração/verificação:** Sol6.1medium donoform.ts/testsform; principalengine/match/testeintegração/bundle/log/gates; revisãoSol6.1high read-only emandamento. Typecheck/standalone18módulos/checker/diffcheck/suítecompleta PASS;17gruposforma/7engine ofensivo, suitsanteriores persistência/torcida/contexto/dilemas/busca intactas. Fixtureoldnotependingreloadmantida eguardscorruptoscontinuam. História real desconhecida permanece desconhecida. Testesnomotor atrib99nãoabsorve;1golnãoinfla9,6; contribuiçãoAaltaaceita;productivepromotioncriteria iguais0.3.8. Não compensar reduçãonotascom promoçãoautomáticaidade.

**Gates/balanceamento:**200carreiras+100DNAs×4políticascompletamaposentadoria, todas8posições.0.3.8→0.3.9 neutroOVR30 71,8→71,5/apps210,1→183,1/transferências0,6→0,6/turnos631,7→614,2(min391max909). NaturalOVR30 82,6→82,6/apps426→410;explorar79,9→79,9/apps304→290;pior65,1→65,1/apps129→120;tardia62,5→62,5/apps363→356. NaturalST139,4G29,8A→118G22,3A(n8);WG172,4G122,5A→163,1G108,7A(n17). Rotasprodutivascontinuamprofissionais, inferioridadeposiçãoerradapreservada17,5OVR. Queda oportunidadesmaterial pelaavaliação/escalação/RNG de trajetórias;manterparâmetroexperimental,semcausalidadeisolada/frequênciareal. Artefatosoutputs/PRODUCTION_0.3.9_*GATE.json.4hnãovalidadas.

**UI/mobile/evidência:**fixturefictíciaTesteprodução(seed6)ST17GrêmioU20/17j17starts1G0A/média6,8,8observações reaisfabricadaspara cenário69min e1golúltimo. Origem8770/storageMapisoladodo real;HTMLfinal. AvançoUI gerou0–1/reserva34min0G0A6,3 ecoach/fan explicam8participações552min1G0A;notaantiga6,8preservada,total18j17titular/média6,77depois, portantoarredondamentoainda6,8correto. Não declarar que médiaslegadasbaixamimediatamente.390×844/320×740 semoverflow/consolewarnerrorcapturado, screenshotoutputs/PRODUCTION_0.3.9_MOBILE.png. Fixturebrowserephemeral;reloadpersistênciacobertoNode, não alegarbrowsersavepersistente. Servidor8770parado,fixturefechada,viewportrestaurado. SemSafari/iPhonefísico/offline/playtesthumano. Standaloneoutputs/1903-0.3.9-experimental.html.

**Limites/próximo:** média6,8com1Gnãoéimpossívelemfutebolreal, masesseengine não registraoutrotrabalhosuficiente;novanotaavaliaproduçãoexistente. Falta elenco/concorrenteseventuais, cronologia/actionledger, portasprofadultas/sonho/experimentaçãoaprovados. Saveusuárionãoavançado;diagnósticoexatodo17j pendenteuser. Publicação mesmaexperimental/PR#1semPages/main. Custos/tokens/modeloconfirmadonullexposiçãoruntimeausente, não estimareconomiapct.

**Preservação da prévia confirmada:**8765query0.3.9 mostraLucianoBasso/Grêmio23/OVR83/Temporada2036/36j5G7A6,92/CopaBrasil/Vasco106mi igual0.3.8; somenteleitura eversãobadge, nenhumaescolha/avanço/import/reset. O relato17j continuasemdiagnósticoexato.

**Revisão final independente:**Sol6.1high7gruposPASS, nenhumpendente.240seeds/239parescompartida/saturação: fresh217titulares,1Gnasúltimas8×90min183,seca153,produtivo217;seed183injury-9igualnosquatrosavesregistradoàparte. Gol1seca0/rollingpenalty.15,gol2eproduçãoassistidaadequadarecuperam. Legado17j1G/média6,8/pendingexatospreservados;novoregistroapenasnapróximaobservação. Artefatooutputs/PRODUCTION_0.3.9_INDEPENDENT_REVIEW.md. Decisão:manter0.3.9experimentalcomlimites/efeitosregistrados.


## 2026-09-30 — H0009 — ano ruim na escolinha deve levar à experiência de outra posição

**Pedido/diagnóstico:** mudança de temporada só oferece novamente menu das8posições, sem ler rendimento anual. Decisão anterior usuário: treinadorpropõe,usuárioaceitaourecusa comconsequências. Este pedido liga revisão àviradaanual; não mudarposiçãoautomaticamente nemrevelarDNA. Balanço preservadoantesdaproposta; primeiroano semhistórico permanece descoberta. “Não foi bem” exige amostra e função; gols não avaliamzagueiro/GK. Histórico agregado misturando posições não prova fracasso deuma delas.

**Plano0.3.10:** módulo purorevisão doanoimediatamenteanterior, posição principal eúnica conhecida, categoriajuvenil explícita,8j/420min,13–18semprofissional. STprodução(G+.45A)/90<.20/WG(G+A)/90<.30 comnota<7.2;demais nota<6.3/GK6.2. Alternativa por atributosaprendidos/proficiência/distância, semDNA ouRNG, experiência semgarantirencaixe. Menu8IDs conservados,recomendaçãoem destaque, insistênciainformada antesclique. Aceitetrocacomcustoadaptaçãoexistente;insistênciachance titular−.08<=13/−.12<=15/−.16<=18 noprojeto/posição/categoria/temporada, recuperávelcom5j240min eprodução/nota suficiente. Sempenalizar potencial/congelaraprendizagem. Planoopcionalsave/payloadnovoeventosem reescreverpendingle gado. Rootengine/types/persistence/build/gates/log;Sol6.1mediumhelper/testepuro,Sol6.1highreviewread-only.


## 2026-09-30 — D0034 / A0017 — 0.3.10: revisão anual e experiência de posição

**Causa e resultado:** H0009. Antes,positionChoiceEvent repetia menu sem avaliar temporada anterior. Agora balanço continua antes do evento e a revisão modifica título/corpo/recomendação/custo quando há evidência suficiente. Posição não muda antes do aceite. Isso implementa parte deD0029 (proposta/recusa anual); sonho persistente, reconversão/porta profissional adulta não finalizados.

**Avaliação:** helper youth-position-review.ts puro, semDNA/RNG/mutação. Novoano13–18,nãoSENIOR/INVITED;legado semstatus sóESCOLINHA/BASE. Últimoano exato, primaryPosition==atual/positionsPlayedúnica, semcontradição positionAppearances;categoriajuvenilreal,8j420min. Maior categoria avaliada, sem agregar estatísticas entre categorias. STprodução(G+.45A)/90<.20 e nota<7.2;WG(G+A)/90<.30 e nota<7.2;demaisnota<6.3/GK6.2. Não exigir gols de defensor nem sentenciar criança por poucaamostra. Candidato maior roleRating+.045proficiency−2distance excluindoatual, inclusiveexperiênciaGK↔linha quando repertórioaprendido aponta alternativa. Não revelarDNA/altura adulta/compatibilidade; dois atributos dafunção explicados, sempreteste incerto.

**Agência e consequências:** menu8IDsposition preservado, recomendadolabel eInsistircomcustovisível. Troca usa selectPosition/custo/proficienciaanteriores e não concede atributos grátis. INSIST planoopcional contexto season/club/category/position epenalty.08<=13/.12<=15/.16<=18; chancejuvenil.72−form−planclamp.25–.85. EXPERIMENTpenalty0. Recuperação condicional>=5j240min/nota6.7 eSTrate.25/WG.40;demaisnota6.7. Evidência posterior abaixo do limiar pode reabrir cobrança, não clearancepermanente. Mudança de contexto remove efeito. Desenvolvimento/potencial/percurso lendário não congelados. Profissionalização continua por evidência existente, sem veto novo. No feedback pós-jogo, custo descrito para próximas partidas, não atribuído retroativamente à partida concluída.

**Save/recibo/legado:** novo payloadmarca oferta anual e motor recompõe avaliação válida ao escolher; velho evento sempayloadnão ganha custo. Plano y outhPositionResponse opcional guardado:tipos/positions,seasoninteger>=0<=atual,reviewedSeason==season−1,penalty0–.16,EXPERIMENT0,INSIST>=.08/position distinta recomendada. Campo derivado da decisão registrada, semreconstruir passado/sucesso. Históricos/notas/pendingantigos preservados. Snapshot/recibo guardam insistir/experimentar e resumo da posição inclui conseqüência/adaptação. Umowner porarquivo, helper/testesSol6.1medium, rootengine/types/persistence/stories/UI/build/log/gates, revisãoSol6.1high reutilizada read-only. Principal ajustou textos singulares e tirou duplicação de estatísticas/recomendação; regras dohelperpreservadas.

**Verificação principal:** typecheck/standalone19módulos/checker/diffcheck/suítecompleta PASS antes2guardsnovas; depois guards,11gruposhelper+4engine retestados combuildfinal PASS. Engine integra balanço→proposta oitoIDs→aceite/recusa, atributos preservados/debt, recibo/idempotência,save/recovery/legado.180paresidade13semhistóriorecente:117startsnormal→107recusa,10mudanças; seleçãoRNG/mundoiguais. Recuperação suficiente e mudançaprojetogerampartidapareadaigualàsemplano. Revisor apontou guardINSISTposição==recommendedimpossível epenalty0;corrigidos/regressões. Revisão independente final registrada abaixo quando concluída. Não declarar que todossempredevem mudar ou que proposta descobre posição natural.

**Gates/decisão:**200carreiras+100DNAs×4políticas aposentam, todas8posições.0.3.9→0.3.10 neutroOVR30 71.5→71.5/apps183.1→183.7/transferências.6→.6/turnos614.2→615(min391max909). Políticasposição agregadas iguais: natural82.6OVR30/apps410,explorar79.9/apps290,pior65.1/apps120,tardia62.5/apps356. Natural vs pior17.5preservado, exploração não destrói percurso. Igualdade de agregados não prova que nenhuma proposta ocorreu; benchmark mantém políticas de escolha próprias porID, sem simular decisãohumanadoconselho. Artefatosoutputs/YOUTH_POSITION_0.3.10_*GATE.json. Manterexperimental, thresholds/refusacapcalibração futura, sem afirmar taxa realou4h.

**UI/mobile:**fixturefictíciaTesteposição12/ST/17j1173min1G0A6.8,anoúnicoconhecido e passe/visão80. Pipeline real virou13/2027,propõeAM;proposta/custos visíveis em390×844. AceiteUI muda posição eabre escola,recibofactual;reloadfixtureMapresetoucenário isolado e recusaUI preservaST/recibo−8p.p.320×740semoverflow/capturedwarnerrorvazio. Screenshotoutputs/YOUTH_POSITION_0.3.10_MOBILE.png. Fixtureorigem8771Mapefêmero separadodosavereal;reloadNode cobrepersistência,semalegaçãobrowserMapdurável. Servidorparado,testetabfechada/viewportrestaurado. Standaloneoutputs/1903-0.3.10-experimental.html. SemSafari/iPhonefísico/offline/playtesthumano. Previewusuário será atualizado apenas leitura, semavanço.

**Revisão final independente:**7gruposPASS, relatóriooutputs/YOUTH_POSITION_0.3.10_INDEPENDENT_REVIEW.md, nenhumbloqueiocausal. GuardINSISTimpossível corrigido. Recuperação condicional explicitada:seed4/amostra5j240min1Gnota6,7 selecionaigualcontrole;novopartidacameo31min/nota6,3reduzmédia6,63 e texto volta a custo para próximojogo. Correção textual pós-jogo entregue apósnovo typecheck/standalone, semalegar clearancepermanente.9casoscorruptos guardadossave/write/load/recovery,legacy/stale/mixed/recompute efluxobalançoantesproposta validados. PRdraft#1 mesmaexperimental, semmain/Pages. Preview0.3.10 confirmouLucianoBasso23GrêmioOVR83/balanço2036/36j5G7A6,92/CopaBrasil/Vasco106miigual0.3.9;nenhumaescolha/avanço/import/reset. Modelos solicitadosSol6.1medium/highaceitos,modeloefetivo/tokens/custonullexposiçãoindisponível.


## 2026-09-30 — H0010 / D0035 / A0018 — 0.3.11: escala infantil, estados e recomeço

**Pedidos/reprodução:** usuário aponta habilidade50 aos13, falta de botão para recomeçar e estados de fadiga/energia/condição citados sem mostrar. Baseline0.3.10 preservada emwork/1903-baseline-0.3.10;typecheck antesedições PASS. Gerador29+.22apt+ruído/clamp28–54 e infância+1,5 já produziam50+ aos12:500seeds/411comalgumatributo>=50, máximo55,5/média do máximo51,841; um ano de growth em melhorposição:máximo58,06 aos13. Não é reprodução do save exato13 do usuário, que não foi fornecido; prévia atual é outra carreira adulta. Reset já existia escondido emMundo/details, portanto descoberta era falha deUI. Estados existentes persistidos eram citados nos dilemas mas não todos visíveis.

**Escala/causa/efeito:** novo attribute-scale.ts:formationOffset=3,2×max(0,18−age); nova criação subtrai19,2 emcadaatributo, conserva sorteios/DNA e bônus de infância. Floor de crescimento/effective rating/intervalo estimado passa20→5. Nenhum hardcap de potencial poridade. Aprendizagem mantém fatores DNA/posição/maturação/escola/lesão e resistência ao progresso; multiplica delta antesruído por1,4 até13,2,75 dos14–17,1,25 dos18–21,1 depois. Ocorre nas partidas; aniversário não concede habilidades. A primeira tentativa2,3× uniforme até17 passougates mas a amostra500 já permitiu50 durante13; corrigida causa pelo ritmo mais baixo12–13 e maior14–17. Fórmulas são calibração do jogo, sem validação fisiológica, garantia de crescimento/OVR adulto ou regra universal do futebolreal.

**Pares/transição:** baseline relativo de função, G/A juvenis, scouting/trial usam referência de formação coerente; skill real armazenada e crescimento mudaram, não somente a UI. Notas: peerOffset integral até14,metade aos15,zero>=16; stageStandard=32−peerOffset+2,5×(age−12)+.07baseclube. Requisição de promoção continua8j420minSub20+nota/produção jáexistentes, não sobe poridade. Tentativa de offset integral também noSub20 elevou apps política errada120→246; gate identificou risco, exigência dessa categoria foi restaurada para aproximar adultos. Final não elimina diferenças entretrajetórias: novas oportunidades/G/A/RNG e crescimento mudam carreira. Não alegar futebol local/profissionalização tardia resolvidos; porta adulta ainda pendente.

**Compatibilidade:** optional attributeScale='ADULT_REFERENCE_1', mesma versão estrutural/chave. loadSave valida e converte emmemória uma vez; não escreve disco ao carregar. Entradasengine também garantem conversão de saves passados diretamente. Legado<18 desconta offsetidade, floor5; >=18 conserva cada atributo. Marcador garante idempotência; campos inválidos rejeitados mantendo bytes. DNA, conhecimento, posição, proficiência, RNG, estatísticas/histórico/evento pendente intactos. Gravar depois de jogar persiste conversão; sem apagar save nem reconstruir estatísticas. Jovem legado não tem a mesma curva exata de carreira nova: já aprendeu na escala anterior; preservamos progresso relativo e registros. Camposbody/hints/evento antigo permanecem como oferecidos; novos dilemas têm terminologia atual. Dois harnessesVM de persistência adaptados a importar helper real, sem trocar assertions por resultados convenientes.

**UI/UX:** Sol6.1medium reutilizado donoapp/styles expôs Recomeçar carreira emJogar inclusiveaposentado, confirmação explica exclusão de carreira/histórico e criação12;cancel/clearfalse preservam save;sucessolimpa somentechave existente e abreform. Principalintegrourange5paraevitar20–15invertido ematributo8,8/knowledge40; referênciaadulta versus potencialexplicada emMeu jogador. Comoestou mostra condiçãofísica,fadigamental,pressão,confiança,moralatuais /100 semclick/details;fadigaMenorémelhor/condiçãoMaiorémelhor. Não inventamosenergianova; textos novos de decisões referem aumentar fadigamental/reduzircondição. Não alterar deltas.

**Testes/resultado:** typecheck/build/npmtest/standalone20módulos/checkorchestration/diffcheck PASS. Novo teste500seeds/melhorposição/prioridadeFOOTBALL/16atributos/inclui20datas doano13: máximo12=36,3,máximo13=47,56; não garantir impossibilidade absoluta em qualquerfixture/DNA/conjunto de ações. Migração13skill50→34, mesmaDNA/RNG/pending/stats/raw, reloadidempotente, adulto18/23/38attrsintactos, marker inválidoOTHER/1/null recuperável; prioridadeescola reduz ganho e aprendizado chega>80 semcap infantil. Suiteanteriorform/notas/torcida/posição/busca continuapassando. Primeiro run suite falhou por import novo noVM story; harness foi corrigido, não motor; primeiro assertion500 pegou calibração excessiva aos13 e engine foi corrigido.

**Revisão independente:** Sol6.1high reutilizado read-only9grupos.128criações todos16attrs−19,2/restoDNA/RNGigual; migração12–24 sóattrs+marker/pendingguard/rawpreservados;252trials maxdif0,125p.p.porroundingroleRating/120scoutinglistas/RNGiguais;growth22/30/33 e adult22match/RNG idênticos;60matches12CMnotas5,9–8,9,Gdelta0;UIrange5–15/vitals/resetcancel/falha/sucesso emVM. Ampliação150paresmuda sópeerOffset: nota médiaage12 8,32→8,32/15 7,177→6,833/16 6,787→6,333/17 6,38→6,143/18 5,967→5,967;attrs/G/A/min/placar/RNG iguais. Attr98 semamostra16/17/18/20permaneceYOUTH, ST16com8j800min4G6,8abreINVITED/zeroapariçõesSENIOR. Artefatooutputs/SCALE_0.3.11_INDEPENDENT_REVIEW.md;fixturesindependentesemwork. Principal executou integração/gates/mobile, nãoatribuir a revisor.

**Gates finais/balanceamento/decisão:** 200carreiras e100DNAs×4políticas completamaposentadoria, todas8posições.0.3.10→0.3.11 neutroOVR12 45,5→26,3/18 55,5→54,4/30 71,5→72,6/apps183,7→150/transferências0,6→0,6/turns615→596(min412max907). NaturalOVR18 65,4→67/OVR30 82,6→84,8/apps410→365;explorarOVR30 79,9→81,7/apps290→279;pior65,1→66,2/apps120→173;tardia62,5→61,3/apps356→239. Gapnaturalpior18,6 mantém superioridade; exploração não destroi rota, mudança tardia cobra preço. NaturalST(n8)G118→112,6/A22,3→22,6;WG(n17)G163,1→166,8/A108,7→120,3. Apps piores aumentam53 e neutrascaem33,7: diferença material de resultados de calibração/pipeline/RNG, não isolar efeito nem afirmar taxa real. Manterexperimental com parâmetros registrados; sem eliminar dificuldade profissional/adulta/reputação ou completar plantéis/actionledger. Nenhum objetivo4h validadohumano. Artefatosoutputs/SCALE_0.3.11_*GATE.json.

**Mobile/save real:** build final emfixtureisolada8772/localStorageMapefêmero, Testeformação13/estados72,46,39,58,63, ranges5–15 visíveis.390×844/320×740semoverflow; restartUI retornouform12, nova carreiraTeste recomeço foi criada/intro→posiçãoST→escola→primeirapartida20min. Capturedwarn/errorvazio. Browserclickreset geroutimeoutCDP mas inspeção confirmouformnovacarreira; semafirmar diálogonativo/cancelmanual validado, cancel/falha verificadosVM. Reloadfixture recomeçaMap por desenho, persistênciareload testadaNode, semdeclararMapdurável. Servidortemporárioencerrado/aba22fechada/viewportrestaurado; tentativa inicialservidor sempermissãobind foi retomada comescalationlocal. Aba21erroconexão não pôde ser limpa pois retrievalbloqueado porURLdata; não repetirnemcontornarpolítica. Prévia real8765/0.3.11 atualizada somenteleitura:LucianoBasso23GrêmioOVR83/Temporada2036/36j5G7A6,92/CopaBrasil/Vasco106mi iguais, estados96/0/1/94/94agora visíveis. Nenhum cliqueavanço/escolha/reset/importnosavereal. Screenshotoutputs/SCALE_0.3.11_MOBILE.png mostra essaprévia em390×844. Standaloneoutputs/1903-0.3.11-experimental.html. SemSafari/iPhone físico/offline/playtest humano.

**Orquestração/publicação/próximo:** max2trabalhadores, ambos reutilizadosSol6.1medium/high;principalcalibração/core/saves/testes/docs/build/gates/UIintegração. Modelo solicitadoaceito;modeloefetivo/tokens/custonull porausência deexposição, semestimareconomia%. Publicar mesmaexperimental/PRdraft#1, semmain/Pages. Próximos: calibração comsavejuvenilreal, sonho persistente/entradaadultano profissional/actionledger/plantéis, interpretar estados0sem fingir sistemas ainda não implementados.


## 2026-09-30 — D0036 / A0018 complementar — condensar Jogar após rejeição da primeira UI

**Correção solicitada:** usuário rejeitou primeiro cartãoComoestou porque ficava fora da tela de jogo e MinhaTemporada trazia dados estáticos. Isso substitui a apresentação em cartão alto descrita emD0035, mantendo escala/saves/motor. Havia também erro de leitura: seasonReviewAndAdvance abrebalanço doano anterior e jácria currentSeasonzerada; painel antigo exibianovoano emvez doano doevento. frontend-design skillaplicada, direçãoeditorialcompacta; sem instalar bibliotecas/fonts/dependências novas.

**Implementação final0.3.11:** Jogar uma coluna; removesidebar/MinhaTemporada e duplicações de moral/confiança/origem/estudos. Perfil/Histórico seguem guardando informações estáticas. HUD5colunas,52px no mobile fixo acima nav64px+safearea; padding156px+safeparaúltimaação;desktopsticky57pxlogoabaixonav. Valores atuais0–100 e↑físico/↓fadiga, nomescompletos/direçõesARIA/title. Não resumir estadosaíconessemnúmeros nem criar energiafantasma. Resumotemporadaemlinha5números+ano/categoria;matchtítuloacessível visuallyhiddenquandoigualplacar/categoriadoquadro;observação/noteReason/torcida/treinador/contexto/próximospassos mantidosdiretos. Capítulos/recibos/payoffcompactos;principal moveucapítulospara depoisdoevento/decisões para nãoempurrarjogoabaixodatela. RestartdiscretofinaldeJogar, semmenuescondido e confirmaçãomesma; feedbackanterior desprezava hierarquia e foi revisado, não declarar primeiraUI aprovada.

**Balanço correto:** closedSeason extrai /^season-(\d+)$/ doeventokindSEASON_END e busca ano exato nohistórico. Categoriaúnica ativa usa númerosdessacategoria, múltiplas usa totalseTodasascategorias; não inventarcategoria emsavelegado. Arquivoausente/IDstale/sufixo mostra resumoindisponível, sem sugerir que oano encerradotevezeropartidas. Headerdoevento usa ano/idade doarquivo;perfil usa idadeatual. Não reconstruir histórico/mudarstats/rng/engine.

**Verificação:** UIownerSol6.1mediumtypecheck/VM4cenários(PASSactive/retired/match/season) e categoriasingle/multi/stale;principalbuild/typecheck/standalone20PASSapósfaltanteguard eordemfinal; core/gates jáverificadosD0035semnovamudançamotor. RevisãoSol6.1high atualizoumesmogrupoUI(total9), HUDnomes/values/aria;closed17j4G2A6.7contraano seguinte0;single/multi/archiveausente/stale/trailingID;2avançosdeenginecount1→2;resetcancel/failure/success e range5–15 PASS. Nenhum gate amplo extra necessário paraCSS/UI. Relatóriooutputs/SCALE_0.3.11_INDEPENDENT_REVIEW.md.

**Mobile real de interface:** fixturefictíciaTeste de jogo13STseed55/primeiraU15 74min0G1A/nota7,8. Servidorisolado8772/storageMap efêmero.390×844: scoreboardy346,6–395,2/métricas411,2–483,3;HUDy728–780/nav780–844. Rola1,5telas: trêsdecisõesy121–482,HUDsegue728–780, nenhum encobrimento. Pressão38→34/conf64→63 ao reduzir cobrança; convite interrompe partidanormal(total1permanececorreto); continuar escolinha gera2j1G1A/média7,3.320×740:HUDy624–676/nav676–740/scrollwidth320. Rever vídeo comcliqueUI gerafatiga41→43 e3j2G1A/média7,2,estado/render/counteratualizam. Contraste/fluxocommobilebrowsercapturedwarnerrorvazio, screenshotsoutputs/UX_0.3.11_MATCH.png e UX_0.3.11_DECISION.png. Fixturebalanço2027/U15/17j4G2A1MOTM6,7mostra2027encerrada,perfil14 mas event13 (idadehistórica);não zeros2028.

**Desktop/prévia:**1200×900comrolagem,Hudtop57/navbottom57;semoverflow. Saveusuárioleituraapenas preservaLucianoBasso23GrêmioOVR83/propostaVasco106mi/36j5G7A6,92 eestado96/0/1/94/94. Resumocorreto2036/36/5/7/0/6,9 (arredondamento1decimal);evento2036/22coerentecoma temporada. screenshotfinaloutputs/SCALE_0.3.11_MOBILE.png substitui imagemdoprimeirocartão; standalonefinalrecopiado. Nenhum avanço/escolha/reset/import noreal. Testetabs23/24fechadas/servidortemporárioparado/viewportrestaurado. Afirmaçõesdecalibração/save emD0035continuam, UXnumericamentevalidada mas aceitaçãohumanaainda aguardaprimeiroplaytest;semSafari/iPhonefísico/offline.

**Orquestração/resultado:** reutilizadosUIowner/reviewerSol6.1medium/high(max2). Rootnãoalterouarquivosenquantoownerativo;integraçãoeordem/guarddeausênciaapósliberação. Trabalho extra porcorreção explícita usuário/riscoconcretoblanço/HUD, não testesduplicadosgratuitos. Mesmo PRdraft#1/branch, mantendo0.3.11nesta rodada ainda não publicada. Próximopasso: usuárioexperimentarhierarquia e feed; condição/fadiga0nosavereal são estadosexistentes,não inventarvariaçõesartificiais.

## 2026-10-01 — H0011 — respeito decorativo, capítulos automáticos e hábitos invisíveis

**Pedidos e causas observadas:** respeito do grupo só era gravado pelos dilemas e nunca consultado na partida nem mostrado. Chave group:club/local misturava base/profissional e escolinhas diferentes. Capítulos de formação exigiam apenas3participações/120min e zero boas atuações; portanto o calendário normalmente os cumpria sozinho. Idade faltava no perfil. Usuário pediu lazer com prazer/custo físico/peso e capitania/abastecimento/cobertura ligados ao vínculo. Depois pediu decisões compactas próximas dos estados/skills no cabeçalho, cores e desenvolvimento com causas, sem variação aleatória. Na formação o coachName da partida era genérico apesar de clubes já terem job em coaching; na escolinha não existia identidade nominal. Sem reproduzir save específico inexistente nem avançar a carreira real.

**Base e propriedade:**0.3.11 final treec034137 publicado como9aca1aba49305c377934653353062c0b6febb06d na mesma experimental/PRdraft1. Local4d99a2d com árvoreidêntica preservado na backupbranch e alinhado soft ao commit remoto após comparação de árvores; dist préalterações emwork/1903-baseline-0.3.11. LerAGENTS/spec/log/protocolo e typecheck antesedits PASS. Sol6.1medium reutilizado stories/testchallenges, Sol6.1medium separado decisions/lifestyle/test; principal grupo/types/engine/match/dna/persistence/integration/UIprimeira. Apósliberação, Sol6.1high revisor e Luna medium gates. CorreçãoUX posterior reutiliza primeiroSolmedium como únicoownerapp/styles; principal não toca esses arquivos enquantoativo. Atédoistrabalhadores.

**Decisões de escopo:** adquirido é habilidade, DNA é predisposição oculta. Lazer equilibrado pode melhorar recuperação e felicidade; não penalizar toda diversão. Menores: videogame/amigos/festa e alimentação; opções adultas álcool/balada somente>=18, inclusive rejeição no motor de opções antigas/forjadas. Conteúdo sexual de menores não incorporado apesar de pedido; idade do usuário/privacidade não muda idade do personagem. Não implementada sexualidade adulta nesta versão. Felicidade pessoal independente da moral, sem conceder habilidade ou vaga. Pesoextra é abstração de hábitos durante intervalo, não efeito médico de uma refeição. Capitania não concede titularidade nem imunidade à atuação ruim. Respeito é por grupo e pode cair; ganho social não altera DNA. Partitura coletiva da campanha não pode ser reescrita para fingir cobertura do protagonista.

**Modelo grupo:**groupKey=squad:club-ou-escola:categoria. OptionalSquadCONTEXT_1; só relação legada do grupo atualmenteconhecido é copiada umavez, mantendo mapas/memóriasoriginais e sem reconstruir presença. Mudança clube/categoria remove faixa, volta aoex-clube mantémrespect/memórias mas reinicia apps/starts/min e exige novaeleição. season não faznovo grupo automático. Cooperação=clamp((respect−50−.8resentment)/50,−1,1). Abastecimento1+.18cooppara nãoGK; multipliachancesG/A e xG/xA em partidas profissionais, chancesG/A na formação, sem inventar contagem depasses. Risco da intervenção defensiva1−.25coop sóCB/FB/DM. Prof usa mesmo draw deamarelo para reconhecer cobertura que evitou intervenção de risco; nãoalterarplacar, gols sofridos ou fabricar clean sheet/nota extra. Juvenil usa fator deriscosemledgerextra. Banco sem contribuição e directfixture0min sem cobertura. Grupo em feedback direto; HUD/pesoperfil. Uma atuação>=45min/nota>=7respeito+.6, <6.2−.8, expulsão−3; curta não gera julgamento amplo. Observeridempotente por turn; banco não gera presençacapitania.

**Capitania:** indicação requer10titularidades/600min reais nestecontexto, respeito>=75/ressentimento<=20, ativo semlesão. Uma oferta portemporada, pausa semavançarturno/RNG. Aceitar pressão+4/fadiga+2; recusar mantémrespeito. Atuaçãoruim longa capitão adiciona1.5pressão; respeito<55 ou ressentimento>40 revoga. Revisorreproduziu aceiteforjado com0starts/0min e ofertavelha válidana temporada seguinte; corrigidos preflightpuro e guardidexatoturn/season/context, presença/lastOfferSeason/lesão/retired/replay. lastResolvedEventimpederepetirrecusa helper. Fonte deindicação é agregado do grupo, sem votosnominais/elenco detalhado ainda.

**Hábitos:** optionalLifestyle{happiness0–100,excessKg0–12,sleepDebt0–8,lastProcessedTurn}. Ausente neutral50/0/0 sem modificar peso ao carregar; cria quando usuário escolhe. Equilíbrio +3felicidade/+2condição/−2fadiga/−.5sono; comida +7/+0.3kgjuvenil ou+.4pizza-cerveja adulta/−4condição; noitelonga +9/−9condição/+6fadiga/+2sono (+.3kg sóbaladaadulta). Custos reais comcaps são recibo antes de partida, não confundir efeitosdanova partida. Descanso ajuda sono−.75, não apagaexcesso. Recuperaçãoapósrodadareal .04kg/.35sono, idempotente; banco/lesão/teste também representam intervalo, escolhasintermediárias semturnonãodecaem. Penalidade=clamp(1.5excesso+1.5sono,0,8): juvenil−.1×na nota e−penalty/100 chance titular; senior reduzleveldojogo e−penalty/100titular, clampsanterioresmantidos. Desenvolvimento adquirido/DNAnãodegradado arbitrariamente porlazer. Bodyupdate preserva peso basal separado doextra com arredondamento anteriorsemextra, não elimina excesso durante maturação. Dois jogos consecutivosvalidam persistência, semgarantirduração exata em2jogosseháinterrupções.

**Capítulos:** novos version1 somenteapósposição escolhida, evitando missãoINDcondenada antesda introdução.4participações>=45min/180base240senior e2atuaçõesfactuais em8rodadas; amostrarealmesmocontexto>=4substanciais e50%fortes eleva5apps/240base300senior/3atuaçõesem6rodadas. STgol+nota>=7;WG/AMG+A+7;GK7+(cleanSheet ou4defesas);CB/FB/DM7+time<=1GA;CM>=7.2ouassist+7. Retorno3apps>=20min/90min+2boasem8rodadas. Sem bônus/DNA/RNG/promessas de promoção. Mudançaposição/clube/categoria/ano encerra contexto; janela/replay/retorno guardados. Legadoativo mantémtexto/alvos/nota6.8 e arquivos passados permanecem; metasdifíceis valem para novos capítulos. Revisor achou modern targetGood0permitindosucessocom0G; schema agora exige posição definida/minutos/label/alvoGood>0<=apps/minTotalcoerente. Tests/story-career explicitoufixturelegada para preservarcontrato anterior; teste12gruposnovostemcritériosv1. Não afrouxar assertions das metas novas.

**Desenvolvimento causal — complemento pedido:**growthStep possuía delta causal+normal(0,.045). Removida SOMA do ruído. Conservamos as duas chamadasdeRNG poratributo para evitar deslocar agenda de sorteios na transição; seusresultadosnãomudam habilidades. Delta mantém idade/plasticidade/aptidõesocultas/posição/foco/adaptação/tempoescola/treinador/maturação/lesão/resistênciaàprogressão; declíniocorporal dos30+ e preservaçãotécnica33+. Ação extra trabalha habilidade designada com custo/cooldown e ganho determinístico. Traitsiniciais continuam sorteados; savejáexistente não tem suas habilidades históricas recalculadas. Fixtures128DNAs×8idadesprovam atributosiguais para estadosiguais comRNGdiferentes; escola/foco/lesão e declínio determinísticos.500seeds12/13máximos36.3/47.78, semhardcapinfantil. Pesquisa/calibração não é fisiologiareal nem meta4hvalidada. Novo gate necessário após mudançaalgoritmo; primeirosgates preservados emwork.

**Testes atéintegraçãoUX:** suítecompleta PASS incluindo12challenges+8lifestyle+8integração grupos. Root500STfixoplacar3–1G+Abaixo223/neutro260/alto307, semDNA/skill/placaralterado;800CB0–2 amarelos69→54 e15coberturasprofissionaisregistradas. Revisãoindependente10gruposPASS:160paresSTalto111vsresentido78G+A;160DMcartões10vs19/4coberturas; CMseed8doisjogosnota7→6.7e8.3→8.0, sono1.65→1.3 eextra.26→.22.16corruptspreservamraw e impedemoverwrite. Riscoscapitão/chapter corrigidos. Nova revisãoUI/determinismo pendenteapósúltimoowner. Não atribuir testesroot/revisãoLuna a outro papel.


## 2026-10-01 — D0037 / A0019 — 0.3.12 integrada, escola cognitiva e interface discreta

**Correções finais do usuário:** decisões devem estar junto dos dados e habilidades; depois solicitou menos negrito/fontes menores, com elegância próxima da Apple. Escola deve atrasar parte do aprendizado futebolístico e acelerar cognição útil no futuro. São requisitos adicionais à H0011, não novo projeto.

**UI final:** skill dock com4 atributos relevantes/valores atuais/barras/rótulos/cores por idade antes das decisões e da última partida; perfil16 valores adquiridos e idade. DNA não exposto. Mesmos IDs/handlers e custos completos; sem controles duplicados. HUD7 fixo top0/52px móvel; fundo discreto, fonte nativa Apple, pesos500, nome19px/event20/placar26/métricas21 no celular. Root corrigiu quebra de palavras em320px: Posicion. só no dock, nome completo emtitle/ARIA, labels10px semwordbreak; valores16px. Cores referência editorial da idade, não potencial. Vídeo agora concede experiência na posição+.12×calendarScale/fadiga2; conhecimento deixou de ocultar números adquiridos, portanto somente conhecimento+3 seria ganho decorativo. Atributos/DNA preservados e receipt registra experiência real.

**Escola causal:** antes footballTime reduzia todos os deltas. Aos12–18 visão/decisão usam1.22SCHOOL/1.08BALANCED/1FOOTBALL; técnica/físico e posicionamento específico usam.82/.94/1. Ganhos graduais mantêm predisposição/idade/foco/posição/lesão/calendário/resistência, sem mudarDNA. Após18 prioridades têm mesmo multiplicador1 e cognição adquirida permanece. Não há concessão imediata ao escolher prioridade/diploma nem recalcular saves. Eventos/hints mostram custo/benefício. Modelo de jogo deliberado, sem alegação científica. Teste20rodadas em12/13/16/18 demonstra ordenação inversa entre cognição e técnica/físico; adulto mesmoestado/diferentesprioridades dá deltas idênticos. Revisão independente aos16: visão42.37SCHOOL/41.05BALANCED/40.29FOOTBALL; passe39.31/40.56/41.17.

**Gates finais:** npmtest completo exit0 após escola/vídeo/core final;5grupos causalidade,12capítulos,8hábitos,8integração e suites anteriores. Typecheck/diffcheck e VM unique3choices/order/costs/escaping/HUD/4skills/16profile/agebenchmarks/reset PASS. RevisorSol6.1high14gruposPASS, sembloqueio. Luna medium200carreiras +100DNAs×4políticas=400trajetórias, todasaposentadas/valoresfinitos/8posições. OVR médio18/24/30=56.3/68.4/72.7;196.7aparições. Natural67.7/80.2/85.1 contra wrong52.6/62.3/66.3; explore64.1/77.2/82.1; late67.7/55.8/61.5; custo de posição permanece. Transferênciasmean.6/median0/max5. Capítulos deixam de ser automáticos, CBbaixo/CMmaior taxa eDMmaisUNMET nesta amostra; relatóriosoutputs. Resultados précausal/preescola preservados emwork; comparação não isola causalidade nem iguala sequência de sorteios. Não repetir gates por CSS/cópia final.

**Build/mobile/save:** standalone22módulos/354741bytesHTML/316328JS. make_standalone agora deriva versão do package.json para arquivo/cache emvez de0.3.10 fixa; hash doconteúdo mantém invalidação. Fixtureisolada8773/storageMapefêmero (não prova durabilidadebrowserreload).390×844: trêsbotões y420–692 acima nav780, skills imediatamenteantes; semoverflow.320×740: scrollwidth320/HUDy0–52,labels12pxaltura uma linha, touches>=44. Cliquevideogamegera felicidade50→59/físico78→69/fadiga26→32 e1→2partidas, próximos29min/nota6.4, recibo claro. Perfil13anos/16attrs. Capturedwarn/error[]. Préviareal8765somenteleitura preservaLuciano23/GrêmioOVR83/2036/36j5G7A6.92/CopaBrasil/propostaVasco106mi/estados96/0/1/94/94; grupo/felicidadeausentesneutros50, comandoausente mostraComandoemdefinição. Nenhumavanço/escolha/reset/importreal. Screenshotsoutputs/GROUP_LIFE_0.3.12_DECISIONS.png ePROFILE.png/standalone1903-0.3.12-experimental.html. NãoSafari/iPhonefísico/offline nemplaytest4h.

**Orquestração/publicação:** Sol6.1mediumowners UI/stories e hábitos/decisions, Sol6.1highreview, Luna mediumgates; fontes liberadas antes integração, máximo2trabalhadores na rodada final. Modeloconfirmado/tokens/custonull semruntime, semestimar economia. Mesma branch experimental/PRdraft1, semmerge/main/Pages. Raw.githack atual serve teste móvel mas é público porlink; save pororigem/navegador/dispositivo, semsincronização. Publicação inclui fontes/testes/docs/build; intermediários ficam fora dorepo. Próximo: playtest humano dehierarquia/tradeoffs, sonho/plantéis/actionledger/entradaadulta ehostingprivado emrodada própria.

## 2026-10-01 — H0012 / D0038 / A0020 — 0.3.13: repertório, consequências e painel

**Pedidos e causa:** adversário juvenil genérico; nenhuma remuneração; quadros comhierarquia/tamanho pouco úteis;150situações de decisão comcustos reais; estados semcores/deltas; derrota e fracasso da função sem consequências pessoais suficientes. Baseline0.3.12 emwork/1903-baseline-0.3.12-opponents. Antesalteração leituraAGENTS/spec/protocol/log e typecheckPASS. Arquitetura preserva fontesmodulares e HTMLgerado. Mudanças introduzidasprogressivamente; não confundir gateesportivo inicial(neutro antesrepertório/emoções) comversãofinal.

**Identidade na formação:** formation-opponents.ts escolhe clube cadastrado da mesmaUF excluindopróprio; semalternativaregional usaoutrosclubes. Semclube usa10nomes de escolas fictícias associados àresidência. Calendário porhash jogadorcontexto/season/turn, semRNGesportivo; ID persistido somente feedbacknovo. Não afirma calendário/equipes de base oficiais nem altera força dosadversários.4grupostestes:156clubes×20datas, local/reload/noDNA/noRNG,3partidasSub15 comtotaisjuvenis, pendingle gadointacto.48pares numéricos da revisão inicial iguaisbaselineantesnovocases/emoções.

**Remuneração:** compensation.ts separa acordoatual de referência futura. AID150–3500 mensal:150+6finance+90max(0,age−12)+8médiaattrs+8reputação, arredonda50. SALARYpiso divisãoA12000/B6000/C3000/D1500, componentehabilidade35max(0,médiaattrs−35)^2+0,005marketValue; orçamento0,45+finance/100 e experiência0,55+0,45clamp(minutos/4500), arredonda50/clamp1500–2,5mi. Coeficientes ficcionais do jogo. AIDrevisadaanual, promoçãoabreSALARY; saláriofixo atérenovação/transferência. Propostas congelamvalor mostrado, inclusive reconsideraçãotreinador. Clubesemvínculo/aposentadoria encerra. Semconta acumulada/imposto/despesas. Legacysemacordo exibevalor não registrado e referênciaestimada separada; sync iniciaacordoprospectivo apósaçãoaceita, semreconstruirpassado. Guardcorrigido apósrevisor: rejeitarR$1/tipoAIDsenior/club/stamps/caps. Snapshotsempreguarda remuneraçãomensal ouausência para reciboinicial/encerramento.8grupostestes+revisãopareada/trials/replay/corruptbytes.

**150casos eengine:** catálogodedadosdesacoplado decision-cases.ts:20LOAD/20SPACE/20SERVICE/15RIVALRY/20PRESSURE/15ADAPTATION/20PATH/20LIFE.150situaçõesautoraisdistintas,3alternativas,15ações existentes; nãoalegar150mecânicasnovas. Idade/scope/posição/banco/titular/condição/pressão/adaptação/ressentimento elegíveis; prepara aliases eexige3IDsdistintos. Famíliapesa1+necessidade+0,35×tempo(cap20), dividepelo númeroelegívelda família. Sorteiostreamseparadohashp.id/event.id/rngstate/recentcases, não consomeRNGesportivo. Persistedeventocase/context/choices e memórialast20; preferefamilycooldown5e não repete20se possível, fallbacksemtravamento. Nunca rerollrender/reload; legadoofertadointacto. Guardrecompõecontextidade/club/category/position/season/turn/requisitos antesaceite; inválidossemguardar/avançar/delta. Socialporíndice daescolhapersistida, nãorecomputa aliasapósação extraalterarcooldown. Clamps sociais reais entramrecibo, incluindoaçõescareer. Recusarfesta:restcondition+4/fatigue−5/respect−2/affinity−2; participarcurtoleisurehappy+3/condition+2/fatigue−2/respect+1/affinity+2;longnighthappy+9/condition−9/fatigue+6/sleep+2/respect+1/affinity+3. Adultálcoolapenas>=18; menoresamigos/festas/videogame. Casossemwallet/garantiadevaga.7grupostestes17.280ofertas96contextos alcançam150; memória/cooldown/seed/DNA/RNG/stale/schema/indexsocial/festa/reloadraw. Primitivosanteriores continuameventoslegados explícitos; testesnãoassumemtrioantigo para sorteionovo.

**Consequências das partidas:** match-emotions.ts puro usa8resultadosobservados, contextualclubeouescolinha/categoria/temporada e1aplicaçãoporcareert urn. Derrota moral−min(6,1,2+0,6×caudaanterior+0,3×outrasderrotasna janela), felicidade−min(8,1,5+0,8×cauda+0,4×outras); conjuntosdisjuntos. Vitória/empatebreakstreak semapagaracúmulo. Banco comfixturecobrafrustraçãocoletiva; nãopartidanãogeraresultado. ST/WGsemgolouGK/CB/FB/DMcomgolcontra>=20minrecebemcobrançaporfunção. WG/DMpeso0,5;minfactor<=1;repetição1–2;nota>=7,5mitiga50%;xGregistadoadicionalataqueaté25%;defesaconcedidoscap3. BasesST0,5moral/0,6happy/0,3respect/0,8pressure;def0,4/0,5/0,25/0,6. Totaiscaps7/9/2/4; efeitosreaisclamp0–100. Banco/cameosemgolnãoapagamseca, cameocomgolresetaataque; posiçãonova interrompesecapessoal conservaplacarcoletivo. Semveto potencial/growth/RNG. Resultadoantigo profissional−1,2removidoevitaduplicaçãoperda; juvenilconsomerngmoodantigo masnãoadicionamoodpositivo àderrota. Groupobservernãoatribui+.6respeitogenéricodanotaboa quando devergolsfalhou. Boa atuação/passes/saves seguemcontabilizados;golsofridonãoprova culpadefensor. Reaçõesmostramcausa e custosda partida; HUDmostratotaldecisão+partida, valorespodemdiferirpeloefeitoescolhido.9gruposhelper PASS, integraçãorevisor/gatespendentesnestaentrada.

**UI e save:** frontend-design aplicado mantendoorientação explícitausuáriotipoApple:fonte nativa/leve/compacta. Ordemnome→últimapartida→linhatemporada→skills→decisão. Name/match/skillsminheight134px,widthigual, longtexto crescesemcortar. Resumonãoduplica métricas/placar e sóusa feedbackdoeventopendente;nãoinventarúltimapartida quando balanço não trazregistro. Reações/contexto/próximopassosemprediretos. HUD7estadoverde/âmbar/vermelho, físico/conf/moral/respeito/happyverde>=70/âmbar40–<70;inversefadiga/pressãoverde<=30/âmbar>30–60. Delta9px reais comsinais, direçãofavorável correta, zerosemausência distinguidoARIA; respectentregrupossemcomparação. Cliquecapture antesresolve+advance, gravaintermediário pararecuperação e totalfinal; guardidentitypreservaúltimodeltaemaçãoinválida. state-delta optional/schemaprospectivo, mesmasavekey/version. Testeclamp/read-only/context/load/corruptbytes/legacy/totalclick PASS. VMHUD eUIordem/GK/escaping/payreadonlyPASS; mockresolvecorrigidoparalimparevento talqualengine, nãorelaxarasserts. TestscoachlegacyfixturelimpaIDcasemoderno quando constróieventolegadonovo; reconversãodiretafixturedescartadecisãoantigaposição. Testehabitopreservaprêmiohappy+9naescolha econsideracustojogonovo apósavanço.

**Mobile/paridade:** fixturesisoladas8780Mapefêmero, GrêmioSub15vsInternacional74min0G1A7,3 eJuventude29min0G0A6,3. Clique descanso+4físico/−5fadiga, próximaderrotahappy−1,7/moral−1,4/group−0,1/pressure+0,4 visíveistotalHUD.320×740/390×844semoverflow;3quadros134px larguras288/358;7cores/deltas9px. Screenshotoutputs/1903_0.3.13_MOBILE.png comlinhatemporadalogodepoismatch. Capturedwarnerrorvazio. Mapreloadresetafixtureporprojeto; persistência validadaNode, nãodizerMapdurável. Préviarealsomenteleitura atualizada0.3.13:LucianoBasso23Grêmio83/balanço2036/36j5G7A6,92/CopaBrasil/Vasco106mi/estados96,0,1,94,94 iguais; antigosdelta/salárionãoregistrados. Nenhumaescolha/reset/import/avanço no save real. NãoalegarSafari/iPhonefísico/offline4h.

**Verificação parcial:** np mtestintegradoPASS todos27scripts incluindo7casos/9emoções/8pay/4oponentes/delta; typecheck/diffcheck/checkorchestrationPASS; standalone27módulos499655HTML/457011JS. Primeirasexecuçõesfalharam emfixturesantigas que forjavameventolegadocommetadataatual/seleçãoposição direta comde cisãopendente e happyconstanteapósderrota; corrigidos contratosfixture comasserçõescomportamentaismantidas. Review independente final e gates600carreiras registradosnaentrada seguinte. Corpo16anos150cm43kg: diagnóstico emandamento, nãoalterarDNA/altura atual semcausa/savedareportado. Arquivo fornecido/previewrealé23anos; solicitado diagnóstico16 opcionalenquantotrabalhoindependentep rossegue.

**Orquestração:** max2workersconformeAGENTS. Sol6.1mediumdata/implementaçãoUI/helpers/tests; Sol6.1highrevisãoindependente; Lunamediumgates/diagnósticorotineiro. Principalintegrafontescompartilhadas/schemas/build/UI/docs/publicação. SemAstra/escalada. Modelo solicitadosaceitos,modeloefetivo/tokens/custonull quando nãoexpostos. Nãoestimarpercentualeconomia. Publicaçãomesmaexperimental/PRdraft#1, semmain/Pages; artefatosoutputs intermediárioswork.


## 2026-10-01 — D0039 / A0021 — carga observável, decisão situada e conclusão da 0.3.13

**Correções solicitadas.** Usuário rejeitou o recibo: faltava contexto antes de decidir e o conteúdo era repetitivo. Recibo removido de Jogar; armazenamento interno preservado. Helper puro decisionContext separa título/situação persistida e oferece no máximo dois fatos pertinentes conhecidos, sem DNA, RNG, migração ou escrita. Banco/minutos/titularidades, produção nas oito observações do mesmo contexto, pressão, condição/fadiga, vínculo, adaptação e prioridade escolar passam a informar a escolha antes dos botões. Formas/eventos de outro contexto não contaminam fatos atuais. Hints mantêm custo base e social, retirando consequência genérica duplicada. Contexto posterior não repete a situação já exibida. Catálogo contém150 situações, mas15 ações: variedade textual não equivale a150 mecânicas. Próximo passo de design: arcos com consequências posteriores e retornos específicos, com playtest humano.

**Capitania.** Pedido adicional: badge C ao lado do nome em Jogar e Meu jogador. Só aparece se currentKey coincide com grupo atual, captain=true e jogador não aposentado. Sem novo prêmio/vaga/alteração de save; revogação existente remove indicador. Removida duplicação “Capitão” na linha de clube. Propostas de outros badges: estreia profissional, seleção, recorde do clube; não implementados sem resolver evidência/lifecycle.

**Carga e causa do cansaço ausente.** Antes, recuperação e piso profissional65 absorviam custos; partida juvenil não consumia carga suficiente. Agora participação gera custo por minutos/resistência/idade/pressão, recuperação comum1,8 e descanso explícito separado. Sem fixture não inventa carga; lesão usa recuperação própria. Desenvolvimento adquirido determinístico sofre multiplicador e desgaste por fadiga>35, pressão>40 e condição<75, escalados pelo calendário. Fórmulas completas em spec/helpers. Repouso interrompe desgaste, não restitui habilidade arbitrariamente; prática permite reconstruir. Sem cap de potencial/DNA alterado.

**Amostra infância.**100 seeds pareadas,20 partidas aos12: 0.3.12 sem descanso condição91,65/fadiga34,54/ganho médio por habilidade2,842; atual61,51/75,52/1,933. Descanso atual95,98/22,76/2,826, contra100/0,24/2,827 anterior.6/100 sem descanso tiveram alguma habilidade em queda, mínimo−0,38; zero no grupo com descanso. Coeficientes são experimentais, sem alegação médica.

**Gates e limite material.**200 carreiras e100 DNAs×4 políticas chegaram à aposentadoria, oito posições e valores finitos. Aparições médias neutras196,7→88,4; OVR30 72,7→65,3. Auditoria que escolhe primeira ação automaticamente: natural72/explora13/errada11/tardia40 jogos, natural ST0/8 profissionalizados. Registra regressão de equilíbrio, não gate de calibração aprovado. Diagnóstico pareado400 carreiras com gestão de estados (descanso/lazer quando condição<80 ou fadiga>35; reduz pressão>40; apoio com respeito<45): natural372/explora284/errada127/tardia199 jogos; OVR30 81,7/79,2/63,9/59,3. ST natural5/8 com estreia,2073 jogos somados. Caminhos existem, mas amostra não prova potencial lendário de todo DNA nem que usuário fará essa política. Manter versão experimental, registrar ambas as amostras e observar playtest antes de enfraquecer custo pedido.

**Corpo.**500 seeds por versão mostram fórmula/agenda iguais à0.3.12;5/500 aos16≤150cm, maturação17–19 e DNA adulto160–162cm. Piso do peso43 explica valor arredondado. Save recebido/real está aos23, sem reprodução do indivíduo16; não alterar DNA/altura retroativamente sem diagnóstico. Distribuição não foi validada como científica. Evidência BODY_0.3.13_DIAGNOSTIC.md.

**Revisão.**Sol6.1high independente:640 partidas,40 afastamentos,1080 pares de desenvolvimento,1212 passos monotônicos,120 pares de carga. Achado P2 de reordenação de IDs corrigido: persistência e preflight verificam alias por índice; bytes corrompidos protegidos. Lesão com fixture registra resultado coletivo sem estatísticas pessoais; ausência de fixture sem resultado fabricado. Sem P1/P2 pendente no escopo revisado.

**Outras correções UI.**Balanço anual compara seis totais do ano encerrado com ano imediatamente anterior, nota somente quando ambos têm partidas; ausência e clube diferente explícitos. Colocação profissional lê campanha existente e grupo, pontos/saldo/gols; base sem tabela e legado sem campanha não ganham colocação inventada. Colocação dentro do OVR, largura62 preserva altura dos cartões134px no320; nome longo pode crescer naturalmente. Fonte nativa, título discreto, badges18px, delta9px.

**Verificação final.**npm test30 scripts PASS; TypeScript/standalone32 módulos/checker/diffcheck PASS. Contexto6 grupos puro/DNA-RNG proibidos/legado/contexto stale; ranking grupos/empates/ausência/readonly; comparação anual signed/missing sample; VM layout/hints/escapes/GK/salary/7HUD/click total e captain presente/ausente de outro grupo PASS. Navegador mobile320: três cartões134, zero overflow, situação e dois fatos antes das três alternativas, zero recibos. Clique somente em fixture isolada; save real permanece intocado e conferido por leitura. Demais provas mobile390/320 e anual constam em outputs. Build standalone gerado das fontes, mesma chave/schema opcional. Não certificar Safari físico, offline, diversão ou meta4h.

**Orquestração/publicação.**Até dois workers; Sol6.1medium implementa e contexto, Sol6.1high revisa, Luna medium gates/diagnóstico. Runtime não expõe tokens/custo/modelo efetivo: null. Runs concluídos registrados. Intermediários em work, entregáveis outputs. Publicação mesma branch experimental/PRdraft1, sem merge/main/Pages. SHA final fica no relatório de release externo para evitar autorreferência do commit.


## 2026-10-01 — D0040 / A0022 — hipótese de diversão e protótipo de dez clubes

**Origem da decisão.** Usuário relatou cliques aleatórios, ausência de progressão/desafio e repetição, mesmo com melhorias de UI. Pediu estudar Lance e New Star Soccer, aceitou mudança radical e respondeu duas rodadas de perguntas. Recompensas desejadas: conquistar vaga, virar craque, crescer do pequeno ao grande, ser desejado e construir história. Aceita perdas totais coerentes. Vida externa ao futebol: zero. Disputa nominal ocasional, projetos concorrentes e memórias fortes preferidos; decisão em jogo importante deve reverberar. Identidade de jogo é secundária. Depois pediu explicitamente protótipo reduzido com dez times e jogo rápido. Essa decisão reduz o escopo da rodada; não autoriza alegar carreira completa de quatro horas.

**Diagnóstico e pesquisa.** A 0.3.13 oferece variedade textual, mas escolhas recorrentes atuam em estados sem construir um arco claro de vaga/projeto/mercado. Investigações do motor amplo prepararam rascunho0.4.0 com compressão e profissionalização; havia P2/calibração ainda abertos quando o usuário mudou o foco. Fontes desse rascunho continuam locais sem publicação. Lance observado como convidado: criação16/ST, comparação de três destinos e primeira decisão de treino; nenhuma carreira inteira completada. NSS estudado por descrições oficiais de publisher/lojas, sem sessão direta. Separar fatos observados de inferências; detalhes e fontes em prototypes/dez-clubes/DESIGN.md. Inferência aplicada: comprimir rotina, exibir o projeto esportivo e fazer perdas/ascensão dependerem de evidência em campo.

**Arquitetura e isolamento.** Novo diretório prototypes/dez-clubes, motor puro, UI/CSS modular e build.py produz index.html standalone. Sem bibliotecas ou infraestrutura novas. Prototipagem inicial em work/1903-prototype10. Nova chave1903.prototype10.v1; save original não lido/avançado/resetado/importado. Liga fictícia com dez nomes reais e forças experimentais. Elencos, concorrentes, calendário e salários não são dados oficiais. Recorte12→18 em três escolhas, três anos profissionais18/19/20 com18partidas cada, final21 é encerramento do experimento e não aposentadoria. Oito posições iniciais; não há reconversão neste recorte nem vida externa. Alvo observado16–22decisões, sem benchmark humano de minutos.

**Causa/efeito.** Planos RECOVER/DEVELOP/TEAM resolvem seis partidas reais. RECOVER recupera estados antes do desgaste e aprende a62%; DEVELOP condição−2/fadiga+3 por jogo, aprendizado1,7× focado; TEAM fadiga+1/confiança profissional+0,8 por jogo e aprendizado normal. Participação consome condição/fadiga, resultado pressiona e atuação modifica confiança/reputação/respeito. Titularidade depende de habilidade efetiva, rival, confiança e nota recente; banco não ganha estatística pessoal. Habilidade adquirida cresce deterministicamente por posição, foco, DNA oculto e estados; nenhum bônus aleatório. Formação comprimida prioriza15 ou6 por habilidade multiplicados por predisposição fixa. Em1000seeds consecutivos ST:12OVR14–21;18OVR42–65/média52,709/zero70. Sementes espaçadas podem gerar valores maiores; não universalizar essa amostra nem chamar calibração final.

**Futebol e mercado.** Sete posses por lado geram chance e conversão; placar não é inteiro sorteado. G+A pessoal pertence a gols do time; GK não marca e tem defesas derivadas. Mercado exige4apps/nota6,25+nível compatível; zero a três interesses anuais, contato, proposta congelada e aceite explícito. Clube maior tem rival mais forte/confiança inicial45, preservando memória local. Um momento importante altera criação/exposição da próxima partida e gera memória crítica após atuação, sem reescrever o passado. Estatísticas anuais/totais derivadas das partidas; três anos e transferências consultáveis. Memórias recentes limitadas a4 e críticas persistentes a6 por clube.

**Correções após revisão.** Validação inicial aceitava rivalnulo, respeito string, fase incoerente e totais impossíveis. Validador agora confere fases/idades/contadores/clubes/ações/serial e recomputa estatísticas a partir das partidas. choose valida antes de mutar, inclusive corrupção de objeto em memória. UI usa esse validador ao carregar; raw rejeitado preservado. Primeira UI consultava campo errado para memória e não mostrava yearStats: corrigido fanMemory/críticas e anos/minutos completos. Mudança anual limpa lastMatches e reações para não mostrar partidas do clube anterior como atuais. Complemento final: iniciar outra carreira após raw ilegível preserva cópia com chave de recuperação antes de liberar o formulário. Opção de exportar continua disponível. Textos internos de planos foram traduzidos no histórico; nome inicial agora vazio.

**Testes e evidência.** Motor:8grupos,100carreiras/5400partidas/oito posições/16–22decisões, JSON retoma sequência/replay rejeitado/estatísticas/GK/mercado/risco/custos aprovados. Revisão Sol6.1high:300carreiras pareadas/16.200partidas/4804verificações completas até21, oito corrupções rejeitadas sem mutação; VM de UI confirma memória crítica e minutos anuais, RNG inválido protegido. Nenhum P1/P2 aberto no escopo retestado. Relatórios outputs/PROTOTYPE10_ENGINE.md e PROTOTYPE10_REVIEW.md. Estratégias constantes: recuperação47,16apps/10,21gols/OVR56,87; desenvolvimento39,40/3,08/57,08 e físico0/fadiga100; coletivo42,06/4,69/55,85 e quase0/100. Ganho extra do treino pequeno; recuperação domina desempenho imediato nesta amostra. Manter como hipótese experimental a ser julgada pelo playtest, sem dizer equilíbrio perfeito ou superioridade comprovada.

**Fluxo mobile.** Navegador em servidor isolado8870/fixtureMap descartável, ST887559150: três escolhas de formação, Caxias18, negociação explícita paraFlamengo19, perda de minutos no elenco forte, decisão de risco seguida de memória e três temporadas concluídas21.50apps/23titularidades/2562min/17gols/2assistências; anos18/19/20 exibem1350/664/548min.390×844 semoverflow, screenshotoutputs/1903_PROTOTYPE10_MOBILE.png. Histórico/final320×740 semoverflow, nenhuma decisão noDONE; consolewarn/errorcapturado vazio. Map não comprova persistência durável; JSONroundtrip verificado no motor. Nenhuma ação no save real. Não certificar Safari/iPhone físico/offline/diversão. Publicar apenas protótipo e esta documentação na mesma branch experimental/PRdraft1, preservando index principal0.3.13 e rascunho0.4.0 local. SHA final em release externo evita autorreferência.

**Orquestração e próximo passo.** Sol6.1medium implementou engine/test; Sol6.1high revisou e retestou correções; principal fez integração, validadorfinal/UI/browser/build/log/publicação. Até dois workers, semAstra. Modeloconfirmado/tokens/custo null quando runtime não expõe; não estimar economia percentual. Próximo passo é o usuário jogar esse recorte: revisar o loop conforme vontade de continuar e coerência das perdas; ampliar somente os mecanismos aprovados. O usuário pediu link no celular: entrega HTTPS por raw.githack, não localhost.


## 2026-10-01 — D0041 / A0023 — dois diagnósticos e reconstrução do recorte

**Feedback e reprodução.** Após o protótipo01, usuário enviou dois exports e respondeu que evolução, repetição e entendimento de como recuperar espaço ficaram todos chatos. Em cópias locais, os54 jogos, habilidades e RNG final dos dois exports foram reproduzidos exatamente. A ordem das três escolhas de formação não estava registrada: várias permutações equivalentes, sem alegar ordem conhecida. AM43→46, titularidades9→3→1,45apps/1787min/1G4A; ST43→48,37apps/1368min/3G0A. Mesma equipe, nenhuma proposta e confiança final0 em ambos. Estratégias de recuperação reparavam corpo sem mudar o destino esportivo. Arquivos brutos, DNA/seeds e diagnóstico privado permaneceram em work/outputs; fontes públicas usam fixtures sintéticas.

**Hipótese/cause e efeito.** Nota e cobrança centradas em produto final subestimavam construção do meia; cameo era penalizado como partida longa; derrota contra time mais forte somava pressão; confiança/treinador reduziam oportunidade seguinte e mercado não abria uma resposta. Melhorar texto não corrigiria o ciclo. Novo recorte prototypes/dez-clubes-v2 substitui descanso/desenvolvimento/coletivo por intenções da posição. Recuperação regular é parte do calendário. Evidência de passe completo/criação/intervenção/defesa/finalização alimenta nota, meta e mercado. Menos35min é avaliação parcial sem atualização plena de confiança; minutos45+ necessários para observar a postura decisiva. Pressão considera expectativa e atuação. Experiência/prática/foco/estados e predisposição fixa geram ganho adquirido sem bônus aleatório ou teto fixo de destino.

**Projeto e desafio.** Meta combina participações, minutos, boas atuações e produção da função durante seis jogos. Não basta completar tempo. Alvos crescem conforme capacidade relativa ao clube; metas cumpridas e perdidas persistem com clube/ano/período. Falha ou amostra curta pode abrir trabalho extra, estudo ou cooperação por seis partidas; mais aprendizado/custo físico, sem vaga/ confiança instantânea. Jogo importante avalia a próxima oportunidade elegível, com memória posterior. Mercado exige evidência observada; interesse→contato→proposta ou avaliação que pode falhar. Clube maior implica concorrente mais forte, confiança do treinador reaberta e risco de minutos menores.

**Isolamento e UI.** Mesmo escopo dezclubes/oito posições/3escolhas de formação e3anos profissionais54jogos; final21 é fim do experimento. Vida externa fora conforme resposta do usuário. Save schema2/key1903.prototype10.v2, sem converter/reinventar os arquivos do usuário nem ler a carreira original. Standalone sem dependências/banco. UI native compacta mantém estados coloridos/deltas, contribuição/meta/resultados antes de habilidades e alternativas. Critérios retirados do texto da decisão quando já visíveis; resultado e reação duplicados suprimidos. Metas antigas identificam clube/idade, evitando atribuir julgamento ao novo projeto. Histórico conserva números anuais, aprendizado/experiência, nove objetivos e ações escolhidas. Exports inválidos preservados; nova carreira após erro exige cópia de recuperação concluída.

**Revisão e retrabalho.** Revisor detectou rival/arco nulos, targets zerados e progresso/contexto forjados aceitos; choose podia mutar antes de lançar. Guards agora rejeitam antes da decisão. Chance criada podia aparecer sem passe completo: corrigida atribuição somente após passe completo real da mesma posse, com assistência≤passe decisivo≤passe completo. Arrays nulos de histórico/progressão/log travavam Minha história; shapes/caps e contadores inteiros de ações agora verificados. Proteção não reescreve passes de fixturesv2 anteriores. Tests públicos mantêm seeds sintéticos; comparação exata privada separada.

**Verificação final do implementador e principal.** Nove grupos motor PASS,100carreiras/5400fixtures,8posições com JSON em cada evento, IDs obsoletos/repetidos e corrupções rejeitados sem mutação. Amostra final458metas cumpridas/442perdidas,16–23decisões, OVR21 56–72. Origens privadas com três políticas mantêm evoluçãoAM43→56–57 eST43→61, confiança66,5–72,9; os coeficientes/RNG mudaram, não é contrafactual de partidas idênticas. UI VM5grupos PASS (raw inválido/cancelamento/cópia/quota/novachave/fluxo); syntaxbundle PASS e TypeScript do rascunho principal PASS. Não publicar rascunho0.4.0.

**Mobile.** CUA fixture sintética Map descartável,20decisões reais até21: AM48→63,50apps/35titularidades/3124min/1G16A, SãoLuiz→PontePreta após contato/oferta explícitos; titularidades14→9→12. RecuperaçãoREAD não cumpriu meta seguinte; período decisivo posterior observado e registrado. Quatro metas cumpridas/cinco perdidas; três estatísticas anuais/nove metas visíveis.320/390px semoverflow;DONE sem alternativas;warn/error capturados vazios. Último ajuste de display mostrou meta/resultados18SãoLuiz claramente anteriores à chegada19PontePreta e retirou duplicata. Capturasoutputs/1903_PROTOTYPE02_MOBILE.png e1903_PROTOTYPE02_DECISION.png. Map efêmero não prova persistência durável; JSONroundtrip cobre retomada técnica. Não alegar Safari/iPhone físico, duração4h, diversão ou superioridade sobre referências.

**Aprendizado/próximo passo.** Progresso observável e provas específicas são a hipótese entregue, sem garantir sucesso. Algumas intenções continuam recorrentes: variedade textual não basta, avaliar vontade de continuar na sessão real. Coeficientes comprimidos deste recorte não devem ser transferidos automaticamente à carreira longa. Publicar somente v2/log/orquestração na mesma branch experimental/PRdraft1 e fornecer raw.githack por SHA, mantendo0.3.13/prótipo01. SHA final no relatório externo para evitar autorreferência.

**Liberação independente.** Sol6.1high:1600carreiras/86400fixtures antes das correções identificaram falhas; após passe real,800carreiras/43200fixtures/13424roundtrips PASS. Após últimos guards,14carreiras finais (duas origens×três intenções e oito posições),284roundtrips/replay/stats/metas,16ofertas PASS; avaliação natural recusada sem alterar habilidade/clube/números. Guards focais e recuperaçãoUI PASS, sem P1/P2 aberto no escopo revisado. Não somar amostras antigas para alegar todas no mesmo snapshot. Relatóriooutputs/PROTOTYPE02_REVIEW.md. Orquestração: implementadorSol6.1medium/revisorSol6.1high, até dois workers; principal integração/UI/browser/build/log/publicação. Modelos efetivos/tokens/custos null quando runtime não expõe. SemAstra.


## 2026-10-01 — D0042 / A0024 — revisão geral e detalhada da lógica do protótipo02

**Pedido/base/escopo.** Usuário solicitou revisão geral e detalhada da lógica. Base publicada d526da8556eb967fa5125b97e7416601df8e8c5a, engineSHA2561ef90469c9bcbf9939176b464d3f2469a34782f05c642463e55d0db07d949b1a. Auditoria somente leitura da build/fonte, sem recalibrar/publicar/jogar save real. Rascunho principal0.4 local preservado. Skill engineering:code-review aplicado; duas revisões Sol6.1high por domínio e principal integra política/cobertura/spec. A revisão anterior verificou integridade e continuidade; esta adiciona causalidade/semântica das escolhas/julgamento/distribuição. Ausências intencionais do recorte12→21 não tratadas automaticamente como regressões no motor amplo.

**Experimento novo.**24seeds públicos espaçados×8posições×3intenções constantes=576trajetórias/31104fixtures/1152janelas. Formação uma de cada tipo, permanecer, READ, SAFE; mesmaorigem entrepolíticas, consumoRNG diferente. Não são576DNAs independentes nemtaxas reais. GanhoOVRmédio14,87,21média68,63/max83;243/576>=70aos21,6/576naentrada19. Titularidadesmédias47,20/54,28,06derrotas, confiança74,19/pressão14,80. Todos1152mercadosabriramcontato (1145OFFER/7ASSESSMENT). Metas médiasDM8,56/9,FB8,03,CB7,85,GK5,06,CM4,47,AM4,33,ST2,68,WG2,36. WGATTACK15,38gols/1,29metas versusCREATE7,21/3,42: métrica fixa não acompanha papel escolhido. AM/CMtécnica/leitura produzem atributos idênticos, leitura+7proficiênciapelo mesmo período/custo.

**Causalidade/contratos.** Confiançapessoal não tem consumidor esportivo:STseed42clones0/100emestadosválidos gerammesmaspartidas/RNG/skills/trust. GKS WEEP promete intervenção e exposição, masGKexcluído do ramo; GKseed1apósREADnaturalSAFE/SWEEPseispartidas/crescimento/RNGiguais. GKBUILD nãoaplica riscode errodepasse naexposição adversária. PRESS custo físicocitado inexistente:STseed42primeiraentrada15mincomparadaATTACK/PRESSmesmo85→88físico/10→7fadiga. Teto de pressão nas partidasmax(p,45), transferências+max5menos4virada; apenasduastransições;partida criada15 fica sobtetoconservador47, consumidor effective sóativa>60. Recuperaçãofísico+5/desgaste<=4 e fadiga−4,5/custo<=2,5 convergem96/2,5nosjogoscompletos; EXTRAapenasjanelaúnica podecriarcusto. Recuperaçãoautomática édecisãoD0041, corrigir alcance/tensão semreintroduzirspamdedescanso.

**Julgamento/posição.**STseed63técnica×3/earn/ATTACKentra32min2G/4chutes/nota8,3num3–3:goodfalse,trust48→48,reputação0→0,confiança60→60;35mincerca atébônusfactualgols/A e forma ignora. GKusamesmo82%entra14–34quando banco queST, semcausa de troca simulada. Golssofridosregistrados do time, semcronologia do período de responsabilidade. Conversão própriarolaalvo×gol, companheiroumsorteio:STseed42estadovalidofinalização56,95vsVasco71/clube43personal0,1219/genérica0,216; análisecondicional90minATTACKGF0,392vsLINK0,412, própriogol0,296vs0,211. Pode sertradeoffindividual/coletivo adefinir, nãodeclararbugautomaticamente. Velocidade efeitoindiretooverall/nota/minutos, semequação própria de ação.

**Ciclo/UI/saves.**recoveryUsednuncaresetaano/clube:umaúnicareconstrução mesmoUNPROVED/falhasnovas;GKseed1. PrimeiraRECOVERY19p1podeconsumirjanelaDECISIVEpermanentemente;GKseed5. Rivalc.level−1fixo,nãotemcarreira/desempenhopróprio; mundo pouco mudaenquantoprotagonistacresce. UImemoriesunshiftmaisnovasdepoisslice(−12)ocultamarcosrecentes:AMseed2com14registrosomite2metasmaisnovas. Reaçãotreinadorporperíodo édescription+outcomebody;UIremoveambos,restavazio; retornoindividualdas6partidasexiste maslistaexibesóplacar/min/nota, torcidaéúltimajornada. Savecorrompido omitindoseed emGKseed1INTERESTainda validGame=true;staymutadecisões8→9/season19/resetperiodanteslançarrivalsNaN.id;robustezP2,nãoumcasosavegeradocorretamente. Quota/replayhandlerfocalprotegidos.

**Conclusão/recomendação, não implementação.**Solicitar mudanças nonúcleojogável: contratosdasalternativas/feitoscurtos, estadosconsumíveis comintervaloalcançável, papel/metae rivalidadeevolutiva, recuperaçãoeventossituados, mercado por demanda. Calibrarcurvas depoisdecausalidadecomprova decomparaçãofocal; nãoampliar150textos para mascararconsequênciainexistente. NenhumhardcapdenDNA novo. Testescontábeis existentes continuamúteis, masnãoasseguraramdiversão/narrativacoerente. TypecheckprincipalPASS; nãovalidaJSmotor. Intermediárioswork/logic-audit, relatóriocompletooutputs/1903_REVISAO_GERAL_LOGICA.md e complementos1903_LOGICA_FUTEBOL.md/1903_LOGICA_ESTADO_SAVE.md. Nenhumraw privado/seed usuário publicado; probes públicos independentes. SemalegarSafarihumano/4h/taxaspopulacionaisdiversão. Orquestração max2workersSol6.1high, principalmantémmodelo da sessão; modeloconfirmado/tokens/custosnullquando nãoexpostos, semestimareconomia percentual.


## 2026-10-01 — D0043 / A0025 — correções da lógica e protótipo 03

**Autorização e escopo.** Após a auditoria D0042, usuário pediu “faça as correcoes”. Corrigido o núcleo do protótipo02 no mesmo diretório prototypes/dez-clubes-v2; etiqueta visual03, mesma chave1903.prototype10.v2/schema2. Recorte continua três etapas de formação e três temporadas profissionais/54 partidas, final21, dez clubes/oito posições/zero vida externa. Não ampliar a carreira completa nem publicar rascunho0.4 local. Skill engineering:debug aplicada: reproduções do motor publicado usadas antes das correções, depois gates focais e fluxo repetível. Dois trabalhadores Sol6.1high: um dono do motor, outro de regressões/fixtures/revisão; principal integra UI/build/log/publicação. Modelo solicitado aceito; modelo confirmado/tokens/custo indisponíveis, null.

**Causa e implementação — execução/carga.** Confiança pessoal era apenas observacional. Agora altera compostura/execução proporcional à pressão, distinta de confiança do treinador que participa da seleção. Consumidores: condição abaixo80, fadiga acima30 e pressão acima45. Recuperação regular automática +4,5condição/−3,5fadiga por partida, desgaste por exposição e intensidade: PRESS/SWEEP/ADVANCE1,4; SAFE/HOLD/CONTROL0,82; demais1. EXTRA acrescenta esforço por seis partidas. Expectativa considera prestígio, pressão do projeto e respeito da torcida; falha de meta aumenta projectStrain, cumprir reduz. Pressão e carga podem cruzar limiares; estratégias intensas podem saturar estados, resultado experimental explicitado, sem necessidade de criar clique recorrente de descanso. Condição/fadiga reduzem execução e eficiência de aprendizagem, sem condenar DNA.

**Futebol e posição.** SAFE reduz exposição/conversão adversária; SWEEP gera antecipações, falhas e exposição, com maior carga; BUILD cria construção e erro de saída com risco. Velocidade participa de progressões por ação. Goleiro reserva entra apenas em contingência rara, não rotina82% dos jogadores de linha. Nove tempos de posse determinam a responsabilidade GK; sua nota usa goles sofridos durante exposição e defesas correspondentes, sem transferir o placar inteiro a uma entrada parcial. Protagonista/companheiro têm etapas alvo+conversão. Balanceamento revelou GKBUILD11,75assistências/54 partidas: passe de saída era tratado como passe final; corrigido para progressão/coletivo e passe final direto raro. Nota/produção/assistência derivam de ações observadas; GK não marca, assistência<=passe decisivo<=passe completo, gols próprios pertencem ao placar.

**Reconhecimento, objetivos e aprendizado.** A barreira35min mantinha até gols extraordinários sem crédito. good conserva35min/nota>=7; exceptional registra feito factual em participação curta e recebe confiança/reputação/memória, sem declarar partida completa. Novas metas usam intenção/metric: finalização (chutes no alvo+gols, explicitamente pontos), criação, controle, proteção, antecipação, pressão, avanço ou cooperação. Critérios comuns de exposição/consistência e alvos por papel relativos ao projeto; menu informa alvos de cada alternativa antes de escolher, sem anunciar meta de papel default como já combinada. Técnica e leitura deixaram de produzir atributos idênticos em CM/AM; prioridades técnicas por setor, leitura focada/cognitiva e experiência distinta. Growth determinístico por prática/foco/posição/DNA/condição, oportunidade real acelera, banco mantém treino menor. Reduzida ascensão automática sem criar teto oculto de potencial. Rival acumula qualidade, minutos e forma recente, que voltam à seleção.

**Mercado e memória.** Necessidade, encaixe, observação e concorrência geram interesse; nem todo ano há contato, nem todo contato fecha proposta. Avaliação modesta permite reconstrução incerta. Salário continua ficcional contratado, sem economia externa. Respeito afeta apoio/pressão/seleção e memória no destino altera interesse; sem simulação social artificial. memoryTimeline opcional sequenciado, recente primeiro, registra apenas novos fatos; arquivo legado preservado sem datas inventadas. Recuperação reabre por clube ou após dois períodos, sem conceder vaga no clique. continuationEvent preserva DECISIVE após recuperação, evitando perder uma janela por prioridade de return.

**Estado e compatibilidade.** Saves novos rulesRevision1; objetivos revision1/intent/metric/strong/challenge/cooperation. Saves anteriores conservam partidas/metas/decisões/progressão/clubes/anos e meta pendente original; próximas metas entram nas novas regras sem reescrever passado. Seed uint32 obrigatório e dependências opcionais/contadores/fases/ações validados. choose simula em cópia, valida e confirma integralmente: transição que falha não altera objeto original. Caps serial64/decisions63 acomodam recuperações extras. Quota mantém aviso/exportação e bytes inválidos permanecem preservados. Não importar exports nem ler/avançar/resetar save real para testes.

**UI e causa factual.** Reações independentes do treinador/torcida por período e por partida sempre visíveis; antes coachReaction era apagada por supressão de duplicata. Evidência visível acompanha intenção (PRESSintervenções, ATTACKalvo/gols, BUILDpasses etc). Memórias não usam slice(-12) que escondia novos marcos: timeline nova+legado deduplicado, todos registros retidos acessíveis. Habilidades/decisão contíguas; após escolha rolagem para habilidades sob HUD fixo. Fonte e pesos compactos preservados. Browser encontrou produção4/4 e boas atuações1/2, mas texto dizia produção insuficiente: periodDemand agora aponta critério faltante oportunidade→consistência→produção, e relato individual segue papel escolhido. Patch textual comprovou números/RNG imutáveis em24carreiras e probe focal; não reconstruir textos antigos em save para fabricar passado.

**Reprodução/verificação final.** Motor SHA256227d79565d3b3996d3af232235e227a41d305220f01f3aabf43f0ab90aa27135. Baseline congelado publicado: nova suíte14grupos tinha2PASS/12FAIL; integridade e legado já passavam. Snapshot final:14/14regressões e9/9antigos PASS;192trajetórias/10368partidas/4133estados nas oito posições, decisões16–25 e852/1728metas cumpridas. Cada decisão repetida após JSON requer igualdade completa; IDs forjados/repetidos/obsoletos rejeitados. Oito snapshots schema2 FORMATION/PLAN/RECOVERY/DECISIVE/INTEREST/CONTACT/OFFER/DONE continuam preservando prefixos exatos de fatos. Confiança22/24pares sensíveis; SAFE/SWEEP0/979intervenções e2478/2707chances adversárias; PRESScondição média76,95vsLINK84,97/fadiga16,46vs10,12. GKBUILD1964progressões/52passes finais/10assistências em96períodos. FeitoST público2gols32min reconhecido, goodfalse. Mercado112/384janelas silenciosas e29negociações OFFER semproposta; recuperaçãoaté4arcos/DECISIVE192/192. UI VM9grupos PASS: memória/reações/escaping/quota/raw/replay/fluxo. Syntaxengine/app/bundle e diffcheck dos arquivos desta rodada PASS; typecheck prévio PASS, não substitui gates JS.

**Balanceamento final e limites.** Repetido no hash final24origens espaçadas×8posições×3intenções constantes=576trajetórias/31104partidas/1152janelas, permanecer/READ/SAFE, formação uma de cada. Crescimento OVR médio 51.88→57.472 (+5.592), titularidades41.293/54; 223janelas silenciosas. Metas/9 GK6.25,CB4.514,FB5.931,DM6.028,CM4.681,AM4.861,WG4.625,ST6.208. DiferençaDM/WG caiu de8,56/2,36; metas agora seguem papel. Políticas partilham DNA de origem e consomem RNG diferente; não somar como DNAs independentes, nem alegar taxas reais, equilíbrio perfeito ou diversão. Testes de habilidade/contabilidade não demonstram vontade de continuar.

**Mobile e entrega.** CUA em servidor/originisolado8912 com seed pública17090333, armazenamento real de teste, semsaveusuário. WG57→64, BrasilPelotas→SãoLuiz após contato/oferta/aceite,51apps/43titularidades/3582min/16G3A. RecuperaçãoREAD aos18 e19, DECISIVE aparece após segunda recuperação, oportunidades/metas e memória recente visíveis. Fluxo até21, histórico três anos/nove metas, reload no meio e nofim preservado;320×740/390×844 semoverflow, warnings/errors capturados vazios eDONE semalternativas. Capturasoutputs/1903_PROTO03_DECISAO.png/FINAL.png; standalone84788bytes emoutputs/1903_PROTO03.html. Sem alegar Safari físico/offline/duração4h/diversão. Relatório externo1903_PROTO03_CORRECOES.md eQA1903_CORRECOES_VALIDACAO.md. Publicar somente protótipo/testes/documentação/log/orquestração na branchexperimental/PRdraft1, semmain/merge/Pages. SHA/link de publicação no relatório externo para evitarautor referência. Próximo passo: playtest humano do mesmo recorte para avaliar vontade de seguir, coerência das perdas e intensidade da carga; não ampliar repertório textual para esconder mecanismo ausente.


### D0043 — checkpoint final de compatibilidade e build

Na conferência final, foi identificado que o marcador de regras novas não era adotado em saves antigos. Correção causal: planEvent passa rulesRevision=1 somente ao construir uma nova meta; playPeriod renegocia apenas objetivos com revision=1. Assim, inclusive um PLAN legado já aberto conserva métrica, target e resultado original antes de entrar no histórico; projetos posteriores usam o papel corrigido. Nenhuma partida/meta passada foi recalculada. Oito snapshots públicos continuaram até DONE com prefixos históricos iguais; sete ativos adotaram as novas regras na próxima meta. Novo grupo específico passou; baseline publicado2/15PASS e13falhas, motor corrigido15/15novos e9/9anteriores PASS. UI VM reexecutada9/9PASS; sintaxe engine/app/bundle e diffcheck restrito PASS. Motor final SHA256 ba73994ca22063348c3f26070498000fb368b20fb16c049e0d248a9e5bc89641. Build standalone final84842bytes, outputs/1903_PROTO03.html atualizado. Medidas do balanceamento e browser anteriores continuam válidas para novas carreiras; a mudança final afeta apenas adoção das regras de saves legados. Registro anterior permanece como evidência do checkpoint intermediário; este o substitui quanto a hash, build e contagem de regressões.


## D0044 / A0026 — protótipo 04: todos os clubes do Brasil A/B

**Pedido/hipótese.** O usuário pediu incluir toda a primeira e a segunda divisão do Brasil após correções03. Ampliar de dez clubes para os40 participantesA/B2026 aumenta variação e destinos, mas uma liga única misturaria divisões e40 testes independentes de interesse tornariam contatos quase certos. Decisão: catálogo desacoplado, calendário por divisão, lista de observação limitada e preservação dos fatos legados. Recorte12→21/54jogos/3temporadas continua; não alterar ritmo para38rodadas nem implementar acesso/rebaixamento silenciosamente.

**Fonte/cadastro.** CBF participantesA2026 e tabela básicaB2026 (primeira rodada cobre20clubes); URLs/documentos e data01/10/2026 em clubs.mjs/README/ADRdocs/PROTOTYPE04_BRAZIL_AB.md.40nacionais20+20 e4projetosregionais para compatibilidade. Names/UF/divisão reais; níveis/prestígio/cor/contratos/elencos experimentais, sem cargos ou rankings reais. BotafogoRJ/SP, AthleticoPR/AtléticoMG/GO disambiguados. IDs/números10originais preservados, regionaisfora40pool e circuitoTRANSITIONindicado. NovascarreirasprimeiroprojetoB Londrina50/BotafogoSP52/Athletic53 thresholdsOVR55/62; escolher sonho não concede contratação.

**Arquitetura/causa.** Fonteclubs.mjs externa ao motor; build.py embute cadastro→engine→app no únicoHTML. Mercado elegíveisnacionais pondera proximidade de nível/divisão/respeito, chave−ln(U)/peso, selecionaaté6candidatos antes de necessidade/encaixe/observação/concorrência;cap2contatos/fechamentoincerto preservados. Fallback nacional escolhe modestosBaleatórios, regionalLEGACY. Calendário marca calendarRevision1/scheduleDivision A/B/TRANSITION;9amostradosdos19 paresnacionais,2jogoscada/18total,offsetseed+ano semrepetiradversárioadjacente nemfronteiraentreanos. Não tabelaoficial38/playoffs/campanhasoutrosclubes.

**Compatibilidade.** Schema2/key1903.prototype10.v2 iguais. Calendarrevisionopcional semrecalcularpartidas/objetivosatuais. Calendário atualsemrevisionconserva9rivaisLEGACY eadota modelo porcategoria só ao gerarnovocalendário. FORMATIONlegada conserva origem prevista, depoisTRANSITION; savesnovoscomeçamB. Metaspendenteslegadas/regras03lazy permanecem. Negativefields/division/unknownclubsrejeitados e choosecontinua transacional. Nenhum save real lido/editado.

**UI.** BrasilA/B · protótipo04, sonho agrupado20A/20B, diretório40clube/UF/nivel por divisão no histórico; contextorival/PLAN/contact/OFFERincluidivisão. Cabeçalho mostra divisão do calendário resumido ou calendáriolegado quando ainda não adota. Export1903-brasil-ab-carreira.json, chaveigual. Appcompactonativo/semnovasdeps.

**Verificação.** EngineSHA256a791538d09becd7d8aa64d8e6ec507d0484d5ef891a499b4d8df6451c193ba80;catálogoSHA256a83cbf6678dc4c7d6a55989dbe99e15c848f931681915fab4a9902e11cf25921. Brasil7/7grupos PASS:128carreiras8posições/6912partidas/2581states,33transferências/131janelassilenciosas/32negociaçõesfalhas. Origem1024pares8positions/128publicseedsalcança3thresholds;96calendáriosLondrinacobrem19paresB. Controleforteunion2origensBem82trialsalcançou40destinos,com2silenciosas/34falhasordinárias/46transferências; não são incidênciasnormais. Enginefocal380transferssintéticas(20A×19seeds)cobre19paresdecadaAclub,1900corrupçõesrejeitadasatomicamente.8snapshotsHEAD02históricos/currentcalendarpreservados,novaadoçãosópróximocalendário. Corrections15/15+antiga9/9 PASS;192trajetórias/10368partidas/4039states comreplayJSON. UI11/11PASS,novos2gruposgarantem40opções/2grupos/Palmeiraspersistido/diretório. Sintaxeengine/catalog/app/bundle e diffcheckrestrito PASS; typecheckTSprévioPASS, nãoé gateJSproto.

**Balanceamento e limites.** Mesmas192políticas/seeds docheckpoint03:metas852→910de1728;silêncio112→205de384 e falhasOFFER29→17. Ambiente/entrada/shortlist alterados juntos; não atribuir diferença só ao número de clubes. Pressãomax81.33,fadiga69.21,condiçãomin15.98. Interpretar como regras operativas, não balanceamento perfeito ou futebol real. Manter ampliação e cap6 porque reduz mercado automático e conserva rotasB→A. Revisar emplaytestse vontade de seguir ou chances de recuperar espaço caírem; não prometer evolução/clubeelite.

**Mobile/entrega.** CUAoriginisolada8913 produtoexactstandalone comseedDate.nownormal/newsavefictícioTesteBrasilST/sonhoPalmeiras.12→21,BotafogoSP→SãoBernardo→Mirassol porcontato/oferta/aceite;55→63OVR,49apps/38titularidades/3142min/30G2A,opponentsB/Acoerentes;recuperaçãoREAD/provadecisiva,semwarnings/errorscapturados. Reloadaos19preservoudecisão/estatísticas.390×844 e320×740semoverflow. Diretórioaberto contém20A/20BviaDOM, viewportresetao terminar. Capturasoutputs1903_BRASIL_AB_MOBILE.png/CLUBES.png,standalone90876bytes emoutputs1903_BRASIL_AB.html. Gates/newtestesnuméricos comprovam execução/continuidade, não diversão/Safarifísico/4h/aposentadoria. Adaptadores tests antigos:sóassertCLUBS44 eprobeWGcoachcomo snapshot público03 congelado para preservar missingconsistency(comnovocalendáriooantigoprobeagoracumpria).Nenhum limiarconfidence/OVRrelaxado. Publicar só protótipo/testes/ADR/log/orquestração, branchexperimentalPRdraft1, sem incluir rascunho04main. Link/SHAfinal externosapósconfirmação. Próximo:playtestcomopções/mercadoeprogressãoentreB/A, depois considerar expansão de duração/calendário sepedido.

**CheckpointQAfinalA.** Teste forte aceitou Palmeiras e continuou atéDONE,54partidas/48apps/41starts/3328min com calendáriosSérieA nos19/20anos e totais exatos. Brasil7/7final,causal15/15,antiga9/9 no mesmo hash a791538d; confirma fluxo completo após transferência à primeira divisão. Relatório externo1903_BRASIL_AB_VALIDACAO.md finalizado.
