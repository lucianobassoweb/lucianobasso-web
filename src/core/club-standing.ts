import type {PlayerState} from './types.js';
/** Rendering reads the existing table; it never creates a world or appoints a coach. */
export function clubStanding(p:PlayerState){
  if(!p.currentClubId)return {label:'Sem tabela',detail:'A escolinha ainda não tem classificação de campeonato simulada.'};
  const senior=p.professionalStatus==='SENIOR'||p.professionalStatus===undefined&&p.careerStats.appearances>0;
  if(!senior)return {label:'Sem tabela',detail:'O campeonato da base ainda não tem tabela simulada.'};
  const w=p.coaching,campaign=w?.campaigns[p.currentClubId];
  if(!w||!campaign)return {label:'Não registrada',detail:'Este save não registra a tabela do campeonato.'};
  if(campaign.games===0)return {label:'Sem jogos',detail:`${w.season}: a campanha ainda não começou.`};
  const table=Object.values(w.campaigns).filter(c=>c.group===campaign.group).sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor||a.clubId.localeCompare(b.clubId));
  const rank=table.findIndex(c=>c.clubId===p.currentClubId)+1,group=campaign.group.startsWith('D')?`D · grupo ${campaign.group.slice(1)}`:campaign.group;
  return {label:`${rank}º · Série ${group}`,detail:`${w.season}: ${rank}º de ${table.length} clubes, ${campaign.points} pontos em ${campaign.games} jogos.`};
}
