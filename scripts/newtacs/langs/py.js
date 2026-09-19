// FIDE Tacs Highlighter© - Python (.py) Plugin Module

export const PYtheme = `
  .k { color: #569cd6; font-weight: bold; }   /* def, class, return, import: ブルー */
  .a { color: #ff007f; font-weight: bold; }   /* self, if, while, for, None: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }   /* デコレーター(@): ゴールド */
  .b { color: #4ec9b0; }                      /* print, len, range等ビルツイン: エメラルド */
  .m { color: #dcdcaa; }                      /* ユーザー関数/呼び出し: ライトイエロー */
  .o { color: #c586c0; font-weight: bold; }   /* 演算子(+, -, *, =): マゼンタ */
  .str { color: #ce9178; }                    /* 文字列: オレンジ */
  .c { color: #6a9955; font-style: italic; }   /* コメント(#): グリーン */
  .prop { color: #9cdcfe; }                   /* プロパティアクセス: ライトブルー */
`;

const KEYWORDS = ["def","class","return","import","from","as","try","except","finally","raise","assert","pass","global","nonlocal","lambda","with","yield","del","elif","else"];
const NEON_PINK = ["self","if","while","for","in","is","and","or","not","None","True","False","break","continue"];
const BUILTINS = ["print","len","range","str","int","float","dict","list","set","tuple","type","open","enumerate","zip","append","split","join","max","min","abs","sum"];

export function ApplyHighlighttoPY(t) {
  let idx = 0, res = '', c1 = 0, s = 0, sC = '', w = '';
  let lastChar = '';

  const flush = (isProperty = false) => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
    else if (BUILTINS.includes(w)) span.className = "b";
    else if (isProperty) span.className = "prop";
    else if (/^\d+\$/.test(w)) span.style.color = "#b5cea8";

    if (span.className || span.style.color) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }

    if (c === '#') { flush(); res += '<span class="c">#'; c1 = 1; idx++; continue }
    if (c === "'" || c === '"') { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue }

    if (/[a-zA-Z0-9_]/.test(c)) {
      w += c;
    } else {
      if (w) {
        if (c === '(') {
          const span = document.createElement("span");
          span.className = BUILTINS.includes(w) ? "b" : (KEYWORDS.includes(w) ? "k" : "m");
          span.textContent = w; res += span.outerHTML; w = '';
        } else { flush(lastChar === '.'); }
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '@') {
        const span = document.createElement("span"); span.className = "s"; span.textContent = c; res += span.outerHTML;
      } else if (['+', '-', '*', '/', '=', '!', '<', '>', '%', ':', '.'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  flush(lastChar === '.'); return res;
}
