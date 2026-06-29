import { create } from 'zustand'
import { GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../shared/firebase'
import { useCalendarStore } from '../../../entities/calendar'
import type { GoogleUser } from './types'

interface AuthState {
  user: GoogleUser | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  _init: () => () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  login: async () => {
    if ('electron' in window) {
      // Desktop: відкриваємо авторизацію у системному браузері
      const { idToken, accessToken } = await (window as any).electron.googleSignIn()
      const credential = GoogleAuthProvider.credential(idToken, accessToken)
      await signInWithCredential(auth, credential)
    } else {
      // Web: стандартний Google popup
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    }
  },

  logout: async () => {
    await signOut(auth)
  },

  _init: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      try {
        if (firebaseUser) {
          useCalendarStore.getState().initializeForUser(firebaseUser.uid)
          set({
            user: {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName ?? 'User',
              email: firebaseUser.email ?? '',
              picture: firebaseUser.photoURL ?? '',
            },
            loading: false,
          })
        } else {
          useCalendarStore.getState().cleanup()
          set({ user: null, loading: false })
        }
      } catch (err) {
        console.error('Auth state error:', err)
        set({ loading: false })
      }
    })
    return unsubscribe
  },
}))
