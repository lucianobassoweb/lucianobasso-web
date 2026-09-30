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