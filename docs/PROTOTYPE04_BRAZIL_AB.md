# ADR — expansão do protótipo 04 para o Brasil A/B

Status: aceita e implementada. Data: 01/10/2026.

## Contexto e decisão

O usuário pediu toda a primeira e a segunda divisão do Brasil após a entrega do protótipo 03. Incluímos os 40 participantes de 2026, com cadastro desacoplado em `prototypes/dez-clubes-v2/clubs.mjs`. O motor mantém o recorte rápido, a lógica causal corrigida, os 54 jogos internos e a rota HTML única. Não há plantéis reais nem escudos.

Série A e Série B são metadados reais de referência da temporada 2026; os níveis/prestígios/contratos são parâmetros experimentais. Fonte A: [CBF — participantes](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026). Fonte B: [CBF — tabela básica 2026, primeira rodada identifica os 20 clubes](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Basica_Brasileiro_Serie_B_2026_efe6ba77b5.pdf). Conferência em 01/10/2026.

## Opções e consequências

- Incorporar quarenta nomes numa liga única permitiria confrontos nacionais incoerentes e inflação de contatos. Escolhemos calendários por divisão e lista de observação limitada antes do teste de interesse.
- Simular integralmente 38 rodadas, tabela coletiva, acesso/rebaixamento e playoffs exigiria ampliar o ritmo e os critérios de temporada. Esta entrega adiciona os clubes ao recorte existente: nove adversários diferentes por temporada, ida/volta, amostra que varia entre os 19 possíveis da divisão. A UI diz calendário resumido.
- O catálogo tem 44 registros para resolver os quatro projetos regionais antigos. Os 40 nacionais aparecem no sonho e na consulta por divisão; regionais ficam no arquivo legado/circuito de transição. Não renomear IDs nem reescrever estatísticas para fingir que um clube regional estava na Série B.
- Mantidos níveis e prestígios dos dez IDs existentes para compatibilidade. Novas carreiras começam em três projetos modestos da Série B; clubes maiores exigem mercado e disputa por vaga, sem acesso por selecionar sonho.
- Campos opcionais calendarRevision/scheduleDivision validam o calendário novo. Saves sem eles conservam toda a temporada corrente e adotam somente no próximo calendário. Fatos históricos, meta pendente e escolhas resolvidas não são alterados.
- Mercado pondera até seis clubes elegíveis, sem preferência fixa pela primeira posição do cadastro; necessidade, observação, encaixe e concorrência ainda podem resultar em janela silenciosa ou contato sem proposta.

## Build e manutenção

build.py incorpora cadastro→motor→interface no HTML standalone. Para atualizar nomes/divisões, alterar o catálogo e conferir identidades/contagens/testes de calendário. Chave/schema2 iguais, nenhuma gravação em save real nos testes. Expansão não muda DNA, fórmula de crescimento ou simulação de posse; modifica o ambiente competitivo e os destinos possíveis.

## Verificação

Evidências e resultados da rodada são registrados em PROJECT_LOG.md e no relatório externo 1903_BRASIL_AB_VALIDACAO.md. Gates: cadastro40, calendários A/B/regional, fluxo oito posições, mercado, negativos, oito snapshots legados, regressões causais e UI mobile. Testes confirmam execução e contabilidade; não confirmam diversão nem equivalência com futebol real.
