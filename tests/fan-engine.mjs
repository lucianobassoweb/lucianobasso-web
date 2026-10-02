import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer} from '../dist/core/engine.js';
import {syncCoachContext} from '../dist/core/coaches.js';
import {loadSave,storeSave} from '../dist/core/persistence.js';
export function professionalFixture(pos='GK',seed=14,ability=75){
 const s=createCareerWithSeed('Teste torcida',seed),p=s.player;s.pendingEvent=null;
 Object.assign(p,{age:25,professionalStatus:'SENIOR',phase:'PROFISSIONAL',currentClubId:'gremio',position:pos});
 p.positionProficiency[pos]=90;for(const k in p.attributes)p.attributes[k]=ability;
 p.careerStats.appearances=200;p.careerStats.minutes=15000;
 p.debut={season:2025,age:24,clubId:'gremio',opponentId:'vasco',minutes:80};
 syncCoachContext(p);p.tactical.discussedFor=p.season;return s;
}
let checks=0;function check(name,fn){fn();checks++;console.log('PASS',name);}
check('real engine reproductions keep the score and charge the responsible sector at zero floors',()=>{
 for(const [pos,note,word] of [['GK',6.1,/setor defensivo/],['ST',6.3,/cobra o ataque/]]){
 const s=professionalFixture(pos),before=s.player.pressure;advanceCareer(s);const m=s.pendingEvent.matchFeedback;
 assert.deepEqual([m.teamGoals,m.oppGoals,m.minutes,m.rating],[0,3,80,note]);assert.match(m.fanReaction,word);
 assert(s.player.fanRelations.gremio.hate>0);assert.equal(s.player.fanRelations.gremio.respect,0);assert(s.player.pressure>before);
 assert.equal(s.player.careerStats.appearances,201);const after=JSON.stringify(s);advanceCareer(s);assert.equal(JSON.stringify(s),after);
 }
});
check('bench player is not charged for the score',()=>{const s=professionalFixture('CB');advanceCareer(s);assert.equal(s.pendingEvent.matchFeedback.minutes,0);assert.match(s.pendingEvent.matchFeedback.fanReaction,/Sem atuação/);assert.equal(s.player.fanRelations.gremio?.hate??0,0);});
check('youth observations are contextual without manufacturing a club relationship',()=>{
 const s=createCareerWithSeed('Formação',14);s.pendingEvent=null;s.player.position='GK';s.player.positionSeasonChosenFor=s.player.season;s.player.life.education.chosenFor=s.player.season;advanceCareer(s);
 assert.equal(s.pendingEvent.matchFeedback.category,'U15');assert.match(s.pendingEvent.matchFeedback.fanReaction,/formação/);assert.doesNotMatch(s.pendingEvent.matchFeedback.fanReaction,/revolta|profissional/);assert.deepEqual(s.player.fanRelations,{});
});
check('relations and pending old events survive persistence without retroactive judgments',()=>{
 let raw=null;const key='1903.save.playable2';globalThis.localStorage={getItem:k=>k===key?raw:null,setItem:(k,v)=>{assert.equal(k,key);raw=v;},removeItem:()=>{raw=null;}};
 const s=professionalFixture();advanceCareer(s);assert(storeSave(s));const loaded=loadSave();assert.deepEqual(loaded.player.fanRelations,s.player.fanRelations);assert.deepEqual(loaded.pendingEvent,s.pendingEvent);
 loaded.pendingEvent.matchFeedback.fanReaction='Reação legada preservada';assert(storeSave(loaded));const old=loadSave(),before=JSON.stringify(old);advanceCareer(old);assert.equal(JSON.stringify(old),before);
});
check('severe actual matches record fan memory and history once and survive reload',()=>{
 let found=null;
 for(let seed=1;seed<=2000&&!found;seed++){const s=professionalFixture('GK',seed,55);s.player.positionProficiency.GK=20;s.player.confidence=100;s.player.fanRelations.gremio={clubId:'gremio',passion:0,hate:0,respect:0,fear:0,expectation:90,memories:[]};advanceCareer(s);if(s.player.fanRelations.gremio?.memories.some(m=>m.type==='PRESSURE'))found=s;}
 assert(found,'deterministic severe match fixture not found');assert(found.player.history.some(h=>h.type==='TORCIDA'));
 const before=JSON.stringify(found);advanceCareer(found);assert.equal(JSON.stringify(found),before);assert(storeSave(found));assert.deepEqual(loadSave().player.fanRelations,found.player.fanRelations);
});
console.log(`${checks} fan engine integration groups passed`);
