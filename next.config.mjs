// Site estático (next export) para o GitHub Pages.
// BASE_PATH = "/<nome-do-repositório>" é definido pelo workflow de deploy.
const basePath = process.env.BASE_PATH ?? '/handmodel';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath === '/' ? '' : basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath === '/' ? '' : basePath },
  experimental: { optimizePackageImports: ['@astryxdesign/core'], globalNotFound: true },
};

export default nextConfig;
