import '../style.css';
import '../components/header';
import { CartState } from '../state/cart';
import { ProductService } from '../services/product.service';
import { Toast } from '../components/toast';

// Ensure header is registered
if (!customElements.get('app-header')) {
    const { AppHeader } = await import('../components/header');
    customElements.define('app-header', AppHeader);
}

const cartContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('cart-subtotal');
const totalEl = document.getElementById('cart-total');
const proceedBtn = document.getElementById('proceed-to-checkout-btn');

async function renderCart() {
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
            if (proceedBtn) (proceedBtn as HTMLButtonElement).disabled = true;
            return;
        }

        // Disable until validated
        if (proceedBtn) (proceedBtn as HTMLButtonElement).disabled = true;

        try {
            const freshProducts = await ProductService.getProductsByIds(items.map(i => i.id));
            let hasStockIssue = false;

            cartContainer.innerHTML = items.map(item => {
                const freshP = freshProducts.find(p => p.id === item.id);
                const currentStock = freshP ? freshP.inventory_count : 0;
                const isOutOfStock = currentStock === 0;
                const isLowStock = !isOutOfStock && item.quantity > currentStock;

                if (isOutOfStock || isLowStock) hasStockIssue = true;

                const imageSrc = item.images?.[0] || '';
                const imageElement = imageSrc
                    ? `<img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}" />`
                    : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                        <span class="material-symbols-outlined text-2xl">inventory_2</span>
                       </div>`;

                let errorBadge = '';
                if (isOutOfStock) {
                    errorBadge = `<p class="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded w-fit mt-1">OUT OF STOCK</p>`;
                } else if (isLowStock) {
                    errorBadge = `<p class="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded w-fit mt-1">ONLY ${currentStock} LEFT</p>`;
                }

                return `
                <div class="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border ${isOutOfStock ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-slate-800'} items-center ${isOutOfStock ? 'opacity-75' : ''}">
                    <div class="size-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relaitve">
                        ${imageElement}
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold leading-tight line-clamp-1 dark:text-white ${isOutOfStock ? 'line-through text-gray-500' : ''}">${item.name}</h3>
                        <p class="text-sm text-gray-500">₱${item.price.toFixed(2)}</p>
                        ${errorBadge}
                    </div>
                    <div class="flex items-center gap-3">
                         <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-8 px-2 bg-gray-50 dark:bg-slate-800">
                            <button class="w-6 text-gray-500 hover:text-primary ${isOutOfStock ? 'pointer-events-none opacity-50' : ''}" onclick="window.updateQty('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="w-6 text-center text-sm font-bold dark:text-white">${item.quantity}</span>
                            <button class="w-6 text-gray-500 hover:text-primary ${isOutOfStock ? 'pointer-events-none opacity-50' : ''}" onclick="window.updateQty('${item.id}', ${item.quantity + 1})">+</button>
                            <div class="h-4 w-px bg-gray-300 dark:bg-slate-600 mx-1"></div>
                            <button class="w-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors" onclick="window.removeItem('${item.id}')">
                                <span class="material-symbols-outlined text-[18px] text-red-500">delete</span>
                            </button>
                         </div>
                    </div>
                </div>
            `}).join('');

            if (proceedBtn) {
                (proceedBtn as HTMLButtonElement).disabled = hasStockIssue;
                if (hasStockIssue) {
                    Toast.show('Some items are unavailable. Please remove or update quantity.', 'error');
                }
            }

        } catch (e) {
            console.error('Cart validation failed', e);
            if (proceedBtn) (proceedBtn as HTMLButtonElement).disabled = false;
        }
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
if (proceedBtn) {
    proceedBtn.addEventListener('click', async (e) => {
        const items = CartState.getItems();
        if (items.length === 0) {
            e.preventDefault();
            Toast.show("Your cart is empty. Please add items before proceeding.", "error");
            return;
        }

        // Final check
        try {
            e.preventDefault(); // Pause nav
            const btn = e.target as HTMLButtonElement;
            const originalText = btn.textContent;
            btn.textContent = 'Checking stock...';
            btn.disabled = true;

            const freshProducts = await ProductService.getProductsByIds(items.map(i => i.id));
            let hasIssue = false;

            for (const item of items) {
                const freshP = freshProducts.find(p => p.id === item.id);
                const currentStock = freshP ? freshP.inventory_count : 0;
                if (item.quantity > currentStock) {
                    hasIssue = true;
                    break;
                }
            }

            if (hasIssue) {
                Toast.show("Stock levels changed. Please review your cart.", "error");
                await renderCart();
                btn.textContent = originalText;
                // remains disabled by renderCart if issue persists
            } else {
                window.location.href = '/pages/checkout.html';
            }
        } catch (err) {
            console.error(err);
            window.location.href = '/pages/checkout.html'; // Fallback
        }
    });
}
