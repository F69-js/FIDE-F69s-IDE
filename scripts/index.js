import { _jala, _fjalu } from "./fjalu/index.js"
import {TIDEPreParse} from "./linter/tide.js"
let lineID = 0;
let cur = null;
let raw = "";
let g;
let error = document?.querySelector("#error");
let showraw = document?.querySelector("#showraw");
let settings = document?.querySelector("#settings");
let settingscontainer = document?.querySelector("#settingscontainer");
let middlearea = document?.querySelector("#middlearea");
let maincontainer = document?.querySelector("#maincontainer");
let filenamei = document?.querySelector("#filenamei");
let openfile = document?.querySelector("#openfile");
let savefile = document?.querySelector("#savefile");
let maintheme = document?.querySelector("#maintheme");
let theme_area = document?.querySelector("#theme_area");
let rawexec = document?.querySelector("#rawexec");
let main = document?.querySelector("#input")
let searchi = document?.querySelector("#searchi")
let searchresults=document?.querySelector("#searchresults")
let searchg=document?.querySelector("#searchg")
let rgxmode=document?.querySelector("#rgxmode")
let flags=document?.querySelector("#flags")
let flagg=document?.querySelector("#flagg")
let replt=document?.querySelector("#replt")
let replg=document?.querySelector("#replg")
let replacco=document?.querySelector("#replacco")
let codehaserror = false;
let active = false;
let regexmode = false;
let replaccoOpen = false;
let isSearched = false;
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
  rs.forEach((t,i)=>{
    let condition;
    if(regexmode){
      let flagss = (flags?.value)?.length===0?"gmu":flags.value.split(",").join("")
      let rgx = new RegExp(searchwords,flagss)
      try{
        condition=rgx.test(t)
      }catch(e){
        searchresults.innerText+="正しくないRegex:"+e.message
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
    e.returnValue = 'FIDEは保存されていません。本当にサイトを終了しますか？';
}
class EnvironmentError extends Error {
    constructor(...args) {
        super(...args)
        this.name = "EnvironmentError"
    }
}
main.addEventListener("click",()=>{
    active=true;
})
filenamei.addEventListener("click",()=>{
    active=false;
})
flags.addEventListener("click",()=>{
    active=false;
})
function ExecuteCode(c,h) {
    window.addEventListener('beforeunload',HandleUnload);
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
        error.innerText += "内部エンジンがエラーを予測したため、実行は中止されました"
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
if (!main) {
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
    let old = cur;
    let elemid = old.id.slice(4)
    let cur2 = document
        .querySelector("#cursol" + elemid)
    if (!cur2) return;
    cur2.hidden = true;
    lineID++;
    let newElem = document
        .createElement("div")
    let elemGroup = document
        .createElement("div")
    let elemNo = document
        .createElement("div")
    let curElem = document
        .createElement("div")
    newElem.id = "line" + lineID
    newElem.classList.add("line")
    curElem.id = "cursol" + lineID
    curElem.classList.add("cursol")
    elemNo.id = "lineno" + lineID
    elemNo.classList.add("lineno")
    elemNo.innerText = String(lineID + 1);
    elemGroup.id = "lineGroup" + lineID
    elemGroup.classList.add("group")
    elemGroup.appendChild(elemNo)
    elemGroup.appendChild(newElem)
    elemGroup.appendChild(curElem)
    main.appendChild(elemGroup)
    cur = newElem;
    raw += "\n";
}
async function ReadClipBoard() {
    window.addEventListener('beforeunload',HandleUnload);
    navigator.clipboard.readText().then(t => {
        t
            .split("\n")
            .forEach((r, t, a) => {
                cur.innerText += r;
                raw += r;
                if (t != a.length - 1) DoEnter()
            })
    }, e => {
        error.innerText += "Error:" + t;
        error.innerText += "クリップボードの権限をご確認ください"
    })
}
let SearchOpen = true;
searchi.hidden=SearchOpen
searchresults.hidden=SearchOpen
searchg.hidden=SearchOpen
window.addEventListener("keydown", e => {
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
    window.addEventListener('beforeunload',HandleUnload);
    let mi = cur.innerText
    if (e.ctrlKey) {
        switch (e.key) {
            case "v":
                e.preventDefault();
                ReadClipBoard();
                break;
            case "j":
                e.preventDefault()
                cur.innerText = _jala(mi)
                raw = _jala(mi)
                break;
        }
        return;
    }
    switch (e.key) {
        case "Shift":
        case "Control":
        case "Meta":
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
openfile.addEventListener("click", async () => {
    window.addEventListener('beforeunload',HandleUnload);
    try {
        if (!("showOpenFilePicker" in window)) {
            error.innerText += "\n" + "このブラウザでは使用できません"
            return;
        }
        let [picker] = (await window?.showOpenFilePicker()) ?? "#"
        if (!picker || picker === "#") return;
        const file = await picker.getFile();
        if (!file) return;
        filename = file?.name
        filenamei.value = filename;
        const content = await file.text();
        content
            .split("\n")
            .forEach((r, t, a) => {
                cur.innerText += r;
                raw += r;
                if (t != a.length - 1) DoEnter()
            })
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
            error.innerText += "\n" + "このブラウザでは使用できません"
            return;
        }
        let picker = await window.showSaveFilePicker({
            suggestedName: (filename || "F69sIDE.js")
        })

        if (!confirm("保存しますか？")) return;
        const writable = await picker.createWritable();
        await writable.write(raw);
        await writable.close();
        error.innerText += ('保存完了');
        window.removeEventListener('beforeunload',HandleUnload);
    } catch (e) {
        if(e.name==="AbortedError")return;
        error.innerText += "[fileReading]["+e.name+"] " + e.message;
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
        searchresults.innerText="結果は見つかりませんでした"
    }
    searchresults.innerText=String(res.length)+"件の結果が見つかりました"
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
    searchresults.innerText="まだ検索していないか、置換前に検索キーが無くなっているかもしれません"
    return;
  }
  let elems = Array.from(document.querySelectorAll(".found"))
  elems.forEach(t=>{
    t.innerText=t.innerText.replaceAll(searchi.value,i);
  })
  searchresults.innerText=elems.length+"箇所を置換しました"
})

