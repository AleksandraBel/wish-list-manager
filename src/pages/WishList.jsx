import { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// A smaller component for the draggable wish item
const WishItem = ({ wish, id, onDragStop, onToggleComplete, onDelete, activeWishId, setActiveWishId }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={{ x: wish.x || 0, y: wish.y || 0 }}
      onStop={(e, data) => onDragStop(id, data)}
      onStart={() => setActiveWishId(id)}
    >
      <div
        ref={nodeRef}
        style={{ zIndex: activeWishId === id ? 10 : 1 }}
        className={`absolute cursor-move p-4 border rounded-lg shadow-xl w-64 handle ${
          wish.isCompleted ? "bg-green-100 opacity-70" : "bg-white"
        }`}
      >
        {wish.imageUrl && (
          <img
            src={wish.imageUrl}
            alt={wish.title}
            className="w-full h-32 object-cover rounded-md mb-2 pointer-events-none" // Prevent image drag interference
          />
        )}
        <div className="flex-grow">
          <h2
            className={`text-lg font-semibold ${
              wish.isCompleted ? "line-through" : ""
            }`}
          >
            {wish.title}
          </h2>
          <p
            className={`text-sm text-gray-600 ${
              wish.isCompleted ? "line-through" : ""
            }`}
          >
            {wish.description}
          </p>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => onToggleComplete(id, wish.isCompleted)}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              {wish.isCompleted ? "Повернути" : "Виконано"}
            </button>
            <button
              onClick={() => onDelete(id)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};


const WishList = () => {
  const [user] = useAuthState(auth);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeWishId, setActiveWishId] = useState(null);

  const wishesRef = user
    ? collection(db, "wishlists", user.uid, "wishes")
    : null;
  const q = wishesRef ? query(wishesRef) : null;
  const [wishesSnapshot, loading, error] = useCollection(q);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewUrl(null);
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
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !wishesRef || isUploading) return;

    const imageUrl = image ? await uploadImage() : null;
    if (image && !imageUrl) {
      alert("Не вдалося завантажити зображення. Спробуйте ще раз.");
      return;
    }

    await addDoc(wishesRef, {
      title,
      description,
      imageUrl,
      isCompleted: false,
      createdAt: serverTimestamp(),
      x: 10,
      y: 10,
    });

    setTitle("");
    setDescription("");
    setImage(null);
    setPreviewUrl(null);
    if (document.getElementById("image-input")) {
      document.getElementById("image-input").value = "";
    }
  };

  const handleDragStop = async (wishId, data) => {
    const wishDocRef = doc(db, "wishlists", user.uid, "wishes", wishId);
    await updateDoc(wishDocRef, { x: data.x, y: data.y });
    setActiveWishId(null);
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
    <div className="flex flex-col h-screen">
      <div className="p-6 max-w-xl mx-auto w-full">
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
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Image preview"
                className="w-full max-h-60 object-contain rounded-md border p-1"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {isUploading ? "Завантаження..." : "Додати бажання"}
          </button>
        </form>
      </div>

      <div className="flex-grow w-full h-full relative overflow-hidden border-t">
        {loading && <p className="text-center p-4">Завантаження дошки...</p>}
        {error && <p className="text-center p-4">Помилка: {error.message}</p>}
        {wishesSnapshot &&
          wishesSnapshot.docs.map((docSnap) => {
            const wish = docSnap.data();
            const id = docSnap.id;
            return (
              <WishItem
                key={id}
                wish={wish}
                id={id}
                onDragStop={handleDragStop}
                onToggleComplete={toggleComplete}
                onDelete={handleDelete}
                activeWishId={activeWishId}
                setActiveWishId={setActiveWishId}
              />
            );
          })}
      </div>
    </div>
  );
};

export default WishList;
