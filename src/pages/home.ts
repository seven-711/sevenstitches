import { ProductService, Product } from '../services/product.service';
import { NewsletterService } from '../services/newsletter.service';

type Theme = {
    name: string;
    colors: {
        primary: string; // Text/Icon color (e.g., text-green-600)
        bg: string;      // Button background (e.g., bg-green-600)
        light: string;   // Badge background (e.g., bg-green-100)
        border: string; // Border color
    }
};

const THEMES: Record<string, Theme> = {
    default: {
        name: 'default',
        colors: { primary: 'text-primary', bg: 'bg-primary', light: 'bg-primary/10', border: 'border-primary' }
    },
    green: {
        name: 'green',
        colors: { primary: 'text-green-600', bg: 'bg-green-600', light: 'bg-green-100', border: 'border-green-600' }
    },
    pink: {
        name: 'pink',
        colors: { primary: 'text-pink-500', bg: 'bg-pink-500', light: 'bg-pink-100', border: 'border-pink-500' }
    },
    purple: {
        name: 'purple',
        colors: { primary: 'text-purple-600', bg: 'bg-purple-600', light: 'bg-purple-100', border: 'border-purple-600' }
    },
    red: {
        name: 'red',
        colors: { primary: 'text-red-600', bg: 'bg-red-600', light: 'bg-red-100', border: 'border-red-600' }
    },
    cream: {
        name: 'cream',
        colors: { primary: 'text-[#FEEAC9]', bg: 'bg-[#FEEAC9]', light: 'bg-[#FEEAC9]/50', border: 'border-[#FEEAC9]' }
    },
    coral: {
        name: 'coral',
        colors: { primary: 'text-[#FD7979]', bg: 'bg-[#FD7979]', light: 'bg-[#FD7979]/50', border: 'border-[#FD7979]' }
    },
    yellow: {
        name: 'yellow',
        colors: { primary: 'text-yellow-600', bg: 'bg-yellow-600', light: 'bg-yellow-100', border: 'border-yellow-600' }
    }
};

function getProductTheme(product: Product): Theme {
    // 1. Check explicit assignment
    if (product.theme_color) {
        if (product.theme_color === 'green') return THEMES.green;
        if (product.theme_color === 'pink') return THEMES.pink;
        if (product.theme_color === 'purple') return THEMES.purple;
        if (product.theme_color === 'red') return THEMES.red;
        if (product.theme_color === 'cream') return THEMES.cream;
        if (product.theme_color === 'coral') return THEMES.coral;
        if (product.theme_color === 'yellow') return THEMES.yellow;
        // Map 'blue' or any other default-like interaction to default
        if (product.theme_color === 'blue') return THEMES.default;
    }

    // 2. Fallback to keyword matching
    const lowerName = product.name.toLowerCase();
    if (lowerName.includes('hexagon') || lowerName.includes('green') || lowerName.includes('plant')) return THEMES.green;
    if (lowerName.includes('bear') || lowerName.includes('pink') || lowerName.includes('love')) return THEMES.pink;
    if (lowerName.includes('flower') || lowerName.includes('tangled') || lowerName.includes('purple')) return THEMES.purple;
    if (lowerName.includes('apple') || lowerName.includes('red') || lowerName.includes('fire')) return THEMES.red;
    if (lowerName.includes('vanilla') || lowerName.includes('cream') || lowerName.includes('beige')) return THEMES.cream;
    if (lowerName.includes('coral') || lowerName.includes('reef') || lowerName.includes('salmon')) return THEMES.coral;
    if (lowerName.includes('yellow') || lowerName.includes('sun') || lowerName.includes('gold') || lowerName.includes('bee')) return THEMES.yellow;

    return THEMES.default;
}

async function initHomepage() {
    console.log('Homepage script initializing...');

    // Elements
    const heroBgImage = document.getElementById('hero-bg-image');
    const heroProductsContainer = document.getElementById('hero-products-container');
    const heroTitle = document.getElementById('hero-title');
    const heroHighlightText = document.getElementById('hero-highlight-text');
    const heroDescription = document.getElementById('hero-description');
    const heroBadge = document.getElementById('hero-badge');
    const heroBadgeText = document.getElementById('hero-badge-text');
    const heroBadgeIcon = document.getElementById('hero-badge-icon');
    const heroShopBtn = document.getElementById('hero-shop-btn') as HTMLAnchorElement;

    if (!heroProductsContainer) {
        console.error('Hero products container not found! Check index.html IDs.');
        return;
    }

    // State
    let currentTheme = THEMES.default;

    // Functions
    const applyTheme = (theme: Theme) => {
        if (currentTheme.name === theme.name) return; // metrics optimization

        // Helper to swap classes
        const swap = (el: HTMLElement | null, oldClass: string, newClass: string) => {
            if (el) {
                el.classList.remove(oldClass);
                // Handle complex classes (like 'text-primary') vs potentially multiple classes
                // Ideally, we strip all known theme classes and add the new one, but distinct replacements work well for this scope

                // Brute force cleanup of previous theme colors to be safe
                Object.values(THEMES).forEach(t => {
                    el.classList.remove(t.colors.primary, t.colors.bg, t.colors.light, t.colors.border);
                });

                // Add new
                el.classList.add(newClass);
            }
        };

        swap(heroHighlightText, currentTheme.colors.primary, theme.colors.primary);
        swap(heroBadgeText, currentTheme.colors.primary, theme.colors.primary);
        swap(heroBadgeIcon, currentTheme.colors.primary, theme.colors.primary);

        swap(heroBadge, currentTheme.colors.light, theme.colors.light);

        swap(heroShopBtn, currentTheme.colors.bg, theme.colors.bg);

        // Update current theme reference
        currentTheme = theme;
    };

    const updateHero = (product: Product) => {
        // 1. Update Image
        const mainImage = product.images?.[0];
        if (mainImage && heroBgImage) {
            heroBgImage.style.opacity = '0'; // Fixed to 0 for full fade
            setTimeout(() => {
                heroBgImage.style.backgroundImage = `url('${mainImage}')`;
                heroBgImage.style.opacity = '1';
            }, 300);
        }

        // 2. Update Text
        if (heroTitle) {
            // Optional: Update title logic if needed
        }

        if (heroDescription) {
            heroDescription.textContent = product.description || 'Discover unique crochet patterns for makers and finished handmade goods for warmth seekers.';
        }

        const heroFloatingTitle = document.getElementById('hero-floating-title');
        const heroFloatingSubtitle = document.getElementById('hero-floating-subtitle');

        if (heroFloatingTitle) {
            heroFloatingTitle.textContent = product.name;
        }

        const heroFloatingIcon = document.getElementById('hero-floating-icon');
        if (heroFloatingIcon) {
            let iconName = 'stars'; // default
            const lowerName = product.name.toLowerCase();

            if (lowerName.includes('bag') || lowerName.includes('tote')) iconName = 'shopping_bag';
            else if (lowerName.includes('blanket') || lowerName.includes('throw')) iconName = 'bed';
            else if (lowerName.includes('toy') || lowerName.includes('doll') || lowerName.includes('amigurumi') || lowerName.includes('bunny')) iconName = 'smart_toy';
            else if (lowerName.includes('pattern') || lowerName.includes('pdf')) iconName = 'description';
            else if (lowerName.includes('scarf') || lowerName.includes('shawl')) iconName = 'checkroom';

            heroFloatingIcon.textContent = iconName;
        }

        if (heroFloatingSubtitle) {
            heroFloatingSubtitle.textContent = product.categories?.name || 'Best Seller';
        }

        if (heroShopBtn) {
            heroShopBtn.href = `/pages/product.html?id=${product.id}`;
            heroShopBtn.textContent = 'Shop This Item';
        }

        // 3. Update Theme
        const newTheme = getProductTheme(product);
        applyTheme(newTheme);
    };


    try {
        console.log('Fetching products...');
        const products = await ProductService.getProducts();
        console.log('Products fetched:', products);

        if (products.length > 0) {
            // 1. Prepare Data
            const heroProducts = products; // Show all products

            // 2. Auto-Rotation State
            let currentIndex = 0;
            let rotationInterval: any;

            const startRotation = () => {
                stopRotation(); // Clear existing to be safe
                rotationInterval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % heroProducts.length;
                    updateHero(heroProducts[currentIndex]);
                }, 5000);
            };

            const stopRotation = () => {
                if (rotationInterval) clearInterval(rotationInterval);
            };

            // 3. Initial Load
            updateHero(products[0]);
            startRotation();

            // 4. Render Thumbnails
            heroProductsContainer.classList.add('flex', 'gap-4', 'overflow-x-auto', 'pb-4', 'scrollbar-hide', 'max-w-full'); // Ensure horizontal scroll
            heroProductsContainer.innerHTML = heroProducts.map((product, index) => {
                const imgUrl = product.images?.[0] || '';
                if (!imgUrl) return '';

                // Note: Using a button for semantic clickability
                return `
                    <button class="hero-thumb-btn group relative size-24 rounded-2xl border-2 border-white dark:border-[#1e293b] shadow-lg overflow-hidden transition-transform duration-300 hover:scale-110 hover:z-10 bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex-shrink-0" 
                       data-index="${index}"
                       title="${product.name}">
                        <img src="${imgUrl}" alt="${product.name}" class="w-full h-full object-cover pointer-events-none">
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                    </button>
                `;
            }).join('');

            // Event Delegation (Redirect on Click)
            heroProductsContainer.addEventListener('click', (e) => {
                const target = (e.target as HTMLElement).closest('.hero-thumb-btn');
                if (target) {
                    const indexAttr = target.getAttribute('data-index');
                    if (indexAttr) {
                        const index = parseInt(indexAttr);
                        const product = heroProducts[index];
                        if (product) {
                            // Redirect to product page requested by user
                            window.location.href = `/pages/product.html?id=${product.id}`;
                        }
                    }
                }
            });
            // Removed +N "More" indicator logic as we show all now.

            // Animation
            setTimeout(() => {
                heroProductsContainer.classList.remove('opacity-0', 'translate-y-4');
            }, 100);

        } else {
            console.log('No products found.');
            heroProductsContainer.innerHTML = '<div class="text-sm text-gray-500 px-4">No new arrivals.</div>';
            heroProductsContainer.classList.remove('opacity-0', 'translate-y-4');
        }

    } catch (error) {
        console.error('Failed to load homepage products:', error);
        heroProductsContainer.innerHTML = '<div class="text-sm text-red-400 px-4">Error loading content.</div>';
        heroProductsContainer.classList.remove('opacity-0', 'translate-y-4');
    }
    async function loadTrendingProducts() {
        const container = document.getElementById('trending-products-container');
        if (!container) return;

        try {
            // Show loading or skeleton if desired, currently replacing static
            container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">Loading trending...</div>';

            const trending = await ProductService.getTrendingProducts();

            if (trending.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">No trending products yet.</div>';
                return;
            }

            container.innerHTML = trending.map(product => {
                const imgUrl = product.images?.[0] || '';
                const categoryName = product.categories?.name || 'Product';
                // Simple logic for badge: if newly created (e.g. within 7 days) -> 'New', else 'Best Seller'
                const isNew = (Date.now() - new Date(product.created_at!).getTime()) < (7 * 24 * 60 * 60 * 1000); // Mock logic
                const badgeHtml = isNew
                    ? `<span class="absolute top-3 left-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold z-10">New</span>`
                    : `<span class="absolute top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold z-10">Best Seller</span>`;

                return `
                <div class="group flex flex-col gap-3">
                  <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    ${badgeHtml}
                    <button
                      class="absolute top-3 right-3 size-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 text-primary">
                      <span class="material-symbols-outlined text-[18px]">favorite</span>
                    </button>
                    <a href="/pages/product.html?id=${product.id}" class="block w-full h-full">
                        <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style='background-image: url("${imgUrl}");'>
                        </div>
                    </a>
                    <div
                      class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                      <a href="/pages/product.html?id=${product.id}"
                        class="bg-white text-black text-sm font-bold py-2 px-6 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Quick View
                      </a>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-start">
                      <a href="/pages/product.html?id=${product.id}" class="font-bold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
                        ${product.name}
                      </a>
                      <span class="font-bold text-primary">₱${product.price.toFixed(2)}</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">${categoryName}</p>
                  </div>
                </div>
                `;
            }).join('');

        } catch (e) {
            console.error('Error loading trending products:', e);
            container.innerHTML = '<div class="col-span-full text-center py-10 text-red-400">Unable to load trending products.</div>';
        }
    }

    // Call sub-functions
    loadTrendingProducts();

    // Newsletter Logic
    const newsletterForm = document.getElementById('newsletter-form') as HTMLFormElement;
    const newsletterEmail = document.getElementById('newsletter-email') as HTMLInputElement;
    const newsletterFeedback = document.getElementById('newsletter-feedback');
    const newsletterBtn = document.getElementById('newsletter-submit-btn') as HTMLButtonElement;

    if (newsletterForm && newsletterEmail && newsletterBtn) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();

            // Reset UI
            if (newsletterFeedback) {
                newsletterFeedback.classList.add('hidden');
                newsletterFeedback.textContent = '';
                newsletterFeedback.classList.remove('text-green-600', 'text-red-500');
            }
            newsletterBtn.disabled = true;
            newsletterBtn.textContent = 'Subscribing...';

            // Validate
            if (!NewsletterService.validateEmail(email)) {
                if (newsletterFeedback) {
                    newsletterFeedback.textContent = 'Please enter a valid email address.';
                    newsletterFeedback.classList.remove('hidden');
                    newsletterFeedback.classList.add('text-red-500');
                }
                newsletterBtn.disabled = false;
                newsletterBtn.textContent = 'Subscribe';
                return;
            }

            // Submit
            const result = await NewsletterService.subscribe(email);

            if (result.success) {
                // Success State
                if (newsletterFeedback) {
                    newsletterFeedback.textContent = result.message;
                    newsletterFeedback.classList.remove('hidden', 'text-red-500');
                    newsletterFeedback.classList.add('text-green-600');
                }
                newsletterEmail.value = '';
                newsletterBtn.textContent = 'Subscribed!';
                setTimeout(() => {
                    newsletterBtn.disabled = false;
                    newsletterBtn.textContent = 'Subscribe';
                }, 3000);
            } else {
                // Error State
                if (newsletterFeedback) {
                    newsletterFeedback.textContent = result.message;
                    newsletterFeedback.classList.remove('hidden', 'text-green-600');
                    newsletterFeedback.classList.add('text-red-500');
                }
                newsletterBtn.disabled = false;
                newsletterBtn.textContent = 'Subscribe';
            }
        });
    }
}

// Execute logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepage);
} else {
    initHomepage();
}
