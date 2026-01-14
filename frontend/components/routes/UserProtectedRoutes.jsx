import { useContext } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";

export default function UserProtectedRoutes({ children }) {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const location = useLocation();

  // 아직 토큰 확인 중이면 로딩 표시
  if (isAuthLoading) return <Spinner />;

  // accessToken이 없으면 로그인 페이지로 이동
  // 리디렉션 시 “어느 페이지에서 왔는지”를 자동으로 저장
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // accessToken이 있으면 해당 페이지 보여줌
  return children;
}
