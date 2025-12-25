import '../style.css';
import '../components/header';
import { CartState } from '../state/cart';

// Ensure header is registered
if (!customElements.get('app-header')) {
    const { AppHeader } = await import('../components/header');
    customElements.define('app-header', AppHeader);
}

const cartContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('cart-subtotal');
const totalEl = document.getElementById('cart-total');

function renderCart() {
    const items = CartState.getItems();
    const total = CartState.getTotal();

    if (subtotalEl) subtotalEl.textContent = `₱${total.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;

    if (cartContainer) {
        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                    <p class="text-gray-500 mb-4">Your cart is empty</p>
                    <a href="/pages/shop.html" class="text-primary font-bold hover:underline">Continue Shopping</a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = items.map(item => {
            const imageSrc = item.images?.[0] || '';
            const imageElement = imageSrc
                ? `<img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover" />`
                : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                    <span class="material-symbols-outlined text-2xl">inventory_2</span>
                   </div>`;

            return `
            <div class="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 items-center">
                <div class="size-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    ${imageElement}
                </div>
                <div class="flex-1">
                    <h3 class="font-bold leading-tight line-clamp-1">${item.name}</h3>
                    <p class="text-sm text-gray-500">₱${item.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-3">
                     <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-8 px-2 bg-gray-50 dark:bg-slate-800">
                        <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="w-6 text-center text-sm font-bold">${item.quantity}</span>
                        <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${item.id}', ${item.quantity + 1})">+</button>
                        <div class="h-4 w-px bg-gray-300 dark:bg-slate-600 mx-1"></div>
                        <button class="w-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors" onclick="window.removeItem('${item.id}')">
                            <span class="material-symbols-outlined text-[18px] text-red-500">delete</span>
                        </button>
                     </div>
                </div>
            </div>
        `}).join('');
    }
}

// Expose functions to window for onclick handlers
(window as any).updateQty = (id: string, qty: number) => {
    CartState.updateQuantity(id, qty);
    renderCart();
};

(window as any).removeItem = (id: string) => {
    CartState.removeItem(id);
    renderCart();
};

renderCart();

// Proceed to Checkout Validation
const proceedBtn = document.getElementById('proceed-to-checkout-btn');
if (proceedBtn) {
    proceedBtn.addEventListener('click', (e) => {
        const items = CartState.getItems();
        if (items.length === 0) {
            e.preventDefault();
            import('../components/toast').then(({ Toast }) => {
                Toast.show("Your cart is empty. Please add items before proceeding.", "error");
            });
        }
    });
}
