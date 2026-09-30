# 1903 — orquestração por tarefa

Política autorizada pelo usuário em 30/09/2026 para reduzir tempo e desperdício de contexto. `AGENTS.md` é a instrução operacional; `.codex/config.toml` e `.codex/agents/` persistem defaults e papéis do projeto.

## Modelo e paralelismo

Luna atende busca e trabalho repetível; Sol 6.1 atende implementação e revisão técnica; Astra é reservado à escalada de problemas difíceis. Essa seleção segue a [orientação oficial por workload](https://developers.openai.com/api/docs/guides/deployment-checklist#choose-a-model-for-the-workload), mas a eficiência no 1903 precisa ser observada. Não há promessa de percentual de economia.

Até dois trabalhadores em paralelo, além do principal. Uma alteração simples e localizada deve ficar no principal. Trabalho com fontes diferentes, arquivos disjuntos ou revisão independente pode ser delegado. Tarefas dependentes seguem em sequência. Não abra agente apenas para repetir a leitura do principal.

O modelo do principal é o selecionado na conversa; os arquivos não trocam uma sessão ativa. Na ferramenta atual, o principal aplica o roteamento passando `model` e `reasoning_effort` explicitamente. O suporte a papéis/defaults da configuração depende do carregamento do projeto confiável em nova sessão, conforme a [referência de configuração](https://learn.chatgpt.com/docs/config-file/config-reference#configtoml). Não considerar um arquivo TOML como comprovação de que a sessão o carregou.

## Contrato de uma tarefa

Use um briefing curto, sem o histórico integral:

```text
Objetivo: um resultado verificável.
Base: branch/commit, versão e diretório absoluto.
Leia: AGENTS.md e documentos/trechos relevantes.
Entradas: caminhos e evidências já coletadas.
Escopo: arquivos permitidos; leitura ou edição.
Dono: quem pode escrever cada arquivo.
Restrições: compatibilidade de save, decisões vigentes e limites.
Aceitação: comportamento e verificação necessários.
Retorno: até 400 palavras; resultado, evidência, mudanças, testes, pendência.
Artefato: caminho exclusivo para detalhes extensos.
Não criar outros agentes; não publicar nem alterar branches.
```

Use `fork_turns="none"` para enviar somente o briefing, especialmente ao escolher modelo explicitamente. Reutilize trabalhadores que tenham contexto pertinente. Um trabalhador não recebe a mesma tarefa em dois modelos simultaneamente; faça escalada somente quando houver insuficiência concreta.

## Fluxo de integração

1. Principal define objetivo, risco e arquivos; consulta dados já disponíveis.
2. Despacha somente subtarefas independentes e nomeia donos.
3. Trabalha no que não depende dos retornos. Recebe mensagens compactas e espera sem polling frequente.
4. Confere evidências/diffs. Luna pode pedir escalada se a causa exigir interpretação complexa; principal decide Sol ou Astra.
5. Integra em sequência. Apenas o principal altera log e gera standalone.
6. Executa o conjunto necessário de gates. Gameplay segue o protocolo do jogo; configuração/documentação não exige recalibrar centenas de carreiras.
7. Registra resultado, latência, retrabalho e pendências; encerra a rodada.

## Medição e limites

`docs/orchestration/runs.jsonl` guarda rodadas. Campos: `run_id`, `task`, `model_requested`, `model_confirmed`, `started_at`, `completed_at`, `scope`, `status`, `artifact`, `tests`, `rework`, `input_tokens`, `output_tokens`, `cost`. Campos de uso/custo são `null` quando o runtime não os expõe. Modelo confirmado só é preenchido com retorno explícito; aceitação do pedido pode ser registrada separadamente, sem inferir a identidade interna.

Métricas úteis: tempo até entrega aprovada, primeira verificação aprovada, arquivos conflitantes, tentativas refeitas e uso/custo quando disponíveis. Paralelismo melhora latência apenas quando as tarefas são independentes; pode aumentar tokens se a decomposição ou o contexto forem ruins. Sem baseline comparável, relatar somente medidas absolutas.

## Limites de escopo compartilhado

Código gerado, lockfile, log, configuração e estado do navegador têm um dono por rodada. Verificação que escreve JSONs ou screenshots deve declarar os caminhos. Não redefinir uma carreira no navegador compartilhado sem definir uma sessão de teste. Trabalhador que recebe arquivo fora do escopo devolve evidência ao principal. Publicação e merge passam pelo principal dentro da autorização vigente do usuário.

## Piloto inicial

Dois agentes: Luna verifica a estrutura/configuração e o contrato de delegação; Sol 6.1 audita o risco de persistência na base 0.3.0 em leitura apenas. Astra não é necessário para esse piloto. Resultados e eventuais limites são registrados após a execução.


## Resultado do piloto de 30/09/2026

Luna concluiu verificação de configuração e uma crítica estática delimitada da UI. Sol 6.1 concluiu auditoria de persistência, reproduziu três defeitos e foi reutilizado para a correção em arquivos exclusivos. A implementação herdou esforço high do auditor, uma exceção para preservar o contexto da investigação; novos trabalhos rotineiros usam medium. Principal integrou UI, configuração, log e bundle. Nenhum conflito de escrita e nenhum agente recursivo.

Configuração e ponte validadas pelo parser TOML e checker: cinco papéis, até dois trabalhadores. A aceitação dos pedidos de modelo foi observada, mas o runtime não forneceu identidade interna, tokens, custo ou duração completa das tarefas. Esses campos ficam null no diário; não há percentual de economia demonstrado. Não foi necessário Astra.
