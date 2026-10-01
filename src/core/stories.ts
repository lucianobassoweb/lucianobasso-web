import {CLUB_BY_ID} from '../data/clubs-br-2026.js';
import {POSITION_LABEL} from './positions.js';
import {coachName} from './coaches.js';
import {competitionCategory} from './calendar.js';
import type {CareerEvent, PlayerState, StoryChapter} from './types.js';

/** Observation only: no draws, bonuses, scouting promises or past reconstruction. */
export function ensureStories(p:PlayerState):void {
  p.story??={active:null,archive:[],lastObservedTurn:p.careerTurn,sequence:0};
  if(!p.story.active&&p.phase!=='APOSENTADO')openChapter(p);
}
function openChapter(p:PlayerState,comeback=false):void {
  const s=p.story!,category=competitionCategory(p);
  if(!comeback&&s.archive.some(c=>c.startedSeason===p.season&&c.clubId===p.currentClubId&&c.category===category&&c.kind!=='COMEBACK'))return;
  const kind=comeback?'COMEBACK':category==='SENIOR'?'REGULARITY':'FORMATION';
  const targetAppearances=kind==='COMEBACK'?2:3,targetMinutes=kind==='COMEBACK'?45:kind==='REGULARITY'?150:120;
  const targetGoodMatches=kind==='REGULARITY'?2:0;
  s.active={id:`story-${++s.sequence}`,kind,category,clubId:p.currentClubId,
    title:kind==='COMEBACK'?'Reconstruir a participação':kind==='REGULARITY'?'Sustentar presença em campo':category==='AMATEUR'?'Construir presença no futebol local':p.currentClubId?'Construir repertório na base':'Ganhar experiência na escolinha',
    objective:`Em até 8 rodadas desde a abertura: participar de ${targetAppearances} partidas e somar ${targetMinutes} minutos${targetGoodMatches?' com 2 notas de pelo menos 6,8':''}.`,
    startedSeason:p.season,startedTurn:p.careerTurn,deadlineTurn:p.careerTurn+8,
    appearances:0,minutes:0,goodMatches:0,targetAppearances,targetMinutes,targetGoodMatches};
}
function achieved(c:StoryChapter):boolean{return c.appearances>=c.targetAppearances&&c.minutes>=c.targetMinutes&&c.goodMatches>=c.targetGoodMatches;}
function closeChapter(p:PlayerState,reason:string):void {
  const s=p.story!,c=s.active;if(!c)return;
  const outcome=achieved(c)?'ACHIEVED':c.appearances>0?'PARTIAL':'UNMET';
  s.archive.push({...c,endedSeason:p.season,endedTurn:p.careerTurn,outcome,
    payoff:`${reason}: ${c.appearances} partidas, ${c.minutes} minutos${c.targetGoodMatches?`, ${c.goodMatches} notas ≥ 6,8`:''}. ${outcome==='ACHIEVED'?'Objetivo alcançado.':outcome==='PARTIAL'?'Participação parcial registrada.':'Sem participação em campo neste capítulo.'} Essas atuações ficam no seu histórico.`});
  s.archive=s.archive.slice(-60);
  s.active=null;
}
export interface StoryEvidence {appearances:number;minutes:number;rating:number;category:StoryChapter['category']}
/** Called after every accepted transition, including choices that open another event. */
export function updateStories(p:PlayerState,evidence?:StoryEvidence,comeback=false):void {
  ensureStories(p);const s=p.story!;
  if(comeback){closeChapter(p,'Um novo retorno começa');openChapter(p,true);}
  const c=s.active;
  if(c&&(c.startedSeason!==p.season||c.clubId!==p.currentClubId||c.category!==competitionCategory(p)||p.phase==='APOSENTADO'))closeChapter(p,'Mudança de etapa');
  if(p.careerTurn>s.lastObservedTurn){
    const active=s.active;
    if(active&&evidence&&evidence.category===active.category&&evidence.appearances>0&&evidence.minutes>0){
      active.appearances+=evidence.appearances;active.minutes+=evidence.minutes;
      if(evidence.rating>=6.8)active.goodMatches+=evidence.appearances;
    }
    s.lastObservedTurn=p.careerTurn;
  }
  if(s.active&&(achieved(s.active)||p.careerTurn>=s.active.deadlineTurn))closeChapter(p,achieved(s.active)?'Presença comprovada':'Prazo encerrado');
  if(!s.active&&p.phase!=='APOSENTADO')openChapter(p);
}

/** Capture only observable choice state; a match simulated later cannot enter this receipt. */
export function choiceSnapshot(p:PlayerState):Record<string,string|number> {
  const values:Record<string,string|number>={posição:p.position==='IND'?'Indefinida':POSITION_LABEL[p.position],clube:p.currentClubId?CLUB_BY_ID[p.currentClubId]?.name??p.currentClubId:'sem clube',fase:p.phase,
    confiança:p.confidence,moral:p.morale,pressão:p.pressure,'condição física':p.physicalCondition,'fadiga mental':p.mentalFatigue,
    'intenção de mercado':p.transferIntent,'abordagem de carreira':p.careerApproach??'STABILITY',
    'prioridade escolar':p.life?.education.priority??'BALANCED',observações:p.life?.scouting.observations??0,
    'testes realizados':p.life?.scouting.trialAttempts??0,'busca aguardando avaliação':p.life?.scouting.searchPriority?'sim':'não','resposta à posição proposta':p.youthPositionResponse?.decision==='INSIST'?'insistir':p.youthPositionResponse?.decision==='EXPERIMENT'?'experimentar':'não registrada',função:p.tactical?.role??'BALANCED',
    'plano de retorno':p.comebackPlan??'nenhum','situação profissional':p.professionalStatus??'YOUTH',
    'próximo percurso':p.life?.secondCareer?.path??'nenhum','anos de contrato':p.contractYearsLeft,
    'dívida de adaptação':p.adaptationDebt};
  for(const [id,bond] of Object.entries(p.coaching?.bonds??{})){
    values[`confiança de ${coachName(id)}`]=bond.trust;values[`afinidade com ${coachName(id)}`]=bond.affinity;values[`conflito com ${coachName(id)}`]=bond.conflict;
  }
  const labels:Record<string,string>={STAY:'permanecer',OPEN:'ouvir propostas',LEAVE:'buscar saída',FORCE:'forçar saída',STABILITY:'estabilidade',RESPONSIBILITY:'maior responsabilidade',SCHOOL:'estudos protegidos',FOOTBALL:'futebol prioritário',BALANCED:'equilíbrio',HOLD:'mais fixa',MOBILE:'maior mobilidade',GRADUAL:'gradual',COMPETE:'disputar espaço',YOUTH:'formação',INVITED:'convite ao profissional',SENIOR:'profissional',WORK:'buscar trabalho',TECHNICAL:'formação técnica',DEGREE:'formação superior',COACH_COURSE:'formação de treinador'};
  for(const key of Object.keys(values))if(typeof values[key]==='string')values[key]=labels[values[key]]??values[key];
  return values;
}
export function recordChoice(p:PlayerState,event:CareerEvent,choiceId:string,before:Record<string,string|number>,next:CareerEvent|null,previousLog:PlayerState['history'][number]|undefined):void {
  const after=choiceSnapshot(p),effects:string[]=[];
  for(const [key,value] of Object.entries(after))if(before[key]!==undefined&&before[key]!==value){
    const previous=before[key];effects.push(typeof value==='number'&&typeof previous==='number'?`${key}: ${previous.toFixed(1)} → ${value.toFixed(1)}`:`${key}: ${previous} → ${value}`);
  }
  if(next&&next.id!==event.id)effects.push(`Próxima decisão aberta: ${next.title}.`);
  const recent=p.history[0];
  const summary=next&&next.id!==event.id?`Você abriu a decisão: ${next.title}.`:recent&&recent!==previousLog?`${recent.headline}. ${recent.detail}`:effects[0]??'Escolha registrada; situação atual mantida.';
  p.lastChoiceResult={eventId:event.id,choiceId,label:event.choices!.find(c=>c.id===choiceId)!.label,season:p.season,turn:p.careerTurn,summary,effects};
}
