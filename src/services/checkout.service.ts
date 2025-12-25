import { supabase } from '../lib/supabase';
import { CartState } from '../state/cart';
import { CartService } from './cart.service';
import { ProductService } from './product.service';
import { OrderService } from './order.service';

export interface OrderDetails {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    paymentMethod: 'online' | 'cod';
    email?: string;
}

export class CheckoutService {
    static validateOrder(details: Partial<OrderDetails>): { valid: boolean; error?: string } {
        if (!details.fullName) return { valid: false, error: 'Full Name is required' };
        if (!details.address) return { valid: false, error: 'Address is required' };
        if (!details.city) return { valid: false, error: 'City is required' };
        if (!details.zip) return { valid: false, error: 'ZIP Code is required' };
        if (!details.phone) return { valid: false, error: 'Phone number is required' };
        return { valid: true };
    }

    static async placeOrder(details: OrderDetails): Promise<{ success: boolean; orderId?: string; trackingNumber?: string; error?: string }> {
        console.log('Processing order for:', details);

        const items = CartState.getItems();
        if (items.length === 0) {
            return { success: false, error: 'Cart is empty' };
        }

        const totalAmount = CartState.getTotal();

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_email: details.email || 'guest@example.com', // fallback if not provided
                    total_amount: totalAmount,
                    status: 'pending',
                    tracking_number: OrderService.generateTrackingNumber(),
                    // user_id: we could fetch from auth if logged in, skipping for guest flow for now
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Update Inventory
            try {
                await Promise.all(items.map(async (item) => {
                    const product = await ProductService.getProductById(item.id);
                    if (product) {
                        const newInventory = Math.max(0, product.inventory_count - item.quantity);
                        await ProductService.updateProduct(item.id, { inventory_count: newInventory });
                    }
                }));
            } catch (inventoryError) {
                console.error('Failed to update inventory:', inventoryError);
                // We don't fail the order here, but we log it. 
                // In a real system, we might want to alert admin.
            }

            // 4. Clear Cart
            CartService.clear();

            return { success: true, orderId: order.id, trackingNumber: order.tracking_number };

        } catch (err: any) {
            console.error('Checkout Error:', err);
            return { success: false, error: err.message || 'Failed to place order' };
        }
    }
}
