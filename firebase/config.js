import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const localModules = import.meta.glob('./service.json', { eager: true });
const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG
  ? JSON.parse(atob(import.meta.env.VITE_FIREBASE_CONFIG))
  : localModules['./service.json']?.default;

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
