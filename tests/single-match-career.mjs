import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {competitionCategory,promotionEvidence} from '../dist/core/calendar.js';
import {growthStep,overall} from '../dist/core/dna.js';
import {RNG} from '../dist/core/random.js';
const copy=x=>structuredClone(x);
const ready=seed=>{const s=createCareerWithSeed('Estreia',seed),p=s.player;s.pendingEvent=null;p.age=17;p.phase='BASE';p.currentClubId='gremio';p.position='AM';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;p.positionProficiency.AM=70;for(const k of Object.keys(p.attributes))p.attributes[k]=70;return s;};
const weak=ready(660);weak.player.currentSeason.categories={U20:{appearances:12,starts:12,minutes:800,goals:0,assists:0,avgRating:6.1}};
assert.equal(promotionEvidence(weak.player).eligible,false);advanceCareer(weak);assert.equal(weak.player.professionalStatus,'YOUTH');assert.equal(weak.player.careerStats.appearances,0);assert.equal(weak.pendingEvent.matchFeedback.category,'U20');assert.ok(weak.pendingEvent.choices.length);
const strong=ready(661);strong.player.currentSeason.categories={U20:{appearances:12,starts:12,minutes:800,goals:8,assists:6,avgRating:7.7}};strong.player.currentSeason.appearances=12;
assert.equal(promotionEvidence(strong.player).eligible,true);advanceCareer(strong);assert.ok(strong.pendingEvent.id.startsWith('transition-'));assert.equal(strong.player.careerStats.appearances,0);assert.equal(strong.player.professionalStatus,'INVITED');
resolveChoice(strong,'transition:PROTECTED');assert.equal(strong.player.professionalStatus,'SENIOR');assert.equal(strong.player.careerStats.appearances,0);
let debutFound=false,guard=0;
while(!debutFound&&guard++<60){if(strong.pendingEvent?.choices?.length){resolveChoice(strong,strong.pendingEvent.choices[0].id);continue;}const prior=strong.player.careerStats.appearances;advanceCareer(strong);assert.ok(strong.player.careerStats.appearances-prior<=1);const e=strong.pendingEvent;if(e.matchFeedback){assert.equal(e.matchFeedback.category,'SENIOR');assert.ok(e.matchFeedback.blockGames<=1);}if(strong.player.careerStats.appearances){assert.match(e.title,/estreia no profissional/);assert.equal(e.kind,'MILESTONE');assert.ok(e.matchFeedback.minutes<=18);assert.ok(strong.player.debut);debutFound=true;}}
assert.ok(debutFound);assert.equal(strong.player.currentSeason.categories.U20.appearances,12);assert.equal(strong.player.currentSeason.categories.SENIOR.appearances,1);assert.equal(strong.player.careerStats.appearances,1);
const delayed=ready(662);delayed.player.currentSeason.categories=copy(strong.player.currentSeason.categories);delayed.player.currentSeason.categories.U20.avgRating=7.8;advanceCareer(delayed);resolveChoice(delayed,'promotion:wait');assert.equal(delayed.player.professionalStatus,'YOUTH');advanceCareer(delayed);assert.ok(!delayed.pendingEvent.id.startsWith('transition-'));assert.equal(delayed.player.careerStats.appearances,0);
// A single match creates a small change, with growth scaled by calendar length.
const young=ready(663),rng=new RNG(88);const before=overall(young.player);growthStep(young.player,rng);const delta=overall(young.player)-before;assert.ok(delta<=.4&&delta>=-.2);
const aged=ready(664);aged.player.age=20;aged.player.currentSeason.categories={U20:{appearances:20,starts:20,minutes:1500,goals:0,assists:0,avgRating:6}};advanceCareer(aged);assert.equal(aged.player.professionalStatus,'YOUTH');
// The final game remains visible; the season review happens on a separate interaction.
const closing=ready(665);closing.player.professionalStatus='SENIOR';closing.player.professionalTransition={mode:'PROTECTED',clubId:'gremio',youthBuzz:0,seniorMinutesAtStart:0};closing.player.careerStats.minutes=10000;closing.player.careerStats.appearances=100;closing.player.coaching=undefined;
const {ensureCoaching,syncCoachContext}=await import('../dist/core/coaches.js');const world=ensureCoaching(closing.player);world.progress=37/38;world.completedBlocks=37;closing.player.seasonTurn=37;syncCoachContext(closing.player);closing.player.tactical.discussedFor=closing.player.season;
advanceCareer(closing);assert.equal(closing.player.season,2026);assert.ok(closing.player.seasonReviewDue);assert.ok(closing.pendingEvent.matchFeedback);resolveChoice(closing,closing.pendingEvent.choices[0].id);advanceCareer(closing);assert.equal(closing.player.season,2027);assert.equal(closing.pendingEvent.kind,'SEASON_END');
console.log(JSON.stringify({automaticAgePromotion:false,observedYouthGate:'PASS',separateCategories:'PASS',invitationBeforeDebut:'PASS',debutMilestone:'PASS',firstMinutes:strong.player.debut.minutes,oneMatchPerTurn:'PASS',canDelayPromotion:'PASS',singleMatchOVRDelta:Number(delta.toFixed(2))},null,2));
