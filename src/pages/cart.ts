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

                // Pre-order Config: Stock <= 0 is Pre-order
                const isPreOrder = currentStock <= 0;

                // Low Stock Issue: Stock > 0 but not enough for quantity
                const isLowStock = currentStock > 0 && item.quantity > currentStock;

                // Only block if there is a low stock issue (partial availability). 
                // Pre-orders (0 stock) are allowed.
                if (isLowStock) hasStockIssue = true;

                const imageSrc = item.images?.[0] || '';
                const imageElement = imageSrc
                    ? `<img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover ${isPreOrder ? '' : ''}" />`
                    : `<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400">
                        <span class="material-symbols-outlined text-2xl">inventory_2</span>
                       </div>`;

                let errorBadge = '';
                if (isPreOrder) {
                    errorBadge = `<p class="text-[10px] font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded w-fit mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[10px]">local_shipping</span> PRE-ORDER</p>`;
                } else if (isLowStock) {
                    errorBadge = `<p class="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded w-fit mt-1">ONLY ${currentStock} LEFT</p>`;
                }

                return `
                <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border ${isLowStock ? 'border-orange-200 dark:border-orange-900/30' : (isPreOrder ? 'border-teal-200 dark:border-teal-900/30' : 'border-gray-100 dark:border-slate-800')}">
                    <div class="flex gap-4 items-start">
                        <div class="size-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                            ${imageElement}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-bold leading-tight line-clamp-1 dark:text-white">${item.name}</h3>
                                    <p class="text-sm text-gray-500">₱${item.price.toFixed(2)}</p>
                                    ${errorBadge}
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-end gap-2 ml-2">
                            <div class="flex items-center border border-gray-200 dark:border-slate-700 rounded-full h-8 px-2 bg-gray-50 dark:bg-slate-800">
                                <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${item.id}', ${item.quantity - 1})">-</button>
                                <span class="w-6 text-center text-sm font-bold dark:text-white">${item.quantity}</span>
                                <button class="w-6 text-gray-500 hover:text-primary" onclick="window.updateQty('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                             <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all" onclick="window.removeItem('${item.id}')">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>

                    <!-- Customization Section -->
                     <div class="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                        <p class="text-[10px] text-primary font-bold flex items-center gap-1 mb-1 select-none">
                            <span class="material-symbols-outlined text-[14px]">edit_note</span>
                            CUSTOMIZATION AVAILABLE
                        </p>
                        <textarea 
                            class="w-full text-base md:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md p-2.5 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow placeholder:text-gray-400"
                            rows="2"
                            placeholder="Add your customization message here (optional)..."
                            oninput="window.updateCustomization('${item.id}', this.value)"
                        >${item.customizationMessage || ''}</textarea>
                    </div>
                </div>
            `}).join('');

            if (proceedBtn) {
                (proceedBtn as HTMLButtonElement).disabled = hasStockIssue;
                if (hasStockIssue) {
                    Toast.show('Some items have insufficient stock. Please update quantity.', 'error');
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

(window as any).updateCustomization = (id: string, message: string) => {
    CartState.updateCustomization(id, message);
    // Don't re-render, as it would kill focus on the textarea
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

                // Allow Pre-order (stock <= 0)
                // Block if Low Stock (stock > 0 but < quantity)
                if (currentStock > 0 && item.quantity > currentStock) {
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
