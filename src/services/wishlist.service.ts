
const WISHLIST_KEY = 'sevenstitches_wishlist_v1';

export class WishlistService {
    static getWishlist(): string[] {
        try {
            const stored = localStorage.getItem(WISHLIST_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load wishlist', e);
            return [];
        }
    }

    static addToWishlist(productId: string): boolean {
        const current = this.getWishlist();
        if (!current.includes(productId)) {
            current.push(productId);
            try {
                localStorage.setItem(WISHLIST_KEY, JSON.stringify(current));
                this.notifyChange();
                return true;
            } catch (e) {
                console.error('Failed to save wishlist', e);
                return false;
            }
        }
        return false;
    }

    static removeFromWishlist(productId: string): boolean {
        const current = this.getWishlist();
        const index = current.indexOf(productId);
        if (index > -1) {
            current.splice(index, 1);
            try {
                localStorage.setItem(WISHLIST_KEY, JSON.stringify(current));
                this.notifyChange();
                return true;
            } catch (e) {
                console.error('Failed to save wishlist', e);
                return false;
            }
        }
        return false;
    }

    static toggleWishlist(productId: string): boolean {
        if (this.isInWishlist(productId)) {
            this.removeFromWishlist(productId);
            return false; // Result is "not in wishlist"
        } else {
            this.addToWishlist(productId);
            return true; // Result is "in wishlist"
        }
    }

    static isInWishlist(productId: string): boolean {
        return this.getWishlist().includes(productId);
    }

    private static notifyChange() {
        // Dispatch a custom event so UI components can react
        window.dispatchEvent(new Event('wishlist-changed'));
    }
}
