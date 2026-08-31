import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import useAdminMenuMutations from "../../../hooks/menu/useAdminMenuMutations";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import Input from "../../UI/Input";
import { menuValidationRules } from "../../../constants/menu";

export default function MenuImageUploader({ menuId, onCancel }) {
  const { updateImage, isImageUpdateError, isImageUpdating } =
    useAdminMenuMutations(menuId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // register()로 등록된 값을 지켜보고 file 변수로 저장
  const watchFiles = useWatch({ control, name: "image" });
  const file = watchFiles?.[0] ?? null;

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]); // 파일이 바뀔 때마다 브라우저에서 임시 URL 생성

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  // previewUrl이 바뀌거나 컴포넌트가 사라질 때 임시 URL 제거

  const onUploadSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    updateImage(formData, {
      onSuccess: () => {
        reset();
        onCancel();
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onUploadSubmit)}
    >
      <Input
        label="Choose a new menu image"
        type="file"
        id="image"
        accept="image/jpeg,image/png"
        register={register("image", menuValidationRules.image)}
        error={errors.image}
      />

      {previewUrl && (
        <div className="mt-8 flex justify-center">
          <img
            src={previewUrl}
            alt="preview"
            className="w-48 h-48 object-cover rounded-lg shadow-md border border-gray-300"
          />
        </div>
      )}

      <div className="">
        <Button
          type="submit"
          variant="primary"
          disabled={!file || isImageUpdating}
        >
          {isImageUpdating ? <SpinnerMini /> : "Upload Image"}
        </Button>
      </div>

      {isImageUpdateError && (
        <div className="mb-4">
          <ErrorAlert
            title="There was a problem with your request"
            message="Something went wrong while saving a new image"
          />
        </div>
      )}
    </form>
  );
}
