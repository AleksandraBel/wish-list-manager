import { useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const WishList = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const wishesRef = user
    ? collection(db, "wishlists", user.uid, "wishes")
    : null;
  const q = wishesRef ? query(wishesRef, orderBy("createdAt", "desc")) : null;
  const [wishesSnapshot, loading, error] = useCollection(q);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !wishesRef) return;

    await addDoc(wishesRef, {
      title,
      description,
      isCompleted: false,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Твій Wish List</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Назва бажання"
          className="w-full px-4 py-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опис (необов'язково)"
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Додати бажання
        </button>
      </form>

      <div>
        {loading && <p>Завантаження...</p>}
        {error && <p>Помилка: {error.message}</p>}
        {wishesSnapshot && (
          <div className="space-y-4">
            {wishesSnapshot.docs.map((doc) => {
              const wish = doc.data();
              return (
                <div key={doc.id} className="p-4 border rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold">{wish.title}</h2>
                  <p className="text-gray-600">{wish.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishList;
