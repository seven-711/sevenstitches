import { supabase } from '../lib/supabase';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    inventory_count: number;
    category_id?: string;
    image_url?: string; // Legacy support
    images?: string[];
    theme_color?: 'blue' | 'green' | 'pink' | 'purple' | 'red' | 'cream' | 'coral' | 'yellow';
    status: 'active' | 'draft' | 'archived';
    categories?: {
        name: string;
    };
    created_at?: string;
}

export class ProductService {
    static async getProducts() {
        // For now, sorting by newest
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    }

    static async getProductsByCategory(categoryName: string) {
        // 1. First find the category ID to ensure accurate matching
        // Case-insensitive search for category name
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', categoryName)
            .single();

        if (catError) {
            console.warn('Category not found:', categoryName);
            return [];
        }

        // 2. Fetch products for this category
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    }

    static async getProductById(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Product;
    }

    static async createProduct(product: Partial<Product>) {
        // Ensure defaults
        const newProduct = {
            ...product,
            status: product.status || 'active',
            inventory_count: product.inventory_count || 0,
            images: product.images || []
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateProduct(id: string, updates: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
    static async getTrendingProducts(): Promise<Product[]> {
        // 1. Fetch order items to calculate sales
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity');

        if (itemsError) throw itemsError;

        // 2. Aggregate quantity by product
        const quantityMap: Record<string, number> = {};
        items?.forEach(item => {
            quantityMap[item.product_id] = (quantityMap[item.product_id] || 0) + item.quantity;
        });

        // 3. Sort by sales and get top 4
        const sortedProductIds = Object.keys(quantityMap)
            .sort((a, b) => quantityMap[b] - quantityMap[a])
            .slice(0, 4);

        if (sortedProductIds.length === 0) {
            // Fallback to fetching latest active products if no sales data
            return this.getProducts().then(products => products.slice(0, 4));
        }

        // 4. Fetch details for these products
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .in('id', sortedProductIds)
            .eq('status', 'active');

        if (error) throw error;

        // Preserve sort order from quantityMap
        const products = data as Product[];
        return sortedProductIds
            .map(id => products.find(p => p.id === id))
            .filter((p): p is Product => !!p);
    }
}
