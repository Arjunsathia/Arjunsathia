import { defineConfig } from 'vite';

// The site's own code and its libraries ship as separate files: libraries change rarely, so browsers keep them cached
// across site updates, and no single file passes Vite's 500 kB warning. (three.js stays in the lazily loaded card.)
const VENDOR_CHUNKS = {
  react: ['react', 'react-dom', 'scheduler'],
  motion: ['motion', 'framer-motion', 'motion-dom', 'motion-utils'],
  gsap: ['gsap'],
};

export default defineConfig({
  build: {
    // The one large file is three.js inside the 3D hero card (~580 kB, ~150 kB gzipped). It loads only after the page
    // is up and can't be split further, so the warning limit sits just above it.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      // Libraries marked "use client" (for frameworks like Next.js) trigger a harmless notice in a plain Vite build.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some(name => id.includes(`/node_modules/${name}/`))) return chunk;
          }
          return undefined;
        },
      },
    },
  },
});
