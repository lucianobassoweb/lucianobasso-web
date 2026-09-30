import type { PlayerState, CompetitionCategory } from './types.js';
import {CLUB_BY_ID} from '../data/clubs-br-2026.js';
export function ensureProfessionalStatus(p:PlayerState):void{
  // Migration infers senior status solely for existing saves; new careers carry an explicit YOUTH flag.
  if(!p.professionalStatus)p.professionalStatus=p.careerStats.appearances>0||p.age>20&&!!p.currentClubId?'SENIOR':'YOUTH';
}
export function competitionCategory(p:PlayerState):CompetitionCategory{
  ensureProfessionalStatus(p);
  if(p.professionalStatus==='SENIOR'&&p.currentClubId)return 'SENIOR';
  return p.age<=14?'U15':p.age<=15?'U17':p.age<=20?'U20':'AMATEUR';
}
export const CATEGORY_LABEL:Record<CompetitionCategory,string>={U15:'Sub-15',U17:'Sub-17',U20:'Sub-20',AMATEUR:'Futebol local / amador',SENIOR:'Profissional'};
export function seasonGames(p:PlayerState):number{
  if(competitionCategory(p)!=='SENIOR')return 20;
  return CLUB_BY_ID[p.currentClubId!]?.division==='D'?14:38;
}
export function calendarScale(p:PlayerState):number{return 9/seasonGames(p);}
export function promotionEvidence(p:PlayerState):{eligible:boolean;games:number;rating:number;minutes:number}{
  const records=[p.currentSeason,...p.seasonHistory.filter(s=>s.age>=16&&s.age<=20).slice(0,1)];
  const categories=records.flatMap(s=>[s.categories?.U20].filter(x=>x!==undefined));
  const games=categories.reduce((sum,s)=>sum+s.appearances,0),minutes=categories.reduce((sum,s)=>sum+s.minutes,0);
  const rating=games?categories.reduce((sum,s)=>sum+s.avgRating*s.appearances,0)/games:0;
  const threshold=p.position==='GK'?7.05:['CB','FB','DM'].includes(p.position)?6.95:7.2;
  return {eligible:p.age>=16&&p.age<=20&&!!p.currentClubId&&games>=8&&minutes>=420&&rating>=threshold,games,rating,minutes};
}
