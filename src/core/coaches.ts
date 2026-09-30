import { POSITION_LABEL } from './positions.js';
import { seasonGames, competitionCategory } from './calendar.js';
import { REAL_COACHES, COACH_BY_ID, COACH_TENDENCIES } from '../data/coaches.js';
import { BRAZIL_CLUBS_2026, CLUB_BY_ID } from '../data/clubs-br-2026.js';
import { RNG, hashSeed, clamp } from './random.js';
import type { PlayerState, CoachProfile, CoachBond, CoachJob, CoachingWorld, Campaign, WorldFixture, CareerEvent, Club } from './types.js';

const GROUPS:Record<string,string[]>={};
for(const division of ['A','B','C','D']){
  const clubs=BRAZIL_CLUBS_2026.filter(c=>c.division===division).sort((a,b)=>a.state.localeCompare(b.state)||a.id.localeCompare(b.id));
  if(division==='D')for(let i=0;i<clubs.length;i+=8)GROUPS[`D${i/8+1}`]=clubs.slice(i,i+8).map(c=>c.id);
  else GROUPS[division]=clubs.map(c=>c.id);
}
const profileCache=new Map<string,CoachProfile>();
export function coachName(id:string):string{return COACH_BY_ID[id]?.name??'Treinador interino';}
/** Behaviour is explicitly simulation data, not a biographical psychological assessment. */
export function coachProfile(id:string):CoachProfile{
  const cached=profileCache.get(id);if(cached)return cached;
  const rng=new RNG(hashSeed(`coach-profile-v1:${id}`));
  const p:CoachProfile={youth:rng.int(35,88),mature:rng.int(35,88),integration:rng.int(35,88),recovery:rng.int(35,88),flexibility:rng.int(30,88),organisation:rng.int(40,88),patience:rng.int(25,85),dialogue:rng.int(25,85),discipline:rng.int(30,85),creativity:rng.int(30,85),preferredRole:rng.pick(['BALANCED','MOBILE','HOLD']),preferredPosition:rng.pick(['CB','FB','DM','CM','AM','WG','ST']),style:rng.pick(['POSSESSION','DIRECT','DEFENSIVE'])};
  Object.assign(p,COACH_TENDENCIES[id]?.values);
  profileCache.set(id,p);return p;
}
const strength=(c:Club)=>c.prestige*.7+c.finance*.3;
function resetCampaigns(w:CoachingWorld,season:number):void{
  w.season=season;w.completedBlocks=0;w.progress=0;w.campaigns={};
  for(const [group,ids] of Object.entries(GROUPS)){
    const ordered=[...ids].sort((a,b)=>strength(CLUB_BY_ID[b]!)-strength(CLUB_BY_ID[a]!));
    const mean=ids.reduce((sum,id)=>sum+strength(CLUB_BY_ID[id]!),0)/ids.length;
    for(const id of ids)w.campaigns[id]={clubId:id,group,games:0,points:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,form:[],expectedRank:ordered.indexOf(id)+1,expectedPPG:clamp(1.35+(strength(CLUB_BY_ID[id]!)-mean)/50,.8,2.1)};
    for(const id of ids)if(w.jobs[id])w.jobs[id]!.expectedPPG=w.campaigns[id]!.expectedPPG;
  }
}
export function ensureCoaching(p:PlayerState):CoachingWorld{
  if(!p.coaching){
    const w:CoachingWorld={season:p.season,completedBlocks:0,seed:hashSeed(`world:${p.id}`),campaigns:{},jobs:{},bonds:{},changes:[],pendingChange:null};p.coaching=w;resetCampaigns(w,p.season);
    // Appointments are fictional. Initialise relevant top-flight projects; others are materialised on observation.
    for(const c of BRAZIL_CLUBS_2026.filter(c=>c.division==='A'))ensureCoachJob(p,c.id);
  }
  if(p.coaching.season!==p.season)resetCampaigns(p.coaching,p.season);
  return p.coaching;
}
export function ensureCoachJob(p:PlayerState,clubId:string):CoachJob{
  const w=p.coaching??ensureCoaching(p);const existing=w.jobs[clubId];if(existing)return existing;
  const c=CLUB_BY_ID[clubId]!;const occupied=new Set(Object.values(w.jobs).map(j=>j.coachId));
  const rng=new RNG(hashSeed(`appointment:${w.seed}:${clubId}:${p.season}:${p.careerTurn}:${w.changes.length}`));
  let available=REAL_COACHES.filter(x=>!x.historicalOnly&&!occupied.has(x.id));
  if(c.division!=='A'){
    const local=available.filter(x=>x.market!=='GLOBAL');if(local.length)available=local;
  }
  const candidates=available.map(x=>{
    const profile=coachProfile(x.id);const familiarity=x.market==='BRAZIL'?20:x.market==='REGIONAL'?c.division==='A'?-15:25:c.finance>=65?10:-35;
    const crisis=(w.campaigns[clubId]?.points??0)/Math.max(1,w.campaigns[clubId]?.games??0)<(w.campaigns[clubId]?.expectedPPG??1.35)-.3;
    return {id:x.id,score:familiarity+(crisis?profile.organisation*.25+profile.recovery*.15:profile.youth*c.youth/250)+rng.float(0,20)};
  }).sort((a,b)=>b.score-a.score);
  const coachId=candidates[0]?.id??`interim:${clubId}`;
  const boardRng=new RNG(hashSeed(`board:${w.seed}:${clubId}`));
  const job:CoachJob={coachId,sinceSeason:p.season,sinceTurn:p.careerTurn,games:0,points:0,boardPatience:boardRng.int(35,80),backing:70,expectedPPG:w.campaigns[clubId]?.expectedPPG??1.35,previousRank:w.campaigns[clubId]?.expectedRank??10};
  w.jobs[clubId]=job;return job;
}
export function coachBond(p:PlayerState,id:string):CoachBond{
  const w=ensureCoaching(p);return w.bonds[id]??(w.bonds[id]={affinity:50,trust:55,conflict:0,memories:[]});
}
export function syncCoachContext(p:PlayerState):void{
  if(!p.currentClubId)return;const job=ensureCoachJob(p,p.currentClubId);const profile=coachProfile(job.coachId),bond=coachBond(p,job.coachId);
  if(p.tactical?.coachId!==job.coachId)p.tactical={coachId:job.coachId,role:profile.preferredRole,support:.25+profile.organisation*.003+profile.creativity*.002,trust:bond.trust,discussedFor:null};
  else p.tactical.trust=bond.trust;
}
export function standings(p:PlayerState,clubId:string):Campaign[]{
  const w=ensureCoaching(p),group=w.campaigns[clubId]!.group;
  return Object.values(w.campaigns).filter(c=>c.group===group).sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||a.clubId.localeCompare(b.clubId));
}
export function jobStability(job:CoachJob):string{return job.backing<32?'Muito pressionado':job.backing<50?'Pressionado':job.backing<68?'Sob avaliação':'Respaldado';}
export function objective(p:PlayerState,id:string):string{
  const campaign=ensureCoaching(p).campaigns[id]!,count=GROUPS[campaign.group]!.length;
  return campaign.expectedRank<=2?'Disputar o título':campaign.expectedRank<=Math.ceil(count*.3)?'Disputar as primeiras posições':campaign.expectedRank>=Math.ceil(count*.75)?'Evitar as últimas posições':'Consolidar campanha na metade superior';
}
export function bondLabel(b:CoachBond):string{return b.conflict>=55&&b.affinity<40?'Relação conflituosa':b.affinity>=65?'Boa relação':b.affinity<40?'Relação distante':'Relação em construção';}
export function coachDossier(p:PlayerState,id:string):string{
  const job=ensureCoachJob(p,id),profile=coachProfile(job.coachId),c=ensureCoaching(p).campaigns[id]!,rank=standings(p,id).findIndex(x=>x.clubId===id)+1;
  const skills:[string,number][]=[['desenvolvimento de jovens',profile.youth],['gestão de jogadores maduros',profile.mature],['integração de recém-chegados e estrangeiros',profile.integration],['recuperação de confiança',profile.recovery],['reconversão',profile.flexibility],['organização tática',profile.organisation]];
  const ordered=skills.sort((a,b)=>b[1]-a[1]);const bond=p.coaching!.bonds[job.coachId];
  const role=profile.preferredRole==='HOLD'?'mais fixa':profile.preferredRole==='MOBILE'?'mais móvel':'equilibrada';
  return `${coachName(job.coachId)} · ${jobStability(job)}. Objetivo: ${objective(p,id)}. ${c.games?`${rank}º · ${c.points} pontos em ${c.games} jogos · últimos jogos: ${c.form.map(x=>x===3?'V':x===1?'E':'D').join(' ')}.`:'Campanha ainda sem jogos.'} Perfil de jogo: destaca-se em ${ordered[0]![0]}; menor apoio em ${ordered[ordered.length-1]![0]}. ${profile.dialogue>=60?'Aberto ao diálogo':'Mais firme na negociação'}; ${profile.patience>=60?'paciente com adaptação':'cobra resposta rápida'}; função preferida ${role}, com preferência por ${POSITION_LABEL[profile.preferredPosition]}. Estilo de jogo: ${profile.style==='POSSESSION'?'posse':profile.style==='DIRECT'?'verticalidade':'organização defensiva'}.${bond?` Reencontro: ${bondLabel(bond)}; confiança profissional ${bond.trust>=65?'alta':bond.trust<40?'baixa':'em construção'}.`:''}`;
}
export function roleProspect(p:PlayerState,id:string):string{
  const j=ensureCoachJob(p,id),profile=coachProfile(j.coachId),bond=p.coaching!.bonds[j.coachId];
  const ageSupport=p.age<=21?profile.youth:p.age>=30?profile.mature:60;
  return `${ageSupport>=65?'Apoio forte à sua fase de carreira':ageSupport<45?'Menor apoio à sua fase de carreira':'Apoio moderado à sua fase de carreira'}${bond&&bond.trust<40?' · precisa recuperar confiança profissional':''} · espaço será disputado, sem titularidade garantida`;
}
export function opportunityAdjustment(p:PlayerState):number{
  syncCoachContext(p);if(!p.tactical)return 0;const profile=coachProfile(p.tactical.coachId),bond=coachBond(p,p.tactical.coachId);
  const ageSupport=p.age<=21?profile.youth:p.age>=30?profile.mature:60;
  const foreign=(p.nationality??'Brazil')!==(CLUB_BY_ID[p.currentClubId!]?.country??'Brazil');
  return (bond.trust-55)/250+(ageSupport-60)/400+(profile.preferredPosition===p.position? .03:0)+(foreign?(profile.integration-60)/450:0);
}
export function rememberCoach(p:PlayerState,text:string,affinity:number,trust:number,conflict:number):void{
  syncCoachContext(p);if(!p.tactical)return;const b=coachBond(p,p.tactical.coachId);b.affinity=clamp(b.affinity+affinity);b.trust=clamp(b.trust+trust);b.conflict=clamp(b.conflict+conflict);b.memories.unshift(`${p.season}: ${text}`);b.memories=b.memories.slice(0,16);p.tactical.trust=b.trust;
}
export function performanceFeedback(p:PlayerState,rating:number,red:boolean):void{
  syncCoachContext(p);if(!p.tactical)return;const profile=coachProfile(p.tactical.coachId),bond=coachBond(p,p.tactical.coachId);
  bond.trust=clamp(bond.trust+(rating-6.5)*1.3-(red?profile.discipline/45:0));p.tactical.trust=bond.trust;
  if(red)rememberCoach(p,'Expulsão gerou cobrança',-2,-1,3);
  if(rating>=8)rememberCoach(p,'Atuação decisiva reforçou confiança',2,1,-1);
  if(rating<6.2){p.confidence=clamp(p.confidence-(100-profile.patience)/150);p.pressure=clamp(p.pressure+(100-profile.recovery)/160);}
}
/** A deterministic decision from evidence; no random dismissal roll. */
export function evaluateCoachJob(job:CoachJob,campaign:Campaign,rank:number,count:number):{dismiss:boolean;reason:string}{
  if(job.games<8)return {dismiss:false,reason:'Período mínimo de avaliação'};
  const tenurePPG=job.points/job.games,seasonPPG=campaign.points/Math.max(1,campaign.games);
  const recentPPG=campaign.form.slice(-Math.min(6,job.games)).reduce((a,b)=>a+b,0)/Math.max(1,Math.min(campaign.form.length,job.games));
  const deficit=Math.max(0,job.expectedPPG-tenurePPG),seasonDeficit=Math.max(0,job.expectedPPG-seasonPPG);
  const rankDeficit=Math.max(0,rank-campaign.expectedRank)/count;
  job.backing=clamp(78-deficit*42-seasonDeficit*16-Math.max(0,job.expectedPPG-recentPPG)*18-rankDeficit*24+(job.boardPatience-55)*.45+Math.max(0,tenurePPG-job.expectedPPG)*18);
  const dismiss=job.backing<25&&deficit>.3;
  return {dismiss,reason:`${rank}º lugar; ${campaign.points} pontos em ${campaign.games} jogos; objetivo ${campaign.expectedRank}º; últimos seis: ${campaign.form.map(x=>x===3?'V':x===1?'E':'D').join(' ')}; desempenho do trabalho ${tenurePPG.toFixed(2)} ponto/jogo, esperado ${job.expectedPPG.toFixed(2)}`};
}
const scheduleCache=new Map<number,[string,string][][]>();
function schedule(ids:string[],seed:number):[string,string][][]{
  const cached=scheduleCache.get(seed);if(cached)return cached;
  const rng=new RNG(seed);const order=ids.map(id=>({id,k:rng.next()})).sort((a,b)=>a.k-b.k).map(x=>x.id);if(order.length%2)order.push('BYE');
  const rounds:[string,string][][]=[];const n=order.length;
  for(let r=0;r<n-1;r++){const pairs:[string,string][]=[];for(let i=0;i<n/2;i++){const a=order[i]!,b=order[n-1-i]!;if(a!=='BYE'&&b!=='BYE')pairs.push(r%2?[b,a]:[a,b]);}rounds.push(pairs);order.splice(1,0,order.pop()!);}
  const all=[...rounds,...rounds.map(pairs=>pairs.map(([a,b]):[string,string]=>[b,a]))];if(scheduleCache.size>=256)scheduleCache.clear();scheduleCache.set(seed,all);return all;
}
function poisson(rng:RNG,lambda:number):number{const limit=Math.exp(-lambda);let n=0,prob=1;do{n++;prob*=rng.next();}while(prob>limit&&n<12);return n-1;}
function record(c:Campaign,gf:number,ga:number):number{
  const pts=gf>ga?3:gf===ga?1:0;c.games++;c.points+=pts;c.goalsFor+=gf;c.goalsAgainst+=ga;c.wins+=pts===3?1:0;c.draws+=pts===1?1:0;c.losses+=pts===0?1:0;c.form.push(pts);c.form=c.form.slice(-6);return pts;
}
export function simulateWorldBlock(p:PlayerState):WorldFixture[]{
  const w=ensureCoaching(p),block=p.seasonTurn;const playerFixtures:WorldFixture[]=[];
  if(block<=w.completedBlocks)return playerFixtures;
  // Legacy saves reconstruct missing rounds without attributing retrospective player appearances.
  for(let b=w.completedBlocks+1;b<=block;b++){
    const previousProgress=w.progress??0;w.progress=Math.min(1,previousProgress+1/seasonGames(p));
    const rng=new RNG(hashSeed(`scores:${w.seed}:${w.season}:${b}`));
    for(const [group,ids] of Object.entries(GROUPS)){
      const rounds=schedule(ids,hashSeed(`schedule:${w.seed}:${w.season}:${group}`));
      for(let r=Math.floor(previousProgress*rounds.length+1e-8);r<Math.floor(w.progress*rounds.length+1e-8);r++)for(const [homeId,awayId] of rounds[r]!){
        const home=CLUB_BY_ID[homeId]!,away=CLUB_BY_ID[awayId]!;
        const hp=w.jobs[homeId]?coachProfile(w.jobs[homeId]!.coachId).organisation:60,ap=w.jobs[awayId]?coachProfile(w.jobs[awayId]!.coachId).organisation:60;
        const playerAvailable=competitionCategory(p)==='SENIOR'&&!p.injury?.remainingBlocks;const visible=Object.values(p.attributes).reduce((a,b)=>a+b,0)/Object.keys(p.attributes).length;const contribution=playerAvailable?(visible-60)/350:0;
        const edge=clamp((strength(home)-strength(away))/80+(hp-ap)/400+(homeId===p.currentClubId?contribution:awayId===p.currentClubId?-contribution:0),-.55,.55);
        const fixture={homeId,awayId,homeGoals:poisson(rng,clamp(1.35+edge,.35,2.5)),awayGoals:poisson(rng,clamp(1.12-edge,.3,2.5))};
        const hpts=record(w.campaigns[homeId]!,fixture.homeGoals,fixture.awayGoals),apts=record(w.campaigns[awayId]!,fixture.awayGoals,fixture.homeGoals);
        if(w.jobs[homeId]){w.jobs[homeId]!.games++;w.jobs[homeId]!.points+=hpts;}if(w.jobs[awayId]){w.jobs[awayId]!.games++;w.jobs[awayId]!.points+=apts;}
        if(b===block&&competitionCategory(p)==='SENIOR'&&(homeId===p.currentClubId||awayId===p.currentClubId))playerFixtures.push(fixture);
      }
    }
    w.completedBlocks=b;
  }
  return playerFixtures;
}
export function reviewWorldCoaches(p:PlayerState):void{
  const w=ensureCoaching(p);
  const tables:Record<string,Campaign[]>={};
  for(const [id,job] of Object.entries(w.jobs)){
    const group=w.campaigns[id]!.group;const table=tables[group]??(tables[group]=standings(p,id)),rank=table.findIndex(c=>c.clubId===id)+1;const review=evaluateCoachJob(job,w.campaigns[id]!,rank,table.length);
    if(!review.dismiss)continue;
    const oldCoachId=job.coachId;delete w.jobs[id];const next=ensureCoachJob(p,id);
    // Exclude the just-dismissed coach even when he scores highest for this vacancy.
    if(next.coachId===oldCoachId){delete w.jobs[id];const occupied=new Set(Object.values(w.jobs).map(x=>x.coachId));const candidate=REAL_COACHES.find(x=>!x.historicalOnly&&x.id!==oldCoachId&&!occupied.has(x.id)&&(CLUB_BY_ID[id]!.division==='A'||x.market!=='GLOBAL'));next.coachId=candidate?.id??`interim:${id}`;w.jobs[id]=next;}
    const change={clubId:id,oldCoachId,newCoachId:next.coachId,season:p.season,turn:p.careerTurn,reason:review.reason};w.changes.unshift(change);w.changes=w.changes.slice(0,160);
    if(id===p.currentClubId&&competitionCategory(p)==='SENIOR'){w.pendingChange=change;p.history.unshift({turn:p.careerTurn,season:p.season,age:p.age,type:'TREINADOR',headline:`${coachName(oldCoachId)} deixou o comando`,detail:review.reason});p.history=p.history.slice(0,220);syncCoachContext(p);}
  }
}
export function coachChangeEvent(p:PlayerState):CareerEvent|null{
  const w=ensureCoaching(p),change=w.pendingChange;if(!change)return null;
  if(change.clubId!==p.currentClubId){w.pendingChange=null;return null;}
  const former=coachBond(p,change.oldCoachId),next=coachBond(p,change.newCoachId);
  return {id:`coach-change-${change.turn}`,kind:'CHOICE',title:'A troca de comando muda seus planos?',body:`${coachName(change.oldCoachId)} saiu por desempenho: ${change.reason}. Sua relação com ele: ${bondLabel(former)}. Chega ${coachName(change.newCoachId)}; ${bondLabel(next)}. ${coachDossier(p,change.clubId)} Você pode rever sua permanência sem obrigação de se transferir.`,tags:['TREINADOR','CARREIRA'],choices:[{id:'coach:stay',label:'Permanecer e disputar espaço',hint:'Retirar pedido de saída e tentar o novo projeto'},{id:'coach:wait',label:'Conversar e avaliar o novo projeto',hint:'Ouvir o novo treinador antes de mudar sua intenção de mercado'},{id:'coach:leave',label:'Orientar o empresário a buscar propostas',hint:'Abrir o mercado; nenhuma transferência é automática'}]};
}
export function coachDiscussionEvent(p:PlayerState):CareerEvent{
  syncCoachContext(p);return {id:`coach-talk-${p.careerTurn}`,kind:'CHOICE',title:'Uma conversa sobre seu espaço',body:`${coachDossier(p,p.currentClubId!)} Você negocia o papel profissional, sem garantia de minutos.`,tags:['RELAÇÃO','PROJETO'],choices:[{id:'coach-talk:patient',label:'Aceitar adaptação e disputar espaço',hint:'Alinhar expectativas e construir confiança'},{id:'coach-talk:ask',label:'Pedir clareza sobre oportunidades',hint:'A resposta depende da abertura ao diálogo'},{id:'coach-talk:challenge',label:'Contestar o papel oferecido',hint:'Pode criar conflito; desempenho continua pesando na escalação'}]};
}
export function resolveCoachChoice(p:PlayerState,id:string):CareerEvent|null{
  if(id.startsWith('coach:')){
    ensureCoaching(p).pendingChange=null;
    if(id==='coach:stay'){p.transferIntent='STAY';rememberCoach(p,'Escolheu disputar espaço no novo projeto',2,1,-1);}
    if(id==='coach:leave'){p.transferIntent='LEAVE';rememberCoach(p,'Pediu ao empresário novos projetos',-2,0,2);}
    return id==='coach:wait'?coachDiscussionEvent(p):null;
  }
  syncCoachContext(p);const profile=coachProfile(p.tactical!.coachId);
  if(id==='coach-talk:patient')rememberCoach(p,'Alinhou uma adaptação gradual',4,2,-3);
  if(id==='coach-talk:ask')rememberCoach(p,profile.dialogue>=55?'Conversa esclareceu o papel':'Pedido de clareza encontrou resistência',profile.dialogue>=55?3:-2,0,profile.dialogue>=55?-2:3);
  if(id==='coach-talk:challenge')rememberCoach(p,'Contestou o papel proposto',-4,0,profile.dialogue<55?12:6);
  return null;
}
export function leagueTitle(p:PlayerState):string[]{
  if(!p.currentClubId||competitionCategory(p)!=='SENIOR')return [];const table=standings(p,p.currentClubId),first=table[0]!;
  if(first.clubId!==p.currentClubId||first.games===0)return [];
  return [`${first.group.startsWith('D')?'Liga de grupo experimental D':`Liga experimental Série ${first.group}`}`];
}
