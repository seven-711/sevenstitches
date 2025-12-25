import '../components/header';
import { OrderService, Order } from '../services/order.service';
import { ReviewService } from '../services/review.service';
import { AuthService } from '../services/auth.service';
import { Toast } from '../components/toast';

const form = document.getElementById('tracking-form') as HTMLFormElement;
const input = document.getElementById('tracking-input') as HTMLInputElement;
const resultContainer = document.getElementById('tracking-result');
const submitBtn = form.querySelector('button');

// Add Review Modal to DOM
if (!document.getElementById('review-modal')) {
    const modalHTML = `
    <div id="review-modal" class="fixed inset-0 z-50 hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"></div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-[#151c2b] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-gray-100 dark:border-gray-700">
                    <div class="bg-white dark:bg-[#151c2b] px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-400">star</span>
                            </div>
                            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white" id="modal-title">Rate your purchase</h3>
                                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <p>How was your item? Your feedback helps improvements.</p>
                                </div>
                                <div id="review-products-container" class="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                    <!-- Product Review Forms Injected Here -->
                                </div>
                                
                                <div class="mt-6 flex items-center gap-2">
                                    <input type="checkbox" id="review-anonymous" class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4">
                                    <label for="review-anonymous" class="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">Hide my name (Review anonymously)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                        <button type="button" id="submit-reviews-btn" class="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 sm:ml-3 sm:w-auto">Submit Reviews</button>
                        <button type="button" id="cancel-review-btn" class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 sm:mt-0 sm:w-auto">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('cancel-review-btn')?.addEventListener('click', () => {
        document.getElementById('review-modal')?.classList.add('hidden');
    });
}

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

// Auto-search logic
const urlParams = new URLSearchParams(window.location.search);
const trackingParam = urlParams.get('number');
if (trackingParam) {
    if (input) input.value = trackingParam;
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

function renderOrderReceivedButton(order: Order) {
    if (['shipped', 'delivered', 'completed'].includes(order.status)) {
        const isCompleted = order.status === 'completed';
        return `
        <div class="mt-8 text-center animate-fade-in border-t border-gray-100 dark:border-gray-800 pt-8">
            <button id="order-received-btn" class="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 transition-all transform hover:scale-105" onclick="window.openReviewModal('${order.id}')">
                <span class="material-symbols-outlined">${isCompleted ? 'rate_review' : 'check_box'}</span>
                ${isCompleted ? 'Write a Review' : 'Order Received'}
            </button>
            <p class="text-xs text-gray-500 mt-2">${isCompleted ? 'Share your feedback about the products.' : 'Click to confirm receipts and rate products.'}</p>
        </div>
        `;
    }
    return '';
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

    let currentStepIndex = 0;
    const s = order.status;

    if (s === 'pending' || s === 'paid') currentStepIndex = 0;
    else if (s === 'in_production') currentStepIndex = 1;
    else if (s === 'quality_check') currentStepIndex = 2;
    else if (s === 'shipped') currentStepIndex = 3;
    else if (s === 'delivered' || s === 'completed') currentStepIndex = 4;
    else if (s === 'cancelled') currentStepIndex = -1;

    if (currentStepIndex === -1) {
        resultContainer.innerHTML = `
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl text-center">
                <div class="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4">
                    <span class="material-symbols-outlined text-3xl">cancel</span>
                </div>
                <h2 class="text-2xl font-bold mb-2">Order Cancelled</h2>
                <p class="text-gray-500">This order has been cancelled.</p>
             </div>
        `;
        resultContainer.classList.remove('hidden');
        return;
    }

    if (order.status === 'pending' || order.status === 'paid') {
        resultContainer.innerHTML = `
             <div class="bg-white dark:bg-[#151c2b] rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl text-center max-w-2xl mx-auto">
                <div class="inline-flex p-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-6 animate-pulse">
                    <span class="material-symbols-outlined text-4xl">hourglass_top</span>
                </div>
                <h2 class="text-3xl font-black mb-4 text-gray-900 dark:text-white">Order Received!</h2>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Thank you for your order <b>#${order.id.slice(0, 8)}</b>. We are currently reviewing your request.
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

                <div class="px-6 py-12 sm:px-10">
                    <div class="relative">
                        <div class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div class="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-1000 ease-out" style="width: ${(currentStepIndex / (steps.length - 1)) * 100}%"></div>
                        
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
                                </div>`;
    }).join('')}
                        </div>
                    </div>
                </div>

                ${currentStepIndex === 3 ? `
                <div class="bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20 px-6 py-4 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
                    <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-primary">
                        <span class="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Package is in transit</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Your order is on its way.</p>
                    </div>
                </div>
                ` : ''}

                ${currentStepIndex === 4 ? `
                <div class="bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20 px-6 py-4 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up">
                    <div class="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600">
                        <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Package Delivered</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Your order has been delivered successfully.</p>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Tracking History -->
                <div class="lg:col-span-2 space-y-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Tracking History</h3>
                    <div class="rounded-2xl bg-white dark:bg-[#151c2b] border border-gray-100 dark:border-gray-800 p-6 shadow-md">
                        <div class="relative space-y-0">
                             ${steps.slice(0, currentStepIndex + 1).reverse().map((step, i) => `
                                <div class="flex gap-4 pb-8 relative group last:pb-0">
                                    <div class="absolute left-[19px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800 group-last:hidden"></div>
                                    <div class="flex-shrink-0 mt-1">
                                        <div class="size-10 rounded-full ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} flex items-center justify-center border-4 border-white dark:border-[#151c2b] shadow-sm">
                                            <span class="material-symbols-outlined text-xl">${step.icon}</span>
                                        </div>
                                    </div>
                                    <div class="flex-grow pt-2">
                                        <div class="flex justify-between items-start mb-1">
                                            <h4 class="font-bold text-gray-900 dark:text-white">${step.label}</h4>
                                        </div>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Status updated successfully.</p>
                                    </div>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                    
                    <!-- Order Received Button Section -->
                    ${renderOrderReceivedButton(order)}
                </div>

                <!-- Order Items -->
                <div class="space-y-6">
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

// Image Preview Handler
(window as any).handleReviewPhotoPreview = (input: HTMLInputElement) => {
    const previewContainer = input.parentElement?.nextElementSibling;
    if (previewContainer && input.files) {
        // Simple append for now
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 animate-fade-in group';
                imgDiv.innerHTML = `
                    <img src="${e.target?.result}" class="w-full h-full object-cover">
                    <button type="button" class="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all" onclick="this.parentElement.remove()">
                        <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                `;
                previewContainer.appendChild(imgDiv);
            };
            reader.readAsDataURL(file);
        });
    }
};

// Modal Logic Exposure
(window as any).openReviewModal = async (orderId: string) => {
    const loadingBtn = document.getElementById('order-received-btn');
    if (loadingBtn) loadingBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Loading...';

    try {
        const order = await OrderService.getOrderById(orderId);
        if (!order) return;

        const modal = document.getElementById('review-modal');
        const container = document.getElementById('review-products-container');
        const anonCheckbox = document.getElementById('review-anonymous') as HTMLInputElement;
        const submitBtn = document.getElementById('submit-reviews-btn');

        if (modal && container && submitBtn) {
            const user = await AuthService.getUser();
            const isGuest = !user || !user.primaryEmailAddress;

            if (isGuest) {
                anonCheckbox.checked = true;
                anonCheckbox.disabled = true;
                if (anonCheckbox.nextElementSibling) anonCheckbox.nextElementSibling.textContent = "Posting anonymously (Guest)";
            } else {
                anonCheckbox.checked = false;
                anonCheckbox.disabled = false;
                if (anonCheckbox.nextElementSibling) anonCheckbox.nextElementSibling.textContent = `Hide my name (Review as ${user.fullName || (user as any).firstName || 'User'})`;
            }

            container.innerHTML = (order.items || []).map(item => `
                <div class="product-review-item border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0" data-product-id="${(item.products as any).id || (item as any).product_id /* Fallback if we cannot get ID from joined object */}"> 
                    <div class="flex gap-4 mb-3">
                        <img src="${item.products?.images?.[0]}" class="w-12 h-12 rounded object-cover bg-gray-100">
                        <div>
                            <p class="font-bold text-gray-900 dark:text-white text-sm">${item.products?.name}</p>
                            <p class="text-xs text-gray-500">Rate this product</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1 mb-2 star-rating-group" data-item-id="${item.id}">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <button type="button" class="star-btn text-gray-300 hover:text-yellow-400 transition-colors" data-value="${star}">
                                <span class="material-symbols-outlined text-2xl fill-current">star</span>
                            </button>
                        `).join('')}
                        <input type="hidden" class="rating-value" value="5">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Write a Review</label>
                        <textarea id="review-comment" rows="3" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" placeholder="What did you like or dislike?"></textarea>
                    </div>

                    <!-- Photo Upload Placeholder -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Photos (Optional)</label>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            <label for="review-photos" class="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary hover:text-primary transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span class="material-symbols-outlined text-2xl">add_a_photo</span>
                                <span class="text-[10px] uppercase font-bold mt-1">Add</span>
                                <input type="file" id="review-photos" accept="image/*" multiple class="hidden" onchange="window.handleReviewPhotoPreview(this)">
                            </label>
                            <div id="photo-previews" class="flex gap-2">
                                <!-- Previews will go here -->
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.product-review-item').forEach((itemDiv) => {
                const stars = itemDiv.querySelectorAll('.star-btn');
                const input = itemDiv.querySelector('.rating-value') as HTMLInputElement;

                // Initialize state
                updateStars(stars, 5);

                stars.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault(); // Prevent accidental form submit or focus issues
                        e.stopPropagation();
                        // ensure we get the button even if span is clicked
                        const target = (e.target as HTMLElement).closest('.star-btn') as HTMLElement;
                        const val = parseInt(target.dataset.value || '0');
                        input.value = val.toString();
                        updateStars(stars, val);
                    });
                });
            });

            submitBtn.onclick = async () => {
                submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Submitting...';
                (submitBtn as HTMLButtonElement).disabled = true;

                try {
                    await OrderService.markOrderCompleted(order.id);

                    const reviewPromises = (order.items || []).map(async (item, index) => {
                        const itemDiv = container.children[index];
                        const rating = parseInt((itemDiv.querySelector('.rating-value') as HTMLInputElement).value);
                        const comment = (itemDiv.querySelector('textarea') as HTMLTextAreaElement).value;
                        const productId = (item as any).product_id;
                        const fileInput = itemDiv.querySelector('input[type="file"]') as HTMLInputElement;

                        if (!productId) throw new Error('Product ID missing');

                        // Upload Photos
                        let imageUrls: string[] = [];
                        if (fileInput && fileInput.files && fileInput.files.length > 0) {
                            try {
                                const uploadPromises = Array.from(fileInput.files).map(file => ReviewService.uploadReviewPhoto(file));
                                imageUrls = await Promise.all(uploadPromises);
                            } catch (uploadErr) {
                                console.error('Failed to upload some photos', uploadErr);
                                Toast.show('Failed to upload some photos, review submitted without them.', 'error');
                            }
                        }

                        return ReviewService.createReview({
                            order_id: order.id,
                            product_id: productId,
                            user_id: isGuest ? undefined : user?.id,
                            person_name: isGuest ? 'Anonymous' : (anonCheckbox.checked ? 'Anonymous' : (user?.fullName || 'Customer')),
                            rating,
                            comment,
                            is_anonymous: isGuest || anonCheckbox.checked,
                            images: imageUrls
                        });
                    });

                    await Promise.all(reviewPromises);

                    Toast.show('Thank you for your feedback!', 'success');
                    modal.classList.add('hidden');

                    setLoading(true);
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);

                } catch (e) {
                    console.error(e);
                    Toast.show('Failed to submit review', 'error');
                    submitBtn.textContent = 'Submit Reviews';
                    (submitBtn as HTMLButtonElement).disabled = false;
                }
            };

            modal.classList.remove('hidden');
        }

    } catch (e) {
        console.error(e);
        Toast.show('Error opening review modal', 'error');
    } finally {
        if (loadingBtn) loadingBtn.innerHTML = `<span class="material-symbols-outlined">check_box</span> Order Received`;
    }
};

function updateStars(stars: NodeListOf<Element>, value: number) {
    stars.forEach(s => {
        const starVal = parseInt((s as HTMLElement).dataset.value || '0');
        const icon = s.querySelector('span');
        if (starVal <= value) {
            s.classList.remove('text-gray-300');
            s.classList.add('text-yellow-400');
            if (icon) {
                icon.textContent = 'star';
                icon.classList.add('material-symbols-filled');
                icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
            }
        } else {
            s.classList.add('text-gray-300');
            s.classList.remove('text-yellow-400');
            if (icon) {
                icon.textContent = 'star';
                icon.classList.remove('material-symbols-filled');
                icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
            }
        }
    });
}
