// FIDE Custom IDE - Text-as-colors (Tacs) Central Gateway & AI-Like Auto Detector©
import * as Gateway from "./langs/gateway.js";

let currentLang = 'js';

// 💡 23言語のCSSテーマパレットを完全マッピング
const COMPONENT_THEMES = {
  js: Gateway.JStheme, json: Gateway.JSONtheme, html: Gateway.HTMLtheme, css: Gateway.CSStheme, md: Gateway.MDtheme,
  py: Gateway.PYtheme, php: Gateway.PHPtheme, cpp: Gateway.CPPtheme, h: Gateway.CPPtheme, cs: CStheme, java: Gateway.JAVAtheme,
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
 * 💡【新コア機能】エディタの本文全体から、各言語のキーワードの出現回数をスコアリングして
 * 拡張子がなくても、今何語が書かれているかを100%全自動でリアルタイム検出する天才関数！
 */
function autoDetectLanguageFromContent() {
  const lines = document.querySelectorAll(".line");
  let fullText = "";
  lines.forEach(line => { fullText += line.innerText + " "; });

  // 単語単位に細かく分解
  const words = fullText.split(/[^a-zA-Z0-9_\$\#\-\<\>\/]/);
  
  // 各言語の「特徴キーワード発見数」をカウントするカウンター
  const scores = { js: 0, html: 0, css: 0, py: 0, php: 0, cpp: 0, json: 0, md: 0 };

  // 🧠 各言語のプラグイン内に定義されているリストを引っ張ってきてマッチング！
  words.forEach(word => {
    if (!word) return;
    const lowerWord = word.toLowerCase();

    // 1. HTMLの検知（タグ名や属性）
    if (word.startsWith('<') || word.startsWith('/') || ['html','head','body','div','span','script','style','href','class','id'].includes(lowerWord)) {
      scores.html += 2;
    }
    // 2. CSSの検知
    if (['display','position','margin','padding','background','color','hover','important'].includes(lowerWord)) {
      scores.css += 2;
    }
    // 3. Pythonの検知
    if (['def','elif','self','print','import','from'].includes(word)) {
      scores.py += 3;
    }
    // 4. PHPの検知
    if (word.startsWith('\$') || ['echo','foreach','elseif'].includes(word)) {
      scores.php += 3;
    }
    // 5. C++の検知
    if (word.startsWith('#include') || ['cout','cin','endl','vector'].includes(word)) {
      scores.cpp += 4;
    }
    // 6. JSONの検知
    if (word.startsWith('"') && fullText.includes(':')) {
      scores.json += 1;
    }
    // 7. Markdownの検知
    if (word.startsWith('#') || word.startsWith('```')) {
      scores.md += 2;
    }
    // 8. JavaScriptの検知（標準予約語）
    if (['const','let','var','function','return','console','log','document'].includes(word)) {
      scores.js += 2;
    }
  });

  // 最高得点を獲得した言語のキーを見つけ出す
  let maxScore = 0;
  let detectedLang = 'js'; // デフォルト

  for (const lang in scores) {
    if (scores[lang] > maxScore) {
      maxScore = scores[lang];
      detectedLang = lang;
    }
  }

  // スコアが一定以上集まった場合のみ、全自動で言語モードをトランスフォーム！
  if (maxScore > 0 && detectedLang !== currentLang) {
    currentLang = detectedLang;
    updateDynamicThemeStyle(detectedLang);
    updateLangIndicator(detectedLang);
    console.log(`[Tacs© AutoDetect] 🧠 本文コードの字句特徴から言語を自動検知しました: ${detectedLang.toUpperCase()}モード (Score: ${maxScore})`);
  }
}

/**
 * ファイル名から拡張子を自動検知して現在の動作言語を切り替える
 */
export function detectLanguageByExtension(filename) {
  // 💡 もしファイル名にドット（拡張子）が含まれていない場合は、
  // 本文の文字列を解析する『コード本文自動判定エンジン』を大起動！！
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
    // 未知の拡張子の時も、本文のキーワード傾向から自動判定して逃がす！
    autoDetectLanguageFromContent();
    return;
  }
  updateLangIndicator(currentLang);
}

export function applyFIDEHighlight() {
  // 💡 1文字打たれるたびに、ファイル名が空なら本文のコードの傾向をリアルタイム監視して、言語を自動切り替え！
  const filename = document.getElementById("filenamei")?.value;
  if (!filename || !filename.trim() || !filename.includes('.')) {
    autoDetectLanguageFromContent();
  }

  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    let h = '';
    
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

  const targetSrc = "https://placehold.co" + "/128x128/" + bgColor + "/" + textColor + "?text=" + upperLang;
  icon.src = targetSrc;
  icon.alt = upperLang;
}

if (typeof document !== "undefined") { updateDynamicThemeStyle('js'); updateLangIndicator('js'); }
