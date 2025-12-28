import { AuthService } from '../services/auth.service';
import { renderDashboard } from '../components/admin/dashboard';
import { renderProducts } from '../components/admin/products';
import { renderCategories } from '../components/admin/categories';
import { renderBlog } from '../components/admin/blog';
import { renderOrders } from '../components/admin/orders';
import { renderChat } from '../components/admin/chat';

const contentMap: { [key: string]: (container: HTMLElement) => void } = {
    'dashboard': renderDashboard,
    'products': renderProducts,
    'categories': renderCategories,
    'orders': renderOrders,
    'blog': renderBlog,
    'messages': renderChat
};

async function initAdmin() {
    const loadingEl = document.getElementById('admin-loading');
    const sidebarEl = document.getElementById('sidebar');
    const mainContentEl = document.getElementById('main-content'); // Main wrapper
    const viewContainer = document.getElementById('admin-view-container'); // Inner container for views
    const logoutBtn = document.getElementById('admin-logout');
    const navItems = document.querySelectorAll('.nav-item[data-view]');

    try {
        // 1. Check Auth & Role
        await AuthService.init();
        const { clerk } = await import('../lib/clerk');

        if (!clerk.user) {
            // Not logged in -> Redirect to Sign In
            clerk.redirectToSignIn({
                redirectUrl: window.location.href,
            });
            return;
        }

        const isAdmin = await AuthService.isAdmin();
        if (!isAdmin) {
            // Logged in but NOT admin -> Show Access Denied
            if (loadingEl) loadingEl.style.display = 'none';
            document.body.innerHTML = `
                <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="material-icons-round text-3xl text-red-600 dark:text-red-400">gpp_bad</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                        <p class="text-gray-500 dark:text-gray-400 mb-8">
                            This area is restricted to administrators only. You do not have the required permissions to view this content.
                        </p>
                        <div class="space-y-3">
                            <button id="denied-logout" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <span class="material-icons-round">logout</span> Sign Out
                            </button>
                            <a href="/" class="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-4 rounded-xl transition-colors">
                                Return to Store
                            </a>
                        </div>
                    </div>
                    <div class="mt-8 text-sm text-gray-400">
                        Logged in as <span class="font-medium text-gray-600 dark:text-gray-300">${clerk.user.primaryEmailAddress?.emailAddress || 'User'}</span>
                    </div>
                </div>
            `;

            // Attach logout handler to new button
            document.getElementById('denied-logout')?.addEventListener('click', async () => {
                await AuthService.logout();
                window.location.href = '/';
            });
            return;
        }

        // Show Profile Image
        const profileContainer = document.getElementById('admin-profile-container');
        if (profileContainer && clerk.user.imageUrl) {
            profileContainer.innerHTML = `
                <img src="${clerk.user.imageUrl}" alt="Profile" class="h-full w-full rounded-full object-cover">
            `;
        }

        // 2. Show UI
        if (loadingEl) loadingEl.style.display = 'none';
        if (sidebarEl) sidebarEl.classList.remove('hidden');
        if (mainContentEl) mainContentEl.classList.remove('hidden');

        // 3. Setup Navigation
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLElement;
                const view = target.getAttribute('data-view');

                // Update Active State
                navItems.forEach(nav => nav.classList.remove('active'));
                target.classList.add('active');

                // Render View
                if (view && viewContainer && contentMap[view]) {
                    contentMap[view](viewContainer);
                }
            });
        });

        // 4. Initial Render
        if (viewContainer) {
            renderDashboard(viewContainer);
        }

        // 5. Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await AuthService.logout();
                window.location.href = '/';
            });
        }

    } catch (error) {
        console.error('Admin Init Error:', error);
        window.location.href = '/';
    }

    // Responsive Sidebar Logic
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        const isClosed = sidebarEl?.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebarEl?.classList.remove('-translate-x-full');
            overlay?.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            sidebarEl?.classList.add('-translate-x-full');
            overlay?.classList.add('opacity-0', 'pointer-events-none');
        }
    }

    toggleBtn?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);

    // Close sidebar on mobile when navigating
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 1024) { // lg breakpoint
                sidebarEl?.classList.add('-translate-x-full');
                overlay?.classList.add('opacity-0', 'pointer-events-none');
            }
        });
    });

    // --- Notification Logic ---
    const notifBtn = document.getElementById('admin-notification-btn');
    const notifBadge = document.getElementById('admin-notification-badge');
    const notifDropdown = document.getElementById('admin-notification-dropdown');
    const notifList = document.getElementById('notification-list');
    const markAllBtn = document.getElementById('mark-all-read');

    // Toggle Dropdown
    notifBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown?.classList.toggle('hidden');
        if (!notifDropdown?.classList.contains('hidden')) {
            loadNotifications();
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!notifDropdown?.contains(e.target as Node) && !notifBtn?.contains(e.target as Node)) {
            notifDropdown?.classList.add('hidden');
        }
    });

    // Load initial badge
    updateBadge();

    async function updateBadge() {
        const { NotificationService } = await import('../services/notification.service');
        const count = await NotificationService.getUnreadCount();
        if (notifBadge) {
            if (count > 0) {
                notifBadge.classList.remove('hidden');
                notifBadge.textContent = count > 99 ? '99+' : count.toString();
                console.log('Badge updated with count:', count);
            } else {
                notifBadge.classList.add('hidden');
            }
        }
    }

    async function loadNotifications() {
        const { NotificationService } = await import('../services/notification.service');
        const notifications = await NotificationService.getNotifications();

        if (!notifList) return;

        if (notifications.length === 0) {
            notifList.innerHTML = `<div class="p-6 text-center text-gray-400 text-sm">No notifications</div>`;
            return;
        }

        notifList.innerHTML = notifications.map(n => `
            <div class="notification-item p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${n.read ? 'opacity-60' : 'bg-blue-50/10 dark:bg-blue-900/10'}" data-id="${n.id}" data-link="${n.link || ''}" data-conversation-id="${n.conversationId || ''}">
                <div class="flex gap-3">
                    <div class="mt-1">
                        <span class="material-icons-round text-sm ${getIconColor(n.type)}">${getIcon(n.type)}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 ${n.read ? '' : 'text-primary'}">${n.title}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">${n.message}</p>
                        <p class="text-[10px] text-gray-400 mt-1">${getTimeAgo(n.created_at)}</p>
                    </div>
                     ${!n.read ? `<div class="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>` : ''}
                </div>
            </div>
        `).join('');

        // Add Listeners
        notifList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', async () => {
                const id = item.getAttribute('data-id');
                const link = item.getAttribute('data-link');
                const conversationId = item.getAttribute('data-conversation-id');

                if (id) {
                    await NotificationService.markAsRead(id);
                    updateBadge();
                }

                if (link && navItems) {
                    // Navigate
                    if (conversationId) {
                        sessionStorage.setItem('open_chat_id', conversationId);
                    }

                    const targetNav = Array.from(navItems).find((n: Element) => n.getAttribute('data-view') === link);
                    if (targetNav) {
                        (targetNav as HTMLElement).click();
                        notifDropdown?.classList.add('hidden');
                    }
                }
            });
        });
    }

    markAllBtn?.addEventListener('click', async () => {
        const { NotificationService } = await import('../services/notification.service');
        await NotificationService.markAllAsRead();
        updateBadge();
        loadNotifications();
    });

    function getIcon(type: string) {
        switch (type) {
            case 'success': return 'check_circle';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    }

    function getIconColor(type: string) {
        switch (type) {
            case 'success': return 'text-green-500';
            case 'warning': return 'text-orange-500';
            case 'error': return 'text-red-500';
            default: return 'text-blue-500';
        }
    }

    function getTimeAgo(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);
