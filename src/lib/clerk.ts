import { Clerk } from '@clerk/clerk-js';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    console.error('Missing Clerk Publishable Key - Auth will not work');
}

let clerkInstance;
try {
    if (clerkPubKey) {
        clerkInstance = new Clerk(clerkPubKey);
    }
} catch (e) {
    console.error('Failed to initialize Clerk:', e);
}

export const clerk = clerkInstance || {
    load: async () => { },
    openSignIn: () => console.warn('Clerk not initialized'),
    openUserProfile: () => console.warn('Clerk not initialized'),
    client: {
        signIn: { create: async () => ({ status: 'failed' }) },
        signUp: { create: async () => ({ status: 'failed' }) }
    },
    setActive: async () => { },
    user: null
} as any;
