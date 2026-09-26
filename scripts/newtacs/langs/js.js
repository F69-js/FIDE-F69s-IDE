const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

const WEBPACK_VARS = ["__webpack_require__", "__unused_webpack_module"];

let s = 0, sC = '', c1 = 0, c2 = 0;
let braceDepth = 0;

export const JStheme = `
  /* 💡 【元色完全死守】元々の美しい配色定義はそのまま100%残す！ */
  .k { color: #569cd6; font-weight: bold; }
  .a { color: #ff007f; font-weight: bold; }
  .s { color: #f2c94c; font-weight: bold; }
  .b { color: #4ec9b0; }
  .m { color: #dcdcaa; }
  .o { color: #c586c0; font-weight: bold; }
  .str { color: #ce9178; }
  .tmpl-str { color: #ff8c00; font-weight: bold; }
  .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; }
  .fn { color: #dcdcaa; font-weight: bold; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
  .g-star { color: #ff453a; font-weight: bold; }
  .tmpl-var { color: #9cdcfe; font-weight: bold; }
  
  /* 💡 【追加】18項目の極彩色カラークラス */
  .cream { color: #fffdd0; }              /* 定義されてる変数、Webpack変数 */
  .func-def-name { color: #4fc1ff; font-weight: bold; }      /* 定義する関数名（少し濃い水色） */
  .func-def-body { color: #ebd2b6; font-weight: bold; }      /* 定義する関数（濃いクリーム色） */
  .emerald { color: #2ecc71; font-weight: bold; } /* module.exports、importの* */
  .lime-num { color: #00ff00; }            /* 数字のlime色 */
  .green-dot { color: #27ae60; font-weight: bold; } /* 小数点、負のマイナス */
  .purple-op { color: #8e44ad; font-weight: bold; }  /* オプショナルチェーン、&、掛け算* */
  .import-at-color { color: #e74c3c; font-weight: bold; } /* import内の@ */
  
  /* 多重波カッコの深度グラデーション */
  .brace-depth-0 { color: #00ffaa; font-weight: bold; }
  .brace-depth-1 { color: #2ecc71; font-weight: bold; }
  .brace-depth-2 { color: #3498db; font-weight: bold; }
  .brace-depth-3 { color: #9b59b6; font-weight: bold; }
`;

export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; braceDepth = 0;
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lastChar = '';
  let isAfterDot = false;
  let isAfterImport = false;

  if (t.includes("import") && t.includes("from")) {
    isAfterImport = true;
  }

  const flush = (isProperty = false) => {
    if (!w) return;
    let className = "";
    
    // 1. キーワードやビルトインなどの「元の配色」を最優先で適用！
    if (KEYWORDS.includes(w)) {
      className = "k"; // functionやlet/constは元の美しい青（.k）を100%維持！
    } else if (WEBPACK_VARS.includes(w)) {
      className = "cream"; // Webpack変数はクリーム色に
    } else if (w === "NaN") {
      className = "s"; // NaN対応
    } else if (NEON_PINK.includes(w)) {
      className = "a";
    } else if (GOLD.includes(w)) {
      className = "s";
    } else if (BUILTINS.includes(w)) {
      className = "b";
    } else if (METHODS.includes(w)) {
      className = "m";
    } else if (isProperty) {
      className = "prop";
    } else {
      className = "cream"; // それ以外の定義されてる変数はクリーム色に
    }

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { res += w; }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2 } else idx++; continue }
    
    if (s === 1) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      if (isAfterImport && c === '@') {
        res += '<span class="import-at-color">@</span>';
      } else {
        res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }

    if (s === 2) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      if (c === '\n') {
        res += '</span>\n<span class="tmpl-str">';
        idx++;
        continue;
      }
      if (c === '$' && t[idx + 1] === '{') {
        res += '</span><span class="o">${</span><span class="tmpl-var">';
        idx += 2;
        while (idx < t.length) {
          if (t[idx] === '}') {
            res += '</span><span class="o">}</span><span class="tmpl-str">';
            idx++; break;
          }
          res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;');
          idx++;
        }
        continue;
      }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === '`') { res += '</span>'; s = 0 } idx++; continue;
    }

    if (c === '/' && t[idx + 1] === '/') { flush(); res += '<span class="c">//'; c1 = 1; idx += 2; continue }
    if (c === '/' && t[idx + 1] === '*') { flush(); res += '<span class="c">/*'; c2 = 1; idx += 2; continue }
    
    if (c === "'" || c === '"') { 
      flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; 
    }
    if (c === '`') {
      flush(); res += '<span class="tmpl-str">`'; s = 2; idx++; continue;
    }

    // module.exports のエメラルドグリーン判定
    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush();
      res += '<span class="emerald">module.exports</span>';
      idx += 14;
      continue;
    }

    // 負の数字判定
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush();
      res += '<span class="green-dot">-</span>';
      idx++;
      continue;
    }

    if (/[a-zA-Z0-9_]/.test(c)) { 
      w += c; 
    } else {
      if (w) {
        isAfterDot = (lastChar === '.');
        
        if (c === '(') {
          if (lastChar === 'n' || KEYWORDS.includes(w) === false && METHODS.includes(w) === false && BUILTINS.includes(w) === false) {
            // 💡 「定義する関数名」は少し濃い水色（.func-def-name）に！
            res += '<span class="func-def-name">' + w + '</span>';
          } else {
            // それ以外の通常のメソッド呼び出しやキーワード
            let className = METHODS.includes(w) ? "m" : (KEYWORDS.includes(w) ? "k" : "fn");
            res += '<span class="' + className + '">' + w + '</span>';
          }
          w = '';
        } else if (c === ':') { 
          flush(true); 
        } else { 
          // 💡 アロー関数定義など、「定義する関数（全体・中身）」を濃いクリーム色（.func-def-body）にする文脈ハック
          if (t.slice(idx).trim().startsWith("=>")) {
            res += '<span class="func-def-body">' + w + '</span>';
            w = '';
          } else {
            flush(isAfterDot); 
          }
        }
      }
      if (c.trim() !== '') lastChar = c;

      // 多重波カッコの深度グラデーション
      if (c === '{') {
        let currentBraceClass = "brace-depth-" + (braceDepth % 4);
        res += '<span class="' + currentBraceClass + '">{</span>';
        braceDepth++;
      } else if (c === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        let currentBraceClass = "brace-depth-" + (braceDepth % 4);
        res += '<span class="' + currentBraceClass + '">}</span>';
      } 
      else if (c === '[' || c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if (c === '(' || c === ')') {
        res += '<span class="br2">' + c + '</span>';
      } else if (c === '=' && t[idx + 1] === '>') {
        res += '<span class="a">=></span>'; idx++;
      } 
      else if (c === '*') {
        if (isAfterImport) res += '<span class="emerald">*</span>'; // import...*の*
        else res += '<span class="purple-op">*</span>'; // 単純な掛け算
      } 
      // ピリオドの三段活用
      else if (c === '.') {
        if (lastChar === '?') {
          res = res.slice(0, res.lastIndexOf('<span class="o">?</span>'));
          res += '<span class="purple-op">?.</span>'; // オプショナルチェーン
        } else if (/[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
          res += '<span class="green-dot">.</span>'; // 小数点
        } else {
          res += '<span class="o">.</span>'; // オブジェクト接続
        }
      }
      else if (c === '&') {
        res += '<span class="purple-op">&amp;</span>'; // &は紫
      } else if (/[0-9]/.test(c)) {
        res += '<span class="lime-num">' + c + '</span>'; // 数字はlime色
      } else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); 
      }
    } 
    idx++;
  }
  
  if (w) {
    isAfterDot = (lastChar === '.');
    flush(isAfterDot);
  }
  
  return res;
}
