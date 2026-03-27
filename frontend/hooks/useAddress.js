import { useQuery } from "@tanstack/react-query";
import AddressService from "../services/address.service";

export default function useAddress(accessToken) {
  const { data: defaultAddress = {}, error: addressFetchingError } = useQuery({
    queryKey: ["defaultAddress"],
    queryFn: ({ signal }) =>
      new AddressService(signal, () => accessToken).getDefaultAddress(),
    enabled: !!accessToken,
  });

  return { defaultAddress, addressFetchingError };
}
