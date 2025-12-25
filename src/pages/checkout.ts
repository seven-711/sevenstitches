import '../style.css';
import { AuthService } from '../services/auth.service';
import { clerk } from '../lib/clerk';
import { CheckoutService, OrderDetails } from '../services/checkout.service';
import { CartService } from '../services/cart.service';
import { Toast } from '../components/toast';
import { z } from 'zod';
// Remove phLocations import
// import { phLocations } from '../data/ph-locations'; 

const itemsContainer = document.getElementById('order-summary-items');
const subtotalEl = document.getElementById('summary-subtotal');
const taxEl = document.getElementById('summary-tax');
const totalEl = document.getElementById('summary-total');
const placeOrderBtn = document.getElementById('place-order-btn');

// --- Zod Schema Validation ---
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


// ... Rest of the existing logic (Render Summary, Coupon, etc.) ...
function renderOrderSummary() {
    const items = CartService.getItems();
    const subtotal = CartService.getTotal();
    let tax = 0; // Tax set to 0 as requested
    let total = subtotal + tax;

    if (itemsContainer) {
        if (items.length === 0) {
            itemsContainer.innerHTML = '<p class="text-center text-text-muted">Your cart is empty.</p>';
            if (placeOrderBtn) {
                // We keep it enabled to show the error toast when clicked
                (placeOrderBtn as HTMLButtonElement).disabled = false;
            }
        } else {
            itemsContainer.innerHTML = items.map(item => {
                const imageSrc = item.images?.[0] || '';
                const imageElement = imageSrc
                    ? `<img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover" />`
                    : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                        <span class="material-symbols-outlined text-lg">inventory_2</span>
                       </div>`;

                return `
                <div class="flex gap-4">
                    <div class="w-20 h-20 shrink-0 rounded-lg bg-gray-100 overflow-hidden relative">
                        ${imageElement}
                        <span class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-lg">x${item.quantity}</span>
                    </div>
                    <div class="flex flex-col justify-between flex-1">
                        <div>
                            <h4 class="font-bold text-sm leading-tight mb-1 dark:text-white">${item.name}</h4>
                            <p class="text-xs text-text-muted">${(item as any).categories?.name || 'Product'}</p>
                        </div>
                        <p class="font-bold dark:text-white">₱${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `}).join('');
            if (placeOrderBtn) (placeOrderBtn as HTMLButtonElement).disabled = false;
        }
    }

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;

    // Discount Logic
    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = subtotal * (appliedCoupon.percent / 100);
    }

    // Render Discount UI if not present
    const summaryContainer = document.querySelector('#order-summary-container .space-y-4') || document.querySelector('.bg-surface-light .space-y-4');
    let discountRow = document.getElementById('summary-discount-row');
    if (!discountRow && summaryContainer) {
        // Insert before tax
        const taxRow = document.getElementById('summary-tax')?.parentElement;
        if (taxRow) {
            discountRow = document.createElement('div');
            discountRow.id = 'summary-discount-row';
            discountRow.className = 'flex justify-between text-text-muted hidden';
            discountRow.innerHTML = `<span>Discount</span><span class="font-medium text-green-600" id="summary-discount">-₱0.00</span>`;
            taxRow.parentElement?.insertBefore(discountRow, taxRow);
        }
    }

    if (discountRow) {
        if (appliedCoupon) {
            discountRow.classList.remove('hidden');
            const discEl = discountRow.querySelector('#summary-discount');
            if (discEl) discEl.textContent = `-₱${discountAmount.toFixed(2)} (${appliedCoupon.percent}%)`;
        } else {
            discountRow.classList.add('hidden');
        }
    }

    tax = 0; // Tax set to 0 as requested
    total = (subtotal - discountAmount) + tax;

    if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₱${tax.toFixed(2)}`;
}

function setupCouponListeners() {
    let couponContainer = document.getElementById('coupon-input-container');

    if (!couponContainer && itemsContainer) {
        couponContainer = document.createElement('div');
        couponContainer.id = 'coupon-input-container';
        couponContainer.className = 'mt-6 pt-6 border-t border-border';
        couponContainer.innerHTML = `
            <div class="relative">
                <input type="text" id="coupon-code-input" placeholder="Promo Code" class="w-full pl-5 pr-24 h-12 bg-white dark:bg-slate-800 border border-border rounded-full text-sm focus:outline-none focus:border-primary uppercase" />
                <button type="button" id="apply-coupon-btn" class="absolute right-1 top-1 bottom-1 px-5 rounded-full bg-surface-dark dark:bg-white text-white dark:text-text-main text-sm font-bold hover:opacity-90 transition-opacity">Apply</button>
            </div>
            <p id="coupon-message" class="text-xs mt-1 min-h-[1.25em]"></p>
        `;
        itemsContainer.parentElement?.appendChild(couponContainer);
    }

    const applyBtn = document.getElementById('apply-coupon-btn');
    const input = document.getElementById('coupon-code-input') as HTMLInputElement;
    const msg = document.getElementById('coupon-message');

    if (applyBtn && input) {
        applyBtn.addEventListener('click', async () => {
            const code = input.value.trim().toUpperCase();
            if (!code) return;

            applyBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>';
            (applyBtn as HTMLButtonElement).disabled = true;

            try {
                const res = await fetch('/api/validate-coupon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const data = await res.json();

                if (data.valid) {
                    appliedCoupon = { code: data.code, percent: data.discountPercent };
                    Toast.show('Coupon applied!', 'success');
                    if (msg) {
                        msg.textContent = `Coupon ${data.code} applied.`;
                        msg.className = 'text-xs mt-1 text-green-600';
                    }
                    renderOrderSummary();
                } else {
                    appliedCoupon = null;
                    Toast.show(data.message || 'Invalid coupon', 'error');
                    if (msg) {
                        msg.textContent = data.message;
                        msg.className = 'text-xs mt-1 text-red-500';
                    }
                    renderOrderSummary();
                }
            } catch (e) {
                console.error(e);
                Toast.show('Failed to validate coupon', 'error');
            } finally {
                applyBtn.innerHTML = 'Apply';
                (applyBtn as HTMLButtonElement).disabled = false;
            }
        });
    }
}

renderOrderSummary();
setupCouponListeners();

const authSelectionContainer = document.getElementById('auth-selection-container');
const checkoutFormContainer = document.getElementById('checkout-form-container');
const guestCheckoutBtn = document.getElementById('guest-checkout-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

function showCheckoutForm() {
    if (authSelectionContainer) authSelectionContainer.classList.add('hidden');
    if (checkoutFormContainer) checkoutFormContainer.classList.remove('hidden');
}

async function init() {
    const user = await AuthService.getUser();
    if (user) {
        showCheckoutForm();
        const emailInput = document.getElementById('email') as HTMLInputElement;
        if (emailInput) {
            const email = user.primaryEmailAddress?.emailAddress || (user as any).email;
            if (email) {
                emailInput.value = email;
                emailInput.readOnly = true;
                emailInput.classList.add('opacity-75', 'cursor-not-allowed');
            }
        }
    }
}

if (guestCheckoutBtn) {
    guestCheckoutBtn.addEventListener('click', async () => {
        await AuthService.loginAsGuest('guest@example.com');
        showCheckoutForm();
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        clerk.openSignIn();
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        clerk.openSignUp();
    });
}


init();

const paymentOnlineBtn = document.getElementById('payment-online') as HTMLInputElement;
const paymentCodBtn = document.getElementById('payment-cod') as HTMLInputElement;
const cardDetailsSection = document.getElementById('card-details-section');

function toggleCardDetails() {
    if (cardDetailsSection) {
        if (paymentOnlineBtn?.checked) {
            cardDetailsSection.classList.remove('max-h-0', 'opacity-0', 'p-0', 'mt-0', 'border-none', 'overflow-hidden');
            cardDetailsSection.classList.add('max-h-[500px]', 'opacity-100', 'p-6', 'mt-6', 'border');
        } else {
            cardDetailsSection.classList.remove('max-h-[500px]', 'opacity-100', 'p-6', 'mt-6', 'border');
            cardDetailsSection.classList.add('max-h-0', 'opacity-0', 'p-0', 'mt-0', 'border-none', 'overflow-hidden');
        }
    }
}

if (paymentOnlineBtn && paymentCodBtn) {
    paymentOnlineBtn.addEventListener('change', toggleCardDetails);
    paymentCodBtn.addEventListener('change', toggleCardDetails);
    toggleCardDetails();
}

if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', async () => {
        // Empty Cart Validation
        // Empty Cart Validation
        const items = CartService.getItems();
        console.log('Cart Items on Checkout:', items);
        if (items.length === 0) {
            Toast.show("Your cart is empty. Please add items before placing an order.", "error");
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

        // Stock Validation
        const cartItems = CartService.getItems();
        for (const item of cartItems) {
            if (item.quantity > (item.inventory_count || 0)) {
                Toast.show(`Not enough stock for ${item.name}. Only ${item.inventory_count || 0} left.`, 'error');
                return;
            }
        }

        const orderDetails: Partial<OrderDetails> = {
            ...formData,
            address: formattedAddress, // Overwrite with compiled string
            paymentMethod: formData.paymentMethod as 'online' | 'cod'
        };

        // ... (Existing CheckoutService.placeOrder logic remains same) ...
        placeOrderBtn.innerHTML = `
            <span class="animate-spin material-symbols-outlined text-base">progress_activity</span>
            <span>Processing...</span>
        `;
        (placeOrderBtn as HTMLButtonElement).disabled = true;

        const placeOrdRes = await CheckoutService.placeOrder(orderDetails as OrderDetails);

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
