import {groupAttackSupply,groupCoverRisk} from './group.js';
import {lifestylePerformancePenalty} from './lifestyle.js';
import { RNG, clamp } from './random.js';
import { tacticalRating, roleRating } from './positions.js';
import type { Club, PlayerState, PlayablePosition } from './types.js';

export interface MatchResult {
  opponentId: string;
  home: boolean;
  started: boolean;
  teamGoals: number;
  oppGoals: number;
  minutes: number;
  goals: number;
  assists: number;
  motm: boolean;
  yellow: boolean;
  red: boolean;
  rating: number;
  xg: number;
  xa: number;
  saves: number;
  cleanSheet: boolean;
  headline: string;
  ratingReason?:string;
  groupCovers?:number;
}

/** Offensive notes describe observed output, not the player's underlying skill. */
export function observedAttackRating(position:PlayerState['position'],m:Pick<MatchResult,'rating'|'minutes'|'goals'|'assists'|'xg'|'xa'>):{rating:number;ratingReason?:string}{
  if(position!=='ST'&&position!=='WG')return {rating:m.rating};
  if(m.goals>0)return {rating:Number(Math.min(m.rating,Math.min(10,7.6+m.goals*.6+m.assists*.3)).toFixed(1)),ratingReason:`${m.goals} gol${m.goals===1?'':'s'} e ${m.assists} assistência${m.assists===1?'':'s'} entram na avaliação ofensiva.`};
  if(m.assists>0)return {rating:Math.min(m.rating,7.8+m.assists*.3),ratingReason:`Sem gol, mas ${m.assists} assistência${m.assists===1?'':'s'} registra${m.assists===1?'':'m'} contribuição direta ao ataque.`};
  if(m.xa>=.5)return {rating:Math.min(m.rating,m.xa>=1?7.8:7.2),ratingReason:`Sem participação direta em gol; xA ${m.xa.toFixed(2)} registra criação de oportunidades.`};
  const waste=m.minutes>=30&&m.xg>=.6;
  const cap=m.minutes<30?6.5:waste?6.0:6.3;
  return {rating:Number(Math.min(m.rating,cap).toFixed(1)),ratingReason:`Sem gol ou assistência, com xA ${m.xa.toFixed(2)}${waste?` e xG ${m.xg.toFixed(2)} sem conversão`:''}. ${m.minutes<30?'A participação curta limita a avaliação.':'A nota reflete pouca produção ofensiva registrada.'}`};
}

function poisson(rng:RNG,lambda:number):number{
  const L=Math.exp(-lambda);let k=0,p=1;
  do{k++;p*=rng.next();}while(p>L&&k<14);
  return k-1;
}

const goalShare:Record<PlayablePosition,number>={GK:.001,CB:.045,FB:.035,DM:.045,CM:.075,AM:.135,WG:.19,ST:.275};
const assistShare:Record<PlayablePosition,number>={GK:.004,CB:.025,FB:.09,DM:.075,CM:.145,AM:.205,WG:.19,ST:.085};
const cardBase:Record<PlayablePosition,number>={GK:.025,CB:.105,FB:.085,DM:.11,CM:.055,AM:.035,WG:.03,ST:.035};

export function simulatePlayerMatch(player:PlayerState,own:Club,opponent:Club,rng:RNG,started=true,importance=1,fixture?:{home:boolean;teamGoals:number;oppGoals:number;minutes?:number}):MatchResult{
  const pos=(player.position==='IND'?'CM':player.position) as PlayablePosition;
  const compFactor=own.division==='A'?1:own.division==='B'?.92:own.division==='C'?.84:.78;
  const rawOv=roleRating(player,pos);
  const effective=tacticalRating(player,pos);
  const eff=clamp(effective/Math.max(30,rawOv),.68,1.12);
  const emotional=1+((player.morale-50)/100)*.035+((player.confidence-50)/100)*.045-Math.max(0,player.pressure-50)/100*(.025+(100-player.dna.pressureResponse)/100*.08)-player.mentalFatigue/100*.025;
  const playerLevel=rawOv*eff*emotional-lifestylePerformancePenalty(player);
  const ownStrength=own.prestige*.68+own.finance*.12+own.youth*.20;
  const oppStrength=opponent.prestige*.68+opponent.finance*.12+opponent.youth*.20;
  const home=fixture?.home??rng.chance(.5);
  const homeEdge=home ? .12 : -.07;
  const qualityEdge=clamp((ownStrength-oppStrength)/75,-.48,.48);
  const playerEdge=clamp((playerLevel-(ownStrength*.78))/100,-.12,.16);
  const supply=player.tactical?.support??.5;
  const teamLambda=clamp(1.28+qualityEdge+homeEdge+playerEdge,.28,3.2);
  const oppLambda=clamp(1.18-qualityEdge*.83-homeEdge*.55-(pos==='GK'||pos==='CB'||pos==='DM'?playerEdge*.35:0),.25,3.0);
  const teamGoals=fixture?.teamGoals??poisson(rng,teamLambda);
  const oppGoals=fixture?.oppGoals??poisson(rng,oppLambda);
  const minutes=fixture?.minutes??(started?rng.int(70,90):rng.int(12,38));
  const minFactor=minutes/90;
  const starFactor=clamp(.72+(playerLevel-ownStrength*.72)/85,.55,1.42);
  const groupSupply=groupAttackSupply(player);
  let goals=0,assists=0;
  for(let i=0;i<teamGoals;i++){
    if(rng.chance(goalShare[pos]*starFactor*minFactor*(.85+supply*.3)*groupSupply))goals++;
    else if(rng.chance(assistShare[pos]*starFactor*minFactor*groupSupply))assists++;
  }
  // Rare individual events can occur even in low-scoring games; keeps careers from feeling mechanically tied to score allocation.
  if(pos!=='GK'&&teamGoals>0&&goals===0&&assists<teamGoals&&rng.chance(goalShare[pos]*.12*starFactor*minFactor*groupSupply))goals=1;
  const finishing=(player.attributes.finishing+player.attributes.positioning)/200;
  const creation=(player.attributes.vision+player.attributes.passing+player.attributes.crossing)/300;
  const xg=Number(clamp((goals*.55+rng.float(.02,.36)*goalShare[pos]*5)*minFactor*(.72+finishing*.5)*groupSupply,0,2.7).toFixed(2));
  const xa=Number(clamp((assists*.48+rng.float(.02,.32)*assistShare[pos]*5)*minFactor*(.72+creation*.5)*groupSupply,0,2.5).toFixed(2));
  const saves=pos==='GK'?Math.max(0,poisson(rng,clamp(2.7+oppLambda*.75,1.3,6.8))):0;
  const cleanSheet=pos==='GK'&&oppGoals===0&&minutes>=60;
  const risk=cardBase[pos]*minFactor+(player.pressure/1000)*importance,draw=rng.next();
  const coordinatedRisk=risk*(minutes>0?groupCoverRisk(player):1);
  const yellow=draw<coordinatedRisk;
  const groupCovers=coordinatedRisk<risk&&draw>=coordinatedRisk&&draw<risk?1:0;
  const red=yellow ? rng.chance((pos==='CB'||pos==='DM') ? .035 : .018) : rng.chance((pos==='CB'||pos==='DM') ? .004 : .0015);
  const resultImpact=teamGoals>oppGoals ? .28 : teamGoals<oppGoals ? -.24 : .03;
  const defensiveImpact=(pos==='GK' ? saves*.055+(cleanSheet ? .28 : 0) : ['CB','FB','DM'].includes(pos) ? (oppGoals===0 ? .22 : 0) : 0);
  const fitImpact=(eff-1)*2.2;
  const consistencyNoise=rng.normal(0,.48-(player.dna.consistency/100)*.18);
  const rawRating=Number(clamp(6.15+resultImpact+goals*.82+assists*.58+defensiveImpact+fitImpact+consistencyNoise+(playerLevel-62)/115,4.0,10).toFixed(1));
  const {rating,ratingReason}=observedAttackRating(pos,{rating:rawRating,minutes,goals,assists,xg,xa});
  const motm=rating>=8.0&&rng.chance(clamp(.30+(rating-8)*.34+importance*.02,.25,.92));
  const headline=goals>=3?`Hat-trick: ${own.shortName} tem um protagonista.`:
    goals>0&&assists>0?`${goals} gol${goals>1?'s':''} e ${assists} assistência${assists>1?'s':''}.`:
    goals>0?`${goals} gol${goals>1?'s':''} na partida.`:
    assists>0?`${assists} assistência${assists>1?'s':''}.`:
    pos==='GK'&&cleanSheet?`${saves} defesas e jogo sem sofrer gol.`:
    rating>=7.6?'Atuação de alto nível sem participação direta em gol.':'Partida concluída.';
  return {opponentId:opponent.id,home,started,teamGoals,oppGoals,minutes,goals,assists,motm,yellow,red,rating,xg,xa,saves,cleanSheet,headline,groupCovers,...(ratingReason?{ratingReason}:{})};
}
