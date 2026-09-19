// FIDE Custom IDE - Text-as-colors (Tacs) Central Gateway Router© (v25.0)
// 💡 【クリーンリファクタリング】23個のインポート文を、gateway.js からの1行に美しく集約！
import * as Gateway from "./langs/gateway.js";

let currentLang = 'js';

const COMPONENT_THEMES = {
  js: Gateway.JStheme, json: Gateway.JSONtheme, html: Gateway.HTMLtheme, css: Gateway.CSStheme, md: Gateway.MDtheme,
  py: Gateway.PYtheme, php: Gateway.PHPtheme, cpp: Gateway.CPPtheme, h: Gateway.CPPtheme, cs: Gateway.CStheme, java: Gateway.JAVAtheme,
  ts: Gateway.TStheme, sql: Gateway.SQLtheme, sh: Gateway.SHtheme, yaml: Gateway.YAMLtheme, yml: Gateway.YAMLtheme, toml: Gateway.TOMLtheme,
  rs: Gateway.Rusttheme, go: Gateway.Gotheme, rb: Gateway.Rubytheme, kt: Gateway.KTtheme, kts: Gateway.KTtheme, swift: Gateway.Swifttheme,
  dart: Gateway.Darttheme, r: Gateway.Rtheme, dockerfile: Gateway.Dockertheme
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
    currentLang = 'js'; updateDynamicThemeStyle('js'); updateLangIndicator('js'); return;
  }
  const ext = filename.split('.').pop().toLowerCase();
  
  if (COMPONENT_THEMES[ext] || ext === 'dockerfile') {
    currentLang = ext; updateDynamicThemeStyle(ext);
  } else if (filename.toLowerCase().includes('dockerfile')) {
    currentLang = 'dockerfile'; updateDynamicThemeStyle('dockerfile');
  } else {
    currentLang = 'js'; updateDynamicThemeStyle('js');
  }
  updateLangIndicator(currentLang);
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    let h = '';
    
    // 💡 ゲートウェイ経由で集約された23大言語の関数を美しくスマートに呼び出し！
    if (currentLang === 'json') h = Gateway.ApplyHighlighttoJSON(plainText);
    else if (currentLang === 'html') h = Gateway.ApplyHighlighttoHTML(plainText);
    else if (currentLang === 'css') h = Gateway.ApplyHighlighttoCSS(plainText);
    else if (currentLang === 'md') h = Gateway.ApplyHighlighttoMD(plainText);
    else if (currentLang === 'py') h = Gateway.ApplyHighlighttoPY(plainText);
    else if (currentLang === 'php') h = Gateway.ApplyHighlighttoPHP(plainText);
    else if (currentLang === 'cpp' || currentLang === 'h') h = Gateway.ApplyHighlighttoCPP(plainText);
    else if (currentLang === 'cs') h = Gateway.ApplyHighlighttoCS(plainText);
    else if (currentLang === 'java') h = Gateway.ApplyHighlighttoJAVA(plainText);
    else if (currentLang === 'ts') h = Gateway.ApplyHighlighttoTS(plainText);
    else if (currentLang === 'sql') h = Gateway.ApplyHighlighttoSQL(plainText);
    else if (currentLang === 'sh') h = Gateway.ApplyHighlighttoSH(plainText);
    else if (currentLang === 'yaml' || currentLang === 'yml') h = Gateway.ApplyHighlighttoYAML(plainText);
    else if (currentLang === 'toml') h = Gateway.ApplyHighlighttoTOML(plainText);
    else if (currentLang === 'rs') h = Gateway.ApplyHighlighttoRust(plainText);
    else if (currentLang === 'go') h = Gateway.ApplyHighlighttoGo(plainText);
    else if (currentLang === 'rb') h = Gateway.ApplyHighlighttoRuby(plainText);
    else if (currentLang === 'kt' || currentLang === 'kts') h = Gateway.ApplyHighlighttoKT(plainText);
    else if (currentLang === 'swift') h = Gateway.ApplyHighlighttoSwift(plainText);
    else if (currentLang === 'dart') h = Gateway.ApplyHighlighttoDart(plainText);
    else if (currentLang === 'r') h = Gateway.ApplyHighlighttoR(plainText);
    else if (currentLang === 'dockerfile') h = Gateway.ApplyHighlighttoDocker(plainText);
    else h = Gateway.ApplyHighlighttoJS(plainText);
    
    line.innerHTML = bindHyperlinksToDom(h).replace(/\t/g, "|");
  });
}

function bindHyperlinksToDom(htmlText) {
  const urlRegex = /(https?:\/\/[^\s"'<>\(\)]+)/g;
  return htmlText.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/&amp;/g, '&');
    return '<a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; text-decoration-style: dashed; cursor: pointer;">' + url + '</a>';
  });
}

function updateLangIndicator(lang) {
  const icon = document.getElementById("tacs-lang-icon"); if (!icon) return;
  const upperLang = lang === 'h' ? 'C++ H' : (lang === 'rs' ? 'RUST' : (lang === 'rb' ? 'RUBY' : lang.toUpperCase()));
  
  let textColor = '569cd6'; const bgColor = '1e1e1e';
  if (['html', 'cpp', 'h', 'rs'].includes(lang)) textColor = '4ec9b0';
  else if (['css', 'php', 'dockerfile'].includes(lang)) textColor = 'c586c0';
  else if (['json', 'ts', 'toml', 'swift'].includes(lang)) textColor = '9cdcfe';
  else if (['md', 'sh', 'kt', 'kts'].includes(lang)) textColor = 'dcdcaa';
  else if (['py', 'sql', 'yaml', 'yml', 'go', 'dart', 'r'].includes(lang)) textColor = 'f2c94c';

  // 💡 あなたの100%絶対正解結合コードで完全自動連動！
  const targetSrc = "https://placehold.co" + "/128x128/" + bgColor + "/" + textColor + "?text=" + upperLang;
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") { updateDynamicThemeStyle('js'); updateLangIndicator('js'); }
