// Separate fictional football simulation. No storage, browser APIs or dependencies.
export const CLUBS=[
 ['sao-luiz','São Luiz',43,20,'#b12c35'],['brasil-pelotas','Brasil de Pelotas',47,28,'#9f2630'],['caxias','Caxias',51,34,'#742d49'],['ypiranga','Ypiranga',54,38,'#467741'],['juventude','Juventude',59,47,'#418652'],['ponte-preta','Ponte Preta',61,49,'#353b45'],['vitoria','Vitória',66,59,'#aa3036'],['vasco','Vasco',71,69,'#343944'],['gremio','Grêmio',75,77,'#3983b3'],['flamengo','Flamengo',79,85,'#b6383c']
].map(([id,name,level,prestige,color])=>({id,name,shortName:name,level,prestige,color}));
export const POSITIONS=[['GK','Goleiro'],['CB','Zagueiro'],['FB','Lateral'],['DM','Volante'],['CM','Meio-campista'],['AM','Meia ofensivo'],['WG','Ponta'],['ST','Atacante']].map(([id,label])=>({id,label}));
const KEYS=['finishing','passing','reading','pace','defending','goalkeeping'];
const WEIGHTS={GK:[0,.1,.25,.05,.1,.5],CB:[.05,.15,.3,.1,.4,0],FB:[.1,.25,.2,.25,.2,0],DM:[.05,.25,.3,.1,.3,0],CM:[.1,.35,.3,.15,.1,0],AM:[.2,.35,.3,.15,0,0],WG:[.3,.2,.2,.3,0,0],ST:[.5,.1,.2,.2,0,0]};
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const random=g=>{g.rng=(Math.imul(g.rng,1664525)+1013904223)>>>0;return g.rng/4294967296;};
const roll=(g,p)=>random(g)<clamp(p,0,1);
const stat=()=>({apps:0,starts:0,minutes:0,goals:0,assists:0,ratingSum:0});
export const club=g=>CLUBS.find(c=>c.id===g.clubId)??null;
export function overall(g){return Math.round(KEYS.reduce((s,k,i)=>s+g.skills[k]*WEIGHTS[g.position][i],0)*(.9+g.proficiency*.001));}
const choice=(id,label,hint)=>({id,label,hint});
function event(g,kind,title,body,choices=[]){g.serial++;g.event={id:`p10-${g.serial}`,kind,title,body,choices:choices.map(c=>({...c,id:`${c.id}@${g.serial}`}))};}
function log(g,text){g.log.unshift(text);g.log=g.log.slice(0,80);}
function memory(g,text,change=0,critical=false){const c=club(g);if(!c)return;const m=g.fanMemory[c.id]??={respect:50,entries:[],criticalEntries:[]};m.respect=clamp(m.respect+change);if(critical){m.criticalEntries??=[];m.criticalEntries.unshift(text);m.criticalEntries=m.criticalEntries.slice(0,6);}else{m.entries.unshift(text);m.entries=m.entries.slice(0,4);}}
function growth(g,focus,multiplier=1){
 // Inputs and acquired history determine learning; no random bonus is added.
 for(const [i,k]of KEYS.entries()){const role=.45+WEIGHTS[g.position][i]*2;const gain=.14*g.dna.learning*g.dna.aptitudes[k]*role*multiplier*(focus===k?1.7:1)*(.55+g.condition/220)*Math.max(.45,1-g.fatigue/160)*(1-g.skills[k]/110);g.skills[k]=clamp(g.skills[k]+gain,0,99);}
}
function formationEvent(g){const ages=[12,14,16];g.age=ages[g.formation];event(g,'FORMATION',`Construir seu jogo aos ${g.age}`,`Você treina como ${POSITIONS.find(p=>p.id===g.position).label.toLowerCase()}. Escolha onde investir esta etapa da formação; a habilidade vem do trabalho acumulado.`,[
 choice('formation:technique','Trabalhar a técnica da posição','Prioriza as habilidades mais usadas na função; experiência +8.'),choice('formation:reading','Ler o jogo e especializar a função','Prioriza leitura e passe; experiência +15.'),choice('formation:athletic','Ganhar velocidade e solidez','Prioriza ritmo e defesa; experiência +8.')]);}
export function createGame(name,position,seed=Date.now()>>>0){
 if(!POSITIONS.some(p=>p.id===position))throw new Error('Posição inválida');
 const g={schema:1,name:String(name||'Jogador').slice(0,60),age:12,position,clubId:null,condition:85,fatigue:10,pressure:15,confidence:60,trust:45,skills:{},proficiency:28,dna:{learning:0,aptitudes:{}},rng:Number(seed)>>>0,seed:Number(seed)>>>0,round:0,season:18,period:0,formation:0,phase:'FORMATION',serial:0,decisions:0,totalstats:stat(),seasonStats:stat(),yearStats:[],playedMatches:[],lastMatches:[],history:[],log:[],fanMemory:{},reputation:0,rival:null,market:[],resolved:[],decisive:null,decisiveUsed:false,event:null};
 g.dna.learning=.85+random(g)*.55;for(const k of KEYS){g.dna.aptitudes[k]=.8+random(g)*.55;g.skills[k]=14+random(g)*9;}formationEvent(g);return g;
}
function rivalEvent(g){const c=club(g);g.rival={name:['Rafael Nunes','Bruno Medeiros','Caio Fontes'][g.history.length%3],quality:c.level-2};event(g,'RIVALRY','A vaga já tem um concorrente',`${g.rival.name} é um jogador fictício de nível ${g.rival.quality} nesta simulação. ${c.name} tem uma disputa real por minutos: seu nível atual é ${overall(g)} e a experiência ${Math.round(g.proficiency)}/100.`,[
 choice('rival:earn','Disputar pela atuação','Confiança profissional +3; a escalação continuará dependendo do rendimento.'),choice('rival:team','Construir parceria com o elenco','Confiança profissional +2; respeito local +4.'),choice('rival:intrigue','Questionar o concorrente ao treinador','Confiança profissional −4, pressão +4 e ressentimento da torcida; ninguém perde a vaga por uma acusação.')]);}
function planEvent(g){const c=club(g);const m=g.fanMemory[c.id];event(g,'PLAN',`Prioridade para seis jogos · ${g.season} anos`,`${c.name}: condição ${Math.round(g.condition)}/100, fadiga ${Math.round(g.fatigue)}/100, confiança do treinador ${Math.round(g.trust)}/100${m?`, respeito da torcida ${Math.round(m.respect)}/100`:''}. Escolha como disputar o próximo período.`,[
 choice('plan:RECOVER','Recuperar e preservar rendimento','Por jogo: condição +8 e fadiga −8 antes do desgaste da partida; aprendizado a 62%.'),choice('plan:DEVELOP','Investir na habilidade da posição','Por jogo: condição −2, fadiga +3; aprendizado acelerado ×1,7 e foco técnico.'),choice('plan:TEAM','Construir espaço no coletivo','Por jogo: fadiga +1; confiança do treinador +0,8 e aprendizado normal. Não garante titularidade.')]);}
function decisiveEvent(g){g.decisiveUsed=true;event(g,'DECISIVE','Um jogo para disputar mais espaço',`A próxima partida no ${club(g).name} terá atenção especial do treinador. Escolha sua postura; ela afetará essa partida e a memória do projeto, sem alterar o que já foi jogado.`,[choice('decisive:risk','Assumir mais risco ofensivo','Mais chance de contribuir, mas também mais exposição; atuação improdutiva pode custar confiança e pressão.'),choice('decisive:safe','Priorizar uma atuação segura','Reduz exposição coletiva; contribuição consistente será observada, sem vaga automática.')]);}
function marketEvent(g){
 const score=overall(g)+g.reputation*.2;const now=club(g);const pool=CLUBS.filter(c=>c.id!==now.id&&c.level<=score+11&&c.level>=now.level-5).sort((a,b)=>a.level-b.level);
 g.market=[];const higher=pool.filter(c=>c.level>now.level),stable=pool.filter(c=>c.level<=now.level);
 const observedRating=g.seasonStats.apps?g.seasonStats.ratingSum/g.seasonStats.apps:0;
 if(g.seasonStats.apps>=4&&observedRating>=6.25&&score>=now.level-7&&pool.length){const small=stable.at(-1)??higher[0];if(small)g.market.push(small.id);const big=higher.at(-1);if(big&&!g.market.includes(big.id))g.market.push(big.id);const mid=higher[Math.floor(higher.length/2)];if(mid&&!g.market.includes(mid.id)&&g.reputation>=8)g.market.push(mid.id);}
 const names=g.market.map(id=>CLUBS.find(c=>c.id===id).name).join(', ');
 event(g,'INTEREST','O mercado observa seu ano',g.market.length?`${names} registram interesse nesta simulação. Interesse é o começo de uma conversa; um projeto maior pode oferecer menos minutos.`:'Nenhum novo clube abriu interesse neste ano. O projeto atual continua disponível; a campanha não foi apagada.',g.market.length?[...g.market.map(id=>choice(`contact:${id}`,`Conversar com ${CLUBS.find(c=>c.id===id).name}`,'Abre contato com este projeto; ainda não aceita transferência.')),choice('market:stay',`Continuar no ${now.name}`,'Preserva o projeto e prepara a próxima temporada.')]:[choice('market:stay',`Continuar no ${now.name}`,'A próxima temporada começa com os números anteriores arquivados.')]);
}
function startSeason(g){g.age=g.season;g.period=0;g.round=0;g.seasonStats=stat();g.lastMatches=[];g.coachReaction='';g.fanReaction='';g.phase='PRO';g.condition=clamp(g.condition+12);g.fatigue=clamp(g.fatigue-12);if(g.pendingNewClub){g.pendingNewClub=false;rivalEvent(g);}else planEvent(g);}
function endSeason(g){
 g.yearStats.push({age:g.season,season:g.season,clubId:g.clubId,...g.seasonStats});log(g,`${g.season} anos: ${g.seasonStats.apps} jogos, ${g.seasonStats.goals} gols e ${g.seasonStats.assists} assistências.`);
 if(g.season===20){g.age=21;g.phase='DONE';event(g,'DONE','Seu caminho até os 21',`O recorte termina aqui, não a carreira. Você registrou ${g.totalstats.apps} participações e ${g.totalstats.minutes} minutos, em ${g.history.map(h=>CLUBS.find(c=>c.id===h.clubId).name).join(' → ')}. A história permanece nos anos e partidas abaixo.`);return;}marketEvent(g);
}
function finishMarket(g){g.season++;startSeason(g);}
function nextPeriod(g){if(g.period===3){endSeason(g);return;}if(g.season===19&&g.period===1&&!g.decisiveUsed)decisiveEvent(g);else planEvent(g);}
function simulate(g,strategy){
 const c=club(g),other=CLUBS[(g.round+g.season*3+g.history.length)%CLUBS.length];const opponent=other.id===c.id?CLUBS[(CLUBS.indexOf(other)+1)%10]:other;
 if(strategy==='RECOVER'){g.condition=clamp(g.condition+8);g.fatigue=clamp(g.fatigue-8);}else if(strategy==='DEVELOP'){g.condition=clamp(g.condition-2);g.fatigue=clamp(g.fatigue+3);}else{g.fatigue=clamp(g.fatigue+1);g.trust=clamp(g.trust+.8);}
 const role=overall(g),effective=role*(.68+g.condition*.0032)*(1-g.fatigue*.002)*(1-g.pressure*.001);
 const recent=g.lastMatches.filter(m=>m.minutes>=45);const avg=recent.length?recent.reduce((s,m)=>s+m.rating,0)/recent.length:6.5;
 const starterChance=clamp(.48+(effective-g.rival.quality)*.023+(g.trust-50)*.007+(avg-6.5)*.07,.08,.91);
 const started=roll(g,starterChance),minutes=started?70+Math.floor(random(g)*21):roll(g,.68)?12+Math.floor(random(g)*24):0;
 const pivotal=g.decisive;g.decisive=null;
 let gf=0,ga=0,teamChances=0,oppChances=0;
 const creation=clamp(.5+(c.level-opponent.level)*.006+(minutes>0?(g.skills.passing+g.skills.reading-100)*.0007*minutes/90:0)+(pivotal==='risk'?.09:0),.2,.8);
 const opponentCreation=clamp(.5+(opponent.level-c.level)*.006+(pivotal==='risk'?.07:pivotal==='safe'?-.06:0),.2,.8);
 const conversion=clamp(.3+(c.level-opponent.level)*.003+(minutes>0?(g.skills.finishing-opponent.level)*.0007*minutes/90:0),.12,.52);
 const opponentConversion=clamp(.3+(opponent.level-c.level)*.003-(minutes>0?((g.position==='GK'?g.skills.goalkeeping:g.skills.defending)-opponent.level)*.0007*minutes/90:0),.12,.52);
 for(let i=0;i<7;i++){
  if(roll(g,creation)){teamChances++;if(roll(g,conversion))gf++;}
  if(roll(g,opponentCreation)){oppChances++;if(roll(g,opponentConversion))ga++;}
 }
 let goals=0,assists=0;const attackShare={GK:0,CB:.055,FB:.09,DM:.09,CM:.15,AM:.27,WG:.34,ST:.48}[g.position],assistShare={GK:.01,CB:.04,FB:.15,DM:.12,CM:.25,AM:.3,WG:.2,ST:.1}[g.position];
 if(minutes>0)for(let i=0;i<gf;i++){if(roll(g,attackShare*minutes/90*effective/60*(pivotal==='risk'?1.3:1)))goals++;else if(roll(g,assistShare*minutes/90*effective/60))assists++;}
 const saves=g.position==='GK'&&minutes>0?Math.floor(Math.max(0,oppChances-ga)*minutes/90):0;
 let rating=minutes>0?6.05+goals*.95+assists*.65+(effective-c.level)*.018:0;
 if(minutes>0&&g.position==='GK')rating+=saves*.13+(ga===0?.6:0)-ga*.23;
 else if(minutes>0&&['CB','FB','DM'].includes(g.position))rating+=(ga===0?.65:0)-Math.max(0,ga-1)*.2;
 else if(minutes>=45&&['ST','WG','AM'].includes(g.position)&&goals+assists===0)rating=Math.min(6.3,rating);
 rating=minutes>0?Math.round(clamp(rating,4,9.8)*10)/10:0;
 if(minutes){g.trust=clamp(g.trust+(rating>=7?1.6:rating<6.3?-1.2:0));g.reputation=clamp(g.reputation+goals*.8+assists*.5+(rating>=7?.35:0),0,100);g.confidence=clamp(g.confidence+(rating>=7?2:rating<6.3?-2:0));}
 else g.confidence=clamp(g.confidence-1);
 let moment='';if(pivotal){const success=minutes>=20&&rating>=7;g.trust=clamp(g.trust+(pivotal==='risk'?(success?6:-6):success?3:1));g.pressure=clamp(g.pressure+(pivotal==='risk'?(success?-3:6):-1));g.reputation=clamp(g.reputation+(success?3:0));moment=`Momento decisivo (${pivotal==='risk'?'risco':'segurança'}): ${success?'contribuição reconhecida':'a atuação não trouxe a contribuição esperada'}.`;memory(g,moment,success?4:-2,true);}
 const result=gf>ga?'W':gf<ga?'L':'D';g.pressure=clamp(g.pressure+(result==='L'?2:result==='W'?-1:0));
 const fan=g.fanMemory[c.id]?.respect??50;if(fan<40)g.pressure=clamp(g.pressure+.5);
 memory(g,`${c.name} ${gf}–${ga} ${opponent.name}: ${minutes?`nota ${rating.toFixed(1)}`:'sem minutos'}.`,minutes>=45?(rating>=7?1:rating<6.3?-1:0):0);
 const coach=minutes===0?'Você ficou no banco; rendimento e concorrência ainda pesam na próxima escalação.':rating>=7?'A contribuição desta partida fortaleceu sua disputa por espaço.':goals+assists===0&&['ST','WG','AM'].includes(g.position)?'Houve minutos, mas faltou contribuição ofensiva nesta partida.':'A atuação foi registrada; a disputa por espaço continua.';
 const fans=minutes===0?'A torcida acompanhou o resultado do time, sem uma atuação sua para avaliar.':rating>=7?'A torcida reconheceu a contribuição nesta partida.':rating<6.3?'A atuação aumentou a cobrança da torcida.':'A torcida viu uma atuação sem destaque individual.';
 const match={season:g.season,round:++g.round,clubId:c.id,opponent:opponent.name,opponentId:opponent.id,gf,ga,minutes,started,goals,assists,rating,saves,result,coach,fans,moment,strategy,teamChances,oppChances};g.playedMatches.push(match);
 for(const stats of [g.seasonStats,g.totalstats])if(minutes>0){stats.apps++;stats.starts+=started?1:0;stats.minutes+=minutes;stats.goals+=goals;stats.assists+=assists;stats.ratingSum+=rating;}
 g.condition=clamp(g.condition-(minutes>=45?4:minutes?2:1));g.fatigue=clamp(g.fatigue+(minutes?2:1));
 const target=KEYS[WEIGHTS[g.position].indexOf(Math.max(...WEIGHTS[g.position]))];growth(g,strategy==='DEVELOP'?target:null,strategy==='DEVELOP'?1.7:strategy==='RECOVER'?.62:1);g.proficiency=clamp(g.proficiency+(minutes>=45?.42:minutes?.2:.06),0,100);return match;
}
function playPeriod(g,strategy){g.lastMatches=[];for(let i=0;i<6;i++)g.lastMatches.push(simulate(g,strategy));const actual=g.lastMatches.filter(m=>m.minutes>0),goals=actual.reduce((s,m)=>s+m.goals,0),assists=actual.reduce((s,m)=>s+m.assists,0),starts=actual.filter(m=>m.started).length;g.coachReaction=`Neste período: ${actual.length} participações, ${starts} titularidades, ${goals} gols e ${assists} assistências. ${g.lastMatches.at(-1).coach}`;g.fanReaction=`${club(g).name}: respeito atual ${Math.round(g.fanMemory[g.clubId]?.respect??50)}/100. ${g.lastMatches.at(-1).fans}`;g.period++;log(g,`${club(g).name}: período ${g.period}, plano ${{RECOVER:'recuperação',DEVELOP:'desenvolvimento',TEAM:'trabalho coletivo'}[strategy]}, ${g.lastMatches.filter(m=>m.minutes>0).length} participações.`);nextPeriod(g);}
function validAction(g,id){
 const base=id.split('@')[0],kind=g.event?.kind;
 if(kind==='FORMATION')return ['formation:technique','formation:reading','formation:athletic'].includes(base);
 if(kind==='RIVALRY')return ['rival:earn','rival:team','rival:intrigue'].includes(base);
 if(kind==='PLAN')return ['plan:RECOVER','plan:DEVELOP','plan:TEAM'].includes(base);
 if(kind==='DECISIVE')return ['decisive:risk','decisive:safe'].includes(base);
 if(kind==='INTEREST')return base==='market:stay'||Array.isArray(g.market)&&g.market.some(c=>base===`contact:${c}`&&CLUBS.some(x=>x.id===c));
 if(kind==='CONTACT')return base==='market:stay'||base===`offer:${g.contactClub}`&&CLUBS.some(c=>c.id===g.contactClub);
 if(kind==='OFFER')return base==='market:stay'||base===`accept:${g.offer?.clubId}`&&CLUBS.some(c=>c.id===g.offer?.clubId);
 return false;
}
/** Guard before all mutation; event serial makes resolved choices non-replayable. */
export function choose(g,id){
 if(!validGame(g)||g.phase==='DONE'||!g.event?.choices.some(c=>c.id===id)||g.resolved.includes(g.event.id)||!validAction(g,id))return false;
 const kind=g.event.kind,key=g.event.id;if(!['FORMATION','RIVALRY','PLAN','DECISIVE','INTEREST','CONTACT','OFFER'].includes(kind))return false;id=id.split('@')[0];g.resolved.push(key);g.decisions++;
 if(kind==='FORMATION'){
  const mode=id.split(':')[1];for(const k of KEYS){const i=KEYS.indexOf(k),priority=mode==='technique'?WEIGHTS[g.position][i]>=.25:mode==='reading'?['reading','passing'].includes(k):['pace','defending'].includes(k);g.skills[k]=clamp(g.skills[k]+(priority?15:6)*g.dna.learning*g.dna.aptitudes[k],0,99);}g.proficiency=clamp(g.proficiency+(mode==='reading'?15:8));g.formation++;
  if(g.formation<3)formationEvent(g);else{g.age=18;g.phase='PRO';g.clubId=CLUBS[overall(g)>=63?2:overall(g)>=56?1:0].id;g.history.push({age:18,clubId:g.clubId,reason:'Primeiro projeto após formação'});g.condition=88;g.fatigue=12;rivalEvent(g);}return true;
 }
 if(kind==='RIVALRY'){if(id==='rival:earn')g.trust=clamp(g.trust+3);else if(id==='rival:team'){g.trust=clamp(g.trust+2);memory(g,'Chegou para cooperar com o elenco.',4);}else{g.trust=clamp(g.trust-4);g.pressure=clamp(g.pressure+4);memory(g,'Questionou o concorrente sem uma atuação que justificasse a acusação.',-5);}planEvent(g);return true;}
 if(kind==='PLAN'){playPeriod(g,id.slice(5));return true;}
 if(kind==='DECISIVE'){g.decisive=id.endsWith('risk')?'risk':'safe';planEvent(g);return true;}
 if(kind==='INTEREST'){if(id==='market:stay'){finishMarket(g);return true;}g.contactClub=id.slice(8);const c=CLUBS.find(c=>c.id===g.contactClub);event(g,'CONTACT',`Contato com ${c.name}`,`O projeto tem nível ${c.level}; seu nível atual é ${overall(g)}. Um clube mais forte pode reduzir sua participação inicial.`,[choice(`offer:${c.id}`,'Pedir uma proposta concreta','Avança a negociação, sem aceitar o clube.'),choice('market:stay','Encerrar contato e continuar','Preserva o projeto atual.')]);return true;}
 if(kind==='CONTACT'){if(id==='market:stay'){finishMarket(g);return true;}const c=CLUBS.find(c=>c.id===g.contactClub);g.offer={clubId:c.id,monthly:Math.round((1500+c.prestige*180+Math.max(0,overall(g)-45)*500)/50)*50};event(g,'OFFER',`Proposta de ${c.name}`,`Salário simulado R$ ${g.offer.monthly.toLocaleString('pt-BR')} por mês. Projeto de nível ${c.level}; contratação não garante titularidade.`,[choice(`accept:${c.id}`,`Aceitar ${c.name}`,'Muda de clube na próxima temporada; confiança começa em 45, com memória local preservada.'),choice('market:stay',`Permanecer no ${club(g).name}`,'Recusa a proposta e mantém a confiança do projeto atual.')]);return true;}
 if(kind==='OFFER'){if(id.startsWith('accept:')){g.clubId=g.offer.clubId;g.salary=g.offer.monthly;g.trust=45;const m=g.fanMemory[g.clubId];if(m){g.pressure=clamp(g.pressure+(50-m.respect)*.12);g.trust=clamp(g.trust+(m.respect-50)*.1);}g.history.push({age:g.season+1,clubId:g.clubId,reason:'Proposta aceita'});g.pendingNewClub=true;log(g,`Aceitou ${club(g).name}; a escalação ainda será disputada.`);}delete g.offer;finishMarket(g);return true;}
 return false;
}

/** JSON hydration guard. Does not migrate, simulate, render or write the supplied object. */
export function validGame(g){
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const bounded=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 const integer=(v,a,b)=>Number.isInteger(v)&&bounded(v,a,b);
 const known=id=>CLUBS.some(c=>c.id===id);
 const finite=(v,seen=new Set())=>{if(typeof v==='number')return Number.isFinite(v);if(!v||typeof v!=='object')return true;if(seen.has(v))return false;seen.add(v);const ok=Object.values(v).every(x=>finite(x,seen));seen.delete(v);return ok;};
 const totals=matches=>matches.reduce((s,m)=>{if(m.minutes){s.apps++;s.starts+=m.started?1:0;s.minutes+=m.minutes;s.goals+=m.goals;s.assists+=m.assists;s.ratingSum+=m.rating;}return s;},stat());
 const sameStats=(s,ms)=>{if(!object(s))return false;const t=totals(ms);return Object.keys(t).every(k=>bounded(s[k],0,54*90)&&Math.abs(s[k]-t[k])<1e-8);};
 try{
  if(!object(g)||g.schema!==1||typeof g.name!=='string'||g.name.length>60||!POSITIONS.some(p=>p.id===g.position)||!['FORMATION','PRO','DONE'].includes(g.phase)||!integer(g.age,12,21))return false;
  if(!['condition','fatigue','pressure','confidence','trust','proficiency','reputation'].every(k=>bounded(g[k],0,100))||!object(g.skills)||!KEYS.every(k=>bounded(g.skills[k],0,99))||!integer(g.rng,0,4294967295)||!integer(g.seed,0,4294967295))return false;
  if(!object(g.dna)||!bounded(g.dna.learning,.5,2)||!object(g.dna.aptitudes)||!KEYS.every(k=>bounded(g.dna.aptitudes[k],.5,2)))return false;
  if(![['serial',1,30],['decisions',0,25],['formation',0,3],['period',0,3],['round',0,18],['season',18,20]].every(([k,a,b])=>integer(g[k],a,b))||g.round!==g.period*6)return false;
  if(!Array.isArray(g.playedMatches)||g.playedMatches.length>54||!Array.isArray(g.lastMatches)||g.lastMatches.length>6||!Array.isArray(g.yearStats)||g.yearStats.length>3)return false;
  if(g.playedMatches.length!==(g.season-18)*18+g.round)return false;
  for(const [i,m]of g.playedMatches.entries()){
   if(!object(m)||m.season!==18+Math.floor(i/18)||m.round!==i%18+1||!known(m.clubId)||!known(m.opponentId)||m.clubId===m.opponentId||typeof m.opponent!=='string'||typeof m.started!=='boolean')return false;
   if(!integer(m.gf,0,7)||!integer(m.ga,0,7)||!integer(m.teamChances,0,7)||!integer(m.oppChances,0,7)||m.gf>m.teamChances||m.ga>m.oppChances||!integer(m.minutes,0,90)||!integer(m.goals,0,m.gf)||!integer(m.assists,0,m.gf-m.goals)||!bounded(m.rating,0,10)||typeof m.coach!=='string'||typeof m.fans!=='string'||typeof m.moment!=='string')return false;
   if(m.started?m.minutes<70:!(m.minutes===0||m.minutes>=12&&m.minutes<=35))return false;
   if(m.minutes===0&&(m.rating!==0||m.goals!==0||m.assists!==0))return false;
   if(m.result!==(m.gf>m.ga?'W':m.gf<m.ga?'L':'D'))return false;
  }
  if(!sameStats(g.totalstats,g.playedMatches)||!sameStats(g.seasonStats,g.playedMatches.filter(m=>m.season===g.season)))return false;
  const expectedYears=g.season-18+(g.round===18?1:0);if(g.yearStats.length!==expectedYears)return false;
  for(const [i,y]of g.yearStats.entries())if(!object(y)||y.age!==18+i||y.season!==y.age||!known(y.clubId)||!sameStats(y,g.playedMatches.filter(m=>m.season===y.age)))return false;
  if(g.lastMatches.length!==Math.min(g.round,6)||g.lastMatches.some((m,i)=>JSON.stringify(m)!==JSON.stringify(g.playedMatches.slice(-g.lastMatches.length)[i])))return false;
  if(!Array.isArray(g.history)||!g.history.every(h=>object(h)&&integer(h.age,18,20)&&known(h.clubId)&&typeof h.reason==='string')||!Array.isArray(g.log)||!g.log.every(x=>typeof x==='string'))return false;
  if(!Array.isArray(g.resolved)||g.resolved.length!==g.decisions||new Set(g.resolved).size!==g.resolved.length||!g.resolved.every(x=>typeof x==='string'&&/^p10-\d+$/.test(x)))return false;
  if(!object(g.fanMemory)||!Object.entries(g.fanMemory).every(([id,m])=>known(id)&&object(m)&&bounded(m.respect,0,100)&&Array.isArray(m.entries)&&m.entries.length<=4&&m.entries.every(x=>typeof x==='string')&&Array.isArray(m.criticalEntries)&&m.criticalEntries.length<=8&&m.criticalEntries.every(x=>typeof x==='string')))return false;
  if(!Array.isArray(g.market)||new Set(g.market).size!==g.market.length||g.market.length>3||!g.market.every(known)||typeof g.decisiveUsed!=='boolean'||![null,'risk','safe'].includes(g.decisive))return false;
  const e=g.event;if(!object(e)||e.id!==`p10-${g.serial}`||g.resolved.includes(e.id)||typeof e.title!=='string'||typeof e.body!=='string'||!Array.isArray(e.choices)||e.choices.length>4)return false;
  if(g.phase==='FORMATION'){if(g.formation>=3||g.age!==[12,14,16][g.formation]||g.clubId!==null||e.kind!=='FORMATION'||g.playedMatches.length)return false;}
  else{if(g.formation!==3||!known(g.clubId)||!object(g.rival)||typeof g.rival.name!=='string'||!bounded(g.rival.quality,0,100))return false;
   if(g.phase==='DONE'){if(g.age!==21||g.season!==20||g.round!==18||e.kind!=='DONE'||e.choices.length)return false;}
   else if(g.age!==g.season||!['RIVALRY','PLAN','DECISIVE','INTEREST','CONTACT','OFFER'].includes(e.kind))return false;
  }
  if(g.phase!=='DONE'&&(!e.choices.length||!e.choices.every(c=>object(c)&&typeof c.id==='string'&&c.id.endsWith(`@${g.serial}`)&&validAction(g,c.id)&&typeof c.label==='string'&&typeof c.hint==='string')||new Set(e.choices.map(c=>c.id)).size!==e.choices.length))return false;
  if(['CONTACT','OFFER'].includes(e.kind)&&(!known(g.contactClub)||!g.market.includes(g.contactClub)))return false;
  if(e.kind==='OFFER'&&(!object(g.offer)||g.offer.clubId!==g.contactClub||!integer(g.offer.monthly,1500,1000000)))return false;
  if(['INTEREST','CONTACT','OFFER','DONE'].includes(e.kind)?g.period!==3:g.period>=3)return false;
  return finite(g);
 }catch{return false;}
}
