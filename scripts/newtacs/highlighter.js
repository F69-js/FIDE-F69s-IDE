// FIDE Custom IDE - Text-as-colors (Tacs) Plugin Theme Router©
import { ApplyHighlighttoJS, JStheme } from "./newtacs/js.js";
import { ApplyHighlighttoJSON, JSONtheme } from "./newtacs/json.js";
import { ApplyHighlighttoHTML, HTMLtheme } from "./newtacs/html.js";
import { ApplyHighlighttoCSS, CSStheme } from "./newtacs/css.js";

let currentLang = 'js';

// 💡 各モジュールから独立エクスポートされたCSSテキストを完全同期マッピング！
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
  // 💡 【超拡張性】各モジュール内の内蔵CSSコードを、ID付きスタイルタグのinnerTextへ動的流し込み！
  styleTag.innerText = COMPONENT_THEMES[lang] || COMPONENT_THEMES['js'];
}

export function detectLanguageByExtension(filename) {
  if (!filename || !filename.trim() || !filename.includes('.')) {
    currentLang = 'js';
    updateDynamicThemeStyle('js');
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

if (typeof document !== "undefined") {
  updateDynamicThemeStyle('js');
}
