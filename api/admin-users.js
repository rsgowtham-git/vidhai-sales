// Vercel Serverless Function: /api/admin-users
// Manages user CRUD operations using Supabase service role key.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars in Vercel.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wyuzksjbbgwvzxzmhpge.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_RM7S8mojamK2fMIkIQHs1w_abG8cZSu';

function getServiceClient() {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

function getAnonClient() {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Verify the calling user is an admin
async function verifyAdmin(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    const anonClient = getAnonClient();

    const { data: { user }, error } = await anonClient.auth.getUser(token);
    if (error || !user) {
        return { error: 'Invalid or expired token', status: 401 };
    }

    // Check admin role in user_profiles
    const serviceClient = getServiceClient();
    const { data: profile, error: profileError } = await serviceClient
        .from('user_profiles')
        .select('role, allowed_access')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return { error: 'Admin access required', status: 403 };
    }

    return { user, profile };
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Verify admin
        const auth = await verifyAdmin(req.headers.authorization);
        if (auth.error) {
            return res.status(auth.status).json({ error: auth.error });
        }

        const serviceClient = getServiceClient();

        // ========== GET: List all users with profiles ==========
        if (req.method === 'GET') {
            const { data: { users }, error } = await serviceClient.auth.admin.listUsers();
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            // Get all profiles
            const { data: profiles } = await serviceClient
                .from('user_profiles')
                .select('*');

            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.id] = p; });

            const enrichedUsers = (users || []).map(u => ({
                id: u.id,
                email: u.email,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at,
                profile: profileMap[u.id] || null
            }));

            return res.status(200).json({ users: enrichedUsers });
        }

        // ========== POST: Create user or reset password ==========
        if (req.method === 'POST') {
            const { action, email, password, userId } = req.body || {};

            if (action === 'reset-password') {
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }

                const { error } = await serviceClient.auth.admin.generateLink({
                    type: 'recovery',
                    email: email
                });

                if (error) {
                    return res.status(500).json({ error: error.message });
                }

                return res.status(200).json({ success: true, message: 'Password reset initiated' });
            }

            if (action === 'create-user') {
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                if (password.length < 6) {
                    return res.status(400).json({ error: 'Password must be at least 6 characters' });
                }

                const { data, error } = await serviceClient.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true
                });

                if (error) {
                    return res.status(400).json({ error: error.message });
                }

                // Create profile entry
                if (data.user) {
                    await serviceClient.from('user_profiles').upsert({
                        id: data.user.id,
                        email: email,
                        role: 'user',
                        allowed_access: true
                    });
                }

                return res.status(201).json({ success: true, user: { id: data.user.id, email } });
            }

            return res.status(400).json({ error: 'Invalid action. Use "create-user" or "reset-password".' });
        }

        // ========== PATCH: Update user profile (toggle access, change role) ==========
        if (req.method === 'PATCH') {
            const { userId, allowed_access, role } = req.body || {};

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const updates = {};
            if (typeof allowed_access === 'boolean') updates.allowed_access = allowed_access;
            if (role) updates.role = role;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No updates provided' });
            }

            const { error } = await serviceClient
                .from('user_profiles')
                .update(updates)
                .eq('id', userId);

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true });
        }

        // ========== DELETE: Delete user ==========
        if (req.method === 'DELETE') {
            const { userId } = req.body || {};

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            // Delete profile first
            await serviceClient
                .from('user_profiles')
                .delete()
                .eq('id', userId);

            // Delete from auth
            const { error } = await serviceClient.auth.admin.deleteUser(userId);

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (err) {
        console.error('Admin API error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
};
