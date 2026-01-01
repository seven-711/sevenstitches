import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_type: 'admin' | 'customer';
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    user_id?: string;
    guest_email?: string;
    guest_name?: string;
    status: 'open' | 'closed';
    last_message_at: string;
    created_at: string;
    unread_count?: number;
}

export const ChatService = {
    async getOrCreateConversation(userId?: string, guestInfo?: { email: string, name: string }) {
        let query = supabase.from('consumers_conversations').select('*');

        if (userId) {
            query = query.eq('user_id', userId).eq('status', 'open');
        } else if (guestInfo?.email) {
            query = query.eq('guest_email', guestInfo.email).eq('status', 'open');
        } else {
            return null;
        }

        const { data } = await query.maybeSingle();

        if (data) return data as Conversation;

        // Create
        const { data: newConv, error: createError } = await supabase
            .from('consumers_conversations')
            .insert([{
                user_id: userId || null,
                guest_email: guestInfo?.email || null,
                guest_name: guestInfo?.name || null,
                status: 'open'
            }])
            .select()
            .single();

        if (createError) throw createError;
        return newConv as Conversation;
    },

    async sendMessage(conversationId: string, content: string, senderType: 'admin' | 'customer') {
        const { data, error } = await supabase
            .from('consumers_messages')
            .insert([{
                conversation_id: conversationId,
                sender_type: senderType,
                content: content
            }])
            .select()
            .single();

        if (error) throw error;

        // Update conversation
        await supabase
            .from('consumers_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data as ChatMessage;
    },

    async getMessages(conversationId: string) {
        const { data, error } = await supabase
            .from('consumers_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
    },

    async getAllConversations() {
        // Admin: Fetch all
        const { data, error } = await supabase
            .from('consumers_conversations')
            .select('*')
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Fetch unread counts
        const { data: unreadData, error: unreadError } = await supabase
            .from('consumers_messages')
            .select('conversation_id')
            .eq('is_read', false)
            .eq('sender_type', 'customer');

        if (unreadError) console.error('Error fetching unread counts', unreadError);

        const counts: Record<string, number> = {};
        if (unreadData) {
            unreadData.forEach((msg: any) => {
                counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
            });
        }

        const conversations = (data as Conversation[]).map(c => ({
            ...c,
            unread_count: counts[c.id] || 0
        }));

        return conversations;
    },

    async markAsRead(conversationId: string) {
        const { error } = await supabase
            .from('consumers_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('sender_type', 'customer')
            .eq('is_read', false);

        if (error) throw error;
    },

    subscribeToMessages(conversationId: string, callback: (msg: ChatMessage) => void) {
        return supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'consumers_messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => callback(payload.new as ChatMessage)
            )
            .subscribe();
    },

    // Admin subscriptions to conversation list updates?
    subscribeToConversations(callback: (conv: Conversation) => void) {
        return supabase
            .channel(`conversations_list`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'consumers_conversations' },
                (payload) => callback(payload.new as Conversation)
            )
            .subscribe();
    }
};
