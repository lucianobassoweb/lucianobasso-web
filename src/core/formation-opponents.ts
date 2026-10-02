import {BRAZIL_CLUBS_2026,CLUB_BY_ID} from '../data/clubs-br-2026.js';
import {hashSeed} from './random.js';
import type {PlayerState} from './types.js';

export interface FormationOpponent {id:string;name:string;source:'CLUB'|'LOCAL';}

const localTeams=['Escola de Futebol União','Projeto Bola na Rede','Academia Nova Geração','Escola de Futebol Estrela','Projeto Craques do Bairro','Academia Horizonte','Escola de Futebol Aliança','Projeto Primeiro Passe','Escola de Futebol Vitória','Academia Caminho do Gol'];

/** Experimental identity schedule, separate from strength and sporting RNG. Not an official youth fixture list. */
export function formationOpponent(p:PlayerState):FormationOpponent {
  const own=p.currentClubId?CLUB_BY_ID[p.currentClubId]:undefined;
  const city=p.life?.residence?.trim()||p.hometown?.trim()||'Sua cidade';
  let candidates:FormationOpponent[];
  if(own){
    const regional=BRAZIL_CLUBS_2026.filter(c=>c.id!==own.id&&c.state===own.state);
    // Missing regional data must not produce self-play or undefined names.
    const pool=regional.length?regional:BRAZIL_CLUBS_2026.filter(c=>c.id!==own.id);
    candidates=pool.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0).map(c=>({id:c.id,name:c.shortName,source:'CLUB' as const}));
  }else{
    const placeId=hashSeed(city).toString(16);
    candidates=localTeams.map((name,i)=>({id:`local-${placeId}-${i}`,name:`${name} · ${city}`,source:'LOCAL' as const})).filter(c=>c.name!==p.life?.localSchool);
  }
  const offset=hashSeed(`${p.season}|${own?.id??city}`)%candidates.length;
  const round=Math.max(0,Math.floor(p.seasonTurn)-1);
  return candidates[(offset+round)%candidates.length]!;
}
