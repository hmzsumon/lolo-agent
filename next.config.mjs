// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // ── keep your Sass & rewrites ──────────────────────────────
  sassOptions: {
    additionalData: `$var: red;`,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://api.5-223-77-39.nip.io/api/v1/:path*",
      },
    ];
  },

  // ── enable SVGR so .svg can be imported as React components ─
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
            svgo: true,
            svgoConfig: {
              plugins: [
                // remove hard-coded fill/stroke so color can be controlled via CSS currentColor
                { name: "removeAttrs", params: { attrs: "(fill|stroke)" } },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
