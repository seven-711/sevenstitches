import '../style.css';
import '../components/header';
import { ProductService } from '../services/product.service';
import { ReviewService } from '../services/review.service';
import { CategoryService } from '../services/category.service';


// Ensure Header is defined
if (!customElements.get('app-header')) {
  import('../components/header').then(({ AppHeader }) => {
    if (!customElements.get('app-header')) {
      customElements.define('app-header', AppHeader);
    }
  });
}

const productGrid = document.getElementById('product-grid');

(async () => {
  if (productGrid) {
    try {
      const products = await ProductService.getProducts();

      // Filter by Search Query
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('search')?.toLowerCase().trim();

      let filteredProducts = products;

      if (searchQuery) {
        filteredProducts = products.filter((p: any) =>
          p.name.toLowerCase().includes(searchQuery) ||
          (p.description && p.description.toLowerCase().includes(searchQuery)) ||
          (p.categories && p.categories.name.toLowerCase().includes(searchQuery))
        );

        // Show search header
        const header = document.createElement('div');
        header.className = 'col-span-full mb-4';
        header.innerHTML = `
            <h2 class="text-xl font-bold">Search results for "${urlParams.get('search')}"</h2>
            <p class="text-text-muted text-sm">${filteredProducts.length} result(s) found</p>
          `;
        productGrid.parentElement?.insertBefore(header, productGrid);
      }

      const stockFilter = document.getElementById('stock-filter') as HTMLSelectElement;
      const categoryFilters = document.getElementById('category-filters');
      let selectedCategoryId: string | null = null;

      // Load Categories
      try {
        const categories = await CategoryService.getCategories();
        if (categoryFilters) {
          categoryFilters.innerHTML = `
                <button data-id="all" class="category-btn px-4 py-2 rounded-full text-sm font-medium bg-black text-white dark:bg-white dark:text-black transition-all shadow-md">All</button>
                ${categories.map((cat: any) => `
                    <button data-id="${cat.id}" class="category-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                        ${cat.name}
                    </button>
                `).join('')}
              `;

          // Event Delegation
          categoryFilters.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.category-btn');
            if (target) {
              const id = target.getAttribute('data-id');
              selectedCategoryId = id === 'all' ? null : id;

              // Update UI
              document.querySelectorAll('.category-btn').forEach(btn => {
                const isSelected = (btn.getAttribute('data-id') === 'all' && !selectedCategoryId) || btn.getAttribute('data-id') === selectedCategoryId;
                if (isSelected) {
                  btn.className = 'category-btn px-4 py-2 rounded-full text-sm font-bold bg-black text-white dark:bg-white dark:text-black transition-all shadow-md transform scale-105';
                } else {
                  btn.className = 'category-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all';
                }
              });

              applyFilters();
            }
          });
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }

      // Reusable Render Function
      const renderProducts = async (productsToRender: any[]) => {
        if (productsToRender.length === 0) {
          productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">
                ${selectedCategoryId ? 'No products in this category.' : (searchQuery ? `No products found matching "${urlParams.get('search')}"` : 'No products available.')}
            </p>`;
          return;
        }

        // Fetch ratings for filtered products
        const productsWithRatings = await Promise.all(productsToRender.map(async (product: any) => {
          const ratingData = await ReviewService.getProductRating(product.id);
          return { ...product, rating: ratingData };
        }));

        productGrid.innerHTML = productsWithRatings.map((product: any) => {
          const imageSrc = product.images?.[0] || null;
          const imageStyle = imageSrc ? `background-image: url('${imageSrc}');` : '';
          const fallbackContent = !imageSrc ? `
                        <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                            <span class="material-symbols-outlined text-4xl">inventory_2</span>
                        </div>` : '';

          // Rating Stars
          const avg = product.rating.average || 0;
          const count = product.rating.count || 0;
          const fullStars = Math.floor(avg);
          const hasHalfStar = avg % 1 >= 0.5;

          let starsHTML = '';
          for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
              starsHTML += '<span class="material-symbols-outlined text-yellow-400 text-[16px] md:text-[18px] leading-none" style="font-variation-settings: \'FILL\' 1, \'wght\' 400, \'GRAD\' 0, \'opsz\' 20;">star</span>';
            } else if (i === fullStars + 1 && hasHalfStar) {
              starsHTML += '<span class="material-symbols-outlined text-yellow-400 text-[16px] md:text-[18px] leading-none" style="font-variation-settings: \'FILL\' 1, \'wght\' 400, \'GRAD\' 0, \'opsz\' 20;">star_half</span>';
            } else {
              starsHTML += '<span class="material-symbols-outlined text-gray-300 text-[16px] md:text-[18px] leading-none" style="font-variation-settings: \'FILL\' 0, \'wght\' 400, \'GRAD\' 0, \'opsz\' 20;">star</span>';
            }
          }

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
                          <span class="font-bold text-primary">₱${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
                        </div>
                        
                        <!-- Ratings & Stats -->
                        <div class="flex items-center gap-1">
                            <div class="flex items-center">${starsHTML}</div>
                            <span class="text-xs text-gray-500 ml-1">(${count})</span>
                        </div>
    
                        <div class="flex justify-between items-center text-sm text-gray-500 mt-1">
                          <span>${(product as any).categories?.name || 'Product'}</span>
                          <span class="${(product.inventory_count || 0) < 5 ? 'text-red-500 font-medium' : ''}">${product.inventory_count || 0} in stock</span>
                        </div> 
                      </div>
                    </a>
                    `;
        }).join('');
      };

      // Apply Filters Function
      const applyFilters = () => {
        let result = [...filteredProducts]; // Start with search-filtered results

        // 1. Stock Filter
        if (stockFilter) {
          const status = stockFilter.value;
          if (status === 'in_stock') {
            result = result.filter((p: any) => (p.inventory_count || 0) > 0);
          } else if (status === 'out_of_stock') {
            result = result.filter((p: any) => (p.inventory_count || 0) === 0);
          }
        }

        // 2. Category Filter
        if (selectedCategoryId) {
          result = result.filter((p: any) => p.category_id === selectedCategoryId);
        }

        renderProducts(result);
      };

      // Initial Render
      applyFilters();

      // Listen for changes
      if (stockFilter) {
        stockFilter.addEventListener('change', applyFilters);
      }

    } catch (e) {
      console.error(e);
      productGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products.</p>';
    }
  }
})();
