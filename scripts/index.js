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
	if (type === "HIGHLIGHT_COMPLETE") {
    const cursorHTML = '<span id="cursor" class="blink">|</span>';
    let currentHTML = cur.innerHTML;
    
    let textCount = 0;
    // 💡 変数の宣言漏れを絶対に防ぐために、ここで明示的に初期化
    let finalInsertionIdx = currentHTML.length;

    // HTMLタグを避けて、純粋な文字数（cursorIdx）の位置を計算
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

    // 正確な位置にカーソルを再挿入して完全復活！
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
	if (old) old.innerText = old.innerText.replace(/\|/g, "");
	let cur2 = document.querySelector("#cursol" + old.id.slice(4));
	if (cur2) cur2.hidden = true;
	let elemGroup = document.createElement("div");
	elemGroup.innerHTML =
		`<div class="lineno"></div><div class="line"></div><div class="cursol"></div>`;
	elemGroup.classList.add("group");
	let newElem = elemGroup.querySelector(".line");
	if (old.closest(".group")) old.closest(".group").insertAdjacentElement(
		"afterend", elemGroup);
	else maincontainer.appendChild(elemGroup);
	maincontainer.querySelectorAll(".group").forEach((group, index) => {
		group.querySelector(".line").id = "line" + index;
		let lineno = group.querySelector(".lineno");
		lineno.id = "lineno" + index;
		lineno.innerText = String(index + 1);
		group.querySelector(".cursol").id = "cursol" + index
	});
	lineID = Array.from(maincontainer.querySelectorAll(".group")).indexOf(
		elemGroup);
	cur = newElem;
	cursorIdx = 0;
	raw += "\n";
	refreshLineUI()
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
