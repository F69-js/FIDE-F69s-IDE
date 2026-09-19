// FIDE Custom IDE - Text-as-colors (Tacs) Plugin Router & Hyperlink Engine© (v11.0)
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

/**
 * 💡【新機能】レンダリングされたHTML文字列の中から http(s) のURLを検知し、
 * エディタの表示を崩さないスマートな「aタグ（ハイパーリンク）」へ全自動置換する関数
 */
function bindHyperlinksToDom(htmlText) {
  // 💡 安全なURL抽出正規表現（文字列やタグの属性に干渉しないように文字実体を考慮）
  const urlRegex = /(https?:\/\/[^\s"'<>\(\)]+)/g;
  
  return htmlText.replace(urlRegex, (url) => {
    // 表示上のノイズ（エスケープされた残骸など）を綺麗にクリーンアップ
    const cleanUrl = url.replace(/&amp;/g, '&');
    
    // <a>タグに変身！エディタのネオンカラーを邪魔しないようにアンダーラインと色を透過指定！
    return '<a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; text-decoration-style: dashed; cursor: pointer;">' + url + '</a>';
  });
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
    
    // 💡 決定打：各プラグインが色付けした後のHTMLに対して、URLハイパーリンクを自動バインド！
    const linkedHtml = bindHyperlinksToDom(highlightedHtml);
    
    line.innerHTML = linkedHtml.replace(/\t/g, "|");
  });
}

function updateLangIndicator(lang) {
  const icon = document.getElementById("tacs-lang-icon");
  if (!icon) return;

  const upperLang = lang.toUpperCase();
  let textColor = '569cd6';
  const bgColor = '1e1e1e';

  if (lang === 'html') textColor = '4ec9b0';
  else if (lang === 'css') textColor = 'c586c0';
  else if (lang === 'json') textColor = '9cdcfe';
  else textColor = '569cd6';

  const targetSrc = "https://placehold.co" + bgColor + "/" + textColor + "?text=" + upperLang;
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") {
  updateDynamicThemeStyle('js');
  updateLangIndicator('js');
}
