// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v14)
const CACHE_NAME = 'f69s-ide-full-cache-v14';

// サービスワーカーの配置場所から、GitHub Pagesのサブディレクトリ（例: /FIDE-F69s-IDE/）を自動算出
const BASE_PATH = new URL('./', self.location).pathname;

// キャッシュするアセットリストに新しいhighlighter.jsを追加
const ASSETS_TO_CACHE_RELATIVE = [
    '',
    'index.html',
    'manifest.json',
    'images/favicon.ico',
    'styles/main.css',
    'scripts/index.js',
    'scripts/highlighter.js',
    'scripts/fjalu/index.js',
    'scripts/fjalu/emoji.js',
    'scripts/langs/i18n.js',
    'scripts/linter/tide.js'
];

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

// 3. フェッチ時（違法リターンを綺麗に削除済み）
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) return;

    let requestUrl = new URL(event.request.url);

    if (requestUrl.pathname === BASE_PATH || requestUrl.pathname === BASE_PATH.slice(0, -1)) {
        requestUrl.pathname = BASE_PATH + 'index.html';
    }

    event.respondWith(
        caches.match(requestUrl.href).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match(new URL('index.html', self.location).href);
                }
            });
        })
    );
});
