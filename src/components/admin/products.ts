import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { StorageService } from '../../services/storage.service';

let currentProducts: Product[] = [];
let currentCategories: Category[] = [];
let selectedImageFiles: File[] = []; // Store selected files
let existingImages: string[] = []; // Store existing URLs during edit

export async function renderProducts(container: HTMLElement) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <button id="btn-add-product" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <span class="material-icons-round text-xl">add</span> Add Product
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inventory</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading products...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Container (Hidden) -->
        <div id="product-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="modal-title" class="text-xl font-bold">Add Product</h2>
                    <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="product-form" class="space-y-4">
                        <input type="hidden" id="product_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Price</label>
                                <input type="number" id="price" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Inventory</label>
                                <input type="number" id="inventory_count" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="">Select Category</option>
                                <!-- Options populated dynamically -->
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                            
                            <!-- Drop Zone -->
                            <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer relative group mb-4">
                                <input type="file" id="image-file-input" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                
                                <div id="drop-zone-content" class="space-y-2">
                                    <span class="material-icons-round text-4xl text-gray-400 group-hover:text-primary">cloud_upload</span>
                                    <p class="text-sm text-gray-500">Drag & drop images here, or click to upload</p>
                                    <p class="text-xs text-gray-400">PNG, JPG up to 5MB (Multiple allowed)</p>
                                </div>
                            </div>

                            <!-- Image Preview Grid -->
                            <div id="image-preview-grid" class="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                <!-- Previews injected here -->
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Theme Color</label>
                                <select id="theme_color" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="">Default (Blue)</option>
                                    <option value="green">Green</option>
                                    <option value="pink">Pink</option>
                                    <option value="purple">Purple</option>
                                    <option value="red">Red</option>
                                    <option value="cream">Cream (#FEEAC9)</option>
                                    <option value="coral">Coral (#FD7979)</option>
                                    <option value="yellow">Yellow</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" id="btn-save" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                                <span>Save Product</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Event Listeners
    setupImageUploadListeners();
    document.getElementById('btn-add-product')?.addEventListener('click', () => openModal());
    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel')?.addEventListener('click', closeModal);

    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSaveProduct();
    });

    // Load Data
    currentCategories = await CategoryService.getCategories(); // Load categories first
    await loadProducts();
}

function setupImageUploadListeners() {
    const fileInput = document.getElementById('image-file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');

    if (!fileInput || !dropZone) return;

    // Handle File Selection (Click or Drag)
    fileInput.addEventListener('change', (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            handleFilesSelect(files);
        }
        // Reset input value so same files can be selected again if needed
        fileInput.value = '';
    });

    // Handle Drag Visuals
    dropZone.addEventListener('dragenter', () => dropZone.classList.add('border-primary', 'bg-blue-50'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-primary', 'bg-blue-50'));
    dropZone.addEventListener('drop', () => dropZone.classList.remove('border-primary', 'bg-blue-50'));
}

function handleFilesSelect(files: FileList) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            selectedImageFiles.push(file);
        }
    }
    renderImagePreviews();
}

function renderImagePreviews() {
    const grid = document.getElementById('image-preview-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Render Existing Images
    existingImages.forEach((url, index) => {
        const el = document.createElement('div');
        el.className = 'relative aspect-square rounded-lg overflow-hidden border border-gray-200 group';
        el.innerHTML = `
            <img src="${url}" class="w-full h-full object-cover">
            <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
                onclick="window.removeExistingImage(${index})">
                <span class="material-icons-round text-xs">close</span>
            </button>
        `;
        grid.appendChild(el);
    });

    // Render New Selected Files
    selectedImageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const el = document.createElement('div');
            el.className = 'relative aspect-square rounded-lg overflow-hidden border border-gray-200 group';
            el.innerHTML = `
                <img src="${e.target?.result}" class="w-full h-full object-cover">
                <button type="button" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" 
                    onclick="window.removeNewImage(${index})">
                    <span class="material-icons-round text-xs">close</span>
                </button>
            `;
            grid.appendChild(el);
        };
        reader.readAsDataURL(file);
    });

    // Expose helpers globally for the onclick handlers
    (window as any).removeExistingImage = (index: number) => {
        existingImages.splice(index, 1);
        renderImagePreviews();
    };

    (window as any).removeNewImage = (index: number) => {
        selectedImageFiles.splice(index, 1);
        renderImagePreviews();
    };
}

function clearFileSelection() {
    selectedImageFiles = [];
    existingImages = [];
    renderImagePreviews();
}

async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    try {
        currentProducts = await ProductService.getProducts();

        if (currentProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No products found. Add one to get started.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentProducts.map(product => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                            ${product.images?.[0] ? `<img class="h-10 w-10 rounded-lg object-cover" src="${product.images?.[0]}" alt="">` : `<div class="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">?</div>`}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">${product.name}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">${product.slug || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">₱${product.price}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}">
                        ${product.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${product.inventory_count}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editProduct('${product.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        // Expose helpers to window for inline onclick handlers (simpler than attaching event listeners to each row dynamically for now)
        (window as any).editProduct = (id: string) => {
            const product = currentProducts.find(p => p.id === id);
            if (product) openModal(product);
        };

        (window as any).deleteProduct = async (id: string) => {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    await ProductService.deleteProduct(id);
                    await loadProducts();
                } catch (err) {
                    console.error('Failed to delete', err);
                    alert('Failed to delete product');
                }
            }
        };

    } catch (err) {
        console.error('Error loading products', err);
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading products. Check console.</td></tr>`;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    }
}

function openModal(product?: Product) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form') as HTMLFormElement;
    const categorySelect = document.getElementById('category_id') as HTMLSelectElement;

    if (!modal || !title || !form || !categorySelect) return;

    // Reset state
    clearFileSelection();

    // Populate Category Options
    categorySelect.innerHTML = '<option value="">Select Category</option>' +
        currentCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    form.reset();
    (document.getElementById('product_id') as HTMLInputElement).value = '';

    if (product) {
        title.textContent = 'Edit Product';
        (document.getElementById('product_id') as HTMLInputElement).value = product.id;
        (document.getElementById('name') as HTMLInputElement).value = product.name;
        (document.getElementById('price') as HTMLInputElement).value = product.price.toString();
        (document.getElementById('inventory_count') as HTMLInputElement).value = product.inventory_count.toString();
        (document.getElementById('description') as HTMLTextAreaElement).value = product.description || '';
        (document.getElementById('status') as HTMLSelectElement).value = product.status;
        (document.getElementById('theme_color') as HTMLSelectElement).value = product.theme_color || '';
        categorySelect.value = product.category_id || '';

        // Load existing images
        existingImages = product.images ? [...product.images] : [];
        renderImagePreviews();

    } else {
        title.textContent = 'Add Product';
        title.textContent = 'Add Product';
        (document.getElementById('status') as HTMLSelectElement).value = 'active';
        (document.getElementById('theme_color') as HTMLSelectElement).value = '';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal?.classList.add('hidden');
    clearFileSelection();
}

async function handleSaveProduct() {
    const btnSave = document.getElementById('btn-save');
    const originalBtnText = btnSave ? btnSave.innerHTML : 'Save';

    // Disable button to prevent double submit
    if (btnSave) {
        (btnSave as HTMLButtonElement).disabled = true;
        btnSave.innerHTML = `<span class="material-icons-round animate-spin text-sm">refresh</span> Saving...`;
    }

    try {
        const id = (document.getElementById('product_id') as HTMLInputElement).value;
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
        const inventory_count = parseInt((document.getElementById('inventory_count') as HTMLInputElement).value);
        const category_id = (document.getElementById('category_id') as HTMLSelectElement).value || undefined;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value as any;
        const theme_color = (document.getElementById('theme_color') as HTMLSelectElement).value as any;

        const newImageUrls: string[] = [];

        // Upload New Images
        for (const file of selectedImageFiles) {
            try {
                const url = await StorageService.uploadImage(file);
                newImageUrls.push(url);
            } catch (error) {
                console.error("Upload failed for file", file.name, error);
                alert(`Failed to upload image ${file.name}.`);
                // Continue with other files or abort? Let's abort to be safe
                throw error;
            }
        }

        // Combine existing + new
        const allImages = [...existingImages, ...newImageUrls];

        const productData: Partial<Product> = {
            name,
            slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            price,
            inventory_count,
            category_id,
            description,
            images: allImages,
            status,
            theme_color
        };

        if (id) {
            await ProductService.updateProduct(id, productData);
        } else {
            await ProductService.createProduct(productData);
        }
        closeModal();
        await loadProducts();

    } catch (err: any) {
        console.error('Failed to save', err);
        alert('Failed to save product: ' + (err.message || 'Unknown error'));
    } finally {
        // Re-enable button
        if (btnSave) {
            (btnSave as HTMLButtonElement).disabled = false;
            btnSave.innerHTML = originalBtnText;
        }
    }
}
