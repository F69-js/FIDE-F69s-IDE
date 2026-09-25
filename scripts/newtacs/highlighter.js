// FIDE Custom IDE - Web Worker Tacs© Interface Router (v26.0 Master - Fixed)
// 💡 重たい計算をすべて別スレッドのWorkerへ委託し、タイピング遅延を100%永久に根絶！

let currentLang = 'js';

// 💡 【マルチスレッド起動】ハイライト専用のWeb Workerインスタンスを生成！
const fideWorker = new Worker(new URL("./highlighter-worker.js", import.meta.url), { type: "module" });



export function detectLanguageByExtension(filename) {
  fideWorker.postMessage({ type: "DETECT_LANG", filename: filename });
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  const linesText = [];
  lines.forEach(line => {
    if (line) {
      linesText.push(line.innerText.replace(/\|/g, "\t"));
    }
  });

  fideWorker.postMessage({
    type: "HIGHLIGHT",
    linesText: linesText,
    lang: currentLang
  });
}

function updateLangIndicator(lang) {
  const icon = document.getElementById("tacs-lang-icon"); 
  if (!icon) return; // 💡 要素が見つからない場合は安全にスキップ

  const upperLang = lang === 'h' ? 'C++ H' : (lang === 'rs' ? 'RUST' : (lang === 'rb' ? 'RUBY' : lang.toUpperCase()));
  
  let textColor = '569cd6'; const bgColor = '1e1e1e';
  if (['html', 'cpp', 'h', 'rs'].includes(lang)) textColor = '4ec9b0';
  else if (['css', 'php', 'dockerfile'].includes(lang)) textColor = 'c586c0';
  else if (['json', 'ts', 'toml', 'swift'].includes(lang)) textColor = '9cdcfe';
  else if (['md', 'sh', 'kt', 'kts'].includes(lang)) textColor = 'dcdcaa';
  else if (['py', 'sql', 'yaml', 'yml', 'go', 'dart', 'r'].includes(lang)) textColor = 'f2c94c';

  const targetSrc = "https://placehold.co/128/" + bgColor + "/" + textColor + "?text=" + encodeURIComponent(upperLang);
  
  // 💡 現在のsrcと異なる場合のみ書き換えて、ブラウザのリロード地獄をストップ
  if (icon.src !== targetSrc) {
    icon.src = targetSrc;
    icon.alt = upperLang;
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    // HTMLの構築が終わったら初期化を走らせる
    document.addEventListener("DOMContentLoaded", () => {
      detectLanguageByExtension("");
    });
  } else {
    detectLanguageByExtension("");
  }
}

export{fideWorker,currentLang};
