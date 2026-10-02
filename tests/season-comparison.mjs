import assert from 'node:assert/strict';
import {compareSeason} from '../dist/core/season-comparison.js';
const a={season:2027,appearances:20,minutes:1500,goals:8,assists:4,motm:3,avgRating:7.1,clubId:'gremio'},b={...a,season:2026,appearances:18,minutes:1200,goals:9,assists:2,motm:3,avgRating:6.8};
const history=[a,b,{...b,season:2025}],before=JSON.stringify(history);const c=compareSeason(a,history);assert.equal(c.previous,b);assert.deepEqual(c.metrics.map(m=>m.delta),[2,300,-1,2,0,.3]);assert.equal(JSON.stringify(history),before);
assert.ok(compareSeason(a,[{...b,season:2025}]).metrics.every(m=>m.delta===null));assert.ok(compareSeason(a,[]).metrics.every(m=>m.delta===null));const empty={...b,appearances:0,avgRating:0};assert.equal(compareSeason(a,[empty]).metrics.find(m=>m.key==='avgRating').delta,null);const absent={...b};delete absent.motm;assert.equal(compareSeason(a,[absent]).metrics.find(m=>m.key==='motm').delta,null);assert.equal(compareSeason({...a,clubId:'vasco'},history).metrics[0].delta,2);
console.log('PASS annual exact previous year/6 metrics/signed delta/no rating sample/missing history/read-only/changed club totals');
