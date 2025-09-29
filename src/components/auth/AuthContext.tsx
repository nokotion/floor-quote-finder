
import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useDevMode } from '@/contexts/DevModeContext';

interface Profile {
  id: string;
  retailer_id: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
  password_reset_required: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isRecoveringPassword: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDevMode, mockUser, mockProfile } = useDevMode();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  
  // Track ongoing profile fetch to prevent race conditions
  const currentFetchRef = useRef<{ userId: string; promise: Promise<any> } | null>(null);
  const profileCacheRef = useRef<{ [userId: string]: Profile | null }>({});

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    // Check cache first
    if (profileCacheRef.current[userId]) {
      return profileCacheRef.current[userId];
    }
    
    // If there's already a fetch in progress for this user, return that promise
    if (currentFetchRef.current?.userId === userId) {
      return currentFetchRef.current.promise;
    }
    
    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Database error fetching profile:', error);
          // Don't cache database errors, allow retry
          return null;
        }

        // Cache the result
        profileCacheRef.current[userId] = data;
        return data;
      } catch (error) {
        console.error('Network error in fetchProfile:', error);
        // Don't cache network errors, allow retry
        return null;
      } finally {
        // Clear the current fetch reference
        if (currentFetchRef.current?.userId === userId) {
          currentFetchRef.current = null;
        }
      }
    })();
    
    // Store the current fetch
    currentFetchRef.current = { userId, promise: fetchPromise };
    
    return fetchPromise;
  };


  const refreshProfile = async () => {
    if (user?.id) {
      // Clear cache to force fresh fetch
      delete profileCacheRef.current[user.id];
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Detect password recovery mode
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveringPassword(true);
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to defer Supabase calls and prevent deadlocks
          setTimeout(async () => {
            if (mounted && session?.user) {
              const profileData = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(profileData);
              }
            }
          }, 0);
        } else {
          setProfile(null);
          // Clear cache when user logs out
          profileCacheRef.current = {};
        }
        
        // Set loading to false for auth state changes (but not initial load)
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) setLoading(false);
          return;
        }
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add a timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      // Clear any ongoing fetches
      currentFetchRef.current = null;
    };
  }, []); // Removed dependency on debouncedFetchProfile to prevent re-renders

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  };

  const signOut = async () => {
    setProfile(null);
    setIsRecoveringPassword(false);
    await supabase.auth.signOut();
  };

  const clearPasswordRecovery = () => {
    setIsRecoveringPassword(false);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user: isDevMode ? mockUser : user,
    session: isDevMode ? ({ user: mockUser } as Session) : session,
    profile: isDevMode ? mockProfile : profile,
    loading: isDevMode ? false : loading,
    isRecoveringPassword: isDevMode ? false : isRecoveringPassword,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearPasswordRecovery
  }), [user, session, profile, loading, isRecoveringPassword, isDevMode, mockUser, mockProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
