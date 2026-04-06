
import { authAPI } from './../api/auth';
import type { User } from 'firebase/auth';
import { signInWithGoogle } from './../firebase';
import { useMutation } from "@tanstack/react-query";
import {  toast} from 'react-hot-toast'


export const useGoggleSignIn = (lang:string) => {
    return useMutation<User,Error>({
        mutationFn: async() => {
            const result = await signInWithGoogle();

            await authAPI.SyncGoogleUser(result.user)
            
            return result.user

        },
        onSuccess: (user) => {
            toast.success(
                lang === 'jp' ? `ログイン成功: ${user.email}` :`signin successful${user.email} `
            ) 
            
        },
        

        onError: (error) => {
             toast.error(
                 lang === 'jp' ? `ログインに失敗しました: ${error.message}` : `Sign in failed: ${error.message}`
            
      );
        }
    })
}