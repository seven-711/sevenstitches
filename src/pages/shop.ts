import '../style.css';
import '../components/header';
import { ProductService } from '../services/product.service';
import { ReviewService } from '../services/review.service';
import { CategoryService } from '../services/category.service';
import { WishlistService } from '../services/wishlist.service';
import { Toast } from '../components/toast';


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


          const isInWishlist = WishlistService.isInWishlist(product.id);
          const heartFill = isInWishlist ? 1 : 0;
          const heartClass = isInWishlist ? 'text-red-500' : 'text-black dark:text-white';

          return `
                    <div class="group relative flex flex-col gap-3 animate-fade-in">
                        <!-- Wishlist Button -->
                        <button data-id="${product.id}" class="wishlist-btn absolute top-2 right-2 z-20 size-8 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full ${heartClass} hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                             <span class="material-symbols-outlined text-[18px] font-bold icon-filled" style="font-variation-settings: 'FILL' ${heartFill};">favorite</span>
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
            const icon = btn.querySelector('span');

            if (id && icon) {
              const isNowInWishlist = WishlistService.toggleWishlist(id);

              // Optimistic UI Update
              if (isNowInWishlist) {
                btn.classList.remove('text-black', 'dark:text-white');
                btn.classList.add('text-red-500');
                icon.style.fontVariationSettings = "'FILL' 1";
                Toast.show('Added to favorites', 'success');
              } else {
                btn.classList.add('text-black', 'dark:text-white');
                btn.classList.remove('text-red-500');
                icon.style.fontVariationSettings = "'FILL' 0";
                Toast.show('Removed from favorites', 'info');
              }
            }
          });
        });
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

  // --- Mobile Carousel Logic ---
  const initMobileCarousel = () => {
    const card = document.getElementById('mobile-promo-card');
    const content = document.getElementById('mobile-promo-content');
    const image = document.getElementById('mobile-promo-image') as HTMLImageElement;
    const dotsContainer = document.getElementById('mobile-promo-dots');

    if (!card || !content || !image || !dotsContainer) return;

    const slides = [
      {
        title: 'Flat 50% discount on your first order.',
        btn: 'Buy Now',
        bg: 'bg-[#1e293b]', // slate-800
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPDk-3YDj-0t12k5qYBcBl3gWsAjjoPGNIXJsElwl5k07ckHUY5ikmiExZGN_gUkzjNCFVEA3rL3rBbH2ySG1MF54Uy0NdcN0a5LLMf3A84gul0EAtJTWlZd5pG5H_isGFn3pbkYDWr5B5cnsq9GMPXB34Vi3_HhFPpDTsFmTqCnI1Zah1mPDJwMqpilhJv2mWJ-MTvwrNy6x5KmUe2GzM4vyT2czlExkshQdusA0dAkTtZ0A1hZ5WiY1AIqIJrEdtoVOc5524m8Hv'
      },
      {
        title: 'New Crochet Collection Arrived.',
        btn: 'Shop New',
        bg: 'bg-[#701a75]', // fuchsia-900
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7FQ3zuv-x21Hv6odsfykUXKADwuJk5ybNW1NepTQJYblAKcZ-_uBhWbVru3joEZ06hOxj0LQ2zZ28dQfqZoR3XVcE_8Ukfsm2ojSZacDLHsV8Ylz4S0aGxZSqufkZW1KK2QbG6C1qWvJunSX5VyB1CtddCpjhuZGyL3kJ1I9N381R7wSgtCVqP8v1V1wlW9As786fOSWcknuEAqsylnLd6iqNcEpKkkG_RPwZcTSC3KB2imA8gKD6qF9_3En_0jwyxHyP0Ll2Gtu_'
      },
      {
        title: 'Free Shipping on Orders over ₱2000.',
        btn: 'Learn More',
        bg: 'bg-[#047857]', // emerald-700
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANSJ97_luLSLOVFg0-fBKxb9CxE5kCZumQv7XZTRcefIUHYINgTYzCQbdNSeWVevrVbGTbVrNRPKvpfFRmy8sP4zr09kdt92OkY5zAOJnZzgjcftPqRdV2wHk4wax4vSRPa8QpYOXMrxxl1cNq8Ul4Gz_8jP22ArcqK0lUDvK9d6p-WUjG7HsgFuK-e_cCE3B0cXhQkiQO08RVt2Vf_CDvwhp9SKKc82NM67CkLgr3_5NUmUfJZGUzK2pVUYY8IZq84VIp3HIsenjy'
      }
    ];

    let currentIndex = 0;
    const dots = Array.from(dotsContainer.children) as HTMLElement[];

    const updateSlide = (index: number) => {
      // Fade out
      content.style.opacity = '0';
      image.style.opacity = '0';
      image.style.transform = 'translateY(-50%) translateX(20px) rotate(0deg) scale(0.9)'; // Slide out effect

      setTimeout(() => {
        const slide = slides[index];

        // Update Content
        content.innerHTML = `
                <h2 class="text-white font-bold text-xl leading-snug">${slide.title}</h2>
                <button class="bg-[#f97316] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-transform hover:scale-105">
                    ${slide.btn}
                </button>
            `;

        image.src = slide.img;

        // Update Background Class
        // First remove all potential bg classes to be safe
        card.classList.remove('bg-[#1e293b]', 'bg-[#701a75]', 'bg-[#047857]');
        card.classList.add(slide.bg);

        // Update Dots
        dots.forEach((dot, i) => {
          if (i === index) {
            dot.classList.remove('bg-gray-300', 'dark:bg-gray-700');
            dot.classList.add('bg-primary', 'scale-125');
          } else {
            dot.classList.add('bg-gray-300', 'dark:bg-gray-700');
            dot.classList.remove('bg-primary', 'scale-125');
          }
        });

        // Fade in
        content.style.opacity = '1';
        image.style.opacity = '1';
        image.style.transform = 'translateY(-50%) rotate(-12deg) scale(1)'; // Reset transform

        currentIndex = index;
      }, 300);
    };

    // Auto Advance
    setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      updateSlide(nextIndex);
    }, 5000);

    // Click on dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateSlide(index));
    });
  };

  initMobileCarousel();
})();
