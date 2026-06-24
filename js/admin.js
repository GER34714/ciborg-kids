// js/admin.js
import { supabase } from './supabase.js';
import { COLORS_DATA } from './colors.js';
import { VOWELS_DATA } from './vowels.js';
import { ANIMALS_DATA } from './animals.js';
import { STICKERS_DATA } from './stickers.js';
import { STORIES_DATA } from './stories.js';
import { READING_DATA } from './reading.js';
import { GEOMETRY_DATA } from './geometry.js';
import { CARTOONS_DATA } from './cartoons.js';

// ============================================
// ADMIN FUNCTIONS
// ============================================
export async function checkAdminAccess(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data?.is_admin || false;
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
}

export async function getAdminStats() {
    try {
        const [users, progress, stickers] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('progress').select('*', { count: 'exact', head: true }),
            supabase.from('sticker_collection').select('*', { count: 'exact', head: true })
        ]);
        
        return {
            totalUsers: users.count || 0,
            totalProgress: progress.count || 0,
            totalStickers: stickers.count || 0
        };
    } catch (error) {
        console.error('Error getting admin stats:', error);
        return { totalUsers: 0, totalProgress: 0, totalStickers: 0 };
    }
}

export async function getAllUsers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

export async function blockUser(userId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_blocked: true })
            .eq('id', userId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error blocking user:', error);
        return false;
    }
}

export async function unblockUser(userId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_blocked: false })
            .eq('id', userId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error unblocking user:', error);
        return false;
    }
}

export async function setPremium(userId, isPremium) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_premium: isPremium })
            .eq('id', userId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error setting premium:', error);
        return false;
    }
}

// ============================================
// ADMIN DATA MANAGEMENT
// ============================================
export function getAdminData() {
    return {
        colors: COLORS_DATA,
        vowels: VOWELS_DATA,
        animals: ANIMALS_DATA,
        stickers: STICKERS_DATA,
        stories: STORIES_DATA,
        reading: READING_DATA,
        geometry: GEOMETRY_DATA,
        cartoons: CARTOONS_DATA
    };
}

// ============================================
// EXPORTAR PARA ADMIN.HTML
// ============================================
export { supabase };
