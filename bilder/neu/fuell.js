window.fuell = async function (slug) {
  const W = ms => new Promise(r => setTimeout(r, ms));
  const api = p => fetch('https://api.github.com/repos/Dyzamora/dyzamora.github.io/contents/' + p + '?t=' + Date.now()).then(r => r.json());
  const j = await api('bilder/neu/listings.json');
  const L = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\n/g, '')), c => c.charCodeAt(0))));
  const e = L.find(x => x.slug === slug); if (!e) return 'slug?';
  const setV = (el, v) => { const p = el.tagName == 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); };
  const log = [];
  // Titel + Beschreibung
  setV(document.getElementById('listing-title-input'), e.titel);
  setV(document.getElementById('listing-description-textarea'), e.text); log.push('text');
  // Tags
  for (let i = 0; i < 40; i++) { const b = [...document.querySelectorAll('button')].find(b => /^Tag .* löschen$/.test(b.getAttribute('aria-label') || '')); if (!b) break; b.click(); await W(120); }
  const ti = document.getElementById('listing-tags-input');
  for (const t of e.tags) { setV(ti, t); await W(60); document.getElementById('listing-tags-button').click(); await W(120); }
  log.push('tags ' + [...document.querySelectorAll('button')].filter(b => /^Tag .* löschen$/.test(b.getAttribute('aria-label') || '')).length);
  // Personalisierung
  const sec = [...document.querySelectorAll('div')].filter(d => /^Personalisierungsoptionen/.test(d.innerText || '') && /Feld hinzufügen/.test(d.innerText) && d.innerText.length < 2500).pop();
  if (sec) {
    let btn = () => [...sec.querySelectorAll('button')].filter(b => !/Feld hinzufügen|Mehr erfahren/.test(b.innerText + (b.getAttribute('aria-label') || '')));
    while (btn().length > 2) { const b = btn(); b[b.length - 1].click(); await W(500); }
    btn()[0].click(); await W(900);
    setV(document.getElementById('field-personalizationQuestions-questionText'), e.pers_titel);
    setV(document.getElementById('field-personalizationQuestions-instructions'), e.pers);
    setV(document.getElementById('field-personalizationQuestions-charCountMax'), '1024');
    await W(300);
    const d = [...document.querySelectorAll('[role=dialog]')].find(x => x.offsetParent && /Textfeld bearbeiten/.test(x.innerText));
    [...d.querySelectorAll('button')].find(b => b.innerText.trim() == 'Fertig').click(); await W(600);
    log.push('pers ' + (sec.innerText.includes(e.pers_titel) ? 'ok' : '?'));
  }
  // Bilder
  const alle = [...document.querySelectorAll('button')].find(b => b.innerText.trim() == 'Alle löschen');
  if (alle) { alle.click(); await W(800); const ok = [...document.querySelectorAll('[role=dialog] button, [role=alertdialog] button')].find(b => b.offsetParent && /löschen|Löschen|Ja|Bestätigen/.test(b.innerText)); if (ok) { ok.click(); await W(800); } }
  const dt = new DataTransfer();
  for (const n of e.bilder) { const b = await fetch('https://raw.githubusercontent.com/Dyzamora/dyzamora.github.io/main/bilder/neu/' + n).then(r => r.blob()); dt.items.add(new File([b], n, { type: 'image/jpeg' })); }
  const fi = document.querySelector('input[type=file][name=listing-media-upload]'); fi.files = dt.files; fi.dispatchEvent(new Event('change', { bubbles: true }));
  log.push('bilder ' + e.bilder.length);
  return log.join(' | ') + ' | Preis ' + e.preis + ' | Kat ' + e.kat;
};
'geladen';
