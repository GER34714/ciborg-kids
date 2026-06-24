// js/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from './config.js';

// ============================================
// CLIENTE SUPABASE
// ============================================
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// ============================================
// AUTENTICACIÓN
// ============================================
export const AuthAPI = {
    // Obtener sesión actual (sin lanzar error si no existe)
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            // Si no hay sesión, solo retornar null
            if (error.message?.includes('Auth session missing') || 
                error.message?.includes('Invalid Refresh Token') ||
                error.message?.includes('Auth session missing!')) {
                return null;
            }
            console.error('Error obteniendo sesión:', error);
            return null;
        }
    },

    // Login con Google
    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error en login con Google:', error);
            throw error;
        }
    },

    // Login con Email (para admin)
    async signInWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error en login con email:', error);
            throw error;
        }
    },

    // Registrar con Email
    async signUpWithEmail(email, password, username) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });
            if (error) throw error;
            
            // Crear perfil automáticamente
            if (data.user) {
                await this.createProfile(data.user.id, username, email);
            }
            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    // Crear perfil
    async createProfile(userId, username, email) {
        try {
            // Verificar si es admin
            const isAdmin = CONFIG.ADMIN_EMAILS?.includes(email) || false;
            
            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    username: username || 'Explorador',
                    email: email,
                    avatar: '🦊',
                    stars: 0,
                    coins: 50,
                    level: 1,
                    is_admin: isAdmin,
                    is_premium: false,
                    is_blocked: false,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error creando perfil:', error);
            throw error;
        }
    },

    // Cerrar sesión
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            throw error;
        }
    },

    // Obtener usuario actual
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            // Si no hay sesión, retornar null sin error
            if (error.message?.includes('Auth session missing') || 
                error.message?.includes('Invalid Refresh Token')) {
                return null;
            }
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    },

    // Obtener perfil del usuario
    async getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
    },

    // Actualizar perfil
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    },

    // Verificar si usuario está bloqueado
    async isUserBlocked(userId) {
        try {
            const profile = await this.getProfile(userId);
            return profile?.is_blocked || false;
        } catch (error) {
            return false;
        }
    }
};

// ============================================
// PROGRESO
// ============================================
export const ProgressAPI = {
    // Completar un item
    async completeItem(userId, category, itemId) {
        try {
            const { data, error } = await supabase
                .from('progress')
                .upsert({
                    user_id: userId,
                    category,
                    item_id: itemId,
                    completed: true,
                    completed_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            
            // Actualizar estrellas (cada 3 completados = 1 estrella)
            await this.updateStars(userId);
            
            return data;
        } catch (error) {
            console.error('Error completando item:', error);
            throw error;
        }
    },

    // Actualizar estrellas del usuario
    async updateStars(userId) {
        try {
            const { data: progress, count } = await supabase
                .from('progress')
                .select('*', { count: 'exact', head: false })
                .eq('user_id', userId)
                .eq('completed', true);
            
            const totalCompleted = progress?.length || 0;
            const newStars = Math.floor(totalCompleted / 3);
            const newLevel = Math.min(10, Math.floor(newStars / 10) + 1);
            
            await supabase
                .from('profiles')
                .update({ 
                    stars: newStars,
                    level: newLevel
                })
                .eq('id', userId);
            
            return { stars: newStars, level: newLevel };
        } catch (error) {
            console.error('Error actualizando estrellas:', error);
            throw error;
        }
    },

    // Obtener progreso del usuario
    async getUserProgress(userId) {
        try {
            const { data, error } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo progreso:', error);
            return [];
        }
    },

    // Obtener progreso por categoría
    async getCategoryProgress(userId, category) {
        try {
            const { data, error } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', userId)
                .eq('category', category);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo progreso por categoría:', error);
            return [];
        }
    }
};

// ============================================
// STICKERS
// ============================================
export const StickerAPI = {
    // Coleccionar sticker
    async collectSticker(userId, stickerId) {
        try {
            const { data, error } = await supabase
                .from('sticker_collection')
                .insert({ 
                    user_id: userId, 
                    sticker_id: stickerId,
                    collected_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error coleccionando sticker:', error);
            throw error;
        }
    },

    // Obtener stickers del usuario
    async getUserStickers(userId) {
        try {
            const { data, error } = await supabase
                .from('sticker_collection')
                .select('sticker_id, collected_at')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo stickers:', error);
            return [];
        }
    }
};

// ============================================
// FAVORITOS (Dibujos)
// ============================================
export const FavoritesAPI = {
    // Agregar favorito
    async addFavorite(userId, videoId) {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .insert({ 
                    user_id: userId, 
                    video_id: videoId,
                    added_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error agregando favorito:', error);
            throw error;
        }
    },

    // Eliminar favorito
    async removeFavorite(userId, videoId) {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('video_id', videoId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando favorito:', error);
            throw error;
        }
    },

    // Obtener favoritos del usuario
    async getUserFavorites(userId) {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('video_id, added_at')
                .eq('user_id', userId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo favoritos:', error);
            return [];
        }
    }
};

// ============================================
// ADMIN API
// ============================================
export const AdminAPI = {
    // Obtener todos los usuarios
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    },

    // Bloquear usuario
    async blockUser(userId) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: true })
                .eq('id', userId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error bloqueando usuario:', error);
            throw error;
        }
    },

    // Desbloquear usuario
    async unblockUser(userId) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: false })
                .eq('id', userId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error desbloqueando usuario:', error);
            throw error;
        }
    },

    // Convertir a Premium
    async setPremium(userId, isPremium) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_premium: isPremium })
                .eq('id', userId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error actualizando premium:', error);
            throw error;
        }
    },

    // Obtener estadísticas
    async getStats() {
        try {
            const [users, premium, blocked, progress] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
                supabase.from('progress').select('*', { count: 'exact', head: true })
            ]);
            
            return {
                totalUsers: users.count || 0,
                premiumUsers: premium.count || 0,
                blockedUsers: blocked.count || 0,
                totalProgress: progress.count || 0,
                conversionRate: users.count > 0 ? Math.round((premium.count / users.count) * 100) : 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalUsers: 0,
                premiumUsers: 0,
                blockedUsers: 0,
                totalProgress: 0,
                conversionRate: 0
            };
        }
    }
};

export default supabase;
