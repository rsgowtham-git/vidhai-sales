// Supabase Configuration
// Will be replaced with actual credentials
const SUPABASE_URL = 'https://wyuzksjbbgwvzxzmhpge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RM7S8mojamK2fMIkIQHs1w_abG8cZSu';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth functions exposed globally
window.appFunctions = {
    // Sign in with email/password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    // Sign up with email/password
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    },

    // Check if user is authenticated and authorized
    async checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('allowed_access')
            .eq('id', user.id)
            .single();

        return profile?.allowed_access === true;
    }
};

// Auth guard — redirect to login if not on login/index page
async function guardAuth() {
    const path = window.location.pathname;
    const isPublicPage = path.includes('login') || path.includes('index') || path === '/';

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isPublicPage) {
        window.location.href = 'login.html';
        return;
    }

    if (user && !isPublicPage) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('allowed_access')
            .eq('id', user.id)
            .single();

        if (!profile?.allowed_access) {
            alert('Access not authorized. Contact administrator.');
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }
    }
}

// Initialize auth guard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', guardAuth);
} else {
    guardAuth();
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Utility: Download as text file
function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Utility: Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    });
}

// Utility: Show toast notification
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}