import type { SaveGame } from './types.js';
const KEY='1903.save.playable2';
export const loadSave=():SaveGame|null=>{try{const raw=localStorage.getItem(KEY);if(!raw)return null;const save=JSON.parse(raw) as SaveGame;return save?.version==='0.1.0-playable.2'?save:null;}catch{return null}};
export const storeSave=(save:SaveGame)=>localStorage.setItem(KEY,JSON.stringify(save));
export const clearSave=()=>localStorage.removeItem(KEY);
export function exportDiagnostic(save:SaveGame):void{
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),build:save.version,save},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`1903-diagnostico-${save.player.id}.json`;a.click();URL.revokeObjectURL(url);
}
