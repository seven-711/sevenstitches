import { clerk } from '../lib/clerk';


export class AuthService {
    private static initialized = false;

    static async init() {
        if (!this.initialized) {
            await clerk.load();
            this.initialized = true;
        }
    }

    static async signIn(email: string, password?: string) {
        await this.init();
        if (!password) throw new Error('Password required for login');
        if (!clerk.client) throw new Error('Clerk client not initialized');

        const signInAttempt = await clerk.client.signIn.create({
            identifier: email,
            password,
        });

        if (signInAttempt.status === 'complete') {
            await clerk.setActive({ session: signInAttempt.createdSessionId });
            return clerk.user;
        } else {
            console.error('SignIn status:', signInAttempt.status);
            throw new Error('Login requires further verification. Please check your email.');
        }
    }

    static async signUp(email: string, password?: string, fullName?: string) {
        await this.init();
        if (!password) throw new Error('Password required for signup');
        if (!clerk.client) throw new Error('Clerk client not initialized');

        const nameParts = (fullName || '').trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || undefined;

        try {
            const signUpAttempt = await clerk.client.signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });

            if (signUpAttempt.status === 'complete') {
                await clerk.setActive({ session: signUpAttempt.createdSessionId });
                return clerk.user;
            } else if (signUpAttempt.status === 'missing_requirements') {
                await signUpAttempt.prepareEmailAddressVerification({ strategy: 'email_code' });
                throw new Error('VERIFICATION_REQUIRED');
            } else {
                throw new Error('Signup failed: ' + signUpAttempt.status);
            }
        } catch (err: any) {
            if (err.errors && err.errors.length > 0) {
                throw new Error(err.errors[0].message);
            }
            throw err;
        }
    }

    static async verifyEmail(code: string) {
        await this.init();
        if (!clerk.client) throw new Error('Clerk client not initialized');
        const signUpAttempt = await clerk.client.signUp.attemptEmailAddressVerification({
            code,
        });

        if (signUpAttempt.status === 'complete') {
            await clerk.setActive({ session: signUpAttempt.createdSessionId });
            return clerk.user;
        } else {
            throw new Error('Verification failed.');
        }
    }

    static async getUser() {
        await this.init();
        if (clerk.user) {
            return clerk.user;
        }

        // Check for guest session
        const guest = localStorage.getItem('guest_user');
        if (guest) return JSON.parse(guest);

        return null;
    }

    static async loginAsGuest(email: string) {
        const user = { id: 'guest-' + Date.now(), email, firstName: 'Guest', lastName: '', imageUrl: '', primaryEmailAddress: { emailAddress: email } };
        localStorage.setItem('guest_user', JSON.stringify(user));
        return user;
    }

    static async logout() {
        await this.init();
        localStorage.removeItem('guest_user');
        return clerk.signOut();
    }

    static async isAdmin(): Promise<boolean> {
        await this.init();
        if (!clerk.user) return false;
        // Check publicMetadata for role
        const metadata = clerk.user.publicMetadata as { role?: string };
        return metadata.role === 'admin';
    }
}
