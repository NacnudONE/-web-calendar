import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDmlvGsBXvI1YawW9mknX3gFp091WGySjQ',
  authDomain: 'web-calendar-af33c.firebaseapp.com',
  projectId: 'web-calendar-af33c',
  storageBucket: 'web-calendar-af33c.firebasestorage.app',
  messagingSenderId: '24517293402',
  appId: '1:24517293402:web:ddafe3bd324f4ed716af63',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
