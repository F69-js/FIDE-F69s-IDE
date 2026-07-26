// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v11)
const CACHE_NAME = 'f69s-ide-full-cache-v11';

// サービスワーカーの配置場所から、GitHub Pagesのサブディレクトリ（例: /FIDE-F69s-IDE/）を自動算出
const BASE_PATH = new URL('./', self.location).pathname;

// キャッシュするアセットは重複を完璧に排除したミニマルリスト
const ASSETS_TO_CACHE_RELATIVE = [
    '', // トップページ (index.html用)
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

// 厳密なキャッシュ用の完全URLリストを動的生成
const ASSETS_TO_CACHE = ASSETS_TO_CACHE_RELATIVE.map(asset => {
    return new URL(asset, self.location).href;
});

// 1. インストール時
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[PWA] Optimizing single-stream assets...');
            for (const assetUrl of ASSETS_TO_CACHE) {
                try {
                    const response = await fetch(assetUrl, { redirect: 'follow' });
                    if (response.ok) {
                        await cache.put(assetUrl, response);
                    }
                } catch (err) {
                    console.warn(`[PWA] Skipping asset: ${assetUrl}`);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

// 2. アクティベート時
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

// 3. 【究極融合】フェッチコントロール
// ★お待たせしました！あなたの見抜いた魔術「'u' > typeof self」を完璧にここに復活！
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        // 同一オリジンのリクエストのみを対象にする
        if (!event.request.url.startsWith(self.location.origin)) return;

        let requestUrl = new URL(event.request.url);

        // ルートアクセス（例: /FIDE-F69s-IDE/ または /FIDE-F69s-IDE）の場合の index.html フォールバック処理
        if (requestUrl.pathname === BASE_PATH || requestUrl.pathname === BASE_PATH.slice(0, -1)) {
            requestUrl.pathname = BASE_PATH + 'index.html';
        }

        event.respondWith(
            caches.match(requestUrl.href).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // キャッシュになければネットワークへ
                return fetch(event.request).catch(() => {
                    // オフラインかつHTMLリクエストの場合はindex.htmlを返す（SPA用安全ネット）
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match(new URL('index.html', self.location).href);
                    }
                });
            })
        );
    });
}
