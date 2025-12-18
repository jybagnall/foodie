import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";

export default function AdminRoute({ children }) {
  const { decodedUser, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) return <Spinner />;

  if (!decodedUser) return <Navigate to="/login" replace />; // 무슨 뜻?

  if (decodedUser.role !== "admin") {
    return <Navigate to="/" replace />; // 일반 유저는 홈으로 보냄
  }

  return children;
}
