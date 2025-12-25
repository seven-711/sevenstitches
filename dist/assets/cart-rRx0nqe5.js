const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/header-BXuXbyNE.js","assets/auth.service-B-BoZdmw.js","assets/supabase-w99FfbcE.js","assets/toast-CErdx8Qf.js","assets/category.service-ILwE1iue.js"])))=>i.map(i=>d[i]);
import"./supabase-w99FfbcE.js";import{_ as i}from"./preload-helper-BXl3LOEh.js";/* empty css              */import{C as r}from"./cart-CK-ISstg.js";if(!customElements.get("app-header")){const{AppHeader:e}=await i(async()=>{const{AppHeader:a}=await import("./header-BXuXbyNE.js");return{AppHeader:a}},__vite__mapDeps([0,1,2,3,4]));customElements.define("app-header",e)}const n=document.getElementById("cart-items"),l=document.getElementById("cart-subtotal"),d=document.getElementById("cart-total");function o(){const e=r.getItems(),a=r.getTotal();if(l&&(l.textContent=`₱${a.toFixed(2)}`),d&&(d.textContent=`₱${a.toFixed(2)}`),n){if(e.length===0){n.innerHTML=`
                <div class="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                    <p class="text-gray-500 mb-4">Your cart is empty</p>
                    <a href="/pages/shop.html" class="text-primary font-bold hover:underline">Continue Shopping</a>
                </div>
            `;return}n.innerHTML=e.map(t=>{const s=t.images?.[0]||"";return`
            <div class="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 items-center">
                <div class="size-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    ${s?`<img src="${s}" alt="${t.name}" class="w-full h-full object-cover" />`:`<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                    <span class="material-symbols-outlined text-2xl">inventory_2</span>
                   </div>`}
                </div>
                <div class="flex-1">
                    <h3 class="font-bold leading-tight line-clamp-1">${t.name}</h3>
                    <p class="text-sm text-gray-500">₱${t.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-3">
                     <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-8 px-2 bg-gray-50 dark:bg-slate-800">
                        <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${t.id}', ${t.quantity-1})">-</button>
                        <span class="w-6 text-center text-sm font-bold">${t.quantity}</span>
                        <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${t.id}', ${t.quantity+1})">+</button>
                     </div>
                     <button class="size-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors" onclick="window.removeItem('${t.id}')">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                     </button>
                </div>
            </div>
        `}).join("")}}window.updateQty=(e,a)=>{r.updateQuantity(e,a),o()};window.removeItem=e=>{r.removeItem(e),o()};o();
