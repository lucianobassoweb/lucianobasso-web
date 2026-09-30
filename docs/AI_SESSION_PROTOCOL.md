# 1903 — AI SESSION PROTOCOL

## Ao iniciar uma sessão
1. Ler `docs/GAME_SPEC.md` por inteiro.
2. Ler as últimas decisões/experimentos de `PROJECT_LOG.md`.
3. Rodar `npm run typecheck` antes de editar.
4. Não assumir que uma mecânica descrita no spec já está implementada; conferir o código.

## Regras imutáveis sem decisão explícita do usuário
- Nome do projeto: **1903**.
- Mobile-first, vertical, sem animação de partida.
- Carreira começa aos 12 e deve caber aproximadamente em 4 horas.
- DNA é oculto e define caminhos/dificuldade, não um teto impeditivo de grandeza.
- Usuário escolhe posição dos 12 aos 18 e pode negociar reconversão depois; posição natural não é revelada.
- Explorar cedo custa pouco; posição errada e reconversão pesam progressivamente com a idade.
- Relações humanas emergem de eventos esportivos; não criar minigame social.
- Torcidas possuem memória própria: paixão, ódio, temor, respeito e expectativa.
- Valor de mercado, asking price e proposta são conceitos distintos.
- Estatísticas e memória histórica são parte da recompensa do jogo.

## Para qualquer mudança de balanceamento
Registrar no `PROJECT_LOG.md`:
- hipótese;
- fórmula/regra alterada;
- amostra de teste;
- métricas antes/depois;
- interpretação;
- decisão: manter / reverter / revisar.

## Testes mínimos antes de gerar build
```bash
npm run typecheck
npm run build
node dist/dev/simulate.js 200
node dist/dev/position-audit.js 100
```

Verificar pelo menos:
- nenhuma carreira trava antes da aposentadoria;
- todas as 8 posições continuam possíveis;
- caminho natural é muito melhor que pior posição deliberada;
- exploração 12–14 não destrói a carreira;
- mudanças aos 17–18 têm custo reconhecível;
- uma partida do protagonista por turno, com categoria e decisão; calendário do clube segue sem ele;
- mercado não gera transferências em todas as temporadas;
- saves não contêm `NaN`/`Infinity`.

## Referência atual
Publicado: hotfix 0.1.4. Revisão experimental: 0.3.0. Ler também `docs/CAREER_CASE_STUDIES.md` e `docs/COACH_SYSTEM.md`; consultar as últimas entradas do log.

Rodar `npm ci` antes da primeira verificação num ambiente novo. `npm test` inclui a validação comportamental de escola, dispensa, reconversão, função, saves legados e encerramento. As frequências não são taxas reais da população de atletas.

## Atualização aprovada — origem escolhida e interface (30/09/2026)

Esta decisão substitui a regra anterior de sorteio de cidade e clube do coração: o usuário escolhe cidade de nascimento, UF e clube do coração na criação. Família, condições sociais, infância e características continuam sorteadas. A residência aos 12 anos e a escolinha local usam a cidade escolhida. Não há ingresso automático no clube do coração. O campo cidade admite municípios fora das sugestões; os metadados incompletos dos clubes continuam limitando a precisão geográfica dos convites.

A UX prioriza evento e decisões: duas colunas no desktop, resumo e memória expansíveis no celular, navegação com nomes claros, textos legíveis, reações e contexto da partida expansíveis, confirmação visual da última escolha. Saves existentes mantêm suas origens.
