import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import AddressService from "../services/address.service";

export default function useAddressBook(accessToken) {
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
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationFn: (formData) =>
      new AddressService(null, () => accessToken).createAddress(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  const {
    mutate: editAddress,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: (formData) =>
      new AddressService(null, () => accessToken).editAddress(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  const {
    mutate: deleteAddress,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: (formData) =>
      new AddressService(null, () => accessToken).deleteAddress(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
    },
  });

  return {
    addresses,
    isFetching,
    fetchingError,
    createAddress,
    editAddress,
    deleteAddress,
    createError,
    updateError,
    deleteError,
    isCreateError,
    isUpdateError,
    isDeleteError,
  };
}
