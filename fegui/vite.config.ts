import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ASSET_URL = process.env.ASSET_URL || '';

export default defineConfig(() => {
  return {
    base: `${ASSET_URL}`,
    build: {
      // assetsInlineLimit: 0, <- had hoped to mimic INLINE_RUNTIME_CHUNK=false (https://create-react-app.dev/docs/advanced-configuration/)
      outDir: 'build',
    },
    plugins: [react()],
    server: {
      proxy: {
        // string shorthand: http://localhost:5173/iapi -> http://localhost:9000/iapi
        '/iapi': 'http://localhost:9000',
      },
    },  };
});
