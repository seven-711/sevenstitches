import{s as p}from"./supabase-w99FfbcE.js";import{_ as q}from"./preload-helper-BXl3LOEh.js";import{A as $}from"./auth.service-B-BoZdmw.js";import{P as S}from"./product.service-oboCqACv.js";import{C as h}from"./category.service-ILwE1iue.js";import{O as I}from"./order.service-OlqknHmw.js";import{T as _}from"./toast-CErdx8Qf.js";class T{static async getStats(){const{data:t,error:r}=await p.from("orders").select("total_amount, status, created_at");if(r)throw r;const a=new Date,d=new Date;d.setDate(a.getDate()-30);const o=new Date;o.setDate(a.getDate()-7);let s=0,i=0,n=0;const c={};for(let g=0;g<30;g++){const m=new Date;m.setDate(a.getDate()-g);const f=m.toISOString().split("T")[0];c[f]=0}t?.forEach(g=>{const m=Number(g.total_amount)||0,f=new Date(g.created_at);if(s+=m,f>=d){i+=m;const U=f.toISOString().split("T")[0];c[U]!==void 0&&(c[U]+=m)}f>=o&&(n+=m)});const l=Object.keys(c).sort().map(g=>({date:g,amount:c[g]})),u=t?.length||0,x=t?.filter(g=>g.status==="pending").length||0,v=t?.filter(g=>["pending","approved","in_production","quality_check"].includes(g.status)).length||0,y=t?.filter(g=>["shipped","delivered","completed"].includes(g.status)).length||0,J=t?.filter(g=>g.status==="pending").length||0,Q=0,Y=t?.filter(g=>g.status==="cancelled").length||0,X=0,{data:D,error:N}=await p.from("products").select("status, inventory_count");if(N)throw N;const tt=D?.filter(g=>g.status==="active").length||0,et=D?.filter(g=>g.status!=="active").length||0,rt=D?.filter(g=>g.status==="active"&&(g.inventory_count||0)<=0).length||0;return{revenue:s,revenueMonth:i,revenueWeek:n,revenueChartData:l,totalOrders:u,activeProducts:tt,pendingOrders:x,deliveryProcessing:v,deliveryProcessed:y,paymentUnpaid:J,paymentPromo:Q,productBlocked:et,productSoldOut:rt,responseCancellation:Y,responseReturn:X}}static async getRecentOrders(){const{data:t,error:r}=await p.from("orders").select("id, customer_email, total_amount, status").order("created_at",{ascending:!1}).limit(5);if(r)throw r;return t}static async getTopProducts(){const{data:t,error:r}=await p.from("order_items").select("product_id, quantity");if(r)throw r;const a={};t?.forEach(i=>{a[i.product_id]=(a[i.product_id]||0)+i.quantity});const d=Object.keys(a).sort((i,n)=>a[n]-a[i]).slice(0,3);if(d.length===0)return[];const{data:o,error:s}=await p.from("products").select("id, name, price, category_id").in("id",d);if(s)throw s;return d.map(i=>{const n=o?.find(c=>c.id===i);return{name:n?n.name:"Unknown Product",category:"Best Seller",quantity:a[i]||0}})}}async function z(e){try{const t=await T.getStats(),r=await T.getRecentOrders(),a=await T.getTopProducts();e.innerHTML=`
        <!-- Status Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Delivery -->
            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        <span class="material-icons-round text-xl">local_shipping</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Delivery</span>
                </div>
                <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div class="text-center border-r border-gray-100 dark:border-gray-700">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.deliveryProcessing}</h3>
                        <p class="text-xs text-gray-500">Processing</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.deliveryProcessed}</h3>
                        <p class="text-xs text-gray-500">Processed</p>
                    </div>
                </div>
            </div>

            <!-- Payment -->
            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        <span class="material-icons-round text-xl">payments</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Payment</span>
                </div>
                <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div class="text-center border-r border-gray-100 dark:border-gray-700">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.paymentUnpaid}</h3>
                        <p class="text-xs text-gray-500">Not yet paid</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.paymentPromo}</h3>
                        <p class="text-xs text-gray-500">Promo</p>
                    </div>
                </div>
            </div>

            <!-- Product -->
            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        <span class="material-icons-round text-xl">inventory_2</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Product</span>
                </div>
                <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div class="text-center border-r border-gray-100 dark:border-gray-700">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.productBlocked}</h3>
                        <p class="text-xs text-gray-500">Product block</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.productSoldOut}</h3>
                        <p class="text-xs text-gray-500">Sold out</p>
                    </div>
                </div>
            </div>

            <!-- Response -->
            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
                        <span class="material-icons-round text-xl">rate_review</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">Response</span>
                </div>
                <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div class="text-center border-r border-gray-100 dark:border-gray-700">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.responseCancellation}</h3>
                        <p class="text-xs text-gray-500">Cancelation</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${t.responseReturn}</h3>
                        <p class="text-xs text-gray-500">Return</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Revenue Analytics (Previous Section) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Revenue</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${t.revenue.toLocaleString("en-PH",{minimumFractionDigits:2})}</h3>
                    </div>
                    <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                        <span class="material-icons-round text-xl">payments</span>
                    </div>
                </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Past 30 Days</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${t.revenueMonth.toLocaleString("en-PH",{minimumFractionDigits:2})}</h3>
                    </div>
                    <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <span class="material-icons-round text-xl">calendar_month</span>
                    </div>
                </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Past 7 Days</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${t.revenueWeek.toLocaleString("en-PH",{minimumFractionDigits:2})}</h3>
                    </div>
                    <div class="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                        <span class="material-icons-round text-xl">date_range</span>
                    </div>
                </div>
            </div>

            <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div class="flex justify-between items-start mb-4 relative">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Orders</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${t.totalOrders}</h3>
                    </div>
                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <span class="material-icons-round text-xl">shopping_bag</span>
                    </div>
                </div>
            </div>
            
            <!-- Pending Orders -->
             <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
                <div class="flex justify-between items-start mb-4 relative">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pending</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${t.pendingOrders}</h3>
                    </div>
                    <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <span class="material-icons-round text-xl">pending_actions</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="mb-8 p-6 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Growth (Last 30 Days)</h2>
            <div class="relative h-64 w-full">
                <canvas id="revenueChart"></canvas>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Recent Orders -->
            <div class="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                                <th class="px-6 py-4">Order ID</th>
                                <th class="px-6 py-4">Customer</th>
                                <th class="px-6 py-4">Amount</th>
                                <th class="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            ${r.length>0?r.map(d=>`
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">#${d.id.slice(0,8)}</td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${d.customer_email||"Guest"}</td>
                                <td class="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">₱${Number(d.total_amount).toFixed(2)}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${d.status==="pending"?"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300":d.status==="paid"?"bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300":"bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300"}">
                                        ${d.status}
                                    </span>
                                </td>
                            </tr>
                            `).join(""):`
                            <tr>
                                <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No orders yet.
                                </td>
                            </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Top Products -->
            <div class="lg:col-span-1 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white">Top Selling Products</h2>
                </div>
                <div class="p-6">
                    <ul class="space-y-4">
                        ${a.length>0?a.map((d,o)=>{const s=["bg-blue-100 text-blue-600","bg-purple-100 text-purple-600","bg-pink-100 text-pink-600"],i=s[o%s.length];let n="inventory_2";return(d.name.toLowerCase().includes("shirt")||d.name.toLowerCase().includes("top"))&&(n="checkroom"),(d.name.toLowerCase().includes("toy")||d.name.toLowerCase().includes("bear"))&&(n="toys"),`
                            <li class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 ${i} dark:bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                                        <span class="material-icons-round text-lg">${n}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">${d.name}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${d.category||"Product"}</p>
                                    </div>
                                </div>
                                <span class="font-bold text-gray-900 dark:text-white text-sm">${d.quantity} sold</span>
                            </li>
                        `}).join(""):`
                                                        < li class="text-center text-gray-500 text-sm py-4" > No top products yet.</li>
                                                            `}
                    </ul>
                </div>
            </div>
        </div>
    `;try{const{Chart:d}=await q(async()=>{const{Chart:s}=await import("./auto-CPGI3frw.js");return{Chart:s}},[]),o=document.getElementById("revenueChart")?.getContext("2d");o&&new d(o,{type:"line",data:{labels:t.revenueChartData.map(s=>new Date(s.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})),datasets:[{label:"Revenue",data:t.revenueChartData.map(s=>s.amount),borderColor:"#3b82f6",backgroundColor:"rgba(59, 130, 246, 0.1)",borderWidth:2,fill:!0,tension:.4,pointRadius:0,pointHoverRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{callbacks:{label:s=>{let i=s.dataset.label||"";return i&&(i+=": "),s.parsed.y!==null&&(i+=new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(s.parsed.y)),i}}}},scales:{y:{beginAtZero:!0,grid:{display:!0},border:{display:!1},ticks:{callback:function(s){return new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP",maximumSignificantDigits:3}).format(Number(s))}}},x:{grid:{display:!1}}}}})}catch(d){console.error("Failed to load chart",d)}}catch(t){console.error("Dashboard Error:",t),e.innerHTML=`
            <div class="p-8 text-center text-red-500">
                <p class="font-bold">Failed to load dashboard data</p>
                <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">${t.message||JSON.stringify(t)}</p>
                <p class="text-xs mt-4 text-gray-400">Please check console for more details.</p>
            </div>`}}class at{static BUCKET="product-images";static async uploadImage(t){const r=t.name.split(".").pop(),d=`${`${Date.now()}-${Math.random().toString(36).substring(2)}.${r}`}`,{error:o}=await p.storage.from(this.BUCKET).upload(d,t);if(o)throw console.error("Upload Error:",o),o;const{data:s}=p.storage.from(this.BUCKET).getPublicUrl(d);return s.publicUrl}}let P=[],G=[],w=[],k=[];async function dt(e){e.innerHTML=`
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <button id="btn-add-product" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-icons-round text-xl">add</span> Add Product
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inventory</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading products...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Container (Hidden) -->
        <div id="product-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="modal-title" class="text-xl font-bold">Add Product</h2>
                    <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="product-form" class="space-y-4">
                        <input type="hidden" id="product_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Price</label>
                                <input type="number" id="price" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Inventory</label>
                                <input type="number" id="inventory_count" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="">Select Category</option>
                                <!-- Options populated dynamically -->
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                            
                            <!-- Drop Zone -->
                            <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer relative group mb-4">
                                <input type="file" id="image-file-input" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                
                                <div id="drop-zone-content" class="space-y-2">
                                    <span class="material-icons-round text-4xl text-gray-400 group-hover:text-primary">cloud_upload</span>
                                    <p class="text-sm text-gray-500">Drag & drop images here, or click to upload</p>
                                    <p class="text-xs text-gray-400">PNG, JPG up to 5MB (Multiple allowed)</p>
                                </div>
                            </div>

                            <!-- Image Preview Grid -->
                            <div id="image-preview-grid" class="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                <!-- Previews injected here -->
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Theme Color</label>
                                <select id="theme_color" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="">Default (Blue)</option>
                                    <option value="green">Green</option>
                                    <option value="pink">Pink</option>
                                    <option value="purple">Purple</option>
                                    <option value="red">Red</option>
                                    <option value="cream">Cream (#FEEAC9)</option>
                                    <option value="coral">Coral (#FD7979)</option>
                                    <option value="yellow">Yellow</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" id="btn-save" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                                <span>Save Product</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,st(),document.getElementById("btn-add-product")?.addEventListener("click",()=>W()),document.getElementById("btn-close-modal")?.addEventListener("click",O),document.getElementById("btn-cancel")?.addEventListener("click",O),document.getElementById("product-form")?.addEventListener("submit",async t=>{t.preventDefault(),await nt()}),G=await h.getCategories(),await A()}function st(){const e=document.getElementById("image-file-input"),t=document.getElementById("drop-zone");!e||!t||(e.addEventListener("change",r=>{const a=r.target.files;a&&a.length>0&&ot(a),e.value=""}),t.addEventListener("dragenter",()=>t.classList.add("border-primary","bg-blue-50")),t.addEventListener("dragleave",()=>t.classList.remove("border-primary","bg-blue-50")),t.addEventListener("drop",()=>t.classList.remove("border-primary","bg-blue-50")))}function ot(e){for(let t=0;t<e.length;t++){const r=e[t];r.type.startsWith("image/")&&w.push(r)}E()}function E(){const e=document.getElementById("image-preview-grid");e&&(e.innerHTML="",k.forEach((t,r)=>{const a=document.createElement("div");a.className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group",a.innerHTML=`
            <img src="${t}" class="w-full h-full object-cover">
            <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
                onclick="window.removeExistingImage(${r})">
                <span class="material-icons-round text-xs">close</span>
            </button>
        `,e.appendChild(a)}),w.forEach((t,r)=>{const a=new FileReader;a.onload=d=>{const o=document.createElement("div");o.className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group",o.innerHTML=`
                <img src="${d.target?.result}" class="w-full h-full object-cover">
                <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
                    onclick="window.removeNewImage(${r})">
                    <span class="material-icons-round text-xs">close</span>
                </button>
            `,e.appendChild(o)},a.readAsDataURL(t)}),window.removeExistingImage=t=>{k.splice(t,1),E()},window.removeNewImage=t=>{w.splice(t,1),E()})}function V(){w=[],k=[],E()}async function A(){const e=document.getElementById("products-table-body");if(e)try{if(P=await S.getProducts(),P.length===0){e.innerHTML='<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No products found. Add one to get started.</td></tr>';return}e.innerHTML=P.map(t=>`
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                            ${t.images?.[0]?`<img class="h-10 w-10 rounded-lg object-cover" src="${t.images?.[0]}" alt="">`:'<div class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">?</div>'}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${t.name}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${t.slug||""}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">₱${t.price}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${it(t.status)}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${t.inventory_count}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editProduct('${t.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deleteProduct('${t.id}')">Delete</button>
                </td>
            </tr>
        `).join(""),window.editProduct=t=>{const r=P.find(a=>a.id===t);r&&W(r)},window.deleteProduct=async t=>{if(confirm("Are you sure you want to delete this product?"))try{await S.deleteProduct(t),await A()}catch(r){console.error("Failed to delete",r),alert("Failed to delete product")}}}catch(t){console.error("Error loading products",t),e.innerHTML='<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading products. Check console.</td></tr>'}}function it(e){switch(e){case"active":return"bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";case"draft":return"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";case"archived":return"bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300";default:return"bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300"}}function W(e){const t=document.getElementById("product-modal"),r=document.getElementById("modal-title"),a=document.getElementById("product-form"),d=document.getElementById("category_id");!t||!r||!a||!d||(V(),d.innerHTML='<option value="">Select Category</option>'+G.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),a.reset(),document.getElementById("product_id").value="",e?(r.textContent="Edit Product",document.getElementById("product_id").value=e.id,document.getElementById("name").value=e.name,document.getElementById("price").value=e.price.toString(),document.getElementById("inventory_count").value=e.inventory_count.toString(),document.getElementById("description").value=e.description||"",document.getElementById("status").value=e.status,document.getElementById("theme_color").value=e.theme_color||"",d.value=e.category_id||"",k=e.images?[...e.images]:[],E()):(r.textContent="Add Product",r.textContent="Add Product",document.getElementById("status").value="active",document.getElementById("theme_color").value=""),t.classList.remove("hidden"))}function O(){document.getElementById("product-modal")?.classList.add("hidden"),V()}async function nt(){const e=document.getElementById("btn-save"),t=e?e.innerHTML:"Save";e&&(e.disabled=!0,e.innerHTML='<span class="material-icons-round animate-spin text-sm">refresh</span> Saving...');try{const r=document.getElementById("product_id").value,a=document.getElementById("name").value,d=parseFloat(document.getElementById("price").value),o=parseInt(document.getElementById("inventory_count").value),s=document.getElementById("category_id").value||void 0,i=document.getElementById("description").value,n=document.getElementById("status").value,c=document.getElementById("theme_color").value,l=[];for(const v of w)try{const y=await at.uploadImage(v);l.push(y)}catch(y){throw console.error("Upload failed for file",v.name,y),alert(`Failed to upload image ${v.name}.`),y}const u=[...k,...l],x={name:a,slug:a.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,""),price:d,inventory_count:o,category_id:s,description:i,images:u,status:n,theme_color:c};r?await S.updateProduct(r,x):await S.createProduct(x),O(),await A()}catch(r){console.error("Failed to save",r),alert("Failed to save product: "+(r.message||"Unknown error"))}finally{e&&(e.disabled=!1,e.innerHTML=t)}}async function lt(e){e.innerHTML=`
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <button id="btn-add-category" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                 <span class="material-icons-round text-xl">add</span> Add Category
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categories-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading categories...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="category-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-md mx-4">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="cat-modal-title" class="text-xl font-bold">Add Category</h2>
                    <button id="btn-close-cat-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="category-form" class="space-y-4">
                        <input type="hidden" id="category_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="cat_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="cat_description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel-cat" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Category</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,document.getElementById("btn-add-category")?.addEventListener("click",()=>K()),document.getElementById("btn-close-cat-modal")?.addEventListener("click",j),document.getElementById("btn-cancel-cat")?.addEventListener("click",j),document.getElementById("category-form")?.addEventListener("submit",async t=>{t.preventDefault(),await ct()}),await H()}let B=[];async function H(){const e=document.getElementById("categories-table-body");if(e)try{if(B=await h.getCategories(),B.length===0){e.innerHTML='<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No categories found.</td></tr>';return}e.innerHTML=B.map(t=>`
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${t.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${t.slug}</td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">${t.description||"-"}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editCategory('${t.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deleteCategory('${t.id}')">Delete</button>
                </td>
            </tr>
        `).join(""),window.editCategory=t=>{const r=B.find(a=>a.id===t);r&&K(r)},window.deleteCategory=async t=>{if(confirm("Delete this category?"))try{await h.deleteCategory(t),await H()}catch(r){console.error(r),alert("Failed to delete category")}}}catch(t){console.error(t),e.innerHTML='<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading categories.</td></tr>'}}function K(e){const t=document.getElementById("category-modal"),r=document.getElementById("cat-modal-title"),a=document.getElementById("category-form");!t||!r||!a||(a.reset(),document.getElementById("category_id").value="",e?(r.textContent="Edit Category",document.getElementById("category_id").value=e.id,document.getElementById("cat_name").value=e.name,document.getElementById("cat_description").value=e.description||""):r.textContent="Add Category",t.classList.remove("hidden"))}function j(){document.getElementById("category-modal")?.classList.add("hidden")}async function ct(){const e=document.getElementById("category_id").value,t=document.getElementById("cat_name").value,r=document.getElementById("cat_description").value,a={name:t,slug:t.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,""),description:r};try{e?await h.updateCategory(e,a):await h.createCategory(a),j(),await H()}catch(d){console.error(d),alert("Failed to save category")}}class L{static async getPosts(){const{data:t,error:r}=await p.from("blog_posts").select("*").order("created_at",{ascending:!1});if(r)throw r;return t}static async getPostById(t){const{data:r,error:a}=await p.from("blog_posts").select("*").eq("id",t).single();if(a)throw a;return r}static async createPost(t){const{data:r,error:a}=await p.from("blog_posts").insert([t]).select().single();if(a)throw a;return r}static async updatePost(t,r){const{data:a,error:d}=await p.from("blog_posts").update(r).eq("id",t).select().single();if(d)throw d;return a}static async deletePost(t){const{error:r}=await p.from("blog_posts").delete().eq("id",t);if(r)throw r;return!0}}async function gt(e){e.innerHTML=`
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
            <button id="btn-add-post" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                 <span class="material-icons-round text-xl">add</span> New Post
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="blog-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading posts...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="blog-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="blog-modal-title" class="text-xl font-bold">New Post</h2>
                    <button id="btn-close-blog-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="blog-form" class="space-y-4">
                        <input type="hidden" id="post_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="post_title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Excerpt</label>
                            <textarea id="post_excerpt" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Content</label>
                            <textarea id="post_content" rows="12" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-mono"></textarea>
                        </div>

                        <div class="flex items-center">
                            <input type="checkbox" id="post_published" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="post_published" class="ml-2 block text-sm text-gray-900">Publish immediately</label>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel-blog" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Post</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,document.getElementById("btn-add-post")?.addEventListener("click",()=>Z()),document.getElementById("btn-close-blog-modal")?.addEventListener("click",M),document.getElementById("btn-cancel-blog")?.addEventListener("click",M),document.getElementById("blog-form")?.addEventListener("submit",async t=>{t.preventDefault(),await ut()}),await F()}let C=[];async function F(){const e=document.getElementById("blog-table-body");if(e)try{if(C=await L.getPosts(),C.length===0){e.innerHTML='<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No posts found.</td></tr>';return}e.innerHTML=C.map(t=>`
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${t.title}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">${t.slug}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${t.published?"bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300":"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"}">
                        ${t.published?"Published":"Draft"}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${new Date(t.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editPost('${t.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deletePost('${t.id}')">Delete</button>
                </td>
            </tr>
        `).join(""),window.editPost=t=>{const r=C.find(a=>a.id===t);r&&Z(r)},window.deletePost=async t=>{if(confirm("Delete this post?"))try{await L.deletePost(t),await F()}catch(r){console.error(r),alert("Failed to delete post")}}}catch(t){console.error(t),e.innerHTML='<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading posts.</td></tr>'}}function Z(e){const t=document.getElementById("blog-modal"),r=document.getElementById("blog-modal-title"),a=document.getElementById("blog-form");!t||!r||!a||(a.reset(),document.getElementById("post_id").value="",e?(r.textContent="Edit Post",document.getElementById("post_id").value=e.id,document.getElementById("post_title").value=e.title,document.getElementById("post_excerpt").value=e.excerpt||"",document.getElementById("post_content").value=e.content||"",document.getElementById("post_published").checked=e.published):r.textContent="New Post",t.classList.remove("hidden"))}function M(){document.getElementById("blog-modal")?.classList.add("hidden")}async function ut(){const e=document.getElementById("post_id").value,t=document.getElementById("post_title").value,r=document.getElementById("post_excerpt").value,a=document.getElementById("post_content").value,d=document.getElementById("post_published").checked,o={title:t,slug:t.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,""),excerpt:r,content:a,published:d,published_at:d?new Date().toISOString():void 0};try{e?await L.updatePost(e,o):await L.createPost(o),M(),await F()}catch(s){console.error(s),alert("Failed to save post")}}async function pt(e){try{const t=await I.getAllOrders(),r=await I.getOrderStats();e.innerHTML=`
        <div class="flex-1 w-full max-w-[1400px] mx-auto">
            <!-- Page Heading -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 class="text-3xl font-black tracking-tight text-[#0d121b] dark:text-white mb-2">Orders Management</h2>
                    <p class="text-[#4c669a] dark:text-gray-400 text-base">Track orders and analyze customer purchasing behavior for better insights.</p>
                </div>
                <button class="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold h-10 px-5 shadow-sm transition-all active:scale-95">
                    <span class="material-icons-round text-[20px]">download</span>
                    <span>Export Orders</span>
                </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">₱${r.totalRevenue.toLocaleString()}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Avg. Order Value</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">₱${r.avgOrderValue.toFixed(2)}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Total Orders</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">${r.totalOrders}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Pending Orders</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">${r.pendingOrders}</h3>
                        <span class="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">Action Needed</span>
                    </div>
                </div>
            </div>

            <!-- Filters and Search -->
            <div class="flex flex-col lg:flex-row gap-4 mb-6 bg-white dark:bg-[#151c2b] p-4 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm">
                <!-- Search -->
                <div class="relative flex-1 min-w-[280px]">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="material-icons-round text-gray-400">search</span>
                    </div>
                    <input class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Search orders, customers, or products..." type="text"/>
                </div>
                <!-- Filter Group -->
                <div class="flex flex-wrap gap-3 items-center">
                    <select class="form-select block w-40 pl-3 pr-10 py-2.5 text-base border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg text-gray-700 dark:text-gray-300">
                        <option>All Customers</option>
                        <option>New Customers</option>
                        <option>Repeat Customers</option>
                    </select>
                    <select class="form-select block w-36 pl-3 pr-10 py-2.5 text-base border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg text-gray-700 dark:text-gray-300">
                        <option>Any Status</option>
                        <option>Completed</option>
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            <!-- Table Section -->
            <div class="bg-white dark:bg-[#151c2b] rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <th class="p-4 w-10">
                                    <input class="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox"/>
                                </th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Products</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            ${t.length>0?t.map(mt).join(""):`
                                <tr>
                                    <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                <!-- Pagination -->
                <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#151c2b]">
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        Showing <span class="font-bold text-gray-900 dark:text-white mx-1">1-${t.length}</span> of <span class="font-bold text-gray-900 dark:text-white mx-1">${r.totalOrders}</span> orders
                    </div>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 disabled:opacity-50">Previous</button>
                        <button class="px-3 py-1 rounded border border-primary bg-primary text-sm font-medium text-white">1</button>
                        <button class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Order Details Modal -->
        <div id="order-details-modal" class="fixed inset-0 z-50 hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onclick="window.closeOrderModal()"></div>
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#151c2b] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100 dark:border-gray-700">
                    <!-- Modal Header -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                        <h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white" id="modal-title">Order Details</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500 focus:outline-none" onclick="window.closeOrderModal()">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    
                    <!-- Modal Body -->
                    <div class="px-4 py-5 sm:p-6 space-y-6" id="modal-content">
                        <!-- Content injected dynamically -->
                    </div>

                    <!-- Modal Footer -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <select id="modal-status-select" class="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2">
                                <option value="pending">Pending</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="in_production">In Production</option>
                                <option value="quality_check">Quality Check</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button type="button" class="inline-flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:w-auto whitespace-nowrap" onclick="window.handleUpdateStatus()">
                                Update Status
                            </button>
                        </div>
                        <button type="button" class="inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:w-auto" onclick="window.closeOrderModal()">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `,window.viewOrderDetails=a=>{const d=t.find(c=>c.id===a);if(!d)return;const o=document.getElementById("order-details-modal"),s=document.getElementById("modal-content"),i=document.getElementById("modal-status-select"),n=document.getElementById("approve-action-container");if(o&&s&&i){o.dataset.orderId=a,i.value=d.status,n&&(d.status==="pending"?(n.classList.remove("hidden"),n.innerHTML=`
                             <button type="button" class="ml-3 inline-flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto whitespace-nowrap" onclick="window.quickApproveOrder('${a}')">
                                <span class="material-icons-round text-sm mr-1">check_circle</span> Approve Order
                             </button>
                         `):(n.classList.add("hidden"),n.innerHTML=""));const c=new Date(d.created_at).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"}),l=b(d.status);s.innerHTML=`
                <!-- 1. Header Info -->
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                        <p class="font-mono text-sm font-bold text-gray-900 dark:text-white">#${d.id}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 text-right">Date Placed</p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white text-right">${c}</p>
                    </div>
                </div>

                <!-- 2. Status & Customer -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.bg} ${l.text}">
                            <span class="size-1.5 rounded-full ${l.dot}"></span>
                            ${d.status.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${d.customer_email}</p>
                        <p class="text-xs text-gray-500 truncate" title="${d.id}">Guest Checkout</p>
                    </div>
                </div>

                <!-- 3. Items Table -->
                <div>
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Items Ordered</h4>
                    <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#151c2b]">
                                ${d.items?.map(u=>`
                                <tr>
                                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white flex items-center gap-3">
                                        <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100">
                                            <img src="${u.products?.images?.[0]||"https://via.placeholder.com/150"}" alt="${u.products?.name}" class="h-full w-full object-cover object-center">
                                        </div>
                                        <span class="line-clamp-1">${u.products?.name}</span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">₱${u.unit_price}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">${u.quantity}</td>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">₱${(u.unit_price*u.quantity).toFixed(2)}</td>
                                </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 4. Totals -->
                <div class="flex justify-end">
                    <div class="w-full sm:w-1/2 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                            <span class="text-gray-900 dark:text-white font-medium">₱${d.total_amount.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Shipping</span>
                            <span class="text-gray-900 dark:text-white font-medium">Free</span>
                        </div>
                        <div class="flex justify-between text-base border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                            <span class="font-bold text-gray-900 dark:text-white">Total</span>
                            <span class="font-bold text-primary">₱${d.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                `,o.classList.remove("hidden")}},window.closeOrderModal=()=>{const a=document.getElementById("order-details-modal");a&&a.classList.add("hidden")},window.handleUpdateStatus=async()=>{const a=document.getElementById("order-details-modal"),d=document.getElementById("modal-status-select"),o=a?.dataset.orderId,s=d?.value;if(o&&s)try{await I.updateOrderStatus(o,s);const i=t.find(l=>l.id===o);i&&(i.status=s);const n=document.querySelector(`#order-row-${o} .status-badge`);if(n){const l=b(s);n.className=`status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.bg} ${l.text}`,n.innerHTML=`<span class="size-1.5 rounded-full ${l.dot}"></span> ${s.charAt(0).toUpperCase()+s.slice(1)}`}const c=document.getElementById("modal-status-badge");if(c){const l=b(s);c.className=`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.bg} ${l.text}`,c.innerHTML=`<span class="size-1.5 rounded-full ${l.dot}"></span> ${s.toUpperCase()}`}_.show("Order status updated successfully","success")}catch(i){console.error("Update failed",i),_.show("Failed to update status","error")}},window.quickApproveOrder=async a=>{if(confirm("Are you sure you want to approve this order?"))try{await I.updateOrderStatus(a,"approved");const d=document.getElementById("order-details-modal");if(d&&d.dataset.orderId===a){const o=document.getElementById("modal-status-select");o&&(o.value="approved");const s=document.getElementById("approve-action-container");s&&s.classList.add("hidden");const i=t.find(l=>l.id===a);i&&(i.status="approved");const n=document.querySelector(`#order-row-${a} .status-badge`);if(n){const l=b("approved");n.className=`status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.bg} ${l.text}`,n.innerHTML=`<span class="size-1.5 rounded-full ${l.dot}"></span> Approved`}const c=document.getElementById("modal-status-badge");if(c){const l=b("approved");c.className=`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.bg} ${l.text}`,c.innerHTML=`<span class="size-1.5 rounded-full ${l.dot}"></span> APPROVED`}}_.show("Order approved successfully","success")}catch(d){console.error("Approval failed",d),_.show("Failed to approve order","error")}}}catch(t){console.error("Failed to load orders:",t),e.innerHTML='<div class="p-8 text-center text-red-500">Failed to load orders.</div>'}}function mt(e){const t=b(e.status),r=new Date(e.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),a=new Date(e.created_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}),d=e.customer_email.charAt(0).toUpperCase(),o=e.items||[],s=o.slice(0,3).map(n=>`
        <div class="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#151c2b] bg-gray-100 bg-cover bg-center" 
             style='background-image: url("${n.products?.images?.[0]||""}");'
             title="${n.products?.name}">
        </div>
    `).join(""),i=o.length>3?o.length-3:0;return`
    <tr id="order-row-${e.id}" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
        <td class="p-4">
            <input class="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox"/>
        </td>
        <td class="p-4">
            <span class="font-mono text-sm font-medium text-gray-900 dark:text-white">#${e.id.slice(0,8)}</span>
        </td>
        <td class="p-4">
            <div class="flex items-center gap-3">
                <div class="size-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    ${d}
                </div>
                <div class="flex flex-col">
                    <a class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors" href="#">${e.customer_email}</a>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mt-0.5 w-fit">Customer</span>
                </div>
            </div>
        </td>
        <td class="p-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">${r}</span>
            <p class="text-xs text-gray-400">${a}</p>
        </td>
        <td class="p-4">
            <div class="flex -space-x-2 overflow-hidden items-center">
                ${s}
                ${i>0?`<div class="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#151c2b] bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">+${i}</div>`:""}
            </div>
            <span class="text-xs text-gray-500 ml-2">${o.reduce((n,c)=>n+c.quantity,0)} items</span>
        </td>
        <td class="p-4 text-right">
            <span class="font-bold text-gray-900 dark:text-white text-sm">₱${e.total_amount.toFixed(2)}</span>
        </td>
        <td class="p-4">
            <span class="status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${t.bg} ${t.text}">
                <span class="size-1.5 rounded-full ${t.dot}"></span>
                ${e.status.charAt(0).toUpperCase()+e.status.slice(1)}
            </span>
        </td>
        <td class="p-4 text-right">
            <button class="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400" onclick="window.viewOrderDetails('${e.id}')">View Details</button>
        </td>
    </tr>
    `}function b(e){switch(e){case"completed":case"delivered":case"paid":return{bg:"bg-emerald-100 dark:bg-emerald-900/30",text:"text-emerald-700 dark:text-emerald-300",dot:"bg-emerald-500"};case"in_production":return{bg:"bg-blue-100 dark:bg-blue-900/30",text:"text-blue-700 dark:text-blue-300",dot:"bg-blue-500"};case"quality_check":return{bg:"bg-purple-100 dark:bg-purple-900/30",text:"text-purple-700 dark:text-purple-300",dot:"bg-purple-500"};case"shipped":return{bg:"bg-indigo-100 dark:bg-indigo-900/30",text:"text-indigo-700 dark:text-indigo-300",dot:"bg-indigo-500"};case"approved":return{bg:"bg-green-100 dark:bg-green-900/30",text:"text-green-700 dark:text-green-300",dot:"bg-green-500"};case"pending":return{bg:"bg-amber-100 dark:bg-amber-900/30",text:"text-amber-700 dark:text-amber-300",dot:"bg-amber-500"};case"cancelled":return{bg:"bg-rose-100 dark:bg-rose-900/30",text:"text-rose-700 dark:text-rose-300",dot:"bg-rose-500"};default:return{bg:"bg-gray-100 dark:bg-gray-700",text:"text-gray-600 dark:text-gray-300",dot:"bg-gray-500"}}}const R={dashboard:z,products:dt,categories:lt,orders:pt,blog:gt};async function xt(){const e=document.getElementById("admin-loading"),t=document.getElementById("sidebar"),r=document.getElementById("main-content"),a=document.getElementById("admin-view-container"),d=document.getElementById("admin-logout"),o=document.querySelectorAll(".nav-item[data-view]");try{await $.init();const{clerk:s}=await q(async()=>{const{clerk:n}=await import("./supabase-w99FfbcE.js").then(c=>c.a);return{clerk:n}},[]);if(!s.user){s.redirectToSignIn({redirectUrl:window.location.href});return}if(!await $.isAdmin()){e&&(e.style.display="none"),document.body.innerHTML=`
                <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="material-icons-round text-3xl text-red-600 dark:text-red-400">gpp_bad</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                        <p class="text-gray-500 dark:text-gray-400 mb-8">
                            This area is restricted to administrators only. You do not have the required permissions to view this content.
                        </p>
                        <div class="space-y-3">
                            <button id="denied-logout" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <span class="material-icons-round">logout</span> Sign Out
                            </button>
                            <a href="/" class="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-4 rounded-xl transition-colors">
                                Return to Store
                            </a>
                        </div>
                    </div>
                    <div class="mt-8 text-sm text-gray-400">
                        Logged in as <span class="font-medium text-gray-600 dark:text-gray-300">${s.user.primaryEmailAddress?.emailAddress||"User"}</span>
                    </div>
                </div>
            `,document.getElementById("denied-logout")?.addEventListener("click",async()=>{await $.logout(),window.location.href="/"});return}e&&(e.style.display="none"),t&&t.classList.remove("hidden"),r&&r.classList.remove("hidden"),o.forEach(n=>{n.addEventListener("click",c=>{c.preventDefault();const l=c.currentTarget,u=l.getAttribute("data-view");o.forEach(x=>x.classList.remove("active")),l.classList.add("active"),u&&a&&R[u]&&R[u](a)})}),a&&z(a),d&&d.addEventListener("click",async()=>{await $.logout(),window.location.href="/"})}catch(s){console.error("Admin Init Error:",s),window.location.href="/"}}document.addEventListener("DOMContentLoaded",xt);
