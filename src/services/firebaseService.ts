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
import { User } from "../types";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Authentication Service
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    return signInWithPopup(auth, googleProvider);
  },

  // Send password reset email
  resetPassword: async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  },

  // Sign out
  signOut: async () => {
    return signOut(auth);
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

// Generic CRUD service for Firestore collections
export const createCollectionService = <
  T extends { id?: string; coupleId?: string; userId?: string },
>(
  collectionName: string,
) => {
  return {
    // Add a document to the collection
    add: async (data: Omit<T, "id">) => {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },

    // Get a document by ID
    get: async (id: string) => {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }

      return null;
    },

    // Get all documents for a specific couple
    getAllByCouple: async (coupleId: string) => {
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

    // Get all documents for a specific couple and user
    getAllByCoupleAndUser: async (coupleId: string, userId: string) => {
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
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return id;
    },

    // Delete a document
    delete: async (id: string) => {
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
export const userService = {
  // Get a user document by UID
  get: async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data.email || "",
        displayName: data.displayName,
        photoURL: data.photoURL,
        coupleId: data.coupleId,
      } as User;
    }
    return null;
  },

  // Create a new user document in Firestore
  createUserDocument: async (
    uid: string,
    email: string | null,
    displayName?: string | null,
    photoURL?: string | null,
  ): Promise<void> => {
    const userDocRef = doc(db, "users", uid);
    try {
      await setDoc(userDocRef, {
        email: email || "",
        displayName: displayName || "",
        photoURL: photoURL || "",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user document: ", error);
      throw error;
    }
  },

  // Update an existing user document in Firestore
  updateUserDocument: async (
    uid: string,
    data: Partial<Omit<User, "uid" | "email" | "isAnonymous">>,
  ): Promise<void> => {
    const userDocRef = doc(db, "users", uid);
    try {
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user document: ", error);
      throw error;
    }
  },
};

// Storage Service
export const storageService = {
  // Upload a file and get the download URL
  uploadFile: async (path: string, file: File): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Get a file's download URL
  getFileUrl: async (path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  },
};
