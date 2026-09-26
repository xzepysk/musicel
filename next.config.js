const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.mzstatic.com" },
      { protocol: "https", hostname: "**" }
    ]
  }
};

module.exports = nextConfig;
