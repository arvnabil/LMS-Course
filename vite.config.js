import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@/': path.resolve(__dirname, './resources/js/'),
            '@dnd-kit/core': path.resolve(__dirname, './node_modules/@dnd-kit/core'),
            '@dnd-kit/sortable': path.resolve(__dirname, './node_modules/@dnd-kit/sortable'),
            '@dnd-kit/utilities': path.resolve(__dirname, './node_modules/@dnd-kit/utilities'),
            '@dnd-kit/modifiers': path.resolve(__dirname, './node_modules/@dnd-kit/modifiers'),
            'react-is': path.resolve(__dirname, './node_modules/react-is'),
        },
    },
    optimizeDeps: {
        include: [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
            '@dnd-kit/modifiers'
        ],
    },
    build: {
        commonjsOptions: {
            include: [/@dnd-kit/, /node_modules/],
        },
    },
    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
    },
});
