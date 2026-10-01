# 1903 — execução e subagentes

## Referência e leitura

Leia `docs/GAME_SPEC.md`, as últimas decisões de `PROJECT_LOG.md` e `docs/AI_SESSION_PROTOCOL.md` antes de alterar o jogo. A base é 0.3.9 experimental (motor da 0.3.0); D0021/D0022 substituem partidas em blocos e origem sorteada. Fonte em `src/`; `index.html` é gerado. Saves legados precisam de compatibilidade. O log é append-only.

## Autorização e roteamento

O usuário autorizou o agente principal a delegar subtarefas e escolher o modelo por atividade. Aplique as regras abaixo em cada rodada de trabalho; tarefas pequenas continuam com o principal quando delegar acrescentaria overhead.

| Papel | Modelo | Esforço | Uso |
|---|---|---|---|
| Explorador | `gpt-6-luna` | low | Localizar arquivos, mapear usos, extrair evidências delimitadas |
| Verificador | `gpt-6-luna` | medium | Executar gates conhecidos, reproduzir fluxos e classificar resultados |
| Implementador | `gpt-6.1-sol` | medium | Corrigir/implementar um comportamento com escopo e aceitação claros |
| Revisor | `gpt-6.1-sol` | high | Saves, transições, contabilidade de stats e revisão independente |
| Especialista | `gpt-6-astra` | high | Causa ambígua ou decisão difícil que persiste após investigação concreta |

O principal mantém o modelo selecionado na conversa e controla escopo, integração, log, build final e comunicação. Não pode trocar seu próprio modelo com `spawn_agent`. A configuração recomenda Sol para trabalho técnico; o modelo principal continua sendo escolha da sessão.

## Despacho e economia

- Até dois trabalhadores simultâneos; reutilize um trabalhador disponível quando o escopo e o modelo continuarem adequados.
- Antes de abrir agente, confirme independência do trabalho e necessidade real de paralelismo ou revisão.
- Com seleção explícita de modelo, use `fork_turns="none"`; passe objetivo, base, arquivos, restrições, dono dos arquivos, aceitação e formato do retorno. Não copie a conversa inteira.
- Um dono por arquivo. Para revisão, leitura apenas. O principal edita `PROJECT_LOG.md`, arquivos de orquestração e build standalone. Cada trabalhador declara arquivos permitidos antes de editar.
- Subagentes não criam outros agentes, não publicam nem alteram branches e não apagam mudanças de colegas. Escalada e integração ficam com o principal.
- Retorno de até 400 palavras: resultado, evidência com arquivo/linha, arquivos alterados, testes efetivamente executados, pendência. Detalhes extensos vão para o artefato atribuído.
- Não reexecute pesquisa, leitura ou teste já suficiente; amplie a verificação apenas diante de novo risco, mudança ou gate obrigatório. Saídas de comandos devem ser resumidas.
- Se o modelo solicitado não estiver disponível, informe e use fallback permitido: Luna→Sol disponível; Sol 6.1→Sol 6; Astra indisponível→principal/Sol com a limitação declarada. Nunca trate indisponibilidade como trabalho concluído.

## Integração e evidência

O principal confere diffs e evidências, resolve dependências em sequência, executa os gates adequados uma vez após integrar e atualiza o log. Revisão adicional somente para risco concreto, por exemplo migração ou mudança do motor. Não terceirize validação a uma conclusão sem evidência.

Registre a rodada em `docs/orchestration/runs.jsonl`: tarefa, modelo solicitado/confirmado, horário, escopo, resultado, artefato, retrabalho, testes. Uso de tokens e custo ficam `null` quando não expostos pelo runtime; não estime economia em porcentagem. Compare latência e qualidade entre tarefas semelhantes antes de mudar o roteamento.

Veja `docs/ORCHESTRATION.md` para briefing e política detalhada.
