// FIDE JS Lexer (v27.3 Balanced Compact)
const K = [
  "if","else","switch","case","break","return","typeof",
  "instanceof","throw","for","let","const","var","class",
  "export","constructor","new","import","from","try","catch",
  "in","await","default","do","yield","function","extends",
  "super","finally","with","arguments","interface","implements",
  "package","private","protected","public","static","void","as"
];
const A = ["async","while","continue","debugger","null"];
const G = ["this","window","globalThis","super","self","global"];
const B = [
  "JSON","console","Math","Date","Promise","String","Map","Set",
  "Object","Number","Error","undefined","null","true","false",
  "process","document","navigator","screen","location","history",
  "Temporal","LanguageModel","ai"
];
const M = [
  "push","pop","unshift","shift","slice","splice","filter","some",
  "findIndex","includes","join","split","match","replace","replaceAll",
  "trim","startsWith","indexOf","lastIndexOf","substring","map",
  "forEach","reduce","padStart","toFixed","has","get","set","delete",
  "entries","add","then","catch","finally","log","warn","error",
  "defineProperty"
];
const W = ["__webpack_require__","__unused_webpack_module"];

let s = 0, sC = '', c1 = 0, c2 = 0, bD = 0;
let dV = new Set(), dF = new Set(), dA = new Set();

export const JStheme = `
  .line span { font-weight: normal !important; font-style: normal !important; }
  .k { color: #569cd6; } .a { color: #ff007f; } .s { color: #f2c94c; }
  .b { color: #4ec9b0; } .m { color: #dcdcaa; } .o { color: #c586c0; font-weight: bold; }
  .str { color: #ce9178; } .tmpl-str { color: #ff8c00; } .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; } .fn { color: #dcdcaa; }
  .br1 { color: #00ffaa; } .br2 { color: #00ffff; } .br3 { color: #ff00ff; }
  .g-star { color: #4fc1ff; font-weight: bold; } .tmpl-var { color: #9cdcfe; }
  .orange-cream { color: #ebd2b6; } .func-def-name { color: #4fc1ff; }
  .lime-num { color: #00ff00; } .green-dot { color: #27ae60; font-weight: bold; }
  .arg-green { color: #a3be8c; font-weight: bold; } .regex-color { color: #d16969; }
`;

export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; bD = 0;
  dV.clear(); dF.clear(); dA.clear();
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '', lC = '';
  let aV = false, aF = false, iI = false, aA = false, iP = false;

  // 💡 行頭での状態自動開通レール
  if (c1 || c2) res += '<span class="c">';
  else if (s === 1) res += '<span class="str">';
  else if (s === 2) res += '<span class="tmpl-str">';

  if (t.includes("import")) iI = true;

}

// 💡 【大復活】これが虚空に消えていた本物の flush 関数本体です！
  const flush = (isP = false, nC = '') => {
    if (!w) return;
    let cN = "";
    if (W.includes(w)) {
      cN = "s";
    } else if (w === "NaN") {
      cN = "s";
    } else if (w === "module" ||
               w === "exports") {
      cN = "b";
    } else if (w === "void" ||
               w === "as" ||
               K.includes(w)) {
      cN = "k";
      if (["var","let","const"]
          .includes(w)) {
        aV = true;
      }
      if (w === "import") iI = true;
      if (w === "as") aA = true;
    } else if (A.includes(w)) {
      cN = "a";
    } else if (G.includes(w)) {
      cN = "s";
    } else if (B.includes(w)) {
      cN = "b";
    } else if (M.includes(w)) {
      cN = "m";
    } else if (nC === '(' || aF) {
      dF.add(w);
      cN = "func-def-name";
      aF = false;
    } else if (aA) {
      cN = "prop";
      aA = false;
    } else if (aV) {
      dV.add(w);
      cN = "orange-cream";
      aV = false;
    } else if (iP) {
      dA.add(w);
      cN = "arg-green";
    } else if (isP) {
      cN = "prop";
    } else if (dF.has(w)) {
      cN = "func-def-name";
    } else if (dA.has(w)) {
      cN = "arg-green";
    } else if (dV.has(w)) {
      cN = "orange-cream";
    } else {
      cN = "";
    }

    if (cN) {
      res += '<span class="' +
             cN + '">' + w + '</span>';
    } else {
      res += w;
    }
    w = '';
  };

const f = flush;

  export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lC = '';
  let aV = false, aF = false;
  let iI = false, aA = false;
  let iP = false;

  if (c1 || c2) res += '<span class="c">';
  else if (s === 1) res += '<span class="str">';
  else if (s === 2) res += '<span class="tmpl-str">';

  if (t.includes("import")) {
    iI = true;
  }
  while (idx < t.length) {
    const c = t[idx];
    
    if (c1) {
      res += c.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if (c === '\n') { res += '</span>'; c1 = 0; }
      idx++; continue;
    }
    if (c2) {
      res += c.replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if (c === '*' && t[idx + 1] === '/') {
        res += '/</span>'; c2 = 0; idx += 2;
      } else { idx++; }
      continue;
    }
    
    if (s === 1) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      if (iI && c === '@') {
        let e = t.indexOf(sC, idx);
        if (e !== -1) {
          let n = t.slice(idx, e);
          if (n.startsWith("@")) {
            res += '<span class="a">' + n.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>';
            idx = e; continue;
          }
        }
      }
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; iI = false; }
      idx++; continue;
    }

    if (s === 2) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      if (c === '\n') { res += '</span>\n<span class="tmpl-str">'; idx++; continue; }
      if (c === '$' && t[idx + 1] === '{') {
        res += '</span><span class="o">\${</span><span class="tmpl-var">'; idx += 2;
        while (idx < t.length) {
          if (t[idx] === '}') { res += '</span><span class="o">}</span><span class="tmpl-str">'; idx++; break; }
          res += t[idx].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
        }
        continue;
      }
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === '`') { res += '</span>'; s = 0; } idx++; continue;
    }

    if (c === '&' && t[idx + 1] === '&') {
      flush(lC === '.'); res += '<span class="o">&amp;&amp;</span>'; idx += 2; lC = '&'; continue;
    }
    if (c === '|' && t[idx + 1] === '|') {
      flush(lC === '.'); res += '<span class="o">||</span>'; idx += 2; lC = '|'; continue;
    }
    if (c === '&' && t[idx + 1] !== '&') {
      flush(lC === '.'); res += '<span class="o">&amp;</span>'; idx++; lC = '&'; continue;
    }

    if (c === '/' && t[idx + 1] !== '/' && t[idx + 1] !== '*' &&
        (w.length === 0 && (lC === '=' || lC === ',' || lC === '(' || lC === ':' || lC === '[' || lC === '?' || lC === ''))) {
      flush(lC === '.');
      let r = idx + 1, i = true;
      while (r < t.length && i) {
        if (t[r] === '\\') { r += 2; continue; }
        if (t[r] === '/') {
          r++; while (r < t.length && /[gmixsy]/.test(t[r])) r++;
          i = false; break;
        }
        if (t[r] === '\n') { i = false; break; }
        r++;
      }
      let x = t.slice(idx, r);
      res += '<span class="regex-color">' + x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
      idx = r; lC = '/'; continue;
    }

    if (c === '/' && t[idx + 1] === '/') { flush(lC === '.'); res += '<span class="c">//'; c1 = 1; idx += 2; continue; }
    if (c === '/' && t[idx + 1] === '*') { flush(lC === '.'); res += '<span class="c">/*'; c2 = 1; idx += 2; continue; }
    if (c === "'" || c === '"') { flush(lC === '.'); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; }
    if (c === '`') { flush(lC === '.'); res += '<span class="tmpl-str">`'; s = 2; idx++; continue; }

    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush(lC === '.'); res += '<span class="b">module.exports</span>'; idx += 14; lastChar = 's'; continue;
    }
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush(lC === '.'); res += '<span class="green-dot">-</span>'; idx++; continue;
    }
    if (c === '?' && t[idx + 1] === '.') {
      flush(lC === '.'); res += '<span class="a">?.</span>'; idx += 2; lC = '.'; continue;
    }
    if (c === '.' && /[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
      res += '<span class="green-dot">.</span>'; idx++; continue;
    }
    if (/[0-9]/.test(c) && w.length === 0) {
      res += '<span class="lime-num">' + c + '</span>'; idx++; lC = c; continue;
    }

    if (/[a-zA-Z0-9_\\$]/.test(c)) {
      w += c;
    } else {
      if (w) {
        if (c === ':') flush(true, c);
        else flush(lastChar === '.', c);
      }
      if (c.trim() !== '') lC = c;

      if (c === '(' && (lastChar === 'n' || lastChar === 't' || w === '')) iP = true;
      if (c === ')') iP = false;

      if (c === '{') {
        let b = "br" + ((bD % 3) + 1);
        res += '<span class="' + b + '">{</span>'; bD++;
      } else if (c === '}') {
        bD = Math.max(0, bD - 1);
        let b = "br" + ((bD % 3) + 1);
        res += '<span class="' + b + '">}</span>';
      } 
      else if (c === '[' || c === ']') res += '<span class="br3">' + c + '</span>';
      else if (c === '(' || c === ')') res += '<span class="br2">' + c + '</span>';
      else if (c === '=' && t[idx + 1] === '>') { res += '<span class="a">=></span>'; idx++; }
      else if (c === '*') {
        if (iI || lC === 'n') res += '<span class="g-star">*</span>';
        else res += '<span class="o">*</span>';
      } 
      else if (c === '.') res += '<span class="o">.</span>';
      else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) res += '<span class="o">' + c + '</span>';
      else {
        res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
    idx++;
  }
  if (w) flush(lastChar === '.');
  return res;
}
