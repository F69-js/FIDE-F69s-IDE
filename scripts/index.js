import{_jala ,_fjalu} from "./fjalu/index.js"
let lineID = 0;
let cur = null;
let raw = "";
let g;
let error = document.querySelector("#error");
let showraw = document.querySelector("#showraw");
let settings = document.querySelector("#settings");
let settingscontainer = document.querySelector("#settingscontainer");
let middlearea = document.querySelector("#middlearea");
let maincontainer = document.querySelector("#maincontainer");
let filenamei = document.querySelector("#filenamei");
let openfile = document.querySelector("#openfile");
let savefile = document.querySelector("#savefile");
let maintheme = document.querySelector("#maintheme");
let theme_area = document.querySelector("#theme_area");
class EnvironmentError extends Error {
    constructor(...args) {
        super(...args)
        this.name = "EnvironmentError"
    }
}
let main = document?.querySelector("#input")
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
window.addEventListener("keydown", e => {
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
    } catch (e) {
        error.innerText += "[fileReading][ERR] " + e.message;
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
        :root{
         --cursol-color:#000000;
         --line-no-color:#a9a4a2;
         --line-no-border:#4e4240;
         --main-color:#8d8584;
         --ineditor-text-color:#000000;
         --background-unit-color:#000000;
         --out-unit-color:#FFFFFF;
       }
          `
            break;
        case "l":
            theme_area.innerText = `
        :root{
         --cursol-color:#FFFFFF;
         --line-no-color:#565b5d;
         --line-no-border:#b1bdbf;
         --main-color:#727a7b;
         --ineditor-text-color:#FFFFFF;
         --background-unit-color:FFFFFF;
         --out-unit-color:#000000;
       }
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
