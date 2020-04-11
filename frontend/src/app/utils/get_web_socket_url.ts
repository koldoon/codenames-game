export function getWebSocketUrl(path: string) {
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    return proto + window.location.host + path;
}
