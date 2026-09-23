// FIDE Tacs Highlighter© - CSS (.css) Hyper-Property Integrated Module (v3.0 Final)

const KEYWORDS = ["@media","@keyframes","@import","@font-face","@charset","@supports"];
const NEON_PINK = ["important","inherit","initial","unset","none","auto"];
const GOLD = ["root","hover","active","focus","visited","before","after","nth-child","first-child","last-child","not"];

const BUILTINS = [
  "display","position","top","right","bottom","left","width","height","margin","padding","background","color","font","border","opacity","visibility","overflow","z-index",
  "box-sizing","background-color","background-image","background-size","background-position","background-repeat",
  "font-family","font-size","font-weight","font-style","text-align","text-decoration","text-transform","text-shadow","line-height","letter-spacing",
  "border-radius","border-color","border-width","border-style","box-shadow",
  "flex-direction","flex-wrap","flex-flow","justify-content","align-items","align-content","align-self","flex-grow","flex-shrink","flex-basis",
  "grid-template-columns","grid-template-rows","grid-template-areas","grid-gap","gap","grid-column","grid-row",
  "overflow-x","overflow-y","pointer-events","user-select","white-space","word-break",
  "transform","transition","animation","animation-name","animation-duration","animation-timing-function","animation-delay","animation-iteration-count"
];

const METHODS = ["calc","url","var","rgba","rgb","hsl","hsla","linear-gradient","translate","rotate","scale"];

export const CSStheme = `
  .k { color: #c586c0; font-weight: bold; }   /* アットルール: マゼンタ */
  .a { color: #ff007f; font-weight: bold; }   /* important等: ネオンピンク */
  .s { color: #dcdcaa; font-weight: bold; }   /* 擬似クラス(:hover等): ライトイエロー */
  .b { color: #9cdcfe; }                      /* プロパティ名(box-sizing等): ライトブルー */
  .m { color: #dcdcaa; }                      /* 関数名(calc等): ライトイエロー */
  .o { color: #ffffff; }                      /* コロンやセミコロン: 白 */
  .str { color: #ce9178; }                    /* 文字列リテラル: オレンジ */
  .css-num { color: #b5cea8; }                /* 数値・カラーコード: 淡いグリーン */
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
`;

export function ApplyHighlighttoCSS(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';

  const flush = () => {
    if (!w) return;
    let className = "";
    
    if (KEYWORDS.includes(w)) className = "k";
    else if (NEON_PINK.includes(w)) className = "a";
    else if (GOLD.includes(w)) className = "s";
    else if (BUILTINS.includes(w)) className = "b";
    else if (METHODS.includes(w)) className = "m";
    else if (/^[0-9]+/.test(w) || w.startsWith('#')) {
      className = "css-num";
    }

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { 
      res += w; 
    }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }
    if (c === "'" || c === '"') { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue }

    const isWordChar = /[a-zA-Z0-9_\-#]/.test(c);
    
    if (isWordChar) { 
      w += c; 
    } else {
      if (w) flush();
      if (c === '{' || c === '}') {
        res += '<span class="br1">' + c + '</span>';
      } else if (c === '[' || c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if (c === '(' || c === ')') {
        res += '<span class="br2">' + c + '</span>';
      } else if ([':', ';', ','].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } idx++;
  }
  if (w) flush(); 
  return res;
}
