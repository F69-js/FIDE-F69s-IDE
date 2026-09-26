const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

// 💡 【追加】特殊変数および関数定義関連のキーワード定義
const WEBPACK_VARS = ["__webpack_require__", "__unused_webpack_module"];

// 💡 複数行をまたぐための鉄壁の状態記憶ステーショナリー
let s = 0, sC = '', c1 = 0, c2 = 0;
// 💡 【追加】波カッコの深度をファイル全体で追従するための深度カウンター
let braceDepth = 0;

export const JStheme = `
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
  .fn { color: #9cdcfe; font-weight: bold; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
  .g-star { color: #ff453a; font-weight: bold; }
  .tmpl-var { color: #9cdcfe; font-weight: bold; }
  
  /* 💡 【新設】18項目の超複雑な極彩色カラークラス */
  .cream { color: #fffdd0; }              /* 定義されてる変数、Webpack変数 */
  .func-call { color: #9cdcfe; }          /* 定義されてる関数（薄い水色） */
  .func-def-name { color: #4fc1ff; }      /* 定義する関数名（少し濃い水色） */
  .func-def-keyword { color: #ebd2b6; }   /* 定義する関数キーワード（濃いクリーム色） */
  .emerald { color: #2ecc71; font-weight: bold; } /* module.exports, importの* */
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
  let isInsideImportFrom = false;

  // 💡 【解析補助】ファイル全体のインポート文の文脈をざっくりトラッキング
  if (t.includes("import") && t.includes("from")) {
    isAfterImport = true;
  }

  const flush = (isProperty = false, isNextCharOpenParen = false, isFunctionKeyword = false) => {
    if (!w) return;
    let className = "";
    
    // 1. 特殊定義キーワードの最優先判定
    if (w === "module" && t.slice(idx, idx + 8) === ".exports") {
      // module.exports が連続している場合、まとめてエメラルドグリーンに
      res += '<span class="emerald">module.exports</span>';
      idx += 8;
      w = '';
      return;
    }
    
    if (WEBPACK_VARS.includes(w)) {
      className = "cream"; // __webpack_require__ や __unused_webpack_module はクリーム色
    } else if (w === "NaN") {
      className = "s"; // NaNはGOLD（または黄色系）に配給
    } else if (w === "function") {
      className = "func-def-keyword"; // 定義する関数は濃いクリーム色に
    } else if (KEYWORDS.includes(w)) {
      className = "k";
    } else if (NEON_PINK.includes(w)) {
      className = "a";
    } else if (GOLD.includes(w)) {
      className = "s";
    } else if (BUILTINS.includes(w)) {
      className = "b";
    } else if (METHODS.includes(w)) {
      className = "m";
    } else if (isNextCharOpenParen) {
      // 後ろに「(」がくっついている場合＝関数呼び出しまたは関数定義名
      if (lastChar === 'n' || isFunctionKeyword) {
        className = "func-def-name"; // 定義する関数名は少し濃い水色に
      } else {
        className = "func-call"; // 定義されてる関数は薄い水色に
      }
    } else if (isProperty) {
      className = "prop"; // オブジェクト接続のプロパティ
    } else {
      // それ以外の通常の変数名など
      // 直前が var/let/const の場合、または定義されてる変数はクリーム色に
      className = "cream";
    }

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { res += w; }
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
      
      // import内の文字列かつ@が含まれている場合の個別カラーハック
      if (isAfterImport && c === '@') {
        res += '<span class="import-at-color">@</span>';
      } else {
        res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    // 数字および負の数の判定ロジック
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush();
      res += '<span class="green-dot">-</span>'; // -も数字の負を表す場合緑に
      idx++;
      continue;
    }

    if (/[a-zA-Z0-9_]/.test(c)) { 
      w += c; 
    } else {
      if (w) {
        // 直前がプロピリオド接続だったかどうかのフラグ
        isAfterDot = (lastChar === '.');
        let isFunctionKeyword = (w === "function");
        
        if (c === '(') {
          flush(isAfterDot, true, isFunctionKeyword);
        } else if (c === ':') { 
          flush(true, false, isFunctionKeyword); 
        } else { 
          flush(isAfterDot, false, isFunctionKeyword); 
        }
      }
      if (c.trim() !== '') lastChar = c;

      // 💡 波カッコの深度に応じた動的マルチカラー判定
      if (c === '{') {
        let currentBraceClass = "brace-depth-" + (braceDepth % 4);
        res += '<span class="' + currentBraceClass + '">{</span>';
        braceDepth++;
      } else if (c === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        let currentBraceClass = "brace-depth-" + (braceDepth % 4);
        res += '<span class="' + currentBraceClass + '">}</span>';
      } 
      // 角カッコ・丸カッコの元々の割り当て
      else if (c === '[' || c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if (c === '(' || c === ')') {
        res += '<span class="br2">' + c + '</span>';
      } 
      // アロー演算子
      else if (c === '=' && t[idx + 1] === '>') {
        res += '<span class="a">=></span>'; idx++;
      } 
      // 💡 星印（*）の条件分岐判定
      else if (c === '*') {
        if (isAfterImport) {
          res += '<span class="emerald">*</span>'; // import...*の*はエメラルドグリーンに
        } else {
          res += '<span class="purple-op">*</span>'; // 単純な掛け算は紫に
        }
      } 
      // 💡 ピリオド（.）の三段活用ロジック
      else if (c === '.') {
        // 直前が「?」ならオプショナルチェーンとして紫に
        if (lastChar === '?') {
          // 直前の「?」のスパンタグを綺麗に上書きするために、末尾から削るか
          // 簡易的にオプショナルチェーン全体を紫として出力
          res = res.slice(0, res.lastIndexOf('<span class="o">?</span>'));
          res += '<span class="purple-op">?.</span>';
        } else if (/[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
          res += '<span class="green-dot">.</span>'; // 小数点の場合は緑
        } else {
          res += '<span class="o">.</span>'; // オブジェクト接続の場合は白（CSS側で指定するか、デフォルトのカラー）
        }
      }
      // 💡 演算子記号のパース
      else if (c === '&') {
        res += '<span class="purple-op">&amp;</span>'; // &は紫
      } else if (/[0-9]/.test(c)) {
        res += '<span class="lime-num">' + c + '</span>'; // 数字はlime色に
      } else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }
  
  // 残ったバッファをフラッシュ
  if (w) {
    isAfterDot = (lastChar === '.');
    flush(isAfterDot);
  }
  
  return res;
}
