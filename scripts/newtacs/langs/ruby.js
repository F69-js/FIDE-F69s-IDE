// FIDE Tacs Highlighter© - Ruby (.rb) Plugin Module

export const Rubytheme = `.k { color: #c586c0; font-weight: bold; } .a { color: #ff007f; } .b { color: #4ec9b0; } .str { color: #ce9178; }`;
const KEYS = ["def","end","class","module","require","return","yield","puts","p"];

export function ApplyHighlighttoRuby(t) {
  let idx = 0, res = '', w = '', s = 0;
  
  const flush = () => {
    if (!w) return; 
    let className = "";
    if (KEYS.includes(w)) className = "k"; 
    else if (w.startsWith("@")) className = "b";

    const safeW = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (className) {
      res += '<span class="' + className + '">' + safeW + '</span>';
    } else { 
      res += safeW; 
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
    
    if (/[a-zA-Z0-9_@]/.test(c)) { 
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
