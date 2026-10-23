import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // Next injects inline bootstrap scripts; the hero boot script is inline too.
  `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "font-src 'self' data:",
  "frame-src https://www.youtube-nocookie.com",
  `connect-src 'self'${isProd ? "" : " ws: wss:"}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/register/student", destination: "/register/candidate", permanent: true },
      { source: "/for-companies", destination: "/for-recruiters", permanent: true },
      { source: "/industries/finance", destination: "/industries/finance-accounting", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
