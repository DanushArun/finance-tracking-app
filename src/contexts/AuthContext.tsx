import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, userService } from "../services/firebaseService";
import { User, AuthState } from "../types";

// Create auth context
const AuthContext = createContext<
  | {
      currentUser: User | null;
      isAuthenticated: boolean;
      isLoading: boolean;
      error: string | null;
      signIn: (email: string, password: string) => Promise<void>;
      signUp: (email: string, password: string) => Promise<void>;
      signInWithGoogle: () => Promise<void>;
      signOut: () => Promise<void>;
      resetPassword: (email: string) => Promise<void>;
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

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let firestoreProfile: User | null = null;
        try {
          firestoreProfile = await userService.get(firebaseUser.uid);

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
            // For the current session, construct a User object based on firebaseUser data
            // as the freshly created Firestore doc won't have coupleId yet.
            firestoreProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              isAnonymous: firebaseUser.isAnonymous, // Include isAnonymous
              coupleId: undefined, // coupleId is not yet known
            };
          }

          // Combine Firebase auth data with Firestore profile data for the context state
          const currentUserState: User = {
            uid: firebaseUser.uid, // Always from auth
            email: firebaseUser.email || firestoreProfile?.email || "", // Prefer auth email
            displayName:
              firestoreProfile?.displayName ??
              firebaseUser.displayName ??
              undefined,
            photoURL:
              firestoreProfile?.photoURL ?? firebaseUser.photoURL ?? undefined,
            isAnonymous: firebaseUser.isAnonymous, // from firebaseUser (auth source of truth)
            coupleId: firestoreProfile?.coupleId, // from Firestore profile
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
              isAnonymous: firebaseUser.isAnonymous, // Include isAnonymous
              coupleId: undefined, // coupleId is unknown
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
  async function signUp(email: string, password: string) {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await authService.signUp(email, password);
      if (userCredential?.user) {
        // Create Firestore document. onAuthStateChanged will then pick it up and sync fully.
        await userService.createUserDocument(
          userCredential.user.uid,
          userCredential.user.email,
          userCredential.user.displayName,
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
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userCredential = await authService.signInWithGoogle();
      if (userCredential?.user) {
        const existingFirestoreProfile = await userService.get(
          userCredential.user.uid,
        );
        if (!existingFirestoreProfile) {
          // If no Firestore profile, create one.
          await userService.createUserDocument(
            userCredential.user.uid,
            userCredential.user.email,
            userCredential.user.displayName,
            userCredential.user.photoURL,
          );
        } else {
          // If Firestore profile exists, check if displayName or photoURL from Google has changed.
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
            // If changed, update the Firestore document.
            await userService.updateUserDocument(userCredential.user.uid, {
              displayName: googleDisplayName ?? undefined,
              photoURL: googlePhotoURL ?? undefined,
            });
          }
        }
      }
      // onAuthStateChanged will handle setting the comprehensive user state after any updates.
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
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.resetPassword(email);
      // No user state change here, just clear loading.
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
