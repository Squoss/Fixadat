import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      assetsDir: 'vrassets',
      // assetsInlineLimit: 0, <- had hoped to mimic INLINE_RUNTIME_CHUNK=false (https://create-react-app.dev/docs/advanced-configuration/)
      outDir: 'build',
    },
    plugins: [react()],
    server: {
      proxy: {
        // string shorthand: http://localhost:5173/iapi -> http://localhost:9000/iapi
        '/iapi': 'http://localhost:9000',
      },
    },
    experimental: {
      // https://vitejs.dev/guide/build.html#advanced-base-options
      renderBuiltUrl(filename: string, { hostId, hostType, type }: { hostId: string, hostType: 'js' | 'css' | 'html', type: 'public' | 'asset' }) {
        if (type === 'asset' || type === 'public') {
          return 'fegui/' + filename
        }
      }
    }
  };
});
