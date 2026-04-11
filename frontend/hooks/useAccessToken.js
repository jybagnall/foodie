import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

export default function useAccessToken() {
  const { accessToken } = useContext(AuthContext);
  return accessToken;
}
