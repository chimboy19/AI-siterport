import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserUsage {
  count: number;
  limit?: number;
  lastUsedAt: any;
}

export const usageAPI = {
  getUsage: async (userId: string): Promise<UserUsage> => {
    const docRef = doc(db, "userUsage", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserUsage;
    }
    return { count: 0, lastUsedAt: null };
  },
  
  incrementUsage: async (userId: string) => {
    const docRef = doc(db, "userUsage", userId);
    await setDoc(docRef, {
      count: increment(1),
      lastUsedAt: serverTimestamp()
    }, { merge: true });
  }
};
