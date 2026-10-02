// Public synthetic calibration monitor. Does not read saves or change game rules.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const args=process.argv.slice(2),arg=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1];};
const engineFile=path.resolve(arg('--engine','prototypes/dez-clubes-v2/engine.mjs'));
const outputDir=path.resolve(arg('--output-dir','work/balance-tracking'));
const baselineFile=path.resolve(arg('--baseline','docs/balance/prototype05.json'));
const {createGame,choose,overall,validGame,POSITIONS}=await import(pathToFileURL(engineFile));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const clone=g=>structuredClone(g),keys=['finishing','passing','reading','pace','defending','goalkeeping'];
const seeds=Array.from({length:32},(_,i)=>(Math.imul(i+1,2654435761)+17)>>>0);
const round=n=>Number(n.toFixed(3));
function distribution(values){const v=[...values].sort((a,b)=>a-b),p=q=>v[Math.ceil(q*v.length)-1];return {n:v.length,min:round(v[0]),mean:round(v.reduce((s,x)=>s+x,0)/v.length),p50:round(p(.5)),p95:round(p(.95)),max:round(v.at(-1))};}

// Design references, not biological norms or in-engine caps. 15 is an alarm probe;
// the current prototype has no natural state at that age.
const references={12:{p95:25,max:30},14:{p95:42,max:50},15:{p95:50,max:60},16:{p95:55,max:65},18:{p95:62,max:70}};
function blockedSkills(age,skills){return age<18?keys.filter(k=>skills[k]>=80):[];}
assert.deepEqual(blockedSkills(15,{finishing:80}),['finishing']);
assert.deepEqual(blockedSkills(15,{finishing:79}),[]);
assert.deepEqual(blockedSkills(25,{finishing:95}),[]);

const buckets=new Map(),violations=[],warnings=[];
let youthBranches=0,adultCareers=0,adultPeriods=0,negativePeriods=0,primaryLosses=0;
const primary={GK:'goalkeeping',CB:'defending',FB:'passing',DM:'reading',CM:'passing',AM:'passing',WG:'finishing',ST:'finishing'};
function sample(g,checkpoint,policy){
 assert(validGame(g),'invalid generated '+g.position+' '+g.event.kind);
 const key=[g.age,checkpoint,g.position,policy].join('|');
 if(!buckets.has(key))buckets.set(key,{age:g.age,checkpoint,position:g.position,policy,values:[]});
 const last=g.progression.at(-1);
 buckets.get(key).values.push({overall:overall(g),...g.skills,condition:g.condition,fatigue:g.fatigue,pressure:g.pressure,
  overallGain:last?last.afterOverall-last.beforeOverall:0,primaryGain:last?.skillChanges[primary[g.position]]??0});
 const bad=blockedSkills(g.age,g.skills);
 if(bad.length)violations.push({age:g.age,checkpoint,position:g.position,policy,seed:g.seed,skills:Object.fromEntries(bad.map(k=>[k,round(g.skills[k])]))});
}
function step(g,c){assert(c,'missing choice '+g.event.kind);assert(choose(g,c.id),'rejected choice '+c.id);}
function youth(g){
 sample(g,g.phase==='FORMATION'?'formation':'entry','ALL_FORMATION_PATHS');
 if(g.phase!=='FORMATION'){youthBranches++;return;}
 for(const c of g.event.choices){const next=clone(g);step(next,c);youth(next);}
}
for(const {id} of POSITIONS)for(const seed of seeds)youth(createGame('Public balance probe',id,seed));

const focus={GK:'SAFE',CB:'HOLD',FB:'BUILD',DM:'HOLD',CM:'CREATE',AM:'CREATE',WG:'ATTACK',ST:'ATTACK'};
const overload={GK:'SWEEP',CB:'ADVANCE',FB:'ADVANCE',DM:'ADVANCE',CM:'ATTACK',AM:'ATTACK',WG:'ATTACK',ST:'PRESS'};
const find=(g,id)=>g.event.choices.find(c=>c.id.split('@')[0]===id);
for(const {id} of POSITIONS)for(const seed of seeds.slice(0,16))for(const policy of ['FOCUSED','OVERLOAD']){
 const g=createGame('Public adult probe',id,seed);
 let steps=0;
 while(g.phase!=='DONE'){
  let c;const kind=g.event.kind,previous=g.playedMatches.length;
  if(kind==='FORMATION')c=g.event.choices[g.formation%3];
  else if(kind==='ENTRY')c=g.event.choices[0];
  else if(kind==='RIVALRY')c=find(g,policy==='FOCUSED'?'rival:earn':'rival:challenge');
  else if(kind==='PLAN')c=find(g,'intent:'+(policy==='FOCUSED'?focus:overload)[id]);
  else if(kind==='RECOVERY')c=find(g,policy==='FOCUSED'?'recovery:READ':'recovery:EXTRA');
  else if(kind==='DECISIVE')c=find(g,policy==='FOCUSED'?'decisive:safe':'decisive:risk');
  else c=find(g,'market:stay');
  step(g,c);assert(++steps<80,'career did not terminate');
  if(g.playedMatches.length!==previous){
   sample(g,`season${g.season}:period${g.period}`,policy);adultPeriods++;
   const delta=g.progression.at(-1).skillChanges;
   negativePeriods+=keys.some(k=>delta[k]<0)?1:0;
   primaryLosses+=delta[primary[id]]<0?1:0;
  }
 }
 assert.equal(g.playedMatches.length,54);adultCareers++;
}

const groups=[...buckets.values()].map(({values,...meta})=>({...meta,metrics:Object.fromEntries(['overall',...keys,'condition','fatigue','pressure','overallGain','primaryGain'].map(k=>[k,distribution(values.map(v=>v[k]))]))}));
for(const g of groups.filter(g=>g.policy==='ALL_FORMATION_PATHS')){
 const ref=references[g.age];if(!ref){warnings.push({reason:'Missing age reference',age:g.age});continue;}
 for(const k of keys){const d=g.metrics[k];if(d.p95>ref.p95||d.max>ref.max)warnings.push({reason:'Youth reference exceeded',age:g.age,position:g.position,skill:k,p95:d.p95,max:d.max,reference:ref});}
}
const previous=fs.existsSync(baselineFile)?JSON.parse(fs.readFileSync(baselineFile)):null;
if(previous){
 assert.equal(previous.monitorVersion,1,'incompatible baseline');assert.deepEqual(previous.seeds,seeds,'different seed set');
 assert.equal(previous.groups.length,groups.length,'different cohort structure');
 for(const g of groups){const before=previous.groups.find(x=>['age','checkpoint','position','policy'].every(k=>x[k]===g[k]));assert(before,'missing comparable cohort');
  for(const k of ['overall',...keys,'overallGain','primaryGain']){assert(before.metrics[k],'missing baseline metric '+k);const delta=round(g.metrics[k].p95-before.metrics[k].p95);if(Math.abs(delta)>5)warnings.push({reason:'P95 drift over 5 points',age:g.age,checkpoint:g.checkpoint,position:g.position,policy:g.policy,skill:k,delta});}
 }
}
const report={monitorVersion:1,scope:'prototype-dez-clubes-v2; new synthetic careers only',engineSha256:hash(engineFile),catalogSha256:hash(path.join(path.dirname(engineFile),'clubs.mjs')),seeds,
 sampling:{youthSeeds:32,formationPathsPerSeedPosition:27,positions:8,youthBranches,adultSeeds:16,adultPolicies:['FOCUSED','OVERLOAD'],adultCareers,adultPeriods},
 ageCoverage:{formation:[...new Set(groups.filter(g=>g.policy==='ALL_FORMATION_PATHS').map(g=>g.age))].sort((a,b)=>a-b),age15:'Not simulated by this prototype; alarm tested with an explicit synthetic 15/80 probe; no interpolated data'},
 timeBasis:{formation:{yearsPerAdvance:2,label:'Accumulated development over two years'},adult:{matchesPerAdvance:6,label:'Accumulated development over six matches'},skillUnit:'Points on the adult scale, not percentage growth or one-session gains'},
 references,regression:{negativePeriods,primaryLosses},baselineEngineSha256:previous?.engineSha256??null,status:violations.length?'BLOCKED':warnings.length?'REVIEW':'PASS',violations,warnings,groups};
fs.mkdirSync(outputDir,{recursive:true});fs.writeFileSync(path.join(outputDir,'report.json'),JSON.stringify(report,null,2)+'\n');
const youthRows=groups.filter(g=>g.policy==='ALL_FORMATION_PATHS'&&g.position==='ST').sort((a,b)=>a.age-b.age);
const md=`# 1903 — acompanhamento do equilíbrio\n\nResultado: **${report.status}**. Motor: \`${report.engineSha256}\`.\n\n## Formação — atacante\n\n| Idade observada | Configurações | Finalização P50 | P95 | Máximo | OVR P95 |\n|---|---:|---:|---:|---:|---:|\n${youthRows.map(g=>`| ${g.age} | ${g.metrics.finishing.n} | ${g.metrics.finishing.p50} | ${g.metrics.finishing.p95} | ${g.metrics.finishing.max} | ${g.metrics.overall.p95} |`).join('\n')}\n\nA escala é adulta. Configurações compartilham DNA/seeds e percorrem todas as combinações de formação; não são taxas de jogadores reais. JSON inclui as seis skills por idade, posição e política, carga, crescimento e referência comparável. Aos 15 não há observação natural: o recorte salta de 14 para 16. O alarme específico 15/80 foi exercitado, sem inventar números para essa idade.\n\n## Unidade de tempo\n\nOs deltas de formação acumulam dois anos (12→14, 14→16, 16→18). Cada delta adulto acumula seis partidas. primaryGain e overallGain no JSON são pontos por avanço nesses intervalos; não ganhos por sessão nem percentuais.\n\n## Alarmes\n\n- Skills ≥80 antes dos 18: ${violations.length} estados bloqueados.\n- Referências ou diferenças de P95 que exigem revisão: ${warnings.length}.\n- Carreiras adultas: ${adultCareers}, ${adultPeriods} períodos; ${negativePeriods} com perda de alguma skill, ${primaryLosses} com perda da skill principal.\n\nLimiares são metas de design, não limites programados de habilidade nem parâmetros científicos. BLOCKED bloqueia aprovação do balanceamento; REVIEW exige causa e decisão registradas. PASS não certifica diversão ou calibração real. Saves legados ficam fora da amostra e não são reescritos.\n`;
fs.writeFileSync(path.join(outputDir,'report.md'),md);
if(args.includes('--record-baseline')){assert.equal(report.status,'PASS','cannot approve a flagged baseline');fs.writeFileSync(baselineFile,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({status:report.status,engineSha256:report.engineSha256,ageCoverage:report.ageCoverage,formationST:youthRows.map(g=>({age:g.age,finishing:g.metrics.finishing})),adultCareers,adultPeriods,negativePeriods,primaryLosses,violations:violations.length,warnings:warnings.length,report:path.join(outputDir,'report.md')}));
process.exitCode=violations.length?1:warnings.length?2:0;
