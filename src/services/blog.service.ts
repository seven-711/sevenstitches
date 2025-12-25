import { supabase } from '../lib/supabase';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    published: boolean;
    published_at?: string;
    created_at: string;
}

export class BlogService {
    static async getPosts() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    }

    static async getPostById(id: string) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as BlogPost;
    }

    static async createPost(post: Partial<BlogPost>) {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([post])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updatePost(id: string, updates: Partial<BlogPost>) {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deletePost(id: string) {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}
