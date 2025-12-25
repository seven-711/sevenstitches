import { supabase } from '../lib/supabase';

export class StorageService {
    private static BUCKET = 'product-images';

    static async uploadImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from(this.BUCKET)
            .upload(filePath, file);

        if (error) {
            console.error('Upload Error:', error);
            throw error;
        }

        const { data: publicData } = supabase.storage
            .from(this.BUCKET)
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    }
}
