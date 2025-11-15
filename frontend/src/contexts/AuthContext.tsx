import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { createUser } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, userData?: {
    firstName: string;
    lastName?: string;
    username: string;
    age: number;
    gender: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function signup(email: string, password: string, userData?: {
    firstName: string;
    lastName?: string;
    username: string;
    age: number;
    gender: string;
  }) {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with provided data
      await createUser(userCredential.user.uid, {
        email: userCredential.user.email || email,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        username: userData?.username || '',
        age: userData?.age || 0,
        gender: userData?.gender || '',
        chronotype: '',
        motivationType: '',
        dailyTimeAvailable: 0,
        peakEnergyTime: '',
        churnRisks: [],
        persona: null,
        championArchetype: '',
        championCustomization: {},
        level: 1,
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (err: any) {
      let errorMessage = 'Failed to create account';
      
      // Firebase specific error handling
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Signup error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function login(email: string, password: string) {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      let errorMessage = 'Failed to sign in';
      
      // Firebase specific error handling
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Login error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function loginWithGoogle() {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists, if not create user document
      const { getUser } = await import('@/lib/api');
      const existingUser = await getUser(userCredential.user.uid);
      
      if (!existingUser.success) {
        await createUser(userCredential.user.uid, {
          email: userCredential.user.email || '',
          firstName: userCredential.user.displayName?.split(' ')[0] || '',
          chronotype: '',
          motivationType: '',
          dailyTimeAvailable: 0,
          peakEnergyTime: '',
          churnRisks: [],
          persona: null,
          championArchetype: '',
          championCustomization: {},
          level: 1,
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          onboardingCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true };
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Google';
      
      // Firebase specific error handling
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one popup request at a time.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in method.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Google login error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function logout() {
    try {
      setError(null);
      await signOut(auth);
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function resetPassword(email: string) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  function clearError() {
    setError(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
