const KEYWORDS = ["@media","@keyframes","@import","@font-face","@charset","@supports"];
const NEON_PINK = ["important","inherit","initial","unset","none","auto"];
const GOLD = ["root","hover","active","focus","visited","before","after","nth-child","first-child","last-child","not"];
const BUILTINS = ["display","position","top","right","bottom","left","width","height","margin","padding","background","color","font","border","box-sizing","flex","grid","opacity","visibility","overflow","z-index","transform","transition","animation"];
const METHODS = ["calc","url","var","rgba","rgb","hsl","hsla","linear-gradient","translate","rotate","scale"];

export function ApplyHighlighttoCSS(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (KEYWORDS.includes(w)) span.className = "k";
    else if (NEON_PINK.includes(w)) span.className = "a";
    else if (GOLD.includes(w)) span.className = "s";
    else if (BUILTINS.includes(w)) span.className = "b";
    else if (METHODS.includes(w)) span.className = "m";
    else {
      // 💡 システムの誤変換の引き金になる「||」を物理的に完全消滅！
      // 2つの条件（数値リテラルか、CSSカラーコードか）を完全に独立させて安全に判定します。
      if (/^\d+\$/.test(w)) {
        span.style.color = "#b5cea8";
      }
      if (/^#[0-9a-fA-F]{3,8}\$/.test(w)) {
        span.style.color = "#b5cea8";
      }
    }
    if (span.className || span.style.color) {
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
    if (c === "'" || c === '"') { flush(); sC = c; res += `<span class="str">${c}`; s = 1; idx++; continue }
    const isWordChar = /[a-zA-Z0-9_\-#]/.test(c);
    if (isWordChar) { w += c; } else {
      if (w) flush();
      if (c === '{' || c === '}') {
        const span = document.createElement("span"); span.className = "br1"; span.textContent = c; res += span.outerHTML;
      } else if (c === '[' || c === ']') {
        const span = document.createElement("span"); span.className = "br3"; span.textContent = c; res += span.outerHTML;
      } else if (c === '(' || c === ')') {
        const span = document.createElement("span"); span.className = "br2"; span.textContent = c; res += span.outerHTML;
      } else if ([':', ';', ','].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  if (w) flush(); return res;
}
