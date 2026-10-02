# 1903 · protótipo 06 — bem-estar e custo da rotina

## Decisão

Felicidade, descanso físico e stress mental passam a influenciar desenvolvimento e atuação. Felicidade e descanso são melhores quando altos; stress é melhor quando baixo. Cobrança esportiva gera stress, mas continua sendo um estado diferente. O recorte permanece 12–21 anos, formação comprimida em três etapas de dois anos e 54 partidas profissionais.

Novas carreiras começam com felicidade 72 e stress 16. Descanso é `100 - fatigue`, sem duplicar o estado persistido. Condição representa prontidão/desgaste e continua separada. Nenhum efeito concede habilidade, vaga ou gol por estar feliz.

## Rotina com custo antes de cada bloco profissional

Uma escolha prepara seis partidas. Ela ajusta as reservas físicas e emocionais; o aprendizado só acontece na resolução do bloco. Os percentuais abaixo são multiplicadores da prática habitual, não porcentagens de aumento de habilidade.

| Rotina | Prática | Efeito inicial, limitado às reservas | Recuperação física por jogo | Custo principal |
|---|---:|---|---:|---|
| Treinar mais | 128% | Descanso −3, stress +3, felicidade −2 | 3,5 | Menos recuperação e mais carga física/mental |
| Priorizar descanso | 50% | Descanso até +10, stress até −8, felicidade até +2 | 7 | Menos prática no período |
| Preservar vida fora do futebol | 58% | Descanso até +5, stress até −12, felicidade até +7 | 4,5 | Menos prática e recuperação física inferior ao descanso |

Carga de partidas, intensidade, trabalho extra, resultados e disputa de vaga continuam agindo depois disso. Não há calendário de sessões individuais: faltar treino está representado pela redução de prática do período; a opção não elimina as seis partidas. O menu exibe os deltas realmente possíveis, sem prometer +10 quando o descanso já está em 100. O clique não avança rodada, skills, proficiência ou RNG. Repetir a escolha não permite acumular benefícios.

Na formação, “Equilibrar futebol, escola e lazer” reduz prática para 68%, abre mão da ênfase extra e favorece recuperação/felicidade. As prioridades técnicas, de leitura e físicas mantêm seus IDs e acrescentam custos de bem-estar. Cada uma representa dois anos. O protótipo não acrescenta notas escolares ou um sistema cognitivo de educação.

## Relação causal com desenvolvimento e atuação

- Aquisição emocional: `clamp(1 - max(0,65-felicidade)*0,005 - max(0,stress-30)*0,006, 0,35, 1)`. Faixas saudáveis preservam a eficiência anterior; mal-estar reduz aquisição, não o DNA.
- Na formação, fadiga acima 25 e condição abaixo 80 reduzem a aprendizagem física: `clamp(1 - max(0,fadiga-25)*0,006 - max(0,80-condição)*0,003, 0,45, 1)`. No adulto, o desconto físico anterior já existe e não é aplicado duas vezes.
- Execução: `max(0,65-felicidade)*0,07 + max(0,stress-20)*0,09`, até 11,75 pontos efetivos. Afeta nível efetivo/escalação e probabilidades de ações, junto de técnica, proficiência, físico, função e concorrência existentes. Não reduz o atributo adquirido imediatamente só por abrir o menu.
- Stress recebe a cobrança efetiva do projeto por jogo (`expectations*0,026`), incluindo crise e responsabilidade. Recuperação depende da rotina; stress acima 30 também dissipa gradualmente. Felicidade tem deriva moderada para evitar somas irreversíveis.
- Resultado ruim, banco, atuação fraca e meta perdida têm efeitos emocionais; vitórias, boas atuações e metas cumpridas também contam. Clube grande não é uma punição categórica: comparar cobrança real, salário, estrutura, concorrente e previsão de minutos. Aceitar maior cobrança pode exigir mais recuperação e sacrificar prática.

O ganho saudável de treinar mais supera descanso/lazer no mesmo bloco. Insistir na intensidade durante a carreira pode inverter esse saldo por sobrecarga e perda de oportunidades. Descansar não garante titularidade, contrato ou crescimento enquanto o jogador já está exausto. Não existe teto oculto de potencial.

## Compatibilidade

Mesma chave `1903.prototype10.v2`, schema 2. Campos opcionais `wellbeingRevision:1`, `happiness`, `mentalStress`, `routine`. FORMATION/PLAN antigos pendentes mantêm exatamente os efeitos apresentados e adotam bem-estar na próxima geração de evento compatível. Outros menus congelados continuam. Sem reescrever DNA, atributos, partidas, metas, contratos ou decisões. Valores ausentes aparecem como “—” até adoção prospectiva; renderização não grava defaults. DONE antigo permanece fechado.

Validação rejeita valores não finitos/fora da escala, rotinas fora do contexto, replay de escolha e inconsistência PLAN/ROUTINE. Limites de eventos aumentam apenas para acomodar as nove rotinas. A aplicação continua transacional sobre cópia validada.

## Evidência e aprovação de equilíbrio

Motor final SHA256 `556268622eea846e1d8b1311ad328e108a47e9f6af2e10354db28064e7deefdf`. Catálogo inalterado. QA: bem-estar 10/10, agência 14/14, correções 15/15, Brasil 7/7, suíte anterior 9/9 e UI 18/18. Pares com mesma seed/RNG distinguem técnica de estado emocional, prática saudável de sobrecarga e cobrança real do projeto. Fixtures legadas públicas e replay integral preservam fatos anteriores.

Monitor contra 05: REVIEW, zero bloqueios juvenis, zero avisos de referência por idade; 139 desvios P95 adultos, 135 na política de sobrecarga e quatro na de foco/recuperação. Maior diferença absoluta: 16,034 pontos. Aprovação explícita em D0048/A0030: manter o efeito adulto intencional e criar checkpoint 06, preservando 05. Não relaxar limiares nem declarar essa comparação PASS. Coorte original de formação segue separada das novas prioridades equilibradas.

Monitor 06: 16.384 caminhos de formação (6.912 originais comparáveis e 9.472 com prioridade equilibrada); 256 carreiras adultas/2.304 blocos. Aos 21, médias de foco/recuperação: OVR 55,055, descanso 73,342, felicidade 58,772, stress 27,073. Sobrecarga: OVR 39,117, descanso 26,4, felicidade 27,438, stress 97,525. Política de foco alterna rotina conforme estado; sobrecarga insiste em TRAIN/EXTRA/intensidade. Diferença mede trajetórias inteiras, não um único parâmetro isolado ou população real.

Validação mobile de carreira descartável em origem isolada: 12→21, nove rotinas, 54 jogos internos; Botafogo-SP, OVR 42→57, 47 participações/33 titularidades/2.816 minutos/22 gols/nota 7,1. Reload conserva estados e decisão. 390×844 e 320×740 sem overflow horizontal; captura e relatório em outputs. Não certifica Safari físico, diversão ou carreira completa de quatro horas.

Próximo playtest: se o custo de treinar aparece antes de virar uma espiral, se descanso/lazer têm diferenças percebidas e se comparar projetos altera a vontade de aceitar maior cobrança. A incidência de oferta ordinária falha ficou zero na coorte natural de 192 carreiras; teste separado prova possibilidade, não frequência. Não expandir duração para esconder essas pendências.
