# 1903 — Sistema de formação posicional v0.1

## Objetivo
A posição é uma escolha do jogador; a adequação é uma propriedade oculta do atleta. Dos 12 aos 18 anos, o usuário escolhe uma posição principal a cada temporada. O jogo nunca informa diretamente qual posição é “correta”. A evidência aparece por desempenho, evolução, experiência e feedback qualitativo do treinador.

## Princípios LOCKED
1. O jogador pode escolher **qualquer posição**: GK, CB, FB, DM, CM, AM, WG ou ST.
2. Nenhum save começa com posição conhecida.
3. O DNA não impede uma carreira lendária, mas pode tornar determinadas posições muito ineficientes.
4. **Aos 12 anos, errar custa quase nada.** A penalidade cresce com idade, especialização e nível competitivo.
5. Trocar de posição e estar numa posição incompatível são problemas diferentes:
   - incompatibilidade = o DNA não favorece aquela função;
   - reconversão = perda temporária por abandonar especialização acumulada.
6. Permanecer na posição errada pode produzir um jogador ruim nessa função. A saída é descobrir e construir um caminho mais coerente.
7. A posição natural nunca é exibida como número ou recomendação explícita.

## Posições
| Código | Posição |
|---|---|
| GK | Goleiro |
| CB | Zagueiro |
| FB | Lateral |
| DM | Volante |
| CM | Meia central |
| AM | Meia ofensivo |
| WG | Ponta |
| ST | Atacante |

## DNA oculto relevante
A compatibilidade posicional deriva de combinações entre:
- altura adulta;
- técnica;
- inteligência de jogo;
- aceleração;
- resistência;
- coordenação;
- aptidão defensiva;
- aptidão de finalização;
- aptidão aérea;
- reflexos;
- resposta à pressão;
- consistência;
- plasticidade de aprendizagem;
- adaptabilidade.

Na geração do save há um **cluster natural de talentos**, mas ele não é armazenado como “posição ideal”. O cluster apenas cria correlações plausíveis entre corpo e aptidões. A posição natural é derivada posteriormente das características.

## Compatibilidade oculta
Cada posição recebe um score interno de compatibilidade. O melhor encaixe de cada DNA é normalizado para uma faixa de elite, garantindo ao menos um caminho natural forte. Posições distantes do perfil podem cair muito abaixo disso.

Este score é **diagnóstico interno**. Nunca deve aparecer na interface normal.

## Pressão de especialização por idade
A incompatibilidade é multiplicada por uma curva crescente:

| Idade | Pressão relativa |
|---:|---:|
| 12 | 0,05 |
| 13 | 0,10 |
| 14 | 0,24 |
| 15 | 0,43 |
| 16 | 0,68 |
| 17 | 0,90 |
| 18 | 1,08 |
| 19–21 | 1,12 |
| 22+ | 1,18 |

Interpretação: o mesmo desalinhamento de DNA que é quase invisível numa escolinha aos 12 passa a ser determinante em ambiente profissional.

## Experiência posicional
Cada posição possui proficiência própria de 0–100.

- jogar/treinar naquela posição aumenta proficiência;
- posições vizinhas recebem pequeno spillover de experiência;
- manter a função acelera especialização;
- mudar para uma função distante significa começar com menos repertório útil;
- experiência anterior nunca é simplesmente apagada.

Isso permite, por exemplo, que um lateral convertido em ponta tenha adaptação muito menor que um goleiro convertido em ponta.

## Distância entre posições
A distância usa um mapa tático interno. Mudanças próximas têm baixo custo; goleiro ↔ linha é deliberadamente extremo.

Exemplos qualitativos:
- DM ↔ CM: pequena;
- CM ↔ AM: pequena;
- FB ↔ WG: pequena/moderada;
- CB ↔ DM: pequena/moderada;
- ST ↔ CB: alta;
- GK ↔ qualquer posição de linha: extrema.

## Custo de mudança
`custo = distância × 30 × pressão_da_idade`, limitado a 70.

O custo entra como **dívida de adaptação**. Essa dívida:
- reduz rendimento imediato;
- reduz eficiência de desenvolvimento enquanto existe;
- cai conforme o atleta acumula jogos/treinos;
- é parcialmente amortizada entre temporadas.

Aos 12–13, mesmo uma mudança grande é quase gratuita. Aos 17–18, uma reconversão distante pode consumir parte relevante da temporada.

## Efeito no rendimento
O nível de jogo em uma posição combina:
1. atributos relevantes para aquela função;
2. compatibilidade natural oculta;
3. experiência posicional;
4. dívida de adaptação;
5. idade/pressão de especialização;
6. nível competitivo.

Não existe penalidade arbitrária “posição errada = -10 OVR”. O OVR efetivo cai porque o atleta usa pior seus recursos naquele contexto.

## Efeito no desenvolvimento
O treino continua desenvolvendo qualquer atleta, mas:
- atributos relevantes à posição recebem mais estímulo;
- DNA compatível aprende com maior eficiência conforme a idade aumenta;
- DNA incompatível exige mais tempo para o mesmo ganho;
- adaptação após mudança temporariamente reduz a eficiência.

Isso permite que um usuário insista numa escolha ruim, mas o custo aparece organicamente.

## Descoberta pelo jogador
O usuário recebe evidências, não diagnóstico:
- notas;
- titularidade;
- produção estatística;
- evolução do OVR na função;
- proficiência por posição;
- feedback textual do treinador.

Exemplos de feedback:
- 12–13: “Experimentar ainda custa pouco.”
- 14: “Alguns movimentos exigem esforço demais.”
- 15–16: “O rendimento oscila quando o nível sobe.”
- 17–18: “Você trabalha muito para entregar nessa posição o que outros fazem com mais naturalidade.”

Nunca mostrar: “compatibilidade 61%”.

## Goleiro
Goleiro é uma carreira completa, não um placeholder. O motor já diferencia:
- reflexos;
- mãos;
- jogo aéreo;
- jogos sem sofrer gols;
- defesas;
- rating específico;
- produção ofensiva residual.

## Resultado da calibração v0.1
Amostra pareada: 200 DNAs, cada um jogado com 5 políticas posicionais (1.000 trajetórias de formação).

### Diferença de nota — melhor posição vs pior posição
| Idade | Diferença média |
|---:|---:|
| 12 | 0,08 |
| 14 | 0,13 |
| 16 | 0,42 |
| 18 | 0,53 |

### Aos 18
- melhor posição: nível efetivo médio **75,4**;
- pior posição: **60,3**;
- correção aos 16 para a posição natural: **70,8**;
- troca quase todo ano: **60,1**.

A correção tardia recupera **0,40 ponto de nota** sobre permanecer na pior posição, mas ainda fica aproximadamente **0,13 ponto** abaixo de quem construiu a especialização correta desde cedo.

### Distribuição de posição natural — 5.000 DNAs
- FB: 15,7%
- WG: 16,2%
- CM: 11,8%
- CB: 9,6%
- AM: 15,9%
- GK: 10,4%
- ST: 9,2%
- DM: 11,3%

Objetivo atingido: todas as posições são caminhos recorrentes, sem posição impossível ou dominante de forma absurda.

## Critérios de regressão
Toda alteração futura no DNA/desenvolvimento deve rerodar:
- `npm run simulate:distribution -- 5000`
- `npm run simulate:positions -- 200` (rápido)
- lote maior quando houver tempo de CI.

Falha de regressão se:
- qualquer posição natural cair abaixo de ~4% sem justificativa;
- diferença BEST vs WORST aos 12 ultrapassar ~0,15 de nota;
- diferença BEST vs WORST aos 18 cair abaixo de ~0,35;
- correção tardia não melhorar claramente sobre permanecer na pior posição;
- trocar todo ano não tiver custo acumulado mensurável.


## Decisão do usuário — sonho, experimentação e consequência (30/09/2026)

- O usuário escolhe o sonho inicial. Desejo e posição exercida são distintos; a posição continua em descoberta aos12 e o sonho não altera características geradas.
- Treinador pode propor experimentar outra posição, com justificativa observável. O usuário aceita ou recusa. Recusa pode custar espaço, apoio ou oportunidade; não muda posição automaticamente. Aceite inicia aprendizado e adaptação, sem garantia de sucesso.
- Insistir por tempo prolongado sem rendimento suficiente numa posição pode impedir a profissionalização, limitar a carreira a clubes fracos e estagnar evolução relevante na função/carreira. Maturação e aprendizagem não são congeladas arbitrariamente; consequência decorre das exigências e da resposta do atleta.
- Todas as posições têm rotas de grandeza. Cada save mantém possibilidade de revisão do percurso, sem sucesso garantido na posição sonhada nem hard cap permanente. Uma rota alternativa exige experiência, negociação e oportunidade.
- Feedback não revela compatibilidade/DNA. Uma avaliação ruim não sentencia a posição. Saves existentes não recebem sonho retrospectivo inventado.

**Status:** decisões aprovadas; implementação de sonho persistente/evento de experiência e calibração das consequências ainda pendentes. A porta profissional adulta identificada em D0028 precisa ser aberta para preservar caminhos posteriores. Ver D0029 no PROJECT_LOG.
