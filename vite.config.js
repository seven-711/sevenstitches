import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
    plugins: [
        checker({
            typescript: true,
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                shop: 'pages/shop.html',
                product: 'pages/product.html',
                cart: 'pages/cart.html',
                checkout: 'pages/checkout.html',
                tracking: 'pages/tracking.html',
            },
        },
    },
});
