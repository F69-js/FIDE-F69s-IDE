// FIDE Custom IDE - Text-as-colors (Tacs) PWA Web Worker Engine© (v30.0 Serial Master)
// 💡 【疑似DOMエミュレーター】Worker内部の未定義エラーを完全粉砕！プラグインを一切汚さない鉄壁ハック！

self.document = {
  createElement: (tagName) => {
    return {
      _class: "",
      _text: "",
      style: { color: "" },
      set className(val) { this._class = val; },
      get className() { return this._class; },
      set textContent(val) { this._text = val; },
      get textContent() { return this._text; },
      get outerHTML() {
        if (this.style.color) {
          return '<span style="color: ' + this.style.color + '">' + this._text + '</span>';
        }
        return '<span class="' + this._class + '">' + this._text + '</span>';
      }
    };
  }
};

import * as Gateway from "./langs/gateway.js";

let currentLang = 'js';

const COMPONENT_THEMES = {
  js: Gateway.JStheme, json: Gateway.JSONtheme, html: Gateway.HTMLtheme, css: Gateway.CSStheme, md: Gateway.MDtheme,
  py: Gateway.PYtheme, php: Gateway.PHPtheme, cpp: Gateway.CPPtheme, h: Gateway.CPPtheme, cs: Gateway.CStheme, java: Gateway.JAVAtheme,
  ts: Gateway.TStheme, sql: Gateway.SQLtheme, sh: Gateway.SHtheme, yaml: Gateway.YAMLtheme, yml: Gateway.YAMLtheme, toml: Gateway.TOMLtheme,
  rs: Gateway.Rusttheme, go: Gateway.Gotheme, rb: Gateway.Rubytheme, kt: Gateway.KTtheme, kts: Gateway.KTtheme, swift: Gateway.Swifttheme,
  dart: Gateway.Darttheme, r: Gateway.Rtheme, dockerfile: Gateway.Dockertheme
};

function bindHyperlinksToDom(htmlText) {
  const urlRegex = /(https?:\/\/[^\s"'<>\(\)]+)/g;
  return htmlText.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/&amp;/g, '&');
    return '<a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; text-decoration-style: dashed; cursor: pointer;">' + url + '</a>';
  });
}

self.addEventListener("message", (e) => {
  const { type, filename, linesText, lang } = e.data;

  if (type === "DETECT_LANG") {
    if (!filename || !filename.trim() || !filename.includes('.')) {
      currentLang = 'js';
    } else {
      const ext = filename.split('.').pop().toLowerCase();
      if (COMPONENT_THEMES[ext] || ext === 'dockerfile') {
        currentLang = ext;
      } else if (filename.toLowerCase().includes('dockerfile')) {
        currentLang = 'dockerfile';
      } else {
        currentLang = 'js';
      }
    }
    
    self.postMessage({
      type: "LANG_CHANGED",
      currentLang: currentLang,
      themeCss: COMPONENT_THEMES[currentLang] || COMPONENT_THEMES['js']
    });
    return;
  }

  // 💡 2. 【究極進化】ハイライト一括シリアルパースコマンド
  if (type === "HIGHLIGHT") {
    if (lang) currentLang = lang;

    // 🧠 状態リセット
    if (Gateway.ResetJSState) {
      Gateway.ResetJSState();
    }

    // 💡 配列でぶつ切りにするのを完全に廃止！
    // すべての行を特別な改行マーカー「\n」で繋ぎ、1本の巨大なテキストとして一気にスキャンさせる！
    const fullCombinedText = linesText.join("\n");
    let highlightedCombinedHtml = "";

    switch (currentLang) {
      case 'json':       highlightedCombinedHtml = Gateway.ApplyHighlighttoJSON(fullCombinedText); break;
      case 'html':       highlightedCombinedHtml = Gateway.ApplyHighlighttoHTML(fullCombinedText); break;
      case 'css':        highlightedCombinedHtml = Gateway.ApplyHighlighttoCSS(fullCombinedText); break;
      case 'md':         highlightedCombinedHtml = Gateway.ApplyHighlighttoMD(fullCombinedText); break;
      case 'py':         highlightedCombinedHtml = Gateway.ApplyHighlighttoPY(fullCombinedText); break;
      case 'php':        highlightedCombinedHtml = Gateway.ApplyHighlighttoPHP(fullCombinedText); break;
      case 'cpp':
      case 'h':          highlightedCombinedHtml = Gateway.ApplyHighlighttoCPP(fullCombinedText); break;
      case 'cs':         highlightedCombinedHtml = Gateway.ApplyHighlighttoCS(fullCombinedText); break;
      case 'java':       highlightedCombinedHtml = Gateway.ApplyHighlighttoJAVA(fullCombinedText); break;
      case 'ts':         highlightedCombinedHtml = Gateway.ApplyHighlighttoTS(fullCombinedText); break;
      case 'sql':        highlightedCombinedHtml = Gateway.ApplyHighlighttoSQL(fullCombinedText); break;
      case 'sh':         highlightedCombinedHtml = Gateway.ApplyHighlighttoSH(fullCombinedText); break;
      case 'yaml':
      case 'yml':        highlightedCombinedHtml = Gateway.ApplyHighlighttoYAML(fullCombinedText); break;
      case 'toml':       highlightedCombinedHtml = Gateway.ApplyHighlighttoTOML(fullCombinedText); break;
      case 'rs':         highlightedCombinedHtml = Gateway.ApplyHighlighttoRust(fullCombinedText); break;
      case 'go':         highlightedCombinedHtml = Gateway.ApplyHighlighttoGo(fullCombinedText); break;
      case 'rb':         highlightedCombinedHtml = Gateway.ApplyHighlighttoRuby(fullCombinedText); break;
      case 'kt':
      case 'kts':        highlightedCombinedHtml = Gateway.ApplyHighlighttoKT(fullCombinedText); break;
      case 'swift':      highlightedCombinedHtml = Gateway.ApplyHighlighttoSwift(fullCombinedText); break;
      case 'dart':       highlightedCombinedHtml = Gateway.ApplyHighlighttoDart(fullCombinedText); break;
      case 'r':          highlightedCombinedHtml = Gateway.ApplyHighlighttoR(fullCombinedText); break;
      case 'dockerfile': highlightedCombinedHtml = Gateway.ApplyHighlighttoDocker(fullCombinedText); break;
      default:           highlightedCombinedHtml = Gateway.ApplyHighlighttoJS(fullCombinedText); break;
    }

    // ハイパーリンクを全自動バインド
    const linkedCombinedHtml = bindHyperlinksToDom(highlightedCombinedHtml);

    // 💡 完璧に一括色付けが終わった巨大なHTMLを、元の行ごとの配列へと安全に復元スプリット！
    const highlightedLines = linkedCombinedHtml.split("\n");

    self.postMessage({
      type: "HIGHLIGHT_COMPLETE",
      highlightedLines: highlightedLines
    });
  }
});
