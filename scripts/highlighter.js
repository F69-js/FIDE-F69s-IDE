// FIDE Custom IDE - Syntax Highlighter Module (Universal Version)
const K_HL = {
  'k': ["if","else","switch","case","break","return","continue","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","async","await","default","do","while","yield","function"],
  's': ["this","window","globalThis"],
  'b': ["JSON","console","Math","Date","Temporal","Promise","String","Map","Set","Object","Number","Error","Array","ObservableString","BlockTypes","Player","undefined","null","true","false","parse","stringify","log","warn","error","floor","ceil","abs","max","min","pow","parseFloat","parseInt","isNaN","toString","keys","random","now"],
  'm': ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","hasOwnProperty","subscribe","then","repeat","next"]
};

function runHl(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  const flush = () => {
    if (!w) return; let m = '';
    for (const [cl, arr] of Object.entries(K_HL)) { if (arr.includes(w)) { m = cl; break; } }
    res += m ? `<span class="m">{w}</span>` : (/^\d+$/.test(w) ? `<span style="color:#b5cea8">\${w}</span>` : w); w = '';
  };
  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2 } else idx++; continue }
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }
    if (c === '/' && t[idx + 1] === '/') { flush(); res += '<span class="c">//'; c1 = 1; idx += 2; continue }
    if (c === '/' && t[idx + 1] === '*') { flush(); res += '<span class="c">/*'; c2 = 1; idx += 2; continue }
    if (c === "'" || c === '"' || c === '`') { flush(); sC = c; res += `<span class="str">${c}`; s = 1; idx++; continue }
    
    if (/[a-zA-Z0-9_*]/.test(c)) { w += c; } else {
      if (w && c === '(') {
        let m = '';
        for (const [cl, arr] of Object.entries(K_HL)) { if (arr.includes(w)) { m = cl; break; } }
        res += m ? `<span class="${m}">${w}</span>` : `<span class="fn">${w}</span>`; w = '';
      } else { flush(); }
      if (c === '=' && t[idx + 1] === '>') { res += '<span class="a">=&gt;</span>'; idx++; }
      else if (c === '{' || c === '}') { res += `<span class="br1">${c}</span>`; }
      else if (c === '(' || c === ')') { res += `<span class="br2">${c}</span>`; }
      else if (c === '.' && t[idx + 1] === '.' && t[idx + 2] === '.') { res += '<span class="o">...</span>'; idx += 2; }
      else if (['+', '-', '*', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) { res += `<span class="o">${c}</span>`; }
      else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  } flush(); return res;
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    line.innerHTML = runHl(plainText).replace(/\t/g, "|");
  });
}
