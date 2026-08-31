import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../UI/Input";
import Button from "../UI/Button";
import BackToDash from "../UI/BackToDash";
import useMenusMutations from "../../hooks/menu/useMenusMutations";
import SpinnerMini from "../user_feedback/SpinnerMini";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { menuFieldConfigs, menuValidationRules } from "../../constants/menu";

export default function UploadNewMenu() {
  const { createMenu, isError, isUploading } = useMenusMutations();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  // register("image")로 등록된 값을 지켜보고 변수로 저장
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
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <BackToDash url="/admin" dashboardName="Back to admin dashboard" />
        </div>
        {isError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while saving a new menu"
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
            Upload a new menu
          </h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onUploadSubmit)}
          >
            {Object.entries(menuFieldConfigs).map(([key, config]) => (
              <Input
                key={key}
                id={key}
                {...config}
                register={register(key, menuValidationRules[key])}
                error={errors[key]}
              />
            ))}

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
                variant="primary"
                disabled={!file || isUploading}
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
