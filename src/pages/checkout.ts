import '../style.css';
import { AuthService } from '../services/auth.service';

import { CheckoutService, OrderDetails } from '../services/checkout.service';
import { CartService } from '../services/cart.service';
import { Toast } from '../components/toast';
import { z } from 'zod';
import { ProductService } from '../services/product.service';
import { CartItem } from '../state/cart';


const itemsContainer = document.getElementById('order-summary-items');
const subtotalEl = document.getElementById('summary-subtotal');
const taxEl = document.getElementById('summary-tax');
const totalEl = document.getElementById('summary-total');
const placeOrderBtn = document.getElementById('place-order-btn');

// --- Zod Schema Validation ---
const checkoutSchema = z.object({
    fullName: z.string().min(2, "Full Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^(09|\+639)\d{9}$/, "Phone number must be valid (e.g., 09123456789)"),
    meetupLocation: z.string().min(1, "Please select a meet-up location"),
    meetupDate: z.string().min(1, "Please select a preferred date"),
    meetupTime: z.string().min(1, "Please select a preferred time"),
    paymentMethod: z.enum(['online', 'cod'], { errorMap: () => ({ message: "Please select a payment method" }) })
});

let appliedCoupon: { code: string; percent: number } | null = null;
const urlParams = new URLSearchParams(window.location.search);
const isDirect = urlParams.get('direct') === 'true';

// Helper to get items (either from Cart or Direct URL params)
async function getItemsForCheckout(): Promise<CartItem[]> {
    if (isDirect) {
        const productId = urlParams.get('productId');
        const quantity = parseInt(urlParams.get('quantity') || '1');
        if (productId) {
            const product = await ProductService.getProductById(productId);
            if (product) {
                return [{ ...product, quantity }];
            }
        }
        return [];
    }
    return CartService.getItems();
}

// --- Auth Selection UI Logic ---
const authSelectionContainer = document.getElementById('auth-selection-container');
const checkoutFormContainer = document.getElementById('checkout-form-container');
const guestCheckoutBtn = document.getElementById('guest-checkout-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

function showCheckoutForm() {
    authSelectionContainer?.classList.add('hidden');
    checkoutFormContainer?.classList.remove('hidden');
    checkoutFormContainer?.classList.add('flex');
}

if (guestCheckoutBtn) {
    guestCheckoutBtn.addEventListener('click', () => {
        showCheckoutForm();
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('redirect_url', window.location.href);
        window.location.href = `/pages/login.html?${params.toString()}`;
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('redirect_url', window.location.href);
        window.location.href = `/pages/login.html?mode=signup&${params.toString()}`;
    });
}


async function renderOrderSummary() {
    // Show spinner or loading state
    if (itemsContainer) itemsContainer.innerHTML = '<p class="text-center text-gray-500">Loading items...</p>';

    const items = await getItemsForCheckout();

    // Calculate totals locally based on fetched items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let tax = 0;
    let total = subtotal + tax;

    if (itemsContainer) {
        if (items.length === 0) {
            itemsContainer.innerHTML = '<p class="text-center text-text-muted">Your cart is empty.</p>';
            if (placeOrderBtn) {
                (placeOrderBtn as HTMLButtonElement).disabled = true; // Disable if empty
            }
        } else {
            // Check stock status
            if (placeOrderBtn) (placeOrderBtn as HTMLButtonElement).disabled = true; // Validate first

            try {
                // Fetch fresh product data for stock validation
                const freshProducts = await ProductService.getProductsByIds(items.map(i => i.id));
                let hasStockIssue = false;

                itemsContainer.innerHTML = items.map(item => {
                    const freshP = freshProducts.find(p => p.id === item.id);
                    const currentStock = freshP ? freshP.inventory_count : 0;

                    // Pre-order logic: If stock is 0, it's a pre-order.
                    const isPreOrder = currentStock <= 0;
                    // Low stock logic: If has stock but not enough.
                    const isLowStock = !isPreOrder && item.quantity > currentStock;

                    // Only block if LOW stock (partial availability conflict), but allow Pre-order (0 stock)
                    if (isLowStock) hasStockIssue = true;

                    const imageSrc = item.images?.[0] || '';
                    const imageElement = imageSrc
                        ? `<img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover ${isLowStock ? 'grayscale opacity-50' : ''}" />`
                        : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                            <span class="material-symbols-outlined text-lg">inventory_2</span>
                           </div>`;

                    let statusBadge = '';
                    if (isPreOrder) {
                        statusBadge = `<p class="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded w-fit mt-1">
                            <span class="material-symbols-outlined text-[10px]">local_shipping</span> PRE-ORDER
                        </p>`;
                    } else if (isLowStock) {
                        statusBadge = `<p class="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded w-fit mt-1">ONLY ${currentStock} LEFT</p>`;
                    }

                    return `
                    <div class="flex gap-4">
                        <div class="w-20 h-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative border ${isLowStock ? 'border-red-300' : 'border-transparent'}">
                            ${imageElement}
                            <span class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-lg">x${item.quantity}</span>
                        </div>
                        <div class="flex flex-col justify-between flex-1">
                            <div>
                                <h4 class="font-bold text-sm leading-tight mb-1 dark:text-white ${isLowStock ? 'text-gray-500' : ''}">${item.name}</h4>
                                <p class="text-xs text-text-muted mb-1">${(item as any).categories?.name || 'Product'}</p>
                                ${statusBadge}
                            </div>
                            <p class="font-bold dark:text-white">₱${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                    `;
                }).join('');

                if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
                if (taxEl) taxEl.textContent = `₱${tax.toFixed(2)}`;
                if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;

                // Re-enable button if no stock issues
                if (placeOrderBtn) {
                    (placeOrderBtn as HTMLButtonElement).disabled = hasStockIssue;
                    if (hasStockIssue) {
                        Toast.show("Some items have insufficient stock. Please update quantity.", "error");
                    }
                }

                // Coupon Re-calc if applied
                if (appliedCoupon && totalEl) {
                    const discountAmount = subtotal * (appliedCoupon.percent / 100);
                    const discountedTotal = total - discountAmount;

                    // Update UI to show discount
                    const discountEl = document.getElementById('summary-discount');
                    if (discountEl) {
                        discountEl.parentElement!.classList.remove('hidden');
                        discountEl.textContent = `-₱${discountAmount.toFixed(2)} (${appliedCoupon.percent}% OFF)`;
                    }
                    totalEl.textContent = `₱${discountedTotal.toFixed(2)}`;
                }

            } catch (error) {
                console.error('Error rendering order summary:', error);
                if (itemsContainer) itemsContainer.innerHTML = '<p class="text-center text-red-500">Failed to load items.</p>';
            }
        }
    }
}

// Coupon Logic
const couponForm = document.getElementById('coupon-form') as HTMLFormElement;
const couponInput = document.getElementById('coupon-code') as HTMLInputElement;

if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = couponInput.value.trim().toUpperCase();

        // Mock Coupon Validation (Replace with DB check in real app)
        if (code === 'SAVE10') {
            appliedCoupon = { code: 'SAVE10', percent: 10 };
            Toast.show('Coupon applied: 10% OFF', 'success');
            renderOrderSummary(); // Re-render to update totals
        } else if (code === 'WELCOME20') {
            appliedCoupon = { code: 'WELCOME20', percent: 20 };
            Toast.show('Coupon applied: 20% OFF', 'success');
            renderOrderSummary();
        } else {
            Toast.show('Invalid coupon code', 'error');
            appliedCoupon = null;
            renderOrderSummary(); // Reset
        }
    });
}

// Payment Method Toggle UI
function toggleCardDetails() {
    const onlineSection = document.getElementById('payment-online-section');
    const codSection = document.getElementById('payment-cod-section');
    const isOnline = (document.getElementById('payment-online') as HTMLInputElement).checked;

    if (isOnline) {
        onlineSection?.classList.remove('hidden');
        codSection?.classList.add('hidden');
    } else {
        onlineSection?.classList.add('hidden');
        codSection?.classList.remove('hidden');
    }
}

const paymentOnlineBtn = document.getElementById('payment-online');
const paymentCodBtn = document.getElementById('payment-cod');

if (paymentOnlineBtn && paymentCodBtn) {
    paymentOnlineBtn.addEventListener('change', toggleCardDetails);
    paymentCodBtn.addEventListener('change', toggleCardDetails);
    toggleCardDetails();
}

if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async () => {
        // Validation
        const items = await getItemsForCheckout();

        console.log('Items for Checkout:', items);
        if (items.length === 0) {
            Toast.show("No items to checkout.", "error");
            return;
        }

        // Gather Data
        const formData = {
            fullName: (document.getElementById('fullName') as HTMLInputElement)?.value,
            email: (document.getElementById('email') as HTMLInputElement)?.value,
            phone: (document.getElementById('phone') as HTMLInputElement)?.value,
            meetupLocation: (document.getElementById('meetupLocation') as HTMLSelectElement)?.value,
            meetupDate: (document.getElementById('meetupDate') as HTMLInputElement)?.value,
            meetupTime: (document.getElementById('meetupTime') as HTMLInputElement)?.value,
            paymentMethod: (document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement)?.value
        };

        // Zod Validation
        try {
            checkoutSchema.parse(formData);
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                // Show first error
                Toast.show(e.errors[0].message, 'error');
                return;
            }
        }

        // Format Address for Backend (State, City, Street)
        const formattedAddress = `MEET-UP: ${formData.meetupLocation} | DATE: ${formData.meetupDate} | TIME: ${formData.meetupTime} | CDO`;

        // Stock Validation (Fresh Check)
        try {
            const freshProducts = await ProductService.getProductsByIds(items.map(i => i.id));
            for (const item of items) {
                const freshP = freshProducts.find(p => p.id === item.id);
                const currentStock = freshP ? freshP.inventory_count : 0;

                // ALLOW PRE-ORDER: If currentStock is <= 0, it's allowed.
                // REJECT LOW STOCK: If currentStock > 0 but < item.quantity, reject.
                if (currentStock > 0 && item.quantity > currentStock) {
                    Toast.show(`Stock changed. ${item.name}: Only ${currentStock} left.`, 'error');
                    renderOrderSummary(); // Re-render to show badges and disable button
                    return;
                }
            }
        } catch (e) {
            console.error('Final stock check failed', e);
            // Decide policy: fail safe?
            Toast.show('Unable to verify stock. Please try again.', 'error');
            return;
        }

        const orderDetails: Partial<OrderDetails> = {
            ...formData,
            address: formattedAddress, // Overwrite with compiled string
            paymentMethod: formData.paymentMethod as 'online' | 'cod'
        };

        // UI Loading
        placeOrderBtn.innerHTML = `
            <span class="animate-spin material-symbols-outlined text-base">progress_activity</span>
            <span>Processing...</span>
        `;
        (placeOrderBtn as HTMLButtonElement).disabled = true;

        // Pass 'items' explicitly if Direct Checkout. If not direct (items come not from CartService logic here but getItemsForCheckout()), 
        // effectively we want to tell CheckoutService which items to use.
        // If isDirect is true, passing 'items' will prevent Cart clearing.
        // If isDirect is false, passing 'items' would essentially act same but we want Cart clearing.
        // CheckoutService logic:  "If directItems provided, use them and DON'T clear cart. Else use CartState and clear."

        // So:
        const directItems = isDirect ? items : undefined;

        const placeOrdRes = await CheckoutService.placeOrder(orderDetails as OrderDetails, directItems);

        if (!placeOrdRes.success) {
            Toast.show(placeOrdRes.error || 'Failed to place order', 'error');
            placeOrderBtn.innerHTML = 'Place Order';
            (placeOrderBtn as HTMLButtonElement).disabled = false;
            return;
        }

        try {
            await fetch('/api/confirm-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    orderId: placeOrdRes.orderId,
                    couponCode: appliedCoupon?.code,
                    totalAmount: totalEl?.textContent?.replace('₱', '') || '0.00'
                })
            });
        } catch (e) {
            console.error('Failed to trigger confirmation email', e);
        }

        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-6 animate-bounce">
                        <span class="material-symbols-outlined text-6xl">check_circle</span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Order Placed Successfully!</h1>
                    <p class="text-lg text-text-muted max-w-lg mb-8">
                        Thank you for your order! I will get back to you once your order is approved.
                    </p>
                    
                    <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border-2 border-primary/20 mb-8 max-w-md w-full">
                        <h3 class="font-bold text-lg mb-2">Track your order</h3>
                        <p class="text-sm text-text-muted mb-4">Your tracking number is <span class="font-mono font-bold text-primary select-all">${placeOrdRes.trackingNumber}</span>.</p>
                        <a href="/pages/tracking.html?number=${placeOrdRes.trackingNumber}" class="block w-full text-center bg-white dark:bg-gray-800 border-2 border-primary text-primary font-bold py-2 rounded-full hover:bg-primary hover:text-white transition-all">
                            Track Order Status
                        </a>
                    </div>

                    <a href="/" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 transition-all">
                        Continue Shopping
                    </a>
                </div>
            `;
        }
    });
}

// Auth Pre-fill
// Auth Pre-fill & Auto-Show Form
AuthService.getUser().then(user => {
    if (user && user.primaryEmailAddress) {
        showCheckoutForm(); // User is logged in, show form immediately

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const nameInput = document.getElementById('fullName') as HTMLInputElement;

        if (emailInput && !emailInput.value) emailInput.value = user.primaryEmailAddress.emailAddress;
        if (nameInput && !nameInput.value) nameInput.value = user.fullName || '';
    }
});

renderOrderSummary();
