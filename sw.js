// F69's IDE - Custom Service Worker (Ultimate Full-Offline Version v13.1)
const CACHE_NAME = 'f69s-ide-full-cache-v13.1';

// サービスワーカーの配置場所から、GitHub Pagesのサブディレクトリ（例: /FIDE-F69s-IDE/）を自動算出
const BASE_PATH = new URL('./', self.location).pathname;

// キャッシュするアセットリスト
const ASSETS_TO_CACHE_RELATIVE = [
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

// 1. インストール時（通信エラー・セキュリティブロックの徹底回避構造）
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[PWA] Optimizing single-stream assets...');
            
            // 💡【ハック】空文字（ルートパス）の代わりに、明示的に index.html をベースキャッシュに登録
            try {
                await cache.add(new URL('index.html', self.location).href);
            } catch(e) {
                console.warn('[PWA] Root index cache fallback');
            }

            for (const assetUrl of ASSETS_TO_CACHE) {
                try {
                    // 💡 リダイレクトによるエラーを回避するため、モードを 'cors' や 'no-cors' に依存しない安全なキャッシュ戦略に変更
                    const response = await fetch(assetUrl, { 
                        method: 'GET',
                        cache: 'reload' // 常に最新のサーバーデータを強制取得
                    });
                    
                    if (response.ok || response.type === 'opaque') {
                        await cache.put(assetUrl, response);
                        console.log(`[PWA] Success: ${new URL(assetUrl).pathname}`);
                    } else {
                        throw new Error(`Status: ${response.status}`);
                    }
                } catch (err) {
                    console.error(`[PWA] Failed to cache: ${assetUrl}`, err);
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

// 3. フェッチ時
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) return;

    let requestUrl = new URL(event.request.url);

    // ルートディレクトリへのアクセスを index.html にスマートにマッピング
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
