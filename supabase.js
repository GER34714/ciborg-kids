// js/supabase.js - SECCIÓN ADMIN CORREGIDA
export const AdminAPI = {
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

    // CORREGIDO: is_blocked en lugar de blocked
    async blockUser(userId, isBlocked = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_blocked: isBlocked })  // ← CAMBIADO
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error bloqueando usuario:', error);
            throw error;
        }
    },

    async setAdmin(userId, isAdmin = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_admin: isAdmin })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error asignando admin:', error);
            throw error;
        }
    },

    async setPremium(userId, isPremium = true) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_premium: isPremium })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error asignando premium:', error);
            throw error;
        }
    },

    async deleteUser(userId) {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            throw error;
        }
    }
};
