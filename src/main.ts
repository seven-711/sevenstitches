import './style.css';
import { AppHeader } from './components/header';

customElements.define('app-header', AppHeader);

import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';

console.log('Crochet Corner is live!');

async function loadCategories() {
    const container = document.getElementById('landing-categories-container');
    if (!container) return;

    try {
        const categories = await CategoryService.getCategories();

        if (categories.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No categories found.</div>';
            return;
        }

        // Fetch random product image for each category
        const categoriesWithImages = await Promise.all(categories.map(async (cat) => {
            let imageUrl = null;
            try {
                const products = await ProductService.getProductsByCategory(cat.name);
                if (products.length > 0) {
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    imageUrl = (randomProduct.images && randomProduct.images.length > 0) ? randomProduct.images[0] : null;
                }
            } catch (err) {
                console.warn(`Could not fetch product for category ${cat.name}`, err);
            }
            return { ...cat, imageUrl };
        }));

        container.innerHTML = categoriesWithImages.map(cat => `
         <a class="group flex flex-col gap-4 p-6 rounded-[2rem] bg-white dark:bg-[#2a201a] border border-[#e2e8f0] dark:border-[#1e293b] hover:border-primary/50 hover:shadow-lg transition-all text-center items-center"
            href="/pages/category.html?type=${cat.name}">
            <div class="size-24 rounded-full bg-[#f8fafc] dark:bg-[#1e293b] overflow-hidden mb-2 group-hover:scale-110 transition-transform duration-300">
                ${cat.imageUrl ? `
                    <div class="w-full h-full bg-cover bg-center" style="background-image: url('${cat.imageUrl}');"></div>
                ` : `
                    <div class="w-full h-full bg-cover bg-center flex items-center justify-center bg-primary/10 text-primary">
                        <span class="material-symbols-outlined text-4xl">category</span>
                    </div>
                `}
            </div>
            <div>
                <h2 class="text-lg font-bold leading-tight">${cat.name}</h2>
                <span class="text-xs text-gray-500 mt-1 block">${cat.description || 'Explore Collection'}</span>
            </div>
        </a>
        `).join('');

    } catch (error) {
        console.error('Failed to load categories:', error);
        container.innerHTML = '<div class="col-span-full text-center py-10 text-red-500">Failed to load categories.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadCategories);
