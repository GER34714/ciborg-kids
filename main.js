// main.js - CORREGIDO
import CONFIG from './config.js';
import { initAuth, getUser, getProfile, isAuthenticated, isPremium, isAdmin, loginWithGoogle, logout, onAuthChange, updateProfile } from './auth.js';
import { supabase } from './supabase.js';

// Importar solo lo que existe
import { ProgressAPI, StickerAPI, AdminAPI } from './supabase.js';

// Si necesitas FavoritesAPI, créalo localmente
// o impleméntalo después
