export const YAMLtheme = `.prop { color: #9cdcfe; font-weight: bold; } .str { color: #ce9178; } .c { color: #6a9955; } .o { color: #ffffff; }`;
export function ApplyHighlighttoYAML(t) {
  let idx = 0, res = '', w = '', c1 = 0, inKey = true;
  const flush = () => {
    if (!w) return; const span = document.createElement("span");
    span.className = inKey ? "prop" : "str"; span.textContent = w; res += span.outerHTML; w = '';
  };
  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c === '#') { flush(); res += '<span class="c">#'; c1 = 1; idx++; continue }
    if (c === ':') { flush(); inKey = false; res += '<span class="o">:</span>'; idx++; continue }
    if (c === '-' && idx === 0) { res += '<span class="o">-</span>'; idx++; continue }
    if (/[a-zA-Z0-9_\-\s\/\.]/.test(c)) { w += c; } else { flush(); res += c; } idx++;
  } flush(); return res;
}
