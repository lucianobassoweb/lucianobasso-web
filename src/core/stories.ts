import {groupRelation,groupKey} from './group.js';
import {CLUB_BY_ID} from '../data/clubs-br-2026.js';
import {POSITION_LABEL} from './positions.js';
import {coachName} from './coaches.js';
import {competitionCategory} from './calendar.js';
import type {CareerEvent, PlayerState, StoryChapter, Position} from './types.js';

/** Observation only: no draws, bonuses, scouting promises or past reconstruction. */
export function ensureStories(p:PlayerState):void {
  p.story??={active:null,archive:[],lastObservedTurn:p.careerTurn,sequence:0};
  if(!p.story.active&&p.phase!=='APOSENTADO')openChapter(p);
}
function performanceLabel(position:Position):string {
  if(position==='ST')return 'atuações com gol e nota ≥ 7';
  if(position==='WG'||position==='AM')return 'atuações com G+A e nota ≥ 7';
  if(position==='GK')return 'atuações com nota ≥ 7 e sem sofrer gol ou 4 defesas';
  if(position==='CB'||position==='FB'||position==='DM')return 'atuações com nota ≥ 7 e time sofrendo no máximo 1 gol';
  if(position==='CM')return 'atuações com nota ≥ 7,2 ou assistência e nota ≥ 7';
  return 'atuações com nota ≥ 7,2';
}
function ambitiousSample(p:PlayerState):boolean {
  const f=p.recentForm,category=competitionCategory(p);
  if(!f||f.context.clubId!==p.currentClubId||f.context.category!==category||f.context.position!==p.position||f.context.season!==p.season)return false;
  const sample=f.observations.filter(m=>m.minutes>=45&&Number.isFinite(m.rating)).slice(-8);
  if(sample.length<4)return false;
  const strong=sample.filter(m=>p.position==='ST'?m.goals>=1&&m.rating>=7:
    p.position==='WG'||p.position==='AM'?m.goals+m.assists>=1&&m.rating>=7:m.rating>=7.5).length;
  return strong/sample.length>=0.5;
}
function openChapter(p:PlayerState,comeback=false):void {
  const s=p.story!,category=competitionCategory(p);
  if(p.position==='IND')return;
  if(!comeback&&s.archive.some(c=>c.startedSeason===p.season&&c.clubId===p.currentClubId&&c.category===category&&c.kind!=='COMEBACK'
    &&(c.challengeVersion!==1||c.position===p.position)))return;
  const kind=comeback?'COMEBACK':category==='SENIOR'?'REGULARITY':'FORMATION';
  const ambitious=!comeback&&ambitiousSample(p),window=ambitious?6:8;
  const targetAppearances=comeback?3:ambitious?5:4,targetMinutes=comeback?90:category==='SENIOR'?(ambitious?300:240):(ambitious?240:180);
  const targetGoodMatches=comeback?2:ambitious?3:2,minMatchMinutes=comeback?20:45,label=performanceLabel(p.position);
  s.active={id:`story-${++s.sequence}`,kind,category,clubId:p.currentClubId,
    challengeVersion:1,position:p.position,minMatchMinutes,performanceLabel:label,
    title:comeback?'Retomar ritmo e responder em campo':category==='SENIOR'?'Sustentar produção em campo':'Mostrar uma resposta na formação',
    objective:`Em ${window} rodadas: ${targetAppearances} participações de pelo menos ${minMatchMinutes} minutos, ${targetMinutes} minutos no total e ${targetGoodMatches} ${label}.`,
    startedSeason:p.season,startedTurn:p.careerTurn,deadlineTurn:p.careerTurn+window,
    appearances:0,minutes:0,goodMatches:0,targetAppearances,targetMinutes,targetGoodMatches};
}
function achieved(c:StoryChapter):boolean{return c.appearances>=c.targetAppearances&&c.minutes>=c.targetMinutes&&c.goodMatches>=c.targetGoodMatches;}
function closeChapter(p:PlayerState,reason:string):void {
  const s=p.story!,c=s.active;if(!c)return;
  const outcome=achieved(c)?'ACHIEVED':c.appearances>0?'PARTIAL':'UNMET';
  const performance=c.challengeVersion===1?`${c.goodMatches}/${c.targetGoodMatches} ${c.performanceLabel??performanceLabel(c.position??'IND')}`:`${c.goodMatches} notas ≥ 6,8`;
  s.archive.push({...c,endedSeason:p.season,endedTurn:p.careerTurn,outcome,
    payoff:`${reason}: ${c.appearances} partidas, ${c.minutes} minutos${c.targetGoodMatches?`, ${performance}`:''}. ${outcome==='ACHIEVED'?'Objetivo alcançado.':outcome==='PARTIAL'?(c.challengeVersion===1?'Objetivo não completado; resposta parcial registrada.':'Participação parcial registrada.'):(c.challengeVersion===1?'Sem participação suficiente em campo neste capítulo.':'Sem participação em campo neste capítulo.')} Essas atuações ficam no seu histórico.`});
  s.archive=s.archive.slice(-60);s.active=null;
}
export interface StoryEvidence {
  appearances:number;minutes:number;rating:number;category:StoryChapter['category'];
  position?:Position;goals?:number;assists?:number;saves?:number;cleanSheet?:boolean;oppGoals?:number;
}
function factualPerformance(position:Position,e:StoryEvidence):boolean {
  if(!Number.isFinite(e.rating))return false;
  const goals=Number.isFinite(e.goals)?e.goals!:0,assists=Number.isFinite(e.assists)?e.assists!:0;
  if(position==='ST')return goals>=1&&e.rating>=7;
  if(position==='WG'||position==='AM')return goals+assists>=1&&e.rating>=7;
  if(position==='GK')return e.rating>=7&&(e.cleanSheet===true||Number.isFinite(e.saves)&&e.saves!>=4);
  if(position==='CB'||position==='FB'||position==='DM')return e.rating>=7&&Number.isFinite(e.oppGoals)&&e.oppGoals!>=0&&e.oppGoals!<=1;
  if(position==='CM')return e.rating>=7.2||assists>=1&&e.rating>=7;
  return e.rating>=7.2;
}
/** Called after every accepted transition, including choices that open another event. */
export function updateStories(p:PlayerState,evidence?:StoryEvidence,comeback=false):void {
  ensureStories(p);const s=p.story!;
  // Duplicate delivery must not open a second return chapter in the same transition.
  if(comeback&&!(s.active?.kind==='COMEBACK'&&s.active.startedTurn===p.careerTurn||s.archive.some(c=>c.kind==='COMEBACK'&&c.startedTurn===p.careerTurn&&c.startedSeason===p.season&&c.clubId===p.currentClubId))){
    closeChapter(p,'Um novo retorno começa');openChapter(p,true);
  }
  const c=s.active;
  if(c&&(c.startedSeason!==p.season||c.clubId!==p.currentClubId||c.category!==competitionCategory(p)||p.phase==='APOSENTADO'
    ||c.challengeVersion===1&&c.position!==p.position))closeChapter(p,'Mudança de etapa');
  if(!s.active&&p.phase!=='APOSENTADO')openChapter(p);
  if(p.careerTurn>s.lastObservedTurn){
    const active=s.active;
    if(active&&(active.challengeVersion!==1||p.careerTurn<=active.deadlineTurn)&&evidence&&evidence.category===active.category&&evidence.appearances>0&&Number.isFinite(evidence.minutes)&&evidence.minutes>0){
      if(active.challengeVersion===1){
        if(evidence.position===active.position&&evidence.minutes>=(active.minMatchMinutes??45)){
          active.appearances++;active.minutes+=Math.min(120,evidence.minutes);
          if(factualPerformance(active.position??'IND',evidence))active.goodMatches++;
        }
      }else{
        active.appearances+=evidence.appearances;active.minutes+=evidence.minutes;
        if(evidence.rating>=6.8)active.goodMatches+=evidence.appearances;
      }
    }
    s.lastObservedTurn=p.careerTurn;
  }
  if(s.active&&(achieved(s.active)||p.careerTurn>=s.active.deadlineTurn))closeChapter(p,achieved(s.active)?(s.active.challengeVersion===1?'Resposta comprovada':'Presença comprovada'):'Prazo encerrado');
  if(!s.active&&p.phase!=='APOSENTADO')openChapter(p);
}

/** Capture only observable choice state; a match simulated later cannot enter this receipt. */
export function choiceSnapshot(p:PlayerState):Record<string,string|number> {
  const values:Record<string,string|number>={posição:p.position==='IND'?'Indefinida':POSITION_LABEL[p.position],clube:p.currentClubId?CLUB_BY_ID[p.currentClubId]?.name??p.currentClubId:'sem clube',fase:p.phase,
    confiança:p.confidence,moral:p.morale,pressão:p.pressure,'respeito do grupo':groupRelation(p).respect,capitania:p.squad?.contexts[groupKey(p)]?.captain?'sim':'não','felicidade pessoal':p.lifestyle?.happiness??50,peso:p.weightKg,'carga de sono':p.lifestyle?.sleepDebt??0,'condição física':p.physicalCondition,'fadiga mental':p.mentalFatigue,
    'intenção de mercado':p.transferIntent,'abordagem de carreira':p.careerApproach??'STABILITY',
    'prioridade escolar':p.life?.education.priority??'BALANCED',observações:p.life?.scouting.observations??0,
    'testes realizados':p.life?.scouting.trialAttempts??0,'busca aguardando avaliação':p.life?.scouting.searchPriority?'sim':'não','resposta à posição proposta':p.youthPositionResponse?.decision==='INSIST'?'insistir':p.youthPositionResponse?.decision==='EXPERIMENT'?'experimentar':'não registrada',função:p.tactical?.role??'BALANCED',
    'plano de retorno':p.comebackPlan??'nenhum','situação profissional':p.professionalStatus??'YOUTH',
    'próximo percurso':p.life?.secondCareer?.path??'nenhum','anos de contrato':p.contractYearsLeft,
    'dívida de adaptação':p.adaptationDebt,'experiência na posição':p.position==='IND'?0:p.positionProficiency[p.position]};
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
