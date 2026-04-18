import { useQuery } from "@tanstack/react-query";
import AddressService from "../services/address.service";
import useAccessToken from "./useAccessToken";

export default function useDefaultAddress() {
  const accessToken = useAccessToken();

  const { data: defaultAddress = null, error: addressFetchingError } = useQuery(
    {
      queryKey: ["defaultAddress"],
      queryFn: ({ signal }) =>
        new AddressService(signal, () => accessToken).getDefaultAddress(),
      enabled: !!accessToken,
    },
  );

  return { defaultAddress, addressFetchingError };
}
