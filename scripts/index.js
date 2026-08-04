//This code provided with 'MIT License'. For more information, See ../LICENSE
import { _jala, _fjalu } from "./fjalu/index.js"
import {TIDEPreParse} from "./linter/tide.js"
import {Language,LanguageTable} from "./langs/i18n.js"
Language.textlist=LanguageTable;
let sec = location.search
function getParams(p) {
    let c = {};
    return p.substring(1).split("&").map(t => {
        let l = t.split("=")
        c[l[0]] = l.slice(1, l.length).join("=")
        return c;
    })
}
let lineID = 0;
let cur = null;
let raw = "";
let g;
let list = [
    "#error",
    "#showraw",
    "#settings",
    "#settingscontainer"
    ,"#middlearea",
    "#maincontainer",
    "#filenamei",
    "#openfile",
    "#savefile",
    "#maintheme",
    "#theme_area",
    "#rawexec",
    "#input",
    "#searchi",
    "#searchresults",
    "#searchg",
    "#rgxmode",
    "#flags",
    "#flagg",
    "#replt",
    "#replg",
    "#replacco",
    "#unloaden",
    "#Text_RegexMode",
    "#Text_Flag",
    "#Text_replacer",
    "#Text_thmelabel1",
    "#Text_unllabel1",
    "#Text_unllabel2",
    "#spanc",
    "#palettecolor",
    "#setc",
    "#img1",
    "#imgcontainer",
    "#mediamenu",
    "#penmode",
    "#tpcolor",
    "#pencolor",
    /* ▼ AI関連の追加DOM登録 ▼ */
    "#aimenu",
    "#aiinput",
    "#aiexec",
    "#aioutput",
    "#aigroup",
    "#available",
    "#ainotavailable",
    "#aienable",
    "#menu"
]
let undoStack = [""];
let redoStack = [];
list.forEach(t=>{
   let d=document?.querySelector(t)
    if(!d)return;
    let n=t.slice(1)
    globalThis[n]=d;
})
let ctx = img1.getContext("2d")
let oldx = 0,oldy = 0;
function Coloredline(fx=0,fy=0,tx=10,ty=10,c="#000000"){
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = c;
    ctx.stroke();
}
let drawing = false;
pencolor.value="#FF0000"
let filetype="text"
let codehaserror = false;
let active = false;
let regexmode = false;
let replaccoOpen = false;
let isSearched = false;
let CurrentOpeningFile = null;
let lang;
let paramlang = getParams(sec).find(t => Object.keys(t).includes("lang"))?.lang
if(!paramlang){
  lang=navigator.language==="ja"?"ja":"en";
}else{
  if(["ja","en"].includes(paramlang)){
    lang=paramlang;
  }else{
    lang=navigator.language==="ja"?"ja":"en";
  }
}
Language.language=lang;
textregexmode.innerText=Language.for("htmltext.regexmode")
textflag.innerText=Language.for("htmltext.flag")
textreplacer.innerText=Language.for("htmltext.replacer")
ttl1.innerText=Language.for("htmltext.thmelabel1")
tul1.innerText=Language.for("htmltext.unllabel1")
tul2.innerText=Language.for("htmltext.unllabel2")
spanc.innerText=Language.for("htmltext.spanc")
let u = Number(localStorage?.getItem?.("fide:check_unload"))
if(Number.isNaN(u)){
  u = 1;
}
unl.checked=u!==1;
replg.hidden=true;
replacco.addEventListener("click",()=>{
  replaccoOpen=!replaccoOpen 
  replacco.innerText=replaccoOpen?"▼":"▶";
  replg.hidden=!replaccoOpen;
})
rgxmode.addEventListener("change",()=>{
  regexmode=rgxmode.checked
  if(regexmode){
    flagg.hidden=false;
  }else{
    flagg.hidden=true;
  }
})
if(flags)flags.value="gmu"
function Search(raw,searchwords){
  let q=[]
  let rs=raw.split("\n")
  let flagss = (flags?.value)?.length===0?"gmu":flags.value.split(",").join("")
  let rgx = new RegExp(searchwords,flagss)
  rs.forEach((t,i)=>{
    let condition;
    if(regexmode){
      try{
        condition=rgx.test(t)
      }catch(e){
        searchresults.innerText+=Language.for("inscript.invalidregex")+e.message
        condition=false;
      }
    }else{
        condition=t.includes(searchwords)
    }
    if(condition){
      q.push({
        id:i,
        code:rs[i]
      })
    }
  })
  return q;
}
function HandleUnload(e){
    e.preventDefault();
    e.returnValue = Language.for("inscript.saveconfirm");
}
class EnvironmentError extends Error {
    constructor(...args) {
        super(...args)
        this.name = "EnvironmentError"
    }
}
maincontainer.addEventListener("click",()=>{
    active=true;
})
filenamei.addEventListener("click",()=>{
    active=false;
})
flags.addEventListener("click",()=>{
    active=false;
})
function ExecuteCode(c,h) {
    if(u===1){
      window.addEventListener('beforeunload',HandleUnload);
    }
    const wrap = `
        self.console = {
            log: (...args) => self.postMessage({log: args.join(" ")}),
            error: (...args) => self.postMessage({err: args.join(" ")}),
            warn: (...args) => self.postMessage({log: "[!]" + args.join(" ")})
        };  
        try {
            ${c} 
        } catch (e) {
            console.error(e.message);
        }
    `;
    if(h){
        error.innerText += Language.for("inscript.executestop")
        return;
    }
    const blob = new Blob([wrap], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = (e) => {
        if (e.data.log) {
            error.innerText += " > " + e.data.log + "\n";
        }
        if (e.data.err) {
            error.innerText += " [ERR] " + e.data.err + "\n";
        }
    };
    worker.onerror = (e) => {
        error.innerText += " [Worker][Error] " + e.message + "\n";
    };
}
if (!maincontainer) {
    if (!document?.body) {
        throw new EnvironmentError("this script only Use in HTML File")
    }
}
g = document.querySelector("#line0")
if (!g) {
    let m = document.createElement("div")
    m.id = "line0"
    input.appendChild(m)
    cur = m;
} else {
    cur = g;
}
async function DoEnter() {
    undoStack.push(raw);
    redoStack = [];
    let old = cur;
    let elemid = old.id.slice(4);
    
    let cur2 = document.querySelector("#cursol" + elemid);
    if (cur2) cur2.hidden = true;

    let newElem = document.createElement("div");
    let elemGroup = document.createElement("div");
    let elemNo = document.createElement("div");
    let curElem = document.createElement("div");

    newElem.classList.add("line");
    curElem.classList.add("cursol");
    elemNo.classList.add("lineno");
    elemGroup.classList.add("group");

    elemGroup.appendChild(elemNo);
    elemGroup.appendChild(newElem);
    elemGroup.appendChild(curElem);

    let currentGroup = old.closest(".group");
    if (currentGroup) {
        currentGroup.insertAdjacentElement("afterend", elemGroup);
    } else {
        maincontainer.appendChild(elemGroup);
    }

    let allGroups = maincontainer.querySelectorAll(".group");
    allGroups.forEach((group, index) => {
        let line = group.querySelector(".line");
        let lineno = group.querySelector(".lineno");
        let cursol = group.querySelector(".cursol");

        line.id = "line" + index;
        lineno.id = "lineno" + index;
        lineno.innerText = String(index + 1);
        cursol.id = "cursol" + index;
    });

    let finalGroups = Array.from(maincontainer.querySelectorAll(".group"));
    let newIndex = finalGroups.indexOf(elemGroup);
    lineID = newIndex;
    cur = newElem;
    
    curElem.hidden = false;
    raw += "\n";
}

// ==========================================
// ▼ Built-in AI (Prompt API) 連携ロジック ▼
// ==========================================
async function initBuiltInAI() {
    if (!window.ai || !window.ai.languageModel) {
        if (available) available.hidden = true;
        if (ainotavailable) ainotavailable.hidden = false;
        return;
    }
    try {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available === "no") {
            if (available) available.hidden = true;
            if (ainotavailable) ainotavailable.hidden = false;
        }
    } catch (e) {
        if (available) available.hidden = true;
        if (ainotavailable) ainotavailable.hidden = false;
    }
}
initBuiltInAI();

// エディタへ一括でコードを反映させる関数
async function applyCodeToEditor(codeText) {
    undoStack.push(raw);
    redoStack = [];
    raw = "";
    
    const lines = codeText.split(/\r?\n/);
    maincontainer.innerHTML = `
        <div id="lineGroup0" class="group">
           <div id="lineno0" class="lineno">1</div>
           <div id="line0" class="line">${lines[0] || ""}</div>
           <div id="cursol0" class="cursol"></div>
        </div>
    `;
    lineID = 0;
    cur = document.querySelector("#line0");
    raw = lines[0] || "";

    for (let i = 1; i < lines.length; i++) {
        await DoEnter();
        cur.innerText = lines[i];
        raw += lines[i];
    }
}

if (aiexec) {
    aiexec.addEventListener("click", async () => {
        if (aienable && !aienable.checked) {
            if (aioutput) aioutput.innerText = "AI機能は設定で無効化されています。";
            return;
        }
        if (!window.ai || !window.ai.languageModel) {
            alert("お使いのブラウザはBuilt-in AIに対応していません。");
            return;
        }

        const promptText = aiinput ? aiinput.value.trim() : "";
        if (!promptText) return;

        if (aioutput) aioutput.innerText = "AIが思考中...";

        try {
            const session = await window.ai.languageModel.create({
                systemPrompt: "あなたは優秀なプログラミングアシスタントです。ユーザーの指示と現在のコード(raw)を元に修正案を考え、解説文と、修正後のコードを [!code_editor ファイル名] のコードブロック形式で出力してください。"
            });

            const currentFileName = filenamei ? (filenamei.value || "F69sIDE.js") : "F69sIDE.js";
            
            // プロンプトにユーザーの指示とrawを必ずセットで同梱
            const fullPrompt = `
【ユーザーからの指示】
${promptText}

【現在のコード (raw)】
[!code_editor ${currentFileName}]
${raw}
            `.trim();

            const response = await session.prompt(fullPrompt);
            session.destroy();

            // [!code_editor filename] のコードブロックを分離する正規表現
            const codeBlockRegex = /\[!code_editor\s+([^\]]+)\]([\s\S]*?)(?:```|$)/;
            const match = response.match(codeBlockRegex);

            let explanation = response;
            if (match) {
                const extractedCode = match[2].trim();
                await applyCodeToEditor(extractedCode);
                explanation = response.replace(codeBlockRegex, "").trim();
            }

            if (aioutput) {
                aioutput.innerText = explanation;
            }

        } catch (err) {
            console.error(err);
            if (aioutput) aioutput.innerText = "AI実行エラー: " + err.message;
        }
    });
}
// ==========================================

let SearchOpen = true;
searchi.hidden=SearchOpen
searchresults.hidden=SearchOpen
searchg.hidden=SearchOpen
window.addEventListener('paste', async (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!text) return;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const r = lines[i];
        cur.innerText += r.replace(/\t/g, "|");
        raw += r;
        if (i !== lines.length - 1) {
            await DoEnter();
        }
    }
});
window.addEventListener("keydown",async e => {
    if (e.isComposing || e.key === "Process") return;
    if(e.ctrlKey&&e.key==="f"){
      e.preventDefault()
      if(!SearchOpen){
        active = true
      }
      SearchOpen=!SearchOpen
      searchi.hidden=SearchOpen
      searchresults.hidden=SearchOpen
      searchg.hidden=SearchOpen
    }
    if(!active)return;
    if(u===1){
      window.addEventListener('beforeunload',HandleUnload);
    }
    let mi = cur.innerText
    if (e.ctrlKey) {
        switch (e.key) {
            case "c":
                if (e.altKey) {
                    e.preventDefault();
                    if (!raw) break;

                    undoStack.push(raw);
                    redoStack = [];
                    raw = raw.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

                    const lines = raw.split(/\r?\n/);
                    
                    maincontainer.innerHTML = `
                        <div id="lineGroup0" class="group">
                             <div id="lineno0" class="lineno">1</div>
                             <div id="line0" class="line">${lines[0] || ""}</div>
                             <div id="cursol0" class="cursol"></div>
                        </div>
                    `;
                    lineID = 0;
                    cur = document.querySelector("#line0");

                    for (let i = 1; i < lines.length; i++) {
                        await DoEnter();
                        cur.innerText = lines[i];
                    }
                }
                break;
            case "j":
                e.preventDefault()
                var r= await _jala(mi)
                cur.innerText = r
                raw = r
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
                break;
            case "z":
                e.preventDefault();
                if (undoStack.length > 1) {
                    redoStack.push(raw);
                    let previousRaw = undoStack.pop();
                    raw = previousRaw;
                    cur.innerText = previousRaw.split("\n")[lineID] || "";
                }
            case "y":
                e.preventDefault();
                if (redoStack.length > 0) {
                    undoStack.push(raw);
                    let nextRaw = redoStack.pop();
                    raw = nextRaw;
                    cur.innerText = nextRaw.split("\n")[lineID] || "";
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
                        searchInput.focus();
                    }, 10);
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
        case "Backspace":
            if (mi.length > 0) {
                cur.innerText = mi.slice(0, -1)
                raw = raw.slice(0, -1)
            } else {
                let oldelem = cur;
                lineID -= 1;
                lineID = lineID ?? 0;
                let q = document
                    .querySelector("#line" + lineID);
                if (!q) break;
                cur = q
                oldelem.parentNode.remove();
                oldelem = null;
                let k = document.querySelectorAll(".lineno")
                let arr = Array.from(k)
                arr.forEach((t, i) => {
                    t.innerText = String(i + 1);
                })
                let elemidm = cur.id.slice(4)
                let eid = document
                    .querySelector("#cursol" + elemidm)
                if (!eid) break;
                eid.hidden = false;
            }
            break;
        case "ArrowUp": {
            if (lineID > 0) {
                lineID--;
                let linedomid = "#line" + lineID
                let elemidmb = Number(cur.id.slice(4))
                if (Number.isNaN(elemidmb)) return;
                let eidb = document
                    .querySelector("#cursol" + String(elemidmb))
                if (!eidb) break;
                eidb.hidden = true;
                cur = document.querySelector(linedomid);
                let elemidm = Number(cur.id.slice(4))
                if (Number.isNaN(elemidm)) return;
                let eid = document
                    .querySelector("#cursol" + String(elemidm))
                if (!eid) break;
                eid.hidden = false;
            }
            break;
        }
        case "ArrowDown":
            let next = document
                .querySelector("#line" + String(lineID + 1));
            if (next) {
                let elemidmb = Number(cur.id.slice(4))
                if (Number.isNaN(elemidmb)) return;
                let eidb = document
                    .querySelector("#cursol" + String(elemidmb))
                if (!eidb) break;
                eidb.hidden = true;
                lineID++;
                cur = next;
                let elemidm = Number(cur.id.slice(4))
                if (Number.isNaN(elemidm)) return;
                let eid = document
                    .querySelector("#cursol" + String(elemidm))
                if (!eid) break;
                eid.hidden = false;
            }
            break;
        case "Tab":
            e.preventDefault()
            cur.innerText += "|";
            raw += "\t"
            break;
        case "Enter":
            DoEnter()
            break;
        default:
             if (e.key.length > 1) {
                break;
            }
            cur.innerText += e.key;
            raw += e.key
            break;
    }
})
window.addEventListener("error", e => {
    error.innerText += e.message + "\n"
})
showraw.addEventListener("click", e => {
    alert(raw)
})
let filename = ""
maincontainer.hidden=false;
imgcontainer.hidden=true;
openfile.addEventListener("click", async () => {
    if(u===1){
      window.addEventListener('beforeunload',HandleUnload);
    }
    try {
        if (!("showOpenFilePicker" in window)) {
            error.innerText += "\n" + Language.for("inscript.browsererr")
            return;
        }
        let [picker] = (await window?.showOpenFilePicker()) ?? "#"
        if (!picker || picker === "#") return;
        const file = await picker.getFile();
        if (!file) return;
        filename = file?.name
        if(!filename)return;
        filenamei.value = filename;
        switch(filename.split(".").slice(-1)[0]){
            case "png":
            case "svg":
            case "jpeg":
            case "jpg":
            case "gif":
            case "webp":
            case "heic":
            case "tiff":
            case "bmp":
                filetype = "image"
                maincontainer.hidden=true;
                imgcontainer.hidden=false;
                CurrentOpeningFile = file;
                let url = URL.createObjectURL(file)
                let imge = new Image()
                imge.src = url;
                imge.onload=()=>{
                    img1.width = imge.width;
                    img1.height = imge.height;
                    ctx.drawImage(imge,0,0,imge.width,imge.height)
                    URL.revokeObjectURL(url);
                }
                break;
            default:
                filetype = "text"
                maincontainer.hidden=false;
                imgcontainer.hidden=true;
                const content = await file.text();
                content
                   .split("\n")
                   .forEach((r, t, a) => {
                       cur.innerText += r;
                       raw += r;
                       if (t != a.length - 1) DoEnter()
                   })
            break;
        }
    } catch (e) {
        error.innerText += "[fileReading][ERR] " + e.message;
    }
})
savefile.addEventListener("click", async () => {
    try {
        let lines = document.querySelectorAll(".line")
        let linesArr = Array.from(lines)
        let intexts = linesArr.map(t => t.innerText)
        raw = intexts.join("\n")
        if (!("showSaveFilePicker" in window)) {
            error.innerText += "\n" + Language.for("inscript.browsererr")
            return;
        }
        let picker = await window.showSaveFilePicker({
            suggestedName: (filename || "F69sIDE.js")
        })

        if (!confirm(Language.for("inscript.savedialog"))) return;
        let writable; 
        async function SuscessSave(){
            await writable.close();
            error.innerText += Language.for("inscript.saved");
            window.removeEventListener('beforeunload',HandleUnload);
        }
        switch(filetype){
            case "image":
                img1.toBlob(async (b)=>{
                    writable = await picker.createWritable();
                    await writable.write(b);
                    SuscessSave()
                })
                break;
            default:
                writable = await picker.createWritable();
                await writable.write(raw);
                SuscessSave()
                break;
        }
    } catch (e) {
        if(e.name==="AbortError")return;
        error.innerText += "[fileSaving]["+e.name+"] " + e.message;
    }
})
filenamei.addEventListener("input", async () => {
    if (filenamei.value.length === 0) {
        let inputtext = "Enter File Name..."
        let inputtextdin = inputtext;
        for (var i = 0; i <= (inputtext.length * 2) - 1; i++) {
            inputtextdin = inputtextdin.slice(1) + inputtextdin[0]
            filenamei.placeholder = inputtextdin;
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }
    filename = filenamei.value
})
let settingsmode = false;
settingscontainer.hidden = true;
settings.addEventListener("click", () => {
    settingsmode = !settingsmode
    middlearea.hidden = settingsmode
    maincontainer.hidden = settingsmode
    menu.hidden = settingsmode
    showraw.hidden = settingsmode
    settingscontainer.hidden = !settingsmode
    settings
        .innerText = (settingsmode ? "Close" : "Open") + " settings"
})
function SwitchTheme(v) {
    switch (v) {
        case "d":
            theme_area.innerText = `
        :root{--cursol-color:#FFFFFF;--line-no-color:#a9a4a2;--line-no-border:#4e4240;--main-color:#8d8584;--ineditor-text-color:#000000;--background-unit-color:#000000;--out-unit-color:#FFFFFF;}
          `
            break;
        case "l":
            theme_area.innerText = `
        :root{--cursol-color:#000000;--line-no-color:#565b5d;--line-no-border:#b1bdbf;--main-color:#727a7b;--ineditor-text-color:#FFFFFF;--background-unit-color:#FFFFFF;--out-unit-color:#000000;}
          `
            break;
        default:
            break;
    }
}
let m = localStorage?.getItem?.("fide:theme")
if (m) {
    SwitchTheme(m)
    maintheme.value = m;
}
maintheme.addEventListener("input", () => {
    let v = maintheme.value
    SwitchTheme(v);
    localStorage?.setItem?.("fide:theme", v);
})
rawexec.addEventListener("click", () => {
    let h=TIDEPreParse(raw)
    ExecuteCode(raw,h)
})
searchi.addEventListener("click",()=>{
    active=false;
})
searchi.addEventListener("keydown",e=>{
    if(e.key!=="Enter")return;
    let res=Search(raw,searchi.value)
    if(res.length===0){
        searchresults.innerText=Language.for("inscript.resultnone")
    }
    searchresults.innerText=String(res.length)+Language.for("inscript.resultfound")
    let elems = Array.from(document.querySelectorAll(".found"))
    elems.forEach(t=>t.classList.remove("found"))
    isSearched=false;
    res.forEach(t=>{
        let m=Number(t.id)
        if(Number.isNaN(m))return;
        let elem = document.querySelector("#line"+String(m))
        if(!elem)return;
        elem.classList.add("found");
        isSearched=true;
    })
})
replt.addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  let i=replt.value
  if(!searchi.value||!isSearched){
    searchresults.innerText=Language.for("inscript.replerr")
    return;
  }
  let elems = Array.from(document.querySelectorAll(".found"))
  elems.forEach(t=>{
    t.innerText=t.innerText.replaceAll(searchi.value,i);
  })
  searchresults.innerText=elems.length+Language.for("inscript.replsuccess")
})
unl.addEventListener("click",()=>{
  let res = unl.checked?"1":"0"
  localStorage.setItem("fide:check_unload",res)
})
setc.addEventListener("click",()=>{
    cur.innerText += palettecolor.value;
})
  img1.addEventListener("mousedown",e=>{
    drawing = true;
    let x=e.offsetX,y=e.offsetY;
    oldx=x;
    oldy=y;
  })
  img1.addEventListener("mousemove",e=>{
    if(!drawing)return;
    let x=e.offsetX,y=e.offsetY;
    Coloredline(x,y,oldx,oldy,pencolor.value)
    oldx=x;
    oldy=y;
  })
  img1.addEventListener("mouseup",()=>{
    drawing = false;
  })
const firstGroup = document.getElementById("lineGroup0");
if (firstGroup) {
    firstGroup.addEventListener("click", () => {
        let oldIdx = cur.id.slice(4);
        let oldCursol = document.querySelector("#cursol" + oldIdx);
        if (oldCursol) oldCursol.hidden = true;

        lineID = 0;
        cur = document.getElementById("line0");

        const firstCursol = document.getElementById("cursol0");
        if (firstCursol) firstCursol.hidden = false;
    });
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('[PWA]PWA registration successfully'))
            .catch((err) => console.error('[PWA]PWA registration failed:', err));
    });
}
