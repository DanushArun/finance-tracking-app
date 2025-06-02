import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, userService } from "../services/firebaseService";
import { coupleService } from "../services/coupleService";
import { User, AuthState } from "../types";

// Check if demo mode is enabled
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Create auth context
const AuthContext = createContext<
  | {
      currentUser: User | null;
      isAuthenticated: boolean;
      isLoading: boolean;
      error: string | null;
      signIn: (email: string, password: string) => Promise<void>;
      signUp: (email: string, password: string, displayName?: string) => Promise<void>;
      signInWithGoogle: () => Promise<void>;
      signOut: () => Promise<void>;
      resetPassword: (email: string) => Promise<void>;
      updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
      clearError: () => void;
    }
  | undefined
>(undefined);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for testing
const demoUser: User = {
  uid: "demo-user-123",
  email: "demo@example.com",
  displayName: "Demo User",
  photoURL: undefined,
  isAnonymous: false,
  coupleId: "demo-couple-123",
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize demo mode or Firebase auth
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, automatically sign in with demo user
      console.log("Demo mode enabled - using demo user");
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Normal Firebase auth flow
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get or create user profile in Firestore
          let firestoreProfile = await userService.get(firebaseUser.uid);

          if (!firestoreProfile) {
            console.log(
              `No Firestore document for ${firebaseUser.uid}, creating...`,
            );
            // Create the document in Firestore
            await userService.createUserDocument(
              firebaseUser.uid,
              firebaseUser.email,
              firebaseUser.displayName,
              firebaseUser.photoURL,
            );
            
            // Create a basic profile for immediate use
            firestoreProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              isAnonymous: firebaseUser.isAnonymous,
              coupleId: undefined, // Will be set when user joins/creates a couple
            };
          }

          // Combine Firebase auth data with Firestore profile data
          const currentUserState: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || firestoreProfile?.email || "",
            displayName:
              firestoreProfile?.displayName ??
              firebaseUser.displayName ??
              undefined,
            photoURL:
              firestoreProfile?.photoURL ?? firebaseUser.photoURL ?? undefined,
            isAnonymous: firebaseUser.isAnonymous,
            coupleId: firestoreProfile?.coupleId,
          };

          setAuthState({
            user: currentUserState,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error(
            "Error in onAuthStateChanged with Firestore sync:",
            error,
          );
          // Fallback: use only Firebase auth data if Firestore operations fail
          setAuthState({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              isAnonymous: firebaseUser.isAnonymous,
              coupleId: undefined,
            },
            isAuthenticated: true,
            isLoading: false,
            error: "Failed to sync user profile. Some features may be limited.",
          });
        }
      } else {
        // No Firebase user, so clear auth state
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      // In demo mode, just simulate successful login
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.signIn(email, password);
      // onAuthStateChanged handles setting the user state
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign in",
      }));
      throw error;
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, displayName?: string) {
    if (isDemoMode) {
      // In demo mode, just simulate successful signup
      setAuthState({
        user: { ...demoUser, email, displayName: displayName || demoUser.displayName },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await authService.signUp(email, password);
      if (userCredential?.user) {
        // Create Firestore document with display name
        await userService.createUserDocument(
          userCredential.user.uid,
          userCredential.user.email,
          displayName || userCredential.user.displayName,
          userCredential.user.photoURL,
        );
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign up",
      }));
      throw error;
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    if (isDemoMode) {
      // In demo mode, just simulate successful Google login
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await authService.signInWithGoogle();
      if (userCredential?.user) {
        const existingFirestoreProfile = await userService.get(
          userCredential.user.uid,
        );
        if (!existingFirestoreProfile) {
          // If no Firestore profile, create one
          await userService.createUserDocument(
            userCredential.user.uid,
            userCredential.user.email,
            userCredential.user.displayName,
            userCredential.user.photoURL,
          );
        } else {
          // If Firestore profile exists, check if displayName or photoURL from Google has changed
          const { displayName: googleDisplayName, photoURL: googlePhotoURL } =
            userCredential.user;
          const {
            displayName: firestoreDisplayName,
            photoURL: firestorePhotoURL,
          } = existingFirestoreProfile;

          if (
            googleDisplayName !== firestoreDisplayName ||
            googlePhotoURL !== firestorePhotoURL
          ) {
            // If changed, update the Firestore document
            await userService.updateUserDocument(userCredential.user.uid, {
              displayName: googleDisplayName ?? undefined,
              photoURL: googlePhotoURL ?? undefined,
            });
          }
        }
      }
      // onAuthStateChanged will handle setting the comprehensive user state
    } catch (error) {
      console.error("Google sign in error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Google",
      }));
      throw error;
    }
  }

  // Sign out
  async function signOut() {
    if (isDemoMode) {
      // In demo mode, just clear the auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.signOut();
      // onAuthStateChanged handles setting the user state to null
    } catch (error) {
      console.error("Sign out error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to sign out",
      }));
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    if (isDemoMode) {
      // In demo mode, just simulate success
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.resetPassword(email);
      setAuthState((prev) => ({ ...prev, isLoading: false, error: null }));
    } catch (error) {
      console.error("Password reset error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to reset password",
      }));
      throw error;
    }
  }

  // Update user profile
  async function updateProfile(data: { displayName?: string; photoURL?: string }) {
    if (!authState.user) {
      throw new Error("No user logged in");
    }

    if (isDemoMode) {
      // In demo mode, just update local state
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
      }));
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await userService.updateUserDocument(authState.user.uid, data);
      
      // Update local state immediately
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Profile update error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      }));
      throw error;
    }
  }

  // Clear error
  function clearError() {
    setAuthState((prev) => ({ ...prev, error: null }));
  }

  const value = {
    currentUser: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
