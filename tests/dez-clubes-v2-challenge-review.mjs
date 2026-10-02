import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

// Independent public scenarios. Never consume private uploaded career data.
const url=process.env.ENGINE_FILE?pathToFileURL(process.env.ENGINE_FILE):new URL('../prototypes/dez-clubes-v2/engine.mjs',import.meta.url);
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(url)).digest('hex');
const startHash=hash(),E=await import(url);
const clone=x=>JSON.parse(JSON.stringify(x));
const groups=[],metrics={};
function check(name,fn){try{fn();groups.push({name,pass:true});console.log('PASS',name);}catch(e){groups.push({name,pass:false,error:e.stack});console.error('FAIL',name,e.stack);}}
const key=c=>c.id.split('@')[0];
function policy(g,{branch=0,tier='D',move=false}={}){
 const cs=g.event.choices,k=g.event.kind;
 if(k==='FORMATION')return cs[0];
 if(k==='ENTRY')return cs.find(c=>c.profile.division===tier)??cs.at(-1);
 if(k==='PLAN')return cs[branch%cs.length];
 if(k==='ROUTINE')return cs.find(c=>key(c)==='routine:REST');
 if(k==='RIVALRY')return cs.find(c=>key(c)==='rival:earn');
 if(k==='RECOVERY')return cs.find(c=>key(c)==='recovery:READ');
 if(k==='DECISIVE')return cs.find(c=>key(c)==='decisive:safe');
 return move&&['INTEREST','CONTACT','OFFER'].includes(k)?cs[0]:cs.find(c=>key(c)==='market:stay')??cs[0];
}
function step(g,opts={}){
 assert(E.validGame(g),`${g.position}/${g.event.kind} before`);
 const selected=policy(g,opts),loaded=clone(g),raw=JSON.stringify(g);
 assert(selected);assert.equal(E.choose(g,'forged@'+g.serial),false);assert.equal(JSON.stringify(g),raw);
 assert(E.choose(g,selected.id),`${g.event.kind}/${selected.id}`);
 assert(E.choose(loaded,selected.id));assert.deepEqual(g,loaded,'JSON reload changed future');
 assert(E.validGame(g),`${g.position}/${g.event.kind} after`);
 const after=JSON.stringify(g);assert.equal(E.choose(g,selected.id),false);assert.equal(JSON.stringify(g),after);
 return selected;
}
function firstPlan(position,seed,tier='D'){
 const g=E.createGame('Revisão pública 08',position,seed);
 for(let n=0;g.event.kind!=='PLAN';n++){assert(n<10);step(g,{tier});}
 return g;
}
function sum(ms){return ms.reduce((s,m)=>{if(m.minutes){s.apps++;s.starts+=+m.started;s.minutes+=m.minutes;s.goals+=m.goals;s.assists+=m.assists;s.ratingSum+=m.rating;}return s;},{apps:0,starts:0,minutes:0,goals:0,assists:0,ratingSum:0});}
function bounded(o){
 assert(o&&o.target&&o.progress);const t=o.target;
 for(const v of Object.values(t))assert(Number.isFinite(v)&&Number.isInteger(v)&&v>=0);
 assert(t.apps<=6&&t.minutes<=540&&t.good<=6,'target exceeds six physical matches');
 assert(t.good<=t.apps,'good appearances exceed participation goal');
 assert(t.output<=150,'unbounded action target');
}

check('three combined choices change actual football and well-being rather than labels',()=>{
 const rows=[];let footballDifferences=0;
 for(const {id:position}of E.POSITIONS)for(let seed=1;seed<=8;seed++){
  const base=firstPlan(position,seed),results=[];
  assert.equal(base.challengeRevision,1);assert.equal(base.event.choices.length,3);
  assert.equal(new Set(base.event.choices.map(c=>c.action.routine)).size,3);
  for(const c of base.event.choices){
   assert(c.action&&c.action.revision===1);bounded(c.action.objective);
   const x=clone(base),before=clone(x.playedMatches),dna=clone(x.dna);
   assert(E.choose(x,c.id));assert.equal(x.playedMatches.length-before.length,6);
   assert.deepEqual(x.playedMatches.slice(0,before.length),before);assert.deepEqual(x.dna,dna);
   assert.equal(x.objectiveHistory.length,1);assert.equal(x.objectiveHistory[0].intent,c.action.intent);
   results.push({stats:sum(x.lastMatches),skills:x.skills,happiness:x.happiness,stress:x.mentalStress,fatigue:x.fatigue});
  }
  assert.equal(new Set(results.map(x=>JSON.stringify({skills:x.skills,happiness:x.happiness,stress:x.stress,fatigue:x.fatigue}))).size,3,'choice has no material managed cost');
  footballDifferences+=new Set(results.map(x=>JSON.stringify(x.stats))).size>1;
  rows.push({position,seed});
 }
 assert(footballDifferences>=rows.length*.75,'football action alternatives mostly inert');
 metrics.branches={states:rows.length,branches:rows.length*3,footballDifferences};
});

check('96 careers cover eight positions, JSON continuation, totals and contextual variation',()=>{
 const rows=[],stages=new Set(),situations=new Set(),targets=new Set(),detached=new Set(),roleCalibration={};let misses=0,hits=0,marketSilence=0,transfer=0;
 for(const {id:position}of E.POSITIONS)for(let seed=1;seed<=4;seed++)for(let branch=0;branch<3;branch++){
  const g=E.createGame('Carreira pública 08',position,seed),kinds=[];let n=0,plans=0;
  while(g.phase!=='DONE'){
   kinds.push(g.event.kind);
   if(g.event.kind==='PLAN'){
    plans++;for(const c of g.event.choices){bounded(c.action.objective);stages.add(c.action.objective.stage);situations.add(c.action.situation);targets.add(JSON.stringify(c.action.objective.target));}
   }
   if(g.event.kind==='INTEREST')marketSilence+=!g.market.length;
   step(g,{branch,tier:['D','C','B'][branch],move:seed%2===0});assert(++n<100,'compressed cycle stalled');
  }
  assert.equal(g.age,25);assert.equal(g.playedMatches.length,126);assert.equal(g.yearStats.length,7);assert.equal(g.objectiveHistory.length,21);assert.equal(plans,21);
  for(const k of kinds)if(['ROUTINE','RIVALRY','RECOVERY','DECISIVE'].includes(k))detached.add(k);
  assert.deepEqual(g.totalstats,sum(g.playedMatches));
  for(const y of g.yearStats){const ms=g.playedMatches.filter(m=>m.season===y.season);assert.equal(ms.length,18);assert.deepEqual(Object.fromEntries(Object.keys(g.totalstats).map(k=>[k,y[k]])),sum(ms));}
  const replay=E.createGame(g.name,g.position,g.seed);for(const c of g.choicesLog)assert(E.choose(replay,c.id));assert.deepEqual(replay,g);
  hits+=g.objectiveHistory.filter(o=>o.status==='MET').length;misses+=g.objectiveHistory.filter(o=>o.status==='MISSED').length;transfer+=g.history.length-1;
  for(const o of g.objectiveHistory){const id=position+'/'+o.intent,r=roleCalibration[id]??={blocks:0,actual:0,expectedAtActualMinutes:0,met:0,insufficientMinutes:0,insufficientOutput:0,insufficientGood:0};r.blocks++;r.actual+=o.progress.output;r.expectedAtActualMinutes+=o.benchmark.rate*o.progress.minutes/90;r.met+=o.status==='MET';r.insufficientMinutes+=o.progress.minutes<o.target.minutes;r.insufficientOutput+=o.progress.output<o.target.output;r.insufficientGood+=o.progress.good<o.target.good;roleCalibration[id]=r;}
  rows.push({position,seed,branch,ovr:E.overall(g),met:g.objectiveHistory.filter(o=>o.status==='MET').length,targets:g.objectiveHistory.map(o=>o.target)});
 }
 assert(hits>0&&misses>0,'all objectives automatically pass or fail');assert(targets.size>=12,'objectives remain essentially fixed');assert(stages.size>=3,'observed role does not alter goal stage');
 for(const r of Object.values(roleCalibration))r.actualVsExpected=r.actual/Math.max(1,r.expectedAtActualMinutes);
 metrics.careers={count:rows.length,fixtures:rows.length*126,stages:[...stages],situations:[...situations],distinctTargets:targets.size,hits,misses,marketSilence,transfer,detached:[...detached],roleCalibration,rows};
 assert.equal(detached.size,0,'new cycle still queues detached routine steps: '+[...detached]);
});

check('forged moment payloads and objectives reject atomically',()=>{
 const base=firstPlan('AM',17),bad=[
  g=>g.challengeRevision=2,g=>g.challengeRevision='1',g=>g.event.choices[0].action.revision=2,
  g=>g.event.choices[0].action.routine='FREE',g=>g.event.choices[0].action.intent='SAFE',
  g=>g.event.choices[0].action.objective.target.minutes=541,
  g=>g.event.choices[0].action.objective.target.good=7,
  g=>g.event.choices[0].action.objective.clubId='unknown',
  g=>g.event.choices[0].action.objective.period=3,
  g=>g.event.choices[0].action.objective.progress.minutes=1,
  g=>g.event.choices[0].action.objective.status='MET',
  g=>delete g.event.choices[0].action,g=>g.event.choices[0].id='moment:3@'+g.serial,
  g=>g.event.choices[0].action.objective.target.output=0,
 ];
 for(const mutate of bad){const g=clone(base);mutate(g);const raw=JSON.stringify(g);assert.equal(E.validGame(g),false,'forgery accepted');assert.equal(E.choose(g,g.event.choices[0].id),false);assert.equal(JSON.stringify(g),raw);}
 metrics.atomic={rejected:bad.length};
});

check('bench forecasts reduce required minutes and quality rather than demand starter proof',()=>{
 const rows=[];
 for(const position of ['GK','ST','AM']){
  const base=firstPlan(position,7,'B'),intent=base.event.choices[0].action.intent,values=[];
  for(const [label,skill,trust,rival]of [['bench',30,25,90],['ready',95,95,55]]){
   const g=clone(base);for(const k of Object.keys(g.skills))g.skills[k]=skill;
   g.proficiency=80;g.trust=trust;g.condition=100;g.fatigue=0;g.happiness=85;g.mentalStress=0;g.pressure=30;g.rival.quality=rival;
   const raw=JSON.stringify(g),p=E.participation(g,g.clubId,rival,g.rival.form??6.7,g.clubProject.recruitment??'READY'),t=E.projectTarget(g,intent);
   assert.equal(JSON.stringify(g),raw,'read-only forecast changed state');bounded({target:t,progress:{}});
   assert(t.minutes<=Math.max(10,Math.ceil(p.mean*6)+15),'target exceeds forecast opportunity');
   if(label==='bench')assert.equal(t.good,0,'bench judged on full-start good performances');
   values.push({label,chance:p.starterChance,meanMinutes:p.mean,target:t});
  }
  assert(values[0].target.minutes<values[1].target.minutes);assert(values[0].target.apps<=values[1].target.apps);rows.push({position,values});
 }
 metrics.bench=rows;
 const recovery=[];
 for(const {id:position}of E.POSITIONS)for(let seed=1;seed<=8;seed++){
  const g=E.createGame('Recuperação física pública',position,seed,{challenge:false});
  while(g.event.kind!=='PLAN')assert(E.choose(g,policy(g,{tier:'C'}).id));
  for(const k of Object.keys(g.skills))g.skills[k]=95;
  g.proficiency=95;g.trust=95;g.confidence=85;g.condition=64;g.fatigue=75;g.happiness=85;g.mentalStress=10;
  delete g.challengeRevision;
  const gentle=position==='ST'?'LINK':position==='GK'?'SAFE':['CB','FB','DM'].includes(position)?'HOLD':'CONTROL';
  const old=g.event.choices.find(c=>key(c)==='intent:'+gentle);assert(old);assert(E.validGame(g));assert(E.choose(g,old.id));
  assert.equal(g.event.kind,'PLAN');assert.equal(g.event.choices[0].action.situation,'FATIGUE');
  const before={condition:g.condition,fatigue:g.fatigue,played:g.playedMatches.length},rest=g.event.choices.find(c=>c.action.routine==='REST');
  assert(rest);assert.equal(rest.action.intent,gentle,'physical rest paired with needless extra effort');
  assert(E.choose(g,rest.id));assert(E.validGame(g));assert.equal(g.playedMatches.length,before.played+6);
  assert(g.condition>before.condition,'rest did not recover physical condition');assert(g.fatigue<before.fatigue,'rest did not recover fatigue');
  let blocks=1;
  if(g.condition<70||g.fatigue>=38){assert.equal(g.event.kind,'PLAN');const again=g.event.choices.find(c=>c.action.routine==='REST');assert(again);assert.equal(again.action.intent,gentle);assert(E.choose(g,again.id));assert(E.validGame(g));blocks++;}
  assert.equal(g.playedMatches.length,before.played+blocks*6);
  assert(g.condition>=70&&g.fatigue<38,'two gentle periods could not escape fatigue without offseason recovery');
  assert.notEqual(g.event.choices[0]?.action?.situation,'FATIGUE');recovery.push({position,seed,blocks,before,after:{condition:g.condition,fatigue:g.fatigue}});
 }
 metrics.physicalRecovery={trials:recovery.length,rows:recovery};
});

check('paired control and contextual cohorts report challenge without imposing a success-rate target',()=>{
 const rows=[];
 const primary=p=>p==='GK'?'SAFE':['CB','FB','DM'].includes(p)?'HOLD':p==='ST'?'ATTACK':'CREATE';
 for(const strategy of ['fixedTRAIN','managed'])for(const {id:position}of E.POSITIONS)for(const seed of [11,29,53,97]){
  const pair=[];
  for(const challenge of [false,true]){
   const g=E.createGame('Coorte pareada pública',position,seed,{challenge}),situationCounts={};let peakFatigue=0,peakStress=0,n=0;
   while(g.phase!=='DONE'){
    let c=policy(g,{tier:'C'});
    const desired=strategy==='fixedTRAIN'?'TRAIN':g.happiness<60||g.mentalStress>40?'LIFE':g.condition>=75&&g.fatigue<=30&&g.mentalStress<=25?'TRAIN':'REST';
    if(g.event.kind==='ROUTINE')c=g.event.choices.find(c=>key(c)==='routine:'+desired);
    if(g.event.kind==='PLAN'){
     if(challenge){
      const practice={TRAIN:1.28,WORK:.86,REST:.5,LIFE:.58},distance=c=>Math.abs(practice[c.action.routine]-practice[desired]);
      c=[...g.event.choices].sort((a,b)=>distance(a)-distance(b)||(a.action.intent===primary(position)?0:1)-(b.action.intent===primary(position)?0:1))[0];
      situationCounts[c.action.situation]=(situationCounts[c.action.situation]??0)+1;
     }else c=g.event.choices.find(c=>key(c)==='intent:'+primary(position));
    }
    assert(c);assert(E.choose(g,c.id));assert(E.validGame(g));assert(++n<180);
    peakFatigue=Math.max(peakFatigue,g.fatigue,...g.lastMatches.map(m=>m.fatigue??0));peakStress=Math.max(peakStress,g.mentalStress);
   }
   const late=g.objectiveHistory.filter(o=>o.season>=20),met=g.objectiveHistory.filter(o=>o.status==='MET').length;
   pair.push({mode:challenge?'contextual08':'control0',decisions:g.decisions,entry:g.history[0].clubId,situationCounts,met,totalObjectives:g.objectiveHistory.length,metRate:met/g.objectiveHistory.length,lateMet:late.filter(o=>o.status==='MET').length,lateObjectives:late.length,lateMetRate:late.filter(o=>o.status==='MET').length/late.length,goals:g.totalstats.goals,minutes:g.totalstats.minutes,ovr:E.overall(g),peakFatigue,peakStress});
  }
  assert.equal(pair[0].entry,pair[1].entry);assert(pair[1].decisions<pair[0].decisions,'compression did not reduce decisions');rows.push({strategy,position,seed,pair});
 }
 const summary=(strategy,mode)=>{const rs=rows.filter(r=>r.strategy===strategy).map(r=>r.pair.find(x=>x.mode===mode)),mean=k=>rs.reduce((n,r)=>n+r[k],0)/rs.length;return {count:rs.length,decisions:mean('decisions'),metRate:mean('metRate'),lateMetRate:mean('lateMetRate'),goals:mean('goals'),minutes:mean('minutes'),ovr:mean('ovr'),peakFatigue:mean('peakFatigue'),peakStress:mean('peakStress')};};
 metrics.paired={policy:'same position/seed/technique formation/C entry/stay; fixed TRAIN and managed (LIFE if happiness<60 or stress>40; TRAIN if condition>=75/fatigue<=30/stress<=25; REST otherwise). Seek desired routine or smallest practice multiplier distance; primary intent breaks equal distances. Contextual bundles differ, so this is a gameplay comparison rather than isolated causal effect.',control:summary('fixedTRAIN','control0'),contextual:summary('fixedTRAIN','contextual08'),managed:{control:summary('managed','control0'),contextual:summary('managed','contextual08')},rows};
});

check('zero-minute goalkeeper periods cannot add a crisis for unobserved performance',()=>{
 let zeroPeriods=0,limitedPeriods=0;
 for(let seed=1;seed<=32;seed++){
  const g=E.createGame('Banco público controlado','GK',seed,{challenge:false});
  while(g.event.kind!=='RIVALRY')assert(E.choose(g,policy(g,{tier:'B'}).id));
  for(const k of Object.keys(g.skills))g.skills[k]=30;
  g.proficiency=80;g.trust=25;g.rival.quality=90;g.condition=100;g.fatigue=0;g.happiness=85;g.mentalStress=0;g.pressure=30;g.challengeRevision=1;
  assert(E.validGame(g));assert(E.choose(g,policy(g).id));
  const selected=g.event.choices.find(c=>['REST','WORK'].includes(c.action.routine));assert(selected);assert(E.choose(g,selected.id));
  const o=g.objectiveHistory.at(-1);
  if(o.progress.minutes<o.target.minutes){limitedPeriods++;assert.equal(g.projectStrain,0,'lack of opportunity created project crisis');}
  if(o.progress.minutes===0){zeroPeriods++;assert.equal(o.status,'MISSED');assert.equal(o.progress.good,0);assert.match(g.lastOutcome.title,/oportunidade/i);assert.equal(g.lastOutcome.achieved.output,0);}
 }
 assert(zeroPeriods>=8,'controlled bench scenario lacks expected zero-minute sample');metrics.zeroOpportunity={trials:32,zeroPeriods,limitedPeriods};
});

if(process.env.BASELINE_ENGINE_FILE){
 const B=await import(pathToFileURL(process.env.BASELINE_ENGINE_FILE));
 check('frozen 07.2 pending actions preserve old effects and past prefixes',()=>{
  const snapshots=new Map(),required=['ENTRY','ROUTINE','RIVALRY','PLAN','INTEREST','CONTACT','OFFER','DONE'];
  for(const {id:position}of B.POSITIONS)for(let seed=1;seed<=12&&!required.every(k=>snapshots.has(k));seed++){
   const g=B.createGame('Compatibilidade pública',position,seed);let n=0;
   while(g.phase!=='DONE'){
    const k=g.event.kind;if(!snapshots.has(k))snapshots.set(k,clone(g));
    assert(B.choose(g,policy(g,{tier:'D',move:true}).id));assert(++n<180);
   }snapshots.set('DONE',clone(g));
  }
  const rows=[];
  for(const k of required){
   const source=snapshots.get(k);assert(source,'baseline scenario lacks '+k);assert(E.validGame(source),'legacy rejected '+k);
   if(k==='DONE'){const raw=JSON.stringify(source);assert.equal(E.choose(source,'anything'),false);assert.equal(JSON.stringify(source),raw);rows.push({kind:k,closed:true});continue;}
   for(const c of source.event.choices){
    const old=clone(source),now=clone(source);assert(B.choose(old,c.id));assert(E.choose(now,c.id));
    for(const field of ['playedMatches','objectiveHistory','yearStats','progression','choicesLog','history'])assert.deepEqual(now[field],old[field],k+' changed consumed effects '+field);
    for(const field of ['skills','proficiency','totalstats','seasonStats','salary','clubProject','rival','condition','fatigue','happiness','mentalStress','trust','confidence','reputation','pressure'])assert.deepEqual(now[field],old[field],k+' changed '+field);
    if(['ENTRY','INTEREST','CONTACT'].includes(k))assert.deepEqual(now,old,k+' must not adopt before pending plan');
   }rows.push({kind:k,branches:source.event.choices.length});
  }
  metrics.legacy=rows;
 });
}
assert.equal(hash(),startHash,'source changed during independent review');
const report={engineSha256:startHash,groups,metrics};
if(process.env.REPORT_FILE)fs.writeFileSync(process.env.REPORT_FILE,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({engineSha256:startHash,groups,metrics:{...metrics,careers:metrics.careers?{...metrics.careers,rows:undefined}:undefined}},null,2));
if(groups.some(g=>!g.pass))process.exitCode=1;
