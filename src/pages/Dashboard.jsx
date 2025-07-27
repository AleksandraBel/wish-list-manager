import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const Dashboard = () => {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Привіт, {user.displayName || user.email}!
      </h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Вийти
      </button>
    </div>
  );
};

export default Dashboard;
