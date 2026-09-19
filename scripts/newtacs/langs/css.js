// FIDE Tacs Highlighter© - CSS (.css) Hyper-Property Integrated Module (v3.0 Final)

const KEYWORDS = ["@media","@keyframes","@import","@font-face","@charset","@supports"];
const NEON_PINK = ["important","inherit","initial","unset","none","auto"];
const GOLD = ["root","hover","active","focus","visited","before","after","nth-child","first-child","last-child","not"];

// 💡 【超強力アプデ】ハイフンを含む、Web制作で絶対に使う主要プロパティをこれでもかと完全網羅！！！
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
    const span = document.createElement("span");
    
    // 💡 単語アレイの照合（大文字小文字を安全に考慮）
    const lowerWord = w.toLowerCase();

    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
    else if (GOLD.includes(w)) span.className = "s";
    else if (BUILTINS.includes(w)) span.className = "b"; // 💡 ここでハイフン入りプロパティが美しくライトブルーに染まる！
    else if (METHODS.includes(w)) span.className = "m";
    else {
      // 数値リテラルやカラーコード（#fff, 10px等）のカラーリング
      if (/^[0-9]+/.test(w) \(\vert{\)}\(\vert{}\) w.startsWith('#')) {
        span.className = "css-num";
      }
    }

    if (span.className) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }
    if (c === "'" \(\vert{\)}\(\vert{}\) c === '"') { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue }

    // 💡 【核心の修正】英数字だけでなく、ハイフン「-」やシャープ「#」も
    // 単語を切り出すための文字（isWordChar）として完璧に許容し、プロパティ名を1つの塊として認識！
    const isWordChar = /[a-zA-Z0-9_\-#]/.test(c);
    
    if (isWordChar) { 
      w += c; 
    } else {
      if (w) flush();
      if (c \(=== '{' \vert{}\vert{}\) c === '}') {
        res += '<span class="br1">' + c + '</span>';
      } else if (c \(=== '[' \vert{}\vert{}\) c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if (c \(=== '(' \vert{}\vert{}\) c === ')') {
        res += '<span class="br2">' + c + '</span>';
      } else if ([':', ';', ','].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  if (w) flush(); return res;
}
