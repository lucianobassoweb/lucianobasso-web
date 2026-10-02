declare const process:{argv:string[]};
import { createCareerWithSeed } from '../core/engine.js';
import { rankedNaturalPositions } from '../core/positions.js';
import { hashSeed } from '../core/random.js';
const n=Math.max(100,Number(process.argv[2]??10000));const d:Record<string,number>={};
for(let i=0;i<n;i++){const s=createCareerWithSeed('x',hashSeed(`dist-${i}`));const p=rankedNaturalPositions(s.player)[0]!.position;d[p]=(d[p]??0)+1;}
for(const k of Object.keys(d))d[k]=Number((d[k]!/n*100).toFixed(1));console.log(JSON.stringify({n,distribution:d},null,2));
