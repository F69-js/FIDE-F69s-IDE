class Language {
    static textlist = null;
    static language = null;
    static for(key) {
        let keys = key.split(".")
        keys.unshift(this.language)
        let current = this.textlist;
        let err = false;
        keys.forEach(t => {
            current = current[t];
        })
        return current ? current : key
    }
}
let LanguageTable = {
    ja: {
        htmltext: {
            regexmode: "正規表現モード",
            flag: "フラグ 複数の場合は,を使用してください",
            replacer: "置換先",
            thmelabel1: "テーマ選択:",
            unllabel1: "保存確認時のダイアログを表示します",
            unllabel2: "保存確認ダイアログを表示"
        },
        inscript: {
            invalidregex: "正しくないRegex:",
            saveconfirm: 'FIDEは保存されていません。本当にサイトを終了しますか？',
            executestop: "内部エンジンがエラーを予測したため、実行は中止されました",
            clipboarderr: "クリップボードの権限をご確認ください",
            browsererr: "このブラウザでは使用できません",
            savedialog: "保存しますか？",
            saved: '保存完了',
            resultnone: "結果は見つかりませんでした",
            resultfound: "件の結果が見つかりました",
            replerr: "まだ検索していないか、置換前に検索キーが無くなっているかもしれません",
            replsuccess: "箇所を置換しました"
        }
    },
    en: {
        htmltext: {
            regexmode: "Regular Expression Mode",
            flag: "Flag.Use a comma (,) if there are multiple flags.",
            replacer: "Replace To",
            thmelabel1: "Select Theme:",
            unllabel1: "display a dialog box for saving confirmation.",
            unllabel2: "dialog box for saving confirmation."
        },
        inscript: {
            invalidregex: "Invalid Regex:",
            saveconfirm: 'FIDE is not saved. Are you sure you want to exit the site?',
            executestop: "Execution was aborted because the internal engine predicted an error",
            clipboarderr: "Please check your clipboard permissions",
            browsererr: "Not available in this browser",
            savedialog: "Do you want to save?",
            saved: 'Save complete',
            resultnone: "No result(s) found",
            resultfound: "　Result(s) found",
            replerr: "You may not have searched yet, or your search key may be missing before replacement",
            replsuccess: " line(s) replaced"
        }
    }
}
export { Language, LanguageTable }
