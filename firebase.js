import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "твій_API_ключ",
  authDomain: "твій_проект.firebaseapp.com",
  projectId: "твій_проект",
  storageBucket: "твій_проект.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
