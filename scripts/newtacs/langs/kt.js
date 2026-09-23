// FIDE Tacs Highlighter© - Kotlin (.kt/.kts) Plugin Module

export const KTtheme = `.k { color: #569cd6; font-weight: bold; } .b { color: #4ec9b0; } .str { color: #ce9178; }`;
const KEYS = ["package","import","fun","val","var","class","interface","return","null"];

export function ApplyHighlighttoKT(t) {
  let idx = 0, res = '', w = '', s = 0;
  
  const flush = () => {
    if (!w) return; 
    let className = "";
    if (KEYS.includes(w)) className = "k";

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
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      if (c === '"') { 
        res += '</span>'; 
        s = 0; 
      } 
      idx++; 
      continue; 
    }
    
    if (c === '"') { 
      flush(); 
      res += '<span class="str">'; 
      s = 1; 
      idx++; 
      continue; 
    }
    
    if (/[a-zA-Z0-9_]/.test(c)) { 
      w += c; 
    } else { 
      flush(); 
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
    } 
    idx++;
  } 
  
  flush(); 
  return res;
}
