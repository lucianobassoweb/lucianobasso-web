const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=require('path').resolve(__dirname,'..');
const server=require('child_process').spawn('python3',['-u','-m','http.server','8014','--bind','127.0.0.1'],{cwd:root,stdio:['ignore','pipe','pipe']});
(async()=>{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',()=>reject(Error('Server failed')));});
 const browser=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8014');await page.locator('#new').click();await page.locator('#advance').click();
 await page.locator('[data-choice="position:AM"]').click();await page.locator('[data-choice="education:BALANCED"]').click();
 let transitions=3;
 for(let i=0;i<45;i++){
  const choices=page.locator('[data-choice]');
  if(await choices.count()){
   const education=page.locator('[data-choice="education:BALANCED"]');const position=page.locator('[data-choice="position:AM"]');const role=page.locator('[data-choice="role:stay"]');
   if(await education.count())await education.click();else if(await position.count())await position.click();else if(await role.count())await role.click();else await choices.first().click();
  }else await page.locator('#advance').click();
  if(await page.locator('.event-card').count()===0)throw Error('Missing career event');transitions++;
 }
 for(const tab of ['player','stats','world','career']){await page.locator(`[data-tab="${tab}"]`).click();if((await page.locator('#app').innerText()).trim().length<50)throw Error('Blank tab');}
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);if(overflow)throw Error('Horizontal overflow');
 await page.screenshot({path:require('path').join(root,'ui-mobile-0.2.0.png'),fullPage:true});
 await page.reload();if(await page.locator('.player-head').count()!==1)throw Error('Save not restored');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('1903.save.playable2'));s.player.age=35;s.player.phase='VETERANO';s.player.currentClubId='gremio';s.player.tactical=undefined;s.pendingEvent=null;localStorage.setItem('1903.save.playable2',JSON.stringify(s));});
 await page.reload();await page.locator('#advance').click();await page.locator('[data-choice="role:HOLD"]').click();
 await context.setOffline(true);await page.reload();if(await page.locator('.player-head').count()!==1)throw Error('Offline not restored');
 if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({viewport:'390x844',transitions,tabs:4,horizontalOverflow:false,pageErrors:errors,adultRoleNegotiation:'PASS',saveReload:'PASS',offlineReload:'PASS'},null,2));await browser.close();server.kill();
})().catch(e=>{console.error(e);server.kill();process.exit(1)});
