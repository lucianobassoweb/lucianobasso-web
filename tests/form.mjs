import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/core/form.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^export /gm,'')+'\nglobalThis.api={recordRecentMatchForm,evaluateRecentMatchForm};';
const math=Object.create(Math);math.random=()=>{throw Error('Form consumed RNG');};
const sandbox=vm.createContext({Math:math});vm.runInContext(compiled,sandbox);
const {recordRecentMatchForm:record,evaluateRecentMatchForm:evaluate}=sandbox.api;
const context=(changes={})=>({clubId:'gremio',category:'SENIOR',position:'ST',season:2030,...changes});
const match=(turn,changes={})=>({turn,minutes:90,goals:0,assists:0,rating:7.1,xg:0.5,xa:0,...changes});
const sequence=(count=6,c=context(),changes={})=>{let f;for(let i=1;i<=count;i++)f=record(f,c,match(i,changes));return f;};
const json=x=>JSON.parse(JSON.stringify(x));
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log(`PASS ${name}`);};
check('unknown legacy history is not a fabricated drought',()=>{
 const r=evaluate(undefined,context(),24);assert.equal(r.known,false);assert.equal(r.startPenalty,0);assert.equal(r.coachText,'');
});
check('six sterile striker appearances materially reduce next start probability despite 7.1 ratings',()=>{
 const c=context(),r=evaluate(sequence(),c,24);assert.equal(r.dryMatches,6);assert.equal(r.dryMinutes,540);assert.equal(r.startPenalty,0.3);
 assert(0.75-r.startPenalty<0.5);assert.match(r.coachText,/titularidade perde força/);assert.match(r.fanText,/6 atuações/);
 const reported=evaluate(sequence(6,c,{minutes:69}),c,24);assert.equal(reported.startPenalty,0.3);assert.equal(reported.dryMinutes,414);
});
check('penalty develops progressively with enough actual exposure',()=>{
 const c=context();assert.equal(evaluate(sequence(2),c,24).startPenalty,0);
 const three=evaluate(sequence(3,c,{minutes:60}),c,24),four=evaluate(sequence(4,c,{minutes:60}),c,24),six=evaluate(sequence(),c,24);
 assert(three.startPenalty>0);assert(three.startPenalty<four.startPenalty);assert(four.startPenalty<six.startPenalty);
 assert.equal(evaluate(sequence(3,c,{minutes:45}),c,24).startPenalty,0);
});
check('bench and brief cameos cannot create or erase substantial exposure',()=>{
 const c=context();for(const minutes of [0,12,30,44])assert.equal(evaluate(sequence(8,c,{minutes}),c,24).startPenalty,0);
 const f=sequence();let benched=f;for(let turn=7;turn<20;turn++)benched=record(benched,c,match(turn,{minutes:0}));
 assert.equal(benched.observations.length,6);assert.equal(evaluate(benched,c,24).startPenalty,0.3);
});
check('assists and creation mitigate rather than erase a long striker drought',()=>{
 const c=context(),plain=evaluate(sequence(),c,24),assisted=evaluate(sequence(6,c,{assists:1}),c,24),created=evaluate(sequence(6,c,{xa:1}),c,24);
 assert(assisted.startPenalty>0&&assisted.startPenalty<plain.startPenalty);assert(created.startPenalty>0&&created.startPenalty<plain.startPenalty);
 assert(assisted.startPenalty>=0.13);assert.match(created.coachText,/criação atenua/);
});
check('winger pressure is milder and midfield or defense never receives striker penalties',()=>{
 const st=evaluate(sequence(),context(),24);const wg=context({position:'WG'});assert(evaluate(sequence(6,wg),wg,24).startPenalty<st.startPenalty);
 for(const position of ['GK','CB','FB','DM','CM','AM','IND']){const c=context({position});const r=evaluate(sequence(6,c),c,24);assert.equal(r.startPenalty,0);assert.equal(r.coachText,'');}
});
check('youth is gentler but persistent sterility can cost a start at 13',()=>{
 const c=context({category:'U15'}),f=sequence(6,c),adult=evaluate(sequence(),context(),24);
 const twelve=evaluate(f,c,12),thirteen=evaluate(f,c,13),fifteen=evaluate(f,c,15),seventeen=evaluate(f,c,17);
 assert(twelve.startPenalty<thirteen.startPenalty);assert(thirteen.startPenalty>0.1);assert(thirteen.startPenalty<fifteen.startPenalty);
 assert(fifteen.startPenalty<seventeen.startPenalty);assert.equal(seventeen.startPenalty,0.18);assert(seventeen.startPenalty<adult.startPenalty);
 assert.match(thirteen.coachText,/formação/);assert.doesNotMatch(thirteen.fanText,/revolta|profissional/);
});
check('club, category, position and season changes discard the prior context',()=>{
 const f=sequence();for(const change of [{clubId:'vasco'},{category:'U20'},{position:'WG'},{season:2031}]){
  const c=context(change);assert.equal(evaluate(f,c,24).known,false);const next=record(f,c,match(7));assert.equal(next.observations.length,1);assert.equal(evaluate(next,c,24).startPenalty,0);
 }
});
check('recording is idempotent and rejects older replayed turns',()=>{
 const c=context(),f=sequence();assert.strictEqual(record(f,c,match(6,{goals:2})),f);assert.strictEqual(record(f,c,match(3)),f);
 const bench=record(f,c,match(7,{minutes:0}));assert.strictEqual(record(bench,c,match(7)),bench);
});
check('a real goal resets the sequence and recent contributions restore part of the opportunity',()=>{
 const c=context(),f=sequence(),before=evaluate(f,c,24);const goal=record(f,c,match(7,{minutes:12,goals:1}));assert.equal(evaluate(goal,c,24).startPenalty,0);
 const assist=record(f,c,match(7,{assists:1,xa:0.7}));assert(evaluate(assist,c,24).startPenalty<before.startPenalty);
 assert.equal(evaluate(record(goal,c,match(8)),c,24).dryMatches,1);
});
check('history is bounded, inputs immutable, and no DNA or RNG is read',()=>{
 const c=context();Object.defineProperty(c,'dna',{get(){throw Error('DNA read');}});Object.defineProperty(c,'rngState',{get(){throw Error('RNG read');}});Object.freeze(c);
 const f=sequence(30,c);assert.equal(f.observations.length,8);f.observations.forEach(Object.freeze);Object.freeze(f.observations);Object.freeze(f);
 assert.deepEqual(json(evaluate(f,c,24)),json(evaluate(f,c,24)));assert.equal(record(f,c,Object.freeze(match(31))).observations.length,8);
});
check('invalid observed numbers remain finite and cannot manufacture exposure',()=>{
 const c=context(),f=sequence(6,c,{minutes:Infinity,rating:NaN,xg:Infinity,xa:NaN});assert.equal(f.observations.length,0);
 const r=evaluate(f,c,24);for(const key of ['startPenalty','severity','dryMinutes','xa'])assert(Number.isFinite(r[key]));assert.equal(r.startPenalty,0);
 const valid=sequence();assert.strictEqual(record(valid,c,match(NaN)),valid);
});
check('eight scoreless cameos do not wash away six substantial dry appearances',()=>{
 const c={clubId:'gremio',category:'SENIOR',position:'ST',season:2030};let f;
 for(let turn=1;turn<=6;turn++)f=record(f,c,{turn,minutes:69,goals:0,assists:0,rating:7.1,xg:.2,xa:0});
 const before=evaluate(f,c,24);
 for(let turn=7;turn<=14;turn++)f=record(f,c,{turn,minutes:18,goals:0,assists:0,rating:6.3,xg:.1,xa:0});
 assert.equal(evaluate(f,c,24).startPenalty,before.startPenalty);assert.equal(f.lastObservedTurn,14);
 f=record(f,c,{turn:15,minutes:12,goals:1,assists:0,rating:7.5,xg:.6,xa:0});assert.equal(evaluate(f,c,24).startPenalty,0);
});
console.log(`${checks} recent form groups passed`);
