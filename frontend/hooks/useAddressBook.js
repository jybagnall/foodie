import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import AddressService from "../services/address.service";
import useAccessToken from "./useAccessToken";

export default function useAddressBook() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    data: addresses = [],
    isFetching,
    error: fetchingError,
  } = useQuery({
    queryKey: ["addressBook"],
    queryFn: ({ signal }) =>
      new AddressService(signal, () => accessToken).getAllAddresses(),
    enabled: !!accessToken,
  });

  const {
    mutate: createAddress,
    isPending: isCreating,
    isError: isCreateError,
  } = useMutation({
    mutationFn: (formData) =>
      new AddressService(null, () => accessToken).createAddress(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  const {
    mutate: updateAddress,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: ({ addressId, payload }) => {
      return new AddressService(null, () => accessToken).editAddress(
        addressId,
        payload,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  const {
    mutate: setDefaultAddress,
    isPending: isUpdatingDefaultAddress,
    isError: isDefaultUpdateError,
  } = useMutation({
    mutationFn: (addressId) => {
      return new AddressService(null, () => accessToken).setDefaultAddress(
        addressId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  const {
    mutate: deleteAddress,
    isPending: isDeleting,
    isError: isDeleteError,
  } = useMutation({
    mutationFn: (id) =>
      new AddressService(null, () => accessToken).deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  return {
    addresses,
    fetchingError,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingDefaultAddress,
    isDefaultUpdateError,
    isCreateError,
    isUpdateError,
    isDeleteError,
  };
}
