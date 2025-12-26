import { AuthService } from '../services/auth.service';
import { clerk } from '../lib/clerk';
import { Toast } from './toast';

import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';

export class AppHeader extends HTMLElement {
  private products: any[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header class="sticky top-0 z-50 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-[#e2e8f0] dark:border-[#1e293b]">
        <div class="px-4 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between gap-4 relative z-50 bg-inherit">
          <div class="flex items-center gap-8">
            <a class="flex items-center gap-3 group" href="/">
              <img src="/logo1.jpg" alt="Seven Stitches Logo" class="h-12 w-12 object-cover rounded-full transition-transform duration-300 group-hover:scale-110" />
            </a>
            <nav class="hidden lg:flex items-center gap-8">
              <a class="text-sm font-medium hover:text-primary transition-colors" href="/pages/shop.html">Shop</a>
              
              <div class="relative group h-full flex items-center">
                <button class="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-4">
                  Categories
                  <span class="material-symbols-outlined text-sm">expand_more</span>
                </button>
                <div class="absolute top-full left-0 w-48 pt-2 hidden group-hover:block transition-all z-[100]">
                  <div id="header-categories-list" class="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 shadow-xl p-2 rounded-xl">
                     <span class="block px-3 py-2 text-xs text-gray-400">Loading...</span>
                  </div>
                </div>
              </div>

              <a class="text-sm font-medium hover:text-primary transition-colors" href="/pages/about.html">About</a>
            </nav>
          </div>
          <div class="flex flex-1 justify-end gap-4 items-center">
             <div class="relative hidden md:block max-w-64 w-full">
                <label class="flex flex-col w-full h-10">
                  <div class="flex w-full flex-1 items-stretch rounded-full h-full bg-[#e2e8f0] dark:bg-[#1e293b] overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                    <div class="text-[#64748b] dark:text-[#94a3b8] flex items-center justify-center pl-4 pr-2">
                      <span class="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input id="search-input" class="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#64748b] dark:placeholder:text-[#94a3b8] dark:text-white h-full px-0" placeholder="Search..." autocomplete="off" />
                  </div>
                </label>
                <!-- Search Results Dropdown -->
                <div id="search-results" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl overflow-hidden hidden z-[100]">
                  <!-- Results populated dinamically -->
                </div>
            </div>
            <div class="flex gap-2 relative">
              <a href="/pages/cart.html" class="relative flex size-10 items-center justify-center rounded-full bg-[#e2e8f0] dark:bg-[#1e293b] hover:bg-primary/20 dark:hover:bg-primary/20 transition-colors">
                <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
                <span id="cart-count" class="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 min-w-[1rem] px-1 rounded-full flex items-center justify-center hidden">0</span>
              </a>
              <div class="relative">
                  <button id="profile-btn" class="flex size-10 items-center justify-center rounded-full bg-[#e2e8f0] dark:bg-[#1e293b] hover:bg-primary/20 dark:hover:bg-primary/20 transition-colors">
                    <span class="material-symbols-outlined text-[20px]">person</span>
                  </button>
                  
                  <!-- User Dropdown (Only shown when logged in) -->
                  <div id="user-dropdown" class="absolute top-12 right-0 w-48 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl p-2 hidden z-[100]">
                      <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                          <p id="header-user-email" class="text-xs font-bold truncate">user@example.com</p>
                      </div>
                      <button id="header-logout-btn" class="w-full text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-lg transition-colors flex items-center gap-2">
                           <span class="material-symbols-outlined text-[18px]">logout</span>
                           Sign Out
                      </button>
                  </div>
              </div>

              <button id="mobile-menu-btn" class="lg:hidden flex size-10 items-center justify-center rounded-full bg-[#e2e8f0] dark:bg-[#1e293b] hover:bg-primary/10 transition-colors">
                <span class="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden lg:hidden border-t border-gray-100 dark:border-gray-800 bg-background-light dark:bg-background-dark p-4 flex-col gap-2 shadow-inner">
            <a class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 transition-colors font-medium text-base" href="/">
                <span class="material-symbols-outlined">home</span> Home
            </a>
            <a class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 transition-colors font-medium text-base" href="/pages/shop.html">
                <span class="material-symbols-outlined">storefront</span> Shop
            </a>
            <div class="p-3">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                <div id="mobile-categories-list" class="flex flex-col gap-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                    <!-- Populated dynamically -->
                </div>
            </div>
            <a class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/80 transition-colors font-medium text-base" href="/pages/about.html">
                <span class="material-symbols-outlined">info</span> About
            </a>
        </div>
      </header>
    `;

    this.updateCartCount();
    window.addEventListener('cart-updated', () => this.updateCartCount());
    this.setupAuthListeners();
    this.setupMobileMenu();
    this.loadCategories();
    this.setupSearchListener();

    // Load products for search
    ProductService.getProducts().then(products => {
      this.products = products;
    }).catch(err => console.error('Failed to load products for search', err));
  }

  setupSearchListener() {
    const searchInput = this.querySelector('#search-input') as HTMLInputElement;
    const resultsContainer = this.querySelector('#search-results');

    if (searchInput && resultsContainer) {
      // Debounce setup could be added here for performance if plenty of products
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length < 2) {
          resultsContainer.classList.add('hidden');
          return;
        }

        const matches = this.products.filter(p => p.name.toLowerCase().includes(query)).slice(0, 5);

        if (matches.length > 0) {
          resultsContainer.innerHTML = matches.map(product => `
                    <a href="/pages/product.html?id=${product.id}" class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-none">
                        <img src="${product.images?.[0] || 'https://placehold.co/40'}" class="w-10 h-10 rounded-md object-cover bg-gray-100" alt="${product.name}">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">${product.name}</p>
                            <p class="text-xs text-primary">₱${product.price.toFixed(2)}</p>
                        </div>
                    </a>
                 `).join('') + `
                    <a href="/pages/shop.html?search=${encodeURIComponent(query)}" class="block p-3 text-center text-xs font-bold text-primary bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        View all results for "${query}"
                    </a>
                 `;
          resultsContainer.classList.remove('hidden');
        } else {
          resultsContainer.innerHTML = `<div class="p-3 text-sm text-gray-500 text-center">No results found</div>`;
          resultsContainer.classList.remove('hidden');
        }
      });

      // Redirect on Enter
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `/pages/shop.html?search=${encodeURIComponent(query)}`;
          }
        }
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target as Node) && !resultsContainer.contains(e.target as Node)) {
          resultsContainer.classList.add('hidden');
        }
      });

      // Re-open if focused and has value
      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
          resultsContainer.classList.remove('hidden');
        }
      });
    }
  }

  setupMobileMenu() {
    const btn = this.querySelector('#mobile-menu-btn');
    const menu = this.querySelector('#mobile-menu');

    btn?.addEventListener('click', () => {
      const isHidden = menu?.classList.contains('hidden');
      if (isHidden) {
        menu?.classList.remove('hidden');
        menu?.classList.add('flex');
        btn.querySelector('span')!.textContent = 'close';
      } else {
        menu?.classList.add('hidden');
        menu?.classList.remove('flex');
        btn.querySelector('span')!.textContent = 'menu';
      }
    });
  }

  async loadCategories() {
    const listContainer = this.querySelector('#header-categories-list');
    const mobileListContainer = this.querySelector('#mobile-categories-list');

    // Initial loading state
    if (!listContainer && !mobileListContainer) return;

    try {
      const categories = await CategoryService.getCategories();

      const linksHtml = categories.length > 0
        ? categories.map(cat => `
                <a href="/pages/category.html?type=${cat.name}" class="block px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg">
                    ${cat.name}
                </a>
            `).join('')
        : '<span class="block px-3 py-2 text-xs text-gray-400">No categories</span>';

      if (listContainer) listContainer.innerHTML = linksHtml;
      if (mobileListContainer) mobileListContainer.innerHTML = linksHtml;

    } catch (e) {
      console.error('Header categories error', e);
      const errorHtml = '<span class="block px-3 py-2 text-xs text-red-400">Error loading</span>';
      if (listContainer) listContainer.innerHTML = errorHtml;
      if (mobileListContainer) mobileListContainer.innerHTML = errorHtml;
    }
  }

  updateCartCount() {
    const count = parseInt(localStorage.getItem('sevenstitches_cart') ?
      JSON.parse(localStorage.getItem('sevenstitches_cart')!).reduce((sum: number, item: any) => sum + item.quantity, 0) :
      '0'
    );

    const countEl = this.querySelector('#cart-count');
    if (countEl) {
      if (count > 0) {
        countEl.textContent = count.toString();
        countEl.classList.remove('hidden');
        countEl.classList.add('animate-bounce');
        setTimeout(() => countEl.classList.remove('animate-bounce'), 1000);
      } else {
        countEl.classList.add('hidden');
      }
    }
  }

  async setupAuthListeners() {
    const profileBtn = this.querySelector('#profile-btn');
    const userDropdown = this.querySelector('#user-dropdown');
    const logoutBtn = this.querySelector('#header-logout-btn');
    const userEmailEl = this.querySelector('#header-user-email');

    // Check Auth State
    const user = await AuthService.getUser();

    profileBtn?.addEventListener('click', (e) => {
      if (user) {
        // Toggle Dropdown if logged in
        e.stopPropagation();
        userDropdown?.classList.toggle('hidden');
      } else {
        // Open Clerk Login Modal
        clerk.openSignIn();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userDropdown?.contains(e.target as Node) && !profileBtn?.contains(e.target as Node)) {
        userDropdown?.classList.add('hidden');
      }
    });

    // Logout
    logoutBtn?.addEventListener('click', async () => {
      await AuthService.logout();
      Toast.show('Logged out', 'info');
      window.location.href = '/';
    });

    // Update UI
    if (user) {
      if (userEmailEl) {
        userEmailEl.textContent = user.primaryEmailAddress?.emailAddress || (user as any).email || 'User';
      }

      const imageUrl = (user as any).imageUrl || (user as any).profileImageUrl;
      if (imageUrl && profileBtn) {
        profileBtn.innerHTML = `<img src="${imageUrl}" alt="Profile" class="h-full w-full rounded-full object-cover" />`;
      } else {
        profileBtn?.classList.add('text-primary'); // Highlight icon when logged in
      }
    }
  }
}
