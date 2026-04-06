import { initializeApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
// import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, getDocFromServer, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


export const app = initializeApp(firebaseConfig);
export const db =getFirestore(app,firebaseConfig.firestoreDatabaseId)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export const goggleProvider = new GoogleAuthProvider()


export const signInWithGoogle = () => signInWithPopup(auth, goggleProvider)

export const Logout =() => signOut(auth)


