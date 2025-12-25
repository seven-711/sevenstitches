import { Product } from '../services/product.service';

export interface CartItem extends Product {
    quantity: number;
}

const CART_STORAGE_KEY = 'sevenstitches_cart';

export class CartState {
    private static items: CartItem[] = [];

    static load() {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse cart storage', e);
                this.items = [];
            }
        }
    }

    static save() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
        window.dispatchEvent(new Event('cart-updated')); // Notify listeners
    }

    static getItems(): CartItem[] {
        if (this.items.length === 0) this.load();
        return this.items;
    }

    static addItem(product: Product, quantity: number = 1) {
        if (this.items.length === 0) this.load();

        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.save();
    }

    static removeItem(productId: string) {
        if (this.items.length === 0) this.load();
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
    }

    static updateQuantity(productId: string, quantity: number) {
        if (this.items.length === 0) this.load();
        const item = this.items.find(i => i.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.save();
            }
        }
    }

    static getTotal(): number {
        if (this.items.length === 0) this.load();
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    static getCount(): number {
        if (this.items.length === 0) this.load();
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    static clear() {
        this.items = [];
        this.save();
    }
}
