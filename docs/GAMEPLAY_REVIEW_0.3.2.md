# 1903 — 0.3.2 experimental: capítulos e consequências

## Pesquisa e aplicação

Descrições oficiais de New Star Soccer, Football Manager, Wildermyth e Citizen Sleeper foram estudadas; não houve playtest desses quatro jogos nesta sessão. Fatos e inferências separados em GAMEPLAY_CASE_STUDIES.md. A adaptação inicial reúne progresso curto, retorno da escolha e memória biográfica. Não implementa ainda promessas negociadas, arcos simultâneos de mercado/torcida ou eventos que retornam rivalidades específicas.

## O que mudou

- Formação: 3 participações/120 minutos. Profissional: 3 participações/150 minutos/2 notas >=6,8. Retorno após afastamento: 2 participações/45 minutos. Janela de até 8 rodadas, sem participação contabilizada no banco/lesão. As metas profissionais incluem goleiro; não dependem de gols.
- Um capítulo regular por temporada/clube/categoria; retorno tem seu próprio contexto. Conclusão, prazo ou mudança de etapa produzem resultado factual, inclusive parcial. Os 60 capítulos mais recentes aparecem em Histórico. Sem bônus ou promessa de vaga.
- Última escolha registra rótulo, explicação e efeitos antes da próxima simulação, inclusive quando abre diálogo/escola/reconsideração de proposta. Recarga conserva o recibo.
- Removidas escolha escolar adulta sem efeito e observação quando já saturada. Sustentar caminho atual estabelece intenção de permanecer; efeito imediato explicitado quando muda.
- Novos campos opcionais e validados; saves antigos começam a observar a partir da primeira ação, sem inventar fatos anteriores. Chave/schema anteriores preservados.

## Arquitetura e limites

Camada de observação determinística em src/core/stories.ts, sem novos draws RNG. Wrappers de advance/resolve capturam todas as saídas; delta de stats permite observar partida mesmo quando evento de mercado substitui o placar. Idempotência por careerTurn impede contagem duplicada. Narrativa não muda fórmulas de simulação ou DNA. O objetivo de 6,8 é um marco editorial, não taxa de sucesso real ou critério de promoção. Arquivo limitado não substitui ledger completo de partidas por adversário/estádio, ainda pendente.

## Verificação executada

- TypeScript estrito, npm test (quatro roteiros existentes, 18 grupos persistência e novo roteiro de histórias), standalone e checker de subagentes PASS.
- Teste de histórias: migração sem retrospectiva; formação real e regularidade de goleiro; prazo parcial; banco/lesão; retorno; recibos early-return; escolha inválida; validação de opcionais; idempotência.
- Diferencial contra build 0.3.1: 24 carreiras até aposentadoria, 31.632 operações, estados esportivos idênticos por operação sob as mesmas escolhas. 741 capítulos acumulados no lote. DNA/RNG/atributos/stats/coaching/vida/mercado iguais (excluídos só story/receipt/log). Não prova igualdade sob políticas que escolhem por índice aleatório quando a lista de opções muda.
- Gate 200 carreiras: 391–909 turnos, média 621,9; OVR18 médio56 e OVR30 médio71,1. Sem recalibração de fórmulas.
- Gate posições: 100 DNAs em quatro políticas. Oito posições presentes; OVR30 natural81,5/exploração78,8/piorposição63,9/trocatardia61,8. Estas políticas de auditoria consultam DNA para comparação, o usuário não.
- Navegador Codex em origem8766 isolada: save de teste antigo U15/GK migrou em ação, começando0sem retrospectiva; convite/transição, três partidas, progresso0→1→2→3 e 184min; conclusão e biografia; save/reload preservou recibo/payoff. Layout390px,320px e1440px sem overflow, avisos de save ou erros JS no fluxo. Capturas em outputs.
- Save real em8765 não foi avançado ou modificado pelos testes. Safari/iPhone físico, leitor de tela, offline físico, duração de quatro horas e melhora de diversão continuam sem validação humana.

## Próxima investigação

Testar se o objetivo melhora expectativa e se a consequência é compreensível sem abrir detalhes. A camada atual não resolve as decisões genéricas entre todas as partidas; a próxima mudança deve criar dilemas raros ligados a eventos reais (vaga, rival, promessa ou mercado), com consequências sustentadas pelo motor. Não aumentar turnos para fazer narrativa.
