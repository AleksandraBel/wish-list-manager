import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Завантаження...</div>;

  return user ? children : <Navigate to="/login" />;
}
