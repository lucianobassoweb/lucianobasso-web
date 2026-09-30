const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('path'),fs=require('fs');const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const results=[];
 for(const viewport of [{width:390,height:844},{width:1440,height:960}]){
  const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'1903-playable-0.3.0.html'));await page.locator('#new').click();if(await page.locator('.player-head').count())throw Error('Created without roots');
  await page.locator('#birth-city').fill('Caxias do Sul');if(await page.locator('#birth-state').inputValue()!=='RS')throw Error('Known state not selected');await page.locator('#heart-club').selectOption('flamengo');
  await page.screenshot({path:path.join(root,`ui-start-${viewport.width}.png`),fullPage:true});
  await page.locator('#new').click();let save=await page.evaluate(()=>JSON.parse(localStorage.getItem('1903.save.playable2')));if(save.player.hometown!=='Caxias do Sul'||save.player.life.originState!=='RS'||save.player.heartClubId!=='flamengo'||save.player.currentClubId!==null)throw Error('Roots or local school wrong');
  await page.locator('#advance').click();await page.locator('[data-choice="position:AM"]').click();await page.locator('[data-choice="education:BALANCED"]').click();
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(root,`ui-career-${viewport.width}.png`),fullPage:true});
  const columns=await page.locator('.career-layout').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);if(viewport.width===1440&&columns!==2)throw Error('Desktop did not use two columns');
  for(const tab of ['career','player','stats','world']){await page.locator(`[data-tab="${tab}"]`).click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+tab);if(await page.locator(`[data-tab="${tab}"]`).getAttribute('aria-current')!=='page')throw Error('Navigation state missing');}
  await page.reload();save=await page.evaluate(()=>JSON.parse(localStorage.getItem('1903.save.playable2')));if(save.player.hometown!=='Caxias do Sul'||save.player.heartClubId!=='flamengo')throw Error('Roots lost on reload');
  // Text enlargement and an origin outside the suggested cities.
  await page.evaluate(()=>document.documentElement.style.fontSize='32px');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('200% overflow');
  await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('#birth-city').fill('Palmas');await page.locator('#birth-state').selectOption('TO');await page.locator('#heart-club').selectOption('gremio');await page.locator('#new').click();save=await page.evaluate(()=>JSON.parse(localStorage.getItem('1903.save.playable2')));if(save.player.hometown!=='Palmas'||save.player.life.originState!=='TO'||save.player.life.residence!=='Palmas'||!save.player.life.localSchool.includes('Palmas'))throw Error('Custom city lost');
  if(errors.length)throw Error(errors.join('\n'));results.push({viewport,requiredRoots:'PASS',knownCity:'PASS',customCity:'PASS',independentHeartClub:'PASS',localSchool:'PASS',saveReload:'PASS',navigation:'PASS',horizontalOverflow:false,textEnlargement:'PASS',pageErrors:errors});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(root,'browser-ui-results-0.3.0.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
