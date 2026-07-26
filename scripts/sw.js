function noop() {}
if ('u' > typeof self && self.addEventListener) {
    self.addEventListener('fetch', noop);
}
