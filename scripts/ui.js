import { detectLanguageByExtension, applyFIDEHighlight } from "./newtacs/highlighter.js";

export function initUIListeners(context) {
  const { 
    getRaw, setRaw, setCursorIdx, DoEnter, refreshLineUI, 
    SwitchTheme, ExecuteCode, TIDEPreParse, Language, 
    HandleUnload, undoStack, redoStack, getCur 
  } = context;

  // 1. 設定ボタンの制御
  if (globalThis.settings) { 
    settings.addEventListener("click", () => { 
      let settingsmode = !settingscontainer.hidden; 
      middlearea.hidden = !settingsmode; 
      maincontainer.hidden = !settingsmode; 
      menu.hidden = !settingsmode; 
      showraw.hidden = !settingsmode; 
      settingscontainer.hidden = settingsmode; 
      settings.innerText = (settingsmode ? "Open" : "Close") + " settings";
    });
  }

  // 2. テーマ切り替え
  if (globalThis.maintheme) { 
    maintheme.addEventListener("input", () => { 
      let v = maintheme.value; 
      SwitchTheme(v); 
      localStorage?.setItem?.("fide:theme", v);
    });
  }

  // 3. コードの実行ボタン
  if (globalThis.rawexec) { 
    rawexec.addEventListener("click", () => { 
      ExecuteCode(getRaw(), TIDEPreParse(getRaw()));
    });
  }

  // 4. アンロード警告チェック
  if (globalThis.unl) { 
    unl.addEventListener("click", () => { 
      localStorage.setItem("fide:check_unload", unl.checked ? "1" : "0");
    });
  }

  // 5. カラーパレット適用
  if (globalThis.setc) { 
    setc.addEventListener("click", () => { 
      if (getCur()) getCur().innerText += palettecolor.value;
    });
  }

  // 6. 簡易ペイント機能（お絵描き）
  if (globalThis.img1) { 
    let oldx = 0, oldy = 0, drawing = false; 
    let ctx = img1.getContext("2d"); 
    img1.addEventListener("mousedown", e => { drawing = true; oldx = e.offsetX; oldy = e.offsetY; }); 
    img1.addEventListener("mousemove", e => { 
      if (!drawing) return; 
      let x = e.offsetX, y = e.offsetY; 
      ctx.beginPath(); 
      ctx.moveTo(x, y); 
      ctx.lineTo(oldx, oldy); 
      ctx.strokeStyle = pencolor.value; 
      ctx.stroke(); 
      oldx = x; oldy = y; 
    }); 
    img1.addEventListener("mouseup", () => { drawing = false; });
  }

  // 7. ファイル保存ボタン
  if (globalThis.savefile) { 
    savefile.addEventListener("click", async () => { 
      try { 
        let lines = document.querySelectorAll(".line"); 
        setRaw(Array.from(lines).map(t => t.innerText.replace(/\|/g, "")).join("\n")); 
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
          img1.toBlob(async b => { writable = await picker.createWritable(); await writable.write(b); SuscessSave(); }); 
        } else { 
          writable = await picker.createWritable(); await writable.write(getRaw()); SuscessSave(); 
        } 
      } catch (e) { 
        if (e.name === "AbortError") return; 
        error.innerText += "[fileSaving][" + e.name + "] " + e.message;
      } 
    });
  }

  // 8. ファイル読み込みボタン（開く）
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
        filenamei.value = globalThis.filename; 
        
        // 💡 ファイルを開いた瞬間に言語判定とハイライトを強制起動！
        detectLanguageByExtension(globalThis.filename); 
        applyFIDEHighlight(); 

        if (["png","svg","jpeg","jpg","gif","webp","heic","tiff","bmp"].includes(globalThis.filename.split(".").slice(-1)[0])) { 
          globalThis.filetype = "image"; 
          maincontainer.hidden = true; 
          imgcontainer.hidden = false; 
          let url = URL.createObjectURL(file); 
          let imge = new Image(); 
          imge.src = url; 
          imge.onload = () => { 
            img1.width = imge.width; 
            img1.height = imge.height; 
            img1.getContext("2d").drawImage(imge, 0, 0, imge.width, imge.height); 
            URL.revokeObjectURL(url);
          }; 
        } else { 
          globalThis.filetype = "text"; 
          maincontainer.hidden = false; 
          imgcontainer.hidden = true; 
          undoStack.push(getRaw()); 
          redoStack.length = 0; 
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

  // 9. 【大修正】ファイル名手入力欄（入力時のプレースホルダー演出と連動）
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
      
      // ⭕ 【ここに用がある！】手入力で文字が変わった瞬間にも、ハイライター側へ拡張子を投げてアイコンを叩き起こす！
      if (typeof detectLanguageByExtension === "function") {
          detectLanguageByExtension(filenamei.value);
      }
    });
  }
}
