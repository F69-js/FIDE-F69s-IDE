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

function updateLangIndicator(lang) {
  const icon = document.getElementById("tacs-lang-icon");
  if (!icon) return;

  const upperLang = lang.toUpperCase();
  let textColor = '569cd6';
  const bgColor = '1e1e1e';

  if (lang === 'html') {
    textColor = '4ec9b0';
  } else if (lang === 'css') {
    textColor = 'c586c0';
  } else if (lang === 'json') {
    textColor = '9cdcfe';
  } else {
    textColor = '569cd6';
  }

  // 💡 【あなたの正解コードを完全封入！】
  // これでサイズ指定も結合順序も1ミリの狂いもなく、末尾まで100%綺麗に出力されきりました！
  const targetSrc = "https://placehold.co" + "/128x128/" + bgColor + "/" + textColor + "?text=" + upperLang;
  
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") {
  updateDynamicThemeStyle('js');
  updateLangIndicator('js');
}
