// FIDE JS Lexer (v26.1 - Adaptive Balanced Layout)
const KEYWORDS = [
  "if","else","switch","case","break","return","typeof","instanceof",
  "throw","for","let","const","var","class","export","constructor",
  "new","import","from","try","catch","in","await","default","do",
  "yield","function","extends","super","finally","with","arguments",
  "interface","implements","package","private","protected","public",
  "static","void","as"
];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = [
  "JSON","console","Math","Date","Promise","String","Map","Set",
  "Object","Number","Error","undefined","null","true","false",
  "process","document","navigator","screen","location","history",
  "Temporal","LanguageModel","ai"
];
const METHODS = [
  "push","pop","unshift","shift","slice","splice","filter","some",
  "findIndex","includes","join","split","match","replace","replaceAll",
  "trim","startsWith","indexOf","lastIndexOf","substring","map",
  "forEach","reduce","padStart","toFixed","has","get","set","delete",
  "entries","add","then","catch","finally","log","warn","error","defineProperty"
];
const WEBPACK_VARS = ["__webpack_require__","__unused_webpack_module"];

let s = 0, sC = '', c1 = 0, c2 = 0, braceDepth = 0;
let definedVariables = new Set();
let definedFunctions = new Set();
let definedArguments = new Set();

export const JStheme = `
  .line span { font-weight: normal !important; font-style: normal !important; }
  .k { color: #569cd6; } .a { color: #ff007f; } .s { color: #f2c94c; }
  .b { color: #4ec9b0; } .m { color: #dcdcaa; } .o { color: #c586c0; font-weight: bold; }
  .str { color: #ce9178; } .tmpl-str { color: #ff8c00; } .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; } .fn { color: #dcdcaa; }
  .br1 { color: #00ffaa; } .br2 { color: #00ffff; } .br3 { color: #ff00ff; }
  .g-star { color: #4fc1ff; font-weight: bold; } .tmpl-var { color: #9cdcfe; }
  .orange-cream { color: #ebd2b6; } .func-def-name { color: #4fc1ff; }
  .lime-num { color: #00ff00; }
  .green-dot { color: #27ae60; font-weight: bold; }
  .arg-green { color: #a3be8c; font-weight: bold; }
`;

export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; braceDepth = 0;
  definedVariables.clear(); definedFunctions.clear(); definedArguments.clear();
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '', lastChar = '';
  let isAfterVarLetConst = false, isAfterFunctionKeyword = false;
  let isInsideImport = false, isAfterAsKeyword = false, isInsideParenDeclaration = false;

  if (t.includes("import")) isInsideImport = true;

  const flush = (isProperty = false, nextChar = '') => {
    if (!w) return;
    let className = "";
    
    if (WEBPACK_VARS.includes(w)) className = "s";
    else if (w === "NaN") className = "s";
    else if (w === "module" || w === "exports") className = "b";
    else if (w === "void" || w === "as" || KEYWORDS.includes(w)) {
      className = "k";
      if (["var","let","const"].includes(w)) isAfterVarLetConst = true;
      if (w === "import") isInsideImport = true;
      if (w === "as") isAfterAsKeyword = true;
    } 
    else if (NEON_PINK.includes(w)) className = "a";
    else if (GOLD.includes(w)) className = "s";
    else if (BUILTINS.includes(w)) className = "b";
    else if (METHODS.includes(w)) className = "m";
    else if (nextChar === '(' || isAfterFunctionKeyword) {
      definedFunctions.add(w); className = "func-def-name"; isAfterFunctionKeyword = false;
    } 
    else if (isAfterAsKeyword) { className = "prop"; isAfterAsKeyword = false; }
    else if (isAfterVarLetConst) {
      definedVariables.add(w); className = "orange-cream"; isAfterVarLetConst = false;
    } 
    else if (isInsideParenDeclaration) { definedArguments.add(w); className = "arg-green"; }
    else if (isProperty) className = "prop";
    else if (definedFunctions.has(w)) className = "func-def-name";
    else if (definedArguments.has(w)) className = "arg-green";
    else if (definedVariables.has(w)) className = "orange-cream";
    else className = "";

    if (className) res += '<span class="' + className + '">' + w + '</span>';
    else res += w;
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0; } idx++; continue; }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2; } else idx++; continue; }
    
    if (s === 1) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      if (isInsideImport && c === '@') res += '<span class="a">@</span>';
      else res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; isInsideImport = false; }
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

    if (c === '/' && t[idx + 1] === '/') { flush(lastChar === '.'); res += '<span class="c">//'; c1 = 1; idx += 2; continue; }
    if (c === '/' && t[idx + 1] === '*') { flush(lastChar === '.'); res += '<span class="c">/*'; c2 = 1; idx += 2; continue; }
    if (c === "'" || c === '"') { flush(lastChar === '.'); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; }
    if (c === '`') { flush(lastChar === '.'); res += '<span class="tmpl-str">`'; s = 2; idx++; continue; }

    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush(lastChar === '.'); res += '<span class="b">module.exports</span>'; idx += 14; lastChar = 's'; continue;
    }
    if (c === '&' && t[idx + 1] === '&') {
      flush(lastChar === '.'); res += '<span class="o">&amp;&amp;</span>'; idx += 2; lastChar = '&'; continue;
    }
    if (c === '|' && t[idx + 1] === '|') {
      flush(lastChar === '.'); res += '<span class="o">||</span>'; idx += 2; lastChar = '|'; continue;
    }
    if (c === '&' && t[idx + 1] !== '&') {
      flush(lastChar === '.'); res += '<span class="o">&amp;</span>'; idx++; lastChar = '&'; continue;
    }
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush(lastChar === '.'); res += '<span class="green-dot">-</span>'; idx++; continue;
    }
    if (c === '?' && t[idx + 1] === '.') {
      flush(lastChar === '.'); res += '<span class="a">?.</span>'; idx += 2; lastChar = '.'; continue;
    }
    if (c === '.' && /[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
      res += '<span class="green-dot">.</span>'; idx++; continue;
    }
    if (/[0-9]/.test(c) && w.length === 0) {
      res += '<span class="lime-num">' + c; idx++; lastChar = c; continue;
    }

    if (/[a-zA-Z0-9_\\$]/.test(c)) {
      w += c;
    } else {
      if (w) {
        if (c === ':') flush(true, c);
        else flush(lastChar === '.', c);
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '(' && (lastChar === 'n' || lastChar === 't' || w === '')) isInsideParenDeclaration = true;
      if (c === ')') isInsideParenDeclaration = false;

      if (c === '{') {
        let bClass = "br" + ((braceDepth % 3) + 1);
        res += '<span class="' + bClass + '">{</span>'; braceDepth++;
      } else if (c === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        let bClass = "br" + ((braceDepth % 3) + 1);
        res += '<span class="' + bClass + '">}</span>';
      } 
      else if (c === '[' || c === ']') res += '<span class="br3">' + c + '</span>';
      else if (c === '(' || c === ')') res += '<span class="br2">' + c + '</span>';
      else if (c === '=' && t[idx + 1] === '>') { res += '<span class="a">=></span>'; idx++; }
      else if (c === '*') {
        if (isInsideImport || lastChar === 'n') res += '<span class="g-star">*</span>';
        else res += '<span class="o">*</span>';
      } 
      else if (c === '.') res += '<span class="o">.</span>';
      else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) res += '<span class="o">' + c + '</span>';
      else res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    idx++;
  }
  if (w) flush(lastChar === '.');
  return res;
}
