/** @type {import('next').NextConfig} */

// The Spring Boot backend (see cloud-ims repo, SecurityConfig.java) has no
// CorsConfigurationSource bean, so a browser calling it directly from a
// different origin with a session cookie will be blocked by CORS. Rather
// than requiring a backend change, every request from this app to /api/*
// is proxied server-side to the real backend. The browser only ever talks
// to this app's own origin, so it's same-origin from the browser's point
// of view and the session cookie round-trips normally.
const BACKEND_URL = process.env.BACKEND_URL || 'http://16.170.244.112:8080';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
