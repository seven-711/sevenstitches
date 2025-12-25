import { CategoryService, Category } from '../../services/category.service';

export async function renderCategories(container: HTMLElement) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <button id="btn-add-category" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                 <span class="material-icons-round text-xl">add</span> Add Category
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categories-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading categories...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="category-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-md mx-4">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="cat-modal-title" class="text-xl font-bold">Add Category</h2>
                    <button id="btn-close-cat-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="category-form" class="space-y-4">
                        <input type="hidden" id="category_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="cat_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="cat_description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel-cat" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Category</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Listeners
    document.getElementById('btn-add-category')?.addEventListener('click', () => openModal());
    document.getElementById('btn-close-cat-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-cat')?.addEventListener('click', closeModal);

    document.getElementById('category-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSaveCategory();
    });

    await loadCategories();
}

let currentCategories: Category[] = [];

async function loadCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    try {
        currentCategories = await CategoryService.getCategories();
        if (currentCategories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No categories found.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentCategories.map(cat => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${cat.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${cat.slug}</td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">${cat.description || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editCategory('${cat.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deleteCategory('${cat.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        (window as any).editCategory = (id: string) => {
            const cat = currentCategories.find(c => c.id === id);
            if (cat) openModal(cat);
        };

        (window as any).deleteCategory = async (id: string) => {
            if (confirm('Delete this category?')) {
                try {
                    await CategoryService.deleteCategory(id);
                    await loadCategories();
                } catch (e) {
                    console.error(e);
                    alert('Failed to delete category');
                }
            }
        };

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading categories.</td></tr>`;
    }
}

function openModal(category?: Category) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('cat-modal-title');
    const form = document.getElementById('category-form') as HTMLFormElement;

    if (!modal || !title || !form) return;

    form.reset();
    (document.getElementById('category_id') as HTMLInputElement).value = '';

    if (category) {
        title.textContent = 'Edit Category';
        (document.getElementById('category_id') as HTMLInputElement).value = category.id;
        (document.getElementById('cat_name') as HTMLInputElement).value = category.name;
        (document.getElementById('cat_description') as HTMLTextAreaElement).value = category.description || '';
    } else {
        title.textContent = 'Add Category';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('category-modal')?.classList.add('hidden');
}

async function handleSaveCategory() {
    const id = (document.getElementById('category_id') as HTMLInputElement).value;
    const name = (document.getElementById('cat_name') as HTMLInputElement).value;
    const description = (document.getElementById('cat_description') as HTMLTextAreaElement).value;

    const data: Partial<Category> = {
        name,
        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description
    };

    try {
        if (id) {
            await CategoryService.updateCategory(id, data);
        } else {
            await CategoryService.createCategory(data);
        }
        closeModal();
        await loadCategories();
    } catch (e) {
        console.error(e);
        alert('Failed to save category');
    }
}
