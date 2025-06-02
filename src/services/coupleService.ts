import {
  db,
  MOCK_DATA,
  createCollectionService,
  userService,
} from "./firebaseService"; // Assuming db and MOCK_DATA are exported or accessible
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Couple, User } from "../types"; // Import Couple and User types

// Collection name
const COUPLES_COLLECTION = "couples";

// Use the generic service for basic CRUD if needed, or write custom functions
// const genericCoupleService = createCollectionService<Couple>(COUPLES_COLLECTION);

export const coupleService = {
  /**
   * Creates a new couple document in Firestore and updates both users' documents with the coupleId.
   * @param userId1 UID of the first user.
   * @param userId2 UID of the second user.
   * @returns The ID of the newly created couple document.
   * @throws Will throw an error if couple creation or user updates fail.
   */
  createCoupleAndLinkUsers: async (
    userId1: string,
    userId2: string,
  ): Promise<string> => {
    if (MOCK_DATA) {
      console.log(`Mock: Creating couple for users ${userId1} and ${userId2}`);
      const mockCoupleId = `mock_couple_${Date.now()}`;
      // In a real mock, you'd update mock user objects too
      // MOCK_USERS[userId1].coupleId = mockCoupleId;
      // MOCK_USERS[userId2].coupleId = mockCoupleId;
      return mockCoupleId;
    }

    try {
      // 1. Create the couple document
      const coupleDocRef = await addDoc(collection(db, COUPLES_COLLECTION), {
        members: [userId1, userId2],
        createdAt: serverTimestamp(),
      });
      const coupleId = coupleDocRef.id;

      // 2. Update both user documents with the new coupleId
      // It's crucial these updates succeed. Consider Firestore batch writes for atomicity.
      await userService.updateUserDocument(userId1, { coupleId });
      await userService.updateUserDocument(userId2, { coupleId });

      // TODO: Consider using a Firestore batched write for creating the couple
      // and updating both users atomically to prevent partial states.
      // For example:
      // const batch = writeBatch(db);
      // const newCoupleRef = doc(collection(db, COUPLES_COLLECTION));
      // batch.set(newCoupleRef, { members: [userId1, userId2], createdAt: serverTimestamp() });
      // const user1Ref = doc(db, 'users', userId1);
      // batch.update(user1Ref, { coupleId: newCoupleRef.id });
      // const user2Ref = doc(db, 'users', userId2);
      // batch.update(user2Ref, { coupleId: newCoupleRef.id });
      // await batch.commit();
      // return newCoupleRef.id;

      console.log(
        `Couple created with ID: ${coupleId} for users ${userId1}, ${userId2}`,
      );
      return coupleId;
    } catch (error) {
      console.error("Error creating couple and linking users:", error);
      // Potentially add cleanup logic here if one part fails (e.g., if couple doc is created but user update fails)
      throw new Error("Failed to create couple and link users.");
    }
  },

  /**
   * Retrieves a couple document by its ID.
   * @param coupleId The ID of the couple to retrieve.
   * @returns The Couple object or null if not found.
   */
  getCoupleById: async (coupleId: string): Promise<Couple | null> => {
    if (MOCK_DATA) {
      console.log(`Mock: Getting couple by ID ${coupleId}`);
      // In a real mock, you'd have a mockCouples store
      return {
        id: coupleId,
        members: ["mock_user1", "mock_user2"],
        createdAt: new Date().toISOString(),
      };
    }

    const coupleDocRef = doc(db, COUPLES_COLLECTION, coupleId);
    const docSnap = await getDoc(coupleDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Couple;
    } else {
      console.log(`No couple found with ID: ${coupleId}`);
      return null;
    }
  },

  /**
   * Finds a couple by one of its member's user IDs.
   * @param userId The UID of a user in the couple.
   * @returns The Couple object or null if not found.
   */
  findCoupleByMemberId: async (userId: string): Promise<Couple | null> => {
    if (MOCK_DATA) {
      console.log(`Mock: Finding couple by member ID ${userId}`);
      // This mock is simplistic. A real mock would search a mockCouples array.
      if (userId === "mock_user_in_couple") {
        return {
          id: "mock_couple_for_user",
          members: [userId, "other_mock_user"],
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }

    const q = query(
      collection(db, COUPLES_COLLECTION),
      where("members", "array-contains", userId),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming a user can only be part of one couple at a time
      const coupleDoc = querySnapshot.docs[0];
      return { id: coupleDoc.id, ...coupleDoc.data() } as Couple;
    } else {
      console.log(`No couple found containing user ID: ${userId}`);
      return null;
    }
  },

  // Add more couple-specific functions as needed, e.g.:
  // - updateCoupleSettings(coupleId: string, settings: Partial<CoupleSharedSettings>)
  // - (Potentially) functions to handle invites if we build that system
};

// Example of how to update firebaseService.ts if db and MOCK_DATA are not directly exported:
// You might need to pass db and MOCK_DATA into coupleService functions or instantiate it differently
// if firebaseService.ts doesn't export them. For now, assuming they are accessible.
// If firebaseService.ts is structured with named exports like:
// export const db = getFirestore(app);
// export const MOCK_DATA = !process.env.REACT_APP_FIREBASE_API_KEY;
// Then the import './firebaseService' should work for db and MOCK_DATA.
// If not, you may need to adjust how these are accessed, or refactor firebaseService to export them.

// For createCollectionService, it's already exported, so that's fine.
// userService is also exported.
