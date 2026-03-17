/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle pdfjs-dist worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs-dist/build/pdf.worker.mjs',
    };

    // Prevent canvas from being bundled on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }

    // Mark pdfjs-dist as external on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    return config;
  },
};

export default nextConfig;