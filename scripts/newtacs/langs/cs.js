// FIDE Tacs Highlighter© - C# (.cs) Plugin Module

export const CStheme = `
  .k { color: #569cd6; font-weight: bold; }   /* using, namespace, class, string: ブルー */
  .a { color: #ff007f; font-weight: bold; }   /* get, set, if, foreach, return: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }   /* LINQキーワード(from, select): ゴールド */
  .b { color: #4ec9b0; }                      /* Console, Task, List等システム型: エメラルド */
  .m { color: #dcdcaa; }                      /* WriteLine等メソッド呼び出し: ライトイエロー */
  .o { color: #c586c0; font-weight: bold; }   /* ラムダ(=>)や演算子: マゼンタ */
  .str { color: #ce9178; }                    /* 文字列: オレンジ */
  .c { color: #6a9955; font-style: italic; }   /* コメント: グリーン */
`;

const KEYWORDS = ["using","namespace","class","struct","interface","enum","delegate","public","private","protected","internal","static","readonly","virtual","override","abstract","async","await","void","int","string","bool","var","object"];
const NEON_PINK = ["if","else","switch","case","break","continue","return","for","foreach","in","while","do","new","this","base","null","true","false","try","catch","finally","throw","get","set"];
const LINQ = ["from","where","select","orderby","group","into","join"];
const BUILTINS = ["Console","WriteLine","ReadLine","Task","List","Dictionary","Linq","System","Convert","ToString","Int32"];

export function ApplyHighlighttoCS(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
    else if (LINQ.includes(w)) span.className = "s";
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
      if (c === '=' && t[idx + 1] === '>') {
        const span = document.createElement("span"); span.className = "o"; span.textContent = "=>"; res += span.outerHTML; idx += 2; continue;
      } else if (['+', '-', '*', '/', '=', '!', '<', '>', '?', '%', ':', '.', '&', '|'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(); return res;
}
