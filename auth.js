// En auth.js, donde creas el perfil:
const newProfile = {
    id: user.id,
    email: user.email,
    username: user.email?.split('@')[0] || 'Explorador',
    avatar: '🦊',
    coins: 50,
    stars: 0,
    level: 1,
    is_premium: false,
    is_admin: false,
    is_blocked: false  // ← CAMBIADO: antes era 'blocked'
};
