import '../style.css';
import { AppHeader } from '../components/header';
import { AuthService } from '../services/auth.service';
import { OrderService, Order } from '../services/order.service';
import { ReviewService } from '../services/review.service';
import { Toast } from '../components/toast';

if (!customElements.get('app-header')) {
    customElements.define('app-header', AppHeader);
}

const ordersContainer = document.getElementById('orders-container');
const tabProgress = document.getElementById('tab-progress');
const tabDelivered = document.getElementById('tab-delivered');
const emptyTemplate = document.getElementById('empty-state-template') as HTMLTemplateElement;

let allOrders: Order[] = [];
let currentTab: 'progress' | 'delivered' = 'progress';

async function init() {
    const user = await AuthService.getUser();

    if (!user || !user.primaryEmailAddress) {
        window.location.href = '/';
        return;
    }

    // Inject Review Modal (if not exists)
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

    try {
        allOrders = await OrderService.getOrdersByCustomer(user.primaryEmailAddress.emailAddress);
        render();
    } catch (err) {
        console.error('Failed to load orders', err);
        if (ordersContainer) ordersContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load orders.</p>';
    }
}

function render() {
    if (!ordersContainer) return;

    // Filter
    const inProgressStatuses = ['pending', 'paid', 'approved', 'in_production', 'quality_check', 'shipped'];
    const filteredOrders = allOrders.filter(o =>
        currentTab === 'progress'
            ? inProgressStatuses.includes(o.status)
            : !inProgressStatuses.includes(o.status) // delivered, completed, cancelled
    );

    // Update Tabs UI
    if (currentTab === 'progress') {
        tabProgress?.classList.add('text-primary', 'border-b-2', 'border-primary');
        tabProgress?.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-b-0');
        tabDelivered?.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tabDelivered?.classList.add('text-gray-500', 'dark:text-gray-400');
    } else {
        tabDelivered?.classList.add('text-primary', 'border-b-2', 'border-primary');
        tabDelivered?.classList.remove('text-gray-500', 'dark:text-gray-400');
        tabProgress?.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tabProgress?.classList.add('text-gray-500', 'dark:text-gray-400');
    }

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '';
        const node = emptyTemplate.content.cloneNode(true);
        ordersContainer.appendChild(node);
        return;
    }

    ordersContainer.innerHTML = filteredOrders.map(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const statusConfig = getStatusConfig(order.status);

        return `
        <div class="bg-white dark:bg-[#151c2b] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div class="flex gap-4 items-center">
                    <div class="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <span class="material-symbols-outlined">shopping_bag</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Order ID: <span class="font-mono font-bold text-gray-900 dark:text-white">#${order.id.slice(0, 8)}</span></p>
                        <p class="text-xs text-gray-400">${date}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}">
                        ${statusConfig.icon ? `<span class="material-symbols-outlined text-[16px]">${statusConfig.icon}</span>` : ''}
                        ${order.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <!-- Items -->
            <div class="space-y-4 mb-6">
                ${(order.items || []).map(item => `
                    <div class="flex gap-4 items-center">
                         <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-200 dark:border-gray-700 shrink-0">
                            <img class="object-cover w-full h-full" src="${item.products?.images?.[0] || ''}" alt="${item.products?.name}">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-gray-900 dark:text-white truncate">${item.products?.name}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-sm text-gray-500 dark:text-gray-400">Qty: ${item.quantity}</span>
                                ${item.is_preorder ? `<span class="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/40 px-1.5 py-0.5 rounded">PRE-ORDER</span>` : ''}
                            </div>
                        </div>
                        <span class="font-bold text-gray-900 dark:text-white">₱${(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Footer -->
            <div class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 gap-4">
                <div class="flex gap-1 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Total Amount:</span>
                    <span class="font-black text-gray-900 dark:text-white text-lg">₱${order.total_amount.toFixed(2)}</span>
                </div>
                
                <div class="flex w-full sm:w-auto gap-3">
                     ${currentTab === 'progress' && order.tracking_number ? `
                        <a href="/pages/tracking.html?number=${order.tracking_number}" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                            Track Order
                        </a>
                     ` : ''}
                     ${(order.status === 'delivered' || order.status === 'completed') ? `
                         <button onclick="window.openReviewModal('${order.id}')" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                            <span class="material-symbols-outlined text-[18px]">rate_review</span>
                            Write a Review
                         </button>
                         <a href="/pages/tracking.html?number=${order.tracking_number}" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                            View Details
                        </a>
                     ` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'pending': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: 'hourglass_top' };
        case 'paid': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'credit_card' };
        case 'approved': return { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: 'check_circle' };
        case 'in_production': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: 'palette' };
        case 'quality_check': return { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400', icon: 'verified' };
        case 'shipped': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'local_shipping' };
        case 'delivered': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: 'package_2' };
        case 'completed': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: 'check' };
        case 'cancelled': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: 'cancel' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'info' };
    }
}

// Review Modal Logic
(window as any).openReviewModal = async (orderId: string) => {
    try {
        const order = allOrders.find(o => o.id === orderId);
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
                <div class="product-review-item border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0" data-product-id="${(item.products as any).id || (item as any).product_id}"> 
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

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Photos (Optional)</label>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            <label for="review-photos-${orderId}-${item.id}" class="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary hover:text-primary transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span class="material-symbols-outlined text-2xl">add_a_photo</span>
                                <span class="text-[10px] uppercase font-bold mt-1">Add</span>
                                <input type="file" id="review-photos-${orderId}-${item.id}" accept="image/*" multiple class="hidden" onchange="window.handleReviewPhotoPreview(this)">
                            </label>
                            <div id="photo-previews" class="flex gap-2"></div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.product-review-item').forEach((itemDiv) => {
                const stars = itemDiv.querySelectorAll('.star-btn');
                const input = itemDiv.querySelector('.rating-value') as HTMLInputElement;

                updateStars(stars, 5);

                stars.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
                        const productId = (item.products as any).id || (item as any).product_id;
                        const fileInput = itemDiv.querySelector('input[type="file"]') as HTMLInputElement;

                        if (!productId) throw new Error('Product ID missing');

                        let imageUrls: string[] = [];
                        if (fileInput && fileInput.files && fileInput.files.length > 0) {
                            try {
                                const uploadPromises = Array.from(fileInput.files).map(file => ReviewService.uploadReviewPhoto(file));
                                imageUrls = await Promise.all(uploadPromises);
                            } catch (uploadErr) {
                                console.error('Failed to upload some photos', uploadErr);
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
                    // Refresh
                    await init();

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

(window as any).handleReviewPhotoPreview = (input: HTMLInputElement) => {
    const previewContainer = input.parentElement?.nextElementSibling;
    if (previewContainer && input.files) {
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

if (tabProgress) tabProgress.addEventListener('click', () => { currentTab = 'progress'; render(); });
if (tabDelivered) tabDelivered.addEventListener('click', () => { currentTab = 'delivered'; render(); });

init();
