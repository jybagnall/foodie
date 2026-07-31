import { useQuery } from "@tanstack/react-query";
import AddressService from "../../services/address.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useDefaultAddress() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const { data: defaultAddress = null, error: addressFetchingError } = useQuery(
    {
      queryKey: ["defaultAddress", userId],
      queryFn: ({ signal }) =>
        new AddressService(signal, () => accessToken).getDefaultAddress(),
      enabled: !!userId,
    },
  );

  return { defaultAddress, addressFetchingError };
}
