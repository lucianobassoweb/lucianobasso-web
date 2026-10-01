import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compile=path=>ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^import .*$/gm,'').replace(/^export /gm,'');
const math=Object.create(Math);math.random=()=>{throw Error('Review consumed RNG');};
const sandbox=vm.createContext({Math:math});
vm.runInContext(compile('../src/core/random.ts')+compile('../src/core/positions.ts')+compile('../src/core/youth-position-review.ts')+'\nglobalThis.review=reviewYouthPosition;',sandbox);
const review=p=>JSON.parse(JSON.stringify(sandbox.review(p)));
const attrs=Object.fromEntries(['technique','passing','finishing','dribbling','vision','decisions','pace','stamina','strength','positioning','tackling','crossing','heading','reflexes','handling','aerial'].map(key=>[key,30]));
const stats=(changes={})=>({appearances:17,starts:17,minutes:1173,goals:1,assists:0,avgRating:6.8,...changes});
const season=(position='ST',changes={})=>({season:2026,age:12,primaryPosition:position,positionsPlayed:[position],categories:{U15:stats()},...changes});
const player=(changes={})=>({age:13,season:2027,phase:'ESCOLINHA',professionalStatus:'YOUTH',position:'ST',positionSeasonChosenFor:2026,
 seasonHistory:[season()],attributes:{...attrs,passing:75,vision:75,decisions:70},positionProficiency:Object.fromEntries(['GK','CB','FB','DM','CM','AM','WG','ST'].map(pos=>[pos,25])),...changes});
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log(`PASS ${name}`);};
check('poor documented striker year proposes an experiment grounded in learned repertoire',()=>{
 const r=review(player());assert(r);assert.equal(r.previousSeason,2026);assert.equal(r.previousPosition,'ST');assert.notEqual(r.recommendedPosition,'ST');
 assert.equal(r.recommendedPosition,'CM');assert.match(r.reason,/passe e leitura de jogo/);assert.match(r.reason,/precisa ser testado/);
 assert.equal(r.appearances,17);assert.equal(r.minutes,1173);assert.equal(r.goals,1);assert.equal(r.opportunityPenalty,.08);
 assert.doesNotMatch(r.reason,/DNA|natural|compatibilidade|garantia|potencial/);
});
check('unknown, stale, future and absent positional evidence cannot fabricate a review',()=>{
 for(const changes of [{seasonHistory:[]},{seasonHistory:[season('ST',{season:2025})]},{seasonHistory:[season('ST',{season:2027})]},
  {seasonHistory:[season('ST',{primaryPosition:undefined})]},{seasonHistory:[season('ST',{positionsPlayed:undefined})]},
  {position:'IND'},{seasonHistory:[season('WG')]}])assert.equal(review(player(changes)),null);
 assert.equal(review(player({seasonHistory:[season('ST',{categories:undefined})]})),null);
});
check('mixed positions and senior appearances cannot be assigned a juvenile position verdict',()=>{
 assert.equal(review(player({seasonHistory:[season('ST',{positionsPlayed:['ST','WG']})]})),null);
 assert.equal(review(player({seasonHistory:[season('ST',{positionAppearances:{ST:16,WG:1}})]})),null);
 for(const senior of [stats({appearances:1,minutes:10}),stats({appearances:0,minutes:10})]){
  assert.equal(review(player({seasonHistory:[season('ST',{categories:{U15:stats(),SENIOR:senior}})]})),null);
 }
});
check('age, annual choice and professional status limit the review window',()=>{
 for(const age of [12,19,NaN,13.5])assert.equal(review(player({age})),null);
 for(const professionalStatus of ['SENIOR','INVITED'])assert.equal(review(player({professionalStatus})),null);
 assert.equal(review(player({positionSeasonChosenFor:2027})),null);
 assert(review(player({professionalStatus:undefined})));assert.equal(review(player({professionalStatus:undefined,phase:'PROFISSIONAL'})),null);
 assert.equal(review(player({seasonHistory:[season('ST',{age:19})]})),null);
 for(const [age,penalty] of [[13,.08],[14,.12],[15,.12],[16,.16],[18,.16]])assert.equal(review(player({age})).opportunityPenalty,penalty);
});
check('insufficient exposure and malformed statistics never trigger a verdict',()=>{
 for(const change of [{appearances:7},{minutes:419},{avgRating:0},{avgRating:NaN},{goals:Infinity},{assists:-1}]){
  assert.equal(review(player({seasonHistory:[season('ST',{categories:{U15:stats(change)}})]})),null);
 }
 assert(review(player({seasonHistory:[season('ST',{categories:{U15:stats({appearances:8,minutes:420,goals:0})}})]})));
});
check('productive and good rated strikers avoid the poor season rule',()=>{
 for(const change of [{goals:4},{goals:0,assists:8},{avgRating:7.2}])assert.equal(review(player({seasonHistory:[season('ST',{categories:{U15:stats(change)}})]})),null);
 assert.equal(review(player({seasonHistory:[season('ST',{categories:{U15:stats({goals:1,minutes:450})}})]})),null);
});
check('wingers consider assists and use their own production threshold',()=>{
 const p=player({position:'WG',seasonHistory:[season('WG')]});assert(review(p));
 assert.equal(review({...p,seasonHistory:[season('WG',{categories:{U15:stats({assists:5})}})]}),null);
 assert.equal(review({...p,seasonHistory:[season('WG',{categories:{U15:stats({goals:0,assists:2,minutes:600})}})]}),null);
});
check('defenders and goalkeeper are evaluated by rating rather than absent goals',()=>{
 for(const position of ['GK','CB','FB','DM','CM','AM']){
  assert.equal(review(player({position,seasonHistory:[season(position,{categories:{U15:stats({goals:0,avgRating:6.4})}})]})),null);
  assert(review(player({position,seasonHistory:[season(position,{categories:{U15:stats({goals:0,avgRating:6.1})}})]})));
 }
 assert.equal(review(player({position:'GK',seasonHistory:[season('GK',{categories:{U15:stats({avgRating:6.2})}})]})),null);
 assert.equal(review(player({position:'CB',seasonHistory:[season('CB',{categories:{U15:stats({avgRating:6.3})}})]})),null);
});
check('largest youth category determines the actual sample without blending categories',()=>{
 const categories={U15:stats({appearances:8,minutes:500,goals:0}),U17:stats({appearances:12,minutes:800,goals:0}),U20:stats({appearances:3,minutes:150})};
 const r=review(player({seasonHistory:[season('ST',{categories})]}));assert.equal(r.category,'U17');assert.equal(r.appearances,12);assert.equal(r.minutes,800);
 const lacking={U15:stats({appearances:7,minutes:400,goals:0}),U17:stats({appearances:7,minutes:400,goals:0})};assert.equal(review(player({seasonHistory:[season('ST',{categories:lacking})]})),null);
});
check('alternative responds to learned defensive repertoire without genetic inference',()=>{
 const p=player({attributes:{...attrs,tackling:90,positioning:85,strength:85,heading:85,aerial:80}});const r=review(p);
 assert.equal(r.recommendedPosition,'CB');assert.match(r.reason,/marcação e posicionamento/);
 const familiar=player();familiar.positionProficiency.AM=100;assert.equal(review(familiar).recommendedPosition,'AM');
});
check('frozen inputs remain unchanged and hidden DNA or randomness is inaccessible',()=>{
 const p=player();Object.defineProperty(p,'dna',{get(){throw Error('DNA read');}});Object.defineProperty(p,'rngState',{get(){throw Error('RNG read');}});
 const before=JSON.stringify(p);freeze(p);assert.deepEqual(review(p),review(p));assert.equal(JSON.stringify(p),before);
});
console.log(`${checks} youth position review groups passed`);
