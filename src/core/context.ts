import type { CareerEvent, CompetitionCategory, PlayerState, SaveGame, SeasonStats } from './types.js';
import { CLUB_BY_ID } from '../data/clubs-br-2026.js';

export interface CareerContext { paragraphs: string[]; nextStep: string }
interface Thread { priority: number; text: string; next?: string }
const categoryNames: Record<CompetitionCategory, string> = {
  U15: 'Sub-15', U17: 'Sub-17', U20: 'Sub-20', AMATEUR: 'futebol local', SENIOR: 'profissional',
};
const roles = { HOLD: 'mais fixa', MOBILE: 'com liberdade de movimento', BALANCED: 'equilibrada' };
const positions = { IND: 'posição ainda em definição', GK: 'goleiro', CB: 'zagueiro', FB: 'lateral', DM: 'volante', CM: 'meia central', AM: 'meia ofensivo', WG: 'ponta', ST: 'atacante' };
const counted = (n: number, singular: string, plural = `${singular}s`): string => `${n} ${n === 1 ? singular : plural}`;

/** Match category is authoritative; legacy inference is read-only and matches the calendar migration. */
function category(p: PlayerState, event: CareerEvent): CompetitionCategory {
  if (event.matchFeedback?.category) return event.matchFeedback.category;
  const senior = p.professionalStatus === 'SENIOR' || (!p.professionalStatus && (p.careerStats.appearances > 0 || p.age > 20 && !!p.currentClubId));
  return senior && p.currentClubId ? 'SENIOR' : p.age <= 14 ? 'U15' : p.age <= 15 ? 'U17' : p.age <= 20 ? 'U20' : 'AMATEUR';
}
function completedSeason(p: PlayerState, event: CareerEvent): SeasonStats | undefined {
  const year = /^season-(\d+)$/.exec(event.id)?.[1];
  return year ? p.seasonHistory.find(s => s.season === Number(year)) : undefined;
}
function available(event: CareerEvent, id: string): boolean { return !!event.choices?.some(c => c.id === id); }
function factsFor(p: PlayerState, event: CareerEvent, threads: Thread[], season: SeasonStats, cat: CompetitionCategory): void {
  const match = event.matchFeedback;
  // A modern season with no record for this category supplies no evidence for that category.
  const stats = season.categories ? season.categories[cat] : season;
  const senior = cat === 'SENIOR';
  const coach = match?.coachName ? `de ${match.coachName}` : 'do treinador';
  const talk = available(event, 'career:discuss');
  const responsibility = available(event, 'career:responsibility');
  const continuing = available(event, 'career:stable') || available(event, 'career:local');
  const explore = available(event, 'career:explore');
  const market = available(event, 'career:market');
  const annual = event.kind === 'SEASON_END';
  const push = (priority: number, text: string, next?: string): void => { threads.push({ priority, text, ...(next ? { next } : {}) }); };

  if ((p.injury?.remainingBlocks ?? 0) > 0) {
    push(100, `O afastamento ainda está em curso; a previsão registrada é de aproximadamente ${p.injury!.remainingBlocks} partidas do calendário. A campanha do clube continua durante a ausência, sem uma nova atuação sua para avaliar.`, talk ? 'A conversa sobre seu papel permite alinhar a retomada ao afastamento atual; pedir responsabilidade não antecipa a liberação.' : undefined);
  } else if ((p.comebackBlocks ?? 0) > 0) {
    push(94, `Você está na retomada após um afastamento, com participação ${p.comebackPlan === 'GRADUAL' ? 'gradual negociada' : 'voltada a disputar o espaço anterior'}. O retorno ao elenco e a recuperação da titularidade são etapas distintas.`, talk ? 'Use a conversa com o treinador para rever o papel na retomada à luz da participação que já ocorreu.' : undefined);
  }

  if (match && match.minutes === 0) {
    const record = stats?.appearances ? ` Até aqui, foram ${counted(stats.appearances, 'participação', 'participações')}${Number.isFinite(stats.starts) ? `, ${stats.starts} como titular` : ''} nesta categoria durante o ano.` : stats ? ' Você ainda busca sua primeira participação nesta categoria no ano.' : '';
    push(92, `Você acompanhou esta rodada sem entrar.${record} O resultado coletivo não fornece uma nova avaliação individual.`, talk ? 'Conversar sobre seu papel permite esclarecer a disputa por espaço antes de escolher entre aguardar e pedir mais responsabilidade.' : undefined);
  } else if (match && stats && stats.appearances > 0) {
    const starts = Number.isFinite(stats.starts) ? stats.starts : undefined;
    const record = starts === undefined ? `${stats.appearances} participações` : `${starts} titularidades em ${stats.appearances} participações`;
    const youth = senior && p.careerStats.appearances <= 5 ? p.seasonHistory.find(s => s.categories?.U20?.appearances) : undefined;
    const base = youth?.categories?.U20;
    const stage = senior && p.careerStats.appearances <= 5 ? (base ? ` No Sub-20 de ${youth!.season}, foram ${base.appearances} participações; agora você disputa um novo espaço no time principal.` : ' É o começo da experiência profissional, com espaço ainda sendo construído.') : stats.appearances <= 2 && !senior ? (p.age <= 14 ? ' Nesta etapa, ainda há tempo para experimentar e conhecer seu jogo.' : ' As primeiras atuações do ano começam a mostrar o papel escolhido.') : starts !== undefined && starts < stats.appearances / 2 ? ' A maior parte do seu espaço veio como reserva.' : starts !== undefined && starts > stats.appearances / 2 ? ' A titularidade tem sido a principal forma de participação.' : '';
    push(senior && p.careerStats.appearances <= 5 ? 88 : 52, `O ano soma ${record} no ${categoryNames[cat]}.${stage}`, responsibility ? 'Pedir mais responsabilidade propõe ampliar o papel construído até aqui; a resposta ainda depende da negociação com o treinador.' : continuing ? `Sustentar o caminho atual dá continuidade às oportunidades já construídas.${explore ? ' Buscar avaliações abre a procura por outra estrutura.' : ''}` : undefined);
  }

  if (match && match.minutes > 0) {
    const opponent = match.opponent;
    const lost = match.teamGoals < match.oppGoals;
    const won = match.teamGoals > match.oppGoals;
    const sentOff = event.tags.includes('EXPULSO');
    const exceptionalStart = match.started && stats && stats.appearances >= 3 && stats.starts < stats.appearances / 2;
    if (sentOff) {
      push(96, `A expulsão contra ${opponent} entra no balanço desta atuação. A discussão com o comando agora envolve disciplina e a responsabilidade que você pretende assumir.`, talk ? 'Converse sobre as expectativas depois da expulsão antes de negociar um papel maior.' : undefined);
    } else if (p.position === 'GK' && match.cleanSheet && match.oppGoals === 0) {
      push(72, `Contra ${opponent}, você terminou sem sofrer gol${match.saves > 0 ? ` e registrou ${counted(match.saves, 'defesa')}` : ''}. ${won ? 'O time conseguiu transformar essa proteção em vitória.' : 'O time também passou sem marcar; a proteção do gol foi a sua contribuição num empate.'}`, continuing ? 'A continuidade permite sustentar o espaço com novas atuações; esta partida acrescenta uma referência concreta ao seu papel no gol.' : undefined);
    } else if (p.position === 'GK' && match.saves >= 3) {
      push(70, `Você registrou ${counted(match.saves, 'defesa')} diante de ${opponent}; o time sofreu ${counted(match.oppGoals, 'gol', 'gols')}. ${lost ? 'A derrota reúne duas leituras: as intervenções que você fez e o que ainda pesa na avaliação da atuação.' : 'Suas intervenções ajudaram a conter as finalizações adversárias; o resultado também dependeu do que o time produziu à frente.'}`, talk ? 'Use a avaliação da partida e o rendimento do ano para discutir seu papel no gol com o treinador.' : continuing ? 'Ao avaliar a continuidade, considere suas intervenções junto da nota e das oportunidades que já recebeu neste ano.' : undefined);
    } else if (match.goals + match.assists > 0) {
      const contributions = [match.goals > 0 ? counted(match.goals, 'gol', 'gols') : '', match.assists > 0 ? counted(match.assists, 'assistência') : ''].filter(Boolean).join(' e ');
      push(70, `Contra ${opponent}, você participou diretamente do ataque com ${contributions}. ${lost ? 'Essa produção apareceu numa derrota; existe uma contribuição individual a levar para a conversa, dentro de um resultado coletivo desfavorável.' : won ? 'A produção individual veio junto da vitória; ela acrescenta uma evidência à disputa por responsabilidade.' : 'A produção individual apareceu, embora o time tenha ficado no empate.'}`, responsibility ? 'A participação no ataque pode entrar na negociação de responsabilidade, junto do rendimento acumulado neste ano.' : continuing ? 'Considere essa participação no ataque junto do balanço do ano ao decidir o caminho seguinte.' : undefined);
    } else if (exceptionalStart) {
      push(70, `A titularidade contra ${opponent} trouxe uma oportunidade diferente do padrão do ano: a maioria das suas participações havia vindo do banco. A avaliação desta partida acrescenta uma referência para discutir mais espaço.`, talk ? 'Converse sobre o papel após esta oportunidade como titular, considerando também as participações anteriores.' : undefined);
    }
  }

  // These are visible relationship labels, not personality/profile diagnostics or hidden fit.
  const trust = p.tactical ? p.coaching?.bonds[p.tactical.coachId]?.trust ?? p.tactical.trust : undefined;
  if (senior && trust !== undefined && (trust < 40 || trust >= 65)) {
    push(trust < 40 ? 85 : 44, `${annual ? 'Para o novo ano, a' : 'A'}${trust < 40 ? ` confiança profissional ${coach} está baixa. Negociar espaço também envolve reconstruir esse vínculo.` : ` confiança profissional ${coach} está alta.${match?.minutes === 0 ? ' Nesta rodada, porém, ela não se traduziu em entrada em campo.' : ' Há um vínculo favorável para discutir o próximo papel, sem assegurar a escalação.'}`}`, talk ? (trust < 40 ? 'A conversa sobre seu papel permite esclarecer expectativas enquanto reconstrói a confiança do treinador.' : 'Com a confiança estabelecida, a conversa pode esclarecer a responsabilidade que pretende assumir.') : undefined);
  }

  const latestPosition = p.positionHistory.find(r => r.season === p.season && r.position === p.position);
  if (p.adaptationDebt > 7 && latestPosition?.previousPosition && latestPosition.previousPosition !== p.position) {
    push(82, `A mudança de ${positions[latestPosition.previousPosition]} para ${positions[p.position]} nesta temporada ainda está em adaptação. Você leva a experiência anterior para uma tarefa que ainda está aprendendo a exercer.`, talk ? 'Discutir o papel permite separar a adaptação à nova posição de um pedido por maior responsabilidade.' : continuing ? 'A continuidade oferece mais atuações para observar a mudança já feita.' : undefined);
  } else if (p.tactical && p.position !== 'GK' && p.tactical.role !== 'BALANCED') {
    push(48, `${annual ? 'Para o novo ano, seu' : 'Seu'} acordo atual é uma função ${roles[p.tactical.role]} como ${positions[p.position]}. ${p.tactical.role === 'HOLD' ? 'A leitura e a técnica ganham mais peso nessa tarefa.' : 'Mobilidade e resistência são exigências importantes dessa tarefa.'} A discussão do espaço passa também por essa forma de jogar.`, talk ? 'A conversa sobre seu papel permite negociar as demandas da função atual.' : undefined);
  }

  const campaign = p.currentClubId ? p.coaching?.campaigns[p.currentClubId] : undefined;
  if (senior && campaign && p.coaching?.season === season.season && campaign.games > 0) {
    const form = campaign.form.slice(-6);
    const wins = form.filter(x => x === 3).length, draws = form.filter(x => x === 1).length, losses = form.filter(x => x === 0).length;
    const recent = form.length ? ` Nos últimos ${form.length} jogos do clube: ${counted(wins, 'vitória')}, ${counted(draws, 'empate')} e ${counted(losses, 'derrota')}.` : '';
    const difficult = form.length >= 3 && losses > wins;
    push(difficult ? 79 : 42, `${CLUB_BY_ID[p.currentClubId!]?.shortName ?? 'O clube'} ${annual ? 'encerrou o ano com' : 'soma'} ${campaign.points} pontos em ${campaign.games} jogos.${recent} ${difficult ? 'A sequência coletiva é desfavorável; ela não deve ser atribuída apenas à sua atuação.' : 'Sua disputa por espaço acontece dentro dessa campanha coletiva.'}`, continuing ? `Preservar estabilidade significa permanecer neste contexto coletivo.${market ? ' Ouvir outros projetos abre uma busca, sem transferência automática.' : ''}` : undefined);
  }

  if (annual && stats && stats.appearances >= 3) {
    const previous = p.seasonHistory.filter(s => s.season < season.season && s.clubId === season.clubId).sort((a,b)=>b.season-a.season)[0];
    const prior = previous?.categories ? previous.categories[cat] : previous;
    if (prior && prior.appearances >= 3 && Math.abs(stats.avgRating-prior.avgRating) >= .4) {
      push(62, `No mesmo clube, sua nota média passou de ${prior.avgRating.toFixed(2)} em ${previous!.season} para ${stats.avgRating.toFixed(2)} em ${season.season}. ${stats.avgRating > prior.avgRating ? 'O rendimento anual melhorou; essa evolução acrescenta uma referência para negociar seu próximo papel.' : 'O rendimento anual caiu; vale discutir o papel e as condições do projeto antes de decidir pela continuidade.'}`);
    } else if (Number.isFinite(stats.starts)) {
      push(40, `No ano encerrado, foram ${counted(stats.starts, 'titularidade')} em ${counted(stats.appearances, 'participação', 'participações')}. ${stats.starts > stats.appearances / 2 ? 'Você chega à decisão sobre o próximo projeto com uma trajetória construída principalmente como titular.' : stats.starts < stats.appearances / 2 ? 'A maior parte das oportunidades veio como reserva; o espaço para jogar é uma questão central na escolha do próximo projeto.' : 'As oportunidades ficaram divididas entre começar jogando e entrar do banco; o papel que pretende assumir merece entrar na decisão.'}`);
    }
  }

  const ratingDifference = match && match.minutes > 0 && stats ? match.rating - stats.avgRating : 0;
  const ratingTension = Math.abs(ratingDifference) >= .4;
  if (stats && stats.appearances >= 3 && stats.avgRating > 0 && !annual && (ratingTension || stats.avgRating < 6.5)) {
    const evidence = `A nota média no ${categoryNames[cat]} ${annual ? 'no ano encerrado foi' : 'é'} ${stats.avgRating.toFixed(2)}, em ${stats.appearances} participações.`;
    const comparison = match && match.minutes > 0 && Math.abs(match.rating - stats.avgRating) >= .4 ? (match.rating > stats.avgRating ? ` A atuação desta rodada ficou acima dessa média${match.teamGoals < match.oppGoals ? ', mesmo com a derrota do time' : ''}; há uma resposta individual a considerar.` : ' A atuação desta rodada ficou abaixo dessa média; o balanço do ano oferece uma referência mais ampla.') : ' O balanço do ano oferece uma referência para o próximo papel.';
    const next = talk && stats.avgRating < 6.5 ? 'A conversa sobre seu papel permite confrontar a avaliação do ano com as expectativas do treinador.' : continuing && ratingTension ? (ratingDifference > 0 ? `Considere essa resposta acima da sua média ao decidir pela continuidade.${explore ? ' Se buscar avaliação em outro clube, o balanço do ano também faz parte do percurso.' : ''}` : 'Considere o balanço do ano antes de mudar o caminho por uma atuação abaixo da sua média; a continuidade mantém a oportunidade de responder.') : undefined;
    push(ratingTension ? 76 : stats.avgRating < 6.5 ? 65 : 36, `${evidence}${comparison}${p.position === 'GK' ? ' Seu trabalho como goleiro é avaliado pelo conjunto das atuações.' : ''}`, next);
  }

  if (!senior && p.life) {
    const education = p.life.education;
    const schoolChoice = p.lastChoiceResult && /^(education:|career:education)/.test(p.lastChoiceResult.choiceId) && p.lastChoiceResult.turn >= p.careerTurn - 1;
    const beginning = stats ? stats.appearances <= 1 : p.seasonTurn <= 1;
    if (!education.completed && p.age <= 18 && (annual || beginning || schoolChoice || education.priority === 'FOOTBALL' && p.age >= 16)) {
      const priority = education.priority === 'FOOTBALL' ? 'mais tempo para o futebol' : education.priority === 'SCHOOL' ? 'proteção dos estudos' : 'equilíbrio entre escola e futebol';
      push(education.priority === 'FOOTBALL' && p.age >= 16 ? 77 : 46, `${annual ? 'Ao entrar no novo ano, aos' : 'Aos'} ${p.age} anos, a escola ainda não foi concluída; a prioridade atual é ${priority}. Essa divisão do tempo afeta também a formação para depois do futebol.`, available(event, 'career:education') ? 'Rever o equilíbrio com a escola reabre a prioridade deste ano, caso a divisão atual do tempo precise mudar.' : undefined);
    } else if (education.completed && annual) {
      push(33, 'A escola foi concluída. Essa etapa preserva possibilidades de formação depois do futebol; o próximo diploma ou trabalho ainda exigirá um percurso próprio.');
    }
    if (!p.currentClubId && (beginning || annual || p.lastChoiceResult?.choiceId === 'career:explore' && p.lastChoiceResult.turn >= p.careerTurn - 1)) {
      const place = p.life.localSchool || p.life.residence;
      push(57, `Seu caminho ${p.age <= 20 ? 'de formação' : 'no futebol local'} segue em ${place}. ${p.life.scouting.trialAttempts > 0 ? `Você já passou por ${counted(p.life.scouting.trialAttempts, 'tentativa')} de avaliação.` : 'Você ainda busca a primeira avaliação em outra estrutura.'} Uma oportunidade futura depende de observação e de uma vaga em disputa.`, explore ? `Buscar outras avaliações amplia a observação para futuros convites.${continuing ? ' Sustentar o caminho atual mantém a estrutura local em que você já compete.' : ''}` : undefined);
    } else if (p.currentClubId && beginning && p.life.residence && p.life.residence !== p.hometown) {
      push(34, `A residência atual é ${p.life.residence}, enquanto sua cidade de origem é ${p.hometown}. A família já participa de um percurso fora da cidade de origem; outra oportunidade precisa ser lida junto do apoio e dos estudos.`, available(event, 'career:education') ? 'A revisão com a família permite reavaliar a escola dentro do percurso que já está acontecendo.' : undefined);
    }
  }
}

function fallbackNext(event: CareerEvent): string {
  if (!event.choices?.length) return 'Avance para acompanhar o próximo acontecimento da carreira.';
  if (available(event, 'career:discuss')) return 'Use a conversa com o treinador para esclarecer as expectativas e negociar o papel que pretende exercer.';
  if (available(event, 'career:explore')) return 'Buscar avaliações amplia a observação para futuros convites.';
  return `A decisão disponível é ${event.choices.map(c => `“${c.label}”`).join(' ou ')}.`;
}

/** Pure presentation: reads observed career state only; never initializes helpers, consumes RNG or changes saves. */
export function buildCareerContext(save: SaveGame, event: CareerEvent): CareerContext {
  const p = save.player;
  const fallback = (): CareerContext => ({ paragraphs: event.body.trim() ? [event.body] : [], nextStep: event.decisionContext ?? fallbackNext(event) });
  if (!event.matchFeedback && event.kind !== 'SEASON_END' && event.kind !== 'MARKET') return fallback();
  const season = event.kind === 'SEASON_END' ? completedSeason(p, event) : p.currentSeason;
  if (!season) return fallback();
  const threads: Thread[] = [];
  let cat = category(p, event);
  if (event.kind === 'SEASON_END' && season.categories) {
    cat = (Object.entries(season.categories) as [CompetitionCategory, { appearances: number }][]).sort((a, b) => b[1].appearances - a[1].appearances)[0]?.[0] ?? cat;
  }
  factsFor(p, event, threads, season, cat);

  if (event.kind === 'SEASON_END' || event.kind === 'MARKET') {
    // Annual bodies contain titles, release and valuation; market bodies may describe a changed coach.
    if (event.body.trim()) threads.push({ priority: 110, text: event.body });
    const offers = event.choices?.filter(c => /^market(?:-confirm)?:/.test(c.id) && c.id !== 'market:stay') ?? [];
    if (offers.length) {
      const destinations = offers.map(c => CLUB_BY_ID[c.id.split(':')[1] ?? '']?.shortName ?? c.label.split(' · ')[0]);
      threads.push({ priority: 90, text: `Há proposta concreta de ${destinations.join(', ')}.${p.contractYearsLeft > 0 ? ` Seu vínculo atual tem ${counted(p.contractYearsLeft, 'temporada')} pela frente.` : ''} Você compara um papel já vivido com uma nova disputa por espaço; a mudança de clube não assegura a titularidade.`, next: `Compare o comando, o apoio à sua fase e o espaço descritos nas propostas com seu papel atual.${available(event, 'market:stay') ? ' Permanecer dá continuidade ao projeto que já conhece.' : ''}` });
    } else if (event.kind === 'SEASON_END' && available(event, 'career:market')) {
      threads.push({ priority: 74, text: 'Este balanço não traz proposta concreta. Você pode orientar o empresário a ouvir outros projetos, mas abrir a busca ainda é diferente de receber uma oferta.', next: 'Ouvir outros projetos abre uma busca para a próxima etapa; a estabilidade mantém a continuidade sem depender de uma oferta que ainda não existe.' });
    }
  } else if (event.matchFeedback) {
    const discovery = event.body.match(/Os treinadores agora observam melhor:[^.]+\./)?.[0];
    const expected = event.body.match(/xG\s+\d+(?:[.,]\d+)?\s*·\s*xA\s+\d+(?:[.,]\d+)?/)?.[0];
    const debut = event.tags.includes('ESTREIA');
    if (discovery || debut || expected) {
      const text = [debut ? 'Esta partida marca sua primeira aparição profissional; o marco permanece no histórico da carreira.' : '', discovery ?? '', expected ? `Leitura complementar desta atuação: ${expected}.` : ''].filter(Boolean).join(' ');
      // Attach extra observed match facts to an existing thread so the section stays at 2–3 paragraphs.
      if (threads.length) threads.sort((a, b) => b.priority - a.priority)[0]!.text += ` ${text}`;
      else return fallback();
    }
  }
  const selected = threads.sort((a, b) => b.priority - a.priority).slice(0, 3);
  if (!selected.length) return fallback();
  return { paragraphs: selected.map(t => t.text), nextStep: event.decisionContext ?? selected.find(t => t.next)?.next ?? fallbackNext(event) };
}
