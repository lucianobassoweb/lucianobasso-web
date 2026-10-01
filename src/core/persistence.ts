import {DECISION_CASES,caseActionId} from '../data/decision-cases.js';
import {migrateAttributeScale} from './attribute-scale.js';
import type { SaveGame } from './types.js';
const KEY='1903.save.playable2';

export interface PersistenceStatus {
  kind:'empty'|'loaded'|'saved'|'corrupt'|'unavailable'|'write-error'|'clear-error';
  message:string;
  recoveryAvailable:boolean;
}
let status:PersistenceStatus={kind:'empty',message:'',recoveryAvailable:false};
let recoveryRaw:string|null=null;
export const getPersistenceStatus=():PersistenceStatus=>({...status});
/** Exact rejected bytes, including an empty string; downloading does not erase them. */
export const getRecoveryRaw=():string|null=>recoveryRaw;
function report(kind:PersistenceStatus['kind'],message:string):void{
  status={kind,message,recoveryAvailable:recoveryRaw!==null};
}

type Guard=(value:unknown)=>boolean;
type Shape=Record<string,Guard>;
const object=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const text:Guard=v=>typeof v==='string';
const number:Guard=v=>typeof v==='number'&&Number.isFinite(v);
const boolean:Guard=v=>typeof v==='boolean';
const nullable=(guard:Guard):Guard=>v=>v===null||guard(v);
const optional=(guard:Guard):Guard=>v=>v===undefined||guard(v);
const oneOf=(...values:string[]):Guard=>v=>typeof v==='string'&&values.includes(v);
const array=(guard:Guard):Guard=>v=>Array.isArray(v)&&v.every(guard);
const fields=(shape:Shape):Guard=>v=>object(v)&&Object.entries(shape).every(([key,guard])=>guard(v[key]));
const map=(guard:Guard):Guard=>v=>object(v)&&Object.values(v).every(guard);
const numeric=(keys:string):Shape=>Object.fromEntries(keys.split(' ').map(key=>[key,number]));
const position=oneOf('GK','CB','FB','DM','CM','AM','WG','ST');
const category=oneOf('U15','U17','U20','AMATEUR','SENIOR');
const attributes=numeric('technique passing finishing dribbling vision decisions pace stamina strength positioning tackling crossing heading reflexes handling aerial');
const totals={...numeric('appearances starts minutes goals assists motm yellows reds saves cleanSheets xg xa'),titles:array(text)};
const categoryStats=fields({...numeric('appearances starts minutes goals assists avgRating'),motm:optional(number)});
const season=fields({...totals,...numeric('season age avgRating marketValueStart marketValueEnd'),clubId:nullable(text),
  categories:optional(v=>object(v)&&Object.entries(v).every(([key,value])=>category(key)&&categoryStats(value))),
  primaryPosition:optional(oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST')),
  positionsPlayed:optional(array(position)),positionAppearances:optional(v=>object(v)&&Object.entries(v).every(([key,value])=>position(key)&&number(value)))});
const life=fields({originState:text,residence:text,heartClubId:text,localSchool:text,
  family:fields({...numeric('resources availableTime relocationWillingness'),parents:array(text)}),
  childhood:oneOf('RUA','FUTSAL','ESCOLA','MULTIESPORTE'),
  education:fields({priority:oneOf('SCHOOL','BALANCED','FOOTBALL'),chosenFor:nullable(number),credits:number,completed:boolean,yearProgress:optional(number)}),
  scouting:fields({searchPriority:optional(boolean),lastSearchSeason:optional(v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=0),...numeric('observations trialAttempts lastAttemptSeason'),rejections:array(fields({season:number,clubId:text}))}),
  secondCareer:optional(fields({path:oneOf('WORK','TECHNICAL','DEGREE','COACH_COURSE'),status:oneOf('SEEKING_WORK','IN_TRAINING')}))});
const coachChange=fields({clubId:text,oldCoachId:text,newCoachId:text,season:number,turn:number,reason:text});
const coaching=fields({...numeric('season completedBlocks seed'),progress:optional(number),
  campaigns:map(fields({clubId:text,group:text,...numeric('games points wins draws losses goalsFor goalsAgainst expectedRank expectedPPG'),form:array(number)})),
  jobs:map(fields({coachId:text,...numeric('sinceSeason sinceTurn games points boardPatience backing expectedPPG previousRank')})),
  bonds:map(fields({...numeric('affinity trust conflict'),memories:array(text),promisedRole:optional(text)})),
  changes:array(coachChange),pendingChange:nullable(coachChange)});
const feedback=fields({opponent:text,coachName:text,fanReaction:text,coachReaction:text,started:boolean,cleanSheet:boolean,
  ...numeric('minutes goals assists rating saves teamGoals oppGoals blockGames blockStarts blockGoals blockAssists blockMinutes'),
  category:optional(category),showScore:optional(boolean),ratingReason:optional(text),groupReaction:optional(text),stateReaction:optional(text),opponentId:optional(text)});
const decisionFamily=oneOf('LOAD','SPACE','SERVICE','RIVALRY','PRESSURE','ADAPTATION','PATH','LIFE');
const natural:Guard=v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=0;
const caseContext=fields({clubId:nullable(text),category,position:oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST'),season:natural,turn:natural});
const eventFields=fields({decisionCaseId:optional(v=>text(v)&&DECISION_CASES.some(c=>c.id===v)),decisionCaseContext:optional(caseContext),decisionContext:optional(text),decisionFamily:optional(decisionFamily),id:text,kind:oneOf('INFO','CHOICE','MATCH','SEASON_END','MARKET','MILESTONE'),title:text,body:text,tags:array(text),
  choices:optional(array(fields({id:text,label:text,hint:optional(text)}))),payload:optional(object),matchFeedback:optional(feedback)});
const event:Guard=v=>eventFields(v)&&object(v)&&(v.decisionCaseId===undefined?v.decisionCaseContext===undefined:object(v.decisionCaseContext)&&DECISION_CASES.some(c=>c.id===v.decisionCaseId&&c.family===v.decisionFamily)&&Array.isArray(v.choices)&&v.choices.length===3&&new Set(v.choices.map(c=>object(c)?c.id:null)).size===3);
const chapterShape={challengeVersion:optional(v=>v===1),position:optional(oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST')),minMatchMinutes:optional(v=>number(v)&&Number(v)>=20&&Number(v)<=90),performanceLabel:optional(text),id:text,kind:oneOf('FORMATION','REGULARITY','COMEBACK'),title:text,objective:text,
  startedSeason:natural,startedTurn:natural,deadlineTurn:natural,clubId:nullable(text),category,
  appearances:natural,minutes:natural,goodMatches:natural,targetAppearances:natural,targetMinutes:natural,targetGoodMatches:natural};
const chapter:Guard=v=>fields(chapterShape)(v)&&object(v)&&Number(v.deadlineTurn)>Number(v.startedTurn)&&Number(v.targetAppearances)>0&&Number(v.targetMinutes)>0&&Number(v.goodMatches)<=Number(v.appearances)
  &&(v.challengeVersion!==1||position(v.position)&&number(v.minMatchMinutes)&&Number(v.minMatchMinutes)>=20&&Number(v.minMatchMinutes)<=90&&text(v.performanceLabel)&&Number(v.targetGoodMatches)>0&&Number(v.targetGoodMatches)<=Number(v.targetAppearances)&&Number(v.targetMinutes)>=Number(v.targetAppearances)*Number(v.minMatchMinutes));
const archivedChapter:Guard=v=>chapter(v)&&fields({endedSeason:natural,endedTurn:natural,outcome:oneOf('ACHIEVED','PARTIAL','UNMET'),payoff:text})(v)&&object(v)&&Number(v.endedTurn)>=Number(v.startedTurn);
const story=fields({active:nullable(chapter),archive:array(archivedChapter),lastObservedTurn:natural,sequence:natural});
const choiceResult=fields({eventId:text,choiceId:text,label:text,season:natural,turn:natural,summary:text,effects:array(text)});
const decisionMemory=fields({recentCases:optional(v=>Array.isArray(v)&&v.length<=20&&v.every(fields({id:text,turn:natural}))),recent:v=>Array.isArray(v)&&v.length<=3&&v.every(fields({family:decisionFamily,turn:natural})),lastOffered:v=>object(v)&&Object.keys(v).length<=8&&Object.entries(v).every(([key,value])=>decisionFamily(key)&&natural(value)),lastExtraTurn:optional(natural),lastResolvedEvent:optional(text),extraLoad:optional(v=>natural(v)&&Number(v)<=2)});
const bounded=(lo:number,hi:number):Guard=>v=>number(v)&&Number(v)>=lo&&Number(v)<=hi;
const formContext=fields({clubId:nullable(text),category,position:oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST'),season:natural});
const formObservation=fields({turn:natural,minutes:bounded(0,120),goals:v=>natural(v)&&Number(v)<=20,assists:v=>natural(v)&&Number(v)<=20,rating:bounded(0,10),xg:bounded(0,20),xa:bounded(0,20)});
const recentForm:Guard=v=>{
  if(!fields({context:formContext,lastObservedTurn:v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=-1,observations:v=>Array.isArray(v)&&v.length<=8&&v.every(formObservation)})(v)||!object(v)||!Array.isArray(v.observations))return false;
  const observations=v.observations;
  return observations.every((o,i)=>object(o)&&Number(o.turn)<=Number(v.lastObservedTurn)&&Number(o.minutes)>0&&(i===0||Number(o.turn)>Number(observations[i-1].turn)));
};

const youthPositionResponse=fields({season:v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=0,reviewedSeason:v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=0,clubId:nullable(text),category,position,recommendedPosition:position,decision:oneOf('INSIST','EXPERIMENT'),penalty:v=>number(v)&&Number(v)>=0&&Number(v)<=.16});
const lifestyle=fields({happiness:bounded(0,100),excessKg:bounded(0,12),sleepDebt:bounded(0,8),lastProcessedTurn:natural});
const squad=fields({version:oneOf('CONTEXT_1'),currentKey:optional(text),lastObservedTurn:natural,contexts:map(fields({appearances:natural,starts:natural,minutes:natural,captain:boolean,lastOfferedSeason:optional(natural),lastResolvedEvent:optional(text)}))});
const compensation=fields({kind:oneOf('AID','SALARY'),clubId:text,monthly:bounded(1,2500000),agreedSeason:natural,lastReviewedSeason:natural});
const stateKeys=['physicalCondition','mentalFatigue','pressure','confidence','morale','respect','happiness'];
const stateDelta=fields({turn:natural,season:natural,groupChanged:optional(boolean),values:v=>object(v)&&Object.entries(v).every(([key,n])=>stateKeys.includes(key)&&bounded(-100,100)(n))});
const emotionRecord=fields({turn:natural,result:oneOf('W','D','L'),position:oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST'),minutes:bounded(0,120),goals:v=>natural(v)&&Number(v)<=20,personalFailure:boolean});
const matchEmotions:Guard=v=>{if(!fields({context:fields({clubId:nullable(text),category,season:natural}),lastObservedTurn:v=>number(v)&&Number.isSafeInteger(v)&&Number(v)>=-1,observations:v=>Array.isArray(v)&&v.length<=8&&v.every(emotionRecord)})(v)||!object(v)||!Array.isArray(v.observations))return false;const observations=v.observations;return observations.every((r,i)=>object(r)&&Number(r.turn)<=Number(v.lastObservedTurn)&&(i===0||Number(r.turn)>Number(observations[i-1].turn)));};
const playerFields=fields({matchEmotions:optional(matchEmotions),lastStateDelta:optional(stateDelta),compensation:optional(compensation),lifestyle:optional(lifestyle),squad:optional(squad),attributeScale:optional(oneOf('ADULT_REFERENCE_1')),youthPositionResponse:optional(youthPositionResponse),recentForm:optional(recentForm),decisionMemory:optional(decisionMemory),story:optional(story),lastChoiceResult:optional(choiceResult),id:text,name:text,hometown:text,heartClubId:text,currentClubId:nullable(text),
  ...numeric('birthYear age season seasonTurn careerTurn adaptationDebt positionChanges heightCm weightKg morale confidence pressure mentalFatigue physicalCondition reputation marketValue contractYearsLeft rngState'),
  phase:oneOf('ESCOLINHA','BASE','PROFISSIONAL','AUGE','VETERANO','APOSENTADO'),position:oneOf('IND','GK','CB','FB','DM','CM','AM','WG','ST'),
  transferIntent:oneOf('STAY','OPEN','LEAVE','FORCE'),secondaryPositions:array(position),
  positionProficiency:fields(numeric('GK CB FB DM CM AM WG ST')),positionSeasonChosenFor:nullable(number),
  positionHistory:array(fields({...numeric('season age startProficiency endProficiency changeCost hiddenCompatibility'),position,previousPosition:nullable(position)})),
  dna:fields({...numeric('adultHeightCm weakFootPlasticity technicalAptitude gameIntelligence accelerationAptitude staminaAptitude coordination defensiveAptitude finishingAptitude aerialAptitude reflexAptitude physicalMaturationAge learningPlasticity pressureResponse consistency injuryResistance ambition adaptability leadership lateBloomer'),dominantFoot:oneOf('D','E')}),
  attributes:fields(attributes),attributeKnowledge:fields(attributes),careerStats:fields(totals),currentSeason:season,seasonHistory:array(season),
  transferHistory:array(fields({...numeric('season age fee marketValue'),fromClubId:nullable(text),toClubId:text})),
  fanRelations:map(fields({clubId:text,...numeric('passion hate fear respect expectation'),memories:array(fields({season:number,weight:number,type:text,description:text}))})),
  relationships:map(fields({personId:text,...numeric('affinity respect rivalry resentment'),memories:array(text)})),
  history:array(fields({...numeric('turn season age'),type:text,headline:text,detail:text})),
  life:optional(life),tactical:optional(fields({coachId:text,role:oneOf('BALANCED','MOBILE','HOLD'),support:number,trust:number,discussedFor:nullable(number)})),
  professionalStatus:optional(oneOf('YOUTH','INVITED','SENIOR')),coaching:optional(coaching)});
const player:Guard=v=>{
  if(!playerFields(v)||!object(v))return false;
  if(object(v.matchEmotions)&&(Number(v.matchEmotions.lastObservedTurn)>Number(v.careerTurn)||object(v.matchEmotions.context)&&Number(v.matchEmotions.context.season)>Number(v.season)))return false;
  if(object(v.decisionMemory)&&Array.isArray(v.decisionMemory.recentCases)&&v.decisionMemory.recentCases.some(r=>object(r)&&Number(r.turn)>Number(v.careerTurn)))return false;
  if(object(v.lastStateDelta)&&(Number(v.lastStateDelta.turn)>Number(v.careerTurn)||Number(v.lastStateDelta.season)>Number(v.season)))return false;
  if(object(v.compensation)){const pay=v.compensation;const senior=v.professionalStatus==='SENIOR'||v.professionalStatus===undefined&&(object(v.careerStats)&&Number(v.careerStats.appearances)>0||Number(v.age)>20&&!!v.currentClubId);if(pay.clubId!==v.currentClubId||Number(pay.agreedSeason)>Number(v.season)||Number(pay.lastReviewedSeason)>Number(v.season)||Number(pay.lastReviewedSeason)<Number(pay.agreedSeason)||pay.kind!==(senior?'SALARY':'AID')||Number(pay.monthly)<(senior?1500:150)||pay.kind==='AID'&&Number(pay.monthly)>3500)return false;}
  if(object(v.lifestyle)&&Number(v.lifestyle.lastProcessedTurn)>Number(v.careerTurn))return false;
  if(object(v.squad)){if(Number(v.squad.lastObservedTurn)>Number(v.careerTurn)||!object(v.squad.contexts))return false;for(const ctx of Object.values(v.squad.contexts)){if(!object(ctx)||Number(ctx.starts)>Number(ctx.appearances)||Number(ctx.minutes)>Number(ctx.appearances)*120||ctx.lastOfferedSeason!==undefined&&Number(ctx.lastOfferedSeason)>Number(v.season))return false;}}
  if(object(v.recentForm)&&Number(v.recentForm.lastObservedTurn)>Number(v.careerTurn))return false;
  if(object(v.youthPositionResponse)){const plan=v.youthPositionResponse;if(!Number.isSafeInteger(plan.season)||Number(plan.season)>Number(v.season)||Number(plan.reviewedSeason)!==Number(plan.season)-1||plan.decision==='EXPERIMENT'&&Number(plan.penalty)!==0||plan.decision==='INSIST'&&(plan.position===plan.recommendedPosition||Number(plan.penalty)<.08))return false;}
  const scouting=object(v.life)&&object(v.life.scouting)?v.life.scouting:null;
  return !scouting||scouting.lastSearchSeason===undefined||Number(scouting.lastSearchSeason)<=Number(v.season);
};

/** The original mandatory fields are retained; later fields may be absent on legacy saves. */
const saveShape=fields({version:oneOf('0.1.0-playable.2'),createdAt:text,updatedAt:text,player,pendingEvent:nullable(event)});
function finiteValues(value:unknown,ancestors=new Set<object>()):boolean{
  if(typeof value==='number')return Number.isFinite(value);
  if(typeof value!=='object'||value===null)return true;
  if(ancestors.has(value))return false;
  ancestors.add(value);
  const valid=Object.values(value).every(v=>finiteValues(v,ancestors));ancestors.delete(value);return valid;
}
function validSave(value:unknown):value is SaveGame{
  if(!saveShape(value)||!finiteValues(value))return false;
  const s=value as SaveGame,e=s.pendingEvent;
  if(e?.decisionCaseId){const definition=DECISION_CASES.find(c=>c.id===e.decisionCaseId)!;const category=e.matchFeedback?.category??e.decisionCaseContext?.category??'';
    if(!definition.choices.every((option,i)=>e.choices?.[i]?.id===caseActionId(option.action,s.player.age,s.player.currentClubId,category)))return false;
  }
  return true;
}
function inspect(raw:string):SaveGame|null{
  try{const parsed:unknown=JSON.parse(raw);if(validSave(parsed)){recoveryRaw=null;return parsed;}}catch{/* Preserve the exact input for manual recovery. */}
  recoveryRaw=raw;report('corrupt','A carreira salva não pôde ser lida. Baixe os dados originais para recuperação.');return null;
}
function readStored():{ok:true;raw:string|null}|{ok:false}{
  try{return {ok:true,raw:localStorage.getItem(KEY)};}
  catch{report('unavailable','O navegador não permitiu acessar o armazenamento. A carreira em memória pode ser perdida ao fechar.');return {ok:false};}
}
/** Recheck before every mutation, including changes made by another tab since loading. */
function canMutate():boolean{
  const stored=readStored();if(!stored.ok)return false;
  if(stored.raw===null){recoveryRaw=null;return true;}
  return inspect(stored.raw)!==null;
}
export function loadSave():SaveGame|null{
  const stored=readStored();if(!stored.ok)return null;
  if(stored.raw===null){recoveryRaw=null;report('empty','');return null;}
  const save=inspect(stored.raw);if(save){migrateAttributeScale(save.player);report('loaded','');}return save;
}
export function storeSave(save:SaveGame):boolean{
  try{
    if(!canMutate())return false;
    if(!validSave(save)){report('write-error','A carreira em memória contém dados inválidos e não foi gravada.');return false;}
    localStorage.setItem(KEY,JSON.stringify(save));report('saved','');return true;
  }catch(error){
    const quota=object(error)&&error.name==='QuotaExceededError';
    report('write-error',quota?'O armazenamento está cheio. Exporte a carreira ou tente salvar novamente.':'Não foi possível salvar. A carreira continua em memória; exporte os dados ou tente novamente.');return false;
  }
}
export function clearSave():boolean{
  try{if(!canMutate())return false;localStorage.removeItem(KEY);recoveryRaw=null;report('empty','');return true;}
  catch{report('clear-error','Não foi possível apagar a carreira. Os dados e a carreira em memória foram preservados.');return false;}
}
export function exportDiagnostic(save:SaveGame):void{
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),build:save.version,save},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`1903-diagnostico-${save.player.id}.json`;a.click();URL.revokeObjectURL(url);
}
