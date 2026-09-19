// FIDE Tacs Highlighter© - Java (.java) Plugin Module

export const JAVAtheme = `
  .k { color: #569cd6; font-weight: bold; }   /* package, import, class, void: ブルー */
  .a { color: #ff007f; font-weight: bold; }   /* public, static, if, for, return: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }   /* アノテーション(@Override): ゴールド */
  .b { color: #4ec9b0; }                      /* String, System, List等型定義: エメラルド */
  .m { color: #dcdcaa; }                      /* println等メソッド呼び出し: ライトイエロー */
  .o { color: #c586c0; font-weight: bold; }   /* 各種演算子記号: マゼンタ */
  .str { color: #ce9178; }                    /* 文字列: オレンジ */
  .c { color: #6a9955; font-style: italic; }   /* コメント: グリーン */
`;

const KEYWORDS = ["package","import","class","interface","enum","extends","implements","void","int","double","float","boolean","char","long","byte","short"];
const MODIFIERS = ["public","private","protected","static","final","abstract","synchronized","volatile","transient"];
const NEON_PINK = ["if","else","switch","case","break","continue","return","for","while","do","new","this","super","null","true","false","try","catch","finally","throw","throws","instanceof"];
const BUILTINS = ["String","System","out","println","print","err","List","ArrayList","HashMap","Map","Set","Integer","Double","Boolean","Math","Exception"];

export function ApplyHighlighttoJAVA(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (MODIFIERS.includes(w) || NEON_PINK.includes(w)) span.className = "a";
    else if (BUILTINS.includes(w)) span.className = "b";
    else if (/^\d+\$/.test(w)) span.style.color = "#b5cea8";
    if (span.className || span.style.color) {
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
    if (c === "'" || c === '"') { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue }
    if (/[a-zA-Z0-9_]/.test(c)) { w += c; } else {
      if (w) {
        if (c === '(') {
          const span = document.createElement("span");
          span.className = BUILTINS.includes(w) ? "b" : "m";
          span.textContent = w; res += span.outerHTML; w = '';
        } else { flush(); }
      }
      if (c === '@') {
        const span = document.createElement("span"); span.className = "s"; span.textContent = c; res += span.outerHTML;
      } else if (['+', '-', '*', '/', '=', '!', '<', '>', '?', '%', ':', '.', '&', '|'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(); return res;
}
