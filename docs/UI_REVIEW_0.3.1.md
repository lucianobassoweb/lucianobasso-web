# 1903 — revisão UI/UX 0.3.1

## Base e objetivo

Base importada: 0.3.0, commit aa17bef. Revisão local de 30/09/2026. Skills usadas: design:design-critique e frontend-design. Já instaladas; nenhuma dependência ou fonte externa adicional necessária. Preservar standalone/offline e a carreira do usuário.

## Problemas e decisões

| Problema observado | Alteração | Verificação |
|---|---|---|
| Navegação móvel sem pista visual, rótulo de mercado em duas linhas | SVGs embutidos, rótulos curtos e nomes acessíveis completos | Quatro abas; alvos de 60 px |
| Placar mostrava só o adversário e repetia número no título | Quadro com nome dos dois times e placar central; nota e métricas alinhadas | Partida juvenil e goleiro com quatro métricas |
| Painel de atuação alongava o caminho até a decisão | Espaçamentos móveis menores; contexto e reações expansíveis | Primeira escolha aparece na área útil após foco do evento; algumas escolhas ainda exigem rolagem |
| Orientações desapareciam no celular | Lista inicial compacta visível | Tela de criação em viewport móvel |
| Títulos visuais eram divs; intenção de mercado não anunciava seleção | Cabeçalhos h3 e aria-pressed | DOM/AX e alteração de intenção |
| Falhas de save podiam parar handler ou iniciar carreira sobre corrupção | Recuperação dedicada; bytes originais protegidos; aviso, retry e exportação | 18 grupos Node/VM; fixture de UI com armazenamento exclusivamente em memória |
| Recarga reapresentou uma build antiga no teste | Cache identificado por hash do standalone; instalação/ativação e limpeza restrita ao cache correspondente | Bug reproduzido; versão final confirmada depois da atualização |

## Direção visual

Fundo azul profundo, texto marfim e acento dourado. Títulos editoriais em Georgia, marca compacta em Impact e leitura em fontes locais do sistema. Números tabulares, bordas discretas e escolhas com seta decorativa sem anúncio extra. Sem downloads nem chamadas de fontes externas.

## Evidência desta sessão

- Formulário obrigatório; criação, introdução, posição, escola e primeira atuação.
- 24 transições adicionais móveis: nenhum overflow, aviso de save ou erro JavaScript. Recarga manteve carreira.
- Quatro abas em 390 px; carreira e mercado em 320 px; carreira em 1440×960. Nenhum overflow nas telas observadas. Resumo recolhido no celular e aberto no desktop após render.
- Falha de quota na fixture: carreira permanece na tela, aviso e exportação disponíveis. Corrupção estrutural: criação indisponível, um único botão de download do original.
- `npm test`: quatro roteiros do motor e 18 grupos de persistência PASS. Build TypeScript e standalone PASS.
- Configuração de agentes validada; Luna criticou UI e Sol auditou/corrigiu persistência. Integração e navegador pelo principal.

Capturas locais de celular e desktop ficam nos outputs da sessão, junto do HTML 0.3.1. A fixture `tests/persistence-ui.html` pode reproduzir visualmente os cenários de falha após gerar o bundle.

## Limites

Navegador do Codex nesta máquina; sem prova em Safari/iPhone físico ou com leitor de tela real. Não é certificação completa de acessibilidade. Nenhuma fórmula de evolução/partidas mudou. O alvo de quatro horas e a qualidade das decisões por toda a carreira exigem sessão humana. Recuperação preserva os bytes e permite download; reparo/importação manual não foi implementado.
