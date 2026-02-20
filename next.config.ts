import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build for Docker (copies only needed node_modules)
  output: "standalone",

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // XSS protection (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow inline styles for Tailwind/Next.js + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Allow inline scripts for anti-FOUC + Next.js
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Google Fonts + data URIs for inline assets
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images from self, data URIs, and blobs
              "img-src 'self' data: blob: https://images.pexels.com",
              // API calls to self only
              "connect-src 'self'",
              // Prevent embedding in frames
              "frame-ancestors 'none'",
              // Restrict form targets
              "form-action 'self'",
              // Base URI restriction
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Stricter headers for API routes
        source: "/api/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
