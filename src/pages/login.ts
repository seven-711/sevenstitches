import '../style.css';
import { AuthService } from '../services/auth.service';
import { Toast } from '../components/toast';

const toggleSignin = document.getElementById('toggle-signin');
const toggleSignup = document.getElementById('toggle-signup');
const activeBg = document.getElementById('active-bg');
const containerName = document.getElementById('container-name');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const submitBtn = document.getElementById('submit-btn');
const form = document.getElementById('auth-form') as HTMLFormElement;
const forgotPasswordLink = document.getElementById('forgot-password');

// Initialize Auth Service
AuthService.init().catch(console.error);

let isLogin = true;
let isVerifying = false;

function setLoginState() {
    isLogin = true;
    isVerifying = false;
    resetFormUI();

    if (activeBg) activeBg.style.left = '4px';
    if (toggleSignin) toggleSignin.classList.replace('text-text-muted', 'text-white');
    if (toggleSignup) toggleSignup.classList.replace('text-white', 'text-text-muted');

    if (containerName) containerName.classList.add('hidden');
    if (authTitle) authTitle.textContent = 'Welcome Back';
    if (authSubtitle) authSubtitle.textContent = 'Enter your details to access your account.';
    if (submitBtn) submitBtn.querySelector('span')!.textContent = 'Sign In';
    if (forgotPasswordLink) forgotPasswordLink.classList.remove('hidden');
}

function setSignupState() {
    isLogin = false;
    isVerifying = false;
    resetFormUI();

    if (activeBg) activeBg.style.left = '50%';
    if (toggleSignin) toggleSignin.classList.replace('text-white', 'text-text-muted');
    if (toggleSignup) toggleSignup.classList.replace('text-text-muted', 'text-white');

    if (containerName) containerName.classList.remove('hidden');
    if (authTitle) authTitle.textContent = 'Create Account';
    if (authSubtitle) authSubtitle.textContent = 'Join us to track orders and save favorites.';
    if (submitBtn) submitBtn.querySelector('span')!.textContent = 'Sign Up';
    if (forgotPasswordLink) forgotPasswordLink.classList.add('hidden');
}

function resetFormUI() {
    // Restore original inputs if they were hidden for verification
    const emailGroup = document.getElementById('email')?.closest('.space-y-2');
    const passwordGroup = document.getElementById('password')?.closest('.space-y-2');
    const verifyGroup = document.getElementById('container-verify');

    if (emailGroup) emailGroup.classList.remove('hidden');
    if (passwordGroup) passwordGroup.classList.remove('hidden');
    if (verifyGroup) verifyGroup.remove();

    // Ensure name field correct visibility based on isLogin
    if (isLogin) {
        containerName?.classList.add('hidden');
    } else {
        containerName?.classList.remove('hidden');
    }
}

function showVerificationUI() {
    isVerifying = true;

    // update titles
    if (authTitle) authTitle.textContent = 'Verify Email';
    if (authSubtitle) authSubtitle.textContent = 'Enter the code sent to your email.';
    if (submitBtn) submitBtn.querySelector('span')!.textContent = 'Verify';

    // Hide other fields
    containerName?.classList.add('hidden');
    document.getElementById('email')?.closest('.space-y-2')?.classList.add('hidden');
    document.getElementById('password')?.closest('.space-y-2')?.classList.add('hidden');
    forgotPasswordLink?.classList.add('hidden');

    // Add verification input if not exists
    if (!document.getElementById('verificationCode')) {
        const verifyContainer = document.createElement('div');
        verifyContainer.id = 'container-verify';
        verifyContainer.className = 'space-y-2';
        verifyContainer.innerHTML = `
            <label class="block text-sm font-medium ml-1" for="verificationCode">Verification Code</label>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-3.5 text-text-muted">key</span>
                <input class="w-full pl-12 pr-4 h-12 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-muted/50" 
                id="verificationCode" type="text" placeholder="123456" required>
            </div>
        `;
        // Insert before submit button
        submitBtn?.parentElement?.insertBefore(verifyContainer, submitBtn);
    }
}

toggleSignin?.addEventListener('click', setLoginState);
toggleSignup?.addEventListener('click', setSignupState);

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loader state
    const originalBtnText = submitBtn?.innerHTML || '';
    if (submitBtn) {
        (submitBtn as HTMLButtonElement).disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...`;
    }

    try {
        if (isVerifying) {
            const code = (document.getElementById('verificationCode') as HTMLInputElement).value;
            await AuthService.verifyEmail(code);
            Toast.show('Email verified! Account created.', 'success');
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                window.location.href = redirect || '/';
            }, 1500);
            return;
        }

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const fullName = (document.getElementById('fullName') as HTMLInputElement).value;

        if (!email || !password) {
            Toast.show('Please fill in all required fields', 'error');
            throw new Error('Form invalid');
        }

        if (isLogin) {
            await AuthService.signIn(email, password);
            Toast.show('Welcome back!', 'success');
        } else {
            await AuthService.signUp(email, password, fullName);
            Toast.show('Account created successfully!', 'success');
        }

        // Wait a bit then redirect
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            window.location.href = redirect || '/';
        }, 1500);

    } catch (error: any) {
        if (error.message === 'VERIFICATION_REQUIRED') {
            showVerificationUI();
            Toast.show('Verification code sent to your email', 'info');
        } else if (error.message !== 'Form invalid') {
            Toast.show(error.message || 'Authentication failed', 'error');
        }

        if (submitBtn) {
            (submitBtn as HTMLButtonElement).disabled = false;
            submitBtn.innerHTML = originalBtnText;
            if (isVerifying) submitBtn.querySelector('span')!.textContent = 'Verify';
        }
    }
});
