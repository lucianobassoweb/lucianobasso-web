# 1903 — GAME SPEC 0.1

## Visão
Jogo mobile de carreira individual no futebol. Começa aos 12 anos e termina na aposentadoria. Não há controle de clube nem animação de partidas: a diversão vem de descoberta, estatística, mercado, consequência, reputação e memória do mundo.

## North Star
Uma carreira deve terminar em aproximadamente 4 horas e deixar sensação de biografia única. Ao terminar, o usuário deve querer iniciar outra para descobrir que tipo de jogador recebeu e qual caminho o levará ao nível lendário.

## Pilares
1. **Descoberta** — o jogador não conhece o próprio DNA aos 12.
2. **Agência sem onipotência** — decisões alteram caminho, mas o mundo não obedece ao usuário.
3. **Estatística com memória** — fatos importantes permanecem consultáveis.
4. **Mercado crível** — performance, idade, contrato, expectativa e necessidade dos clubes importam.
5. **Torcida viva** — paixão, ódio, temor, respeito e expectativa emergem dos fatos.
6. **Complexidade invisível** — motor profundo, interface simples.

## Loop
acontecimento → leitura do contexto → decisão (quando necessária) → simulação → consequência → memória → avanço.

## Escopo 0.1 Brasil
- 156 clubes de Séries A/B/C/D de 2026.
- Clubes reais; sem escudos.
- Dados pretendidos: nome, divisão, estado, cidade, estádio, cores, fanbase doméstica/global, prestígio, finanças, base, rivais.
- Competições e regras serão desacopladas do código.

## Jogador
Começa aos 12 na escolinha. Sem posição e sem OVR conhecido. O DNA oculto define predisposições e dificuldade, mas nunca um teto que inviabilize o status lendário.

### Dados ocultos
altura adulta, pé dominante, plasticidade do pé fraco, técnica natural, inteligência de jogo, explosão, resistência, coordenação, maturação física, plasticidade de aprendizagem, pressão, consistência, resistência a lesões, ambição, adaptação, liderança, late-blooming.

### Estado dinâmico
atributos técnicos/físicos, posição, altura/peso, moral, confiança, pressão, fadiga mental, condição física, reputação, valor, contrato, intenção de transferência.

## Formação posicional
Dos 12 aos 18 anos, o usuário escolhe uma posição principal por temporada entre goleiro, zagueiro, lateral, volante, meia central, meia ofensivo, ponta e atacante. A compatibilidade natural é oculta. Aos 12, escolhas ruins quase não pesam; o custo cresce com idade, nível competitivo e especialização. Trocar de posição gera dívida temporária de adaptação proporcional à idade e à distância entre funções. Permanecer numa posição incompatível pode produzir um jogador ruim naquela função sem inviabilizar o save: a trajetória lendária continua possível por caminhos mais coerentes. Ver `docs/POSITION_SYSTEM.md`.

## Partida
O motor deve simular condições que produzem o resultado. Alpha usa modelo reduzido; evolução prevista: posses → progressão → criação → finalização, calibradas por tática/contexto.

### Métricas permanentes
jogos, titularidades, minutos, gols, assistências, G+A/90, MOTM, amarelos, vermelhos, xG, xA, nota, títulos, prêmios, valores históricos, clubes, adversários e grandes jogos.

## Relações
Sem interações sociais artificiais. Relações são inferidas de acontecimentos esportivos e guardam memórias fortes.

## Torcidas
Cada clube guarda relação assimétrica com o jogador: paixão, ódio, temor, respeito, expectativa. O motor considera custo da contratação e expectativa criada. Eventos marcantes têm cauda longa.

## Mercado
Valor de mercado, asking price e bid são entidades diferentes. Clubes devem comprar por necessidade/encaixe, não só por OVR. Usuário pode sinalizar intenção de saída em quatro níveis. Interesse não garante proposta.

## Ritmo
Meta: 220–280 acontecimentos apresentados em 3h30–4h30. Temporadas têm densidade variável. Clássicos/finais/crises recebem mais resolução; períodos sem história são comprimidos.

## UX
Vertical, uma mão, editorial esportivo premium. Sem estética de cassino/gacha. Cores do clube dão identidade. Quatro áreas principais: Carreira, Jogador, Estatísticas, Mundo.

## Critérios de sucesso da 0.1
- carreira tem vontade de “mais um turno”;
- estatísticas parecem futebol;
- decisões têm consequências reconhecíveis;
- mercado não parece menu de escolha de clube;
- mundo lembra o jogador;
- replay produz carreira substancialmente diferente.

## Formação e posição — regra consolidada
- O usuário escolhe uma posição principal a cada temporada dos 12 aos 18 anos.
- Posições jogáveis: goleiro, zagueiro, lateral, volante, meia central, meia ofensivo, ponta e atacante.
- O DNA contém compatibilidades ocultas; elas nunca aparecem como número na interface.
- Aos 12–13, especialização pesa pouco e experimentar é barato.
- Aos 14–15, continuidade começa a acelerar proficiência específica.
- Aos 16–18, desalinhamento DNA×posição e mudanças tardias passam a afetar fortemente rendimento e desenvolvimento.
- Mudar não apaga atributos: cria dívida de adaptação e reduz eficiência temporária.
- Distância funcional importa: mudanças adjacentes custam menos que reconversões extremas.
- Toda geração possui ao menos uma rota de alta eficiência capaz de produzir nível lendário; escolhas ruins podem impedir que o usuário encontre essa rota.

## 2026-09-30 — Decisões consolidadas após os cinco estudos

Esta seção incorpora as decisões recentes do usuário e prevalece sobre defaults anteriores conflitantes.

- O jogo acompanha decisões profissionais e de vida, sem gestão de sessões de treino.
- Cidade, condição familiar, ocupações dos pais, infância, clube afetivo e DNA são sorteados. A família não determina a qualidade genética. O nome é personalização de identidade.
- Aos 12, início numa escolinha local. Clube grande requer observação, convite, avaliação e condições familiares; convite não garante vaga.
- Continuar em estrutura menor sempre é possível. Teste sem aprovação ou dispensa não força abandono do futebol.
- Escola disputa tempo com formação futebolística. Escolaridade altera opções depois do futebol. Formação técnica ou superior exige novo percurso; concluir escola não equivale a receber uma profissão qualificada.
- Após os 18, treinador e jogador podem propor reconversão. Há custo funcional e de experiência, com preservação de capacidades adquiridas.
- Posição e função são conceitos distintos. Contexto do treinador, demanda física e abastecimento afetam o rendimento.
- Maturação física tardia não equivale a baixo potencial; envelhecimento técnico e físico têm curvas distintas.
- Referência histórica e detalhamento: `docs/CAREER_CASE_STUDIES.md`.

### Primeira implementação experimental 0.2.0

Escolha anual de escola dos 12 aos 18; observação local, convites e testes com resultados incertos; apoio e decisão familiar; dispensas de base e novas portas; reconversão negociada após os 18; funções mais fixa/móvel/equilibrada; infância adquirida e progressão física ligada à maturação; escolha de trabalho ou formação no encerramento.

Não considerar finalizados: carreira da segunda profissão, lesões/reabilitação, mentores persistentes, plantéis, rede de olheiros completa, ligas locais próprias, empréstimos, mercado por projeto e aposentadoria flexível. Cobertura de cidades limitada aos registros enriquecidos; não inferir quilômetros de deslocamento a partir de estado.

## 2026-09-30 — Extensão com Lulinha e Somália

Casos adicionais: Lulinha (Corinthians) e Somália, **Wanderson de Paula Sabino**, atacante de Grêmio/Fluminense. O usuário confirmou o homônimo estudado.

- Expectativa juvenil não é experiência profissional nem qualidade genética. Entrada gradual ou maior responsabilidade altera minutos e carga emocional no começo do profissional.
- Afastamento reduz participação e oportunidades; habilidades adquiridas e DNA permanecem. Após liberação, o atleta negocia seu papel na retomada.
- Abrir o mercado ou perder espaço na fase veterana permite também projetos menores. Continuar e reconstruir são rotas válidas.
- O legado considera vínculos e carreira sustentada, sem exigir clube de elite nem tratar desvio da previsão juvenil como fracasso automático.
- A aposentadoria deixa de ser obrigatória aos 38: decisão anual entre 36 e 39; limite técnico de 40 nesta revisão. Duração de 216–252 blocos, além dos eventos de decisão. A política de benchmark para aos 38, mantendo comparação de 234 blocos.
- Formação para treinador é uma opção de percurso para quem reúne escola concluída e experiência profissional. Não concede licença ou emprego automaticamente; requisitos reais por entidade/país ainda precisarão de dados próprios.

**Implementação parcial:** lesões são afastamentos abstratos em blocos, sem diagnóstico, tratamento ou calendário médico real. Crise coletiva, empréstimos, redes humanas e internacionalização permanecem pendentes. A segunda profissão possui escolha de caminho, sem simular sua formação completa. Números derivados de estudo de caso não constituem calibração de incidência.


## 2026-09-30 — Revisão 0.3.0: treinador, categoria e uma partida por turno

Esta seção prevalece sobre os blocos de 3–6 jogos, promoção por idade e parâmetros de progressão anteriores.

- Banco inicial: 140 identidades reais, cinco referências de cadastro datadas e quatro tendências esportivas apoiadas em fontes institucionais. Ver `docs/COACH_SYSTEM.md`. Atribuições no save, competências numéricas e personalidade são dados de simulação; não representam cargos reais atuais ou avaliação psicológica das pessoas.
- Afinidade, confiança profissional e conflito são dimensões separadas, ligadas à pessoa. Memórias persistem entre clubes. Pedidos de função, cobranças, atuações e expulsões afetam a relação.
- Campanhas completas do clube seguem mesmo no banco/afastamento. Demissão é uma decisão determinística por rendimento contra expectativa, posição, forma recente e paciência fixa da direção; mínimo oito jogos no trabalho. Não há sorteio de demissão nem troca a cada três anos.
- Propostas apresentam comando, estabilidade, contexto, apoio à fase do atleta e reencontros. Uma troca antes de aceitar exige reconsideração. Saída do mentor/algoz abre escolha de ficar, conversar ou buscar mercado, sem transferência automática.
- Uma partida do protagonista por turno. Última partida fica visível antes do balanço anual. Calendário coletivo agregado: ida/volta A/B/C (38 rodadas), grupos experimentais D de oito (14); base/local 20 datas. Não alegar reprodução dos regulamentos oficiais de C/D ou categorias de base.
- Categoria identificada em partida e arquivo: Sub-15, Sub-17, Sub-20, amador/local, profissional. Totais de carreira são somente profissionais. Temporadas possuem detalhamento por categoria e aparições por posição, preservando posições anteriores.
- Uma nova carreira não sobe por idade. Dos 16 aos 20, no mínimo oito aparições e 420 minutos sub-20, com nota observada alta por função, abrem convite. Pode adiar a subida. A primeira aparição sênior é marco próprio, com registro permanente; início em entradas de 6–18 minutos e titularidade progressiva com experiência.
- Toda rodada apresentada permite decisão contextual: estabilidade, responsabilidade, conversa profissional, mercado ou família/escola/observação. Consequências persistem; nenhum botão concede contratação garantida ou aptidão genética.
- Quadro gráfico exibe categoria, placar, minutos, gols, assistências, nota, defesas para goleiro e reações da torcida/treinador. Banco preserva placar coletivo com zero minutos individuais.
- Desenvolvimento reduzido e normalizado pelo calendário. Escola agora acumula progresso ao longo do ano, impedindo concluir estudos por mudar prioridade apenas no último jogo.

Limites: elenco, passes/posses, competições reais completas, substituições em minutos exatos, viagens, calendário semanal e idade/aposentadoria dos treinadores permanecem fora do modelo. A relação com estrangeiros usa integração e contexto país-jogador, mas clubes internacionais não estão habilitados. Resolver a duração real da experiência após ampliar para centenas de partidas; não garantir quatro horas nesta revisão.

## Atualização aprovada — origem escolhida e interface (30/09/2026)

Esta decisão substitui a regra anterior de sorteio de cidade e clube do coração: o usuário escolhe cidade de nascimento, UF e clube do coração na criação. Família, condições sociais, infância e características continuam sorteadas. A residência aos 12 anos e a escolinha local usam a cidade escolhida. Não há ingresso automático no clube do coração. O campo cidade admite municípios fora das sugestões; os metadados incompletos dos clubes continuam limitando a precisão geográfica dos convites.

A UX prioriza evento e decisões: duas colunas no desktop, resumo e memória expansíveis no celular, navegação com nomes claros, textos legíveis, reações e contexto da partida expansíveis, confirmação visual da última escolha. Saves existentes mantêm suas origens.


## 0.3.2 experimental — capítulos e retorno das escolhas

Adaptação inicial de referências de jogos descritas em `GAMEPLAY_CASE_STUDIES.md`: um capítulo esportivo visível, objetivo curto e balanço factual. Formação: 3 participações/120 minutos; profissional: 3 participações/150 minutos/2 notas >=6,8; retorno: 2 participações/45 minutos. Janela de 8 rodadas do calendário, com resultado parcial possível. São marcos narrativos para leitura da carreira; não são promessas do treinador, critérios novos de promoção nem bônus numéricos. Banco e afastamento não contam como participação. Mudanças de clube/categoria/temporada encerram o contexto anterior.

Um capítulo regular por contexto temporada/clube/categoria, além de retorno após afastamento. Arquivo biográfico limitado aos 60 registros mais recentes. Meta não cumprida não altera potencial nem condena a trajetória. Uma partida por turno e decisões conforme D0021 continuam vigentes. O registro da última escolha é capturado antes da próxima simulação e explica apenas efeitos já aplicados; conversas e prioridades que abrem outra decisão também geram registro.

Saves existentes sem narrativa iniciam o registro daqui em diante. Não reconstruir marcos retroativos. Campo opcional, mesma chave e versão estrutural do save. Este ciclo não implementa toda a pesquisa: promessas negociadas, arcos paralelos de mercado/torcida e eventos que retornam memórias específicas permanecem planejados.

## Atualização aprovada — informações diretas na partida (0.3.3)

A pedido do usuário, reações da torcida e do treinador, contexto e próximos passos devem estar sempre visíveis, sem clique para abrir. Esta decisão substitui a descrição anterior que os tornava expansíveis. São seções estáticas antes das decisões, com leitura por rolagem no celular.

## 0.3.4 — contexto baseado na carreira

O contexto deve interpretar fatos observados, selecionar as tensões relevantes e explicar o próximo passo vinculado às escolhas disponíveis. A variedade vem da situação e da trajetória: participação, fase de formação/transição, adaptação de posição, relação profissional, campanha, escola ou propostas. Não preencher espaço com frases genéricas nem apenas repetir o quadro estatístico. Não revelar DNA, inventar acontecimentos ou prometer resultados futuros. Informações ausentes devem reduzir o texto. Esta camada de leitura não altera a simulação nem grava campos novos no save.

## 0.3.5 — dilemas entre partidas

O pedido de variar decisões autoriza esforço pontual fora do horário, aproximação da comissão e disputa desleal não violenta entre concorrentes abstratos. São acontecimentos ligados a participação, condição/carga, pressão, adaptação, escola/projeto e relações no grupo. Três respostas com benefícios/custos distintos; famílias têm intervalo de reaparição. Isso não é um menu de treino semanal nem um simulador social. Dilemas não substituem marcos, mercado, posição ou aposentadoria. Favores podem melhorar abertura ao diálogo sem comprar confiança técnica; rumores podem deixar rivalidade/ressentimento e afetar confiança se descobertos. Nenhum caminho garante titularidade ou contratação. Saves existentes mantêm o evento já oferecido; campos novos opcionais.


## Decisão do usuário — sonho, experimentação e consequência (30/09/2026)

- O usuário escolhe o sonho inicial. Desejo e posição exercida são distintos; a posição continua em descoberta aos12 e o sonho não altera características geradas.
- Treinador pode propor experimentar outra posição, com justificativa observável. O usuário aceita ou recusa. Recusa pode custar espaço, apoio ou oportunidade; não muda posição automaticamente. Aceite inicia aprendizado e adaptação, sem garantia de sucesso.
- Insistir por tempo prolongado sem rendimento suficiente numa posição pode impedir a profissionalização, limitar a carreira a clubes fracos e estagnar evolução relevante na função/carreira. Maturação e aprendizagem não são congeladas arbitrariamente; consequência decorre das exigências e da resposta do atleta.
- Todas as posições têm rotas de grandeza. Cada save mantém possibilidade de revisão do percurso, sem sucesso garantido na posição sonhada nem hard cap permanente. Uma rota alternativa exige experiência, negociação e oportunidade.
- Feedback não revela compatibilidade/DNA. Uma avaliação ruim não sentencia a posição. Saves existentes não recebem sonho retrospectivo inventado.

**Status:** decisões aprovadas; implementação de sonho persistente/evento de experiência e calibração das consequências ainda pendentes. A porta profissional adulta identificada em D0028 precisa ser aberta para preservar caminhos posteriores. Ver D0029 no PROJECT_LOG.


## 0.3.6 — avaliação da torcida

A torcida julga responsabilidade do setor e evidência individual separadamente. Derrota e gols sofridos expõem defesa/goleiro; falta de gols expõe ataque. Funções intermediárias dividem os pesos. Uma boa atuação atenua cobrança individual e pode gerar respeito mesmo na derrota; vitória não elimina má nota/expulsão. Minutos limitam os efeitos, banco não tem cobrança individual, formação/local têm menor intensidade. Expectativa, força do adversário, clássico, campanha real e memórias modulam o julgamento. Usar apenas fatos observados, sem revelar DNA ou declarar uma falha pessoal não registrada.

Efeitos persistentes na relação e estado mental, limitados por avaliação. Memórias negativas somente em atuações severas e respostas excepcionais documentadas podem registrar uma redenção por episódio. Nenhuma reavaliação retroativa de partidas ou troca de chave/schema obrigatório. Esta versão não cria cronologia de gols durante a presença, erros individuais ou duelos; a cobrança é de setor quando esses fatos são desconhecidos.


## 0.3.7 — avaliação ofensiva e forma recente

Para ST/WG, habilidade disponível não equivale a atuação boa sem evidência. Nota considera gols, assistências e criação registrada; ausência de produção reduz avaliação, oportunidades posteriores e confiança profissional. Nota alta sem gol é possível com contribuição ofensiva concreta. Não inventar pressão, desmarques ou erros para justificar nota. Boa nota por criação sem assistência permanece limitada pela baixa granularidade atual do xA gerado.

Sequência recente observada no mesmo clube/categoria/posição/temporada: até oito partidas substanciais, incluindo qualquer participação com gol para encerrar seca. Banco/cameos sem gol só movem o marcador de observação, sem apagar evidência anterior. Pelo menos três jogos>=45min e180min para começar cobrança, seis/360min para intensidade plena. Assistências/criação atenuam, WG tem menor peso de gol, demais posições não recebem penalidade de atacante. Menor intensidade na infância, sem hard cap ou remoção automática do time. Chance de titularidade e feedback têm efeitos efetivos e podem se recuperar.

Promoção continua por evidênciaU20, oito participações/420min, clube e idade16–20. ST/WG agora exigem nota>=6,7 e produção mínima por90min (ST gol+0,45assist>=0,30; WG gol+assist>=0,45). Outros critérios preservados. Parâmetros experimentais vinculados à nota nova, não taxa real. Save mantém a chave/versão estrutural; novo histórico opcional e guardado, nenhuma sequência ou nota antiga reconstruída.


## 0.3.8 — procurar outra avaliação

A procura é uma decisão de esforço: fadiga mental +3 e pressão +2, respeitando 0–100 e expondo o delta real antes de escolher. Somente sem clube, fora do profissional, com fadiga mental <80. Uma por temporada, sem sobrepor prioridade ainda aguardando lista. Ganho de observação +1 monotônico, inclusive em saves com contador acima de30.

Na próxima geração de candidatos, a prioridade habilita a possibilidade de ampliar a lista mesmo abaixo de6 observações e soma0,12 à probabilidade ordinária (máximo0,77). Com >=6observações isso representa12p.p.; abaixo desse limiar o ganho total pode ser maior, porque a lista ordinária não faria esse sorteio. Continua possível receber uma única opção. Prioridade consumida na geração, sem garantir teste, aprovação ou promoção e sem mudar trialProbability. Não há custo financeiro sem saldo nem dano automático de reputação por procurar.

Pressão e fadiga são estados persistentes usados na rotina/carga e no profissional; a nota juvenil e a aprovação não consultam esses estados hoje. Evento legado conserva IDs/corpo/opções; hint de busca vem do preview atual e motor bloqueia escolha indisponível antes de qualquer mutação. Campos opcionais searchPriority/lastSearchSeason preservam compatibilidade; corrupção ou cursor futuro acionam recuperação com os bytes originais.


## 0.3.9 — revisão da produção ofensiva

Esta revisão atualiza os tetos da0.3.7: semG/A/xA>=0,5, nota máxima6,3 em>=30min,6,5 em<30min e6,0 quando>=30min/xG>=0,6 sem conversão. Gol tem teto min(10,7,6+0,6G+0,3A); assistência/criação mantêm evidência e regrasanteriores. Não usar nota juvenil bruta dos atributos como atuação comprovada. Notas/eventos antigos permanecem no histórico.

Gol encerra seca, mas não elimina avaliação de produção insuficiente na janela realmente observada de até8registros. Pelo menos6partidas>=45min/360minsubstanciais; cameo comgol conta numerador/minutos mas não estabelece amostra. ST referência(G+0,45A)/90=0,25; WG(G+A)/90=0,40. Deficit clamp(1−produção/referência,0,1), alívio de xA min0,35×somaobservadaxA×0,06; máximo com intensidade da seca existente, peso posição/idade e caps anteriores (.30prof,.24amador,.18base). Não somar duaspenalidades oulerDNA. Amostra/estado são derivados dohistórico jápersistido, semnovo schema. Duasproduçõespositivas podem recuperar espaço, semgarantia de titularidade.

No profissional, primeiro limitar chance esportiva em0,08–0,92, depois subtrair forma e limitar novamente. Evita absorção de penalidade por atributos acima do teto. Rampa de estreia/retorno preservada. Banco não gera novo custo individual; feedback pode explicar cobrança anterior. Calendário, ausência de elenco detalhado e ações individuais ainda simplificados.
