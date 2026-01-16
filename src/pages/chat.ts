import { AuthService } from '../services/auth.service';
import { ChatService, ChatMessage, Conversation } from '../services/chat.service';

class ChatPage {
    private conversation: Conversation | null = null;
    private messages: ChatMessage[] = [];

    private user: any = null;
    private pendingAttachments: { type: 'image' | 'video', src: string }[] = [];


    constructor() {
        this.init();
    }

    async init() {
        this.user = await AuthService.getUser();
        this.setupEventListeners();
        this.initChatFlow();
    }

    setupEventListeners() {
        const chatForm = document.querySelector('#chat-form');
        const attachBtn = document.querySelector('#attach-btn');
        const fileInput = document.querySelector('#chat-file-input') as HTMLInputElement;
        const previewContainer = document.querySelector('#attachment-preview');

        attachBtn?.addEventListener('click', () => fileInput?.click());

        fileInput?.addEventListener('change', () => {
            const files = fileInput.files;
            if (!files || files.length === 0) return;

            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                    alert('Only images and videos are supported.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const src = e.target?.result as string;
                    const type = file.type.startsWith('image/') ? 'image' : 'video';
                    this.pendingAttachments.push({ type, src });
                    this.renderPreviews();
                };
                reader.readAsDataURL(file);
            });
            fileInput.value = '';
        });

        // Handle Preview Removals
        previewContainer?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const removeBtn = target.closest('.remove-attachment');
            if (removeBtn) {
                const index = parseInt(removeBtn.getAttribute('data-index') || '-1');
                if (index > -1) {
                    this.pendingAttachments.splice(index, 1);
                    this.renderPreviews();
                }
            }
        });

        chatForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.querySelector('#message-input') as HTMLInputElement;
            const btn = chatForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            const content = input.value.trim();

            if ((!content && this.pendingAttachments.length === 0) || !this.conversation) return;

            const isFirstMessage = this.messages.length === 0;

            if (btn) btn.disabled = true;

            try {
                // Send Text if Exists
                if (content) {
                    await ChatService.sendMessage(this.conversation.id, content, 'customer');
                    input.value = '';
                }

                // Send Queued Attachments
                for (const media of this.pendingAttachments) {
                    const payload = `:::MEDIA:::${JSON.stringify(media)}`;
                    await ChatService.sendMessage(this.conversation.id, payload, 'customer');
                }

                // Clear Queue
                this.pendingAttachments = [];
                this.renderPreviews();

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
                alert("Failed to send message");
            } finally {
                if (btn) btn.disabled = false;
                input.focus();
            }
        });
    }

    renderPreviews() {
        const container = document.querySelector('#attachment-preview');
        if (!container) return;

        if (this.pendingAttachments.length === 0) {
            container.classList.add('hidden');
            container.classList.remove('flex');
            container.innerHTML = '';
            return;
        }

        container.classList.remove('hidden');
        container.classList.add('flex');
        container.innerHTML = this.pendingAttachments.map((media, index) => `
            <div class="relative shrink-0 group animate-in fade-in zoom-in duration-300">
                ${media.type === 'image'
                ? `<img src="${media.src}" class="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" />`
                : `<video src="${media.src}" class="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"></video>`
            }
                <button type="button" data-index="${index}" class="remove-attachment absolute -top-2 -right-2 size-6 flex items-center justify-center bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10">
                    <span class="material-symbols-outlined text-sm font-bold">close</span>
                </button>
            </div>
        `).join('');
    }

    async initChatFlow() {
        const contentArea = document.querySelector('#chat-content');
        if (!contentArea) return;

        try {
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
            contentArea.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center p-6 text-red-500">
                <span class="material-symbols-outlined text-4xl mb-2">error</span>
                <p>Failed to load chat. Please try again later.</p>
                <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-full text-sm">Retry</button>
            </div>`;
        }
    }

    renderGuestForm() {
        const contentArea = document.querySelector('#chat-content');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="flex flex-col gap-6 mt-12 max-w-md mx-auto px-4">
                <div class="text-center">
                    <div class="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                         <span class="material-symbols-outlined text-4xl text-primary">waving_hand</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Support!</h2>
                    <p class="text-gray-500">Please enter your details to start chatting with us.</p>
                </div>
                <form id="guest-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" name="name" required class="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Your Name">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" name="email" required class="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="your@email.com">
                    </div>
                    <button type="submit" class="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2">
                        Start Conversation
                    </button>
                    ${!this.user ? `<p class="text-sm text-center text-gray-400 mt-4">Already have an account? <a href="/pages/login.html" class="text-primary hover:underline font-bold">Log in</a></p>` : ''}
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
                    alert("Failed to start chat");
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = 'Start Conversation';
                    }
                }
            }
        });
    }

    async loadMessages() {
        if (!this.conversation) return;

        const contentArea = document.querySelector('#chat-content');
        // Clear loading or guest form
        if (contentArea) contentArea.innerHTML = '';

        this.messages = await ChatService.getMessages(this.conversation.id);
        this.renderMessages();

        ChatService.subscribeToMessages(this.conversation.id, (msg) => {
            this.messages.push(msg);
            this.appendMessage(msg);
            this.scrollToBottom();
        });
    }

    renderMessages() {
        const contentArea = document.querySelector('#chat-content');
        if (!contentArea) return;
        contentArea.innerHTML = '';

        // Welcome/Date Divider
        contentArea.innerHTML += `
            <div class="flex justify-center my-6">
               <span class="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-1 rounded-full">Started ${new Date(this.conversation!.created_at).toLocaleDateString()}</span>
            </div>
        `;

        this.messages.forEach(msg => this.appendMessage(msg));
        this.scrollToBottom();
    }

    appendMessage(msg: ChatMessage) {
        const contentArea = document.querySelector('#chat-content');
        if (!contentArea) return;

        const isAdmin = msg.sender_type === 'admin';
        const isMe = !isAdmin;

        const div = document.createElement('div');
        div.className = `flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`;

        div.innerHTML = `
            ${isAdmin ? `
            <div class="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 self-end mb-1">
                <span class="material-symbols-outlined text-sm text-primary">support_agent</span>
            </div>` : ''}
            
            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]">
                <div class="px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${isMe
                ? 'bg-primary text-white rounded-tr-sm'
                : 'bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
            }">
            
                    ${this.renderMessageContent(msg.content)}
                </div>
                <span class="text-[10px] text-gray-400 mt-1 px-1 font-medium select-none">
                    ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        `;

        contentArea.appendChild(div);
    }

    scrollToBottom() {
        const contentArea = document.querySelector('#chat-content');
        if (contentArea) {
            contentArea.scrollTo({
                top: contentArea.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    escapeHtml(unsafe: string) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderMessageContent(content: string) {
        if (content.startsWith(':::MEDIA:::')) {
            try {
                const json = content.substring(11); // Remove :::MEDIA:::
                const data = JSON.parse(json);
                if (data.type === 'image') {
                    return `<img src="${data.src}" class="max-w-full max-h-[300px] rounded-lg border border-gray-200 dark:border-gray-700" loading="lazy" />`;
                } else if (data.type === 'video') {
                    return `<video src="${data.src}" controls class="max-w-full max-h-[300px] rounded-lg border border-gray-200 dark:border-gray-700"></video>`;
                }
            } catch (e) {
                return '<span class="italic text-gray-400">Invalid Media Attachment</span>';
            }
        }
        return this.escapeHtml(content).replace(/\n/g, '<br>');
    }
}

new ChatPage();
