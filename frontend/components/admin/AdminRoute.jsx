import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { decodedUser, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) return <div>Loading...</div>;

  if (!decodedUser) return <Navigate to="/login" />; // 무슨 뜻?

  if (decodedUser.role !== "admin") {
    return <Navigate to="/" />; // 일반 유저는 홈으로 보냄
  }

  return children;
}
