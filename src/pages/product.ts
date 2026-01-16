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
                                <button class="thumbnail-btn relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${index === 0 ? 'border-primary' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}" 
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
                    <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-start">
                        <!-- Image Gallery (Card Style) -->
                        <div class="w-full md:w-1/2">
                            <div class="aspect-square bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center group shadow-inner">
                                <!-- Back Blob -->
                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-primary/10 blur-3xl rounded-full"></div>
                                
                                ${mainImageHtml.replace('class="w-full h-full object-cover', 'class="w-full h-full object-cover z-10"')}
                                
                                <button class="absolute top-6 right-6 z-20 h-11 w-11 flex items-center justify-center bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                    <span class="material-symbols-outlined text-xl">favorite</span>
                                </button>
                            </div>
                            
                            <!-- Minimal Thumbnails -->
                            ${thumbnailsHtml ? `<div class="flex justify-center gap-3 mt-4">${thumbnailsHtml.replace(/w-20 h-24/g, 'size-14 rounded-lg')}</div>` : ''}
                        </div>
                        
                        <!-- Details (Compact Card) -->
                        <div class="w-full md:w-1/2 bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                            <!-- Header -->
                            <div class="mb-5">
                                <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">${(product as any).categories?.name || 'Product'}</span>
                                <h1 class="text-2xl md:text-3xl font-black leading-tight text-gray-900 dark:text-white mb-2">${product.name}</h1>
                                <div class="flex items-center justify-between">
                                    <span class="text-2xl font-black text-primary">₱${Number(product.price).toFixed(2)}</span>
                                    <div class="flex items-center gap-1">
                                        <div class="flex items-center">${ratingStarsHtml}</div>
                                        <span class="text-sm font-bold text-gray-500 ml-1">${ratingData.average > 0 ? ratingData.average.toFixed(1) : 'New'}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Description (Compact) -->
                            <div class="mb-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                <h3 class="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Description</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                    ${product.description || 'No description available.'}
                                </p>
                            </div>

                            <!-- Control Bar (Reference Style) -->
                            <div class="grid grid-cols-3 gap-3 mb-6">
                                <!-- Size (Mock) -->
                                <div class="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center cursor-not-allowed opacity-50">
                                    <span class="text-[10px] uppercase font-bold text-gray-400 mb-1">Size</span>
                                    <span class="font-bold text-sm">One Size</span>
                                </div>
                                <!-- Color (Mock) -->
                                <div class="bg-gray-50 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center cursor-not-allowed opacity-50">
                                    <span class="text-[10px] uppercase font-bold text-gray-400 mb-1">Color</span>
                                    <div class="w-4 h-4 rounded-full bg-primary/80 shadow-sm"></div>
                                </div>
                                <!-- Quantity -->
                                <div class="bg-primary/5 dark:bg-primary/20 rounded-2xl py-1 px-0 flex flex-col items-center justify-center border border-primary/10 h-full">
                                    <span class="text-[9px] uppercase font-bold text-primary mb-1 opacity-80">Qty</span>
                                    <div class="flex items-center gap-1 px-1">
                                        <button id="qty-minus" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 text-primary transition-all font-bold text-lg leading-none pb-0.5">-</button>
                                        <input type="number" id="quantity" value="1" min="1" class="w-8 bg-transparent border-none text-center font-black text-sm p-0 text-primary focus:ring-0" />
                                        <button id="qty-plus" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/60 text-primary transition-all font-bold text-lg leading-none pb-0.5">+</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Buttons -->
                            <div class="flex flex-col gap-3">
                                <button id="add-to-cart" class="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <span class="material-symbols-outlined">shopping_bag</span>
                                    Add to Cart
                                </button>
                                <button id="buy-now" class="w-full py-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                                    Buy Now (Instant Checkout)
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
                const qtyMinusBtn = document.getElementById('qty-minus');
                const qtyPlusBtn = document.getElementById('qty-plus');

                const mainImage = document.getElementById('main-image') as HTMLImageElement;
                const thumbnailBtns = document.querySelectorAll('.thumbnail-btn');

                // Quantity Logic
                if (quantityInput && qtyMinusBtn && qtyPlusBtn) {
                    qtyMinusBtn.addEventListener('click', () => {
                        let val = parseInt(quantityInput.value) || 1;
                        if (val > 1) {
                            quantityInput.value = (val - 1).toString();
                        }
                    });

                    qtyPlusBtn.addEventListener('click', () => {
                        let val = parseInt(quantityInput.value) || 1;
                        quantityInput.value = (val + 1).toString();
                    });
                }

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
                    // Direct Checkout: Don't add to cart state, just redirect with params
                    window.location.href = `/pages/checkout.html?direct=true&productId=${product.id}&quantity=${qty}`;
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
