import '../components/header';
import { OrderService, Order } from '../services/order.service';
import { Toast } from '../components/toast';

const form = document.getElementById('tracking-form') as HTMLFormElement;
const input = document.getElementById('tracking-input') as HTMLInputElement;
const resultContainer = document.getElementById('tracking-result');
const submitBtn = form.querySelector('button');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const trackingNumber = input.value.trim();

    if (!trackingNumber) {
        Toast.show('Please enter a tracking number', 'error');
        return;
    }

    setLoading(true);

    try {
        const order = await OrderService.getOrderByTracking(trackingNumber);

        if (order) {
            renderOrder(order);
        } else {
            renderError('Order not found. Please check your tracking number.');
            Toast.show('Order not found', 'error');
        }
    } catch (error) {
        console.error(error);
        renderError('Failed to fetch tracking details. Please try again.');
        Toast.show('Error fetching order', 'error');
    } finally {
        setLoading(false);
    }
});

// Auto-search from URL
const urlParams = new URLSearchParams(window.location.search);
const trackingParam = urlParams.get('number');
if (trackingParam) {
    if (input) input.value = trackingParam;
    // Trigger submit manually or just run the logic
    // We can just call the logic directly to avoid event simulation issues if any
    (async () => {
        setLoading(true);
        try {
            const order = await OrderService.getOrderByTracking(trackingParam);
            if (order) {
                renderOrder(order);
            } else {
                renderError('Order not found. Please check your tracking number.');
                Toast.show('Order not found', 'error');
            }
        } catch (error) {
            console.error(error);
            renderError('Failed to fetch tracking details. Please try again.');
        } finally {
            setLoading(false);
        }
    })();
}

function setLoading(isLoading: boolean) {
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Searching...' : 'Track';
    }
    if (resultContainer) {
        if (isLoading) {
            resultContainer.innerHTML = `
                <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                    <div class="animate-pulse space-y-6">
                        <div class="flex justify-between">
                            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                        </div>
                        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                    </div>
                 </div>
            `;
            resultContainer.classList.remove('hidden');
        }
    }
}

function renderError(msg: string) {
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30 text-center">
                <span class="material-symbols-outlined text-4xl text-red-500 mb-2">search_off</span>
                <p class="text-red-700 dark:text-red-300 font-medium">${msg}</p>
            </div>
        `;
        resultContainer.classList.remove('hidden');
    }
}

function renderOrder(order: Order) {
    if (!resultContainer) return;

    const steps = [
        { key: 'approved', label: 'Order Approved', icon: 'check_circle' },
        { key: 'in_production', label: 'In Production', icon: 'palette' },
        { key: 'quality_check', label: 'Quality Check', icon: 'verified' },
        { key: 'shipped', label: 'Shipped', icon: 'local_shipping' },
        { key: 'delivered', label: 'Delivered', icon: 'package_2' }
    ];

    // Map DB status to step index
    // Note: status might be 'completed' or 'paid' which map to certain steps
    let currentStepIndex = 0;
    const s = order.status;

    if (s === 'pending' || s === 'paid') currentStepIndex = 0;
    else if (s === 'in_production') currentStepIndex = 1;
    else if (s === 'quality_check') currentStepIndex = 2;
    else if (s === 'shipped') currentStepIndex = 3;
    else if (s === 'delivered' || s === 'completed') currentStepIndex = 4;
    else if (s === 'cancelled') currentStepIndex = -1;



    if (currentStepIndex === -1) {
        // Cancelled View
        resultContainer.innerHTML = `
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl text-center">
                <div class="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4">
                    <span class="material-symbols-outlined text-3xl">cancel</span>
                </div>
                <h2 class="text-2xl font-bold mb-2">Order Cancelled</h2>
                <p class="text-gray-500">This order has been cancelled. Please contact support if you have questions.</p>
             </div>
        `;
        resultContainer.classList.remove('hidden');
        return;
    }

    // Pending Approval View
    if (order.status === 'pending' || order.status === 'paid') {
        resultContainer.innerHTML = `
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl text-center max-w-2xl mx-auto">
                <div class="inline-flex p-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-6 animate-pulse">
                    <span class="material-symbols-outlined text-4xl">hourglass_top</span>
                </div>
                <h2 class="text-3xl font-black mb-4 text-gray-900 dark:text-white">Order Received!</h2>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Thank you for your order <b>#${order.id.slice(0, 8)}</b>. We are currently reviewing your request. 
                    <br class="hidden md:block" />
                    You will be able to track the production progress right here once it is approved.
                </p>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span class="material-symbols-outlined text-primary">info</span>
                    Status: <span class="font-bold uppercase tracking-wider">Awaiting Approval</span>
                </div>
             </div>
        `;
        resultContainer.classList.remove('hidden');
        return;
    }

    resultContainer.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Order Status Card -->
            <div class="overflow-hidden rounded-3xl bg-white dark:bg-[#151c2b] shadow-xl border border-gray-100 dark:border-gray-800">
                <!-- Card Header -->
                <div class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a2333]/50 px-6 py-6 sm:px-10 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</p>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">#${order.id.slice(0, 8)}</h3>
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
                        <div class="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-1000 ease-out" style="width: ${(currentStepIndex / (steps.length - 1)) * 100}%"></div>
                        
                        <!-- Steps Container -->
                        <div class="relative flex justify-between">
                            ${steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        return `
                                <div class="flex flex-col items-center gap-3 relative group">
                                    <div class="flex size-10 md:size-12 items-center justify-center rounded-full transition-all duration-500 z-10 
                                        ${isCompleted ? 'bg-primary text-white shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-[#151c2b]' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 ring-4 ring-white dark:ring-[#151c2b]'}
                                        ${isCurrent ? 'scale-110 ring-offset-2 ring-offset-primary/20' : ''}
                                    ">
                                        
                                        ${isCurrent ? `<span class="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white dark:bg-[#151c2b]"><span class="size-2.5 rounded-full bg-green-500 animate-pulse"></span></span>` : ''}
                                        <span class="material-symbols-outlined text-lg md:text-xl">${step.icon}</span>
                                    </div>
                                    <div class="text-center absolute top-14 w-32 ${isCurrent ? 'block' : 'hidden md:block'}">
                                        <p class="text-sm font-bold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">${step.label}</p>
                                        ${isCompleted ? '<p class="text-xs text-gray-500 dark:text-gray-400">Completed</p>' : ''}
                                    </div>
                                </div>
                                `;
    }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Current Location Banner (Mocked) -->
                ${currentStepIndex >= 3 ? `
                <div class="bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20 px-6 py-4 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
                    <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-primary">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Package is in transit</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Your order is on its way to the delivery address.</p>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Two Column Layout Details -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Col: Tracking History -->
                <div class="lg:col-span-2 space-y-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Tracking History</h3>
                    <div class="rounded-2xl bg-white dark:bg-[#151c2b] border border-gray-100 dark:border-gray-800 p-6 shadow-md">
                        <div class="relative space-y-0">
                             <!-- Generate History based on current step downwards -->
                             ${steps.slice(0, currentStepIndex + 1).reverse().map((step, i) => `
                                <div class="flex gap-4 pb-8 relative group last:pb-0">
                                    <!-- Vertical Line -->
                                    <div class="absolute left-[19px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800 group-last:hidden"></div>
                                    
                                    <div class="flex-shrink-0 mt-1">
                                        <div class="size-10 rounded-full ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} flex items-center justify-center border-4 border-white dark:border-[#151c2b] shadow-sm">
                                            <span class="material-symbols-outlined text-xl">${step.icon}</span>
                                        </div>
                                    </div>
                                    <div class="flex-grow pt-2">
                                        <div class="flex justify-between items-start mb-1">
                                            <h4 class="font-bold text-gray-900 dark:text-white">${step.label}</h4>
                                            <span class="text-sm font-medium text-gray-500 lg:hidden">Verified</span>
                                        </div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Status updated successfully.</p>
                                    </div>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right Col: Order Items & Help -->
                <div class="space-y-6">
                    <!-- Order Items -->
                    <div class="rounded-2xl bg-white dark:bg-[#151c2b] border border-gray-100 dark:border-gray-800 p-6 shadow-md">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">In This Order</h3>
                        <div class="space-y-4">
                            ${order.items?.map(item => `
                            <div class="flex gap-3 items-center">
                                <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                    <img class="object-cover w-full h-full" src="${item.products?.images?.[0] || ''}" alt="${item.products?.name}">
                                </div>
                                <div>
                                    <p class="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">${item.products?.name}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Qty: ${item.quantity} • ₱${item.unit_price}</p>
                                </div>
                            </div>
                            `).join('') || '<p class="text-sm text-gray-500">No items found</p>'}
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                            <span class="text-base font-bold text-gray-900 dark:text-white">₱${order.total_amount.toFixed(2)}</span>
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
    `;

    resultContainer.classList.remove('hidden');
}
