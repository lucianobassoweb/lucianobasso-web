import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {ensureCoaching,ensureCoachJob,syncCoachContext,coachBond,evaluateCoachJob,simulateWorldBlock,reviewWorldCoaches,coachChangeEvent,coachDossier,coachProfile,opportunityAdjustment} from '../dist/core/coaches.js';
import {REAL_COACHES,COACH_SOURCES} from '../dist/data/coaches.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
import {selectPosition} from '../dist/core/positions.js';
const copy=x=>structuredClone(x);
const make=seed=>{const s=createCareerWithSeed('Treinadores',seed);s.pendingEvent=null;const p=s.player;p.age=25;p.professionalStatus='SENIOR';p.currentClubId='gremio';p.position='AM';p.positionProficiency.AM=80;p.careerStats.minutes=10000;p.careerStats.appearances=100;p.professionalTransition={mode:'PROTECTED',clubId:'gremio',youthBuzz:0,seniorMinutesAtStart:0};syncCoachContext(p);p.tactical.discussedFor=p.season;return s;};
assert.ok(REAL_COACHES.length>=100);assert.equal(new Set(REAL_COACHES.map(c=>c.id)).size,REAL_COACHES.length);
for(const c of REAL_COACHES){assert.ok(c.sources.length);for(const source of c.sources)assert.ok(COACH_SOURCES[source]);}
const s=make(551),p=s.player,w=ensureCoaching(p),j=w.jobs.gremio,c=w.campaigns.gremio;
const bad={...j,games:18,points:6,expectedPPG:1.8,boardPatience:35};const badCampaign={...c,games:18,points:6,form:[0,0,0,0,0,0],expectedRank:3};
assert.ok(evaluateCoachJob(bad,badCampaign,19,20).dismiss);
const good={...j,games:18,points:42,expectedPPG:1.8};assert.equal(evaluateCoachJob(good,{...c,games:18,points:42,form:[3,3,3,3,3,3]},1,20).dismiss,false);
const twins=[copy(bad),copy(bad)];assert.deepEqual(evaluateCoachJob(twins[0],badCampaign,19,20),evaluateCoachJob(twins[1],badCampaign,19,20));
const modest={...j,games:18,points:20,expectedPPG:.8,boardPatience:60};assert.equal(evaluateCoachJob(modest,{...c,games:18,points:20,expectedRank:17,form:[1,3,0,1,3,0]},12,20).dismiss,false);
// A poor relationship can coexist with high professional confidence.
const oldId=j.coachId,bond=coachBond(p,oldId);bond.affinity=20;bond.trust=85;bond.conflict=65;bond.memories=['Conflito anterior'];syncCoachContext(p);const opportunity=opportunityAdjustment(p);bond.affinity=90;assert.equal(opportunityAdjustment(p),opportunity);bond.affinity=20;
w.jobs.gremio={...bad,coachId:oldId};w.campaigns.gremio=copy(badCampaign);
for(const x of Object.values(w.campaigns).filter(x=>x.group==='A'&&x.clubId!=='gremio')){x.points=30;x.games=18;}
reviewWorldCoaches(p);assert.notEqual(w.jobs.gremio.coachId,oldId);assert.ok(coachChangeEvent(p));assert.equal(coachBond(p,oldId).trust,85);assert.ok(coachBond(p,oldId).memories.includes('Conflito anterior'));
s.pendingEvent=coachChangeEvent(p);const club=p.currentClubId;resolveChoice(s,'coach:leave');assert.equal(p.currentClubId,club);assert.equal(p.transferIntent,'LEAVE');
// Rehire preserves person-bound history rather than resetting with a new club.
const occupied=Object.entries(w.jobs).find(([id,job])=>id!=='gremio'&&job.coachId===oldId);if(occupied)delete w.jobs[occupied[0]];
w.jobs.gremio.coachId=oldId;syncCoachContext(p);assert.equal(p.tactical.trust,85);assert.match(coachDossier(p,'gremio'),/Reencontro/);
assert.equal(new Set(Object.values(w.jobs).map(x=>x.coachId)).size,Object.keys(w.jobs).length);
// Bench and injury do not stop the club's calendar; paired world states give identical club results.
const healthy=make(552),injured=copy(healthy);injured.player.injury={remainingBlocks:5,longAbsence:true,returnDiscussed:false};
for(let block=1;block<=38;block++){healthy.player.seasonTurn=block;injured.player.seasonTurn=block;simulateWorldBlock(healthy.player);simulateWorldBlock(injured.player);}
assert.equal(healthy.player.coaching.campaigns.gremio.games,38);assert.equal(injured.player.coaching.campaigns.gremio.games,38);assert.equal(injured.player.currentSeason.appearances,0);
assert.equal(Object.values(healthy.player.coaching.campaigns).reduce((sum,x)=>sum+x.goalsFor-x.goalsAgainst,0),0);
assert.equal(Object.values(healthy.player.coaching.campaigns).reduce((sum,x)=>sum+x.wins-x.losses,0),0);
const preserved=copy(healthy.player.coaching.campaigns);simulateWorldBlock(healthy.player);assert.deepEqual(healthy.player.coaching.campaigns,preserved);
// Every actual block presents decisions and match feedback, with position attribution.
const playable=make(553);playable.player.debut={season:2025,age:24,clubId:'gremio',opponentId:'santos',minutes:12};for(const k of Object.keys(playable.player.attributes))playable.player.attributes[k]=75;
advanceCareer(playable);assert.ok(playable.pendingEvent.choices.length);assert.ok(playable.pendingEvent.matchFeedback);
const feedback=playable.pendingEvent.matchFeedback;assert.ok(feedback.minutes>=0&&feedback.minutes<=90);assert.ok(feedback.goals+feedback.assists<=feedback.teamGoals);assert.ok(feedback.fanReaction&&feedback.coachReaction);
assert.equal(playable.player.currentSeason.primaryPosition,'AM');assert.equal(playable.player.currentSeason.positionAppearances.AM,playable.player.currentSeason.appearances);
// A legacy saved match still offers its original conversation, regardless of the new routine rotation.
delete playable.pendingEvent.decisionCaseId;delete playable.pendingEvent.decisionCaseContext;
playable.pendingEvent.choices=[{id:'career:discuss',label:'Conversar sobre meu papel'}];
const before=copy(playable.player.attributes);resolveChoice(playable,'career:discuss');assert.ok(playable.pendingEvent.id.startsWith('coach-talk'));resolveChoice(playable,'coach-talk:challenge');assert.ok(coachBond(playable.player,playable.player.tactical.coachId).conflict>0);assert.deepEqual(playable.player.attributes,before);
// Historical positions survive a later reconversion and yearly archive.
let guard=0;while(playable.player.seasonTurn<5&&guard++<40){const e=playable.pendingEvent;if(e?.choices?.length)resolveChoice(playable,e.choices[0].id);else advanceCareer(playable);}
const prior=copy(playable.player.currentSeason.positionAppearances);selectPosition(playable.player,'ST');playable.pendingEvent=null; // Direct fixture reconversion discards the old position's decision.
while(playable.player.season===2026&&guard++<300){const e=playable.pendingEvent;if(e?.choices?.length)resolveChoice(playable,e.choices[0].id);else advanceCareer(playable);}
const archived=playable.player.seasonHistory[0];assert.ok(archived.positionsPlayed.includes('AM')&&archived.positionsPlayed.includes('ST'));assert.equal(archived.positionAppearances.AM,prior.AM);
const archive=copy(archived);selectPosition(playable.player,'CB');assert.deepEqual(playable.player.seasonHistory[0],archive);
// A stale coach snapshot requires explicit reconsideration, not a blind transfer.
const offer=make(554);ensureCoachJob(offer.player,'caxias');const coachBefore=offer.player.coaching.jobs.caxias.coachId;
offer.pendingEvent={id:'offer',kind:'MARKET',title:'Proposta',body:'',tags:[],payload:{coachOffers:{caxias:coachBefore}},choices:[{id:'market:caxias:500000:2026',label:'Aceitar'}]};
const free=REAL_COACHES.find(x=>!x.historicalOnly&&!Object.values(offer.player.coaching.jobs).some(j=>j.coachId===x.id));offer.player.coaching.jobs.caxias.coachId=free.id;
resolveChoice(offer,'market:caxias:500000:2026');assert.equal(offer.player.currentClubId,'gremio');assert.equal(offer.pendingEvent.id,'market-reconsider');resolveChoice(offer,offer.pendingEvent.choices[0].id);assert.equal(offer.player.currentClubId,'caxias');
// Foreign integration uses player/club context, never a nationality quality penalty.
const foreign=make(555);foreign.player.nationality='Japan';const profile=coachProfile(foreign.player.tactical.coachId),native=copy(foreign);native.player.nationality='Brazil';assert.ok(Math.abs(opportunityAdjustment(foreign.player)-opportunityAdjustment(native.player)-(profile.integration-60)/450)<1e-9);
console.log(JSON.stringify({realIdentities:REAL_COACHES.length,sources:Object.keys(COACH_SOURCES).length,deterministicDismissal:'PASS',expectationRelativeResults:'PASS',distinctAffinityTrust:'PASS',persistentReunion:'PASS',uniqueAppointments:'PASS',injuryCalendar:'38 games',worldBalance:'PASS',decisionEveryBlock:'PASS',matchFeedback:'PASS',seasonPositions:'PASS',staleProposal:'PASS',foreignIntegration:'PASS'},null,2));
