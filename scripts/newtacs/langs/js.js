const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

export const JStheme = `
  .k { color: #569cd6; font-weight: bold; }
  .a { color: #ff007f; font-weight: bold; }
  .s { color: #f2c94c; font-weight: bold; }
  .b { color: #4ec9b0; }
  .m { color: #dcdcaa; }
  .o { color: #c586c0; font-weight: bold; }
  .str { color: #ce9178; }
  .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; }
  .fn { color: #dcdcaa; font-weight: bold; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
  .g-star { color: #ff453a; font-weight: bold; }
`;

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  let lastChar = '';

  const flush = (isProperty = false) => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
    else if (GOLD.includes(w)) span.className = "s";
    else if (BUILTINS.includes(w)) span.className = "b";
    else if (METHODS.includes(w)) span.className = "m";
    else if (isProperty) span.className = "prop";

    if (span.className) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }
    w = '';
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
    
    // 💡 【大修正】不気味なテンプレート展開タイポを物理的に完全消滅！
    if (c === "'" || c === '"' || c === '`') { 
      flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; 
    }

    if (/[a-zA-Z0-9_]/.test(c)) { w += c; } else {
      if (w) {
        if (c === '(') {
          const span = document.createElement("span");
          span.className = METHODS.includes(w) ? "m" : (KEYWORDS.includes(w) ? "k" : "fn");
          span.textContent = w; res += span.outerHTML; w = '';
        } else if (c === ':') { flush(true); } else { flush(lastChar === '.'); }
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '{' || c === '}') {
        const span = document.createElement("span"); span.className = "br1"; span.textContent = c; res += span.outerHTML;
      } else if (c === '[' || c === ']') {
        const span = document.createElement("span"); span.className = "br3"; span.textContent = c; res += span.outerHTML;
      } else if (c === '(' || c === ')') {
        const span = document.createElement("span"); span.className = "br2"; span.textContent = c; res += span.outerHTML;
      } else if (c === '=' && t[idx + 1] === '>') {
        const span = document.createElement("span"); span.className = "a"; span.textContent = "=>"; res += span.outerHTML; idx++;
      } else if (c === '*') {
        const span = document.createElement("span"); span.className = "g-star"; span.textContent = "*"; res += span.outerHTML;
      } else if (['+', '-', '/', '=', '!', '<', '>', '?', '%', ':', '.'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(lastChar === '.'); return res;
}
