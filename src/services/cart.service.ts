import { CartState } from '../state/cart';

export class CartService {
    static getItems() {
        return CartState.getItems();
    }

    static getTotal() {
        return CartState.getTotal();
    }

    static clear() {
        CartState.clear();
    }

    // Add item wrapper if needed, or rely on CartState directly. 
    // Keeping this simple wrapper for consistency with previous architecture.
}
