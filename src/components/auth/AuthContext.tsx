
import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track ongoing profile fetch to prevent race conditions
  const currentFetchRef = useRef<{ userId: string; promise: Promise<any> } | null>(null);
  const profileCacheRef = useRef<{ [userId: string]: Profile | null }>({});
  
  // Add re-render detection
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[AUTH RENDER #${renderCount.current}] AuthProvider render - user=${user?.id}, profile=${!!profile}, loading=${loading}`);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const timestamp = Date.now();
    console.log(`[${timestamp}] Fetching profile for user:`, userId);
    
    // Check cache first
    if (profileCacheRef.current[userId]) {
      console.log(`[${timestamp}] Profile found in cache:`, profileCacheRef.current[userId]);
      return profileCacheRef.current[userId];
    }
    
    // If there's already a fetch in progress for this user, return that promise
    if (currentFetchRef.current?.userId === userId) {
      console.log(`[${timestamp}] Profile fetch already in progress, waiting...`);
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
          console.error(`[${timestamp}] Database error fetching profile:`, error);
          // Don't cache database errors, allow retry
          return null;
        }

        console.log(`[${timestamp}] Profile fetched successfully:`, data);
        // Cache the result
        profileCacheRef.current[userId] = data;
        return data;
      } catch (error) {
        console.error(`[${timestamp}] Network error in fetchProfile:`, error);
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
    console.log('AuthProvider effect mounting...');

    // Set up auth state listener - NO async operations here to prevent deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const timestamp = Date.now();
        console.log(`[${timestamp}] Auth state changed:`, event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to defer Supabase calls and prevent deadlocks
          setTimeout(async () => {
            if (mounted && session?.user) {
              console.log(`[${timestamp}] Fetching profile after auth change...`);
              const profileData = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(profileData);
                console.log(`[${timestamp}] Profile set after auth change:`, profileData);
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
          console.log(`[${timestamp}] Auth loading set to false (${event})`);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) setLoading(false);
          return;
        }

        console.log('Initial session check:', session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('User found in session, fetching profile...');
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            console.log('Profile set in initialization:', profileData);
          }
        } else {
          console.log('No user in session');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('Auth initialization complete');
        }
      }
    };

    // Add a timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 8000); // Reduced timeout

    initializeAuth();

    return () => {
      console.log('AuthProvider effect unmounting...');
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      // Clear any ongoing fetches
      currentFetchRef.current = null;
    };
  }, []); // Removed dependency on debouncedFetchProfile to prevent re-renders

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
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
    console.log('Signing out user');
    setProfile(null);
    await supabase.auth.signOut();
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }), [user, session, profile, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
