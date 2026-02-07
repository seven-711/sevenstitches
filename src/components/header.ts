import { AuthService } from '../services/auth.service';
import { clerk } from '../lib/clerk';
import { Toast } from './toast';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { gsap } from 'gsap';

export class AppHeader extends HTMLElement {
  private products: any[] = [];

  // Staggered Menu Refs
  private menuWrapper: HTMLElement | null = null;
  private menuPanel: HTMLElement | null = null;
  private menuTimeline: gsap.core.Timeline | null = null;
  private menuOpen = false;
  private isBusy = false;

  constructor() {
    super();
  }

  async connectedCallback() {
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

              <a class="text-sm font-medium hover:text-primary transition-colors" href="/pages/orders.html">Orders</a>

              <a class="text-sm font-medium hover:text-primary transition-colors" href="/pages/favorites.html">Favorites</a>

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

              <button id="mobile-menu-btn" class="lg:hidden flex size-10 items-center justify-center rounded-full bg-[#e2e8f0] dark:bg-[#1e293b] hover:bg-primary/10 transition-colors z-[100] relative">
                <span class="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;

    this.updateCartCount();
    window.addEventListener('cart-updated', () => this.updateCartCount());
    this.setupAuthListeners();
    this.createStaggeredMenuDOM();
    this.setupMobileMenuToggle();
    this.loadCategories();
    this.setupSearchListener();
    this.injectChatWidget();

    // Load products for search
    ProductService.getProducts().then(products => {
      this.products = products;
    }).catch(err => console.error('Failed to load products for search', err));
  }

  disconnectedCallback() {
    if (this.menuWrapper && document.body.contains(this.menuWrapper)) {
      document.body.removeChild(this.menuWrapper);
    }
    window.removeEventListener('resize', this.closeMenuIfDesktop);
  }

  closeMenuIfDesktop = () => {
    if (window.innerWidth >= 1024 && this.menuOpen) {
      this.closeMenu();
    }
  }

  createStaggeredMenuDOM() {
    // Create wrapper appended to body
    const wrapper = document.createElement('div');
    wrapper.className = 'sm-scope';
    wrapper.innerHTML = `
        <div class="staggered-menu-wrapper" data-open="false">
            <!-- Prelayers -->
            <div class="sm-prelayers">
                <div class="sm-prelayer" style="background: #eff6ff;"></div>
                <div class="sm-prelayer" style="background: #dbeafe;"></div>
                <div class="sm-prelayer" style="background: #bfdbfe;"></div>
                <div class="sm-prelayer" style="background: #93c5fd;"></div>
            </div>
            
            <!-- Panel -->
            <aside class="staggered-menu-panel">
                <button class="sm-close-btn" aria-label="Close menu">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="sm-panel-inner">
                    <ul class="sm-panel-list">
                        <li class="sm-panel-itemWrap">
                            <a href="/" class="sm-panel-item"><span class="sm-panel-itemLabel">Home</span></a>
                        </li>
                         <li class="sm-panel-itemWrap">
                            <a href="/pages/shop.html" class="sm-panel-item"><span class="sm-panel-itemLabel">Shop</span></a>
                        </li>
                        <li class="sm-panel-itemWrap">
                           <div class="sm-panel-item group relative">
                              <span class="sm-panel-itemLabel">Categories</span>
                              <div id="sm-categories-list" class="hidden group-hover:block absolute top-full left-0 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 shadow-xl p-4 rounded-xl z-50 min-w-[200px] flex flex-col gap-2">
                                <!-- Categories populated dynamically -->
                              </div>
                           </div>
                        </li>
                        <li class="sm-panel-itemWrap">
                            <a href="/pages/orders.html" class="sm-panel-item"><span class="sm-panel-itemLabel">Orders</span></a>
                        </li>
                        <li class="sm-panel-itemWrap">
                            <a href="/pages/favorites.html" class="sm-panel-item"><span class="sm-panel-itemLabel">Favorites</span></a>
                        </li>
                         <li class="sm-panel-itemWrap">
                            <a href="/pages/about.html" class="sm-panel-item"><span class="sm-panel-itemLabel">About</span></a>
                        </li>
                        <li class="sm-panel-itemWrap">
                            <a href="/pages/contact.html" class="sm-panel-item"><span class="sm-panel-itemLabel">Contact</span></a>
                        </li>
                    </ul>

                    <div class="sm-socials">
                        <h3 class="sm-socials-title">Follow Us</h3>
                        <ul class="sm-socials-list">
                            <li class="sm-socials-item">
                                <a href="https://www.instagram.com/underthe_sky7/" target="_blank" class="sm-socials-link">Instagram</a>
                            </li>
                             <li class="sm-socials-item">
                                <a href="https://www.facebook.com/yhoung11" target="_blank" class="sm-socials-link">Facebook</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </aside>
        </div>
      `;
    document.body.appendChild(wrapper);
    this.menuWrapper = wrapper.querySelector('.staggered-menu-wrapper');
    this.menuPanel = wrapper.querySelector('.staggered-menu-panel');

    // Initial GSAP Set state
    if (this.menuWrapper) {
      const preLayers = this.menuWrapper.querySelectorAll('.sm-prelayer');
      // this.menuPanel is already set
      const items = this.menuWrapper.querySelectorAll('.sm-panel-itemLabel');
      const socials = this.menuWrapper.querySelectorAll('.sm-socials-link');

      // Correct initial positions
      if (this.menuPanel) {
        gsap.set([this.menuPanel, ...Array.from(preLayers)], { xPercent: 100 });
      }
      gsap.set(items, { yPercent: 100 });
      gsap.set(socials, { opacity: 0, y: 10 });
    }

    // Add click listeners to links to auto-close
    const links = wrapper.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    const closeBtn = wrapper.querySelector('.sm-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.closeMenu();
    });

    window.addEventListener('resize', this.closeMenuIfDesktop);
  }

  setupMobileMenuToggle() {
    const btn = this.querySelector('#mobile-menu-btn');
    btn?.addEventListener('click', () => {
      if (this.isBusy) return;

      if (this.menuOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    });
  }

  openMenu() {
    if (this.isBusy || !this.menuWrapper) return;
    this.isBusy = true;
    this.menuOpen = true;

    // Update Button Icon
    const btnIcon = this.querySelector('#mobile-menu-btn span');
    if (btnIcon) btnIcon.textContent = 'close';

    // GSAP Animation
    const preLayers = Array.from(this.menuWrapper.querySelectorAll('.sm-prelayer'));
    const panel = this.menuPanel!;
    const itemLabels = this.menuWrapper.querySelectorAll('.sm-panel-itemLabel');

    const socials = this.menuWrapper.querySelectorAll('.sm-socials-link');

    this.menuTimeline?.kill();
    this.menuTimeline = gsap.timeline({
      onComplete: () => { this.isBusy = false; }
    });

    // 1. Layers Wipe
    preLayers.forEach((layer, i) => {
      this.menuTimeline!.to(layer, {
        xPercent: 0,
        duration: 0.8,
        ease: 'power4.out'
      }, i * 0.1);
    });

    // 2. Panel Slide
    this.menuTimeline.to(panel, {
      xPercent: 0,
      duration: 0.8,
      ease: 'power4.out'
    }, 0.4);

    // 3. Items Stagger
    this.menuTimeline.fromTo(itemLabels,
      { yPercent: 100, rotate: 5 },
      { yPercent: 0, rotate: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 },
      0.6
    );

    // 4. Socials
    this.menuTimeline.to(socials, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1
    }, 0.8);




    this.menuWrapper.setAttribute('data-open', 'true');
    this.menuWrapper.style.pointerEvents = 'auto';
  }

  closeMenu() {
    if (this.isBusy || !this.menuWrapper) return;
    this.isBusy = true;
    this.menuOpen = false;

    // Update Button Icon
    const btnIcon = this.querySelector('#mobile-menu-btn span');
    if (btnIcon) btnIcon.textContent = 'menu';

    const preLayers = Array.from(this.menuWrapper.querySelectorAll('.sm-prelayer'));
    const panel = this.menuPanel!;

    this.menuTimeline?.kill();
    this.menuTimeline = gsap.timeline({
      onComplete: () => {
        this.isBusy = false;
        this.menuWrapper?.setAttribute('data-open', 'false');
        if (this.menuWrapper) this.menuWrapper.style.pointerEvents = 'none';
        // Reset items for next open
        const itemLabels = this.menuWrapper?.querySelectorAll('.sm-panel-itemLabel');
        if (itemLabels) gsap.set(itemLabels, { yPercent: 100 });
      }
    });

    // Close animation (reverse-ish)
    this.menuTimeline.to([panel, ...preLayers], {
      xPercent: 100,
      duration: 0.6,
      ease: 'power3.in',
      stagger: {
        amount: 0.2
      }
    });
  }

  injectChatWidget() {
    if (!customElements.get('chat-widget')) {
      import('./chat-widget').then(({ ChatWidget }) => {
        customElements.define('chat-widget', ChatWidget);
        this.appendWidget();
      });
    } else {
      this.appendWidget();
    }
  }

  appendWidget() {
    if (!document.body.querySelector('chat-widget')) {
      const widget = document.createElement('chat-widget');
      document.body.appendChild(widget);
    }
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

  async loadCategories() {
    const listContainer = this.querySelector('#header-categories-list');

    // Also load categories into the staggered menu if possible, but for now we hardcoded main links
    // If we want dynamic categories in StaggeredMenu, we'd append them there.

    if (!listContainer) return;

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

      // Update staggered menu category list
      if (this.menuWrapper) {
        const mobileListContainer = this.menuWrapper.querySelector('#sm-categories-list');
        if (mobileListContainer) mobileListContainer.innerHTML = linksHtml;
      }

    } catch (e) {
      console.error('Header categories error', e);
      const errorHtml = '<span class="block px-3 py-2 text-xs text-red-400">Error loading</span>';
      if (listContainer) listContainer.innerHTML = errorHtml;
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
