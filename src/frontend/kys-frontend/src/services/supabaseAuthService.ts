import { supabase } from '../config/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

// Authentication için interface'ler
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
    department?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'quality' | 'production' | 'supplier' | 'viewer';
    department?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

class SupabaseAuthService {
    private listeners: Set<(state: AuthState) => void> = new Set();
    private currentState: AuthState = {
        user: null,
        profile: null,
        session: null,
        loading: true,
        error: null
    };

    constructor() {
        this.initialize();
    }

    // Auth servisini başlat
    private async initialize(): Promise<void> {
        try {
            // Mevcut session'ı kontrol et
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
                this.updateState({ loading: false, error: error.message });
                return;
            }

            if (session?.user) {
                await this.handleAuthChange('SIGNED_IN', session);
            } else {
                this.updateState({ loading: false });
            }

            // Auth state değişikliklerini dinle
            supabase.auth.onAuthStateChange(async (event, session) => {
                await this.handleAuthChange(event, session);
            });

        } catch (error: any) {
            console.error('Error initializing auth:', error);
            this.updateState({ loading: false, error: error.message });
        }
    }

    // Auth state değişikliklerini işle
    private async handleAuthChange(event: string, session: Session | null): Promise<void> {
        try {
            console.log('Auth event:', event, session?.user?.id);

            if (event === 'SIGNED_IN' && session?.user) {
                // Kullanıcı profil bilgilerini getir
                const profile = await this.getUserProfile(session.user.id);
                
                this.updateState({
                    user: session.user,
                    profile,
                    session,
                    loading: false,
                    error: null
                });
            } else if (event === 'SIGNED_OUT') {
                this.updateState({
                    user: null,
                    profile: null,
                    session: null,
                    loading: false,
                    error: null
                });
            } else {
                this.updateState({ loading: false });
            }
        } catch (error: any) {
            console.error('Error handling auth change:', error);
            this.updateState({ 
                loading: false, 
                error: error.message,
                user: null,
                profile: null,
                session: null
            });
        }
    }

    // State güncellemesi
    private updateState(updates: Partial<AuthState>): void {
        this.currentState = { ...this.currentState, ...updates };
        this.notifyListeners();
    }

    // Listener'ları bilgilendir
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.currentState);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    // Auth state değişikliklerini dinle
    subscribe(callback: (state: AuthState) => void): () => void {
        this.listeners.add(callback);
        
        // Mevcut state'i hemen gönder
        callback(this.currentState);
        
        // Unsubscribe fonksiyonu döndür
        return () => {
            this.listeners.delete(callback);
        };
    }

    // Mevcut state'i al
    getState(): AuthState {
        return { ...this.currentState };
    }

    // Giriş yap
    async signIn(credentials: LoginCredentials): Promise<{ user: User; session: Session }> {
        try {
            this.updateState({ loading: true, error: null });

            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });

            if (error) throw error;

            if (!data.user || !data.session) {
                throw new Error('Giriş işlemi başarısız');
            }

            return { user: data.user, session: data.session };
        } catch (error: any) {
            console.error('Sign in error:', error);
            this.updateState({ loading: false, error: error.message });
            throw error;
        }
    }

    // Kayıt ol
    async signUp(signUpData: SignUpData): Promise<{ user: User; session: Session | null }> {
        try {
            this.updateState({ loading: true, error: null });

            // Supabase Auth ile kayıt
            const { data, error } = await supabase.auth.signUp({
                email: signUpData.email,
                password: signUpData.password,
                options: {
                    data: {
                        name: signUpData.name,
                        role: signUpData.role || 'viewer',
                        department: signUpData.department
                    }
                }
            });

            if (error) throw error;

            if (!data.user) {
                throw new Error('Kayıt işlemi başarısız');
            }

            // Users tablosuna kayıt ekle
            if (data.user.id) {
                await this.createUserProfile({
                    id: data.user.id,
                    name: signUpData.name,
                    email: signUpData.email,
                    role: signUpData.role || 'viewer',
                    department: signUpData.department,
                    is_active: true
                });
            }

            return { user: data.user, session: data.session };
        } catch (error: any) {
            console.error('Sign up error:', error);
            this.updateState({ loading: false, error: error.message });
            throw error;
        }
    }

    // Çıkış yap
    async signOut(): Promise<void> {
        try {
            this.updateState({ loading: true, error: null });

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

        } catch (error: any) {
            console.error('Sign out error:', error);
            this.updateState({ loading: false, error: error.message });
            throw error;
        }
    }

    // Şifre sıfırlama
    async resetPassword(email: string): Promise<void> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    // Şifre güncelleme
    async updatePassword(newPassword: string): Promise<void> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    // Kullanıcı profili oluştur
    private async createUserProfile(profileData: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([profileData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    // Kullanıcı profili getir
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .eq('is_active', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Kullanıcı bulunamadı, users tablosuna oluştur
                    const authUser = this.currentState.user;
                    if (authUser) {
                        return await this.createUserProfile({
                            id: authUser.id,
                            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Kullanıcı',
                            email: authUser.email || '',
                            role: authUser.user_metadata?.role || 'viewer',
                            department: authUser.user_metadata?.department,
                            is_active: true
                        });
                    }
                }
                throw error;
            }

            return data;
        } catch (error: any) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Profil güncelle
    async updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
        try {
            const userId = this.currentState.user?.id;
            if (!userId) throw new Error('Kullanıcı girişi yapılmamış');

            // Supabase Auth metadata güncelle
            if (updates.name) {
                await supabase.auth.updateUser({
                    data: { name: updates.name }
                });
            }

            // Users tablosunu güncelle
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            // State'i güncelle
            this.updateState({
                profile: data
            });

            return data;
        } catch (error: any) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Session kontrolü
    async checkSession(): Promise<Session | null> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            return session;
        } catch (error: any) {
            console.error('Error checking session:', error);
            return null;
        }
    }

    // Access token al
    getAccessToken(): string | null {
        return this.currentState.session?.access_token || null;
    }

    // Kullanıcı yetkilerini kontrol et
    hasRole(roles: string | string[]): boolean {
        const userRole = this.currentState.profile?.role;
        if (!userRole) return false;

        if (typeof roles === 'string') {
            return userRole === roles;
        }

        return roles.includes(userRole);
    }

    // Admin kontrolü
    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    // Giriş durumu
    isAuthenticated(): boolean {
        return !!this.currentState.user && !!this.currentState.session;
    }

    // Kullanıcı aktif mi
    isActive(): boolean {
        return this.currentState.profile?.is_active === true;
    }

    // Email doğrulama durumu
    isEmailVerified(): boolean {
        return this.currentState.user?.email_confirmed_at != null;
    }
}

// Singleton instance
export const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;
