
import '../style.css';
import '../components/header';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';
import { ReviewService } from '../services/review.service';

// Ensure Header is defined
if (!customElements.get('app-header')) {
    import('../components/header').then(({ AppHeader }) => {
        if (!customElements.get('app-header')) {
            customElements.define('app-header', AppHeader);
        }
    });
}

// DOM elements are now selected inside renderFavorites to ensure they exist

// Debug helper
// Debug helper
const debugContainer = document.createElement('div');
debugContainer.className = 'fixed bottom-0 left-0 w-full max-h-40 overflow-auto bg-black/80 text-green-400 text-xs font-mono p-2 z-[9999]';
// document.body.appendChild(debugContainer);

const log = (msg: string) => {
    console.log(msg);
    const line = document.createElement('div');
    line.textContent = `[Current]: ${msg}`;
    // debugContainer.appendChild(line);
};

// Render Function (Reused from Shop with small mods)
const renderFavorites = async () => {
    // Select elements dynamically
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-state');
    const countHeader = document.getElementById('favorites-count-header');

    log('Starting renderFavorites...');

    // Safety check
    if (!favoritesGrid || !emptyState) {
        log('Error: Missing DOM elements favorites-grid or empty-state');
        if (document.readyState === 'loading') {
            log('DOM loading... retrying shortly');
            document.addEventListener('DOMContentLoaded', renderFavorites);
        }
        return;
    }

    try {
        await WishlistService.init();
        log('WishlistService initialized');
    } catch (e) {
        log(`Error initializing WishlistService: ${e}`);
    }

    const wishlistIds = WishlistService.getWishlist();
    log(`Wishlist IDs found: ${wishlistIds.length} (${wishlistIds.join(', ')})`);

    const showEmptyState = () => {
        log('Showing Empty State');
        favoritesGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        if (countHeader) countHeader.textContent = '0 items saved';
    };

    if (wishlistIds.length === 0) {
        showEmptyState();
        return;
    }

    // Fetch Products
    try {
        log('Fetching products from Supabase...');
        const products = await ProductService.getProductsByIds(wishlistIds);
        log(`Products fetched: ${products.length}`);

        if (products.length === 0) {
            // IDs exist but no products found (e.g. all deleted or inactive)
            showEmptyState();
            return;
        }

        if (countHeader) {
            countHeader.textContent = `${products.length} items saved`;
        }

        favoritesGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');

        // Fetch ratings
        log('Fetching ratings...');
        const productsWithRatings = await Promise.all(products.map(async (product: any) => {
            const ratingData = await ReviewService.getProductRating(product.id);
            return { ...product, rating: ratingData };
        }));
        log('Ratings fetched, rendering grid...');

        favoritesGrid.innerHTML = productsWithRatings.map((product: any) => {
            const imageSrc = product.images?.[0] || null;
            const imageStyle = imageSrc ? `background-image: url('${imageSrc}');` : '';
            const fallbackContent = !imageSrc ? `
                        <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                            <span class="material-symbols-outlined text-4xl">inventory_2</span>
                        </div>` : '';

            const avg = product.rating.average || 0;
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
                    <div class="group relative flex flex-col gap-3 animate-fade-in">
                        <!-- Wishlist Button (Remove) -->
                        <button data-id="${product.id}" class="wishlist-btn absolute top-2 right-2 z-20 size-8 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm">
                             <span class="material-symbols-outlined text-[18px] font-bold icon-filled" style="font-variation-settings: 'FILL' 1;">favorite</span>
                        </button>

                        <a href="/pages/product.html?id=${product.id}" class="block h-full">
                            <div class="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-[#f1f5f9] dark:bg-[#1e293b] mb-3 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                <div class="w-full h-full bg-contain bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700 drop-shadow-xl"
                                  style="${imageStyle} background-size: cover;">
                                  ${fallbackContent}
                                </div>
                            </div>
                            <div class="flex flex-col pl-1 gap-1">
                                <h3 class="font-bold text-xs leading-tight text-[#0f172a] dark:text-[#e2e8f0] line-clamp-2 group-hover:text-primary transition-colors">${product.name}</h3>
                                <div class="flex flex-col items-start gap-1 md:flex-row md:items-center md:justify-between">
                                    <span class="font-black text-lg text-[#0f172a] dark:text-white">₱${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
                                     <div class="flex items-center gap-1">
                                        <div class="flex items-center">${starsHTML}</div>
                                        <span class="text-xs font-bold text-gray-500">${avg > 0 ? avg.toFixed(1) : ''}</span>
                                    </div>
                                </div>
                            </div> 
                        </a>
                    </div>
             `;
        }).join('');

        log('Grid InnerHTML updated');

        // Attach Event Listeners to Heart Buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id) {
                    await WishlistService.toggleWishlist(id);
                    renderFavorites(); // Re-render to remove item
                }
            });
        });

    } catch (e) {
        log(`Critical Error: ${e}`);
        console.error('Failed to load favorites', e);
        favoritesGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Error loading favorites: ${(e as any).message}</p>`;
    }
};



// Initial Render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFavorites);
} else {
    renderFavorites();
}

// Listen for updates from other tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'sevenstitches_wishlist_v1') {
        log('Storage event detected (cross-tab sync), refreshing...');
        renderFavorites();
    }
});

// Listen for updates from the same session (if logic elsewhere dispatches this)
window.addEventListener('wishlist-changed', () => {
    log('Wishlist-changed event detected, refreshing...');
    renderFavorites();
}); 
