# 1903 · Brasil — Séries A e B · Protótipo 05.1

Recorte independente: três etapas entre 12–18 anos e três temporadas profissionais, 54 partidas internas, encerramento aos 21. Não é aposentadoria nem a carreira completa planejada. A revisão 05 mantém os 40 participantes A/B de 2026 e acrescenta escolha do primeiro contrato, ganhos/custos, projetos esportivos comparáveis, progressão calibrada e acesso às finalizações.

Abra `index.html` em HTTPS. É standalone: sem servidor de aplicação, bibliotecas ou banco externo. Localmente: `python3 build.py`, depois `python3 -m http.server`.

## Brasil A/B

- Cadastro independente em `clubs.mjs`: 20 clubes da Série A e 20 da Série B; identidades e divisões conferidas na CBF em 01/10/2026. Força, prestígio, salário, jogadores e resultados são parâmetros ficcionais do jogo.
- Todos os 40 podem ser escolhidos como clube dos sonhos e entrar no mercado quando nível, observação, encaixe e necessidade permitirem. Ao terminar a formação, novas carreiras escolhem entre três projetos interessados: um B modesto, um B com mais estrutura e outro mais exigente. Uma opção A requer nível suficiente. O clube não é atribuído antes da escolha; o sonho não concede acesso direto ao destino.
- Calendário resumido: nove adversários da própria divisão, duas partidas por adversário, 18 por temporada. A amostra gira pelos 19 possíveis com semente/ano. Não reproduz as 38 rodadas, acesso, rebaixamento ou playoffs do campeonato oficial.
- Mercado examina uma lista de até seis candidatos elegíveis por janela antes dos testes de demanda e encaixe; continua podendo ficar sem contato e terminar negociações sem proposta. Incluir clubes não torna contratação automática.
- São Luiz, Brasil de Pelotas, Caxias e Ypiranga são mantidos como projetos regionais de saves anteriores. Ficam fora dos 40 A/B; seu circuito de transição é identificado separadamente.

Fontes: [clubes da Série A](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026) e [tabela básica da Série B](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Basica_Brasileiro_Serie_B_2026_efe6ba77b5.pdf).

## Escolhas e consequências

- Confiança pessoal influencia a execução sob pressão; confiança do treinador e forma recente influenciam a disputa por vaga.
- Metas de novas carreiras acompanham o papel escolhido: finalização, criação, controle, proteção, antecipação, pressão ou apoio. O menu apresenta a produção exigida antes da escolha.
- Pressionar, antecipar e avançar cobram mais físico/fadiga. Recuperação regular é automática; intensidade contínua pode ultrapassar essa recuperação. A carga reduz execução e eficiência de aprendizagem.
- Formação usa retornos decrescentes na escala adulta; os três avanços representam etapas aos 12, 14 e 16 anos, não ganhos instantâneos de uma semana. Crescimento adulto depende de prática, minutos, foco, estrutura do clube e predisposição fixa. Sobrecarga ou negligência podem reduzir habilidades adquiridas; não há teto oculto de destino. O concorrente também acumula experiência e forma.
- Cada decisão nova mostra ganhos e custos. Atacar abre mais desmarques/chutes e reduz cobertura com maior carga; conectar/criar favorece passe e sacrifica finalização própria. Trabalho extra exige condição, estudo troca prática principal por leitura, cooperação reduz protagonismo.
- Finalização não cria oportunidade sozinha: ataques do time com o jogador em campo → acesso ao chute por função, intenção, movimento e apoio → alvo → gol contra a defesa. Chutes, alvo e produção são observáveis.
- Contratos iniciais e propostas apresentam salário mensal ficcional, estrutura de treino, concorrente, pressão, chance inicial de titularidade e faixa de minutos por partida. A previsão usa a fórmula da escalação; não promete vaga nem minutos futuros. Perfil aceito determina a concorrência e a estrutura usadas pelo motor.
- Feitos excepcionais em entradas curtas recebem reconhecimento. Uma entrada curta continua sem representar uma partida completa para consistência.
- Goleiros têm substituição por contingência pouco frequente; defesas e gols sofridos consideram seu tempo em campo. Construção, antecipação e proteção têm efeitos próprios.
- Falhar na meta aumenta a exigência emocional do projeto. Recuperação pode reabrir com intervalo de dois períodos ou mudança de clube; não compra a vaga. O teste decisivo é oferecido mesmo quando a recuperação ocupa sua janela inicial.
- Mercado avalia amostra, produção, necessidade, encaixe e concorrência. Pode não haver contato, e contato pode terminar sem oferta. Projetos modestos podem abrir avaliação para reconstrução.
- Treinador e torcida avaliam o período e cada partida; respostas aparecem sem clique. Memória mantém acontecimentos recentes e o arquivo acessível.

## Saves

Mesma chave `1903.prototype10.v2` e schema 2. Campo opcional `mechanicsRevision: 1` marca formação/calibração/projetos novos. FORMATION e PLAN legados conservam a escolha pendente e a calibração antiga até a próxima meta nova. Habilidades já adquiridas não são reduzidas retroativamente. DONE permanece fechado; para experimentar a nova formação e a escolha inicial, exporte e use Recomeçar. Contexto de um vínculo antigo não inventa salário passado; um novo acordo prospectivo pode ser registrado no começo de temporada. Novas janelas guardam contatos factuais em `marketHistory`; nenhuma oferta antiga é reconstruída.

 Novas regras de metas/formação identificadas por `rulesRevision: 1`. Saves da build 02 continuam: partidas, metas concluídas, decisões e evolução passadas não são reescritas. Metas legadas conservam seus critérios; próximas metas podem usar as regras novas. Campo opcional `calendarRevision: 1` identifica adversários da mesma divisão. Saves anteriores conservam o calendário atual; adotam o novo modelo ao gerar o próximo, sem editar partidas ou metas passadas. Os dez IDs originais e seus níveis continuam reconhecidos. O protótipo 01 e a carreira principal permanecem independentes. Não há importação de exports neste recorte.

Escolhas são aplicadas sobre uma cópia validada e só então confirmadas. Arquivos inválidos são preservados para recuperação; quota insuficiente gera aviso e permite exportar o estado em memória. Exportação e recomeço disponíveis.

## Verificação reproduzível

Na raiz do repositório:

```sh
node prototypes/dez-clubes-v2/test-engine.mjs
node tests/dez-clubes-v2-corrections.mjs
node tests/dez-clubes-v2-ui.mjs
node tests/dez-clubes-v2-brazil.mjs
node tests/dez-clubes-v2-agency.mjs
python3 prototypes/dez-clubes-v2/build.py
```

Nomes e divisões dos 40 clubes de 2026 contextualizam competições resumidas. Forças, calendário, salários, concorrentes e curvas são parâmetros experimentais. Não há garantia de contrato, OVR 70 ou chegada ao clube dos sonhos. Testes técnicos não demonstram diversão nem calibração com futebol real.

## 05.1 — tempo de formação e acompanhamento

A UI mostra o intervalo dos ganhos junto das habilidades e do plano seguinte: dois anos na formação, seis partidas nos blocos profissionais. Histórico e resposta de formação também indicam o intervalo. Valores, motor, regras e saves não mudam nesta revisão visual.

Antes de alterar progressão, executar na raiz:

```sh
node scripts/prototype-balance.mjs --output-dir ../../outputs/1903-equilibrio --baseline docs/balance/prototype05.json
```

Protocolo, referências de idade, métricas e limitações em `docs/BALANCE_TRACKING.md`; checkpoint e decisão no PROJECT_LOG D0047/A0029. O monitor emite PASS/REVIEW/BLOCKED e mede ganhos por intervalo; não lê saves privados nem impõe cap de potencial.
