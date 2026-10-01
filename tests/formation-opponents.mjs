import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer} from '../dist/core/engine.js';
import {formationOpponent} from '../dist/core/formation-opponents.js';
import {BRAZIL_CLUBS_2026,CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
const fresh=()=>{const s=createCareerWithSeed('Adversários',55,'gremio','Porto Alegre','RS');s.pendingEvent=null;s.player.position='ST';s.player.positionSeasonChosenFor=s.player.season;s.player.life.education.chosenFor=s.player.season;return s;};
let groups=0;function check(name,fn){fn();groups++;console.log('PASS',name);}
check('all clubs face another named club, regional where available, across 20 dates',()=>{
 for(const club of BRAZIL_CLUBS_2026){const p=fresh().player;p.currentClubId=club.id;const regional=BRAZIL_CLUBS_2026.some(c=>c.id!==club.id&&c.state===club.state);for(let round=1;round<=20;round++){p.seasonTurn=round;const o=formationOpponent(p);assert.notEqual(o.id,club.id);assert.ok(o.name);assert.equal(o.source,'CLUB');assert.ok(CLUB_BY_ID[o.id]);if(regional)assert.equal(CLUB_BY_ID[o.id].state,club.state);}}
});
check('local fictional identity is varied, stable after reload, and follows residence',()=>{
 const p=fresh().player,seen=new Set(),before=structuredClone(p);for(let r=1;r<=20;r++){p.seasonTurn=r;const o=formationOpponent(p);assert.equal(o.source,'LOCAL');assert.match(o.name,/Porto Alegre/);assert.deepEqual(formationOpponent(structuredClone(p)),o);seen.add(o.id);}assert.equal(seen.size,10);assert.deepEqual(p.dna,before.dna);assert.equal(p.rngState,before.rngState);p.life.residence='Curitiba';assert.match(formationOpponent(p).name,/Curitiba/);
});
check('real Sub-15 events carry identity without promoting juvenile totals to professional',()=>{
 for(const clubId of [null,'gremio','santos']){const s=fresh(),p=s.player;p.currentClubId=clubId;advanceCareer(s);assert.equal(s.pendingEvent.matchFeedback.category,'U15');assert.ok(s.pendingEvent.matchFeedback.opponentId);assert.equal(s.pendingEvent.matchFeedback.opponent,formationOpponent(p).name);assert.equal(p.careerStats.appearances,0);assert.equal(p.currentSeason.appearances,1);}
});
check('old pending generic events are untouched while waiting for a decision',()=>{
 const s=fresh();s.pendingEvent={id:'old',kind:'CHOICE',title:'Legado',body:'Anterior',tags:[],choices:[{id:'career:stable',label:'Seguir'}],matchFeedback:{opponent:'Adversário da base'}};const before=structuredClone(s.pendingEvent),rng=s.player.rngState;advanceCareer(s);assert.deepEqual(s.pendingEvent,before);assert.equal(s.player.rngState,rng);
});
console.log(`${groups} formation opponent groups PASS`);
