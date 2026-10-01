import { POSITIONS, POSITION_LABELS, positionDistance, roleRating } from './positions.js';
import type { CompetitionCategory, PlayerState, PlayablePosition, VisibleAttributes } from './types.js';

export interface YouthPositionReview {
  previousSeason: number;
  previousPosition: PlayablePosition;
  recommendedPosition: PlayablePosition;
  category: CompetitionCategory;
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
  reason: string;
  /** For insisting in the old position this season; the engine owns applying and expiring it. */
  opportunityPenalty: number;
}

const YOUTH_CATEGORIES = ['U15', 'U17', 'U20'] as const;
const REPERTOIRE: Record<PlayablePosition, [keyof VisibleAttributes, keyof VisibleAttributes]> = {
  GK: ['reflexes', 'handling'], CB: ['tackling', 'positioning'], FB: ['crossing', 'stamina'],
  DM: ['tackling', 'passing'], CM: ['passing', 'vision'], AM: ['vision', 'technique'],
  WG: ['dribbling', 'pace'], ST: ['finishing', 'positioning'],
};
const ATTRIBUTE_LABELS: Partial<Record<keyof VisibleAttributes, string>> = {
  reflexes: 'reflexos', handling: 'manejo da bola', tackling: 'marcação', positioning: 'posicionamento',
  crossing: 'cruzamento', stamina: 'resistência', passing: 'passe', vision: 'leitura de jogo',
  technique: 'técnica', dribbling: 'drible', pace: 'velocidade', finishing: 'finalização',
};
const bounded = (value: number, fallback = 0): number => Number.isFinite(value)
  ? Math.max(0, Math.min(100, value)) : fallback;

/** Review documented youth output and learned repertoire; no natural-fit or genetic inference. */
export function reviewYouthPosition(p: PlayerState): YouthPositionReview | null {
  if (p.age < 13 || p.age > 18 || !Number.isInteger(p.age) || p.position === 'IND'
    || p.positionSeasonChosenFor === p.season || p.professionalStatus === 'SENIOR'
    || p.professionalStatus === 'INVITED'
    || p.professionalStatus === undefined && p.phase !== 'ESCOLINHA' && p.phase !== 'BASE') return null;
  const previous = p.seasonHistory[0];
  if (!previous || previous.season !== p.season - 1 || previous.age > 18 || previous.age < 12
    || previous.primaryPosition !== p.position || !previous.positionsPlayed?.length
    || new Set(previous.positionsPlayed).size !== 1 || previous.positionsPlayed[0] !== p.position) return null;
  // Category totals lack a position breakdown: mixed positions cannot justify a positional verdict.
  if (previous.positionAppearances && Object.entries(previous.positionAppearances)
    .some(([position, appearances]) => position !== p.position && (appearances ?? 0) > 0)) return null;
  const categories = previous.categories;
  if (!categories || (categories.SENIOR?.appearances ?? 0) > 0 || (categories.SENIOR?.minutes ?? 0) > 0) return null;
  const candidates = YOUTH_CATEGORIES.map(category => ({ category, stats: categories[category] }))
    .filter(candidate => candidate.stats && candidate.stats.appearances > 0)
    .sort((a, b) => b.stats!.appearances - a.stats!.appearances);
  const selected = candidates[0];
  if (!selected?.stats) return null;
  const { appearances, minutes, goals, assists, avgRating: rating } = selected.stats;
  if (![appearances, minutes, goals, assists, rating].every(Number.isFinite)
    || appearances < 8 || minutes < 420 || goals < 0 || assists < 0 || rating <= 0 || rating > 10) return null;
  const attacking = p.position === 'ST' || p.position === 'WG';
  const production = (goals + (p.position === 'ST' ? 0.45 : 1) * assists) * 90 / minutes;
  const poorSeason = attacking
    ? production < (p.position === 'ST' ? 0.20 : 0.30) && rating < 7.2
    : rating < (p.position === 'GK' ? 6.2 : 6.3);
  if (!poorSeason) return null;
  const current = p.position;
  const score = (position: PlayablePosition): number => {
    const learned = roleRating(p, position);
    return (Number.isFinite(learned) ? learned : 0) + bounded(p.positionProficiency[position] ?? 0) * 0.045
      - positionDistance(current, position) * 2;
  };
  // Rank alternatives, not a supposedly natural position; even the best candidate must be tested.
  const recommendedPosition = POSITIONS.filter(position => position !== current)
    .sort((a, b) => score(b) - score(a))[0];
  if (!recommendedPosition) return null;
  const [first, second] = REPERTOIRE[recommendedPosition];
  const evidence = attacking
    ? `${appearances} jogos, ${minutes} minutos, ${goals} ${goals===1?'gol':'gols'}, ${assists} ${assists===1?'assistência':'assistências'} e nota média ${rating.toFixed(1).replace('.', ',')}`
    : `nota média ${rating.toFixed(1).replace('.', ',')} em ${appearances} participações e ${minutes} minutos`;
  return {
    previousSeason: previous.season, previousPosition: current, recommendedPosition,
    category: selected.category, appearances, minutes, goals, assists, rating,
    reason: `Na temporada ${previous.season}, ${evidence}. O treinador propõe experimentar ${POSITION_LABELS[recommendedPosition]}, considerando o repertório aprendido de ${ATTRIBUTE_LABELS[first]} e ${ATTRIBUTE_LABELS[second]}, a experiência na função e a adaptação necessária. O encaixe precisa ser testado em campo.`,
    opportunityPenalty: p.age <= 13 ? 0.08 : p.age <= 15 ? 0.12 : 0.16,
  };
}
