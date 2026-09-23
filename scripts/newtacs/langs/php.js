// FIDE Tacs Highlighter© - PHP (.php) Plugin Module

export const PHPtheme = `
  .k { color: #c586c0; font-weight: bold; }    /* function, class, namespace: マゼンタ */
  .a { color: #ff007f; font-weight: bold; }    /* $this, if, foreach, echo, return: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }    /* 変数全体($から始まる単語): ゴールド */
  .b { color: #4ec9b0; }                       /* array, explode, count等標準関数: エメラルド */
  .m { color: #569cd6; }                       /* 特殊キーワード(public, static): ブルー */
  .o { color: #ffffff; }                       /* アロー(->)や各種演算子: 白 */
  .str { color: #ce9178; }                     /* 文字列: オレンジ */
  .c { color: #6a9955; font-style: italic; }   /* コメント(//, /*): グリーン */
  .prop { color: #9cdcfe; }                    /* プロパティ: ライトブルー */
`;

const KEYWORDS = ["class","interface","namespace","use","extends","implements","new","try","catch","throw"];
const MODIFIERS = ["public","protected","private","static","final","abstract","function"];
const NEON_PINK = ["if","else","elseif","while","do","for","foreach","as","break","continue","return","echo","exit","die","null","true","false"];
const BUILTINS = ["array","explode","implode","count","strlen","str_replace","isset","unset","empty","header","json_encode","json_decode","print_r","var_dump"];

export function ApplyHighlighttoPHP(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  let lastChar = '';

  const flush = (isProperty = false) => {
    if (!w) return;
    let className = "";
    let inlineStyle = "";

    if (w.startsWith('$')) className = "s";
    else if (KEYWORDS.includes(w)) className = "k";
    else if (MODIFIERS.includes(w)) className = "m";
    else if (NEON_PINK.includes(w)) className = "a";
    else if (BUILTINS.includes(w)) className = "b";
    else if (isProperty) className = "prop";
    else if (/^\d+$/.test(w)) inlineStyle = "color: #b5cea8;";

    const safeW = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (className) {
      res += '<span class="' + className + '">' + safeW + '</span>';
    } else if (inlineStyle) {
      res += '<span style="' + inlineStyle + '">' + safeW + '</span>';
    } else { 
      res += safeW; 
    }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (c1) { 
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      if (c === '\n') { 
        res += '</span>'; 
        c1 = 0; 
      } 
      idx++; 
      continue; 
    }
    if (c2) { 
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      if (c === '*' && t[idx + 1] === '/') { 
        res += '/</span>'; 
        c2 = 0; 
        idx += 2; 
      } else {
        idx++;
      } 
      continue; 
    }
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; } 
      idx++; 
      continue;
    }

    if (c === '/' && t[idx + 1] === '/') { flush(); res += '<span class="c">//'; c1 = 1; idx += 2; continue; }
    if (c === '/' && t[idx + 1] === '*') { flush(); res += '<span class="c">/*'; c2 = 1; idx += 2; continue; }
    if (c === "'" || c === '"') { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; }

    if (/[a-zA-Z0-9_\$]/.test(c)) {
      w += c;
    } else {
      if (w) {
        if (c === '(') {
          let className = "b";
          res += '<span class="' + className + '">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>'; 
          w = '';
        } else { 
          flush(lastChar === '>'); 
        }
      }
      if (c.trim() !== '') lastChar = c;

      if (c === '-' && t[idx + 1] === '>') {
        res += '<span class="o">-&gt;</span>'; 
        idx += 2; 
        continue;
      } else if (['+', '-', '*', '/', '=', '!', '<', '?', '%', ':', '.', '&'].includes(c)) {
        res += '<span class="o">' + c.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }
  flush(lastChar === '>'); 
  return res;
}
