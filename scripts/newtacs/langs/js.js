const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

const WEBPACK_VARS = ["__webpack_require__", "__unused_webpack_module"];

// 💡 複数行をまたぐための鉄壁の状態記憶ステーショナリー
let s = 0, sC = '', c1 = 0, c2 = 0;
let braceDepth = 0;

export const JStheme = `
  /* 💡 元々の配色ルールを100%完全に死守 */
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
  
  /* 💡 18項目の超複雑な極彩色カラークラス */
  .cream { color: #fffdd0; }                      /* 定義されてる変数、Webpack変数 */
  .func-call { color: #9cdcfe; }                  /* 定義されてる関数（薄い水色） */
  .func-def-name { color: #4fc1ff; font-weight: bold; } /* 定義する関数名（少し濃い水色） */
  .func-def-keyword { color: #ebd2b6; font-weight: bold; } /* 定義する関数キーワード（濃いクリーム色） */
  .emerald { color: #2ecc71; font-weight: bold; }         /* module.exports、importの* */
  .lime-num { color: #00ff00; }                    /* 数字のlime色 */
  .green-dot { color: #27ae60; font-weight: bold; }         /* 小数点、負のマイナス */
  .purple-op { color: #8e44ad; font-weight: bold; }          /* オプショナルチェーン、&、掛け算* */
  .import-at-color { color: #e74c3c; font-weight: bold; }  /* import内の@ */
  
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
  let isAfterVarLetConst = false;
  let isInsideImport = false;

  // 文脈トラッキング
  if (t.includes("import")) {
    isInsideImport = true;
  }

  const flush = (isProperty = false, nextChar = '') => {
    if (!w) return;
    let className = "";
    
    if (w === "function") {
      className = "k"; // function自体は元の青色を絶対死守
    } else if (WEBPACK_VARS.includes(w)) {
      className = "cream"; // __webpack_require__ や __unused_webpack_module はクリーム色
    } else if (w === "NaN") {
      className = "s"; // NaN対応
    } else if (KEYWORDS.includes(w)) {
      className = "k";
      if (["var", "let", "const"].includes(w)) {
        isAfterVarLetConst = true; // 次に来る単語を変数としてマークするフラグ
      }
    } else if (NEON_PINK.includes(w)) {
      className = "a";
    } else if (GOLD.includes(w)) {
      className = "s";
    } else if (BUILTINS.includes(w)) {
      className = "b";
    } else if (METHODS.includes(w)) {
      className = "m";
    } else if (nextChar === '(') {
      // 後ろにカッコが来ている場合
      if (lastChar === 'n' || lastChar === '*') {
        className = "func-def-name"; // 定義する関数名は少し濃い水色に
      } else {
        className = "func-call"; // 定義されてる関数呼び出しは薄い水色に
      }
    } else if (isProperty) {
      className = "prop";
    } else if (isAfterVarLetConst) {
      className = "cream"; // 定義された変数はクリーム色に
      isAfterVarLetConst = false;
    } else {
      className = "cream"; // デフォルトの一般変数もクリーム色で救出
    }

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { 
      res += w; 
    }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    
    // コメントガード
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2 } else idx++; continue }
    
    // 💡 通常の1行文字列モード
    if (s === 1) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      // import内の@の色変更
      if (isInsideImport && c === '@') {
        res += '<span class="import-at-color">@</span>';
      } else {
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }

    // 💡 テンプレートリテラル（複数行文字列）モード
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

    // 💡 module.exports の一括エメラルドグリーン判定
    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush();
      res += '<span class="emerald">module.exports</span>';
      idx += 14;
      lastChar = 's';
      continue;
    }

    // 💡 負の数マイナス判定
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush();
      res += '<span class="green-dot">-</span>';
      idx++;
      continue;
    }

    // 💡 オプショナルチェーンの最優先結合判定 (?.)
    if (c === '?' && t[idx + 1] === '.') {
      flush();
      res += '<span class="purple-op">?.</span>';
      idx += 2;
      lastChar = '.';
      continue;
    }

    // 💡 小数点の判定 (直前が数字かつ直後が数字のピリオド)
    if (c === '.' && /[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
      res += '<span class="green-dot">.</span>';
      idx++;
      continue;
    }

    // 💡 & の二重エスケープ完全防止判定
    if (c === '&') {
      flush();
      res += '<span class="purple-op">&amp;</span>'; // ここで完結させ、後ろの共通処理を通さない！
      idx++;
      lastChar = '&';
      continue;
    }

    // 💡 数字のlime色判定 (アルファベットバッファwから数字を完全に分離！)
    if (/[0-9]/.test(c)) {
      flush();
      res += '<span class="lime-num">' + c + '</span>';
      idx++;
      lastChar = c;
      continue;
    }

    // 純粋な英文字・アンダースコアだけを単語バッファに蓄積
    if (/[a-zA-Z_]/.test(c)) { 
      w += c; 
    } else {
      if (w) {
        flush(lastChar === '.', c);
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
      // 💡 ジェネレーター関数およびインポートの「*」打ち分け
      else if (c === '*') {
        if (isInsideImport || lastChar === 'n') {
          res += '<span class="emerald">*</span>'; // function* や import * の * はエメラルドグリーン
        } else {
          res += '<span class="purple-op">*</span>'; // 単純な掛け算は紫
        }
      } 
      else if (c === '.') {
        res += '<span class="o">.</span>'; // オブジェクト接続のピリオドは白
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
