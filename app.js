const els={url:document.querySelector('#playlistUrl'),load:document.querySelector('#loadUrl'),file:document.querySelector('#playlistFile'),search:document.querySelector('#search'),group:document.querySelector('#groupFilter'),list:document.querySelector('#channelList'),count:document.querySelector('#channelCount'),video:document.querySelector('#video'),empty:document.querySelector('#emptyState'),loading:document.querySelector('#loading'),title:document.querySelector('#nowTitle'),groupName:document.querySelector('#nowGroup'),fav:document.querySelector('#favoriteBtn')};
let channels=[],filtered=[],current=null,hls=null;
const favorites=new Set(JSON.parse(localStorage.getItem('gtvFavorites')||'[]'));

function parseM3U(text){
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean); const out=[];
  for(let i=0;i<lines.length;i++){
    if(!lines[i].startsWith('#EXTINF')) continue;
    const info=lines[i], url=lines[i+1]||''; if(!url||url.startsWith('#')) continue;
    const comma=info.indexOf(','); const name=comma>=0?info.slice(comma+1).trim():'Channel '+(out.length+1);
    const attrs={}; const re=/([\w-]+)="([^"]*)"/g; let m; while((m=re.exec(info))) attrs[m[1]]=m[2];
    const group=attrs['group-title']||'Uncategorized'; const id=url+'|'+name;
    out.push({id,name,url,group,logo:attrs['tvg-logo']||'',tvgId:attrs['tvg-id']||''}); i++;
  } return out;
}
function setGroups(){const groups=[...new Set(channels.map(c=>c.group))].sort((a,b)=>a.localeCompare(b)); els.group.innerHTML='<option value="">All groups</option>'+groups.map(g=>`<option>${escapeHtml(g)}</option>`).join('');}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function render(){const q=els.search.value.toLowerCase().trim(),g=els.group.value; filtered=channels.filter(c=>(!g||c.group===g)&&(!q||c.name.toLowerCase().includes(q)||c.group.toLowerCase().includes(q))); els.count.textContent=filtered.length;
 els.list.innerHTML=filtered.map(c=>`<div class="channel ${current?.id===c.id?'active':''}" data-id="${escapeHtml(c.id)}"><div>${c.logo?`<img class="logo" src="${escapeHtml(c.logo)}" alt="">`:'<div class="logo"></div>'}</div><div class="channel-text"><div class="channel-name">${escapeHtml(c.name)}</div><div class="channel-group">${escapeHtml(c.group)}</div></div>${favorites.has(c.id)?'<span class="star">★</span>':''}</div>`).join('');
 els.list.querySelectorAll('.channel').forEach(el=>el.onclick=()=>play(channels.find(c=>c.id===el.dataset.id)));
}
async function loadText(text){channels=parseM3U(text); current=null; stop(); setGroups(); render(); if(!channels.length) alert('No playable entries were found in this M3U playlist.');}
async function loadUrl(){const url=els.url.value.trim(); if(!url)return; els.loading.classList.remove('hidden'); try{const r=await fetch(url); if(!r.ok)throw new Error(`HTTP ${r.status}`); await loadText(await r.text());}catch(e){alert('Could not load the playlist. Check the URL, network access, and CORS settings.\n\n'+e.message);}finally{els.loading.classList.add('hidden');}}
function stop(){if(hls){hls.destroy();hls=null}els.video.pause();els.video.removeAttribute('src');els.video.load();els.empty.classList.remove('hidden');els.title.textContent='No channel selected';els.groupName.textContent='—';els.fav.textContent='☆';}
function play(c){if(!c)return; current=c; els.empty.classList.add('hidden');els.loading.classList.remove('hidden');els.title.textContent=c.name;els.groupName.textContent=c.group;els.fav.textContent=favorites.has(c.id)?'★':'☆'; render();
 const url=c.url, isHls=/\.m3u8($|\?)/i.test(url)||/application\/vnd\.apple\.mpegurl/i.test(c.type||'');
 if(hls){hls.destroy();hls=null}
 if(isHls && window.Hls && Hls.isSupported()){hls=new Hls({enableWorker:true});hls.loadSource(url);hls.attachMedia(els.video);hls.on(Hls.Events.MANIFEST_PARSED,()=>els.video.play().catch(()=>{}));hls.on(Hls.Events.ERROR,(_,d)=>{if(d.fatal) console.warn('HLS error',d)});} else {els.video.src=url; els.video.play().catch(()=>{});}
 els.video.onloadeddata=()=>els.loading.classList.add('hidden'); els.video.onerror=()=>{els.loading.classList.add('hidden');};
}
els.load.onclick=loadUrl; els.file.onchange=async e=>{const f=e.target.files?.[0];if(f)await loadText(await f.text())}; els.search.oninput=render; els.group.onchange=render; els.fav.onclick=()=>{if(!current)return; favorites.has(current.id)?favorites.delete(current.id):favorites.add(current.id);localStorage.setItem('gtvFavorites',JSON.stringify([...favorites]));els.fav.textContent=favorites.has(current.id)?'★':'☆';render()};
// Auto-load the supplied LAN playlist. Browsers may block this if the page is not on the same network or the server lacks CORS.
loadUrl();
