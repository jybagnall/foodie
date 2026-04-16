import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../UI/Input";
import Button from "../UI/Button";
import BackToDash from "../UI/BackToDash";
import useMenuMutations from "../../hooks/useMenuMutations";
import SpinnerMini from "../user_feedback/SpinnerMini";
import ErrorAlert from "../user_feedback/ErrorAlert";

export default function UploadNewMenu() {
  const { createMenu, isError, isUploading } = useMenuMutations();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // register("image")로 등록된 값을 지켜보고 변수로 저장
  // 파일 입력은 항상 배열로 전달됨 & 배열의 첫번째 값이 이미지
  // 브라우저가 파일을 미리보기 주소로 바꿔줌 (URL.createObjectURL)
  const watchFile = useWatch({ control, name: "image" });
  const file = watchFile?.[0] ?? null;

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]); // 파일이 바뀔 때마다 브라우저에서 임시 URL 생성

  useEffect(() => {
    document.title = "Manage Menu | Foodie";
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  // previewUrl이 바뀌거나 컴포넌트가 사라질 때 임시 URL 제거

  const onUploadSubmit = async ({ name, price, description }) => {
    const formData = new FormData();

    if (file) {
      formData.append("image", file);
    }
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    createMenu(formData, {
      onSuccess: () => {
        reset(); // 모든 input 필드 값을 초기 상태로
        navigate("/admin/menu-preview", { replace: true });
      },
    });
  };

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <BackToDash
            url="/admin"
            dashboardName="Back to admin dashboard"
            title="Send invite"
          />
        </div>
        {isError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while saving a new menu"
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
            Upload a new menu
          </h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onUploadSubmit)}
          >
            <Input
              label="Menu Name"
              type="text"
              id="name"
              register={register("name", {
                required: "Menu name is required.",
                minLength: {
                  value: 2,
                  message: "Menu name must be at least 2 characters long.",
                },
                maxLength: {
                  value: 50,
                  message: "Menu name must be under 50 characters.",
                },
                validate: {
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "Menu name cannot be blank or spaces only.",
                },
              })}
              error={errors.name}
            />
            <Input
              label="Price"
              type="number"
              id="price"
              step="0.01"
              register={register("price", {
                required: "Price is required.",
                min: {
                  value: 1,
                  message: "Price must be greater than 0.",
                },
                validate: {
                  isNumber: (value) =>
                    !isNaN(value) || "Price must be a number.",
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Price can have up to 2 decimal places.",
                },
              })}
              error={errors.price}
            />
            <Input
              label="Description"
              type="text"
              id="description"
              register={register("description", {
                required: "Please enter a description.",
                minLength: {
                  value: 5,
                  message: "Description must be at least 5 characters long.",
                },
                maxLength: {
                  value: 200,
                  message: "Description cannot exceed 200 characters.",
                },
                validate: {
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "Description cannot be blank or spaces only.",
                },
              })}
              error={errors.description}
            />

            <Input
              label="Image"
              type="file"
              id="image"
              accept="image/*"
              register={register("image", {
                validate: {
                  // value: 업로드한 파일, 배열
                  fileType: (value) => {
                    if (!value[0]) return "Please select a file.";

                    const type = value[0].type;
                    if (
                      !["image/jpeg", "image/jpg", "image/png"].includes(type)
                    ) {
                      return "Only JPG, JPEG and PNG files are allowed.";
                    }
                    return true; // 유효성 검사 통과
                  },
                },
              })}
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
            <div className="mt-8">
              <Button
                type="submit"
                className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? <SpinnerMini /> : "Create a new menu"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
