const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

const WEBPACK_VARS = ["__webpack_require__", "__unused_webpack_module"];

// 💡 複数行をまたぐための鉄壁の状態記憶ステーショナリー
let s = 0, sC = '', c1 = 0, c2 = 0;
let braceDepth = 0;

// 💡 【新設】ファイル内で定義された変数と関数を記憶する動的シンボルテーブル
let definedVariables = new Set();
let definedFunctions = new Set();

export const JStheme = `
  /* 💡 太字絶対抹殺ルール（スマートな細文字の等幅フォントへ強制リセット） */
  .line, .line span { font-weight: normal !important; font-style: normal !important; }

  /* 💡 配色ルール定義 */
  .k { color: #569cd6; }
  .a { color: #ff007f; }
  .s { color: #f2c94c; }
  .b { color: #4ec9b0; }
  .m { color: #dcdcaa; }
  .o { color: #c586c0; font-weight: bold; } /* 💡 && や || も含む通常の演算子（紫） */
  .str { color: #ce9178; }
  .tmpl-str { color: #ff8c00; }
  .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; }
  .fn { color: #dcdcaa; }
  .br1 { color: #00ffaa; }
  .br2 { color: #00ffff; }
  .br3 { color: #ff00ff; }
  .g-star { color: #ff453a; }
  .tmpl-var { color: #9cdcfe; }

  /* 💡 追加要件カラー */
  .orange-cream { color: #ebd2b6; }         /* 以降追従する定義済み変数（オレンジがかったクリーム色） */
  .func-def-name { color: #4fc1ff; }        /* 以降追従する定義済み関数（少し濃い水色） */
  .br1-num { color: #00ff00; }              /* 数字のライム色 */
`;

// 💡 状態リセット時に、定義済み変数の引き出しも一緒に綺麗にクリアする！
export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; braceDepth = 0;
  definedVariables.clear();
  definedFunctions.clear();
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lastChar = '';
  let isAfterVarLetConst = false;
  let isAfterFunctionKeyword = false;
  let isInsideImport = false;

  const flush = (isProperty = false, nextChar = '') => {
    if (!w) return;
    let className = "";
    
    if (w === "function") {
      className = "k";
      isAfterFunctionKeyword = true; // 次に来る単語を関数名としてマーク
    } else if (WEBPACK_VARS.includes(w)) {
      className = "s";
    } else if (w === "NaN") {
      className = "s";
    } else if (w === "module" || w === "exports") {
      className = "b";
    } else if (KEYWORDS.includes(w)) {
      className = "k";
      if (["var", "let", "const"].includes(w)) isAfterVarLetConst = true;
      if (w === "import") isInsideImport = true;
    } else if (NEON_PINK.includes(w)) {
      className = "a";
    } else if (GOLD.includes(w)) {
      className = "s";
    } else if (BUILTINS.includes(w)) {
      className = "b";
    } else if (METHODS.includes(w)) {
      className = "m";
    } else if (nextChar === '(' || isAfterFunctionKeyword) {
      // 💡 関数の定義、または以降の関数呼び出しの追従判定
      definedFunctions.add(w); // シンボルテーブルに記憶
      className = "func-def-name"; // 少し濃い水色に
      isAfterFunctionKeyword = false;
    } else if (isAfterVarLetConst) {
      // 💡 変数の新規宣言（let x の瞬間）
      definedVariables.add(w); // シンボルテーブルに記憶
      className = "orange-cream"; // オレンジがかったクリーム色に
      isAfterVarLetConst = false;
    } else if (isProperty) {
      className = "prop";
    } else if (definedFunctions.has(w)) {
      className = "func-def-name"; // 💡 以降、定義された関数名なら「少し濃い水色」で追従
    } else if (definedVariables.has(w)) {
      className = "orange-cream"; // 💡 以降、定義された変数名なら「オレンジがかったクリーム色」で追従
    } else {
      className = ""; // 地字は無色（デフォルト）
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
      if (isInsideImport && c === '@') {
        res += '<span class="a">@</span>';
      } else {
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      if (c === sC) { res += '</span>'; s = 0; isInsideImport = false; } idx++; continue;
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
          res += t[idx].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          idx++;
        }
        continue;
      }
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush();
      res += '<span class="b">module.exports</span>';
      idx += 14;
      lastChar = 's';
      continue;
    }

    // 💡 論理演算子 && の判定（通常の演算子クラス .o に統合して紫へ）
    if (c === '&' && t[idx + 1] === '&') {
      flush();
      res += '<span class="o">&amp;&amp;</span>';
      idx += 2;
      lastChar = '&';
      continue;
    }

    // 💡 論理演算子 || の判定（通常の演算子クラス .o に統合して紫へ）
    if (c === '|' && t[idx + 1] === '|') {
      flush();
      res += '<span class="o">||</span>';
      idx += 2;
      lastChar = '|';
      continue;
    }

    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush();
      res += '<span class="br1">-</span>';
      idx++;
      continue;
    }

    if (c === '?' && t[idx + 1] === '.') {
      flush();
      res += '<span class="a">?.</span>';
      idx += 2;
      lastChar = '.';
      continue;
    }

    if (c === '.' && /[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
      res += '<span class="b">.</span>';
      idx++;
      continue;
    }

    if (c === '&') {
      res += '<span class="a">&amp;</span>';
      idx++;
      continue;
    }

    // 💡 純粋な数字の判定（変数名に入っている数字は /[a-zA-Z_]/ の方でスルーさせるため、単体の数字のみを lime/黄緑系へ）
    if (/[0-9]/.test(c) && w.length === 0) {
      res += '<span class="br1">' + c + '</span>';
      idx++;
      lastChar = c;
      continue;
    }

    // 💡 【重要】英文字・アンダースコアに加えて、変数名内の数字（例: filenamei の i や 1）も安全にバッファへ吸収させて無視（スルー）する！
    if (/[a-zA-Z0-9_\$]/.test(c)) { 
      w += c; 
    } else {
      if (w) {
        flush(lastChar === '.', c);
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '{') {
        let currentBraceClass = braceDepth % 3 === 0 ? "br1" : (braceDepth % 3 === 1 ? "br2" : "br3");
        res += '<span class="' + currentBraceClass + '">{</span>';
        braceDepth++;
      } else if (c === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        let currentBraceClass = braceDepth % 3 === 0 ? "br1" : (braceDepth % 3 === 1 ? "br2" : "br3");
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
        if (isInsideImport || lastChar === 'n') res += '<span class="g-star">*</span>';
        else res += '<span class="o">*</span>';
      } 
      else if (c === '.') {
        res += '<span class="o">.</span>';
      } 
      else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }
  
  if (w) {
    flush(lastChar === '.');
  }
  
  return res;
}
