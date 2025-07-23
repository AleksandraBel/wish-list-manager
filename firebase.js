import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeKVxQRGH8r0A3NXXZs_HbDmRmx5A2wXc",
  authDomain: "wish-list-manager-48bd9.firebaseapp.com",
  projectId: "wish-list-manager-48bd9",
  storageBucket: "wish-list-manager-48bd9.firebasestorage.app",
  messagingSenderId: "652135832669",
  appId: "1:652135832669:web:d5876daa7b83029e5401b4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
