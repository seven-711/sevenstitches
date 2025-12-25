export class Toast {
    static show(message: string, type: 'success' | 'error' | 'info' = 'info') {
        const container = document.getElementById('toast-container') || this.createContainer();

        const toast = document.createElement('div');
        toast.className = `
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full opacity-0
            ${type === 'success' ? 'bg-green-500 text-white' : ''}
            ${type === 'error' ? 'bg-red-500 text-white' : ''}
            ${type === 'info' ? 'bg-blue-500 text-white' : ''}
        `;

        const icon = type === 'success' ? 'check_circle' :
            type === 'error' ? 'error' : 'info';

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span class="font-medium text-sm">${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-full', 'opacity-0');
        });

        // Remove after delay
        setTimeout(() => {
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    private static createContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none items-center';
        document.body.appendChild(container);
        return container;
    }
}
