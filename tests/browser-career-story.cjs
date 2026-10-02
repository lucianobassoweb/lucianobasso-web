const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('path');const root=path.resolve(__dirname,'..');
const server=require('child_process').spawn('python3',['-u','-m','http.server','8015','--bind','127.0.0.1'],{cwd:root,stdio:['ignore','pipe','pipe']});
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',()=>reject(Error('Server failed')));});
 const browser=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8015');await page.locator('#birth-city').fill('Caxias do Sul');await page.locator('#birth-state').selectOption('RS');await page.locator('#heart-club').selectOption('gremio');await page.locator('#new').click();
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('1903.save.playable2')),p=s.player;p.id='p-e2e-debut';p.rngState=888888;p.dna.injuryResistance=100;p.dna.consistency=70;p.dna.pressureResponse=70;p.heightCm=178;p.weightKg=75;p.age=17;p.phase='BASE';p.currentClubId='gremio';p.position='AM';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;p.professionalStatus='YOUTH';p.positionProficiency.AM=70;for(const k of Object.keys(p.attributes))p.attributes[k]=70;p.currentSeason.appearances=12;p.currentSeason.categories={U20:{appearances:12,starts:12,minutes:800,goals:8,assists:6,avgRating:7.7}};s.pendingEvent=null;localStorage.setItem('1903.save.playable2',JSON.stringify(s));});
 await page.reload();await page.locator('#advance').click();if(!(await page.locator('.event-card').innerText()).includes('convite'))throw Error('Missing invitation');await page.locator('[data-choice="transition:PROTECTED"]').click();
 let debuted=false;
 for(let i=0;i<80;i++){
   if((await page.locator('.event-card').innerText()).includes('Sua estreia no profissional')){debuted=true;break;}
   if(await page.locator('[data-choice]').count())await page.locator('[data-choice]').first().click();else await page.locator('#advance').click();
 }
 if(!debuted)throw Error('Missing debut');if(await page.locator('.performance-card').count()!==1)throw Error('Missing performance card');
 await page.locator('.reaction-details summary').click();const feedback=await page.locator('.performance-card').innerText();for(const word of ['Profissional','MINUTOS','GOLS','ASSIST.','TORCIDA'])if(!feedback.includes(word))throw Error('Missing feedback '+word);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('1903.save.playable2')));if(saved.player.debut.minutes>18)throw Error('Debut not gradual');
 await page.screenshot({path:path.join(root,'ui-debut-0.3.0.png'),fullPage:true});
 await page.locator('[data-tab="world"]').click();if(await page.locator('.coach-card').count()!==1)throw Error('Missing coach');if(await page.locator('.league-row').count()!==20)throw Error('Missing league');await page.locator('.coach-database summary').click();await page.locator('#coach-search').fill('Guardiola');if(await page.locator('.coach-db-row').count()!==1)throw Error('Coach search failed');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('1903.save.playable2'));s.player.seasonHistory=[{...s.player.currentSeason,season:2025,age:16,primaryPosition:'AM',positionsPlayed:['AM','ST'],positionAppearances:{AM:10,ST:2},categories:{U20:{appearances:10,starts:10,minutes:750,goals:5,assists:4,avgRating:7.5},SENIOR:{appearances:2,starts:0,minutes:24,goals:0,assists:0,avgRating:6.4}}}];localStorage.setItem('1903.save.playable2',JSON.stringify(s));});
 await page.reload();await page.locator('[data-tab="stats"]').click();const stats=await page.locator('.season-card').first().innerText();for(const word of ['Meia ofensivo','Atacante','Sub-20','Profissional'])if(!stats.includes(word))throw Error('Missing season detail '+word);
 for(const tab of ['career','player','stats','world']){await page.locator(`[data-tab="${tab}"]`).click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+tab);}
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({viewport:'390x844',invitation:'PASS',debut:'PASS',firstMinutes:saved.player.debut.minutes,performanceCard:'PASS',coachCard:'PASS',leagueTable:'PASS',coachSearch:'PASS',historicalPositions:'PASS',categoryStatistics:'PASS',overflow:false,pageErrors:errors},null,2));await browser.close();server.kill();
})().catch(e=>{console.error(e);server.kill();process.exit(1)});
