export type Division = 'A' | 'B' | 'C' | 'D';
export type Foot = 'D' | 'E';
export type CareerPhase = 'ESCOLINHA' | 'BASE' | 'PROFISSIONAL' | 'AUGE' | 'VETERANO' | 'APOSENTADO';
export type PlayablePosition = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'WG' | 'ST';
export type Position = 'IND' | PlayablePosition;
export type TransferIntent = 'STAY' | 'OPEN' | 'LEAVE' | 'FORCE';

export interface Club {
  id: string;
  name: string;
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
  type: 'GOAL' | 'HATTRICK' | 'TITLE' | 'FLOP' | 'TRANSFER' | 'CELEBRATION' | 'RED_CARD' | 'CLASSIC' | 'REDEMPTION';
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
  education:{priority:EducationPriority;chosenFor:number|null;credits:number;completed:boolean};
  secondCareer?:{path:'WORK'|'TECHNICAL'|'DEGREE'|'COACH_COURSE';status:'SEEKING_WORK'|'IN_TRAINING'};
  scouting:{observations:number;trialAttempts:number;lastAttemptSeason:number;rejections:{season:number;clubId:string}[]};
}
export interface TacticalContext {
  coachId:string; role:TacticalRole; support:number; trust:number; discussedFor:number|null;
}
export interface PlayerState {
  id: string;
  name: string;
  birthYear: number;
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

export interface CareerEvent {
  id: string;
  kind: 'INFO' | 'CHOICE' | 'MATCH' | 'SEASON_END' | 'MARKET' | 'MILESTONE';
  title: string;
  body: string;
  tags: string[];
  choices?: CareerChoice[];
  payload?: Record<string, unknown>;
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
