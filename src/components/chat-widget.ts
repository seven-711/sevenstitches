
export class ChatWidget extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div id="chat-widget-container" class="fixed bottom-10 sm:bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
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

                <!-- Animated Prompt -->
                <div id="chat-prompt" class="chat-prompt-anim bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-sm font-medium relative max-w-[200px] text-center">
                    Do you want to customize your order?
                    <div class="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-100 dark:border-gray-700 transform rotate-45"></div>
                </div>

                <!-- Toggle Button -->
                <button id="toggle-chat" class="size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group">
                    <span class="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">chat</span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        const toggleBtn = this.querySelector('#toggle-chat');
        toggleBtn?.addEventListener('click', () => {
            window.location.href = '/pages/chat.html';
        });
    }
}
