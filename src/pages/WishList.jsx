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
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const WishList = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const wishesRef = user
    ? collection(db, "wishlists", user.uid, "wishes")
    : null;
  const q = wishesRef ? query(wishesRef, orderBy("createdAt", "desc")) : null;
  const [wishesSnapshot, loading, error] = useCollection(q);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append("file", image);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      setIsUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !wishesRef || isUploading) return;

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        alert("Не вдалося завантажити зображення. Спробуйте ще раз.");
        return;
      }
    }

    await addDoc(wishesRef, {
      title,
      description,
      imageUrl,
      isCompleted: false,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    setImage(null);
    document.getElementById("image-input").value = ""; // Reset file input
  };

  const toggleComplete = async (wishId, currentStatus) => {
    const wishDocRef = doc(db, "wishlists", user.uid, "wishes", wishId);
    await updateDoc(wishDocRef, { isCompleted: !currentStatus });
  };

  const handleDelete = async (wishId) => {
    const wishDocRef = doc(db, "wishlists", user.uid, "wishes", wishId);
    await deleteDoc(wishDocRef);
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
        <input
          type="file"
          id="image-input"
          onChange={handleImageChange}
          className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={isUploading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300"
        >
          {isUploading ? "Завантаження..." : "Додати бажання"}
        </button>
      </form>

      <div>
        {loading && <p>Завантаження...</p>}
        {error && <p>Помилка: {error.message}</p>}
        {wishesSnapshot && (
          <div className="space-y-4">
            {wishesSnapshot.docs.map((doc) => {
              const wish = doc.data();
              const id = doc.id;
              return (
                <div
                  key={id}
                  className={`p-4 border rounded-lg shadow-sm transition flex flex-col sm:flex-row gap-4 ${
                    wish.isCompleted ? "bg-green-50 opacity-60" : "bg-white"
                  }`}
                >
                  {wish.imageUrl && (
                    <img
                      src={wish.imageUrl}
                      alt={wish.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-grow">
                    <h2
                      className={`text-xl font-semibold ${
                        wish.isCompleted ? "line-through" : ""
                      }`}
                    >
                      {wish.title}
                    </h2>
                    <p
                      className={`text-gray-600 ${
                        wish.isCompleted ? "line-through" : ""
                      }`}
                    >
                      {wish.description}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-4">
                      <button
                        onClick={() => toggleComplete(id, wish.isCompleted)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {wish.isCompleted ? "Повернути" : "Виконано"}
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
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
