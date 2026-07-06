import { useQuery } from "@tanstack/react-query";
import AdminService from "../services/admin.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useAdminList() {
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
