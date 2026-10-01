import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/core/fans.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^export /gm,'')+'\nglobalThis.evaluate=evaluateFanMatch;';
const math=Object.create(Math);math.random=()=>{throw Error('Fan evaluation consumed RNG');};
const sandbox=vm.createContext({Math:math});vm.runInContext(compiled,sandbox);
const player=(position='CB',changes={})=>({position,age:24,season:2030,pressure:50,morale:50,confidence:50,...changes});
const match=(changes={})=>({teamGoals:0,oppGoals:2,minutes:90,rating:6.4,goals:0,assists:0,saves:0,xg:0,xa:0,red:false,motm:false,...changes});
const evaluate=(p,m=match(),o={category:'SENIOR'})=>JSON.parse(JSON.stringify(sandbox.evaluate(p,m,o)));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log(`PASS ${name}`);};
check('loss demands more defensive accountability than attack when scoring',()=>{
 const m=match({teamGoals:1,oppGoals:3});
 for(const pos of ['GK','CB']){const r=evaluate(player(pos),m);assert(r.deltas.hate>evaluate(player('ST'),m).deltas.hate);assert.match(r.text,/setor defensivo/);}
});
check('scoreless attack is charged more than CB, including a 0–0',()=>{
 for(const ga of [0,1]){const m=match({oppGoals:ga});for(const pos of ['ST','WG']){const r=evaluate(player(pos),m);assert(r.deltas.pressure>evaluate(player('CB'),m).deltas.pressure);assert.match(r.text,/cobra o ataque/);}}
});
check('good GK in defeat earns respect while collective pressure persists',()=>{
 const good=evaluate(player('GK'),match({rating:7.8,saves:8,oppGoals:3}));
 const bad=evaluate(player('GK'),match({rating:5.2,saves:1,oppGoals:3}));
 assert(good.deltas.respect>0);assert(good.deltas.pressure>0);assert(good.deltas.hate<bad.deltas.hate);assert.match(good.text,/reconhecimento.*cobrança coletiva/);
});
check('poor performance is not excused by victory',()=>{
 const r=evaluate(player('ST'),match({rating:5,teamGoals:2,oppGoals:0}));assert(r.deltas.respect<0);assert(r.deltas.hate>0);assert.match(r.text,/apesar da vitória/);
});
check('no appearance produces no individual effects, even in a rout',()=>{
 const r=evaluate(player('GK'),match({minutes:0,rating:0,oppGoals:8,red:true}));assert(Object.values(r.deltas).every(x=>x===0));assert(!r.memory);assert.match(r.text,/não entrou/);assert.doesNotMatch(r.text,/sua nota|expulsão|revolta/);
});
check('short appearances scale emotional judgment and avoid fabricated fault',()=>{
 const full=evaluate(player('CB')),short=evaluate(player('CB'),match({minutes:12}));assert(short.deltas.hate>0&&short.deltas.hate<full.deltas.hate);assert.match(short.text,/participação curta/);assert.doesNotMatch(short.text,/falhou|sua falha|durante sua presença|culpado/);
});
check('mixed positions have differing responsibilities in both phases',()=>{
 const conceded=match({teamGoals:1,oppGoals:3}),blank=match({oppGoals:0});
 assert(evaluate(player('DM'),conceded).deltas.pressure>evaluate(player('AM'),conceded).deltas.pressure);
 assert(evaluate(player('AM'),blank).deltas.pressure>evaluate(player('DM'),blank).deltas.pressure);
 assert(evaluate(player('FB'),conceded).deltas.hate>0);assert(evaluate(player('CM'),blank).deltas.hate>0);
});
check('goals and assists bring support without erasing a rout',()=>{
 const m=match({teamGoals:1,oppGoals:5,rating:7.5});
 const r=evaluate(player('ST'),{...m,goals:1}),without=evaluate(player('ST'),m);
 assert(r.deltas.passion>without.deltas.passion);assert.match(r.text,/reconhece/);assert(r.deltas.passion<evaluate(player('ST'),{...m,goals:1,oppGoals:0}).deltas.passion);
 assert(evaluate(player('WG'),{...m,assists:1}).deltas.passion>evaluate(player('WG'),m).deltas.passion);
});
check('clean sheet recognizes GK and does not excuse scoreless ST',()=>{
 const m=match({oppGoals:0,rating:6.7,saves:4});const gk=evaluate(player('GK'),m),st=evaluate(player('ST'),m);assert(gk.deltas.respect>0);assert.match(gk.text,/sem sofrer gol/);assert(st.deltas.pressure>gk.deltas.pressure);
});
check('missed xG, cards and stronger opponents change judgment',()=>{
 const base=evaluate(player('ST'));assert(evaluate(player('ST'),match({xg:1.5})).deltas.pressure>base.deltas.pressure);
 assert(evaluate(player('CB'),match({red:true})).deltas.hate>evaluate(player('CB')).deltas.hate);
 const p=player('CB');assert(evaluate(p,match(),{own:{prestige:90},opponent:{prestige:30}}).deltas.hate>evaluate(p,match(),{own:{prestige:30},opponent:{prestige:90}}).deltas.hate);
});
check('expectation, rivalry, real campaign and prior hatred never fabricate a streak',()=>{
 const p=player('CB'),m=match();const low=evaluate(p,m,{priorFan:{expectation:10}}),high=evaluate(p,m,{priorFan:{expectation:90},rivalry:true,campaign:{games:8,points:3,expectedPPG:2}});assert(high.deltas.pressure>low.deltas.pressure);assert.doesNotMatch(high.text,/seguidas|novamente|sequência/);
});
check('youth and local audiences are appropriate and early adolescence gentler',()=>{
 const adult=evaluate(player('CB')),youth=evaluate(player('CB',{age:12}),match(),{category:'U15'}),local=evaluate(player('CB'),match(),{category:'AMATEUR'});
 assert(youth.deltas.hate<adult.deltas.hate);assert.match(youth.text,/formação/);assert.match(local.text,/time local/);assert.doesNotMatch(youth.text,/revolta|profissional/);
});
check('rare PRESSURE and documented REDEMPTION do not occur every match',()=>{
 assert(!evaluate(player('CB')).memory);
 const m=match({rating:5,oppGoals:4}),flop=evaluate(player('CB'),m);assert.equal(flop.memory.type,'PRESSURE');
 const response=match({rating:8.5,teamGoals:2,oppGoals:0,goals:1});assert(!evaluate(player('ST'),response).memory);
 const r=evaluate(player('ST'),response,{category:'SENIOR',priorFan:{memories:[flop.memory]}});assert.equal(r.memory.type,'REDEMPTION');
 assert(!evaluate(player('ST'),response,{priorFan:{memories:[{...flop.memory,season:2020}]}}).memory);
 assert(!evaluate(player('CB',{age:12}),m,{category:'U15'}).memory);
});
check('deterministic frozen inputs ignore hidden state and global randomness',()=>{
 const p=player('GK');Object.defineProperty(p,'dna',{get(){throw Error('DNA read');}});Object.defineProperty(p,'rngState',{get(){throw Error('RNG read');}});Object.freeze(p);
 const m=freeze(match({rating:7.5,saves:8})),o=freeze({priorFan:{hate:70,expectation:80,memories:[]}});assert.deepEqual(evaluate(p,m,o),evaluate(p,m,o));
});
check('finite bounded deltas and actual caps hold across positions and invalid observations',()=>{
 for(const pos of ['GK','CB','FB','DM','CM','AM','WG','ST','IND'])for(const edge of [0,100])for(const m of [match({rating:1,oppGoals:20,red:true}),match({rating:10,goals:5,teamGoals:8,oppGoals:0}),match({rating:NaN,minutes:Infinity,xg:NaN,oppGoals:Infinity})]){
  const p=player(pos,{pressure:edge,morale:edge,confidence:edge}),o={priorFan:{passion:edge,hate:edge,respect:edge,expectation:NaN},intensity:Infinity};
  const r=evaluate(p,m,o);for(const [key,d] of Object.entries(r.deltas)){assert(Number.isFinite(d));assert(Math.abs(d)<=3);assert(edge+d>=0&&edge+d<=100);}
 }
});
check('reported 80 minute 0–3 GK and ST cases respond even at zero relation floors',()=>{
 const o={category:'SENIOR',priorFan:{passion:0,hate:0,respect:0}};
 for(const [pos,rating] of [['GK',6.1],['ST',6.3]]){
  const r=evaluate(player(pos),match({minutes:80,oppGoals:3,rating,saves:1}),o);
  assert(r.deltas.hate>0);assert(r.deltas.pressure>0);assert.match(r.text,pos==='GK'?/setor defensivo/:/cobra o ataque/);
 }
});
check('memory duplicates and season pressure count prevent repeated recording',()=>{
 const p=player('CB'),m=match({rating:5,oppGoals:4}),memory=evaluate(p,m).memory;
 assert(!evaluate(p,m,{category:'SENIOR',priorFan:{memories:[memory]}}).memory);
 const history=Array.from({length:4},(_,i)=>({...memory,description:`Cobrança registrada ${i}`}));
 assert(!evaluate(p,m,{category:'SENIOR',priorFan:{memories:history}}).memory);
 assert(evaluate(p,m,{category:'SENIOR',priorFan:{memories:history.map(x=>({...x,season:2029}))}}).memory);
});
check('observed creation attenuates scoreless creative roles without inventing an assist',()=>{
 for(const pos of ['CM','AM','WG']){
  const p=player(pos),m=match({oppGoals:0}),plain=evaluate(p,m),created=evaluate(p,{...m,xa:1.2});
  assert(created.deltas.hate<plain.deltas.hate);assert(created.deltas.pressure<plain.deltas.pressure);assert(created.deltas.pressure>0);
  assert.match(created.text,/xA indica criação/);assert.doesNotMatch(created.text,/assistência|seus companheiros desperdiçaram/);
 }
 assert.deepEqual(evaluate(player('CB'),match({oppGoals:0})),evaluate(player('CB'),match({oppGoals:0,xa:2})));
});
check('one redemption closes an episode; a fresh pressure can reopen it',()=>{
 const p=player('ST'),bad=evaluate(p,match({rating:5,oppGoals:4})).memory;
 const first=evaluate(p,match({rating:8.5,teamGoals:2,oppGoals:0,goals:1}),{priorFan:{memories:[bad]}}).memory;
 assert.equal(first.type,'REDEMPTION');
 const good=match({rating:8.6,teamGoals:3,oppGoals:0,goals:1});
 assert(!evaluate(p,good,{priorFan:{memories:[first,bad]}}).memory);
 assert.equal(evaluate(p,good,{priorFan:{memories:[{...bad,description:'Nova cobrança'},first,bad]}}).memory.type,'REDEMPTION');
});
check('default audience categories follow the actual youth calendar',()=>{
 for(const [age,category] of [[14,'U15'],[15,'U17'],[16,'U20'],[20,'U20'],[21,'SENIOR']]){
 const p=player('CB',{age});assert.deepEqual(evaluate(p,match(),{}),evaluate(p,match(),{category}));
 }
});
console.log(`${checks} fan accountability groups passed`);
