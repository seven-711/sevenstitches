import { ChatService, Conversation, ChatMessage } from '../../services/chat.service';

export async function renderChat(container: HTMLElement) {
    container.innerHTML = `
        <div class="flex h-[calc(100vh-140px)] bg-white dark:bg-[#151c2b] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm relative">
            <!-- Sidebar / List -->
            <div id="admin-chat-sidebar" class="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col absolute md:static inset-0 md:inset-auto z-10 md:z-auto bg-white dark:bg-[#151c2b]">
                <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a2333]">
                    <h2 class="font-bold text-gray-900 dark:text-white">Conversations</h2>
                </div>
                <div id="admin-chat-list" class="flex-1 overflow-y-auto">
                    <div class="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>
                </div>
            </div>

            <!-- Chat Area -->
            <div id="admin-chat-main" class="w-full md:flex-1 flex flex-col bg-gray-50/50 dark:bg-[#0f172a] absolute md:static inset-0 md:inset-auto z-20 md:z-auto hidden md:!flex">
                <div id="admin-chat-header" class="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 bg-white dark:bg-[#151c2b] gap-3">
                    <button id="admin-chat-back" class="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                         <h3 id="chat-customer-name" class="font-bold text-gray-900 dark:text-white">Select a conversation</h3>
                         <p id="chat-customer-info" class="text-xs text-gray-500"></p>
                    </div>
                </div>
                
                <div id="admin-chat-messages" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                     <div class="flex h-full items-center justify-center text-gray-400">Select a conversation...</div>
                </div>

                <div id="admin-chat-input-area" class="p-4 bg-white dark:bg-[#151c2b] border-t border-gray-200 dark:border-gray-800 hidden">
                    <form id="admin-chat-form" class="flex gap-4">
                        <input type="text" id="admin-message-input" class="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary dark:text-white" placeholder="Type your reply..." autocomplete="off">
                        <button type="submit" class="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl font-bold transition-colors flex items-center justify-center"><span class="material-symbols-outlined">send</span></button>
                    </form>
                </div>
            </div>
        </div>
    `;

    const sidebar = document.getElementById('admin-chat-sidebar');
    const mainArea = document.getElementById('admin-chat-main');
    const backBtn = document.getElementById('admin-chat-back');
    const listContainer = document.getElementById('admin-chat-list');
    const messagesContainer = document.getElementById('admin-chat-messages');
    const form = document.getElementById('admin-chat-form');
    // const header = document.getElementById('admin-chat-header'); // Not strictly needed for toggle logic anymore
    const inputArea = document.getElementById('admin-chat-input-area');
    const nameEl = document.getElementById('chat-customer-name');
    const infoEl = document.getElementById('chat-customer-info');

    let activeConversationId: string | null = null;
    let messagesSubscription: any = null;

    // --- View Toggles ---
    function showList() {
        if (window.innerWidth < 768) { // md breakpoint
            sidebar?.classList.remove('hidden');
            mainArea?.classList.add('hidden');
            activeConversationId = null; // Reset selection on back
        }
    }

    function showChat() {
        if (window.innerWidth < 768) {
            sidebar?.classList.add('hidden');
            mainArea?.classList.remove('hidden');
            mainArea?.classList.add('flex');
        }
    }

    if (backBtn) {
        backBtn.addEventListener('click', showList);
    }

    try {
        const conversations = await ChatService.getAllConversations();
        renderConversationList(conversations);
    } catch (e) {
        console.error(e);
        if (listContainer) listContainer.innerHTML = '<div class="p-4 text-center text-red-500">Error loading conversations</div>';
    }

    function renderConversationList(list: Conversation[]) {
        if (!listContainer) return;
        if (list.length === 0) {
            listContainer.innerHTML = `<div class="p-8 text-center text-gray-400">No conversations yet</div>`;
            return;
        }

        listContainer.innerHTML = list.map(c => `
            <div class="conversation-item p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" data-id="${c.id}">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 truncate w-32">${c.guest_name || 'Customer'}</h4>
                    <div class="flex items-center gap-2">
                        ${c.unread_count && c.unread_count > 0 ? `<span class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center" id="badge-${c.id}">${c.unread_count}</span>` : ''}
                        <span class="text-[10px] text-gray-400">${new Date(c.last_message_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="text-xs text-gray-500 truncate">${c.guest_email || 'No email'}</p>
            </div>
        `).join('');

        // Add click listeners
        listContainer.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                if (id) loadConversation(id, list.find(c => c.id === id)!);
            });
        });

        // Check for deep link
        const pendingId = sessionStorage.getItem('open_chat_id');
        if (pendingId) {
            const item = listContainer.querySelector(`.conversation-item[data-id="${pendingId}"]`);
            if (item) {
                (item as HTMLElement).click();
                sessionStorage.removeItem('open_chat_id');
            }
        }
    }

    async function loadConversation(id: string, conv: Conversation) {
        // if (activeConversationId === id) return; // Allow re-click to trigger view change on mobile if needed
        activeConversationId = id;

        // Mobile transition
        showChat();

        // Update UI
        if (inputArea) inputArea.classList.remove('hidden');
        if (nameEl) nameEl.textContent = conv.guest_name || 'Customer';
        if (infoEl) infoEl.textContent = conv.guest_email || '';

        // Highlight & Remove Badge
        listContainer?.querySelectorAll('.conversation-item').forEach(el => {
            if (el.getAttribute('data-id') === id) {
                el.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                const badge = el.querySelector(`#badge-${id}`);
                if (badge) badge.remove();
            } else {
                el.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
            }
        });

        // Mark as Read in DB
        ChatService.markAsRead(id).catch(console.error);

        if (messagesContainer) {
            messagesContainer.innerHTML = '<div class="flex h-full items-center justify-center"><span class="material-symbols-outlined animate-spin">progress_activity</span></div>';
        }

        // Unsubscribe prev
        if (messagesSubscription) messagesSubscription.unsubscribe();

        // Load Messages
        try {
            const messages = await ChatService.getMessages(id);
            renderMessages(messages);

            // Subscribe
            messagesSubscription = ChatService.subscribeToMessages(id, (msg) => {
                appendMessage(msg);
                scrollToBottom();
            });
        } catch (e) {
            console.error(e);
            if (messagesContainer) messagesContainer.innerHTML = '<div class="text-center text-red-500 pt-10">Error loading messages</div>';
        }
    }

    function renderMessages(msgs: ChatMessage[]) {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = '';
        msgs.forEach(appendMessage);
        scrollToBottom();
    }

    function appendMessage(msg: ChatMessage) {
        if (!messagesContainer) return;

        const isAdmin = msg.sender_type === 'admin';
        // Admin View: Admin messages on RIGHT (me), Customer on LEFT

        const div = document.createElement('div');
        div.className = `flex gap-3 mb-4 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`;

        div.innerHTML = `
            <div class="size-8 rounded-full ${isAdmin ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm pt-0.5">${isAdmin ? 'support_agent' : 'person'}</span>
            </div>
            
            <div class="flex flex-col ${isAdmin ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]">
                <div class="px-4 py-3 rounded-2xl text-sm ${isAdmin ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'} shadow-sm">
                    ${escapeHtml(msg.content)}
                </div>
                <span class="text-[10px] text-gray-400 mt-1 px-1">
                    ${new Date(msg.created_at).toLocaleString()}
                </span>
            </div>
        `;
        messagesContainer.appendChild(div);
    }

    function scrollToBottom() {
        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('admin-message-input') as HTMLInputElement;
        const content = input.value.trim();

        if (!content || !activeConversationId) return;

        input.value = '';
        input.focus();

        try {
            await ChatService.sendMessage(activeConversationId, content, 'admin');
        } catch (err) {
            console.error('Send Error', err);
        }
    });

    function escapeHtml(unsafe: string) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
