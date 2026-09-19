// FIDE Custom IDE - Core UI Event Listeners Module (v1.0.1 Stable Final)
import { detectLanguageByExtension, applyFIDEHighlight } from "./highlighter.js";

// 💡 メインスレッドから各変数や状態、関数をブリッジ接続するための、一斉初期化配線ゲート！
export function initUIListeners(context) {
    const {
        getRaw, setRaw, getCursorIdx, setCursorIdx, getLineID, setLineID, getCur, setCur,
        undoStack, redoStack, DoEnter, refreshLineUI, SwitchTheme, ExecuteCode, TIDEPreParse, Language, HandleUnload
    } = context;

    // 💡 1. 設定ボタンの開閉イベント
    if (globalThis.settings) {
        settings.addEventListener("click", () => {
            let settingsmode = !settingscontainer.hidden;
            settingsmode = !settingsmode;
            middlearea.hidden = settingsmode;
            maincontainer.hidden = settingsmode;
            menu.hidden = settingsmode;
            showraw.hidden = settingsmode;
            settingscontainer.hidden = !settingsmode;
            settings.innerText = (settingsmode ? "Close" : "Open") + " settings";
        });
    }

    // 💡 2. テーマ切り替えイベント
    if (globalThis.maintheme) {
        maintheme.addEventListener("input", () => {
            let v = maintheme.value;
            SwitchTheme(v);
            localStorage?.setItem?.("fide:theme", v);
        });
    }

    // 💡 3. コード実行（rawexec）イベント
    if (globalThis.rawexec) {
        rawexec.addEventListener("click", () => {
            let h = TIDEPreParse(getRaw());
            ExecuteCode(getRaw(), h);
        });
    }

    // 💡 4. アンロード警告設定
    if (globalThis.unl) {
        unl.addEventListener("click", () => {
            let res = unl.checked ? "1" : "0";
            localStorage.setItem("fide:check_unload", res);
        });
    }

    // 💡 5. カラーパレット文字挿入イベント
    if (globalThis.setc) {
        setc.addEventListener("click", () => {
            if (getCur()) getCur().innerText += palettecolor.value;
        });
    }

    // 💡 6. キャンバスお絵描き（img1）イベント
    if (globalThis.img1) {
        let oldx = 0, oldy = 0, drawing = false;
        let ctx = img1.getContext("2d");

        img1.addEventListener("mousedown", e => {
            drawing = true;
            oldx = e.offsetX; oldy = e.offsetY;
        });
        img1.addEventListener("mousemove", e => {
            if (!drawing) return;
            let x = e.offsetX, y = e.offsetY;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(oldx, oldy);
            ctx.strokeStyle = pencolor.value; ctx.stroke();
            oldx = x; oldy = y;
        });
        img1.addEventListener("mouseup", () => { drawing = false; });
    }

    // 💡 7. ファイル保存（savefile）イベント
    if (globalThis.savefile) {
        savefile.addEventListener("click", async () => {
            try {
                let lines = document.querySelectorAll(".line");
                let intexts = Array.from(lines).map(t => t.innerText.replace(/\|/g, ""));
                setRaw(intexts.join("\n"));

                if (!("showSaveFilePicker" in window)) {
                    error.innerText += "\n" + Language.for("inscript.browsererr");
                    return;
                }
                let picker = await window.showSaveFilePicker({ suggestedName: (globalThis.filename || "F69sIDE.js") });
                if (!confirm(Language.for("inscript.savedialog"))) return;

                let writable;
                async function SuscessSave() {
                    await writable.close();
                    error.innerText += Language.for("inscript.saved");
                    window.removeEventListener('beforeunload', HandleUnload);
                }

                if (globalThis.filetype === "image") {
                    img1.toBlob(async b => {
                        writable = await picker.createWritable();
                        await writable.write(b);
                        SuscessSave();
                    });
                } else {
                    writable = await picker.createWritable();
                    await writable.write(getRaw());
                    SuscessSave();
                }
            } catch (e) {
                if (e.name === "AbortError") return;
                error.innerText += "[fileSaving][" + e.name + "] " + e.message;
            }
        });
    }

    // 💡 8. ファイル読み込み（openfile）イベント
    if (globalThis.openfile) {
        openfile.addEventListener("click", async () => {
            if (Number(localStorage?.getItem?.("fide:check_unload")) === 1) {
                window.addEventListener('beforeunload', HandleUnload);
            }
            try {
                if (!("showOpenFilePicker" in window)) {
                    error.innerText += "\n" + Language.for("inscript.browsererr");
                    return;
                }
                let [picker] = (await window?.showOpenFilePicker()) ?? "#";
                if (!picker || picker === "#") return;
                const file = await picker.getFile();
                if (!file) return;

                globalThis.filename = file?.name;
                if (!globalThis.filename) return;
                filenamei.value = globalThis.filename;
                detectLanguageByExtension(globalThis.filename);
                applyFIDEHighlight();

                if (["png","svg","jpeg","jpg","gif","webp","heic","tiff","bmp"].includes(globalThis.filename.split(".").slice(-1)[0])) {
                    globalThis.filetype = "image";
                    maincontainer.hidden = true; imgcontainer.hidden = false;
                    let url = URL.createObjectURL(file);
                    let imge = new Image(); imge.src = url;
                    imge.onload = () => {
                        img1.width = imge.width; img1.height = imge.height;
                        img1.getContext("2d").drawImage(imge, 0, 0, imge.width, imge.height);
                        URL.revokeObjectURL(url);
                    };
                } else {
                    globalThis.filetype = "text";
                    maincontainer.hidden = false; imgcontainer.hidden = true;
                    undoStack.push(getRaw()); redoStack.length = 0;
                    if (getCur()) getCur().innerText = "";
                    setRaw("");

                    const content = await file.text();
                    const lines = content.split("\n");
                    if (getCur()) getCur().innerText = lines[0] || "";
                    setRaw(lines[0] || "");

                    for (let i = 1; i < lines.length; i++) {
                        await DoEnter();
                        if (getCur()) getCur().innerText = lines[i];
                        setRaw(getRaw() + lines[i]);
                    }
                    setCursorIdx(getCur() ? getCur().innerText.replace(/\|/g, "").length : 0);
                    refreshLineUI();
                }
            } catch (e) {
                error.innerText += "[fileReading][ERR] " + e.message;
            }
        });
    }

    // 💡 9. ファイル名入力欄のplaceholderアニメーション
    if (globalThis.filenamei) {
        filenamei.addEventListener("input", async () => {
            if (filenamei.value.length === 0) {
                let inputtext = "Enter File Name...";
                let inputtextdin = inputtext;
                for (var i = 0; i <= (inputtext.length * 2) - 1; i++) {
                    inputtextdin = inputtextdin.slice(1) + inputtextdin;
                    filenamei.placeholder = inputtextdin;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            globalThis.filename = filenamei.value;
        });
    }
}
