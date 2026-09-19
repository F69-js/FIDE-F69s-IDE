const NEON_PINK = ["true","false","null"];

// 💡 JSON専用のシックなデータカラーパレットを完全内蔵
export const JSONtheme = `
  .k { color: #ffffff; }
  .a { color: #ff007f; font-weight: bold; } /* true/false: ネオンピンク */
  .s { color: #ffffff; }
  .b { color: #ffffff; }
  .m { color: #ffffff; }
  .o { color: #b5cea8; }                    /* コロン・カンマ: 淡いグリーン */
  .str { color: #ce9178; }                  /* 通常の文字列値: オレンジ */
  .prop { color: #9cdcfe; font-weight: bold; } /* JSONのキー: ライトブルー */
  .json-num { color: #b5cea8; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
`;

export function ApplyHighlighttoJSON(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (NEON_PINK.includes(w)) span.className = "a";
    else if (/^\d+\$/.test(w)) span.className = "json-num";
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
      if (c === sC) { res += '</span>'; s = 0; } idx++; continue;
    }
    if (c === '"') {
      flush(); sC = c;
      let isKey = false, forwardIdx = idx + 1;
      while (forwardIdx < t.length) {
        if (t[forwardIdx] === '"' && t[forwardIdx + 1] === ':') { isKey = true; break; }
        if (t[forwardIdx] === '"') break;
        forwardIdx++;
      }
      res += `<span class="${isKey ? 'prop' : 'str'}">${c}`; s = 1; idx++; continue;
    }
    if (/[a-zA-Z0-9_]/.test(c)) { w += c; } else {
      if (w) flush();
      if (c === '{' || c === '}') {
        const span = document.createElement("span"); span.className = "br1"; span.textContent = c; res += span.outerHTML;
      } else if (c === '[' || c === ']') {
        const span = document.createElement("span"); span.className = "br3"; span.textContent = c; res += span.outerHTML;
      } else if ([':', ','].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    } idx++;
  }
  if (w) flush(); return res;
}
