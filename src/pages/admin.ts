import { AuthService } from '../services/auth.service';
import { renderDashboard } from '../components/admin/dashboard.ts';
import { renderProducts } from '../components/admin/products.ts';
import { renderCategories } from '../components/admin/categories.ts';
import { renderBlog } from '../components/admin/blog.ts';
import { renderOrders } from '../components/admin/orders.ts';

const contentMap: { [key: string]: (container: HTMLElement) => void } = {
    'dashboard': renderDashboard,
    'products': renderProducts,
    'categories': renderCategories,
    'orders': renderOrders,
    'blog': renderBlog,
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
}

document.addEventListener('DOMContentLoaded', initAdmin);
