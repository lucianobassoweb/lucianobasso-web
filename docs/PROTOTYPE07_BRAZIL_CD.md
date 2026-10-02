# 1903 — Brasil A–D e recorte até25

## Pedido e decisões

Adicionar todas as Séries C/D de2026 ao protótipo. Durante integração, usuário ampliou o recorte para25anos. Preservar formação12→14→16→18 e ritmo de seis partidas por plano; profissional18–24, sete anos/126partidas internas/21metas. Encerramento é fim do recorte, não aposentadoria. Não simular acesso/rebaixamento, renovar salários ou corrigir outras mecânicas nesta extensão.

## Cadastro e fontes

20A+20B+20C+96D=156 clubes. A CBF fornece identidades/UF/divisões e16gruposD com seis participantes. Fontes oficiais:

- [Série A](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026).
- [Tabela B](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Basica_Brasileiro_Serie_B_2026_efe6ba77b5.pdf).
- [Tabela C](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Basica_Brasileiro_Serie_C_2026_feac51f2a9.pdf).
- [Grupos D](https://www.cbf.com.br/futebol-brasileiro/noticias/selecao-masculina/selecao-escalada-para-pegar-os-eua/cbf-divulga-grupos-da-serie-d-de-2026).

Conferido02/10/2026. São Luiz/Brasil de Pelotas entramD, Caxias/YpirangaC mantendoIDs e parâmetros antigos. Homônimos distinguidos porUF: América/Operário/Portuguesa/SampaioCorrêa/Botafogo/Vitória. Nenhum clube duplicado para preservar legado. Dados numéricos e cores são de jogo; não rankings, finanças, cargos ou uniformes oficiais.

## Entrada, mercado e desenvolvimento

Três convites limitados: D/C/B, com A substituindoB quandoOVR>=50. Não concede qualquer clube escolhido pelo usuário. B conserva seleção seedindex dos três projetos modestos anteriores para comparar coorte. Um projeto tradicionalD pode ter mais estrutura/prestígio que umB modesto; diferenças são individuais, sem garantia universal por divisão. Fonte de parâmetros continua desacoplada do motor emclubs.mjs.

national() reconheceA–D. Mercado usa catálogo completo apenas em regras novas; candidatos limitados a seis observados e dois contatos. Um convite de divisão superior não garante proposta nem titularidade. Reconstrução pode abrirC/D/B; não é transferência automática. Salário/estrutura/cobrança/rival/previsão aceitos são os consumidos pelo motor.

Não houve multiplicador novo de habilidades: estrutura, prática, minutos, DNA, retornos decrescentes, sobrecarga e bem-estar06 permanecem. Divisão menor pode compensar estrutura com oportunidade, mas mais minutos também geram fadiga. Expansão altera projetos disponíveis e stream futuro de mercado, portanto trajetórias/RNG não são idênticos após adoção.

## Calendário resumido

A/B/C: amostra de nove pares da mesma divisão,18jogos por temporada. C permite qualquer dos19adversários por rotação de seed/ano. D: cinco colegas do grupo oficial e quatro amostrados da chave pareada(A1/A2, A3/A4 etc.), duas partidas por adversário. scheduleGroup guarda grupo real; UI declara “18 jogos experimentais”. Região é aproximação pelo agrupamento daCBF, não cálculo de quilômetros. Não chamar esse circuito de regulamento oficialD: primeira fase real tem dezjogos e mata-mata.

## Compatibilidade e duração

Mesma chave/schema2. nationalRevision1 e scheduleNationalRevision1 marcam catálogo/calendário novo; scheduleGroup sóD. Ausência usa catálogo/order/resolver congelados06, incluindo circuitoTRANSITION e perfisREGIONAL. PendingENTRY/PLAN/CONTACT/OFFER preservados; adoção em novaENTRY gerada ou próxima temporada. Perfis congelados antigos continuam válidos depois da adoção, sem substituir salário/rival ou inventar passado.

careerEndAge25 nas novas carreiras. Ausência preserva o encerramento21 das antigas até uma transição segura. DONE21 permanece fechado, sem reabertura automática; formação/temporadas novas podem adotar duração25. O botão “Continuar até os25anos” chama extendCareer sobre cópia validada: preserva os prefixos factuais e reutiliza o serial pendenteDONE, sem criar decisão fictícia. Começa21 e completa126partidas. Novas carreiras têm seis janelas18–23; retomadas deDONE antigo têm cinco, preservando a ausência histórica da janela20. Limites de validação seguem o alvo registrado, mantendo seis jogos/bloco e18/ano. Históricos de sete anos e janelas anteriores devem continuar acessíveis. Calendário oficial permanece fixado em2026 durante o recorte; não inventar participantes futuros.

## Acompanhamento

Monitor conserva originais de formação e políticasB separadas. Novas coortesC/D e anos21–24 não são misturados aos quantis históricos. Comparação adulta por temporada/período, não pelo rótulo DONE21 da versão06. Formação continua por idade real. Checkpoint07 aprovado por D0050/A0032 com causas/métricas; baseline06 permanece imutável. Gains são pontos por dois anos/seis partidas.

QA63grupos +UI21grupos PASS; testes de retomada eUI no motor final22492627. Comparação06 REVIEW54driftsadultos/0juvenis/0bloqueios, mantida por decisão causal no Log; checkpoint07 criado exclusivamente e repetidoPASS0alertas. Browsermobile até25 com histórico sete anos, contratosD→A, recarga,390/320 semoverflow ou erroscapturados. Não certifica Safari físico. Evidência no PROJECT_LOG D0050/A0032 e relatório de entrega. Playtest humano continua necessário para avaliar oportunidades, custo percebido e vontade de continuar sete anos.
