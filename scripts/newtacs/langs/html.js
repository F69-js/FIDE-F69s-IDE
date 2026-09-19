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

// HTML内の特殊埋め込み（JS/CSS領域）の状態を管理するフラグ
let innerBlockMode = null; // 'js' | 'css' | null

export function ApplyHighlighttoHTML(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  let inTag = false;
  const trimText = t.trim().toLowerCase();

  // 💡 【核心：HTML閉じタグのインターセプトリインジェクション】
  // スクリプトやスタイルの領域が終わる瞬間を先読み検知！
  if (innerBlockMode === 'js' && (trimText.includes('</script>') || trimText.includes('&lt;/script&gt;'))) {
    innerBlockMode = null;
  }
  if (innerBlockMode === 'css' && (trimText.includes('</style>') || trimText.includes('&lt;/style&gt;'))) {
    innerBlockMode = null;
  }

  // 💡 【特殊ブロック内部のパース分岐】
  // <script>タグの直後にいる間は、自動でJS専用プラグインへ行データを委託流し込み！
  if (innerBlockMode === 'js') return Gateway.ApplyHighlighttoJS(t);
  if (innerBlockMode === 'css') return Gateway.ApplyHighlighttoCSS(t);

  // ─── 以下、通常のHTMLシリアルスキャン（閉じタグスラッシュ融合版） ───
  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    let cleanWord = w;
    if (w.startsWith("/")) { cleanWord = w.slice(1); }

    if (inTag) {
      if (TAGS.includes(cleanWord)) span.className = "k";
      else if (ATTRS.includes(cleanWord)) span.className = "a";
    }
    if (span.className) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }

    // 💡 【状態遷移の引き金】今開いたタグが script か style かを記憶し、次の行から多重色分けを起動！
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
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    }
    idx++;
  }
  if (w) flush(); return res;
}
