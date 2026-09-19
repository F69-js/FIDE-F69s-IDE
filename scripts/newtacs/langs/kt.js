export const KTtheme = `.k { color: #569cd6; font-weight: bold; } .b { color: #4ec9b0; } .str { color: #ce9178; }`;
const KEYS = ["package","import","fun","val","var","class","interface","return","null"];
export function ApplyHighlighttoKT(t) {
  let idx = 0, res = '', w = '', s = 0;
  const flush = () => {
    if (!w) return; const span = document.createElement("span");
    if (KEYS.includes(w)) span.className = "k";
    if (span.className) { span.textContent = w; res += span.outerHTML; } else { res += w; } w = '';
  };
  while (idx < t.length) {
    const c = t[idx];
    if (s) { res += c; if (c === '"') { res += '</span>'; s = 0 } idx++; continue }
    if (c === '"') { flush(); res += '<span class="str">'; s = 1; idx++; continue }
    if (/[a-zA-Z0-9_]/.test(c)) { w += c; } else { flush(); res += c; } idx++;
  } flush(); return res;
}
