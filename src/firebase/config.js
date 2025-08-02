// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO2LJSS0K6cHM1LQ_32wnCNQ_fDp9f9gU",
  authDomain: "auramark-577e1.firebaseapp.com",
  projectId: "auramark-577e1",
  storageBucket: "auramark-577e1.firebasestorage.app",
  messagingSenderId: "611136704891",
  appId: "1:611136704891:web:c06b9155f762afe4926dde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;