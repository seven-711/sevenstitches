import { supabase } from '../lib/supabase';

export interface Review {
    id: string;
    order_id: string;
    product_id: string;
    user_id?: string;
    person_name: string;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    images?: string[]; // Added images
    created_at: string;
}

export interface CreateReviewDTO {
    order_id: string;
    product_id: string;
    user_id?: string;
    person_name: string;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    images?: string[]; // Added images
}

export class ReviewService {
    static async createReview(review: CreateReviewDTO) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([review])
            .select()
            .single();

        if (error) {
            console.error('Error creating review:', error);
            throw error;
        }

        return data as Review;
    }

    static async uploadReviewPhoto(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading photo:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('reviews')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    static async getReviewsByProduct(productId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            // Return empty if error to not break UI
            return [];
        }

        return data as Review[];
    }

    static async getProductRating(productId: string) {
        // Fetch simple average (In production, use a materialized view or RPC)
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', productId);

        if (error || !data || data.length === 0) {
            return { average: 0, count: 0 };
        }

        const total = data.reduce((sum, r) => sum + r.rating, 0);
        return {
            average: total / data.length,
            count: data.length
        };
    }
}
