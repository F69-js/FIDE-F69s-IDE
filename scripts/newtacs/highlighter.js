// FIDE Custom IDE - Text-as-colors (Tacs) Multi-Language Highlighter© (v7.0)

const LANGUAGES = {
  js: {
    'k': ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"],
    'a': ["async","while","continue","debugger","null"],
    's': ["this","window","globalThis","super","self","global"],
    'b': ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"],
    'm': ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"]
  },
  json: {
    'k': [],
    'a': ["true","false","null"],
    's': [],
    'b': [],
    'm': []
  },
  html: {
    'k': ["DOCTYPE","html","head","body","meta","title","link","script","style","div","span","p","a","img","ul","ol","li","table","tr","td","th","thead","tbody","form","input","button","textarea","label","select","option","iframe","canvas","svg"],
    'a': ["id","class","style","href","src","alt","type","value","name","placeholder","disabled","checked","readonly","required","onclick","onload"],
    's': [],
    'b': [],
    'm': []
  },
  css: {
    'k': ["@media","@keyframes","@import","@font-face","@charset","@supports"],
    'a': ["important","inherit","initial","unset","none","auto"],
    's': ["root","hover","active","focus","visited","before","after","nth-child","first-child","last-child","not"],
    'b': ["display","position","top","right","bottom","left","width","height","margin","padding","background","color","font","border","box-sizing","flex","grid","opacity","visibility","overflow","z-index","transform","transition","animation"],
    'm': ["calc","url","var","rgba","rgb","hsl","hsla","linear-gradient","translate","rotate","scale"]
  }
};

let currentLang = 'js';

// 💡 ファイル名から拡張子を自動検知するコア
export function detectLanguageByExtension(filename) {
  if (!filename) return;
  const ext = filename.split('.').pop().toLowerCase();
  if (LANGUAGES[ext]) {
    currentLang = ext;
    console.log(`[Tacs© Detector] 🔍 Active Mode: \${ext.toUpperCase()}`);
  } else {
    currentLang = 'js';
    console.log(`[Tacs© Detector] ⚠️ Fallback Mode: JS`);
  }
}

// ─── 💡 各言語専用の独立エクスポート関数群 ───

/**
 * JavaScript用のText-as-colorsハイライトを実行
 * @param {string} text - 生テキスト
 * @returns {string} HTML要素文字列
 */
export function ApplyHighlighttoJS(text) {
  currentLang = 'js';
  return runTacsParser(text);
}

/**
 * JSON用のText-as-colorsハイライトを実行
 * @param {string} text - 生テキスト
 * @returns {string} HTML要素文字列
 */
export function ApplyHighlighttoJSON(text) {
  currentLang = 'json';
  return runTacsParser(text);
}

/**
 * HTML用のText-as-colorsハイライトを実行
 * @param {string} text - 生テキスト
 * @returns {string} HTML要素文字列
 */
export function ApplyHighlighttoHTML(text) {
  currentLang = 'html';
  return runTacsParser(text);
}

/**
 * CSS用のText-as-colorsハイライトを実行
 * @param {string} text - 生テキスト
 * @returns {string} HTML要素文字列
 */
export function ApplyHighlighttoCSS(text) {
  currentLang = 'css';
  return runTacsParser(text);
}

// ─── 💡 メインの統合描画ランチャー ───
export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    
    // 現在の言語設定に合わせて専用関数へ内部ルーティング
    let highlightedHtml = '';
    if (currentLang === 'json') highlightedHtml = ApplyHighlighttoJSON(plainText);
    else if (currentLang === 'html') highlightedHtml = ApplyHighlighttoHTML(plainText);
    else if (currentLang === 'css') highlightedHtml = ApplyHighlighttoCSS(plainText);
    else highlightedHtml = ApplyHighlighttoJS(plainText);
    
    line.innerHTML = highlightedHtml.replace(/\t/g, "|");
  });
}

// ─── 💡 核心のテキスト解析コア（Tacsコア） ───
function runTacsParser(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  let lastChar = '';
  const currentKeywords = LANGUAGES[currentLang];

  const flush = (isProperty = false) => {
    if (!w) return;
    let m = '';
    const found = Object.entries(currentKeywords).find(([cl, arr]) => arr.includes(w));
    if (found) m = found[0];

    const span = document.createElement("span");
    if (m) {
      span.className = m;
    } else if (isProperty && currentLang === 'js') {
      span.className = "prop";
    } else if (currentLang === 'json' && w.startsWith('"') && w.endsWith('"')) {
      span.className = "prop";
    } else if (/^\d+$/.test(w) || /^#[0-9a-fA-F]{3,8}$/.test(w)) {
      span.style.color = "#b5cea8";
    }
    
    if (span.className || span.style.color) {
      span.textContent = w;
      res += span.outerHTML;
    } else {
      res += w;
    }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2 } else idx++; continue }
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }
    
    if (currentLang !== 'json') {
      if (c === '/' && t[idx + 1] === '/') { flush(); res += '<span class="c">//'; c1 = 1; idx += 2; continue }
      if (c === '/' && t[idx + 1] === '*') { flush(); res += '<span class="c">/*'; c2 = 1; idx += 2; continue }
    }
    if (c === "'" || c === '"' || c === '`') { 
      flush(); sC = c; res += `<span class="str">${c}`; s = 1; idx++; continue; 
    }
    
    const isWordChar = currentLang === 'css' ? /[a-zA-Z0-9_\-#]/.test(c) : /[a-zA-Z0-9_]/.test(c);
    if (isWordChar) { 
      w += c; 
    } else {
      if (w) {
        if (c === '(' && currentLang === 'js') {
          let m = '';
          const found = Object.entries(currentKeywords).find(([cl, arr]) => arr.includes(w));
          if (found) m = found[0];
          const span = document.createElement("span");
          span.className = m ? m : "fn";
          span.textContent = w;
          res += span.outerHTML;
          w = '';
        } else if (c === ':' && currentLang === 'js') {
          flush(true);
        } else {
          flush(lastChar === '.');
        }
      }
      
      if (c.trim() !== '') lastChar = c;

      if (c === '{' || c === '}') {
        const span = document.createElement("span"); span.className = "br1"; span.textContent = c; res += span.outerHTML;
      } else if (c === '[' || c === ']') {
        const span = document.createElement("span"); span.className = "br3"; span.textContent = c; res += span.outerHTML;
      } else if (c === '(' || c === ')') {
        const span = document.createElement("span"); span.className = "br2"; span.textContent = c; res += span.outerHTML;
      } else if (c === '=' && t[idx + 1] === '>' && currentLang === 'js') {
        const span = document.createElement("span"); span.className = "a"; span.textContent = "=>"; res += span.outerHTML; idx++;
      } else if (c === '*' && currentLang === 'js') {
        const span = document.createElement("span"); span.className = "g-star"; span.textContent = *c*; res += span.outerHTML; // 修正: 赤星の文字実体
      } else if (['+', '-', '/', '=', '!', '<', '>', '?', '%', ':', '.'].includes(c)) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else {
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    } idx++;
  } 
  flush(lastChar === '.'); 
  return res;
}
