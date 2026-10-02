# 1903 — cinco riscos prioritários da base importada

Auditoria focal da 0.3.0 recebida, continuidade em 0.3.1. Os dois primeiros foram reproduzidos nesta sessão; os demais são lacunas verificadas nos documentos/tipos e precisam de desenvolvimento ou avaliação humana.

| Risco | Evidência | Estado/próxima ação |
|---|---|---|
| Persistência falha e corrupção quebra render ou é sobrescrita | persistence.ts original validava só version; store/clear sem captura. VM reproduziu quota e dados incompletos | Corrigido nesta revisão; migração original 0.1.4 conferida em cinco snapshots, cobertura não exaustiva |
| Cache apresenta interface antiga apesar de HTML atualizado | Recarga local manteve hints e chevron anteriores; root sw.js ainda era 0.3.0 | Cache por hash, ativação atualizada e limpeza com prefixo; validar também offline/Safari físico |
| Ritmo de quatro horas não comprovado | A0005 registra 401–909 turnos; decisões a cada partida substituíram compressão em blocos | Medir sessão humana e separar calendário de momentos antes de calibrar frequência |
| Histórico detalhado insuficiente para legado | SeasonStats/careerStats agregam números; MatchFeedback guarda só a última atuação. Não há ledger geral por adversário/estádio nos tipos | Persistir ledger compacto e derivar recortes sem inflar quota; não inventar dados de jogos antigos |
| Caminho profissional e repetição de escolhas dependem fortemente da política | Lote de 100 carreiras: 48 profissionais; seleção sub-20 e convites experimentais; repetição do caminho atual no fluxo móvel | Comparar políticas com sementes pareadas e revisar variedade; preservar DNA e possibilidade de evolução lendária |

A UI melhorou apresentação e proteção de dados. Este relatório não declara concluído o projeto nem validada a experiência completa de quatro horas.
