import { BlogService, BlogPost } from '../../services/blog.service';

export async function renderBlog(container: HTMLElement) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
            <button id="btn-add-post" class="bg-primary hover:bg-primary_dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                 <span class="material-icons-round text-xl">add</span> New Post
            </button>
        </div>

        <div class="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="blog-table-body" class="bg-surface-light dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-700">
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading posts...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="blog-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 id="blog-modal-title" class="text-xl font-bold">New Post</h2>
                    <button id="btn-close-blog-modal" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6">
                    <form id="blog-form" class="space-y-4">
                        <input type="hidden" id="post_id">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="post_title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Excerpt</label>
                            <textarea id="post_excerpt" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Content</label>
                            <textarea id="post_content" rows="12" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-mono"></textarea>
                        </div>

                        <div class="flex items-center">
                            <input type="checkbox" id="post_published" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="post_published" class="ml-2 block text-sm text-gray-900">Publish immediately</label>
                        </div>

                        <div class="flex justify-end pt-4 gap-2">
                            <button type="button" id="btn-cancel-blog" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Post</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Listeners
    document.getElementById('btn-add-post')?.addEventListener('click', () => openModal());
    document.getElementById('btn-close-blog-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-blog')?.addEventListener('click', closeModal);

    document.getElementById('blog-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSavePost();
    });

    await loadPosts();
}

let currentPosts: BlogPost[] = [];

async function loadPosts() {
    const tbody = document.getElementById('blog-table-body');
    if (!tbody) return;

    try {
        currentPosts = await BlogService.getPosts();

        if (currentPosts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No posts found.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentPosts.map(post => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${post.title}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">${post.slug}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}">
                        ${post.published ? 'Published' : 'Draft'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${new Date(post.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary hover:text-primary_dark mr-4 transition-colors" onclick="window.editPost('${post.id}')">Edit</button>
                    <button class="text-red-500 hover:text-red-700 transition-colors" onclick="window.deletePost('${post.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        (window as any).editPost = (id: string) => {
            const post = currentPosts.find(p => p.id === id);
            if (post) openModal(post);
        };

        (window as any).deletePost = async (id: string) => {
            if (confirm('Delete this post?')) {
                try {
                    await BlogService.deletePost(id);
                    await loadPosts();
                } catch (e) {
                    console.error(e);
                    alert('Failed to delete post');
                }
            }
        };

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error loading posts.</td></tr>`;
    }
}

function openModal(post?: BlogPost) {
    const modal = document.getElementById('blog-modal');
    const title = document.getElementById('blog-modal-title');
    const form = document.getElementById('blog-form') as HTMLFormElement;

    if (!modal || !title || !form) return;

    form.reset();
    (document.getElementById('post_id') as HTMLInputElement).value = '';

    if (post) {
        title.textContent = 'Edit Post';
        (document.getElementById('post_id') as HTMLInputElement).value = post.id;
        (document.getElementById('post_title') as HTMLInputElement).value = post.title;
        (document.getElementById('post_excerpt') as HTMLTextAreaElement).value = post.excerpt || '';
        (document.getElementById('post_content') as HTMLTextAreaElement).value = post.content || '';
        (document.getElementById('post_published') as HTMLInputElement).checked = post.published;
    } else {
        title.textContent = 'New Post';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('blog-modal')?.classList.add('hidden');
}

async function handleSavePost() {
    const id = (document.getElementById('post_id') as HTMLInputElement).value;
    const title = (document.getElementById('post_title') as HTMLInputElement).value;
    const excerpt = (document.getElementById('post_excerpt') as HTMLTextAreaElement).value;
    const content = (document.getElementById('post_content') as HTMLTextAreaElement).value;
    const published = (document.getElementById('post_published') as HTMLInputElement).checked;

    const data: Partial<BlogPost> = {
        title,
        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        excerpt,
        content,
        published,
        published_at: published ? new Date().toISOString() : undefined
    };

    try {
        if (id) {
            await BlogService.updatePost(id, data);
        } else {
            await BlogService.createPost(data);
        }
        closeModal();
        await loadPosts();
    } catch (e) {
        console.error(e);
        alert('Failed to save post');
    }
}
