// FIDE Custom IDE - Built-in AI (Prompt API) Core Interface Module (v1.0.1 Stable Final)
import { detectLanguageByExtension, applyFIDEHighlight } from "./highlighter.js";
// 💡 【直下パス修正】 newtacsを撤去し、同じフォルダ直下の prompt-text.js から美しくロード！
import { sysprompt } from "./prompt-text.js";

export { sysprompt };

export async function initBuiltInAI() {
    if (!window.LanguageModel) {
        if (globalThis.available) globalThis.available.hidden = true;
        if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
        return;
    }
    try {
        const capabilities = await window.LanguageModel.availability();
        if (capabilities === "no") {
            if (globalThis.available) globalThis.available.hidden = true;
            if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
        }
    } catch (e) {
        if (globalThis.available) globalThis.available.hidden = true;
        if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
    }
}

export async function sendBtnCheck(getRawTextFn, setRawTextFn, doEnterFn, undoStackRef) {
    if (globalThis.aienable && !globalThis.aienable.checked) {
        if (globalThis.aioutput) globalThis.aioutput.innerText = "AI機能は設定で無効化されています。";
        return;
    }
    if (!window.LanguageModel) {
        alert("お使いのブラウザはBuilt-in AIに対応していません。");
        return;
    }

    const promptText = globalThis.aiinput ? globalThis.aiinput.value.trim() : "";
    if (!promptText) return;

    if (globalThis.aioutput) globalThis.aioutput.innerText = "AIが思考中...";

    try {
        const session = await window.LanguageModel.create({
            expectedOutputLanguage: 'ja',
            initialPrompts: [{ role: "system", content: sysprompt }]
        });

        const currentFileName = globalThis.filenamei ? (globalThis.filenamei.value || "F69sIDE.js") : "F69sIDE.js";
        const currentRaw = getRawTextFn();

        const fullPrompt = `
[!PROMPT]
\${promptText}

[!RAWCODE]
[!code_editor \${currentFileName}]
\${currentRaw}
        `.trim();

        const response = await session.prompt(fullPrompt);
        session.destroy();

        const codeBlockRegex = /\[!code_editor\s+([^\]]+)\]([\s\S]*?)(?:\`\`\`|\$)/;
        const match = response.match(codeBlockRegex);

        let explanation = response;
        if (match) {
            const extractedCode = match.trim();
            explanation = response.replace(codeBlockRegex, "").trim();
            
            undoStackRef.push(currentRaw);
            globalThis.redoStack = [];
            setRawTextFn("");
            
            const lines = extractedCode.split(/\r?\n/);
            globalThis.maincontainer.innerHTML = `
                <div id="lineGroup0" class="group"><div id="lineno0" class="lineno">1</div><div id="line0" class="line">\${lines || ""}</div><div id="cursol0" class="cursol"></div></div>`;
            globalThis.lineID = 0;
            globalThis.cur = document.querySelector("#line0");
            setRawTextFn(lines || "");

            for (let i = 1; i < lines.length; i++) {
                await doEnterFn();
                globalThis.cur.innerText = lines[i];
                setRawTextFn(getRawTextFn() + lines[i]);
            }
            applyFIDEHighlight();
        }

        if (globalThis.aioutput) {
            globalThis.aioutput.innerText = explanation;
        }

    } catch (err) {
        console.error(err);
        if (globalThis.aioutput) globalThis.aioutput.innerText = "AI実行エラー: " + err.message;
    }
}
