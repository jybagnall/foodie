import { useQuery } from "@tanstack/react-query";
import AdminService from "../services/admin.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useAdmins() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: admins = [],
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: ({ signal }) =>
      new AdminService(signal, () => accessToken).getAdmins(),
    enabled: !!userId,
  });

  return { admins, isError, isFetching };
}
