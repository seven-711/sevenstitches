const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/header-BXuXbyNE.js","assets/auth.service-B-BoZdmw.js","assets/supabase-w99FfbcE.js","assets/toast-CErdx8Qf.js","assets/category.service-ILwE1iue.js"])))=>i.map(i=>d[i]);
import"./supabase-w99FfbcE.js";import{_ as o}from"./preload-helper-BXl3LOEh.js";/* empty css              */import{P as l}from"./product.service-oboCqACv.js";customElements.get("app-header")||o(async()=>{const{AppHeader:t}=await import("./header-BXuXbyNE.js");return{AppHeader:t}},__vite__mapDeps([0,1,2,3,4])).then(({AppHeader:t})=>{customElements.get("app-header")||customElements.define("app-header",t)});const a=document.getElementById("product-grid");(async()=>{if(a)try{const t=await l.getProducts();if(t.length===0){a.innerHTML='<p class="col-span-full text-center text-gray-500 py-10">No products available at the moment.</p>';return}a.innerHTML=t.map(e=>{const r=e.images?.[0]||null,s=r?`background-image: url('${r}');`:"",n=r?"":`
                    <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                        <span class="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>`;return`
                <a href="/pages/product.html?id=${e.id}" class="group flex flex-col gap-3">
                  <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <div class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style="${s}">
                      ${n}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                      <span class="bg-white text-black text-sm font-bold py-2 px-6 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-lg leading-tight group-hover:text-primary transition-colors">${e.name}</h3>
                      <span class="font-bold text-primary">₱${e.price?Number(e.price).toFixed(2):"0.00"}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500">
                      <span>${e.categories?.name||"Product"}</span>
                      <span class="${(e.inventory_count||0)<5?"text-red-500 font-medium":""}">${e.inventory_count||0} in stock</span>
                    </div> 
                  </div>
                </a>
                `}).join("")}catch(t){console.error(t),a.innerHTML='<p class="col-span-full text-center text-red-500">Failed to load products.</p>'}})();
