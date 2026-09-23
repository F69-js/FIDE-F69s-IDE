// FIDE Tacs Highlighter© - Rust (.rs) Plugin Module

export const Rusttheme = `.k { color: #569cd6; font-weight: bold; } .a { color: #ff007f; } .b { color: #4ec9b0; } .str { color: #ce9178; }`;
const KEYS = ["fn","mod","use","struct","enum","impl","trait","pub","return","let","mut","match","move"];
const BUILTS = ["String","Option","Result","Some","None","Ok","Err","println","vec"];

export function ApplyHighlighttoRust(t) {
  let idx = 0, res = '', w = '', s = 0;
  
  const flush = () => {
    if (!w) return; 
    let className = "";
    if (KEYS.includes(w)) className = "k"; 
    else if (BUILTS.includes(w)) className = "b";

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
    
    if (c === '!' && w) { 
      flush(); 
      res += '<span class="a">!</span>'; 
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
