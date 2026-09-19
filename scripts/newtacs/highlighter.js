// FIDE Custom IDE - Text-as-colors (Tacs) Central Gateway & AI-Like Auto Detector© (v25.0)
import * as Gateway from "./langs/gateway.js";

let currentLang = 'js';

// 23言語のCSSテーマパレットを完全マッピング
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

/**
 * 💡【コード本文からの全自動言語検出エンジン】
 */
function autoDetectLanguageFromContent() {
  const lines = document.querySelectorAll(".line");
  let fullText = "";
  lines.forEach(line => { fullText += line.innerText + " "; });

  const words = fullText.split(/[^a-zA-Z0-9_\$\#\-\<\>\/]/);
  const scores = { js: 0, html: 0, css: 0, py: 0, php: 0, cpp: 0, json: 0, md: 0 };

  words.forEach(word => {
    if (!word) return;
    const lowerWord = word.toLowerCase();

    if (word.startsWith('<') || word.startsWith('/') || ['html','head','body','div','span','script','style','href','class','id'].includes(lowerWord)) {
      scores.html += 2;
    }
    if (['display','position','margin','padding','background','color','hover','important'].includes(lowerWord)) {
      scores.css += 2;
    }
    if (['def','elif','self','print','import','from'].includes(word)) {
      scores.py += 3;
    }
    if (word.startsWith('\$') || ['echo','foreach','elseif'].includes(word)) {
      scores.php += 3;
    }
    if (word.startsWith('#include') || ['cout','cin','endl','vector'].includes(word)) {
      scores.cpp += 4;
    }
    if (word.startsWith('"') && fullText.includes(':')) {
      scores.json += 1;
    }
    if (word.startsWith('#') || word.startsWith('```')) {
      scores.md += 2;
    }
    if (['const','let','var','function','return','console','log','document'].includes(word)) {
      scores.js += 2;
    }
  });

  let maxScore = 0;
  let detectedLang = 'js';

  for (const lang in scores) {
    if (scores[lang] > maxScore) {
      maxScore = scores[lang];
      detectedLang = lang;
    }
  }

  if (maxScore > 0 && detectedLang !== currentLang) {
    currentLang = detectedLang;
    updateDynamicThemeStyle(detectedLang);
    updateLangIndicator(detectedLang);
    console.log(`[Tacs© AutoDetect] 🧠 本文から言語を自動検知: ${detectedLang.toUpperCase()} (Score: ${maxScore})`);
  }
}

/**
 * ファイル名から拡張子を自動検知して現在の動作言語を切り替える
 */
export function detectLanguageByExtension(filename) {
  if (!filename || !filename.trim() || !filename.includes('.')) {
    autoDetectLanguageFromContent();
    return;
  }
  
  const ext = filename.split('.').pop().toLowerCase();
  if (COMPONENT_THEMES[ext] || ext === 'dockerfile') {
    currentLang = ext; updateDynamicThemeStyle(ext);
  } else if (filename.toLowerCase().includes('dockerfile')) {
    currentLang = 'dockerfile'; updateDynamicThemeStyle('dockerfile');
  } else {
    autoDetectLanguageFromContent();
    return;
  }
  updateLangIndicator(currentLang);
}

export function applyFIDEHighlight() {
  const filename = document.getElementById("filenamei")?.value;
  if (!filename || !filename.trim() || !filename.includes('.')) {
    autoDetectLanguageFromContent();
  }

  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    let h = '';
    
    // 💡【大改造】泥臭い if の壁を、超スッキリした switch-case に全置換して美しさを極限まで高める！
    switch (currentLang) {
      case 'json':       h = Gateway.ApplyHighlighttoJSON(plainText); break;
      case 'html':       h = Gateway.ApplyHighlighttoHTML(plainText); break;
      case 'css':        h = Gateway.ApplyHighlighttoCSS(plainText); break;
      case 'md':         h = Gateway.ApplyHighlighttoMD(plainText); break;
      case 'py':         h = Gateway.ApplyHighlighttoPY(plainText); break;
      case 'php':        h = Gateway.ApplyHighlighttoPHP(plainText); break;
      case 'cpp':
      case 'h':          h = Gateway.ApplyHighlighttoCPP(plainText); break; // 同一処理をまとめるスマート設計
      case 'cs':         h = Gateway.ApplyHighlighttoCS(plainText); break;
      case 'java':       h = Gateway.ApplyHighlighttoJAVA(plainText); break;
      case 'ts':         h = Gateway.ApplyHighlighttoTS(plainText); break;
      case 'sql':        h = Gateway.ApplyHighlighttoSQL(plainText); break;
      case 'sh':         h = Gateway.ApplyHighlighttoSH(plainText); break;
      case 'yaml':
      case 'yml':        h = Gateway.ApplyHighlighttoYAML(plainText); break;
      case 'toml':       h = Gateway.ApplyHighlighttoTOML(plainText); break;
      case 'rs':         h = Gateway.ApplyHighlighttoRust(plainText); break;
      case 'go':         h = Gateway.ApplyHighlighttoGo(plainText); break;
      case 'rb':         h = Gateway.ApplyHighlighttoRuby(plainText); break;
      case 'kt':
      case 'kts':        h = Gateway.ApplyHighlighttoKT(plainText); break;
      case 'swift':      h = Gateway.ApplyHighlighttoSwift(plainText); break;
      case 'dart':       h = Gateway.ApplyHighlighttoDart(plainText); break;
      case 'r':          h = Gateway.ApplyHighlighttoR(plainText); break;
      case 'dockerfile': h = Gateway.ApplyHighlighttoDocker(plainText); break;
      default:           h = Gateway.ApplyHighlighttoJS(plainText); break; // 安全なデフォルトJSフォールバック
    }
    
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

  const targetSrc = "https://placehold.co" + "/128x128/" + bgColor + "/" + textColor + "?text=" + upperLang;
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") { updateDynamicThemeStyle('js'); updateLangIndicator('js'); }
