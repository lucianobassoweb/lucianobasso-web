// Separate fictional football simulation. No storage, browser APIs or dependencies.
import {CLUBS,ENTRY_CLUB_IDS,LEGACY_CLUB_IDS} from './clubs.mjs';
export {CLUBS};
export const POSITIONS=[['GK','Goleiro'],['CB','Zagueiro'],['FB','Lateral'],['DM','Volante'],['CM','Meio-campista'],['AM','Meia ofensivo'],['WG','Ponta'],['ST','Atacante']].map(([id,label])=>({id,label}));
const KEYS=['finishing','passing','reading','pace','defending','goalkeeping'];
const WEIGHTS={GK:[0,.1,.25,.05,.1,.5],CB:[.05,.15,.3,.1,.4,0],FB:[.1,.25,.2,.25,.2,0],DM:[.05,.25,.3,.1,.3,0],CM:[.1,.35,.3,.15,.1,0],AM:[.2,.35,.3,.15,0,0],WG:[.3,.2,.2,.3,0,0],ST:[.5,.1,.2,.2,0,0]};
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const random=g=>{g.rng=(Math.imul(g.rng,1664525)+1013904223)>>>0;return g.rng/4294967296;};
const roll=(g,p)=>random(g)<clamp(p,0,1);
const integer=(g,min,max)=>min+Math.floor(random(g)*(max-min+1));
const stat=()=>({apps:0,starts:0,minutes:0,goals:0,assists:0,ratingSum:0});
export const club=g=>CLUBS.find(c=>c.id===g.clubId)??null;
const national=c=>c?.division==='A'||c?.division==='B';
const divisionText=c=>c.divisionLabel??(national(c)?`Série ${c.division}`:'Circuito de transição');
export function overall(g){return Math.round(KEYS.reduce((s,k,i)=>s+g.skills[k]*WEIGHTS[g.position][i],0)*(.9+g.proficiency*.001));}
const option=(id,label,hint)=>({id,label,hint});
const num=v=>v.toFixed(1).replace('.',',');
const primary=g=>KEYS[WEIGHTS[g.position].indexOf(Math.max(...WEIGHTS[g.position]))];
function event(g,kind,title,body,choices=[]){g.serial++;g.event={id:`p10v2-${g.serial}`,kind,title,body,choices:choices.map(c=>({...c,id:`${c.id}@${g.serial}`}))};}
function log(g,text){g.log.unshift(text);g.log=g.log.slice(0,100);}
function memory(g,text,change=0,critical=false){g.memoryTimeline??=[];if(g.clubId){g.memoryTimeline.unshift({clubId:g.clubId,text,critical,season:g.season,round:g.round,sequence:(g.memorySequence??0)+1});g.memorySequence=(g.memorySequence??0)+1;g.memoryTimeline=g.memoryTimeline.slice(0,100);}const c=club(g);if(!c)return;const m=g.fanMemory[c.id]??={respect:50,entries:[],criticalEntries:[]};m.respect=clamp(m.respect+change);if(critical){m.criticalEntries.unshift(text);m.criticalEntries=m.criticalEntries.slice(0,10);}else{m.entries.unshift(text);m.entries=m.entries.slice(0,4);}}
const labelSkill={finishing:'finalização',passing:'passe',reading:'leitura',pace:'velocidade',defending:'defesa',goalkeeping:'segurança no gol'};
function growth(g,focus,extra=false,minutes=0){
 // Regular training remains possible on the bench; actual use accelerates specific skills.
 for(const [i,k]of KEYS.entries()){
  const relevant=WEIGHTS[g.position][i],practice=.16+minutes/90*.84;
  const gain=.22*g.dna.learning*g.dna.aptitudes[k]*(.2+relevant*2.2)*(k===focus?1.85:1)*practice*(extra?1.5:1)*(.65+g.condition/300)*Math.max(.35,1-g.fatigue/130)*(1-g.skills[k]/125);
  g.skills[k]=clamp(g.skills[k]+gain,0,99);
 }
}
const intents=g=>g.position==='GK'?['SAFE','BUILD','SWEEP']:['CB','FB','DM'].includes(g.position)?['HOLD','BUILD','ADVANCE']:g.position==='ST'?['ATTACK','LINK','PRESS']:['CREATE','ATTACK','CONTROL'];
const focusFor=(g,intent)=>({SAFE:'goalkeeping',BUILD:'passing',SWEEP:'reading',HOLD:'defending',ADVANCE:g.position==='FB'?'pace':'defending',ATTACK:'finishing',LINK:'passing',PRESS:'pace',CREATE:'passing',CONTROL:'reading'})[intent]??primary(g);
const TECHNICAL={GK:['goalkeeping','passing'],CB:['defending','passing'],FB:['passing','defending'],DM:['defending','passing'],CM:['passing','finishing'],AM:['passing','finishing'],WG:['finishing','pace'],ST:['finishing','passing']};
function formationEvent(g){g.age=[12,14,16][g.formation];g.objective={title:'Aprender sua posição',body:'Três etapas de formação antes do primeiro projeto adulto.',progress:{stages:g.formation},target:{stages:3},progressText:`${g.formation}/3 etapas`,targetText:'3 etapas; escolha onde acumular experiência',status:'ACTIVE'};event(g,'FORMATION',`Seu jogo aos ${g.age}`,`Como ${POSITIONS.find(p=>p.id===g.position).label.toLowerCase()}, você ainda constrói habilidade e experiência. Esta etapa registra aprendizado; o adulto não começa pronto.`,[option('formation:technique','Lapidar a técnica da posição','Melhora as habilidades relevantes para sua função.'),option('formation:reading','Especializar a leitura de jogo','Prioriza leitura e experiência; a técnica terá menos prática nesta etapa.'),option('formation:athletic','Ganhar ritmo e solidez','Trabalha velocidade/defesa e experiência.')]);}
export function createGame(name,position,seed=Date.now()>>>0){
 if(!POSITIONS.some(p=>p.id===position))throw new Error('Posição inválida');
 const g={schema:2,rulesRevision:1,calendarRevision:1,name:String(name||'Jogador').slice(0,60),age:12,position,clubId:null,condition:85,fatigue:10,pressure:15,confidence:60,trust:48,skills:{},proficiency:28,dna:{learning:0,aptitudes:{}},rng:Number(seed)>>>0,seed:Number(seed)>>>0,round:0,season:18,period:0,formation:0,phase:'FORMATION',serial:0,decisions:0,totalstats:stat(),seasonStats:stat(),yearStats:[],playedMatches:[],lastMatches:[],history:[],log:[],fanMemory:{},reputation:0,rival:null,market:[],resolved:[],choicesLog:[],progression:[],objective:null,objectiveHistory:[],lastOutcome:null,roleEvidence:null,recoveryUsed:false,recoveryWork:null,recoveryArc:null,decisiveUsed:false,decisive:null,schedule:[],event:null};
 g.dna.learning=.85+random(g)*.55;for(const k of KEYS){g.dna.aptitudes[k]=.8+random(g)*.55;g.skills[k]=14+random(g)*9;}formationEvent(g);return g;
}
function schedule(g){
 const c=club(g),division=national(c)?c.division:'TRANSITION';
 const rivals=CLUBS.filter(x=>x.id!==g.clubId&&(division==='TRANSITION'?LEGACY_CLUB_IDS.includes(x.id):x.division===division));
 if(rivals.length<9)throw new Error('Calendário sem nove rivais disponíveis');
 let offset=(g.seed+g.season)%rivals.length;const last=g.playedMatches.at(-1)?.opponentId;
 // Rotate a nine-club sample. Across offsets every peer in the division is reachable.
 if(rivals[offset].id===last)offset=(offset+1)%rivals.length;
 const first=Array.from({length:9},(_,i)=>rivals[(offset+i)%rivals.length].id);
 g.schedule=[...first,...first];g.calendarRevision=1;g.scheduleDivision=division;
}
function startSeason(g){g.lastMatches=[];g.roleEvidence=null;g.coachReaction='';g.fanReaction='';g.age=g.season;g.period=0;g.round=0;g.seasonStats=stat();g.phase='PRO';g.condition=clamp(g.condition+8);g.fatigue=clamp(g.fatigue-8);g.pressure=clamp(g.pressure-4);schedule(g);if(g.pendingNewClub){g.pendingNewClub=false;rivalEvent(g);}else if(recoveryAvailable(g)&&g.objective?.status==='MISSED')recoveryEvent(g);else continuationEvent(g);}
function rivalEvent(g){const c=club(g);g.rival={name:['Rafael Nunes','Bruno Medeiros','Caio Fontes'][g.history.length%3],quality:c.level-1,form:6.7,apps:0,goals:0,minutes:0,recentRating:6.7};event(g,'RIVALRY','Um projeto, uma disputa por espaço',`${g.rival.name} é um concorrente fictício de nível ${g.rival.quality}. Seu nível é ${overall(g)}. No ${c.name} (${divisionText(c)}), a entrada em campo será observada: escolher uma postura não compra a vaga.`,[option('rival:earn','Mostrar meu jogo na função','A próxima meta avaliará sua produção e seus minutos.'),option('rival:team','Construir parceria com o elenco','Estabelece a intenção de cooperar; a contribuição nas partidas decide o efeito.'),option('rival:challenge','Disputar um papel mais ofensivo','Eleva a exigência da próxima meta, sem ganhar titularidade no clique.')]);}
const OUTPUT_NAMES={attack:'pontos de finalização (chutes no alvo + gols)',creation:'chances criadas',control:'passes completos',protection:'defesas e intervenções',sweep:'antecipações fora do gol',press:'recuperações na pressão',advance:'progressões e apoio',cooperation:'ações de cooperação',role:'produção da função'};
function outputLabel(g,o=g.objective){
 if(o?.revision===1)return OUTPUT_NAMES[o.metric];
 if(g.recoveryWork==='COOPERATE'||o?.metric==='cooperation')return 'ações de cooperação';
 return g.position==='GK'?'defesas':g.position==='ST'?'gols':['CB','DM'].includes(g.position)?'intervenções':g.position==='FB'?'ações de criação e intervenção':'chances criadas';
}
function metricFor(g,intent){
 if(g.recoveryWork==='COOPERATE')return 'cooperation';
 return {SAFE:'protection',SWEEP:'sweep',BUILD:g.position==='GK'?'control':'creation',HOLD:'protection',ADVANCE:'advance',ATTACK:'attack',LINK:'creation',PRESS:'press',CREATE:'creation',CONTROL:'control'}[intent];
}
function targetForMetric(position,metric,strong){
 const baseline={attack:['ST','WG'].includes(position)?3:2,creation:position==='ST'?3:position==='GK'?2:4,control:position==='GK'?6:15,protection:position==='GK'?5:8,sweep:4,press:5,advance:8,cooperation:6}[metric];
 return {apps:3,minutes:strong?210:150,good:strong?2:1,output:baseline+(strong?Math.ceil(baseline*.25):0)};
}
export function projectTarget(g,intent){return targetForMetric(g.position,metricFor(g,intent),overall(g)>=club(g).level+6);}
function objective(g,intent=intents(g)[0]){
 const strong=overall(g)>=club(g).level+6;
 const revised=g.rulesRevision===1,metric=revised?metricFor(g,intent):g.recoveryWork==='COOPERATE'?'cooperation':'role';
 const target=revised?projectTarget(g,intent):{apps:strong?4:3,minutes:strong?220:150,good:strong?3:2,output:g.recoveryWork==='COOPERATE'?3:g.position==='ST'?1:g.position==='GK'?6:['CB','DM'].includes(g.position)?8:g.position==='FB'?10:6};
 const challenge=!!g.intentChallenge;if(challenge)target.good++;
 const o={season:g.season,period:g.period+1,clubId:g.clubId,metric,title:g.recoveryWork?'Provar a mudança de trabalho':'Conquistar confiança pela atuação',body:'A produção será avaliada no papel escolhido durante seis partidas. Uma amostra curta limita a prova de consistência, mas feitos excepcionais recebem crédito.',progress:{apps:0,minutes:0,good:0,output:0},target,status:'ACTIVE'};
 if(revised){o.revision=1;o.intent=intent;o.challenge=challenge;o.strong=strong;o.cooperation=g.recoveryWork==='COOPERATE';}
 const label=outputLabel(g,o);o.progressText=`0/${target.apps} participações · 0/${target.minutes} min · 0/${target.good} boas atuações · 0/${target.output} ${label}`;
 o.targetText=`${target.apps} participações, ${target.minutes} min, ${target.good} boas atuações (≥35 min/nota≥7${revised?' ou feito excepcional':''}) e ${target.output} ${label}`;
 return o;
}
function planEvent(g){if(g.rulesRevision===undefined)g.rulesRevision=1;g.objective=objective(g);const opponent=CLUBS.find(c=>c.id===g.schedule[g.round]);const harder=opponent.level>club(g).level+8;const window=g.period+1,periodOpponents=g.schedule.slice(g.round,g.round+6).map(id=>CLUBS.find(c=>c.id===id)),stronger=periodOpponents.filter(x=>x.level>club(g).level).length;const labels={SAFE:['Proteger o gol nas finalizações','Maior segurança nas defesas; participa menos da construção e conserva energia.'],BUILD:['Iniciar as jogadas com passe','Prioriza passes e criação na saída; erro de construção pode expor o time.'],SWEEP:['Antecipar bolas nas costas','Mais intervenções fora do gol e carga física; antecipações falhas expõem a baliza.'],HOLD:[harder?'Fechar o setor contra um rival forte':'Ganhar a disputa no meu setor','Prioriza leitura e intervenções; reduz a exposição defensiva.'],ADVANCE:[`Apoiar a construção pela ${g.position==='FB'?'faixa':'recuperação'}`,'Mais chance de criar, com espaço deixado para o rival.'],ATTACK:[g.position==='ST'?`Atacar o espaço contra ${opponent.shortName}`:`Chegar para finalizar neste período`,'Prioriza finalizações e movimentos ofensivos; cobra contribuição no ataque.'],LINK:[`Conectar o ataque para ${window===1?'ganhar':'sustentar'} espaço`,'Prioriza passes e criação; não exige marcar em toda partida.'],PRESS:['Pressionar a saída do adversário','Prioriza intervenções adiantadas e leitura; pede mais energia.'],CREATE:[`Criar oportunidades ${window===2?'entre as linhas':window===3?'no último terço':'para o ataque'}`,'Prioriza passes-chave e chances criadas; gols são uma parte da contribuição.'],CONTROL:[harder?'Controlar o jogo sem se expor':'Dar ritmo ao meio-campo','Prioriza passes e leitura; avalia qualidade das ações, não só gols.']};
 event(g,'PLAN',`${g.season} anos · ${window}º período: ${g.objective.title}`,`${divisionText(club(g))}: seis partidas, ${stronger} rivais acima do nível do ${club(g).name}. Primeiro ${opponent.name}, nível ${opponent.level}; seu clube, nível ${club(g).level}. ${g.objective.targetText}. Recuperação entre jogos é automática; você escolhe uma intenção esportiva para os próximos seis jogos.`,intents(g).map(id=>option(`intent:${id}`,labels[id][0],labels[id][1]+(g.rulesRevision===1?` Meta do papel: ${projectTarget(g,id).output} ${OUTPUT_NAMES[metricFor(g,id)]}.`:''))));
}
function recoveryEvent(g){g.recoveryUsed=true;g.recoveryLast={clubId:g.clubId,season:g.season,step:(g.season-18)*3+g.period};g.recoveryArc={clubId:g.clubId,season:g.season,status:'CHOOSING',beforeStarts:(g.lastMatches.length?g.lastMatches:g.playedMatches.filter(m=>m.season===g.season-1).slice(-6)).filter(m=>m.started).length,beforeLevel:overall(g),work:null};event(g,'RECOVERY','Uma resposta para recuperar espaço',`No último período registrado: ${(g.lastMatches.length?g.lastMatches:g.playedMatches.filter(m=>m.season===g.season-1).slice(-6)).filter(m=>m.minutes).length} participações, ${(g.lastMatches.length?g.lastMatches:g.playedMatches.filter(m=>m.season===g.season-1).slice(-6)).filter(m=>m.started).length} titularidades. A meta não foi cumprida ou a oportunidade foi limitada. Escolha uma mudança concreta para ser avaliada no próximo período, sem um bônus automático de vaga.`,[option('recovery:EXTRA',`Trabalhar mais ${labelSkill[primary(g)]}`,'Mais aprendizado da habilidade por seis jogos; esforço cobra condição e fadiga. O retorno depende da atuação.'),option('recovery:READ','Rever as ações e mudar a leitura','Mais aprendizado de leitura por seis jogos; a nova meta precisa de evidência em campo.'),option('recovery:COOPERATE','Apoiar uma função mais simples','Mais aprendizado de passe e exigência orientada à cooperação; não concede minutos imediatamente.')]);}
function decisiveEvent(g){g.decisiveUsed=true;event(g,'DECISIVE','Um teste real para sua nova resposta',`Na próxima participação de ao menos 45 minutos, o treinador observará sua postura. Uma entrada curta não será tratada como prova decisiva. A janela dura até seis jogos.`,[option('decisive:risk','Assumir uma intervenção mais ambiciosa','Aumenta ações e criação, mas expõe o time; reconhecimento depende da atuação suficiente.'),option('decisive:safe','Provar consistência na função','Reduz exposição, priorizando ações corretas; ainda exige desempenho observado.')]);}
function outputFor(g,m,o){
 if(o.revision===1){switch(o.metric){
  case 'attack':return m.shotsOnTarget+m.goals;
  case 'creation':return m.chancesCreated;
  case 'control':return m.completedPasses;
  case 'protection':return g.position==='GK'?m.saves+m.interventions:m.interventions;
  case 'sweep':case 'press':return m.interventions;
  case 'advance':return m.interventions+m.chancesCreated+(m.progressions??0);
  case 'cooperation':return m.chancesCreated+m.assists+m.interventions;
 }}
 if(o.metric==='cooperation')return m.chancesCreated+m.assists+m.interventions;
 return g.position==='GK'?m.saves:g.position==='ST'?m.goals:['CB','DM'].includes(g.position)?m.interventions:g.position==='FB'?m.interventions+m.chancesCreated:m.chancesCreated;
}
function roleOutput(g,m){return outputFor(g,m,g.objective);}
function updateObjective(g,m){const o=g.objective;if(m.minutes){o.progress.apps++;o.progress.minutes+=m.minutes;o.progress.good+=(m.good||o.revision===1&&m.exceptional)?1:0;o.progress.output+=roleOutput(g,m);}o.progressText=`${o.progress.apps}/${o.target.apps} participações · ${o.progress.minutes}/${o.target.minutes} min · ${o.progress.good}/${o.target.good} boas atuações · ${o.progress.output}/${o.target.output} ${outputLabel(g)}`;}
function assessObjective(g){const o=g.objective;o.status=Object.keys(o.target).every(k=>o.progress[k]>=o.target[k])?'MET':'MISSED';g.objectiveHistory.push(JSON.parse(JSON.stringify(o)));if(o.status==='MET'){g.projectStrain=Math.max(0,(g.projectStrain??0)-1);const beforeTrust=g.trust,beforeRep=g.reputation;g.trust=clamp(g.trust+3);g.reputation=clamp(g.reputation+2);memory(g,`Cumpriu a meta de ${outputLabel(g)}: ${o.progressText}.`,3,true);g.lastOutcome={title:'Uma meta cumprida em campo',body:`${o.progressText}. O treinador registrou a contribuição: confiança +${num(g.trust-beforeTrust)} e reputação +${num(g.reputation-beforeRep)}. A meta concluída pertence ao ${club(g).name}, aos ${g.season} anos.`};}else{memory(g,`Meta não cumprida no papel: ${o.progressText}. Próxima resposta será reavaliada.`,o.progress.minutes<o.target.minutes?0:-2,true);g.pressure=clamp(g.pressure+6);g.projectStrain=clamp((g.projectStrain??0)+1,0,4);g.lastOutcome={title:o.progress.minutes<o.target.minutes?'Faltou oportunidade para provar a meta':'A meta ainda não foi cumprida',body:`${o.progressText}. ${o.progress.minutes<o.target.minutes?'A amostra limitada não é uma atuação ruim.':'O trabalho precisa de outra resposta esportiva; o tempo sozinho não fecha a meta.'}`};}
 g.lastOutcome.season=g.season;g.lastOutcome.clubId=g.clubId;g.lastOutcome.status=o.status;g.lastOutcome.target={...o.target};g.lastOutcome.achieved={...o.progress};
 if(g.recoveryWork){const met=o.status==='MET';g.recoveryArc.status=met?'PROVED':'UNPROVED';g.recoveryArc.afterStarts=g.lastMatches.filter(m=>m.started).length;g.recoveryArc.afterLevel=overall(g);memory(g,`Resposta ${g.recoveryWork}: ${met?'mudança comprovada pela meta':'mudança ainda sem comprovação'}; ${o.progressText}.`,met?2:0,true);g.recoveryWork=null;}
}
function simulate(g,intent){
 const c=club(g),opponent=CLUBS.find(c=>c.id===g.schedule[g.round]);
 // Calendar recovery is automatic; intense choices can consume more than it restores.
 g.condition=clamp(g.condition+4.5);g.fatigue=clamp(g.fatigue-3.5);
 const fans=g.fanMemory[c.id]?.respect??50,crisis=g.projectStrain??0;
 const expectations=29+c.prestige*.24+crisis*7+(g.intentChallenge?6:0)+(fans-50)*.12;
 g.pressure=clamp(g.pressure+(expectations-g.pressure)*.12);
 const extra=g.recoveryWork==='EXTRA';if(extra){g.condition=clamp(g.condition-2);g.fatigue=clamp(g.fatigue+2);}
 // Confidence changes execution under pressure, not DNA or entitlement to selection.
 const composure=(g.confidence-60)*(.025+g.pressure*.0007);
 const role=overall(g),effective=role+composure-Math.max(0,80-g.condition)*.1-Math.max(0,g.fatigue-30)*.1-Math.max(0,g.pressure-45)*.065;
 const recent=g.playedMatches.filter(m=>m.clubId===c.id&&(m.minutes>=35||m.exceptional)).slice(-6);
 const weights=recent.reduce((v,m)=>v+(m.minutes>=35?1:.5),0),form=weights?recent.reduce((v,m)=>v+m.rating*(m.minutes>=35?1:.5),0)/weights:6.7;
 const rivalForm=g.rival.form??6.7;
 const starterChance=clamp(.47+(effective-g.rival.quality)*.026+(g.trust-50)*.004+(form-rivalForm)*.12+(fans-50)*.0005,.10,.86);
 const started=roll(g,starterChance),keeperSub=!started&&g.position==='GK'&&roll(g,.04);
 const minutes=started?(g.position==='GK'?90:integer(g,66,90)):g.position==='GK'?(keeperSub?integer(g,15,60):0):roll(g,.74)?integer(g,14,34):0,share=minutes/90;
 let posture=null;if(g.decisive){g.decisive.remaining--;if(minutes>=45){posture=g.decisive.kind;g.decisive=null;}else if(g.decisive.remaining===0){memory(g,'A janela especial acabou sem participação de 45 minutos; nenhuma prova decisiva foi atribuída.',0,true);g.decisive=null;}}
 const m={season:g.season,round:g.round+1,clubId:c.id,opponent:opponent.name,opponentId:opponent.id,gf:0,ga:0,minutes,started,goals:0,assists:0,rating:0,saves:0,result:'D',coach:'',fans:'',moment:'',strategy:intent,teamChances:0,oppChances:0,shots:0,shotsOnTarget:0,chancesCreated:0,keyPasses:0,passAttempts:0,completedPasses:0,interventions:0,failedInterventions:0,good:false,exceptional:false,progressions:0,goalsConceded:0,keeperShots:0,keeperMinutesReason:keeperSub?'CONTINGENCY':g.position==='GK'&&started?'START':'NONE'};
 const defender=['CB','FB','DM'].includes(g.position),creator=['CM','AM','WG','FB','DM'].includes(g.position);
 const execution=(composure-Math.max(0,g.fatigue-30)*.05-Math.max(0,g.pressure-45)*.04)*.004;
 // Nine event times establish GK responsibility instead of charging the whole score.
 const entered=90-minutes;
 for(let possession=0;possession<9;possession++){
  const present=minutes>0&&(possession+.5)*10>=entered;
  const involved=present&&roll(g,(creator?.66:g.position==='ST'?.50:intent==='BUILD'?.70:.30)*(g.arrivalIntent==='team'&&g.period===0?1.1:1));let passCreated=false,failedBuild=false,advanced=false,buildProgress=false;
  if(involved){const completedBefore=m.completedPasses,attempts=creator?integer(g,1,3):g.position==='GK'&&intent==='BUILD'?2:1;
   for(let i=0;i<attempts;i++){m.passAttempts++;if(roll(g,clamp(.65+(g.skills.passing-opponent.level)*.005+execution+(intent==='CONTROL'||intent==='BUILD'?.08:0),.38,.9)))m.completedPasses++;else if(intent==='BUILD')failedBuild=true;}
   const develops=roll(g,clamp(.37+(g.skills.reading+g.skills.passing-opponent.level*2)*.004+execution+(['CREATE','LINK','BUILD'].includes(intent)?.14:0),.13,.8))&&m.completedPasses>completedBefore;
   if(g.position==='GK'){buildProgress=intent==='BUILD'&&m.completedPasses>completedBefore;if(buildProgress)m.progressions++;passCreated=develops&&roll(g,.10);}else passCreated=develops;
  }
  if(present&&g.position!=='GK'&&['ATTACK','ADVANCE','PRESS'].includes(intent)&&roll(g,clamp(.38+(g.skills.pace-opponent.level)*.007+execution,.15,.75))){m.progressions++;advanced=true;}
  const creation=clamp(.39+(c.level-opponent.level)*.004+(passCreated?.24:0)+(buildProgress?.14:0)+(advanced?.08:0)+(posture==='risk'?.07:0),.14,.78);
  if(roll(g,creation)){
   m.teamChances++;if(passCreated){m.chancesCreated++;m.keyPasses++;}
   const personalShot=present&&g.position!=='GK'&&roll(g,(g.position==='ST'?.65:g.position==='WG'?.4:g.position==='AM'?.25:g.position==='CM'?.12:.035)*(intent==='ATTACK'?1.3:intent==='CREATE'||intent==='CONTROL'?.65:1));
   const finishing=personalShot?g.skills.finishing:c.level,exec=personalShot?execution:0;
   // Both protagonist and teammate must hit the target and beat the goalkeeper.
   const onTarget=roll(g,clamp(.56+(finishing-opponent.level)*.004+exec,.3,.8));
   const goal=onTarget&&roll(g,clamp(.44+(finishing-opponent.level)*.004+exec,.22,.7));
   if(personalShot){m.shots++;if(onTarget)m.shotsOnTarget++;if(goal)m.goals++;}else if(goal&&passCreated)m.assists++;
   if(goal)m.gf++;
  }
  let intervention=false,failedSweep=false;
  const defensiveFrequency=g.position==='GK'?(intent==='SWEEP'?.58:0):intent==='PRESS'?.57:defender?.60:g.position==='CM'?.32:.17;
  if(present&&roll(g,defensiveFrequency)){
   const skill=g.position==='GK'?g.skills.reading+g.skills.pace:g.skills.defending+g.skills.reading;
   if(roll(g,clamp(.54+(skill-opponent.level*2)*.004+execution+(['HOLD','PRESS','SWEEP'].includes(intent)?.07:0),.24,.86))){m.interventions++;intervention=true;}else{m.failedInterventions++;failedSweep=g.position==='GK';}
  }
  const oppCreation=clamp(.42+(opponent.level-c.level)*.004-(intervention?.22:0)+(posture==='risk'?.06:posture==='safe'?-.05:0)+(present?(intent==='ADVANCE'?.04:intent==='HOLD'?-.04:intent==='SAFE'?-.035:intent==='SWEEP'?.05:0):0)+(failedBuild?.10:0)+(failedSweep?.14:0),.12,.82);
  if(roll(g,oppCreation)){
   m.oppChances++;const onTarget=roll(g,.68);if(onTarget){const keeper=g.position==='GK'&&present,keeperLevel=keeper?g.skills.goalkeeping:c.level;
    if(keeper)m.keeperShots++;
    const goal=roll(g,clamp(.4+(opponent.level-keeperLevel)*.005-(keeper?execution:0)+(keeper&&intent==='SAFE'?-.075:0)+(failedSweep?.1:0),.16,.72));
    if(goal){m.ga++;if(keeper)m.goalsConceded++;}else if(keeper)m.saves++;
   }
  }
 }
 if(minutes>0){
  let rating=6.35+(effective-c.level)*.01;
  if(g.position==='GK')rating+=m.saves*.25+m.interventions*.22+(m.goalsConceded===0&&minutes>=45?.35:0)-Math.max(0,m.goalsConceded-1)*.17-m.failedInterventions*.13;
  else if(defender)rating+=m.interventions*.16+m.chancesCreated*.15+m.completedPasses*.02+m.assists*.55+m.goals*.85-m.failedInterventions*.12;
  else if(g.position==='ST')rating+=m.goals*1.2+m.assists*.65+m.shotsOnTarget*.17+m.chancesCreated*.19+m.interventions*.12-m.shots*.035;
  else rating+=m.goals*.9+m.assists*.62+m.chancesCreated*.24+m.completedPasses*.035+m.interventions*.12-(m.passAttempts-m.completedPasses)*.07;
  if(minutes<35)rating=6.5+(rating-6.5)*.7;
  m.rating=Math.round(clamp(rating,4.5,9.5)*10)/10;m.good=minutes>=35&&m.rating>=7;
  m.exceptional=m.goals>=2||m.goals+m.assists>=2||g.position==='GK'&&m.saves>=4&&m.goalsConceded===0;
 }
 m.result=m.gf>m.ga?'W':m.gf<m.ga?'L':'D';
 if(minutes>=35&&g.arrivalIntent==='team'&&g.period===0&&m.completedPasses>=4)g.trust=clamp(g.trust+.2);
 if(minutes>=35){g.trust=clamp(g.trust+(m.rating>=7?.7:m.rating<6.3?-.65:0));const target=clamp(65+(m.rating-6.7)*14,35,88);g.confidence=clamp(g.confidence+(target-g.confidence)*.12);g.reputation=clamp(g.reputation+(m.good?.45:0));}
 if(minutes>0&&(m.goals||m.assists||m.exceptional)){
  const credit=m.goals*.45+m.assists*.3+(m.exceptional?.6:0);g.trust=clamp(g.trust+credit);g.reputation=clamp(g.reputation+m.goals*.3+m.assists*.2+(m.exceptional?.5:0));g.confidence=clamp(g.confidence+credit*.7);
  if(m.exceptional)memory(g,`Feito excepcional em ${minutes} min: ${m.goals} gols, ${m.assists} assistências, ${m.saves} defesas. Crédito por ações sem julgamento de partida inteira.`,2,true);
 }
 if(m.result==='L'&&c.level>=opponent.level-4){g.pressure=clamp(g.pressure+(minutes>=45&&m.rating<6.5?6:3));}else if(m.good)g.pressure=clamp(g.pressure-2);
 if(posture){const success=m.good||m.exceptional;g.trust=clamp(g.trust+(success?2:minutes>=45&&m.rating<6.3?-2:0));g.reputation=clamp(g.reputation+(success?1.5:0));m.moment=`Postura ${posture==='risk'?'ambiciosa':'segura'} observada por ${minutes} minutos: ${success?'contribuição consistente reconhecida':'a meta ainda precisa de evidência'}.`;memory(g,m.moment,success?2:0,true);}
 const roleText=g.position==='GK'&&intent==='BUILD'?`${m.completedPasses}/${m.passAttempts} passes de construção, ${m.progressions} progressões e ${m.chancesCreated} passes decisivos`:g.position==='GK'?`${m.saves} defesas, ${m.interventions} antecipações e ${m.goalsConceded} gols sofridos sob sua responsabilidade`:intent==='ATTACK'?`${m.shots} finalizações (${m.shotsOnTarget} no alvo), ${m.goals} gols e ${m.assists} assistências`:intent==='PRESS'?`${m.interventions} recuperações na pressão e ${m.progressions} progressões`:['CONTROL','BUILD','LINK','CREATE'].includes(intent)?`${m.completedPasses}/${m.passAttempts} passes de construção e ${m.chancesCreated} chances criadas`:intent==='ADVANCE'?`${m.progressions} progressões, ${m.interventions} intervenções e ${m.chancesCreated} chances criadas`:defender?`${m.interventions} intervenções e ${m.chancesCreated} chances criadas`:`${m.shots} finalizações, ${m.goals} gols e ${m.assists} assistências`;
 if(!minutes){m.coach=`Sem minutos contra ${opponent.name}: não houve atuação sua para avaliar; ${g.rival.name} recebeu a oportunidade.`;m.fans=`${c.name} ${m.gf}–${m.ga} ${opponent.name}: a torcida viu o time, sem atuação do jogador.`;}
 else if(minutes<35){m.coach=`Entrada de ${minutes} minutos contra ${opponent.name}: ${roleText}. ${m.exceptional?'O feito excepcional recebeu crédito na disputa.':'Evidência parcial, sem julgamento de uma partida inteira.'}`;m.fans=`Em ${minutes} minutos: ${roleText}; ${m.exceptional?'a torcida reconheceu o feito decisivo':'a oportunidade foi curta'}.`;}
 else{m.coach=`Contra ${opponent.name}: ${roleText}, nota ${num(m.rating)}. ${m.good?'Contribuição positiva para a disputa por espaço.':m.rating<6.3?'A execução da função precisa melhorar.':'Atuação registrada; ainda falta consistência para a meta.'}`;m.fans=`${c.name} ${m.gf}–${m.ga} ${opponent.name}. ${m.good?'A torcida reconheceu':'A torcida observou'} ${roleText}${opponent.level>c.level+10?'; o rival era mais forte nesta simulação':''}.`;}
 memory(g,`${opponent.name}: ${minutes} min, ${roleText}.`,m.good?1:minutes>=45&&m.rating<6.3?-1:0);
 for(const s of [g.seasonStats,g.totalstats])if(minutes){s.apps++;s.starts+=started?1:0;s.minutes+=minutes;s.goals+=m.goals;s.assists+=m.assists;s.ratingSum+=m.rating;}
 // Minimal simulated rival trajectory: minutes, form and training react to opportunity.
 const rival=g.rival,rivalMinutes=started?90-minutes:90;rival.apps=(rival.apps??0)+(rivalMinutes>0?1:0);rival.minutes=(rival.minutes??0)+rivalMinutes;
 rival.recentRating=Math.round(clamp(6.65+(rival.quality-opponent.level)*.012+(random(g)-.5)*1.6,5.5,8)*10)/10;
 rival.form=(rival.form??6.7)*.75+rival.recentRating*.25;rival.quality=clamp(rival.quality+.06+rivalMinutes/90*.10,0,99);
 g.round++;g.playedMatches.push(m);
 const intensity=['PRESS','SWEEP','ADVANCE'].includes(intent)?1.4:['SAFE','HOLD','CONTROL'].includes(intent)?.82:1;
 g.condition=clamp(g.condition-(1+share*5.5*intensity));g.fatigue=clamp(g.fatigue+(.7+share*4.4*intensity));
 const training=g.recoveryWork==='READ'?'reading':g.recoveryWork==='COOPERATE'?'passing':extra?primary(g):focusFor(g,intent);
 growth(g,training,extra,minutes);g.proficiency=clamp(g.proficiency+(minutes>=45?.43:minutes?.18:.03),0,100);updateObjective(g,m);return m;
}
function periodDemand(o){
 if(o.status==='MET')return 'O papel escolhido mostrou resultado; manter consistência é a próxima cobrança.';
 if(o.progress.apps<o.target.apps||o.progress.minutes<o.target.minutes)return 'A disputa ainda limitou as participações e os minutos da prova; o projeto aceita uma nova resposta.';
 if(o.progress.good<o.target.good)return 'Faltaram atuações positivas para comprovar consistência; essa é a próxima cobrança.';
 if(o.progress.output<o.target.output)return 'A produção ficou abaixo do papel combinado; será preciso ajustar a resposta.';
 return 'O período foi registrado; o próximo projeto será avaliado em campo.';
}
function playPeriod(g,intent){if(g.objective.revision===1){g.objective=objective(g,intent);}g.intentChallenge=false;const beforeOverall=overall(g),skills={...g.skills},proficiency=g.proficiency;g.lastMatches=[];for(let i=0;i<6;i++)g.lastMatches.push(simulate(g,intent));g.period++;g.progression.push({season:g.season,period:g.period,beforeOverall,afterOverall:overall(g),skillChanges:Object.fromEntries(KEYS.map(k=>[k,Number((g.skills[k]-skills[k]).toFixed(3))])),experienceGain:Number((g.proficiency-proficiency).toFixed(3)),intent});
 const part=g.lastMatches.filter(m=>m.minutes>0);g.roleEvidence={minutes:part.reduce((s,m)=>s+m.minutes,0),goals:part.reduce((s,m)=>s+m.goals,0),assists:part.reduce((s,m)=>s+m.assists,0),chancesCreated:part.reduce((s,m)=>s+m.chancesCreated,0),keyPasses:part.reduce((s,m)=>s+m.keyPasses,0),completedPasses:part.reduce((s,m)=>s+m.completedPasses,0),interventions:part.reduce((s,m)=>s+m.interventions,0),saves:part.reduce((s,m)=>s+m.saves,0),good:part.filter(m=>m.good).length,description:`${part.length} participações, ${g.lastMatches.filter(m=>m.started).length} titularidades; evidência da função acumulada em seis jogos.`};
 assessObjective(g);const good=part.filter(m=>m.good||m.exceptional).length,starts=g.lastMatches.filter(m=>m.started).length;g.coachReaction=part.length?`${good} atuações positivas em ${part.length} oportunidades. ${periodDemand(g.objective)} ${g.rival.name} sustenta nota recente ${num(g.rival.form??6.7)} na concorrência.`:`Nenhuma oportunidade neste período: ${g.rival.name} foi preferido. Seu trabalho segue possível, mas falta evidência em campo.`;g.fanReaction=`Em seis partidas, ${g.lastMatches.filter(m=>m.result==='W').length} vitórias e ${g.lastMatches.filter(m=>m.result==='L').length} derrotas do ${club(g).name}. ${good?'A torcida reconheceu '+good+' contribuições positivas':'A torcida segue esperando uma contribuição observável'}; ${starts} titularidades e ${g.roleEvidence.goals} gols/${g.roleEvidence.assists} assistências. Respeito acumulado ${Math.round(g.fanMemory[g.clubId]?.respect??50)}.`;log(g,`${club(g).name}: intenção ${intent}, OVR ${beforeOverall}→${overall(g)}, ${g.roleEvidence.description}`);nextPeriod(g);
}
function marketEvent(g){
 const c=club(g),matches=g.playedMatches.filter(m=>m.season===g.season&&m.minutes>0),rating=g.seasonStats.apps?g.seasonStats.ratingSum/g.seasonStats.apps:0;
 const good=matches.filter(m=>m.good||m.exceptional).length,score=overall(g)+Math.min(6,g.reputation*.15),proof=g.seasonStats.minutes>=400&&good>=3&&rating>=6.75;
 g.market=[];g.marketModes={};g.marketContexts={};
 const production=matches.reduce((s,m)=>s+(g.position==='ST'||g.position==='WG'?m.goals+m.assists:g.position==='GK'?m.saves+m.interventions:m.chancesCreated+m.interventions),0);
 // Sample projects before rolling interest: a larger catalog must not buy certainty.
 const eligible=CLUBS.filter(x=>national(x)&&x.id!==c.id&&x.level<=score+7&&x.level>=c.level-14);
 const shortlist=eligible.map(destination=>{
  const remembered=g.fanMemory[destination.id]?.respect??50;
  const weight=clamp(1-Math.abs(destination.level-score)/35,.18,1.1)*(destination.division===c.division?1.08:1)*clamp(1+(remembered-50)*.005,.75,1.25);
  return {destination,key:-Math.log(Math.max(random(g),1/4294967296))/weight};
 }).sort((a,b)=>a.key-b.key).slice(0,6).map(x=>x.destination);
 for(const destination of shortlist){
  const need=.18+random(g)*.72,fit=clamp(.55+(overall(g)-destination.level)*.018+(production/Math.max(1,g.seasonStats.minutes/90)-1)*.05,.1,.95);
  const observed=g.seasonStats.minutes>=180,competition=random(g),remembered=g.fanMemory[destination.id]?.respect??50;
  const appeal=clamp(need*fit*(proof?.85:.24)+(remembered-50)*.001,.02,.7);
  if(observed&&roll(g,appeal)&&g.market.length<2){g.market.push(destination.id);g.marketModes[destination.id]=proof?'OFFER':'ASSESSMENT';g.marketContexts[destination.id]={need,fit,observed,competition,role:destination.level>c.level+4?'DISPUTE':'ROTATION',closeProbability:clamp(.25+need*.28+fit*.28-competition*.25+(proof?.1:0),.15,.82)};}
 }
 // A weak season can reopen a modest project through an uncertain assessment.
 if(!g.market.length&&!proof&&g.seasonStats.minutes>=60&&roll(g,.58)){
  const modest=CLUBS.filter(x=>x.id!==c.id&&(national(c)?x.division==='B':LEGACY_CLUB_IDS.includes(x.id))&&x.level<=Math.max(c.level,50));
  const destination=modest.length?modest[integer(g,0,modest.length-1)]:null;
  if(destination){g.market=[destination.id];g.marketModes[destination.id]='ASSESSMENT';g.marketContexts[destination.id]={need:.55,fit:clamp(.5+(overall(g)-destination.level)*.02,.15,.9),observed:true,competition:.5,role:'REBUILD',closeProbability:clamp(.35+(overall(g)-destination.level)*.015,.18,.7)};}
 }
 const evidence=`${g.seasonStats.apps} participações, ${g.seasonStats.minutes} minutos, ${good} contribuições positivas e nota ${num(rating)}.`;
 event(g,'INTEREST','O que sua temporada fez aparecer',g.market.length?`${evidence} ${g.market.map(id=>{const x=CLUBS.find(c=>c.id===id);return `${x.name} (${divisionText(x)})`;}).join(' e ')} observam um encaixe. A necessidade e a concorrência ainda podem impedir uma proposta.`:`${evidence} Não surgiu contato com necessidade e encaixe suficientes neste ano; continuar e mudar a resposta esportiva permanece possível.`,[...g.market.map(id=>option(`contact:${id}`,`${g.marketModes[id]==='ASSESSMENT'?'Ouvir uma avaliação no':'Conversar com'} ${CLUBS.find(c=>c.id===id).name} (${divisionText(CLUBS.find(c=>c.id===id))})`,g.marketModes[id]==='ASSESSMENT'?'Avaliação para reconstrução, com aprovação incerta.':'Interesse observado; a negociação e o espaço permanecem incertos.')),option('market:stay',`Continuar no ${c.name}`,'Mantém o projeto; a temporada encerrada fica preservada.')]);
}
function endSeason(g){g.yearStats.push({age:g.season,season:g.season,clubId:g.clubId,...g.seasonStats});log(g,`${g.season} anos: ${g.seasonStats.apps} participações, ${g.seasonStats.starts} titularidades, OVR ${overall(g)}.`);if(g.season===20){g.age=21;g.phase='DONE';event(g,'DONE','Uma trajetória até os 21',`O recorte termina, não sua carreira. ${g.totalstats.apps} participações, ${g.totalstats.starts} titularidades e ${g.totalstats.minutes} minutos. Seu trabalho e suas metas ficam nos registros abaixo.`);return;}marketEvent(g);}
function finishMarket(g){g.season++;startSeason(g);}
function recoveryAvailable(g){
 if(g.recoveryWork)return false;
 const previous=g.recoveryLast??(g.recoveryArc?{clubId:g.recoveryArc.clubId,step:(g.recoveryArc.season-18)*3}:null);if(!previous)return true;
 return previous.clubId!==g.clubId||((g.season-18)*3+g.period)-previous.step>=2;
}
function continuationEvent(g){
 if(g.season>=19&&!g.decisiveUsed){decisiveEvent(g);return;}
 planEvent(g);
}
function nextPeriod(g){
 if(g.period===3){endSeason(g);return;}
 if(recoveryAvailable(g)&&(g.objective.status==='MISSED'||g.lastMatches.filter(m=>m.started).length<3)){recoveryEvent(g);return;}
 continuationEvent(g);
}
function validAction(g,id){const base=id.split('@')[0],kind=g.event?.kind;
 if(kind==='FORMATION')return ['formation:technique','formation:reading','formation:athletic'].includes(base);
 if(kind==='RIVALRY')return ['rival:earn','rival:team','rival:challenge'].includes(base);
 if(kind==='PLAN')return intents(g).some(x=>base===`intent:${x}`);
 if(kind==='RECOVERY')return ['recovery:EXTRA','recovery:READ','recovery:COOPERATE'].includes(base);
 if(kind==='DECISIVE')return ['decisive:risk','decisive:safe'].includes(base);
 if(kind==='INTEREST')return base==='market:stay'||g.market?.some(c=>base===`contact:${c}`&&CLUBS.some(x=>x.id===c));
 if(kind==='CONTACT')return base==='market:stay'||base===`offer:${g.contactClub}`&&CLUBS.some(c=>c.id===g.contactClub);
 if(kind==='OFFER')return base==='market:stay'||base===`accept:${g.offer?.clubId}`&&CLUBS.some(c=>c.id===g.offer?.clubId);
 if(kind==='ASSESSMENT_RESULT')return base==='market:stay';return false;
}
/** Exact serial choice preflight, before even recording the decision. */
function chooseMutable(g,id){
 if(!validGame(g)||g.schema!==2||g.phase==='DONE'||typeof id!=='string'||!g.event?.choices.some(c=>c.id===id)||g.resolved.includes(g.event.id)||!validAction(g,id))return false;
 const kind=g.event.kind,key=g.event.id,selected=g.event.choices.find(c=>c.id===id);g.choicesLog.push({eventId:key,kind,id,label:selected.label,age:g.age,clubId:g.clubId,round:g.round});g.resolved.push(key);g.decisions++;id=id.split('@')[0];
 if(kind==='FORMATION'){const before=overall(g),mode=id.split(':')[1],skills={...g.skills};for(const k of KEYS){const priority=g.rulesRevision===1?(mode==='technique'?TECHNICAL[g.position].includes(k):mode==='reading'?['reading'].includes(k):['pace','defending'].includes(k)):mode==='technique'?WEIGHTS[g.position][KEYS.indexOf(k)]>=.25:mode==='reading'?['reading','passing'].includes(k):['pace','defending'].includes(k);g.skills[k]=clamp(g.skills[k]+(priority?(mode==='reading'&&g.rulesRevision===1?20:15):6)*g.dna.learning*g.dna.aptitudes[k],0,99);}const experience=g.rulesRevision===1?(mode==='reading'?12:10):mode==='reading'?15:8;g.proficiency=clamp(g.proficiency+experience);g.progression.push({season:g.age,period:0,beforeOverall:before,afterOverall:overall(g),skillChanges:Object.fromEntries(KEYS.map(k=>[k,Number((g.skills[k]-skills[k]).toFixed(3))])),experienceGain:experience,intent:mode});const worked=mode==='reading'?'reading':mode==='athletic'?'pace':g.rulesRevision===1?TECHNICAL[g.position][0]:primary(g);g.lastOutcome={title:'Aprendizado registrado',body:`Etapa dos ${g.age} anos: ${labelSkill[worked]}: ${num(skills[worked])}→${num(g.skills[worked])}; experiência +${experience}.`};g.formation++;if(g.formation<3)formationEvent(g);else{g.objective.progress.stages=3;g.objective.progressText='3/3 etapas concluídas';g.objective.targetText='Formação concluída; a próxima meta pertence ao projeto adulto';g.objective.status='MET';g.lastOutcome.season=g.age;g.lastOutcome.clubId=null;g.age=18;g.phase='PRO';g.clubId=(g.calendarRevision===1?ENTRY_CLUB_IDS:LEGACY_CLUB_IDS)[overall(g)>=62?2:overall(g)>=55?1:0];g.history.push({age:18,clubId:g.clubId,reason:'Primeiro projeto após formação'});schedule(g);rivalEvent(g);}return true;}
 if(kind==='RIVALRY'){g.arrivalIntent=id.slice(6);g.intentChallenge=id==='rival:challenge';memory(g,`Chegada: ${selected.label}. A decisão será avaliada nas partidas.`,0,true);planEvent(g);return true;}
 if(kind==='PLAN'){playPeriod(g,id.slice(7));return true;}
 if(kind==='RECOVERY'){g.recoveryWork=id.slice(9);g.recoveryArc.work=g.recoveryWork;g.recoveryArc.status='WORKING';memory(g,`Mudou o trabalho: ${selected.label}; prova nos próximos seis jogos.`,0,true);continuationEvent(g);return true;}
 if(kind==='DECISIVE'){g.decisive={kind:id.endsWith('risk')?'risk':'safe',remaining:6};planEvent(g);return true;}
 if(kind==='INTEREST'){if(id==='market:stay'){finishMarket(g);return true;}g.contactClub=id.slice(8);const c=CLUBS.find(c=>c.id===g.contactClub),assessment=g.marketModes[c.id]==='ASSESSMENT';event(g,'CONTACT',`${assessment?'Avaliação':'Contato'} no ${c.name}`,`${divisionText(c)}, projeto de nível ${c.level}, seu OVR ${overall(g)}. ${assessment?'O clube avaliará sua experiência e evidência recente; pode não oferecer contrato.':'A evidência da temporada abriu uma negociação; o espaço será disputado.'}`,[option(`offer:${c.id}`,assessment?'Participar da avaliação':'Pedir a proposta concreta',assessment?'A resposta depende da qualidade e da amostra; nenhuma habilidade cresce pelo aceite.':'Conhece salário e exigência antes de decidir.'),option('market:stay','Encerrar contato e permanecer','Não apaga as atuações nem a meta anterior.')]);return true;}
 if(kind==='CONTACT'){if(id==='market:stay'){finishMarket(g);return true;}const c=CLUBS.find(c=>c.id===g.contactClub);if(g.marketModes[c.id]==='ASSESSMENT'||g.marketContexts?.[c.id]){const rating=g.seasonStats.apps?g.seasonStats.ratingSum/g.seasonStats.apps:6.5,probability=g.marketContexts?.[c.id]?.closeProbability??clamp(.45+(overall(g)-c.level)*.02+(rating-6.5)*.12,.2,.8);if(!roll(g,probability)){g.lastOutcome={title:'O contato não virou contrato',body:`${c.name} não abriu proposta: o encaixe observado não venceu a concorrência nesta janela. A experiência e os números do ano continuam registrados.`};event(g,'ASSESSMENT_RESULT','Uma tentativa sem proposta',g.lastOutcome.body,[option('market:stay',`Retomar o ${club(g).name}`,'Muda a resposta em campo na próxima temporada; a rota não está encerrada.')]);return true;}}
  g.offer={clubId:c.id,monthly:Math.round((1500+c.prestige*180+Math.max(0,overall(g)-45)*500)/50)*50};event(g,'OFFER',`Proposta do ${c.name}`,`Salário ficcional R$ ${g.offer.monthly.toLocaleString('pt-BR')} por mês. ${divisionText(c)}, projeto de nível ${c.level}; experiência e confiança no novo clube ainda terão que virar minutos.`,[option(`accept:${c.id}`,`Aceitar o ${c.name}`,'Muda de projeto; confiança inicia em48 e a exigência do concorrente acompanha o nível do clube.'),option('market:stay',`Continuar no ${club(g).name}`,'Preserva o espaço construído; não aceita o salário do outro projeto.')]);return true;}
 if(kind==='OFFER'){if(id.startsWith('accept:')){g.clubId=g.offer.clubId;g.salary=g.offer.monthly;g.trust=48;g.projectStrain=0;g.pressure=clamp(g.pressure+Math.max(0,club(g).prestige-40)*.2);const m=g.fanMemory[g.clubId];if(m){g.pressure=clamp(g.pressure+(50-m.respect)*.1);g.trust=clamp(g.trust+(m.respect-50)*.08);}g.history.push({age:g.season+1,clubId:g.clubId,reason:'Proposta aceita após contato'});g.pendingNewClub=true;log(g,`Aceitou ${club(g).name}; disputa de espaço reabre com exigência maior.`);}delete g.offer;finishMarket(g);return true;}
 if(kind==='ASSESSMENT_RESULT'){finishMarket(g);return true;}return false;
}
export function choose(g,id){
 if(!validGame(g))return false;
 try{const candidate=JSON.parse(JSON.stringify(g));if(!chooseMutable(candidate,id)||!validGame(candidate))return false;
  // Commit only complete valid transitions, preserving the object identity used by the UI.
  for(const key of Object.keys(g))if(!(key in candidate))delete g[key];Object.assign(g,candidate);return true;
 }catch{return false;}
}
/** Validate hydration without changing supplied state. Schema1 is deliberately not migrated. */
export function validGame(g){
 const bound=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 const finite=(v,ancestors=new Set())=>{if(typeof v==='number')return Number.isFinite(v);if(!v||typeof v!=='object')return true;if(ancestors.has(v))return false;ancestors.add(v);const ok=Object.values(v).every(x=>finite(x,ancestors));ancestors.delete(v);return ok;};
 const stats=s=>s&&['apps','starts','minutes','goals','assists','ratingSum'].every(k=>bound(s[k],0,1e6))&&s.starts<=s.apps;
 try{if(!g||g.schema!==2||typeof g.name!=='string'||g.name.length>60||!POSITIONS.some(p=>p.id===g.position)||g.clubId!==null&&!CLUBS.some(c=>c.id===g.clubId)||!bound(g.age,12,21)||!['FORMATION','PRO','DONE'].includes(g.phase))return false;
 if(!['condition','fatigue','pressure','confidence','trust','proficiency','reputation'].every(k=>bound(g[k],0,100))||!KEYS.every(k=>bound(g.skills?.[k],0,99))||!bound(g.seed,0,4294967295)||!Number.isInteger(g.seed)||!bound(g.rng,0,4294967295)||!Number.isInteger(g.rng)||!bound(g.dna?.learning,.5,2)||!KEYS.every(k=>bound(g.dna?.aptitudes?.[k],.5,2)))return false;
 if(![['serial',1,64],['decisions',0,63],['formation',0,3],['period',0,3],['round',0,18],['season',18,20]].every(([k,a,b])=>Number.isInteger(g[k])&&bound(g[k],a,b)))return false;
 if(!stats(g.totalstats)||!stats(g.seasonStats)||!Array.isArray(g.yearStats)||g.yearStats.length>3||!g.yearStats.every(stats)||!Array.isArray(g.playedMatches)||g.playedMatches.length>54||!Array.isArray(g.lastMatches)||g.lastMatches.length>6)return false;
 for(const m of g.playedMatches)if(!CLUBS.some(c=>c.id===m.clubId)||!CLUBS.some(c=>c.id===m.opponentId)||!bound(m.gf,0,m.teamChances)||!bound(m.ga,0,m.oppChances)||!bound(m.teamChances,0,9)||!bound(m.oppChances,0,9)||!bound(m.minutes,0,90)||!bound(m.rating,0,10)||!bound(m.goals,0,m.gf)||!bound(m.assists,0,m.gf-m.goals)||m.completedPasses>m.passAttempts||typeof m.started!=='boolean'||typeof m.coach!=='string'||typeof m.fans!=='string'||m.minutes===0&&(m.rating||m.goals||m.assists||m.saves||m.completedPasses||m.interventions||m.chancesCreated))return false;
 if(!Array.isArray(g.choicesLog)||g.choicesLog.length!==g.decisions||!Array.isArray(g.progression)||!Array.isArray(g.objectiveHistory)||!Array.isArray(g.history)||!Array.isArray(g.resolved)||!Array.isArray(g.log)||!g.fanMemory||!g.event||typeof g.event.id!=='string'||typeof g.event.title!=='string'||typeof g.event.body!=='string'||!Array.isArray(g.event.choices)||g.event.choices.length>4)return false;
 if(g.serial!==g.decisions+1||g.event.id!==`p10v2-${g.serial}`||g.resolved.length!==g.decisions||new Set(g.resolved).size!==g.resolved.length||!g.choicesLog.every((c,i)=>c.eventId===g.resolved[i]&&typeof c.label==='string'&&typeof c.id==='string'))return false;
 const sum=matches=>matches.reduce((s,m)=>{if(m.minutes){s.apps++;s.starts+=m.started?1:0;s.minutes+=m.minutes;s.goals+=m.goals;s.assists+=m.assists;s.ratingSum+=m.rating;}return s;},{apps:0,starts:0,minutes:0,goals:0,assists:0,ratingSum:0});
 const equal=(a,b)=>Object.keys(b).every(k=>Math.abs(a[k]-b[k])<1e-8);
 if(!equal(g.totalstats,sum(g.playedMatches))||!equal(g.seasonStats,sum(g.playedMatches.filter(m=>m.season===g.season)))||!g.yearStats.every(s=>equal(s,sum(g.playedMatches.filter(m=>m.season===s.season))))||new Set(g.yearStats.map(s=>s.season)).size!==g.yearStats.length)return false;
 if(g.phase!=='FORMATION'&&(g.schedule.length!==18||new Set(g.schedule).size!==9||g.schedule.some(id=>id===g.clubId||!CLUBS.some(c=>c.id===id))||g.schedule.some((id,i)=>i>0&&id===g.schedule[i-1])||[...new Set(g.schedule)].some(id=>g.schedule.filter(x=>x===id).length!==2)))return false;
 if(!g.event.choices.every(c=>typeof c.id==='string'&&c.id.endsWith(`@${g.serial}`)&&validAction(g,c.id)&&typeof c.label==='string'&&typeof c.hint==='string')||new Set(g.event.choices.map(c=>c.id)).size!==g.event.choices.length)return false;
 if(g.phase==='DONE'&&(g.age!==21||g.event.kind!=='DONE'||g.event.choices.length))return false;if(g.phase!=='DONE'&&!g.event.choices.length)return false;
 if(g.objective&&(!['ACTIVE','MET','MISSED'].includes(g.objective.status)||typeof g.objective.progressText!=='string'||typeof g.objective.targetText!=='string'))return false;
 const objectiveContext=o=>Number.isInteger(o.season)&&bound(o.season,18,20)&&Number.isInteger(o.period)&&bound(o.period,1,3)&&CLUBS.some(c=>c.id===o.clubId)&&(o.revision===1?['attack','creation','control','protection','sweep','press','advance','cooperation'].includes(o.metric):o.revision===undefined&&['role','cooperation'].includes(o.metric));
 if(g.objective?.metric&&!objectiveContext(g.objective)||g.objectiveHistory.length>9||!g.objectiveHistory.every(o=>objectiveContext(o)&&['MET','MISSED'].includes(o.status)&&typeof o.progressText==='string'&&typeof o.targetText==='string'&&g.playedMatches.some(m=>m.season===o.season&&m.clubId===o.clubId))||new Set(g.objectiveHistory.map(o=>`${o.season}:${o.period}`)).size!==g.objectiveHistory.length)return false;
 // Hydrated dependencies must be safe before choose records any mutation.
 const knownClub=id=>CLUBS.some(c=>c.id===id),integer=(v,a,b)=>Number.isInteger(v)&&bound(v,a,b);
 const text=v=>typeof v==='string';
 if(g.progression.length>12||!g.progression.every(p=>p&&integer(p.season,12,20)&&integer(p.period,0,3)&&bound(p.beforeOverall,0,99)&&bound(p.afterOverall,0,99)&&bound(p.experienceGain,0,100)&&text(p.intent)&&p.skillChanges&&KEYS.every(k=>bound(p.skillChanges[k],0,99))))return false;
 if(g.history.length>3||!g.history.every(h=>h&&integer(h.age,18,20)&&knownClub(h.clubId)&&text(h.reason))||g.log.length>100||!g.log.every(text))return false;
 if(!g.yearStats.every(h=>h&&integer(h.age,18,20)&&h.season===h.age&&knownClub(h.clubId))||!g.choicesLog.every(c=>c&&text(c.kind)&&integer(c.age,12,20)&&(c.clubId===null||knownClub(c.clubId))&&integer(c.round,0,18)))return false;
 if(!Array.isArray(g.market)||g.market.length>3||new Set(g.market).size!==g.market.length||!g.market.every(knownClub)||!Array.isArray(g.schedule)||g.schedule.length>18||!g.schedule.every(knownClub))return false;
 if(g.lastOutcome!==null&&(!g.lastOutcome||!text(g.lastOutcome.title)||!text(g.lastOutcome.body)))return false;
 if(!g.objective||!text(g.objective.title)||!text(g.objective.body)||!g.objectiveHistory.every(o=>o&&text(o.title)&&text(o.body)))return false;
 const validMatch=m=>m&&integer(m.season,18,20)&&integer(m.round,1,18)&&knownClub(m.clubId)&&knownClub(m.opponentId)&&text(m.opponent)&&text(m.result)&&text(m.strategy)&&text(m.moment)&&typeof m.good==='boolean'&&['gf','ga','minutes','goals','assists','saves','shots','shotsOnTarget','chancesCreated','keyPasses','passAttempts','completedPasses','interventions','failedInterventions','teamChances','oppChances'].every(k=>integer(m[k],0,k==='minutes'?90:100))&&m.shotsOnTarget<=m.shots&&m.goals<=m.shotsOnTarget&&m.completedPasses<=m.passAttempts;
 if(!g.playedMatches.every(validMatch)||!g.lastMatches.every(m=>validMatch(m)&&g.playedMatches.some(a=>a.season===m.season&&a.round===m.round&&JSON.stringify(a)===JSON.stringify(m))))return false;
 if(g.phase!=='FORMATION'&&(!knownClub(g.clubId)||!g.rival||typeof g.rival.name!=='string'||!bound(g.rival.quality,0,100)))return false;
 if(typeof g.recoveryUsed!=='boolean'||typeof g.decisiveUsed!=='boolean'||g.recoveryWork!==null&&!['EXTRA','READ','COOPERATE'].includes(g.recoveryWork))return false;
 if(g.recoveryArc!==null){const a=g.recoveryArc;if(!a||!knownClub(a.clubId)||!integer(a.season,18,20)||!['CHOOSING','WORKING','PROVED','UNPROVED'].includes(a.status)||!integer(a.beforeStarts,0,6)||!bound(a.beforeLevel,0,99)||a.work!==null&&!['EXTRA','READ','COOPERATE'].includes(a.work))return false;}
 if(g.event.kind==='RECOVERY'&&(!g.recoveryUsed||!g.recoveryArc||g.recoveryArc.status!=='CHOOSING'||g.recoveryArc.clubId!==g.clubId||g.recoveryArc.season!==g.season)||g.recoveryWork&&(!g.recoveryArc||g.recoveryArc.status!=='WORKING'||g.recoveryArc.work!==g.recoveryWork))return false;
 if(Array.isArray(g.fanMemory)||!Object.entries(g.fanMemory).every(([id,m])=>knownClub(id)&&m&&bound(m.respect,0,100)&&Array.isArray(m.entries)&&m.entries.length<=4&&m.entries.every(x=>typeof x==='string')&&Array.isArray(m.criticalEntries)&&m.criticalEntries.length<=10&&m.criticalEntries.every(x=>typeof x==='string')))return false;
 if(g.roleEvidence!==null){const r=g.roleEvidence,keys=['minutes','goals','assists','chancesCreated','keyPasses','completedPasses','interventions','saves','good'];if(!r||typeof r.description!=='string'||!keys.every(k=>integer(r[k],0,k==='minutes'?540:1000)))return false;for(const k of keys){const observed=g.lastMatches.reduce((v,m)=>v+(k==='good'?(m.good?1:0):m[k]),0);if(r[k]!==observed)return false;}}
 const validObjective=o=>{
  if(!objectiveContext(o)||!o.target||!o.progress)return false;const t=o.target,q=o.progress;
  if(Object.keys(t).sort().join(',')!=='apps,good,minutes,output'||Object.keys(q).sort().join(',')!=='apps,good,minutes,output')return false;
  if(o.revision===1){
   if(g.rulesRevision!==1||!intents(g).includes(o.intent)||typeof o.strong!=='boolean'||typeof o.challenge!=='boolean'||typeof o.cooperation!=='boolean')return false;
   const expectedMetric=o.cooperation?'cooperation':metricFor({...g,recoveryWork:null},o.intent);if(expectedMetric!==o.metric)return false;
   const target=targetForMetric(g.position,o.metric,o.strong);if(o.challenge)target.good++;if(!equal(t,target))return false;
  }else{const output=o.metric==='cooperation'?3:g.position==='ST'?1:g.position==='GK'?6:['CB','DM'].includes(g.position)?8:g.position==='FB'?10:6;
   if(!((t.apps===3&&t.minutes===150)||(t.apps===4&&t.minutes===220))||![t.apps-1,t.apps].includes(t.good)||t.output!==output)return false;
  }
  if(!integer(q.apps,0,6)||!integer(q.minutes,0,540)||!integer(q.good,0,q.apps)||!integer(q.output,0,1000))return false;
  const matches=g.playedMatches.filter(m=>m.season===o.season&&m.clubId===o.clubId&&m.round>(o.period-1)*6&&m.round<=o.period*6),actual={apps:0,minutes:0,good:0,output:0};
  for(const m of matches)if(m.minutes){actual.apps++;actual.minutes+=m.minutes;actual.good+=(m.minutes>=35&&m.rating>=7||o.revision===1&&m.exceptional)?1:0;actual.output+=outputFor(g,m,o);}
  if(!equal(q,actual))return false;const met=Object.keys(t).every(k=>q[k]>=t[k]);return o.status==='ACTIVE'?matches.length===0:o.status===(met?'MET':'MISSED')&&matches.length===6;
 };
 if(!g.objective||g.objective.metric&&!validObjective(g.objective)||!g.objectiveHistory.every(validObjective))return false;
 if(g.event.kind==='PLAN'&&(!g.objective.metric||g.objective.status!=='ACTIVE'||g.objective.clubId!==g.clubId||g.objective.season!==g.season||g.objective.period!==g.period+1))return false;
 if(['CONTACT','OFFER'].includes(g.event.kind)&&(!knownClub(g.contactClub)||!g.market.includes(g.contactClub)||!g.marketModes||!['OFFER','ASSESSMENT'].includes(g.marketModes[g.contactClub])))return false;
 if(g.event.kind==='OFFER'&&(!g.offer||g.offer.clubId!==g.contactClub||!bound(g.offer.monthly,1,1e7)))return false;
 // Optional revision fields never reconstruct past matches or goals.
 if(g.calendarRevision!==undefined&&g.calendarRevision!==1)return false;
 if(g.scheduleDivision!==undefined&&!['A','B','TRANSITION'].includes(g.scheduleDivision))return false;
 if(g.calendarRevision===1){
  if(g.phase==='FORMATION'){if(g.scheduleDivision!==undefined||g.schedule.length)return false;}
  else{const c=club(g),expected=national(c)?c.division:'TRANSITION';
   if(g.scheduleDivision!==expected||g.schedule.some(id=>expected==='TRANSITION'?!LEGACY_CLUB_IDS.includes(id):CLUBS.find(c=>c.id===id)?.division!==expected))return false;
  }
 }else if(g.scheduleDivision!==undefined||g.phase!=='FORMATION'&&(!LEGACY_CLUB_IDS.includes(g.clubId)||g.schedule.some(id=>!LEGACY_CLUB_IDS.includes(id))))return false;
 if(g.rulesRevision!==undefined&&g.rulesRevision!==1)return false;
 if(g.projectStrain!==undefined&&!integer(g.projectStrain,0,4))return false;
 for(const key of ['intentChallenge','pendingNewClub'])if(g[key]!==undefined&&typeof g[key]!=='boolean')return false;
 if(g.arrivalIntent!==undefined&&!['earn','team','challenge'].includes(g.arrivalIntent))return false;
 for(const key of ['coachReaction','fanReaction'])if(g[key]!==undefined&&!text(g[key]))return false;
 if(g.market.length&&(!g.marketModes||!g.market.every(id=>['OFFER','ASSESSMENT'].includes(g.marketModes[id]))))return false;
 if(g.memoryTimeline!==undefined){
  if(!Array.isArray(g.memoryTimeline)||g.memoryTimeline.length>100||!integer(g.memorySequence,1,1000))return false;
  for(const [i,m] of g.memoryTimeline.entries())if(!m||!knownClub(m.clubId)||!text(m.text)||typeof m.critical!=='boolean'||!integer(m.season,18,20)||!integer(m.round,0,18)||!integer(m.sequence,1,g.memorySequence)||i>0&&m.sequence>=g.memoryTimeline[i-1].sequence)return false;
 }
 if(g.memorySequence!==undefined&&(!integer(g.memorySequence,1,1000)||!Array.isArray(g.memoryTimeline)))return false;
 if(g.recoveryLast!==undefined){const r=g.recoveryLast;if(!r||!knownClub(r.clubId)||!integer(r.season,18,20)||!integer(r.step,(r.season-18)*3,(r.season-18)*3+2))return false;}
 if(g.decisive!==null&&(!g.decisive||!['risk','safe'].includes(g.decisive.kind)||!integer(g.decisive.remaining,1,6)||!g.decisiveUsed))return false;
 if(g.phase==='FORMATION'&&(g.age!==[12,14,16][g.formation]||g.clubId!==null||g.event.kind!=='FORMATION'||g.round!==0||g.period!==0||g.playedMatches.length))return false;
 if(g.phase==='PRO'&&(g.age!==g.season||g.formation!==3||g.round!==g.period*6||['FORMATION','DONE'].includes(g.event.kind)))return false;
 if(g.phase==='DONE'&&(g.season!==20||g.period!==3||g.round!==18||g.playedMatches.length!==54))return false;
 if(g.playedMatches.length!==(g.season-18)*18+g.round||new Set(g.playedMatches.map(m=>`${m.season}:${m.round}`)).size!==g.playedMatches.length)return false;
 if(g.event.kind==='DECISIVE'&&(!g.decisiveUsed||g.decisive!==null))return false;
 if(g.rival){for(const key of ['form','recentRating'])if(g.rival[key]!==undefined&&!bound(g.rival[key],0,10))return false;for(const key of ['apps','goals','minutes'])if(g.rival[key]!==undefined&&!integer(g.rival[key],0,key==='minutes'?5000:100))return false;}
 if(g.marketModes!==undefined&&(!g.marketModes||Array.isArray(g.marketModes)||!Object.entries(g.marketModes).every(([id,mode])=>g.market.includes(id)&&['OFFER','ASSESSMENT'].includes(mode))))return false;
 if(g.marketContexts!==undefined){if(!g.marketContexts||Array.isArray(g.marketContexts)||!Object.entries(g.marketContexts).every(([id,m])=>g.market.includes(id)&&m&&['need','fit','competition','closeProbability'].every(k=>bound(m[k],0,1))&&typeof m.observed==='boolean'&&['DISPUTE','ROTATION','REBUILD'].includes(m.role)))return false;}
 for(const m of g.playedMatches){
  if(m.good!==(m.minutes>=35&&m.rating>=7))return false;
  if(m.exceptional!==undefined&&(typeof m.exceptional!=='boolean'||m.exceptional!==(m.minutes>0&&(m.goals>=2||m.goals+m.assists>=2||g.position==='GK'&&m.saves>=4&&m.goalsConceded===0))))return false;
  if(m.progressions!==undefined&&!integer(m.progressions,0,m.minutes?9:0))return false;
  if(m.goalsConceded!==undefined&&(!integer(m.goalsConceded,0,g.position==='GK'&&m.minutes?m.ga:0)||!integer(m.keeperShots,0,g.position==='GK'&&m.minutes?m.oppChances:0)||m.saves+m.goalsConceded!==m.keeperShots))return false;
  if(m.keeperMinutesReason!==undefined&&(!['CONTINGENCY','START','NONE'].includes(m.keeperMinutesReason)||g.position==='GK'&&(m.started?m.minutes!==90||m.keeperMinutesReason!=='START':m.minutes>0?m.keeperMinutesReason!=='CONTINGENCY':m.keeperMinutesReason!=='NONE')))return false;
 }
 return finite(g);}catch{return false;}
}
