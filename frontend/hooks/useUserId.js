import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

export default function useUserId() {
  const { decodedUser } = useContext(AuthContext);
  return decodedUser?.id ?? null;
}
