//This code provided with 'MIT License'. For more information, See ../LICENSE
import { _jala, _fjalu } from "./fjalu/index.js";
import { TIDEPreParse } from "./linter/tide.js";
import { Language, LanguageTable } from "./langs/i18n.js";
import { detectLanguageByExtension, applyFIDEHighlight } from "./newtacs/highlighter.js";
// 💡 【知能完全大復活】 newtacsを完全撤去！同じフォルダ直下（すぐ隣）から綺麗に一本釣りロード！
import { initBuiltInAI, sendBtnCheck, sysprompt } from "./ai-core.js";
import { initUIListeners } from "./ui.js";

Language.textlist = LanguageTable;
let sec = location.search;

function getParams(p) {
    let c = {};
    return p.substring(1).split("&").map(t => {
        let l = t.split("=");
        c[l] = l.slice(1, l.length).join("=");
        return c;
    });
}

globalThis.lineID = 0;
globalThis.cur = null;
globalThis.undoStack = [""];
globalThis.redoStack = [];
globalThis.filename = "";
globalThis.filetype = "text";

let raw = "";
let g;
let cursorIdx = 0;

let list = ["#error","#showraw","#settings","#settingscontainer","#middlearea","#maincontainer","#filenamei","#openfile","#savefile","#maintheme","#theme_area","#rawexec","#input","#searchi","#searchresults","#searchg","#rgxmode","#flags","#flagg","#replt","#replg","#replacco","#unloaden","#Text_RegexMode","#Text_Flag","#Text_replacer","#Text_thmelabel1","#Text_unllabel1","#Text_unllabel2","#spanc","#palettecolor","#setc","#img1","#imgcontainer","#mediamenu","#penmode","#tpcolor","#pencolor","#aimenu","#aiinput","#aiexec","#aioutput","#aigroup","#available","#ainotavailable","#aienable","#menu"];

list.forEach(t => {
    let d = document?.querySelector(t);
    if (!d) return;
    globalThis[t.slice(1)] = d;
});

pencolor.value = "#FF0000";
let active = false, regexmode = false, replaccoOpen = false, isSearched = false, lang;

let paramlang = getParams(sec).find(t => Object.keys(t).includes("lang"))?.lang;
lang = !paramlang ? (navigator.language === "ja" ? "ja" : "en") : (["ja", "en"].includes(paramlang) ? paramlang : "ja");

Language.language = lang;
textregexmode.innerText = Language.for("htmltext.regexmode");
textflag.innerText = Language.for("htmltext.flag");
textreplacer.innerText = Language.for("htmltext.replacer");
ttl1.innerText = Language.for("htmltext.thmelabel1");
tul1.innerText = Language.for("htmltext.unllabel1");
tul2.innerText = Language.for("htmltext.unllabel2");
spanc.innerText = Language.for("htmltext.spanc");

let u = Number(localStorage?.getItem?.("fide:check_unload"));
if (Number.isNaN(u)) u = 1;
unl.checked = u !== 1;
replg.hidden = true;

replacco.addEventListener("click", () => {
    replaccoOpen = !replaccoOpen;
    replacco.innerText = replaccoOpen ? "▼" : "▶";
    replg.hidden = !replaccoOpen;
});

rgxmode.addEventListener("change", () => {
    regexmode = rgxmode.checked;
    flagg.hidden = !regexmode;
});
if (flags) flags.value = "gmu";

function refreshLineUI() {
    if (!cur) return;
    let pureText = cur.innerText.replace(/\|/g, "");
    if (cursorIdx < 0) cursorIdx = 0;
    if (cursorIdx > pureText.length) cursorIdx = pureText.length;

    cur.innerHTML = pureText.slice(0, cursorIdx) + '<span class="cursol" id="cursol' + lineID + '"></span>' + pureText.slice(cursorIdx);
    detectLanguageByExtension(filenamei?.value || "");
    applyFIDEHighlight();
}

function Search(raw, searchwords) {
    let q = [];
    let rs = raw.split("\n");
    let flagss = (flags?.value)?.length === 0 ? "gmu" : flags.value.split(",").join("");
    let rgx = new RegExp(searchwords, flagss);
    rs.forEach((t, i) => {
        let condition = regexmode ? rgx.test(t) : t.includes(searchwords);
        if (condition) q.push({ id: i, code: rs[i] });
    });
    return q;
}

function HandleUnload(e) {
    e.preventDefault();
    e.returnValue = Language.for("inscript.saveconfirm");
}

class EnvironmentError extends Error {
    constructor(...args) { super(...args); this.name = "EnvironmentError"; }
}

maincontainer.addEventListener("click", () => { active = true; });
flags.addEventListener("click", () => { active = false; });

g = document.querySelector("#line0");
cur = !g ? (() => { let m = document.createElement("div"); m.id = "line0"; input.appendChild(m); return m; })() : g;

async function DoEnter() {
    undoStack.push(raw); redoStack = [];
    let old = cur;
    if (old) old.innerText = old.innerText.replace(/\|/g, "");
    let cur2 = document.querySelector("#cursol" + old.id.slice(4));
    if (cur2) cur2.hidden = true;

    let elemGroup = document.createElement("div");
    elemGroup.innerHTML = `<div class="lineno"></div><div class="line"></div><div class="cursol"></div>`;
    elemGroup.classList.add("group");

    let newElem = elemGroup.querySelector(".line");
    if (old.closest(".group")) old.closest(".group").insertAdjacentElement("afterend", elemGroup);
    else maincontainer.appendChild(elemGroup);

    maincontainer.querySelectorAll(".group").forEach((group, index) => {
        group.querySelector(".line").id = "line" + index;
        let lineno = group.querySelector(".lineno");
        lineno.id = "lineno" + index; lineno.innerText = String(index + 1);
        group.querySelector(".cursol").id = "cursol" + index;
    });

    lineID = Array.from(maincontainer.querySelectorAll(".group")).indexOf(elemGroup);
    cur = newElem; cursorIdx = 0; raw += "\n";
    refreshLineUI();
}

function SwitchTheme(v) {
    switch (v) {
        case "d": theme_area.innerText = `\n        :root{--cursol-color:#FFFFFF;--line-no-color:#a9a4a2;--line-no-border:#4e4240;--main-color:#8d8584;--ineditor-text-color:#000000;--background-unit-color:#000000;--out-unit-color:#FFFFFF;}\n          `; break;
        case "l": theme_area.innerText = `\n        :root{--cursol-color:#000000;--line-no-color:#565b5d;--line-no-border:#b1bdbf;--main-color:#727a7b;--ineditor-text-color:#FFFFFF;--background-unit-color:#FFFFFF;--out-unit-color:#000000;}\n          `; break;
    }
}

initUIListeners({
    getRaw: () => raw, setRaw: (v) => { raw = v; },
    getCursorIdx: () => cursorIdx, setCursorIdx: (v) => { cursorIdx = v; },
    getLineID: () => lineID, setLineID: (v) => { lineID = v; },
    getCur: () => cur, setCur: (v) => { cur = v; },
    undoStack, redoStack, DoEnter, refreshLineUI, SwitchTheme, ExecuteCode, TIDEPreParse, Language, HandleUnload
});

initBuiltInAI();
if (aioutput) aioutput.innerText = "こんにちは！Built-in AIです。プログラミングの質問やコードの修正指示を入力してください。";
if (aiexec) {
    aiexec.addEventListener("click", () => sendBtnCheck(() => raw, (v) => { raw = v; }, DoEnter, undoStack));
}

window.addEventListener("keydown", async e => {
    if (e.isComposing || e.key === "Process" || !active) return;
    if (["ArrowLeft", "ArrowRight", "Backspace", "Enter"].includes(e.key)) e.preventDefault();
    let mi = cur.innerText.replace(/\|/g, "");

    switch (e.key) {
        case "ArrowLeft": if (cursorIdx > 0) { cursorIdx--; refreshLineUI(); } break;
        case "ArrowRight": if (cursorIdx < mi.length) { cursorIdx++; refreshLineUI(); } break;
        case "Backspace":
            if (cursorIdx > 0) {
                cur.innerText = mi.slice(0, cursorIdx - 1) + mi.slice(cursorIdx);
                raw = raw.slice(0, -1); cursorIdx--; refreshLineUI();
            } else if (lineID > 0) {
                let oldelem = cur; lineID--; cur = document.querySelector("#line" + lineID);
                oldelem.parentNode.remove();
                document.querySelectorAll(".lineno").forEach((t, i) => t.innerText = String(i + 1));
                cursorIdx = cur.innerText.replace(/\|/g, "").length; refreshLineUI();
            }
            break;
        case "ArrowUp":
            if (lineID > 0) {
                cur.innerText = cur.innerText.replace(/\|/g, ""); lineID--;
                cur = document.querySelector("#line" + lineID);
                let len = cur.innerText.replace(/\|/g, "").length; if (cursorIdx > len) cursorIdx = len;
                refreshLineUI();
            }
            break;
        case "ArrowDown":
            let next = document.querySelector("#line" + String(lineID + 1));
            if (next) {
                cur.innerText = cur.innerText.replace(/\|/g, ""); lineID++; cur = next;
                let len = cur.innerText.replace(/\|/g, "").length; if (cursorIdx > len) cursorIdx = len;
                refreshLineUI();
            }
            break;
        case "Tab": e.preventDefault(); cur.innerText = mi.slice(0, cursorIdx) + "|" + mi.slice(cursorIdx); raw += "\t"; cursorIdx++; refreshLineUI(); break;
        case "Enter": DoEnter(); break;
        default:
            if (e.key.length === 1 && !e.ctrlKey) {
                cur.innerText = mi.slice(0, cursorIdx) + e.key + mi.slice(cursorIdx);
                raw += e.key; cursorIdx++; refreshLineUI();
            }
            break;
    }
});

window.addEventListener("error", e => { error.innerText += e.message + "\n"; });
showraw.addEventListener("click", () => { alert(raw); });
localStorage?.getItem?.("fide:theme") && SwitchTheme(localStorage.getItem("fide:theme"));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('[PWA]PWA registration successfully'))
            .then(() => console.log('[PWA] FIDE 4大分散直下アーキテクチャ、完全大覚醒完了！'))
            .catch((err) => console.error('[PWA]PWA registration failed:', err));
    });
}
