import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode pour le développement
  reactStrictMode: true,
  
  // Optimisations de performance
  swcMinify: true,
  
  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          }
        ]
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0"
          }
        ]
      }
    ];
  },

  // Configuration de la compression
  compress: true,

  // Configuration des redirections
  async redirects() {
    return [
      {
        source: "/callback",
        destination: "/api/auth/callback",
        permanent: true
      }
    ];
  },

  // Configuration du build
  poweredByHeader: false,
  
  // Optimisation des images (si nécessaire dans le futur)
  images: {
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Variables d'environnement publiques
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString()
  }
};

export default nextConfig;
