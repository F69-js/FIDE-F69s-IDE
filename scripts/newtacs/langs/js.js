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
`;

export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0; braceDepth = 0;
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lastChar = '';
  let isAfterVarLetConst = false;
  let isInsideImport = false;

  const flush = (isProperty = false) => {
    if (!w) return;
    let className = "";
    
    // 💡 18要件キーワード判定を元のクラス名へ綺麗にマッピング！
    if (WEBPACK_VARS.includes(w)) {
      className = "s"; // 💡 __webpack_require__ 等はクリーム色の代わりにGOLD（黄色系.s）で即座に光らせる！
    } else if (w === "NaN") {
      className = "s"; // NaN対応
    } else if (w === "module" || w === "exports") {
      className = "b"; // module.exports の構成要素はエメラルドグリーンの代わりにビルトイン系（.b）で鮮やかに発光！
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
    } else if (isProperty) {
      className = "prop"; // オブジェクト接続のピリオド直後は白・水色（.prop）に
    } else if (isAfterVarLetConst) {
      className = "s"; // 定義された変数は黄色系（.s）で救出
      isAfterVarLetConst = false;
    } else {
      className = "s"; // 一般変数も無色にさせず確実に色付け
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
        res += '<span class="a">@</span>'; // 文字列内の@を鮮やかなネオンピンク（.a）に！
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

    // 💡 【超重要修正】英文字・アンダースコアだけを厳密に単語バッファへ蓄積！数字や記号は絶対に入れない！
    if (/[a-zA-Z_]/.test(c)) { 
      w += c; 
    } else {
      // 💡 記号や数字に出会った瞬間、溜まっていた単語を安全にフラッシュ！
      if (w) {
        if (c === '(') {
          let className = METHODS.includes(w) ? "m" : (KEYWORDS.includes(w) ? "k" : "fn");
          res += '<span class="' + className + '">' + w + '</span>'; w = '';
        } else {
          flush(lastChar === '.');
        }
      }
      if (c.trim() !== '') lastChar = c;

      // 💡 多重波カッコの深度グラデーションを元々のクラス名（br1, br2, br3）で安全に再現！
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
      // 💡 ジェネレーター関数（function*）およびインポート「*」の完璧な打ち分け
      else if (c === '*') {
        if (isInsideImport || lastChar === 'n') {
          res += '<span class="g-star">*</span>'; // 鮮烈な赤（.g-star）でハイライト！
        } else {
          res += '<span class="o">*</span>'; // 通常の掛け算は紫・ピンク（.o）に
        }
      } 
      // 💡 ピリオドの三段活用
      else if (c === '.') {
        if (lastChar === '?') {
          // オプショナルチェーンの結合（直前の「?」を上書き）
          res = res.slice(0, res.lastIndexOf('<span class="o">?</span>'));
          res += '<span class="a">?.</span>'; // 紫・ネオンピンク（.a）で目立たせる！
        } else if (/[0-9]/.test(t[idx - 1] || '') && /[0-9]/.test(t[idx + 1] || '')) {
          res += '<span class="b">.</span>'; // 小数点はエメラルド・ミント（.b）に！
        } else {
          res += '<span class="o">.</span>'; // オブジェクト接続は演算子（.o）の白・紫に
        }
      }
      // 💡 & の二重エスケープ完全防止
      else if (c === '&') {
        res += '<span class="a">&amp;</span>'; // &をネオンピンク（.a）に！
      } 
      // 💡 数字のライム色・緑の再現
      else if (/[0-9]/.test(c)) {
        res += '<span class="br1">' + c + '</span>'; // 数字を鮮やかな黄緑・ライム（.br1）で救出！
      } 
      else if (c === '-' && /[0-9]/.test(t[idx + 1] || '')) {
        res += '<span class="br1">-</span>'; // 負のマイナスも数字と同じ色に！
      }
      else if (['+', '/', '=', '!', '<', '>', '?', '%', ':'].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }
  
  if (w) {
    flush(lastChar === '.');
  }
  
  return res;
}
