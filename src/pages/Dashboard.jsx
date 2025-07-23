import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Welcome, {auth.currentUser?.email}</h1>
      <button
        onClick={() => {
          signOut(auth);
          navigate("/login");
        }}
        className="bg-red-500 text-white p-2"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
