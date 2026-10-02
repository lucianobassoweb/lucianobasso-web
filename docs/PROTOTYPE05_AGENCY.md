# Protótipo 05 — escolhas, clubes e progressão

## Problemas reproduzidos

A revisão 04 concedia ganhos juvenis de 15 ou 20 pontos multiplicados pelo DNA e sem retornos decrescentes suficientes. Três escolhas técnicas levavam a habilidades adultas altas antes da primeira partida profissional. A evolução adulta só somava atributos, inclusive sem uso na posição. O primeiro clube era atribuído por um limiar de overall; salários só existiam depois de uma transferência. A chance de um CM finalizar ficava perto de uma constante, pouco sensível à função escolhida. Propostas mostravam prestígio e salário sem prever a disputa concreta que o jogador encontraria.

## Formação e aprendizagem

A escala permanece adulta, de 0 a 99. As etapas aos 12, 14 e 16 representam intervalos de formação. Novos ganhos usam peso da posição, foco, predisposição fixa e retornos decrescentes proporcionais ao atributo já adquirido. Técnica, leitura e físico disputam o tempo de prática. Formação não concede skill 80 por três cliques nem usa potencial máximo individual para condenar o futuro.

Na fase profissional, crescimento depende de prática específica, minutos, foco, qualidade de treino do clube, condição e fadiga. A estrutura multiplica a prática por `0.55 + trainingQuality / 100`. Treinar no banco continua possível, com exposição menor. Habilidades fora do repertório não recebem avanço automático; baixa prática pode gerar perda. Sobrecarga acima de fadiga 45 ou condição abaixo de 55 desconta aquisição, além de prejudicar execução. O saldo adquirido pode ser negativo e aparece ao lado do atributo; proficiência posicional continua separada.

## Consequências das alternativas

| Família | Ganho | Custo concreto |
|---|---|---|
| Técnica / leitura / físico | Foco diferente no repertório | Outro foco recebe menos prática; estudo/esforço acrescentam carga |
| Mostrar jogo | Prática específica adicional | Fadiga adicional |
| Cooperar | Mais conexão e reconhecimento por passes observados | Menos protagonismo nas finalizações |
| Desafiar o titular | Mais presença ofensiva | Mais carga, pressão e exigência da meta |
| Atacar | Mais acesso a chutes | Menos cobertura, mais exposição adversária e desgaste |
| Construir / controlar | Mais passe e criação / menor carga | Menos finalização própria |
| Pressionar / avançar / antecipar | Recuperações, apoio ou cobertura da profundidade | Mais carga e exposição conforme o papel |
| Treino extra | Mais prática principal | Pode acumular sobrecarga e resultar em perda |
| Estudar / cooperar na recuperação | Leitura ou passe, com metas correspondentes | Menos prática principal ou protagonismo |
| Arriscar no teste decisivo | Criação adicional | Exposição e esforço adicionais |
| Permanecer / negociar | Continuidade ou exploração de outro projeto | Abrir mão de condições alternativas ou perder a negociação |

Nenhuma postura concede titularidade no clique. A produção e a amostra observadas alimentam confiança e metas. Ganhos/custos são apresentados antes da decisão; os alvos de cada papel continuam visíveis. Interesse não é salário contratado: a UI identifica condições previstas e o risco de ficar sem proposta.

## Primeiros contratos e mercado

Após a formação, a fase `ENTRY` mantém `clubId: null` e oferece três projetos interessados. O jogador decide o primeiro clube. Há um B modesto, um B com mais estrutura e um projeto mais exigente; um A inicial requer nível qualificado. O clube dos sonhos não oferece contrato por ter sido escolhido no formulário.

Cada perfil contém divisão, remuneração mensal ficcional, estrutura, pressão, força do concorrente, probabilidade inicial de titularidade e faixa de minutos por partida. O salário é registrado no primeiro aceite. O perfil congelado da proposta determina a estrutura e a força inicial do concorrente no destino; esse rival depois evolui por prática e forma.

A previsão usa a fórmula do motor: nível efetivo versus rival, confiança do treinador, forma recente, apoio da torcida e limites de probabilidade. Minutos estimados são a média do modelo de titulares/reservas com uma faixa de ±12 minutos, limitada a 0–90. **Não é intervalo estatístico de confiança, mínimo contratual ou promessa de minutos.** Mudanças de condição, concorrência, confiança e desempenho alteram a previsão. Um projeto A em geral acrescenta estrutura, exposição e salário, mas tem rival mais forte e cobrança maior; a escolha exige comparar seus números, não apenas a divisão.

Novas janelas são registradas em `marketHistory`, com contatos, projetos e resposta factual (permaneceu, abriu contato, sem proposta ou aceitou). Não há reconstrução de ofertas antigas. Mantém-se o pipeline interesse → contato → proposta, incluindo janelas silenciosas e tentativas frustradas.

## Chute não é atributo

O motor separa quatro etapas: ataque criado pelo time enquanto o jogador está em campo; acesso ao chute segundo posição, intenção, leitura, movimento e apoio; acertar o alvo; vencer a defesa. `shotOpportunity` conta ataques do time com o jogador presente, **não chances claras pessoais**. `shotAccess` soma probabilidades de acesso a esses ataques. Chutes e chutes no alvo são contagens observadas. Finalização influencia alvo e conversão, sem criar ataques, minutos ou gols garantidos. Um CM que escolhe atacar ganha acesso ofensivo; trocar a finalização isoladamente não inventa mais chutes.

## Compatibilidade e limites

Mesmo diretório, chave `1903.prototype10.v2` e schema 2. `mechanicsRevision: 1` é opcional. Uma formação legada continua com seu contrato antigo de ganho/origem; um PLAN legado aberto joga a intenção já apresentada, sem reinterpretar suas regras. As novas mecânicas entram na próxima meta criada. Skills, partidas, metas, decisões e fatos passados não são reescritos. DONE permanece fechado. Para experimentar a formação/entrada nova é necessário iniciar outra carreira, com exportação prévia disponível.

Um vínculo sem salário no legado é mostrado como dado ausente. `LEGACY_CONTEXT` descreve o contexto atual sem inventar uma assinatura passada; um acordo de continuidade pode ser estabelecido prospectivamente ao começar nova temporada. Perfil, fase ENTRY, chances e novas contagens têm validação; decisões continuam transacionais sobre uma cópia antes da confirmação.

O recorte continua até 21 anos, com três temporadas de 18 jogos internos, catálogo A/B de 2026 e calendário resumido. Sem campeonato oficial de 38 rodadas, acesso/rebaixamento, nova janela aos 20, aposentadoria ou expansão da vida externa. Parâmetros são experimentais; testes de causalidade e save não comprovam diversão, calibração com futebol real, duração de quatro horas ou Safari físico.

## Gates

```sh
node tests/dez-clubes-v2-agency.mjs
node prototypes/dez-clubes-v2/test-engine.mjs
node tests/dez-clubes-v2-corrections.mjs
node tests/dez-clubes-v2-brazil.mjs
node tests/dez-clubes-v2-ui.mjs
python3 prototypes/dez-clubes-v2/build.py
```

As regressões usam carreiras públicas sintéticas e snapshots publicados de 02/04. Exports privados ficam fora de fixtures e do repositório. Evidências finais e números medidos são registrados no PROJECT_LOG; relatório de validação e capturas ficam em outputs da conversa.
