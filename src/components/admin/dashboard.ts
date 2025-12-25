import { DashboardService } from '../../services/dashboard.service';

export async function renderDashboard(container: HTMLElement) {
    try {
        const stats = await DashboardService.getStats();
        const recentOrders = await DashboardService.getRecentOrders();
        const tops = await DashboardService.getTopProducts();

        container.innerHTML = `
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
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.deliveryProcessing}</h3>
                        <p class="text-xs text-gray-500">Processing</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.deliveryProcessed}</h3>
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
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.paymentUnpaid}</h3>
                        <p class="text-xs text-gray-500">Not yet paid</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.paymentPromo}</h3>
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
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.productBlocked}</h3>
                        <p class="text-xs text-gray-500">Product block</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.productSoldOut}</h3>
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
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.responseCancellation}</h3>
                        <p class="text-xs text-gray-500">Cancelation</p>
                    </div>
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${stats.responseReturn}</h3>
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
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${stats.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
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
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${stats.revenueMonth.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
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
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">₱${stats.revenueWeek.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
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
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.totalOrders}</h3>
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
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.pendingOrders}</h3>
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
                            ${recentOrders.length > 0 ? recentOrders.map(order => `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">#${order.id.slice(0, 8)}</td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">${order.customer_email || 'Guest'}</td>
                                <td class="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">₱${Number(order.total_amount).toFixed(2)}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                order.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'}">
                                        ${order.status}
                                    </span>
                                </td>
                            </tr>
                            `).join('') : `
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
                        ${tops.length > 0 ? tops.map((prod, index) => {
                        const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
                        const colorClass = colors[index % colors.length];
                        // Try to guess icon based on name or category, simplified logic
                        let icon = 'inventory_2';
                        if (prod.name.toLowerCase().includes('shirt') || prod.name.toLowerCase().includes('top')) icon = 'checkroom';
                        if (prod.name.toLowerCase().includes('toy') || prod.name.toLowerCase().includes('bear')) icon = 'toys';

                        return `
                            <li class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 ${colorClass} dark:bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                                        <span class="material-icons-round text-lg">${icon}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">${prod.name}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">${prod.category || 'Product'}</p>
                                    </div>
                                </div>
                                <span class="font-bold text-gray-900 dark:text-white text-sm">${prod.quantity} sold</span>
                            </li>
                        `;
                    }).join('') : `
                                                            <li class="text-center text-gray-500 text-sm py-4">No top products yet.</li>
                        `}
                    </ul>
                </div>
            </div>
        </div>
    `;
        // Render Chart
        try {
            const { Chart } = await import('chart.js/auto');
            const ctx = (document.getElementById('revenueChart') as HTMLCanvasElement)?.getContext('2d');

            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: stats.revenueChartData.map(d => {
                            const date = new Date(d.date);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        datasets: [{
                            label: 'Revenue',
                            data: stats.revenueChartData.map(d => d.amount),
                            borderColor: '#3b82f6', // primary blue
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4, // smooth curves
                            pointRadius: 0,
                            pointHoverRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(context.parsed.y);
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    // color: '#f3f4f6', // light gray
                                    display: true,
                                },
                                border: {
                                    display: false
                                },
                                ticks: {
                                    callback: function (value) {
                                        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumSignificantDigits: 3 }).format(Number(value));
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        } catch (chartError) {
            console.error('Failed to load chart', chartError);
        }

    } catch (err: any) {
        console.error("Dashboard Error:", err);
        container.innerHTML = `
            <div class="p-8 text-center text-red-500">
                <p class="font-bold">Failed to load dashboard data</p>
                <p class="text-sm mt-2 text-gray-600 dark:text-gray-400">${err.message || JSON.stringify(err)}</p>
                <p class="text-xs mt-4 text-gray-400">Please check console for more details.</p>
            </div>`;
    }
}
