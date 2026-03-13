// Supabase Configuration
const SUPABASE_URL = 'https://wyuzksjbbgwvzxzmhpge.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RM7S8mojamK2fMIkIQHs1w_abG8cZSu';

// Initialize Supabase client
// Note: The CDN creates a global `var supabase` — we must NOT redeclare it with let/const.
// Instead we use `supabaseClient` internally and also reassign the global `supabase` to the client.
try {
    const _sb = window.supabase;
    if (_sb && _sb.createClient) {
        supabase = _sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
    },

    async getCurrentUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async getUserProfile() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return profile;
    },

    async isAdmin() {
        if (!supabase) return false;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        return profile?.role === 'admin';
    },

    async requireAuth() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    async requireAdmin() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return false;
        }
        const admin = await this.isAdmin();
        if (!admin) {
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    },

    async getDashboardStats() {
        if (!supabase) return { totalDecks: 0, recentDecks: 0, topIndustries: [] };
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { totalDecks: 0, recentDecks: 0, topIndustries: [] };

        // Total outreach playbooks
        const { data: allOutreach } = await supabase
            .from('generated_outreach')
            .select('id, icp_criteria, created_at')
            .eq('user_id', user.id);

        const total = allOutreach?.length || 0;

        // This week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = (allOutreach || []).filter(d => new Date(d.created_at) > weekAgo).length;

        // Top industries
        const industries = {};
        (allOutreach || []).forEach(d => {
            const ind = d.icp_criteria?.industryPersona || 'Unknown';
            industries[ind] = (industries[ind] || 0) + 1;
        });
        const topIndustries = Object.entries(industries)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        return { totalDecks: total, recentDecks: recent, topIndustries };
    },

    async getDeckHistory() {
        if (!supabase) return [];
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data } = await supabase
            .from('generated_outreach')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return data || [];
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

// Check auth on page load — only for non-admin pages (admin has its own guard)
function checkAuth() {
    guardAuth();
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

// Utility: Populate nav with user info
async function initNav() {
    const userEl = document.getElementById('navUserEmail');
    const adminLink = document.getElementById('navAdminLink');

    if (userEl) {
        const user = await window.appFunctions.getCurrentUser();
        if (user) {
            userEl.textContent = user.email;
        }
    }

    if (adminLink) {
        const isAdmin = await window.appFunctions.isAdmin();
        if (isAdmin) {
            adminLink.style.display = '';
        }
    }
}
