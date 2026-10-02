import {DECISION_CASES} from '../data/decision-cases.js';
import type {CareerEvent,CompetitionCategory,PlayerState} from './types.js';

export interface DecisionContext {title:string;situation:string;stakes:string[];}
const number=(n:number):string=>Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',');
// Rendering must never call migration/ensure helpers, which can write legacy state.
const category=(p:PlayerState):CompetitionCategory=>
 (p.professionalStatus==='SENIOR'||!p.professionalStatus&&(p.careerStats.appearances>0||p.age>20&&!!p.currentClubId))&&p.currentClubId?'SENIOR':p.age<=14?'U15':p.age<=15?'U17':p.age<=20?'U20':'AMATEUR';
const categoryNames:Record<CompetitionCategory,string>={U15:'Sub-15',U17:'Sub-17',U20:'Sub-20',SENIOR:'profissional',AMATEUR:'futebol local'};

/** Current observed facts beside the persisted situation; no simulation, DNA or state writes. */
export function decisionContext(p:PlayerState,e:CareerEvent):DecisionContext {
 const definition=DECISION_CASES.find(c=>c.id===e.decisionCaseId),title=definition?.title??'Próxima decisão';
 const saved=definition?(e.decisionContext??definition.situation):e.body;
 const prefix=`${title}. `;
 const result:DecisionContext={title,situation:saved.startsWith(prefix)?saved.slice(prefix.length):saved,stakes:[]};
 const cat=category(p),ctx=e.decisionCaseContext;
 if(ctx&&(ctx.clubId!==p.currentClubId||ctx.category!==cat||ctx.position!==p.position||ctx.season!==p.season||ctx.turn!==p.careerTurn))return result;
 const family=definition?.family??e.decisionFamily;
 const actions=definition?.choices.map(c=>c.action)??[];
 const add=(text:string)=>{if(result.stakes.length<2)result.stakes.push(text);};
 const condition=`Condição física ${number(p.physicalCondition)}/100; fadiga mental ${number(p.mentalFatigue)}/100 (menor é melhor).`;
 const groupId=`squad:${p.currentClubId??`local:${p.life?.localSchool??p.hometown}`}:${cat}`;
 const group=p.relationships[groupId]??(!p.squad?p.relationships[`group:${p.currentClubId??'local'}`]:undefined);
 if(family==='LOAD'){
  if(p.physicalCondition<75||p.mentalFatigue>35)add(condition);
  if(actions.includes('extra')){
   const skill=p.position==='GK'?'handling':p.position==='CB'?'positioning':p.position==='FB'?'crossing':p.position==='DM'?'tackling':p.position==='AM'?'vision':p.position==='WG'?'dribbling':p.position==='ST'?'finishing':'passing';
   const labels={handling:'Segurança nas mãos',positioning:'Posicionamento',crossing:'Cruzamento',tackling:'Desarme',vision:'Visão',dribbling:'Drible',finishing:'Finalização',passing:'Passe'};
   add(`${labels[skill]} adquirido: ${number(p.attributes[skill])}/99.`);
  }else if(actions.includes('focus')&&p.adaptationDebt>0)add(`Adaptação à função ainda pendente: ${number(p.adaptationDebt)}.`);
 }else if(family==='SPACE'){
  const m=e.matchFeedback;if(m&&(!m.category||m.category===cat))add(m.minutes===0?'Você ficou no banco, sem minutos nesta partida.':`Nesta partida: ${number(m.minutes)} minutos${m.started?', como titular':', entrando durante o jogo'}.`);
  const stats=p.currentSeason.season===p.season?p.currentSeason.categories?.[cat]:undefined;
  if(stats)add(`Nesta temporada em ${categoryNames[cat]}: ${stats.starts} titularidades em ${stats.appearances} participações.`);
 }else if(family==='PRESSURE'){
  const form=p.recentForm,c=form?.context;
  if((p.position==='ST'||p.position==='WG')&&c&&c.clubId===p.currentClubId&&c.category===cat&&c.position===p.position&&c.season===p.season){
   const observations=form!.observations.filter(o=>o.turn<=p.careerTurn&&o.minutes>0).slice(-8);
   if(observations.length){const total=observations.reduce((s,o)=>({minutes:s.minutes+o.minutes,goals:s.goals+o.goals,assists:s.assists+o.assists,xg:s.xg+o.xg}),{minutes:0,goals:0,assists:0,xg:0});add(`Últimas ${observations.length} atuações registradas neste contexto: ${total.goals} gols, ${total.assists} assistências em ${number(total.minutes)} minutos; xG observado ${number(total.xg)}.`);}
  }
  if(p.pressure>55)add(`Pressão pessoal atual: ${number(p.pressure)}/100; o resultado também depende do time.`);
 }else if(family==='RIVALRY'){
  if(group)add(`Neste grupo: respeito ${number(group.respect)}/100${group.resentment>0?`; ressentimento ${number(group.resentment)}/100`:''}.`);
 }else if(family==='ADAPTATION'){
  if(p.adaptationDebt>0)add(`Adaptação pendente à função atual: ${number(p.adaptationDebt)}.`);
 }else if(family==='PATH'){
  const priority=p.life?.education.priority;
  if(p.age<=18&&priority){const text=priority==='SCHOOL'?'Estudos priorizados: mais aprendizado de visão e decisão, menos tempo para técnica e físico.':priority==='FOOTBALL'?'Futebol priorizado: mais tempo para técnica e físico, menor reforço cognitivo da escola.':'Tempo dividido entre escola e futebol: ganhos cognitivos e prática seguem a prioridade equilibrada.';add(`Aos ${p.age} anos. ${text}`);}
  else if(p.age>18&&p.currentClubId&&actions.some(a=>a==='path'||a==='stable'))add(`Intenção atual: ${p.transferIntent==='STAY'?'permanecer no projeto':'ouvir alternativas'}; não representa uma proposta recebida.`);
 }else if(family==='LIFE'){
  add(condition);if(p.lifestyle)add(`Felicidade pessoal atual: ${number(p.lifestyle.happiness)}/100${p.lifestyle.happiness<35?' — baixa satisfação neste momento':''}.`);
 }else if(family==='SERVICE'){
  if(actions.includes('help')&&p.tactical){const bond=p.coaching?.bonds[p.tactical.coachId];if(bond)add(`Com o treinador atual: afinidade ${number(bond.affinity)}/100 e confiança profissional ${number(bond.trust)}/100.`);}
  if(actions.includes('team')&&group)add(`Respeito no grupo atual: ${number(group.respect)}/100.`);
 }
 return result;
}
