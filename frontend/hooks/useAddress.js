import { useQuery } from "@tanstack/react-query";
import AddressService from "../services/address.service";

export default function useDefaultAddress(accessToken) {
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
