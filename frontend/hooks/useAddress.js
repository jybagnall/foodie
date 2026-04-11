import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import AddressService from "../services/address.service";

export default function useDefaultAddress() {
  const { accessToken } = useContext(AuthContext);

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
