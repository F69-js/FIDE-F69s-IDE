// FIDE Tacs Highlighter© - C++ (.cpp/.h) Plugin Module

export const CPPtheme = `
  .k { color: #569cd6; font-weight: bold; }   /* int, char, void, class: ブルー */
  .a { color: #ff007f; font-weight: bold; }   /* if, for, return, template: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }   /* プリプロセッサ(#include): ゴールド */
  .b { color: #4ec9b0; }                      /* std, cout, cin, vector等型・標準: エメラルド */
  .m { color: #dcdcaa; }                      /* 関数/メソッド呼び出し: ライトイエロー */
  .o { color: #c586c0; font-weight: bold; }   /* スコープ演算子(::)や各種計算記号: マゼンタ */
  .str { color: #ce9178; }                    /* 文字列/文字リテラル: オレンジ */
  .c { color: #6a9955; font-style: italic; }   /* コメント: グリーン */
`;

const KEYWORDS = ["int","char","float","double","void","bool","long","short","signed","unsigned","class","struct","enum","union","public","private","protected","virtual","inline","explicit","typename","namespace","using","sizeof"];
const NEON_PINK = ["if","else","switch","case","break","continue","for","do","while","return","new","delete","this","true","false","try","catch","throw","template"];
const BUILTINS = ["std","cout","cin","endl","vector","string","map","set","list","pair","make_pair","push_back","size","begin","end"];

export function ApplyHighlighttoCPP(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  const trimText = t.trim();

  // 💡 マクロ・プリプロセッサ文を一発で行ごとゴールドに一本釣り！
  if (trimText.startsWith('#')) {
    const span = document.createElement("span");
    span.className = "s"; span.textContent = t; return span.outerHTML;
  }

  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
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

    if (/[a-zA-Z0-9_]/.test(c)) {
      w += c;
    } else {
      if (w) {
        if (c === '(') {
          const span = document.createElement("span");
          span.className = BUILTINS.includes(w) ? "b" : "m";
          span.textContent = w; res += span.outerHTML; w = '';
        } else { flush(); }
      }

      if (c === ':' && t[idx + 1] === ':') {
        const span = document.createElement("span"); span.className = "o"; span.textContent = "::"; res += span.outerHTML; idx += 2; continue;
      } else if (c === '<' && t[idx + 1] === '<') {
        const span = document.createElement("span"); span.className = "o"; span.textContent = "<<"; res += span.outerHTML; idx += 2; continue;
      } else if (c === '>' && t[idx + 1] === '>') {
        const span = document.createElement("span"); span.className = "o"; span.textContent = ">>"; res += span.outerHTML; idx += 2; continue;
      } else if (['+', '-', '*', '/', '=', '!', '<', '>', '%', '&', '|', '^', '.'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(); return res;
}
