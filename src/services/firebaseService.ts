import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateId } from "../utils/helpers";
import { User } from "../types";

// Firebase configuration
// In a real app, these would be in environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    "mock-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "mock-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Check if we're in mock mode
export const MOCK_DATA = !process.env.REACT_APP_FIREBASE_API_KEY;

// Authentication Service
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return {
        user: {
          uid: "mock-uid",
          email,
          displayName: "Mock User",
          photoURL: null,
        } as FirebaseUser, // Cast to FirebaseUser to ensure type compatibility
      };
    }

    return signInWithEmailAndPassword(auth, email, password);
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return {
        user: {
          uid: "mock-uid",
          email,
          displayName: "New Mock User",
          photoURL: null,
        } as FirebaseUser,
      };
    }

    return createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return {
        user: {
          uid: "mock-google-uid",
          email: "mock.google.user@example.com",
          displayName: "Mock Google User",
          photoURL: null,
        } as FirebaseUser,
      };
    }

    return signInWithPopup(auth, googleProvider);
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return Promise.resolve();
    }

    return sendPasswordResetEmail(auth, email);
  },

  // Sign out
  signOut: async () => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return Promise.resolve();
    }

    return signOut(auth);
  },

  // Get current user
  getCurrentUser: () => {
    if (MOCK_DATA) {
      // Mock authentication for development
      return {
        uid: "mock-current-uid",
        email: "current.mock@example.com",
        displayName: "Current Mock User",
        photoURL: null,
      } as FirebaseUser;
    }

    return auth.currentUser;
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    if (MOCK_DATA) {
      // Mock authentication for development
      callback({
        uid: "mock-authstate-uid",
        email: "authstate.mock@example.com",
        displayName: "AuthState Mock User",
        photoURL: null,
      } as FirebaseUser);
      return () => {};
    }

    return onAuthStateChanged(auth, callback);
  },
};

// Generic CRUD service for Firestore collections
// T is expected to have coupleId if an operation requires it (e.g. getAllByCouple)
// For add, the caller must ensure data: Omit<T, 'id'> includes coupleId if T requires it.
export const createCollectionService = <
  T extends { id?: string; coupleId?: string; userId?: string },
>(
  collectionName: string,
) => {
  // Mock data storage
  const mockData: Record<string, T> = {};

  return {
    // Add a document to the collection
    // The caller is responsible for ensuring data includes coupleId if T requires it.
    add: async (data: Omit<T, "id">) => {
      if (MOCK_DATA) {
        const id = generateId();
        // Ensure createdAt is part of the mock item, and cast to T carefully
        const mockItem = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        } as unknown as T;
        mockData[id] = mockItem;
        return id;
      }

      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    },

    // Get a document by ID
    get: async (id: string) => {
      if (MOCK_DATA) {
        // Mock database for development
        return mockData[id] || null;
      }

      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }

      return null;
    },

    // Get all documents for a specific couple
    getAllByCouple: async (coupleId: string) => {
      if (MOCK_DATA) {
        // Mock database for development
        return Object.values(mockData)
          .filter((item) => item.coupleId === coupleId) // Filter by coupleId
          .sort((a, b) => {
            const dateA = (a as any).createdAt
              ? new Date((a as any).createdAt).getTime()
              : 0;
            const dateB = (b as any).createdAt
              ? new Date((b as any).createdAt).getTime()
              : 0;
            return dateB - dateA; // Sort by descending date
          });
      }

      const q = query(
        collection(db, collectionName),
        where("coupleId", "==", coupleId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as T,
      );
    },

    // Get all documents for a specific couple and user (for individual items within a couple context)
    // This is particularly useful for transactions that are individual but belong to a couple.
    getAllByCoupleAndUser: async (coupleId: string, userId: string) => {
      if (MOCK_DATA) {
        return Object.values(mockData)
          .filter(
            (item) => item.coupleId === coupleId && item.userId === userId,
          )
          .sort((a, b) => {
            const dateA = (a as any).createdAt
              ? new Date((a as any).createdAt).getTime()
              : 0;
            const dateB = (b as any).createdAt
              ? new Date((b as any).createdAt).getTime()
              : 0;
            return dateB - dateA;
          });
      }

      const q = query(
        collection(db, collectionName),
        where("coupleId", "==", coupleId),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as T,
      );
    },

    // Update a document
    update: async (id: string, data: Partial<T>) => {
      if (MOCK_DATA) {
        // Mock database for development
        mockData[id] = {
          ...mockData[id],
          ...data,
          updatedAt: new Date().toISOString(),
        } as T;
        return id;
      }

      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return id;
    },

    // Delete a document
    delete: async (id: string) => {
      if (MOCK_DATA) {
        // Mock database for development
        delete mockData[id];
        return id;
      }

      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);

      return id;
    },
  };
};

// Collection services
export const transactionService = createCollectionService("transactions");
export const categoryService = createCollectionService("categories");
export const budgetService = createCollectionService("budgets");
export const goalService = createCollectionService("goals");

// User Service (for Firestore user data, not auth)
const usersCollectionRef = collection(db, "users");

export const userService = {
  // Get a user document by UID
  get: async (uid: string): Promise<User | null> => {
    if (MOCK_DATA) {
      console.warn(
        "userService.get mock needs implementation for comprehensive user data.",
      );
      // Basic mock, assuming user might exist with minimal data
      return { uid, email: "mock-user@example.com", displayName: "Mock User" };
    }
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // Ensure the returned object matches the User type structure
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data.email || "",
        displayName: data.displayName,
        photoURL: data.photoURL,
        coupleId: data.coupleId,
        // isAnonymous is part of FirebaseUser, not typically stored in Firestore user doc unless needed
      } as User;
    }
    return null;
  },

  // Create a new user document in Firestore (typically on sign up)
  createUserDocument: async (
    uid: string,
    email: string | null,
    displayName?: string | null,
    photoURL?: string | null,
  ): Promise<void> => {
    if (MOCK_DATA) {
      console.log("Mock userService.createUserDocument called for uid:", uid);
      // In a real mock, you'd store this:
      // mockUsers[uid] = { uid, email, displayName, photoURL, createdAt: new Date().toISOString() };
      return;
    }
    const userDocRef = doc(db, "users", uid);
    try {
      await setDoc(userDocRef, {
        email: email || "",
        displayName: displayName || "",
        photoURL: photoURL || "",
        createdAt: serverTimestamp(),
        // coupleId will be added later when they join/create a couple
      });
    } catch (error) {
      console.error("Error creating user document: ", error);
      throw error; // Re-throw to be handled by caller
    }
  },

  // Update an existing user document in Firestore
  updateUserDocument: async (
    uid: string,
    data: Partial<Omit<User, "uid" | "email" | "isAnonymous">>,
  ): Promise<void> => {
    if (MOCK_DATA) {
      console.log(
        "Mock userService.updateUserDocument called for uid:",
        uid,
        data,
      );
      // In a real mock, you'd update the mock users object:
      // mockUsers[uid] = { ...mockUsers[uid], ...data, updatedAt: new Date().toISOString() };
      return;
    }
    const userDocRef = doc(db, "users", uid);
    try {
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user document: ", error);
      throw error; // Re-throw to be handled by caller
    }
  },
};

// Storage Service
export const storageService = {
  // Upload a file and get the download URL
  uploadFile: async (path: string, file: File): Promise<string> => {
    if (MOCK_DATA) {
      // Mock storage for development
      return URL.createObjectURL(file);
    }

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Get a file's download URL
  getFileUrl: async (path: string): Promise<string> => {
    if (MOCK_DATA) {
      // Mock storage for development
      return path;
    }

    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  },
};
