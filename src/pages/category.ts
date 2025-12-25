import '../style.css';
import '../components/header';
import { ProductService } from '../services/product.service';

// Ensure Header is defined
if (!customElements.get('app-header')) {
  import('../components/header').then(({ AppHeader }) => {
    if (!customElements.get('app-header')) {
      customElements.define('app-header', AppHeader);
    }
  });
}

const productGrid = document.getElementById('product-grid');
const categoryTitle = document.getElementById('category-title');

(async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryType = params.get('type');

  if (categoryTitle) {
    categoryTitle.textContent = categoryType ? `Shop ${categoryType}` : 'Shop All';
  }

  if (productGrid) {
    try {
      let products = [];

      if (categoryType) {
        products = await ProductService.getProductsByCategory(categoryType);
      } else {
        products = await ProductService.getProducts();
      }

      if (products.length === 0) {
        productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">No products found in this category.</p>';
        return;
      }

      productGrid.innerHTML = products.map(product => {
        const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : null;
        const imageStyle = imageSrc ? `background-image: url('${imageSrc}');` : '';
        const fallbackContent = !imageSrc ? `
                    <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                        <span class="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>` : '';

        return `
                <a href="/pages/product.html?id=${product.id}" class="group flex flex-col gap-3">
                  <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style="${imageStyle}">
                       ${fallbackContent}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                      <span class="bg-white text-black text-sm font-bold py-2 px-6 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-lg leading-tight group-hover:text-primary transition-colors">${product.name}</h3>
                      <span class="font-bold text-primary">$${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
                    </div>
                    <p class="text-sm text-gray-500">${(product as any).categories?.name || categoryType || 'Product'}</p>
                  </div>
                </a>
                `;
      }).join('');
    } catch (e) {
      console.error(e);
      productGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products.</p>';
    }
  }
})();
