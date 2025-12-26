import '../style.css';
import '../components/header';
import { ProductService } from '../services/product.service';
import { CartState } from '../state/cart';
import { Toast } from '../components/toast';

// Ensure header is registered
if (!customElements.get('app-header')) {
    import('../components/header').then(({ AppHeader }) => {
        if (!customElements.get('app-header')) {
            customElements.define('app-header', AppHeader);
        }
    });
}

import { ReviewService } from '../services/review.service';

const container = document.getElementById('product-container');
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

(async () => {
    if (container && productId) {
        try {
            const [product, reviews, ratingData] = await Promise.all([
                ProductService.getProductById(productId),
                ReviewService.getReviewsByProduct(productId),
                ReviewService.getProductRating(productId)
            ]);

            if (product) {
                const images = product.images && product.images.length > 0 ? product.images : [];
                const mainImageSrc = images.length > 0 ? images[0] : null;

                // Main Image HTML
                const mainImageHtml = mainImageSrc
                    ? `<img id="main-image" src="${mainImageSrc}" alt="${product.name}" class="w-full h-full object-cover transition-opacity duration-300" />`
                    : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                           <span class="material-symbols-outlined text-6xl">inventory_2</span>
                       </div>`;

                // Thumbnails HTML
                let thumbnailsHtml = '';
                if (images.length > 1) {
                    thumbnailsHtml = `
                        <div class="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                            ${images.map((src, index) => `
                                <button class="thumbnail-btn relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${index === 0 ? 'border-primary' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}" 
                                    data-src="${src}" aria-label="View image ${index + 1}">
                                    <img src="${src}" alt="Thumbnail ${index + 1}" class="w-full h-full object-cover" />
                                </button>
                            `).join('')}
                        </div>
                    `;
                }

                // Reviews HTML
                const reviewsHtml = reviews.length > 0 ? `
                    <div class="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10">
                        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Customer Reviews (${reviews.length})</h2>
                        <div class="space-y-6">
                            ${reviews.map(review => `
                                <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold text-xs">
                                                ${(review.person_name || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p class="font-bold text-gray-900 dark:text-white text-sm">${review.is_anonymous ? 'Anonymous' : review.person_name}</p>
                                                <p class="text-xs text-gray-400">${new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div class="flex text-yellow-400 text-sm gap-0.5">
                                            ${Array(5).fill(0).map((_, i) =>
                    `<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' ${i < review.rating ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24;">star</span>`
                ).join('')}
                                        </div>
                                    </div>
                                    <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">${review.comment || ''}</p>
                                    ${(review.images && review.images.length > 0) ? `
                                    <div class="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        ${review.images.map(img => `
                                            <div class="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 cursor-zoom-in active:scale-95 transition-transform" onclick="window.open('${img}', '_blank')">
                                                <img src="${img}" class="w-full h-full object-cover">
                                            </div>
                                        `).join('')}
                                    </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10">
                        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Customer Reviews</h2>
                        <p class="text-gray-500">No reviews yet.</p>
                    </div>
                `;

                // Calculate Star Display
                // Calculate Star Display
                const avg = ratingData.average || 0;
                const fullStars = Math.floor(avg);
                const hasHalfStar = avg % 1 >= 0.5;
                let ratingStarsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= fullStars) {
                        ratingStarsHtml += '<span class="material-symbols-outlined text-yellow-400 text-xl" style="font-variation-settings: \'FILL\' 1, \'wght\' 400, \'GRAD\' 0, \'opsz\' 24;">star</span>';
                    } else if (i === fullStars + 1 && hasHalfStar) {
                        ratingStarsHtml += '<span class="material-symbols-outlined text-yellow-400 text-xl" style="font-variation-settings: \'FILL\' 1, \'wght\' 400, \'GRAD\' 0, \'opsz\' 24;">star_half</span>';
                    } else {
                        ratingStarsHtml += '<span class="material-symbols-outlined text-gray-300 text-xl" style="font-variation-settings: \'FILL\' 0, \'wght\' 400, \'GRAD\' 0, \'opsz\' 24;">star</span>';
                    }
                }


                container.innerHTML = `
                    <div class="flex flex-col md:flex-row gap-8 lg:gap-16">
                        <!-- Image Gallery -->
                        <div class="w-full md:w-1/2">
                            <div class="aspect-[4/5] w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-xl relative">
                                ${mainImageHtml}
                            </div>
                            ${thumbnailsHtml}
                        </div>
                        
                        <!-- Details -->
                        <div class="w-full md:w-1/2 flex flex-col justify-center">
                            <div class="mb-6">
                                <span class="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                                    ${(product as any).categories?.name || 'Product'}
                                </span>
                                <h1 class="text-3xl md:text-5xl font-black leading-tight mb-2 text-gray-900 dark:text-white">${product.name}</h1>
                                
                                <!-- Rating Header -->
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="flex items-center gap-0.5">${ratingStarsHtml}</div>
                                    <p class="text-sm text-gray-500 hover:underline cursor-pointer">(${ratingData.count} reviews)</p>
                                </div>

                                <p class="text-2xl font-bold text-primary">₱${Number(product.price).toFixed(2)}</p>
                                <div class="mt-2 text-sm">
                                    <span class="${(product.inventory_count || 0) < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}">
                                        ${product.inventory_count || 0} in stock
                                    </span>
                                </div>
                            </div>
                            
                            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                ${product.description || 'No description available.'}
                            </p>
                            
                            <div class="flex gap-4">
                                <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-12 px-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                                     <input type="number" id="quantity" value="1" min="1" class="w-12 bg-transparent border-none text-center focus:ring-0 p-0" />
                                </div>
                                <button id="add-to-cart" class="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined">shopping_cart</span>
                                    Add to Cart
                                </button>
                                <button id="buy-now" class="flex-1 h-12 bg-white dark:bg-slate-800 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 dark:hover:bg-primary/10 transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <span class="material-symbols-outlined">bolt</span>
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${reviewsHtml}
                `;

                // Event Listeners
                const addToCartBtn = document.getElementById('add-to-cart');
                const buyNowBtn = document.getElementById('buy-now');
                const quantityInput = document.getElementById('quantity') as HTMLInputElement;
                const mainImage = document.getElementById('main-image') as HTMLImageElement;
                const thumbnailBtns = document.querySelectorAll('.thumbnail-btn');

                // Thumbnail Click Logic
                thumbnailBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const newSrc = btn.getAttribute('data-src');
                        if (newSrc && mainImage) {
                            // Update Main Image
                            mainImage.style.opacity = '0';
                            setTimeout(() => {
                                mainImage.src = newSrc;
                                mainImage.style.opacity = '1';
                            }, 300);

                            thumbnailBtns.forEach(b => {
                                b.classList.remove('border-primary');
                                b.classList.add('border-transparent');
                            });
                            btn.classList.remove('border-transparent');
                            btn.classList.add('border-primary');
                        }
                    });
                });

                addToCartBtn?.addEventListener('click', () => {
                    const qty = parseInt(quantityInput.value) || 1;
                    CartState.addItem(product, qty);
                    Toast.show('Added to cart!', 'success');
                });

                buyNowBtn?.addEventListener('click', () => {
                    const qty = parseInt(quantityInput.value) || 1;
                    CartState.addItem(product, qty);
                    window.location.href = '/pages/checkout.html';
                });


            } else {
                renderNotFound();
            }
        } catch (e) {
            console.error(e);
            renderNotFound();
        }
    } else if (container) {
        renderNotFound('Product ID Missing');
    }
})();

function renderNotFound(message = 'Product Not Found') {
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-20">
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${message}</h2>
            <a href="/pages/shop.html" class="text-primary hover:underline">Back to Shop</a>
        </div>
    `;
}
