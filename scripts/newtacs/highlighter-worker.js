// FIDE Custom IDE - Text-as-colors (Tacs) PWA Web Worker Engine© (v28.0 True Final Complete)
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

// 💡 疑似DOM環境が100%完全に整ったので、ゲートウェイを一斉インポート！
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

// ⌨️ メインスレッドからの並列処理メッセージイベント
self.addEventListener("message", (e) => {
  const { type, filename, linesText, lang } = e.data;

  // 1. 拡張子・本文による言語切り替え判定
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
    
    // 決定した言語と専用CSSテーマをメインスレッドへ返送
    self.postMessage({
      type: "LANG_CHANGED",
      currentLang: currentLang,
      themeCss: COMPONENT_THEMES[currentLang] || COMPONENT_THEMES['js']
    });
    return;
  }

  // 2. 🚀 ハイライト一括パースコマンド
  if (type === "HIGHLIGHT") {
    if (lang) currentLang = lang;

    // 💡 【重要】複数行文字列のために、毎回のファイルパースのド頭で行またぎフラグをクリーンにリセット！
    // ゲートウェイ経由で js.js 内の ResetJSState 関数をスマートに大起動！
    if (Gateway.ResetJSState) {
      Gateway.ResetJSState();
    }

    const highlightedLines = linesText.map(plainText => {
      let h = '';
      switch (currentLang) {
        case 'json':       h = Gateway.ApplyHighlighttoJSON(plainText); break;
        case 'html':       h = Gateway.ApplyHighlighttoHTML(plainText); break;
        case 'css':        h = Gateway.ApplyHighlighttoCSS(plainText); break;
        case 'md':         h = Gateway.ApplyHighlighttoMD(plainText); break;
        case 'py':         h = Gateway.ApplyHighlighttoPY(plainText); break;
        case 'php':        h = Gateway.ApplyHighlighttoPHP(plainText); break;
        case 'cpp':
        case 'h':          h = Gateway.ApplyHighlighttoCPP(plainText); break;
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
        default:           h = Gateway.ApplyHighlighttoJS(plainText); break;
      }
      return bindHyperlinksToDom(h).replace(/\t/g, "|");
    });

    // パース完了した極彩色HTMLアレイを送信！
    self.postMessage({
      type: "HIGHLIGHT_COMPLETE",
      highlightedLines: highlightedLines
    });
  }
});
