// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version)
const CACHE_NAME = 'f69s-ide-full-cache-v2';

// あなたが完全に掌握し、仕分けたコア資産のリスト（不要なREADMEは非推奨として除外）
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './images/favicon.ico',
    './styles/main.css',
    './scripts/index.js',
    './scripts/fjalu/index.js',
    './scripts/fjalu/emoji.js',
    './scripts/langs/i18n.js',
    './scripts/linter/tide.js'
];

// 1. インストール時に、全コア資産をブラウザの金庫（Cache）に爆速で強制保存
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[PWA] Core assets successfully cached for offline use.');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. アクティベート時に古いキャッシュがあれば綺麗にお掃除（デグレ防止）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[PWA] Outdated cache cleared.');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. 【実務仕様】'u' > typeof self の魔術を添えたフェッチコントロール
//    ネットがある時は最新、オフライン時はキャッシュ、壊れた時はあなたの作った究極にミニマルな offline.html を叩き出す！
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // キャッシュがあればそれを返し、無ければネットワーク（最新）を取得
                return cachedResponse || fetch(event.request).catch(() => {
                    // ネットが死んでいて、かつページ移動（ナビゲーション）だった場合の絶対安全ガード
                    if (event.request.mode === 'navigate') {
                        return caches.match('./') || caches.match('./index.html') || caches.match('./offline.html');
                    }
                });
            })
        );
    });
}
