/*
 * Pure URL-text heuristics. This file never performs network, DNS, WHOIS, or API requests.
 *
 * Regression contract verified in Chromium:
 * - https://www.google.com -> none
 * - http://192.168.1.1/login -> IP address used as a destination; No HTTPS
 * - https://real-site.com@evil-site.com/ -> @ symbol trick
 * - https://paypal.com.verify-account.xyz -> Suspicious subdomain structure; Brand name with unexpected TLD
 * - https://paypa1.com -> Possible paypal lookalike
 * - https://accounts.google.com -> none
 * - http://example.com -> No HTTPS
 * - https://bit.ly/3xyzabc -> Known URL shortener
 * - https://xn--pypal-4ve.com -> Punycode / homoglyph indicator
 * - https://my-personal-blog-about-cooking.com -> none
 * - https://a.b.c.d.e.paypal-support.tk -> Suspicious subdomain structure; Brand name with unexpected TLD
 *
 * Shared dependency: js/ui/tooltip.js provides the click/tap tooltip used by
 * this module's Learn glossary. Re-test both click and touch/tap behavior here
 * whenever that shared component changes.
 */
(function(root) {
  const BRANDS = ['paypal','google','microsoft','amazon','apple','facebook','netflix','bankofamerica','chase','wellsfargo','instagram','whatsapp','ebay','linkedin','dropbox','spotify','steam','discord'];
  const SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','is.gd','ow.ly','buff.ly','rb.gy','cutt.ly'];
  const oddTlds = ['tk','xyz','top','click','gq','ml','cf','work','link'];
  function distance(a,b){const m=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=m[0];m[0]=i;for(let j=1;j<=b.length;j++){let old=m[j];m[j]=Math.min(m[j]+1,prev+1,m[j-1]+1);prev=old;}}return m[b.length];}
  function parse(value){if(!value||/\s/.test(value)) return null;try{return new URL(/^[a-z][\w+.-]*:/i.test(value)?value:`https://${value}`);}catch(_){return null;}}
  /** Returns independent structural signals; none makes a live safety claim. */
  function analyze(value){const url=parse(value);if(!url)return {url:null,signals:[],score:0};const host=url.hostname.toLowerCase().replace(/\.$/,'');const labels=host.split('.');const rootLabel=labels.length>1?labels[labels.length-2]:host,tld=labels.at(-1)||'';const signals=[];const add=(id,weight,title,text)=>signals.push({id,weight,title,text});
    if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host)||host.includes(':')) add('ip',30,'IP address used as a destination','Named domains are more common for legitimate services; raw addresses can hide a destination identity.');
    if(value.includes('@')) add('at',30,'@ symbol trick','Browsers ignore everything before @ when choosing the destination host.');
    const brandInSub=BRANDS.find(b=>labels.slice(0,-2).includes(b)); if(labels.length>4||brandInSub) add('subdomain',20,'Suspicious subdomain structure','The registered domain is near the end; earlier labels can be controlled by anyone.');
    // Normalize common visual substitutions before edit distance so paypa1 -> paypal is detected.
    const visualRoot=rootLabel.replace(/0/g,'o').replace(/1/g,'l').replace(/3/g,'e').replace(/5/g,'s');
    const look=BRANDS.find(b=>rootLabel!==b&&((distance(rootLabel,b)>=1&&distance(rootLabel,b)<=2)||visualRoot===b)); if(look) add('lookalike',25,`Possible ${look} lookalike`,`This domain resembles ${look} but is not its exact name. It may or may not be related; check carefully.`);
    const brand=BRANDS.find(b=>host.includes(b)); if(brand&&tld!=='com') add('tld',15,'Brand name with unexpected TLD','A brand name combined with an unusual extension deserves a second look.');
    if(url.protocol==='http:') add('http',10,'No HTTPS','Without HTTPS, entered information is not encrypted in transit.');
    if(SHORTENERS.includes(host)) add('shortener',15,'Known URL shortener','A short link hides its final destination from this local analyzer.');
    if(host.startsWith('xn--')||labels.some(l=>l.startsWith('xn--'))) add('punycode',20,'Punycode / homoglyph indicator','Internationalized domains can be legitimate, but can also visually resemble a different name.');
    return {url,host,signals,score:Math.min(100,signals.reduce((n,s)=>n+s.weight,0))};}
  function band(score){return score<=20?'Low structural risk signals':score<=50?'Some risk signals present':'Multiple risk signals present';}
  root.CastleUrlPhishingHeuristics={analyze,band,parse,BRANDS,oddTlds};
})(window);
