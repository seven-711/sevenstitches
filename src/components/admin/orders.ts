import { OrderService, Order } from '../../services/order.service';
import { Toast } from '../../components/toast';

export async function renderOrders(container: HTMLElement) {
    try {
        const orders = await OrderService.getAllOrders();
        const stats = await OrderService.getOrderStats();

        container.innerHTML = `
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
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">₱${stats.totalRevenue.toLocaleString()}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Avg. Order Value</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">₱${stats.avgOrderValue.toFixed(2)}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Total Orders</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">${stats.totalOrders}</h3>
                        <span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-xs font-semibold mb-1">+--%</span>
                    </div>
                </div>
                <div class="bg-white dark:bg-[#151c2b] p-5 rounded-xl border border-[#cfd7e7] dark:border-gray-800 shadow-sm flex flex-col gap-1">
                    <p class="text-[#4c669a] dark:text-gray-400 text-sm font-medium">Pending Orders</p>
                    <div class="flex items-end gap-2">
                        <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">${stats.pendingOrders}</h3>
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
                            ${orders.length > 0 ? orders.map(renderOrderRow).join('') : `
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
                        Showing <span class="font-bold text-gray-900 dark:text-white mx-1">1-${orders.length}</span> of <span class="font-bold text-gray-900 dark:text-white mx-1">${stats.totalOrders}</span> orders
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
        <div id="order-details-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onclick="window.closeOrderModal()"></div>
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#151c2b] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[85vh]">
                    <!-- Modal Header -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                        <h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white" id="modal-title">Order Details</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500 focus:outline-none" onclick="window.closeOrderModal()">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    
                    <!-- Modal Body -->
                    <div class="px-4 py-5 sm:p-6 space-y-6 overflow-y-auto flex-1" id="modal-content">
                        <!-- Content injected dynamically -->
                    </div>

                    <!-- Modal Footer -->
                    <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <select id="modal-status-select" class="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2">
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
                            
                            <!-- Approve Action Container (Dynamic) -->
                            <div id="approve-action-container" class="hidden sm:inline-block"></div>

                            <button type="button" class="inline-flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:w-auto whitespace-nowrap" onclick="window.handleUpdateStatus()">
                                Update Status
                            </button>
                        </div>
                        <button type="button" class="inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:w-auto" onclick="window.closeOrderModal()">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // --- Logic Implementation ---

        (window as any).viewOrderDetails = (orderId: string) => {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            const modal = document.getElementById('order-details-modal');
            const content = document.getElementById('modal-content');
            const statusSelect = document.getElementById('modal-status-select') as HTMLSelectElement;
            const approveActionContainer = document.getElementById('approve-action-container');

            if (modal && content && statusSelect) {
                modal.dataset.orderId = orderId;
                statusSelect.value = order.status;

                // Show explicit "Approve" button if pending
                if (approveActionContainer) {
                    if (order.status === 'pending') {
                        approveActionContainer.classList.remove('hidden');
                        approveActionContainer.innerHTML = `
                             <button type="button" class="ml-3 inline-flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto whitespace-nowrap" onclick="window.quickApproveOrder('${orderId}')">
                                <span class="material-icons-round text-sm mr-1">check_circle</span> Approve Order
                             </button>
                         `;
                    } else {
                        approveActionContainer.classList.add('hidden');
                        approveActionContainer.innerHTML = '';
                    }
                }
                const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                const statusColor = getStatusColor(order.status);

                // Parse Address (Meetup Details)
                let meetupInfo = { location: 'N/A', date: 'N/A', time: 'N/A' };
                if (order.shipping_address && order.shipping_address.includes('MEET-UP:')) {
                    const parts = order.shipping_address.split('|');
                    meetupInfo.location = parts[0]?.replace('MEET-UP:', '').trim() || 'N/A';
                    meetupInfo.date = parts[1]?.replace('DATE:', '').trim() || 'N/A';
                    meetupInfo.time = parts[2]?.replace('TIME:', '').trim() || 'N/A';
                }

                content.innerHTML = `
                <!-- 1. Header Info -->
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                        <p class="font-mono text-sm font-bold text-gray-900 dark:text-white">#${order.id}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 text-right">Date Placed</p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white text-right">${date}</p>
                    </div>
                </div>

                <!-- 2. Status & Customer -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}">
                            <span class="size-1.5 rounded-full ${statusColor.dot}"></span>
                            ${order.status.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${order.customer_email}</p>
                        <p class="text-xs text-gray-500 truncate mt-0.5">${order.phone || 'No phone number'}</p>
                    </div>
                </div>

                 <!-- 3. Meet-up Details -->
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <h4 class="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span class="material-icons-round text-sm">event_available</span>
                        Meet-up Details
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <p class="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Location</p>
                            <p class="text-sm font-bold text-gray-900 dark:text-white">${meetupInfo.location}</p>
                        </div>
                        <div>
                            <p class="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Preferred Date</p>
                            <p class="text-sm font-bold text-gray-900 dark:text-white">${meetupInfo.date}</p>
                        </div>
                        <div>
                            <p class="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Preferred Time</p>
                            <p class="text-sm font-bold text-gray-900 dark:text-white">${meetupInfo.time}</p>
                        </div>
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
                                ${order.items?.map(item => `
                                <tr>
                                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white flex items-center gap-3">
                                        <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100">
                                            <img src="${item.products?.images?.[0] || 'https://via.placeholder.com/150'}" alt="${item.products?.name}" class="h-full w-full object-cover object-center">
                                        </div>
                                        <span class="line-clamp-1">${item.products?.name}</span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">₱${item.unit_price}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">${item.quantity}</td>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">₱${(item.unit_price * item.quantity).toFixed(2)}</td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 4. Totals -->
                <div class="flex justify-end">
                    <div class="w-full sm:w-1/2 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
                            <span class="text-gray-900 dark:text-white font-medium">₱${order.total_amount.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Shipping</span>
                            <span class="text-gray-900 dark:text-white font-medium">Free</span>
                        </div>
                        <div class="flex justify-between text-base border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                            <span class="font-bold text-gray-900 dark:text-white">Total</span>
                            <span class="font-bold text-primary">₱${order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                `;

                modal.classList.remove('hidden');
            }
        };

        (window as any).closeOrderModal = () => {
            const modal = document.getElementById('order-details-modal');
            if (modal) modal.classList.add('hidden');
        };

        (window as any).handleUpdateStatus = async () => {
            const modal = document.getElementById('order-details-modal');
            const statusSelect = document.getElementById('modal-status-select') as HTMLSelectElement;
            const orderId = modal?.dataset.orderId;
            const newStatus = statusSelect?.value;

            if (orderId && newStatus) {
                try {
                    // Update Backend
                    await OrderService.updateOrderStatus(orderId, newStatus);

                    // Update Local State (UI)
                    const orderState = orders.find(o => o.id === orderId);
                    if (orderState) orderState.status = newStatus as any;

                    // --- TRIGGER EMAIL IF APPROVED ---
                    if (newStatus === 'approved' && orderState?.customer_email) {
                        fetch('/api/update-order-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: orderState.customer_email,
                                orderId: orderId,
                                status: 'approved'
                            })
                        }).catch(err => console.error('Failed to trigger approval email', err));
                    }
                    // --------------------------------

                    // Update Row Badge
                    const rowBadge = document.querySelector(`#order-row-${orderId} .status-badge`);
                    if (rowBadge) {
                        const style = getStatusColor(newStatus);
                        rowBadge.className = `status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`;
                        rowBadge.innerHTML = `<span class="size-1.5 rounded-full ${style.dot}"></span> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
                    }

                    // Update Modal Badge (Immediate feedback)
                    const modalBadge = document.getElementById('modal-status-badge');
                    if (modalBadge) {
                        const style = getStatusColor(newStatus);
                        modalBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`;
                        modalBadge.innerHTML = `<span class="size-1.5 rounded-full ${style.dot}"></span> ${newStatus.toUpperCase()}`;
                    }

                    Toast.show('Order status updated successfully', 'success');

                } catch (error) {
                    console.error('Update failed', error);
                    Toast.show('Failed to update status', 'error');
                }
            }
        };

        (window as any).quickApproveOrder = async (orderId: string) => {
            if (!confirm('Are you sure you want to approve this order?')) return;

            try {
                await OrderService.updateOrderStatus(orderId, 'approved');

                // --- TRIGGER EMAIL ---
                const order = orders.find(o => o.id === orderId);
                if (order && order.customer_email) {
                    fetch('/api/update-order-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: order.customer_email,
                            orderId: orderId,
                            status: 'approved'
                        })
                    }).catch(err => console.error('Failed to trigger approval email', err));
                }
                // ---------------------

                // Refresh Modal if open
                const modal = document.getElementById('order-details-modal');
                if (modal && modal.dataset.orderId === orderId) {
                    // Update dropdown
                    const statusSelect = document.getElementById('modal-status-select') as HTMLSelectElement;
                    if (statusSelect) statusSelect.value = 'approved';

                    // Hide approve button
                    const approveActionContainer = document.getElementById('approve-action-container');
                    if (approveActionContainer) approveActionContainer.classList.add('hidden');

                    // Update badges logic similiar to handleUpdateStatus...
                    // For simplicity, let's just reload the list logic or mimic the update
                    const orderState = orders.find(o => o.id === orderId);
                    if (orderState) orderState.status = 'approved';

                    // Update Row Badge
                    const rowBadge = document.querySelector(`#order-row-${orderId} .status-badge`);
                    if (rowBadge) {
                        const style = getStatusColor('approved');
                        rowBadge.className = `status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`;
                        rowBadge.innerHTML = `<span class="size-1.5 rounded-full ${style.dot}"></span> Approved`;
                    }

                    // Update Modal Badge
                    const modalBadge = document.getElementById('modal-status-badge');
                    if (modalBadge) {
                        const style = getStatusColor('approved');
                        modalBadge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`;
                        modalBadge.innerHTML = `<span class="size-1.5 rounded-full ${style.dot}"></span> APPROVED`;
                    }
                }

                Toast.show('Order approved successfully', 'success');
            } catch (error) {
                console.error('Approval failed', error);
                Toast.show('Failed to approve order', 'error');
            }
        };

    } catch (err) {
        console.error('Failed to load orders:', err);
        container.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load orders.</div>`;
    }
}

function renderOrderRow(order: Order) {
    const statusColor = getStatusColor(order.status);
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Mock Avatar Color based on email char
    const initial = order.customer_email.charAt(0).toUpperCase();

    // Render Product Thumbnails (limit to 3)
    const items = order.items || [];
    const thumbnails = items.slice(0, 3).map(item => `
        <div class="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#151c2b] bg-gray-100 bg-cover bg-center" 
             style='background-image: url("${item.products?.images?.[0] || ''}");'
             title="${item.products?.name}">
        </div>
    `).join('');
    const extraCount = items.length > 3 ? items.length - 3 : 0;

    // Delete Action
    const showDelete = ['delivered', 'completed', 'cancelled'].includes(order.status);

    return `
    <tr id="order-row-${order.id}" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
        <td class="p-4">
            <input class="rounded border-gray-300 text-primary focus:ring-primary" type="checkbox"/>
        </td>
        <td class="p-4">
            <span class="font-mono text-sm font-medium text-gray-900 dark:text-white">#${order.id.slice(0, 8)}</span>
        </td>
        <td class="p-4">
            <div class="flex items-center gap-3">
                <div class="size-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    ${initial}
                </div>
                <div class="flex flex-col">
                    <a class="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors" href="#">${order.customer_email}</a>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mt-0.5 w-fit">Customer</span>
                </div>
            </div>
        </td>
        <td class="p-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">${date}</span>
            <p class="text-xs text-gray-400">${time}</p>
        </td>
        <td class="p-4">
            <div class="flex -space-x-2 overflow-hidden items-center">
                ${thumbnails}
                ${extraCount > 0 ? `<div class="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#151c2b] bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">+${extraCount}</div>` : ''}
            </div>
            <span class="text-xs text-gray-500 ml-2">${items.reduce((s, i) => s + i.quantity, 0)} items</span>
        </td>
        <td class="p-4 text-right">
            <span class="font-bold text-gray-900 dark:text-white text-sm">₱${order.total_amount.toFixed(2)}</span>
        </td>
        <td class="p-4">
            <span class="status-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}">
                <span class="size-1.5 rounded-full ${statusColor.dot}"></span>
                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
        </td>
        <td class="p-4 text-right">
            <div class="flex items-center justify-end gap-2">
                <button class="text-sm font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400" onclick="window.viewOrderDetails('${order.id}')">View</button>
                ${showDelete ? `
                <button class="text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1" onclick="window.deleteOrder('${order.id}')" title="Delete Order">
                    <span class="material-icons-round text-lg">delete</span>
                </button>
                ` : ''}
            </div>
        </td>
    </tr>
    `;
}

// Add global handler for delete
(window as any).deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
        await OrderService.deleteOrder(orderId);

        // Remove row from DOM
        const row = document.getElementById(`order-row-${orderId}`);
        if (row) {
            row.remove();
            Toast.show('Order deleted successfully', 'success');
        } else {
            // Fallback: Reload logic if needed, but row removal is cleaner
            Toast.show('Order deleted, please refresh', 'success');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        Toast.show('Failed to delete order', 'error');
    }
};

function getStatusColor(status: string) {
    switch (status) {
        case 'completed':
        case 'delivered':
        case 'paid':
            return {
                bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                text: 'text-emerald-700 dark:text-emerald-300',
                dot: 'bg-emerald-500'
            };
        case 'in_production':
            return {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-700 dark:text-blue-300',
                dot: 'bg-blue-500'
            };
        case 'quality_check':
            return {
                bg: 'bg-purple-100 dark:bg-purple-900/30',
                text: 'text-purple-700 dark:text-purple-300',
                dot: 'bg-purple-500'
            };
        case 'shipped':
            return {
                bg: 'bg-indigo-100 dark:bg-indigo-900/30',
                text: 'text-indigo-700 dark:text-indigo-300',
                dot: 'bg-indigo-500'
            };
        case 'approved':
            return {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-700 dark:text-green-300',
                dot: 'bg-green-500'
            };
        case 'pending':
            return {
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-700 dark:text-amber-300',
                dot: 'bg-amber-500'
            };
        case 'cancelled':
            return {
                bg: 'bg-rose-100 dark:bg-rose-900/30',
                text: 'text-rose-700 dark:text-rose-300',
                dot: 'bg-rose-500'
            };
        default:
            return {
                bg: 'bg-gray-100 dark:bg-gray-700',
                text: 'text-gray-600 dark:text-gray-300',
                dot: 'bg-gray-500'
            };
    }
}
