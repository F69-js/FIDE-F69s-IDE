// FIDE Custom IDE - Web Worker Tacs© Interface Router (v26.0 Master - Fixed)
// 💡 重たい計算をすべて別スレッドのWorkerへ委託し、タイピング遅延を100%永久に根絶！

let currentLang = 'js';

// 💡 【マルチスレッド起動】ハイライト専用のWeb Workerインスタンスを生成！
const fideWorker = new Worker(new URL("./highlighter-worker.js", import.meta.url), { type: "module" });

// 💡 Workerから計算完了のメッセージが届いた時の非同期処理フック
fideWorker.addEventListener("message", (e) => {
  const { type, currentLang: lang, themeCss, highlightedLines } = e.data;

  // 1. 言語・CSS切り替えが返ってきた時
  if (type === "LANG_CHANGED") {
    // 💡 【重要】本当に言語が変わった時だけ処理を行うことで、無限ループと描画崩壊を阻止！
    if (currentLang !== lang || !document.getElementById("fide-dynamic-tacs-theme")) {
      currentLang = lang;
      
      let styleTag = document.getElementById("fide-dynamic-tacs-theme");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "fide-dynamic-tacs-theme";
        document.head.appendChild(styleTag);
      }
      styleTag.innerText = themeCss;
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
    }
  }

  // 2. ハイライトパースがすべて完了して返ってきた時
  if (type === "HIGHLIGHT_COMPLETE") {
    const lines = document.querySelectorAll(".line");
    lines.forEach((line, idx) => {
      if (highlightedLines[idx] !== undefined && line) {
        // 💡 計算済みの極彩色HTMLを安全にフラッシュ反映
        line.innerHTML = highlightedLines[idx];
      }
    });
      // ⭕ 【ここに用がある！】ハイライト直後に、独自カーソルを強制復活させる！
    // ※お使いの独自カーソルのHTML要素（例: id="cursor"など）に合わせてください
    const cursorHTML = '<span id="cursor" class="blink">|</span>';
    
    // 現在の画面全体のHTMLの、正しい cursorIdx（文字の位置）にカーソル要素を再挿入
    let currentHTML = cur.innerHTML;
    
    // 画面全体のHTMLのカーソル位置にガチャンと結合して復元！
       cur.innerHTML = currentHTML.slice(0, insertionIdx) + cursorHTML + currentHTML.slice(insertionIdx);
  }
});

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
