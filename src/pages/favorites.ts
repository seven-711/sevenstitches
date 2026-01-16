
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

const favoritesGrid = document.getElementById('favorites-grid');
const emptyState = document.getElementById('empty-state');
const countHeader = document.getElementById('favorites-count-header');

// Render Function (Reused from Shop with small mods)
const renderFavorites = async () => {
    if (!favoritesGrid || !emptyState) return;

    const wishlistIds = WishlistService.getWishlist();

    if (countHeader) {
        countHeader.textContent = `${wishlistIds.length} items saved`;
    }

    if (wishlistIds.length === 0) {
        favoritesGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }

    favoritesGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    // Fetch Products
    try {
        const products = await ProductService.getProductsByIds(wishlistIds);

        // Fetch ratings
        const productsWithRatings = await Promise.all(products.map(async (product: any) => {
            const ratingData = await ReviewService.getProductRating(product.id);
            return { ...product, rating: ratingData };
        }));

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
                                  style="${imageStyle} background-size: 85%;">
                                  ${fallbackContent}
                                </div>
                            </div>
                            <div class="flex flex-col pl-1 gap-1">
                                <h3 class="font-bold text-xs leading-tight text-[#0f172a] dark:text-[#e2e8f0] line-clamp-2 group-hover:text-primary transition-colors">${product.name}</h3>
                                <div class="flex items-center justify-between">
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

        // Attach Event Listeners to Heart Buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id) {
                    WishlistService.toggleWishlist(id);
                    renderFavorites(); // Re-render to remove item
                }
            });
        });

    } catch (e) {
        console.error('Failed to load favorites', e);
        favoritesGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading favorites.</p>';
    }
};

// Initial Render
renderFavorites();

// Listen for outside changes (e.g. if we add syncing later, or multiple tabs)
// window.addEventListener('wishlist-changed', renderFavorites); 
