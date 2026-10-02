# 1903 — acompanhamento do equilíbrio

## Escopo e unidade

Monitor reproduzível do protótipo Brasil A/B 06, em `scripts/prototype-balance.mjs`. Usa carreiras sintéticas públicas; não lê exports, localStorage ou DNA do usuário. Não modifica o motor ou saves. A revisão visual 05.1 explicita o tempo que já era simulado.

- Formação: 12→14, 14→16, 16→18. Cada escolha estabelece uma prioridade por **dois anos**, não uma sessão.
- Adulto: cada registro de evolução acumula **seis partidas**. Escolher intenção, recuperação e teste decisivo pode preparar o mesmo bloco; esses cliques não são três créditos independentes de treino.
- Habilidades: pontos na escala adulta 0–99. +11 significa onze pontos nessa escala, não melhora relativa de 11% ou efeito equivalente na produção esportiva.
- `overallGain` e `primaryGain`: diferença observada por avanço, com período definido acima. A habilidade principal monitorada depende da posição; seis atributos adquiridos também são medidos individualmente.
- Aos 15 não há estado natural neste recorte, que salta de 14 para 16. Nenhuma interpolação é apresentada como medição. O caso sintético 15/80 exercita a regra de alerta.

## Referências de design

| Idade / momento | P95 de cada habilidade | Máximo a revisar |
|---|---:|---:|
| 12 | 25 | 30 |
| 14 | 42 | 50 |
| 15, quando existir observação | 50 | 60 |
| 16 | 55 | 65 |
| 18, entrada após formação | 62 | 70 |

São referências do jogo, não tabelas científicas, limites de potencial nem caps implementados. Os valores aos 18 avaliam a entrada; não todos os blocos profissionais seguintes. Os limites podem ser revistos com evidência e decisão no Log. Nenhum jogador fica condenado por teto individual oculto.

**BLOCKED:** alguma habilidade ≥80 em estado observado antes dos 18; o processo de aprovação do balanceamento deve parar. O script sai com código 1. **REVIEW:** referência acima excedida ou P95 muda mais de cinco pontos em atributo/OVR/ganho na mesma coorte; código 2, com causa e decisão obrigatórias no Log. **PASS:** nenhum alerta; código 0. PASS não prova diversão, realismo ou a calibração da carreira principal. Esse gate é um comando de verificação; não foi ligado automaticamente ao workflow de hospedagem.

## Amostra fixa e comparação

32 seeds públicos × oito posições × todas as 64 combinações de quatro prioridades: 16.384 caminhos completos. A coorte original ALL_FORMATION_PATHS conserva as 27 combinações antigas (6.912 caminhos) para comparação com05. BALANCED_FORMATION_PATHS separa as 37 combinações que incluem a nova prioridade equilibrada (9.472 caminhos), sem misturá-las aos quantis históricos. As referências juvenis valem para ambas. Configurações compartilham DNA; não são jogadores independentes nem incidências no futebol real.

Adulto: 16 seeds × oito posições × duas políticas (foco/recuperação e intensidade/sobrecarga): 256 carreiras, 54 partidas por carreira, 2.304 blocos de seis jogos. Formação adulta usa as três prioridades, entrada no primeiro projeto interessado e permanência; este monitor não mede todas as políticas de mercado. A política de foco escolhe lazer quando felicidade<50, descanso quando fadiga>35/condição<70/stress>45, e treino nos outros casos; sobrecarga sempre escolhe treino. Intenções/recuperação/teste decisivo mantêm suas políticas anteriores. As alternativas dependem do contexto e podem não ocorrer igualmente em todas as carreiras.

Por idade, posição, momento e política: mínimo, média, P50, P95 e máximo dos seis atributos, OVR, condição, fadiga, pressão, felicidade, descanso físico, stress mental, ganho de OVR e ganho principal. Também contar blocos com qualquer perda e com perda principal. Uma perda de habilidade secundária não demonstra por si só sobrecarga relevante; separar perda principal. Reportar valores adquiridos e carga, evitando comparar somente OVR final.

Registrar hashes do motor e catálogo, versão do monitor, seeds e coortes. A baseline aprovada atual é `docs/balance/prototype07.json`; checkpoints anteriores permanecem imutáveis. A comparação exige versão, seeds e grupos iguais. Mudança na amostra exige baseline nova e decisão explícita; arquivo aprovado não deve ser sobrescrito. `--record-baseline` usa criação exclusiva e recusa relatório com alertas.

## Comando obrigatório para alterações de progressão

Na raiz do repositório:

```sh
node scripts/prototype-balance.mjs --output-dir ../../outputs/1903-equilibrio --baseline docs/balance/prototype07.json
```

O diretório de saída é ajustável; resultados são `report.md` e `report.json`. O JSON contém todas as coortes; Markdown resume finalização do atacante e alertas. O relatório informa intervalo de dois anos/seis partidas, sem dividir o ganho por uma quantidade de treinos que o motor não simula.

Antes de publicar alteração relevante, acrescentar ao PROJECT_LOG: hipótese causal; parâmetros alterados; estado inicial/versão de regras; baseline e hashes; resultados por idade e ganhos por intervalo; exceções/perdas; status do gate; manter/revisar/reverter e por quê; próximo playtest. Comparar a mesma amostra antes/depois. Observar saves legados separadamente, com versão de regras, sem rescalonar passado para fazer a medição passar.

## Primeiro checkpoint

Motor 05: `8a97705eb4ba3051ba951b588655365fa530d60cf08ad7883aae3f8724b7d6a6`. Finalização ST P95 / máximo: 12 anos 22,747 / 22,968; 14 anos 36,657 / 38,123; 16 anos 45,874 / 50,937; entrada aos 18 55,202 / 61,467. Zero estados bloqueados e zero referências excedidas na amostra. Maior ganho de finalização dos 12 aos 14: 16,355 pontos acumulados em dois anos; mediana 9,129. Esse é um intervalo comprimido, não uma sessão de treino.

Controle negativo com motor 04 congelado e a mesma amostra: BLOCKED, 56 estados com alguma habilidade ≥80 antes dos 18 e 101 avisos. Finalização ST máxima aos 16: 75,717; entrada18: 99. Não há observação natural aos15 em nenhuma das duas versões. A verificação detecta a inflação anterior sem inventar medição para essa idade.

Na amostra adulta atual, 2.304 blocos têm alguma perda e 381 têm perda principal. Essa seleção inclui uma política intensa e não é taxa populacional. Curva adulta, frequência de extremos e interesse pela carreira ainda exigem playtest; alertas juvenis não certificam o restante do jogo.

## Checkpoint 06 e aprovação de mudança estrutural

Baseline05 permanece em `docs/balance/prototype05.json`; a06 foi criada com exclusividade após decisão D0048/A0030. Comparação06→05 resultou REVIEW: 139 desvios P95 adultos (135 sobrecarga/4 foco), zero bloqueios ou referências juvenis excedidas. Os efeitos adultos foram mantidos por corresponderem ao custo de bem-estar solicitado; não reduzir os limiares para obter PASS. Comparar uma execução posterior contra06 mede regressões a partir dessa decisão, sem apagar o REVIEW anterior. Novos quantis de felicidade/descanso/stress entram no acompanhamento; dados ausentes05 não são inventados.

Motor06 SHA256 `556268622eea846e1d8b1311ad328e108a47e9f6af2e10354db28064e7deefdf`. Aos18, finalizaçãoST coorte original P95 55,081/máximo61,414, próxima do05. Aos21, foco com recuperação OVRmédio55,055; sobrecarga39,117. Todos os2.304 blocos têm alguma perda;660 têm perda principal. Números refletem políticas selecionadas, não incidência no futebol real.

A comparação exige que todas as coortes da baseline existam; apenas a nova coorte equilibrada é admitida ao comparar com05. Hashes de motor/catálogo são capturados antes do import e conferidos novamente antes da escrita: fontes que mudaram durante execução invalidam o relatório. Aprovar checkpoint novo exige causa/resultado explícitos no Log, criar arquivo ainda inexistente com `--record-baseline` e confirmar repetibilidade. Essa aprovação não substitui playtest humano.


## Checkpoint07: catálogoA–D e até25

D0050/A0032 aprova extensão preservando o REVIEW contra06:54drifts adultos/0juvenis/0bloqueios, maior12,593. Motor224926279cc2a6f80f2b2dd2ffb2ffc55f46d7565f6ca581f4133ecb1f9defa2. Adulto768carreiras/16128blocos até126partidas cada, entradaB/C/D separada. Formação16384caminhos mantém6912originais. Comparar adulto por temporada/período: DONE21 antigo coincide com final da temporada20; novos21–24 não têm referência06 e não entram no drift. C/D nunca são misturados aB. Default07;06permanece acessível para comparação histórica. Crescimento/sobrecarga/bem-estar não ganharam multiplicadores. Alterar catálogo muda futuras oportunidades/RNG: quantificar, não exigir identidade de partidas depois de adoção. Nova baseline usa criação exclusiva e repetição; PASS local significa repetibilidade, não calibração científica/diversão.
