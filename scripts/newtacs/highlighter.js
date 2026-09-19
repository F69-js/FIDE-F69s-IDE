// FIDE Custom IDE - Tacs© Universe 23-Language Router Master (v24.0 True Fixed)
// 💡 【配線100%完全復旧】同じ scripts/ 内にある正しい「./langs/」から完璧にインポート！
import { ApplyHighlighttoJS, JStheme } from "./langs/js.js";
import { ApplyHighlighttoJSON, JSONtheme } from "./langs/json.js";
import { ApplyHighlighttoHTML, HTMLtheme } from "./langs/html.js";
import { ApplyHighlighttoCSS, CSStheme } from "./langs/css.js";
import { ApplyHighlighttoMD, MDtheme } from "./langs/md.js";
import { ApplyHighlighttoPY, PYtheme } from "./langs/py.js";
import { ApplyHighlighttoPHP, PHPtheme } from "./langs/php.js";
import { ApplyHighlighttoCPP, CPPtheme } from "./langs/cpp.js";
import { ApplyHighlighttoCS, CStheme } from "./langs/cs.js";
import { ApplyHighlighttoJAVA, JAVAtheme } from "./langs/java.js";
import { ApplyHighlighttoTS, TStheme } from "./langs/ts.js";
import { ApplyHighlighttoSQL, SQLtheme } from "./langs/sql.js";
import { ApplyHighlighttoSH, SHtheme } from "./langs/sh.js";
import { ApplyHighlighttoYAML, YAMLtheme } from "./langs/yaml.js";
import { ApplyHighlighttoTOML, TOMLtheme } from "./langs/toml.js";
import { ApplyHighlighttoRust, Rusttheme } from "./langs/rust.js";
import { ApplyHighlighttoGo, Gotheme } from "./langs/go.js";
import { ApplyHighlighttoRuby, Rubytheme } from "./langs/ruby.js";
import { ApplyHighlighttoKT, KTtheme } from "./langs/kt.js";
import { ApplyHighlighttoSwift, Swifttheme } from "./langs/swift.js";
import { ApplyHighlighttoDart, Darttheme } from "./langs/dart.js";
import { ApplyHighlighttoR, Rtheme } from "./langs/r.js";
import { ApplyHighlighttoDocker, Dockertheme } from "./langs/docker.js";

let currentLang = 'js';

const COMPONENT_THEMES = {
  js: JStheme, json: JSONtheme, html: HTMLtheme, css: CSStheme, md: MDtheme,
  py: PYtheme, php: PHPtheme, cpp: CPPtheme, h: CPPtheme, cs: CStheme, java: JAVAtheme,
  ts: TStheme, sql: SQLtheme, sh: SHtheme, yaml: YAMLtheme, yml: YAMLtheme, toml: TOMLtheme,
  rs: Rusttheme, go: Gotheme, rb: Rubytheme, kt: KTtheme, kts: KTtheme, swift: Swifttheme,
  dart: Darttheme, r: Rtheme, dockerfile: Dockertheme
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
    
    if (currentLang === 'json') h = ApplyHighlighttoJSON(plainText);
    else if (currentLang === 'html') h = ApplyHighlighttoHTML(plainText);
    else if (currentLang === 'css') h = ApplyHighlighttoCSS(plainText);
    else if (currentLang === 'md') h = ApplyHighlighttoMD(plainText);
    else if (currentLang === 'py') h = ApplyHighlighttoPY(plainText);
    else if (currentLang === 'php') h = ApplyHighlighttoPHP(plainText);
    else if (currentLang === 'cpp' || currentLang === 'h') h = ApplyHighlighttoCPP(plainText);
    else if (currentLang === 'cs') h = ApplyHighlighttoCS(plainText);
    else if (currentLang === 'java') h = ApplyHighlighttoJAVA(plainText);
    else if (currentLang === 'ts') h = ApplyHighlighttoTS(plainText);
    else if (currentLang === 'sql') h = ApplyHighlighttoSQL(plainText);
    else if (currentLang === 'sh') h = ApplyHighlighttoSH(plainText);
    else if (currentLang === 'yaml' || currentLang === 'yml') h = ApplyHighlighttoYAML(plainText);
    else if (currentLang === 'toml') h = ApplyHighlighttoTOML(plainText);
    else if (currentLang === 'rs') h = ApplyHighlighttoRust(plainText);
    else if (currentLang === 'go') h = ApplyHighlighttoGo(plainText);
    else if (currentLang === 'rb') h = ApplyHighlighttoRuby(plainText);
    else if (currentLang === 'kt' || currentLang === 'kts') h = ApplyHighlighttoKT(plainText);
    else if (currentLang === 'swift') h = ApplyHighlighttoSwift(plainText);
    else if (currentLang === 'dart') h = ApplyHighlighttoDart(plainText);
    else if (currentLang === 'r') h = ApplyHighlighttoR(plainText);
    else if (currentLang === 'dockerfile') h = ApplyHighlighttoDocker(plainText);
    else h = ApplyHighlighttoJS(plainText);
    
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

  // 💡 【あなたの100%大正解結合】
  const targetSrc = "https://placehold.co" + "/128x128/" + bgColor + "/" + textColor + "?text=" + upperLang;
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") { updateDynamicThemeStyle('js'); updateLangIndicator('js'); }
