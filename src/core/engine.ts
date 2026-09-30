import { ensureProfessionalStatus, competitionCategory, CATEGORY_LABEL, seasonGames, calendarScale, promotionEvidence } from './calendar.js';
import { ensureCoaching, syncCoachContext, simulateWorldBlock, reviewWorldCoaches, coachChangeEvent, resolveCoachChoice, coachDossier, roleProspect, opportunityAdjustment, performanceFeedback, rememberCoach, coachProfile, leagueTitle, coachDiscussionEvent, coachName, coachBond } from './coaches.js';
import { ensureTransition, transitionEvent, transitionLoad, maybeInjury, injuryBlock, comebackEvent, legacyNarrative } from './transitions.js';
import { generateLife, ensureLife, observeLocally, scoutingCandidates, trialProbability, finishEducationYear, accrueEducation } from './pathways.js';
import { RNG, clamp, hashSeed } from './random.js';
import { generateDNA, initialAttributes, growthStep, updateBody, overall } from './dna.js';
import { POSITIONS, POSITION_LABEL, changeCostPreview, changeCostLabel, selectPosition, trainPositionStep, trainPositionExperience, effectivePositionRating, observedPositionSuggestion, tacticalRating, roleRating } from './positions.js';
import { BRAZIL_CLUBS_2026, CLUB_BY_ID } from '../data/clubs-br-2026.js';
import { simulatePlayerMatch, type MatchResult } from './match.js';
import type { CareerEvent, Club, FanRelation, PlayerState, PlayablePosition, SaveGame, SeasonStats, TransferIntent, VisibleAttributes, EducationPriority, TacticalRole, WorldFixture } from './types.js';

const VERSION='0.1.0-playable.2';
const ATTRIBUTE_LABELS:Record<keyof VisibleAttributes,string>={technique:'técnica',passing:'passe',finishing:'finalização',dribbling:'drible',vision:'visão',decisions:'decisão',pace:'velocidade',stamina:'resistência',strength:'força',positioning:'posicionamento',tackling:'desarme',crossing:'cruzamento',heading:'cabeceio',reflexes:'reflexos',handling:'segurança nas mãos',aerial:'jogo aéreo'};


const DIV_RANK:Record<string,number>={A:4,B:3,C:2,D:1};
const money=(v:number)=>v<1_000_000?`R$ ${(v/1000).toFixed(0)} mil`:`R$ ${(v/1_000_000).toFixed(v>=100_000_000?0:1)} mi`;

function emptySeason(season:number,age:number,clubId:string|null,market:number):SeasonStats{
  return {season,age,clubId,appearances:0,starts:0,minutes:0,goals:0,assists:0,motm:0,yellows:0,reds:0,saves:0,cleanSheets:0,xg:0,xa:0,avgRating:0,titles:[],marketValueStart:market,marketValueEnd:market};
}
function emptyCareer(){return {appearances:0,starts:0,minutes:0,goals:0,assists:0,motm:0,yellows:0,reds:0,saves:0,cleanSheets:0,xg:0,xa:0,titles:[] as string[]};}
function blankKnowledge():Record<keyof VisibleAttributes,number>{
  return {technique:4,passing:0,finishing:0,dribbling:4,vision:0,decisions:0,pace:6,stamina:0,strength:0,positioning:0,tackling:0,crossing:0,heading:0,reflexes:0,handling:0,aerial:0};
}
function initialProficiency():Record<PlayablePosition,number>{return {GK:20,CB:24,FB:25,DM:25,CM:26,AM:25,WG:25,ST:24};}

export function createCareerWithSeed(name:string,seed:number,heartClubId?:string,hometown?:string):SaveGame{
  const rng=new RNG(seed);const dna=generateDNA(rng);const life=generateLife(seed,hometown,heartClubId);
  const startHeight=Number(clamp(dna.adultHeightCm-rng.float(24,39)-(dna.physicalMaturationAge-16)*1.8,132,166).toFixed(1));
  const p:PlayerState={
    id:`p-${seed.toString(16)}`,name,birthYear:2014,age:12,season:2026,seasonTurn:0,careerTurn:0,phase:'ESCOLINHA',professionalStatus:'YOUTH',hometown:life.residence,life,
    heartClubId:life.heartClubId,currentClubId:null,position:'IND',secondaryPositions:[],positionProficiency:initialProficiency(),positionHistory:[],positionSeasonChosenFor:null,adaptationDebt:0,positionChanges:0,
    heightCm:startHeight,weightKg:Number(((startHeight-100)*.70).toFixed(1)),dna,attributes:initialAttributes(rng,dna),attributeKnowledge:blankKnowledge(),
    morale:68,confidence:55,pressure:12,mentalFatigue:8,physicalCondition:97,reputation:2,marketValue:0,contractYearsLeft:0,transferIntent:'STAY',
    careerStats:emptyCareer(),currentSeason:emptySeason(2026,12,null,0),seasonHistory:[],transferHistory:[],fanRelations:{},relationships:{},history:[],rngState:rng.state
  };
  // Childhood changes acquired repertoire, not genetic predispositions.
  const childhood=life.childhood;
  const learned:Partial<Record<keyof VisibleAttributes,number>>=childhood==='FUTSAL'?{technique:1.5,decisions:1}:childhood==='RUA'?{dribbling:1.5,technique:1}:childhood==='MULTIESPORTE'?{stamina:1.5,strength:1}:{passing:1.5,vision:1};
  for(const [key,gain] of Object.entries(learned))p.attributes[key as keyof VisibleAttributes]+=gain;
  return {version:VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),player:p,pendingEvent:{id:'intro',kind:'MILESTONE',title:'12 anos. Tudo começa agora.',body:`Você começa na ${life.localSchool}. Sua família: ${life.family.parents.join(" e ")}. Sua infância teve ${life.childhood.toLowerCase()}. As oportunidades serão descobertas a partir daqui.`,tags:['ESCOLINHA','DNA OCULTO']}};
}
export function createCareer(name:string,heartClubId?:string,hometown?:string):SaveGame{return createCareerWithSeed(name,hashSeed(`${name}|${Date.now()}|1903`),heartClubId,hometown);}

function log(p:PlayerState,type:string,headline:string,detail:string):void{p.history.unshift({turn:p.careerTurn,season:p.season,age:p.age,type,headline,detail});p.history=p.history.slice(0,220);}
function ensureFan(p:PlayerState,clubId:string):FanRelation{return p.fanRelations[clubId]??(p.fanRelations[clubId]={clubId,passion:0,hate:0,fear:0,respect:0,expectation:0,memories:[]});}
function addFanMemory(p:PlayerState,clubId:string,type:FanRelation['memories'][number]['type'],description:string,weight:number):void{
  const r=ensureFan(p,clubId);r.memories.unshift({season:p.season,weight,type,description});r.memories=r.memories.slice(0,16);
}
function revealAttribute(p:PlayerState,rng:RNG):keyof VisibleAttributes{
  const keys=Object.keys(p.attributeKnowledge) as (keyof VisibleAttributes)[];
  const sorted=[...keys].sort((a,b)=>p.attributeKnowledge[a]-p.attributeKnowledge[b]);
  const key=rng.pick(sorted.slice(0,5));p.attributeKnowledge[key]=clamp(p.attributeKnowledge[key]+rng.int(9,20),0,100);return key;
}

function positionChoiceEvent(p:PlayerState):CareerEvent{
  const ageText=p.age<=13?'Nesta idade, experimentar quase não cobra preço.':p.age<=15?'A especialização começa a importar, mas ainda há espaço para explorar.':p.age<=18?'Agora a escolha pesa: trocar exige adaptação e pode custar rendimento.':'A posição profissional já está consolidada.';
  return {id:`position-${p.season}`,kind:'CHOICE',title:`Onde você quer jogar aos ${p.age}?`,body:`Escolha a posição principal desta temporada. ${ageText} O jogo não revela qual delas combina melhor com seu DNA.`,tags:['FORMAÇÃO','POSIÇÃO'],choices:POSITIONS.map(pos=>({id:`position:${pos}`,label:POSITION_LABEL[pos],hint:p.position==='IND'?`${POSITION_LABEL[pos]} · experimentar`:p.position===pos?`${POSITION_LABEL[pos]} · experiência ${Math.round(p.positionProficiency[pos])}/100 · continuidade`:`${POSITION_LABEL[pos]} · ${changeCostLabel(changeCostPreview(p,pos))}`}))};
}

function assignYouthClub(p:PlayerState,rng:RNG):CareerEvent{
  const life=ensureLife(p);life.scouting.lastAttemptSeason=p.season;
  const candidates=scoutingCandidates(p,rng);
  const offers=candidates.map(c=>{
    const moving=c.city!==life.residence;
    const support=rng.chance(.25+c.youth/250);
    const familyAgrees=!moving||life.family.relocationWillingness+life.family.resources+(support?45:0)>=90;
    return {clubId:c.id,support,moving,familyAgrees};
  });
  return {id:`trial-${p.careerTurn}`,kind:'CHOICE',title:'Um convite para avaliação',body:'Um observador acompanhou seus jogos locais. O convite é para um teste, ainda sem vaga garantida. Sua família avalia deslocamento, estudos e apoio oferecido.',tags:['OBSERVAÇÃO','FAMÍLIA'],payload:{offers},choices:[...offers.filter(o=>o.familyAgrees).map(o=>({id:`trial:${o.clubId}`,label:`Fazer o teste no ${CLUB_BY_ID[o.clubId]!.name}`,hint:`${o.moving?'Deslocamento ou mudança':'Na sua cidade'} · ${o.support?'apoio de transporte e alojamento':'custos por conta da família'} · aprovação incerta`})),{id:'trial:stay',label:'Continuar na escolinha local',hint:'Seguir jogando e aguardar outra oportunidade'}]};
}
function educationEvent(p:PlayerState):CareerEvent{
  return {id:`education-${p.season}`,kind:'CHOICE',title:'Futebol e escola neste ano',body:'Você decide com sua família como conciliar os dois caminhos. Preservar os estudos reduz o tempo disponível para desenvolver o futebol e amplia suas opções depois da carreira.',tags:['ADOLESCÊNCIA','FUTURO'],choices:[{id:'education:SCHOOL',label:'Proteger os estudos',hint:'Mais progresso escolar; menos tempo de futebol'},{id:'education:BALANCED',label:'Conciliar escola e futebol',hint:'Manter os dois caminhos exige dividir o tempo'},{id:'education:FOOTBALL',label:'Priorizar o futebol',hint:'Mais tempo no futebol; maior risco de sair sem concluir a escola'}]};
}
function ensureTactical(p:PlayerState):void{syncCoachContext(p);}
function professionalRoleEvent(p:PlayerState):CareerEvent{
  ensureTactical(p);const suggestion=observedPositionSuggestion(p);
  return {id:`role-${p.season}`,kind:'CHOICE',title:'Seu papel no projeto do treinador',body:`${coachDossier(p,p.currentClubId!)} ${suggestion?`O treinador quer testar você como ${POSITION_LABEL[suggestion]}, a partir do que viu em campo. `:''}Você pode manter a posição, discutir outra ou ajustar sua função. Mudar depende da aceitação do treinador e exige adaptação; nenhum recurso adquirido será apagado.`,tags:['CARREIRA','FUNÇÃO'],choices:[{id:'role:stay',label:'Manter posição e função'},...POSITIONS.filter(pos=>pos!==p.position).map(pos=>({id:`reconvert:${pos}`,label:`${pos===suggestion?'Testar a sugestão:':'Pedir para jogar como'} ${POSITION_LABEL[pos]}`,hint:changeCostLabel(changeCostPreview(p,pos))})),{id:'role:HOLD',label:'Negociar uma função mais fixa',hint:'Menor peso da mobilidade, maior peso de leitura e técnica'},{id:'role:MOBILE',label:'Negociar liberdade para se movimentar',hint:'Maior peso de velocidade e resistência'},{id:'role:BALANCED',label:'Negociar uma função equilibrada'}]};
}

function competitionFactor(club:Club):number{return club.division==='A'?1:club.division==='B' ? .91 : club.division==='C' ? .83 : .76;}
function playerEffectiveLevel(p:PlayerState,club:Club):number{
  const pos=(p.position==='IND'?'CM':p.position) as PlayablePosition;
  return tacticalRating(p,pos);
}
function clubLevel(club:Club):number{return 45+club.prestige*.28+club.finance*.07;}

function addMatchStats(p:PlayerState,m:MatchResult,professional:boolean):void{
  const s=p.currentSeason;const old=s.appearances;
  const category=professional?'SENIOR':competitionCategory(p);s.categories??={};
  const cat=s.categories[category]??(s.categories[category]={appearances:0,starts:0,minutes:0,goals:0,assists:0,avgRating:0});
  cat.avgRating=Number(((cat.avgRating*cat.appearances+m.rating)/(cat.appearances+1)).toFixed(2));cat.appearances++;cat.starts+=m.started?1:0;cat.minutes+=m.minutes;cat.goals+=m.goals;cat.assists+=m.assists;cat.motm=(cat.motm??0)+(m.motm?1:0);
  if(p.position!=='IND'){s.positionAppearances??={};s.positionAppearances[p.position]=(s.positionAppearances[p.position]??0)+1;s.positionsPlayed??=[];if(!s.positionsPlayed.includes(p.position))s.positionsPlayed.push(p.position);s.primaryPosition=Object.entries(s.positionAppearances).sort((a,b)=>b[1]!-a[1]!)[0]![0] as PlayablePosition;}
  s.appearances++;s.starts+=m.started?1:0;s.minutes+=m.minutes;s.goals+=m.goals;s.assists+=m.assists;s.motm+=m.motm?1:0;s.yellows+=m.yellow?1:0;s.reds+=m.red?1:0;s.saves+=m.saves;s.cleanSheets+=m.cleanSheet?1:0;s.xg=Number((s.xg+m.xg).toFixed(2));s.xa=Number((s.xa+m.xa).toFixed(2));s.avgRating=Number(((s.avgRating*old+m.rating)/(old+1)).toFixed(2));
  if(professional){const c=p.careerStats;c.appearances++;c.starts+=m.started?1:0;c.minutes+=m.minutes;c.goals+=m.goals;c.assists+=m.assists;c.motm+=m.motm?1:0;c.yellows+=m.yellow?1:0;c.reds+=m.red?1:0;c.saves+=m.saves;c.cleanSheets+=m.cleanSheet?1:0;c.xg=Number((c.xg+m.xg).toFixed(2));c.xa=Number((c.xa+m.xa).toFixed(2));}
}

function fanEffectsForMatch(p:PlayerState,own:Club,opp:Club,m:MatchResult):void{
  const ownFan=ensureFan(p,own.id),oppFan=ensureFan(p,opp.id);const rival=own.rivals.includes(opp.id)||opp.rivals.includes(own.id);
  const won=m.teamGoals>m.oppGoals,lost=m.teamGoals<m.oppGoals;
  ownFan.passion=clamp(ownFan.passion+(won?1.2:lost?-.8:0)+m.goals*1.7+m.assists*.8+(m.motm?1.8:0));
  ownFan.respect=clamp(ownFan.respect+(m.rating>=8?1.2:.15));
  if(m.goals>0){oppFan.fear=clamp(oppFan.fear+m.goals*(rival?3.2:1.7));oppFan.respect=clamp(oppFan.respect+m.goals*.7);}
  if(m.goals>=3){oppFan.fear=clamp(oppFan.fear+12);oppFan.hate=clamp(oppFan.hate+(rival?7:2));addFanMemory(p,opp.id,'HATTRICK',`Hat-trick contra ${opp.name}`,9);}
  if(rival&&(m.goals||m.assists||m.motm)){oppFan.hate=clamp(oppFan.hate+2+m.goals*2);ownFan.passion=clamp(ownFan.passion+3+m.goals*2);addFanMemory(p,opp.id,'CLASSIC',`Atuação marcante em clássico contra ${opp.name}`,7);}
  if(m.red){ownFan.respect=clamp(ownFan.respect-2);oppFan.hate=clamp(oppFan.hate+1);}
}

function roleBaseline(p:PlayerState,pos:PlayablePosition):number{
  const a=p.attributes;const vals=Object.values(a) as number[];const avg=vals.reduce((s,v)=>s+v,0)/vals.length;return Math.max(34,avg*.95);
}

function simulateYouthBlock(p:PlayerState,rng:RNG):CareerEvent{
  observeLocally(p);
  const games=1;const pos=(p.position==='IND'?'CM':p.position) as PlayablePosition;const rawComp=clamp(effectivePositionRating(p,pos)/Math.max(35,roleBaseline(p,pos)),.72,1.18);const youthPressure=p.age<=12?.08:p.age===13?.14:p.age===14?.30:.55;const comp=1+(rawComp-1)*youthPressure;let goals=0,assists=0,good=0;const youthMatches:MatchResult[]=[];
  for(let i=0;i<games;i++){
    const attacking=pos==='ST' ? .24 : pos==='WG' ? .19 : pos==='AM' ? .16 : pos==='CM' ? .10 : pos==='FB' ? .07 : pos==='DM' ? .06 : pos==='CB' ? .045 : .008;
    const creating=pos==='AM' ? .22 : pos==='CM' ? .17 : pos==='WG' ? .17 : pos==='FB' ? .14 : pos==='DM' ? .10 : pos==='ST' ? .08 : pos==='CB' ? .035 : .01;
    const g=rng.chance(clamp(attacking*comp*(.65+p.attributes.finishing/120),.002,.48))?1:0;
    const a=rng.chance(clamp(creating*comp*(.65+p.attributes.passing/120),.003,.45))?1:0;
    const stageStandard=32+(p.age-12)*2.5+(p.currentClubId?CLUB_BY_ID[p.currentClubId]!.youth*.07:0);
    const learned=roleRating(p,pos);
    const rating=clamp(6.05+(learned-stageStandard)/14+(g*.8+a*.55)+(comp-1)*1.8+rng.normal(0,.42),4.7,9.6);
    const dummy:MatchResult={opponentId:'youth',home:true,started:rng.chance(.72),teamGoals:g+a+rng.int(0,2),oppGoals:rng.int(0,2),minutes:rng.int(42,80),goals:g,assists:a,motm:rating>=8.2,yellow:rng.chance(['CB','DM','FB'].includes(pos) ? .08 : .035),red:false,rating:Number(rating.toFixed(1)),xg:Number((g*.55+rng.float(.01,.18)).toFixed(2)),xa:Number((a*.45+rng.float(.01,.16)).toFixed(2)),saves:pos==='GK'?rng.int(1,5):0,cleanSheet:pos==='GK'&&rng.chance(.34),headline:''};
    dummy.cleanSheet=pos==='GK'&&dummy.oppGoals===0;
    if(pos==='GK')dummy.rating=Number(clamp(dummy.rating+dummy.saves*.075+(dummy.cleanSheet?.25:0),4.7,9.6).toFixed(1));else if(['CB','FB','DM'].includes(pos)&&dummy.oppGoals===0)dummy.rating=Number(clamp(dummy.rating+.2,4.7,9.6).toFixed(1));
    youthMatches.push(dummy);addMatchStats(p,dummy,false);goals+=g;assists+=a;if(rating>=7.4)good++;
  }
  trainPositionExperience(p,calendarScale(p));const key=revealAttribute(p,rng);
  p.morale=clamp(p.morale+(good>=2?2:0)+rng.int(-1,2));p.confidence=clamp(p.confidence+goals*2+assists+good*.5);
  const signal=goals+assists?`${goals} gol${goals===1?'':'s'} e ${assists} assistência${assists===1?'':'s'} nesta partida.`:good?`${good} boas atuações nesta partida.`:'Partida sem destaque estatístico.';
  const featured=[...youthMatches].sort((a,b)=>b.rating-a.rating)[0]!;
  return {matchFeedback:{category:competitionCategory(p),opponent:p.currentClubId?'Adversário da base':'Equipe local de formação',coachName:'Treinador da formação',started:featured.started,minutes:featured.minutes,goals:featured.goals,assists:featured.assists,rating:featured.rating,saves:featured.saves,cleanSheet:featured.cleanSheet,teamGoals:featured.teamGoals,oppGoals:featured.oppGoals,fanReaction:featured.goals||featured.assists?'Quem acompanha seus jogos reconhece sua participação.':'Acompanhantes observam sua evolução; vínculo profissional ainda em formação.',coachReaction:featured.rating>=7.4?'A atuação chamou atenção para seu repertório.':'O treinador observa sua evolução sem concluir seu potencial.',blockGames:games,blockStarts:youthMatches.filter(m=>m.started).length,blockGoals:goals,blockAssists:assists,blockMinutes:youthMatches.reduce((sum,m)=>sum+m.minutes,0)},id:`y-${p.careerTurn}`,kind:'INFO',title:`${CATEGORY_LABEL[competitionCategory(p)]} · ${featured.teamGoals} × ${featured.oppGoals}`,body:`${CATEGORY_LABEL[competitionCategory(p)]}: ${featured.minutes} minutos nesta partida. ${signal} Os treinadores agora observam melhor: ${ATTRIBUTE_LABELS[key]}.`,tags:['FORMAÇÃO',POSITION_LABEL[pos].toUpperCase()]};
}

function opponentPool(own:Club):Club[]{
  const same=BRAZIL_CLUBS_2026.filter(c=>c.division===own.division&&c.id!==own.id);
  const rivals=own.rivals.map(id=>CLUB_BY_ID[id]).filter((c):c is Club=>Boolean(c));
  return [...rivals.filter((c):c is Club=>Boolean(c)),...same];
}
function simulateProfessionalBlock(p:PlayerState,rng:RNG,fixtures:WorldFixture[]):CareerEvent{
  const own=CLUB_BY_ID[p.currentClubId!]!;const games=fixtures.length;const level=playerEffectiveLevel(p,own);const standard=clubLevel(own);
  const transition=transitionLoad(p);p.pressure=clamp(p.pressure+transition.pressure*calendarScale(p));
  const baseStart=clamp((.35+(level-standard)/35+(p.confidence-50)/180+opportunityAdjustment(p)+(p.careerApproach==='RESPONSIBILITY'?.06:0))*transition.starts-(p.comebackBlocks&&p.comebackPlan==='GRADUAL'?.15:0),.08,.92);
  if(p.comebackBlocks)p.comebackBlocks=Math.max(0,p.comebackBlocks-1);
  const firstAppearance=!p.debut&&p.careerStats.appearances===0;
  const results:{m:MatchResult;opp:Club;fanReaction:string;coachReaction:string}[]=[];
  for(const fixture of fixtures){
    const experience=p.careerStats.minutes;const debutStart=experience<120?.02:experience<450?.08:experience<900?.18:baseStart;
    const started=rng.chance(Math.min(baseStart,debutStart));if(!started&&!rng.chance(experience<120?.42:experience<450?.60:.72))continue;
    const opp=CLUB_BY_ID[fixture.homeId===own.id?fixture.awayId:fixture.homeId]!;const importance=(own.rivals.includes(opp.id)||opp.rivals.includes(own.id))?1.35:rng.chance(.08)?1.25:1;
    const beforeFan=ensureFan(p,own.id);const fanBefore={passion:beforeFan.passion,hate:beforeFan.hate,respect:beforeFan.respect};
    const m=simulatePlayerMatch(p,own,opp,rng,started,importance,{home:fixture.homeId===own.id,teamGoals:fixture.homeId===own.id?fixture.homeGoals:fixture.awayGoals,oppGoals:fixture.homeId===own.id?fixture.awayGoals:fixture.homeGoals,...(p.careerStats.minutes<120?{minutes:rng.int(6,18)}:{})});if(!p.debut)p.debut={season:p.season,age:p.age,clubId:own.id,opponentId:opp.id,minutes:m.minutes};
    performanceFeedback(p,m.rating,m.red);addMatchStats(p,m,true);fanEffectsForMatch(p,own,opp,m);
    const fan=ensureFan(p,own.id),profile=coachProfile(p.tactical!.coachId);
    const fanReaction=fan.hate>fanBefore.hate?'A cobrança da torcida aumentou.':fan.passion>fanBefore.passion?(m.goals||m.assists||m.motm?'Sua participação ampliou o apoio da torcida.':'O resultado trouxe entusiasmo coletivo; sua atuação segue em avaliação.'):fan.respect-fanBefore.respect>=1?'Seu desempenho ganhou respeito.':fan.passion<fanBefore.passion?'A derrota reduziu o entusiasmo da torcida; sua trajetória segue em avaliação.':'A torcida mantém a avaliação anterior.';
    const coachReaction=m.red?'A expulsão trouxe cobrança e perda de confiança profissional.':m.rating>=8?'O treinador destacou sua atuação e reforçou a confiança.':m.rating>=7?'Sua atuação sustentou a confiança profissional.':m.rating<6.2?(profile.patience>=60?'O treinador reconhece a dificuldade e oferece tempo para responder.':'O treinador cobra uma resposta após a atuação abaixo do esperado.'):'O treinador mantém a avaliação e observa sua continuidade.';
    results.push({m,opp,fanReaction,coachReaction});
    const result=m.teamGoals>m.oppGoals?1:m.teamGoals<m.oppGoals?-1:0;p.morale=clamp(p.morale+result*1.2+m.goals*.9+m.assists*.5-(m.red?2:0));p.confidence=clamp(p.confidence+result*.7+m.goals*1.8+m.assists*1.1+(m.motm?1.8:0));
  }
  trainPositionExperience(p,calendarScale(p)*Math.max(1,results.length));p.physicalCondition=clamp(p.physicalCondition+(-rng.float(1.5,4.5)+2.4)*calendarScale(p),65,100);
  if(!results.length){p.confidence=clamp(p.confidence-.5);const fixture=fixtures[0],opponent=fixture?CLUB_BY_ID[fixture.homeId===own.id?fixture.awayId:fixture.homeId]:null;const gf=fixture?(fixture.homeId===own.id?fixture.homeGoals:fixture.awayGoals):0,ga=fixture?(fixture.homeId===own.id?fixture.awayGoals:fixture.homeGoals):0;return {id:`bench-${p.careerTurn}`,kind:'INFO',title:fixture?`${own.shortName} ${gf} × ${ga} ${opponent!.shortName} · você ficou no banco`:'Sem partida profissional nesta rodada',body:`Você acompanhou esta partida sem entrar. A disputa por espaço pesa mais do que qualquer treino.`,matchFeedback:{category:'SENIOR',showScore:!!fixture,opponent:opponent?.shortName??'Profissional · banco de reservas',coachName:coachName(p.tactical!.coachId),started:false,minutes:0,goals:0,assists:0,rating:0,saves:0,cleanSheet:false,teamGoals:gf,oppGoals:ga,fanReaction:'Sem atuação para uma nova avaliação individual.',coachReaction:'Seu espaço segue em disputa; não houve avaliação em campo.',blockGames:0,blockStarts:0,blockGoals:0,blockAssists:0,blockMinutes:0},tags:['BANCO',POSITION_LABEL[p.position as PlayablePosition].toUpperCase()]};}
  const highlight=[...results].sort((a,b)=>(b.m.goals*2+b.m.assists+(b.m.motm?1.5:0)+b.m.rating/10)-(a.m.goals*2+a.m.assists+(a.m.motm?1.5:0)+a.m.rating/10))[0]!;
  const goals=results.reduce((s,x)=>s+x.m.goals,0),assists=results.reduce((s,x)=>s+x.m.assists,0),starts=results.filter(x=>x.m.started).length;
  const avgBlock=results.reduce((s,x)=>s+x.m.rating,0)/results.length;
  const expectation=p.professionalTransition?.youthBuzz??0;
  if(p.careerStats.minutes<1800&&avgBlock<6.4){p.confidence=clamp(p.confidence-(1+expectation/40)*(p.professionalTransition?.mode==='PROTECTED'?.5:1));p.mentalFatigue=clamp(p.mentalFatigue+transition.pressure*calendarScale(p));}else if(avgBlock>=7){p.pressure=clamp(p.pressure-1);p.mentalFatigue=clamp(p.mentalFatigue-1);}
  p.reputation=clamp(p.reputation+(avgBlock-6.55)*.42*calendarScale(p)+goals*.07+assists*.05+results.filter(x=>x.m.motm).length*.12,1,100);
  const m=highlight.m,opp=highlight.opp;const prefix=`Profissional · ${p.careerStats.minutes<450?'Início gradual da trajetória.':'Participação nesta rodada.'} `;
  return {id:`m-${p.careerTurn}`,kind:firstAppearance?'MILESTONE':'MATCH',title:`${firstAppearance?'Sua estreia no profissional · ':''}${own.shortName} ${m.teamGoals} × ${m.oppGoals} ${opp.shortName}`,matchFeedback:{category:'SENIOR',opponent:opp.shortName,coachName:coachName(p.tactical!.coachId),started:m.started,minutes:m.minutes,goals:m.goals,assists:m.assists,rating:m.rating,saves:m.saves,cleanSheet:m.cleanSheet,teamGoals:m.teamGoals,oppGoals:m.oppGoals,fanReaction:highlight.fanReaction,coachReaction:highlight.coachReaction,blockGames:results.length,blockStarts:starts,blockGoals:goals,blockAssists:assists,blockMinutes:results.reduce((sum,x)=>sum+x.m.minutes,0)},body:`${prefix}${m.headline} Nota ${m.rating.toFixed(1)} · ${m.minutes} min · xG ${m.xg} · xA ${m.xa}.`,tags:['PROFISSIONAL',...(firstAppearance?['ESTREIA']:[]),m.motm?'MELHOR DO JOGO':'PARTIDA',m.red?'EXPULSO':m.goals?`${m.goals} GOL${m.goals>1?'S':''}`:POSITION_LABEL[p.position as PlayablePosition].toUpperCase()].filter(Boolean)};
}

function seniorStats(p:PlayerState){return p.currentSeason.categories?.SENIOR??(p.currentSeason.categories?{appearances:0,minutes:0,goals:0,assists:0,avgRating:0}:p.currentSeason);}
function valuation(p:PlayerState):number{
  if(!p.currentClubId||competitionCategory(p)!=='SENIOR')return 0;const club=CLUB_BY_ID[p.currentClubId]!;const ov=overall(p);const ageFactor=p.age<=19?1.45:p.age<=23?1.65:p.age<=27?1.55:p.age<=30?1.28:p.age<=33 ? .86 : .48;
  const stats=seniorStats(p);const rating=stats.avgRating||6.55;const perf=clamp(.72+(rating-6.2)*.48,.58,1.45);const minutes=clamp(stats.minutes/1800,.55,1.18);const rep=.68+p.reputation/78;const div=club.division==='A'?1:club.division==='B' ? .58 : club.division==='C' ? .31 : .16;const contract=.82+Math.min(4,p.contractYearsLeft)*.08;
  return Math.round(Math.max(90_000,(Math.max(1,ov-42)**2)*21500*ageFactor*perf*minutes*rep*div*contract));
}

function maybeTitles(p:PlayerState,_rng:RNG):string[]{return leagueTitle(p);}

function marketCandidates(p:PlayerState,rng:RNG):{club:Club;fee:number}[]{
  if(!p.currentClubId||competitionCategory(p)!=='SENIOR')return[];const current=CLUB_BY_ID[p.currentClubId]!;const stats=seniorStats(p);const rating=stats.avgRating||6.4;const performanceSignal=(rating-6.45)*18+(stats.goals+stats.assists)*.22+p.reputation*.14;
  let interestBase=clamp(.08+performanceSignal/100+(p.transferIntent==='OPEN' ? .08 : p.transferIntent==='LEAVE' ? .19 : p.transferIntent==='FORCE' ? .30 : 0),.02,.72);
  if(p.age<=20)interestBase+=.05;
  const rebuilding=p.transferIntent!=='STAY'||p.age>=31&&stats.minutes<900;
  const eligible=BRAZIL_CLUBS_2026.filter(c=>c.id!==current.id&&c.city!=='A DEFINIR'&&(rebuilding||DIV_RANK[c.division]!>=DIV_RANK[current.division]!)&&(rebuilding||c.finance>=Math.max(18,current.finance-22)));
  const shuffled=eligible.map(c=>({c,k:rng.next()})).sort((a,b)=>a.k-b.k).slice(0,28).map(x=>x.c);const offers:{club:Club;fee:number}[]=[];
  for(const c of shuffled){
    const ambition=clamp((c.prestige-current.prestige+35)/70,.12,1.15);const need=rng.float(.45,1.1);if(rng.chance(interestBase*ambition*need*.42)){
      const contractPressure=p.contractYearsLeft<=1 ? .78 : p.transferIntent==='FORCE' ? .88 : 1;const fee=Math.round(Math.max(120_000,p.marketValue*rng.float(.86,1.30)*contractPressure*(c.finance<current.finance?clamp(c.finance/Math.max(1,current.finance),.35,1):1)));offers.push({club:c,fee});
    }
    if(offers.length>=3)break;
  }
  return offers;
}

function buildMarketEvent(p:PlayerState,rng:RNG,title='Janela de transferências'):CareerEvent|null{
  if(!p.currentClubId)return null;const own=CLUB_BY_ID[p.currentClubId]!;const offers=marketCandidates(p,rng);if(!offers.length)return null;for(const o of offers)coachDossier(p,o.club.id);
  return {id:`market-${p.season}-${p.seasonTurn}`,kind:'MARKET',title,body:`Seu empresário trouxe ${offers.length} proposta${offers.length>1?'s':''} concreta${offers.length>1?'s':''}. Pedir para sair abriu o mercado, mas a decisão ainda é sua.`,payload:{coachOffers:Object.fromEntries(offers.map(o=>[o.club.id,ensureCoaching(p).jobs[o.club.id]!.coachId]))},tags:['MERCADO',p.transferIntent==='FORCE'?'SAÍDA FORÇADA':'PEDIDO DE SAÍDA'],choices:[{id:'market:stay',label:`Retirar o pedido e ficar no ${own.name}`,hint:'Encerrar a movimentação nesta janela'},...offers.map(o=>({id:`market:${o.club.id}:${o.fee}:${p.season}`,label:`${o.club.name} · ${money(o.fee)}`,hint:`Série ${o.club.division} · ${o.club.city}. ${coachDossier(p,o.club.id)} ${roleProspect(p,o.club.id)}`}))]};
}

function fanSeasonReview(p:PlayerState):void{
  if(!p.currentClubId||p.age<16)return;const fan=ensureFan(p,p.currentClubId);const stats=seniorStats(p);const rating=stats.avgRating||6.4;const lastTransfer=p.transferHistory.find(t=>t.toClubId===p.currentClubId);const expensive=lastTransfer&&lastTransfer.fee>Math.max(lastTransfer.marketValue*1.18,20_000_000);
  if(rating>=7.35){fan.passion=clamp(fan.passion+7);fan.respect=clamp(fan.respect+6);if(fan.hate>0){fan.hate=clamp(fan.hate-4);addFanMemory(p,p.currentClubId,'REDEMPTION','Grande temporada reconstruiu a relação com a torcida',6);}}
  if(stats.minutes>=450&&rating<6.55&&expensive){fan.hate=clamp(fan.hate+11);fan.passion=clamp(fan.passion-5);addFanMemory(p,p.currentClubId,'FLOP',`Temporada abaixo da expectativa após transferência de ${money(lastTransfer!.fee)}`,8);}
}

function seasonReviewAndAdvance(p:PlayerState,rng:RNG):CareerEvent{
  finishEducationYear(p);
  p.currentSeason.titles=maybeTitles(p,rng);for(const t of p.currentSeason.titles){p.reputation=clamp(p.reputation+2.5,1,100);p.careerStats.titles.push(`${t} ${p.season}`);if(p.currentClubId){const fan=ensureFan(p,p.currentClubId);fan.passion=clamp(fan.passion+8);fan.respect=clamp(fan.respect+6);addFanMemory(p,p.currentClubId,'TITLE',`${t} em ${p.season}`,9);}}
  p.currentSeason.marketValueEnd=valuation(p);p.marketValue=p.currentSeason.marketValueEnd;fanSeasonReview(p);
  const completed={...p.currentSeason,categories:structuredClone(p.currentSeason.categories??{}),titles:[...p.currentSeason.titles],positionsPlayed:[...(p.currentSeason.positionsPlayed??[])],positionAppearances:{...p.currentSeason.positionAppearances}};p.seasonHistory.unshift(completed);p.seasonHistory=p.seasonHistory.slice(0,40);
  const marketOffers=marketCandidates(p,rng);const body=competitionCategory(p)!=='SENIOR'?`${completed.appearances} jogos de ${CATEGORY_LABEL[competitionCategory(p)].toLowerCase()} · ${completed.goals} gols · ${completed.assists} assistências. Você termina o ano com mais pistas sobre seu jogo.`:`${completed.appearances} jogos · ${completed.goals} gols · ${completed.assists} assistências · ${completed.motm}× melhor em campo · nota ${completed.avgRating.toFixed(2)} · valor ${money(p.marketValue)}.${completed.titles.length?` Títulos: ${completed.titles.join(', ')}.`:''}`;
  log(p,'TEMPORADA',`Fim de ${p.season}`,body);
  const oldSeason=p.season,oldClub=p.currentClubId;
  let released=false;
  if(p.currentClubId&&p.age>=14&&p.age<=16&&rng.chance(clamp(.045+(6.5-completed.avgRating)*.10,.025,.18))){
    const former=p.currentClubId;ensureLife(p).scouting.rejections.push({season:p.season,clubId:former});
    log(p,'DISPENSA',`A base do ${CLUB_BY_ID[former]!.name} não renovou sua vaga`,'Uma avaliação não define seu potencial. Você volta a competir localmente e pode buscar outra estrutura.');
    p.currentClubId=null;p.contractYearsLeft=0;p.phase='ESCOLINHA';ensureLife(p).residence=p.hometown;released=true;
  }p.season++;p.age++;p.seasonTurn=0;p.positionSeasonChosenFor=null;updateBody(p,rng);p.adaptationDebt=clamp(p.adaptationDebt*.55,0,100);p.contractYearsLeft=Math.max(0,p.contractYearsLeft-1);
  if(p.currentClubId&&competitionCategory(p)==='SENIOR'&&p.contractYearsLeft===0){p.contractYearsLeft=2;log(p,'CONTRATO','Renovação automática de curto prazo','Sem transferência concluída, o vínculo foi estendido por duas temporadas.');}
  if(p.age>=16&&p.currentClubId)p.phase=p.age>=31?'VETERANO':p.age>=24?'AUGE':'PROFISSIONAL';
  else if(p.currentClubId)p.phase='BASE';
  p.morale=clamp(p.morale*.86+10);p.confidence=clamp(p.confidence*.88+7);p.pressure=clamp(p.pressure*.76);p.mentalFatigue=clamp(p.mentalFatigue*.34);p.physicalCondition=96;
  if(p.age===21&&p.professionalStatus!=='SENIOR'&&p.currentClubId){log(p,'FORMAÇÃO','A etapa sub-20 terminou sem promoção','Você pode continuar competindo em estruturas locais e buscar outros caminhos.');p.currentClubId=null;p.phase='ESCOLINHA';p.contractYearsLeft=0;released=true;}
  p.currentSeason=emptySeason(p.season,p.age,p.currentClubId,p.marketValue);
  const choices=!released&&marketOffers.length&&oldClub?[{id:'market:stay',label:`Permanecer no ${CLUB_BY_ID[oldClub]!.name}`,hint:'Seguir o projeto atual'},...marketOffers.map(o=>({id:`market:${o.club.id}:${o.fee}:${oldSeason}`,label:`${o.club.name} · ${money(o.fee)}`,hint:`Série ${o.club.division} · ${o.club.city}. ${coachDossier(p,o.club.id)} ${roleProspect(p,o.club.id)}`}))]:[];
  const event:CareerEvent={id:`season-${oldSeason}`,kind:'SEASON_END',title:`Temporada ${oldSeason}`,body:released?`${body} Sua vaga na base não foi renovada. Você segue no futebol local, com possibilidade de novos testes.`:body,tags:['BALANÇO',`IDADE ${p.age-1}`,marketOffers.length?`${marketOffers.length} PROPOSTA${marketOffers.length>1?'S':''}`:'SEM PROPOSTA'].filter(Boolean)};
  if(choices.length){event.choices=choices;event.payload={coachOffers:Object.fromEntries(marketOffers.map(o=>[o.club.id,ensureCoaching(p).jobs[o.club.id]!.coachId]))};}
  return event;
}

function transferTo(p:PlayerState,toId:string,fee:number,fromSeason:number):void{
  const from=p.currentClubId;const to=CLUB_BY_ID[toId];if(!to)return;const previousMarket=p.marketValue;const intentBefore=p.transferIntent;const previousIntent=p.transferIntent;
  p.transferHistory.unshift({season:fromSeason,age:p.age,fromClubId:from,toClubId:toId,fee,marketValue:previousMarket});p.currentClubId=toId;p.contractYearsLeft=3+Math.round((to.finance/100)*2);p.transferIntent='STAY';p.morale=clamp(p.morale+5);p.pressure=clamp(p.pressure+Math.min(25,fee/10_000_000));p.currentSeason.clubId=toId;ensureLife(p).residence=to.city;
  const fan=ensureFan(p,toId);fan.expectation=clamp(35+(fee/Math.max(1,previousMarket))*24+to.prestige*.25,20,100);fan.passion=clamp(fan.passion+5);
  addFanMemory(p,toId,'TRANSFER',`Chegada por ${money(fee)}`,7);if(from){const old=ensureFan(p,from);old.passion=clamp(old.passion-(previousIntent==='FORCE'?14:4));}
  syncCoachContext(p);log(p,'TRANSFERÊNCIA',`Novo clube: ${to.name}`,`Transferência por ${money(fee)}. ${coachDossier(p,toId)}`);
}

function contextualDecision(p:PlayerState,event:CareerEvent):CareerEvent{
  if(event.choices?.length)return event;
  if(p.currentClubId&&competitionCategory(p)==='SENIOR'){
    const lowMinutes=event.id.startsWith('bench-')||p.injury?.remainingBlocks;
    const campaign=ensureCoaching(p).campaigns[p.currentClubId]!;
    const crisis=campaign.games>=8&&campaign.points/campaign.games<campaign.expectedPPG-.3;
    event.body+=` ${lowMinutes?'Seu espaço no elenco pede uma decisão.':crisis?'A campanha está abaixo do esperado; o projeto enfrenta cobrança.':'Você avalia como conduzir seu papel e o próximo passo da carreira.'}`;
    event.choices=[{id:'career:stable',label:lowMinutes?'Preservar o vínculo e aguardar espaço':'Sustentar o projeto e preservar estabilidade',hint:'Priorizar permanência; responsabilidade atual mantida'},
      {id:'career:responsibility',label:lowMinutes?'Negociar meu espaço para a retomada':'Disputar mais responsabilidade no projeto',hint:'Confiança profissional e desempenho influenciam a resposta; maior cobrança'},
      {id:'career:discuss',label:'Conversar com o treinador sobre meu papel',hint:'Negociar expectativas; relação pessoal e confiança profissional são distintas'},
      {id:'career:market',label:'Pedir ao empresário para ouvir outros projetos',hint:'Abrir-se a propostas; sem saída automática'}];
  }else{
    event.body+=' Você e sua família avaliam a continuidade deste caminho.';
    event.choices=[{id:'career:local',label:'Sustentar o caminho atual',hint:'Preservar o vínculo e seguir competindo'},
      {id:'career:explore',label:'Buscar outras oportunidades de avaliação',hint:'Ampliar observação para convites futuros; não garante vaga'},
      {id:'career:education',label:'Rever com a família o equilíbrio com a escola',hint:p.age<=18?'Reabrir a prioridade escolar deste ano':'Avaliar oportunidades de retomar a formação'}];
  }
  return event;
}
function endCareerEvent(p:PlayerState):CareerEvent{p.phase='APOSENTADO';return {id:'retire',kind:'MILESTONE',title:'Fim de carreira',body:`${legacyNarrative(p)} ${ensureLife(p).education.completed?'Você concluiu a escola e pode buscar formação técnica ou superior para uma nova profissão.':'Os estudos ficaram incompletos; retomar a formação pode ampliar suas opções profissionais.'} ${p.careerStats.appearances} jogos profissionais · ${p.careerStats.goals} gols · ${p.careerStats.assists} assistências · ${p.careerStats.motm} prêmios de melhor em campo · ${p.careerStats.titles.length} títulos.`,tags:['LEGADO','APOSENTADORIA'],choices:[{id:'after:WORK',label:'Buscar uma nova ocupação',hint:ensureLife(p).education.completed?'Escola concluída amplia suas opções':'Opções de entrada; retomar estudos pode ampliar oportunidades'},...(ensureLife(p).education.completed?[{id:'after:TECHNICAL',label:'Iniciar formação técnica',hint:'Qualificar-se para uma nova profissão; não é um diploma automático'},{id:'after:DEGREE',label:'Buscar formação superior',hint:'Um novo projeto de estudo depois do futebol'},...(p.careerStats.appearances>=100?[{id:'after:COACH_COURSE',label:'Buscar formação para treinador',hint:'Experiência ajuda, mas é preciso obter formação e oportunidades'}]:[])]:[])]};}

export function resolveChoice(save:SaveGame,choiceId:string):SaveGame{
  const p=save.player;const rng=new RNG(p.rngState);if(!save.pendingEvent||!save.pendingEvent.choices?.some(c=>c.id===choiceId))return save;
  if(choiceId.startsWith('career:')){
    if(choiceId==='career:discuss'){p.coachTalkFor=`${p.season}:${p.seasonTurn}`;save.pendingEvent=coachDiscussionEvent(p);return save;}
    if(choiceId==='career:stable'){p.careerApproach='STABILITY';p.transferIntent='STAY';log(p,'PROJETO','Estabilidade escolhida','Você decidiu sustentar o projeto atual.');}
    if(choiceId==='career:market'){p.transferIntent='OPEN';log(p,'MERCADO','Ouvir outros projetos','O empresário pode buscar oportunidades; nenhuma transferência é garantida.');}
    if(choiceId==='career:responsibility'){
      ensureTactical(p);const bondTrust=p.tactical?.trust??55;
      const accepted=bondTrust>=60&&(p.currentSeason.avgRating>=6.7||p.currentSeason.minutes<300);
      p.careerApproach=accepted?'RESPONSIBILITY':'STABILITY';p.pressure=clamp(p.pressure+(accepted?3:1));
      rememberCoach(p,accepted?'Aceitou disputa por maior responsabilidade':'Pediu responsabilidade antes de sustentar confiança',accepted?1:-1,0,accepted?0:2);
      log(p,'PROJETO',accepted?'Maior responsabilidade negociada':'O treinador pede evidências antes de ampliar seu papel',accepted?'Mais disputa por titularidade, acompanhada de maior cobrança.':'O pedido não assegurou mais espaço. Você pode insistir em campo ou ouvir outros clubes.');
    }
    if(choiceId==='career:local')log(p,'FORMAÇÃO','Continuidade escolhida','A família sustenta a trajetória atual.');
    if(choiceId==='career:explore'){const scouting=ensureLife(p).scouting;scouting.observations=Math.min(30,scouting.observations+1);log(p,'OBSERVAÇÃO','Família procura outras portas','Mais observação pode ampliar os convites futuros.');}
    if(choiceId==='career:education'){if(p.age<=18){save.pendingEvent=educationEvent(p);return save;}else log(p,'EDUCAÇÃO','Você considera retomar os estudos','Seu percurso escolar permanece registrado; uma nova formação exige um projeto próprio.');}
  }else if(choiceId.startsWith('coach:')||choiceId.startsWith('coach-talk:')){
    const followUp=resolveCoachChoice(p,choiceId);log(p,'PROJETO','Decisão sobre o comando técnico',choiceId);if(followUp){save.pendingEvent=followUp;save.updatedAt=new Date().toISOString();return save;}
  }else if(choiceId==='retirement:stop'){
    log(p,'APOSENTADORIA','Você decide encerrar a carreira',legacyNarrative(p));save.pendingEvent=endCareerEvent(p);save.updatedAt=new Date().toISOString();return save;
  }else if(choiceId==='retirement:continue'){
    p.retirementReviewedFor=p.season;log(p,'CARREIRA','Você decide seguir jogando','O mercado pode oferecer projetos menores. Nenhuma contratação está garantida.');
  }else if(choiceId==='promotion:wait'){p.professionalStatus='YOUTH';p.promotionReviewedFor=p.season;log(p,'BASE','Você adia a transição','Seguir na base permite amadurecer antes de disputar o profissional.');
  }else if(choiceId.startsWith('transition:')){
    p.professionalStatus='SENIOR';p.phase='PROFISSIONAL';p.lastPromotionSeason=p.season;ensureTransition(p);p.professionalTransition!.mode=choiceId.split(':')[1] as 'PROTECTED'|'IMMEDIATE';
    const load=transitionLoad(p);p.pressure=clamp(p.pressure+load.pressure*5);
    log(p,'TRANSIÇÃO','Seu primeiro papel no profissional',p.professionalTransition!.mode==='PROTECTED'?'Entrada gradual com menor cobrança':'Mais responsabilidade e exposição desde o início');
  }else if(choiceId.startsWith('comeback:')){
    p.comebackBlocks=6;p.comebackPlan=choiceId==='comeback:GRADUAL'?'GRADUAL':'COMPETE';
    if(choiceId==='comeback:GRADUAL'){p.physicalCondition=clamp(p.physicalCondition+8);p.confidence=clamp(p.confidence+2);}
    else{p.pressure=clamp(p.pressure+8);}
    delete p.injury;log(p,'RETORNO','Retorno ao elenco',choiceId==='comeback:GRADUAL'?'Participação gradual':'Disputar espaço anterior imediatamente');
  }else if(choiceId.startsWith('position:')){
    const pos=choiceId.split(':')[1] as PlayablePosition;const rec=selectPosition(p,pos);if(!p.currentSeason.appearances)p.currentSeason.primaryPosition=pos;log(p,'POSIÇÃO',`Temporada como ${POSITION_LABEL[pos]}`,rec.previous&&rec.previous!==pos?`Mudança de ${POSITION_LABEL[rec.previous]} para ${POSITION_LABEL[pos]}. ${changeCostLabel(rec.cost)}.`:'Continuidade na função escolhida.');
  }else if(choiceId.startsWith('after:')){
    const life=ensureLife(p);const path=choiceId.split(':')[1] as 'WORK'|'TECHNICAL'|'DEGREE'|'COACH_COURSE';
    life.secondCareer={path,status:path==='WORK'?'SEEKING_WORK':'IN_TRAINING'};
    log(p,'NOVO CAMINHO',path==='WORK'?'Buscar trabalho':path==='TECHNICAL'?'Iniciar formação técnica':path==='COACH_COURSE'?'Buscar formação para treinador':'Buscar formação superior',path==='WORK'?'Você busca uma nova ocupação com a escolaridade e experiência que construiu.':'A escola concluída abriu este caminho. A formação e as oportunidades ainda precisam ser conquistadas.');
  }else if(choiceId.startsWith('education:')){
    const e=ensureLife(p).education;e.priority=choiceId.split(':')[1] as EducationPriority;e.chosenFor=p.season;
    log(p,'EDUCAÇÃO','Prioridade do ano definida',e.priority==='SCHOOL'?'Estudos protegidos':e.priority==='BALANCED'?'Escola e futebol conciliados':'Futebol priorizado');
  }else if(choiceId.startsWith('trial:')){
    const life=ensureLife(p);
    if(choiceId!=='trial:stay'){
      const id=choiceId.split(':')[1]!;const club=CLUB_BY_ID[id]!;
      const offers=save.pendingEvent.payload?.offers as {clubId:string;support:boolean;moving:boolean;familyAgrees:boolean}[];
      const offer=offers.find(o=>o.clubId===id)!;life.scouting.trialAttempts++;
      const approved=rng.chance(trialProbability(p,club,offer.support));
      if(approved){p.currentClubId=id;p.phase=p.professionalStatus==='SENIOR'?'PROFISSIONAL':'BASE';p.contractYearsLeft=3;p.currentSeason.clubId=id;p.reputation=Math.max(p.reputation,6);life.residence=club.city;log(p,'AVALIAÇÃO',`Vaga no ${club.name}`,'Após observação local e teste. A família aceitou as condições.');}
      else{life.scouting.rejections.push({season:p.season,clubId:id});p.confidence=clamp(p.confidence-3);log(p,'AVALIAÇÃO',`Teste sem vaga no ${club.name}`,'A avaliação não encerra sua carreira. Você segue na escolinha e pode tentar outra porta.');}
    }else log(p,'FORMAÇÃO','Você permanece na escolinha local','Continuar em uma estrutura menor mantém o caminho aberto.');
  }else if(choiceId.startsWith('role:')||choiceId.startsWith('reconvert:')){
    ensureTactical(p);const tactical=p.tactical!;tactical.discussedFor=p.season;
    if(choiceId==='role:stay')log(p,'FUNÇÃO','Continuidade no projeto','Posição e função mantidas.');
    else{
      const suggestion=observedPositionSuggestion(p);
      const requested=choiceId.startsWith('reconvert:')?choiceId.split(':')[1] as PlayablePosition:null;
      const profile=coachProfile(tactical.coachId);const accepted=(requested===suggestion&&profile.flexibility>=45)||rng.chance(clamp(.15+profile.flexibility/180+tactical.trust/250,.2,.92));
      if(accepted){
        if(requested){const rec=selectPosition(p,requested);if(!p.currentSeason.appearances)p.currentSeason.primaryPosition=requested;tactical.role='BALANCED';log(p,'RECONVERSÃO',`Novo papel: ${POSITION_LABEL[requested]}`,`${changeCostLabel(rec.cost)}. Atributos e experiência anterior preservados.`);}
        else{tactical.role=choiceId.split(':')[1] as TacticalRole;log(p,'FUNÇÃO','Treinador aceita ajustar sua função',tactical.role==='HOLD'?'Atuação mais fixa':tactical.role==='MOBILE'?'Maior mobilidade':'Função equilibrada');}
        rememberCoach(p,'Negociação de função aceita',2,2,-1);
      }else{rememberCoach(p,'Pedido de função recusado',-2,-1,3);log(p,'FUNÇÃO','Pedido não aceito nesta temporada','O treinador mantém seu plano. Você pode continuar ou buscar outro projeto pelo mercado.');}
    }
  }else if(choiceId.startsWith('join:')){
    const id=choiceId.split(':')[1]!;p.currentClubId=id;p.phase='BASE';p.reputation=6;p.morale=78;p.contractYearsLeft=3;p.currentSeason.clubId=id;log(p,'CLUBE',`Entrada na base do ${CLUB_BY_ID[id]!.name}`,'Primeiro vínculo estruturado da carreira.');
  }else if(choiceId==='market:stay'){
    p.contractYearsLeft=p.contractYearsLeft<=1?3:p.contractYearsLeft;p.transferIntent='STAY';log(p,'MERCADO','Você decidiu permanecer','Nenhuma transferência nesta janela.');
  }else if(choiceId.startsWith('market:')||choiceId.startsWith('market-confirm:')){
    const [,clubId,feeS,seasonS]=choiceId.split(':');
    const expected=(save.pendingEvent.payload?.coachOffers as Record<string,string>|undefined)?.[clubId!];
    coachDossier(p,clubId!);
    if(choiceId.startsWith('market:')&&expected&&ensureCoaching(p).jobs[clubId!]!.coachId!==expected){
      save.pendingEvent={id:'market-reconsider',kind:'MARKET',title:'O treinador da proposta mudou',body:coachDossier(p,clubId!)+' Reavalie o projeto antes de confirmar.',tags:['NOVO COMANDO'],choices:[{id:`market-confirm:${clubId}:${feeS}:${seasonS}`,label:'Aceitar o projeto com o novo treinador'},{id:'market:stay',label:'Recusar e permanecer no clube atual'}]};return save;
    }
    transferTo(p,clubId!,Number(feeS),Number(seasonS));
  }else if(choiceId.startsWith('intent:')){
    p.transferIntent=choiceId.split(':')[1] as TransferIntent;log(p,'MERCADO','Intenção de mercado alterada',transferIntentLabel(p.transferIntent));
  }
  p.rngState=rng.state;save.pendingEvent=null;save.updatedAt=new Date().toISOString();return save;
}

export function setTransferIntent(save:SaveGame,intent:TransferIntent):SaveGame{
  save.player.transferIntent=intent;log(save.player,'MERCADO','Intenção de carreira',transferIntentLabel(intent));save.updatedAt=new Date().toISOString();return save;
}
export function transferIntentLabel(i:TransferIntent):string{return i==='STAY'?'Quero permanecer':i==='OPEN'?'Aberto a propostas':i==='LEAVE'?'Quero sair':'Vou forçar uma saída';}

export function advanceCareer(save:SaveGame):SaveGame{
  if(save.pendingEvent?.choices?.length)return save;
  if(save.pendingEvent)save.pendingEvent=null;const p=save.player;if(p.phase==='APOSENTADO')return save;const rng=new RNG(p.rngState);
  ensureProfessionalStatus(p);ensureCoaching(p);
  if(p.seasonReviewDue){delete p.seasonReviewDue;const review=seasonReviewAndAdvance(p,rng);save.pendingEvent=p.age>=40?endCareerEvent(p):contextualDecision(p,review);p.rngState=rng.state;save.updatedAt=new Date().toISOString();return save;}
  const changeEvent=coachChangeEvent(p);if(changeEvent){save.pendingEvent=changeEvent;return save;}
  if(p.age>=36&&p.age<40&&p.retirementReviewedFor!==p.season){save.pendingEvent={id:`retirement-${p.season}`,kind:'CHOICE',title:'Seguir jogando ou encerrar este ciclo?',body:'Você avalia seu espaço no futebol e o próximo caminho de vida. Continuar pode envolver um projeto menor; parar preserva a história já construída.',tags:['VETERANO','DECISÃO'],choices:[{id:'retirement:continue',label:'Quero continuar jogando',hint:'Seguir no projeto atual ou abrir-se a propostas'},{id:'retirement:stop',label:'Encerrar a carreira de jogador',hint:'Escolher o próximo caminho depois do futebol'}]};return save;}
  if(p.age<=18&&p.positionSeasonChosenFor!==p.season){save.pendingEvent=positionChoiceEvent(p);p.rngState=rng.state;return save;}
  const life=ensureLife(p);
  if(p.age<=18&&life.education.chosenFor!==p.season){save.pendingEvent=educationEvent(p);return save;}
  if(p.age>18&&p.currentClubId&&competitionCategory(p)==='SENIOR'){ensureTactical(p);if(p.tactical!.discussedFor!==p.season){save.pendingEvent=professionalRoleEvent(p);return save;}}
  if(p.professionalStatus==='YOUTH'&&p.promotionReviewedFor!==p.season&&promotionEvidence(p).eligible){p.professionalStatus='INVITED';save.pendingEvent=transitionEvent(p);return save;}
  if(p.professionalStatus==='INVITED'){save.pendingEvent=transitionEvent(p);return save;}
  if(p.injury&&p.injury.remainingBlocks===0){save.pendingEvent=comebackEvent(p);return save;}
  p.careerTurn++;p.seasonTurn++;const progressBefore=p.coaching?.progress??0;const fixtures=simulateWorldBlock(p);accrueEducation(p,(p.coaching?.progress??0)-progressBefore);growthStep(p,rng,null);if(p.age<21&&p.seasonTurn%Math.max(2,Math.round(seasonGames(p)/4.5))===0)updateBody(p,rng);
  let ev:CareerEvent;
  if(p.age>=13&&!p.currentClubId&&p.seasonTurn===3&&life.scouting.lastAttemptSeason!==p.season){ev=assignYouthClub(p,rng);}
  else if(competitionCategory(p)!=='SENIOR'){ev=simulateYouthBlock(p,rng);}
  else if(p.currentClubId){const injuryEvent=injuryBlock(p)??maybeInjury(p,rng);if(injuryEvent&&injuryEvent.id.startsWith('injury-'))log(p,'AFASTAMENTO',injuryEvent.title,injuryEvent.body);ev=injuryEvent??simulateProfessionalBlock(p,rng,fixtures);const marketNow=(p.seasonTurn===Math.floor(seasonGames(p)/2)&&(p.transferIntent==='LEAVE'||p.transferIntent==='FORCE'))?buildMarketEvent(p,rng,'Seu pedido para sair movimentou a janela'):null;if(marketNow&&!injuryEvent)ev=marketNow;}
  else{ev={id:`wait-${p.careerTurn}`,kind:'INFO',title:'Ainda procurando uma estrutura',body:'Você segue competindo localmente. A carreira ainda pode abrir por outra porta.',tags:['ESCOLINHA']};}
  reviewWorldCoaches(p);
  if((p.coaching?.progress??0)>=1-1e-8)p.seasonReviewDue=true;
  if(p.age>=40)ev=endCareerEvent(p);
  p.rngState=rng.state;save.pendingEvent=contextualDecision(p,ev);save.updatedAt=new Date().toISOString();return save;
}

export function overallVisible(p:PlayerState):string{return p.age<16?'—':overall(p).toFixed(0);}
export const getClub=(id:string|null)=>id?CLUB_BY_ID[id]??null:null;
export const clubCount=()=>BRAZIL_CLUBS_2026.length;
export const getPositionLabel=(p:PlayerState)=>p.position==='IND'?'Indefinida':POSITION_LABEL[p.position];

export function requestCoachDiscussion(save:SaveGame):SaveGame{
  const p=save.player;if(!p.currentClubId||p.age<16||p.phase==='APOSENTADO'||save.pendingEvent?.choices?.length||p.coachTalkFor===`${p.season}:${p.seasonTurn}`)return save;
  p.coachTalkFor=`${p.season}:${p.seasonTurn}`;save.pendingEvent=coachDiscussionEvent(p);return save;
}
