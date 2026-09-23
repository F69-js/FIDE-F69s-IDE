// FIDE Tacs Highlighter© - SQL (.sql) Plugin Module

export const SQLtheme = `.k { color: #569cd6; font-weight: bold; } .a { color: #c586c0; font-weight: bold; } .str { color: #ce9178; } .c { color: #6a9955; }`;
const KEYS = ["SELECT","FROM","WHERE","INSERT","INTO","UPDATE","SET","DELETE","CREATE","TABLE","DROP","ALTER","INDEX"];
const OPS = ["AND","OR","NOT","IN","IS","NULL","LIKE","JOIN","LEFT","RIGHT","ON","GROUP","BY","ORDER"];

export function ApplyHighlighttoSQL(t) {
  let idx = 0, res = '', w = '', c1 = 0, s = 0;
  
  const flush = () => {
    if (!w) return; 
    let className = "";
    const upperW = w.toUpperCase();
    
    if (KEYS.includes(upperW)) className = "k";
    else if (OPS.includes(upperW)) className = "a";

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
    if (c1) { 
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      if (c === '\n') { 
        res += '</span>'; 
        c1 = 0; 
      } 
      idx++; 
      continue; 
    }
    if (s) { 
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      if (c === "'") { 
        res += '</span>'; 
        s = 0; 
      } 
      idx++; 
      continue; 
    }
    
    if (c === '-' && t[idx + 1] === '-') { 
      flush(); 
      res += '<span class="c">--'; 
      c1 = 1; 
      idx += 2; 
      continue; 
    }
    
    if (c === "'") { 
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
