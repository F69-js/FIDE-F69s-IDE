import { ReplaceEmoji } from "./emoji.js"; 

const noop = () => { };

(function (glThis) {
    // 1. 内部設定とプログレスバー連動ロジックをJS内に内蔵
    let config = { 
        number: "big",
        onDownloadProgress: (loaded, total, percent) => {
            // 💡 js内に直込みされた、div#errorへのプログレスバー動的マウント処理
            const errorContainer = document.getElementById("error");
            if (!errorContainer) return;

            let progressBar = errorContainer.querySelector("progress");
            let statusText = errorContainer.querySelector(".progress-text");

            if (!progressBar) {
                errorContainer.innerHTML = ""; // 既存の内容をクリア

                statusText = document.createElement("span");
                statusText.className = "progress-text";
                statusText.style.display = "block";
                statusText.style.marginBottom = "5px";
                statusText.style.fontWeight = "bold";

                progressBar = document.createElement("progress");
                progressBar.max = 100;
                progressBar.style.width = "100%";
                progressBar.style.height = "10px";

                errorContainer.appendChild(statusText);
                errorContainer.appendChild(progressBar);
            }

            progressBar.value = percent;
            statusText.innerText = `翻訳モデルをダウンロード中... ${percent}%`;

            // 100%完了したら自動でコンテナを綺麗に片付ける
            if (percent >= 100) {
                setTimeout(() => {
                    errorContainer.innerHTML = "";
                }, 1000);
            }
        }
    };
    
    const JP_RE = /[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]/gu;

    function isJapanese(...e) {
        return e.map(t => !JP_RE.test(t));
    }

    // =========================================================
    // 🌐 2. Chrome標準 window.Translator による自動日本語化
    // =========================================================
async function processAndTranslateToJapanese(inputText, config = {}) {
    if (!inputText || !inputText.trim()) return inputText;

    try {
        // 1. Language Detector が利用可能か確認
        if (globalThis.LanguageDetector && typeof globalThis.LanguageDetector.create === 'function') {
            const detector = await globalThis.LanguageDetector.create();
            const results = await detector.detect(inputText);
            
            // 最も確率の高い言語を取得
            const detectedLanguage = results[0]?.detectedLanguage;

            // 入力が英語（en）ではない場合、翻訳をスキップして直接ローマ字変換へ
            if (detectedLanguage !== 'en') {
                return RomajiToJapanese(inputText);
            }
        }

        // 2. 英語と判定された場合のみ、Translator を作成して翻訳
        if (globalThis.Translator && typeof globalThis.Translator.create === 'function') {
            const translator = await globalThis.Translator.create({
                sourceLanguage: "en", // 英語から
                targetLanguage: "ja", // 日本語へ
                monitor(m) {
                    m.addEventListener("downloadprogress", (e) => {
                        const loaded = e.loaded;
                        const total = e.total;
                        const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
                        
                        if (typeof config.onDownloadProgress === 'function') {
                            config.onDownloadProgress(loaded, total, percent);
                        }
                    });
                }
            });

            if (translator && typeof translator.translate === 'function') {
                // 英語を日本語に翻訳した結果をそのまま返す（RomajiToJapaneseは不要）
                return await translator.translate(inputText);
            }
        }
    } catch (error) {
        console.warn("LanguageDetector/Translator準備中、または利用不可。ローカル置換で並行処理します。");
    }
    
    // どちらも使えない、または判定に失敗した場合は安全にローマ字変換
    return RomajiToJapanese(inputText); 
}

    // =========================================================
    // ⚡ 3. ローマ字・かな変換コアロジック (重複バグ修正版)
    // =========================================================
const t = {
	a: {
		_: 12354
	},
	i: {
		_: 12356
	},
	u: {
		_: 12358
	},
	e: {
		_: 12360
	},
	o: {
		_: 12362
	},
	k: {
		a: 12363,
		i: 12365,
		u: 12367,
		e: 12369,
		o: 12371,
		y: {
			a: [12365, 12419],
			u: [12365, 12421],
			o: [12365, 12423]
		}
	},
	s: {
		a: 12373,
		i: 12375,
		u: 12377,
		e: 12379,
		o: 12381,
		y: {
			a: [12375, 12419],
			u: [12375, 12421],
			o: [12375, 12423]
		},
		h: {
			a: [12375, 12419],
			i: 12375,
			u: [12375, 12421],
			e: [12375, 12359],
			o: [12375, 12423]
		}
	},
	t: {
		a: 12383,
		i: 12385,
		u: 12388,
		e: 12390,
		o: 12392,
		y: {
			a: [12385, 12419],
			u: [12385, 12421],
			o: [12385, 12423]
		},
		s: {
			u: 12388
		},
		h: {
			a: [12390, 12417], // てゃ
			i: [12390, 12355], // てぃ
			u: [12390, 12357], // てゅ
			e: 12390,          // て（または12390, 12359で てぇ）
			o: [12390, 12418]  // てょ
		}
	},
	n: {
		a: 12394,
		i: 12395,
		u: 12396,
		e: 12397,
		o: 12398,
		n: 12435,
		y: {
			a: [12395, 12419],
			u: [12395, 12421],
			o: [12395, 12423],
			secret: "にょ(UwU)"
		}
	},
	h: {
		a: 12399,
		i: 12402,
		u: 12405,
		e: 12408,
		o: 12411,
		y: {
			a: [12402, 12419],
			u: [12402, 12421],
			o: [12402, 12423]
		}
	},
	m: {
		a: 12414,
		i: 12417,
		u: 12420,
		e: 12417,
		o: 12426,
		y: {
			a: [12417, 12419],
			u: [12417, 12421],
			o: [12417, 12423]
		}
	},
	y: {
		a: 12420,
		u: 12422,
		o: 12424
	},
	r: {
		a: 12425,
		i: 12426,
		u: 12427,
		e: 12428,
		o: 12429,
		y: {
			a: [12426, 12419],
			u: [12426, 12421],
			o: [12426, 12423]
		}
	},
	w: {
		a: 12431,
		o: 12434
	},
	g: {
		a: 12364,
		i: 12366,
		u: 12368,
		e: 12370,
		o: 12372,
		y: {
			a: [12366, 12419],
			u: [12366, 12421],
			o: [12366, 12423]
		}
	},
		f: {
		a: [12405, 12353], // ふぁ
		i: [12405, 12355], // ふぃ
		u: 12405,          // ふ
		e: [12405, 12359], // ふぇ
		o: [12405, 12361], // ふぉ
		y: {
			a: [12405, 12419], // ふゃ
			u: [12405, 12421], // ふゅ
			o: [12405, 12423]  // ふょ
		}
	},
	z: {
		a: 12374,
		i: 12376,
		u: 12378,
		e: 12380,
		o: 12382,
		y: {
			a: [12376, 12419],
			u: [12376, 12421],
			o: [12376, 12423]
		}
	},
	d: {
		a: 12384,
		i: 12386,
		u: 12391,
		e: 12391,
		o: 12393,
		y: {
			a: [12386, 12419],
			u: [12386, 12421],
			o: [12386, 12423]
		}
	},
	b: {
		a: 12400,
		i: 12403,
		u: 12406,
		e: 12409,
		o: 12412,
		y: {
			a: [12403, 12419],
			u: [12403, 12421],
			o: [12403, 12423]
		}
	},
	p: {
		a: 12401,
		i: 12404,
		u: 12407,
		e: 12410,
		o: 12413,
		y: {
			a: [12404, 12419],
			u: [12404, 12421],
			o: [12404, 12423]
		}
	},
	j: {
		a: [12376, 12419],
		i: 12376,
		u: [12376, 12421],
		e: 12359,
		o: [12376, 12423]
	},
	c: {
		a: 12363,
		i: 12375,
		u: 12367,
		e: 12375,
		o: 12363,
		h: {
			a: [12385, 12419],
			i: 12385,
			u: [12385, 12421],
			e: [12385, 12359],
			o: [12385, 12423]
		},
		y: {
			a: [12363, 12419],
			u: [12367, 12421],
			o: [12385, 12423]
		}
	},
	x: {
		a: 12353,
		i: 12355,
		u: 12357,
		e: 12359,
		o: 12361,
		t: {
			u: 12387
		},
		y: {
			a: 12418,
			u: 12420,
			o: 12422
		}
	},
	l: {
		a: 12353,
		i: 12355,
		u: 12357,
		e: 12359,
		o: 12361,
		t: {
			u: 12387
		},
		y: {
			a: 12418,
			u: 12420,
			o: 12422
		}
	},
	"-": 12540,
	".": 12290,
	",": 12289,
	"?": 65311,
	"\\": 65509
}


    function RomajiToJapanese(input, tree = t) {
        let result = "", i = 0;

        function walk(node, index) {
            let char = input[index]?.toLowerCase();
            if (!node || !char) return null;
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

            if (typeof nextNode === "object" && nextNode._ !== undefined) {
                return { res: String.fromCharCode(nextNode._), nextIdx: index + 1 };
            }

            return null;
        }

        while (i < input.length) {
            let char = input[i].toLowerCase();
            let next = input[i + 1]?.toLowerCase();

            if (next && char === next && !'aiueon'.includes(char) && tree[char]) {
                result += String.fromCharCode(12387);
                i++;
                continue;
            }

            if (char === 'n' && next !== 'n' && !'aiueoy'.includes(next || '')) {
                result += String.fromCharCode(12435);
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
            if (key === "_") {
                let str = String.fromCharCode(node._);
                reverseMap[str] = (reverseMap[str] ?? path);
                continue;
            }
            let val = node[key];
            if (typeof val === "number" || Array.isArray(val)) {
                let str = Array.isArray(val) ? String.fromCharCode(...val) : String.fromCharCode(val);
                reverseMap[str] = (reverseMap[str] ?? path + key);
            } else if (typeof val === "object" && val !== null) {
                buildMap(val, path + key);
            }
        }
    })(t);

    function JapaneseToRomaji(input) {
        let result = "";
        for (let i = 0; i < input.length; i++) {
            let char = input[i];
            let next = input[i + 1];

            if (char === "っ" && next) {
                let nextRomaji = reverseMap[next] || next;
                result += nextRomaji;
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

    // =========================================================
    // 🚀 4. 非同期エントリポイント
    // =========================================================
    async function translateAuto(...p) {
        if (p.length < 1) return;

        const processSingle = async (text) => {
            let preparedText = await processAndTranslateToJapanese(text);
            let emojiprocessed = ReplaceEmoji(preparedText);
            return RomajiToJapanese(emojiprocessed);
        };

        if (p.length === 1) {
            return await processSingle(p[0]); 
        } else {
            // 引数が複数の場合
            return await Promise.all(p.map(t => processSingle(t)));
        }
    }

    globalThis._fjala = translateAuto;
    globalThis._fjalu = {
        isJapanese: isJapanese,
        JapaneseToRomaji: JapaneseToRomaji,
        RomajiToJapanese: RomajiToJapanese,
        InternalTable: t
    };
})(globalThis);

let _jala = globalThis._fjala;
let _fjalu = globalThis._fjalu;
export { _jala, _fjalu };
