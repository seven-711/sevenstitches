import { supabase } from '../lib/supabase';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    created_at: Date;
    read: boolean;
    link?: string;
    sourceType?: 'order' | 'product' | 'message'; // Helper to identify source
    conversationId?: string;
}

export class NotificationService {

    static async getNotifications(): Promise<Notification[]> {
        const notifications: Notification[] = [];

        // 1. Fetch Low Stock Products (< 5)
        const { data: products } = await supabase
            .from('products')
            .select('id, name, inventory_count, created_at') // created_at as backup date
            .lt('inventory_count', 5)
            .eq('status', 'active');

        if (products) {
            products.forEach(p => {
                notifications.push({
                    id: `stock_${p.id}`,
                    title: 'Low Stock Alert',
                    message: `Product "${p.name}" is running low (${p.inventory_count} remaining).`,
                    type: 'warning',
                    created_at: new Date(p.created_at || Date.now()), // Or just Now? Let's use Now or created? Actually stock alert is 'current', so maybe just 'now' is better but sorting might be weird. Let's use a "now" timestamp effectively.
                    // Actually, for persistent alerts, 'now' makes them always top. Let's stick to that for urgency.
                    // Wait, if I use Date.now(), they will reshuffle. Let's use product updated_at if available? Or just leave it. 
                    // Let's use Date.now() for "Continuous Alert"
                    read: false,
                    link: 'products',
                    sourceType: 'product'
                });
            });
        }

        // 2. Fetch Unread Messages
        const { data: messages } = await supabase
            .from('consumers_messages')
            .select('*')
            .eq('sender_type', 'customer')
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (messages) {
            messages.forEach(m => {
                notifications.push({
                    id: m.id,
                    title: 'New Message',
                    message: m.content,
                    type: 'info',
                    created_at: new Date(m.created_at),
                    read: false,
                    link: 'messages',
                    sourceType: 'message',
                    conversationId: m.conversation_id
                });
            });
        }

        // 3. Fetch Pending Orders
        const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, created_at, customer_email')
            .eq('status', 'pending');

        if (orders) {
            orders.forEach(o => {
                notifications.push({
                    id: o.id,
                    title: 'New Order Pending',
                    message: `Order #${o.id.slice(0, 8)}... - ₱${o.total_amount} from ${o.customer_email || 'Guest'}`,
                    type: 'success',
                    created_at: new Date(o.created_at),
                    read: false,
                    link: 'orders',
                    sourceType: 'order'
                });
            });
        }

        // Sort by created_at desc (newest first)
        // For Low Stock (which we gave 'now'?), let's arguably put them at top or bottom? 
        // Let's actually give stock alerts the product's 'created_at' or just make them persistent. 
        // To avoid them flooding the top every time, let's use product.created_at for stable sorting, 
        // OR just put them at the top. Let's put them at top (urgency).
        // Correction: use a static date for stock to avoid re-sort jitter, or just real time.
        // Let's use the actual real fetch time for stock to emphasize current problem.

        return notifications.sort((a, b) => {
            // Priority: Low Stock > Message > Order? Or just time.
            // Let's just sort by time.
            // If we used Date.now() for stock, they are always top. That's fine for "Alerts".
            const timeA = a.sourceType === 'product' ? Date.now() : a.created_at.getTime();
            const timeB = b.sourceType === 'product' ? Date.now() : b.created_at.getTime();
            return timeB - timeA;
        });
    }

    static async getUnreadCount(): Promise<number> {
        // Since we are fetching everything to build the list, we can just call getNotifications and count.
        // Optimization: separate count queries if list is heavy, but for now this is fine.
        const all = await this.getNotifications();
        return all.filter(n => !n.read).length;
        // Note: For Orders/Stock, 'read' is always false in our generator, so they always count.
    }

    static async markAsRead(id: string): Promise<void> {
        // Attempt to find what kind of ID it is.
        // If message (uuid style), try update DB.

        // We can check if it exists in 'consumers_messages'
        await supabase
            .from('consumers_messages')
            .update({ is_read: true })
            .eq('id', id);

        // If no error, good. If it didn't match (e.g. order id), nothing happens.
        // For Orders/Products, we treat them as "Action Required", so clicking just takes you there, doesn't "clear" the alert 
        // until the status changes (e.g. order processed, stock added). 
        // This is acceptable per user requirement.
    }

    static async markAllAsRead(): Promise<void> {
        // Only valid for messages really
        await supabase
            .from('consumers_messages')
            .update({ is_read: true })
            .eq('sender_type', 'customer')
            .eq('is_read', false);
    }
}
