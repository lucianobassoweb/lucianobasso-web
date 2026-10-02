import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/core/stories.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^import .*$/gm,'').replace(/^export /gm,'');
const math=Object.create(Math);math.random=()=>{throw Error('Story RNG accessed');};
const sandbox=vm.createContext({Math:math,competitionCategory:p=>p.category??'U15'});
vm.runInContext(code+'\nglobalThis.api={ensureStories,updateStories};',sandbox);
const {ensureStories:ensure,updateStories:update}=sandbox.api;
const player=(position='ST',extra={})=>({position,season:2026,careerTurn:0,currentClubId:null,phase:'ESCOLINHA',...extra});
const evidence=(position='ST',extra={})=>({position,category:'U15',appearances:1,minutes:60,rating:7.2,goals:0,assists:0,saves:0,cleanSheet:false,oppGoals:0,...extra});
const tick=(p,e,comeback=false)=>{p.careerTurn++;update(p,e,comeback);};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log(`PASS ${name}`);};
check('eight substantial but sterile ST matches cannot complete automatically',()=>{
 const p=player();ensure(p);assert.equal(p.story.active.challengeVersion,1);assert.equal(p.story.active.targetGoodMatches,2);
 for(let n=0;n<8;n++)tick(p,evidence());assert.equal(p.story.active,null);assert.equal(p.story.archive.length,1);
 const c=p.story.archive[0];assert.equal(c.outcome,'PARTIAL');assert.equal(c.appearances,8);assert.equal(c.minutes,480);assert.equal(c.goodMatches,0);assert.match(c.payoff,/0\/2 atuações com gol/);
 for(let n=0;n<8;n++)tick(p,evidence());assert.equal(p.story.archive.length,1);assert.equal(p.story.active,null);
});
check('real productive performances and participation together achieve the challenge',()=>{
 const p=player();ensure(p);tick(p,evidence('ST',{goals:2}));tick(p,evidence('ST',{goals:1}));assert(p.story.active);
 tick(p,evidence());tick(p,evidence());assert.equal(p.story.archive[0].outcome,'ACHIEVED');assert.equal(p.story.archive[0].goodMatches,2);
});
check('a goal with weak rating, brief cameo, bench or absent position never proves the new target',()=>{
 const p=player();ensure(p);tick(p,evidence('ST',{goals:1,rating:6.9}));tick(p,evidence('ST',{goals:1,minutes:12}));
 tick(p,evidence('ST',{goals:1,minutes:0,appearances:0}));tick(p,evidence('ST',{position:undefined,goals:1}));
 assert.equal(p.story.active.appearances,1);assert.equal(p.story.active.goodMatches,0);
});
check('position-specific evidence accepts only documented appropriate performances',()=>{
 const cases=[['ST',{goals:1},{}],['WG',{assists:1},{}],['AM',{goals:1},{}],['GK',{saves:4},{saves:3}],
  ['CB',{oppGoals:1},{oppGoals:2}],['FB',{oppGoals:0},{oppGoals:3}],['DM',{oppGoals:1},{oppGoals:2}],
  ['CM',{rating:7,assists:1},{rating:7,assists:0}]];
 for(const [position,good,bad] of cases){const p=player(position);ensure(p);tick(p,evidence(position,{rating:7,...good}));assert.equal(p.story.active.goodMatches,1,position);
  tick(p,evidence(position,{rating:7,...bad}));assert.equal(p.story.active.goodMatches,1,position);}
 const gk=player('GK');ensure(gk);tick(gk,evidence('GK',{cleanSheet:true,rating:7}));assert.equal(gk.story.active.goodMatches,1);
 const cm=player('CM');ensure(cm);tick(cm,evidence('CM',{rating:7.2}));assert.equal(cm.story.active.goodMatches,1);
});
check('missing defensive facts or non-finite observations cannot fabricate a good match',()=>{
 for(const position of ['GK','CB','DM']){const p=player(position);ensure(p);tick(p,evidence(position,{oppGoals:undefined,saves:undefined,cleanSheet:undefined}));assert.equal(p.story.active.goodMatches,0);}
 const p=player();ensure(p);tick(p,evidence('ST',{minutes:Infinity,goals:1}));assert.equal(p.story.active.minutes,0);
 tick(p,evidence('ST',{rating:NaN,goals:1}));assert.equal(p.story.active.goodMatches,0);
});
check('deadlines close genuine partial or unmet outcomes and late evidence is excluded',()=>{
 const p=player();ensure(p);for(let n=0;n<8;n++)tick(p,evidence('ST',{minutes:0,appearances:0}));assert.equal(p.story.archive[0].outcome,'UNMET');
 const late=player();ensure(late);late.careerTurn=9;update(late,evidence('ST',{goals:1}));assert.equal(late.story.archive[0].appearances,0);
});
check('a comeback requires both progressive minutes and a factual response',()=>{
 const p=player();ensure(p);tick(p,undefined,true);const started=p.story.active;assert.equal(started.kind,'COMEBACK');assert.equal(started.minMatchMinutes,20);
 tick(p,evidence('ST',{minutes:20}));tick(p,evidence('ST',{minutes:20}));assert(p.story.active);assert.equal(p.story.active.goodMatches,0);
 tick(p,evidence('ST',{minutes:25,goals:1}));tick(p,evidence('ST',{minutes:25,goals:1}));assert.equal(p.story.archive.at(-1).outcome,'ACHIEVED');
});
check('only actual recent same-context sample increases demands, without reconstructing history',()=>{
 const recentForm={context:{clubId:null,category:'U15',position:'ST',season:2026},observations:Array.from({length:4},(_,i)=>({turn:i,minutes:60,rating:7.5,goals:1,assists:0}))};
 const p=player('ST',{recentForm});ensure(p);assert.equal(p.story.active.targetAppearances,5);assert.equal(p.story.active.targetGoodMatches,3);assert.equal(p.story.active.deadlineTurn,6);
 const unknown=player('ST',{currentSeason:{goals:90,avgRating:9}});ensure(unknown);assert.equal(unknown.story.active.targetAppearances,4);
 const changed=player('ST',{recentForm:{...recentForm,context:{...recentForm.context,season:2025}}});ensure(changed);assert.equal(changed.story.active.targetGoodMatches,2);
});
check('new context resets include position and prevent attribution to the prior chapter',()=>{
 for(const change of [{position:'WG'},{season:2027},{currentClubId:'new-club'},{category:'U17'}]){
  const p=player();ensure(p);tick(p,evidence());Object.assign(p,change);tick(p,evidence(p.position,{category:p.category??'U15',assists:1}));
  assert.equal(p.story.archive[0].appearances,1);assert.match(p.story.archive[0].payoff,/Mudança de etapa/);assert(p.story.active);
 }
});
check('reload and repeated transition including comeback are idempotent',()=>{
 const p=player();ensure(p);tick(p,evidence('ST',{goals:1}));const reload=JSON.parse(JSON.stringify(p));const before=JSON.stringify(reload.story);update(reload,evidence('ST',{goals:1}));assert.equal(JSON.stringify(reload.story),before);
 tick(reload,undefined,true);const returnBefore=JSON.stringify(reload.story);update(reload,undefined,true);assert.equal(JSON.stringify(reload.story),returnBefore);
});
check('legacy active chapter retains original objective, targets and rating-only completion',()=>{
 const legacy={id:'legacy',kind:'FORMATION',category:'U15',clubId:null,title:'Old title',objective:'Old objective',startedSeason:2026,startedTurn:0,deadlineTurn:8,appearances:0,minutes:0,goodMatches:0,targetAppearances:3,targetMinutes:120,targetGoodMatches:0};
 const p=player('ST',{story:{active:structuredClone(legacy),archive:[],lastObservedTurn:0,sequence:1}});ensure(p);assert.deepEqual(JSON.parse(JSON.stringify(p.story.active)),legacy);
 for(let n=0;n<3;n++)tick(p,evidence('ST',{minutes:40,rating:6.8}));assert.equal(p.story.archive[0].outcome,'ACHIEVED');assert.equal(p.story.archive[0].objective,'Old objective');assert.equal(p.story.archive[0].challengeVersion,undefined);assert.equal(p.story.active,null);
});
check('no DNA, RNG, sporting state or historical archive changes are needed',()=>{
 const p=player('ST',{rngState:123,attributes:{finishing:25},history:[{headline:'Past fact'}]});Object.defineProperty(p,'dna',{get(){throw Error('DNA read');}});
 const archive=Object.freeze({startedSeason:2025,clubId:null,category:'U15',kind:'FORMATION',payoff:'Past unchanged'});p.story={active:null,archive:[archive],lastObservedTurn:0,sequence:0};
 const before=JSON.stringify({rngState:p.rngState,attributes:p.attributes,history:p.history});ensure(p);tick(p,evidence('ST',{goals:1}));assert.equal(p.story.archive[0],archive);
 assert.equal(JSON.stringify({rngState:p.rngState,attributes:p.attributes,history:p.history}),before);
});
console.log(`${checks} story challenge groups passed`);
