import { getDoc ,doc,setDoc,serverTimestamp} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';



export const authAPI = {
    SyncGoogleUser: async (user:User) => {
        const userRef = doc(db, 'users', user.uid);
        const usersnap = await getDoc(userRef)
        
        if (!usersnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt:serverTimestamp()

            })
            
        }
        
    }

    
}