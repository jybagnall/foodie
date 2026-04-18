import { useQueryClient, useMutation } from "@tanstack/react-query";
import useAccessToken from "./useAccessToken";
import AccountService from "../services/account.service";

export default function useMyProfileMutations() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: updateName,
    isPending: isUpdatingName,
    isError: isUpdateNameError,
  } = useMutation({
    mutationFn: (name) => {
      return new AccountService(null, () => accessToken).updateUsername(name);
    },
  });

  const {
    mutate: updatePassword,
    isPending: isUpdatingPassword,
    error: updatePasswordError,
  } = useMutation({
    mutationFn: ({ currentPassword, password }) => {
      return new AccountService(null, () => accessToken).updatePassword(
        currentPassword,
        password,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });

  return {
    updateName,
    isUpdatingName,
    isUpdateNameError,
    updatePassword,
    isUpdatingPassword,
    updatePasswordError,
  };
}
