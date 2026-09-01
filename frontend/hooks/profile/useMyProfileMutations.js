import { useQueryClient, useMutation } from "@tanstack/react-query";
import AccountService from "../../services/account.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useMyProfileMutations() {
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();

  const {
    mutate: updateName,
    isPending: isUpdatingName,
    isError: isUpdateNameError,
  } = useMutation({
    mutationFn: (name) => {
      return new AccountService(null, () => accessToken).updateUsername(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
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
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  const {
    mutate: deleteAccount,
    isPending: isDeletingAccount,
    error: deleteAccountError,
  } = useMutation({
    mutationFn: ({ currentPassword }) => {
      return new AccountService(null, () => accessToken).deleteAccount(
        currentPassword,
      );
    },
  });

  return {
    updateName,
    isUpdatingName,
    isUpdateNameError,
    updatePassword,
    isUpdatingPassword,
    updatePasswordError,
    deleteAccount,
    isDeletingAccount,
    deleteAccountError,
  };
}
