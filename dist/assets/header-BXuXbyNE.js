import{A as o}from"./auth.service-B-BoZdmw.js";import{c as l}from"./supabase-w99FfbcE.js";import{T as n}from"./toast-CErdx8Qf.js";import{C as d}from"./category.service-ILwE1iue.js";class b extends HTMLElement{constructor(){super()}connectedCallback(){this.innerHTML=`
      <header class="sticky top-0 z-50 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-[#e2e8f0] dark:border-[#1e293b]">
        <div class="px-4 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between gap-4 relative z-50 bg-inherit">
          <div class="flex items-center gap-8">
            <a class="flex items-center gap-3 group" href="/">
              <div class="size-8 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl">gesture</span>
              </div>
              <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Seven Stitches</h2>
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
            <label class="hidden md:flex flex-col min-w-40 h-10 max-w-64 w-full">
              <div class="flex w-full flex-1 items-stretch rounded-full h-full bg-[#e2e8f0] dark:bg-[#1e293b] overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                <div class="text-[#64748b] dark:text-[#94a3b8] flex items-center justify-center pl-4 pr-2">
                  <span class="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input class="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-[#64748b] dark:placeholder:text-[#94a3b8] dark:text-white h-full px-0" placeholder="Search patterns..." />
              </div>
            </label>
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
                  <div id="user-dropdown" class="absolute top-12 right-0 w-48 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 hidden z-[100]">
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
    `,this.updateCartCount(),window.addEventListener("cart-updated",()=>this.updateCartCount()),this.setupAuthListeners(),this.setupMobileMenu(),this.loadCategories()}setupMobileMenu(){const t=this.querySelector("#mobile-menu-btn"),e=this.querySelector("#mobile-menu");t?.addEventListener("click",()=>{e?.classList.contains("hidden")?(e?.classList.remove("hidden"),e?.classList.add("flex"),t.querySelector("span").textContent="close"):(e?.classList.add("hidden"),e?.classList.remove("flex"),t.querySelector("span").textContent="menu")})}async loadCategories(){const t=this.querySelector("#header-categories-list"),e=this.querySelector("#mobile-categories-list");if(!(!t&&!e))try{const r=await d.getCategories(),s=r.length>0?r.map(a=>`
                <a href="/pages/category.html?type=${a.name}" class="block px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg">
                    ${a.name}
                </a>
            `).join(""):'<span class="block px-3 py-2 text-xs text-gray-400">No categories</span>';t&&(t.innerHTML=s),e&&(e.innerHTML=s)}catch(r){console.error("Header categories error",r);const s='<span class="block px-3 py-2 text-xs text-red-400">Error loading</span>';t&&(t.innerHTML=s),e&&(e.innerHTML=s)}}updateCartCount(){const t=parseInt(localStorage.getItem("sevenstitches_cart")?JSON.parse(localStorage.getItem("sevenstitches_cart")).reduce((r,s)=>r+s.quantity,0):"0"),e=this.querySelector("#cart-count");e&&(t>0?(e.textContent=t.toString(),e.classList.remove("hidden"),e.classList.add("animate-bounce"),setTimeout(()=>e.classList.remove("animate-bounce"),1e3)):e.classList.add("hidden"))}async setupAuthListeners(){const t=this.querySelector("#profile-btn"),e=this.querySelector("#user-dropdown"),r=this.querySelector("#header-logout-btn"),s=this.querySelector("#header-user-email"),a=await o.getUser();if(t?.addEventListener("click",i=>{a?(i.stopPropagation(),e?.classList.toggle("hidden")):l.openSignIn()}),document.addEventListener("click",i=>{!e?.contains(i.target)&&!t?.contains(i.target)&&e?.classList.add("hidden")}),r?.addEventListener("click",async()=>{await o.logout(),n.show("Logged out","info"),window.location.href="/"}),a){s&&(s.textContent=a.primaryEmailAddress?.emailAddress||a.email||"User");const i=a.imageUrl||a.profileImageUrl;i&&t?t.innerHTML=`<img src="${i}" alt="Profile" class="h-full w-full rounded-full object-cover" />`:t?.classList.add("text-primary")}}}export{b as AppHeader};
