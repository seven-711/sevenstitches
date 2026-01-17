import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';

const WISHLIST_LOCAL_KEY = 'sevenstitches_wishlist_v1';

export class WishlistService {
    private static cache: Set<string> = new Set();
    private static initialized = false;
    private static useLocalStorageOnly = false;

    static async init() {
        if (this.initialized) return;

        try {
            const user = await AuthService.getUser();
            if (user) {
                // Load from DB
                const { data, error } = await supabase
                    .from('favorites')
                    .select('product_id')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('[Wishlist] DB Init Error:', error);
                    // Check for missing table (PGRST205) or relation does not exist (42P01)
                    if (error.code === 'PGRST205' || error.code === '42P01') {
                        console.warn('[Wishlist] Favorites table missing. Forcing LocalStorage fallback.');
                        this.useLocalStorageOnly = true;
                    }
                    throw error;
                }

                this.cache = new Set(data?.map(d => d.product_id) || []);
            } else {
                // Load from LocalStorage
                this.loadFromLocal();
            }
        } catch (e) {
            console.error('Wishlist init failed, using LocalStorage:', e);
            this.loadFromLocal();
        } finally {
            this.initialized = true;
        }
    }

    private static loadFromLocal() {
        const stored = localStorage.getItem(WISHLIST_LOCAL_KEY);
        this.cache = new Set(stored ? JSON.parse(stored) : []);
    }

    static getWishlist(): string[] {
        return Array.from(this.cache);
    }

    static async addToWishlist(productId: string): Promise<boolean> {
        if (!this.initialized) await this.init();

        console.log('[Wishlist] Adding:', productId);

        if (!this.cache.has(productId)) {
            this.cache.add(productId);
            await this.persistAdd(productId);
            this.notifyChange();
            return true;
        }
        return false;
    }

    static async removeFromWishlist(productId: string): Promise<boolean> {
        if (!this.initialized) await this.init();

        console.log('[Wishlist] Removing:', productId);

        if (this.cache.has(productId)) {
            this.cache.delete(productId);
            await this.persistRemove(productId);
            this.notifyChange();
            return true;
        }
        return false;
    }

    static async toggleWishlist(productId: string): Promise<boolean> {
        if (!this.initialized) await this.init();

        if (this.cache.has(productId)) {
            await this.removeFromWishlist(productId);
            return false;
        } else {
            await this.addToWishlist(productId);
            return true;
        }
    }

    static isInWishlist(productId: string): boolean {
        return this.cache.has(productId);
    }

    private static async persistAdd(productId: string) {
        const user = await AuthService.getUser();
        // Only use DB if user is logged in AND we haven't detected a critical DB error
        if (user && !this.useLocalStorageOnly) {
            console.log('[Wishlist] Persisting to DB...');
            // DB
            const { error } = await supabase
                .from('favorites')
                .insert([{ user_id: user.id, product_id: productId }]);

            if (error) {
                console.error('DB Add Error:', error);
                if (error.code === 'PGRST205' || error.code === '42P01') {
                    console.warn('[Wishlist] Favorites table confirmed missing. Switching to LocalStorage.');
                    this.useLocalStorageOnly = true;
                    this.saveToLocal();
                }
            } else {
                console.log('[Wishlist] DB Add Success');
            }
        } else {
            console.log('[Wishlist] Persisting to LocalStorage...');
            this.saveToLocal();
        }
    }

    private static async persistRemove(productId: string) {
        const user = await AuthService.getUser();
        if (user && !this.useLocalStorageOnly) {
            console.log('[Wishlist] Removing from DB...');
            // DB
            const { error } = await supabase
                .from('favorites')
                .delete()
                .match({ user_id: user.id, product_id: productId });

            if (error) {
                console.error('DB Remove Error:', error);
                if (error.code === 'PGRST205' || error.code === '42P01') {
                    this.useLocalStorageOnly = true;
                    this.saveToLocal();
                }
            } else {
                console.log('[Wishlist] DB Remove Success');
            }
        } else {
            console.log('[Wishlist] Removing from LocalStorage...');
            this.saveToLocal();
        }
    }

    private static saveToLocal() {
        try {
            localStorage.setItem(WISHLIST_LOCAL_KEY, JSON.stringify(Array.from(this.cache)));
        } catch (e) { console.error(e); }
    }

    private static notifyChange() {
        window.dispatchEvent(new Event('wishlist-changed'));
    }
}
