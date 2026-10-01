import {clamp, type RNG} from './random.js';
import {CATEGORY_LABEL, calendarScale, competitionCategory} from './calendar.js';
import {rememberCoach, syncCoachContext} from './coaches.js';
import {ensureLife} from './pathways.js';
import type {CareerChoice, CareerEvent, DecisionFamily, PlayerState, VisibleAttributes} from './types.js';

const families:DecisionFamily[]=['LOAD','SPACE','SERVICE','RIVALRY','PRESSURE','ADAPTATION','PATH'];
const choice=(id:string,label:string,hint:string):CareerChoice=>({id,label,hint});
const c={
  rest:choice('routine:rest','Reservar o intervalo para recuperar','Recupera condição e reduz fadiga e carga extra; perde a oportunidade de trabalho específico'),
  review:choice('routine:review','Rever minha atuação em vídeo','Conhece melhor uma habilidade; aumenta fadiga mental sem aumentar o atributo'),
  reset:choice('routine:reset','Reduzir a cobrança sobre mim','Alivia a pressão; perde confiança pessoal e abre mão de maior exposição'),
  help:choice('routine:help','Ajudar a organizar o material e os vídeos','Pode aproximar você do treinador e melhorar o diálogo; aumenta fadiga mental, sem aumentar confiança profissional'),
  team:choice('routine:team','Compartilhar minha leitura com o grupo','Ganha respeito no grupo e aumenta fadiga mental; sem garantia de espaço'),
  intrigue:choice('routine:intrigue','Insinuar que um concorrente não está comprometido','Pode render apoio social; descoberta custa confiança e gera conflito. O grupo guarda memória'),
  focus:choice('routine:focus','Trabalhar a adaptação à função','Reduz a dificuldade de adaptação à função; reduz condição física e aumenta fadiga mental'),
  expose:choice('routine:expose','Assumir a cobrança pela próxima atuação','Aumenta confiança pessoal e pressão; a escalação depende do rendimento'),
};
function attribute(p:PlayerState):keyof VisibleAttributes {
  return p.position==='GK'?'handling':p.position==='CB'?'positioning':p.position==='FB'?'crossing':p.position==='DM'?'tackling':p.position==='AM'?'vision':p.position==='WG'?'dribbling':p.position==='ST'?'finishing':'passing';
}
const names:Partial<Record<keyof VisibleAttributes,string>>={handling:'segurança nas mãos',positioning:'posicionamento',crossing:'cruzamento',tackling:'desarme',vision:'visão',dribbling:'drible',finishing:'finalização',passing:'passe'};
function packages(p:PlayerState,event:CareerEvent):Record<DecisionFamily,{situation:string;choices:CareerChoice[];priority:number}> {
  const m=event.matchFeedback!,senior=(m.category??competitionCategory(p))==='SENIOR',talk=p.currentClubId&&p.age>=16;
  const discuss=talk?choice('career:discuss','Pedir clareza ao treinador','Abre uma conversa sobre expectativas; afinidade e confiança profissional são distintas'):c.review;
  const stable=senior?choice('career:stable','Sustentar o projeto atual','Estabelece permanência e prioridade de estabilidade'):choice('career:local','Continuar neste caminho','Estabelece permanência no caminho de formação');
  const extra=(!p.injury&&p.phase!=='APOSENTADO'&&p.physicalCondition>=55&&p.mentalFatigue<80&&p.careerTurn-(p.decisionMemory?.lastExtraTurn??-99)>=5)?choice('routine:extra',`Ficar após o horário para trabalhar ${names[attribute(p)]}`,'Pequeno ganho na habilidade; reduz condição física e aumenta fadiga mental. Fora do profissional, a carga pesa nas duas próximas notas'):c.review;
  const path=p.age<=18?choice('career:education','Reorganizar meu tempo com a escola','Abre a escolha da prioridade escolar; dividir o tempo altera o desenvolvimento'):senior?choice('career:market','Ouvir outros projetos','Abre intenção de mercado; sem transferência garantida'):discuss;
  const campaign=p.currentClubId?p.coaching?.campaigns[p.currentClubId]:undefined;
  const crisis=!!campaign&&campaign.games>=8&&campaign.points/campaign.games<campaign.expectedPPG-.3;
  const relation=p.relationships[`group:${p.currentClubId??'local'}`];
  return {
    LOAD:{situation:`Depois de ${m.minutes} minutos, sua condição está em ${Math.round(p.physicalCondition)}/100 e a fadiga mental em ${Math.round(p.mentalFatigue)}/100. Você precisa escolher como usar o intervalo disponível.`,choices:[extra,c.rest,extra.id===c.review.id?c.reset:c.review],priority:p.physicalCondition<75||p.mentalFatigue>45?10:2},
    SPACE:{situation:m.minutes===0?'Você não entrou nesta partida. A falta de uma nova avaliação abre a disputa entre pedir explicações, contribuir com o grupo e preservar o vínculo.':`Você participou por ${m.minutes} minutos${m.started?' como titular':' entrando durante o jogo'}. Esse espaço pode ser discutido, sem transformar um pedido em vaga.`,choices:senior?[choice('career:responsibility','Disputar mais responsabilidade no projeto','Pede ampliação do papel com maior cobrança; depende de confiança e evidências esportivas'),discuss,stable]:[discuss,c.team,stable],priority:m.minutes<30?10:1},
    SERVICE:{situation:`O trabalho entre partidas inclui material e revisão de vídeo. Você pode investir tempo em ajudar a comissão, estudar sua própria atuação ou recuperar-se; aproximação pessoal não equivale a confiança esportiva.`,choices:[p.currentClubId?c.help:choice('routine:help','Ajudar a organizar o material e os vídeos','Aproxima você do grupo e aumenta fadiga mental; contribuição não garante uma vaga'),c.review,c.rest],priority:3},
    RIVALRY:{situation:`A disputa por espaço no ${senior?'elenco profissional':p.age<=20?'grupo de formação':'grupo do futebol local'} continua após esta rodada. ${relation?.resentment?`O grupo ainda guarda ressentimento de decisões anteriores.`:'Uma insinuação sobre um concorrente pode circular sem nenhuma prova esportiva.'} Você escolhe como participar dessa disputa.`,choices:[p.currentClubId?c.intrigue:choice('routine:intrigue',c.intrigue.label,'Pode render apoio no grupo; descoberta custa respeito e alimenta ressentimento. O grupo guarda memória'),c.team,discuss],priority:relation?.resentment?7:2},
    PRESSURE:{situation:crisis?`O clube tem ${campaign!.points} pontos em ${campaign!.games} jogos, abaixo da expectativa. Você pode se expor à cobrança, negociar seu papel ou reduzir a pressão pessoal.`:`A ${m.minutes?`nota ${m.rating.toFixed(1)} desta atuação`:'ausência de minutos nesta partida'} chega com pressão pessoal em ${Math.round(p.pressure)}/100. O próximo intervalo pode ampliar a exposição ou ajudar a conter essa carga.`,choices:[c.expose,c.reset,discuss],priority:crisis||p.pressure>55?9:1},
    ADAPTATION:{situation:p.adaptationDebt>0?`Sua mudança de função ainda tem adaptação pendente. Estudar a função aumenta fadiga mental; recuperar-se ou pedir orientação deixa essa tarefa para depois.`:`Sua função atual não tem dívida de adaptação pendente. Você pode estudar a leitura da atuação, recuperar-se ou comparar orientações com o grupo.`,choices:[p.adaptationDebt>0?c.focus:c.review,c.rest,c.team],priority:p.adaptationDebt>0?10:1},
    PATH:{situation:p.age<=18?`A rotina de ${CATEGORY_LABEL[m.category??competitionCategory(p)]} divide tempo com a escola (${ensureLife(p).education.priority==='SCHOOL'?'estudos priorizados':ensureLife(p).education.priority==='FOOTBALL'?'futebol priorizado':'tempo dividido'}). Você pode rever essa divisão do tempo, continuar neste caminho ou aliviar a cobrança pessoal.`:senior?`Você está vinculado ao projeto atual, com intenção de mercado ${p.transferIntent==='STAY'?'de permanecer':'aberta a mudanças'}. Ouvir alternativas compete com conservar o vínculo e reduzir a cobrança.`:`Você segue competindo no futebol local. ${talk?'Conversar sobre sua avaliação':'Rever sua atuação'} pode ajudar a interpretar o rendimento atual; continuar neste caminho e reduzir a cobrança pessoal são as outras alternativas.`,choices:[path,stable,c.reset],priority:p.age<=18?4:1},
  };
}
/** Selection consumes no RNG. Persisted last-offer turns prevent a set recurring within five rounds. */
export function buildRoutineDecision(p:PlayerState,event:CareerEvent):CareerEvent {
  if(event.choices?.length||!event.matchFeedback||!['MATCH','INFO'].includes(event.kind)||p.phase==='APOSENTADO')return event;
  const memory=p.decisionMemory??={recent:[],lastOffered:{}};
  const packs=packages(p,event);
  const eligible=families.filter(f=>p.careerTurn-(memory.lastOffered[f]??-99)>=5);
  const pool=eligible.length?eligible:families;
  const score=(f:DecisionFamily)=>packs[f].priority+Math.min(20,p.careerTurn-(memory.lastOffered[f]??-99))*3;
  const family=[...pool].sort((a,b)=>score(b)-score(a)||((families.indexOf(a)+p.careerTurn)%7)-((families.indexOf(b)+p.careerTurn)%7))[0]!;
  memory.lastOffered[family]=p.careerTurn;
  memory.recent=[...memory.recent,{family,turn:p.careerTurn}].slice(-3);
  event.decisionFamily=family;event.decisionContext=packs[family].situation;event.choices=packs[family].choices;
  return event;
}
function group(p:PlayerState) {
  const key=`group:${p.currentClubId??'local'}`;
  return p.relationships[key]??=( {personId:key,affinity:50,respect:50,rivalry:0,resentment:0,memories:[]} );
}
const deltaLabels:Record<string,string>={condition:'condição',fatigue:'fadiga mental',pressure:'pressão',confidence:'confiança pessoal',adaptation:'adaptação pendente',knowledge:'conhecimento da habilidade',attribute:'ganho na habilidade trabalhada',groupAffinity:'afinidade do grupo',groupRespect:'respeito do grupo',groupResentment:'ressentimento do grupo',groupRivalry:'rivalidade no grupo',coachAffinity:'afinidade com o treinador',coachTrust:'confiança profissional',coachConflict:'conflito com o treinador'};
function effectSnapshot(p:PlayerState,key:keyof VisibleAttributes):Record<string,number>{
  const r=p.relationships[`group:${p.currentClubId??'local'}`];
  const bond=p.currentClubId&&p.tactical?p.coaching?.bonds[p.tactical.coachId]:undefined;
  return {condition:p.physicalCondition,fatigue:p.mentalFatigue,pressure:p.pressure,confidence:p.confidence,adaptation:p.adaptationDebt,knowledge:p.attributeKnowledge[key],attribute:p.attributes[key],groupAffinity:r?.affinity??50,groupRespect:r?.respect??50,groupResentment:r?.resentment??0,groupRivalry:r?.rivalry??0,...(bond?{coachAffinity:bond.affinity,coachTrust:bond.trust,coachConflict:bond.conflict}:{})};
}
function effectReport(before:Record<string,number>,after:Record<string,number>,keys:string[]):string{
  return keys.filter(key=>before[key]!==undefined&&after[key]!==undefined).map(key=>{
    const delta=after[key]!-before[key]!,magnitude=Math.abs(delta);
    const displayed=magnitude>0&&magnitude<.01?'<0,01':Number(magnitude.toFixed(2)).toString().replace('.',',');
    return `${deltaLabels[key]} ${delta<0?'−':'+'}${displayed}`;
  }).join('; ')+'.';
}
/** Only offered routine ids can mutate the player; resolution is idempotent per event. */
export function resolveRoutineChoice(p:PlayerState,event:CareerEvent,id:string,rng:RNG):boolean {
  if(!event.decisionFamily||!event.choices?.some(c=>c.id===id)||!id.startsWith('routine:')||p.phase==='APOSENTADO'||p.decisionMemory?.lastResolvedEvent===event.id)return false;
  if(id==='routine:extra'&&(p.injury||p.physicalCondition<55||p.mentalFatigue>=80||p.careerTurn-(p.decisionMemory?.lastExtraTurn??-99)<5))return false;
  if(id==='routine:focus'&&(p.adaptationDebt<=0||p.injury))return false;
  if(!['extra','rest','review','reset','help','team','focus','expose','intrigue'].some(action=>id===`routine:${action}`))return false;
  if(p.currentClubId&&(id==='routine:help'||id==='routine:intrigue'))syncCoachContext(p);
  const memory=p.decisionMemory??={recent:[],lastOffered:{}};
  const key=attribute(p),before=effectSnapshot(p,key);let detail='',keys:string[]=[];
  const coach=(text:string,affinity:number,trust:number,conflict:number)=>{if(p.currentClubId)rememberCoach(p,text,affinity,trust,conflict);};
  if(id==='routine:extra'){
    p.attributes[key]=clamp(p.attributes[key]+.25*calendarScale(p),0,99);p.physicalCondition=clamp(p.physicalCondition-5);p.mentalFatigue=clamp(p.mentalFatigue+4);memory.lastExtraTurn=p.careerTurn;
    if((event.matchFeedback?.category??competitionCategory(p))!=='SENIOR')memory.extraLoad=2;
    detail=`Trabalho extra em ${names[key]}.${memory.extraLoad?' Carga extra: −0,4 na próxima nota fora do profissional e −0,2 na seguinte, se não descansar.':''}`;keys=['attribute','condition','fatigue'];
  }else if(id==='routine:rest'){
    p.physicalCondition=clamp(p.physicalCondition+4);p.mentalFatigue=clamp(p.mentalFatigue-5);const load=memory.extraLoad??0;memory.extraLoad=Math.max(0,load-1);
    detail=`Recuperação: carga extra reduzida em ${load-memory.extraLoad}. Você abriu mão do trabalho específico neste intervalo; não ganhou uma vaga.`;keys=['condition','fatigue'];
  }else if(id==='routine:review'){
    p.attributeKnowledge[key]=clamp(p.attributeKnowledge[key]+3);p.mentalFatigue=clamp(p.mentalFatigue+2);
    detail=`Revisão de vídeo sobre ${names[key]}, sem ganho de atributo.`;keys=['knowledge','fatigue'];
  }else if(id==='routine:reset'){
    p.pressure=clamp(p.pressure-4);p.confidence=clamp(p.confidence-1);
    detail='Cobrança reduzida. Você abriu mão de se expor mais nesta rodada.';keys=['pressure','confidence'];
  }else if(id==='routine:help'){
    p.mentalFatigue=clamp(p.mentalFatigue+4);coach('Ajudou a organizar material e vídeos',4,0,0);const r=group(p);r.affinity=clamp(r.affinity+2);r.memories.unshift(`${p.season}: Ajudou a organizar material e vídeos`);r.memories=r.memories.slice(0,16);
    detail='Ajuda à organização. Confiança profissional e escalação preservadas.';keys=['fatigue','groupAffinity','coachAffinity','coachTrust'];
  }else if(id==='routine:team'){
    p.mentalFatigue=clamp(p.mentalFatigue+2);const r=group(p);r.respect=clamp(r.respect+3);r.memories.unshift(`${p.season}: Compartilhou leitura da atuação`);r.memories=r.memories.slice(0,16);
    detail='Cooperação: a contribuição não assegurou mais minutos.';keys=['groupRespect','fatigue'];
  }else if(id==='routine:focus'){
    p.adaptationDebt=Math.max(0,p.adaptationDebt-2);p.physicalCondition=clamp(p.physicalCondition-2);p.mentalFatigue=clamp(p.mentalFatigue+3);
    detail='Estudo da função.';keys=['adaptation','condition','fatigue'];
  }else if(id==='routine:expose'){
    p.confidence=clamp(p.confidence+2);p.pressure=clamp(p.pressure+5);
    detail='Maior exposição. A escalação continua dependendo de evidências esportivas.';keys=['confidence','pressure'];
  }else if(id==='routine:intrigue'){
    const r=group(p),caught=rng.chance(clamp(.55+r.resentment/200,.55,.9));p.mentalFatigue=clamp(p.mentalFatigue+3);r.rivalry=clamp(r.rivalry+4);
    if(caught){coach('Insinuação contra concorrente foi descoberta',-3,-6,8);r.resentment=clamp(r.resentment+8);r.respect=clamp(r.respect-5);detail='A insinuação foi descoberta. Nenhum concorrente foi afastado.';keys=['coachTrust','coachAffinity','coachConflict','groupRespect','groupResentment'];}
    else{coach('Insinuação trouxe apoio social sem evidência esportiva',2,0,0);r.affinity=clamp(r.affinity+2);r.resentment=clamp(r.resentment+2);detail='A insinuação circulou sem descoberta. Confiança profissional não aumentou; nenhum espaço foi garantido.';keys=['coachAffinity','coachTrust','groupAffinity','groupResentment'];}
    const rivalryDelta=Number((r.rivalry-before.groupRivalry!).toFixed(6));r.memories.unshift(`${p.season}: ${caught?'Descoberta':'Circulação'} de insinuação contra concorrente; rivalidade +${rivalryDelta}`);r.memories=r.memories.slice(0,16);keys.push('groupRivalry','fatigue');
  }
  detail+=' '+effectReport(before,effectSnapshot(p,key),keys);
  memory.lastResolvedEvent=event.id;
  p.history.unshift({turn:p.careerTurn,season:p.season,age:p.age,type:'DECISÃO',headline:event.choices.find(c=>c.id===id)!.label,detail});p.history=p.history.slice(0,220);
  return true;
}
