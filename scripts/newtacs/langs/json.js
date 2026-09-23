// FIDE Tacs Highlighter© - JSON Plugin Module

const NEON_PINK = ["true","false","null"];

export const JSONtheme = `
  .k { color: #ffffff; }
  .a { color: #ff007f; font-weight: bold; }
  .o { color: #b5cea8; }
  .str { color: #ce9178; }
  .prop { color: #9cdcfe; font-weight: bold; }
  .json-num { color: #b5cea8; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
`;

export function ApplyHighlighttoJSON(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  
  const flush = () => {
    if (!w) return;
    let className = "";
    if (NEON_PINK.includes(w)) className = "a";
    else if (/^\d+$/.test(w)) className = "json-num"; // 数字判定の正規表現を微調整

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
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; } 
      idx++; 
      continue;
    }
    if (c === '"') {
      flush(); 
      sC = c;
      let isKey = false, forwardIdx = idx + 1;
      while (forwardIdx < t.length) {
        if (t[forwardIdx] === '"' && t[forwardIdx + 1] === ':') { isKey = true; break; }
        if (t[forwardIdx] === '"') break;
        forwardIdx++;
      }
      res += '<span class="' + (isKey ? 'prop' : 'str') + '">' + c; 
      s = 1; 
      idx++; 
      continue;
    }

    if (/[a-zA-Z0-9_]/.test(c)) { 
      w += c; 
    } else {
      if (w) flush();
      if (c === '{' || c === '}') {
        res += '<span class="br1">' + c + '</span>';
      } else if (c === '[' || c === ']') {
        res += '<span class="br3">' + c + '</span>';
      } else if ([':', ','].includes(c)) {
        res += '<span class="o">' + c + '</span>';
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }
  if (w) flush(); 
  return res;
}
