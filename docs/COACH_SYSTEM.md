# Treinadores — revisão experimental 0.3

## Decisão do usuário
Identidades reais em banco amplo; personalidade, pontos fortes/fracos e preferências influenciam oportunidades. Relação pessoal difere de confiança profissional. Permanência depende dos resultados diante da expectativa e paciência da direção. Saída pode levar o jogador a rever permanência, aguardar ou buscar mercado. Relações acompanham a pessoa entre clubes.

## Falhas a impedir antes da implementação
- Trocar treinador por idade do save, relógio ou sorteio de demissão.
- Ignorar partidas quando o protagonista não entra ou está afastado.
- Gerar placar do clube diferente do placar mostrado para o jogador.
- Empregar a mesma pessoa em dois clubes simultaneamente.
- Apagar conflitos e confiança ao reencontrar um treinador.
- Tratar afinidade como qualidade técnica ou nacionalidade como penalidade.
- Transferir automaticamente após demissão ou prometer titularidade garantida.
- Mostrar cargo atual real a partir de uma fonte antiga.
- Atribuir avaliações psicológicas inventadas a pessoas reais sem indicar simulação.
- Travar saves antigos ou perder escolhas ao trocar comando.
- Prometer um treinador na proposta sem detectar troca antes da decisão.
- Declarar campeão por sorteio desconectado da tabela.

## Escopo de dados
Identidades e referências históricas verificáveis. Atribuições de clubes no save são simulação, não escalação real em setembro de 2026. Competências numéricas e perfis de interação são parâmetros editoriais experimentais, sem alegar diagnóstico ou julgamento biográfico. Mentor/algoz depende da relação emergente.

## Ajustes solicitados durante a implementação
- Registrar posição principal e aparições por posição em cada temporada; não preencher passado desconhecido com a posição atual.
- Toda partida/rodada apresentada deve ter decisão contextual com consequência persistente.
- Quadro gráfico de atuação e reações derivadas dos acontecimentos; separar indivíduo, equipe e categoria.
- SUPERSEDE blocos de 3–6 partidas: o protagonista acompanha uma partida por turno. Calendário coletivo continua fora de sua participação.
- Profissionalização exige destaque observado na base; idade não concede promoção. Convite, transição e estreia são eventos separados. Participação inicial curta.
- Escalar desenvolvimento pelo tempo do calendário para evitar aumentar OVR quatro vezes mais depressa ao aumentar a resolução dos jogos.


## Cadastro e procedência

`src/data/coaches.ts`: 140 identidades, das quais 136 disponíveis para designação nesta primeira simulação. Quatro nomes ficam no acervo histórico por decisão editorial; isso não é uma afirmação de situação contratual atual. Identificadores são estáveis, aliases de tabelas foram reconciliados. Fontes por registro, data e escopo estão no arquivo. Referências institucionais FIFA/UEFA e reportagens de cadastro brasileiro não são copiadas como biografias integrais.

| Referência | Data do registro | Uso |
|---|---|---|
| [FIFA, listas Qatar 2022](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) | 18/12/2022 | Identidades e nacionalidades |
| [UEFA, participantes 2024/25](https://www.uefa.com/uefachampionsleague/news/0291-1bc1ed5a7dfc-022b586a26e4-1000--meet-the-champions-league-inaugural-league-phase-teams/) | 28/01/2025 | Identidades e referência histórica |
| [Itatiaia, técnicos Série A](https://www.itatiaia.com.br/esportes/futebol/futebol-nacional/brasileirao-serie-a/brasileirao-2025-tudo-sobre-os-20-tecnicos-da-competicao/) | 27/03/2025 | Cadastro brasileiro e nacionalidades publicadas |
| [ge, quartas da Copa do Brasil](https://ge.globo.com/rs/futebol/copa-do-brasil/noticia/2026/08/07/copa-do-brasil-tem-maior-numero-de-tecnicos-estrangeiros-nas-quartas-da-historia-veja-lista.ghtml) | 07/08/2026 | Identidades em listas de várias edições |
| [ge, Série C](https://ge.globo.com/pb/futebol/brasileirao-serie-c/noticia/2025/04/07/serie-c-2025-bate-a-porta-apenas-um-clube-segue-sem-treinador.ghtml) | 07/04/2025 | Identidades do mercado regional |

Tendências documentadas separadas dos números editoriais: [Guardiola/City](https://www.mancity.com/news/first-team/first-team-news/2016/july/pep-guardiola-talking-tactics) para posse/reconversão; [Abel/Palmeiras](https://www.palmeiras.com.br/centro-de-formacao/) para integração da base; [Flick/Barcelona](https://www.fcbarcelona.com/en/football/first-team/staff/4030694/flick) para pressão alta; [Ancelotti/CBF](https://cbf-hml.cbf.com.br/selecao-brasileira/noticias/selecao-masculina/a/ancelotti-um-pouco-de-concorrencia-e-bom-para-a-motivacao-de-cada-jogador) para concorrência e experimentação de sistemas. As notas e suas traduções simplificadas são inferências de design. Para os demais, o perfil é um baseline determinístico do jogo e ainda precisa de curadoria individual. Não apresentar o cadastro como 140 análises psicológicas documentadas.

## Regras implementadas

Perfil: apoio a jovens, maduros, integração, recuperação, flexibilidade e organização; paciência, diálogo, disciplina e criatividade; posição/função preferida e estilo. O perfil acompanha o identificador da pessoa. Não é um diagnóstico. Desenvolvimento juvenil, oportunidades, suporte, negociação e resposta a atuações usam esses parâmetros. Estrangeiro é contexto de integração, sem qualidade determinada por nacionalidade. A internacionalização do mundo ainda está pendente.

Relação pessoal: afinidade e conflito. Confiança profissional: avaliação em campo e disciplina. Uma pessoa pode ter afinidade baixa e confiança alta. Memórias são limitadas aos 16 fatos recentes por treinador e continuam em reencontros. Conflitos emergem de decisões e acontecimentos, sem classificar pessoas reais como algozes históricos.

Campanha: pontos, vitórias, empates, derrotas, gols, saldo, últimos seis resultados, objetivo e tabela. Todos os clubes possuem campanha. Designações do comando são materializadas para projetos observados e persistem no save; não alegar um mercado mundial completo ou fotografia dos técnicos reais em 2026. Uma pessoa não ocupa dois cargos simultâneos. Na exaustão do cadastro, há interino explicitamente fictício.

Demissão: após oito jogos no trabalho, calcular respaldo a partir de déficit de pontos por jogo (trabalho/temporada/forma recente), distância de posição esperada e paciência fixa da direção. Respaldo abaixo de 25 e déficit do trabalho maior que 0,30 produzem demissão, sem rolagem aleatória. Referência central 78; pesos dos déficits 42/16/18, posição 24, paciência 0,45 e superação do objetivo 18. Resultados continuam aleatórios dentro do motor agregado de futebol; a decisão da direção é determinística diante deles.

Sucessor: candidatos disponíveis, mercado compatível e preferência por organização/recuperação em crise ou apoio à formação num projeto estável. Aptidões numéricas são editoriais; não se pressupõe que um técnico internacional aceite qualquer projeto real. Não há salários/contratos próprios ou envelhecimento de treinadores nesta revisão.

Troca: abre decisão de permanência, conversa ou busca de propostas. A intenção não movimenta o jogador sozinha. Propostas identificam comando, contexto, estabilidade, fase de carreira e relação conhecida. Uma mudança de treinador entre apresentação e aceite exige confirmação do novo projeto.

Ritmo: uma partida individual por turno; sem pacote de quatro jogos. Rodadas do mundo são proporcionais ao calendário corrente, inclusive durante base, banco e lesão. Última partida antecede o balanço anual em evento separado. A/B/C usam liga experimental ida/volta de 20, D usa grupos de oito, base/local usa 20 datas. Regulamentos oficiais completos, acesso/rebaixamento, copas e seleções permanecem pendentes. Títulos são resultados da tabela experimental, nunca sorteio independente.

Promoção: Sub-20 observado, no mínimo oito aparições e 420 minutos, avaliação alta por função (7,05 goleiro; 6,95 defensores/volantes; 7,20 demais), idade 16–20 e vínculo de base. O goleiro recebe avaliação de defesas e jogos sem sofrer gol. Isso é calibragem do jogo, não regra real de seleção. Convite pode ser recusado; estreia registra adversário, idade, temporada e minutos. Primeiros 120 minutos profissionais vêm em entradas de 6–18 minutos, com chance baixa de titularidade; espaço cresce após 450/900 minutos. Nada disso aumenta DNA.

Crescimento: coeficiente reduzido para 0,30 até 21 e 0,40 depois, multiplicado por fração equivalente a nove unidades anuais do modelo anterior. Posição e corpo também respeitam calendário. Estudos acumulam crédito ao longo do ano; mudar a prioridade no último jogo não apaga o percurso anterior. Não interpretar OVR como escala universal de scouts reais.

Atuação e arquivo: categoria, placar, minutos, gol, assistência, nota, defesas e reações. Banco mostra resultado coletivo com zero participação. Profissionalização não apaga a produção sub-20 nem a converte em total sênior. Aparições por posição definem posição principal da temporada; funções adicionais ficam visíveis. Dados antigos sem categoria/posição mantêm indicação de informação não registrada.

## Validação

`npm test`: carreiras completas, escola, transição, lesão, mercado, reconversão, relação/reencontro, decisão de direção, unicidade de cargos, calendário coletivo, categorias, primeira estreia e última partida antes do balanço. `tests/browser-career-story.cjs`: convite → estreia → quadro → comando/tabela/busca → arquivo de posições e categorias. `tests/browser-smoke.cjs`: fluxo inicial, abas, reconversão, save e offline.

Resultados e métricas: entrada A0005 no `PROJECT_LOG.md`, JSONs `*-0.3.0.json`. Chromium móvel 390×844; Safari real ainda não verificado. `agent-browser` indisponível neste ambiente; verificação executada com Playwright/Chromium e scripts reproduzíveis.

## Limites a acompanhar

Duração mudou para centenas de partidas e decisões. O alvo de quatro horas exige teste com pessoas; não está validado. Muitos perfis ainda são parâmetros genéricos, dados de cidades/clubes são parciais, ligas internacionais e plantéis não existem.
