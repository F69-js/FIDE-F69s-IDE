// FIDE Custom IDE - Syntax Highlighter Module (Generator & Pink-Control Enhanced Version)
const K_HL = {
  // 1. 基本の制御構文（淡いブルー）
  'k': [
    "if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function",
    "extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"
  ],
  
  // 2. 💡【強化】ピンクにする重要キーワード（アロー関数クラス a を流用！）
  'a': [
    "async","while","continue","debugger","null"
  ],
  
  // 特殊参照（ゴールド）
  's': [
    "this","window","globalThis","super","self","global","screenLeft","screenTop"
  ],
  
  // 標準オブジェクト・グローバルクラス（ライトグリーン）
  'b': [
    "JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","true","false",
    "Boolean","RegExp","Function","Symbol","Proxy","Reflect","BigInt","URL","URLSearchParams","WeakMap","WeakSet","ArrayBuffer","DataView",
    "Uint8Array","Float64Array","Int32Array","Int8Array","Uint16Array","Int16Array","Uint32Array","Float32Array","BigInt64Array","BigUint64Array",
    "TypeError","ReferenceError","SyntaxError","RangeError","URIError","AggregateError","EvalError",
    "Atomics","FinalizationRegistry","WeakRef","Intl","Collator","DateTimeFormat","NumberFormat","PluralRules","RelativeTimeFormat","ListFormat","Locale","DisplayNames","Segmenter",
    "process","document","navigator","screen","location","history",
    "Temporal","LanguageModel","ai",
    "InternalError","ParallelArray","StopIteration",
    "eval","escape","unescape",
    "$","_","jQuery","React","ReactDOM","Vue","Angular","Rx"
  ],
  
  // メソッド・プロパティ名（イエロー）
  'm': [
    "push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","hasOwnProperty","subscribe","then","repeat","next",
    "parse","stringify","log","warn","error","floor","ceil","abs","max","min","pow","parseFloat","parseInt","isNaN","toString","keys","random","now",
    "find","findLast","findLastIndex","reduceRight","every","sort","reverse","flat","flatMap","fill","values","endsWith","toLowerCase","toUpperCase","matchAll","search","concat","padEnd","charAt","charCodeAt","catch","finally","valueOf","apply","call","bind","setTimeout","setInterval","clearTimeout","clearInterval","addEventListener","removeEventListener","dispatchEvent","preventDefault","stopPropagation","fetch",
    "assign","create","defineProperty","freeze","seal","is","all","race","any","allSettled","resolve","reject","fromEntries","ownKeys","getOwnPropertyDescriptor","getOwnPropertyDescriptors","getPrototypeOf","setPrototypeOf","isExtensible","preventExtensions",
    "E","LN10","LN2","LOG10E","LOG2E","PI","SQRT1_2","SQRT2",
    "toReversed","toSorted","toSpliced","with",
    "anchor","big","blink","bold","fixed","fontcolor","fontsize","italics","link","small","strike","sub","sup",
    "clz32","imul","sign","log10","log2","log1p","expm1","cosh","sinh","tanh","acosh","asinh","atanh","hypot","trunc","fround","cbrt",
    "getUint8","setUint8","getInt8","setInt8","getUint16","setUint16","getInt16","setInt16","getUint32","setUint32","getInt32","setInt32","getFloat32","setFloat32","getFloat64","setFloat64","getBigInt64","setBigInt64","getBigUint64","setBigUint64",
    "deref","register","unregister","supportedLocalesOf","compare","format","formatToParts","resolvedOptions","select","pluralRule","v3",
    "load","polyfill","isLockFree","wait","notify","waitAsync",
    "codePointAt","normalize","trimStart","trimEnd","trimLeft","trimRight","isPrototypeOf","propertyIsEnumerable","toLocaleString","toSource","toPrecision","toExponential",
    "Instant","Duration","PlainDate","PlainTime","PlainDateTime","ZonedDateTime","Calendar","TimeZone",
    "until","since","round","equals","withPlainDate","withPlainTime",
    "year","month","day","hour","minute","second","millisecond","microsecond","nanosecond",
    "languageModel","capabilities","availability","prompt","promptStreaming","destroy","tokensLeft","maxTokens","tokensSoFar",
    "getYear","setYear","toGMTString","__proto__","__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__","compile","observe","unobserve","caller","callee",
    "useState","useEffect","useContext","useReducer","useCallback","useMemo","useRef","useLayoutEffect",
    "createRoot","render","hydrateRoot",
    "createApp","ref","reactive","computed","watch","watchEffect","onMounted","onUnmounted","onUpdated",
    "component","directive","mixin","provide","inject",
    "ajax","animate","css","html","text","val","on","off","trigger","attr","removeAttr","addClass","removeClass","toggleClass","find","closest","parent","children","siblings",
    "debounce","throttle","cloneDeep","merge","extend","pick","omit","uniq","flatten","delay","memoize",
    "of","fromEvent","combineLatest","forkJoin","switchMap","mergeMap","concatMap","catchError","pipe","observable"
  ]
};

function runHl(t) {
  let idx = 0, res = '', c1 = 0, c2 = 0, s = 0, sC = '', w = '';
  let lastChar = '';
  
  const flush = (isProperty = false) => {
    if (!w) return;
    let m = '';
    const found = Object.entries(K_HL).find(([cl, arr]) => arr.includes(w));
    if (found) m = found;

    const span = document.createElement("span");
    if (m) {
      span.className = m;
    } else if (isProperty) {
      span.className = "prop";
    } else if (/^\d+$/.test(w)) {
      span.style.color = "#b5cea8";
    }
    
    if (span.className || span.style.color) {
      span.textContent = w;
      res += span.outerHTML;
    } else {
      res += w;
    }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];
    if (c1) { res += c; if (c === '\n') { res += '</span>'; c1 = 0 } idx++; continue }
    if (c2) { res += c; if (c === '*' && t[idx + 1] === '/') { res += '/</span>'; c2 = 0; idx += 2 } else idx++; continue }
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0 } idx++; continue;
    }
    if (c === '/' && t[idx + 1] === '/') { flush(); res += '<span class="c">//'; c1 = 1; idx += 2; continue }
    if (c === '/' && t[idx + 1] === '*') { flush(); res += '<span class="c">/*'; c2 = 1; idx += 2; continue }
    if (c === "'" || c === '"' || c === '`') { flush(); sC = c; res += `<span class="str">${c}`; s = 1; idx++; continue }
    
    // 💡【ジェネレーター対応】単語判定の正規表現から「*」を排除！これにより、function と * が別々に切り出されます
    if (/[a-zA-Z0-9_]/.test(c)) { 
      w += c; 
    } else {
      if (w && c === '(') {
        let m = '';
        const found = Object.entries(K_HL).find(([cl, arr]) => arr.includes(w));
        if (found) m = found;
        
        const span = document.createElement("span");
        span.className = m ? m : "fn";
        span.textContent = w;
        res += span.outerHTML;
        w = '';
      } else if (w && c === ':') {
        flush(true);
      } else {
        flush(lastChar === '.');
      }
      
      if (c.trim() !== '') lastChar = c;

      if (c === '{' || c === '}') {
        const span = document.createElement("span");
        span.className = "br1";
        span.textContent = c;
        res += span.outerHTML;
      } else if (c === '[' || c === ']') {
        const span = document.createElement("span");
        span.className = "br3";
        span.textContent = c;
        res += span.outerHTML;
      } else if (c === '(' || c === ')') {
        const span = document.createElement("span");
        span.className = "br2";
        span.textContent = c;
        res += span.outerHTML;
      } else if (c === '=' && t[idx + 1] === '>') {
        const span = document.createElement("span");
        span.className = "a";
        span.textContent = "=>";
        res += span.outerHTML;
        idx++;
      } else if (c === '.' && t[idx + 1] === '.' && t[idx + 2] === '.') {
        const span = document.createElement("span");
        span.className = "o";
        span.textContent = "...";
        res += span.outerHTML;
        idx += 2;
      } 
      // 💡【ジェネレーター対応】単体で出現した「*」をピンポイントで検知して、赤（専用クラス g-star）で出力！
      else if (c === '*') {
        const span = document.createElement("span");
        span.className = "g-star";
        span.textContent = "*";
        res += span.outerHTML;
      }
      else if (['+', '-', '/', '=', '!', '<', '>', '?', '%', ':', '.'].includes(c)) {
        const span = document.createElement("span");
        span.className = "o";
        span.textContent = c;
        res += span.outerHTML;
      } else {
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    } idx++;
  } 
  flush(lastChar === '.'); 
  return res;
}

export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    line.innerHTML = runHl(plainText).replace(/\t/g, "|");
  });
}
