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
  scouting:fields({...numeric('observations trialAttempts lastAttemptSeason'),rejections:array(fields({season:number,clubId:text}))}),
  secondCareer:optional(fields({path:oneOf('WORK','TECHNICAL','DEGREE','COACH_COURSE'),status:oneOf('SEEKING_WORK','IN_TRAINING')}))});
const coachChange=fields({clubId:text,oldCoachId:text,newCoachId:text,season:number,turn:number,reason:text});
const coaching=fields({...numeric('season completedBlocks seed'),progress:optional(number),
  campaigns:map(fields({clubId:text,group:text,...numeric('games points wins draws losses goalsFor goalsAgainst expectedRank expectedPPG'),form:array(number)})),
  jobs:map(fields({coachId:text,...numeric('sinceSeason sinceTurn games points boardPatience backing expectedPPG previousRank')})),
  bonds:map(fields({...numeric('affinity trust conflict'),memories:array(text),promisedRole:optional(text)})),
  changes:array(coachChange),pendingChange:nullable(coachChange)});
const feedback=fields({opponent:text,coachName:text,fanReaction:text,coachReaction:text,started:boolean,cleanSheet:boolean,
  ...numeric('minutes goals assists rating saves teamGoals oppGoals blockGames blockStarts blockGoals blockAssists blockMinutes'),
  category:optional(category),showScore:optional(boolean)});
const event=fields({id:text,kind:oneOf('INFO','CHOICE','MATCH','SEASON_END','MARKET','MILESTONE'),title:text,body:text,tags:array(text),
  choices:optional(array(fields({id:text,label:text,hint:optional(text)}))),payload:optional(object),matchFeedback:optional(feedback)});
const player=fields({id:text,name:text,hometown:text,heartClubId:text,currentClubId:nullable(text),
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
/** The original mandatory fields are retained; later fields may be absent on legacy saves. */
const saveShape=fields({version:oneOf('0.1.0-playable.2'),createdAt:text,updatedAt:text,player,pendingEvent:nullable(event)});
function finiteValues(value:unknown,ancestors=new Set<object>()):boolean{
  if(typeof value==='number')return Number.isFinite(value);
  if(typeof value!=='object'||value===null)return true;
  if(ancestors.has(value))return false;
  ancestors.add(value);
  const valid=Object.values(value).every(v=>finiteValues(v,ancestors));ancestors.delete(value);return valid;
}
function validSave(value:unknown):value is SaveGame{return saveShape(value)&&finiteValues(value);}
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
  const save=inspect(stored.raw);if(save)report('loaded','');return save;
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
