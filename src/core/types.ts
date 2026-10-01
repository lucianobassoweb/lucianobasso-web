import type {RecentMatchForm} from './form.js';
export type Division = 'A' | 'B' | 'C' | 'D';
export type Foot = 'D' | 'E';
export type CareerPhase = 'ESCOLINHA' | 'BASE' | 'PROFISSIONAL' | 'AUGE' | 'VETERANO' | 'APOSENTADO';
export type PlayablePosition = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'WG' | 'ST';
export type Position = 'IND' | PlayablePosition;
export type TransferIntent = 'STAY' | 'OPEN' | 'LEAVE' | 'FORCE';

export interface Club {
  id: string;
  name: string;
  country?: string;
  shortName: string;
  state: string;
  city: string;
  stadium: string;
  division: Division;
  colors: [string, string, string?];
  fanbaseDomestic: number;
  fanbaseGlobal: number;
  prestige: number;
  finance: number;
  youth: number;
  rivals: string[];
}

export interface HiddenDNA {
  adultHeightCm: number;
  dominantFoot: Foot;
  weakFootPlasticity: number;
  technicalAptitude: number;
  gameIntelligence: number;
  accelerationAptitude: number;
  staminaAptitude: number;
  coordination: number;
  defensiveAptitude: number;
  finishingAptitude: number;
  aerialAptitude: number;
  reflexAptitude: number;
  physicalMaturationAge: number;
  learningPlasticity: number;
  pressureResponse: number;
  consistency: number;
  injuryResistance: number;
  ambition: number;
  adaptability: number;
  leadership: number;
  lateBloomer: number;
}

export interface VisibleAttributes {
  technique: number;
  passing: number;
  finishing: number;
  dribbling: number;
  vision: number;
  decisions: number;
  pace: number;
  stamina: number;
  strength: number;
  positioning: number;
  tackling: number;
  crossing: number;
  heading: number;
  reflexes: number;
  handling: number;
  aerial: number;
}

export interface PositionSeasonRecord {
  season: number;
  age: number;
  position: PlayablePosition;
  previousPosition: PlayablePosition | null;
  startProficiency: number;
  endProficiency: number;
  changeCost: number;
  hiddenCompatibility: number; // development diagnostic only; never expose in normal UI
}

export type CompetitionCategory='U15'|'U17'|'U20'|'AMATEUR'|'SENIOR';
export interface CategoryStats {
  appearances:number; starts:number; minutes:number; goals:number; assists:number; avgRating:number; motm?:number;
}
export interface SeasonStats {
  season: number;
  age: number;
  clubId: string | null;
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  motm: number;
  yellows: number;
  reds: number;
  saves: number;
  cleanSheets: number;
  xg: number;
  xa: number;
  avgRating: number;
  titles: string[];
  categories?:Partial<Record<CompetitionCategory,CategoryStats>>;
  primaryPosition?:Position;
  positionsPlayed?:PlayablePosition[];
  positionAppearances?:Partial<Record<PlayablePosition,number>>;
  marketValueStart: number;
  marketValueEnd: number;
}

export interface CareerTotals {
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  motm: number;
  yellows: number;
  reds: number;
  saves: number;
  cleanSheets: number;
  xg: number;
  xa: number;
  titles: string[];
}

export interface FanRelation {
  clubId: string;
  passion: number;
  hate: number;
  fear: number;
  respect: number;
  expectation: number;
  memories: FanMemory[];
}

export interface FanMemory {
  season: number;
  weight: number;
  type: 'GOAL' | 'HATTRICK' | 'TITLE' | 'FLOP' | 'TRANSFER' | 'CELEBRATION' | 'RED_CARD' | 'CLASSIC' | 'REDEMPTION' | 'PRESSURE' | 'RECOGNITION';
  description: string;
}

export interface Relationship {
  personId: string;
  affinity: number;
  respect: number;
  rivalry: number;
  resentment: number;
  memories: string[];
}

export interface TransferRecord {
  season: number;
  age: number;
  fromClubId: string | null;
  toClubId: string;
  fee: number;
  marketValue: number;
}

export type EducationPriority = 'SCHOOL' | 'BALANCED' | 'FOOTBALL';
export type TacticalRole = 'BALANCED' | 'MOBILE' | 'HOLD';
export interface LifeContext {
  originState:string; residence:string; heartClubId:string; localSchool:string;
  family:{resources:number; availableTime:number; relocationWillingness:number; parents:string[]};
  childhood:'RUA'|'FUTSAL'|'ESCOLA'|'MULTIESPORTE';
  education:{priority:EducationPriority;chosenFor:number|null;credits:number;completed:boolean;yearProgress?:number};
  secondCareer?:{path:'WORK'|'TECHNICAL'|'DEGREE'|'COACH_COURSE';status:'SEEKING_WORK'|'IN_TRAINING'};
  scouting:{searchPriority?:boolean;lastSearchSeason?:number;observations:number;trialAttempts:number;lastAttemptSeason:number;rejections:{season:number;clubId:string}[]};
}
export interface TacticalContext {
  coachId:string; role:TacticalRole; support:number; trust:number; discussedFor:number|null;
}
export interface CoachIdentity {
  id:string; name:string; market:'BRAZIL'|'GLOBAL'|'REGIONAL'; sources:string[];
  nationality?:string; historicalOnly?:boolean;
}
export interface CoachProfile {
  youth:number; mature:number; integration:number; recovery:number; flexibility:number; organisation:number;
  patience:number; dialogue:number; discipline:number; creativity:number;
  preferredRole:TacticalRole; preferredPosition:PlayablePosition; style:'POSSESSION'|'DIRECT'|'DEFENSIVE';
}
export interface CoachBond {
  affinity:number; trust:number; conflict:number; memories:string[]; promisedRole?:string;
}
export interface CoachJob {
  coachId:string; sinceSeason:number; sinceTurn:number; games:number; points:number;
  boardPatience:number; backing:number; expectedPPG:number; previousRank:number;
}
export interface Campaign {
  clubId:string; group:string; games:number; points:number; wins:number; draws:number; losses:number;
  goalsFor:number; goalsAgainst:number; form:number[]; expectedRank:number; expectedPPG:number;
}
export interface CoachChange {
  clubId:string; oldCoachId:string; newCoachId:string; season:number; turn:number; reason:string;
}
export interface WorldFixture {
  homeId:string; awayId:string; homeGoals:number; awayGoals:number;
}
export interface CoachingWorld {
  season:number; completedBlocks:number; seed:number; progress?:number;
  campaigns:Record<string,Campaign>; jobs:Record<string,CoachJob>; bonds:Record<string,CoachBond>;
  changes:CoachChange[]; pendingChange:CoachChange|null;
}
export interface StoryChapter {
  id:string; kind:'FORMATION'|'REGULARITY'|'COMEBACK'; title:string; objective:string;
  startedSeason:number; startedTurn:number; deadlineTurn:number; clubId:string|null; category:CompetitionCategory;
  appearances:number; minutes:number; goodMatches:number;
  targetAppearances:number; targetMinutes:number; targetGoodMatches:number;
  challengeVersion?:1; position?:Position; minMatchMinutes?:number; performanceLabel?:string;
}
export interface StoryArchiveEntry extends StoryChapter {
  endedSeason:number; endedTurn:number; outcome:'ACHIEVED'|'PARTIAL'|'UNMET'; payoff:string;
}
export interface StoryState {
  active:StoryChapter|null; archive:StoryArchiveEntry[]; lastObservedTurn:number; sequence:number;
}
export interface ChoiceResult {
  eventId:string; choiceId:string; label:string; season:number; turn:number; summary:string; effects:string[];
}

export type DecisionFamily='LOAD'|'SPACE'|'SERVICE'|'RIVALRY'|'PRESSURE'|'ADAPTATION'|'PATH'|'LIFE';
export interface DecisionMemory {
  recent:{family:DecisionFamily;turn:number}[];
  lastOffered:Partial<Record<DecisionFamily,number>>;
  lastExtraTurn?:number;
  lastResolvedEvent?:string;
  extraLoad?:number;
}

export interface YouthPositionResponse {
  season:number; reviewedSeason:number; clubId:string|null; category:CompetitionCategory;
  position:PlayablePosition; recommendedPosition:PlayablePosition; decision:'INSIST'|'EXPERIMENT'; penalty:number;
}

export interface LifestyleState {happiness:number;excessKg:number;sleepDebt:number;lastProcessedTurn:number;}
export interface SquadState {version:'CONTEXT_1';currentKey?:string;lastObservedTurn:number;contexts:Record<string,{appearances:number;starts:number;minutes:number;captain:boolean;lastOfferedSeason?:number;lastResolvedEvent?:string}>;}

export interface PlayerState {
  lifestyle?:LifestyleState;
  squad?:SquadState;
  youthPositionResponse?:YouthPositionResponse;
  recentForm?:RecentMatchForm;
  decisionMemory?:DecisionMemory;
  story?:StoryState;
  lastChoiceResult?:ChoiceResult;
  id: string;
  name: string;
  birthYear: number;
  nationality?:string;
  professionalStatus?:'YOUTH'|'INVITED'|'SENIOR';
  promotionReviewedFor?:number;
  seasonReviewDue?:boolean;
  lastPromotionSeason?:number;
  debut?:{season:number;age:number;clubId:string;opponentId:string;minutes:number};
  careerApproach?:'STABILITY'|'RESPONSIBILITY';
  coachTalkFor?:string;
  coaching?:CoachingWorld;
  age: number;
  season: number;
  seasonTurn: number;
  careerTurn: number;
  phase: CareerPhase;
  hometown: string;
  heartClubId: string;
  currentClubId: string | null;
  position: Position;
  secondaryPositions: PlayablePosition[];
  positionProficiency: Record<PlayablePosition, number>;
  positionHistory: PositionSeasonRecord[];
  positionSeasonChosenFor: number | null;
  adaptationDebt: number;
  positionChanges: number;
  heightCm: number;
  weightKg: number;
  professionalTransition?:{mode:'PROTECTED'|'IMMEDIATE'|null;clubId:string|null;youthBuzz:number;seniorMinutesAtStart:number};
  injury?:{remainingBlocks:number;longAbsence:boolean;returnDiscussed:boolean};
  retirementReviewedFor?:number;
  comebackBlocks?:number;
  comebackPlan?:'GRADUAL'|'COMPETE';
  life?: LifeContext;
  tactical?: TacticalContext;
  dna: HiddenDNA;
  attributeScale?: 'ADULT_REFERENCE_1';
  attributes: VisibleAttributes;
  attributeKnowledge: Record<keyof VisibleAttributes, number>;
  morale: number;
  confidence: number;
  pressure: number;
  mentalFatigue: number;
  physicalCondition: number;
  reputation: number;
  marketValue: number;
  contractYearsLeft: number;
  transferIntent: TransferIntent;
  careerStats: CareerTotals;
  currentSeason: SeasonStats;
  seasonHistory: SeasonStats[];
  transferHistory: TransferRecord[];
  fanRelations: Record<string, FanRelation>;
  relationships: Record<string, Relationship>;
  history: CareerLogEntry[];
  rngState: number;
}

export interface CareerChoice {
  id: string;
  label: string;
  hint?: string;
}

export interface MatchFeedback {
  category?:CompetitionCategory;
  showScore?:boolean;
  opponent:string; coachName:string; started:boolean; minutes:number; goals:number; assists:number; rating:number;
  saves:number; cleanSheet:boolean; teamGoals:number; oppGoals:number;
  fanReaction:string; coachReaction:string; ratingReason?:string; groupReaction?:string;
  blockGames:number; blockStarts:number; blockGoals:number; blockAssists:number; blockMinutes:number;
}
export interface CareerEvent {
  decisionContext?:string;
  decisionFamily?:DecisionFamily;
  id: string;
  kind: 'INFO' | 'CHOICE' | 'MATCH' | 'SEASON_END' | 'MARKET' | 'MILESTONE';
  title: string;
  body: string;
  tags: string[];
  choices?: CareerChoice[];
  payload?: Record<string, unknown>;
  matchFeedback?:MatchFeedback;
}

export interface CareerLogEntry {
  turn: number;
  season: number;
  age: number;
  type: string;
  headline: string;
  detail: string;
  stateDelta?: Record<string, number | string>;
}

export interface SaveGame {
  version: string;
  createdAt: string;
  updatedAt: string;
  player: PlayerState;
  pendingEvent: CareerEvent | null;
}
