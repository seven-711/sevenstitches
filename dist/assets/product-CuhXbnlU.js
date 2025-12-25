const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/header-BXuXbyNE.js","assets/auth.service-B-BoZdmw.js","assets/supabase-w99FfbcE.js","assets/toast-CErdx8Qf.js","assets/category.service-ILwE1iue.js"])))=>i.map(i=>d[i]);
import"./supabase-w99FfbcE.js";import{_ as f}from"./preload-helper-BXl3LOEh.js";/* empty css              */import{T as b}from"./toast-CErdx8Qf.js";import{P as y}from"./product.service-oboCqACv.js";import{C as h}from"./cart-CK-ISstg.js";customElements.get("app-header")||f(async()=>{const{AppHeader:t}=await import("./header-BXuXbyNE.js");return{AppHeader:t}},__vite__mapDeps([0,1,2,3,4])).then(({AppHeader:t})=>{customElements.get("app-header")||customElements.define("app-header",t)});const r=document.getElementById("product-container"),x=new URLSearchParams(window.location.search),m=x.get("id");(async()=>{if(r&&m)try{const t=await y.getProductById(m);if(t){const s=t.images&&t.images.length>0?t.images:[],o=s.length>0?s[0]:null,u=o?`<img id="main-image" src="${o}" alt="${t.name}" class="w-full h-full object-cover transition-opacity duration-300" />`:`<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                           <span class="material-symbols-outlined text-6xl">inventory_2</span>
                       </div>`;let n="";s.length>1&&(n=`
                        <div class="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                            ${s.map((e,a)=>`
                                <button class="thumbnail-btn relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${a===0?"border-primary":"border-transparent hover:border-gray-300 dark:hover:border-gray-600"}" 
                                    data-src="${e}" aria-label="View image ${a+1}">
                                    <img src="${e}" alt="Thumbnail ${a+1}" class="w-full h-full object-cover" />
                                </button>
                            `).join("")}
                        </div>
                    `),r.innerHTML=`
                    <div class="flex flex-col md:flex-row gap-8 lg:gap-16">
                        <!-- Image Gallery -->
                        <div class="w-full md:w-1/2">
                            <div class="aspect-[4/5] w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-xl relative">
                                ${u}
                            </div>
                            ${n}
                        </div>
                        
                        <!-- Details -->
                        <div class="w-full md:w-1/2 flex flex-col justify-center">
                            <div class="mb-6">
                                <span class="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                                    ${t.categories?.name||"Product"}
                                </span>
                                <h1 class="text-3xl md:text-5xl font-black leading-tight mb-4 text-gray-900 dark:text-white">${t.name}</h1>
                                <p class="text-2xl font-bold text-primary">₱${Number(t.price).toFixed(2)}</p>
                                <div class="mt-2 text-sm">
                                    <span class="${(t.inventory_count||0)<5?"text-red-500 font-bold":"text-gray-500"}">
                                        ${t.inventory_count||0} in stock
                                    </span>
                                </div>
                            </div>
                            
                            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                ${t.description||"No description available."}
                            </p>
                            
                            <div class="flex gap-4">
                                <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-12 px-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                                     <input type="number" id="quantity" value="1" min="1" class="w-12 bg-transparent border-none text-center focus:ring-0 p-0" />
                                </div>
                                <button id="add-to-cart" class="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined">shopping_cart</span>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;const p=document.getElementById("add-to-cart"),g=document.getElementById("quantity"),l=document.getElementById("main-image"),d=document.querySelectorAll(".thumbnail-btn");d.forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-src");a&&l&&(l.style.opacity="0",setTimeout(()=>{l.src=a,l.style.opacity="1"},300),d.forEach(c=>{c.classList.remove("border-primary"),c.classList.add("border-transparent")}),e.classList.remove("border-transparent"),e.classList.add("border-primary"))})}),p?.addEventListener("click",()=>{const e=parseInt(g.value)||1;h.addItem(t,e),b.show("Added to cart!","success")})}else i()}catch(t){console.error(t),i()}else r&&i("Product ID Missing")})();function i(t="Product Not Found"){r&&(r.innerHTML=`
        <div class="text-center py-20">
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${t}</h2>
            <a href="/pages/shop.html" class="text-primary hover:underline">Back to Shop</a>
        </div>
    `)}
