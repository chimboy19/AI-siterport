// import { Project } from './../types';
import {collection,doc,getDoc,getDocs,addDoc,query ,where , orderBy,serverTimestamp, deleteDoc, updateDoc} from 'firebase/firestore'
import { db } from '../firebase'
import type { Project } from '../types'



export const projectsAPI = {
  createProject: async (userId: string, name: string, description: string) => {
    const docRef = await addDoc(collection(db, "projects"), {
      ownerId: userId,
      name,
      description,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },
  getProjectById: async (projectId: string): Promise<Project | null> => {
    const projectRef = doc(db, "projects", projectId);
    const snap = await getDoc(projectRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Project;
  },

  getProjectByUser: async (userId: string): Promise<Project[]> => {
    const q = query(
      collection(db, "projects"),
      where("ownerId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Project,
    );
  },

  deleteProjectByUser: async (projectId: string, userId: string) => {
    if (!userId) throw new Error("User not authenticated");
    const reportsQuery = query(
      collection(db, "reports"),
      where("projectId", "==", projectId),
      where("ownerId", "==", userId) 
    );

    const reportsSnapshot = await getDocs(reportsQuery);
    const deleteReports = reportsSnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deleteReports);

    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
  },

  updateProject: async (
    projectId: string,data: { name: string; description: string },) => {
    await updateDoc(doc(db, "projects", projectId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};



