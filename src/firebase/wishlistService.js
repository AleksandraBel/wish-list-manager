import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const wishesRef = collection(db, "wishes");

export const addWish = async (wishData) => {
  return await addDoc(wishesRef, wishData);
};

export const getUserWishes = async (userId) => {
  const q = query(wishesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteWish = async (wishId) => {
  return await deleteDoc(doc(db, "wishes", wishId));
};

export const updateWish = async (wishId, updatedData) => {
  return await updateDoc(doc(db, "wishes", wishId), updatedData);
};
