import { useQuery } from "@tanstack/react-query";
import AccountService from "../services/account.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useMyProfile() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: user,
    isFetching,
    error: userFetchingError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: ({ signal }) =>
      new AccountService(signal, () => accessToken).getMyProfile(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분은 fresh로 유지 (불필요한 재요청 방지)
    retry: false,
  });

  return {
    user,
    isFetching,
    userFetchingError,
  };
}
