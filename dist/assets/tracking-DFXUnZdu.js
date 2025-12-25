import"./supabase-w99FfbcE.js";import{T as l}from"./toast-CErdx8Qf.js";import{O as x}from"./order.service-OlqknHmw.js";const y=document.getElementById("tracking-form"),u=document.getElementById("tracking-input"),t=document.getElementById("tracking-result"),b=y.querySelector("button");y.addEventListener("submit",async e=>{e.preventDefault();const d=u.value.trim();if(!d){l.show("Please enter a tracking number","error");return}o(!0);try{const r=await x.getOrderByTracking(d);r?m(r):(n("Order not found. Please check your tracking number."),l.show("Order not found","error"))}catch(r){console.error(r),n("Failed to fetch tracking details. Please try again."),l.show("Error fetching order","error")}finally{o(!1)}});const v=new URLSearchParams(window.location.search),p=v.get("number");p&&(u&&(u.value=p),(async()=>{o(!0);try{const e=await x.getOrderByTracking(p);e?m(e):(n("Order not found. Please check your tracking number."),l.show("Order not found","error"))}catch(e){console.error(e),n("Failed to fetch tracking details. Please try again.")}finally{o(!1)}})());function o(e){b&&(b.disabled=e,b.textContent=e?"Searching...":"Track"),t&&e&&(t.innerHTML=`
                <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                    <div class="animate-pulse space-y-6">
                        <div class="flex justify-between">
                            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                        </div>
                        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                    </div>
                 </div>
            `,t.classList.remove("hidden"))}function n(e){t&&(t.innerHTML=`
            <div class="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30 text-center">
                <span class="material-symbols-outlined text-4xl text-red-500 mb-2">search_off</span>
                <p class="text-red-700 dark:text-red-300 font-medium">${e}</p>
            </div>
        `,t.classList.remove("hidden"))}function m(e){if(!t)return;const d=[{key:"approved",label:"Order Approved",icon:"check_circle"},{key:"in_production",label:"In Production",icon:"palette"},{key:"quality_check",label:"Quality Check",icon:"verified"},{key:"shipped",label:"Shipped",icon:"local_shipping"},{key:"delivered",label:"Delivered",icon:"package_2"}];let r=0;const s=e.status;if(s==="pending"||s==="paid"?r=0:s==="in_production"?r=1:s==="quality_check"?r=2:s==="shipped"?r=3:s==="delivered"||s==="completed"?r=4:s==="cancelled"&&(r=-1),r===-1){t.innerHTML=`
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl text-center">
                <div class="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4">
                    <span class="material-symbols-outlined text-3xl">cancel</span>
                </div>
                <h2 class="text-2xl font-bold mb-2">Order Cancelled</h2>
                <p class="text-gray-500">This order has been cancelled. Please contact support if you have questions.</p>
             </div>
        `,t.classList.remove("hidden");return}if(e.status==="pending"||e.status==="paid"){t.innerHTML=`
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl text-center max-w-2xl mx-auto">
                <div class="inline-flex p-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-6 animate-pulse">
                    <span class="material-symbols-outlined text-4xl">hourglass_top</span>
                </div>
                <h2 class="text-3xl font-black mb-4 text-gray-900 dark:text-white">Order Received!</h2>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Thank you for your order <b>#${e.id.slice(0,8)}</b>. We are currently reviewing your request. 
                    <br class="hidden md:block" />
                    You will be able to track the production progress right here once it is approved.
                </p>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span class="material-symbols-outlined text-primary">info</span>
                    Status: <span class="font-bold uppercase tracking-wider">Awaiting Approval</span>
                </div>
             </div>
        `,t.classList.remove("hidden");return}t.innerHTML=`
        <div class="space-y-8 animate-fade-in">
            <!-- Order Status Card -->
            <div class="overflow-hidden rounded-3xl bg-white dark:bg-[#151c2b] shadow-xl border border-gray-100 dark:border-gray-800">
                <!-- Card Header -->
                <div class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a2333]/50 px-6 py-6 sm:px-10 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">#${e.id.slice(0,8)}</h3>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                        <h3 class="text-xl font-bold text-primary">Calculating...</h3>
                    </div>
                </div>

                <!-- Progress Bar Visual -->
                <div class="px-6 py-12 sm:px-10">
                    <div class="relative">
                        <!-- Line Background -->
                        <div class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <!-- Active Line -->
                        <div class="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-1000 ease-out" style="width: ${r/(d.length-1)*100}%"></div>
                        
                        <!-- Steps Container -->
                        <div class="relative flex justify-between">
                            ${d.map((a,i)=>{const c=i<=r,g=i===r;return`
                                <div class="flex flex-col items-center gap-3 relative group">
                                    <div class="flex size-10 md:size-12 items-center justify-center rounded-full transition-all duration-500 z-10 
                                        ${c?"bg-primary text-white shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-[#151c2b]":"bg-gray-200 dark:bg-gray-700 text-gray-400 ring-4 ring-white dark:ring-[#151c2b]"}
                                        ${g?"scale-110 ring-offset-2 ring-offset-primary/20":""}
                                    ">
                                        
                                        ${g?'<span class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white dark:bg-[#151c2b]"><span class="size-2.5 rounded-full bg-green-500 animate-pulse"></span></span>':""}
                                        <span class="material-symbols-outlined text-lg md:text-xl">${a.icon}</span>
                                    </div>
                                    <div class="text-center absolute top-14 w-32 ${g?"block":"hidden md:block"}">
                                        <p class="text-sm font-bold ${c?"text-gray-900 dark:text-white":"text-gray-400"}">${a.label}</p>
                                        ${c?'<p class="text-xs text-gray-500 dark:text-gray-400">Completed</p>':""}
                                    </div>
                                </div>
                                `}).join("")}
                        </div>
                    </div>
                </div>

                <!-- Current Location Banner (Mocked) -->
                ${r>=3?`
                <div class="bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20 px-6 py-4 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
                    <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-primary">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Package is in transit</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Your order is on its way to the delivery address.</p>
                    </div>
                </div>
                `:""}
            </div>

            <!-- Two Column Layout Details -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Col: Tracking History -->
                <div class="lg:col-span-2 space-y-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Tracking History</h3>
                    <div class="rounded-2xl bg-white dark:bg-[#151c2b] border border-gray-100 dark:border-gray-800 p-6 shadow-md">
                        <div class="relative space-y-0">
                             <!-- Generate History based on current step downwards -->
                             ${d.slice(0,r+1).reverse().map((a,i)=>`
                                <div class="flex gap-4 pb-8 relative group last:pb-0">
                                    <!-- Vertical Line -->
                                    <div class="absolute left-[19px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800 group-last:hidden"></div>
                                    
                                    <div class="flex-shrink-0 mt-1">
                                        <div class="size-10 rounded-full ${i===0?"bg-blue-100 dark:bg-blue-900/30 text-primary":"bg-gray-100 dark:bg-gray-800 text-gray-400"} flex items-center justify-center border-4 border-white dark:border-[#151c2b] shadow-sm">
                                            <span class="material-symbols-outlined text-xl">${a.icon}</span>
                                        </div>
                                    </div>
                                    <div class="flex-grow pt-2">
                                        <div class="flex justify-between items-start mb-1">
                                            <h4 class="font-bold text-gray-900 dark:text-white">${a.label}</h4>
                                            <span class="text-sm font-medium text-gray-500 lg:hidden">Verified</span>
                                        </div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Status updated successfully.</p>
                                    </div>
                                </div>
                             `).join("")}
                        </div>
                    </div>
                </div>

                <!-- Right Col: Order Items & Help -->
                <div class="space-y-6">
                    <!-- Order Items -->
                    <div class="rounded-2xl bg-white dark:bg-[#151c2b] border border-gray-100 dark:border-gray-800 p-6 shadow-md">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Order</h3>
                        <div class="space-y-4">
                            ${e.items?.map(a=>`
                            <div class="flex gap-3 items-center">
                                <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                    <img class="object-cover w-full h-full" src="${a.products?.images?.[0]||""}" alt="${a.products?.name}">
                                </div>
                                <div>
                                    <p class="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">${a.products?.name}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Qty: ${a.quantity} • ₱${a.unit_price}</p>
                                </div>
                            </div>
                            `).join("")||'<p class="text-sm text-gray-500">No items found</p>'}
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                            <span class="text-base font-bold text-gray-900 dark:text-white">₱${e.total_amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <!-- Help Section -->
                    <div class="rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 text-center">
                        <div class="mx-auto size-12 rounded-full bg-white dark:bg-[#151c2b] text-primary flex items-center justify-center shadow-sm mb-3">
                            <span class="material-symbols-outlined">support_agent</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Need Help?</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Having issues with your delivery? Our support team is here for you.
                        </p>
                        <button class="w-full rounded-lg bg-white dark:bg-[#151c2b] border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,t.classList.remove("hidden")}
