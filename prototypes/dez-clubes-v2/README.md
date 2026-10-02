# 1903 · Brasil — Séries A–D · Protótipo08

Recorte independente: três etapas de formação12–18, sete temporadas profissionais18–24 e encerramento aos25. Cada temporada tem18 partidas internas, total126; cada decisão contextual resolve seis partidas. O ciclo combina rotina e intenção em três alternativas, com21 períodos e31 escolhas numa carreira com permanência. Formação representa dois anos por escolha, não uma sessão. Não é aposentadoria nem a carreira completa de quatro horas.

Abra index.html em HTTPS. HTML standalone, sem bibliotecas, servidor de aplicação ou banco externo. Build: `python3 build.py`; teste local: `python3 -m http.server`.

## Brasil e projetos

-156 participantes de2026:20A/20B/20C/96D. Identidades/UF/divisão/gruposD conferidos na CBF em02/10/2026; nomes disambiguados preservam os IDs antigos. Força, prestígio, salário, estrutura e elencos são parâmetros ficcionais.
- Todos podem ser clube dos sonhos, adversário ou destino elegível. Escolher sonho não concede contrato. Primeiro clube vem de três projetos interessados D/C/B; uma entrada forte pode receber A como terceiro projeto. Compare salário, estrutura, cobrança, concorrente e previsão inicial de minutos, sem vaga garantida.
- A/B/C: amostra de nove adversários da própria divisão, ida/volta. D: cinco adversários do grupo oficial e quatro de sua chave geográfica pareada, ida/volta. **18 jogos experimentais**, sem alegar o calendário oficial de dez rodadas da primeira faseD ou mata-mata/acesso/rebaixamento.
- Mercado considera nível, produção, necessidade e concorrência; no máximo dois contatos por janela e seis projetos observados internamente. Cadastro maior não oferece todos os clubes nem contratação automática. Projetos C/D também podem abrir reconstrução. Não há escada obrigatória entre divisões: uma promessa pode ir diretamente daD paraA. O clube pode apostar na evolução observada, oferecendo banco e entradas curtas inicialmente; ficar em projeto menor favorece minutos. Um jovem já pronto para o nível do concorrente disputa a vaga normalmente.

## Aprendizado e rotina

Estrutura melhora aquisição, mas prática, minutos, técnica/proficiência, especialização, físico e bem-estar participam. Felicidade e descanso maiores são favoráveis; stress menor é favorável. Cobrança não é stress e condição não é descanso. Treinar mais oferece128% da prática com mais carga; carga equilibrada86%; descansar50% e recuperar físico; preservar vida pessoal58% e recuperar emoções. A intenção em campo também consome energia: descanso fora do treino não anula esforço de jogo. Esses percentuais não são aumentos de skill. Rotina e intenção são escolhidas juntas para seis jogos; crescimento só aparece após resolvê-los. Sobrecarga/negligência podem reduzir habilidades, DNA permanece fixo sem cap de destino.

Finalização melhora alvo/conversão quando há chutes; função, intenção e abastecimento determinam acesso. Metas exigem contribuição observada. Torcida/treinador reagem diretamente; história guarda escolhas, aprendizado, temporadas e contatos.

## Tela de jogo

Cabeçalho fixo com idade, posição, clube, treino atual, estatísticas da temporada incluindo gols, bem-estar e seis habilidades coloridas com variação e intervalo explícito. Somente o conteúdo central rola: resultado factual do último período, contexto e cartões de decisão. Um cartão clicável por opção reúne ação, ganho, custo e meta.

Rodapé: Carreira, Partidas, Exportar e Recomeçar. Carreira mostra contrato, gráfico de OVR e tabela anual de jogos, gols, assistências, nota e overall; ano em andamento é parcial. Partidas conserva detalhes, reações completas, ações e memória. Na tela principal, contribuições boas são reconhecidas mesmo com meta parcial, sem marcar MET artificialmente.

## Desafio

Quatro estágios: integração, disputa, consolidação e referência. Metas usam oportunidade prevista, próximos adversários e até12 atuações qualificadas no clube atual, com limites para não crescerem indefinidamente. Falta de minutos não é tratada como mau rendimento nem gera crise adicional. Doze situações causais mudam as combinações oferecidas; não são doze frases sorteadas. A recuperação deve combinar redução do treino e intenção em campo compatível com menor esforço.

## Saves

Mesma chave1903.prototype10.v2/schema2. Campos opcionais promiseRevision1, marketRevision1, nationalRevision1 e careerEndAge25 identificam novos projetos e duração. Saves anteriores mantêm decisão pendente, calendário, perfis e fatos; adoção prospectiva em nova ENTRY/temporada; regras novas de mercado entram na próxima janela gerada. Contato/proposta já pendentes não são sorteados novamente. DONE antigo aos21 permanece fechado até clicar em “Continuar até os25anos”. A retomada usa uma cópia validada, conserva o passado e começa a temporada21; não inventa a janela20 que a versão antiga encerrou. Sem reescrever habilidade, estatística, DNA ou salário passado. Exportar antes de Recomeçar permite preservar a carreira. Não há importação de arquivos neste recorte.

Novos saves usam challengeRevision1. Saves sem esse marcador conservam o evento pendente e adotam o ciclo08 após resolvê-lo. DONE25 permanece fechado. Controle técnico explícito `{challenge:false}` conserva o ciclo antigo para comparação; não é opção de dificuldade na UI.

## Gates

Na raiz:

```sh
node prototypes/dez-clubes-v2/test-engine.mjs
node tests/dez-clubes-v2-agency.mjs
node tests/dez-clubes-v2-corrections.mjs
node tests/dez-clubes-v2-brazil.mjs
node tests/dez-clubes-v2-lower-divisions.mjs
node tests/dez-clubes-v2-wellbeing.mjs
node tests/dez-clubes-v2-ui.mjs
node tests/dez-clubes-v2-promises.mjs
node tests/dez-clubes-v2-challenge.mjs
node tests/dez-clubes-v2-challenge-review.mjs
node scripts/prototype-balance.mjs --output-dir ../../outputs/1903-equilibrio --baseline docs/balance/prototype07.json
python3 prototypes/dez-clubes-v2/build.py
```

Para comparar08 à experiência07.1, passe o relatório07.1 imutável em --baseline. --control-legacy mede o controle antigo. Rotinas solicitadas podem estar ausentes das combinações08; o monitor registra substituições. REVIEW exige causa e decisão no Log, não renomear o resultado para PASS.

Regras: docs/PROTOTYPE08_CHALLENGE.md, docs/PROTOTYPE07_1_PROMISES.md, docs/PROTOTYPE07_BRAZIL_CD.md e docs/PROTOTYPE06_WELLBEING.md. Equilíbrio: docs/BALANCE_TRACKING.md e PROJECT_LOG. Testes técnicos não comprovam diversão, números do futebol real ou Safari físico.
