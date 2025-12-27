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
                category: 'pages/category.html',
                about: 'pages/about.html',
                admin: 'pages/admin.html',
                terms: 'pages/terms.html',
                privacy: 'pages/privacy.html',
                help: 'pages/help.html',
                contact: 'pages/contact.html',
                orders: 'pages/orders.html',
            },
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
