import {clamp} from './random.js';
import type {PlayerState} from './types.js';

/** Habits across the interval between rounds; these are game costs, not meal physiology. */
export function ensureLifestyle(p:PlayerState) {
  return p.lifestyle??={happiness:50,excessKg:0,sleepDebt:0,lastProcessedTurn:Math.max(0,p.careerTurn-1)};
}
/** Reading performance never initializes or rewrites a legacy player. */
export function lifestylePerformancePenalty(p:PlayerState):number {
  return clamp((p.lifestyle?.excessKg??0)*1.5+(p.lifestyle?.sleepDebt??0)*1.5,0,8);
}
/** Called after a match so a chosen habit affects that match before recovery. */
export function stepLifestyle(p:PlayerState):void {
  const life=p.lifestyle;
  if(!life||life.lastProcessedTurn>=p.careerTurn)return;
  const recovered=Math.min(life.excessKg,.04);
  life.excessKg=Number((life.excessKg-recovered).toFixed(4));
  if(recovered>0)p.weightKg=Number((p.weightKg-recovered).toFixed(4));
  life.sleepDebt=Number(Math.max(0,life.sleepDebt-.35).toFixed(4));
  life.lastProcessedTurn=p.careerTurn;
}
