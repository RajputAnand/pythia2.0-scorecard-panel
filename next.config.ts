import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the Next.js dev server to serve JS/HMR assets when accessed through an
  // ngrok tunnel — without this, the dev server blocks the cross-origin request
  // for dev assets, the page never hydrates, and forms fall back to native
  // (unhandled) submission.
  allowedDevOrigins: ['*.ngrok-free.app'],
  async redirects() {
    return [
      {
        source: '/auth/reset-password',
        destination: '/reset-password',
        permanent: true,
      },
      {
        source: '/auth/forgot-password',
        destination: '/forgot-password',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
