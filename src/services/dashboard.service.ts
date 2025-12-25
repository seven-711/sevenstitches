import { supabase } from '../lib/supabase';

export interface DashboardStats {
    revenue: number;
    revenueMonth: number;
    revenueWeek: number;
    revenueChartData: { date: string; amount: number }[];
    totalOrders: number;
    activeProducts: number;
    pendingOrders: number;
    // New stats
    deliveryProcessing: number;
    deliveryProcessed: number;
    paymentUnpaid: number;
    paymentPromo: number;
    productBlocked: number;
    productSoldOut: number;
    responseCancellation: number;
    responseReturn: number;
}

export interface RecentOrder {
    id: string;
    customer_email: string;
    total_amount: number;
    status: string;
}

export interface TopProduct {
    name: string;
    category: string;
    quantity: number;
}

export class DashboardService {
    static async getStats(): Promise<DashboardStats> {
        // 1. Revenue & Total Orders
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('total_amount, status, created_at');

        if (orderError) throw orderError;

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        let revenue = 0;
        let revenueMonth = 0;
        let revenueWeek = 0;
        const dailyRevenue: Record<string, number> = {};

        // Initialize last 30 days map with 0
        for (let d = 0; d < 30; d++) {
            const date = new Date();
            date.setDate(now.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];
            dailyRevenue[dateStr] = 0;
        }

        orders?.forEach(order => {
            const amount = Number(order.total_amount) || 0;
            const date = new Date(order.created_at);
            const isRevenue = ['paid', 'delivered', 'completed'].includes(order.status);

            // Total Revenue (All time) - Only if status is paid/delivered/completed
            if (isRevenue) {
                revenue += amount;

                // Past 30 Days
                if (date >= thirtyDaysAgo) {
                    revenueMonth += amount;

                    // Chart Data
                    const dateStr = date.toISOString().split('T')[0];
                    if (dailyRevenue[dateStr] !== undefined) {
                        dailyRevenue[dateStr] += amount;
                    }
                }

                // Past 7 Days
                if (date >= sevenDaysAgo) {
                    revenueWeek += amount;
                }
            }
        });

        const revenueChartData = Object.keys(dailyRevenue)
            .sort()
            .map(date => ({ date, amount: dailyRevenue[date] }));

        const totalOrders = orders?.length || 0;
        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

        // --- Granular Stats for Cards ---
        // Delivery
        const deliveryProcessing = orders?.filter(o => ['pending', 'approved', 'in_production', 'quality_check'].includes(o.status)).length || 0;
        const deliveryProcessed = orders?.filter(o => ['shipped', 'delivered', 'completed'].includes(o.status)).length || 0;

        // Payment
        const paymentUnpaid = orders?.filter(o => o.status === 'pending').length || 0; // Assuming pending = unpaid
        // For Promo, valid logic would normally check a 'coupon_code' column, but let's assume 0 if not available or check for orders with specific traits. 
        // Since we don't have a direct 'promo' flag in the select above, let's default to a safe value or mock it if needed. 
        // Actually, let's try to infer if total_amount is non-standard? No, too risky. Let's just return 0 for now or placeholder.
        const paymentPromo = 0;

        // Response
        const responseCancellation = orders?.filter(o => o.status === 'cancelled').length || 0;
        const responseReturn = 0; // No return status yet

        // 2. Active Products
        const { data: allProducts, error: productError } = await supabase
            .from('products')
            .select('status, inventory_count');

        if (productError) throw productError;

        const activeProducts = allProducts?.filter(p => p.status === 'active').length || 0;
        const productBlocked = allProducts?.filter(p => p.status !== 'active').length || 0;
        const productSoldOut = allProducts?.filter(p => p.status === 'active' && (p.inventory_count || 0) <= 0).length || 0;

        return {
            revenue,
            revenueMonth,
            revenueWeek,
            revenueChartData,
            totalOrders,
            activeProducts,
            pendingOrders,
            // New Detail Stats
            deliveryProcessing,
            deliveryProcessed,
            paymentUnpaid,
            paymentPromo,
            productBlocked,
            productSoldOut,
            responseCancellation,
            responseReturn
        };
    }

    static async getRecentOrders(): Promise<RecentOrder[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('id, customer_email, total_amount, status')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        return data as RecentOrder[];
    }

    static async getTopProducts(): Promise<TopProduct[]> {
        // 1. Fetch all order items (In robust production, use an RPC or materialized view)
        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity');

        if (itemsError) throw itemsError;

        // 2. Aggregate Quantity by Product
        const quantityMap: Record<string, number> = {};
        items?.forEach(item => {
            quantityMap[item.product_id] = (quantityMap[item.product_id] || 0) + item.quantity;
        });

        // 3. Sort and pick Top 3
        const sortedProductIds = Object.keys(quantityMap)
            .sort((a, b) => quantityMap[b] - quantityMap[a])
            .slice(0, 3);

        if (sortedProductIds.length === 0) return [];

        // 4. Fetch Product Details
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, category_id') // categories(name) join if possible, else simplified
            .in('id', sortedProductIds);

        if (productsError) throw productsError;

        // 5. Map back to result
        return sortedProductIds.map(id => {
            const product = products?.find(p => p.id === id);
            return {
                name: product ? product.name : 'Unknown Product',
                category: 'Best Seller', // Placeholder as we didn't join categories yet
                quantity: quantityMap[id] || 0
            };
        });
    }
}
