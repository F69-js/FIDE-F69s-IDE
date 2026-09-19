// FIDE Tacs Highlighter© - JS Template Literal Multi-Line Stable Module (v3.0 Final)

// 💡 行をまたいで文字列や複数行コメントの状態を完全に記憶する、鉄壁の外部ステーショナリー
let s = 0, sC = '', c1 = 0, c2 = 0;

export const JStheme = `
  .k { color: #569cd6; font-weight: bold; }
  .a { color: #ff007f; font-weight: bold; }
  .s { color: #f2c94c; font-weight: bold; }
  .b { color: #4ec9b0; }
  .m { color: #dcdcaa; }
  .o { color: #c586c0; font-weight: bold; }
  .str { color: #ce9178; }
  .tmpl-str { color: #ff8c00; font-weight: bold; } /* ネオンオレンジ */
  .prop { color: #9cdcfe; }
  .c { color: #6a9955; font-style: italic; }
  .fn { color: #dcdcaa; font-weight: bold; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
  .g-star { color: #ff453a; font-weight: bold; }
  .tmpl-var { color: #9cdcfe; font-weight: bold; }
`;

// 💡 親玉がファイル全体のハイライトを新しく開始する直前に、状態を一度クリーンにリセットする関数
export function ResetJSState() {
  s = 0; sC = ''; c1 = 0; c2 = 0;
}

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '', w = '';
  let lastChar = '';

  // 💡 【核心】前の行からテンプレートリテラル(s==2)や複数行コメント(c2==1)が引き継がれていれば、行頭で自動タグ再開！
  if (s === 2) res += '<span class="tmpl-str">';
  if (c2 === 1) res += '<span class="c">';

  const flush = (isProperty = false) => {
    if (!w) return;
    let className = "";
    if (KEYWORDS.includes(w)) className = "k";
    else if (NEON_PINK.includes(w)) className = "a";
    else if (GOLD.includes(w)) className = "s";
    else if (BUILTINS.includes(w)) className = "b";
    else if (METHODS.includes(w)) className = "m";
    else if (isProperty) className = "prop";

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
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }

    if (s === 2) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      
      // 内蔵変数展開 ${variable} の一本釣り着色
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

    if (/[a-zA-Z0-9_]/.test(c)) { w += c; } else {
      if (w) {
        if (c === '(') {
          let className = METHODS.includes(w) ? "m" : (KEYWORDS.includes(w) ? "k" : "fn");
          res += '<span class="' + className + '">' + w + '</span>'; w = '';
        } else if (c === ':') { flush(true); } else { flush(lastChar === '.'); }
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '{' || c === '}') {
        res += '<span class="br1">' + c + '</span>';
      } else if (c === '[' || c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if (c === '(' || c === ')') {
        res += '<span class="br2">' + c + '</span>';
      } else if (c === '=' && t[idx + 1] === '>') {
        res += '<span class="a">=></span>'; idx++;
      } else if (c === '*') {
        res += '<span class="g-star">*</span>';
      } else if (['+', '-', '/', '=', '!', '<', '>', '?', '%', ':', '.'].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(lastChar === '.');
  
  // 💡 【重要】行の終了時にまだ閉じられていなければ、各行のDOM崩れを防ぐために一度綺麗に閉じる！
  if (s === 2) res += '</span>';
  if (c2 === 1) res += '</span>';
  
  return res;
}
