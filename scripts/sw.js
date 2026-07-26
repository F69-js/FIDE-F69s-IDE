// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v10)
const CACHE_NAME = 'f69s-ide-full-cache-v10'; // バージョンをv10にアップ

// 【重複ゼロ】他社AIの美学を完璧に守り抜いた、純白のミニマルリスト
const ASSETS_TO_CACHE = [
    'index.html',
    'manifest.json',
    'images/favicon.ico',
    'styles/main.css',
    'scripts/index.js',
    'scripts/fjalu/index.js',
    'scripts/fjalu/emoji.js',
    'scripts/langs/i18n.js',
    'scripts/linter/tide.js'
];

// 1. インストール時（重複がないので、ネットワーク負荷も容量もこれまでの半分で済みます！）
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[PWA] Optimizing single-stream assets...');
            for (const url of ASSETS_TO_CACHE) {
                try {
                    const response = await fetch(url, { redirect: 'follow' });
                    if (response.ok) await cache.put(url, response);
                } catch (err) {
                    console.warn(`[PWA] Skipping asset: ${url}`);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

// 2. アクティベート時（変更なし）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. 【究極の脳内URLマッピング】フェッチコントロール
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        // 現在のURL（リクエスト）を取得
        const urlObj = new URL(event.request.url);
        
        // GitHub Pagesのサブフォルダ（/FIDE-F69s-IDE/）より後ろの「純粋なファイルパス」だけを切り出す！
        // 例: ".../FIDE-F69s-IDE/scripts/index.js" ➡️ "scripts/index.js"
        // 例: ".../FIDE-F69s-IDE/" (リロード時) ➡️ "" (空文字)
        let relativePath = urlObj.pathname.split('/FIDE-F69s-IDE/')[1] || '';

        // もしリロード（末尾スラッシュ＝空文字）だったら、脳内で "index.html" に変換する
        if (relativePath === '') {
            relativePath = 'index.html';
        }

        event.respondWith(
            // ブラウザが「ドットあり」で欲しがろうが、リロードで「スラッシュだけ」で来ようが、
            // 脳内で綺麗に整形した「純粋なファイル名（relativeText）」で金庫（Cache）を一発検索！
            caches.match(relativePath).then((cachedResponse) => {
                // 金庫にあればそれを即座に返し、無ければネットワーク（最新）へ
                return cachedResponse || fetch(event.request);
            })
        );
    });
}
