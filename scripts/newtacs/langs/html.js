// FIDE Tacs Highlighter© - HTML Multi-Embedded Script/Style Module (v2.0)
import * as Gateway from "./gateway.js";

const TAGS = ["DOCTYPE","html","head","body","meta","title","link","script","style","div","span","p","a","img","ul","ol","li","table","tr","td","th","thead","tbody","form","input","button","textarea","label","select","option","iframe","canvas","svg"];
const ATTRS = ["id","class","style","href","src","alt","type","value","name","placeholder","disabled","checked","readonly","required","onclick","onload"];

export const HTMLtheme = `
  .k { color: #4ec9b0; font-weight: bold; }
  .a { color: #f2c94c; font-weight: bold; }
  .o { color: #569cd6; }
  .str { color: #ce9178; }
  .c { color: #6a9955; font-style: italic; }
`;

let innerBlockMode = null; // 'js' | 'css' | null

export function ApplyHighlighttoHTML(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  let inTag = false;
  const trimText = t.trim().toLowerCase();

  if (innerBlockMode === 'js' && (trimText.includes('</script>') || trimText.includes('&lt;/script&gt;'))) {
    innerBlockMode = null;
  }
  if (innerBlockMode === 'css' && (trimText.includes('</style>') || trimText.includes('&lt;/style&gt;'))) {
    innerBlockMode = null;
  }

  if (innerBlockMode === 'js') return Gateway.ApplyHighlighttoJS(t);
  if (innerBlockMode === 'css') return Gateway.ApplyHighlighttoCSS(t);

  const flush = () => {
    if (!w) return;
    let cleanWord = w;
    if (w.startsWith("/")) { cleanWord = w.slice(1); }

    let className = "";
    if (inTag) {
      if (TAGS.includes(cleanWord)) className = "k";
      else if (ATTRS.includes(cleanWord)) className = "a";
    }

    if (className) {
      res += '<span class="' + className + '">' + w + '</span>';
    } else { 
      res += w; 
    }

    if (inTag && cleanWord === 'script' && !w.startsWith('/')) innerBlockMode = 'js';
    if (inTag && cleanWord === 'style' && !w.startsWith('/')) innerBlockMode = 'css';

    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; } idx++; continue;
    }
    if (c === '<' && t[idx + 1] === '!' && t[idx + 2] === '-' && t[idx + 3] === '-') {
      flush(); res += '<span class="c">&lt;!--'; idx += 4;
      while (idx < t.length) {
        if (t[idx] === '-' && t[idx + 1] === '-' && t[idx + 2] === '>') { res += '--&gt;</span>'; idx += 3; break; }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
      } continue;
    }
    if (c === '<') { flush(); inTag = true; res += '&lt;'; idx++; continue; }
    if (c === '>') { flush(); inTag = false; res += '&gt;'; idx++; continue; }
    if (c === '"' || c === "'") {
      if (inTag) { flush(); sC = c; res += '<span class="str">' + c; s = 1; idx++; continue; }
    }
    const isWordChar = inTag ? /[a-zA-Z0-9_\-\/]/.test(c) : /[a-zA-Z0-9_]/.test(c);
    if (isWordChar) { w += c; } else {
      if (w) flush();
      if (c === '=' && inTag) {
        res += '<span class="o">=</span>';
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    }
    idx++;
  }
  if (w) flush(); 
  return res;
}
