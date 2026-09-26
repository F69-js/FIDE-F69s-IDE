//This code provided with 'MIT License'. For more information, See ../LICENSE
import {_jala, _fjalu} from "./fjalu/index.js";
import {TIDEPreParse} from "./linter/tide.js";
import {Language, LanguageTable} from "./langs/i18n.js";
let cursorIdx = 0;
import {detectLanguageByExtension, applyFIDEHighlight,fideWorker,currentLang} from "./newtacs/highlighter.js";
// 💡 【完璧なる直下ファイル分割】同じフォルダから ai.js と ui.js をダイレクト接続ロード！
import {initBuiltInAI, sendBtnCheck} from "./ai.js";
import {initUIListeners} from "./ui.js";
Language.textlist = LanguageTable;
fideWorker.addEventListener("message", (e) => {
  let { type, currentLang: lang, themeCss, highlightedLines } = e.data;

  if (type === "LANG_CHANGED") {
    // 💡 本当に言語が変わった時だけ処理を行うことで、無限ループと描画崩壊を阻止！
    if (currentLang !== lang || !document.getElementById("fide-dynamic-tacs-theme")) {
      currentLang = lang;
      
      let styleTag = document.getElementById("fide-dynamic-tacs-theme");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "fide-dynamic-tacs-theme";
        document.head.appendChild(styleTag);
      }
      styleTag.innerText = themeCss;

      // ⭕ 【ここに用があった！】
      // Workerから届いた「lang」を元に、画面の隅の<img>要素を直接上書きしてアイコンを大出現させる！
      const icon = document.getElementById("tacs-lang-icon");
      if (icon) {
        const upperLang = lang === 'h' ? 'C++ H' : (lang === 'rs' ? 'RUST' : (lang === 'rb' ? 'RUBY' : lang.toUpperCase()));
        let textColor = '569cd6'; const bgColor = '1e1e1e';
        
        if (['html', 'cpp', 'h', 'rs'].includes(lang)) textColor = '4ec9b0';
        else if (['css', 'php', 'dockerfile'].includes(lang)) textColor = 'c586c0';
        else if (['json', 'ts', 'toml', 'swift'].includes(lang)) textColor = '9cdcfe';
        else if (['md', 'sh', 'kt', 'kts'].includes(lang)) textColor = 'dcdcaa';
        else if (['py', 'sql', 'yaml', 'yml', 'go', 'dart', 'r'].includes(lang)) textColor = 'f2c94c';

        icon.src = "https://placehold.co" + bgColor + "/" + textColor + "?text=" + encodeURIComponent(upperLang);
        icon.alt = upperLang;
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
    }
  }


  // 2. 💡【大復活】ハイライトパースがすべて完了して返ってきた時
  if (type === "HIGHLIGHT_COMPLETE" && highlightedLines) {
    const lines = document.querySelectorAll(".line");
    
    // ⭕ 計算済みの極彩色HTMLを安全にフラッシュ反映！（ここで一旦古いカーソルは消滅）
    lines.forEach((line, idx) => {
      if (highlightedLines[idx] !== undefined && line) {
        line.innerHTML = highlightedLines[idx];
      }
    });

    // ⭕【カーソル2本分裂の暗殺＆1本化ロジック】
    // ハイライトが当たった直後の画面から、ダブって残ってしまった古いカーソルタグや縦棒（|）をすべて綺麗に抹消！
    let currentHTML = cur.innerHTML.replace(/<span id="cursor".*?>.*?<\/span>/g, "").replace(/\|/g, "");
    
    const cursorHTML = '<span id="cursor" class="blink">|</span>';
    let textCount = 0;
    // 💡 変数の宣言漏れを絶対に防ぐために、ここで明示的に初期化
    let finalInsertionIdx = currentHTML.length;

    // 3. HTMLタグを避けて、同じファイル内にある本物の「cursorIdx」の位置を正確に計算
    for (let i = 0; i < currentHTML.length; i++) {
      if (currentHTML[i] === '<') {
        while (i < currentHTML.length && currentHTML[i] !== '>') {
          i++;
        }
        continue;
      }
      
      if (textCount === cursorIdx) {
        finalInsertionIdx = i;
        break;
      }
      textCount++;
    }

    // 4. 正確な位置にカーソルを『1本だけ』再挿入して完全復活！
    cur.innerHTML = currentHTML.slice(0, finalInsertionIdx) + cursorHTML + currentHTML.slice(finalInsertionIdx);
  }
});
let sec = location.search;
function getParams(p) {
	let c = {};
	return p.substring(1).split("&").map(t => {
		let l = t.split("=");
		c[l] = l.slice(1, l.length).join("=");
		return c
	})
}
globalThis.lineID = 0;
globalThis.cur = null;
globalThis.undoStack = [""];
globalThis.redoStack = [];
globalThis.filename = "";
globalThis.filetype = "text";
let raw = "";
let g;
let list = ["#error", "#showraw", "#settings", "#settingscontainer",
	"#middlearea", "#maincontainer", "#filenamei", "#openfile", "#savefile",
	"#maintheme", "#theme_area", "#rawexec", "#input", "#searchi",
	"#searchresults", "#searchg", "#rgxmode", "#flags", "#flagg", "#replt",
	"#replg", "#replacco", "#unloaden", "#Text_RegexMode", "#Text_Flag",
	"#Text_replacer", "#Text_thmelabel1", "#Text_unllabel1", "#Text_unllabel2",
	"#spanc", "#palettecolor", "#setc", "#img1", "#imgcontainer", "#mediamenu",
	"#penmode", "#tpcolor", "#pencolor", "#aimenu", "#aiinput", "#aiexec",
	"#aioutput", "#aigroup", "#available", "#ainotavailable", "#aienable",
	"#menu"
];
list.forEach(t => {
	let d = document?.querySelector(t);
	if (d) globalThis[t.slice(1)] = d
});
pencolor.value = "#FF0000";
let active = false,
	regexmode = false,
	replaccoOpen = false,
	isSearched = false,
	lang;
let paramlang = getParams(sec).find(t => Object.keys(t).includes("lang"))?.lang;
lang = !paramlang ? (navigator.language === "ja" ? "ja" : "en") : (["ja", "en"]
	.includes(paramlang) ? paramlang : "ja");
Language.language = lang;
textregexmode.innerText = Language.for("htmltext.regexmode");
textflag.innerText = Language.for("htmltext.flag");
textreplacer.innerText = Language.for("htmltext.replacer");
ttl1.innerText = Language.for("htmltext.thmelabel1");
tul1.innerText = Language.for("htmltext.unllabel1");
tul2.innerText = Language.for("htmltext.unllabel2");
spanc.innerText = Language.for("htmltext.spanc");
let u = Number(localStorage ?.getItem ?.("fide:check_unload"));
if (Number.isNaN(u)) u = 1;
unl.checked = u !== 1;
replg.hidden = true;
replacco.addEventListener("click", () => {
	replaccoOpen = !replaccoOpen;
	replacco.innerText = replaccoOpen ? "▼" : "▶";
	replg.hidden = !replaccoOpen
});
rgxmode.addEventListener("change", () => {
	regexmode = rgxmode.checked;
	flagg.hidden = !regexmode
});
if (flags) flags.value = "gmu";

function refreshLineUI() {
	if (!cur) return;
	let pureText = cur.innerText.replace(/\|/g, "");
	if (cursorIdx < 0) cursorIdx = 0;
	if (cursorIdx > pureText.length) cursorIdx = pureText.length;
	cur.innerHTML = pureText.slice(0, cursorIdx) +
		'<span class="cursol" id="cursol' + lineID + '"></span>' + pureText.slice(
			cursorIdx);
	detectLanguageByExtension(filenamei ?.value || "");
	applyFIDEHighlight()
}

function Search(raw, searchwords) {
	let q = [];
	let rs = raw.split("\n");
	let flagss = (flags ?.value) ?.length === 0 ? "gmu" : flags.value.split(",")
		.join("");
	let rgx = new RegExp(searchwords, flagss);
	rs.forEach((t, i) => {
		let condition = regexmode ? rgx.test(t) : t.includes(searchwords);
		if (condition) q.push({
			id: i,
			code: rs[i]
		})
	});
	return q
}

function HandleUnload(e) {
	e.preventDefault();
	e.returnValue = Language.for("inscript.saveconfirm")
}
class EnvironmentError extends Error {
	constructor(...args) {
		super(...args);
		this.name = "EnvironmentError"
	}
}
maincontainer.addEventListener("click", () => {
	active = true
});
flags.addEventListener("click", () => {
	active = false
});

function ExecuteCode(c, h) {
	if (u === 1) window.addEventListener('beforeunload', HandleUnload);
	const wrap =
		`self.console={log:(...args)=>self.postMessage({log:args.join(" ")}),error:(...args)=>self.postMessage({err:args.join(" ")}),warn:(...args)=>self.postMessage({log:"[!]"+args.join(" ")})};try{\textC}catch(e){console.error(e.message);}`;
	if (h) {
		error.innerText += Language.for("inscript.executestop");
		return
	}
	const worker = new Worker(URL.createObjectURL(new Blob([wrap], {
		type: 'application/javascript'
	})));
	worker.onmessage = e => {
		if (e.data.log) error.innerText += " > " + e.data.log + "\n";
		if (e.data.err) error.innerText += " [ERR] " + e.data.err + "\n"
	};
	worker.onerror = e => {
		error.innerText += " [Worker][Error] " + e.message + "\n"
	}
}
g = document.querySelector("#line0");
cur = !g ? (() => {
	let m = document.createElement("div");
	m.id = "line0";
	input.appendChild(m);
	return m
})() : g;
async function DoEnter() {
	undoStack.push(raw);
	redoStack = [];
	let old = cur;
	
	// 1. 現在の行から、カーソルより「後ろ」の文字を正確に切り取る
	let oldText = old ? old.innerText.replace(/\|/g, "") : "";
	let remainingText = oldText.slice(cursorIdx);
	let keptText = oldText.slice(0, cursorIdx);
	
	if (old) {
		old.innerText = keptText;
		old.classList.remove("active-line", "focused", "active");
	}
	
	let cur2 = document.querySelector("#cursol" + old.id.slice(4));
	if (cur2) cur2.hidden = true;
	
	// 💡 【大修正】雑な<div>で包むのをやめ、最初から本物の「.group」要素としてノードを生成する！
	let elemGroup = document.createElement("div");
	elemGroup.classList.add("group"); // 最初からクラスを付与
	elemGroup.innerHTML = `<div class="lineno"></div><div class="line"></div><div class="cursol"></div>`;
	
	let newElem = elemGroup.querySelector(".line");
	
	// 新しく作られた2行目に、切り取っておいた後半の文字を確実に流し込む
	if (newElem) newElem.innerText = remainingText;
	
	// 2. ドキュメント（DOM）へ新要素を安全に挿入（構造が崩れない）
	if (old && old.closest(".group")) {
		old.closest(".group").insertAdjacentElement("afterend", elemGroup);
	} else {
		maincontainer.appendChild(elemGroup);
	}
	
	// 3. すべての行のIDと行番号を再計算（null安全弁付き）
	maincontainer.querySelectorAll(".group").forEach((group, index) => {
		let line = group.querySelector(".line");
		let lineno = group.querySelector(".lineno");
		let cursol = group.querySelector(".cursol");
		
		// 💡 万が一要素がnullだった場合も、絶対にシステムを巻き添えでクラッシュさせない安全弁！
		if (line) line.id = "line" + index;
		if (lineno) {
			lineno.id = "lineno" + index;
			lineno.innerText = String(index + 1);
		}
		if (cursol) cursol.id = "cursol" + index;
	});
	
	lineID = Array.from(maincontainer.querySelectorAll(".group")).indexOf(elemGroup);
	
	// 4. 入力ターゲットを、2行目の新要素へ安全に移行
	if (newElem) {
		cur = newElem;
		cur.classList.add("active-line", "focused", "active");
		cur.focus();
	}

	// 5. 内部データの改行挿入とインデックスリセット
	raw = raw.slice(0, cursorIdx) + "\n" + raw.slice(cursorIdx);
	cursorIdx = 0;
	
	refreshLineUI();
}



function SwitchTheme(v) {
	switch (v) {
		case "d":
			theme_area.innerText =
				`\n        :root{--cursol-color:#FFFFFF;--line-no-color:#a9a4a2;--line-no-border:#4e4240;--main-color:#8d8584;--ineditor-text-color:#000000;--background-unit-color:#000000;--out-unit-color:#FFFFFF;}\n          `;
			break;
		case "l":
			theme_area.innerText =
				`\n        :root{--cursol-color:#000000;--line-no-color:#565b5d;--line-no-border:#b1bdbf;--main-color:#727a7b;--ineditor-text-color:#FFFFFF;--background-unit-color:#FFFFFF;--out-unit-color:#000000;}\n          `;
			break
	}
}
// 💡 新設した UI イベントリスナーを完璧にバインド初期化！
initUIListeners({
	getRaw: () => raw,
	setRaw: (v) => {
		raw = v
	},
	getCursorIdx: () => cursorIdx,
	setCursorIdx: (v) => {
		cursorIdx = v
	},
	getLineID: () => lineID,
	setLineID: (v) => {
		lineID = v
	},
	getCur: () => cur,
	setCur: (v) => {
		cur = v
	},
	undoStack,
	redoStack,
	DoEnter,
	refreshLineUI,
	SwitchTheme,
	ExecuteCode,
	TIDEPreParse,
	Language,
	HandleUnload
});
initBuiltInAI();
if (aioutput) aioutput.innerText =
	"こんにちは！Built-in AIです。プログラミングの質問やコードの修正指示を入力してください。";
if (aiexec) {
	aiexec.addEventListener("click", () => sendBtnCheck(() => raw, (v) => {
		raw = v
	}, DoEnter, undoStack))
}
window.addEventListener('paste', async e => {
	e.preventDefault();
	const text = (e.clipboardData || window.clipboardData).getData('text');
	if (!text) return;
	
	// 💡 タブ文字（\t）をインデントガイド（|）に事前置換
	const formattedText = text.replace(/\t/g, "|");
	const lines = formattedText.split(/\r?\n/);
	
	for (let i = 0; i < lines.length; i++) {
		let mi = cur.innerText.replace(/\|/g, "");
		const chunk = lines[i];

		// 1. 画面の表示用テキストの「カーソル位置」に正確に挿入
		cur.innerText = mi.slice(0, cursorIdx) + chunk + mi.slice(cursorIdx);
		
		// 2. 内部データ（raw）も、元のタブ文字（\t）に戻した状態で「カーソル位置」に正確に挿入！
		const rawChunk = chunk.replace(/\|/g, "\t");
		raw = raw.slice(0, cursorIdx) + rawChunk + raw.slice(cursorIdx);
		
		// 3. 挿入した文字数の分だけカーソルを進める
		cursorIdx += chunk.length;

		// 4. 改行がある場合は、行をまたぐ処理を実行
		if (i !== lines.length - 1) {
			await DoEnter();
		}
	}
	applyFIDEHighlight();
});

function add(key) {
    raw = raw.slice(0, cursorIdx) + key + raw.slice(cursorIdx); 
}
window.addEventListener("keydown", async e => {
	if (e.isComposing || e.key === "Process" || !active) return;
	if (["ArrowLeft", "ArrowRight", "Backspace", "Enter"].includes(e.key)) e.preventDefault();
	let mi = cur.innerText.replace(/\|/g, "");
	if (e.ctrlKey) {
		switch (e.key) {
			case "c":
				if (e.altKey) {
					e.preventDefault();
					if (!raw) break;
					undoStack.push(raw);
					redoStack = [];
					raw = raw.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*\$/gm, '\$1');
					const lines = raw.split(/\r?\n/);
					maincontainer.innerHTML =
						`<div id="lineGroup0" class="group"><div id="lineno0" class="lineno">1</div><div id="line0" class="line">\${lines || ""}</div><div id="cursol0" class="cursol"></div></div>`;
					lineID = 0;
					cur = document.querySelector("#line0");
					for (let i = 1; i < lines.length; i++) {
						await DoEnter();
						cur.innerText = lines[i]
					}
					applyFIDEHighlight()
				}
				break;
			case "j":
				e.preventDefault();
				var r = await _jala(mi);
				cur.innerText = r;
				raw = r;
				break;
			case "s":
				e.preventDefault();
				savefile.click();
				break;
			case "l":
				e.preventDefault();
				undoStack.push(raw);
				redoStack = [];
				cur.innerText = "";
				raw = "";
				cursorIdx = 0;
				refreshLineUI();
				break;
			case "z":
				e.preventDefault();
				if (undoStack.length > 1) {
					redoStack.push(raw);
					let previousRaw = undoStack.pop();
					raw = previousRaw;
					cur.innerText = previousRaw.split("\n")[lineID] || "";
					cursorIdx = cur.innerText.length;
					refreshLineUI()
				}
				break;
			case "y":
				e.preventDefault();
				if (redoStack.length > 0) {
					undoStack.push(raw);
					let nextRaw = redoStack.pop();
					raw = nextRaw;
					cur.innerText = nextRaw.split("\n")[lineID] || "";
					cursorIdx = cur.innerText.length;
					refreshLineUI()
				}
				break;
			case "f":
				e.preventDefault();
				const replacco = document.getElementById("replacco");
				const replg = document.getElementById("replg");
				const searchInput = document.querySelector("#searchi");
				if (replacco && replg && searchInput) {
					replaccoOpen = true;
					replacco.innerText = "▼";
					replg.hidden = false;
					setTimeout(() => {
						searchInput.focus()
					}, 10)
				}
				break;
		}
		return;
	}
    switch (e.key) {
		case "Shift":
		case "Control":
		case "Meta":
		case "Alt":
		case "CapsLock":
		case "ZenkakuHankaku":
			break;
		case "ArrowLeft":
			if (cursorIdx > 0) {
				cursorIdx--;
				refreshLineUI()
			}
			break;
		case "ArrowRight":
			if (cursorIdx < mi.length) {
				cursorIdx++;
				refreshLineUI()
			}
			break;
		case "Backspace":
			if (cursorIdx > 0) {
				cur.innerText = mi.slice(0, cursorIdx - 1) + mi.slice(cursorIdx);
				raw = raw.slice(0, -1);
				cursorIdx--;
				refreshLineUI()
			} else if (lineID > 0) {
				let oldelem = cur;
				lineID--;
				cur = document.querySelector("#line" + lineID);
				oldelem.parentNode.remove();
				document.querySelectorAll(".lineno").forEach((t, i) => t.innerText =
					String(i + 1));
				cursorIdx = cur.innerText.replace(/\|/g, "").length;
				refreshLineUI()
			}
			break;
		case "ArrowUp":
			if (lineID > 0) {
				cur.innerText = cur.innerText.replace(/|/g, "");
				lineID--;
				cur = document.querySelector("#line" + lineID);
				let len = cur.innerText.replace(/|/g, "").length;
				if (cursorIdx > len) cursorIdx = len;
				refreshLineUI()
			}
			break;
		case "ArrowDown":
			let next = document.querySelector("#line" + String(lineID + 1));
			if (next) {
				cur.innerText = cur.innerText.replace(/|/g, "");
				lineID++;
				cur = next;
				let len = cur.innerText.replace(/|/g, "").length;
				if (cursorIdx > len) cursorIdx = len;
				refreshLineUI()
			}
			break;
        case "Tab":
            e.preventDefault();
            cur.innerText = mi.slice(0, cursorIdx) + "|" + mi.slice(cursorIdx);
            add("\t"); // 💡 末尾追加（+=）ではなく、カーソル位置に正確にタブが入る！
            cursorIdx++;
            refreshLineUI();
        break;
		case "Enter":
			DoEnter();
		break;
        default:
            if (e.key.length === 1 && !e.ctrlKey) {
                add(e.key); // 💡 これだけで内部データ（raw）の更新が完了！

                // あとは見た目の更新だけ
                let mi = cur.innerText.replace(/\|/g, "");
                cur.innerText = mi.slice(0, cursorIdx) + e.key + mi.slice(cursorIdx);
                cursorIdx++; 
                refreshLineUI(); 
            }
        break;
    }
})
window.addEventListener("error", e => {
	error.innerText += e.message + "\n"
});
showraw.addEventListener("click", () => {
	alert(raw)
});
localStorage ?.getItem ?.("fide:theme") && SwitchTheme(localStorage.getItem(
	"fide:theme"));
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('./sw.js').then(() => console.log(
			'[PWA]PWA registration successfully')).catch((err) => console.error(
			'[PWA]PWA registration failed:', err))
	})
}
if (typeof document !== "undefined") {
	const style = document.createElement("style");
	style.innerText =
		"@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }";
	document.head.appendChild(style)
};
