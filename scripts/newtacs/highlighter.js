// FIDE Custom IDE - Text-as-colors (Tacs) Plugin Theme Router© (v9.0 Final Edition)
import { ApplyHighlighttoJS, JStheme } from "./langs/js.js";
import { ApplyHighlighttoJSON, JSONtheme } from "./langs/json.js";
import { ApplyHighlighttoHTML, HTMLtheme } from "./langs/html.js";
import { ApplyHighlighttoCSS, CSStheme } from "./langs/css.js";

let currentLang = 'js';

const COMPONENT_THEMES = {
  js: JStheme,
  json: JSONtheme,
  html: HTMLtheme,
  css: CSStheme
};

function updateDynamicThemeStyle(lang) {
  let styleTag = document.getElementById("fide-dynamic-tacs-theme");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "fide-dynamic-tacs-theme";
    document.head.appendChild(styleTag);
  }
  styleTag.innerText = COMPONENT_THEMES[lang] || COMPONENT_THEMES['js'];
}

export function detectLanguageByExtension(filename) {
  if (!filename || !filename.trim() || !filename.includes('.')) {
    currentLang = 'js';
    updateDynamicThemeStyle('js');
    updateLangIndicator('js');
    return;
  }
  const ext = filename.split('.').pop().toLowerCase();
  if (['js', 'json', 'html', 'css'].includes(ext)) {
    currentLang = ext;
    updateDynamicThemeStyle(ext);
  } else {
    currentLang = 'js';
    updateDynamicThemeStyle('js');
  }
  updateLangIndicator(currentLang);
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    let highlightedHtml = '';
    
    if (currentLang === 'json') highlightedHtml = ApplyHighlighttoJSON(plainText);
    else if (currentLang === 'html') highlightedHtml = ApplyHighlighttoHTML(plainText);
    else if (currentLang === 'css') highlightedHtml = ApplyHighlighttoCSS(plainText);
    else highlightedHtml = ApplyHighlighttoJS(plainText);
    
    line.innerHTML = highlightedHtml.replace(/\t/g, "|");
  });
}

/**
 * 💡【アクセシビリティ同期ハック】
 * 画面上の文字ノイズを消し去り、alt属性に対して厳格に言語名をインジェクション！
 */
function updateLangIndicator(lang) {
  const icon = document.getElementById("tacs-lang-icon");
  if (!icon) return;

  const upperLang = lang.toUpperCase();
  let textColor = '569cd6'; // デフォルトJS: ブルー
  const bgColor = '1e1e1e';   // エディタに溶け込むダークグレー

  if (lang === 'html') {
    textColor = '4ec9b0';   // HTML: エメラルドグリーン
  } else if (lang === 'css') {
    textColor = 'c586c0';   // CSS: マゼンタピンク
  } else if (lang === 'json') {
    textColor = '9cdcfe';   // JSON: ライトブルー
  } else {
    textColor = '569cd6';   // JS: ブルー
  }

  // 1. placehold.coの動的グラフィックURLをセット
  icon.src = `https://placehold.co/${bgColor}/${textColor}?text=${upperLang}`;
  
  // 💡 2. 【天才設計】alt属性に言語名を確実に流し込み、セマンティクスを完全防衛！
  icon.alt = upperLang;
}

if (typeof document !== "undefined") {
  updateDynamicThemeStyle('js');
  updateLangIndicator('js');
}
