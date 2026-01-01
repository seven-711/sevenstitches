import { AuthService } from '../services/auth.service';
import { ChatService, ChatMessage, Conversation } from '../services/chat.service';

export class ChatWidget extends HTMLElement {
    private isOpen = false;
    private conversation: Conversation | null = null;
    private messages: ChatMessage[] = [];
    private user: any = null;
    private subscription: any = null;

    constructor() {
        super();
    }

    async connectedCallback() {
        this.render();
        this.user = await AuthService.getUser();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    render() {
        this.innerHTML = `
            <div id="chat-widget-container" class="fixed bottom-20 sm:bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
                <style>
                    @keyframes fadeLoop {
                        0% { opacity: 0; transform: translateY(10px); visibility: hidden; }
                        5% { opacity: 1; transform: translateY(0); visibility: visible; }
                        50% { opacity: 1; transform: translateY(0); visibility: visible; }
                        55% { opacity: 0; transform: translateY(10px); visibility: hidden; }
                        100% { opacity: 0; transform: translateY(10px); visibility: hidden; }
                    }
                    .chat-prompt-anim {
                        animation: fadeLoop 8s infinite;
                    }
                </style>
                <!-- Chat Window -->
                <div id="chat-window" class="hidden w-[calc(100vw-48px)] sm:w-[350px] h-[500px] max-h-[80vh] bg-white dark:bg-[#151c2b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all transform origin-bottom-right scale-95 opacity-0">
                    <!-- Header -->
                    <div class="p-4 bg-primary text-white flex justify-between items-center shrink-0">
                        <div>
                            <h3 class="font-bold flex items-center gap-2">
                                <span class="material-symbols-outlined">support_agent</span>
                                Customer Support
                            </h3>
                            <p class="text-xs text-blue-100">You are talking to July</p>
                        </div>
                        <button id="close-chat" class="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>

                    <!-- Content Area -->
                    <div id="chat-content" class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0f172a] space-y-4">
                        <!-- Messages or Start Form will go here -->
                        <div class="flex h-full items-center justify-center">
                            <span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div id="chat-input-area" class="p-3 bg-white dark:bg-[#151c2b] border-t border-gray-100 dark:border-gray-800 hidden">
                        <form id="chat-form" class="flex gap-2">
                            <input type="text" id="message-input" class="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary dark:text-white" placeholder="Type a message..." autocomplete="off">
                            <button type="submit" class="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="material-symbols-outlined text-sm">arrow_upward</span>
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Animated Prompt -->
                <div id="chat-prompt" class="chat-prompt-anim bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-sm font-medium relative max-w-[200px] text-center">
                    Do you want to customized your order?
                    <div class="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-700 transform rotate-45"></div>
                </div>

                <!-- Toggle Button -->
                <button id="toggle-chat" class="size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group">
                    <span class="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">chat</span>
                    <span class="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a] hidden" id="chat-badge"></span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        const toggleBtn = this.querySelector('#toggle-chat');
        const closeBtn = this.querySelector('#close-chat');

        const chatForm = this.querySelector('#chat-form');

        toggleBtn?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.toggleChat());

        chatForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = this.querySelector('#message-input') as HTMLInputElement;
            const btn = chatForm.querySelector('button');
            const content = input.value.trim();

            if (!content || !this.conversation) return;

            const isFirstMessage = this.messages.length === 0;

            // Optimistic UI? Maybe wait for simplicity
            input.value = '';
            if (btn) btn.disabled = true;

            try {
                await ChatService.sendMessage(this.conversation.id, content, 'customer');

                // Automated Reply Logic
                if (isFirstMessage) {
                    setTimeout(async () => {
                        const autoReply = "Thank you for reaching out. This is July. \n\nI check my website regularly, approximately every 30 minutes. Please feel free to check back shortly, and I will make sure to respond within that timeframe.\n\nI appreciate your patience. <3";
                        try {
                            await ChatService.sendMessage(this.conversation!.id, autoReply, 'admin');
                        } catch (e) {
                            console.error('Failed to send auto-reply', e);
                        }
                    }, 1000);
                }

            } catch (err) {
                console.error(err);
                // Handle error
            } finally {
                if (btn) btn.disabled = false;
                input.focus();
            }
        });
    }

    async toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = this.querySelector('#chat-window');
        const toggleBtn = this.querySelector('#toggle-chat');
        const icon = toggleBtn?.querySelector('.material-symbols-outlined');
        const badge = this.querySelector('#chat-badge');
        const prompt = this.querySelector('#chat-prompt');

        if (this.isOpen) {
            prompt?.classList.add('hidden');
            chatWindow?.classList.remove('hidden');
            // Small delay for transition
            requestAnimationFrame(() => {
                chatWindow?.classList.remove('scale-95', 'opacity-0');
            });

            if (icon) icon.textContent = 'close';
            if (badge) badge.classList.add('hidden');

            // Init Logic
            if (!this.conversation) {
                await this.initChatFlow();
            } else {
                this.scrollToBottom();
            }
        } else {
            chatWindow?.classList.add('scale-95', 'opacity-0');
            setTimeout(() => chatWindow?.classList.add('hidden'), 200);

            if (icon) icon.textContent = 'chat';
        }
    }

    async initChatFlow() {
        const contentArea = this.querySelector('#chat-content');
        if (!contentArea) return;

        // Check if we can find an existing conversation
        try {
            // If logged in, check user_id. If not, check local storage for guest info or ask.
            let guestInfo = null;
            const storedGuest = localStorage.getItem('chat_guest_info');
            if (!this.user && storedGuest) {
                guestInfo = JSON.parse(storedGuest);
            }

            if (this.user || guestInfo) {
                this.conversation = await ChatService.getOrCreateConversation(this.user?.id, guestInfo);
            }

            if (this.conversation) {
                await this.loadMessages();
            } else {
                this.renderGuestForm();
            }
        } catch (e) {
            console.error('Chat Init Error', e);
            contentArea.innerHTML = `<div class="text-center text-red-500 mt-10">Failed to load chat. Please try again later.</div>`;
        }
    }

    renderGuestForm() {
        const contentArea = this.querySelector('#chat-content');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="flex flex-col gap-4 mt-8">
                <div class="text-center mb-4">
                    <h4 class="font-bold text-gray-900 dark:text-white">Welcome!</h4>
                    <p class="text-sm text-gray-500">Please enter your details to start chatting.</p>
                </div>
                <form id="guest-form" class="space-y-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" name="name" required class="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" placeholder="Your Name">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" name="email" required class="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" placeholder="your@email.com">
                    </div>
                    <button type="submit" class="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        Start Chat
                    </button>
                    ${!this.user ? `<p class="text-xs text-center text-gray-400 mt-2">Already have an account? <a href="/pages/login.html" class="text-primary hover:underline">Log in</a></p>` : ''}
                </form>
            </div>
        `;

        const form = contentArea.querySelector('#guest-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;

            if (name && email) {
                const btn = form.querySelector('button');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = 'Starting...';
                }

                try {
                    localStorage.setItem('chat_guest_info', JSON.stringify({ name, email }));
                    this.conversation = await ChatService.getOrCreateConversation(undefined, { name, email });
                    await this.loadMessages();
                } catch (err) {
                    console.error(err);
                    alert("Failed to start chat"); // Simple alert for now
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = 'Start Chat';
                    }
                }
            }
        });
    }

    async loadMessages() {
        if (!this.conversation) return;

        const contentArea = this.querySelector('#chat-content');
        const inputArea = this.querySelector('#chat-input-area');

        if (contentArea) contentArea.innerHTML = '';
        if (inputArea) inputArea.classList.remove('hidden');

        // Load initial
        this.messages = await ChatService.getMessages(this.conversation.id);
        this.renderMessages();

        // Subscribe
        this.subscription = ChatService.subscribeToMessages(this.conversation.id, (msg) => {
            this.messages.push(msg);
            this.appendMessage(msg);
            this.scrollToBottom();
        });
    }

    renderMessages() {
        const contentArea = this.querySelector('#chat-content');
        if (!contentArea) return;
        contentArea.innerHTML = '';

        // Welcome message
        contentArea.innerHTML += `
            <div class="flex justify-center my-4">
               <span class="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Started ${new Date(this.conversation!.created_at).toLocaleDateString()}</span>
            </div>
        `;

        this.messages.forEach(msg => this.appendMessage(msg));
        this.scrollToBottom();
    }

    appendMessage(msg: ChatMessage) {
        const contentArea = this.querySelector('#chat-content');
        if (!contentArea) return;

        const isAdmin = msg.sender_type === 'admin';
        const isMe = !isAdmin; // For customer widget, 'customer' is ME.

        const div = document.createElement('div');
        div.className = `flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`;

        div.innerHTML = `
            ${isAdmin ? `
            <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm text-primary">support_agent</span>
            </div>` : ''}
            
            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]">
                <div class="px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'} shadow-sm break-words">
                    ${this.escapeHtml(msg.content)}
                </div>
                <span class="text-[10px] text-gray-400 mt-1 px-1">
                    ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        `;

        contentArea.appendChild(div);
    }

    scrollToBottom() {
        const contentArea = this.querySelector('#chat-content');
        if (contentArea) contentArea.scrollTop = contentArea.scrollHeight;
    }

    escapeHtml(unsafe: string) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
