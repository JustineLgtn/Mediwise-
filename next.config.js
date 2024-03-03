/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "cloudflare-ipfs.com",
      "flowbite.com",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
    ],
  },
};

// module.exports = nextConfig;
module.exports = nextConfig;
