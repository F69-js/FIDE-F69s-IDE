export const SHtheme = `.k { color: #569cd6; font-weight: bold; } .a { color: #ff007f; } .str { color: #ce9178; } .c { color: #6a9955; }`;
const KEYS = ["if","then","else","fi","for","while","in","do","done","exit","echo","return","case","esac"];
export function ApplyHighlighttoSH(t) {
  let idx = 0, res = '', w = '', c1 = 0, s = 0;
  const flush = () => {
    if (!w) return; const span = document.createElement("span");
    if (KEYS.includes(w)) span.className = "k"; else if (w.startsWith("\$")) span.className = "a";
    if (span.className) { span.textContent = w; res += span.outerHTML; } else { res += w; } w = '';
  };
  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (s) { res += c; if (c === '"') { res += '</span>'; s = 0 } idx++; continue }
    if (c === '#') { flush(); res += '<span class="c">#'; c1 = 1; idx++; continue }
    if (c === '"') { flush(); res += '<span class="str">'; s = 1; idx++; continue }
    if (/[a-zA-Z0-9_\$]/.test(c)) { w += c; } else { flush(); res += c; } idx++;
  } flush(); return res;
}
