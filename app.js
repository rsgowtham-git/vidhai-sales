// Supabase Configuration
// Will be replaced with actual credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helper
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('index')) {
        window.location.href = 'login.html';
        return;
    }
    
    if (user) {
        // Check whitelist
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('allowed_access')
            .eq('id', user.id)
            .single();
        
        if (!profile?.allowed_access && !window.location.pathname.includes('login')) {
            alert('Access not authorized. Contact administrator.');
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }
    }
}

// Initialize auth check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
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