import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { getUserWishes } from "../firebase/wishlist";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishes = async () => {
      if (!user) return;
      const data = await getUserWishes(user.uid);
      setWishes(data);
      setLoading(false);
    };

    fetchWishes();
  }, [user]);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Мій список бажань</h2>

      {wishes.length === 0 ? (
        <p>У вас ще немає бажань</p>
      ) : (
        <ul className="space-y-2">
          {wishes.map((wish) => (
            <li key={wish.id} className="bg-white p-3 rounded shadow">
              <h3 className="text-lg font-semibold">{wish.title}</h3>
              {wish.description && (
                <p className="text-gray-600">{wish.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
