# GTV Player

A simple responsive IPTV web player for M3U playlists. The default playlist URL is the one shown in the provided image:

`http://192.168.1.7:5350/playlist.m3u`

## Features

- M3U/M3U8 playlist loading from a URL
- Local `.m3u` / `.m3u8` file import
- Channel search
- Group filtering
- Favorites stored in browser local storage
- HLS playback with hls.js
- Responsive desktop/mobile layout

## GitHub Pages

1. Create a GitHub repository, for example `gtv-iptv-player`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md`.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`.
4. Open the generated GitHub Pages URL.

### Important: LAN playlist

The supplied address uses a private LAN IP (`192.168.1.7`). A GitHub Pages site is hosted on the public internet, so the browser must still be able to reach that private address from the device running the player. Your IPTV server also needs to permit cross-origin browser requests (CORS).

If the playlist server does not support CORS, use **Open M3U** to load a downloaded playlist file instead, or configure the IPTV server/proxy to allow the web app origin.

## Browser compatibility

HLS is handled with hls.js where needed. Direct streams only work when the browser supports the stream's media format. MPEG-TS over a raw HTTP URL is not universally playable in browsers.
