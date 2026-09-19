// FIDE Custom IDE - Web Worker Tacs© Interface Router (v26.0 Master)
// 💡 重たい計算をすべて別スレッドのWorkerへ委託し、タイピング遅延を100%永久に根絶！

let currentLang = 'js';

// 💡 【マルチスレッド起動】ハイライト専用のWeb Workerインスタンスを生成！
// type: "module" を付与することで、Worker内部でのインポート文もネイティブ開通！
const fideWorker = new Worker(new URL("./highlighter-worker.js", import.meta.url), { type: "module" });

// 💡 Workerから計算完了のメッセージが届いた時の非同期処理フック
fideWorker.addEventListener("message", (e) => {
  const { type, currentLang: lang, themeCss, highlightedLines } = e.data;

  // 1. 言語・CSS切り替えが返ってきた時
  if (type === "LANG_CHANGED") {
    currentLang = lang;
    
    let styleTag = document.getElementById("fide-dynamic-tacs-theme");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "fide-dynamic-tacs-theme";
      document.head.appendChild(styleTag);
    }
    styleTag.innerText = themeCss;
    updateLangIndicator(currentLang);
  }

  // 2. ハイライトパースがすべて完了して返ってきた時
  if (type === "HIGHLIGHT_COMPLETE") {
    const lines = document.querySelectorAll(".line");
    lines.forEach((line, idx) => {
      if (highlightedLines[idx] !== undefined) {
        // 💡 画面がカクつくことなく、計算済みの極彩色HTMLを一瞬でDOMへフラッシュ反映！
        line.innerHTML = highlightedLines[idx];
      }
    });
  }
});

export function detectLanguageByExtension(filename) {
  // 💡 拡張子自動判定の重い文字列処理も、すべてWorkerスレッド側へ丸投げ！
  fideWorker.postMessage({ type: "DETECT_LANG", filename: filename });
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  const linesText = [];
  lines.forEach(line => {
    linesText.push(line.innerText.replace(/\|/g, "\t"));
  });

  // 💡 【超重要】メインスレッドは一切計算しない！テキストデータだけをWorkerへパ投げて終了！
  fideWorker.postMessage({
    type: "HIGHLIGHT",
    linesText: linesText,
    lang: currentLang
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

if (typeof document !== "undefined") {
  detectLanguageByExtension(""); // 初期化
}
