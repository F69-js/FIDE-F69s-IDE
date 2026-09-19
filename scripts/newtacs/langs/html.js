const TAGS = ["DOCTYPE","html","head","body","meta","title","link","script","style","div","span","p","a","img","ul","ol","li","table","tr","td","th","thead","tbody","form","input","button","textarea","label","select","option","iframe","canvas","svg"];
const ATTRS = ["id","class","style","href","src","alt","type","value","name","placeholder","disabled","checked","readonly","required","onclick","onload"];

export function ApplyHighlighttoHTML(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  let inTag = false;
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (inTag) {
      if (TAGS.includes(w)) span.className = "k";
      else if (ATTRS.includes(w)) span.className = "a";
    }
    if (span.className) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }
    w = '';
  };
  while (idx < t.length) {
    const c = t[idx];
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; } idx++; continue;
    }
    if (c === '<' && t[idx + 1] === '!' && t[idx + 2] === '-' && t[idx + 3] === '-') {
      flush(); res += '<span class="c">&lt;!--'; idx += 4;
      while (idx < t.length) {
        if (t[idx] === '-' && t[idx + 1] === '-' && t[idx + 2] === '>') { res += '--&gt;</span>'; idx += 3; break; }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
      } continue;
    }
    if (c === '<') { flush(); inTag = true; res += '&lt;'; idx++; continue; }
    if (c === '>') { flush(); inTag = false; res += '&gt;'; idx++; continue; }
    if (c === '"' || c === "'") { flush(); sC = c; res += `<span class="str">${c}`; s = 1; idx++; continue; }
    const isWordChar = inTag ? /[a-zA-Z0-9_\-]/.test(c) : /[a-zA-Z0-9_]/.test(c);
    if (isWordChar) { w += c; } else {
      if (w) flush();
      if (c === '=' && inTag) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  if (w) flush(); return res;
}
