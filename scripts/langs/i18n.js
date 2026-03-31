class Language{
  static textlist = [{LanguageTableName}];
  static language = [{Language}];
  static for(key){
    let keys = key.split(".").splice(2)
    keys.unshift(this.language)
    let current = texts;
    let err = false;
    keys.forEach(t=>{
      current = current[t];
    })
    return current?current:key
  }
}
let LanguageTable = {
  ja:{
    htmltext:{
      regexmode:"正規表現モード",
      flag:"フラグ 複数の場合は,を使用してください",
      replacer:"置換先",
      thmelabel1:"テーマ選択:",
      unllabel1:"保存確認時のダイアログを表示します",
      unllabel2:"保存確認ダイアログを表示"
    }
  },
  en:{
      regexmode:"Regular Expression Mode",
      flag:"Flag.Use a comma (,) if there are multiple flags.",
      replacer:"Replace To",
      thmelabel1:"Select Theme:",
      unllabel1:"display a dialog box for saving confirmation.",
      unllabel2:"dialog box for saving confirmation."
  }
}
export{Language,LanguageTable}
