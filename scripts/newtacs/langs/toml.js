// FIDE Tacs Highlighter© - TOML (.toml) Plugin Module

export const TOMLtheme = `.prop { color: #9cdcfe; } .k { color: #f2c94c; } .str { color: #ce9178; } .o { color: #ffffff; }`;

export function ApplyHighlighttoTOML(t) {
  let idx = 0, res = '', w = '', s = 0;
  
  const flush = () => {
    if (!w) return; 
    const className = t.trim().startsWith("[") ? "k" : "prop";
    const safeW = w.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    res += '<span class="' + className + '">' + safeW + '</span>';
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (s) { 
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
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
    
    if (['=', '[', ']'].includes(c)) { 
      flush(); 
      res += '<span class="o">' + c + '</span>'; 
      idx++; 
      continue; 
    }
    
    if (/[a-zA-Z0-9_\-\s\.]/.test(c)) { 
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
