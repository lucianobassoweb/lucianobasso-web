# Decisão de arquitetura — protótipo rápido de dez clubes

## Contexto

O usuário rejeitou repetição e falta de progressão na 0.3.13. Pediu um experimento reduzido após escolher conquista de vaga, crescimento entre clubes e reputação como recompensas. Aceita fracasso coerente e pediu zero vida externa ao futebol. Trabalho amplo de 0.4.0 ainda possuía riscos; não deve virar publicação por inércia.

## Decisão

Construir um cenário independente e pequeno, encerrado aos 21. Motor puro em ES module, fonte UI/CSS separada, build HTML único para manter raw.githack como rota simples. ID exclusivo por evento e validação completa antes de qualquer mutação. UI não revela DNA. Save exclusivo com raw inválido protegido; recuperação pode copiar bytes antes de começar outra carreira.

## Alternativas e efeitos

| Alternativa | Efeito |
|---|---|
| Continuar adicionando casos na 0.3.13 | Usa saves existentes, mas amplia o motor antes de validar o loop divertido |
| Substituir imediatamente o jogo inteiro | Simplifica a direção, mas perde comparação e ameaça compatibilidade |
| Protótipo separado escolhido | Permite testar rapidamente; duplica temporariamente algumas regras e não completa a carreira |

## Consequências

Nenhuma migração entre os motores por enquanto. Arquivo único gerado a partir das fontes; escopo limitado e coeficientes documentados. Não declarar a hipótese aprovada pelos testes automatizados. Reavaliar após o usuário terminar o recorte: agência, significado das propostas, ritmo, clareza das perdas e vontade de tentar outra carreira.

## Pesquisa e aplicação

Lance: observação direta como convidado, posição atacante aos 16, escolha entre Uberlândia/Mixto/Newcastle Jets e primeira decisão de treino. Dois momentos de escolha por temporada estavam explicitados na tela. Isso sustenta a leitura de baixa fricção e destino como recompensa; não foi jogada uma carreira completa. O protótipo usa períodos e projetos disponíveis, sem copiar a rolagem de OVR exibida pelo Lance. Fonte institucional: https://www.lance.com.br/lance-negocios/lance-estreia-modo-carreira-simule-sua-trajetoria-no-futebol-faca-escolhas-e-vire-lenda.html e jogo https://games.lance.com.br/carreira.

New Star Soccer: descrições oficiais apresentam uma carreira com habilidades, relações, escolhas e agentes/treinadores. Histórico do App Store menciona passe/chute e recompensas por lealdade/capitania. Inferência de design: dar consequência persistente ao desempenho e ao clube. Aplicação aqui: confiança, concorrência, propostas e memória. Minijogos de campo e vida externa não foram incorporados. Não houve teste direto do NSS nesta rodada. Fontes: https://play.google.com/store/apps/details?id=com.newstargames.newstarsoccer&hl=en_US e https://apps.apple.com/us/app/new-star-soccer/id498973162.
