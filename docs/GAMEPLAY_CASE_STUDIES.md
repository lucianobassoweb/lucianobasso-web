# 1903 — Estudos de mecânicas narrativas em jogos

Pesquisa de referências para tornar uma carreira individual de futebol mais envolvente. Escopo: New Star Soccer, Football Manager, Wildermyth e Citizen Sleeper. As observações abaixo resumem descrições oficiais dos criadores, editoras ou plataformas; não são relatos de experiência pessoal. As propostas para 1903 são inferências de design, não afirmações sobre a implementação dos jogos de referência.

## New Star Soccer — decisão e recompensa próxima

**Observação da fonte.** A página oficial do jogo descreve uma carreira mobile de jogador, com dilemas, reviravoltas e decisões-chave, além de desempenho em campo e relações como parte da fantasia de ascensão. [New Star Games](https://www.newstargames.com/new-star-soccer); [ficha oficial na Google Play, publicada por New Star Publishing](https://play.google.com/store/apps/details?id=com.newstargames.newstarsoccer).

**Inferência para 1903.** A decisão fica mais legível quando a recompensa e o risco aparecem perto da escolha, em linguagem ligada à situação do atleta, sem exigir controle de cada minuto da partida.

**Adaptação concreta.** Nas janelas já existentes de decisão, explicitar o que está em jogo — minutos, confiança, expectativa, relação com treinador/torcida ou alternativa de mercado — e fechar o evento com recibo breve do efeito observado. Ligar o resultado às estatísticas e à memória da carreira; mostrar progresso parcial quando a consequência só amadurecer depois.

**Limite e pilar.** Não importar energia consumível, minijogos ou rotina artificial de treino/social. Preservar o formato mobile sem animação de partida, com uma escolha contextual de cada vez e consequências que não garantem sucesso.

## Football Manager — metas, competição e confiança

**Observação da fonte.** A descrição oficial de FM24 apresenta metas individuais de gols, assistências, jogos sem sofrer gol e desempenho, acordadas em contextos como elogios, empréstimos e contratos. O cumprimento pode exigir que o treinador honre uma promessa; o fracasso pode gerar reação contextual. A série também descreve confiança dos torcedores associada às expectativas próprias do clube, rivais e desempenho individual. [Metas individuais e lógica de interação](https://www.footballmanager.com/features/individual-player-targets-and-interaction-logic); [confiança dos torcedores](https://www.footballmanager.com/features/supporter-confidence).

**Inferência para 1903.** Uma meta cria antecipação entre decisão e balanço: o jogador entende a expectativa que se formou, acompanha evidência e interpreta a reação como consequência, não como barra abstrata.

**Adaptação concreta.** Introduzir metas opcionais por temporada, propostas por treinador ou surgidas de contrato, disputa por vaga ou projeção juvenil: por exemplo, faixa de minutos, participação em gols ou nota por função. Tornar visíveis progresso e contexto; resultado pode afetar confiança e confiança da torcida, com crédito parcial e explicação, sem prometer titularidade automática.

**Limite e pilar.** Jogador controla a própria carreira, não escalação nem elenco. Não copiar treino, plantel ou gestão de clube. Usar metas raras, compatíveis com carreira de 12–40 anos e com o tempo curto de sessão.

## Wildermyth — eventos condicionais e memória

**Observação da fonte.** Worldwalker Games descreve eventos em formato de quadrinhos com escolhas que podem mudar aparência, personalidade, relações e habilidades. Heróis entram numa “Legacy” e podem reaparecer em partidas futuras. [Worldwalker Games — Wildermyth](https://www.worldwalkergames.com/).

**Inferência para 1903.** Eventos ganham especificidade quando reconhecem fatos anteriores do personagem; a escolha importa mais quando deixa vestígio recuperável, em vez de apenas alterar um número momentâneo.

**Adaptação concreta.** Criar eventos com condições a partir de fatos já registrados: posição jogada, dispensa, estreia, rivalidade, lesão/afastamento, promessa ou clube afetivo. Variar texto e opções conforme esse histórico. Toda consequência relevante deve deixar memória consultável (temporada, clube, adversário, evento e efeito), que possa alimentar eventos posteriores e o resumo biográfico.

**Limite e pilar.** Memórias emergem do futebol; não criar relacionamento social como minigame ou flag sem causa. Não codificar um destino fixo nem revelar o DNA oculto: o evento pode oferecer pistas observáveis, sem expor compatibilidade ou teto.

## Citizen Sleeper — arcos, progresso e expectativa

**Observação da fonte.** A página oficial PlayStation descreve um sistema inspirado em RPG de mesa com dados, “clocks” e drives: a cada ciclo, o jogador escolhe como usar seus recursos e tempo, construindo alianças, descobrindo verdades e moldando o futuro. A edição completa inclui três episódios que expandem personagens, lugares e uma trama de fim de jogo. [Citizen Sleeper — PlayStation](https://www.playstation.com/en-us/games/citizen-sleeper/); [press kit da editora Fellow Traveller](https://www.fellowtravellerpresskit.com/citizen-sleeper).

**Inferência para 1903.** Arcos paralelos com escalas de progresso distintas dão expectativa: algumas histórias avançam por oportunidades, outras por decisões ou passagem de temporadas. O jogador escolhe prioridades sob recursos limitados e percebe quando um arco está perto de mudar de estado.

**Adaptação concreta.** Representar no resumo da carreira poucos arcos narrativos compactos — formação/estreia, papel no clube, relação com torcida, mercado e vida após futebol — com marcos visíveis (aberto, em curso, perto de resolução, encerrado). Eventos e decisões alimentam os arcos; usar temporadas e marcos existentes como relógio, em vez de adicionar ações diárias. Ao encerrar um arco, registrar um fato biográfico e abrir consequências coerentes, não um final roteirizado.

**Limite e pilar.** Não copiar dados aleatórios ou urgência artificial ciclo a ciclo. Mobile exige leitura rápida e densidade controlada; carreira longa (12–40) precisa de compressão de períodos rotineiros e resolução em marcos, sem inflar contagem de turnos.

## Síntese para 1903

As referências sugerem quatro alavancas compatíveis: decisões com efeito compreensível e retorno próximo; expectativas esportivas que amadurecem; eventos que reconhecem e ampliam memórias; arcos paralelos com progresso e conclusão legíveis. Uma implementação deve reutilizar eventos, partidas, temporadas e estatísticas existentes, dando mais significado à sequência, em vez de acrescentar sistemas de treino, vida social ou animação. O eixo continua sendo agência sem onipotência, DNA oculto, mundo que lembra e carreira que cabe numa experiência mobile.
