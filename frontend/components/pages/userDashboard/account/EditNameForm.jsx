import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useMyProfile from "../../../../hooks/useMyProfile";
import Input from "../../../UI/Input";
import Button from "../../../UI/Button";
import SpinnerMini from "../../../user_feedback/SpinnerMini";
import ErrorAlert from "../../../user_feedback/ErrorAlert";
import AccountService from "../../../../services/account.service";
import useAccessToken from "../../../../hooks/useAccessToken";
import { getUserErrorMessage } from "../../../../utils/getUserErrorMsg";

export default function EditNameForm() {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null); // 제출 중 컴포넌트 언마운트 대비
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const { user } = useMyProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  const onNameSubmit = async ({ name }) => {
    abortControllerRef.current = new AbortController();
    const accountService = new AccountService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    try {
      setIsUpdating(true);
      await accountService.updateUsername(name);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] }); // 재조회
      navigate("/my-account");
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/my-account");
  };

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}

        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={errorMsg}
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onNameSubmit)}
        >
          <Input
            label="Full Name"
            type="text"
            id="name"
            register={register("name", {
              required: true,
              minLength: 5,
              maxLength: 20,
            })}
            error={errors.name}
          />
          <div className="flex items-center gap-4 mt-1">
            <Button
              type="button"
              textOnly
              className="text-gray-300"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !isDirty}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isUpdating ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
