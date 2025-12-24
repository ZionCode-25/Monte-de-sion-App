import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { AppRole, User as AppUser } from '../../types';

interface AuthContextType {
    session: Session | null;
    user: AppUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // 2. Escuchar cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser: User) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) throw error;

            if (data) {
                // Mapear perfil de base de datos a tipo AppUser de la aplicación
                const appUser: AppUser = {
                    id: data.id,
                    name: data.name || 'Usuario',
                    email: data.email || authUser.email || '',
                    role: (data.role as AppRole) || 'USER',
                    avatar: data.avatar_url || 'https://i.pravatar.cc/150', // Fallback avatar
                    bio: data.bio || '',
                    joinedDate: data.joined_date,
                    registeredMinistries: [],
                    avatar_url: data.avatar_url,
                    joined_date: data.joined_date
                };
                setUser(appUser);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (updates: Partial<AppUser>) => {
        if (!session?.user) return;
        try {
            const dbUpdates: any = {};

            // Handle Avatar Upload
            if (updates.avatar && updates.avatar.startsWith('data:')) {
                const res = await fetch(updates.avatar);
                const blob = await res.blob();
                const filename = `${session.user.id}/avatar_${Date.now()}.png`;

                const { error: upError } = await supabase.storage
                    .from('avatars')
                    .upload(filename, blob, { upsert: true });

                if (upError) throw upError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filename);

                dbUpdates.avatar_url = publicUrl;
                updates.avatar = publicUrl; // Update local state with URL
            } else if (updates.avatar !== undefined) {
                dbUpdates.avatar_url = updates.avatar;
            }

            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.bio !== undefined) dbUpdates.bio = updates.bio;

            if (Object.keys(dbUpdates).length > 0) {
                const { error } = await supabase
                    .from('profiles')
                    .update(dbUpdates)
                    .eq('id', session.user.id);
                if (error) throw error;
            }

            setUser(prev => prev ? { ...prev, ...updates } : null);
        } catch (e) {
            console.error("Error updating profile", e);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
