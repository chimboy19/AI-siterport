import { collection, query, where, orderBy, getDocs, getDoc, updateDoc, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Report } from '../types';

export const reportsAPI = {
  getUserReports: async (userId: string): Promise<Report[]> => {
    const q = query(
      collection(db, "reports"),
      where("ownerId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report);
  },

  getProjectReports: async (projectId: string, userId: string): Promise<Report[]> => {
    const q = query(
      collection(db, "reports"),
      where("projectId", "==", projectId),
      where("ownerId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report);
  },

  createReport: async (data: Omit<Report, "id" | "createdAt">): Promise<string> => {
    const docRef = await addDoc(collection(db, "reports"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  getReportById: async (reportId: string): Promise<Report | null> => {
    const reportRef = doc(db, "reports", reportId);
    const snap = await getDoc(reportRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Report;
  },

  updateReport: async (reportId: string, data: Partial<Report>) => {
    await updateDoc(doc(db, "reports", reportId), data);
  },

  deleteReport: async (reportId: string) => {
    await deleteDoc(doc(db, "reports", reportId));
  }
};
