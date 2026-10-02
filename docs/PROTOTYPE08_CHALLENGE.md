# 1903 — protótipo08: decisões contextuais e disputa por papel

## Causa e recorte

O playtest07.2 apontou facilidade, previsibilidade e excesso de texto. Uma carreira auditada cumpriu17/21 metas,14/15 após20, enquanto rotina e plano repetiam o mesmo ciclo. A prova para ganhar confiança inicial continuava sendo a exigência de um titular consolidado.

08 conserva formação12–18,156 clubesA–D e126 partidas internas até25. Combina rotina e intenção em uma decisão por período; não acrescenta cliques de recuperação, rival ou jogo decisivo ao ciclo novo. Uma carreira com permanência tem31 escolhas:3 de formação,1 de entrada,21 períodos e6 janelas. Transferências podem acrescentar negociação. Não representa aposentadoria nem calendário oficial.

## Situação, ação e custo

O motor seleciona situações por fatos persistidos: chegada, mudança de clube, desgaste, stress, felicidade baixa, banco, produção insuficiente, derrotas, adversários fortes, boa fase, consolidação ou disputa aberta. As três alternativas combinam intenção da posição e rotina; o menu é congelado até a resposta. Os pares variam com a situação e produzem ações, aprendizagem e bem-estar distintos. Não há sorteio de frases no render.

Rotinas: treino extra128% da prática; carga equilibrada86%; descanso50%; vida pessoal58%. São multiplicadores de prática, não percentuais de aumento de skill. A carga equilibrada recupera5,4 pontos de fadiga e5,5 de condição por jogo, antes do consumo da partida. Trabalho em campo pode superar a recuperação. Em desgaste, REST é associado à intenção de menor esforço: LINK para atacante, SAFE para goleiro, HOLD para defesa e CONTROL para demais meias/ponta. Isso permite recuperação gradual, com menos protagonismo ofensivo; não recupera tudo imediatamente. Nenhuma opção garante simultaneamente mais aprendizagem, produção e bem-estar.

## Objetivos por estágio

Integração, disputa, consolidação e referência usam oportunidade prevista, nível relativo e histórico no clube atual. Cada ação congela sua própria previsão e alvo. A estimativa percorre os próximos seis adversários, participação prevista e produção da função; mistura até12 atuações qualificadas recentes, peso observado até0,65, com taxa observada limitada a0,65–1,55 da referência teórica. Não consulta potencial oculto nem escala a meta indefinidamente.

Participações exigidas: arredondamento para cima de74% das previstas, entre1–6. Minutos:78% dos previstos, entre10–450. Boas atuações: limitadas pela oportunidade de titularidade e estágio. Produção: taxa estimada × minutos previstos/90 × fator de estágio, arredondada para cima, mínimo1. Referência usa fator1,30: exige mais que produção média esperada. A meta não limita habilidades e não converte previsão em vaga garantida.

A estimativa do goleiro compartilha a exposição defensiva da simulação, incluindo a redução SAFE. Correção desse estimador não alterou probabilidade, ordem de RNG ou partidas simuladas.

Falta de minutos pode deixar a amostra incompleta; não gera crise adicional no projeto. Com minutos suficientes, boas contribuições são reconhecidas mesmo sem cumprir todos os critérios. “Bom período · meta parcial” é feedback; o registro continua MISSED. MET continua exigindo todos os critérios. Recompensa de confiança é do treinador, não a confiança pessoal. Falha adiciona stress1/felicidade−0,5; repercussão esportiva depende da amostra e contribuição.

## Interface

Cabeçalho fixo: idade, clube, treino, gols/estatísticas da temporada, bem-estar, habilidades e variações com intervalo explícito. Centro: resultado factual do último período, situação atual e três cartões clicáveis; formação oferece quatro. Rodapé: Carreira, Partidas, Exportar e Recomeçar. Não duplicar ação e descrição em lugares diferentes.

O resultado usa a meta arquivada do período resolvido, não a previsão da decisão seguinte. Partidas conserva reações completas, produção, ações e memórias. Carreira conserva contrato, gráfico/tabela anual, metas e escolhas. A tela principal reconhece produção parcial com números e conserva os custos antes do clique.

## Compatibilidade e controle

Mesma chave1903.prototype10.v2/schema2. Novos saves têm challengeRevision1. Save sem marcador mantém seu evento pendente e seus efeitos; após resolvê-lo, adota o ciclo08 prospectivamente. ENTRY/ROUTINE/PLAN/RIVALRY/INTEREST/CONTACT/OFFER não são ressorteados. Passado, DNA, atributos e contratos não são rescalonados. DONE25 continua encerrado; DONE21 conserva extensão explícita.

`createGame(name,position,seed,{challenge:false})` cria controle técnico challengeRevision0, que conserva o ciclo antigo. Não é opção de dificuldade da interface. Ações08 são validadas pelo contexto persistido; IDs ou payloads alterados são rejeitados sem mutação.

## Verificação e limites

Gates novos: `tests/dez-clubes-v2-challenge.mjs` e `tests/dez-clubes-v2-challenge-review.mjs`. Gates históricos usam controle explícito para continuar medindo seus contratos antigos; snapshots sem marcador continuam exercitando adoção real. Comparações de saves permitem somente o próximo menu e defaults prospectivos esperados, sem descartar efeitos consumidos.

Monitor conserva seeds, coortes, referências e limiares. Controle0 reproduz07.1; default08 aplica bundles contextuais. Rotina desejada nem sempre é oferecida, então a política escolhe a prática disponível mais próxima. Comparação adulta mede a experiência inteira, não efeito isolado da meta ou uma taxa populacional. Ver BALANCE_TRACKING.md e PROJECT_LOG D0055/A0037.

Metas de referência podem frustrar; situações de bem-estar podem persistir enquanto a causa persistir. Recuperação física, crescimento tardio em divisões menores e repetição sob políticas extremas exigem playtest. Gates técnicos não comprovam diversão, superioridade sobre referências, quatro horas ou Safari físico.
