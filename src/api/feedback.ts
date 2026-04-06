import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface FeedbackData {
  userId: string;
  helpful: string;
  features: string;
  customTool: string;
  willingToPay: string;
  lang: string;
}

export const feedbackAPI = {
  submitFeedback: async (data: FeedbackData) => {
    const docRef = await addDoc(collection(db, "feedback"), {
      ...data,
      submittedAt: serverTimestamp()
    });
    return docRef.id;
  }
};
