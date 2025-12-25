import { supabase } from '../lib/supabase';

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
}

const fallbackProducts: Product[] = [
    {
        id: '1',
        name: 'Sunflower Tote Bag',
        price: 5.00,
        description: 'A bright and cheerful tote bag featuring a large sunflower motif. Perfect for sunny days and carrying your yarn stash. Beginner friendly pattern.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPDk-3YDj-0t12k5qYBcBl3gWsAjjoPGNIXJsElwl5k07ckHUY5ikmiExZGN_gUkzjNCFVEA3rL3rBbH2ySG1MF54Uy0NdcN0a5LLMf3A84gul0EAtJTWlZd5pG5H_isGFn3pbkYDWr5B5cnsq9GMPXB34Vi3_HhFPpDTsFmTqCnI1Zah1mPDJwMqpilhJv2mWJ-MTvwrNy6x5KmUe2GzM4vyT2czlExkshQdusA0dAkTtZ0A1hZ5WiY1AIqIJrEdtoVOc5524m8Hv',
        category: 'Patterns'
    },
    {
        id: '2',
        name: 'Vintage Lace Doily',
        price: 4.80,
        description: 'Intricate vintage-style lace doily pattern. Adds a touch of elegance to any table setting. Intermediate skill level required.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq3CZ8jT0ob2IgvPoY-qP8RN_M-POeti9zRpsNVfovaBIizW96yUTPZh4YDgFK9Jqt0LytpQPW4X27SfE9flwMPObqqDixfyKdjh6GRQRLwEpPcHKVmiM1ZX8H3jdeocEv4VWlKbc7yTD5TQWafVwBswHILUG_nVajSHPnuGlmga3Z6_eJB0DWZflic2dlUCak8PkNrqi8XJ0T3lhEc8qL0vO1Jl4WT7QuBopg8ChYBYxDa4N9UEJBFCx0zYdghZ-iao31BiG8poZT',
        category: 'Patterns'
    },
    {
        id: '3',
        name: 'Amigurumi Bunny',
        price: 7.50,
        description: 'Adorable soft bunny plushie pattern. The perfect handmade gift for children or decoration for your nursery. Advanced level due to small parts.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKKdUD0TMfe7_wjYhGrODe8S2gekSv6yGGGNfsbgqfuUvQBaC2qhz3jFzoQ-EJoLkvEhz89ysW8D7iBauH51ncctCwYxmj_jx9UQGVb46ImRXESxl9Tnwig22KLthaVIxvzBtJUmsBzPGz3MKX4F1UUozdjLWlb-9jVqJ7NKj7wx0dbE8yz7TPRAYOsafekmYzXrffdDa6kkAE7qp6RTHgFWSjKkDqtWTHddk3qOdXQ4swSa9Ex2Q1GfVMkJDwu735d_OqQZg962Rm',
        category: 'Patterns'
    },
    {
        id: '4',
        name: 'Cozy Granny Blanket',
        price: 8.00,
        description: 'Classic granny square blanket with a modern twist. Warm, cozy, and vibrant colors. Great project for beginners to practice tension.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqVBVcOrtx4ief97Ud-K4pv2rsv2xb1oz0xDFpYZRQ-B_YnX72fP1Xj-9J7x2KoYnl6D-Oo7j6thBvCaBmAfEaz8J5wSWvN_FY_sdXwXWAkKcStSfNkBQYh2Ix0Sm4Wl1pCyfzlhbayR8iOcTIGT5yqwSPoPZp4izoevIvw_0RtMddpA2pq5XYcrnr-pDFbD6AZYtZInC_o_X1ojyuxyKyLPrx0wo6zRY9dTJisqUlm5LZgkd-6zUBtqhkQMQUbT07aoJ4yxZmKdeK',
        category: 'Patterns'
    }
];

export async function getProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error || !data || data.length === 0) throw error;
        return data as Product[];
    } catch (e) {
        console.warn('Supabase fetch failed, using fallback data:', e);
        return fallbackProducts;
    }
}

export async function getProductById(id: string): Promise<Product | undefined> {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error || !data) throw error;
        return data as Product;
    } catch (e) {
        console.warn('Supabase fetch failed, using fallback data:', e);
        return fallbackProducts.find(p => p.id === id);
    }
}

