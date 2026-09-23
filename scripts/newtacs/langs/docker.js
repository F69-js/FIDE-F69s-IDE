// FIDE Tacs Highlighter© - Dockerfile Plugin Module

export const Dockertheme = `.k { color: #c586c0; font-weight: bold; } .str { color: #ce9178; } .c { color: #6a9955; }`;
const KEYS = ["FROM","RUN","CMD","LABEL","EXPOSE","ENV","ADD","COPY","ENTRYPOINT","VOLUME","USER","WORKDIR","ARG","ONBUILD","STOPSIGNAL","HEALTHCHECK","SHELL"];

export function ApplyHighlighttoDocker(t) {
  let idx = 0, res = '', w = '', c1 = 0;
  
  const flush = () => {
    if (!w) return; 
    let className = "";
    if (KEYS.includes(w.toUpperCase())) className = "k";

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { 
      res += w; 
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
    
    if (c === '#') { 
      flush(); 
      res += '<span class="c">#'; 
      c1 = 1; 
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
