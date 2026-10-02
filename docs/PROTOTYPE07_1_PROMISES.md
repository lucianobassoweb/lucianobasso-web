# 1903 — decisão, evolução e promessa · 07.1

## Superfície de jogo

O viewport contém três áreas: cabeçalho fixo, conteúdo central com rolagem própria e rodapé fixo. Cabeçalho reúne identidade/idade/posição/clube, nível contratado de treino, gols e demais números da temporada, produção do último bloco, bem-estar e seis habilidades com cores e variações. Rodapé mantém opções numeradas e navegação para evolução/exportação/recomeço. Cada opção tem a mesma numeração no contexto central, com ganhos e custos; há apenas um botão de execução por opção.

O último clique aparece no começo do conteúdo central. Se houve simulação, mostra participações, minutos, gols, assistências e reações resumidas de treinador/torcida, derivadas de partidas reais. Outros cliques distinguem rotina, formação e assinatura; não atribuir partidas antigas ao novo contrato. Reações completas, metas e partidas continuam disponíveis por rolagem, sem disclosure obrigatório. Somente memória extensa e diretório mantêm details.

Evolução: gráfico de overall adquirido e tabela anual com jogos, gols, assistências, nota e overall. Dados vêm de yearStats/progression; temporada em andamento usa seasonStats e é parcial, inclusive quando todos os jogos foram no banco. Ausência histórica aparece como travessão. A renderização não usa RNG, não grava nem modifica o save. Fonte nativa, títulos contidos, cores acompanhadas de números, toques de pelo menos44px e safe areas.

## Mercado por desempenho

A não era inexistente no mercado anterior: um export diagnosticado tinha dois clubesA entre seis observados, porém só um contatoC. O problema técnico era reduzir a produção a um booleano, além de omitir G/A de um meia na produção do papel. O diagnóstico privado foi reproduzido exatamente; não foi publicado nem virou fixture.

marketEvidence usa temporada qualificada (≥35min): confiança = min(1,minutos/900), nota ponderada pelos minutos ajustada por força média dos adversários (−0,3 a+0,5), taxa de boas atuações, produção do papel contra metas históricas normalizadas por minutos e G/A de todos os jogadores de linha. GK usa defesas/intervenções.

Bônus = confiança × clamp(8×(nota ajustada−6,8) +4×(taxa boas−0,4) +2×clamp(razão papel−1,0,1) +3×clamp(GA/90−0,3,0,1),0,12). Score inclui OVR e reputação limitada a6. Projetos de nível igual/maior ganham peso1+0,18×bônus; inferiores multiplicam max(0,08,1−0,07×bônus). Permanecem seis observados, até dois contatos, necessidade/concorrência e possibilidade de silêncio/fracasso. Bom ano não garante contratoA.

## Aposta em promessa

Não existe escada obrigatóriaD→C→B→A. observedPromise observa idade18–21, ≥6 aparições35min,450min, nota ponderada≥7, quatro boas, crescimento adultoOVR≥3 e último período positivo. Permite observarA atéOVR+25; PROSPECT somente com gap concorrente−OVR≥8. Peso×0,5, chance de interesse≤16% e fechamento≤48%. Juventude perto da prontidão continuaREADY, sem penalidade universal.

participation é compartilhada entre previsão e partida. Prontidão = clamp((nível efetivo−rival+12)/12,0,1). Integração = clamp(prontidão+0,65×prova,0,1). Prova acumula partidas reais no projeto: ≥35min, entradas≥10min/nota≥7 ou feito excepcional; min(1,minutos/600)×min(1,boas/4). Prontidão negativa não pode apagar mérito e janelas curtas não eliminam a prova de um reserva.

De integração0→1: chance-base de titular×0,3→1 (piso5%); entrada jogador de linha0,28→0,74; cameo6–16→14–34min. GK entrada0,015→0,04 e contingência15–60min. Integração1 devolve regraREADY; prontidão plena não é garantida. Previsão média inclui banco; condições iniciais ficam congeladas e previsão atual do vínculo acompanha desempenho. Salário, aprendizado global, infância, bem-estar e duração não ganham novas fórmulas.

## Compatibilidade e limites

Mesma chave/schema2. promiseRevision1/marketRevision1 opcionais; adoção em novas ENTRY/janelas de mercado. INTEREST/CONTACT/OFFER já pendentes não são sorteados novamente. Último PLAN antigo mantém partidas, mas a janela futura adota a regra nova. Contexto e perfilPROSPECT exigem classificação compatível; corrupção é rejeitada antes de mutação. DONE/contratos/fatos passados preservados.

Recorte até25, calendário experimental, sem empréstimos ou titularidade prometida. Metas ainda podem falhar por pouca oportunidade. Validação técnica e quantis não certificam diversão, Safari físico ou números do futebol real. PROJECT_LOG D0051/A0033 e relatório da entrega registram amostras, hashes, resultado de monitor e decisão sobre alertas.
