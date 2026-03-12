// Supabase Configuration
const SUPABASE_URL = 'https://wyuzksjbbgwvzxzmhpge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RM7S8mojamK2fMIkIQHs1w_abG8cZSu';

// Initialize Supabase client (with guard against CDN load failure)
let supabase;
try {
    const sb = window.supabase;
    if (sb && sb.createClient) {
        supabase = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase library not loaded');
    }
} catch (e) {
    console.error('Supabase init error:', e);
}

// Auth functions exposed globally
window.appFunctions = {
    async signIn(email, password) {
        if (!supabase) throw new Error('Authentication service unavailable. Please refresh the page.');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signUp(email, password) {
        if (!supabase) throw new Error('Authentication service unavailable. Please refresh the page.');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        if (supabase) await supabase.auth.signOut();
        window.location.href = 'login.html';
    },

    async checkAuth() {
        if (!supabase) return false;
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

// Auth guard — redirect to login if not on a public page
async function guardAuth() {
    if (!supabase) return; // Skip guard if Supabase failed to load

    const path = window.location.pathname;
    const isPublicPage = path.endsWith('/') || path.endsWith('index.html') || path.includes('login');

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
