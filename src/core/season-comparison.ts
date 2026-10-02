import type {SeasonStats} from './types.js';
export function compareSeason(record:SeasonStats,history:readonly SeasonStats[]){
  const previous=history.find(s=>s.season===record.season-1);
  const metrics=[['appearances','J'],['minutes','min'],['goals','G'],['assists','A'],['motm','MOTM'],['avgRating','Nota']] as const;
  return {previous,metrics:metrics.map(([key,label])=>{const current=record[key],prior=previous?.[key];const comparable=Number.isFinite(current)&&Number.isFinite(prior)&&(key!=='avgRating'||record.appearances>0&&(previous?.appearances??0)>0);return {key,label,current,previous:prior,delta:comparable?Number((current-prior!).toFixed(key==='avgRating'?2:0)):null};})};
}
