import { supabase } from '../lib/supabase';

export interface Order {
    id: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'approved' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    created_at: string;
    shipping_address?: string;
    phone?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    is_preorder?: boolean;
    products: {
        name: string;
        images: string[];
        category_id?: string;
    };
}

export class OrderService {
    static async getAllOrders() {
        // Fetch orders with their items and related product details
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items (
                    quantity,
                    unit_price,
                    is_preorder,
                    products (
                        name,
                        images
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }

        return data as Order[];
    }

    static async updateOrderStatus(orderId: string, status: string) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('Error updating order status:', error);
            throw error;
        }

        return data;
    }

    static async markOrderCompleted(orderId: string) {
        return this.updateOrderStatus(orderId, 'completed');
    }

    static async deleteOrder(orderId: string) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    static async getOrderByTracking(trackingNumber: string) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items (
                    quantity,
                    unit_price,
                    is_preorder,
                    products (
                        name,
                        images
                    )
                )
            `)
            .eq('tracking_number', trackingNumber)
            .single();

        if (error) {
            console.error('Error fetching order by tracking:', error);
            // Return null instead of throwing for friendlier 404 handling
            return null;
        }

        return data as Order;
    }

    static async getOrderById(orderId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    is_preorder,
                    products (
                        name,
                        images
                    )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order by ID:', error);
            return null;
        }

        return data as Order;
    }

    static generateTrackingNumber(): string {
        // Format: 7S-XXXX-YYYY (7S = Seven Stitches)
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        const random = Math.random().toString(36).toUpperCase().slice(2, 6);
        return `7S-${timestamp}-${random}`;
    }

    static async getOrderStats() {
        // We can reuse dashboard service logic or fetch fresh here
        // For now, let's do a quick fresh fetch for consistency
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total_amount, status, created_at');

        if (error) throw error;

        const totalRevenue = orders.reduce((sum, o) => {
            const isRevenue = ['paid', 'delivered', 'completed'].includes(o.status);
            return sum + (isRevenue ? (Number(o.total_amount) || 0) : 0);
        }, 0);
        const totalOrders = orders.length;
        // Mocking 'New Customers' and 'Repeat Rate' as we don't have a strict customer table yet
        // In a real app, we'd query distinct emails or profiles

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            pendingOrders: orders.filter(o => o.status === 'pending').length
        };
    }
}
