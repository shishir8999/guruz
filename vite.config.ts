import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

const appTsx = path.resolve(__dirname, 'resources/js/app.tsx');
const appCss = path.resolve(__dirname, 'resources/css/app.css');

export default defineConfig({
    plugins: [
        laravel({
            input: [appCss, appTsx],
            refresh: true,
        }),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/*.zip', '**/storage/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        emptyOutDir: false,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('sweetalert2')) {
                            return 'vendor-swal';
                        }
                        return 'vendor-core';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1200,
    },
});
