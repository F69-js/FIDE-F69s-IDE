const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

const WEBPACK_VARS = ["__webpack_require__", "__unused_webpack_module"];

// 💡 複数行をまたぐための鉄壁の状態記憶ステーショナリー
let s = 0, sC = '', c1 = 0, c2 = 0;
let braceDepth = 0;

export const JStheme = `
  /* 💡 【太字絶対抹殺ルール】すべての太字（bold）を物理的に100%解除し、スマートな細文字の等幅フォントへ強制リセット！ */
  .line, .line span { font-weight: normal !important; font-style: normal !important; }

  /* 💡 元々の美しい基本配色（太字指定はすべて排除） */
  .k { color: #569cd6; }
  .a { color: #ff007f; }
  .s { color: #f2c94c; }
  .b { color: #4ec9b0; }
  .m { color: #dcdcaa; }
  .o { color: #c586c0; }
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
`;

export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; braceDepth = 0;
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lastChar = '';
  let isAfterVarLetConst = false;
  let isInsideImport = false;

  const flush = (isProperty = false, nextChar = '') => {
    if (!w) return;
    let className = "";
    
    // 💡 18要件キーワード判定を元のクラス名へ綺麗にマッピング！
    if (w === "function") {
      className = "k"; // function自体は元の美しい青色を絶対死守
    } else if (WEBPACK_VARS.includes(w)) {
      className = "s"; // __webpack_require__ 等は黄色系（.s）で光らせる
    } else if (w === "NaN") {
      className = "s"; // NaN対応
    } else if (w === "module" || w === "exports") {
      className = "b"; // module.exports の構成要素はビルトイン系（.b）で鮮やかに発光
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
    } else if (nextChar === '(') {
      if (lastChar === 'n' || lastChar === '*') {
        className = "func-def-name"; // 定義する関数名は少し濃い水色（.func-def-nameは上のCSSでプロパティ色などへ適宜追記可能、今回は安全にfnへマッピングされるよう後続で吸収）
        res += '<span class="prop">' + w + '</span>'; w = ''; return;
      } else {
        className = "m"; // 定義されてる関数は薄い水色・メソッド系（.m）に
      }
    } else if (isProperty) {
      className = "prop"; // オブジェクト接続のピリオド直後は白・水色（.prop）に
    } else if (isAfterVarLetConst) {
      className = "s"; // 定義された変数は黄色系（.s）で救出
      isAfterVarLetConst = false;
    } else {
      className = ""; // ⭕ 【ゴールド大炎上完全鎮火】それ以外の地字は無色（デフォルト色）にして金ピカ化を阻止！
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
      // import内の@の色変更
      if (isInsideImport && c === '@') {
        res += '<span class="a">@</span>'; // 文字列内の@を鮮やかなネオンピンク（.a）に
      } else {
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      if (c === sC) { res += '</span>'; s = 0; isInsideImport = false; } idx++; continue;
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

    // 💡 module.exports の一括判定
    if (c === 'm' && t.slice(idx, idx + 14) === "module.exports") {
      flush();
      res += '<span class="b">module.exports</span>';
      idx += 14;
      lastChar = 's';
      continue;
    }

    // 💡 負の数マイナス判定
    if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
      flush();
      res += '<span class="br1">-</span>';
      idx++;
      continue;
    }

    // 💡 オプショナルチェーン (?.) の正確な判定
    if (c === '?' && t[idx + 1] === '.') {
      flush();
      res += '<span class="a">?.</span>';
      idx += 2;
      lastChar = '.';
      continue;
    }

    // 💡 小数点の正確な判定 (前後の文字特性を見て安全に判定)
    if (c === '.' && /[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
      res += '<span class="b">.</span>';
      idx++;
      continue;
    }

    // 💡 & の二重エスケープ完全防止判定
    if (c === '&') {
      flush();
      res += '<span class="a">&amp;</span>';
      idx++;
      lastChar = '&';
      continue;
    }

    // 💡 数字のミント・黄緑（.br1）判定
    if (/[0-9]/.test(c)) {
      flush();
      res += '<span class="br1">' + c + '</span>';
      idx++;
      lastChar = c;
      continue;
    }

    // 英文字・アンダースコアだけを単語バッファへ蓄積
    if (/[a-zA-Z_]/.test(c)) { 
      w += c; 
    } else {
      if (w) {
        if (c === '(') {
          let className = METHODS.includes(w) ? "m" : (KEYWORDS.includes(w) ? "k" : "fn");
          res += '<span class="' + className + '">' + w + '</span>'; w = '';
        } else {
          flush(lastChar === '.');
        }
      }
      if (c.trim() !== '') lastChar = c;

      // 多重波カッコの深度グラデーションを元々のクラス名（br1, br2, br3）で安全に再現！
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
      // 💡 ジェネレーター関数およびインポート「*」の完璧な打ち分け
      else if (c === '*') {
        if (isInsideImport || lastChar === 'n') {
          res += '<span class="g-star">*</span>'; // 鮮烈な赤（.g-star）でハイライト
        } else {
          res += '<span class="o">*</span>'; // 通常の掛け算
        }
      } 
      else if (c === '.') {
        res += '<span class="o">.</span>'; // オブジェクト接続
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
