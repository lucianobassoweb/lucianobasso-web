import assert from 'node:assert/strict';
import {matchLoad} from '../dist/core/match-load.js';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {growthStep} from '../dist/core/dna.js';
import {RNG} from '../dist/core/random.js';
const base={age:12,physicalCondition:80,mentalFatigue:30,pressure:20,attributes:{stamina:30}};
const short=matchLoad(base,20),full=matchLoad(base,90);assert.ok(full.condition<short.condition);assert.ok(full.fatigue>short.fatigue);assert.ok(matchLoad({...base,pressure:90},90).fatigue>full.fatigue);assert.ok(matchLoad({...base,attributes:{stamina:80}},90).condition>full.condition);assert.ok(matchLoad({...base,age:24},90).condition>full.condition);assert.equal(matchLoad(base,0).fatigue,0);assert.equal(matchLoad(base,0).condition,1.8);
const tired={...base,physicalCondition:0,mentalFatigue:100};assert.equal(matchLoad(tired,90).condition,0);assert.equal(matchLoad(tired,90).fatigue,0);
function season(rest){const s=createCareerWithSeed('Carga12',55),p=s.player;s.pendingEvent=null;p.position='ST';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;let played=0,extras=0;while(p.age===12&&played<20){s.pendingEvent=null;advanceCareer(s);if(!s.pendingEvent.matchFeedback)continue;played++;const eligible=!p.injury&&p.physicalCondition>=55&&p.mentalFatigue<80&&p.careerTurn-(p.decisionMemory?.lastExtraTurn??-99)>=5;const id=rest?'routine:rest':eligible?'routine:extra':'routine:review';s.pendingEvent={id:`load-${p.careerTurn}`,kind:'INFO',title:'Carga',body:'',tags:[],decisionFamily:'LOAD',choices:[{id,label:id}]};resolveChoice(s,id);extras+=id==='routine:extra'?1:0;}return {p,played,extras};}
const noRest=season(false),rest=season(true);assert.equal(noRest.played,20);assert.equal(rest.played,20);assert.ok(noRest.p.physicalCondition<60);assert.ok(noRest.p.mentalFatigue>65);assert.ok(rest.p.physicalCondition>noRest.p.physicalCondition+25);assert.ok(rest.p.mentalFatigue<noRest.p.mentalFatigue-40);assert.deepEqual(rest.p.dna,noRest.p.dna);
console.log(JSON.stringify({withoutRest:{physical:noRest.p.physicalCondition,mental:noRest.p.mentalFatigue,extras:noRest.extras},withRest:{physical:rest.p.physicalCondition,mental:rest.p.mentalFatigue}}));
console.log('PASS participation dose/minutes/stamina/age/pressure/bench/clamp/20 real youth games and decision costs');
