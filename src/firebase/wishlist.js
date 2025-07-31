import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getUserWishes = async (uid) => {
  try {
    const wishesRef = collection(db, "wishlists", uid, "wishes");
    const snapshot = await getDocs(wishesRef);
    const wishes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return wishes;
  } catch (error) {
    console.error("Помилка при отриманні бажань:", error);
    return [];
  }
};
