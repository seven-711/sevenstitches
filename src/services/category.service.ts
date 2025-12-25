import { supabase } from '../lib/supabase';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export class CategoryService {
    static async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Category[];
    }

    static async createCategory(category: Partial<Category>) {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateCategory(id: string, updates: Partial<Category>) {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteCategory(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}
