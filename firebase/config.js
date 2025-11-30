import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, } from 'firebase/auth';
import service from './service.json'

const app = initializeApp(service);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
