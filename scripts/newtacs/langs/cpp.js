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
    return '<span class="s">' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
  }

  const flush = (isBuiltin = false) => {
    if (!w) return;
    let className = "";
    if (KEYWORDS.includes(w)) className = "k";
    else if (NEON_PINK.includes(w)) className = "a";
    else if (BUILTINS.includes(w) || isBuiltin) className = "b";

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { 
      res += w; 
    }
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
          let className = BUILTINS.includes(w) ? "b" : "m";
          res += '<span class="' + className + '">' + w + '</span>'; w = '';
        } else { 
          flush(); 
        }
      }

      if (c === ':' && t[idx + 1] === ':') {
        res += '<span class="o">::</span>'; idx += 2; continue;
      } else if (c === '<' && t[idx + 1] === '<') {
        res += '<span class="o">&lt;&lt;</span>'; idx += 2; continue;
      } else if (c === '>' && t[idx + 1] === '>') {
        res += '<span class="o">&gt;&gt;</span>'; idx += 2; continue;
      } else if (['+', '-', '*', '/', '=', '!', '<', '>', '%', '&', '|', '^', '.'].includes(c)) {
        res += '<span class="o">' + c.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } idx++;
  }
  flush(); return res;
}
