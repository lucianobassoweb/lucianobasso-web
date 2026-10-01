# 1903 · Dez clubes · protótipo 01

Recorte rápido: três decisões de formação (12–18), três temporadas profissionais (18–21), 54 partidas internas e aproximadamente 16–22 decisões. O final encerra o experimento, não aposenta o jogador.

Abra `index.html` servido por HTTPS. É um arquivo único, sem dependências externas. Fonte modular neste diretório; `python3 build.py` regenera o HTML e `node test-engine.mjs` verifica o motor.

Save local exclusivo: `1903.prototype10.v1`. Não importa, migra ou substitui saves do jogo anterior. O save pertence ao navegador e domínio usados; trocar o endereço/domínio não sincroniza a carreira. Exportar preserva um JSON; importação e sincronização ainda não fazem parte deste recorte.

Dez nomes reais contextualizam uma liga fictícia: São Luiz, Brasil de Pelotas, Caxias, Ypiranga, Juventude, Ponte Preta, Vitória, Vasco, Grêmio e Flamengo. Forças, salários, concorrentes e calendário são parâmetros experimentais, sem pretensão de reproduzir a competição real.

## Hipótese

Uma decisão com efeitos em seis jogos, disputa por minutos e propostas condicionadas ao rendimento pode construir uma trajetória mais clara que uma sequência de dilemas isolados. Testar vontade de continuar, perdas coerentes e significado das mudanças de clube.

## O que acontece

- Formação focada, oito posições e DNA oculto; aprendizado adquirido determinado por prática e predisposições.
- Concorrente nominal na chegada. Habilidade efetiva, confiança e atuação recente afetam titularidade.
- Prioridade entre recuperação, desenvolvimento e trabalho coletivo; desgaste e custos por partida.
- Interesse → contato → proposta → aceite. Clube maior pode reduzir minutos. Nenhuma transferência automática.
- Um momento importante influencia a partida seguinte e guarda memória por clube.
- Histórico de temporadas, clubes, partidas e estatísticas pessoais.

## Limites deliberados

Não há vida fora do futebol. Posição inicial é fixa neste recorte; reconversão, aposentadoria, seleção, títulos, campeonatos completos e economia pessoal pertencem à evolução futura. A formação é comprimida em três etapas. Não há garantia de chegar ao clube dos sonhos.

## Verificação

100 carreiras nas oito posições: 54 partidas e três arquivos anuais por carreira, 16–22 escolhas, roundtrip/replay/contabilidade aprovados. Revisão independente final: 300 carreiras pareadas, 16.200 partidas, 4.804 verificações, oito corrupções rejeitadas sem mutação. Fluxo mobile do começo ao fim em 390 pixels e histórico/final em 320 pixels, sem overflow ou erros capturados.

Calibração permanece experimental: insistir em desenvolver/coletivo esgota o jogador; recuperar continuamente produziu mais gols na amostra. O ganho extra do treino ficou pequeno. Testes de integridade não comprovam diversão, superioridade a outros jogos ou duração em minutos. Precisamos de uma partida do usuário para decidir quais mecanismos merecem crescer.
