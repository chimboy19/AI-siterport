import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserSettings } from '../types';

export const settingsAPI = {
  getSettings: async (userId: string): Promise<UserSettings | null> => {
    const ref = doc(db, 'userSettings', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as UserSettings;
  },

  saveSettings: async (userId: string, data: Partial<Omit<UserSettings, 'uid'>>) => {
    const ref = doc(db, 'userSettings', userId);
    await setDoc(ref, {
      ...data,
      uid: userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
};
