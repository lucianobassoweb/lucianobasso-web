import {CLUB_BY_ID} from '../data/clubs-br-2026.js';
import {clamp} from './random.js';
import type {Club,PlayerState} from './types.js';

export type PayKind='AID'|'SALARY';
export interface Compensation {kind:PayKind;clubId:string;monthly:number;agreedSeason:number;lastReviewedSeason:number;}
function professional(p:PlayerState):boolean{return p.professionalStatus==='SENIOR'||!p.professionalStatus&&(p.careerStats.appearances>0||p.age>20&&!!p.currentClubId);}
const round=(v:number)=>Math.round(v/50)*50;

/** Fictional BRL/month negotiation model. Fees paid to clubs are not player income. */
export function quoteCompensation(p:PlayerState,club:Club):{kind:PayKind;monthly:number} {
  const acquired=Object.values(p.attributes).reduce((sum,v)=>sum+v,0)/Object.keys(p.attributes).length;
  if(!professional(p))return {kind:'AID',monthly:round(clamp(150+club.finance*6+Math.max(0,p.age-12)*90+acquired*8+p.reputation*8,150,3500))};
  const floor={A:12000,B:6000,C:3000,D:1500}[club.division],budget=.45+club.finance/100;
  const experience=.55+.45*clamp(p.careerStats.minutes/4500,0,1),skill=Math.max(0,acquired-35)**2*35;
  return {kind:'SALARY',monthly:round(clamp((floor+skill+Math.max(0,p.marketValue)*.005)*budget*experience,1500,2500000))};
}

/** Read-only. Missing legacy terms must not become an invented historical salary. */
export function compensationView(p:PlayerState):{kind:'NONE'|PayKind;monthly:number|null;referenceMonthly:number;clubId:string|null;legacy:boolean} {
  const club=p.currentClubId?CLUB_BY_ID[p.currentClubId]:undefined;
  if(!club||p.phase==='APOSENTADO')return {kind:'NONE',monthly:0,referenceMonthly:0,clubId:null,legacy:false};
  const reference=quoteCompensation(p,club),agreement=p.compensation;
  const valid=agreement?.clubId===club.id&&agreement.kind===reference.kind;
  return {kind:reference.kind,monthly:valid?agreement.monthly:null,referenceMonthly:reference.monthly,clubId:club.id,legacy:!valid};
}

export function agreeCompensation(p:PlayerState,monthly?:number):void {
  const club=p.currentClubId?CLUB_BY_ID[p.currentClubId]:undefined;
  if(!club||p.phase==='APOSENTADO'){delete p.compensation;return;}
  const quote=quoteCompensation(p,club),cap=quote.kind==='AID'?3500:2500000;
  const minimum=quote.kind==='AID'?150:1500;
  const offered=monthly!==undefined&&Number.isFinite(monthly)&&monthly>=minimum&&monthly<=cap?monthly:quote.monthly;
  p.compensation={kind:quote.kind,clubId:club.id,monthly:offered,agreedSeason:p.season,lastReviewedSeason:p.season};
}

/** Accepted transitions only. Salary stays fixed until contract renewal or transfer. */
export function syncCompensation(p:PlayerState):void {
  const view=compensationView(p);
  if(view.kind==='NONE'){delete p.compensation;return;}
  if(view.legacy){agreeCompensation(p);return;}
  if(view.kind==='AID'&&p.compensation!.lastReviewedSeason<p.season)agreeCompensation(p);
}
