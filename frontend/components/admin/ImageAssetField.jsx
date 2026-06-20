import { useNavigate } from "react-router-dom";
import useBrandAssetsMutations from "../../hooks/useBrandAssetsMutations";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import SpinnerMini from "../user_feedback/SpinnerMini";
import BackToDash from "../UI/BackToDash";
import ErrorAlert from "../user_feedback/ErrorAlert";
import Input from "../UI/Input";
import Button from "../UI/Button";

// "logo", "error_image"
export default function ImageAssetField({ label, assetType }) {
  const { uploadImgAsset, isError, isUploading } = useBrandAssetsMutations();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // register()로 등록된 값을 지켜보고 file 변수로 저장
  const watchFiles = useWatch({ control, name: assetType });
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
    formData.append("assetType", assetType);
    formData.append("image", file);

    uploadImgAsset(formData, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onUploadSubmit)}
    >
      <Input
        label={label}
        type="file"
        id={assetType}
        accept="image/jpeg,image/png"
        register={register(assetType, {
          validate: {
            required: (files) => files?.length > 0 || "Please select a file.",
            fileType: (files) => {
              if (!files[0]) return true;

              const type = files[0].type;
              if (!["image/jpeg", "image/png"].includes(type)) {
                return "Only JPEG and PNG files are allowed.";
              }
              return true; // 유효성 검사 통과
            },
          },
        })}
        error={errors[assetType]}
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
          className="py-1 px-3 bg-gray-400 hover:bg-gray-500 text-white"
          disabled={isUploading}
        >
          {isUploading ? <SpinnerMini /> : "Upload a new image"}
        </Button>
      </div>

      {isError && (
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
