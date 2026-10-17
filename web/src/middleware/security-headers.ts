import { secureHeaders } from "hono/secure-headers";

// 全レスポンスにセキュリティ系ヘッダーを付ける（Cloudflare 経由でも素通しで届く）。
// - frame-ancestors 'none' / X-Frame-Options: ログイン・OAuth 同意画面のクリックジャッキング防止。
//   アプリ内で自サイトを iframe 表示する箇所は無い。
// - CSP は frame-ancestors だけにする。RSC はインラインスクリプトを出すため script-src を
//   絞るには nonce 対応が要り、ここでは扱わない。
// - COOP は付けない。claude.ai の OAuth ポップアップは window.opener 経由で完了を伝えるため、
//   same-origin だと接続フローが切れる。
export default () =>
  secureHeaders({
    contentSecurityPolicy: { frameAncestors: ["'none'"] },
    xFrameOptions: "DENY",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    referrerPolicy: "strict-origin-when-cross-origin",
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  });
