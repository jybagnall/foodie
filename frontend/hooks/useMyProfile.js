import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import AccountService from "../services/account.service";

export default function useMyProfile() {
  const { accessToken } = useContext(AuthContext);

  const {
    data: user,
    isFetching,
    error: userFetchingError,
  } = useQuery({
    queryKey: ["user", "me"],
    queryFn: ({ signal }) =>
      new AccountService(signal, () => accessToken).getMyProfile(),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5분은 fresh로 유지 (불필요한 재요청 방지)
    retry: false,
  });

  return {
    user,
    isFetching,
    userFetchingError,
  };
}
