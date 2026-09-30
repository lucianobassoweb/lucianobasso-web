import { clamp } from './random.js';
import type { HiddenDNA, PlayerState, PlayablePosition, PositionSeasonRecord, VisibleAttributes } from './types.js';

export const POSITIONS:PlayablePosition[]=['GK','CB','FB','DM','CM','AM','WG','ST'];
export const POSITION_LABELS:Record<PlayablePosition,string>={GK:'Goleiro',CB:'Zagueiro',FB:'Lateral',DM:'Volante',CM:'Meia central',AM:'Meia ofensivo',WG:'Ponta',ST:'Atacante'};

const PROFILE_WEIGHTS:Record<PlayablePosition,Partial<Record<keyof VisibleAttributes,number>>>={
  GK:{reflexes:.25,handling:.22,aerial:.16,positioning:.12,decisions:.10,passing:.07,strength:.05,technique:.03},
  CB:{positioning:.18,tackling:.19,heading:.15,strength:.14,decisions:.12,passing:.09,pace:.07,aerial:.06},
  FB:{pace:.17,stamina:.16,tackling:.14,crossing:.15,positioning:.11,passing:.10,technique:.09,decisions:.08},
  DM:{positioning:.16,tackling:.15,passing:.16,decisions:.15,vision:.12,stamina:.11,strength:.08,technique:.07},
  CM:{passing:.18,vision:.17,decisions:.15,technique:.14,stamina:.10,positioning:.09,dribbling:.08,tackling:.05,crossing:.04},
  AM:{vision:.19,passing:.16,technique:.16,dribbling:.14,decisions:.13,finishing:.09,pace:.07,positioning:.06},
  WG:{pace:.18,dribbling:.19,technique:.15,crossing:.13,finishing:.12,decisions:.08,vision:.08,stamina:.07},
  ST:{finishing:.22,positioning:.16,pace:.13,heading:.11,strength:.11,technique:.10,decisions:.09,dribbling:.08}
};

const DNA_FIT_WEIGHTS:Record<PlayablePosition,Partial<Record<keyof HiddenDNA,number>>>={
  GK:{reflexAptitude:.28,aerialAptitude:.17,gameIntelligence:.14,coordination:.15,pressureResponse:.10,learningPlasticity:.06,injuryResistance:.04,adultHeightCm:.06},
  CB:{defensiveAptitude:.23,aerialAptitude:.15,gameIntelligence:.17,staminaAptitude:.10,pressureResponse:.08,coordination:.07,adultHeightCm:.10,injuryResistance:.05,learningPlasticity:.05},
  FB:{accelerationAptitude:.20,staminaAptitude:.18,defensiveAptitude:.15,technicalAptitude:.13,gameIntelligence:.11,coordination:.10,learningPlasticity:.07,adaptability:.06},
  DM:{gameIntelligence:.21,defensiveAptitude:.18,staminaAptitude:.14,technicalAptitude:.13,pressureResponse:.09,coordination:.08,learningPlasticity:.09,leadership:.08},
  CM:{gameIntelligence:.24,technicalAptitude:.20,staminaAptitude:.10,coordination:.12,learningPlasticity:.12,pressureResponse:.08,consistency:.08,adaptability:.06},
  AM:{gameIntelligence:.23,technicalAptitude:.23,coordination:.14,finishingAptitude:.08,accelerationAptitude:.07,learningPlasticity:.10,pressureResponse:.08,consistency:.07},
  WG:{accelerationAptitude:.22,technicalAptitude:.19,coordination:.17,finishingAptitude:.09,staminaAptitude:.08,learningPlasticity:.09,gameIntelligence:.08,adaptability:.08},
  ST:{finishingAptitude:.24,accelerationAptitude:.12,aerialAptitude:.12,technicalAptitude:.12,gameIntelligence:.11,pressureResponse:.10,coordination:.08,adultHeightCm:.06,consistency:.05}
};

const POSITION_PRIOR:Record<PlayablePosition,number>={GK:-1,CB:0,FB:0,DM:1,CM:0,AM:.7,WG:-.5,ST:1};

function normalizedDNAValue(key:keyof HiddenDNA,value:HiddenDNA[keyof HiddenDNA]):number{
  if(key==='adultHeightCm')return clamp(((Number(value)-160)/42)*100,0,100);
  if(key==='dominantFoot')return 50;
  return Number(value);
}

function rawPositionCompatibility(player:PlayerState,pos:PlayablePosition):number{
  const weights=DNA_FIT_WEIGHTS[pos];let score=0,total=0;
  for(const [k,w] of Object.entries(weights) as [keyof HiddenDNA,number][]) {score+=normalizedDNAValue(k,player.dna[k])*w;total+=w;}
  return score/Math.max(.001,total)+POSITION_PRIOR[pos];
}

/** Hidden natural fit. Diagnostic only; never show as a number in normal UI. */
export function positionCompatibility(player:PlayerState,pos:PlayablePosition):number{
  const best=Math.max(...POSITIONS.map(p=>rawPositionCompatibility(player,p)));
  const raw=rawPositionCompatibility(player,pos);
  return Number(clamp(91-(best-raw)*2.15,34,96).toFixed(1));
}

export function rankedNaturalPositions(player:PlayerState):{position:PlayablePosition;compatibility:number}[]{
  return POSITIONS.map(position=>({position,compatibility:positionCompatibility(player,position)})).sort((a,b)=>b.compatibility-a.compatibility);
}

export function roleRating(player:PlayerState,pos:PlayablePosition):number{
  const weights=PROFILE_WEIGHTS[pos];let score=0,total=0;
  for(const [k,w] of Object.entries(weights) as [keyof VisibleAttributes,number][]) {score+=player.attributes[k]*w;total+=w;}
  return Number((score/Math.max(.001,total)).toFixed(1));
}
export const positionalOverall=roleRating;

export function agePositionPressure(age:number):number{
  if(age<=12)return .05;if(age===13)return .10;if(age===14)return .24;if(age===15)return .43;
  if(age===16)return .68;if(age===17)return .90;if(age===18)return 1.08;if(age<=21)return 1.12;return 1.18;
}

export function positionEffectiveness(player:PlayerState,pos:PlayablePosition,competitionFactor=1):number{
  const fit=positionCompatibility(player,pos),pressure=agePositionPressure(player.age),prof=player.positionProficiency[pos]??25;
  const fitEffect=1+((fit-70)/100)*.58*pressure*competitionFactor;
  const profEffect=.87+(prof/100)*.16;
  const debtEffect=1-clamp(player.adaptationDebt,0,70)/360;
  return clamp(fitEffect*profEffect*debtEffect,.62,1.14);
}

export function effectivePositionRating(player:PlayerState,pos:PlayablePosition):number{
  return Number(clamp(roleRating(player,pos)*positionEffectiveness(player,pos,1),20,99).toFixed(1));
}

export function developmentEfficiency(player:PlayerState,pos:PlayablePosition):number{
  const fit=positionCompatibility(player,pos),pressure=agePositionPressure(player.age);
  const fitLearning=1+((fit-70)/100)*.45*pressure;
  const adaptationLearning=1-clamp(player.adaptationDebt,0,70)/210;
  return clamp(fitLearning*adaptationLearning,.64,1.12);
}

export function positionTrainingMultiplier(pos:PlayablePosition,key:keyof VisibleAttributes):number{
  const w=PROFILE_WEIGHTS[pos][key]??0;
  return .72+w*3.7;
}

const AXIS:Record<PlayablePosition,[number,number]>={GK:[-2,0],CB:[0,0],FB:[0,2],DM:[1,0],CM:[2,0],AM:[3,0],WG:[3,2],ST:[4,0]};
export function positionDistance(a:PlayablePosition,b:PlayablePosition):number{
  if(a===b)return 0;if(a==='GK'||b==='GK')return 1.9;
  const [ax,ay]=AXIS[a],[bx,by]=AXIS[b];return clamp(Math.abs(ax-bx)*.23+Math.abs(ay-by)*.18,.18,1.25);
}

export function changeCost(age:number,from:PlayablePosition|null,to:PlayablePosition):number{
  if(!from||from===to)return 0;
  return Number(clamp(positionDistance(from,to)*30*agePositionPressure(age),0,70).toFixed(1));
}

export function choosePositionForSeason(p:PlayerState,to:PlayablePosition):PositionSeasonRecord{
  const from=p.position==='IND'?null:p.position,cost=changeCost(p.age,from,to);
  if(from&&from!==to){p.positionChanges++;if(!p.secondaryPositions.includes(from))p.secondaryPositions.push(from);}
  p.position=to;p.positionSeasonChosenFor=p.season;p.adaptationDebt=clamp(p.adaptationDebt+cost,0,70);
  if(from&&from!==to){const transfer=Math.max(0,(1-positionDistance(from,to)/1.9)*.22);p.positionProficiency[to]=clamp(p.positionProficiency[to]+Math.max(0,p.positionProficiency[from]-p.positionProficiency[to])*transfer,15,100);}
  const record:PositionSeasonRecord={season:p.season,age:p.age,position:to,previousPosition:from,startProficiency:Number(p.positionProficiency[to].toFixed(1)),endProficiency:Number(p.positionProficiency[to].toFixed(1)),changeCost:cost,hiddenCompatibility:positionCompatibility(p,to)};
  p.positionHistory.unshift(record);return record;
}

export function trainPositionExperience(p:PlayerState,matchBlocks=1):void{
  if(p.position==='IND')return;
  const ageFactor=p.age<=13?1.55:p.age<=15?1.32:p.age<=18?1.08:.78,learn=.80+p.dna.learningPlasticity/180;
  const gain=1.22*ageFactor*learn*matchBlocks*(1-p.adaptationDebt/240);
  p.positionProficiency[p.position]=clamp(p.positionProficiency[p.position]+gain,0,100);
  for(const other of POSITIONS){if(other===p.position)continue;const spill=Math.max(0,.13-positionDistance(p.position,other)*.08);if(spill>0)p.positionProficiency[other]=clamp(p.positionProficiency[other]+gain*spill,0,100);}
  const recovery=(p.age<=14?2.4:1.65)*matchBlocks*(.82+p.dna.adaptability/180);p.adaptationDebt=clamp(p.adaptationDebt-recovery,0,70);
  const r=p.positionHistory.find(x=>x.season===p.season&&x.position===p.position);if(r)r.endProficiency=Number(p.positionProficiency[p.position].toFixed(1));
}

export function positionChoiceHint(p:PlayerState,pos:PlayablePosition):string{
  const prof=Math.round(p.positionProficiency[pos]),current=p.position==='IND'?null:p.position,cost=changeCost(p.age,current,pos);
  if(!current)return `${POSITION_LABELS[pos]} · experimentar nesta temporada`;
  if(current===pos)return `${POSITION_LABELS[pos]} · experiência ${prof}/100 · continuidade favorece especialização`;
  if(p.age<=13)return `${POSITION_LABELS[pos]} · experiência ${prof}/100 · mudança quase sem custo nesta idade`;
  const severity=cost<5?'adaptação leve':cost<13?'adaptação moderada':cost<25?'adaptação relevante':'reconversão difícil';
  return `${POSITION_LABELS[pos]} · experiência ${prof}/100 · ${severity}`;
}

export function allPositions():PlayablePosition[]{return [...POSITIONS];}

// Compatibility aliases used by the current playable shell.
export const POSITION_LABEL=POSITION_LABELS;
export function changeCostPreview(p:PlayerState,to:PlayablePosition):number{
  return changeCost(p.age,p.position==='IND'?null:p.position,to);
}
export function changeCostLabel(cost:number):string{
  if(cost<2)return 'quase sem custo';
  if(cost<7)return 'adaptação leve';
  if(cost<16)return 'adaptação moderada';
  if(cost<28)return 'adaptação relevante';
  return 'reconversão difícil';
}
export function selectPosition(p:PlayerState,to:PlayablePosition):{changed:boolean;cost:number;previous:PlayablePosition|null}{
  const previous=p.position==='IND'?null:p.position;
  const rec=choosePositionForSeason(p,to);
  return {changed:previous!==null&&previous!==to,cost:rec.changeCost,previous};
}
export function trainPositionStep(p:PlayerState):void{trainPositionExperience(p,1);}
export function coachPositionFeedback(p:PlayerState):string{
  if(p.position==='IND')return 'Ainda é cedo para saber onde seu jogo se encaixa melhor.';
  if(p.age<=13)return 'Nesta idade, experimentar ainda custa pouco. O importante é conhecer o campo inteiro.';
  if(p.adaptationDebt>12)return 'A mudança ainda exige adaptação. O repertório anterior continua com você.';
  const suggestion=observedPositionSuggestion(p);
  if(suggestion)return `Pelo que você tem mostrado, vale conversar sobre jogar como ${POSITION_LABEL[suggestion]}. Isso precisa ser testado em campo.`;
  if(p.currentSeason.minutes<300)return 'Ainda faltam minutos para avaliar seu encaixe com segurança.';
  return p.currentSeason.avgRating>=7?'Suas atuações estão sustentando a continuidade nessa posição.':'Vamos avaliar sua função e o apoio do time antes de concluir que o problema é a posição.';
}

/** Coach suggestions use learned attributes and experience, never hidden compatibility. */
export function observedPositionSuggestion(p:PlayerState):PlayablePosition|null{
  if(p.position==='IND')return null;
  const current=p.position;
  const score=(pos:PlayablePosition)=>roleRating(p,pos)+(p.positionProficiency[pos]??0)*.045-positionDistance(current,pos)*2;
  const candidate=POSITIONS.filter(pos=>(current==='GK')===(pos==='GK')).sort((a,b)=>score(b)-score(a))[0]!;
  return candidate!==current&&score(candidate)>score(current)+1.5?candidate:null;
}
/** A role changes demands within a position, without giving attributes or reversing aging. */
export function tacticalRating(p:PlayerState,pos:PlayablePosition):number{
  const base=effectivePositionRating(p,pos);
  if(!p.tactical||pos==='GK')return base;
  const a=p.attributes;
  const mobility=(a.pace+a.stamina)/2;
  const reading=(a.positioning+a.decisions+a.technique)/3;
  const role=p.tactical.role;
  const adjustment=role==='HOLD'?(reading-mobility)*.12:role==='MOBILE'?(mobility-reading)*.12:0;
  return Number(clamp(base+adjustment,20,99).toFixed(1));
}
