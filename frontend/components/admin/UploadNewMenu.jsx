import { useForm } from "react-hook-form";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MenuService from "../../services/menu.service";
import Spinner from "../user_feedback/Spinner";
import AuthContext from "../../contexts/AuthContext";
import Input from "../UI/Input";
import Button from "../UI/Button";

export default function UploadNewMenu() {
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  // register("image")로 등록된 값을 지켜보고 변수로 저장
  // 파일 입력은 항상 배열로 전달됨 & 배열의 첫번째 값이 이미지
  const watchFile = watch("image");

  // 브라우저가 파일을 미리보기 주소로 바꿔줌 (URL.createObjectURL)
  useEffect(() => {
    if (watchFile && watchFile[0]) {
      const file = watchFile[0];
      const imageURL = URL.createObjectURL(file);
      setPreviewUrl(imageURL);

      return () => URL.revokeObjectURL(imageURL);
    }
  }, [watchFile]);

  const onUploadSubmit = async ({ name, price, description }) => {
    const menuService = new MenuService(new AbortController(), authContext);

    const formData = new FormData();

    if (watchFile && watchFile[0]) {
      formData.append("image", watchFile[0]);
    }
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);

    setIsUploadProcessing(true);
    try {
      await menuService.createMenu(formData);
      navigate("/admin/dashboard", { replace: true }); // ?
    } catch (err) {
      console.error(err);
      const returnedErrorMsg =
        err.response?.data?.error || "Unexpected upload error";
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsUploadProcessing(false);
      reset(); // 모든 input 필드 값을 초기 상태로
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    document.title = "Upload new menu | Foodie";
  }, []);

  if (isUploadProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={errorMsg}
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
            Create account
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
                propStyle="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
              >
                Create new Menu
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
