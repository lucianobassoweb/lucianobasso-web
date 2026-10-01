# 1903 · Dez clubes · Protótipo 03

Recorte independente: três etapas entre 12–18 anos e três temporadas profissionais, 54 partidas internas, encerramento aos 21. Não é aposentadoria nem a carreira completa planejada. A revisão 03 corrige a lógica da build 02 neste mesmo diretório.

Abra `index.html` em HTTPS. É standalone: sem servidor de aplicação, bibliotecas ou banco externo. Localmente: `python3 build.py`, depois `python3 -m http.server`.

## Escolhas e consequências

- Confiança pessoal influencia a execução sob pressão; confiança do treinador e forma recente influenciam a disputa por vaga.
- Metas de novas carreiras acompanham o papel escolhido: finalização, criação, controle, proteção, antecipação, pressão ou apoio. O menu apresenta a produção exigida antes da escolha.
- Pressionar, antecipar e avançar cobram mais físico/fadiga. Recuperação regular é automática; intensidade contínua pode ultrapassar essa recuperação. A carga reduz execução e eficiência de aprendizagem.
- Crescimento adquirido depende de prática, oportunidade, foco e predisposição fixa, sem sorteio de bônus de habilidade nem teto oculto de destino. O concorrente também acumula experiência e forma.
- Feitos excepcionais em entradas curtas recebem reconhecimento. Uma entrada curta continua sem representar uma partida completa para consistência.
- Goleiros têm substituição por contingência pouco frequente; defesas e gols sofridos consideram seu tempo em campo. Construção, antecipação e proteção têm efeitos próprios.
- Falhar na meta aumenta a exigência emocional do projeto. Recuperação pode reabrir com intervalo de dois períodos ou mudança de clube; não compra a vaga. O teste decisivo é oferecido mesmo quando a recuperação ocupa sua janela inicial.
- Mercado avalia amostra, produção, necessidade, encaixe e concorrência. Pode não haver contato, e contato pode terminar sem oferta. Projetos modestos podem abrir avaliação para reconstrução.
- Treinador e torcida avaliam o período e cada partida; respostas aparecem sem clique. Memória mantém acontecimentos recentes e o arquivo acessível.

## Saves

Mesma chave `1903.prototype10.v2` e schema 2. Novas regras de metas/formação identificadas por `rulesRevision: 1`. Saves da build 02 continuam: partidas, metas concluídas, decisões e evolução passadas não são reescritas. Metas legadas conservam seus critérios; próximas metas podem usar as regras novas. O protótipo 01 e a carreira principal permanecem independentes. Não há importação de exports neste recorte.

Escolhas são aplicadas sobre uma cópia validada e só então confirmadas. Arquivos inválidos são preservados para recuperação; quota insuficiente gera aviso e permite exportar o estado em memória. Exportação e recomeço disponíveis.

## Verificação reproduzível

Na raiz do repositório:

```sh
node prototypes/dez-clubes-v2/test-engine.mjs
node tests/dez-clubes-v2-corrections.mjs
node tests/dez-clubes-v2-ui.mjs
python3 prototypes/dez-clubes-v2/build.py
```

Nomes de dez clubes reais contextualizam uma liga fictícia. Forças, calendário, salários, concorrentes e curvas são parâmetros experimentais. Não há garantia de contrato, OVR 70 ou chegada ao clube dos sonhos. Testes técnicos não demonstram diversão nem calibração com futebol real.
