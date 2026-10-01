import {evaluationSearchPreview} from './core/pathways.js';
import { buildCareerContext } from './core/context.js';
import { competitionCategory, CATEGORY_LABEL } from './core/calendar.js';
import { coachDossier, coachBond, coachName, bondLabel, ensureCoaching, standings, coachProfile } from './core/coaches.js';
import { REAL_COACHES } from './data/coaches.js';
import { createCareer, advanceCareer, resolveChoice, overallVisible, getClub, clubCount, getPositionLabel, setTransferIntent, transferIntentLabel } from './core/engine.js';
import { loadSave, storeSave, clearSave, exportDiagnostic, getPersistenceStatus, getRecoveryRaw } from './core/persistence.js';
import { BRAZIL_CLUBS_2026 } from './data/clubs-br-2026.js';
import { POSITIONS, POSITION_LABEL, coachPositionFeedback } from './core/positions.js';
import type { SaveGame, TransferIntent, VisibleAttributes, CareerEvent, SeasonStats, CareerChoice } from './core/types.js';

let save:SaveGame|null=loadSave();
let tab='career';
const root=document.querySelector<HTMLDivElement>('#app')!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]!));
const pct=(v:number)=>v>=82?'Muito alta':v>=66?'Alta':v>=45?'Média':v>=28?'Baixa':'Muito baixa';
const money=(v:number)=>v<=0?'—':v<1_000_000?`R$ ${(v/1000).toFixed(0)} mil`:`R$ ${(v/1_000_000).toFixed(v>=100_000_000?0:1)} mi`;
const posLabel=(p:string)=>p==='IND'?'Indefinida':POSITION_LABEL[p as keyof typeof POSITION_LABEL]??p;

function theme(){
  const c=save?getClub(save.player.currentClubId):null;const colors=c?.colors??['#7bbcff','#e8eef4'];
  return `style="--club:${colors[0]};--club2:${colors[1]};"`;
}
function appShell(content:string){return `<main class="shell ${save?'playing':'creating'}" ${theme()}><div class="brand"><div><h1>1903</h1><span class="subbrand">CARREIRA</span></div><span class="build">0.3.11 · EXPERIMENTAL</span></div>${save?nav():''}${persistenceNotice()}<div class="page-content">${content}</div></main>`;}
const navPaths:Record<string,string>={career:'M8 5l10 7-10 7V5Z',player:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21v-2a7 7 0 0 1 14 0v2',stats:'M5 20V10m7 10V4m7 16v-7',world:'M4 7h16v13H4V7Zm4 0V4h8v3M4 12h16m-8-2v4'};
function nav(){return `<nav class="bottom-nav" aria-label="Navegação da carreira"><div class="bottom-nav-inner">${[['career','Jogar','Jogar'],['player','Jogador','Meu jogador'],['stats','Histórico','Histórico'],['world','Clube','Clube e mercado']].map(([id,label,full])=>`<button class="nav ${tab===id?'active':''}" data-tab="${id}" aria-label="${full}" aria-current="${tab===id?'page':'false'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${navPaths[id!]}"/></svg><span>${label}</span></button>`).join('')}</div></nav>`;}
function persistenceNotice(){
 const status=getPersistenceStatus();
 if(status.kind==='corrupt'&&!save)return '';
 if(!['unavailable','write-error','clear-error','corrupt'].includes(status.kind))return '';
 return `<aside class="save-notice" role="alert" tabindex="-1"><b>Seu progresso precisa de atenção</b><p>${esc(status.message)} ${save?'Sua carreira continua nesta tela. Exporte uma cópia antes de fechar.':'Você pode jogar, mas precisará exportar uma cópia antes de fechar.'}</p><div><button id="retry-save">${save?'Tentar salvar':'Tentar acessar o armazenamento'}</button>${save?'<button id="backup-save">Exportar carreira</button>':''}${status.recoveryAvailable?'<button id="recover-raw">Baixar save original</button>':''}</div></aside>`;
}
function renderRecovery(){root.innerHTML=appShell(`<section class="recovery-panel"><span class="eyebrow">RECUPERAÇÃO DO SAVE</span><h2>Sua carreira foi preservada.</h2><p>O navegador encontrou dados que não consegue abrir com segurança. Eles continuam armazenados e não serão substituídos por uma nova carreira.</p><p>Baixe o arquivo original para recuperarmos seu progresso.</p><button class="action primary" id="recover-raw">Baixar save original</button><button class="action" id="retry-load">Tentar abrir novamente</button></section>`);bind();}
function downloadRecovery(){const raw=getRecoveryRaw();if(raw===null)return;const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='1903-save-recuperacao.json';a.click();URL.revokeObjectURL(url);}
function focusEvent(){const target=document.querySelector<HTMLElement>('.save-notice')??document.querySelector<HTMLElement>('.career-situation')??document.querySelector<HTMLElement>('.event-card');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:'instant'});}
const birthCities=BRAZIL_CLUBS_2026.filter(c=>c.city&&c.city!==c.name&&c.city!=='A DEFINIR');
const brazilStates=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
function clubOptions(){return BRAZIL_CLUBS_2026.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(c=>`<option value="${c.id}">${esc(c.name)} · ${c.state}</option>`).join('');}
function renderCreate(){root.innerHTML=appShell(`<div class="start-layout"><section class="cover"><span class="eyebrow">NOVA CARREIRA · 2026</span><h2>O futebol ainda não sabe seu nome.</h2><p>Você tem 12 anos e uma bola nos pés. Descubra seu talento, conquiste seu espaço e construa uma história que fique.</p><div class="start-facts"><div><b>01</b><span>Comece na escolinha da sua cidade.</span></div><div><b>02</b><span>Construa seu caminho dentro e fora de campo.</span></div><div><b>03</b><span>Decida quais propostas fazem sentido para você.</span></div></div></section><form class="form" id="career-form"><span class="eyebrow">QUEM É VOCÊ?</span><h3>Antes da primeira partida</h3><p class="form-intro">Você escolhe suas raízes. A família, a infância e as características serão sorteadas.</p><label for="name">Nome do jogador</label><input id="name" value="Luciano Basso" maxlength="32" required autocomplete="off"><label for="birth-city">Cidade de nascimento</label><input id="birth-city" list="birth-cities" placeholder="Digite sua cidade" maxlength="80" required><datalist id="birth-cities">${[...new Set(birthCities.map(c=>c.city))].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(city=>`<option value="${esc(city)}"></option>`).join('')}</datalist><label for="birth-state">Estado</label><select id="birth-state" required><option value="">Selecione o estado</option>${brazilStates.map(state=>`<option value="${state}">${state}</option>`).join('')}</select><label for="heart-club">Clube do coração</label><select id="heart-club" required><option value="">Selecione seu clube</option>${clubOptions()}</select><p class="footnote">Torcer por um clube não garante uma vaga nele. Você começa na cidade escolhida, numa escolinha comunitária.</p><button class="action primary" id="new" type="submit">Começar minha carreira</button></form><div class="footnote">Sua carreira é salva automaticamente neste navegador.</div></div>`);bind();}

function feedbackCard(e:CareerEvent):string{
  const f=e.matchFeedback;if(!f)return '';
  return `<section class="performance-card" aria-label="Quadro da atuação"><div class="performance-heading"><span class="eyebrow">${f.blockGames?'ATUAÇÃO NA PARTIDA':'SEM PARTICIPAÇÃO'}<small class="match-category">${esc(f.category?CATEGORY_LABEL[f.category]:'Categoria não registrada')}</small></span><strong>${f.rating?f.rating.toFixed(1):'—'}<small>NOTA</small></strong></div><div class="match-scoreboard"><span>${esc(getClub(save!.player.currentClubId)?.shortName??save!.player.life?.localSchool??'Seu time')}</span>${f.blockGames||f.showScore?`<b aria-label="Placar ${f.teamGoals} a ${f.oppGoals}">${f.teamGoals}<i>:</i>${f.oppGoals}</b>`:'<b>×</b>'}<span>${esc(f.opponent)}</span></div><div class="performance-metrics ${save!.player.position==='GK'?'goalkeeper':''}"><div><b>${f.minutes}</b><span>MINUTOS</span></div><div><b>${f.goals}</b><span>GOLS</span></div><div><b>${f.assists}</b><span>ASSIST.</span></div>${save!.player.position==='GK'?`<div><b>${f.saves}</b><span>DEFESAS</span></div>`:''}</div><div class="minutes-track" aria-label="${f.minutes} minutos em 90"><i style="width:${f.minutes/90*100}%"></i></div><small>${f.blockGames?(f.started?'Começou como titular':'Entrou durante a partida'):'Não entrou em campo'}</small>${f.ratingReason?`<p class="rating-reason">${esc(f.ratingReason)}</p>`:''}<section class="reaction-details" aria-label="Reações da torcida e do treinador"><div class="performance-reactions"><div><span>TORCIDA</span><p>${esc(f.fanReaction)}</p></div><div><span>TREINADOR · ${esc(f.coachName).toUpperCase()}</span><p>${esc(f.coachReaction)}</p></div></div></section></section>`;
}
function seasonPosition(s:SeasonStats):string{
 const positions=s.positionsPlayed??[];const primary=s.primaryPosition??(positions.length===1?positions[0]:undefined);
 if(!primary)return 'Posição não registrada';
 return `${posLabel(primary)}${positions.length>1?' · também '+positions.filter(x=>x!==primary).map(x=>posLabel(x)).join(', '):''}`;
}
function seasonCategoryRows(s:SeasonStats):string{
 if(!s.categories)return '<small>Categoria não registrada neste save antigo</small>';
 return `<div class="category-stats">${Object.entries(s.categories).map(([key,c])=>`<div><b>${esc(CATEGORY_LABEL[key as keyof typeof CATEGORY_LABEL])}</b><span>${c!.appearances}J · ${c!.minutes} min · ${c!.goals}G · ${c!.assists}A</span></div>`).join('')}</div>`;
}
function currentCoachCard():string{
 const p=save!.player;if(!p.currentClubId||p.age<16)return '';
 const job=ensureCoaching(p).jobs[p.currentClubId];if(!job)return '';
 const bond=coachBond(p,job.coachId);
 return `<article class="coach-card"><span class="eyebrow">COMANDO TÉCNICO</span><h3>${esc(coachName(job.coachId))}</h3><p>${esc(coachDossier(p,p.currentClubId))}</p><div class="tags"><span>${esc(bondLabel(bond))}</span><span>Confiança profissional ${bond.trust>=65?'alta':bond.trust<40?'baixa':'em construção'}</span></div>${bond.memories.length?`<small>${esc(bond.memories[0]!)}</small>`:''}</article>`;
}
function coachDatabase():string{
 return `<details class="coach-database"><summary>Banco de treinadores · ${REAL_COACHES.length} nomes reais</summary><p>Nomes reais; projetos, perfis e relações desta carreira são simulados.</p><input id="coach-search" type="search" placeholder="Buscar treinador" aria-label="Buscar treinador"><div id="coach-results">${coachRows('')}</div></details>`;
}
function coachRows(query:string):string{
 const normal=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const matches=REAL_COACHES.filter(c=>normal(c.name).includes(normal(query)));
 return matches.map(c=>{const profile=coachProfile(c.id);return `<div class="coach-db-row"><b>${esc(c.name)}</b><small>${c.market==='REGIONAL'?'Referência no futebol regional':c.market==='BRAZIL'?'Referência no mercado brasileiro':'Referência internacional'}${c.historicalOnly?' · acervo histórico':''}</small><span>Perfil de jogo: ${profile.style==='POSSESSION'?'posse':profile.style==='DIRECT'?'verticalidade':'organização defensiva'} · ${profile.dialogue>=60?'mais aberto ao diálogo':'mais firme na negociação'}</span></div>`;}).join('')||'<div class="empty">Nenhum treinador encontrado.</div>';
}
function choiceResultCard():string{
 const result=save!.player.lastChoiceResult;if(!result)return '';
 return `<aside class="choice-result" aria-label="Resultado da última escolha"><span class="eyebrow">SUA DECISÃO · ${result.season}</span><b>${esc(result.label)}</b><p>${esc(result.summary)}</p>${result.effects.length?`<details><summary>O que mudou</summary><ul>${result.effects.map(effect=>`<li>${esc(effect)}</li>`).join('')}</ul></details>`:''}</aside>`;
}
function chapterCard():string{
 const p=save!.player,story=p.story;if(!story)return '';
 const chapter=story.active,last=story.archive[story.archive.length-1];
 const outcome=last&&p.careerTurn-last.endedTurn<=1?`<aside class="chapter-payoff" role="status"><span class="eyebrow">${last.outcome==='ACHIEVED'?'CAPÍTULO CONCLUÍDO':'BALANÇO DO CAPÍTULO'}</span><b>${esc(last.title)}</b><p>${esc(last.payoff)}</p></aside>`:'';
 if(!chapter)return outcome;
 const targets=[{label:'participações',value:chapter.appearances,target:chapter.targetAppearances},{label:'minutos',value:chapter.minutes,target:chapter.targetMinutes},{label:'boas atuações',value:chapter.goodMatches,target:chapter.targetGoodMatches}].filter(x=>x.target>0);
 const progress=targets.length?Math.min(...targets.map(x=>Math.min(1,x.value/x.target))):0;
 return `${outcome}<section class="chapter-card" aria-label="Capítulo em andamento"><div class="chapter-heading"><span class="eyebrow">SEU PRÓXIMO MARCO</span><span>${Math.max(0,chapter.deadlineTurn-p.careerTurn)} rodadas restantes</span></div><h3>${esc(chapter.title)}</h3><p>${esc(chapter.objective)}</p><progress value="${Math.round(progress*100)}" max="100" aria-label="Progresso do capítulo"></progress><div class="chapter-evidence">${targets.map(x=>`<span><b>${x.value}</b> / ${x.target} ${x.label}</span>`).join('')}</div></section>`;
}
function biographyCard():string{
 const p=save!.player,chapters=p.story?.archive??[];
 if(!chapters.length)return '';
 return `<section class="biography-card"><span class="eyebrow">SUA BIOGRAFIA</span><h3>O que ficou pelo caminho</h3><p>Marcos observados desde que os capítulos começaram a ser registrados.</p><div class="biography-list">${chapters.slice().reverse().map(ch=>`<article><div><span>${ch.startedSeason}${ch.endedSeason!==ch.startedSeason?'–'+ch.endedSeason:''} · ${esc(getClub(ch.clubId)?.shortName??'Formação')}</span><b>${ch.outcome==='ACHIEVED'?'Concluído':ch.outcome==='PARTIAL'?'Progresso parcial':'Meta não alcançada'}</b></div><h4>${esc(ch.title)}</h4><p>${esc(ch.payoff)}</p></article>`).join('')}</div></section>`;
}

function contextCard(e:CareerEvent):string{
 if(!save||(!e.matchFeedback&&e.kind!=='SEASON_END'&&e.kind!=='MARKET'))return `<p>${esc(e.body)}</p>`;
 const context=buildCareerContext(save,e);
 return `<section class="match-context" aria-label="Contexto e próximos passos"><h4>Contexto e próximos passos</h4>${context.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}${context.nextStep?`<p class="context-next"><b>Próximo passo</b>${esc(context.nextStep)}</p>`:''}</section>`;
}

function choiceHint(c:CareerChoice):string|undefined{return c.id==='career:explore'?evaluationSearchPreview(save!.player).hint:c.hint;}
function eventCard(){
 if(!save?.pendingEvent)return save?.player.phase==='APOSENTADO'?`<div class="empty">Carreira encerrada. ${save.player.life?.secondCareer?.path==='TECHNICAL'?'Novo caminho: formação técnica.':save.player.life?.secondCareer?.path==='DEGREE'?'Novo caminho: formação superior.':save.player.life?.secondCareer?.path==='COACH_COURSE'?'Novo caminho: formação para treinador.':'Novo caminho: buscar uma ocupação.'} Seu histórico permanece disponível.</div>`:'<div class="event-card"><span class="eyebrow">PRÓXIMO CAPÍTULO</span><h3>Seu caminho começa aqui.</h3><p>Conheça sua primeira oportunidade e faça sua escolha.</p><button class="action primary" id="advance">Iniciar minha trajetória</button></div>';
 const e=save.pendingEvent;
 return `<article class="event-card ${e.matchFeedback?'has-match':''}" tabindex="-1" aria-label="Situação atual"><div class="event-top"><span class="eyebrow">${e.matchFeedback?'ÚLTIMA PARTIDA':({INFO:'SUA CARREIRA',CHOICE:'HORA DE DECIDIR',MATCH:'ÚLTIMA PARTIDA',SEASON_END:'FIM DE TEMPORADA',MARKET:'PROPOSTAS',MILESTONE:'MOMENTO DA CARREIRA'}[e.kind])}</span><span class="event-age">${closedSeason()?.season??save.player.season} · ${closedSeason()?.age??save.player.age} anos</span></div><h3 class="${e.matchFeedback?'event-title-match':''}">${esc(e.title)}</h3>${feedbackCard(e)}${contextCard(e)}<div class="tags">${e.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${e.choices?.length?`<section class="decision-panel"><div class="decision-heading"><h4>Qual é sua decisão?</h4><span>${e.choices.length} caminhos</span></div>${e.choices.map((c,i)=>`<button class="choice" data-choice="${c.id}" ${c.id==='career:explore'&&!evaluationSearchPreview(save!.player).available?'disabled':''}><span class="choice-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="choice-copy"><b>${esc(c.label)}</b>${choiceHint(c)?`<small>${esc(choiceHint(c)!.startsWith(c.label+' · ')?choiceHint(c)!.slice(c.label.length+3):choiceHint(c)!)}</small>`:''}</span></button>`).join('')}</section>`:`<button class="action primary" id="advance">Seguir minha carreira</button>`}</article>`;
}

function closedSeason():SeasonStats|undefined{
 const e=save!.pendingEvent;
 const year=e?.kind==='SEASON_END'?Number(e.id.match(/^season-(\d+)$/)?.[1]):NaN;
 return save!.player.seasonHistory.find(record=>record.season===year);
}
function seasonStrip(){
 const p=save!.player,closed=closedSeason(),record=closed??p.currentSeason;
 if(save!.pendingEvent?.kind==='SEASON_END'&&!closed)return '<section class="season-summary"><span class="season-caption">Resumo do ano encerrado indisponível neste save</span></section>';
 const completedCategories=Object.entries(closed?.categories??{}).filter(([,stats])=>stats!.appearances>0||stats!.minutes>0);
 const category=closed?(completedCategories.length===1?completedCategories[0]![0] as keyof typeof CATEGORY_LABEL:undefined):competitionCategory(p);
 const stats=category?record.categories?.[category]??record:record;
 return `<section class="season-summary" aria-label="Resumo da temporada ${record.season}"><span class="season-caption">${record.season} · ${category?esc(CATEGORY_LABEL[category]):'Todas as categorias'}${closed?' · encerrada':''}</span><div class="season-strip"><div><b>${stats.appearances}</b><span>J</span></div><div><b>${stats.goals}</b><span>G</span></div><div><b>${stats.assists}</b><span>A</span></div><div><b>${stats.motm??0}</b><span>MOTM</span></div><div><b>${stats.avgRating?stats.avgRating.toFixed(1):'—'}</b><span>Nota</span></div></div></section>`;
}
function conditionCard():string{
 const p=save!.player;
 const states=[
  {label:'Condição física',short:'Físico ↑',value:p.physicalCondition,hint:'Maior é melhor'},
  {label:'Fadiga mental',short:'Fadiga ↓',value:p.mentalFatigue,hint:'Menor é melhor'},
  {label:'Pressão',short:'Pressão',value:p.pressure,hint:'Cobrança sentida'},
  {label:'Confiança',short:'Conf.',value:p.confidence,hint:'Estado atual'},
  {label:'Moral',short:'Moral',value:p.morale,hint:'Estado atual'},
 ];
 return `<section class="player-condition" aria-label="Como estou · estados atuais de 0 a 100"><div class="condition-grid">${states.map(s=>`<div aria-label="${s.label}: ${Math.round(s.value)} de 100. ${s.hint}" title="${s.label} · ${s.hint}"><span>${s.short}</span><b>${Math.round(s.value)}<small>/100</small></b></div>`).join('')}</div></section>`;
}
function renderCareer(){
 const p=save!.player,c=getClub(p.currentClubId);
 root.innerHTML=appShell(`<div class="play-screen"><header class="player-head play-head"><div><span class="eyebrow">${p.age} anos · ${esc(getPositionLabel(p))}</span><h2>${esc(p.name)}</h2><p>${c?esc(c.name):esc(p.life?.localSchool??'Escolinha local')}</p></div><div class="ovr"><b>${overallVisible(p)}</b><span>Overall</span></div></header>${conditionCard()}${seasonStrip()}<section class="career-focus career-situation" tabindex="-1" aria-label="Seu momento na carreira">${choiceResultCard()}${eventCard()}${chapterCard()}</section><details class="recent-memory play-memory"><summary>Memória da carreira</summary><div class="timeline">${p.history.slice(0,8).map(h=>`<div class="timeline-item"><i></i><div><b>${esc(h.headline)}</b><span>${h.season} · ${h.age} anos — ${esc(h.detail)}</span></div></div>`).join('')||'<div class="empty">A carreira está apenas começando.</div>'}</div></details><div class="career-actions"><button class="action danger" id="reset" type="button" aria-describedby="restart-note">Recomeçar carreira</button><p id="restart-note">Apaga esta carreira após confirmação e volta à criação aos 12 anos.</p></div></div>`);bind();
}

function attrRow(k:keyof VisibleAttributes,label:string){const p=save!.player,know=p.attributeKnowledge[k],v=p.attributes[k];const shown=know<18?'?':know<58?`${Math.max(5,Math.round(v-6))}–${Math.min(99,Math.round(v+6))}`:Math.round(v).toString();const cls=know<18?'unknown':'';return `<div class="attribute ${cls}"><span>${label}</span><b>${shown}</b></div>`;}
function positionGrid(){const p=save!.player;return `<div class="position-grid">${POSITIONS.map(pos=>`<div class="position-cell ${p.position===pos?'current':''}"><span>${POSITION_LABEL[pos]}</span><b>${Math.round(p.positionProficiency[pos])}</b><small>experiência</small></div>`).join('')}</div>`;}
function renderPlayer(){const p=save!.player,c=getClub(p.currentClubId);const foot=p.age<=12?'em descoberta':p.dna.dominantFoot==='D'?'direito':'esquerdo';root.innerHTML=appShell(`<header class="player-head compact"><div><span class="eyebrow">PERFIL</span><h2>${esc(p.name)}</h2><p>${esc(getPositionLabel(p))} · pé ${foot} · ${p.heightCm.toFixed(1)} cm · ${p.weightKg.toFixed(1)} kg</p></div><div class="ovr"><b>${overallVisible(p)}</b><span>OVR</span></div></header><div class="quote">“${esc(coachPositionFeedback(p))}”<span>leitura atual do treinador</span></div><h3 class="section-title">Experiência por posição</h3>${positionGrid()}<div class="detail-card"><div><span>Origem</span><b>${esc(p.hometown)}</b></div><div><span>Família</span><b>${esc(p.life?.family.parents.join(' e ')??'Em descoberta')}</b></div><div><span>Estudos</span><b>${p.life?.education.completed?'Escola concluída':p.age<=18?'Em formação':'Escola incompleta'}</b></div><div><span>Função</span><b>${p.tactical?.role==='HOLD'?'Mais fixa':p.tactical?.role==='MOBILE'?'Mais móvel':'Equilibrada'}</b></div></div><h3 class="section-title">Características descobertas</h3><p class="attribute-reference">Escala de habilidade adulta · 0–99. Na formação, você compete com jogadores da sua idade; estes valores não são seu potencial.</p><div class="attr-grid">${attrRow('technique','Técnica')}${attrRow('passing','Passe')}${attrRow('finishing','Finalização')}${attrRow('dribbling','Drible')}${attrRow('vision','Visão')}${attrRow('decisions','Decisão')}${attrRow('pace','Velocidade')}${attrRow('stamina','Resistência')}${attrRow('strength','Força')}${attrRow('positioning','Posicionamento')}${attrRow('tackling','Desarme')}${attrRow('crossing','Cruzamento')}${attrRow('heading','Cabeceio')}${attrRow('reflexes','Reflexos')}${attrRow('handling','Mãos')}${attrRow('aerial','Jogo aéreo')}</div><div class="detail-card"><div><span>Clube</span><b>${c?.name??'Escolinha'}</b></div><div><span>Clube do coração</span><b>${getClub(p.heartClubId)?.name??'—'}</b></div><div><span>Valor</span><b>${money(p.marketValue)}</b></div><div><span>Contrato</span><b>${p.contractYearsLeft?p.contractYearsLeft+' ano'+(p.contractYearsLeft>1?'s':''):'—'}</b></div></div>`);bind();}

function barChart(rows:{label:string,value:number,display:string}[]){const max=Math.max(1,...rows.map(r=>r.value));return `<div class="bars">${rows.map(r=>`<div class="bar-row"><span>${esc(r.label)}</span><div class="bar-track"><i style="width:${Math.max(2,r.value/max*100).toFixed(1)}%"></i></div><b>${esc(r.display)}</b></div>`).join('')}</div>`;}
function renderStats(){const p=save!.player,s=p.careerStats;const seasons=p.seasonHistory.slice(0,8).reverse();const chart=barChart(seasons.map(x=>({label:String(x.season).slice(-2),value:x.categories?.SENIOR?(x.categories.SENIOR.goals+x.categories.SENIOR.assists):0,display:String(x.categories?.SENIOR?(x.categories.SENIOR.goals+x.categories.SENIOR.assists):0)})));root.innerHTML=appShell(`<section class="stat-hero"><span class="eyebrow">CARREIRA PROFISSIONAL · BASE CONTADA À PARTE</span><div class="career-total">${s.goals}<small>gols</small></div><p>${s.appearances} jogos · ${s.assists} assistências · ${s.motm}× melhor em campo</p></section><div class="grid six"><div class="metric"><b>${s.goals}</b><span>GOLS</span></div><div class="metric"><b>${s.assists}</b><span>ASSIST.</span></div><div class="metric"><b>${s.motm}</b><span>Destaques</span></div><div class="metric"><b>${s.reds}</b><span>Vermelhos</span></div><div class="metric"><b>${s.titles.length}</b><span>TÍTULOS</span></div><div class="metric"><b>${s.cleanSheets}</b><span>Sem sofrer gols</span></div></div>${biographyCard()}<h3 class="section-title">Produção profissional G+A por temporada</h3><div class="chart-card">${seasons.length?chart:'<div class="empty">Ainda não há temporadas profissionais concluídas.</div>'}</div><h3 class="section-title">Temporadas</h3>${p.seasonHistory.map(x=>`<article class="season-card"><div><span>${x.season}</span><b>${x.age} anos</b></div><h3>${getClub(x.clubId)?.shortName??'Formação'}</h3><div class="season-position">${esc(seasonPosition(x))}</div>${seasonCategoryRows(x)}<p>Total da temporada: ${x.appearances}J · ${x.goals}G · ${x.assists}A · ${x.motm} destaque(s)${x.avgRating?` · ${x.avgRating.toFixed(2)}`:''}${x.titles.length?` · 🏆 ${x.titles.join(', ')}`:''}</p><small>${money(x.marketValueStart)} → ${money(x.marketValueEnd)}</small></article>`).join('')||'<div class="empty">A primeira temporada ainda está em andamento.</div>'}`);bind();}

function relationLabel(r:{passion:number;hate:number;fear:number;respect:number}){const vals:[string,number][]=[['Paixão',r.passion],['Ódio',r.hate],['Temor',r.fear],['Respeito',r.respect]];return vals.sort((a,b)=>b[1]-a[1])[0]!;}
function intentButtons(){const p=save!.player;const intents:TransferIntent[]=['STAY','OPEN','LEAVE','FORCE'];return `<div class="intent-grid">${intents.map(i=>`<button class="intent ${p.transferIntent===i?'active':''}" data-intent="${i}" aria-pressed="${p.transferIntent===i}">${transferIntentLabel(i)}</button>`).join('')}</div>`;}
function renderWorld(){const p=save!.player;const rel=Object.values(p.fanRelations).filter(x=>Math.max(x.passion,x.hate,x.fear,x.respect)>1).sort((a,b)=>Math.max(b.passion,b.hate,b.fear,b.respect)-Math.max(a.passion,a.hate,a.fear,a.respect)).slice(0,8);root.innerHTML=appShell(`<section class="world-head"><span class="eyebrow">MUNDO</span><h2>Brasil · 156 clubes</h2><p>Seu nome começa a significar coisas diferentes em cada estádio.</p></section>${currentCoachCard()}${save!.player.currentClubId&&p.coaching?`<h3 class="section-title">Campanha do clube</h3><div class="league-table">${standings(p,p.currentClubId!).map((c,i)=>`<div class="league-row ${c.clubId===p.currentClubId?'current':''}"><span>${i+1}</span><b>${esc(getClub(c.clubId)!.shortName)}</b><span>${c.games}J</span><strong>${c.points} pts</strong></div>`).join('')}</div>`:''}<h3 class="section-title">Minha posição no mercado</h3>${intentButtons()}<h3 class="section-title">Torcidas</h3><div class="relation-list">${rel.length?rel.map(r=>{const [label,v]=relationLabel(r);return `<div class="relation"><div><b>${getClub(r.clubId)?.name??r.clubId}</b><span>${label}</span></div><strong>${Math.round(v)}</strong></div>`}).join(''):'<div class="empty">Ainda é cedo para o futebol ter uma opinião forte sobre você.</div>'}</div><h3 class="section-title">Transferências</h3>${p.transferHistory.length?p.transferHistory.map(t=>`<div class="transfer"><span>${t.season}</span><b>${getClub(t.fromClubId)?.shortName??'Formação'} → ${getClub(t.toClubId)?.shortName}</b><strong>${money(t.fee)}</strong></div>`).join(''):'<div class="empty small">Nenhuma transferência profissional.</div>'}${coachDatabase()}<details class="settings"><summary>Configurações e dados</summary><button class="action" id="export">Exportar diagnóstico completo</button><button class="action danger" id="reset" type="button">Recomeçar carreira</button></details>`);bind();}

function render(){if(getPersistenceStatus().kind==='corrupt'&&!save)return renderRecovery();if(!save)return renderCreate();if(tab==='player')return renderPlayer();if(tab==='stats')return renderStats();if(tab==='world')return renderWorld();renderCareer();}
function bind(){
  document.querySelector('#recover-raw')?.addEventListener('click',downloadRecovery);
  document.querySelector('#retry-load')?.addEventListener('click',()=>{save=loadSave();render();});
  document.querySelector('#retry-save')?.addEventListener('click',()=>{if(save)storeSave(save);else save=loadSave();render();});
  document.querySelector('#backup-save')?.addEventListener('click',()=>save&&exportDiagnostic(save));
  document.querySelector<HTMLInputElement>('#coach-search')?.addEventListener('input',e=>{document.querySelector('#coach-results')!.innerHTML=coachRows((e.target as HTMLInputElement).value);});
  document.querySelectorAll<HTMLElement>('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab!;render();window.scrollTo({top:0,behavior:'instant'});});
  document.querySelector('#birth-city')?.addEventListener('input',()=>{const city=document.querySelector<HTMLInputElement>('#birth-city')!.value.trim();const local=birthCities.find(c=>c.city.localeCompare(city,'pt-BR',{sensitivity:'base'})===0);if(local)document.querySelector<HTMLSelectElement>('#birth-state')!.value=local.state;});
  document.querySelector('#career-form')?.addEventListener('submit',e=>{e.preventDefault();const city=document.querySelector<HTMLInputElement>('#birth-city')!;const state=document.querySelector<HTMLSelectElement>('#birth-state')!;const club=document.querySelector<HTMLSelectElement>('#heart-club')!;city.value=city.value.trim();if(!city.reportValidity()||!state.reportValidity()||!club.reportValidity())return;const n=document.querySelector<HTMLInputElement>('#name')!.value.trim()||'Jogador';const local=birthCities.find(c=>c.state===state.value&&c.city.localeCompare(city.value,'pt-BR',{sensitivity:'base'})===0);save=createCareer(n,club.value,local?.city??city.value,state.value);storeSave(save);render();focusEvent();});
  document.querySelector('#advance')?.addEventListener('click',()=>{if(!save)return;save=advanceCareer(save);storeSave(save);render();focusEvent();});
  document.querySelectorAll<HTMLElement>('[data-choice]').forEach(b=>b.onclick=()=>{if(!save)return;save=resolveChoice(save,b.dataset.choice!);storeSave(save);save=advanceCareer(save);storeSave(save);render();focusEvent();});
  document.querySelectorAll<HTMLElement>('[data-intent]').forEach(b=>b.onclick=()=>{if(!save)return;save=setTransferIntent(save,b.dataset.intent as TransferIntent);storeSave(save);render();});
  document.querySelector('#export')?.addEventListener('click',()=>save&&exportDiagnostic(save));
  document.querySelector('#reset')?.addEventListener('click',()=>{if(confirm('Recomeçar carreira? A carreira atual e seu histórico salvo neste navegador serão apagados. Você voltará à criação de um jogador de 12 anos. Esta ação não pode ser desfeita.')){if(!clearSave()){render();return;}save=null;tab='career';render();window.scrollTo(0,0);}});
}
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
