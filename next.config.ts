import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'quickchart.io', 'api.satriawisata.com', 'api.keeanthebeartian.my.id'],
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

module.exports = withPWA({
  ...nextConfig
});