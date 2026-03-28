const noop = () => { };
(function (glThis) {
    // FJALU Area
    let config = { number: "big" };
    const JP_RE = /[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]/gu;
    const ALPHA_RE = /[a-z]/i;
    const DIGIT_RE = /\d/;

    function isJapanese(...e) {
        return e.map(t => !JP_RE.test(t));
    }

    let t = {
        a: 12354, i: 12356, u: 12358, e: 12360, o: 12362,
        a: { a: 12354, i: 12356, u: 12358, e: 12360, o: 12362 },
        k: { a: 12363, i: 12365, u: 12367, e: 12369, o: 12371, y: { a: [12365, 12419], u: [12365, 12421], o: [12365, 12423] } },
        s: { a: 12373, i: 12375, u: 12377, e: 12379, o: 12381, y: { a: [12375, 12419], u: [12375, 12421], o: [12375, 12423] }, h: { a: [12375, 12419], i: 12375, u: [12375, 12421], e: [12375, 12359], o: [12375, 12423] } },
        t: { a: 12383, i: 12385, u: 12388, e: 12390, o: 12392, y: { a: [12385, 12419], u: [12385, 12421], o: [12385, 12423] } },
        n: { a: 12394, i: 12395, u: 12396, e: 12397, o: 12398, n: 12435, y: { a: [12395, 12419], u: [12395, 12421], o: [12395, 12423] } },
        h: { a: 12399, i: 12402, u: 12405, e: 12408, o: 12411, y: { a: [12402, 12419], u: [12402, 12421], o: [12402, 12423] } },
        m: { a: 12414, i: 12417, u: 12420, e: 12417, o: 12426, y: { a: [12417, 12419], u: [12417, 12421], o: [12417, 12423] } },
        y: { a: 12420, u: 12422, o: 12424 },
        r: { a: 12425, i: 12426, u: 12427, e: 12428, o: 12429, y: { a: [12428, 12419], u: [12428, 12421], o: [12428, 12423] } },
        w: { a: 12431, o: 12434 },
        g: { a: 12364, i: 12366, u: 12368, e: 12370, o: 12372, y: { a: [12366, 12419], u: [12366, 12421], o: [12366, 12423] } },
        z: { a: 12374, i: 12376, u: 12378, e: 12380, o: 12382, y: { a: [12376, 12419], u: [12376, 12421], o: [12376, 12423] } },
        d: { a: 12384, i: 12386, u: 12391, e: 12391, o: 12393, y: { a: [12386, 12419], u: [12386, 12421], o: [12386, 12423] } },
        b: { a: 12400, i: 12403, u: 12406, e: 12409, o: 12412, y: { a: [12403, 12419], u: [12403, 12421], o: [12403, 12423] } },
        p: { a: 12401, i: 12404, u: 12407, e: 12410, o: 12413, y: { a: [12404, 12419], u: [12404, 12421], o: [12404, 12423] } },
        j: { a: [12376, 12419], i: 12376, u: [12376, 12421], e: [12376, 12359], o: [12376, 12423] },
        "-": 12540, ".": 12290, ",": 12289, "?": 65311, "\\": 65509,
    };
    noop("add below table")
    t.c = {
        a: 12363, i: 12375, u: 12367, e: 12375, o: 12363,
        h: {
            a: [12385, 12419], // ちゃ
            i: 12385,          // ち
            u: [12385, 12421], // ちゅ
            e: [12385, 12359], // ちぇ
            o: [12385, 12423]  // ちょ
        }
    };
    function RomajiToJapanese(input, tree = t) {
        let result = "", i = 0;

        function walk(node, index) {
            let char = input[index]?.toLowerCase();
            let nextNode = node[char];

            if (!nextNode) return null;

            if (typeof nextNode === "number" || Array.isArray(nextNode)) {
                return {
                    res: String.fromCharCode(...(Array.isArray(nextNode) ? nextNode : [nextNode])),
                    nextIdx: index + 1
                };
            }

            if (index + 1 < input.length) {
                let sub = walk(nextNode, index + 1);
                if (sub) return sub; 
            }

            return null;
        }
        noop("Core Loop with Sokuon support");
        while (i < input.length) {
            let char = input[i].toLowerCase();
            let next = input[i + 1]?.toLowerCase();


            if (next && char === next && !'aiueon'.includes(char) && t[char]) {
                result += String.fromCharCode(12387); // 「っ」
                i++;
                continue;
            }

            let match = walk(tree, i);
            if (match) {
                result += match.res;
                i = match.nextIdx;
            } else {
                result += input[i];
                i++;
            }
        }
        return result;
    }
    const reverseMap = {};
    (function buildMap(node, path = "") {
        for (let key in node) {
            let val = node[key];
            if (typeof val === "number" || Array.isArray(val)) {
                let str = Array.isArray(val) ? String.fromCharCode(...val) : String.fromCharCode(val);
                reverseMap[str] = (reverseMap[str] ?? path + key);
            } else {
                buildMap(val, path + key);
            }
        }
    })(t);
    function JapaneseToRomaji(input, tree = t) {
        let result = "";
        for (let i = 0; i < input.length; i++) {
            let char = input[i];
            let next = input[i + 1];

            if (char === "っ" && next) {
                let nextRomaji = reverseMap[next] || encodeRomaji(next);
                result += nextRomaji[0];
                continue;
            }

            let doubleChar = char + (next || "");
            if (reverseMap[doubleChar]) {
                result += reverseMap[doubleChar];
                i++;
            } else {
                result += reverseMap[char] || char;
            }
        }
        return result;
    }
    //FJALA Area
    function translateAuto(...p) {
        if (p.length < 1) return;
        if (p.length < 2) {
            if (isJapanese(p[0])) {
                return RomajiToJapanese(p[0])
            } else {
                return p[0]
            }
        } else {
            return p.map(t => {
                if (isJapanese(t)) {
                    return RomajiToJapanese(t)
                } else {
                    return t
                }
            })
        }
    }
    globalThis._fjala = translateAuto;
    globalThis._fjalu = {
        isJapanese: isJapanese,
        JapaneseToRomaji: JapaneseToRomaji,
        RomajiToJapanese: RomajiToJapanese,
        InternalTable: t
    }
})(globalThis)
let _jala = globalThis._fjala
let _fjalu = globalThis._fjalu
let lineID = 0;
let cur = null;
let raw = "";
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
